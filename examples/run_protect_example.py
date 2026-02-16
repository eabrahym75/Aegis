"""Example script showing how to call backend/aegis_shield.process_image

Creates a small sample image and mask, runs protection with and without mask,
and prints output file paths.
"""
import sys
import os
from pathlib import Path
from PIL import Image

# Ensure project root is on sys.path so `backend` package can be imported when running this script
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.aegis_shield import process_image


def make_image(path, color=(240, 200, 170, 255), size=(128, 128)):
    img = Image.new("RGBA", size, color)
    img.save(path)


def make_mask(path, size=(128, 128)):
    img = Image.new("L", size, 0)
    w, h = size
    cx, cy = w // 2, h // 2
    for x in range(w):
        for y in range(h):
            if (x - cx) ** 2 + (y - cy) ** 2 < (min(w, h) // 3) ** 2:
                img.putpixel((x, y), 255)
    img.save(path)


def main():
    out_dir = Path("examples/out")
    out_dir.mkdir(parents=True, exist_ok=True)

    inp = out_dir / "sample_input.png"
    mask = out_dir / "sample_mask.png"
    out1 = out_dir / "protected_nomask.png"
    out2 = out_dir / "protected_withmask.png"

    make_image(inp)
    make_mask(mask)

    print("Running protection without explicit mask (uses alpha/skin-detect)...")
    ok1 = process_image(str(inp), str(out1), "ExampleUser", "ultra", use_fgsm=False, use_c2pa=False)
    print("Saved:", out1, "ok=", ok1)

    print("Running protection with explicit mask (mask.png)...")
    ok2 = process_image(str(inp), str(out2), "ExampleUser", "ultra", use_fgsm=False, use_c2pa=False, mask_path=str(mask))
    print("Saved:", out2, "ok=", ok2)


if __name__ == "__main__":
    main()
