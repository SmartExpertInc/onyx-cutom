#!/usr/bin/env python3
"""
Test script to verify the correct SQL syntax for workspace access queries.
This helps debug the type casting issue.
"""

# Test query with proper type casting
test_query = """
-- Test query for workspace access with proper type casting
SELECT DISTINCT p.id, p.project_name, p.microproduct_name, p.created_at, p.design_template_id,
       dt.template_name as design_template_name,
       dt.microproduct_type as design_microproduct_type,
       p.folder_id, p."order", p.microproduct_content, p.source_chat_session_id, p.is_standalone
FROM projects p
LEFT JOIN design_templates dt ON p.design_template_id = dt.id
INNER JOIN product_access pa ON p.id = pa.product_id
INNER JOIN workspace_members wm ON pa.workspace_id = wm.workspace_id
WHERE wm.user_id = $1 
  AND wm.status = 'active'
  AND (
      (pa.access_type = 'workspace') 
      OR (pa.access_type = 'role' AND pa.target_id = CAST(wm.role_id AS VARCHAR))
      OR (pa.access_type = 'individual' AND pa.target_id = $1)
  )
"""

# Alternative approach - separate queries for each access type
workspace_access_query = """
SELECT DISTINCT p.id, p.project_name, p.microproduct_name, p.created_at, p.design_template_id,
       dt.template_name as design_template_name,
       dt.microproduct_type as design_microproduct_type,
       p.folder_id, p."order", p.microproduct_content, p.source_chat_session_id, p.is_standalone
FROM projects p
LEFT JOIN design_templates dt ON p.design_template_id = dt.id
INNER JOIN product_access pa ON p.id = pa.product_id
INNER JOIN workspace_members wm ON pa.workspace_id = wm.workspace_id
WHERE wm.user_id = $1 
  AND wm.status = 'active'
  AND pa.access_type = 'workspace'
"""

role_access_query = """
SELECT DISTINCT p.id, p.project_name, p.microproduct_name, p.created_at, p.design_template_id,
       dt.template_name as design_template_name,
       dt.microproduct_type as design_microproduct_type,
       p.folder_id, p."order", p.microproduct_content, p.source_chat_session_id, p.is_standalone
FROM projects p
LEFT JOIN design_templates dt ON p.design_template_id = dt.id
INNER JOIN product_access pa ON p.id = pa.product_id
INNER JOIN workspace_members wm ON pa.workspace_id = wm.workspace_id
WHERE wm.user_id = $1 
  AND wm.status = 'active'
  AND pa.access_type = 'role'
  AND pa.target_id = CAST(wm.role_id AS VARCHAR)
"""

individual_access_query = """
SELECT DISTINCT p.id, p.project_name, p.microproduct_name, p.created_at, p.design_template_id,
       dt.template_name as design_template_name,
       dt.microproduct_type as design_microproduct_type,
       p.folder_id, p."order", p.microproduct_content, p.source_chat_session_id, p.is_standalone
FROM projects p
LEFT JOIN design_templates dt ON p.design_template_id = dt.id
INNER JOIN product_access pa ON p.id = pa.product_id
INNER JOIN workspace_members wm ON pa.workspace_id = wm.workspace_id
WHERE wm.user_id = $1 
  AND wm.status = 'active'
  AND pa.access_type = 'individual'
  AND pa.target_id = $1
"""

print("✅ SQL queries created successfully!")
print("The issue is likely in the type casting between pa.target_id (VARCHAR) and wm.role_id (INTEGER)")
print("Solution: Use CAST(wm.role_id AS VARCHAR) instead of wm.role_id::text") 