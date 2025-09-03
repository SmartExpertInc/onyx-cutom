# custom_extensions/backend/app/api/product_access.py
from fastapi import APIRouter, HTTPException, Depends, Path, Query
from typing import List, Optional
from app.models.workspace_models import (
    ProductAccess, ProductAccessCreate, AccessType
)
from app.services.product_access_service import ProductAccessService
from app.services.workspace_service import WorkspaceService

router = APIRouter(prefix="/products", tags=["product-access"])

# Dependency to get current user ID (placeholder - integrate with your auth system)
async def get_current_user_id() -> str:
    # TODO: Integrate with your authentication system
    # For now, return a placeholder user ID
    return "current_user_123"

# Product Access Control Endpoints

@router.post("/{product_id}/access", response_model=ProductAccess)
async def grant_product_access(
    access_data: ProductAccessCreate,
    product_id: int = Path(..., description="The ID of the product"),
    current_user_id: str = Depends(get_current_user_id)
):
    """Grant access to a product for a workspace, role, or individual."""
    try:
        # Ensure product_id matches path parameter
        access_data.product_id = product_id
        
        # Check if user is a member of the workspace
        member = await WorkspaceService.get_workspace_member(access_data.workspace_id, current_user_id)
        if not member:
            raise HTTPException(status_code=403, detail="Access denied to workspace")
        
        access = await ProductAccessService.grant_access(access_data, current_user_id)
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
    current_user_id: str = Depends(get_current_user_id)
):
    """Get all access records for a specific product."""
    try:
        # TODO: Check if user has permission to view product access
        # This might require checking if the user owns the product or has admin access
        
        access_list = await ProductAccessService.get_product_access_list(product_id)
        return access_list
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve product access list")

@router.delete("/{product_id}/access/{access_id}")
async def revoke_product_access(
    product_id: int = Path(..., description="The ID of the product"),
    access_id: int = Path(..., description="The ID of the access record to revoke"),
    current_user_id: str = Depends(get_current_user_id)
):
    """Revoke access to a product."""
    try:
        # Get the access record to find the workspace_id
        access = await ProductAccessService.get_product_access(access_id)
        if not access:
            raise HTTPException(status_code=404, detail="Access record not found")
        
        if access.product_id != product_id:
            raise HTTPException(status_code=400, detail="Access record does not match product")
        
        # Check if user is a member of the workspace
        member = await WorkspaceService.get_workspace_member(access.workspace_id, current_user_id)
        if not member:
            raise HTTPException(status_code=403, detail="Access denied to workspace")
        
        success = await ProductAccessService.revoke_access(access_id, access.workspace_id, current_user_id)
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
    current_user_id: str = Depends(get_current_user_id)
):
    """Check if the current user has access to a specific product in a workspace."""
    try:
        # Check if user is a member of the workspace
        member = await WorkspaceService.get_workspace_member(workspace_id, current_user_id)
        if not member:
            raise HTTPException(status_code=403, detail="Access denied to workspace")
        
        has_access = await ProductAccessService.check_user_product_access(product_id, current_user_id, workspace_id)
        
        return {
            "product_id": product_id,
            "workspace_id": workspace_id,
            "user_id": current_user_id,
            "has_access": has_access
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to check product access")

@router.get("/{product_id}/access/user")
async def get_user_accessible_products(
    workspace_id: int = Query(..., description="The ID of the workspace"),
    current_user_id: str = Depends(get_current_user_id)
):
    """Get all product IDs that the current user can access in a workspace."""
    try:
        # Check if user is a member of the workspace
        member = await WorkspaceService.get_workspace_member(workspace_id, current_user_id)
        if not member:
            raise HTTPException(status_code=403, detail="Access denied to workspace")
        
        accessible_products = await ProductAccessService.get_user_accessible_products(current_user_id, workspace_id)
        
        return {
            "workspace_id": workspace_id,
            "user_id": current_user_id,
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
    current_user_id: str = Depends(get_current_user_id)
):
    """Grant access to multiple targets at once for a product."""
    try:
        if not access_list:
            raise HTTPException(status_code=400, detail="Access list cannot be empty")
        
        # Ensure all access records have the same product_id and workspace_id
        workspace_id = access_list[0].workspace_id
        for access_data in access_list:
            if access_data.product_id != product_id:
                raise HTTPException(status_code=400, detail="All access records must have the same product_id")
            if access_data.workspace_id != workspace_id:
                raise HTTPException(status_code=400, detail="All access records must have the same workspace_id")
        
        # Check if user is a member of the workspace
        member = await WorkspaceService.get_workspace_member(workspace_id, current_user_id)
        if not member:
            raise HTTPException(status_code=403, detail="Access denied to workspace")
        
        granted_access = await ProductAccessService.bulk_grant_access(product_id, workspace_id, access_list, current_user_id)
        
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
    current_user_id: str = Depends(get_current_user_id)
):
    """Get all product access records for a specific workspace."""
    try:
        # Check if user is a member of the workspace
        member = await WorkspaceService.get_workspace_member(workspace_id, current_user_id)
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