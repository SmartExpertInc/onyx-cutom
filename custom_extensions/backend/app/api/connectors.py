from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Any, Dict, Optional
import httpx
import asyncio
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/connectors", tags=["connectors"])

async def get_main_app_session(request: Request):
    """Get session cookies to authenticate with main Onyx app"""
    session_cookie = request.cookies.get('session')
    csrf_token = request.cookies.get('csrftoken')
    
    headers = {}
    if session_cookie:
        headers['Cookie'] = f'session={session_cookie}'
    if csrf_token:
        headers['X-CSRFToken'] = csrf_token
    
    return headers

@router.post("/create")
async def create_connector(
    request: Request,
    connector_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """
    Create a private connector for the current user.
    This allows non-admin users to create connectors for Smart Drive.
    """
    try:
        # Get the main app domain (remove /custom-projects-ui path)
        host = request.headers.get('host', 'localhost')
        protocol = 'https' if request.headers.get('x-forwarded-proto') == 'https' else 'http'
        main_app_url = f"{protocol}://{host}"
        
        # Get authentication headers from the request
        auth_headers = await get_main_app_session(request)
        auth_headers['Content-Type'] = 'application/json'
        auth_headers['Accept'] = 'application/json'
        
        # Extract connector configuration
        source = connector_data.get('source')
        name = connector_data.get('name', f'Smart Drive {source}')
        connector_specific_config = connector_data.get('connector_specific_config', {})
        
        if not source:
            raise HTTPException(status_code=400, detail="Connector source is required")
        
        # Create the connector payload
        connector_payload = {
            "name": name,
            "source": source,
            "input_type": "poll",
            "connector_specific_config": connector_specific_config,
            "refresh_freq": 3600,  # 1 hour
            "prune_freq": 86400,   # 1 day
            "indexing_start": None
        }
        
        # First, create the connector
        async with httpx.AsyncClient(timeout=30.0) as client:
            connector_response = await client.post(
                f"{main_app_url}/api/manage/admin/connector",
                headers=auth_headers,
                json=connector_payload
            )
            
            if not connector_response.is_success:
                logger.error(f"Failed to create connector: {connector_response.text}")
                raise HTTPException(
                    status_code=connector_response.status_code,
                    detail=f"Failed to create connector: {connector_response.text}"
                )
            
            connector_result = connector_response.json()
            connector_id = connector_result.get('id')
            
            if not connector_id:
                raise HTTPException(status_code=500, detail="Failed to get connector ID")
            
            # Create a credential if needed (for connectors that require authentication)
            credential_id = None
            if source in ['google_drive', 'slack', 'gmail', 'confluence']:
                # For OAuth connectors, we'll need to handle credential creation separately
                # For now, we'll create a placeholder or skip this step
                pass
            
            # Create the connector-credential pair with private access
            cc_pair_payload = {
                "connector_id": connector_id,
                "credential_id": credential_id,
                "name": name,
                "access_type": "private",
                "groups": [],  # Private to current user
                "auto_sync_options": {
                    "enabled": True,
                    "frequency": 3600
                }
            }
            
            cc_pair_response = await client.post(
                f"{main_app_url}/api/manage/admin/connector-credential-pair",
                headers=auth_headers,
                json=cc_pair_payload
            )
            
            if not cc_pair_response.is_success:
                logger.error(f"Failed to create connector-credential pair: {cc_pair_response.text}")
                # If CC pair creation fails, try to delete the connector
                try:
                    await client.delete(
                        f"{main_app_url}/api/manage/admin/connector/{connector_id}",
                        headers=auth_headers
                    )
                except:
                    pass
                
                raise HTTPException(
                    status_code=cc_pair_response.status_code,
                    detail=f"Failed to create connector-credential pair: {cc_pair_response.text}"
                )
            
            cc_pair_result = cc_pair_response.json()
            
            return {
                "success": True,
                "message": "Connector created successfully",
                "connector": connector_result,
                "cc_pair": cc_pair_result
            }
            
    except httpx.RequestError as e:
        logger.error(f"Network error creating connector: {e}")
        raise HTTPException(status_code=500, detail="Network error occurred")
    except Exception as e:
        logger.error(f"Error creating connector: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
async def list_user_connectors(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    List connectors accessible to the current user.
    """
    try:
        # Get the main app domain
        host = request.headers.get('host', 'localhost')
        protocol = 'https' if request.headers.get('x-forwarded-proto') == 'https' else 'http'
        main_app_url = f"{protocol}://{host}"
        
        # Get authentication headers
        auth_headers = await get_main_app_session(request)
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Get connectors and CC pairs
            connectors_response = await client.get(
                f"{main_app_url}/api/manage/admin/connector",
                headers=auth_headers
            )
            
            cc_pairs_response = await client.get(
                f"{main_app_url}/api/manage/admin/connector-credential-pair",
                headers=auth_headers
            )
            
            if not (connectors_response.is_success and cc_pairs_response.is_success):
                raise HTTPException(status_code=500, detail="Failed to fetch connectors")
            
            connectors = connectors_response.json()
            cc_pairs = cc_pairs_response.json()
            
            return {
                "connectors": connectors,
                "cc_pairs": cc_pairs
            }
            
    except Exception as e:
        logger.error(f"Error listing connectors: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{connector_id}")
async def delete_connector(
    connector_id: int,
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a connector (only if user has access to it).
    """
    try:
        # Get the main app domain
        host = request.headers.get('host', 'localhost')
        protocol = 'https' if request.headers.get('x-forwarded-proto') == 'https' else 'http'
        main_app_url = f"{protocol}://{host}"
        
        # Get authentication headers
        auth_headers = await get_main_app_session(request)
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.delete(
                f"{main_app_url}/api/manage/admin/connector/{connector_id}",
                headers=auth_headers
            )
            
            if not response.is_success:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Failed to delete connector"
                )
            
            return {"success": True, "message": "Connector deleted successfully"}
            
    except Exception as e:
        logger.error(f"Error deleting connector: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 