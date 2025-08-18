from fastapi import Request, HTTPException, status, Depends
import httpx
import logging
import os

logger = logging.getLogger(__name__)

# Constants from your main.py
ONYX_SESSION_COOKIE_NAME = "onyx_session"
ONYX_API_SERVER_URL = os.getenv("ONYX_API_SERVER_URL", "http://localhost:8080/api")
IS_PRODUCTION = os.getenv("ENVIRONMENT", "dev") == "production"

async def get_current_user_id(request: Request) -> str:
    """Get current user ID - matches your existing get_current_onyx_user_id pattern"""
    session_cookie_value = request.cookies.get(ONYX_SESSION_COOKIE_NAME)
    if not session_cookie_value:
        dev_user_id = request.headers.get("X-Dev-Onyx-User-ID")
        if dev_user_id: 
            return dev_user_id
        detail_msg = "Authentication required." if IS_PRODUCTION else f"Onyx session cookie '{ONYX_SESSION_COOKIE_NAME}' missing."
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail_msg)

    onyx_user_info_url = f"{ONYX_API_SERVER_URL}/me"
    cookies_to_forward = {ONYX_SESSION_COOKIE_NAME: session_cookie_value}
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(onyx_user_info_url, cookies=cookies_to_forward)
            response.raise_for_status()
            user_data = response.json()
            onyx_user_id = user_data.get("userId") or user_data.get("id")
            if not onyx_user_id:
                logger.error("Could not extract user ID from Onyx user data.")
                detail_msg = "User ID extraction failed." if IS_PRODUCTION else "Could not extract user ID from Onyx."
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)
            return str(onyx_user_id)
    except httpx.HTTPStatusError as e:
        logger.error(f"Onyx API '{onyx_user_info_url}' call failed. Status: {e.response.status_code}, Response: {e.response.text[:500]}")
        detail_msg = "Onyx user validation failed." if IS_PRODUCTION else f"Onyx user validation failed ({e.response.status_code})."
        raise HTTPException(status_code=e.response.status_code, detail=detail_msg)
    except httpx.RequestError as e:
        logger.error(f"Onyx API '{onyx_user_info_url}' network error: {e}")
        detail_msg = "Onyx user validation network error." if IS_PRODUCTION else f"Onyx API network error: {e}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)

async def get_current_user(request: Request) -> dict:
    """Get current user info for dependency injection"""
    user_id = await get_current_user_id(request)
    return {"user_id": user_id} 