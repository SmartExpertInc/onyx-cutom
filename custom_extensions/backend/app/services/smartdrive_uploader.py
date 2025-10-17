# custom_extensions/backend/app/services/smartdrive_uploader.py
import httpx
from urllib.parse import quote
from fastapi import HTTPException
import logging
from typing import Optional
from app.core.database import get_connection
from app.utils.encryption import decrypt_password
from app.core.database import get_pool

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

    # Enforce storage quota before uploading: compute projected usage
    try:
        pool = await get_pool()
        async with pool.acquire() as conn2:
            # Fetch effective entitlements from backend main helpers via DB tables
            # Defaults
            storage_gb_limit = 1
            row = await conn2.fetchrow("SELECT storage_gb FROM user_entitlement_overrides WHERE onyx_user_id = $1", user_id)
            if row and row.get("storage_gb") is not None:
                storage_gb_limit = int(row.get("storage_gb"))
            else:
                base_row = await conn2.fetchrow("SELECT storage_gb FROM user_entitlement_base WHERE onyx_user_id = $1", user_id)
                if base_row and base_row.get("storage_gb") is not None:
                    storage_gb_limit = int(base_row.get("storage_gb"))
            # Fallback to plan defaults if still None
            if not isinstance(storage_gb_limit, int) or storage_gb_limit <= 0:
                storage_gb_limit = 1

            usage_row = await conn2.fetchrow("SELECT used_bytes FROM user_storage_usage WHERE onyx_user_id = $1", user_id)
            used_bytes = int((usage_row and usage_row.get("used_bytes")) or 0)
            projected = used_bytes + len(file_content)
            if projected > storage_gb_limit * 1024 * 1024 * 1024:
                raise HTTPException(status_code=403, detail=f"Storage quota exceeded: {projected} bytes > {storage_gb_limit} GB")
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"[SmartDrive] Quota check failed, proceeding with upload: {e}")

    if not nextcloud_password:
        logger.error("[SmartDrive] Missing password for user account")
        raise HTTPException(status_code=400, detail="SmartDrive credentials incomplete")

    if not file_path.endswith("/"):
        file_path = f"{file_path}/"

    # Encode path segments for WebDAV
    def _encode_dav_path(path: str) -> str:
        try:
            if path is None:
                return "/"
            is_abs = path.startswith("/")
            is_dir = path.endswith("/")
            parts = [seg for seg in path.split("/") if seg != ""]
            encoded = "/".join(quote(seg, safe="") for seg in parts)
            return ("/" if is_abs else "") + encoded + ("/" if is_dir and encoded else "")
        except Exception:
            return path

    safe_dir_path = _encode_dav_path(file_path)
    folder_url = f"{nextcloud_base_url}/remote.php/dav/files/{nextcloud_username}{safe_dir_path}"
    logger.info(f"[SmartDrive] Ensuring folder | url={folder_url}")

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Create folder tree
        path_parts = [p for p in file_path.strip('/').split('/') if p]
        cumulative = ""
        for part in path_parts:
            cumulative += f"/{part}"
            mkcol_url = f"{nextcloud_base_url}/remote.php/dav/files/{nextcloud_username}{_encode_dav_path(cumulative)}/"
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
        file_url = f"{folder_url}{quote(file_name, safe='')}"
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
        # Update storage usage
        try:
            async with (await get_pool()).acquire() as conn2:
                await conn2.execute(
                    """
                    INSERT INTO user_storage_usage (onyx_user_id, used_bytes, updated_at)
                    VALUES ($1, $2, now())
                    ON CONFLICT (onyx_user_id)
                    DO UPDATE SET used_bytes = user_storage_usage.used_bytes + EXCLUDED.used_bytes, updated_at = now()
                    """,
                    user_id,
                    len(file_content),
                )
        except Exception as e:
            logger.warning(f"[SmartDrive] Failed to update storage usage: {e}")
        return result_path 