#!/usr/bin/env python3
"""
Migration script for adding workspace system tables to existing databases.
This script can be run safely multiple times and will only create missing tables.
"""

import asyncio
import sys
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

async def migrate_workspace_system():
    """Migrate existing database to include workspace system tables."""
    logger.info("🚀 Starting Workspace System Migration")
    logger.info("=" * 50)
    
    try:
        # Import database utilities
        from app.core.database import init_database, seed_default_roles
        
        # Initialize database tables
        logger.info("📊 Creating workspace system tables...")
        await init_database()
        logger.info("✅ Workspace system tables created successfully")
        
        # Note: Default roles will be seeded when workspaces are created
        logger.info("ℹ️  Default roles will be automatically created when workspaces are added")
        
        logger.info("\n🎉 Migration completed successfully!")
        logger.info("\nNext steps:")
        logger.info("1. Restart your backend application")
        logger.info("2. The workspace system will be available at /api/custom/workspaces")
        logger.info("3. Create your first workspace to get started")
        
        return True
        
    except ImportError as e:
        logger.error(f"❌ Import error: {e}")
        logger.error("Make sure you're running this script from the backend directory")
        return False
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def verify_migration():
    """Verify that the migration was successful."""
    logger.info("\n🔍 Verifying migration...")
    
    try:
        from app.core.database import fetch_all
        
        # Check if tables exist by querying them
        tables_to_check = [
            "workspaces",
            "workspace_roles", 
            "workspace_members",
            "product_access"
        ]
        
        for table in tables_to_check:
            try:
                # Try to query the table
                result = await fetch_all(f"SELECT 1 FROM {table} LIMIT 1")
                logger.info(f"✅ Table '{table}' exists and is accessible")
            except Exception as e:
                logger.error(f"❌ Table '{table}' verification failed: {e}")
                return False
        
        logger.info("✅ All workspace system tables verified successfully")
        return True
        
    except Exception as e:
        logger.error(f"❌ Verification failed: {e}")
        return False

async def main():
    """Main migration function."""
    logger.info("🔧 Workspace System Database Migration")
    logger.info("=" * 50)
    
    # Run migration
    migration_success = await migrate_workspace_system()
    
    if migration_success:
        # Verify migration
        verification_success = await verify_migration()
        
        if verification_success:
            logger.info("\n✨ Migration and verification completed successfully!")
            logger.info("Your database is now ready for the workspace system.")
            return 0
        else:
            logger.error("\n⚠️  Migration completed but verification failed.")
            logger.error("Please check your database configuration and try again.")
            return 1
    else:
        logger.error("\n💥 Migration failed!")
        return 1

if __name__ == "__main__":
    # Check if we're in the right directory
    if not os.path.exists("app"):
        logger.error("❌ Please run this script from the backend directory")
        logger.error("Expected directory structure: custom_extensions/backend/")
        sys.exit(1)
    
    # Run the async migration
    exit_code = asyncio.run(main())
    sys.exit(exit_code) 