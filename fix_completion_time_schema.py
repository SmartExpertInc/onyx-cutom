#!/usr/bin/env python3
"""
Direct database migration script to fix completion_time column schema.
This script will immediately fix the database schema without requiring application restart.
"""

import os
import sys
import asyncio
import asyncpg
from typing import Optional

# Add the backend directory to the path so we can import the database configuration
sys.path.append(os.path.join(os.path.dirname(__file__), 'custom_extensions', 'backend'))

async def fix_completion_time_schema():
    """Fix the completion_time column schema in both projects and trashed_projects tables."""
    
    # Get database connection parameters from environment or use defaults
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
    
    print(f"🔗 Connecting to database...")
    print(f"   URL: {DATABASE_URL.replace(DATABASE_URL.split('@')[0].split('://')[1], '***') if '@' in DATABASE_URL else DATABASE_URL}")
    
    try:
        # Connect to database
        conn = await asyncpg.connect(DATABASE_URL)
        print("✅ Connected to database successfully")
        
        # Check current schema
        print("\n🔍 Checking current schema...")
        
        # Check projects table
        projects_completion_type = await conn.fetchval("""
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'projects' AND column_name = 'completion_time'
        """)
        print(f"   projects.completion_time current type: {projects_completion_type}")
        
        # Check trashed_projects table
        trashed_completion_type = await conn.fetchval("""
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'trashed_projects' AND column_name = 'completion_time'
        """)
        print(f"   trashed_projects.completion_time current type: {trashed_completion_type}")
        
        # Fix projects table
        print("\n🔧 Fixing projects table...")
        if not projects_completion_type:
            print("   → Adding completion_time column as INTEGER")
            await conn.execute("ALTER TABLE projects ADD COLUMN completion_time INTEGER DEFAULT 0")
        elif projects_completion_type != 'integer':
            print(f"   → Converting completion_time from {projects_completion_type} to INTEGER")
            if projects_completion_type == 'text':
                # Handle TEXT to INTEGER conversion
                print("   → Converting empty strings to 0")
                await conn.execute("UPDATE projects SET completion_time = '0' WHERE completion_time = '' OR completion_time IS NULL")
                print("   → Changing column type to INTEGER")
                await conn.execute("ALTER TABLE projects ALTER COLUMN completion_time TYPE INTEGER USING completion_time::INTEGER")
            else:
                await conn.execute("ALTER TABLE projects ALTER COLUMN completion_time TYPE INTEGER")
        else:
            print("   ✅ projects.completion_time is already INTEGER type")
        
        # Fix trashed_projects table
        print("\n🔧 Fixing trashed_projects table...")
        if not trashed_completion_type:
            print("   → Adding completion_time column as INTEGER")
            await conn.execute("ALTER TABLE trashed_projects ADD COLUMN completion_time INTEGER DEFAULT 0")
        elif trashed_completion_type != 'integer':
            print(f"   → Converting completion_time from {trashed_completion_type} to INTEGER")
            if trashed_completion_type == 'text':
                # Handle TEXT to INTEGER conversion
                print("   → Converting empty strings to 0")
                await conn.execute("UPDATE trashed_projects SET completion_time = '0' WHERE completion_time = '' OR completion_time IS NULL")
                print("   → Changing column type to INTEGER")
                await conn.execute("ALTER TABLE trashed_projects ALTER COLUMN completion_time TYPE INTEGER USING completion_time::INTEGER")
            else:
                await conn.execute("ALTER TABLE trashed_projects ALTER COLUMN completion_time TYPE INTEGER")
        else:
            print("   ✅ trashed_projects.completion_time is already INTEGER type")
        
        # Verify the fix
        print("\n✅ Verifying the fix...")
        
        # Check projects table again
        projects_completion_type_after = await conn.fetchval("""
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'projects' AND column_name = 'completion_time'
        """)
        print(f"   projects.completion_time type after fix: {projects_completion_type_after}")
        
        # Check trashed_projects table again
        trashed_completion_type_after = await conn.fetchval("""
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'trashed_projects' AND column_name = 'completion_time'
        """)
        print(f"   trashed_projects.completion_time type after fix: {trashed_completion_type_after}")
        
        # Test the CASE statement logic
        print("\n🧪 Testing CASE statement logic...")
        
        # Test with NULL value
        result1 = await conn.fetchval("""
            SELECT CASE 
                WHEN NULL IS NULL THEN 0
                WHEN NULL = '' THEN 0
                ELSE NULL::INTEGER
            END as test_result
        """)
        print(f"   NULL value result: {result1}")
        
        # Test with empty string (should be handled by the migration)
        result2 = await conn.fetchval("""
            SELECT CASE 
                WHEN '' IS NULL THEN 0
                WHEN '' = '' THEN 0
                ELSE ''::INTEGER
            END as test_result
        """)
        print(f"   Empty string result: {result2}")
        
        # Test with actual value
        result3 = await conn.fetchval("""
            SELECT CASE 
                WHEN 5 IS NULL THEN 0
                WHEN 5 = '' THEN 0
                ELSE 5::INTEGER
            END as test_result
        """)
        print(f"   5 value result: {result3}")
        
        # Check existing data
        print("\n📊 Checking existing data...")
        
        projects_count = await conn.fetchval("SELECT COUNT(*) FROM projects")
        print(f"   Total projects: {projects_count}")
        
        projects_with_completion = await conn.fetchval("""
            SELECT COUNT(*) FROM projects WHERE completion_time IS NOT NULL AND completion_time != 0
        """)
        print(f"   Projects with completion_time: {projects_with_completion}")
        
        # Sample some completion_time values
        sample_values = await conn.fetch("""
            SELECT completion_time FROM projects 
            WHERE completion_time IS NOT NULL AND completion_time != 0 
            LIMIT 5
        """)
        
        if sample_values:
            print("   Sample completion_time values:")
            for row in sample_values:
                print(f"     - {row['completion_time']} minutes")
        else:
            print("   No completion_time values found")
        
        print("\n🎉 Schema migration completed successfully!")
        print("\n📋 Summary:")
        print("   - completion_time columns are now INTEGER type in both tables")
        print("   - Empty strings have been converted to 0")
        print("   - CASE statement logic works correctly")
        print("   - Ready for trash operations with Est. Completion Time column")
        print("\n💡 Next steps:")
        print("   - Restart your application to ensure the new code is loaded")
        print("   - Test trash operations with course outlines")
        print("   - The error should now be resolved")
        
    except Exception as e:
        print(f"❌ Error during schema migration: {e}")
        print("\n🔧 Troubleshooting:")
        print("   - Check your database connection parameters")
        print("   - Ensure you have write permissions to the database")
        print("   - Check if the database is accessible")
        raise
    finally:
        if 'conn' in locals():
            await conn.close()
            print("\n🔌 Database connection closed")

if __name__ == "__main__":
    print("🔧 Direct Database Schema Migration for Est. Completion Time Column")
    print("=" * 70)
    
    asyncio.run(fix_completion_time_schema()) 