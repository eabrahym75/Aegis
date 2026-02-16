import sys
import os
import argparse
import random
import uuid
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

# Optional heavy dependencies for advanced features
FGSM_AVAILABLE = False
C2PA_AVAILABLE = False

try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from art.estimators.classification import PyTorchClassifier
    from art.attacks.evasion import FastGradientMethod
    FGSM_AVAILABLE = True
except ImportError:
    pass

try:
    import c2pa
    C2PA_AVAILABLE = True
except ImportError:
    pass

def generate_aegis_id():
    """Generate a unique ID for the image."""
    return str(uuid.uuid4())

def str_to_bin(message):
    """Convert string to binary."""
    binary = ''.join(format(ord(i), '08b') for i in message)
    return binary

def bin_to_str(binary):
    """Convert binary to string."""
    message = ""
    for i in range(0, len(binary), 8):
        byte = binary[i:i+8]
        message += chr(int(byte, 2))
    return message

def lsb_encode(img, data):
    """Encode data into image using LSB."""
    # Append terminator
    data += "#####" 
    binary_data = str_to_bin(data)
    data_len = len(binary_data)
    
    pixels = img.load()
    width, height = img.size
    
    idx = 0
    for y in range(height):
        for x in range(width):
            if idx < data_len:
                r, g, b, a = pixels[x, y]
                
                # Modify LSB of Red channel
                bit = int(binary_data[idx])
                r = (r & ~1) | bit
                
                pixels[x, y] = (r, g, b, a)
                idx += 1
            else:
                return img
    return img

def lsb_decode(img):
    """Decode data from image using LSB."""
    # Ensure image is in RGBA to avoid unpacking errors
    img = img.convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    binary_data = ""
    for y in range(height):
        for x in range(width):
            pixel = pixels[x, y]
            r = pixel[0]
            binary_data += str(r & 1)
            
    # Convert to string and look for terminator
    # This is inefficient for large images but works for prototype
    # Better: check every 8 bits (byte) as we go
    
    # Optimization: Convert chunks
    message = ""
    for i in range(0, len(binary_data), 8):
        byte = binary_data[i:i+8]
        char = chr(int(byte, 2))
        message += char
        if message.endswith("#####"):
            return message[:-5]
            
    return "" # Not found

def apply_fgsm_protection(img, eps=0.05):
    """
    Apply FGSM adversarial perturbation to the image to make it resistant
    to AI model manipulation. Based on zainab branch research.
    
    Args:
        img: PIL Image in RGB mode
        eps: Perturbation strength (default 0.05)
    
    Returns:
        PIL Image with adversarial perturbation applied
    """
    if not FGSM_AVAILABLE:
        print("Warning: FGSM dependencies not available. Skipping adversarial protection.")
        return img
    
    # Convert PIL image to numpy array
    image_np = np.array(img).astype(np.float32) / 255.0  # Normalize to [0, 1]
    image_np = np.transpose(image_np, (2, 0, 1))  # Change to CHW format
    image_np = np.expand_dims(image_np, axis=0)  # Add batch dimension
    
    # Create a minimal classifier for FGSM
    width, height = img.size
    
    class DummyModel(nn.Module):
        def __init__(self):
            super().__init__()
            self.flatten = nn.Flatten()
            self.fc = nn.Linear(3 * width * height, 2)
        
        def forward(self, x):
            return self.fc(self.flatten(x))
    
    model = DummyModel()
    loss_fn = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    classifier = PyTorchClassifier(
        model=model,
        loss=loss_fn,
        optimizer=optimizer,
        input_shape=image_np.shape[1:],
        nb_classes=2,
    )
    
    # Apply FGSM attack
    attack = FastGradientMethod(estimator=classifier, eps=eps)
    labels = np.array([0])
    adv_image = attack.generate(x=image_np, y=labels)
    
    # Convert back to PIL
    adv_image = adv_image[0]
    adv_image = np.clip(adv_image, 0, 1)
    adv_image = np.transpose(adv_image, (1, 2, 0))  # CHW to HWC
    adv_image = (adv_image * 255).astype(np.uint8)
    
    print("Applied FGSM adversarial protection.")
    return Image.fromarray(adv_image)

