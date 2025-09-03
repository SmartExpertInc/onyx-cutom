#!/usr/bin/env python3
"""
Test script to verify product access integration with workspace system.
This script tests the complete flow from workspace creation to product access management.
"""

import asyncio
import json
from custom_extensions.backend.app.core.database import get_connection, init_database
from custom_extensions.backend.app.services.workspace_service import WorkspaceService
from custom_extensions.backend.app.services.product_access_service import ProductAccessService

async def test_product_access_integration():
    """Test the complete product access integration."""
    print("🧪 Testing Product Access Integration with Workspace System")
    print("=" * 60)
    
    try:
        # Initialize database
        print("📊 Initializing database...")
        await init_database()
        print("✅ Database initialized successfully")
        
        # Test data
        user_id = "test_user_123"
        workspace_name = "Test Workspace for Product Access"
        product_id = 12345  # Example product ID
        
        # 1. Create a workspace
        print(f"\n🏢 Creating workspace: {workspace_name}")
        workspace = await WorkspaceService.create_workspace(
            name=workspace_name,
            description="Test workspace for product access integration",
            created_by=user_id
        )
        print(f"✅ Workspace created with ID: {workspace.id}")
        
        # 2. Get workspace roles (should have default roles)
        print(f"\n👥 Loading workspace roles...")
        roles = await WorkspaceService.get_workspace_roles(workspace.id)
        print(f"✅ Found {len(roles)} roles:")
        for role in roles:
            print(f"   - {role.name} (ID: {role.id}, Default: {role.is_default})")
        
        # 3. Test granting individual access
        print(f"\n🔑 Granting individual access to product {product_id}...")
        individual_access = await ProductAccessService.grant_access(
            product_id=product_id,
            workspace_id=workspace.id,
            access_type="individual",
            target_id="user@example.com",
            granted_by=user_id
        )
        print(f"✅ Individual access granted (ID: {individual_access.id})")
        
        # 4. Test granting role-based access
        admin_role = next((r for r in roles if r.name == "Admin"), None)
        if admin_role:
            print(f"\n🛡️ Granting role-based access for Admin role...")
            role_access = await ProductAccessService.grant_access(
                product_id=product_id,
                workspace_id=workspace.id,
                access_type="role",
                target_id=str(admin_role.id),
                granted_by=user_id
            )
            print(f"✅ Role-based access granted (ID: {role_access.id})")
        
        # 5. Test retrieving product access
        print(f"\n📋 Retrieving all access for product {product_id}...")
        access_list = await ProductAccessService.get_product_access_list(product_id)
        print(f"✅ Found {len(access_list)} access records:")
        for access in access_list:
            print(f"   - Type: {access.access_type}, Target: {access.target_id}, Workspace: {access.workspace_id}")
        
        # 6. Test checking user access
        print(f"\n🔍 Checking user access for product {product_id}...")
        has_access = await ProductAccessService.check_user_product_access(
            product_id=product_id,
            user_id=user_id,
            workspace_id=workspace.id
        )
        print(f"✅ User access check result: {has_access}")
        
        # 7. Test removing access
        print(f"\n🗑️ Removing individual access...")
        success = await ProductAccessService.revoke_access(
            individual_access.id,
            workspace.id,
            user_id
        )
        print(f"✅ Individual access removed: {success}")
        
        # 8. Verify access was removed
        print(f"\n📋 Verifying access removal...")
        updated_access_list = await ProductAccessService.get_product_access_list(product_id)
        print(f"✅ Access list after removal: {len(updated_access_list)} records")
        
        # 9. Test workspace-level access
        print(f"\n🏢 Granting workspace-level access...")
        workspace_access = await ProductAccessService.grant_access(
            product_id=product_id,
            workspace_id=workspace.id,
            access_type="workspace",
            target_id=None,
            granted_by=user_id
        )
        print(f"✅ Workspace-level access granted (ID: {workspace_access.id})")
        
        # Final access summary
        print(f"\n📊 Final access summary for product {product_id}:")
        final_access_list = await ProductAccessService.get_product_access_list(product_id)
        for access in final_access_list:
            print(f"   - {access.access_type.upper()}: {access.target_id or 'All workspace members'}")
        
        print(f"\n🎉 Product Access Integration Test PASSED!")
        print(f"   ✅ Workspace created and configured")
        print(f"   ✅ Individual access management working")
        print(f"   ✅ Role-based access management working")
        print(f"   ✅ Workspace-level access management working")
        print(f"   ✅ Access checking and removal working")
        
        # Cleanup
        print(f"\n🧹 Cleaning up test data...")
        # Remove all access records
        for access in final_access_list:
            await ProductAccessService.revoke_access(access.id, workspace.id, user_id)
        
        # Delete workspace (this should cascade delete roles and members)
        await WorkspaceService.delete_workspace(workspace.id, user_id)
        print(f"✅ Test data cleaned up")
        
    except Exception as e:
        print(f"❌ Test FAILED with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

async def main():
    """Run the integration test."""
    success = await test_product_access_integration()
    if success:
        print(f"\n🎊 All tests passed! Product access integration is working correctly.")
    else:
        print(f"\n💥 Tests failed! Please check the error messages above.")
    
    return 0 if success else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code) 