import requests
import base64
import logging
from typing import Optional, Dict, Any
import hashlib
import secrets
import string

logger = logging.getLogger(__name__)

class NextcloudService:
    """Service for managing Nextcloud users and authentication"""
    
    def __init__(self, nextcloud_url: str, admin_username: str, admin_password: str):
        self.nextcloud_url = nextcloud_url.rstrip('/')
        self.admin_username = admin_username
        self.admin_password = admin_password
        self.base_url = f"{self.nextcloud_url}/ocs/v1.php/cloud"
        
        # Default headers for Nextcloud OCS API
        self.headers = {
            'OCS-APIRequest': 'true',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        # Admin auth for user management
        self.admin_auth = (admin_username, admin_password)
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                     auth: Optional[tuple] = None) -> requests.Response:
        """Make a request to the Nextcloud OCS API"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        if auth is None:
            auth = self.admin_auth
            
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=self.headers,
                data=data,
                auth=auth,
                timeout=30,
                verify=True  # Enable SSL verification in production
            )
            return response
        except requests.exceptions.RequestException as e:
            logger.error(f"Nextcloud API request failed: {e}")
            raise
    
    def user_exists(self, username: str) -> bool:
        """Check if a user exists in Nextcloud"""
        try:
            response = self._make_request('GET', f'/users/{username}')
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Error checking if user exists: {e}")
            return False
    
    def generate_password(self, length: int = 16) -> str:
        """Generate a secure random password"""
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        return ''.join(secrets.choice(alphabet) for _ in range(length))
    
    def create_user(self, username: str, email: str, password: str, 
                   display_name: Optional[str] = None) -> Dict[str, Any]:
        """Create a new user in Nextcloud"""
        if self.user_exists(username):
            logger.info(f"User {username} already exists in Nextcloud")
            return {"success": True, "user_exists": True}
        
        data = {
            'userid': username,
            'password': password,
            'email': email
        }
        
        if display_name:
            data['displayName'] = display_name
        
        try:
            response = self._make_request('POST', '/users', data=data)
            
            if response.status_code == 200:
                logger.info(f"Successfully created Nextcloud user: {username}")
                return {
                    "success": True, 
                    "user_exists": False,
                    "username": username,
                    "password": password
                }
            else:
                logger.error(f"Failed to create Nextcloud user {username}: {response.text}")
                return {"success": False, "error": response.text}
                
        except Exception as e:
            logger.error(f"Error creating Nextcloud user {username}: {e}")
            return {"success": False, "error": str(e)}
    
    def ensure_user_exists(self, email: str, password: str, 
                          display_name: Optional[str] = None) -> Dict[str, Any]:
        """Ensure a user exists in Nextcloud, create if not exists"""
        # Use email as username (common pattern)
        username = email.lower()
        
        if self.user_exists(username):
            logger.info(f"User {username} already exists in Nextcloud")
            return {
                "success": True,
                "user_exists": True,
                "username": username,
                "password": password  # Use provided password for existing user
            }
        
        # Create new user
        return self.create_user(username, email, password, display_name)
    
    def get_user_info(self, username: str) -> Optional[Dict[str, Any]]:
        """Get user information from Nextcloud"""
        try:
            response = self._make_request('GET', f'/users/{username}')
            
            if response.status_code == 200:
                # Parse XML response (Nextcloud returns XML by default)
                import xml.etree.ElementTree as ET
                root = ET.fromstring(response.text)
                
                # Extract user data from XML
                data_elem = root.find('.//data')
                if data_elem is not None:
                    user_data = {}
                    for child in data_elem:
                        user_data[child.tag] = child.text
                    return user_data
                    
            return None
            
        except Exception as e:
            logger.error(f"Error getting user info for {username}: {e}")
            return None
    
    def generate_app_session_url(self, username: str, password: str) -> str:
        """Generate a URL with embedded authentication for iframe access"""
        # Create base64 encoded credentials
        credentials = base64.b64encode(f"{username}:{password}".encode()).decode()
        
        # Return the Nextcloud URL with authentication
        # Note: This is a basic approach. In production, consider using app passwords
        return f"{self.nextcloud_url}?auth={credentials}"
    
    def verify_user_credentials(self, username: str, password: str) -> bool:
        """Verify user credentials against Nextcloud"""
        try:
            # Try to get user info with the provided credentials
            response = self._make_request('GET', f'/users/{username}', 
                                        auth=(username, password))
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Error verifying credentials for {username}: {e}")
            return False
    
    def get_iframe_url(self, username: str, password: str) -> str:
        """Get the URL for embedding Nextcloud in iframe"""
        # For iframe embedding, we need to handle authentication properly
        # This returns the base Nextcloud URL - authentication will be handled
        # through session cookies or other methods
        return self.nextcloud_url
    
    def create_app_password(self, username: str, password: str) -> Optional[str]:
        """Create an app password for the user (recommended for API access)"""
        try:
            # Use the app password creation endpoint
            response = requests.post(
                f"{self.nextcloud_url}/ocs/v2.php/core/getapppassword",
                headers={'OCS-APIRequest': 'true'},
                auth=(username, password),
                timeout=30
            )
            
            if response.status_code == 200:
                # Parse the response to get the app password
                import xml.etree.ElementTree as ET
                root = ET.fromstring(response.text)
                app_password = root.find('.//apppassword')
                if app_password is not None:
                    return app_password.text
                    
            return None
            
        except Exception as e:
            logger.error(f"Error creating app password for {username}: {e}")
            return None 