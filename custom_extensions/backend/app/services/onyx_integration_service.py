import os
import httpx
import logging
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class OnyxIntegrationService:
    """Service to integrate with the main Onyx backend"""
    
    def __init__(self, db: Session):
        self.db = db
        self.onyx_api_base = os.getenv("ONYX_API_BASE_URL", "http://localhost:8080/api")
        self.onyx_api_key = os.getenv("ONYX_API_KEY")
    
    async def import_file(self, user_id: str, filename: str, content: bytes, source: str = "smartdrive") -> int:
        """Import a file into Onyx and return the file ID"""
        try:
            async with httpx.AsyncClient() as client:
                # Prepare file upload
                files = {
                    "files": (filename, content, "application/octet-stream")
                }
                
                data = {
                    "source": source,
                    "user_id": user_id
                }
                
                headers = self._get_auth_headers()
                
                response = await client.post(
                    f"{self.onyx_api_base}/user/file/upload",
                    files=files,
                    data=data,
                    headers=headers,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if isinstance(result, list) and len(result) > 0:
                        return result[0]["id"]  # Return first file ID
                    return result.get("id")
                else:
                    logger.error(f"Failed to import file to Onyx: {response.status_code} - {response.text}")
                    raise Exception(f"Onyx import failed: {response.status_code}")
                    
        except Exception as e:
            logger.error(f"Error importing file to Onyx: {str(e)}")
            raise
    
    async def soft_delete_file(self, file_id: int):
        """Soft delete a file in Onyx"""
        try:
            async with httpx.AsyncClient() as client:
                headers = self._get_auth_headers()
                
                response = await client.delete(
                    f"{self.onyx_api_base}/user/file/{file_id}",
                    headers=headers
                )
                
                if response.status_code not in [200, 204]:
                    logger.error(f"Failed to delete file in Onyx: {response.status_code}")
                    
        except Exception as e:
            logger.error(f"Error deleting file in Onyx: {str(e)}")
    
    async def get_available_connector_types(self) -> Dict[str, Dict[str, Any]]:
        """Get available connector types from Onyx"""
        try:
            async with httpx.AsyncClient() as client:
                headers = self._get_auth_headers()
                
                response = await client.get(
                    f"{self.onyx_api_base}/admin/connector/sources",
                    headers=headers
                )
                
                if response.status_code == 200:
                    sources = response.json()
                    # Convert to our expected format
                    return {
                        source["source"]: {
                            "display_name": source.get("display_name", source["source"].title()),
                            "source": source["source"],
                            "category": source.get("category", "other"),
                            "oauth_required": source.get("oauth_required", False)
                        }
                        for source in sources
                    }
                else:
                    logger.error(f"Failed to get connector sources: {response.status_code}")
                    return {}
                    
        except Exception as e:
            logger.error(f"Error getting connector types: {str(e)}")
            return {}

    async def create_private_connector_from_type(self, user_id: str, source: str, name: str, config: Dict[str, Any]) -> Optional[int]:
        """Create a private connector using Onyx's existing connector types"""
        try:
            async with httpx.AsyncClient() as client:
                headers = self._get_auth_headers()
                
                payload = {
                    "name": name,
                    "source": source,
                    "connector_specific_config": config,
                    "access_type": "private",  # Critical: ensure private access
                    "groups": [],  # Private connectors have no groups
                    "disabled": False
                }
                
                response = await client.post(
                    f"{self.onyx_api_base}/admin/connector",
                    json=payload,
                    headers=headers
                )
                
                if response.status_code in [200, 201]:
                    result = response.json()
                    return result.get("id")
                else:
                    logger.error(f"Failed to create Onyx connector: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error creating Onyx connector: {str(e)}")
            return None

    async def get_oauth_authorization_url(self, source: str, user_id: str, connector_id: int) -> str:
        """Get OAuth authorization URL from Onyx"""
        try:
            async with httpx.AsyncClient() as client:
                headers = self._get_auth_headers()
                
                payload = {
                    "source": source,
                    "user_id": user_id,
                    "redirect_uri": f"{self.onyx_api_base}/custom-smartdrive/oauth/callback/{connector_id}"
                }
                
                response = await client.post(
                    f"{self.onyx_api_base}/admin/connector/oauth/authorize",
                    json=payload,
                    headers=headers
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result.get("authorization_url", "")
                else:
                    logger.error(f"Failed to get OAuth URL: {response.status_code}")
                    return ""
                    
        except Exception as e:
            logger.error(f"Error getting OAuth URL: {str(e)}")
            return ""

    async def handle_oauth_callback(self, source: str, user_id: str, connector_id: int, authorization_code: str) -> bool:
        """Handle OAuth callback using Onyx's OAuth infrastructure"""
        try:
            async with httpx.AsyncClient() as client:
                headers = self._get_auth_headers()
                
                payload = {
                    "source": source,
                    "user_id": user_id,
                    "authorization_code": authorization_code,
                    "connector_id": connector_id
                }
                
                response = await client.post(
                    f"{self.onyx_api_base}/admin/connector/oauth/callback",
                    json=payload,
                    headers=headers
                )
                
                return response.status_code == 200
                
        except Exception as e:
            logger.error(f"Error handling OAuth callback: {str(e)}")
            return False

    async def create_private_connector(self, user_id: str, connector_id: int, provider: str, config: Dict[str, Any], credentials: Optional[Dict[str, Any]] = None):
        """Create a private connector in Onyx (legacy method)"""
        return await self.create_private_connector_from_type(user_id, provider, f"SmartDrive-{provider}-{connector_id}", config)
    
    async def update_private_connector(self, user_id: str, connector_id: int, config: Dict[str, Any], credentials: Optional[Dict[str, Any]] = None):
        """Update a private connector in Onyx"""
        try:
            # Find the Onyx connector by external ID
            onyx_connector_id = await self._find_onyx_connector(connector_id)
            if not onyx_connector_id:
                logger.warning(f"Onyx connector not found for external ID {connector_id}")
                return
            
            async with httpx.AsyncClient() as client:
                headers = self._get_auth_headers()
                
                payload = {
                    "connector_specific_config": config
                }
                
                if credentials:
                    payload["credentials"] = credentials
                
                response = await client.patch(
                    f"{self.onyx_api_base}/admin/connector/{onyx_connector_id}",
                    json=payload,
                    headers=headers
                )
                
                if response.status_code not in [200, 204]:
                    logger.error(f"Failed to update Onyx connector: {response.status_code} - {response.text}")
                    
        except Exception as e:
            logger.error(f"Error updating Onyx connector: {str(e)}")
    
    async def delete_private_connector(self, user_id: str, connector_id: int):
        """Delete a private connector from Onyx"""
        try:
            # Find the Onyx connector by external ID
            onyx_connector_id = await self._find_onyx_connector(connector_id)
            if not onyx_connector_id:
                logger.warning(f"Onyx connector not found for external ID {connector_id}")
                return
            
            async with httpx.AsyncClient() as client:
                headers = self._get_auth_headers()
                
                response = await client.delete(
                    f"{self.onyx_api_base}/admin/connector/{onyx_connector_id}",
                    headers=headers
                )
                
                if response.status_code not in [200, 204]:
                    logger.error(f"Failed to delete Onyx connector: {response.status_code} - {response.text}")
                    
        except Exception as e:
            logger.error(f"Error deleting Onyx connector: {str(e)}")
    
    async def sync_private_connector(self, user_id: str, connector_id: int) -> Dict[str, Any]:
        """Trigger sync for a private connector in Onyx"""
        try:
            # Find the Onyx connector by external ID
            onyx_connector_id = await self._find_onyx_connector(connector_id)
            if not onyx_connector_id:
                logger.warning(f"Onyx connector not found for external ID {connector_id}")
                return {}
            
            async with httpx.AsyncClient() as client:
                headers = self._get_auth_headers()
                
                response = await client.post(
                    f"{self.onyx_api_base}/admin/connector/{onyx_connector_id}/sync",
                    headers=headers
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Failed to sync Onyx connector: {response.status_code} - {response.text}")
                    return {}
                    
        except Exception as e:
            logger.error(f"Error syncing Onyx connector: {str(e)}")
            return {}
    
    async def _find_onyx_connector(self, external_connector_id: int) -> Optional[int]:
        """Find Onyx connector ID by external connector ID"""
        try:
            async with httpx.AsyncClient() as client:
                headers = self._get_auth_headers()
                
                response = await client.get(
                    f"{self.onyx_api_base}/admin/connector",
                    headers=headers
                )
                
                if response.status_code == 200:
                    connectors = response.json()
                    for connector in connectors:
                        # Look for connector with matching external ID in name or metadata
                        name = connector.get("name", "")
                        if f"SmartDrive-" in name and f"-{external_connector_id}" in name:
                            return connector.get("id")
                    
                return None
                
        except Exception as e:
            logger.error(f"Error finding Onyx connector: {str(e)}")
            return None
    
    def _get_auth_headers(self) -> Dict[str, str]:
        """Get authentication headers for Onyx API"""
        headers = {
            "Content-Type": "application/json"
        }
        
        if self.onyx_api_key:
            headers["Authorization"] = f"Bearer {self.onyx_api_key}"
        
        return headers 