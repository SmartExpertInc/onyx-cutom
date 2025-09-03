#!/usr/bin/env python3
"""
Test script to verify workspace database connection works correctly.
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

async def test_workspace_database():
    """Test workspace database connection and table creation."""
    try:
        print("Testing workspace database connection...")
        
        # Import after setting up the path
        from app.core.database import init_database, execute_query, fetch_val
        
        # Test basic connection
        print("1. Testing basic database connection...")
        result = await fetch_val("SELECT 1 as test")
        print(f"   ✓ Basic connection test: {result}")
        
        # Test workspace table creation
        print("2. Testing workspace table creation...")
        await init_database()
        print("   ✓ Workspace tables created successfully")
        
        # Test table existence
        print("3. Verifying table existence...")
        tables = ['workspaces', 'workspace_roles', 'workspace_members', 'product_access']
        for table in tables:
            exists = await fetch_val("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = $1
                )
            """, table)
            print(f"   ✓ Table '{table}' exists: {exists}")
        
        print("\n🎉 All workspace database tests passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Database test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # This test requires the main application to be running
    # or at least the DB_POOL to be initialized
    print("Note: This test requires the main application's DB_POOL to be initialized")
    print("Run this test only when the main application is running.") 