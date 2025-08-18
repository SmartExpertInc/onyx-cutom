import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

def get_encryption_key() -> bytes:
    """Get or generate encryption key for credential storage"""
    key_env = os.getenv("ENCRYPTION_KEY")
    if key_env:
        return base64.urlsafe_b64decode(key_env)
    
    # Generate key from password and salt
    password = os.getenv("ENCRYPTION_PASSWORD", "default-encryption-password").encode()
    salt = os.getenv("ENCRYPTION_SALT", "default-salt").encode()
    
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(password))
    return key

def encrypt_data(data: str) -> str:
    """Encrypt data using Fernet symmetric encryption"""
    key = get_encryption_key()
    f = Fernet(key)
    encrypted = f.encrypt(data.encode())
    return base64.urlsafe_b64encode(encrypted).decode()

def decrypt_data(encrypted_data: str) -> str:
    """Decrypt data using Fernet symmetric encryption"""
    key = get_encryption_key()
    f = Fernet(key)
    encrypted_bytes = base64.urlsafe_b64decode(encrypted_data.encode())
    decrypted = f.decrypt(encrypted_bytes)
    return decrypted.decode() 