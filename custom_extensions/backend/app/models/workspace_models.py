# custom_extensions/backend/app/models/workspace_models.py
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class WorkspaceStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    ARCHIVED = "archived"

class MemberStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"

class AccessType(str, Enum):
    WORKSPACE = "workspace"
    ROLE = "role"
    INDIVIDUAL = "individual"

class Permission(str, Enum):
    # Workspace permissions
    MANAGE_WORKSPACE = "manage_workspace"
    DELETE_WORKSPACE = "delete_workspace"
    
    # Member permissions
    MANAGE_MEMBERS = "manage_members"
    INVITE_MEMBERS = "invite_members"
    REMOVE_MEMBERS = "remove_members"
    
    # Role permissions
    MANAGE_ROLES = "manage_roles"
    CREATE_ROLES = "create_roles"
    EDIT_ROLES = "edit_roles"
    DELETE_ROLES = "delete_roles"
    
    # Content permissions
    VIEW_CONTENT = "view_content"
    EDIT_CONTENT = "edit_content"
    DELETE_CONTENT = "delete_content"
    
    # Product access permissions
    MANAGE_PRODUCT_ACCESS = "manage_product_access"
    GRANT_PRODUCT_ACCESS = "grant_product_access"
    REVOKE_PRODUCT_ACCESS = "revoke_product_access"

# Base models for database operations
class WorkspaceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    is_active: bool = True

class WorkspaceCreate(WorkspaceBase):
    pass

class WorkspaceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    is_active: Optional[bool] = None

class Workspace(WorkspaceBase):
    id: int
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    member_count: Optional[int] = None

class WorkspaceRoleBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    color: str = Field(..., regex=r'^#[0-9A-Fa-f]{6}$')
    text_color: str = Field(..., regex=r'^#[0-9A-Fa-f]{6}$')
    permissions: List[Permission]
    is_default: bool = False

class WorkspaceRoleCreate(WorkspaceRoleBase):
    workspace_id: int

class WorkspaceRoleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    color: Optional[str] = Field(None, regex=r'^#[0-9A-Fa-f]{6}$')
    text_color: Optional[str] = Field(None, regex=r'^#[0-9A-Fa-f]{6}$')
    permissions: Optional[List[Permission]] = None

class WorkspaceRole(WorkspaceRoleBase):
    id: int
    workspace_id: int
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    member_count: Optional[int] = None

class WorkspaceMemberBase(BaseModel):
    workspace_id: int
    user_id: str
    role_id: int
    status: MemberStatus = MemberStatus.PENDING

class WorkspaceMemberCreate(WorkspaceMemberBase):
    pass

class WorkspaceMemberUpdate(BaseModel):
    role_id: Optional[int] = None
    status: Optional[MemberStatus] = None

class WorkspaceMember(WorkspaceMemberBase):
    id: int
    invited_at: datetime
    joined_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    # Additional fields for display
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    role_name: Optional[str] = None
    role_color: Optional[str] = None
    role_text_color: Optional[str] = None

class ProductAccessBase(BaseModel):
    product_id: int
    workspace_id: int
    access_type: AccessType
    target_id: Optional[str] = None  # role_id or user_id depending on access_type

class ProductAccessCreate(ProductAccessBase):
    pass

class ProductAccess(ProductAccessBase):
    id: int
    granted_by: str
    granted_at: datetime
    # Additional fields for display
    granter_name: Optional[str] = None
    target_name: Optional[str] = None

# Response models for API endpoints
class WorkspaceWithMembers(Workspace):
    members: List[WorkspaceMember]
    roles: List[WorkspaceRole]

class WorkspaceRoleWithMembers(WorkspaceRole):
    members: List[WorkspaceMember]

class WorkspaceMemberWithRole(WorkspaceMember):
    role: WorkspaceRole

# Default role definitions
DEFAULT_ROLES = {
    "admin": {
        "name": "Admin",
        "color": "#F3E8FF",
        "text_color": "#7C3AED",
        "permissions": [
            Permission.MANAGE_WORKSPACE,
            Permission.DELETE_WORKSPACE,
            Permission.MANAGE_MEMBERS,
            Permission.INVITE_MEMBERS,
            Permission.REMOVE_MEMBERS,
            Permission.MANAGE_ROLES,
            Permission.CREATE_ROLES,
            Permission.EDIT_ROLES,
            Permission.DELETE_ROLES,
            Permission.VIEW_CONTENT,
            Permission.EDIT_CONTENT,
            Permission.DELETE_CONTENT,
            Permission.MANAGE_PRODUCT_ACCESS,
            Permission.GRANT_PRODUCT_ACCESS,
            Permission.REVOKE_PRODUCT_ACCESS
        ],
        "is_default": True
    },
    "moderator": {
        "name": "Moderator",
        "color": "#ECFDF5",
        "text_color": "#047857",
        "permissions": [
            Permission.MANAGE_MEMBERS,
            Permission.INVITE_MEMBERS,
            Permission.REMOVE_MEMBERS,
            Permission.VIEW_CONTENT,
            Permission.EDIT_CONTENT,
            Permission.DELETE_CONTENT,
            Permission.GRANT_PRODUCT_ACCESS,
            Permission.REVOKE_PRODUCT_ACCESS
        ],
        "is_default": True
    },
    "member": {
        "name": "Member",
        "color": "#EFF6FF",
        "text_color": "#1E40AF",
        "permissions": [
            Permission.VIEW_CONTENT,
            Permission.EDIT_CONTENT
        ],
        "is_default": True
    }
} 