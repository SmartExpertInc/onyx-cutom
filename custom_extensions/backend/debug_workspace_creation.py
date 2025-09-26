#!/usr/bin/env python3
"""
Debug script to test workspace creation and identify the 500 error.
"""

import asyncio
import sys
import os
import traceback

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.models.workspace_models import WorkspaceCreate
from app.services.workspace_service import WorkspaceService
from app.core.database import init_database

async def debug_workspace_creation():
    """Debug workspace creation step by step."""
    print("🔍 Starting workspace creation debug...")
    
    try:
        # Step 1: Initialize database
        print("📊 Step 1: Initializing database...")
        await init_database()
        print("✅ Database initialized successfully")
        
        # Step 2: Create test workspace data
        print("📝 Step 2: Creating test workspace data...")
        workspace_data = WorkspaceCreate(
            name="Debug Test Workspace",
            description="A test workspace for debugging",
            is_active=True
        )
        print(f"✅ Workspace data created: {workspace_data}")
        
        # Step 3: Test user ID
        test_user_id = "debug_user@test.com"
        print(f"👤 Step 3: Using test user ID: {test_user_id}")
        
        # Step 4: Attempt workspace creation
        print("🚀 Step 4: Attempting workspace creation...")
        workspace = await WorkspaceService.create_workspace(workspace_data, test_user_id)
        print(f"✅ Workspace created successfully!")
        print(f"   ID: {workspace.id}")
        print(f"   Name: {workspace.name}")
        print(f"   Created by: {workspace.created_by}")
        
        # Step 5: Verify workspace exists
        print("🔍 Step 5: Verifying workspace exists...")
        retrieved_workspace = await WorkspaceService.get_workspace(workspace.id)
        if retrieved_workspace:
            print("✅ Workspace retrieval successful!")
        else:
            print("❌ Workspace retrieval failed!")
            
        # Step 6: Check user workspaces
        print("📋 Step 6: Checking user workspaces...")
        user_workspaces = await WorkspaceService.get_user_workspaces(test_user_id)
        print(f"✅ User has {len(user_workspaces)} workspaces")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during workspace creation debug: {e}")
        print(f"📍 Error type: {type(e).__name__}")
        print("🔍 Full traceback:")
        traceback.print_exc()
        return False

async def main():
    """Main debug function."""
    print("=" * 60)
    print("🚀 WORKSPACE CREATION DEBUG SCRIPT")
    print("=" * 60)
    
    success = await debug_workspace_creation()
    
    print("=" * 60)
    if success:
        print("✅ DEBUG COMPLETED SUCCESSFULLY")
    else:
        print("❌ DEBUG FAILED - CHECK ERRORS ABOVE")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main()) 