def apply_c2pa_signature(input_path, output_path, creator="Aegis User"):
    """
    Apply C2PA digital signature to the image.
    Loads manifest from external c2pa_manifest.json file.
    
    Args:
        input_path: Path to input image
        output_path: Path for output signed image
        creator: Creator name for manifest
    
    Returns:
        True if successful, False otherwise
    """
    if not C2PA_AVAILABLE:
        print("Warning: C2PA library not available. Skipping digital signature.")
        return False
    
    try:
        import json
        
        script_dir = Path(__file__).parent
        cert_dir = script_dir.parent / "certs"
        cert_path = cert_dir / "test.crt"
        key_path = cert_dir / "test.key"
        manifest_path = script_dir / "c2pa_manifest.json"
        
        # Check if certs exist
        if not cert_path.exists() or not key_path.exists():
            print("Warning: C2PA certificates not found. Skipping digital signature.")
            return False
        
        # Load manifest from external JSON file
        if manifest_path.exists():
            with open(manifest_path, "r") as f:
                manifest_definition = json.load(f)
            # Inject dynamic values
            manifest_definition["title"] = Path(input_path).name
            # Update owner in protection assertion
            for assertion in manifest_definition.get("assertions", []):
                if assertion.get("label") == "org.project-aegis.protection":
                    assertion["data"]["owner"] = creator
        else:
            # Fallback to inline manifest if file doesn't exist
            manifest_definition = {
                "claim_generator": "Aegis_Shield_v1.0",
                "title": Path(input_path).name,
                "assertions": [
                    {
                        "label": "c2pa.actions",
                        "data": {
                            "actions": [
                                {
                                    "action": "c2pa.protected",
                                    "softwareAgent": "Aegis_Shield_v1.0"
                                }
                            ]
                        }
                    }
                ]
            }
        
        with open(cert_path, "rb") as f:
            cert_data = f.read()
        with open(key_path, "rb") as f:
            key_data = f.read()
        
        with c2pa.Signer(
            cert_chain=cert_data,
            private_key=key_data,
            alg="ps256",
            tsa_url="http://timestamp.digicert.com"
        ) as signer:
            with c2pa.Builder(manifest_definition) as builder:
                builder.sign_file(
                    source_path=str(input_path),
                    dest_path=str(output_path),
                    signer=signer
                )
        
        print(f"Applied C2PA digital signature to {output_path}")
        return True
        
    except Exception as e:
        print(f"C2PA signing failed: {e}")
        return False

