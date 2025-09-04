#!/usr/bin/env python3
"""
Test script to verify that the workspace membership fix is working.
"""

import asyncio
import sys
import os
import asyncpg
from typing import List, Dict, Any

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_main_db_pool

async def test_workspace_membership_fix():
    """Test that workspace membership queries work with both UUID and email."""
    print("🔍 Testing workspace membership fix...")
    
    try:
        # Get database connection
        pool = await get_main_db_pool()
        
        async with pool.acquire() as conn:
            # Test data from the logs
            test_uuid = "8cec6d10-06bd-474b-aa75-9e3682930b26"
            test_email = "volynetskolia@gmail.com"
            
            print(f"📊 Testing with UUID: {test_uuid}")
            print(f"📧 Testing with Email: {test_email}")
            
            # Test 1: Check workspace membership with UUID (should fail)
            print("\n1. 🔍 Testing workspace membership with UUID...")
            uuid_memberships = await conn.fetch("""
                SELECT wm.*, w.name as workspace_name, wr.name as role_name
                FROM workspace_members wm
                JOIN workspaces w ON wm.workspace_id = w.id
                JOIN workspace_roles wr ON wm.role_id = wr.id
                WHERE wm.user_id = $1
            """, test_uuid)
            
            print(f"   UUID memberships found: {len(uuid_memberships)}")
            for membership in uuid_memberships:
                print(f"   - Workspace: {membership['workspace_name']} (ID: {membership['workspace_id']})")
                print(f"     Role: {membership['role_name']} (Status: {membership['status']})")
            
            # Test 2: Check workspace membership with email (should succeed)
            print("\n2. 🔍 Testing workspace membership with email...")
            email_memberships = await conn.fetch("""
                SELECT wm.*, w.name as workspace_name, wr.name as role_name
                FROM workspace_members wm
                JOIN workspaces w ON wm.workspace_id = w.id
                JOIN workspace_roles wr ON wm.role_id = wr.id
                WHERE wm.user_id = $1
            """, test_email)
            
            print(f"   Email memberships found: {len(email_memberships)}")
            for membership in email_memberships:
                print(f"   - Workspace: {membership['workspace_name']} (ID: {membership['workspace_id']})")
                print(f"     Role: {membership['role_name']} (Status: {membership['status']})")
            
            # Test 3: Check shared projects query with both UUID and email
            if email_memberships:
                workspace_id = email_memberships[0]['workspace_id']
                print(f"\n3. 🔍 Testing shared projects query for workspace {workspace_id}...")
                
                shared_projects = await conn.fetch("""
                    SELECT DISTINCT p.id, p.project_name, p.microproduct_name
                    FROM projects p
                    LEFT JOIN design_templates dt ON p.design_template_id = dt.id
                    INNER JOIN product_access pa ON p.id = pa.product_id
                    INNER JOIN workspace_members wm ON pa.workspace_id = wm.workspace_id
                    WHERE (wm.user_id = $1 OR wm.user_id = $2)
                      AND wm.status = 'active'
                      AND pa.access_type IN ('workspace', 'role', 'individual')
                      AND (
                          pa.access_type = 'workspace' 
                          OR (pa.access_type = 'role' AND pa.target_id = CAST(wm.role_id AS TEXT))
                          OR (pa.access_type = 'individual' AND (pa.target_id = $1 OR pa.target_id = $2))
                      )
                    LIMIT 5
                """, test_uuid, test_email)
                
                print(f"   Shared projects found: {len(shared_projects)}")
                for project in shared_projects:
                    print(f"   - Project: {project['project_name']} (ID: {project['id']})")
            
            # Test 4: Check product access records
            if email_memberships:
                print(f"\n4. 🔍 Testing product access records...")
                
                for membership in email_memberships:
                    access_records = await conn.fetch("""
                        SELECT pa.*, p.project_name
                        FROM product_access pa
                        JOIN projects p ON pa.product_id = p.id
                        WHERE pa.workspace_id = $1
                        LIMIT 5
                    """, membership['workspace_id'])
                    
                    print(f"   Workspace {membership['workspace_name']}: {len(access_records)} access records")
                    for access in access_records:
                        print(f"   - Project: {access['project_name']} (Access: {access['access_type']})")
            
            # Summary
            print(f"\n📊 Summary:")
            print(f"   ✅ UUID memberships: {len(uuid_memberships)}")
            print(f"   ✅ Email memberships: {len(email_memberships)}")
            
            if email_memberships and not uuid_memberships:
                print(f"   🎯 FIX CONFIRMED: Workspace members are stored with emails, not UUIDs")
                print(f"   💡 Projects query should use email for workspace access")
            elif uuid_memberships and not email_memberships:
                print(f"   ⚠️  Workspace members are stored with UUIDs, not emails")
            elif email_memberships and uuid_memberships:
                print(f"   🤔 Workspace members found with both UUIDs and emails")
            else:
                print(f"   ❌ No workspace memberships found with either UUID or email")
            
        await pool.close()
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(test_workspace_membership_fix()) 