#!/usr/bin/env python3
"""
Test script to verify the proxy fix is working.
This script tests the video lesson endpoints through the proxy.
"""

import requests
import json
import sys

def test_proxy_endpoints():
    """Test the video lesson endpoints through the proxy."""
    # Test through the main domain (which goes through the proxy)
    base_url = "https://dev4.contentbuilder.ai"
    
    print("🚀 Testing Video Lesson Endpoints Through Proxy")
    print("=" * 50)
    
    # Test 1: Test endpoint
    print("\n🔄 Testing /test endpoint through proxy...")
    try:
        response = requests.get(f"{base_url}/api/custom-projects-backend/video-lesson/test")
        if response.status_code == 200:
            print("✅ /test endpoint working through proxy")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ /test endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ /test endpoint error: {e}")
    
    # Test 2: Avatars endpoint
    print("\n🔄 Testing /avatars endpoint through proxy...")
    try:
        response = requests.get(f"{base_url}/api/custom-projects-backend/video-lesson/avatars")
        if response.status_code == 200:
            print("✅ /avatars endpoint working through proxy")
            data = response.json()
            print(f"   Found {len(data.get('avatars', []))} avatars")
        else:
            print(f"❌ /avatars endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ /avatars endpoint error: {e}")
    
    # Test 3: Generate avatar endpoint
    print("\n🔄 Testing /generate-avatar endpoint through proxy...")
    try:
        test_data = {
            "project_id": "test_project",
            "avatar_code": "gia.casual",
            "voice": "en-US-AriaNeural"
        }
        response = requests.post(
            f"{base_url}/api/custom-projects-backend/video-lesson/generate-avatar",
            json=test_data
        )
        if response.status_code == 200:
            print("✅ /generate-avatar endpoint working through proxy")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ /generate-avatar endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ /generate-avatar endpoint error: {e}")
    
    print("\n🎉 Proxy testing completed!")

if __name__ == "__main__":
    test_proxy_endpoints()
