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

    logger.info(f"[SmartDrive] Upload start | user={user_id} name={file_name} size={len(file_content)}B path={file_path}")

    async with get_connection() as connection:
        account = await connection.fetchrow(
            "SELECT * FROM smartdrive_accounts WHERE onyx_user_id = $1",
            user_id
        )
        if not account or not account.get("nextcloud_username"):
            logger.error("[SmartDrive] Account not configured for user")
            raise HTTPException(status_code=400, detail="SmartDrive not configured")

        nextcloud_username = account["nextcloud_username"]
        nextcloud_password = decrypt_password(account["nextcloud_password_encrypted"]) if account.get("nextcloud_password_encrypted") else None
        nextcloud_base_url = account.get("nextcloud_base_url") or 'http://nc1.contentbuilder.ai:8080'

    if not nextcloud_password:
        logger.error("[SmartDrive] Missing password for user account")
        raise HTTPException(status_code=400, detail="SmartDrive credentials incomplete")

    if not file_path.endswith("/"):
        file_path = f"{file_path}/"

    folder_url = f"{nextcloud_base_url}/remote.php/dav/files/{nextcloud_username}{file_path}"
    logger.info(f"[SmartDrive] Ensuring folder | url={folder_url}")

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Create folder tree
        path_parts = [p for p in file_path.strip('/').split('/') if p]
        cumulative = ""
        for part in path_parts:
            cumulative += f"/{part}"
            mkcol_url = f"{nextcloud_base_url}/remote.php/dav/files/{nextcloud_username}{cumulative}/"
            try:
                mkcol_resp = await client.request("MKCOL", mkcol_url, auth=(nextcloud_username, nextcloud_password))
                if mkcol_resp.status_code == 201:
                    logger.info(f"[SmartDrive] MKCOL created {mkcol_url}")
                elif mkcol_resp.status_code == 405:
                    # Folder already exists; benign
                    logger.debug(f"[SmartDrive] MKCOL already exists {mkcol_url}")
                else:
                    logger.warning(f"[SmartDrive] MKCOL {mkcol_url} -> {mkcol_resp.status_code}")
            except Exception as e:
                logger.warning(f"[SmartDrive] MKCOL failed {mkcol_url}: {e}")

        # Upload file
        file_url = f"{folder_url}{file_name}"
        logger.info(f"[SmartDrive] PUT {file_url}")
        response = await client.put(
            file_url,
            content=file_content,
            auth=(nextcloud_username, nextcloud_password)
        )
        logger.info(f"[SmartDrive] PUT status={response.status_code}")

        if response.status_code not in [200, 201, 204]:
            snippet = response.text[:200] if hasattr(response, 'text') else ''
            logger.error(f"[SmartDrive] Upload failed | status={response.status_code} body={snippet}")
            raise HTTPException(status_code=500, detail=f"Failed to upload file: {response.status_code}")

        result_path = f"{file_path}{file_name}"
        logger.info(f"[SmartDrive] Upload success | path={result_path}")
        return result_path 