def process_image(input_path, output_path, creator, level, use_fgsm=False, use_c2pa=False, mask_path=None, force_skin_detect=False):
    try:
        # Load the image
        img = Image.open(input_path).convert("RGBA")
        width, height = img.size
        
        # Apply Protection Level Logic
        if level == "ultra":
            # Structured Adversarial Perturbation (SAP)
            # 1) Apply high-frequency, low-opacity checkerboard (alpha=0.02) inside a region mask
            # 2) Convert to YCbCr and apply subtle jitter to Cb and Cr channels
            # 3) Optionally run a CLIP-based step to (softly) maximize embedding distance if available

            # Load or generate region mask: prefer explicit mask file, otherwise try alpha, otherwise fall back to skin detection
            mask = None
            try:
                if mask_path and os.path.exists(mask_path) and not force_skin_detect:
                    mask = Image.open(mask_path).convert("L").resize((width, height))
                else:
                    if img.mode == "RGBA" and not force_skin_detect:
                        alpha = img.split()[-1]
                        # Treat semi-transparent regions as mask
                        mask = alpha.point(lambda p: 255 if p < 255 else 0)
            except Exception:
                mask = None

            # If no mask from alpha or file, perform simple YCbCr-based skin detection
            if mask is None or force_skin_detect:
                try:
                    rgb_tmp = img.convert("RGB")
                    arr = np.array(rgb_tmp).astype(np.int16)
                    r = arr[:, :, 0]
                    g = arr[:, :, 1]
                    b = arr[:, :, 2]
                    cb = ((-0.168736 * r - 0.331264 * g + 0.5 * b) + 128)
                    cr = ((0.5 * r - 0.418688 * g - 0.081312 * b) + 128)
                    skin_mask = ((cb >= 77) & (cb <= 127) & (cr >= 133) & (cr <= 173)).astype(np.uint8) * 255
                    mask = Image.fromarray(skin_mask.astype(np.uint8), mode="L")
                except Exception:
                    mask = Image.new("L", (width, height), 255)

            # Create high-frequency checkerboard: 4x4 pixel squares (adjustable)
            square = 4
            checker = Image.new("RGBA", (width, height), (0, 0, 0, 0))
            ch_pixels = checker.load()
            for x in range(width):
                for y in range(height):
                    if ((x // square) % 2) == ((y // square) % 2):
                        # Gray value mid-tone; alpha set to achieve ~0.02 opacity after blending
                        # PIL alpha is 0-255, so 0.02 * 255 ~= 5
                        ch_pixels[x, y] = (128, 128, 128, 5)

            # Composite checkerboard only where mask is non-zero
            # Create masked checker: apply mask as alpha mask
            masked_checker = Image.new("RGBA", (width, height), (0, 0, 0, 0))
            masked_checker.paste(checker, (0, 0), mask)

            img = Image.alpha_composite(img, masked_checker)

            # Convert to YCbCr and apply subtle jitter to Cb/Cr channels
            try:
                # Work on a copy converted to RGB
                rgb = img.convert("RGB")
                np_img = np.array(rgb).astype(np.int16)
                # Convert RGB->YCbCr using standard conversion
                # Using integer arithmetic for simplicity
                r = np_img[:, :, 0]
                g = np_img[:, :, 1]
                b = np_img[:, :, 2]
                y = (0.299 * r + 0.587 * g + 0.114 * b).astype(np.float32)
                cb = ((-0.168736 * r - 0.331264 * g + 0.5 * b) + 128).astype(np.float32)
                cr = ((0.5 * r - 0.418688 * g - 0.081312 * b) + 128).astype(np.float32)

                # Jitter magnitude: small, e.g., +/-1.5 on Cb/Cr (subtle)
                jitter_strength = 1.5
                # Only apply jitter inside mask region
                mask_np = np.array(mask.resize((width, height))).astype(np.float32) / 255.0
                # Generate random jitter maps with seed for reproducibility
                rng = np.random.RandomState(seed=42)
                jitter_cb = (rng.randn(height, width).astype(np.float32) * jitter_strength) * mask_np
                jitter_cr = (rng.randn(height, width).astype(np.float32) * jitter_strength) * mask_np

                cb = cb + jitter_cb
                cr = cr + jitter_cr

                # Clip channels back to valid range
                cb = np.clip(cb, 0, 255)
                cr = np.clip(cr, 0, 255)

                # Convert YCbCr back to RGB
                r2 = (y + 1.402 * (cr - 128)).clip(0, 255).astype(np.uint8)
                g2 = (y - 0.344136 * (cb - 128) - 0.714136 * (cr - 128)).clip(0, 255).astype(np.uint8)
                b2 = (y + 1.772 * (cb - 128)).clip(0, 255).astype(np.uint8)

                rgb_jitter = np.stack([r2, g2, b2], axis=2)
                img = Image.fromarray(rgb_jitter, "RGB").convert("RGBA")
            except Exception as e:
                print(f"YCbCr jitter failed: {e}")

            # Optional: CLIP-based semantic distance maximization (soft step)
            # If CLIP is available, perform a small iterative hill-climb to increase distance
            try:
                import clip
                import torch

                device = "cuda" if torch.cuda.is_available() else "cpu"
                model, preprocess = clip.load("ViT-B/32", device=device)

                # Prepare target text embedding for skin-like colors (approximation)
                texts = ["human skin", "human face", "skin tone"]
                with torch.no_grad():
                    text_tokens = clip.tokenize(texts).to(device)
                    text_emb = model.encode_text(text_tokens).mean(dim=0, keepdim=True)
                    text_emb = text_emb / text_emb.norm(dim=-1, keepdim=True)

                # Image tensor
                pil_in = img.convert("RGB")
                image_input = preprocess(pil_in).unsqueeze(0).to(device)

                # Compute original embedding
                with torch.no_grad():
                    img_emb = model.encode_image(image_input)
                    img_emb = img_emb / img_emb.norm(dim=-1, keepdim=True)

                # Current distance (cosine)
                orig_dist = (img_emb @ text_emb.t()).item()

                # Small number of attempts to perturb (non-destructive): generate candidate jittered images
                best_img = img
                best_score = orig_dist
                for attempt in range(3):
                    # Create candidate by reusing existing YCbCr jitter but with different seed
                    rng2 = np.random.RandomState(seed=attempt + 100)
                    jitter_cb2 = (rng2.randn(height, width).astype(np.float32) * (jitter_strength * 1.2)) * mask_np
                    jitter_cr2 = (rng2.randn(height, width).astype(np.float32) * (jitter_strength * 1.2)) * mask_np

                    cb_c = cb + jitter_cb2
                    cr_c = cr + jitter_cr2
                    r_c = (y + 1.402 * (cr_c - 128)).clip(0, 255).astype(np.uint8)
                    g_c = (y - 0.344136 * (cb_c - 128) - 0.714136 * (cr_c - 128)).clip(0, 255).astype(np.uint8)
                    b_c = (y + 1.772 * (cb_c - 128)).clip(0, 255).astype(np.uint8)

                    cand = Image.fromarray(np.stack([r_c, g_c, b_c], axis=2), "RGB")
                    cand_input = preprocess(cand).unsqueeze(0).to(device)
                    with torch.no_grad():
                        cand_emb = model.encode_image(cand_input)
                        cand_emb = cand_emb / cand_emb.norm(dim=-1, keepdim=True)
                        score = (cand_emb @ text_emb.t()).item()

                    # We want to maximize distance from skin text, so prefer lower cosine similarity
                    if score < best_score:
                        best_score = score
                        best_img = cand.convert("RGBA")

                img = best_img
            except Exception:
                # CLIP not available or failed — skip silently
                pass
        
        # Apply FGSM adversarial protection if requested
        if use_fgsm:
            rgb_img = img.convert("RGB")
            rgb_img = apply_fgsm_protection(rgb_img)
            # Convert back to RGBA
            img = rgb_img.convert("RGBA")
            
        # Visible watermark logic removed as per user request
        
        # Stealth level adds metadata but no visible changes
        # Ghost Layer: Add LSB Steganography
        if level in ["stealth", "ultra"]:
            aegis_id = generate_aegis_id()
            print(f"Embedding Aegis-ID: {aegis_id}")
            img = lsb_encode(img, aegis_id)
        
        # Prepare Metadata (EXIF)
        exif_data = img.getexif()
        # 0x8298 is Copyright, 0x013b is Artist, 0x010e is ImageDescription
        if creator:
            exif_data[0x8298] = f"Copyright (c) {creator}"
            exif_data[0x013b] = creator
        exif_data[0x010e] = f"Protected by Aegis - Level: {level}"
        
        # Save the image
        # Standard: JPEG (Lossy but standard)
        # Stealth/Ultra with Ghost Layer: PNG (Lossless to preserve LSB)
        
        if level in ["stealth", "ultra"]:
            # Force PNG for LSB persistence
            if not output_path.lower().endswith(".png"):
                output_path = os.path.splitext(output_path)[0] + ".png"
            
            # OPTIMIZATION: Use optimize=True and higher compression level
            img.save(output_path, "PNG", exif=exif_data, optimize=True, compress_level=9)
        else:
            final_img = img.convert("RGB")
            final_img.save(output_path, "JPEG", quality=95, exif=exif_data)
        
        print(f"Successfully processed {input_path} at level {level} -> {output_path}")
        return True
        
    except Exception as e:
        print(f"Error processing image: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AEGIS Shield Image Protection Engine")
    parser.add_argument("input", help="Path to input image")
    parser.add_argument("--output", help="Path to output image")
    parser.add_argument("--creator", help="Creator name", default="Aegis User")
    parser.add_argument("--level", choices=["standard", "stealth", "ultra"], default="standard")
    parser.add_argument("--decode", action="store_true", help="Extract Aegis-ID from image")
    parser.add_argument("--fgsm", action="store_true", help="Apply FGSM adversarial protection")
    parser.add_argument("--c2pa", action="store_true", help="Apply C2PA digital signature")
    parser.add_argument("--mask", help="Path to mask image (white=apply, black=ignore)")
    parser.add_argument("--force-skin-detect", action="store_true", help="Force YCbCr-based skin detection for mask (ignores alpha/mask file)")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.input):
        print(f"File not found: {args.input}", file=sys.stderr)
        sys.exit(1)
        
    if args.decode:
        try:
            with Image.open(args.input) as img:
                aegis_id = lsb_decode(img)
                if aegis_id:
                    print(f"Extracted Aegis-ID: {aegis_id}")
                    sys.exit(0)
                else:
                    print("No Aegis-ID found in this image.")
                    sys.exit(1)
        except Exception as e:
            print(f"Error decoding: {e}", file=sys.stderr)
            sys.exit(1)

    if not args.output:
        print("Error: --output is required for processing.", file=sys.stderr)
        sys.exit(1)
        
    success = process_image(args.input, args.output, args.creator, args.level, 
                            use_fgsm=args.fgsm, use_c2pa=args.c2pa, mask_path=args.mask,
                            force_skin_detect=args.force_skin_detect)
    
    # Apply C2PA signature after image is saved (requires file-based operation)
    if success and args.c2pa:
        c2pa_output = os.path.splitext(args.output)[0] + "_signed" + os.path.splitext(args.output)[1]
        c2pa_success = apply_c2pa_signature(args.output, c2pa_output, args.creator)
        if c2pa_success:
            # Replace original with signed version
            os.replace(c2pa_output, args.output)
    
    sys.exit(0 if success else 1)
