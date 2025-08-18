from fastapi import APIRouter, HTTPException, Depends, Request, status
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import asyncio
import logging
import hashlib
import hmac
from datetime import datetime

from ..core.database import get_db
from ..core.auth import get_current_user
from ..services.smartdrive_service import SmartDriveService
from ..services.connector_service import ConnectorService
from ..models.smartdrive_models import SmartDriveAccount, SmartDriveImport, UserConnector

router = APIRouter(prefix="/api/custom-smartdrive", tags=["smartdrive"])
security = HTTPBearer()
logger = logging.getLogger(__name__)

# SmartDrive Session Management
@router.post("/session")
async def create_smartdrive_session(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initialize SmartDrive session for the current user"""
    try:
        service = SmartDriveService(db)
        await service.ensure_user_session(current_user["user_id"])
        return {"status": "success", "message": "SmartDrive session initialized"}
    except Exception as e:
        logger.error(f"Failed to initialize SmartDrive session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize SmartDrive session"
        )

# File Listing
@router.get("/list")
async def list_smartdrive_files(
    path: str = "/",
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List files and folders in the user's SmartDrive at the specified path"""
    try:
        service = SmartDriveService(db)
        files = await service.list_files(current_user["user_id"], path)
        return files
    except Exception as e:
        logger.error(f"Failed to list SmartDrive files: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list SmartDrive files"
        )

# File Import
@router.post("/import")
async def import_smartdrive_files(
    request: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Import specific files from SmartDrive to Onyx"""
    try:
        paths = request.get("paths", [])
        if not paths:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No file paths provided"
            )
        
        service = SmartDriveService(db)
        file_ids = await service.import_files(current_user["user_id"], paths)
        return {"fileIds": file_ids}
    except Exception as e:
        logger.error(f"Failed to import SmartDrive files: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to import SmartDrive files"
        )

# Import New Files
@router.post("/import-new")
async def import_new_smartdrive_files(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Import all new/updated files since last sync"""
    try:
        service = SmartDriveService(db)
        await service.import_new_files(current_user["user_id"])
        return {"status": "success", "message": "New files imported successfully"}
    except Exception as e:
        logger.error(f"Failed to import new SmartDrive files: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to import new SmartDrive files"
        )

# Webhook Handler
@router.post("/webhook")
async def handle_smartdrive_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle webhooks from Nextcloud Flow for file changes"""
    try:
        # Validate webhook signature (implement proper validation)
        body = await request.body()
        headers = request.headers
        
        # TODO: Implement proper webhook signature validation
        # webhook_secret = os.getenv("NEXTCLOUD_WEBHOOK_SECRET")
        # if not validate_webhook_signature(body, headers, webhook_secret):
        #     raise HTTPException(status_code=401, detail="Invalid webhook signature")
        
        data = await request.json()
        service = SmartDriveService(db)
        await service.handle_webhook(data)
        
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Failed to handle SmartDrive webhook: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to handle webhook"
        )

# Connector Management
@router.get("/connectors/")
async def list_user_connectors(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all connectors owned by the current user"""
    try:
        service = ConnectorService(db)
        connectors = await service.list_user_connectors(current_user["user_id"])
        return connectors
    except Exception as e:
        logger.error(f"Failed to list user connectors: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list connectors"
        )

@router.post("/connectors/")
async def create_user_connector(
    request: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new connector for the current user"""
    try:
        provider = request.get("provider")
        config = request.get("config", {})
        
        if not provider:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Provider is required"
            )
        
        service = ConnectorService(db)
        connector = await service.create_user_connector(
            current_user["user_id"], provider, config
        )
        return connector
    except Exception as e:
        logger.error(f"Failed to create user connector: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create connector"
        )

@router.put("/connectors/{connector_id}")
async def update_user_connector(
    connector_id: int,
    request: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a connector owned by the current user"""
    try:
        config = request.get("config", {})
        
        service = ConnectorService(db)
        connector = await service.update_user_connector(
            current_user["user_id"], connector_id, config
        )
        return connector
    except Exception as e:
        logger.error(f"Failed to update user connector: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update connector"
        )

@router.delete("/connectors/{connector_id}")
async def delete_user_connector(
    connector_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a connector owned by the current user"""
    try:
        service = ConnectorService(db)
        await service.delete_user_connector(current_user["user_id"], connector_id)
        return {"status": "success", "message": "Connector deleted successfully"}
    except Exception as e:
        logger.error(f"Failed to delete user connector: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete connector"
        )

@router.post("/connectors/{connector_id}/sync")
async def sync_user_connector(
    connector_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Trigger a sync job for the specified connector"""
    try:
        service = ConnectorService(db)
        await service.sync_user_connector(current_user["user_id"], connector_id)
        return {"status": "success", "message": "Connector sync started"}
    except Exception as e:
        logger.error(f"Failed to sync user connector: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to sync connector"
        )

# OAuth Flow Endpoints
@router.get("/connectors/{connector_id}/oauth/authorize")
async def initiate_oauth_flow(
    connector_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initiate OAuth flow for a connector"""
    try:
        service = ConnectorService(db)
        auth_url = await service.get_oauth_authorization_url(current_user["user_id"], connector_id)
        
        if not auth_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OAuth not supported for this connector or connector not found"
            )
        
        return {"authorization_url": auth_url}
    except Exception as e:
        logger.error(f"Failed to initiate OAuth flow: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initiate OAuth flow"
        )

@router.post("/oauth/callback/{connector_id}")
async def handle_oauth_callback(
    connector_id: int,
    request: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Handle OAuth callback for a connector"""
    try:
        authorization_code = request.get("code")
        if not authorization_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Authorization code is required"
            )
        
        service = ConnectorService(db)
        success = await service.handle_oauth_callback(
            current_user["user_id"], connector_id, authorization_code
        )
        
        if success:
            return {"status": "success", "message": "OAuth authorization completed"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OAuth authorization failed"
            )
    except Exception as e:
        logger.error(f"Failed to handle OAuth callback: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to handle OAuth callback"
        )

# Available Connector Types
@router.get("/connector-types")
async def get_available_connector_types(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get available connector types from Onyx"""
    try:
        service = ConnectorService(db)
        connector_types = await service.get_available_connector_types()
        return connector_types
    except Exception as e:
        logger.error(f"Failed to get connector types: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get connector types"
        )

def validate_webhook_signature(body: bytes, headers: dict, secret: str) -> bool:
    """Validate webhook signature from Nextcloud"""
    try:
        signature = headers.get("x-nc-signature")
        if not signature:
            return False
        
        expected_signature = hmac.new(
            secret.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(signature, expected_signature)
    except Exception:
        return False 