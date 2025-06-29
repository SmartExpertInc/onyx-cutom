# 🚨 IMMEDIATE FIX for Trash Operation Error

## The Problem
You're still getting this error when moving course outlines to trash:
```
Failed to delete project: 500 {"detail":"Database error during trash operation: invalid input syntax for type integer: \"\""}
```

## The Root Cause
The `completion_time` column in your database is likely still `TEXT` type, but the application code expects it to be `INTEGER` type. The schema migration in the application code only runs when the app starts, but you need to fix the database schema immediately.

## 🔧 IMMEDIATE SOLUTION

### Option 1: Run the Python Migration Script (Recommended)

1. **Install asyncpg if you don't have it:**
   ```bash
   pip install asyncpg
   ```

2. **Set your database environment variables** (if not already set):
   ```bash
   # Windows PowerShell
   $env:DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   
   # Or set individual variables:
   $env:DB_HOST="localhost"
   $env:DB_PORT="5432"
   $env:DB_NAME="onyx"
   $env:DB_USER="postgres"
   $env:DB_PASSWORD="your_password"
   ```

3. **Run the migration script:**
   ```bash
   python fix_completion_time_schema.py
   ```

### Option 2: Run the SQL Script Directly

1. **Connect to your PostgreSQL database** using psql, pgAdmin, or any SQL client

2. **Run the SQL script:**
   ```sql
   -- Copy and paste the contents of fix_completion_time_schema.sql
   ```

### Option 3: Manual SQL Commands

If you prefer to run commands manually:

```sql
-- Check current schema
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('projects', 'trashed_projects') 
AND column_name = 'completion_time';

-- Fix projects table
ALTER TABLE projects ALTER COLUMN completion_time TYPE INTEGER USING 
  CASE 
    WHEN completion_time IS NULL THEN 0
    WHEN completion_time = '' THEN 0
    ELSE completion_time::INTEGER
  END;

-- Fix trashed_projects table  
ALTER TABLE trashed_projects ALTER COLUMN completion_time TYPE INTEGER USING
  CASE 
    WHEN completion_time IS NULL THEN 0
    WHEN completion_time = '' THEN 0
    ELSE completion_time::INTEGER
  END;

-- Verify the fix
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('projects', 'trashed_projects') 
AND column_name = 'completion_time';
```

## ✅ What This Fix Does

1. **Converts `completion_time` from TEXT to INTEGER** in both tables
2. **Handles empty strings** by converting them to `0`
3. **Handles NULL values** by converting them to `0`
4. **Preserves existing valid integer values** (like 5, 6, 7, 8 minutes)

## 🧪 After Running the Fix

1. **Restart your application** to ensure the new code is loaded
2. **Test trash operations** with course outlines that have "Est. Completion Time" values
3. **The error should be resolved**

## 🔍 Verification

After running the fix, you should see:
- `completion_time` columns are `INTEGER` type in both tables
- No more "invalid input syntax for type integer" errors
- Trash operations work correctly with course outlines

## 📞 If You Still Get Errors

If you still encounter issues after running the migration:

1. **Check the migration output** for any error messages
2. **Verify the column types** using the verification queries
3. **Restart your application** completely
4. **Check application logs** for any remaining issues

The fix addresses the core database schema issue that was causing the trash operation to fail. 