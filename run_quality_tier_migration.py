#!/usr/bin/env python3
"""
Script to add quality_tier column to project_folders table
"""

import asyncio
import asyncpg
import os

async def run_migration():
    # Get database connection details from environment
    db_host = os.environ.get('DB_HOST', 'localhost')
    db_port = os.environ.get('DB_PORT', '5432')
    db_name = os.environ.get('DB_NAME', 'onyx')
    db_user = os.environ.get('DB_USER', 'postgres')
    db_password = os.environ.get('DB_PASSWORD', 'postgres')
    
    try:
        # Connect to database
        conn = await asyncpg.connect(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password
        )
        
        print("Connected to database successfully")
        
        # Add quality_tier column
        await conn.execute("""
            ALTER TABLE project_folders ADD COLUMN IF NOT EXISTS quality_tier TEXT DEFAULT 'medium';
        """)
        print("Added quality_tier column")
        
        # Update existing folders to have 'medium' tier if they don't have one
        result = await conn.execute("""
            UPDATE project_folders SET quality_tier = 'medium' WHERE quality_tier IS NULL;
        """)
        print(f"Updated existing folders: {result}")
        
        # Make the column NOT NULL after setting default values
        await conn.execute("""
            ALTER TABLE project_folders ALTER COLUMN quality_tier SET NOT NULL;
        """)
        print("Made quality_tier column NOT NULL")
        
        # Add an index for better performance
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_project_folders_quality_tier ON project_folders(quality_tier);
        """)
        print("Added index for quality_tier")
        
        # Verify the migration
        count = await conn.fetchval("SELECT COUNT(*) FROM project_folders")
        medium_count = await conn.fetchval("SELECT COUNT(*) FROM project_folders WHERE quality_tier = 'medium'")
        
        print(f"Migration completed successfully!")
        print(f"Total folders: {count}")
        print(f"Folders with medium tier: {medium_count}")
        
        await conn.close()
        
    except Exception as e:
        print(f"Error running migration: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(run_migration()) 