import os
import sys
import pytest
from PIL import Image

# Add current directory to path to allow import
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from aegis_shield import process_image

@pytest.fixture
def sample_image(tmp_path):
    path = tmp_path / "test_input.png"
    img = Image.new('RGB', (200, 200), color='white')
    img.save(path)
    return str(path)

def test_process_image_standard(sample_image, tmp_path):
    output_path = tmp_path / "output_standard.jpg"
    success = process_image(sample_image, str(output_path), "TestUser", "standard")
    
    assert success
    assert os.path.exists(output_path)
    
    with Image.open(output_path) as img:
        assert img.format == "JPEG"
        # Check exif data if possible, but basic existence is good for now

def test_process_image_ultra(sample_image, tmp_path):
    output_path = tmp_path / "output_ultra.jpg"
    success = process_image(sample_image, str(output_path), "TestUser", "ultra")
    
    assert success
    # Ultra now forces PNG due to Ghost Layer LSB
    expected_png = tmp_path / "output_ultra.png"
    assert expected_png.exists()


def test_missing_file():
    success = process_image("nonexistent.png", "output.jpg", "User", "standard")
    assert not success

def test_lsb_persistence(sample_image, tmp_path):
    from aegis_shield import lsb_encode, lsb_decode, generate_aegis_id
    
    # Manually test LSB functions
    with Image.open(sample_image) as img:
        img = img.convert("RGBA")
        original_id = generate_aegis_id()
        encoded_img = lsb_encode(img, original_id)
        
        # Save as PNG to preserve LSB
        png_path = tmp_path / "lsb_test.png"
        encoded_img.save(png_path)
        
    # Re-open and simulate metadata stripping (explicitly removing EXIF)
    stripped_path = tmp_path / "stripped.png"
    with Image.open(png_path) as img:
        # Save as PNG without any extra info (metadata stripping)
        data = list(img.getdata())
        new_img = Image.new(img.mode, img.size)
        new_img.putdata(data)
        new_img.save(stripped_path)
        
    # Verify ID survives pixel-only copy
    with Image.open(stripped_path) as img:
        decoded_id = lsb_decode(img)
        assert decoded_id == original_id

def test_process_image_stealth_png(sample_image, tmp_path):
    # Verify stealth mode forces PNG
    output_base = tmp_path / "output_stealth.jpg" # Intentionally requesting jpg
    success = process_image(sample_image, str(output_base), "User", "stealth")
    
    assert success
    # Check that .png exists instead
    expected_png = tmp_path / "output_stealth.png"
    assert expected_png.exists()
    assert not output_base.exists()


def test_cli_decode(sample_image, tmp_path):
    import subprocess
    
    # 1. Protect an image using the library function (or CLI)
    output_png = tmp_path / "protected_for_cli.png"
    process_image(sample_image, str(output_png), "User", "stealth")
    
    # 2. Run the script via subprocess to decode
    script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "aegis_shield.py")
    
    result = subprocess.run(
        [sys.executable, script_path, str(output_png), "--decode"],
        capture_output=True,
        text=True
    )
    
    assert result.returncode == 0
    assert "Extracted Aegis-ID:" in result.stdout

def test_cli_decode_failure(sample_image):
    import subprocess
    # Run against an unprotected image
    script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "aegis_shield.py")
    
    result = subprocess.run(
        [sys.executable, script_path, sample_image, "--decode"],
        capture_output=True,
        text=True
    )
    
    assert result.returncode == 1
    assert "No Aegis-ID found" in result.stdout
