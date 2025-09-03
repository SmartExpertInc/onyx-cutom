# custom_extensions/backend/app/services/product_access_service.py
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from app.core.database import execute_query, fetch_one, fetch_all, fetch_val
from app.models.workspace_models import (
    ProductAccess, ProductAccessCreate, AccessType, Permission
)
from app.services.role_service import RoleService

logger = logging.getLogger(__name__)

class ProductAccessService:
    """Service for managing product access permissions."""
    
    @staticmethod
    async def grant_access(access_data: ProductAccessCreate, granted_by: str) -> ProductAccess:
        """Grant access to a product for a workspace, role, or individual."""
        try:
            # Check if user has permission to grant product access
            if not await ProductAccessService._can_manage_product_access(access_data.workspace_id, granted_by):
                raise ValueError("Insufficient permissions to grant product access")
            
            # Validate access type and target
            await ProductAccessService._validate_access_data(access_data)
            
            # Check if access already exists
            existing_access = await fetch_one("""
                SELECT id FROM product_access 
                WHERE product_id = $1 AND workspace_id = $2 AND access_type = $3 AND target_id = $4
            """, access_data.product_id, access_data.workspace_id, 
                 access_data.access_type, access_data.target_id)
            
            if existing_access:
                raise ValueError("Access already granted for this combination")
            
            # Grant access
            access_id = await fetch_val("""
                INSERT INTO product_access (product_id, workspace_id, access_type, target_id, granted_by)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
            """, access_data.product_id, access_data.workspace_id, 
                 access_data.access_type, access_data.target_id, granted_by)
            
            return await ProductAccessService.get_product_access(access_id)
            
        except Exception as e:
            logger.error(f"Failed to grant product access: {e}")
            raise
    
    @staticmethod
    async def get_product_access(access_id: int) -> Optional[ProductAccess]:
        """Get a specific product access record."""
        try:
            row = await fetch_one("""
                SELECT pa.*
                FROM product_access pa
                WHERE pa.id = $1
            """, access_id)
            
            if not row:
                return None
                
            return ProductAccess(
                id=row['id'],
                product_id=row['product_id'],
                workspace_id=row['workspace_id'],
                access_type=row['access_type'],
                target_id=row['target_id'],
                granted_by=row['granted_by'],
                granted_at=row['granted_at']
            )
            
        except Exception as e:
            logger.error(f"Failed to get product access {access_id}: {e}")
            raise
    
    @staticmethod
    async def get_product_access_list(product_id: int) -> List[ProductAccess]:
        """Get all access records for a specific product."""
        try:
            rows = await fetch_all("""
                SELECT pa.*
                FROM product_access pa
                WHERE pa.product_id = $1
                ORDER BY pa.granted_at DESC
            """, product_id)
            
            return [
                ProductAccess(
                    id=row['id'],
                    product_id=row['product_id'],
                    workspace_id=row['workspace_id'],
                    access_type=row['access_type'],
                    target_id=row['target_id'],
                    granted_by=row['granted_by'],
                    granted_at=row['granted_at']
                )
                for row in rows
            ]
            
        except Exception as e:
            logger.error(f"Failed to get product access list for product {product_id}: {e}")
            raise
    
    @staticmethod
    async def get_workspace_product_access(workspace_id: int) -> List[ProductAccess]:
        """Get all product access records for a specific workspace."""
        try:
            rows = await fetch_all("""
                SELECT pa.*
                FROM product_access pa
                WHERE pa.workspace_id = $1
                ORDER BY pa.granted_at DESC
            """, workspace_id)
            
            return [
                ProductAccess(
                    id=row['id'],
                    product_id=row['product_id'],
                    workspace_id=row['workspace_id'],
                    access_type=row['access_type'],
                    target_id=row['target_id'],
                    granted_by=row['granted_by'],
                    granted_at=row['granted_at']
                )
                for row in rows
            ]
            
        except Exception as e:
            logger.error(f"Failed to get workspace product access for workspace {workspace_id}: {e}")
            raise
    
    @staticmethod
    async def revoke_access(access_id: int, workspace_id: int, revoked_by: str) -> bool:
        """Revoke access to a product."""
        try:
            # Check if user has permission to revoke product access
            if not await ProductAccessService._can_manage_product_access(workspace_id, revoked_by):
                raise ValueError("Insufficient permissions to revoke product access")
            
            # Check if access exists and belongs to workspace
            existing_access = await fetch_one("""
                SELECT id FROM product_access 
                WHERE id = $1 AND workspace_id = $2
            """, access_id, workspace_id)
            
            if not existing_access:
                raise ValueError("Access record not found")
            
            # Revoke access
            await execute_query("""
                DELETE FROM product_access 
                WHERE id = $1
            """, access_id)
            
            logger.info(f"Product access {access_id} revoked by {revoked_by}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to revoke product access {access_id}: {e}")
            raise
    
    @staticmethod
    async def check_user_product_access(product_id: int, user_id: str, workspace_id: int) -> bool:
        """Check if a user has access to a specific product in a workspace."""
        try:
            # Check workspace-level access
            workspace_access = await fetch_one("""
                SELECT id FROM product_access 
                WHERE product_id = $1 AND workspace_id = $2 AND access_type = 'workspace'
            """, product_id, workspace_id)
            
            if workspace_access:
                return True
            
            # Check role-level access
            user_role = await RoleService._get_user_role(workspace_id, user_id)
            if user_role:
                role_access = await fetch_one("""
                    SELECT id FROM product_access 
                    WHERE product_id = $1 AND workspace_id = $2 AND access_type = 'role' AND target_id = $3
                """, product_id, workspace_id, user_role.get('id'))
                
                if role_access:
                    return True
            
            # Check individual access
            individual_access = await fetch_one("""
                SELECT id FROM product_access 
                WHERE product_id = $1 AND workspace_id = $2 AND access_type = 'individual' AND target_id = $3
            """, product_id, workspace_id, user_id)
            
            return individual_access is not None
            
        except Exception as e:
            logger.error(f"Failed to check user product access: {e}")
            return False
    
    @staticmethod
    async def get_user_accessible_products(user_id: str, workspace_id: int) -> List[int]:
        """Get all product IDs that a user can access in a workspace."""
        try:
            accessible_products = set()
            
            # Get workspace-level access
            workspace_products = await fetch_all("""
                SELECT DISTINCT product_id FROM product_access 
                WHERE workspace_id = $1 AND access_type = 'workspace'
            """, workspace_id)
            
            for row in workspace_products:
                accessible_products.add(row['product_id'])
            
            # Get role-level access
            user_role = await RoleService._get_user_role(workspace_id, user_id)
            if user_role:
                role_products = await fetch_all("""
                    SELECT DISTINCT product_id FROM product_access 
                    WHERE workspace_id = $1 AND access_type = 'role' AND target_id = $2
                """, workspace_id, user_role.get('id'))
                
                for row in role_products:
                    accessible_products.add(row['product_id'])
            
            # Get individual access
            individual_products = await fetch_all("""
                SELECT DISTINCT product_id FROM product_access 
                WHERE workspace_id = $1 AND access_type = 'individual' AND target_id = $2
            """, workspace_id, user_id)
            
            for row in individual_products:
                accessible_products.add(row['product_id'])
            
            return list(accessible_products)
            
        except Exception as e:
            logger.error(f"Failed to get user accessible products: {e}")
            return []
    
    @staticmethod
    async def _validate_access_data(access_data: ProductAccessCreate) -> None:
        """Validate access data before granting access."""
        if access_data.access_type == AccessType.ROLE and not access_data.target_id:
            raise ValueError("Target ID is required for role-based access")
        
        if access_data.access_type == AccessType.INDIVIDUAL and not access_data.target_id:
            raise ValueError("Target ID is required for individual access")
        
        if access_data.access_type == AccessType.WORKSPACE and access_data.target_id:
            raise ValueError("Target ID should not be specified for workspace-level access")
    
    @staticmethod
    async def _can_manage_product_access(workspace_id: int, user_id: str) -> bool:
        """Check if user can manage product access in the workspace."""
        try:
            # Check if user has product access management permission
            return await RoleService.check_user_permission(workspace_id, user_id, Permission.MANAGE_PRODUCT_ACCESS)
            
        except Exception as e:
            logger.error(f"Failed to check product access management permissions: {e}")
            return False
    
    @staticmethod
    async def bulk_grant_access(product_id: int, workspace_id: int, access_list: List[ProductAccessCreate], granted_by: str) -> List[ProductAccess]:
        """Grant access to multiple targets at once."""
        try:
            # Check if user has permission to grant product access
            if not await ProductAccessService._can_manage_product_access(workspace_id, granted_by):
                raise ValueError("Insufficient permissions to grant product access")
            
            granted_access = []
            
            for access_data in access_list:
                # Ensure workspace_id matches
                access_data.workspace_id = workspace_id
                
                # Validate access data
                await ProductAccessService._validate_access_data(access_data)
                
                # Check if access already exists
                existing_access = await fetch_one("""
                    SELECT id FROM product_access 
                    WHERE product_id = $1 AND workspace_id = $2 AND access_type = $3 AND target_id = $4
                """, access_data.product_id, access_data.workspace_id, 
                     access_data.access_type, access_data.target_id)
                
                if not existing_access:
                    # Grant access
                    access_id = await fetch_val("""
                        INSERT INTO product_access (product_id, workspace_id, access_type, target_id, granted_by)
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING id
                    """, access_data.product_id, access_data.workspace_id, 
                         access_data.access_type, access_data.target_id, granted_by)
                    
                    access = await ProductAccessService.get_product_access(access_id)
                    if access:
                        granted_access.append(access)
            
            logger.info(f"Bulk granted access to {len(granted_access)} targets for product {product_id}")
            return granted_access
            
        except Exception as e:
            logger.error(f"Failed to bulk grant product access: {e}")
            raise 