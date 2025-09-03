-- Fix for workspace access type casting issue
-- The problem: pa.target_id is VARCHAR but wm.role_id is INTEGER

-- Check current data types
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('product_access', 'workspace_members') 
    AND column_name IN ('target_id', 'role_id')
ORDER BY table_name, column_name;

-- Test the problematic comparison
-- This should fail with the type error:
-- SELECT * FROM product_access pa 
-- INNER JOIN workspace_members wm ON pa.workspace_id = wm.workspace_id
-- WHERE pa.target_id = wm.role_id;

-- This should work with proper casting:
SELECT COUNT(*) FROM product_access pa 
INNER JOIN workspace_members wm ON pa.workspace_id = wm.workspace_id
WHERE pa.target_id = CAST(wm.role_id AS VARCHAR);

-- Alternative casting approaches:
-- Option 1: Cast role_id to text
-- pa.target_id = wm.role_id::text

-- Option 2: Cast role_id to varchar  
-- pa.target_id = CAST(wm.role_id AS VARCHAR)

-- Option 3: Cast target_id to integer (only works if all target_ids are numeric)
-- CAST(pa.target_id AS INTEGER) = wm.role_id

-- The safest approach is Option 2 since target_id can contain non-numeric user IDs 