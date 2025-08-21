-- SQL Script to check and fix quality_tier values
-- Run this in your database

-- Step 1: Check current quality_tier distribution
SELECT 
    quality_tier,
    COUNT(*) as count
FROM projects 
WHERE deleted_at IS NULL
GROUP BY quality_tier
ORDER BY count DESC;

-- Step 2: Show examples of projects with NULL quality_tier
SELECT 
    id,
    project_name,
    microproduct_name,
    quality_tier,
    created_at
FROM projects 
WHERE deleted_at IS NULL AND quality_tier IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- Step 3: Update NULL quality_tier to 'basic' (you can change this to 'interactive', 'advanced', or 'immersive')
-- UNCOMMENT THE LINE BELOW TO ACTUALLY UPDATE THE DATABASE
-- UPDATE projects SET quality_tier = 'basic' WHERE deleted_at IS NULL AND quality_tier IS NULL;

-- Step 4: Verify the update (run after step 3)
-- SELECT 
--     quality_tier,
--     COUNT(*) as count
-- FROM projects 
-- WHERE deleted_at IS NULL
-- GROUP BY quality_tier
-- ORDER BY count DESC; 