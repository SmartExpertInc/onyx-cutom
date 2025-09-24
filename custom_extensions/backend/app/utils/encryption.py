# custom_extensions/backend/app/utils/encryption.py
import os
import logging
from fastapi import HTTPException

logger = logging.getLogger(__name__)


def get_or_create_encryption_key() -> bytes:
    key = os.environ.get("SMARTDRIVE_ENCRYPTION_KEY")
    if not key:
        from cryptography.fernet import Fernet
        key = Fernet.generate_key().decode()
        logger.warning(
            f"Generated new encryption key. Please set SMARTDRIVE_ENCRYPTION_KEY={key} in your environment for production!"
        )
    return key.encode()


def encrypt_password(password: str) -> str:
    try:
        from cryptography.fernet import Fernet
        f = Fernet(get_or_create_encryption_key())
        return f.encrypt(password.encode()).decode()
    except Exception as e:
        logger.error(f"Failed to encrypt password: {e}")
        raise HTTPException(status_code=500, detail="Encryption failed")


def decrypt_password(encrypted_password: str) -> str:
    try:
        from cryptography.fernet import Fernet
        f = Fernet(get_or_create_encryption_key())
        return f.decrypt(encrypted_password.encode()).decode()
    except Exception as e:
        logger.error(f"Failed to decrypt password: {e}")
        raise HTTPException(status_code=500, detail="Decryption failed") 