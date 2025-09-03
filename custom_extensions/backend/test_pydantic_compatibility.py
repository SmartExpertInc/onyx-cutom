#!/usr/bin/env python3
"""
Test script to verify Pydantic compatibility with workspace models.
This script tests that all models can be imported and instantiated correctly.
"""

import sys
import os

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

def test_pydantic_compatibility():
    """Test that all workspace models work with the current Pydantic version."""
    print("🧪 Testing Pydantic Compatibility")
    print("=" * 40)
    
    try:
        # Test model imports
        print("1. Testing model imports...")
        from app.models.workspace_models import (
            WorkspaceCreate, WorkspaceUpdate, Workspace,
            WorkspaceRoleCreate, WorkspaceRoleUpdate, WorkspaceRole,
            WorkspaceMemberCreate, WorkspaceMemberUpdate, WorkspaceMember,
            ProductAccessCreate, ProductAccess,
            Permission, DEFAULT_ROLES
        )
        print("✅ All models imported successfully")
        
        # Test workspace creation
        print("\n2. Testing WorkspaceCreate model...")
        workspace_data = WorkspaceCreate(
            name="Test Workspace",
            description="A test workspace"
        )
        print(f"✅ WorkspaceCreate: {workspace_data.name}")
        
        # Test role creation with color validation
        print("\n3. Testing WorkspaceRoleCreate with color validation...")
        role_data = WorkspaceRoleCreate(
            workspace_id=1,
            name="Test Role",
            color="#FF6B6B",
            text_color="#FFFFFF",
            permissions=[Permission.VIEW_CONTENT, Permission.EDIT_CONTENT]
        )
        print(f"✅ WorkspaceRoleCreate: {role_data.name} ({role_data.color})")
        
        # Test invalid color (should raise validation error)
        print("\n4. Testing color validation (invalid color)...")
        try:
            invalid_role = WorkspaceRoleCreate(
                workspace_id=1,
                name="Invalid Role",
                color="invalid-color",  # This should fail
                text_color="#FFFFFF",
                permissions=[Permission.VIEW_CONTENT]
            )
            print("❌ Color validation failed - invalid color was accepted")
            return False
        except Exception as e:
            print(f"✅ Color validation works: {type(e).__name__}")
        
        # Test member creation
        print("\n5. Testing WorkspaceMemberCreate model...")
        member_data = WorkspaceMemberCreate(
            workspace_id=1,
            user_id="test_user",
            role_id=1,
            status="pending"
        )
        print(f"✅ WorkspaceMemberCreate: {member_data.user_id}")
        
        # Test product access
        print("\n6. Testing ProductAccessCreate model...")
        access_data = ProductAccessCreate(
            product_id=123,
            workspace_id=1,
            access_type="workspace"
        )
        print(f"✅ ProductAccessCreate: {access_data.access_type}")
        
        # Test default roles
        print("\n7. Testing default roles...")
        print(f"✅ Default roles loaded: {len(DEFAULT_ROLES)} roles")
        for role_key, role_data in DEFAULT_ROLES.items():
            print(f"   - {role_data['name']} ({role_data['color']})")
        
        print("\n🎉 All Pydantic compatibility tests passed!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_pydantic_compatibility()
    if success:
        print("\n✨ Pydantic compatibility verified!")
        sys.exit(0)
    else:
        print("\n💥 Pydantic compatibility test failed!")
        sys.exit(1) 