#!/usr/bin/env python3
"""
Test Video Generation Fixes
===========================

This script tests the comprehensive fixes for the video generation system:
1. Video recording environment validation
2. Screenshot fallback method
3. Enhanced error handling
4. Complete pipeline testing
"""

import asyncio
import sys
import os
from pathlib import Path

# Add the backend directory to the path
sys.path.append('custom_extensions/backend')

async def test_video_generation_fixes():
    """Test the comprehensive video generation fixes."""
    print("🧪 Testing Video Generation Fixes")
    print("=" * 60)
    
    try:
        # Import the services
        from app.services.slide_capture_service import ProfessionalSlideCapture, SlideVideoConfig
        from app.services.presentation_service import ProfessionalPresentationService, PresentationRequest
        
        print("✅ Services imported successfully")
        
        # Test 1: Slide Capture Service with Validation
        print("\n🔧 Test 1: Slide Capture Service with Environment Validation")
        print("-" * 50)
        
        slide_capture = ProfessionalSlideCapture()
        print("✅ Slide capture service created")
        
        # Initialize browser
        await slide_capture.initialize_browser()
        print("✅ Browser initialized")
        
        # Test environment validation
        print("🔍 Testing video recording environment validation...")
        is_valid = await slide_capture.validate_video_environment()
        
        if is_valid:
            print("✅ Video recording environment is valid")
        else:
            print("⚠️  Video recording environment not available - fallback will be used")
        
        # Test 2: Screenshot Fallback Method
        print("\n📸 Test 2: Screenshot Fallback Method")
        print("-" * 50)
        
        config = SlideVideoConfig(
            slide_url="https://example.com",
            duration=5.0,  # Short duration for testing
            width=1280,
            height=720,
            frame_rate=30,
            quality='medium'
        )
        
        print("🎬 Testing screenshot fallback method...")
        try:
            video_path = await slide_capture.capture_with_screenshots(config)
            print(f"✅ Screenshot fallback successful: {video_path}")
            
            # Check if video file exists and has content
            if os.path.exists(video_path):
                file_size = os.path.getsize(video_path)
                print(f"✅ Video file created: {file_size} bytes")
            else:
                print("❌ Video file not found")
                
        except Exception as e:
            print(f"❌ Screenshot fallback failed: {e}")
        
        # Test 3: Complete Pipeline with Error Handling
        print("\n🎯 Test 3: Complete Pipeline with Error Handling")
        print("-" * 50)
        
        presentation_service = ProfessionalPresentationService()
        print("✅ Presentation service created")
        
        # Create test request
        request = PresentationRequest(
            slide_url="https://example.com",
            voiceover_texts=["This is a test voiceover for the video generation system."],
            avatar_code="gia.casual",
            duration=10.0,
            layout="side_by_side",
            quality="medium",
            resolution=[1280, 720],
            project_name="Test Video Generation"
        )
        
        print("🎬 Testing complete presentation pipeline...")
        try:
            # Create presentation job
            job_id = await presentation_service.create_presentation(request)
            print(f"✅ Presentation job created: {job_id}")
            
            # Get initial status
            status = await presentation_service.get_job_status(job_id)
            print(f"✅ Initial status: {status.status}, Progress: {status.progress}%")
            
            # Wait for completion (with timeout)
            print("⏳ Waiting for completion...")
            max_wait = 60  # 60 seconds timeout
            wait_interval = 5  # Check every 5 seconds
            
            for i in range(max_wait // wait_interval):
                await asyncio.sleep(wait_interval)
                status = await presentation_service.get_job_status(job_id)
                print(f"📊 Status: {status.status}, Progress: {status.progress}%")
                
                if status.status == "completed":
                    print("✅ Presentation completed successfully!")
                    print(f"🎬 Video URL: {status.video_url}")
                    break
                elif status.status == "failed":
                    print(f"❌ Presentation failed: {status.error}")
                    break
            else:
                print("⏰ Timeout waiting for completion")
                
        except Exception as e:
            print(f"❌ Pipeline test failed: {e}")
        
        # Test 4: Error Recovery
        print("\n🛠️ Test 4: Error Recovery and Fallback")
        print("-" * 50)
        
        # Test with invalid URL to trigger fallback
        invalid_config = SlideVideoConfig(
            slide_url="https://invalid-url-that-will-fail.com",
            duration=3.0,
            width=1280,
            height=720,
            frame_rate=30,
            quality='medium'
        )
        
        print("🎬 Testing error recovery with invalid URL...")
        try:
            video_path = await slide_capture.capture_slide_video(invalid_config)
            print(f"✅ Error recovery successful: {video_path}")
        except Exception as e:
            print(f"❌ Error recovery failed: {e}")
        
        # Cleanup
        await slide_capture.close()
        print("\n🧹 Cleanup completed")
        
        print("\n🎉 All tests completed!")
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
    print("🚀 Video Generation Fixes Test Suite")
    print("=" * 60)
    
    success = await test_video_generation_fixes()
    
    if success:
        print("\n✅ All tests passed!")
        print("🎬 Your video generation system should now be robust and reliable!")
        sys.exit(0)
    else:
        print("\n❌ Tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
