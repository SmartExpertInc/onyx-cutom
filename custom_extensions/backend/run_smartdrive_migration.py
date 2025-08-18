#!/usr/bin/env python3
"""
Smart Drive Database Migration Script

Run this to create the Smart Drive tables in your database.
"""

import asyncio
import asyncpg
import os
import sys

async def run_migration():
    """Run the Smart Drive database migration"""
    
    # Get database URL from environment
    database_url = os.getenv("CUSTOM_PROJECTS_DATABASE_URL")
    if not database_url:
        print("ERROR: CUSTOM_PROJECTS_DATABASE_URL environment variable not set")
        sys.exit(1)
    
    print("Connecting to database...")
    
    try:
        # Connect to database
        conn = await asyncpg.connect(database_url)
        
        # Read SQL migration file
        with open("smartdrive_tables.sql", "r") as f:
            sql_content = f.read()
        
        print("Running Smart Drive migration...")
        
        # Execute the migration
        await conn.execute(sql_content)
        
        print("✅ Smart Drive migration completed successfully!")
        
        # Close connection
        await conn.close()
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run_migration()) 