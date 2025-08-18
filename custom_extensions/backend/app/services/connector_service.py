import os
import json
import asyncio
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_

from ..models.smartdrive_models import UserConnector, ConnectorSyncJob
from ..core.encryption import encrypt_data, decrypt_data
from .onyx_integration_service import OnyxIntegrationService

logger = logging.getLogger(__name__)

class ConnectorService:
    def __init__(self, db: Session):
        self.db = db
        self.onyx_service = OnyxIntegrationService(db)
    
    async def list_user_connectors(self, user_id: str) -> List[Dict[str, Any]]:
        """List all connectors owned by the current user"""
        connectors = self.db.query(UserConnector).filter(
            UserConnector.user_id == user_id
        ).all()
        
        result = []
        for connector in connectors:
            result.append({
                "id": connector.id,
                "name": connector.name,
                "provider": connector.provider,
                "status": connector.status,
                "lastSync": connector.last_sync_at.isoformat() if connector.last_sync_at else None,
                "documentsCount": connector.documents_count,
                "config": self._sanitize_config(connector.config),
                "created_at": connector.created_at.isoformat()
            })
        
        return result
    
    async def create_user_connector(self, user_id: str, provider: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new connector for the current user using existing Onyx connector infrastructure"""
        
        # Validate provider against Onyx's available connectors
        available_connectors = await self._get_available_onyx_connectors()
        if provider not in available_connectors:
            raise ValueError(f"Provider {provider} not available. Available: {list(available_connectors.keys())}")
        
        # Extract name from config
        name = config.get("name", f"{provider.title()} Connection")
        
        # Create user connector record
        connector = UserConnector(
            user_id=user_id,
            name=name,
            provider=provider,
            config=config,
            status="inactive"
        )
        
        self.db.add(connector)
        self.db.commit()
        self.db.refresh(connector)
        
        # Create corresponding Onyx connector with private access
        onyx_connector_id = await self._create_private_onyx_connector(connector, available_connectors[provider])
        
        if onyx_connector_id:
            connector.status = "active"
            # Store the Onyx connector ID in config for future reference
            connector.config["onyx_connector_id"] = onyx_connector_id
            self.db.commit()
        
        return {
            "id": connector.id,
            "name": connector.name,
            "provider": connector.provider,
            "status": connector.status,
            "documentsCount": connector.documents_count,
            "config": self._sanitize_config(connector.config),
            "created_at": connector.created_at.isoformat()
        }
    
    async def update_user_connector(self, user_id: str, connector_id: int, config: Dict[str, Any]) -> Dict[str, Any]:
        """Update a connector owned by the current user"""
        connector = self.db.query(UserConnector).filter(
            and_(
                UserConnector.id == connector_id,
                UserConnector.user_id == user_id
            )
        ).first()
        
        if not connector:
            raise ValueError("Connector not found")
        
        # Update configuration
        connector.config.update(config)
        connector.updated_at = datetime.utcnow()
        
        # Update name if provided
        if "name" in config:
            connector.name = config["name"]
        
        # Handle OAuth re-authentication if needed
        if self._provider_requires_oauth(connector.provider) and "reauth" in config:
            oauth_credentials = await self._handle_oauth_flow(connector.provider, connector.config)
            if oauth_credentials:
                connector.encrypted_credentials = encrypt_data(json.dumps(oauth_credentials))
                connector.status = "active"
        
        self.db.commit()
        self.db.refresh(connector)
        
        # Update Onyx connector
        await self._update_onyx_connector(connector)
        
        return {
            "id": connector.id,
            "name": connector.name,
            "provider": connector.provider,
            "status": connector.status,
            "documentsCount": connector.documents_count,
            "config": self._sanitize_config(connector.config),
            "created_at": connector.created_at.isoformat()
        }
    
    async def delete_user_connector(self, user_id: str, connector_id: int):
        """Delete a connector owned by the current user"""
        connector = self.db.query(UserConnector).filter(
            and_(
                UserConnector.id == connector_id,
                UserConnector.user_id == user_id
            )
        ).first()
        
        if not connector:
            raise ValueError("Connector not found")
        
        # Delete from Onyx first
        await self._delete_onyx_connector(connector)
        
        # Delete sync jobs
        self.db.query(ConnectorSyncJob).filter(
            ConnectorSyncJob.connector_id == connector_id
        ).delete()
        
        # Delete the connector
        self.db.delete(connector)
        self.db.commit()
    
    async def sync_user_connector(self, user_id: str, connector_id: int):
        """Trigger a sync job for the specified connector"""
        connector = self.db.query(UserConnector).filter(
            and_(
                UserConnector.id == connector_id,
                UserConnector.user_id == user_id
            )
        ).first()
        
        if not connector:
            raise ValueError("Connector not found")
        
        # Create sync job
        sync_job = ConnectorSyncJob(
            connector_id=connector_id,
            user_id=user_id,
            status="pending"
        )
        self.db.add(sync_job)
        self.db.commit()
        self.db.refresh(sync_job)
        
        # Trigger background sync
        asyncio.create_task(self._run_sync_job(sync_job.id))
    
    async def _get_available_onyx_connectors(self) -> Dict[str, Dict[str, Any]]:
        """Get available connector types from Onyx"""
        try:
            # Get connector types from Onyx
            connector_types = await self.onyx_service.get_available_connector_types()
            return connector_types
        except Exception as e:
            logger.error(f"Failed to get available connector types: {str(e)}")
            # Fallback to known connectors
            return {
                "google_drive": {"display_name": "Google Drive", "source": "google_drive"},
                "notion": {"display_name": "Notion", "source": "notion"},
                "slack": {"display_name": "Slack", "source": "slack"},
                "confluence": {"display_name": "Confluence", "source": "confluence"},
                "sharepoint": {"display_name": "SharePoint", "source": "sharepoint"},
                "dropbox": {"display_name": "Dropbox", "source": "dropbox"},
            }
    
    async def get_available_connector_types(self) -> Dict[str, Dict[str, Any]]:
        """Get available connector types (public method for API)"""
        return await self._get_available_onyx_connectors()
    
    async def get_oauth_authorization_url(self, user_id: str, connector_id: int) -> str:
        """Get OAuth authorization URL for a connector"""
        connector = self.db.query(UserConnector).filter(
            and_(
                UserConnector.id == connector_id,
                UserConnector.user_id == user_id
            )
        ).first()
        
        if not connector:
            raise ValueError("Connector not found")
        
        available_connectors = await self._get_available_onyx_connectors()
        connector_info = available_connectors.get(connector.provider)
        
        if not connector_info:
            raise ValueError("Connector type not available")
        
        return await self._initiate_oauth_flow(connector, connector_info)
    
    async def handle_oauth_callback(self, user_id: str, connector_id: int, authorization_code: str) -> bool:
        """Handle OAuth callback for a connector"""
        connector = self.db.query(UserConnector).filter(
            and_(
                UserConnector.id == connector_id,
                UserConnector.user_id == user_id
            )
        ).first()
        
        if not connector:
            raise ValueError("Connector not found")
        
        return await self._handle_oauth_callback(connector, authorization_code)
    
    def _sanitize_config(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Remove sensitive information from config before returning to client"""
        sanitized = config.copy()
        
        # Remove sensitive fields
        sensitive_fields = ["password", "secret", "token", "key", "credential"]
        for field in list(sanitized.keys()):
            if any(sensitive in field.lower() for sensitive in sensitive_fields):
                sanitized[field] = "***"
        
        return sanitized
    
    async def _create_private_onyx_connector(self, connector: UserConnector, connector_info: Dict[str, Any]) -> Optional[int]:
        """Create a private connector in Onyx using existing connector infrastructure"""
        try:
            # Use Onyx's connector creation with private access
            onyx_connector_id = await self.onyx_service.create_private_connector_from_type(
                user_id=connector.user_id,
                source=connector_info.get("source", connector.provider),
                name=f"SmartDrive-{connector.name}",
                config=connector.config
            )
            return onyx_connector_id
        except Exception as e:
            logger.error(f"Failed to create private Onyx connector: {str(e)}")
            return None
    
    async def _initiate_oauth_flow(self, connector: UserConnector, connector_info: Dict[str, Any]) -> str:
        """Initiate OAuth flow for the connector using Onyx's OAuth infrastructure"""
        try:
            # Use Onyx's OAuth system to generate authorization URL
            auth_url = await self.onyx_service.get_oauth_authorization_url(
                source=connector_info.get("source", connector.provider),
                user_id=connector.user_id,
                connector_id=connector.id
            )
            return auth_url
        except Exception as e:
            logger.error(f"Failed to initiate OAuth flow: {str(e)}")
            return ""
    
    async def _handle_oauth_callback(self, connector: UserConnector, authorization_code: str) -> bool:
        """Handle OAuth callback using Onyx's OAuth infrastructure"""
        try:
            # Use Onyx's OAuth system to exchange code for tokens
            success = await self.onyx_service.handle_oauth_callback(
                source=connector.provider,
                user_id=connector.user_id,
                connector_id=connector.id,
                authorization_code=authorization_code
            )
            
            if success:
                connector.status = "active"
                self.db.commit()
            
            return success
        except Exception as e:
            logger.error(f"Failed to handle OAuth callback: {str(e)}")
            return False
    
    async def _create_onyx_connector(self, connector: UserConnector):
        """Create corresponding connector in Onyx with AccessType.PRIVATE"""
        try:
            await self.onyx_service.create_private_connector(
                user_id=connector.user_id,
                connector_id=connector.id,
                provider=connector.provider,
                config=connector.config,
                credentials=self._decrypt_credentials(connector.encrypted_credentials) if connector.encrypted_credentials else None
            )
        except Exception as e:
            logger.error(f"Failed to create Onyx connector: {str(e)}")
    
    async def _update_onyx_connector(self, connector: UserConnector):
        """Update corresponding connector in Onyx"""
        try:
            await self.onyx_service.update_private_connector(
                user_id=connector.user_id,
                connector_id=connector.id,
                config=connector.config,
                credentials=self._decrypt_credentials(connector.encrypted_credentials) if connector.encrypted_credentials else None
            )
        except Exception as e:
            logger.error(f"Failed to update Onyx connector: {str(e)}")
    
    async def _delete_onyx_connector(self, connector: UserConnector):
        """Delete corresponding connector from Onyx"""
        try:
            await self.onyx_service.delete_private_connector(
                user_id=connector.user_id,
                connector_id=connector.id
            )
        except Exception as e:
            logger.error(f"Failed to delete Onyx connector: {str(e)}")
    
    def _decrypt_credentials(self, encrypted_credentials: str) -> Optional[Dict[str, Any]]:
        """Decrypt and parse credentials"""
        try:
            if encrypted_credentials:
                decrypted = decrypt_data(encrypted_credentials)
                return json.loads(decrypted)
            return None
        except Exception as e:
            logger.error(f"Failed to decrypt credentials: {str(e)}")
            return None
    
    async def _run_sync_job(self, sync_job_id: int):
        """Run a sync job in the background"""
        try:
            sync_job = self.db.query(ConnectorSyncJob).filter(
                ConnectorSyncJob.id == sync_job_id
            ).first()
            
            if not sync_job:
                return
            
            connector = sync_job.connector
            if not connector:
                return
            
            # Update job status
            sync_job.status = "running"
            sync_job.started_at = datetime.utcnow()
            self.db.commit()
            
            # Trigger Onyx connector sync
            result = await self.onyx_service.sync_private_connector(
                user_id=connector.user_id,
                connector_id=connector.id
            )
            
            # Update job completion
            sync_job.status = "completed"
            sync_job.completed_at = datetime.utcnow()
            sync_job.files_processed = result.get("files_processed", 0)
            sync_job.files_imported = result.get("files_imported", 0)
            sync_job.files_updated = result.get("files_updated", 0)
            
            # Update connector status
            connector.status = "active"
            connector.last_sync_at = datetime.utcnow()
            connector.documents_count = result.get("total_documents", connector.documents_count)
            
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Sync job {sync_job_id} failed: {str(e)}")
            
            # Update job with error
            sync_job.status = "failed"
            sync_job.completed_at = datetime.utcnow()
            sync_job.error_message = str(e)
            
            # Update connector status
            connector.status = "error"
            connector.last_error = str(e)
            
            self.db.commit() 