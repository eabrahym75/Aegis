"""
Masked Adversarial Protection Script

Applies adversarial noise only to body and clothing regions,
leaving face and background clean for improved visual quality.
"""

import torch
import torchvision
import numpy as np
import cv2
from PIL import Image, ImageOps
from pathlib import Path
import torch.nn as nn
import torch.optim as optim

from torchvision import transforms
from art.estimators.classification import PyTorchClassifier
from art.attacks.evasion import FastGradientMethod


def load_segmentation_model():
    """
    Load auto-scaling MobileNetV3 model for fast semantic segmentation.
    
    Returns:
        model: Pre-trained LR-ASPP MobileNetV3 Large model
    """
    # Use LR-ASPP MobileNetV3 - highly optimized for CPU/Mobile
    model = torchvision.models.segmentation.lraspp_mobilenet_v3_large(
        weights=torchvision.models.segmentation.LRASPP_MobileNet_V3_Large_Weights.DEFAULT
    )
    model.eval()
    return model


def detect_face_region(image_np):
    """
    Detect face region using OpenCV Haar Cascade.
    
    Args:
        image_np: Image as numpy array (HWC format, 0-255)
        
    Returns:
        face_mask: Binary mask where 1 = face region
    """
    # Convert to grayscale for face detection
    if len(image_np.shape) == 3 and image_np.shape[2] == 3:
        gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
    else:
        gray = image_np
        
    # Scale down for faster detection if image is huge
    max_dim = 1024
    h, w = gray.shape
    scale = 1.0
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        new_w = int(w * scale)
        new_h = int(h * scale)
        gray = cv2.resize(gray, (new_w, new_h))
    
    # Load Haar Cascade classifier
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )
    
    # Detect faces
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    
    # Create face mask at original scale
    face_mask = np.zeros((h, w), dtype=np.uint8)
    
    for (x, y, w_face, h_face) in faces:
        # Scale coordinates back up
        if scale != 1.0:
            x = int(x / scale)
            y = int(y / scale)
            w_face = int(w_face / scale)
            h_face = int(h_face / scale)
            
        # Expand face region slightly
        expansion = int(0.3 * max(w_face, h_face))
        x1 = max(0, x - expansion)
        y1 = max(0, y - expansion)
        x2 = min(w, x + w_face + expansion)
        y2 = min(h, y + h_face + expansion)
        
        face_mask[y1:y2, x1:x2] = 1
    
    return face_mask


def get_body_clothing_mask(image_path):
    """
    Generate mask for body and clothing regions, optimized for speed.
    
    Args:
        image_path: Path to input image
        
    Returns:
        mask: Binary mask (0-1) where 1 = body/clothing (excluding face)
        image_np: Original image as numpy array
    """
    # Load image and handle EXIF orientation
    image = Image.open(image_path)
    image = ImageOps.exif_transpose(image)
    image = image.convert('RGB')
    image_np = np.array(image)
    
    # --- Optimization: Resize for Segmentation ---
    # Running segmentation on 12MP image is overkill. 512px is sufficient for masks.
    original_size = image.size # (W, H)
    target_size = 512
    
    scale_factor = target_size / max(original_size)
    if scale_factor < 1.0:
        new_w = int(original_size[0] * scale_factor)
        new_h = int(original_size[1] * scale_factor)
        image_small = image.resize((new_w, new_h), Image.BILINEAR)
    else:
        image_small = image
        
    # Prepare image for segmentation
    preprocess = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    
    input_tensor = preprocess(image_small)
    input_batch = input_tensor.unsqueeze(0)
    
    # Run segmentation
    model = load_segmentation_model()
    
    with torch.no_grad():
        output = model(input_batch)['out'][0]
    
    output_predictions = output.argmax(0).byte().cpu().numpy()
    
    # DeepLabV3/LRASPP class 15 = person
    person_mask_small = (output_predictions == 15).astype(np.uint8)
    
    # Resize mask back to original resolution
    person_mask = cv2.resize(person_mask_small, (original_size[0], original_size[1]), 
                             interpolation=cv2.INTER_NEAREST)
    
    # Detect face region (using optimized detector)
    face_mask = detect_face_region(image_np)
    
    # Body/clothing mask = person mask - face mask
    body_clothing_mask = person_mask * (1 - face_mask)
    
    # Apply morphological operations to smooth the mask (faster kernel)
    # Using smaller iteration count or simpler kernel for speed
    kernel = np.ones((5, 5), np.uint8)
    body_clothing_mask = cv2.morphologyEx(body_clothing_mask, cv2.MORPH_CLOSE, kernel)
    
    # Only blur if mask is not empty
    if body_clothing_mask.any():
        # Fast blur
        body_clothing_mask = cv2.blur(body_clothing_mask, (15, 15))
    
    return body_clothing_mask, image_np


