#!/usr/bin/env python3
"""
Test script to run the backend directly and test quality_tier_sums
"""

import asyncio
import os
import sys
import json
from pathlib import Path

# Add the backend directory to the Python path
backend_path = Path(__file__).parent / "custom_extensions" / "backend"
sys.path.insert(0, str(backend_path))

# Set environment variables for testing
os.environ["CUSTOM_PROJECTS_DATABASE_URL"] = "postgresql://custom_user:custom_password@localhost:5433/custom_projects_db"
os.environ["ONYX_DATABASE_URL"] = "postgresql://user:password@localhost:5432/dbname"
os.environ["OPENAI_API_KEY"] = "test-key"

async def test_backend_directly():
    """Test the backend by importing and calling the function directly"""
    
    print("🧪 Testing Backend Directly")
    print("=" * 60)
    
    try:
        # Import the main module
        from main import app
        
        # Import the function we want to test
        from main import get_projects_data_for_preview
        
        print("✅ Successfully imported backend modules")
        
        # Test data
        test_data = {
            "selectedProjects": [],
            "clientName": "Test Client",
            "managerName": "Test Manager"
        }
        
        print(f"📦 Test data: {test_data}")
        
        # Call the function directly
        result = await get_projects_data_for_preview(
            selected_projects=test_data["selectedProjects"],
            client_name=test_data["clientName"],
            manager_name=test_data["managerName"]
        )
        
        print("✅ Function call successful!")
        print(f"📊 Result type: {type(result)}")
        print(f"📊 Result keys: {list(result.keys()) if isinstance(result, dict) else 'Not a dict'}")
        
        if isinstance(result, dict) and 'quality_tier_sums' in result:
            print("\n🎯 quality_tier_sums found in result!")
            quality_sums = result['quality_tier_sums']
            print(f"📊 Type: {type(quality_sums)}")
            print(f"🔑 Keys: {list(quality_sums.keys()) if isinstance(quality_sums, dict) else 'Not a dict'}")
            
            if isinstance(quality_sums, dict):
                for tier, data in quality_sums.items():
                    print(f"  {tier}: completion_time={data.get('completion_time', 'N/A')}, creation_time={data.get('creation_time', 'N/A')}")
        else:
            print("❌ quality_tier_sums NOT found in result")
            print(f"📄 Full result: {json.dumps(result, indent=2, default=str)}")
            
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Make sure you're in the correct directory and the backend dependencies are installed")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_backend_directly()) 