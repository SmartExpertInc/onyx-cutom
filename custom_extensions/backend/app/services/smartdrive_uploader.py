# custom_extensions/backend/app/services/smartdrive_uploader.py
import httpx
from fastapi import HTTPException
import logging
from typing import Optional
from app.core.database import get_connection
from app.utils.encryption import decrypt_password

logger = logging.getLogger(__name__)


async def upload_file_to_smartdrive(
    user_id: str,
    file_content: bytes,
    file_name: str,
    file_path: str = "/LMS_Exports/"
) -> str:
    """Upload file to user's SmartDrive and return file path"""

    async with get_connection() as connection:
        account = await connection.fetchrow(
            "SELECT * FROM smartdrive_accounts WHERE onyx_user_id = $1",
            user_id
        )
        if not account or not account.get("nextcloud_username"):
            raise HTTPException(status_code=400, detail="SmartDrive not configured")

        nextcloud_username = account["nextcloud_username"]
        nextcloud_password = decrypt_password(account["nextcloud_password_encrypted"]) if account.get("nextcloud_password_encrypted") else None
        nextcloud_base_url = account.get("nextcloud_base_url") or 'http://nc1.contentbuilder.ai:8080'

    if not nextcloud_password:
        raise HTTPException(status_code=400, detail="SmartDrive credentials incomplete")

    # Ensure trailing slash for folder path
    if not file_path.endswith("/"):
        file_path = f"{file_path}/"

    folder_url = f"{nextcloud_base_url}/remote.php/dav/files/{nextcloud_username}{file_path}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Create folder if it doesn't exist (MKCOL is idempotent per path level)
        # Attempt to create nested folders progressively
        path_parts = [p for p in file_path.strip('/').split('/') if p]
        cumulative = ""
        for part in path_parts:
            cumulative += f"/{part}"
            mkcol_url = f"{nextcloud_base_url}/remote.php/dav/files/{nextcloud_username}{cumulative}/"
            try:
                await client.request("MKCOL", mkcol_url, auth=(nextcloud_username, nextcloud_password))
            except Exception as e:
                logger.warning(f"MKCOL failed for {mkcol_url}: {e}")

        # Upload file
        file_url = f"{folder_url}{file_name}"
        response = await client.put(
            file_url,
            content=file_content,
            auth=(nextcloud_username, nextcloud_password)
        )

        if response.status_code not in [200, 201, 204]:
            logger.error(f"Failed to upload file to SmartDrive: {response.status_code} {response.text[:200]}")
            raise HTTPException(status_code=500, detail=f"Failed to upload file: {response.status_code}")

        return f"{file_path}{file_name}" 