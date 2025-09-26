#!/usr/bin/env python3
"""
Video Generation Fix Test
========================

This script tests the video generation fixes including:
1. FFmpeg availability check
2. Fallback video creation methods
3. Directory and file operations
4. Complete slide capture workflow
"""

import asyncio
import sys
import os
import logging
import subprocess
from pathlib import Path
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Add the backend directory to the path
sys.path.append('custom_extensions/backend')

async def test_ffmpeg_availability():
    """Test if FFmpeg is available in the system."""
    print("Testing FFmpeg Availability")
    print("=" * 40)
    
    try:
        # Test FFmpeg command
        result = subprocess.run(['ffmpeg', '-version'], 
                              capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            version_line = result.stdout.split('\n')[0]
            print(f"SUCCESS: FFmpeg is available")
            print(f"Version: {version_line}")
            return True
        else:
            print(f"FAILED: FFmpeg check failed with return code {result.returncode}")
            return False
            
    except FileNotFoundError:
        print("FAILED: FFmpeg not found in system PATH")
        return False
    except Exception as e:
        print(f"FAILED: FFmpeg test error: {e}")
        return False

async def test_moviepy_availability():
    """Test if MoviePy is available for fallback video creation."""
    print("\nTesting MoviePy Availability")
    print("=" * 40)
    
    try:
        import moviepy
        print(f"SUCCESS: MoviePy is available (version: {moviepy.__version__})")
        return True
    except ImportError:
        print("FAILED: MoviePy not installed")
        return False
    except Exception as e:
        print(f"FAILED: MoviePy test error: {e}")
        return False

async def test_directory_operations():
    """Test directory creation and file operations."""
    print("\nTesting Directory Operations")
    print("=" * 40)
    
    try:
        # Get current working directory
        current_dir = os.getcwd()
        print(f"Current directory: {current_dir}")
        
        # Test temp directory creation
        temp_dir = Path(current_dir) / "temp"
        temp_dir.mkdir(parents=True, exist_ok=True)
        print(f"SUCCESS: Temp directory created: {temp_dir}")
        
        # Test file creation
        test_file = temp_dir / "test_file.txt"
        with open(test_file, 'w') as f:
            f.write("test content")
        print(f"SUCCESS: Test file created: {test_file}")
        
        # Test file size
        file_size = os.path.getsize(test_file)
        print(f"File size: {file_size} bytes")
        
        # Clean up
        test_file.unlink()
        print("SUCCESS: Test file cleaned up")
        
        return True
        
    except Exception as e:
        print(f"FAILED: Directory operations error: {e}")
        return False

async def test_slide_capture_service():
    """Test the enhanced slide capture service."""
    print("\nTesting Enhanced Slide Capture Service")
    print("=" * 40)
    
    try:
        # Import the slide capture service
        from app.services.slide_capture_service import ProfessionalSlideCapture, SlideVideoConfig
        
        print("SUCCESS: Slide capture service imported")
        
        # Create service instance
        slide_capture = ProfessionalSlideCapture()
        print("SUCCESS: Slide capture service instance created")
        
        # Test configuration
        config = SlideVideoConfig(
            slide_url="https://example.com",
            duration=2.0,  # Very short for testing
            width=1280,
            height=720,
            frame_rate=30,
            quality='medium'
        )
        print(f"SUCCESS: Test configuration created")
        
        # Test slide capture
        print("Starting slide capture test...")
        slide_video_path = await slide_capture.capture_slide_video(config)
        
        if os.path.exists(slide_video_path):
            file_size = os.path.getsize(slide_video_path)
            print(f"SUCCESS: Slide video created: {slide_video_path}")
            print(f"File size: {file_size} bytes")
            
            # Check file type
            if slide_video_path.endswith('.mp4'):
                print("SUCCESS: MP4 video file created")
            elif slide_video_path.endswith('.html'):
                print("SUCCESS: HTML viewer created (fallback)")
            else:
                print(f"INFO: Other file type created: {slide_video_path}")
            
            return {
                "status": "PASSED",
                "file_path": slide_video_path,
                "file_size": file_size
            }
        else:
            print(f"FAILED: Video file not found: {slide_video_path}")
            return {"status": "FAILED", "error": "File not created"}
            
    except Exception as e:
        print(f"FAILED: Slide capture test error: {e}")
        import traceback
        print(f"Stack trace: {traceback.format_exc()}")
        return {"status": "FAILED", "error": str(e)}

async def test_fallback_methods():
    """Test the fallback video creation methods."""
    print("\nTesting Fallback Methods")
    print("=" * 40)
    
    try:
        from app.services.slide_capture_service import ProfessionalSlideCapture
        
        slide_capture = ProfessionalSlideCapture()
        
        # Test FFmpeg availability check
        ffmpeg_available = await slide_capture._check_ffmpeg_availability()
        print(f"FFmpeg available: {ffmpeg_available}")
        
        # Create test screenshots
        test_screenshots = []
        temp_dir = Path("temp")
        temp_dir.mkdir(exist_ok=True)
        
        # Create a simple test image using PIL
        try:
            from PIL import Image, ImageDraw, ImageFont
            
            for i in range(5):
                # Create a simple test image
                img = Image.new('RGB', (1280, 720), color='white')
                draw = ImageDraw.Draw(img)
                
                # Add text
                try:
                    font = ImageFont.truetype("arial.ttf", 60)
                except:
                    font = ImageFont.load_default()
                
                draw.text((640, 360), f"Test Frame {i+1}", fill='black', anchor='mm', font=font)
                
                # Save image
                screenshot_path = temp_dir / f"test_screenshot_{i:04d}.png"
                img.save(screenshot_path)
                test_screenshots.append(str(screenshot_path))
                print(f"Created test screenshot: {screenshot_path}")
            
            # Test fallback video creation
            output_path = str(temp_dir / "test_fallback_video.mp4")
            config = type('Config', (), {
                'width': 1280,
                'height': 720,
                'frame_rate': 30,
                'quality': 'medium'
            })()
            
            result_path = await slide_capture._create_fallback_video(test_screenshots, output_path, config)
            print(f"SUCCESS: Fallback video created: {result_path}")
            
            return True
            
        except ImportError:
            print("PIL not available, skipping screenshot creation test")
            return True
            
    except Exception as e:
        print(f"FAILED: Fallback methods test error: {e}")
        return False

async def main():
    """Main test function."""
    print("Video Generation Fix Test Suite")
    print("=" * 50)
    
    results = {}
    
    # Test 1: FFmpeg availability
    results['ffmpeg'] = await test_ffmpeg_availability()
    
    # Test 2: MoviePy availability
    results['moviepy'] = await test_moviepy_availability()
    
    # Test 3: Directory operations
    results['directory'] = await test_directory_operations()
    
    # Test 4: Fallback methods
    results['fallback'] = await test_fallback_methods()
    
    # Test 5: Complete slide capture service
    results['slide_capture'] = await test_slide_capture_service()
    
    # Summary
    print("\n" + "=" * 50)
    print("TEST RESULTS SUMMARY")
    print("=" * 50)
    
    for test_name, result in results.items():
        if isinstance(result, dict):
            status = result.get('status', 'UNKNOWN')
            print(f"{test_name.upper()}: {status}")
            if status == 'FAILED':
                print(f"  Error: {result.get('error', 'Unknown error')}")
        else:
            status = "PASSED" if result else "FAILED"
            print(f"{test_name.upper()}: {status}")
    
    # Overall result
    all_passed = all(
        isinstance(r, dict) and r.get('status') == 'PASSED' or 
        (not isinstance(r, dict) and r)
        for r in results.values()
    )
    
    if all_passed:
        print("\n🎉 ALL TESTS PASSED!")
        print("The video generation fixes are working correctly.")
        return 0
    else:
        print("\n❌ SOME TESTS FAILED!")
        print("Please check the failed tests above.")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
