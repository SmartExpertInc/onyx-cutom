#!/usr/bin/env python3
"""
Script to fix the migration code in main.py by removing all INTEGER conversion logic
and keeping only the TEXT-based approach that matches our string-based trash operations.
"""

import re

def fix_migration_code():
    """Fix the migration code in main.py"""
    
    # Read the main.py file
    with open('custom_extensions/backend/main.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the problematic migration section and replace it
    # Look for the section that starts with "Ensure completion_time column is INTEGER type"
    pattern = r'# Ensure completion_time column is INTEGER type in both tables.*?logger\.info\("Database schema migration completed successfully\."\)'
    
    replacement = '''# CRITICAL FIX: Ensure order and completion_time columns are TEXT type to prevent casting errors
            try:
                logger.info("Applying critical fix: Ensuring order and completion_time columns are TEXT type")
                
                # Fix projects table - ensure TEXT type
                await connection.execute("""
                    ALTER TABLE projects 
                    ALTER COLUMN "order" TYPE TEXT,
                    ALTER COLUMN completion_time TYPE TEXT;
                """)
                logger.info("Successfully set projects.order and projects.completion_time to TEXT type")
                
                # Fix trashed_projects table - ensure TEXT type
                await connection.execute("""
                    ALTER TABLE trashed_projects 
                    ALTER COLUMN "order" TYPE TEXT,
                    ALTER COLUMN completion_time TYPE TEXT;
                """)
                logger.info("Successfully set trashed_projects.order and trashed_projects.completion_time to TEXT type")
                
                # Set default values for empty strings
                await connection.execute("""
                    UPDATE projects 
                    SET "order" = '0' WHERE "order" IS NULL OR "order" = '';
                """)
                await connection.execute("""
                    UPDATE projects 
                    SET completion_time = '0' WHERE completion_time IS NULL OR completion_time = '';
                """)
                await connection.execute("""
                    UPDATE trashed_projects 
                    SET "order" = '0' WHERE "order" IS NULL OR "order" = '';
                """)
                await connection.execute("""
                    UPDATE trashed_projects 
                    SET completion_time = '0' WHERE completion_time IS NULL OR completion_time = '';
                """)
                logger.info("Successfully set default values for empty order and completion_time fields")
                
            except Exception as e:
                logger.error(f"Error applying critical TEXT type fix: {e}")

            # Final verification - ensure all required columns exist with correct types
            try:
                # Verify projects table schema
                projects_schema = await connection.fetch("""
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns 
                    WHERE table_name = 'projects' 
                    AND column_name IN ('order', 'completion_time', 'source_chat_session_id', 'folder_id')
                    ORDER BY column_name;
                """)
                
                logger.info("Projects table schema verification:")
                for row in projects_schema:
                    logger.info(f"  {row['column_name']}: {row['data_type']} (nullable: {row['is_nullable']})")
                
                # Verify trashed_projects table schema
                trashed_schema = await connection.fetch("""
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns 
                    WHERE table_name = 'trashed_projects' 
                    AND column_name IN ('order', 'completion_time', 'source_chat_session_id', 'folder_id')
                    ORDER BY column_name;
                """)
                
                logger.info("Trashed_projects table schema verification:")
                for row in trashed_schema:
                    logger.info(f"  {row['column_name']}: {row['data_type']} (nullable: {row['is_nullable']})")
                
            except Exception as e:
                logger.error(f"Error during schema verification: {e}")

            logger.info("Database schema migration completed successfully.")'''
    
    # Replace the problematic section
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    # Write the fixed content back to the file
    with open('custom_extensions/backend/main.py', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("✅ Successfully fixed migration code in main.py")
    print("✅ Removed all INTEGER conversion logic")
    print("✅ Kept only TEXT-based approach")

if __name__ == "__main__":
    fix_migration_code() 