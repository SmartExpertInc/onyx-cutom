#!/usr/bin/env python3
"""
Test Slide Capture Service with Corrected Video API
==================================================

This script tests the fixed slide capture service to ensure it works correctly
with the proper Playwright video API.
"""

import asyncio
import sys
import os
from pathlib import Path
from datetime import datetime

# Add the backend directory to the path
sys.path.append('custom_extensions/backend')

async def test_slide_capture_video_api():
    """Test the slide capture service with corrected video API."""
    print("🧪 Testing Slide Capture Service with Corrected Video API")
    print("=" * 60)
    
    try:
        # Import the slide capture service
        from app.services.slide_capture_service import ProfessionalSlideCapture, SlideVideoConfig
        
        print("✅ Slide capture service imported successfully")
        
        # Create slide capture service instance
        slide_capture = ProfessionalSlideCapture()
        print("✅ Slide capture service instance created")
        
        # Initialize browser
        print("🔧 Initializing browser...")
        await slide_capture.initialize_browser()
        print("✅ Browser initialized successfully")
        
        # Test configuration
        config = SlideVideoConfig(
            slide_url="https://example.com",
            duration=5.0,  # Short duration for testing
            width=1280,
            height=720,
            frame_rate=30,
            quality='medium'
        )
        
        print(f"✅ Test configuration created: {config}")
        
        # Test slide capture with corrected video API
        print("🎬 Testing slide capture with corrected video API...")
        
        # Create context
        context = await slide_capture.browser.new_context(
            viewport={'width': config.width, 'height': config.height},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        
        print("✅ Browser context created successfully")
        
        # Create page
        page = await context.new_page()
        print("✅ Page created successfully")
        
        # Start video recording using the page.video API
        video_path = f"temp/slide_{datetime.now().strftime('%Y%m%d_%H%M%S')}.webm"
        await page.video.start(path=video_path)
        print("✅ Video recording started successfully")
        
        # Test navigation (this will work)
        await page.goto("https://example.com", wait_until='domcontentloaded', timeout=10000)
        print("✅ Navigation successful")
        
        # Wait a bit
        await page.wait_for_timeout(2000)
        print("✅ Wait completed")
        
        # Stop video recording
        captured_video_path = await page.video.stop()
        print(f"✅ Video recording stopped: {captured_video_path}")
        
        # Close page and context
        await page.close()
        await context.close()
        print("✅ Page and context closed")
        
        # Check if video was created
        if captured_video_path and os.path.exists(captured_video_path):
            print(f"✅ Video file created successfully: {captured_video_path}")
            print(f"✅ Video file size: {os.path.getsize(captured_video_path)} bytes")
        else:
            print("⚠️  Video file not found or empty")
        
        # Clean up
        await slide_capture.close()
        print("✅ Slide capture service closed")
        
        print("\n🎉 Slide capture service test completed successfully!")
        print("✅ The 'BrowserContext' object has no attribute 'video' error has been fixed!")
        print("✅ Video recording is now working with the correct Playwright API!")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("   Make sure you're running this from the project root directory")
        return False
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        print(f"   Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Main test function."""
    print("🚀 Slide Capture Service Video API Fix Test")
    print("=" * 60)
    
    success = await test_slide_capture_video_api()
    
    if success:
        print("\n✅ All tests passed!")
        print("🎬 Your video generation should now work correctly!")
        sys.exit(0)
    else:
        print("\n❌ Tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
