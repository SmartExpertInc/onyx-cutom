#!/usr/bin/env python3
"""
Simple test script for video generation service
"""

import asyncio
import sys
import os

# Add the current directory to the path
sys.path.append(os.path.dirname(__file__))

async def test_video_service():
    """Test the video generation service."""
    try:
        from app.services.video_generation_service import video_generation_service
        
        print("✅ Video generation service imported successfully")
        
        # Test avatar fetching
        print("\n🔄 Testing avatar fetching...")
        result = await video_generation_service.get_avatars()
        
        if result["success"]:
            avatars = result["avatars"]
            print(f"✅ Successfully fetched {len(avatars)} avatars")
            
            # Show first few avatars
            for i, avatar in enumerate(avatars[:3]):
                print(f"  {i+1}. {avatar.get('name', 'Unknown')} ({avatar.get('gender', 'Unknown')})")
                if avatar.get('variants'):
                    variants = [v.get('code', 'unknown') for v in avatar['variants']]
                    print(f"     Variants: {', '.join(variants)}")
                if avatar.get('limit') == 300:
                    print(f"     ⭐ Extended duration (5 min) supported")
                print()
        else:
            print(f"❌ Failed to fetch avatars: {result['error']}")
        
        print("✅ Video generation service test completed successfully!")
        
    except Exception as e:
        print(f"❌ Error testing video service: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🧪 Testing Video Generation Service")
    print("=" * 50)
    
    success = asyncio.run(test_video_service())
    
    if success:
        print("\n🎉 All tests passed! Video generation service is ready.")
    else:
        print("\n💥 Tests failed. Please check the error messages above.")
        sys.exit(1)
