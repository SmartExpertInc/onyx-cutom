#!/usr/bin/env python3
"""
Script to add detailed error logging to workspace endpoints.
"""

import re

def fix_error_logging():
    """Add detailed error logging to workspace endpoints."""
    
    # Read the main.py file
    with open('main.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("🔍 Adding detailed error logging to workspace endpoints...")
    
    # Pattern 1: Fix generic error handling for roles endpoint
    old_roles_error = r'''    except Exception as e:
        raise HTTPException\(status_code=500, detail="Failed to retrieve roles"\)'''
    
    new_roles_error = '''    except Exception as e:
        logger.error(f"❌ [WORKSPACE ROLES] Failed to get roles for workspace {workspace_id}: {e}")
        logger.error(f"❌ [WORKSPACE ROLES] Error type: {type(e).__name__}")
        import traceback
        logger.error(f"❌ [WORKSPACE ROLES] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve roles: {str(e)}")'''
    
    content = re.sub(old_roles_error, new_roles_error, content, flags=re.MULTILINE)
    
    # Pattern 2: Fix generic error handling for members endpoint
    old_members_error = r'''    except Exception as e:
        raise HTTPException\(status_code=500, detail="Failed to retrieve members"\)'''
    
    new_members_error = '''    except Exception as e:
        logger.error(f"❌ [WORKSPACE MEMBERS] Failed to get members for workspace {workspace_id}: {e}")
        logger.error(f"❌ [WORKSPACE MEMBERS] Error type: {type(e).__name__}")
        import traceback
        logger.error(f"❌ [WORKSPACE MEMBERS] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve members: {str(e)}")'''
    
    content = re.sub(old_members_error, new_members_error, content, flags=re.MULTILINE)
    
    # Pattern 3: Add success logging for roles endpoint
    old_roles_return = r'        roles = await RoleService\.get_workspace_roles\(workspace_id\)\n        return roles'
    new_roles_return = '''        roles = await RoleService.get_workspace_roles(workspace_id)
        logger.info(f"✅ [WORKSPACE ROLES] Retrieved {len(roles)} roles for workspace {workspace_id}")
        return roles'''
    
    content = re.sub(old_roles_return, new_roles_return, content)
    
    # Pattern 4: Add success logging for members endpoint
    old_members_return = r'        members = await WorkspaceService\.get_workspace_members\(workspace_id\)\n        return members'
    new_members_return = '''        members = await WorkspaceService.get_workspace_members(workspace_id)
        logger.info(f"✅ [WORKSPACE MEMBERS] Retrieved {len(members)} members for workspace {workspace_id}")
        return members'''
    
    content = re.sub(old_members_return, new_members_return, content)
    
    # Pattern 5: Add debug logging at the start of roles endpoint
    old_roles_start = r'        current_user_id = user_email if user_email else user_uuid\n        # Check if user is a member'
    new_roles_start = '''        current_user_id = user_email if user_email else user_uuid
        logger.info(f"🔍 [WORKSPACE ROLES] Getting roles for workspace {workspace_id}, user: {current_user_id}")
        # Check if user is a member'''
    
    content = re.sub(old_roles_start, new_roles_start, content)
    
    # Pattern 6: Add debug logging at the start of members endpoint
    old_members_start = r'        current_user_id = user_email if user_email else user_uuid\n        # Check if user is a member'
    new_members_start = '''        current_user_id = user_email if user_email else user_uuid
        logger.info(f"🔍 [WORKSPACE MEMBERS] Getting members for workspace {workspace_id}, user: {current_user_id}")
        # Check if user is a member'''
    
    content = re.sub(old_members_start, new_members_start, content)
    
    # Write the fixed content back
    with open('main.py', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Enhanced error logging added successfully")
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("🔧 ADDING DETAILED ERROR LOGGING")
    print("=" * 60)
    
    success = fix_error_logging()
    
    print("=" * 60)
    if success:
        print("✅ ERROR LOGGING ENHANCED SUCCESSFULLY")
    else:
        print("❌ SOME FIXES FAILED")
    print("=" * 60) 