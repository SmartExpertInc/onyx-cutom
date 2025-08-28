#!/usr/bin/env python3
"""
Test API endpoint directly
"""

import asyncio
import httpx
import sys
import os

# Add the current directory to the path
sys.path.append(os.path.dirname(__file__))

async def test_api_endpoint():
    """Test the API endpoint directly."""
    print("🧪 Testing API Endpoint Directly")
    print("=" * 50)
    
    try:
        # Test the API endpoint directly
        async with httpx.AsyncClient() as client:
            # Test the endpoint that should be accessible
            response = await client.get("http://localhost:8001/api/custom/video/avatars")
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ API endpoint working! Response: {data}")
                return True
            else:
                print(f"❌ API endpoint failed with status {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Error testing API endpoint: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_api_endpoint())
    
    if success:
        print("\n🎉 API endpoint test passed!")
        sys.exit(0)
    else:
        print("\n💥 API endpoint test failed!")
        sys.exit(1)
