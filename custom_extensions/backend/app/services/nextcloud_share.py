# custom_extensions/backend/app/services/nextcloud_share.py
import httpx
import os
import xml.etree.ElementTree as ET
import logging
from fastapi import HTTPException
from app.core.database import get_connection
from app.utils.encryption import decrypt_password

logger = logging.getLogger(__name__)


async def create_public_download_link(
    user_id: str,
    file_path: str,
    expiry_days: int = None
) -> str:
    """Create public download link via Nextcloud OCS API"""

    logger.info(f"[OCS] Create public link start | user={user_id} path={file_path} expiry_days={expiry_days}")

    if expiry_days is None:
        try:
            expiry_days = int(os.environ.get("LMS_EXPORT_EXPIRY_DAYS", "365"))
        except Exception:
            expiry_days = 365

    async with get_connection() as connection:
        account = await connection.fetchrow(
            "SELECT * FROM smartdrive_accounts WHERE onyx_user_id = $1",
            user_id
        )
        if not account or not account.get("nextcloud_username"):
            logger.error("[OCS] Account not configured for user")
            raise HTTPException(status_code=400, detail="SmartDrive not configured")

        nextcloud_username = account["nextcloud_username"]
        nextcloud_password = decrypt_password(account["nextcloud_password_encrypted"]) if account.get("nextcloud_password_encrypted") else None
        nextcloud_base_url = account.get("nextcloud_base_url") or 'http://nc1.contentbuilder.ai:8080'

    if not nextcloud_password:
        logger.error("[OCS] Missing password for user account")
        raise HTTPException(status_code=400, detail="SmartDrive credentials incomplete")

    ocs_url = f"{nextcloud_base_url}/ocs/v2.php/apps/files_sharing/api/v1/shares"

    from datetime import datetime, timedelta
    expiry_date = (datetime.now() + timedelta(days=expiry_days)).strftime('%Y-%m-%d')

    data = {
        'path': file_path,
        'shareType': 3,
        'permissions': 1,
        'expireDate': expiry_date
    }
    logger.info(f"[OCS] POST {ocs_url} data={data}")

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            ocs_url,
            data=data,
            auth=(nextcloud_username, nextcloud_password),
            headers={'OCS-APIRequest': 'true', 'Accept': 'application/xml'}
        )
        logger.info(f"[OCS] POST status={response.status_code}")

        if response.status_code != 200:
            snippet = response.text[:400] if hasattr(response, 'text') else ''
            logger.error(f"[OCS] Failed to create public link | status={response.status_code} body={snippet}")
            raise HTTPException(status_code=500, detail="Failed to create public link")

        try:
            root = ET.fromstring(response.content)
            url_element = root.find('.//url')
            logger.info(f"[OCS] XML parsed | url_found={url_element is not None}")
        except Exception as parse_err:
            logger.error(f"[OCS] XML parse error: {parse_err}")
            raise HTTPException(status_code=500, detail="Could not parse OCS response")

        if url_element is not None and url_element.text:
            share_url = url_element.text
            token = share_url.rstrip('/').split('/')[-1]
            public_domain = os.environ.get("NEXTCLOUD_PUBLIC_SHARE_DOMAIN")
            base_for_public = public_domain if public_domain else nextcloud_base_url
            download_url = f"{base_for_public}/index.php/s/{token}/download"
            logger.info(f"[OCS] Public link created | token={token} url={download_url}")
            return download_url

        logger.error("[OCS] Could not extract share URL from response")
        raise HTTPException(status_code=500, detail="Could not extract share URL") 