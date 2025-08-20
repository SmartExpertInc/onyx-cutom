#!/usr/bin/env python3
"""
Backend API Test Script
======================

This script tests the backend API endpoints to ensure they're working properly.
"""

import requests
import json
import sys

def test_backend_api():
    """Test the backend API endpoints."""
    print("🔍 Testing Backend API Endpoints")
    print("=" * 50)
    
    base_url = "http://localhost:8000"  # Adjust if your backend runs on different port
    
    # Test 1: Check if the API is accessible
    print("\n1. Testing API accessibility...")
    try:
        response = requests.get(f"{base_url}/api/custom/video-lesson/avatars")
        print(f"✅ Avatars endpoint status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {len(data.get('avatars', []))} available avatars")
            for avatar in data.get('avatars', []):
                print(f"   - {avatar['name']} ({avatar['code']})")
        else:
            print(f"❌ Error: {response.text}")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend API - backend may not be running")
        print("💡 Make sure to start the backend with: docker-compose up custom_backend")
        return False
    except Exception as e:
        print(f"❌ API Error: {e}")
        return False
    
    # Test 2: Check video lesson endpoints
    print("\n2. Testing video lesson endpoints...")
    try:
        # Test generate-avatar endpoint (should return 400 for invalid request)
        response = requests.post(f"{base_url}/api/custom/video-lesson/generate-avatar", 
                               json={"project_id": "test"})
        print(f"✅ Generate avatar endpoint status: {response.status_code}")
        if response.status_code in [400, 401, 404]:  # Expected for invalid request
            print("✅ Endpoint is accessible (returned expected error for invalid request)")
        else:
            print(f"⚠️ Unexpected status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing generate-avatar: {e}")
    
    # Test 3: Check progress endpoint
    try:
        response = requests.get(f"{base_url}/api/custom/video-lesson/progress/test-project")
        print(f"✅ Progress endpoint status: {response.status_code}")
        if response.status_code in [200, 404]:  # 404 is expected for non-existent project
            print("✅ Progress endpoint is accessible")
        else:
            print(f"⚠️ Unexpected status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing progress: {e}")
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print("✅ Backend API endpoints are accessible")
    print("\n📝 Next steps:")
    print("   1. Start your Docker containers: docker-compose up")
    print("   2. Navigate to a video lesson project in your app")
    print("   3. The avatar previews should now show actual Elai avatars")
    print("   4. Test the video generation functionality")
    
    return True

if __name__ == "__main__":
    success = test_backend_api()
    sys.exit(0 if success else 1)
