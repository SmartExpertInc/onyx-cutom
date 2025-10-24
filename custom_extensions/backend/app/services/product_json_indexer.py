import io
import json
import logging
from typing import Optional

import httpx

logger = logging.getLogger(__name__)


async def upload_product_json_to_onyx(
    onyx_api_base: str,
    cookies: dict,
    file_name: str,
    json_bytes: bytes,
    folder_id: Optional[int] = None,
) -> str:
    """Upload a JSON file to Onyx via the user file upload endpoint and return the file id."""
    logger.info(f"[upload_product_json_to_onyx] === START ===")
    logger.info(f"[upload_product_json_to_onyx] file_name={file_name}, size={len(json_bytes)} bytes, folder_id={folder_id}")
    logger.info(f"[upload_product_json_to_onyx] onyx_api_base={onyx_api_base}")
    
    files = {"files": (file_name, io.BytesIO(json_bytes), "application/json")}
    data = {}
    if folder_id is not None:
        data["folder_id"] = str(folder_id)
        logger.info(f"[upload_product_json_to_onyx] Including folder_id in request: {folder_id}")

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            upload_url = f"{onyx_api_base}/user/file/upload"
            logger.info(f"[upload_product_json_to_onyx] POSTing to {upload_url}")
            
            resp = await client.post(upload_url, files=files, data=data, cookies=cookies)
            logger.info(f"[upload_product_json_to_onyx] Response status: {resp.status_code}")
            
            resp.raise_for_status()
            
            result = resp.json()
            logger.info(f"[upload_product_json_to_onyx] Response JSON: {result}")
            
            if not result or not isinstance(result, list) or not result[0].get("id"):
                logger.error(f"[upload_product_json_to_onyx] Invalid response structure: {result}")
                raise RuntimeError("Onyx upload did not return a file id")
            
            file_id = str(result[0]["id"])
            logger.info(f"[upload_product_json_to_onyx] === SUCCESS: file_id={file_id} ===")
            return file_id
    except httpx.HTTPStatusError as e:
        logger.error(f"[upload_product_json_to_onyx] HTTP error: {e.response.status_code} - {e.response.text}")
        raise
    except Exception as e:
        logger.error(f"[upload_product_json_to_onyx] Unexpected error: {e}", exc_info=True)
        raise


