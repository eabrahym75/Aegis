"""
C2PA Image Signing Script

Signs images with C2PA (Content Authenticity Initiative) manifests
to establish content provenance and authenticity.
"""

import c2pa
import json
import traceback
from pathlib import Path

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.backends import default_backend

# Supported image extensions for C2PA signing
SUPPORTED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff', '.tif'}

# Official C2PA test credentials from contentauth/c2pa-python repository
# Source: https://github.com/contentauth/c2pa-python/tree/main/tests/fixtures
# WARNING: FOR TESTING ONLY - In production, use properly issued certificates

TEST_CERTIFICATE_PEM = """-----BEGIN CERTIFICATE-----
MIIChzCCAi6gAwIBAgIUcCTmJHYF8dZfG0d1UdT6/LXtkeYwCgYIKoZIzj0EAwIw
gYwxCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJDQTESMBAGA1UEBwwJU29tZXdoZXJl
MScwJQYDVQQKDB5DMlBBIFRlc3QgSW50ZXJtZWRpYXRlIFJvb3QgQ0ExGTAXBgNV
BAsMEEZPUiBURVNUSU5HX09OTFkxGDAWBgNVBAMMD0ludGVybWVkaWF0ZSBDQTAe
Fw0yMjA2MTAxODQ2NDBaFw0zMDA4MjYxODQ2NDBaMIGAMQswCQYDVQQGEwJVUzEL
MAkGA1UECAwCQ0ExEjAQBgNVBAcMCVNvbWV3aGVyZTEfMB0GA1UECgwWQzJQQSBU
ZXN0IFNpZ25pbmcgQ2VydDEZMBcGA1UECwwQRk9SIFRFU1RJTkdfT05MWTEUMBIG
A1UEAwwLQzJQQSBTaWduZXIwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAQPaL6R
kAkYkKU4+IryBSYxJM3h77sFiMrbvbI8fG7w2Bbl9otNG/cch3DAw5rGAPV7NWky
l3QGuV/wt0MrAPDoo3gwdjAMBgNVHRMBAf8EAjAAMBYGA1UdJQEB/wQMMAoGCCsG
AQUFBwMEMA4GA1UdDwEB/wQEAwIGwDAdBgNVHQ4EFgQUFznP0y83joiNOCedQkxT
tAMyNcowHwYDVR0jBBgwFoAUDnyNcma/osnlAJTvtW6A4rYOL2swCgYIKoZIzj0E
AwIDRwAwRAIgOY/2szXjslg/MyJFZ2y7OH8giPYTsvS7UPRP9GI9NgICIDQPMKrE
LQUJEtipZ0TqvI/4mieoyRCeIiQtyuS0LACz
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
MIICajCCAg+gAwIBAgIUfXDXHH+6GtA2QEBX2IvJ2YnGMnUwCgYIKoZIzj0EAwIw
dzELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAkNBMRIwEAYDVQQHDAlTb21ld2hlcmUx
GjAYBgNVBAoMEUMyUEEgVGVzdCBSb290IENBMRkwFwYDVQQLDBBGT1IgVEVTVElO
R19PTkxZMRAwDgYDVQQDDAdSb290IENBMB4XDTIyMDYxMDE4NDY0MFoXDTMwMDgy
NzE4NDY0MFowgYwxCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJDQTESMBAGA1UEBwwJ
U29tZXdoZXJlMScwJQYDVQQKDB5DMlBBIFRlc3QgSW50ZXJtZWRpYXRlIFJvb3Qg
Q0ExGTAXBgNVBAsMEEZPUiBURVNUSU5HX09OTFkxGDAWBgNVBAMMD0ludGVybWVk
aWF0ZSBDQTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABHllI4O7a0EkpTYAWfPM
D6Rnfk9iqhEmCQKMOR6J47Rvh2GGjUw4CS+aLT89ySukPTnzGsMQ4jK9d3V4Aq4Q
LsOjYzBhMA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgGGMB0GA1UdDgQW
BBQOfI1yZr+iyeUAlO+1boDitg4vazAfBgNVHSMEGDAWgBRembiG4Xgb2VcVWnUA
UrYpDsuojDAKBggqhkjOPQQDAgNJADBGAiEAtdZ3+05CzFo90fWeZ4woeJcNQC4B
84Ill3YeZVvR8ZECIQDVRdha1xEDKuNTAManY0zthSosfXcvLnZui1A/y/DYeg==
-----END CERTIFICATE-----
"""

