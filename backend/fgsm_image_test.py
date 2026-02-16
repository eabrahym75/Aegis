import torch
import numpy as np
from PIL import Image

from art.estimators.classification import PyTorchClassifier
from art.attacks.evasion import FastGradientMethod
import torch.nn as nn
import torch.optim as optim


# --- 1. Load image ---
image = Image.open('input.jpg').convert('RGB')
image_np = np.array(image).astype(np.float32) / 255.0  # Normalize to [0, 1]
image_np = np.transpose(image_np, (2, 0, 1))  # Change to CHW format
image_np = np.expand_dims(image_np, axis=0)  # Add batch dimension


# --- 2. Dummy model (minimaL, valid classifier) ---
class DummyModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.flatten = nn.Flatten()
        self.fc = nn.Linear(3 * image.size[0] * image.size [1], 2)

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


# --- 3. Apply FGSM attack ---
attack = FastGradientMethod(estimator=classifier, eps=0.04
                            )

labels = np.array([0])
adv_image = attack.generate(x=image_np, y=labels)


# --- 4. Save output image ---
adv_image = adv_image[0]
adv_image = np.clip(adv_image, 0, 1)
adv_image = np.transpose(adv_image, (1, 2, 0))  # CHW to HWC
adv_image = (adv_image * 255).astype(np.uint8)

output = Image.fromarray(adv_image)
# Increase the quality of the saved image to reduce blurriness
output.save('output_fgsm.jpg', quality=85, optimize=True)

adv_image = np.ascontiguousarray(adv_image)

print('FGSM image saved successfully as output_fgsm.jpg.')
