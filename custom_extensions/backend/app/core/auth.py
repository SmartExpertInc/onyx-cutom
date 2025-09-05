from fastapi import Request, HTTPException
import logging

logger = logging.getLogger(__name__)

async def get_current_onyx_user_id(request: Request) -> int:
    """
    Extract the current Onyx user ID from the request.
    This is a simplified implementation - you may need to adjust based on your auth system.
    """
    try:
        # Check for user ID in cookies or headers
        # This is a placeholder implementation - adjust based on your actual auth system
        user_id = request.cookies.get('onyx_user_id')
        
        if user_id:
            return int(user_id)
        
        # Alternative: check headers
        user_id_header = request.headers.get('x-onyx-user-id')
        if user_id_header:
            return int(user_id_header)
        
        # If no user ID found, raise an error
        raise HTTPException(
            status_code=401,
            detail="User authentication required"
        )
        
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid user ID format"
        )
    except Exception as e:
        logger.error(f"Error getting current user ID: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to authenticate user"
        ) 