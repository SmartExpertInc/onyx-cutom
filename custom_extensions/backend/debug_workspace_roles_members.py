#!/usr/bin/env python3
"""
Debug script to test workspace roles and members retrieval.
"""

import asyncio
import sys
import os
import traceback

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.workspace_service import WorkspaceService
from app.services.role_service import RoleService

async def debug_workspace_data():
    """Debug workspace roles and members retrieval."""
    print("🔍 Starting workspace data debug...")
    
    try:
        # Test workspace ID from the logs
        workspace_id = 2
        test_user_id = "volynetskolia@gmail.com"
        
        print(f"📊 Testing workspace {workspace_id} for user {test_user_id}")
        
        # Step 1: Check if workspace exists
        print("🔍 Step 1: Checking if workspace exists...")
        workspace = await WorkspaceService.get_workspace(workspace_id)
        if workspace:
            print(f"✅ Workspace exists: {workspace.name} (ID: {workspace.id})")
        else:
            print("❌ Workspace not found!")
            return False
        
        # Step 2: Check if user is a member
        print("🔍 Step 2: Checking user membership...")
        try:
            member = await WorkspaceService.get_workspace_member(workspace_id, test_user_id)
            if member:
                print(f"✅ User is a member: {member.user_id} with role {member.role_id}")
            else:
                print("❌ User is not a member of the workspace!")
                return False
        except Exception as e:
            print(f"❌ Error checking membership: {e}")
            traceback.print_exc()
            return False
        
        # Step 3: Try to get workspace roles
        print("🔍 Step 3: Getting workspace roles...")
        try:
            roles = await RoleService.get_workspace_roles(workspace_id)
            print(f"✅ Found {len(roles)} roles:")
            for role in roles:
                print(f"   - {role.name} (ID: {role.id})")
        except Exception as e:
            print(f"❌ Error getting roles: {e}")
            traceback.print_exc()
            return False
        
        # Step 4: Try to get workspace members
        print("🔍 Step 4: Getting workspace members...")
        try:
            members = await WorkspaceService.get_workspace_members(workspace_id)
            print(f"✅ Found {len(members)} members:")
            for member in members:
                print(f"   - {member.user_id} (Role ID: {member.role_id})")
        except Exception as e:
            print(f"❌ Error getting members: {e}")
            traceback.print_exc()
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error during workspace data debug: {e}")
        print(f"📍 Error type: {type(e).__name__}")
        print("🔍 Full traceback:")
        traceback.print_exc()
        return False

async def main():
    """Main debug function."""
    print("=" * 60)
    print("🔍 WORKSPACE ROLES & MEMBERS DEBUG")
    print("=" * 60)
    
    success = await debug_workspace_data()
    
    print("=" * 60)
    if success:
        print("✅ DEBUG COMPLETED SUCCESSFULLY")
    else:
        print("❌ DEBUG FAILED - CHECK ERRORS ABOVE")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main()) 