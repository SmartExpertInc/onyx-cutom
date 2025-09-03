#!/usr/bin/env python3
"""
Fix for User ID Mismatch Issue

The problem:
- Backend uses UUID (2fcc283c-3df3-4bc5-af6b-2d7cd3afdcb2) from Onyx auth
- Workspace members are stored with email addresses
- Queries fail because UUID != email

Solution:
Update the projects endpoint to handle both UUID and email lookups
"""

# This is the SQL fix that needs to be applied to the projects endpoint

FIXED_SHARED_PROJECTS_QUERY = """
-- Modified shared projects query to handle both UUID and email
SELECT DISTINCT p.id, p.project_name, p.microproduct_name, p.created_at, p.design_template_id,
       dt.template_name as design_template_name,
       dt.microproduct_type as design_microproduct_type,
       p.folder_id, p."order", p.microproduct_content, p.source_chat_session_id, p.is_standalone
FROM projects p
LEFT JOIN design_templates dt ON p.design_template_id = dt.id
INNER JOIN product_access pa ON p.id = pa.product_id
INNER JOIN workspace_members wm ON pa.workspace_id = wm.workspace_id
WHERE wm.user_id = $2  -- Use email parameter instead of UUID
  AND wm.status = 'active'
  AND pa.access_type IN ('workspace', 'role', 'individual')
  AND (
      pa.access_type = 'workspace' 
      OR (pa.access_type = 'role' AND pa.target_id = CAST(wm.role_id AS TEXT))
      OR (pa.access_type = 'individual' AND pa.target_id = $2)  -- Use email for individual access too
  )
  {folder_filter}
"""

# This is the Python code change needed in main.py

PYTHON_FIX = """
# In the get_user_projects_list_from_db function, add this after getting onyx_user_id:

# Get user email for workspace access
user_email = None
try:
    session_cookie_value = request.cookies.get(ONYX_SESSION_COOKIE_NAME)
    if session_cookie_value:
        onyx_user_info_url = f"{ONYX_API_SERVER_URL}/me"
        cookies_to_forward = {ONYX_SESSION_COOKIE_NAME: session_cookie_value}
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(onyx_user_info_url, cookies=cookies_to_forward)
            if response.status_code == 200:
                user_data = response.json()
                user_email = user_data.get("email")
except Exception as e:
    logger.warning(f"Could not get user email: {e}")

# Use email for workspace queries, UUID for owned projects
user_for_workspace = user_email if user_email else onyx_user_id

# Update parameters
owned_params = [onyx_user_id]  # UUID for owned projects
shared_params = [onyx_user_id, user_for_workspace]  # UUID and email for shared projects

if folder_id is not None:
    owned_params.append(folder_id)
    shared_params.append(folder_id)

# Execute queries
owned_rows = await conn.fetch(owned_query, *owned_params)
shared_rows = await conn.fetch(shared_query, *shared_params)
"""

print("🔧 User ID Mismatch Fix")
print("=" * 40)
print()
print("Problem: Backend UUID != Workspace member emails")
print("Solution: Use email for workspace queries, UUID for owned projects")
print()
print("Apply this fix to main.py in the get_user_projects_list_from_db function")
print()
print("After applying, restart backend and test!") 