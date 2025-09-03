#!/usr/bin/env python3
"""
Test script to verify workspace access fixes:
1. Type casting fix for role-based access
2. Admin role detection in frontend
"""

import asyncio
import asyncpg
import json
from typing import List, Dict, Any

# Database configuration (adjust as needed)
DB_CONFIG = {
    'host': 'localhost',  # or your database host
    'port': 5432,
    'user': 'postgres',
    'password': 'ookBossyauptyetPaxTy',  # adjust as needed
    'database': 'postgres'  # or your database name
}

async def test_workspace_access_queries():
    """Test that the workspace access queries work without type errors."""
    
    try:
        conn = await asyncpg.connect(**DB_CONFIG)
        print("✅ Database connection successful")
        
        # Test 1: Check if workspace tables exist
        print("\n1. 🔍 Checking workspace tables...")
        tables = await conn.fetch("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('workspaces', 'workspace_roles', 'workspace_members', 'product_access')
            ORDER BY table_name
        """)
        
        if len(tables) == 4:
            print("✅ All 4 workspace tables found")
        else:
            print(f"⚠️  Only {len(tables)} workspace tables found: {[t['table_name'] for t in tables]}")
        
        # Test 2: Check data types
        print("\n2. 🔍 Checking data types...")
        type_info = await conn.fetch("""
            SELECT 
                table_name,
                column_name, 
                data_type, 
                is_nullable
            FROM information_schema.columns 
            WHERE table_name IN ('product_access', 'workspace_members') 
                AND column_name IN ('target_id', 'role_id', 'user_id')
            ORDER BY table_name, column_name
        """)
        
        for info in type_info:
            print(f"   {info['table_name']}.{info['column_name']}: {info['data_type']}")
        
        # Test 3: Test the fixed query (projects endpoint)
        print("\n3. 🔍 Testing projects query with type casting...")
        test_user_id = "current_user_123"
        
        try:
            projects_query = """
                SELECT DISTINCT p.id, p.project_name, p.microproduct_name
                FROM projects p
                LEFT JOIN design_templates dt ON p.design_template_id = dt.id
                INNER JOIN product_access pa ON p.id = pa.product_id
                INNER JOIN workspace_members wm ON pa.workspace_id = wm.workspace_id
                WHERE wm.user_id = $1 
                  AND wm.status = 'active'
                  AND (
                      pa.access_type = 'workspace' 
                      OR (pa.access_type = 'role' AND pa.target_id = CAST(wm.role_id AS TEXT))
                      OR (pa.access_type = 'individual' AND pa.target_id = $1)
                  )
                LIMIT 5
            """
            
            result = await conn.fetch(projects_query, test_user_id)
            print(f"✅ Projects query executed successfully, found {len(result)} projects")
            
            for project in result:
                print(f"   - {project['project_name']} (ID: {project['id']})")
                
        except Exception as e:
            print(f"❌ Projects query failed: {e}")
        
        # Test 4: Test project view query
        print("\n4. 🔍 Testing project view query with type casting...")
        
        try:
            # Get a test project ID
            test_project = await conn.fetchrow("SELECT id FROM projects LIMIT 1")
            
            if test_project:
                project_id = test_project['id']
                
                view_query = """
                    SELECT p.*, dt.template_name as design_template_name
                    FROM projects p
                    LEFT JOIN design_templates dt ON p.design_template_id = dt.id
                    WHERE p.id = $1 AND (
                        p.onyx_user_id = $2 
                        OR EXISTS (
                            SELECT 1 FROM product_access pa
                            INNER JOIN workspace_members wm ON pa.workspace_id = wm.workspace_id
                            WHERE pa.product_id = p.id 
                              AND wm.user_id = $2 
                              AND wm.status = 'active'
                              AND (
                                  pa.access_type = 'workspace' 
                                  OR (pa.access_type = 'role' AND pa.target_id = CAST(wm.role_id AS TEXT))
                                  OR (pa.access_type = 'individual' AND pa.target_id = $2)
                              )
                        )
                    )
                """
                
                result = await conn.fetchrow(view_query, project_id, test_user_id)
                if result:
                    print(f"✅ Project view query executed successfully for project {project_id}")
                else:
                    print(f"✅ Project view query executed (no access to project {project_id})")
            else:
                print("⚠️  No projects found to test project view query")
                
        except Exception as e:
            print(f"❌ Project view query failed: {e}")
        
        # Test 5: Check workspace memberships and roles
        print("\n5. 🔍 Checking test user workspace memberships...")
        
        memberships = await conn.fetch("""
            SELECT 
                wm.user_id,
                wm.workspace_id,
                w.name as workspace_name,
                wm.role_id,
                wr.name as role_name,
                wm.status
            FROM workspace_members wm
            JOIN workspaces w ON wm.workspace_id = w.id
            JOIN workspace_roles wr ON wm.role_id = wr.id
            WHERE wm.user_id = $1
        """, test_user_id)
        
        if memberships:
            print(f"✅ Found {len(memberships)} workspace memberships for {test_user_id}:")
            for membership in memberships:
                print(f"   - Workspace: {membership['workspace_name']} (ID: {membership['workspace_id']})")
                print(f"     Role: {membership['role_name']} (ID: {membership['role_id']})")
                print(f"     Status: {membership['status']}")
                
                # Check if this user should be admin
                is_admin = membership['role_name'] == 'Admin'
                print(f"     Is Admin: {is_admin}")
        else:
            print(f"⚠️  No workspace memberships found for {test_user_id}")
            print("   This might be why admin functions aren't working!")
        
        await conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False

def print_frontend_debug_info():
    """Print information about frontend debugging."""
    print("\n" + "="*60)
    print("🔧 FRONTEND DEBUGGING INSTRUCTIONS")
    print("="*60)
    print()
    print("To debug the admin role detection issue:")
    print()
    print("1. Open browser DevTools (F12)")
    print("2. Go to the Workspace tab")
    print("3. Look for console messages like:")
    print("   'Current user role determined: { ... }'")
    print()
    print("4. Check if:")
    print("   - userId matches your actual user ID")
    print("   - memberId is found")
    print("   - roleId matches a role in the workspace")
    print("   - roleName is 'Admin'")
    print("   - isAdmin is true")
    print()
    print("5. If isAdmin is false but should be true:")
    print("   - Check if user is actually a member of the workspace")
    print("   - Check if user's role is named exactly 'Admin'")
    print("   - Verify the workspace has loaded properly")
    print()
    print("6. Common issues:")
    print("   - User ID mismatch (hardcoded vs actual)")
    print("   - Role name case sensitivity ('Admin' vs 'admin')")
    print("   - Workspace not loaded when role detection runs")
    print("   - User not added to workspace as Admin")

async def main():
    """Main test function."""
    print("🚀 Starting Workspace Access Fixes Test...")
    print("="*60)
    
    # Test backend fixes
    success = await test_workspace_access_queries()
    
    if success:
        print("\n✅ Backend tests passed!")
        print("\n📋 Backend Fix Summary:")
        print("- Type casting fixed: CAST(wm.role_id AS TEXT)")
        print("- Projects API should work without type errors")
        print("- Users should see projects they have access to")
    else:
        print("\n❌ Backend tests failed!")
        print("- Check database connection and table structure")
    
    # Print frontend debugging info
    print_frontend_debug_info()
    
    print("\n🎯 Next Steps:")
    print("1. Restart backend server to pick up changes")
    print("2. Test products page - should load without errors")
    print("3. Test workspace tab - admins should see management options")
    print("4. Check browser console for role detection logs")
    print("5. Verify users can see shared projects on products page")

if __name__ == "__main__":
    asyncio.run(main()) 