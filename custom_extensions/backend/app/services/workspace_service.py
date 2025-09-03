# custom_extensions/backend/app/services/workspace_service.py
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from app.core.database import (
    execute_query, fetch_one, fetch_all, fetch_val, 
    execute_transaction, seed_default_roles
)
from app.models.workspace_models import (
    Workspace, WorkspaceCreate, WorkspaceUpdate,
    WorkspaceMember, WorkspaceMemberCreate, WorkspaceMemberUpdate,
    WorkspaceWithMembers, MemberStatus
)

logger = logging.getLogger(__name__)

class WorkspaceService:
    """Service for managing workspaces and members."""
    
    @staticmethod
    async def create_workspace(workspace_data: WorkspaceCreate, created_by: str) -> Workspace:
        """Create a new workspace with default roles."""
        try:
            # Create workspace
            workspace_id = await fetch_val("""
                INSERT INTO workspaces (name, description, created_by, is_active)
                VALUES ($1, $2, $3, $4)
                RETURNING id
            """, workspace_data.name, workspace_data.description, created_by, workspace_data.is_active)
            
            # Seed default roles
            await seed_default_roles(workspace_id, created_by)
            
            # Add creator as admin member
            admin_role = await fetch_one("""
                SELECT id FROM workspace_roles 
                WHERE workspace_id = $1 AND name = 'Admin'
            """, workspace_id)
            
            if admin_role:
                await execute_query("""
                    INSERT INTO workspace_members (workspace_id, user_id, role_id, status, joined_at)
                    VALUES ($1, $2, $3, $4, $5)
                """, workspace_id, created_by, admin_role['id'], 'active', datetime.now(timezone.utc))
            
            # Return created workspace
            return await WorkspaceService.get_workspace(workspace_id)
            
        except Exception as e:
            logger.error(f"Failed to create workspace: {e}")
            raise
    
    @staticmethod
    async def get_workspace(workspace_id: int) -> Optional[Workspace]:
        """Get a workspace by ID."""
        try:
            row = await fetch_one("""
                SELECT w.*, 
                       COUNT(DISTINCT wm.id) as member_count
                FROM workspaces w
                LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
                WHERE w.id = $1
                GROUP BY w.id
            """, workspace_id)
            
            if not row:
                return None
                
            return Workspace(
                id=row['id'],
                name=row['name'],
                description=row['description'],
                created_by=row['created_by'],
                created_at=row['created_at'],
                updated_at=row['updated_at'],
                is_active=row['is_active'],
                member_count=row['member_count']
            )
            
        except Exception as e:
            logger.error(f"Failed to get workspace {workspace_id}: {e}")
            raise
    
    @staticmethod
    async def get_user_workspaces(user_id: str) -> List[Workspace]:
        """Get all workspaces where the user is a member."""
        try:
            rows = await fetch_all("""
                SELECT DISTINCT w.*, 
                       COUNT(DISTINCT wm2.id) as member_count
                FROM workspaces w
                INNER JOIN workspace_members wm ON w.id = wm.workspace_id
                LEFT JOIN workspace_members wm2 ON w.id = wm2.workspace_id
                WHERE wm.user_id = $1 AND w.is_active = true
                GROUP BY w.id
                ORDER BY w.created_at DESC
            """, user_id)
            
            return [
                Workspace(
                    id=row['id'],
                    name=row['name'],
                    description=row['description'],
                    created_by=row['created_by'],
                    created_at=row['created_at'],
                    updated_at=row['updated_at'],
                    is_active=row['is_active'],
                    member_count=row['member_count']
                )
                for row in rows
            ]
            
        except Exception as e:
            logger.error(f"Failed to get workspaces for user {user_id}: {e}")
            raise
    
    @staticmethod
    async def update_workspace(workspace_id: int, workspace_data: WorkspaceUpdate, user_id: str) -> Optional[Workspace]:
        """Update a workspace. Only workspace creator or admin can update."""
        try:
            # Check if user has permission to update workspace
            member = await WorkspaceService.get_workspace_member(workspace_id, user_id)
            if not member or not member.status == 'active':
                raise ValueError("User is not an active member of this workspace")
            
            # Check if user is admin or creator
            workspace = await WorkspaceService.get_workspace(workspace_id)
            if not workspace:
                raise ValueError("Workspace not found")
            
            if workspace.created_by != user_id:
                # Check if user has admin role
                role = await WorkspaceService.get_member_role(workspace_id, user_id)
                if not role or 'manage_workspace' not in role['permissions']:
                    raise ValueError("Insufficient permissions to update workspace")
            
            # Build update query dynamically
            update_fields = []
            params = [workspace_id]
            param_count = 1
            
            if workspace_data.name is not None:
                update_fields.append(f"name = ${param_count + 1}")
                params.append(workspace_data.name)
                param_count += 1
            
            if workspace_data.description is not None:
                update_fields.append(f"description = ${param_count + 1}")
                params.append(workspace_data.description)
                param_count += 1
            
            if workspace_data.is_active is not None:
                update_fields.append(f"is_active = ${param_count + 1}")
                params.append(workspace_data.is_active)
                param_count += 1
            
            if update_fields:
                update_fields.append(f"updated_at = ${param_count + 1}")
                params.append(datetime.now(timezone.utc))
                
                query = f"""
                    UPDATE workspaces 
                    SET {', '.join(update_fields)}
                    WHERE id = $1
                """
                
                await execute_query(query, *params)
            
            return await WorkspaceService.get_workspace(workspace_id)
            
        except Exception as e:
            logger.error(f"Failed to update workspace {workspace_id}: {e}")
            raise
    
    @staticmethod
    async def delete_workspace(workspace_id: int, user_id: str) -> bool:
        """Delete a workspace. Only workspace creator can delete."""
        try:
            # Check if user is the workspace creator
            workspace = await WorkspaceService.get_workspace(workspace_id)
            if not workspace:
                raise ValueError("Workspace not found")
            
            if workspace.created_by != user_id:
                raise ValueError("Only workspace creator can delete workspace")
            
            # Delete workspace (cascade will handle related records)
            await execute_query("DELETE FROM workspaces WHERE id = $1", workspace_id)
            
            logger.info(f"Workspace {workspace_id} deleted by user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete workspace {workspace_id}: {e}")
            raise
    
    @staticmethod
    async def add_member(workspace_id: int, member_data: WorkspaceMemberCreate, added_by: str) -> WorkspaceMember:
        """Add a new member to the workspace."""
        try:
            # Check if user has permission to add members
            if not await WorkspaceService._can_manage_members(workspace_id, added_by):
                raise ValueError("Insufficient permissions to add members")
            
            # Check if member already exists
            existing_member = await fetch_one("""
                SELECT id FROM workspace_members 
                WHERE workspace_id = $1 AND user_id = $2
            """, workspace_id, member_data.user_id)
            
            if existing_member:
                raise ValueError("User is already a member of this workspace")
            
            # Check if role exists and belongs to workspace
            role = await fetch_one("""
                SELECT id FROM workspace_roles 
                WHERE id = $1 AND workspace_id = $2
            """, member_data.role_id, workspace_id)
            
            if not role:
                raise ValueError("Invalid role for this workspace")
            
            # Add member
            member_id = await fetch_val("""
                INSERT INTO workspace_members (workspace_id, user_id, role_id, status)
                VALUES ($1, $2, $3, $4)
                RETURNING id
            """, workspace_id, member_data.user_id, member_data.role_id, member_data.status)
            
            return await WorkspaceService.get_workspace_member(workspace_id, member_data.user_id)
            
        except Exception as e:
            logger.error(f"Failed to add member to workspace {workspace_id}: {e}")
            raise
    
    @staticmethod
    async def get_workspace_members(workspace_id: int) -> List[WorkspaceMember]:
        """Get all members of a workspace."""
        try:
            rows = await fetch_all("""
                SELECT wm.*, 
                       wr.name as role_name,
                       wr.color as role_color,
                       wr.text_color as role_text_color
                FROM workspace_members wm
                INNER JOIN workspace_roles wr ON wm.role_id = wr.id
                WHERE wm.workspace_id = $1
                ORDER BY wm.invited_at ASC
            """, workspace_id)
            
            return [
                WorkspaceMember(
                    id=row['id'],
                    workspace_id=row['workspace_id'],
                    user_id=row['user_id'],
                    role_id=row['role_id'],
                    status=row['status'],
                    invited_at=row['invited_at'],
                    joined_at=row['joined_at'],
                    updated_at=row['updated_at'],
                    role_name=row['role_name'],
                    role_color=row['role_color'],
                    role_text_color=row['role_text_color']
                )
                for row in rows
            ]
            
        except Exception as e:
            logger.error(f"Failed to get members for workspace {workspace_id}: {e}")
            raise
    
    @staticmethod
    async def get_workspace_member(workspace_id: int, user_id: str) -> Optional[WorkspaceMember]:
        """Get a specific member of a workspace."""
        try:
            row = await fetch_one("""
                SELECT wm.*, 
                       wr.name as role_name,
                       wr.color as role_color,
                       wr.text_color as role_text_color
                FROM workspace_members wm
                INNER JOIN workspace_roles wr ON wm.role_id = wr.id
                WHERE wm.workspace_id = $1 AND wm.user_id = $2
            """, workspace_id, user_id)
            
            if not row:
                return None
                
            return WorkspaceMember(
                id=row['id'],
                workspace_id=row['workspace_id'],
                user_id=row['user_id'],
                role_id=row['role_id'],
                status=row['status'],
                invited_at=row['invited_at'],
                joined_at=row['joined_at'],
                updated_at=row['updated_at'],
                role_name=row['role_name'],
                role_color=row['role_color'],
                role_text_color=row['role_text_color']
            )
            
        except Exception as e:
            logger.error(f"Failed to get member {user_id} from workspace {workspace_id}: {e}")
            raise
    
    @staticmethod
    async def update_member(workspace_id: int, user_id: str, member_data: WorkspaceMemberUpdate, updated_by: str) -> Optional[WorkspaceMember]:
        """Update a workspace member."""
        try:
            # Check if user has permission to update members
            if not await WorkspaceService._can_manage_members(workspace_id, updated_by):
                raise ValueError("Insufficient permissions to update members")
            
            # Check if member exists
            existing_member = await WorkspaceService.get_workspace_member(workspace_id, user_id)
            if not existing_member:
                raise ValueError("Member not found")
            
            # Build update query dynamically
            update_fields = []
            params = [workspace_id, user_id]
            param_count = 2
            
            if member_data.role_id is not None:
                # Check if new role exists and belongs to workspace
                role = await fetch_one("""
                    SELECT id FROM workspace_roles 
                    WHERE id = $1 AND workspace_id = $2
                """, member_data.role_id, workspace_id)
                
                if not role:
                    raise ValueError("Invalid role for this workspace")
                
                update_fields.append(f"role_id = ${param_count + 1}")
                params.append(member_data.role_id)
                param_count += 1
            
            if member_data.status is not None:
                update_fields.append(f"status = ${param_count + 1}")
                params.append(member_data.status)
                param_count += 1
            
            if update_fields:
                update_fields.append(f"updated_at = ${param_count + 1}")
                params.append(datetime.now(timezone.utc))
                
                query = f"""
                    UPDATE workspace_members 
                    SET {', '.join(update_fields)}
                    WHERE workspace_id = $1 AND user_id = $2
                """
                
                await execute_query(query, *params)
                
                # Update joined_at if status is being set to active
                if member_data.status == 'active':
                    await execute_query("""
                        UPDATE workspace_members 
                        SET joined_at = $1
                        WHERE workspace_id = $2 AND user_id = $3 AND joined_at IS NULL
                    """, datetime.now(timezone.utc), workspace_id, user_id)
            
            return await WorkspaceService.get_workspace_member(workspace_id, user_id)
            
        except Exception as e:
            logger.error(f"Failed to update member {user_id} in workspace {workspace_id}: {e}")
            raise
    
    @staticmethod
    async def remove_member(workspace_id: int, user_id: str, removed_by: str) -> bool:
        """Remove a member from the workspace."""
        try:
            # Check if user has permission to remove members
            if not await WorkspaceService._can_manage_members(workspace_id, removed_by):
                raise ValueError("Insufficient permissions to remove members")
            
            # Check if member exists
            existing_member = await WorkspaceService.get_workspace_member(workspace_id, user_id)
            if not existing_member:
                raise ValueError("Member not found")
            
            # Check if trying to remove workspace creator
            workspace = await WorkspaceService.get_workspace(workspace_id)
            if workspace.created_by == user_id:
                raise ValueError("Cannot remove workspace creator")
            
            # Remove member
            await execute_query("""
                DELETE FROM workspace_members 
                WHERE workspace_id = $1 AND user_id = $2
            """, workspace_id, user_id)
            
            logger.info(f"Member {user_id} removed from workspace {workspace_id} by {removed_by}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to remove member {user_id} from workspace {workspace_id}: {e}")
            raise
    
    @staticmethod
    async def leave_workspace(workspace_id: int, user_id: str) -> bool:
        """Leave a workspace."""
        try:
            # Check if member exists
            existing_member = await WorkspaceService.get_workspace_member(workspace_id, user_id)
            if not existing_member:
                raise ValueError("Not a member of this workspace")
            
            # Check if trying to leave as workspace creator
            workspace = await WorkspaceService.get_workspace(workspace_id)
            if workspace.created_by == user_id:
                raise ValueError("Workspace creator cannot leave. Transfer ownership or delete workspace instead.")
            
            # Remove member
            await execute_query("""
                DELETE FROM workspace_members 
                WHERE workspace_id = $1 AND user_id = $2
            """, workspace_id, user_id)
            
            logger.info(f"User {user_id} left workspace {workspace_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to leave workspace {workspace_id}: {e}")
            raise
    
    @staticmethod
    async def get_workspace_with_members(workspace_id: int) -> Optional[WorkspaceWithMembers]:
        """Get a workspace with all its members and roles."""
        try:
            workspace = await WorkspaceService.get_workspace(workspace_id)
            if not workspace:
                return None
            
            members = await WorkspaceService.get_workspace_members(workspace_id)
            
            # Get roles
            from app.services.role_service import RoleService
            roles = await RoleService.get_workspace_roles(workspace_id)
            
            return WorkspaceWithMembers(
                **workspace.dict(),
                members=members,
                roles=roles
            )
            
        except Exception as e:
            logger.error(f"Failed to get workspace with members {workspace_id}: {e}")
            raise
    
    @staticmethod
    async def _can_manage_members(workspace_id: int, user_id: str) -> bool:
        """Check if user can manage members in the workspace."""
        try:
            # Workspace creator can always manage members
            workspace = await WorkspaceService.get_workspace(workspace_id)
            if workspace and workspace.created_by == user_id:
                return True
            
            # Check if user has admin or moderator role
            role = await WorkspaceService.get_member_role(workspace_id, user_id)
            if role and 'manage_members' in role['permissions']:
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to check member management permissions: {e}")
            return False
    
    @staticmethod
    async def get_member_role(workspace_id: int, user_id: str) -> Optional[Dict[str, Any]]:
        """Get the role details for a member."""
        try:
            row = await fetch_one("""
                SELECT wr.*
                FROM workspace_roles wr
                INNER JOIN workspace_members wm ON wr.id = wm.role_id
                WHERE wm.workspace_id = $1 AND wm.user_id = $2
            """, workspace_id, user_id)
            
            if not row:
                return None
                
            return {
                'id': row['id'],
                'name': row['name'],
                'permissions': row['permissions']
            }
            
        except Exception as e:
            logger.error(f"Failed to get member role: {e}")
            return None 