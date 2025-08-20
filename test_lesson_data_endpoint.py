#!/usr/bin/env python3
"""
Test script to verify that the lesson-data endpoint returns the new fields:
- totalModules
- totalCreationHours
"""

import asyncio
import asyncpg
import json
from custom_extensions.backend.main import get_project_lesson_data, get_current_onyx_user_id, get_db_pool

async def test_lesson_data_endpoint():
    """Test the lesson-data endpoint to verify new fields are returned"""
    
    # Mock user ID for testing
    test_user_id = "dummy-onyx-user-id-for-testing"
    
    # Get a test project ID (you may need to adjust this)
    test_project_id = 1  # Replace with an actual project ID from your database
    
    try:
        # Get database pool
        pool = await get_db_pool()
        
        # Test the lesson-data endpoint
        result = await get_project_lesson_data(test_project_id, test_user_id, pool)
        
        print("Lesson data endpoint result:")
        print(json.dumps(result, indent=2))
        
        # Check if new fields are present
        if 'totalModules' in result:
            print(f"✅ totalModules field present: {result['totalModules']}")
        else:
            print("❌ totalModules field missing")
            
        if 'totalCreationHours' in result:
            print(f"✅ totalCreationHours field present: {result['totalCreationHours']}")
        else:
            print("❌ totalCreationHours field missing")
            
        # Check all fields
        expected_fields = ['lessonCount', 'totalHours', 'completionTime', 'totalModules', 'totalCreationHours', 'sections']
        for field in expected_fields:
            if field in result:
                print(f"✅ {field}: {result[field]}")
            else:
                print(f"❌ {field} missing")
        
        await pool.close()
        
    except Exception as e:
        print(f"Error testing lesson-data endpoint: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_lesson_data_endpoint()) 