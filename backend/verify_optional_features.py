import sys
import os
import subprocess
from PIL import Image

def run_command(command):
    print(f"Running: {command}")
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return False
    print("Success")
    return True

def create_dummy_image(path):
    img = Image.new('RGB', (100, 100), color = 'red')
    img.save(path)
    print(f"Created dummy image: {path}")

def main():
    print("--- Verifying Optional Features ---")
    
    # 1. Check Imports
    print("\n1. Checking Imports...")
    
    missing_deps = []
    
    try:
        import torch
        print(" [OK] torch")
    except ImportError:
        print(" [FAIL] torch")
        missing_deps.append("torch")

    try:
        import art
        print(" [OK] art (adversarial-robustness-toolbox)")
    except ImportError:
        print(" [FAIL] art (adversarial-robustness-toolbox)")
        missing_deps.append("adversarial-robustness-toolbox")

    try:
        import c2pa
        print(" [OK] c2pa (c2pa-python)")
    except ImportError:
        print(" [FAIL] c2pa (c2pa-python)")
        missing_deps.append("c2pa-python")
        
    if missing_deps:
        print(f"\nWarning: Missing dependencies: {', '.join(missing_deps)}")
        print("Some features may not work.")
    else:
        print("\nAll optional dependencies verified.")
        
    # Create dummy image
    dummy_img = "test_input.jpg"
    create_dummy_image(dummy_img)
    
    python_exec = sys.executable
    script_dir = os.path.dirname(os.path.abspath(__file__))
    script_path = os.path.join(script_dir, "aegis_shield.py")
    
    # 2. Test FGSM
    print("\n2. Testing FGSM Protection...")
    fgsm_out = "test_fgsm.jpg"
    cmd_fgsm = f"{python_exec} {script_path} {dummy_img} --output {fgsm_out} --fgsm"
    if run_command(cmd_fgsm):
        if os.path.exists(fgsm_out):
            print(f"FGSM output created: {fgsm_out}")
        else:
            print("FGSM output file missing!")
            
    # 3. Test C2PA
    print("\n3. Testing C2PA Signature...")
    c2pa_out = "test_c2pa.jpg"
    cmd_c2pa = f"{python_exec} {script_path} {dummy_img} --output {c2pa_out} --c2pa"
    if run_command(cmd_c2pa):
        if os.path.exists(c2pa_out):
            print(f"C2PA output created: {c2pa_out}")
        else:
            print("C2PA output file missing!")
            
    # Cleanup
    if os.path.exists(dummy_img): os.remove(dummy_img)
    if os.path.exists(fgsm_out): os.remove(fgsm_out)
    if os.path.exists(c2pa_out): os.remove(c2pa_out)

if __name__ == "__main__":
    main()
