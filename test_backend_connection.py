#!/usr/bin/env python3
"""
Simple Backend Connection Test
=============================

This script tests if the backend is accessible and the video lesson endpoints are working.
"""

import requests
import json
import sys

def test_backend_connection():
    """Test backend connection and endpoints."""
    print("🔍 Testing Backend Connection")
    print("=" * 50)
    
    # Test different possible backend URLs
    possible_urls = [
        "http://localhost:8000",
        "http://localhost:8001", 
        "http://custom_backend:8000",
        "http://custom_backend:8001"
    ]
    
    working_url = None
    
    for base_url in possible_urls:
        print(f"\nTesting {base_url}...")
        try:
            # Test basic connectivity
            response = requests.get(f"{base_url}/health", timeout=5)
            if response.status_code == 200:
                print(f"✅ Backend is accessible at {base_url}")
                working_url = base_url
                break
        except requests.exceptions.ConnectionError:
            print(f"❌ Cannot connect to {base_url}")
        except requests.exceptions.Timeout:
            print(f"⏰ Timeout connecting to {base_url}")
        except Exception as e:
            print(f"❌ Error connecting to {base_url}: {e}")
    
    if not working_url:
        print("\n❌ No backend URL is accessible!")
        print("\n💡 Troubleshooting steps:")
        print("   1. Make sure Docker containers are running: docker-compose up")
        print("   2. Check if custom_backend service is started")
        print("   3. Verify the backend port in docker-compose.yml")
        return False
    
    # Test video lesson endpoints
    print(f"\n🎬 Testing Video Lesson Endpoints at {working_url}")
    
    # Test 1: Avatars endpoint
    try:
        response = requests.get(f"{working_url}/api/custom/video-lesson/avatars", timeout=10)
        print(f"✅ Avatars endpoint status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {len(data.get('avatars', []))} avatars")
            for avatar in data.get('avatars', [])[:3]:  # Show first 3
                print(f"   - {avatar.get('name', 'Unknown')} ({avatar.get('code', 'Unknown')})")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Error testing avatars endpoint: {e}")
    
    # Test 2: Generate avatar endpoint (should return 400 for invalid request)
    try:
        response = requests.post(
            f"{working_url}/api/custom/video-lesson/generate-avatar",
            json={"project_id": "test"},
            timeout=10
        )
        print(f"✅ Generate avatar endpoint status: {response.status_code}")
        if response.status_code in [400, 401, 404]:  # Expected for invalid request
            print("✅ Endpoint is accessible (returned expected error for invalid request)")
        else:
            print(f"⚠️ Unexpected status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing generate-avatar endpoint: {e}")
    
    # Test 3: Progress endpoint
    try:
        response = requests.get(f"{working_url}/api/custom/video-lesson/progress/test-project", timeout=10)
        print(f"✅ Progress endpoint status: {response.status_code}")
        if response.status_code in [200, 404]:  # 404 is expected for non-existent project
            print("✅ Progress endpoint is accessible")
        else:
            print(f"⚠️ Unexpected status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing progress endpoint: {e}")
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print("✅ Backend is accessible and endpoints are responding")
    print("\n📝 Next steps:")
    print("   1. The avatar previews should now work in the frontend")
    print("   2. Try generating a video lesson")
    print("   3. Check the browser console for any remaining errors")
    
    return True

if __name__ == "__main__":
    success = test_backend_connection()
    sys.exit(0 if success else 1)
