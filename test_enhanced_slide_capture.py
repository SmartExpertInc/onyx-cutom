#!/usr/bin/env python3
"""
Test Enhanced Slide Capture Service
==================================

This script tests the enhanced slide capture service with comprehensive logging
to identify and fix the "No such file or directory" error.
"""

import asyncio
import sys
import os
import logging
from pathlib import Path
from datetime import datetime

# Configure detailed logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'enhanced_slide_capture_test_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

# Add the backend directory to the path
sys.path.append('custom_extensions/backend')

async def test_enhanced_slide_capture():
    """Test the enhanced slide capture service with detailed logging."""
    print("🧪 Testing Enhanced Slide Capture Service")
    print("=" * 60)
    
    try:
        # Import the slide capture service
        from app.services.slide_capture_service import ProfessionalSlideCapture, SlideVideoConfig
        
        print("✅ Slide capture service imported successfully")
        
        # Create slide capture service instance
        print("🔧 Creating slide capture service instance...")
        slide_capture = ProfessionalSlideCapture()
        print("✅ Slide capture service instance created")
        
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
        
        # Test slide capture with enhanced logging
        print("🎬 Testing slide capture with enhanced logging...")
        
        try:
            slide_video_path = await slide_capture.capture_slide_video(config)
            
            if os.path.exists(slide_video_path):
                file_size = os.path.getsize(slide_video_path)
                print(f"✅ Slide capture successful: {slide_video_path} ({file_size} bytes)")
                
                return {
                    "test": "Enhanced Slide Capture Service",
                    "status": "PASSED",
                    "details": f"Video captured: {slide_video_path} ({file_size} bytes)",
                    "file_path": slide_video_path
                }
            else:
                raise Exception(f"Video file not found: {slide_video_path}")
                
        except Exception as capture_error:
            print(f"❌ Slide capture failed: {capture_error}")
            print(f"📋 Error type: {type(capture_error).__name__}")
            import traceback
            print(f"🔍 Stack trace: {traceback.format_exc()}")
            
            return {
                "test": "Enhanced Slide Capture Service",
                "status": "FAILED",
                "details": str(capture_error),
                "error_type": type(capture_error).__name__
            }
        
    except Exception as e:
        print(f"❌ Test setup failed: {e}")
        import traceback
        print(f"🔍 Stack trace: {traceback.format_exc()}")
        
        return {
            "test": "Enhanced Slide Capture Service",
            "status": "FAILED",
            "details": f"Setup failed: {str(e)}",
            "error_type": type(e).__name__
        }

async def test_directory_creation():
    """Test directory creation and permissions."""
    print("\n📁 Testing Directory Creation and Permissions")
    print("=" * 60)
    
    try:
        # Get current working directory
        current_dir = os.getcwd()
        print(f"📁 Current working directory: {current_dir}")
        
        # Test temp directory creation
        temp_dir = Path(current_dir) / "temp"
        print(f"📁 Creating temp directory: {temp_dir}")
        
        temp_dir.mkdir(parents=True, exist_ok=True)
        print(f"✅ Temp directory created: {temp_dir}")
        
        # Test if directory exists and is writable
        if temp_dir.exists():
            print(f"✅ Temp directory exists: {temp_dir}")
        else:
            print(f"❌ Temp directory does not exist: {temp_dir}")
            return False
        
        if os.access(temp_dir, os.W_OK):
            print(f"✅ Temp directory is writable: {temp_dir}")
        else:
            print(f"❌ Temp directory is not writable: {temp_dir}")
            return False
        
        # Test file creation
        test_file = temp_dir / "test_file.txt"
        try:
            with open(test_file, 'w') as f:
                f.write("test content")
            print(f"✅ Test file created: {test_file}")
            
            # Clean up
            test_file.unlink()
            print(f"🧹 Test file cleaned up: {test_file}")
            
        except Exception as file_error:
            print(f"❌ Test file creation failed: {file_error}")
            return False
        
        print("✅ Directory creation and permissions test passed")
        return True
        
    except Exception as e:
        print(f"❌ Directory test failed: {e}")
        return False

async def test_ffmpeg_availability():
    """Test FFmpeg availability."""
    print("\n🎬 Testing FFmpeg Availability")
    print("=" * 60)
    
    try:
        import subprocess
        
        # Test FFmpeg
        result = subprocess.run(['ffmpeg', '-version'], 
                              capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print("✅ FFmpeg is available")
            print(f"📋 FFmpeg version: {result.stdout.split('ffmpeg version')[1].split()[0]}")
            return True
        else:
            print("❌ FFmpeg check failed")
            return False
            
    except Exception as e:
        print(f"❌ FFmpeg test failed: {e}")
        return False

async def main():
    """Main test function."""
    print("🚀 Enhanced Slide Capture Service Test Suite")
    print("=" * 60)
    
    # Test 1: Directory creation and permissions
    dir_test = await test_directory_creation()
    
    # Test 2: FFmpeg availability
    ffmpeg_test = await test_ffmpeg_availability()
    
    # Test 3: Enhanced slide capture
    capture_test = await test_enhanced_slide_capture()
    
    # Summary
    print("\n📊 Test Results Summary")
    print("=" * 60)
    print(f"📁 Directory Creation: {'✅ PASSED' if dir_test else '❌ FAILED'}")
    print(f"🎬 FFmpeg Availability: {'✅ PASSED' if ffmpeg_test else '❌ FAILED'}")
    print(f"🎬 Slide Capture: {capture_test['status']}")
    
    if capture_test['status'] == 'FAILED':
        print(f"📋 Error: {capture_test['details']}")
        print(f"🔍 Error Type: {capture_test.get('error_type', 'Unknown')}")
    
    # Overall result
    if dir_test and ffmpeg_test and capture_test['status'] == 'PASSED':
        print("\n🎉 All tests passed!")
        return 0
    else:
        print("\n❌ Some tests failed!")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
