#!/usr/bin/env python3
"""
Fix Workspace Memberships Script

This script fixes the user ID mismatch issue where:
1. Workspaces were created by "current_user_123"
2. But the real user has a different ID/email
3. Creator is not actually a member of their own workspace
"""

import asyncio
import asyncpg
import sys

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': 'ookBossyauptyetPaxTy',
    'database': 'postgres'
}

async def fix_workspace_memberships():
    """Fix existing workspace memberships with correct user IDs."""
    
    try:
        conn = await asyncpg.connect(**DB_CONFIG)
        print("🔧 Fixing Workspace Memberships")
        print("=" * 40)
        
        # 1. Find workspaces created by placeholder user
        print("\n1. 🔍 Finding workspaces created by placeholder user...")
        workspaces = await conn.fetch("""
            SELECT id, name, created_by, created_at FROM workspaces 
            WHERE created_by = 'current_user_123'
            ORDER BY created_at DESC
        """)
        
        if not workspaces:
            print("✅ No workspaces found with placeholder user ID")
            await conn.close()
            return
        
        print(f"Found {len(workspaces)} workspaces to fix:")
        for ws in workspaces:
            print(f"   - {ws['name']} (ID: {ws['id']}) - Created: {ws['created_at']}")
        
        # 2. Determine the real user ID
        print(f"\n2. 🔍 Determining real user ID...")
        
        # Option A: Ask user to provide the real user ID
        print("Please provide the real user ID/email to use:")
        print("Examples:")
        print("  - admin@test.com")
        print("  - user@example.com") 
        print("  - 2fcc283c-3df3-4bc5-af6b-2d7cd3afdcb2")
        
        real_user_id = input("Enter real user ID: ").strip()
        
        if not real_user_id:
            print("❌ No user ID provided. Exiting.")
            await conn.close()
            return
        
        print(f"✅ Using real user ID: {real_user_id}")
        
        # 3. Fix each workspace
        print(f"\n3. 🔧 Fixing workspace memberships...")
        
        for workspace in workspaces:
            workspace_id = workspace['id']
            workspace_name = workspace['name']
            
            print(f"\n   Fixing: {workspace_name} (ID: {workspace_id})")
            
            # Update workspace creator
            await conn.execute("""
                UPDATE workspaces SET created_by = $1 WHERE id = $2
            """, real_user_id, workspace_id)
            print(f"   ✅ Updated workspace creator to: {real_user_id}")
            
            # Get admin role for this workspace
            admin_role = await conn.fetchrow("""
                SELECT id FROM workspace_roles 
                WHERE workspace_id = $1 AND name = 'Admin'
            """, workspace_id)
            
            if not admin_role:
                print(f"   ❌ No Admin role found for workspace {workspace_id}")
                continue
            
            # Check if placeholder member exists
            placeholder_member = await conn.fetchrow("""
                SELECT id FROM workspace_members 
                WHERE workspace_id = $1 AND user_id = 'current_user_123'
            """, workspace_id)
            
            if placeholder_member:
                # Update existing placeholder member
                await conn.execute("""
                    UPDATE workspace_members 
                    SET user_id = $1 
                    WHERE workspace_id = $2 AND user_id = 'current_user_123'
                """, real_user_id, workspace_id)
                print(f"   ✅ Updated existing member from placeholder to: {real_user_id}")
            else:
                # Add new admin member
                await conn.execute("""
                    INSERT INTO workspace_members (workspace_id, user_id, role_id, status, joined_at)
                    VALUES ($1, $2, $3, 'active', NOW())
                    ON CONFLICT (workspace_id, user_id) DO NOTHING
                """, workspace_id, real_user_id, admin_role['id'])
                print(f"   ✅ Added new admin member: {real_user_id}")
        
        # 4. Verify fixes
        print(f"\n4. ✅ Verifying fixes...")
        
        # Check updated workspaces
        updated_workspaces = await conn.fetch("""
            SELECT w.id, w.name, w.created_by,
                   COUNT(wm.id) as member_count
            FROM workspaces w
            LEFT JOIN workspace_members wm ON w.id = wm.workspace_id
            WHERE w.created_by = $1
            GROUP BY w.id, w.name, w.created_by
            ORDER BY w.created_at DESC
        """, real_user_id)
        
        print(f"✅ Fixed {len(updated_workspaces)} workspaces:")
        for ws in updated_workspaces:
            print(f"   - {ws['name']} (ID: {ws['id']}) - Members: {ws['member_count']}")
        
        # Check user memberships
        memberships = await conn.fetch("""
            SELECT wm.*, w.name as workspace_name, wr.name as role_name
            FROM workspace_members wm
            JOIN workspaces w ON wm.workspace_id = w.id
            JOIN workspace_roles wr ON wm.role_id = wr.id
            WHERE wm.user_id = $1
        """, real_user_id)
        
        print(f"✅ User {real_user_id} is now a member of {len(memberships)} workspaces:")
        for membership in memberships:
            print(f"   - {membership['workspace_name']} as {membership['role_name']} ({membership['status']})")
        
        await conn.close()
        
        print(f"\n🎉 Workspace membership fix completed successfully!")
        print(f"   - Fixed {len(workspaces)} workspaces")
        print(f"   - User {real_user_id} is now properly added as admin")
        print(f"   - Ready to test workspace access")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🚀 Workspace Membership Fix Tool")
    print("This will fix the user ID mismatch in workspace memberships")
    print()
    
    asyncio.run(fix_workspace_memberships()) 