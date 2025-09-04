# custom_extensions/backend/app/api/product_access.py
from fastapi import APIRouter, Depends, HTTPException, Path, Query, Request
from typing import List
from app.models.workspace_models import ProductAccess, ProductAccessCreate
from app.services.product_access_service import ProductAccessService
from app.services.workspace_service import WorkspaceService

router = APIRouter()

async def get_user_identifiers_for_workspace(request: Request) -> tuple[str, str]:
    """Get both UUID and email for workspace operations."""
    import httpx
    from app.core.config import ONYX_SESSION_COOKIE_NAME, ONYX_API_SERVER_URL
    from fastapi import status
    
    try:
        session_cookie_value = request.cookies.get(ONYX_SESSION_COOKIE_NAME)
        if not session_cookie_value:
            dev_user_id = request.headers.get("X-Dev-Onyx-User-ID")
            if dev_user_id:
                return dev_user_id, dev_user_id  # For dev, assume email format
            else:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
        else:
            onyx_user_info_url = f"{ONYX_API_SERVER_URL}/me"
            cookies_to_forward = {ONYX_SESSION_COOKIE_NAME: session_cookie_value}
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(onyx_user_info_url, cookies=cookies_to_forward)
                response.raise_for_status()
                user_data = response.json()
                
                user_uuid = str(user_data.get("userId") or user_data.get("id"))
                user_email = user_data.get("email") or user_uuid
                return user_uuid, user_email
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error getting user identifiers: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="User identification failed")

# Product Access Control Endpoints

@router.post("/{product_id}/access", response_model=ProductAccess)
async def grant_product_access(
    access_data: ProductAccessCreate,
    product_id: int = Path(..., description="The ID of the product"),
    request: Request = None
):
    """Grant access to a product for a workspace, role, or individual."""
    try:
        # Get user identifiers (both UUID and email)
        user_uuid, user_email = await get_user_identifiers_for_workspace(request)
        
        # Ensure product_id matches path parameter
        access_data.product_id = product_id
        
        # Check if user is a member of the workspace (use email for membership check)
        member = await WorkspaceService.get_workspace_member(access_data.workspace_id, user_email)
        if not member:
            raise HTTPException(status_code=403, detail="Access denied to workspace")
        
        access = await ProductAccessService.grant_access(access_data, user_email)
        return access
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to grant product access")

@router.get("/{product_id}/access", response_model=List[ProductAccess])
async def get_product_access_list(
    product_id: int = Path(..., description="The ID of the product"),
    request: Request = None
):
    """Get all access records for a product."""
    try:
        # Get user identifiers (both UUID and email)
        user_uuid, user_email = await get_user_identifiers_for_workspace(request)
        
        access_list = await ProductAccessService.get_product_access_list(product_id)
        return access_list

    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve product access list")

@router.delete("/{product_id}/access/{access_id}")
async def revoke_product_access(
    product_id: int = Path(..., description="The ID of the product"),
    access_id: int = Path(..., description="The ID of the access record to revoke"),
    request: Request = None
):
    """Revoke access to a product."""
    try:
        # Get user identifiers (both UUID and email)
        user_uuid, user_email = await get_user_identifiers_for_workspace(request)

        # Get the access record to find the workspace_id
        access = await ProductAccessService.get_product_access(access_id)
        if not access:
            raise HTTPException(status_code=404, detail="Access record not found")
        
        if access.product_id != product_id:
            raise HTTPException(status_code=400, detail="Access record does not match product")
        
        # Check if user is a member of the workspace (use email for membership check)
        member = await WorkspaceService.get_workspace_member(access.workspace_id, user_email)
        if not member:
            raise HTTPException(status_code=403, detail="Access denied to workspace")
        
        success = await ProductAccessService.revoke_access(access_id, access.workspace_id, user_email)
        if not success:
            raise HTTPException(status_code=404, detail="Access record not found")
        
        return {"message": "Product access revoked successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to revoke product access")

