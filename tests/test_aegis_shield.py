import os
from PIL import Image
from backend.aegis_shield import process_image


def make_image(path, color=(240, 200, 170, 255), size=(64, 64)):
    img = Image.new("RGBA", size, color)
    img.save(path)


def make_mask(path, size=(64, 64)):
    # mask: center circle white, else black
    img = Image.new("L", size, 0)
    w, h = size
    cx, cy = w // 2, h // 2
    for x in range(w):
        for y in range(h):
            if (x - cx) ** 2 + (y - cy) ** 2 < (min(w, h) // 4) ** 2:
                img.putpixel((x, y), 255)
    img.save(path)


def test_process_image_ultra_no_mask(tmp_path):
    inp = tmp_path / "in.png"
    out = tmp_path / "out.png"
    make_image(str(inp))

    ok = process_image(str(inp), str(out), "pytest", "ultra", use_fgsm=False, use_c2pa=False)
    assert ok is True
    assert out.exists()
    with Image.open(out) as im:
        assert im.format == "PNG"


def test_process_image_ultra_with_mask(tmp_path):
    inp = tmp_path / "in2.png"
    mask = tmp_path / "mask.png"
    out = tmp_path / "out2.png"
    make_image(str(inp), color=(200, 160, 130, 255))
    make_mask(str(mask))

    ok = process_image(str(inp), str(out), "pytest", "ultra", use_fgsm=False, use_c2pa=False, mask_path=str(mask))
    assert ok is True
    assert out.exists()
    with Image.open(out) as im:
        assert im.format == "PNG"
