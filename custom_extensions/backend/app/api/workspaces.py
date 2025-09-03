# custom_extensions/backend/app/api/workspaces.py
from fastapi import APIRouter, HTTPException, Depends, Query, Path
from typing import List, Optional
from app.models.workspace_models import (
    Workspace, WorkspaceCreate, WorkspaceUpdate,
    WorkspaceWithMembers, WorkspaceRole, WorkspaceRoleCreate, WorkspaceRoleUpdate,
    WorkspaceMember, WorkspaceMemberCreate, WorkspaceMemberUpdate
)
from app.services.workspace_service import WorkspaceService
from app.services.role_service import RoleService
from app.services.product_access_service import ProductAccessService

router = APIRouter(prefix="/workspaces", tags=["workspaces"])

# Dependency to get current user ID (placeholder - integrate with your auth system)
async def get_current_user_id() -> str:
    # TODO: Integrate with your authentication system
    # For now, return a placeholder user ID
    return "current_user_123"

# Workspace Management Endpoints

@router.post("/", response_model=Workspace)
async def create_workspace(
    workspace_data: WorkspaceCreate,
    current_user_id: str = Depends(get_current_user_id)
):
    """Create a new workspace."""
    try:
        workspace = await WorkspaceService.create_workspace(workspace_data, current_user_id)
        return workspace
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create workspace")

@router.get("/", response_model=List[Workspace])
async def get_workspaces(
    current_user_id: str = Depends(get_current_user_id)
):
    """Get all workspaces where the current user is a member."""
    try:
        workspaces = await WorkspaceService.get_user_workspaces(current_user_id)
        return workspaces
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve workspaces")

@router.get("/{workspace_id}", response_model=Workspace)
async def get_workspace(
    workspace_id: int = Path(..., description="The ID of the workspace"),
    current_user_id: str = Depends(get_current_user_id)
):
    """Get a specific workspace by ID."""
    try:
        # Check if user is a member of the workspace
        member = await WorkspaceService.get_workspace_member(workspace_id, current_user_id)
        if not member:
            raise HTTPException(status_code=403, detail="Access denied to workspace")
        
        workspace = await WorkspaceService.get_workspace(workspace_id)
        if not workspace:
            raise HTTPException(status_code=404, detail="Workspace not found")
        
        return workspace
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve workspace")

@router.get("/{workspace_id}/full", response_model=WorkspaceWithMembers)
async def get_workspace_with_members(
    workspace_id: int = Path(..., description="The ID of the workspace"),
    current_user_id: str = Depends(get_current_user_id)
):
    """Get a workspace with all its members and roles."""
    try:
        # Check if user is a member of the workspace
        member = await WorkspaceService.get_workspace_member(workspace_id, current_user_id)
        if not member:
            raise HTTPException(status_code=403, detail="Access denied to workspace")
        
        workspace_data = await WorkspaceService.get_workspace_with_members(workspace_id)
        if not workspace_data:
            raise HTTPException(status_code=404, detail="Workspace not found")
        
        return workspace_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve workspace data")

@router.put("/{workspace_id}", response_model=Workspace)
async def update_workspace(
    workspace_data: WorkspaceUpdate,
    workspace_id: int = Path(..., description="The ID of the workspace"),
    current_user_id: str = Depends(get_current_user_id)
):
    """Update a workspace."""
    try:
        workspace = await WorkspaceService.update_workspace(workspace_id, workspace_data, current_user_id)
        if not workspace:
            raise HTTPException(status_code=404, detail="Workspace not found")
        
        return workspace
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update workspace")

