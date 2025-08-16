from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import logging
from ..utils.smartdrive import SmartDriveManager

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/smartdrive/access")
async def get_smartdrive_access(request: Request):
    """Get SmartDrive (Nextcloud) access for the current user"""
    try:
        # Get user info from session/auth
        # For now, we'll expect email and password in the request
        body = await request.json()
        
        user_email = body.get("email")
        user_password = body.get("password")
        display_name = body.get("display_name")
        
        if not user_email or not user_password:
            return JSONResponse(
                status_code=400,
                content={"error": "Email and password are required"}
            )
        
        smartdrive_manager = SmartDriveManager()
        result = smartdrive_manager.ensure_user_access(
            user_email=user_email,
            user_password=user_password,
            display_name=display_name
        )
        
        if result["success"]:
            return JSONResponse(content={
                "success": True,
                "iframe_url": result["iframe_url"],
                "username": result["username"],
                "user_exists": result["user_exists"],
                "nextcloud_url": result["nextcloud_url"]
            })
        else:
            return JSONResponse(
                status_code=500,
                content={"error": result["error"]}
            )
            
    except Exception as e:
        logger.error(f"Error in get_smartdrive_access: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error"}
        )

@router.get("/smartdrive/health")
async def smartdrive_health():
    """Check SmartDrive (Nextcloud) service health"""
    try:
        smartdrive_manager = SmartDriveManager()
        is_healthy = smartdrive_manager.health_check()
        
        return JSONResponse(content={
            "healthy": is_healthy,
            "service": "Nextcloud SmartDrive",
            "url": smartdrive_manager.nextcloud_service.nextcloud_url
        })
        
    except Exception as e:
        logger.error(f"Error in smartdrive_health: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Health check failed"}
        )

@router.get("/smartdrive/user/{username}")
async def get_smartdrive_user(username: str):
    """Get SmartDrive user information"""
    try:
        smartdrive_manager = SmartDriveManager()
        user_info = smartdrive_manager.get_user_info(username)
        
        if user_info:
            return JSONResponse(content={
                "success": True,
                "user_info": user_info
            })
        else:
            return JSONResponse(
                status_code=404,
                content={"error": "User not found"}
            )
            
    except Exception as e:
        logger.error(f"Error in get_smartdrive_user: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error"}
        ) 