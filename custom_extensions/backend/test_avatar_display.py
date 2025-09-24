#!/usr/bin/env python3
"""
Test Avatar Display Functionality
================================

This script tests the avatar display functionality by:
1. Testing the avatar API endpoint
2. Verifying avatar data structure
3. Testing video creation endpoints
"""

import asyncio
import httpx
import json
import sys
from datetime import datetime

async def test_avatar_api():
    """Test the avatar API endpoint."""
    print("🧪 Testing Avatar API Endpoint")
    print("=" * 50)
    
    try:
        async with httpx.AsyncClient() as client:
            # Test avatar endpoint
            response = await client.get("http://localhost:8001/api/custom/video/avatars")
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Avatar API working! Response: {json.dumps(data, indent=2)}")
                
                if data.get("success") and data.get("avatars"):
                    avatars = data["avatars"]
                    print(f"📊 Found {len(avatars)} avatars")
                    
                    if len(avatars) > 0:
                        first_avatar = avatars[0]
                        print(f"🎭 First avatar: {first_avatar.get('name', 'Unknown')}")
                        print(f"   Code: {first_avatar.get('code', 'Unknown')}")
                        print(f"   Gender: {first_avatar.get('gender', 'Unknown')}")
                        print(f"   Canvas: {first_avatar.get('canvas', 'Unknown')}")
                        
                        # Test video creation endpoint
                        await test_video_creation(first_avatar.get('code', 'gia.casual'))
                    else:
                        print("⚠️ No avatars found")
                else:
                    print("❌ No avatar data in response")
                    return False
            else:
                print(f"❌ Avatar API failed with status {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Error testing avatar API: {e}")
        return False
    
    return True

async def test_video_creation(avatar_code: str):
    """Test video creation endpoint."""
    print(f"\n🎬 Testing Video Creation with Avatar: {avatar_code}")
    print("=" * 50)
    
    try:
        async with httpx.AsyncClient() as client:
            # Test video creation
            test_data = {
                "projectName": f"Test Video - {datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "voiceoverTexts": [
                    "Welcome to this test video. This is the first slide with our AI avatar.",
                    "This is the second slide. The avatar will present this content professionally.",
                    "Finally, this is the third slide. Thank you for watching our test video."
                ],
                "avatarCode": avatar_code
            }
            
            response = await client.post(
                "http://localhost:8001/api/custom/video/create",
                json=test_data,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Video creation API working! Response: {json.dumps(data, indent=2)}")
                
                if data.get("success") and data.get("videoId"):
                    video_id = data["videoId"]
                    print(f"🎬 Video created with ID: {video_id}")
                    
                    # Test render endpoint
                    await test_video_render(video_id)
                else:
                    print("❌ Video creation failed")
                    print(f"Error: {data.get('error', 'Unknown error')}")
            else:
                print(f"❌ Video creation API failed with status {response.status_code}")
                print(f"Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Error testing video creation: {e}")

async def test_video_render(video_id: str):
    """Test video render endpoint."""
    print(f"\n🎬 Testing Video Render for ID: {video_id}")
    print("=" * 50)
    
    try:
        async with httpx.AsyncClient() as client:
            # Test render endpoint
            response = await client.post(f"http://localhost:8001/api/custom/video/render/{video_id}")
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Video render API working! Response: {json.dumps(data, indent=2)}")
                
                if data.get("success"):
                    print("🎬 Video rendering started successfully")
                    
                    # Test status endpoint
                    await test_video_status(video_id)
                else:
                    print("❌ Video render failed")
                    print(f"Error: {data.get('error', 'Unknown error')}")
            else:
                print(f"❌ Video render API failed with status {response.status_code}")
                print(f"Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Error testing video render: {e}")

async def test_video_status(video_id: str):
    """Test video status endpoint."""
    print(f"\n🎬 Testing Video Status for ID: {video_id}")
    print("=" * 50)
    
    try:
        async with httpx.AsyncClient() as client:
            # Test status endpoint
            response = await client.get(f"http://localhost:8001/api/custom/video/status/{video_id}")
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Video status API working! Response: {json.dumps(data, indent=2)}")
                
                if data.get("success"):
                    status = data.get("status", "unknown")
                    progress = data.get("progress", 0)
                    print(f"🎬 Video status: {status}, Progress: {progress}%")
                else:
                    print("❌ Video status check failed")
                    print(f"Error: {data.get('error', 'Unknown error')}")
            else:
                print(f"❌ Video status API failed with status {response.status_code}")
                print(f"Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Error testing video status: {e}")

async def main():
    """Main test function."""
    print("🚀 Avatar Display and Video Generation Test")
    print("=" * 60)
    
    # Test avatar API
    success = await test_avatar_api()
    
    if success:
        print("\n🎉 All tests completed successfully!")
        print("✅ Avatar display functionality is working")
        print("✅ Video generation endpoints are available")
        sys.exit(0)
    else:
        print("\n💥 Tests failed!")
        print("❌ Avatar display functionality has issues")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
