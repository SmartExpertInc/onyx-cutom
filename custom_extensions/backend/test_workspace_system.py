#!/usr/bin/env python3
"""
Test script for the workspace management system.
This script tests the basic functionality of workspaces, roles, and members.
"""

import asyncio
import sys
import os

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

async def test_workspace_system():
    """Test the workspace management system."""
    print("🧪 Testing Workspace Management System")
    print("=" * 50)
    
    try:
        # Test database initialization
        print("\n1. Testing database initialization...")
        from app.core.database import init_database
        await init_database()
        print("✅ Database tables created successfully")
        
        # Test workspace creation
        print("\n2. Testing workspace creation...")
        from app.services.workspace_service import WorkspaceService
        from app.models.workspace_models import WorkspaceCreate
        
        workspace_data = WorkspaceCreate(
            name="Test Workspace",
            description="A test workspace for testing purposes"
        )
        
        workspace = await WorkspaceService.create_workspace(workspace_data, "test_user_123")
        print(f"✅ Workspace created: {workspace.name} (ID: {workspace.id})")
        
        # Test role retrieval
        print("\n3. Testing role retrieval...")
        from app.services.role_service import RoleService
        
        roles = await RoleService.get_workspace_roles(workspace.id)
        print(f"✅ Found {len(roles)} roles:")
        for role in roles:
            print(f"   - {role.name} ({role.color}) - {len(role.permissions)} permissions")
        
        # Test member retrieval
        print("\n4. Testing member retrieval...")
        members = await WorkspaceService.get_workspace_members(workspace.id)
        print(f"✅ Found {len(members)} members:")
        for member in members:
            print(f"   - {member.user_id} ({member.status}) - Role ID: {member.role_id}")
        
        # Test custom role creation
        print("\n5. Testing custom role creation...")
        from app.models.workspace_models import WorkspaceRoleCreate
        
        custom_role_data = WorkspaceRoleCreate(
            workspace_id=workspace.id,
            name="Custom Role",
            color="#FFE4E1",
            text_color="#DC143C",
            permissions=["view_content", "edit_content"]
        )
        
        custom_role = await RoleService.create_custom_role(custom_role_data, "test_user_123")
        print(f"✅ Custom role created: {custom_role.name}")
        
        # Test member addition
        print("\n6. Testing member addition...")
        from app.models.workspace_models import WorkspaceMemberCreate
        
        member_data = WorkspaceMemberCreate(
            workspace_id=workspace.id,
            user_id="new_member_456",
            role_id=custom_role.id,
            status="pending"
        )
        
        new_member = await WorkspaceService.add_member(workspace.id, member_data, "test_user_123")
        print(f"✅ Member added: {new_member.user_id}")
        
        # Test workspace with members
        print("\n7. Testing workspace with members...")
        workspace_full = await WorkspaceService.get_workspace_with_members(workspace.id)
        print(f"✅ Workspace retrieved with {len(workspace_full.members)} members and {len(workspace_full.roles)} roles")
        
        # Test product access
        print("\n8. Testing product access...")
        from app.services.product_access_service import ProductAccessService
        from app.models.workspace_models import ProductAccessCreate
        
        access_data = ProductAccessCreate(
            product_id=123,
            workspace_id=workspace.id,
            access_type="workspace"
        )
        
        access = await ProductAccessService.grant_access(access_data, "test_user_123")
        print(f"✅ Product access granted: {access.access_type}")
        
        # Test access checking
        has_access = await ProductAccessService.check_user_product_access(
            123, "test_user_123", workspace.id
        )
        print(f"✅ User access check: {has_access}")
        
        print("\n🎉 All tests passed successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

async def cleanup_test_data():
    """Clean up test data."""
    print("\n🧹 Cleaning up test data...")
    try:
        from app.core.database import execute_query
        
        # Clean up test data (in a real scenario, you'd want to be more careful)
        await execute_query("DELETE FROM product_access WHERE workspace_id IN (SELECT id FROM workspaces WHERE name = 'Test Workspace')")
        await execute_query("DELETE FROM workspace_members WHERE workspace_id IN (SELECT id FROM workspaces WHERE name = 'Test Workspace')")
        await execute_query("DELETE FROM workspace_roles WHERE workspace_id IN (SELECT id FROM workspaces WHERE name = 'Test Workspace')")
        await execute_query("DELETE FROM workspaces WHERE name = 'Test Workspace'")
        
        print("✅ Test data cleaned up")
        
    except Exception as e:
        print(f"⚠️  Warning: Could not clean up test data: {e}")

async def main():
    """Main test function."""
    print("🚀 Starting Workspace System Tests")
    print("=" * 50)
    
    success = await test_workspace_system()
    
    if success:
        await cleanup_test_data()
        print("\n✨ Test completed successfully!")
        return 0
    else:
        print("\n💥 Test failed!")
        return 1

if __name__ == "__main__":
    # Run the async test
    exit_code = asyncio.run(main())
    sys.exit(exit_code) 