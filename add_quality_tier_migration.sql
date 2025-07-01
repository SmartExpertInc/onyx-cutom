-- Migration to add quality_tier column to project_folders table
-- This migration adds a quality_tier column with default value 'medium'

-- Add quality_tier column to project_folders table
ALTER TABLE project_folders ADD COLUMN IF NOT EXISTS quality_tier TEXT DEFAULT 'medium';

-- Update existing folders to have 'medium' tier if they don't have one
UPDATE project_folders SET quality_tier = 'medium' WHERE quality_tier IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE project_folders ALTER COLUMN quality_tier SET NOT NULL;

-- Add an index for better performance when filtering by quality_tier
CREATE INDEX IF NOT EXISTS idx_project_folders_quality_tier ON project_folders(quality_tier);

-- Verify the migration
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_folders,
    COUNT(CASE WHEN quality_tier = 'medium' THEN 1 END) as medium_tier_folders,
    COUNT(CASE WHEN quality_tier IS NOT NULL THEN 1 END) as folders_with_tier
FROM project_folders; 