#!/usr/bin/env python3
"""
Script to fix all broken get_current_user_id() calls in workspace endpoints.
"""

import re

def fix_workspace_endpoints():
    """Fix all workspace endpoints with broken get_current_user_id calls."""
    
    # Read the main.py file
    with open('main.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("🔍 Original file size:", len(content), "characters")
    
    # Pattern to find and replace the broken calls
    # Look for: current_user_id = await get_current_user_id()
    # Replace with proper user identification
    
    old_pattern = r'current_user_id = await get_current_user_id\(\)'
    new_replacement = '''# Get user identifiers
        user_uuid, user_email = await get_user_identifiers_for_workspace(request)
        current_user_id = user_email if user_email else user_uuid'''
    
    # Count occurrences
    matches = re.findall(old_pattern, content)
    print(f"🔍 Found {len(matches)} instances of broken get_current_user_id() calls")
    
    # Replace all occurrences
    fixed_content = re.sub(old_pattern, new_replacement, content)
    
    # Also need to add request: Request parameter to function signatures
    # This is trickier, so let's do it manually for the specific endpoints
    
    # Find all workspace endpoint function signatures that need request parameter
    endpoint_patterns = [
        (r'async def delete_workspace\(workspace_id: int\):', 
         r'async def delete_workspace(workspace_id: int, request: Request):'),
        (r'async def update_workspace\(workspace_data: WorkspaceUpdate, workspace_id: int\):', 
         r'async def update_workspace(workspace_data: WorkspaceUpdate, workspace_id: int, request: Request):'),
        (r'async def create_role\(role_data: WorkspaceRoleCreate, workspace_id: int\):', 
         r'async def create_role(role_data: WorkspaceRoleCreate, workspace_id: int, request: Request):'),
        (r'async def update_role\(role_data: WorkspaceRoleUpdate, workspace_id: int, role_id: int\):', 
         r'async def update_role(role_data: WorkspaceRoleUpdate, workspace_id: int, role_id: int, request: Request):'),
        (r'async def add_member\(member_data: WorkspaceMemberCreate, workspace_id: int\):', 
         r'async def add_member(member_data: WorkspaceMemberCreate, workspace_id: int, request: Request):'),
        (r'async def leave_workspace\(workspace_id: int\):', 
         r'async def leave_workspace(workspace_id: int, request: Request):'),
    ]
    
    for old_sig, new_sig in endpoint_patterns:
        if re.search(old_sig, fixed_content):
            print(f"✅ Fixing function signature: {old_sig}")
            fixed_content = re.sub(old_sig, new_sig, fixed_content)
        else:
            print(f"⚠️  Function signature not found or already fixed: {old_sig}")
    
    # Write the fixed content back
    with open('main.py', 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    
    print("✅ Fixed file written successfully")
    print("🔍 New file size:", len(fixed_content), "characters")
    
    # Verify the fixes
    with open('main.py', 'r', encoding='utf-8') as f:
        verification_content = f.read()
    
    remaining_broken_calls = re.findall(old_pattern, verification_content)
    print(f"🔍 Remaining broken calls after fix: {len(remaining_broken_calls)}")
    
    if len(remaining_broken_calls) == 0:
        print("🎉 All broken get_current_user_id() calls have been fixed!")
        return True
    else:
        print("❌ Some broken calls still remain")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🔧 FIXING WORKSPACE ENDPOINTS")
    print("=" * 60)
    
    success = fix_workspace_endpoints()
    
    print("=" * 60)
    if success:
        print("✅ ALL FIXES APPLIED SUCCESSFULLY")
    else:
        print("❌ SOME FIXES FAILED - CHECK MANUALLY")
    print("=" * 60) 