TEST_PRIVATE_KEY_PEM = """-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgfNJBsaRLSeHizv0m
GL+gcn78QmtfLSm+n+qG9veC2W2hRANCAAQPaL6RkAkYkKU4+IryBSYxJM3h77sF
iMrbvbI8fG7w2Bbl9otNG/cch3DAw5rGAPV7NWkyl3QGuV/wt0MrAPDo
-----END PRIVATE KEY-----
"""


def create_signer_callback():
    """
    Create a callback function for signing data using ES256 algorithm.
    
    Returns:
        callable: A function that takes bytes and returns a signature
    """
    private_key = serialization.load_pem_private_key(
        TEST_PRIVATE_KEY_PEM.encode(),
        password=None,
        backend=default_backend()
    )
    
    def sign_callback(data: bytes) -> bytes:
        """Sign data using ES256 (ECDSA with SHA-256)."""
        signature = private_key.sign(data, ec.ECDSA(hashes.SHA256()))
        return signature
    
    return sign_callback


def get_certificate_pem() -> str:
    """Get the test certificate chain in PEM format."""
    return TEST_CERTIFICATE_PEM


def validate_input_image(input_path: Path) -> bool:
    """
    Validate that the input file exists and is a supported format.
    
    Args:
        input_path: Path to the input image
        
    Returns:
        bool: True if valid, False otherwise
    """
    if not input_path.exists():
        print(f"ERROR: Input file '{input_path}' not found.")
        return False
    
    if not input_path.is_file():
        print(f"ERROR: '{input_path}' is not a file.")
        return False
    
    if input_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
        print(f"ERROR: Unsupported file format '{input_path.suffix}'.")
        print(f"   Supported formats: {', '.join(sorted(SUPPORTED_EXTENSIONS))}")
        return False
    
    return True


def sign_image(
    input_path: Path,
    output_path: Path,
    timestamp_url: str = "http://timestamp.digicert.com"
) -> bool:
    """
    Sign an image with C2PA manifest.
    
    Args:
        input_path: Path to the input image
        output_path: Path for the signed output image
        timestamp_url: URL of the timestamp authority
        
    Returns:
        bool: True if signing succeeded, False otherwise
    """
    # Validate input
    if not validate_input_image(input_path):
        return False
    
    # Prepare manifest definition (dict, not JSON string for v0.28+)
    manifest_definition = {
        "claim_generator": "python_test_app",
        "claim_generator_info": [{
            "name": "python_test_app",
            "version": "1.0.0",
        }],
        "format": "image/jpeg",
        "assertions": [{
            "label": "c2pa.actions",
            "data": {"actions": [{"action": "c2pa.created"}]}
        }]
    }
    
    try:
        print("--- C2PA SIGNING START ---")
        
        # Create callback-based signer (correct API for c2pa-python 0.28)
        signer_callback = create_signer_callback()
        
        with c2pa.Signer.from_callback(
            callback=signer_callback,
            alg=c2pa.C2paSigningAlg.ES256,
            certs=get_certificate_pem(),
            tsa_url=timestamp_url
        ) as signer:
            with c2pa.Builder(manifest_definition) as builder:
                builder.sign_file(
                    source_path=str(input_path),
                    dest_path=str(output_path),
                    signer=signer
                )
        
        print("\n" + "=" * 40)
        print(f"SUCCESS! Image signed: {output_path}")
        print("=" * 40)
        return True
        
    except Exception as e:
        print(f"ERROR: {e}")
        traceback.print_exc()
        return False


def main():
    """Main entry point for the C2PA signing script."""
    # Use pathlib for cross-platform compatibility
    script_dir = Path(__file__).parent
    input_path = script_dir / "input.jpg"
    output_path = script_dir / "output_signed.jpg"
    
    success = sign_image(input_path, output_path)
    
    if not success:
        print("\n Signing failed. Check the errors above.")
        exit(1)


if __name__ == "__main__":
    main()