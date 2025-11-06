# custom_extensions/backend/app/services/smartdrive_uploader.py
import httpx
from urllib.parse import quote
from fastapi import HTTPException
import logging
from typing import Optional, Dict
from datetime import datetime, timezone
import time
import os
from app.core.database import get_connection
from app.utils.encryption import decrypt_password
from app.core.database import get_pool

logger = logging.getLogger(__name__)


async def upload_file_to_smartdrive(
    user_id: str,
    file_content: bytes,
    file_name: str,
    file_path: str = "/LMS_Exports/",
    session_cookies: Optional[Dict[str, str]] = None,
    auto_index: bool = True
) -> str:
    """
    Upload file to user's SmartDrive and optionally index to Onyx.
    
    Args:
        user_id: Onyx user ID
        file_content: File content bytes
        file_name: Name of the file
        file_path: Destination path in SmartDrive (should end with /)
        session_cookies: Optional session cookies for Onyx authentication
        auto_index: Whether to automatically index the file to Onyx (requires session_cookies)
    
    Returns:
        The full file path in SmartDrive
    """

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
        
        # Auto-index to Onyx if enabled and session cookies provided
        if auto_index and session_cookies:
            logger.info(f"[SmartDrive] Auto-indexing file to Onyx: {result_path}")
            try:
                onyx_file_id = await _index_file_to_onyx(
                    nextcloud_username,
                    nextcloud_password,
                    nextcloud_base_url,
                    result_path,
                    file_name,
                    user_id,
                    session_cookies,
                    response.headers.get("content-type", "application/octet-stream")
                )
                
                if onyx_file_id:
                    logger.info(f"[SmartDrive] Successfully indexed file to Onyx: {onyx_file_id}")
                    # Create mapping in smartdrive_imports table
                    async with (await get_pool()).acquire() as conn2:
                        await conn2.execute(
                            """
                            INSERT INTO smartdrive_imports (onyx_user_id, smartdrive_path, onyx_file_id, etag, checksum, imported_at)
                            VALUES ($1, $2, $3, $4, $5, $6)
                            ON CONFLICT (onyx_user_id, smartdrive_path)
                            DO UPDATE SET onyx_file_id = EXCLUDED.onyx_file_id, etag = EXCLUDED.etag, checksum = EXCLUDED.checksum, imported_at = EXCLUDED.imported_at
                            """,
                            str(user_id),
                            result_path,
                            str(onyx_file_id),
                            response.headers.get("etag", f"etag_{hash(file_name)}"),
                            f"imported_{int(time.time())}",
                            datetime.now(timezone.utc),
                        )
                    logger.info(f"[SmartDrive] Created database mapping: {result_path} -> {onyx_file_id}")
                else:
                    logger.warning(f"[SmartDrive] Failed to get Onyx file ID for {result_path}")
            except Exception as index_err:
                logger.error(f"[SmartDrive] Auto-indexing failed for {result_path}: {index_err}", exc_info=True)
                # Don't fail the entire upload if indexing fails
        elif auto_index and not session_cookies:
            logger.info(f"[SmartDrive] Auto-index requested but no session cookies provided, skipping indexing")
        
        return result_path


async def _index_file_to_onyx(
    nextcloud_username: str,
    nextcloud_password: str,
    nextcloud_base_url: str,
    file_path: str,
    file_name: str,
    onyx_user_id: str,
    session_cookies: Dict[str, str],
    mime_type: str = "application/octet-stream"
) -> Optional[str]:
    """
    Download file from Nextcloud and upload to Onyx for indexing.
    Returns the Onyx file ID if successful.
    """
    try:
        # Get Onyx API server URL from environment
        onyx_api_url = os.getenv("ONYX_API_SERVER_URL", "http://api_server:8080")
        
        # Build download URL
        download_url = f"{nextcloud_base_url}/remote.php/dav/files/{nextcloud_username}{file_path}"
        auth = (nextcloud_username, nextcloud_password)
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            # Download from Nextcloud
            logger.info(f"[SmartDrive] Downloading file from Nextcloud: {download_url}")
            download_response = await client.get(download_url, auth=auth)
            
            if download_response.status_code != 200:
                logger.error(f"[SmartDrive] Failed to download {file_path}: {download_response.status_code}")
                return None
                
            file_content = download_response.content
            logger.info(f"[SmartDrive] Downloaded {len(file_content)} bytes")
            
            # Upload to Onyx
            onyx_upload_url = f"{onyx_api_url}/user/file/upload"
            files = {
                'files': (file_name, file_content, mime_type)
            }
            data = {
                'folder_id': '-1'  # Use RECENT_DOCS_FOLDER_ID (default "Recent Documents" folder)
            }
            
            logger.info(f"[SmartDrive] Uploading to Onyx: {onyx_upload_url}")
            upload_response = await client.post(
                onyx_upload_url,
                files=files,
                data=data,
                cookies=session_cookies,
                timeout=60.0
            )
            
            if upload_response.status_code in [200, 201]:
                response_data = upload_response.json()
                logger.info(f"[SmartDrive] Onyx upload response: {response_data}")
                # Extract file ID from Onyx response
                if isinstance(response_data, list) and len(response_data) > 0:
                    onyx_file_id = str(response_data[0].get('id'))
                    logger.info(f"[SmartDrive] Got Onyx file ID: {onyx_file_id}")
                    return onyx_file_id
                else:
                    logger.warning(f"[SmartDrive] Unexpected response format: {response_data}")
                    return None
            else:
                logger.error(f"[SmartDrive] Onyx upload failed: {upload_response.status_code} - {upload_response.text}")
                return None
                
    except Exception as e:
        logger.error(f"[SmartDrive] Error indexing file to Onyx: {e}", exc_info=True)
        return None 