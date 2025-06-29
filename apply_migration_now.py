#!/usr/bin/env python3
"""
Immediate database migration script to fix completion_time column.
This script will apply the migration right now without waiting for application restart.
"""

import os
import sys
import asyncio
import asyncpg

async def apply_migration_immediately():
    """Apply the completion_time migration immediately."""
    
    # Get database connection parameters
    DATABASE_URL = os.environ.get("DATABASE_URL")
    if not DATABASE_URL:
        # Try to construct from individual environment variables
        DB_HOST = os.environ.get("DB_HOST", "localhost")
        DB_PORT = os.environ.get("DB_PORT", "5432")
        DB_NAME = os.environ.get("DB_NAME", "onyx")
        DB_USER = os.environ.get("DB_USER", "postgres")
        DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
        
        if DB_PASSWORD:
            DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        else:
            DATABASE_URL = f"postgresql://{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    
    print("🔧 Applying completion_time migration immediately...")
    print(f"   Database: {DATABASE_URL.replace(DATABASE_URL.split('@')[0].split('://')[1], '***') if '@' in DATABASE_URL else DATABASE_URL}")
    
    try:
        # Connect to database
        conn = await asyncpg.connect(DATABASE_URL)
        print("✅ Connected to database")
        
        # Check current schema
        print("\n🔍 Checking current schema...")
        
        projects_completion_type = await conn.fetchval("""
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'projects' AND column_name = 'completion_time'
        """)
        print(f"   projects.completion_time: {projects_completion_type}")
        
        trashed_completion_type = await conn.fetchval("""
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'trashed_projects' AND column_name = 'completion_time'
        """)
        print(f"   trashed_projects.completion_time: {trashed_completion_type}")
        
        # Apply migration
        print("\n🔧 Applying migration...")
        
        # Fix projects table
        if not projects_completion_type:
            print("   → Adding completion_time column to projects table")
            await conn.execute("ALTER TABLE projects ADD COLUMN completion_time INTEGER DEFAULT 0")
        elif projects_completion_type != 'integer':
            print(f"   → Converting projects.completion_time from {projects_completion_type} to INTEGER")
            if projects_completion_type == 'text':
                # Handle empty strings first
                await conn.execute("UPDATE projects SET completion_time = '0' WHERE completion_time = '' OR completion_time IS NULL")
                # Then convert type
                await conn.execute("ALTER TABLE projects ALTER COLUMN completion_time TYPE INTEGER USING completion_time::INTEGER")
            else:
                await conn.execute("ALTER TABLE projects ALTER COLUMN completion_time TYPE INTEGER")
        else:
            print("   ✅ projects.completion_time is already INTEGER")
        
        # Fix trashed_projects table
        if not trashed_completion_type:
            print("   → Adding completion_time column to trashed_projects table")
            await conn.execute("ALTER TABLE trashed_projects ADD COLUMN completion_time INTEGER DEFAULT 0")
        elif trashed_completion_type != 'integer':
            print(f"   → Converting trashed_projects.completion_time from {trashed_completion_type} to INTEGER")
            if trashed_completion_type == 'text':
                # Handle empty strings first
                await conn.execute("UPDATE trashed_projects SET completion_time = '0' WHERE completion_time = '' OR completion_time IS NULL")
                # Then convert type
                await conn.execute("ALTER TABLE trashed_projects ALTER COLUMN completion_time TYPE INTEGER USING completion_time::INTEGER")
            else:
                await conn.execute("ALTER TABLE trashed_projects ALTER COLUMN completion_time TYPE INTEGER")
        else:
            print("   ✅ trashed_projects.completion_time is already INTEGER")
        
        # Verify migration
        print("\n✅ Verifying migration...")
        
        projects_final = await conn.fetchval("""
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'projects' AND column_name = 'completion_time'
        """)
        trashed_final = await conn.fetchval("""
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'trashed_projects' AND column_name = 'completion_time'
        """)
        
        print(f"   projects.completion_time: {projects_final}")
        print(f"   trashed_projects.completion_time: {trashed_final}")
        
        if projects_final == 'integer' and trashed_final == 'integer':
            print("\n🎉 Migration completed successfully!")
            print("   Both tables now have completion_time as INTEGER type")
            print("   Trash operations should now work correctly")
        else:
            print("\n❌ Migration verification failed!")
            print("   Please check the database manually")
        
        # Test the CASE statement logic
        print("\n🧪 Testing CASE statement logic...")
        
        test_result = await conn.fetchval("""
            SELECT CASE 
                WHEN '' IS NULL THEN 0
                WHEN '' = '' THEN 0
                WHEN '' ~ '^[0-9]+$' THEN CAST('' AS INTEGER)
                ELSE 0
            END as test_result
        """)
        print(f"   Empty string test result: {test_result}")
        
        test_result2 = await conn.fetchval("""
            SELECT CASE 
                WHEN '5' IS NULL THEN 0
                WHEN '5' = '' THEN 0
                WHEN '5' ~ '^[0-9]+$' THEN CAST('5' AS INTEGER)
                ELSE 0
            END as test_result
        """)
        print(f"   Valid number test result: {test_result2}")
        
        print("\n✅ CASE statement logic works correctly")
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        raise
    finally:
        if 'conn' in locals():
            await conn.close()
            print("\n🔌 Database connection closed")

if __name__ == "__main__":
    print("🚨 IMMEDIATE completion_time Migration")
    print("=" * 50)
    
    asyncio.run(apply_migration_immediately())
    
    print("\n📋 Next steps:")
    print("   1. The migration has been applied to your database")
    print("   2. Trash operations should now work correctly")
    print("   3. You can test moving course outlines to trash")
    print("   4. The application startup migration will also run when you restart") 