def generate_adversarial_noise(image_np, epsilon=0.05):
    """
    Generate adversarial noise using FGSM attack. Optimized.
    
    Args:
        image_np: Image as numpy array (HWC, 0-255)
        epsilon: Perturbation magnitude
        
    Returns:
        adversarial_image: Image with adversarial noise (HWC, 0-255)
    """
    # Normalize to [0, 1] and convert to CHW format
    image_normalized = image_np.astype(np.float32) / 255.0
    image_chw = np.transpose(image_normalized, (2, 0, 1))
    image_batch = np.expand_dims(image_chw, axis=0)
    
    # --- Optimization: Lightweight Dummy Model ---
    # Old model used a dense Linear layer (InputSize -> 2), which is massive (millions of params)
    # New model uses Global Average Pooling -> Small Linear (2048 -> 2)
    # This is orders of magnitude faster and memory efficient
    class LightweightDummyModel(nn.Module):
        def __init__(self):
            super().__init__()
            # 1x1 Convolution to reduce channels or just mix features
            # Or just AdaptiveAvgPool to 1x1 spatial
            self.pool = nn.AdaptiveAvgPool2d((1, 1))
            self.fc = nn.Linear(3, 2) # 3 Input channels -> 2 Classes
        
        def forward(self, x):
            x = self.pool(x)
            x = x.view(x.size(0), -1)
            return self.fc(x)
    
    model = LightweightDummyModel()
    loss_fn = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    classifier = PyTorchClassifier(
        model=model,
        loss=loss_fn,
        optimizer=optimizer,
        input_shape=image_batch.shape[1:],
        nb_classes=2,
    )
    
    # Generate adversarial example
    attack = FastGradientMethod(estimator=classifier, eps=epsilon)
    labels = np.array([0])
    adv_image_batch = attack.generate(x=image_batch, y=labels)
    
    # Convert back to HWC format (0-255)
    adv_image = adv_image_batch[0]
    adv_image = np.clip(adv_image, 0, 1)
    adv_image = np.transpose(adv_image, (1, 2, 0))
    adv_image = (adv_image * 255).astype(np.uint8)
    
    return adv_image


def apply_masked_protection(input_path, output_path, epsilon=0.05):
    """
    Apply adversarial protection only to body/clothing regions.
    
    Args:
        input_path: Path to input image
        output_path: Path to save protected image
        epsilon: Perturbation magnitude for FGSM
    """
    import time
    start_total = time.time()
    
    print("=" * 60)
    print("MASKED ADVERSARIAL PROTECTION")
    print("=" * 60)
    
    # Step 1: Get body/clothing mask
    print("\n[1/4] Generating body/clothing segmentation mask...")
    t0 = time.time()
    mask, original_image = get_body_clothing_mask(input_path)
    t1 = time.time()
    print(f"   ✓ Mask generated (coverage: {mask.sum() / mask.size * 100:.1f}%)")
    print(f"   ⏱️ Time: {t1 - t0:.2f}s")
    
    # Step 2: Generate adversarial noise
    print("\n[2/4] Generating adversarial noise (FGSM)...")
    t0 = time.time()
    adversarial_image = generate_adversarial_noise(original_image, epsilon=epsilon)
    t1 = time.time()
    print(f"   ✓ Adversarial noise generated (epsilon={epsilon})")
    print(f"   ⏱️ Time: {t1 - t0:.2f}s")
    
    # Step 3: Apply mask
    print("\n[3/4] Applying mask to blend images...")
    t0 = time.time()
    mask_3d = np.expand_dims(mask, axis=2)
    protected_image = (
        original_image.astype(np.float32) * (1 - mask_3d) +
        adversarial_image.astype(np.float32) * mask_3d
    ).astype(np.uint8)
    t1 = time.time()
    print("   ✓ Masked protection applied")
    print(f"   ⏱️ Time: {t1 - t0:.2f}s")
    
    # Step 4: Save result
    print("\n[4/4] Saving protected image...")
    t0 = time.time()
    output = Image.fromarray(protected_image)
    output.save(output_path)
    t1 = time.time()
    print(f"   ✓ Saved to: {output_path}")
    print(f"   ⏱️ Time: {t1 - t0:.2f}s")
    
    end_total = time.time()
    print("\n" + "=" * 60)
    print("PROTECTION COMPLETE")
    print("=" * 60)
    print(f"\nProtected regions: Body & Clothing")
    print(f"Clean regions: Face & Background")
    print(f"Total processing time: {end_total - start_total:.2f}s")
    
    return protected_image


def main():
    """Main entry point for masked protection script."""
    script_dir = Path(__file__).parent
    input_path = script_dir / "input.jpg"
    output_path = script_dir / "output_masked.jpg"
    
    if not input_path.exists():
        print(f"ERROR: Input file '{input_path}' not found.")
        return
    
    apply_masked_protection(
        input_path=input_path,
        output_path=output_path,
        epsilon=0.05
    )


if __name__ == "__main__":
    main()
