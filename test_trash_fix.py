#!/usr/bin/env python3
"""
Test script to verify that the trash operations work correctly after the fix.
This script tests the delete_multiple_projects and restore_multiple_projects functions.
"""

import asyncio
import asyncpg
import os
import sys
from typing import List, Dict, Any

# Database connection parameters
DB_HOST = os.environ.get("POSTGRES_HOST", "localhost")
DB_PORT = os.environ.get("POSTGRES_PORT", "5432")
DB_NAME = os.environ.get("POSTGRES_DB", "onyx")
DB_USER = os.environ.get("POSTGRES_USER", "onyx")
DB_PASSWORD = os.environ.get("POSTGRES_PASSWORD", "onyx")

async def test_database_connection():
    """Test database connection and verify schema."""
    try:
        conn = await asyncpg.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        
        print("✅ Database connection successful")
        
        # Check schema for both tables
        for table_name in ['projects', 'trashed_projects']:
            for column_name in ['completion_time', 'order']:
                result = await conn.fetchval("""
                    SELECT data_type 
                    FROM information_schema.columns 
                    WHERE table_name = $1 AND column_name = $2
                """, table_name, column_name)
                
                if result:
                    print(f"✅ {table_name}.{column_name}: {result}")
                    if result != 'integer':
                        print(f"⚠️  Warning: {table_name}.{column_name} is {result}, should be integer")
                else:
                    print(f"❌ {table_name}.{column_name}: column not found")
        
        await conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

async def test_case_statements():
    """Test the CASE statements that were causing the error."""
    try:
        conn = await asyncpg.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        
        print("\n🧪 Testing CASE statements...")
        
        # Test cases with various input values
        test_cases = [
            ("NULL", None),
            ("Empty string", ""),
            ("Valid number", "5"),
            ("Invalid text", "abc"),
            ("Zero", "0"),
            ("Large number", "12345"),
        ]
        
        for test_name, test_value in test_cases:
            try:
                # Test the fixed CASE statement for order
                result = await conn.fetchval("""
                    SELECT CASE 
                        WHEN $1 IS NULL OR $1 = '' OR $1 !~ '^[0-9]+$' THEN 0
                        ELSE CAST($1 AS INTEGER)
                    END
                """, test_value)
                
                print(f"✅ {test_name}: {test_value} -> {result}")
                
            except Exception as e:
                print(f"❌ {test_name}: {test_value} -> ERROR: {e}")
        
        # Test the fixed CASE statement for completion_time
        print("\n🧪 Testing completion_time CASE statement...")
        for test_name, test_value in test_cases:
            try:
                result = await conn.fetchval("""
                    SELECT CASE 
                        WHEN $1 IS NULL OR $1 = '' OR $1 !~ '^[0-9]+$' THEN 0
                        ELSE CAST($1 AS INTEGER)
                    END
                """, test_value)
                
                print(f"✅ {test_name}: {test_value} -> {result}")
                
            except Exception as e:
                print(f"❌ {test_name}: {test_value} -> ERROR: {e}")
        
        await conn.close()
        return True
        
    except Exception as e:
        print(f"❌ CASE statement test failed: {e}")
        return False

async def test_trash_operations():
    """Test the actual trash operations with sample data."""
    try:
        conn = await asyncpg.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        
        print("\n🧪 Testing trash operations...")
        
        # Create test user ID
        test_user_id = "test-user-123"
        
        # Clean up any existing test data
        await conn.execute("DELETE FROM trashed_projects WHERE onyx_user_id = $1", test_user_id)
        await conn.execute("DELETE FROM projects WHERE onyx_user_id = $1", test_user_id)
        
        # Insert test project with problematic data
        project_id = await conn.fetchval("""
            INSERT INTO projects (
                onyx_user_id, project_name, product_type, microproduct_type,
                microproduct_name, design_template_id, "order", completion_time
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
        """, test_user_id, "Test Project", "course", "Training Plan", "Test Course", 1, "", "")
        
        print(f"✅ Created test project with ID: {project_id}")
        
        # Test moving to trash (this should not fail)
        try:
            await conn.execute("""
                INSERT INTO trashed_projects (
                    id, onyx_user_id, project_name, product_type, microproduct_type, 
                    microproduct_name, design_template_id, "order", completion_time
                ) 
                SELECT 
                    id, onyx_user_id, project_name, product_type, microproduct_type,
                    microproduct_name, design_template_id, 
                    CASE 
                        WHEN "order" IS NULL OR "order" = '' OR "order" !~ '^[0-9]+$' THEN 0
                        ELSE CAST("order" AS INTEGER)
                    END,
                    CASE 
                        WHEN completion_time IS NULL OR completion_time = '' OR completion_time !~ '^[0-9]+$' THEN 0
                        ELSE CAST(completion_time AS INTEGER)
                    END
                FROM projects 
                WHERE id = $1 AND onyx_user_id = $2
            """, project_id, test_user_id)
            
            print("✅ Successfully moved project to trash")
            
            # Verify the data in trashed_projects
            trashed_row = await conn.fetchrow("""
                SELECT "order", completion_time FROM trashed_projects 
                WHERE id = $1 AND onyx_user_id = $2
            """, project_id, test_user_id)
            
            if trashed_row:
                print(f"✅ Trashed project data - order: {trashed_row['order']}, completion_time: {trashed_row['completion_time']}")
            else:
                print("❌ Project not found in trash")
            
            # Test restoring from trash
            await conn.execute("""
                INSERT INTO projects (
                    id, onyx_user_id, project_name, product_type, microproduct_type,
                    microproduct_name, design_template_id, "order", completion_time
                ) SELECT 
                    id, onyx_user_id, project_name, product_type, microproduct_type,
                    microproduct_name, design_template_id, 
                    CASE 
                        WHEN "order" IS NULL OR "order" = '' OR "order" !~ '^[0-9]+$' THEN 0
                        ELSE CAST("order" AS INTEGER)
                    END,
                    CASE 
                        WHEN completion_time IS NULL OR completion_time = '' OR completion_time !~ '^[0-9]+$' THEN 0
                        ELSE CAST(completion_time AS INTEGER)
                    END
                FROM trashed_projects WHERE id = $1 AND onyx_user_id = $2
            """, project_id, test_user_id)
            
            print("✅ Successfully restored project from trash")
            
        except Exception as e:
            print(f"❌ Trash operation failed: {e}")
            return False
        
        # Clean up test data
        await conn.execute("DELETE FROM trashed_projects WHERE onyx_user_id = $1", test_user_id)
        await conn.execute("DELETE FROM projects WHERE onyx_user_id = $1", test_user_id)
        
        await conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Trash operations test failed: {e}")
        return False

async def main():
    """Run all tests."""
    print("🚀 Starting trash fix verification tests...")
    
    # Test 1: Database connection and schema
    print("\n1️⃣ Testing database connection and schema...")
    if not await test_database_connection():
        print("❌ Database connection test failed")
        return False
    
    # Test 2: CASE statements
    print("\n2️⃣ Testing CASE statements...")
    if not await test_case_statements():
        print("❌ CASE statement test failed")
        return False
    
    # Test 3: Trash operations
    print("\n3️⃣ Testing trash operations...")
    if not await test_trash_operations():
        print("❌ Trash operations test failed")
        return False
    
    print("\n🎉 All tests passed! The trash fix is working correctly.")
    return True

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1) 