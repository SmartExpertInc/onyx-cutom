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
    files = {"files": (file_name, io.BytesIO(json_bytes), "application/json")}
    data = {}
    if folder_id is not None:
        data["folder_id"] = str(folder_id)

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(f"{onyx_api_base}/user/file/upload", files=files, data=data, cookies=cookies)
        resp.raise_for_status()
        result = resp.json()
        if not result or not isinstance(result, list) or not result[0].get("id"):
            raise RuntimeError("Onyx upload did not return a file id")
        return str(result[0]["id"])


