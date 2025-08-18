import os
import asyncio
import httpx
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_

from ..models.smartdrive_models import SmartDriveAccount, SmartDriveImport, SmartDriveWebhookLog
from ..core.config import settings
from .onyx_integration_service import OnyxIntegrationService

logger = logging.getLogger(__name__)

class SmartDriveService:
    def __init__(self, db: Session):
        self.db = db
        self.onyx_service = OnyxIntegrationService(db)
        self.nextcloud_base_url = os.getenv("NEXTCLOUD_BASE_URL", os.getenv("NEXTCLOUD_EXTERNAL_URL"))
        self.nextcloud_admin_user = os.getenv("NEXTCLOUD_ADMIN_USER", "admin")
        self.nextcloud_admin_password = os.getenv("NEXTCLOUD_ADMIN_PASSWORD")
        
        if not self.nextcloud_base_url:
            raise ValueError("NEXTCLOUD_BASE_URL or NEXTCLOUD_EXTERNAL_URL must be set")
    
    async def ensure_user_session(self, user_id: str) -> SmartDriveAccount:
        """Ensure the user has a SmartDrive account and session"""
        account = self.db.query(SmartDriveAccount).filter(
            SmartDriveAccount.user_id == user_id
        ).first()
        
        if not account:
            # Create new account for user
            account = SmartDriveAccount(
                user_id=user_id,
                nextcloud_user_id=f"onyx_user_{user_id}",
                is_active=True
            )
            self.db.add(account)
            self.db.commit()
            self.db.refresh(account)
            
            # Create corresponding Nextcloud user if needed
            await self._create_nextcloud_user(account.nextcloud_user_id, user_id)
        
        return account
    
    async def list_files(self, user_id: str, path: str = "/") -> List[Dict[str, Any]]:
        """List files and folders in the user's SmartDrive at the specified path"""
        account = await self.ensure_user_session(user_id)
        
        try:
            async with httpx.AsyncClient() as client:
                # Use WebDAV API to list files
                webdav_url = f"{self.nextcloud_base_url}/remote.php/dav/files/{account.nextcloud_user_id}{path}"
                
                response = await client.request(
                    "PROPFIND",
                    webdav_url,
                    auth=(account.nextcloud_user_id, self._get_user_password(user_id)),
                    headers={
                        "Depth": "1",
                        "Content-Type": "application/xml"
                    },
                    content="""<?xml version="1.0"?>
                    <d:propfind xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.org/ns">
                        <d:prop>
                            <d:displayname />
                            <d:getcontentlength />
                            <d:getcontenttype />
                            <d:getlastmodified />
                            <d:resourcetype />
                            <oc:size />
                            <oc:fileid />
                        </d:prop>
                    </d:propfind>"""
                )
                
                if response.status_code == 207:  # Multi-status
                    return self._parse_webdav_response(response.text, path)
                else:
                    logger.error(f"Failed to list files: {response.status_code} - {response.text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error listing SmartDrive files: {str(e)}")
            raise
    
    async def import_files(self, user_id: str, file_paths: List[str]) -> List[int]:
        """Import specific files from SmartDrive to Onyx"""
        account = await self.ensure_user_session(user_id)
        imported_file_ids = []
        
        for file_path in file_paths:
            try:
                # Check if file is already imported
                existing_import = self.db.query(SmartDriveImport).filter(
                    and_(
                        SmartDriveImport.account_id == account.id,
                        SmartDriveImport.smartdrive_file_path == file_path,
                        SmartDriveImport.is_deleted == False
                    )
                ).first()
                
                if existing_import:
                    # File already imported, check if it needs updating
                    if await self._should_update_file(existing_import):
                        onyx_file_id = await self._update_file_in_onyx(existing_import, user_id)
                        imported_file_ids.append(onyx_file_id)
                    else:
                        imported_file_ids.append(existing_import.onyx_file_id)
                else:
                    # Import new file
                    onyx_file_id = await self._import_new_file(account, file_path, user_id)
                    if onyx_file_id:
                        imported_file_ids.append(onyx_file_id)
                        
            except Exception as e:
                logger.error(f"Failed to import file {file_path}: {str(e)}")
                continue
        
        return imported_file_ids
    
    async def import_new_files(self, user_id: str):
        """Import all new/updated files since last sync"""
        account = await self.ensure_user_session(user_id)
        
        try:
            # Get list of all files in user's drive
            all_files = await self._get_all_files_recursive(user_id, "/")
            
            for file_info in all_files:
                try:
                    file_path = file_info["path"]
                    
                    # Check if file exists in imports
                    existing_import = self.db.query(SmartDriveImport).filter(
                        and_(
                            SmartDriveImport.account_id == account.id,
                            SmartDriveImport.smartdrive_file_path == file_path,
                            SmartDriveImport.is_deleted == False
                        )
                    ).first()
                    
                    if not existing_import:
                        # New file, import it
                        await self._import_new_file(account, file_path, user_id)
                    elif self._file_needs_update(existing_import, file_info):
                        # File updated, reimport
                        await self._update_file_in_onyx(existing_import, user_id)
                        
                except Exception as e:
                    logger.error(f"Failed to process file {file_info.get('path', 'unknown')}: {str(e)}")
                    continue
            
            # Update last sync timestamp
            account.last_sync_timestamp = datetime.utcnow()
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Failed to import new files: {str(e)}")
            raise
    
    async def handle_webhook(self, webhook_data: Dict[str, Any]):
        """Handle webhook events from Nextcloud Flow"""
        try:
            # Log webhook for debugging
            webhook_log = SmartDriveWebhookLog(
                event_type=webhook_data.get("event", "unknown"),
                file_path=webhook_data.get("file_path", ""),
                file_id=webhook_data.get("file_id"),
                raw_payload=webhook_data
            )
            self.db.add(webhook_log)
            
            # Process the webhook based on event type
            event_type = webhook_data.get("event")
            file_path = webhook_data.get("file_path")
            user_id = webhook_data.get("user_id")
            
            if not user_id or not file_path:
                logger.warning("Webhook missing required fields")
                return
            
            account = self.db.query(SmartDriveAccount).filter(
                SmartDriveAccount.user_id == user_id
            ).first()
            
            if not account:
                logger.warning(f"No SmartDrive account found for user {user_id}")
                return
            
            if event_type in ["file_created", "file_updated"]:
                await self._handle_file_change(account, file_path, user_id)
            elif event_type == "file_deleted":
                await self._handle_file_deletion(account, file_path)
            
            webhook_log.processed = True
            webhook_log.processed_at = datetime.utcnow()
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Failed to handle webhook: {str(e)}")
            webhook_log.error_message = str(e)
            self.db.commit()
            raise
    
    async def _create_nextcloud_user(self, nextcloud_user_id: str, user_id: str):
        """Create a Nextcloud user for the Onyx user"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.nextcloud_base_url}/ocs/v1.php/cloud/users",
                    auth=(self.nextcloud_admin_user, self.nextcloud_admin_password),
                    headers={"OCS-APIRequest": "true"},
                    data={
                        "userid": nextcloud_user_id,
                        "password": self._generate_user_password(user_id),
                        "displayName": f"Onyx User {user_id}"
                    }
                )
                
                if response.status_code not in [200, 409]:  # 409 = user already exists
                    logger.error(f"Failed to create Nextcloud user: {response.status_code} - {response.text}")
                    
        except Exception as e:
            logger.error(f"Error creating Nextcloud user: {str(e)}")
    
    def _get_user_password(self, user_id: str) -> str:
        """Get or generate password for Nextcloud user"""
        # In production, this should be stored securely and encrypted
        return f"onyx_password_{user_id}_{os.getenv('NEXTCLOUD_USER_SALT', 'default')}"
    
    def _generate_user_password(self, user_id: str) -> str:
        """Generate password for new Nextcloud user"""
        return self._get_user_password(user_id)
    
    def _parse_webdav_response(self, xml_response: str, base_path: str) -> List[Dict[str, Any]]:
        """Parse WebDAV PROPFIND response to extract file information"""
        # Simplified XML parsing - in production, use proper XML parser
        files = []
        try:
            import xml.etree.ElementTree as ET
            root = ET.fromstring(xml_response)
            
            for response in root.findall(".//{DAV:}response"):
                href = response.find(".//{DAV:}href")
                if href is None:
                    continue
                
                path = href.text
                if path.endswith("/smartdrive/remote.php/dav/files/"):
                    continue  # Skip root
                
                props = response.find(".//{DAV:}propstat/{DAV:}prop")
                if props is None:
                    continue
                
                name_elem = props.find(".//{DAV:}displayname")
                size_elem = props.find(".//{DAV:}getcontentlength")
                type_elem = props.find(".//{DAV:}getcontenttype")
                modified_elem = props.find(".//{DAV:}getlastmodified")
                resource_type = props.find(".//{DAV:}resourcetype")
                
                is_directory = resource_type.find(".//{DAV:}collection") is not None
                
                file_info = {
                    "name": name_elem.text if name_elem is not None else os.path.basename(path),
                    "path": path,
                    "type": "folder" if is_directory else "file",
                    "size": int(size_elem.text) if size_elem is not None and size_elem.text else 0,
                    "modified": modified_elem.text if modified_elem is not None else None,
                    "mime_type": type_elem.text if type_elem is not None else None
                }
                
                files.append(file_info)
                
        except Exception as e:
            logger.error(f"Error parsing WebDAV response: {str(e)}")
        
        return files
    
    async def _get_all_files_recursive(self, user_id: str, path: str) -> List[Dict[str, Any]]:
        """Recursively get all files in the user's drive"""
        all_files = []
        
        files = await self.list_files(user_id, path)
        for file_info in files:
            if file_info["type"] == "folder":
                # Recursively get files from subdirectory
                subfiles = await self._get_all_files_recursive(user_id, file_info["path"])
                all_files.extend(subfiles)
            else:
                all_files.append(file_info)
        
        return all_files
    
    async def _import_new_file(self, account: SmartDriveAccount, file_path: str, user_id: str) -> Optional[int]:
        """Import a new file from SmartDrive to Onyx"""
        try:
            # Download file content
            file_content = await self._download_file(account, file_path)
            if not file_content:
                return None
            
            # Import to Onyx
            onyx_file_id = await self.onyx_service.import_file(
                user_id=user_id,
                filename=os.path.basename(file_path),
                content=file_content,
                source="smartdrive"
            )
            
            # Create import record
            import_record = SmartDriveImport(
                account_id=account.id,
                smartdrive_file_id=file_path,  # Using path as ID for now
                smartdrive_file_path=file_path,
                onyx_file_id=onyx_file_id,
                imported_at=datetime.utcnow()
            )
            self.db.add(import_record)
            self.db.commit()
            
            return onyx_file_id
            
        except Exception as e:
            logger.error(f"Failed to import new file {file_path}: {str(e)}")
            return None
    
    async def _download_file(self, account: SmartDriveAccount, file_path: str) -> Optional[bytes]:
        """Download file content from Nextcloud"""
        try:
            async with httpx.AsyncClient() as client:
                download_url = f"{self.nextcloud_base_url}/remote.php/dav/files/{account.nextcloud_user_id}{file_path}"
                
                response = await client.get(
                    download_url,
                    auth=(account.nextcloud_user_id, self._get_user_password(account.user_id))
                )
                
                if response.status_code == 200:
                    return response.content
                else:
                    logger.error(f"Failed to download file: {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error downloading file {file_path}: {str(e)}")
            return None
    
    async def _should_update_file(self, import_record: SmartDriveImport) -> bool:
        """Check if an imported file needs to be updated"""
        # Implement file change detection logic here
        # Could use ETags, modification time, checksums, etc.
        return False  # Simplified for now
    
    async def _update_file_in_onyx(self, import_record: SmartDriveImport, user_id: str) -> int:
        """Update an existing file in Onyx"""
        # Implement file update logic
        return import_record.onyx_file_id
    
    def _file_needs_update(self, import_record: SmartDriveImport, file_info: Dict[str, Any]) -> bool:
        """Check if a file needs to be updated based on file info"""
        # Implement comparison logic
        return False
    
    async def _handle_file_change(self, account: SmartDriveAccount, file_path: str, user_id: str):
        """Handle file creation/update webhook"""
        await self._import_new_file(account, file_path, user_id)
    
    async def _handle_file_deletion(self, account: SmartDriveAccount, file_path: str):
        """Handle file deletion webhook"""
        # Mark file as deleted in import records
        import_record = self.db.query(SmartDriveImport).filter(
            and_(
                SmartDriveImport.account_id == account.id,
                SmartDriveImport.smartdrive_file_path == file_path
            )
        ).first()
        
        if import_record:
            import_record.is_deleted = True
            self.db.commit()
            
            # Optionally, soft-delete in Onyx as well
            await self.onyx_service.soft_delete_file(import_record.onyx_file_id) 