@router.get("/{product_id}/access/check")
async def check_user_product_access(
    product_id: int = Path(..., description="The ID of the product"),
    workspace_id: int = Query(..., description="The ID of the workspace"),
    request: Request = None
):
    """Check if the current user has access to a specific product in a workspace."""
    try:
        # Get user identifiers (both UUID and email)
        user_uuid, user_email = await get_user_identifiers_for_workspace(request)

        # Check if user is a member of the workspace (use email for membership check)
        member = await WorkspaceService.get_workspace_member(workspace_id, user_email)
        if not member:
            raise HTTPException(status_code=403, detail="Access denied to workspace")
        
        has_access = await ProductAccessService.check_user_product_access(product_id, user_email, workspace_id)
        
        return {
            "product_id": product_id,
            "workspace_id": workspace_id,
            "user_id": user_uuid,
            "has_access": has_access
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to check product access")

@router.get("/{product_id}/access/user")
async def get_user_accessible_products(
    workspace_id: int = Query(..., description="The ID of the workspace"),
    request: Request = None
):
    """Get all product IDs that the current user can access in a workspace."""
    try:
        # Get user identifiers (both UUID and email)
        user_uuid, user_email = await get_user_identifiers_for_workspace(request)

        # Check if user is a member of the workspace (use email for membership check)
        member = await WorkspaceService.get_workspace_member(workspace_id, user_email)
        if not member:
            raise HTTPException(status_code=403, detail="Access denied to workspace")
        
        accessible_products = await ProductAccessService.get_user_accessible_products(user_uuid, workspace_id)
        
        return {
            "workspace_id": workspace_id,
            "user_id": user_uuid,
            "accessible_product_ids": accessible_products,
            "count": len(accessible_products)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get accessible products")

@router.post("/{product_id}/access/bulk")
async def bulk_grant_product_access(
    access_list: List[ProductAccessCreate],
    product_id: int = Path(..., description="The ID of the product"),
    request: Request = None
):
    """Grant access to multiple targets at once for a product."""
    try:
        if not access_list:
            raise HTTPException(status_code=400, detail="Access list cannot be empty")
        
        # Get user identifiers (both UUID and email)
        user_uuid, user_email = await get_user_identifiers_for_workspace(request)

        # Ensure all access records have the same product_id and workspace_id
        workspace_id = access_list[0].workspace_id
        for access_data in access_list:
            if access_data.product_id != product_id:
                raise HTTPException(status_code=400, detail="All access records must have the same product_id")
            if access_data.workspace_id != workspace_id:
                raise HTTPException(status_code=400, detail="All access records must have the same workspace_id")
        
        # Check if user is a member of the workspace (use email for membership check)
        member = await WorkspaceService.get_workspace_member(workspace_id, user_email)
        if not member:
            raise HTTPException(status_code=403, detail="Access denied to workspace")
        
        granted_access = await ProductAccessService.bulk_grant_access(product_id, workspace_id, access_list, user_email)
        
        return {
            "message": f"Successfully granted access to {len(granted_access)} targets",
            "granted_access": granted_access,
            "count": len(granted_access)
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to bulk grant product access")

@router.get("/workspace/{workspace_id}/access")
async def get_workspace_product_access(
    workspace_id: int = Path(..., description="The ID of the workspace"),
    request: Request = None
):
    """Get all product access records for a specific workspace."""
    try:
        # Get user identifiers (both UUID and email)
        user_uuid, user_email = await get_user_identifiers_for_workspace(request)

        # Check if user is a member of the workspace (use email for membership check)
        member = await WorkspaceService.get_workspace_member(workspace_id, user_email)
        if not member:
            raise HTTPException(status_code=403, detail="Access denied to workspace")
        
        access_list = await ProductAccessService.get_workspace_product_access(workspace_id)
        
        return {
            "workspace_id": workspace_id,
            "access_records": access_list,
            "count": len(access_list)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve workspace product access")

# Additional utility endpoints

@router.get("/access/types")
async def get_access_types():
    """Get all available access types."""
    return {
        "access_types": [
            {
                "value": AccessType.WORKSPACE,
                "label": "Workspace",
                "description": "Access granted to all members of the workspace"
            },
            {
                "value": AccessType.ROLE,
                "label": "Role",
                "description": "Access granted to members with a specific role"
            },
            {
                "value": AccessType.INDIVIDUAL,
                "label": "Individual",
                "description": "Access granted to a specific individual member"
            }
        ]
    } 