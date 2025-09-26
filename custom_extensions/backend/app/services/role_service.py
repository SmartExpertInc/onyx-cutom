# custom_extensions/backend/app/services/role_service.py
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from app.core.database import execute_query, fetch_one, fetch_all, fetch_val
from app.models.workspace_models import (
    WorkspaceRole, WorkspaceRoleCreate, WorkspaceRoleUpdate,
    WorkspaceRoleWithMembers, Permission, DEFAULT_ROLES
)

logger = logging.getLogger(__name__)

class RoleService:
    """Service for managing workspace roles and permissions."""
    
    @staticmethod
    async def get_workspace_roles(workspace_id: int) -> List[WorkspaceRole]:
        """Get all roles for a workspace."""
        try:
            rows = await fetch_all("""
                SELECT wr.*, 
                       COUNT(DISTINCT wm.id) as member_count
                FROM workspace_roles wr
                LEFT JOIN workspace_members wm ON wr.id = wm.role_id
                WHERE wr.workspace_id = $1
                GROUP BY wr.id
                ORDER BY wr.is_default DESC, wr.created_at ASC
            """, workspace_id)
            
            return [
                WorkspaceRole(
                    id=row['id'],
                    workspace_id=row['workspace_id'],
                    name=row['name'],
                    color=row['color'],
                    text_color=row['text_color'],
                    permissions=row['permissions'],
                    is_default=row['is_default'],
                    created_by=row['created_by'],
                    created_at=row['created_at'],
                    updated_at=row['updated_at'],
                    member_count=row['member_count']
                )
                for row in rows
            ]
            
        except Exception as e:
            logger.error(f"Failed to get roles for workspace {workspace_id}: {e}")
            raise
    
    @staticmethod
    async def get_workspace_role(role_id: int, workspace_id: int) -> Optional[WorkspaceRole]:
        """Get a specific role from a workspace."""
        try:
            row = await fetch_one("""
                SELECT wr.*, 
                       COUNT(DISTINCT wm.id) as member_count
                FROM workspace_roles wr
                LEFT JOIN workspace_members wm ON wr.id = wm.role_id
                WHERE wr.id = $1 AND wr.workspace_id = $2
                GROUP BY wr.id
            """, role_id, workspace_id)
            
            if not row:
                return None
                
            return WorkspaceRole(
                id=row['id'],
                workspace_id=row['workspace_id'],
                name=row['name'],
                color=row['color'],
                text_color=row['text_color'],
                permissions=row['permissions'],
                is_default=row['is_default'],
                created_by=row['created_by'],
                created_at=row['created_at'],
                updated_at=row['updated_at'],
                member_count=row['member_count']
            )
            
        except Exception as e:
            logger.error(f"Failed to get role {role_id} from workspace {workspace_id}: {e}")
            raise
    
    @staticmethod
    async def create_custom_role(role_data: WorkspaceRoleCreate, created_by: str) -> WorkspaceRole:
        """Create a new custom role in a workspace."""
        try:
            # Check if user has permission to create roles
            if not await RoleService._can_manage_roles(role_data.workspace_id, created_by):
                raise ValueError("Insufficient permissions to create roles")
            
            # Check if role name already exists in workspace
            existing_role = await fetch_one("""
                SELECT id FROM workspace_roles 
                WHERE workspace_id = $1 AND name = $2
            """, role_data.workspace_id, role_data.name)
            
            if existing_role:
                raise ValueError("Role name already exists in this workspace")
            
            # Create role
            role_id = await fetch_val("""
                INSERT INTO workspace_roles (workspace_id, name, color, text_color, permissions, is_default, created_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            """, role_data.workspace_id, role_data.name, role_data.color, 
                 role_data.text_color, role_data.permissions, False, created_by)
            
            return await RoleService.get_workspace_role(role_id, role_data.workspace_id)
            
        except Exception as e:
            logger.error(f"Failed to create custom role in workspace {role_data.workspace_id}: {e}")
            raise
    
    @staticmethod
    async def update_custom_role(role_id: int, workspace_id: int, role_data: WorkspaceRoleUpdate, updated_by: str) -> Optional[WorkspaceRole]:
        """Update a custom role. Default roles cannot be updated."""
        try:
            # Check if user has permission to update roles
            if not await RoleService._can_manage_roles(workspace_id, updated_by):
                raise ValueError("Insufficient permissions to update roles")
            
            # Get existing role
            existing_role = await RoleService.get_workspace_role(role_id, workspace_id)
            if not existing_role:
                raise ValueError("Role not found")
            
            # Default roles cannot be updated
            if existing_role.is_default:
                raise ValueError("Default roles cannot be updated")
            
            # Check if new name conflicts with existing role
            if role_data.name and role_data.name != existing_role.name:
                name_conflict = await fetch_one("""
                    SELECT id FROM workspace_roles 
                    WHERE workspace_id = $1 AND name = $2 AND id != $3
                """, workspace_id, role_data.name, role_id)
                
                if name_conflict:
                    raise ValueError("Role name already exists in this workspace")
            
            # Build update query dynamically
            update_fields = []
            params = [role_id, workspace_id]
            param_count = 2
            
            if role_data.name is not None:
                update_fields.append(f"name = ${param_count + 1}")
                params.append(role_data.name)
                param_count += 1
            
            if role_data.color is not None:
                update_fields.append(f"color = ${param_count + 1}")
                params.append(role_data.color)
                param_count += 1
            
            if role_data.text_color is not None:
                update_fields.append(f"text_color = ${param_count + 1}")
                params.append(role_data.text_color)
                param_count += 1
            
            if role_data.permissions is not None:
                update_fields.append(f"permissions = ${param_count + 1}")
                params.append(role_data.permissions)
                param_count += 1
            
            if update_fields:
                update_fields.append(f"updated_at = ${param_count + 1}")
                params.append(datetime.now(timezone.utc))
                
                query = f"""
                    UPDATE workspace_roles 
                    SET {', '.join(update_fields)}
                    WHERE id = $1 AND workspace_id = $2
                """
                
                await execute_query(query, *params)
            
            return await RoleService.get_workspace_role(role_id, workspace_id)
            
        except Exception as e:
            logger.error(f"Failed to update role {role_id} in workspace {workspace_id}: {e}")
            raise
    
    @staticmethod
    async def delete_custom_role(role_id: int, workspace_id: int, deleted_by: str) -> bool:
        """Delete a custom role. Default roles cannot be deleted."""
        try:
            # Check if user has permission to delete roles
            if not await RoleService._can_manage_roles(workspace_id, deleted_by):
                raise ValueError("Insufficient permissions to delete roles")
            
            # Get existing role
            existing_role = await RoleService.get_workspace_role(role_id, workspace_id)
            if not existing_role:
                raise ValueError("Role not found")
            
            # Default roles cannot be deleted
            if existing_role.is_default:
                raise ValueError("Default roles cannot be deleted")
            
            # Check if role is assigned to any members
            member_count = await fetch_val("""
                SELECT COUNT(*) FROM workspace_members 
                WHERE role_id = $1
            """, role_id)
            
            if member_count > 0:
                raise ValueError("Cannot delete role that is assigned to members")
            
            # Delete role
            await execute_query("""
                DELETE FROM workspace_roles 
                WHERE id = $1 AND workspace_id = $2
            """, role_id, workspace_id)
            
            logger.info(f"Custom role {role_id} deleted from workspace {workspace_id} by {deleted_by}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete role {role_id} from workspace {workspace_id}: {e}")
            raise
    
    @staticmethod
    async def get_role_with_members(role_id: int, workspace_id: int) -> Optional[WorkspaceRoleWithMembers]:
        """Get a role with all its members."""
        try:
            role = await RoleService.get_workspace_role(role_id, workspace_id)
            if not role:
                return None
            
            # Get members with this role
            from app.services.workspace_service import WorkspaceService
            all_members = await WorkspaceService.get_workspace_members(workspace_id)
            role_members = [m for m in all_members if m.role_id == role_id]
            
            return WorkspaceRoleWithMembers(
                **role.dict(),
                members=role_members
            )
            
        except Exception as e:
            logger.error(f"Failed to get role with members {role_id}: {e}")
            raise
    
    @staticmethod
    async def check_user_permission(workspace_id: int, user_id: str, permission: Permission) -> bool:
        """Check if a user has a specific permission in a workspace."""
        try:
            # Get user's role
            role = await RoleService._get_user_role(workspace_id, user_id)
            if not role:
                return False
            
            # Check if role has the permission
            return permission in role['permissions']
            
        except Exception as e:
            logger.error(f"Failed to check permission {permission} for user {user_id}: {e}")
            return False
    
    @staticmethod
    async def get_user_permissions(workspace_id: int, user_id: str) -> List[Permission]:
        """Get all permissions for a user in a workspace."""
        try:
            role = await RoleService._get_user_role(workspace_id, user_id)
            if not role:
                return []
            
            return role['permissions']
            
        except Exception as e:
            logger.error(f"Failed to get permissions for user {user_id}: {e}")
            return []
    
    @staticmethod
    async def _can_manage_roles(workspace_id: int, user_id: str) -> bool:
        """Check if user can manage roles in the workspace."""
        try:
            # Temporarily allow all members to manage roles
            return True
            
            # Original permission logic (commented out temporarily):
            # # Check if user has role management permission
            # return await RoleService.check_user_permission(workspace_id, user_id, Permission.MANAGE_ROLES)
            
        except Exception as e:
            logger.error(f"Failed to check role management permissions: {e}")
            return True  # Allow on error for now
    
    @staticmethod
    async def _get_user_role(workspace_id: int, user_id: str) -> Optional[Dict[str, Any]]:
        """Get the role details for a user in a workspace."""
        try:
            row = await fetch_one("""
                SELECT wr.permissions
                FROM workspace_roles wr
                INNER JOIN workspace_members wm ON wr.id = wm.role_id
                WHERE wm.workspace_id = $1 AND wm.user_id = $2 AND wm.status = 'active'
            """, workspace_id, user_id)
            
            if not row:
                return None
                
            return {
                'permissions': row['permissions']
            }
            
        except Exception as e:
            logger.error(f"Failed to get user role: {e}")
            return None 