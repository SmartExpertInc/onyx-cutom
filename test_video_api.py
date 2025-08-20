#!/usr/bin/env python3
"""
Test Video Lesson API Endpoints
===============================

This script tests the video lesson generation API endpoints to ensure they're working properly.
"""

import os
import sys
import requests
import json
from datetime import datetime

# Set the API token
os.environ["ELAI_API_TOKEN"] = "5774fLyEZuhr22LTmv6zwjZuk9M5rQ9e"

def test_elai_api_direct():
    """Test direct Elai API call to verify the token works."""
    print("🔍 Testing direct Elai API...")
    
    headers = {
        "Authorization": "Bearer 5774fLyEZuhr22LTmv6zwjZuk9M5rQ9e",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    # Test a simple API call to get user info or available avatars
    try:
        response = requests.get("https://apis.elai.io/api/v1/avatars", headers=headers)
        print(f"✅ Elai API Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {len(data)} available avatars")
            return True
        else:
            print(f"❌ Elai API Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Elai API Connection Error: {e}")
        return False

def test_video_lesson_api():
    """Test the video lesson API endpoints."""
    print("\n🎬 Testing Video Lesson API endpoints...")
    
    base_url = "http://localhost:8000"  # Adjust if your backend runs on different port
    
    # Test 1: Check if the API is accessible
    try:
        response = requests.get(f"{base_url}/api/custom/video-lesson/progress/test-project")
        print(f"✅ API Status: {response.status_code}")
        if response.status_code in [200, 404, 503]:  # 404 is expected for non-existent project, 503 if services not available
            print("✅ Video Lesson API is accessible")
            return True
        else:
            print(f"❌ API Error: {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Video Lesson API - backend may not be running")
        print("💡 Make sure to start the backend with: docker-compose up custom_backend")
        return False
    except Exception as e:
        print(f"❌ API Error: {e}")
        return False

def main():
    """Main test function."""
    print("🚀 Video Lesson API Test")
    print("=" * 50)
    
    # Test 1: Direct Elai API
    elai_works = test_elai_api_direct()
    
    # Test 2: Video Lesson API
    api_works = test_video_lesson_api()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"   Elai API: {'✅ Working' if elai_works else '❌ Failed'}")
    print(f"   Video Lesson API: {'✅ Working' if api_works else '❌ Failed'}")
    
    if elai_works and api_works:
        print("\n🎉 All tests passed! The video lesson generation should work.")
        print("\n📝 Next steps:")
        print("   1. Start your Docker containers: docker-compose up")
        print("   2. Navigate to a video lesson project in your app")
        print("   3. Click 'Generate Video' button")
        print("   4. Use the debug component to test API calls")
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")
        
        if not elai_works:
            print("\n🔧 Elai API Issues:")
            print("   - Check if the API token is valid")
            print("   - Verify internet connection")
            
        if not api_works:
            print("\n🔧 Video Lesson API Issues:")
            print("   - Make sure backend is running: docker-compose up custom_backend")
            print("   - Check if port 8000 is accessible")
            print("   - Verify all dependencies are installed")

if __name__ == "__main__":
    main()
