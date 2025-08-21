#!/usr/bin/env python3
"""
Test script to check video lesson router import and inclusion.
"""

import sys
import os

# Add the backend directory to Python path
sys.path.append('custom_extensions/backend')

def test_import():
    """Test importing the video lesson router."""
    try:
        print("🔄 Testing video_lesson_api import...")
        import video_lesson_api
        print("✅ video_lesson_api imported successfully")
        
        print(f"🔄 Router prefix: {video_lesson_api.router.prefix}")
        print(f"🔄 Router tags: {video_lesson_api.router.tags}")
        
        print("🔄 Available routes:")
        for route in video_lesson_api.router.routes:
            print(f"   - {route.methods} {route.path}")
        
        return True
        
    except Exception as e:
        print(f"❌ Import error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_main_import():
    """Test importing main.py to see if router is included."""
    try:
        print("\n🔄 Testing main.py import...")
        import main
        print("✅ main.py imported successfully")
        
        # Check if the router was included
        print("🔄 Checking if video lesson router was included...")
        
        # Look for the router in the app's routes
        app_routes = []
        for route in main.app.routes:
            if hasattr(route, 'routes'):
                for sub_route in route.routes:
                    app_routes.append(f"{sub_route.methods} {sub_route.path}")
            else:
                app_routes.append(f"{route.methods} {route.path}")
        
        video_routes = [route for route in app_routes if 'video-lesson' in str(route)]
        
        if video_routes:
            print("✅ Video lesson routes found in main app:")
            for route in video_routes:
                print(f"   - {route}")
        else:
            print("❌ No video lesson routes found in main app")
            print("Available routes:")
            for route in app_routes[:10]:  # Show first 10 routes
                print(f"   - {route}")
        
        return len(video_routes) > 0
        
    except Exception as e:
        print(f"❌ Main import error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Testing Video Lesson Router")
    print("=" * 40)
    
    import_success = test_import()
    main_success = test_main_import()
    
    if import_success and main_success:
        print("\n🎉 All tests passed! Video lesson router should be working.")
        sys.exit(0)
    else:
        print("\n❌ Tests failed! There are issues with the video lesson router.")
        sys.exit(1)
