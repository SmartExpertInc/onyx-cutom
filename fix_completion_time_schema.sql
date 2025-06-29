-- Direct SQL migration to fix completion_time column schema
-- Run this script in your PostgreSQL database to fix the trash operation error

-- Check current schema
SELECT 
    'projects' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name = 'completion_time'

UNION ALL

SELECT 
    'trashed_projects' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'trashed_projects' AND column_name = 'completion_time';

-- Fix projects table
DO $$
BEGIN
    -- Check if completion_time column exists in projects table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'completion_time'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE projects ADD COLUMN completion_time INTEGER DEFAULT 0;
        RAISE NOTICE 'Added completion_time column to projects table';
    ELSE
        -- Check the current type
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'projects' 
            AND column_name = 'completion_time' 
            AND data_type != 'integer'
        ) THEN
            -- Convert from TEXT to INTEGER if needed
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'projects' 
                AND column_name = 'completion_time' 
                AND data_type = 'text'
            ) THEN
                -- Handle TEXT to INTEGER conversion
                UPDATE projects SET completion_time = '0' WHERE completion_time = '' OR completion_time IS NULL;
                ALTER TABLE projects ALTER COLUMN completion_time TYPE INTEGER USING completion_time::INTEGER;
                RAISE NOTICE 'Converted projects.completion_time from TEXT to INTEGER';
            ELSE
                -- Handle other types
                ALTER TABLE projects ALTER COLUMN completion_time TYPE INTEGER;
                RAISE NOTICE 'Converted projects.completion_time to INTEGER';
            END IF;
        ELSE
            RAISE NOTICE 'projects.completion_time is already INTEGER type';
        END IF;
    END IF;
END $$;

-- Fix trashed_projects table
DO $$
BEGIN
    -- Check if completion_time column exists in trashed_projects table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trashed_projects' AND column_name = 'completion_time'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE trashed_projects ADD COLUMN completion_time INTEGER DEFAULT 0;
        RAISE NOTICE 'Added completion_time column to trashed_projects table';
    ELSE
        -- Check the current type
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'trashed_projects' 
            AND column_name = 'completion_time' 
            AND data_type != 'integer'
        ) THEN
            -- Convert from TEXT to INTEGER if needed
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'trashed_projects' 
                AND column_name = 'completion_time' 
                AND data_type = 'text'
            ) THEN
                -- Handle TEXT to INTEGER conversion
                UPDATE trashed_projects SET completion_time = '0' WHERE completion_time = '' OR completion_time IS NULL;
                ALTER TABLE trashed_projects ALTER COLUMN completion_time TYPE INTEGER USING completion_time::INTEGER;
                RAISE NOTICE 'Converted trashed_projects.completion_time from TEXT to INTEGER';
            ELSE
                -- Handle other types
                ALTER TABLE trashed_projects ALTER COLUMN completion_time TYPE INTEGER;
                RAISE NOTICE 'Converted trashed_projects.completion_time to INTEGER';
            END IF;
        ELSE
            RAISE NOTICE 'trashed_projects.completion_time is already INTEGER type';
        END IF;
    END IF;
END $$;

-- Verify the fix
SELECT 
    'projects' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name = 'completion_time'

UNION ALL

SELECT 
    'trashed_projects' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'trashed_projects' AND column_name = 'completion_time';

-- Test the CASE statement logic
SELECT 
    'NULL value test' as test_name,
    CASE 
        WHEN NULL IS NULL THEN 0
        WHEN NULL = '' THEN 0
        ELSE NULL::INTEGER
    END as test_result

UNION ALL

SELECT 
    'Empty string test' as test_name,
    CASE 
        WHEN '' IS NULL THEN 0
        WHEN '' = '' THEN 0
        ELSE ''::INTEGER
    END as test_result

UNION ALL

SELECT 
    'Valid value test' as test_name,
    CASE 
        WHEN 5 IS NULL THEN 0
        WHEN 5 = '' THEN 0
        ELSE 5::INTEGER
    END as test_result;

-- Check existing data
SELECT 
    'Total projects' as metric,
    COUNT(*) as value
FROM projects

UNION ALL

SELECT 
    'Projects with completion_time' as metric,
    COUNT(*) as value
FROM projects 
WHERE completion_time IS NOT NULL AND completion_time != 0;

-- Sample completion_time values
SELECT 
    'Sample completion_time values' as info,
    completion_time as minutes
FROM projects 
WHERE completion_time IS NOT NULL AND completion_time != 0 
LIMIT 5; 