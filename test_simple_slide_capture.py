#!/usr/bin/env python3
"""
Simple Slide Capture Test
========================

This script tests the slide capture service to identify the exact file path issue.
"""

import asyncio
import sys
import os
import logging
from pathlib import Path
from datetime import datetime

# Configure simple logging without Unicode
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Add the backend directory to the path
sys.path.append('custom_extensions/backend')

async def test_simple_slide_capture():
    """Test the slide capture service with simple logging."""
    print("Testing Simple Slide Capture Service")
    print("=" * 50)
    
    try:
        # Import the slide capture service
        from app.services.slide_capture_service import ProfessionalSlideCapture, SlideVideoConfig
        
        print("Slide capture service imported successfully")
        
        # Create slide capture service instance
        print("Creating slide capture service instance...")
        slide_capture = ProfessionalSlideCapture()
        print("Slide capture service instance created")
        
        # Test configuration
        config = SlideVideoConfig(
            slide_url="https://example.com",
            duration=3.0,  # Very short duration for testing
            width=1280,
            height=720,
            frame_rate=30,
            quality='medium'
        )
        
        print(f"Test configuration created: {config}")
        
        # Test slide capture
        print("Testing slide capture...")
        
        try:
            slide_video_path = await slide_capture.capture_slide_video(config)
            
            if os.path.exists(slide_video_path):
                file_size = os.path.getsize(slide_video_path)
                print(f"SUCCESS: Slide capture successful: {slide_video_path} ({file_size} bytes)")
                
                return {
                    "test": "Simple Slide Capture Service",
                    "status": "PASSED",
                    "details": f"Video captured: {slide_video_path} ({file_size} bytes)",
                    "file_path": slide_video_path
                }
            else:
                raise Exception(f"Video file not found: {slide_video_path}")
                
        except Exception as capture_error:
            print(f"FAILED: Slide capture failed: {capture_error}")
            print(f"Error type: {type(capture_error).__name__}")
            import traceback
            print(f"Stack trace: {traceback.format_exc()}")
            
            return {
                "test": "Simple Slide Capture Service",
                "status": "FAILED",
                "details": str(capture_error),
                "error_type": type(capture_error).__name__
            }
        
    except Exception as e:
        print(f"FAILED: Test setup failed: {e}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        
        return {
            "test": "Simple Slide Capture Service",
            "status": "FAILED",
            "details": f"Setup failed: {str(e)}",
            "error_type": type(e).__name__
        }

async def test_directory_access():
    """Test directory access and file creation."""
    print("\nTesting Directory Access and File Creation")
    print("=" * 50)
    
    try:
        # Get current working directory
        current_dir = os.getcwd()
        print(f"Current working directory: {current_dir}")
        
        # Test temp directory creation
        temp_dir = Path(current_dir) / "temp"
        print(f"Creating temp directory: {temp_dir}")
        
        temp_dir.mkdir(parents=True, exist_ok=True)
        print(f"Temp directory created: {temp_dir}")
        
        # Test if directory exists and is writable
        if temp_dir.exists():
            print(f"Temp directory exists: {temp_dir}")
        else:
            print(f"ERROR: Temp directory does not exist: {temp_dir}")
            return False
        
        if os.access(temp_dir, os.W_OK):
            print(f"Temp directory is writable: {temp_dir}")
        else:
            print(f"ERROR: Temp directory is not writable: {temp_dir}")
            return False
        
        # Test file creation
        test_file = temp_dir / "test_file.txt"
        try:
            with open(test_file, 'w') as f:
                f.write("test content")
            print(f"Test file created: {test_file}")
            
            # Clean up
            test_file.unlink()
            print(f"Test file cleaned up: {test_file}")
            
        except Exception as file_error:
            print(f"ERROR: Test file creation failed: {file_error}")
            return False
        
        print("Directory access and file creation test passed")
        return True
        
    except Exception as e:
        print(f"ERROR: Directory test failed: {e}")
        return False

async def main():
    """Main test function."""
    print("Simple Slide Capture Service Test Suite")
    print("=" * 50)
    
    # Test 1: Directory access and file creation
    dir_test = await test_directory_access()
    
    # Test 2: Simple slide capture
    capture_test = await test_simple_slide_capture()
    
    # Summary
    print("\nTest Results Summary")
    print("=" * 50)
    print(f"Directory Access: {'PASSED' if dir_test else 'FAILED'}")
    print(f"Slide Capture: {capture_test['status']}")
    
    if capture_test['status'] == 'FAILED':
        print(f"Error: {capture_test['details']}")
        print(f"Error Type: {capture_test.get('error_type', 'Unknown')}")
    
    # Overall result
    if dir_test and capture_test['status'] == 'PASSED':
        print("\nAll tests passed!")
        return 0
    else:
        print("\nSome tests failed!")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
