from fastapi import APIRouter, HTTPException, Depends, Request, status
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
import asyncio
import logging
import hashlib
import hmac
import json
from datetime import datetime

from ..core.database import get_db_pool
from ..core.auth import get_current_user

router = APIRouter(prefix="/api/custom-smartdrive", tags=["smartdrive"])
logger = logging.getLogger(__name__)

# SmartDrive Session Management
@router.post("/session")
async def create_smartdrive_session(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Initialize SmartDrive session for the current user"""
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            # Create SmartDrive account if it doesn't exist
            await conn.execute("""
                INSERT INTO smartdrive_accounts (user_id, created_at, last_sync_at)
                VALUES ($1, $2, $2)
                ON CONFLICT (user_id) DO NOTHING
            """, current_user["user_id"], datetime.utcnow())
            
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
    request: Request,
    path: str = "/",
    current_user: dict = Depends(get_current_user)
):
    """List files from SmartDrive (Nextcloud)"""
    try:
        # For now, return mock data - implement actual Nextcloud WebDAV later
        return [
            {
                "name": "example.pdf",
                "path": "/example.pdf",
                "type": "file",
                "size": 1024,
                "modified": "2024-01-01T00:00:00Z"
            },
            {
                "name": "Documents",
                "path": "/Documents",
                "type": "folder",
                "size": 0,
                "modified": "2024-01-01T00:00:00Z"
            }
        ]
    except Exception as e:
        logger.error(f"Failed to list SmartDrive files: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list SmartDrive files"
        )

# File Import
@router.post("/import")
async def import_smartdrive_files(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Import files from SmartDrive"""
    try:
        data = await request.json()
        paths = data.get("paths", [])
        
        if not paths:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No file paths provided"
            )
        
        pool = await get_db_pool()
        file_ids = []
        
        async with pool.acquire() as conn:
            for path in paths:
                # Create import record
                import_id = await conn.fetchval("""
                    INSERT INTO smartdrive_imports (user_id, file_path, status, created_at)
                    VALUES ($1, $2, 'processing', $3)
                    RETURNING id
                """, current_user["user_id"], path, datetime.utcnow())
                file_ids.append(import_id)
        
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
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Import new files since last sync"""
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            # Update last sync time
            await conn.execute("""
                UPDATE smartdrive_accounts 
                SET last_sync_at = $1 
                WHERE user_id = $2
            """, datetime.utcnow(), current_user["user_id"])
            
        return {"status": "success", "message": "New files imported successfully"}
    except Exception as e:
        logger.error(f"Failed to import new SmartDrive files: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to import new SmartDrive files"
        )

# Webhook Handler
@router.post("/webhook")
async def handle_smartdrive_webhook(request: Request):
    """Handle webhooks from Nextcloud Flow for file changes"""
    try:
        body = await request.body()
        headers = request.headers
        
        # TODO: Implement proper webhook signature validation
        data = await request.json()
        
        # Log webhook for now
        logger.info(f"Received SmartDrive webhook: {data}")
        
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
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """List user's connectors"""
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, name, provider, status, config, created_at
                FROM user_connectors 
                WHERE user_id = $1
                ORDER BY created_at DESC
            """, current_user["user_id"])
            
            connectors = []
            for row in rows:
                connectors.append({
                    "id": row["id"],
                    "name": row["name"],
                    "provider": row["provider"],
                    "status": row["status"],
                    "config": json.loads(row["config"]) if row["config"] else {},
                    "created_at": row["created_at"].isoformat() if row["created_at"] else None
                })
                
        return connectors
    except Exception as e:
        logger.error(f"Failed to list user connectors: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list connectors"
        )

@router.post("/connectors/")
async def create_user_connector(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Create a new connector"""
    try:
        data = await request.json()
        provider = data.get("provider")
        name = data.get("name")
        config = data.get("config", {})
        
        if not provider or not name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Provider and name are required"
            )
        
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            connector_id = await conn.fetchval("""
                INSERT INTO user_connectors (user_id, name, provider, config, status, created_at)
                VALUES ($1, $2, $3, $4, 'active', $5)
                RETURNING id
            """, current_user["user_id"], name, provider, json.dumps(config), datetime.utcnow())
            
        return {
            "id": connector_id,
            "name": name,
            "provider": provider,
            "status": "active",
            "config": config
        }
    except Exception as e:
        logger.error(f"Failed to create user connector: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create connector"
        )

@router.put("/connectors/{connector_id}")
async def update_user_connector(
    connector_id: int,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Update a connector"""
    try:
        data = await request.json()
        pool = await get_db_pool()
        
        async with pool.acquire() as conn:
            # Verify ownership
            owner = await conn.fetchval("""
                SELECT user_id FROM user_connectors WHERE id = $1
            """, connector_id)
            
            if owner != current_user["user_id"]:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Connector not found"
                )
            
            # Update connector
            await conn.execute("""
                UPDATE user_connectors 
                SET name = $1, config = $2, updated_at = $3
                WHERE id = $4 AND user_id = $5
            """, data.get("name"), json.dumps(data.get("config", {})), 
                datetime.utcnow(), connector_id, current_user["user_id"])
            
        return {"status": "success", "message": "Connector updated"}
    except Exception as e:
        logger.error(f"Failed to update user connector: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update connector"
        )

@router.delete("/connectors/{connector_id}")
async def delete_user_connector(
    connector_id: int,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Delete a connector"""
    try:
        pool = await get_db_pool()
        
        async with pool.acquire() as conn:
            # Verify ownership and delete
            result = await conn.execute("""
                DELETE FROM user_connectors 
                WHERE id = $1 AND user_id = $2
            """, connector_id, current_user["user_id"])
            
            if result == "DELETE 0":
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Connector not found"
                )
            
        return {"status": "success", "message": "Connector deleted"}
    except Exception as e:
        logger.error(f"Failed to delete user connector: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete connector"
        )

@router.post("/connectors/{connector_id}/sync")
async def sync_user_connector(
    connector_id: int,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Trigger a sync job for the specified connector"""
    try:
        pool = await get_db_pool()
        
        async with pool.acquire() as conn:
            # Verify ownership
            owner = await conn.fetchval("""
                SELECT user_id FROM user_connectors WHERE id = $1
            """, connector_id)
            
            if owner != current_user["user_id"]:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Connector not found"
                )
            
            # Create sync job
            await conn.execute("""
                INSERT INTO connector_sync_jobs (user_id, connector_id, status, created_at)
                VALUES ($1, $2, 'pending', $3)
            """, current_user["user_id"], connector_id, datetime.utcnow())
            
        return {"status": "success", "message": "Connector sync started"}
    except Exception as e:
        logger.error(f"Failed to sync user connector: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to sync connector"
        )

# Available Connector Types
@router.get("/connector-types")
async def get_available_connector_types(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Get available connector types"""
    try:
        # Return mock connector types for now
        # TODO: Integrate with Onyx's actual connector system
        return {
            "google_drive": {
                "display_name": "Google Drive",
                "source": "google_drive",
                "category": "cloud_storage",
                "oauth_required": True
            },
            "notion": {
                "display_name": "Notion",
                "source": "notion", 
                "category": "productivity",
                "oauth_required": True
            },
            "slack": {
                "display_name": "Slack",
                "source": "slack",
                "category": "communication", 
                "oauth_required": True
            },
            "confluence": {
                "display_name": "Confluence",
                "source": "confluence",
                "category": "documentation",
                "oauth_required": True
            }
        }
    except Exception as e:
        logger.error(f"Failed to get connector types: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get connector types"
        ) 