@router.delete("/{workspace_id}")
async def delete_workspace(
    workspace_id: int = Path(..., description="The ID of the workspace"),
    current_user_id: str = Depends(get_current_user_id)
):
    """Delete a workspace."""
    try:
        success = await WorkspaceService.delete_workspace(workspace_id, current_user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Workspace not found")
        
        return {"message": "Workspace deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete workspace")

# Role Management Endpoints

@router.post("/{workspace_id}/roles", response_model=WorkspaceRole)
async def create_role(
    role_data: WorkspaceRoleCreate,
    workspace_id: int = Path(..., description="The ID of the workspace"),
    current_user_id: str = Depends(get_current_user_id)
):
    """Create a new custom role in a workspace."""
    try:
        # Ensure workspace_id matches path parameter
        role_data.workspace_id = workspace_id
        
        role = await RoleService.create_custom_role(role_data, current_user_id)
        return role
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create role")

@router.get("/{workspace_id}/roles", response_model=List[WorkspaceRole])
async def get_workspace_roles(
    workspace_id: int = Path(..., description="The ID of the workspace"),
    current_user_id: str = Depends(get_current_user_id)
):
    """Get all roles for a workspace."""
    try:
        # Check if user is a member of the workspace
        member = await WorkspaceService.get_workspace_member(workspace_id, current_user_id)
        if not member:
            raise HTTPException(status_code=403, detail="Access denied to workspace")
        
        roles = await RoleService.get_workspace_roles(workspace_id)
        return roles
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve roles")

@router.get("/{workspace_id}/roles/{role_id}", response_model=WorkspaceRole)
async def get_workspace_role(
    workspace_id: int = Path(..., description="The ID of the workspace"),
    role_id: int = Path(..., description="The ID of the role"),
    current_user_id: str = Depends(get_current_user_id)
):
    """Get a specific role from a workspace."""
    try:
        # Check if user is a member of the workspace
        member = await WorkspaceService.get_workspace_member(workspace_id, current_user_id)
        if not member:
            raise HTTPException(status_code=403, detail="Access denied to workspace")
        
        role = await RoleService.get_workspace_role(role_id, workspace_id)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        
        return role
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve role")

@router.put("/{workspace_id}/roles/{role_id}", response_model=WorkspaceRole)
async def update_role(
    role_data: WorkspaceRoleUpdate,
    workspace_id: int = Path(..., description="The ID of the workspace"),
    role_id: int = Path(..., description="The ID of the role"),
    current_user_id: str = Depends(get_current_user_id)
):
    """Update a custom role in a workspace."""
    try:
        role = await RoleService.update_custom_role(role_id, workspace_id, role_data, current_user_id)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        
        return role
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update role")

@router.delete("/{workspace_id}/roles/{role_id}")
async def delete_role(
    workspace_id: int = Path(..., description="The ID of the workspace"),
    role_id: int = Path(..., description="The ID of the role"),
    current_user_id: str = Depends(get_current_user_id)
):
    """Delete a custom role from a workspace."""
    try:
        success = await RoleService.delete_custom_role(role_id, workspace_id, current_user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Role not found")
        
        return {"message": "Role deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete role")

# Member Management Endpoints

@router.post("/{workspace_id}/members", response_model=WorkspaceMember)
async def add_member(
    member_data: WorkspaceMemberCreate,
    workspace_id: int = Path(..., description="The ID of the workspace"),
    current_user_id: str = Depends(get_current_user_id)
):
    """Add a new member to a workspace."""
    try:
        # Ensure workspace_id matches path parameter
        member_data.workspace_id = workspace_id
        
        member = await WorkspaceService.add_member(workspace_id, member_data, current_user_id)
        return member
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to add member")

@router.get("/{workspace_id}/members", response_model=List[WorkspaceMember])
async def get_workspace_members(
    workspace_id: int = Path(..., description="The ID of the workspace"),
    current_user_id: str = Depends(get_current_user_id)
):
    """Get all members of a workspace."""
    try:
        # Check if user is a member of the workspace
        member = await WorkspaceService.get_workspace_member(workspace_id, current_user_id)
        if not member:
            raise HTTPException(status_code=403, detail="Access denied to workspace")
        
        members = await WorkspaceService.get_workspace_members(workspace_id)
        return members
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve members")

@router.put("/{workspace_id}/members/{user_id}", response_model=WorkspaceMember)
async def update_member(
    member_data: WorkspaceMemberUpdate,
    workspace_id: int = Path(..., description="The ID of the workspace"),
    user_id: str = Path(..., description="The ID of the user to update"),
    current_user_id: str = Depends(get_current_user_id)
):
    """Update a workspace member."""
    try:
        member = await WorkspaceService.update_member(workspace_id, user_id, member_data, current_user_id)
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        
        return member
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update member")

@router.delete("/{workspace_id}/members/{user_id}")
async def remove_member(
    workspace_id: int = Path(..., description="The ID of the workspace"),
    user_id: str = Path(..., description="The ID of the user to remove"),
    current_user_id: str = Depends(get_current_user_id)
):
    """Remove a member from a workspace."""
    try:
        success = await WorkspaceService.remove_member(workspace_id, user_id, current_user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Member not found")
        
        return {"message": "Member removed successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to remove member")

@router.post("/{workspace_id}/leave")
async def leave_workspace(
    workspace_id: int = Path(..., description="The ID of the workspace"),
    current_user_id: str = Depends(get_current_user_id)
):
    """Leave a workspace."""
    try:
        success = await WorkspaceService.leave_workspace(workspace_id, current_user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Member not found")
        
        return {"message": "Successfully left workspace"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to leave workspace") 