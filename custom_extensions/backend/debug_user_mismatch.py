#!/usr/bin/env python3
"""
Debug script to identify user ID mismatch between backend and workspace storage
"""

import asyncio
import asyncpg

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': 'ookBossyauptyetPaxTy',
    'database': 'postgres'
}

async def debug_user_mismatch():
    """Debug the user ID mismatch issue."""
    
    try:
        conn = await asyncpg.connect(**DB_CONFIG)
        print("🔍 Debugging User ID Mismatch Issue")
        print("=" * 50)
        
        # 1. Show what's in workspace_members table
        print("\n1. 📋 Current workspace_members data:")
        members = await conn.fetch("""
            SELECT wm.*, w.name as workspace_name, wr.name as role_name
            FROM workspace_members wm
            JOIN workspaces w ON wm.workspace_id = w.id
            JOIN workspace_roles wr ON wm.role_id = wr.id
            ORDER BY wm.workspace_id, wm.id
        """)
        
        print(f"Found {len(members)} workspace members:")
        for member in members:
            print(f"   - ID: {member['id']}")
            print(f"     User ID: {member['user_id']}")
            print(f"     Workspace: {member['workspace_name']} (ID: {member['workspace_id']})")
            print(f"     Role: {member['role_name']} (ID: {member['role_id']})")
            print(f"     Status: {member['status']}")
            print()
        
        # 2. Show what user ID the backend is using
        backend_user_id = "2fcc283c-3df3-4bc5-af6b-2d7cd3afdcb2"  # From logs
        print(f"2. 🔍 Backend is looking for user ID: {backend_user_id}")
        
        # 3. Check if this UUID exists in any table
        print(f"\n3. 🔍 Checking if UUID {backend_user_id} exists anywhere:")
        
        # Check workspace_members
        uuid_in_members = await conn.fetch("SELECT * FROM workspace_members WHERE user_id = $1", backend_user_id)
        print(f"   - In workspace_members: {len(uuid_in_members)} records")
        
        # Check projects table
        uuid_in_projects = await conn.fetch("SELECT id, project_name FROM projects WHERE onyx_user_id = $1", backend_user_id)
        print(f"   - In projects (owned): {len(uuid_in_projects)} records")
        
        # 4. Show what user IDs are in workspace_members vs projects
        print(f"\n4. 📊 User ID formats comparison:")
        
        member_user_ids = await conn.fetch("SELECT DISTINCT user_id FROM workspace_members")
        print(f"   Workspace member user IDs ({len(member_user_ids)}):")
        for uid in member_user_ids:
            user_id = uid['user_id']
            print(f"     - '{user_id}' (length: {len(user_id)}, format: {'EMAIL' if '@' in user_id else 'UUID' if len(user_id) == 36 else 'OTHER'})")
        
        project_user_ids = await conn.fetch("SELECT DISTINCT onyx_user_id FROM projects WHERE onyx_user_id IS NOT NULL")
        print(f"   Project owner user IDs ({len(project_user_ids)}):")
        for uid in project_user_ids:
            user_id = uid['onyx_user_id']
            print(f"     - '{user_id}' (length: {len(user_id)}, format: {'EMAIL' if '@' in user_id else 'UUID' if len(user_id) == 36 else 'OTHER'})")
        
        # 5. Suggest solutions
        print(f"\n5. 💡 Suggested Solutions:")
        
        if not uuid_in_members and members:
            print("   ❌ Backend UUID not found in workspace_members")
            print("   💡 Solution 1: Update workspace_members to use UUIDs")
            print("   💡 Solution 2: Map UUID to email in backend queries")
            print("   💡 Solution 3: Store both UUID and email in workspace_members")
            
            # Show mapping suggestion
            if member_user_ids and project_user_ids:
                print(f"\n   🔗 Possible UUID ↔ Email mapping:")
                print(f"      Backend UUID: {backend_user_id}")
                
                # Try to find matching patterns
                for member in members:
                    print(f"      Member email: {member['user_id']} (in workspace: {member['workspace_name']})")
        
        # 6. Test the fix
        print(f"\n6. 🧪 Testing potential fix:")
        
        if members:
            test_email = members[0]['user_id']  # Use first member's email for testing
            print(f"   Testing with member email: {test_email}")
            
            # Test the modified query
            test_query = """
                SELECT DISTINCT p.id, p.project_name
                FROM projects p
                INNER JOIN product_access pa ON p.id = pa.product_id
                INNER JOIN workspace_members wm ON pa.workspace_id = wm.workspace_id
                WHERE wm.user_id = $1 
                  AND wm.status = 'active'
                  AND pa.access_type = 'workspace'
            """
            
            test_result = await conn.fetch(test_query, test_email)
            print(f"   Result: {len(test_result)} shared projects found for email")
            
            # Test with UUID
            test_result_uuid = await conn.fetch(test_query, backend_user_id)
            print(f"   Result: {len(test_result_uuid)} shared projects found for UUID")
        
        await conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_user_mismatch()) 