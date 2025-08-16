"""
SmartDrive utilities for Nextcloud integration
"""
import logging
from typing import Dict, Any, Optional
from ..services.nextcloud_service import NextcloudService
from ..core.config import NEXTCLOUD_URL, NEXTCLOUD_ADMIN_USERNAME, NEXTCLOUD_ADMIN_PASSWORD

logger = logging.getLogger(__name__)

class SmartDriveManager:
    """Manager for SmartDrive (Nextcloud) integration"""
    
    def __init__(self):
        self.nextcloud_service = NextcloudService(
            nextcloud_url=NEXTCLOUD_URL,
            admin_username=NEXTCLOUD_ADMIN_USERNAME,
            admin_password=NEXTCLOUD_ADMIN_PASSWORD
        )
    
    def ensure_user_access(self, user_email: str, user_password: str, 
                          display_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Ensure user has access to SmartDrive (Nextcloud)
        Creates user if doesn't exist, returns session info
        """
        try:
            result = self.nextcloud_service.ensure_user_exists(
                email=user_email,
                password=user_password,
                display_name=display_name
            )
            
            if result["success"]:
                # Generate iframe URL for the user
                iframe_url = self.nextcloud_service.get_iframe_url(
                    username=result["username"],
                    password=result["password"]
                )
                
                return {
                    "success": True,
                    "iframe_url": iframe_url,
                    "username": result["username"],
                    "user_exists": result.get("user_exists", False),
                    "nextcloud_url": NEXTCLOUD_URL
                }
            else:
                return {
                    "success": False,
                    "error": result.get("error", "Failed to ensure user access")
                }
                
        except Exception as e:
            logger.error(f"Error ensuring SmartDrive access for {user_email}: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def create_session_token(self, user_email: str, user_password: str) -> Optional[str]:
        """Create a session token for the user (for future enhancement)"""
        try:
            username = user_email.lower()
            
            # Verify credentials first
            if self.nextcloud_service.verify_user_credentials(username, user_password):
                # For now, return a basic token
                # In production, implement proper session management
                import hashlib
                import time
                token_data = f"{username}:{user_password}:{time.time()}"
                return hashlib.sha256(token_data.encode()).hexdigest()
            
            return None
            
        except Exception as e:
            logger.error(f"Error creating session token for {user_email}: {e}")
            return None
    
    def get_user_info(self, username: str) -> Optional[Dict[str, Any]]:
        """Get user information from Nextcloud"""
        return self.nextcloud_service.get_user_info(username)
    
    def health_check(self) -> bool:
        """Check if Nextcloud service is accessible"""
        try:
            # Simple health check - try to access the users endpoint
            import requests
            response = requests.get(
                f"{NEXTCLOUD_URL}/ocs/v1.php/cloud/users",
                headers={'OCS-APIRequest': 'true'},
                auth=(NEXTCLOUD_ADMIN_USERNAME, NEXTCLOUD_ADMIN_PASSWORD),
                timeout=10
            )
            return response.status_code in [200, 401]  # 401 is ok, means service is up
        except Exception as e:
            logger.error(f"SmartDrive health check failed: {e}")
            return False 