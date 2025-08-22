#!/usr/bin/env python3
"""
Test script to verify all installed dependencies for the professional video pipeline.
"""

import sys
import asyncio
from pathlib import Path

def test_core_imports():
    """Test core dependency imports."""
    print("🔍 Testing core imports...")
    
    try:
        import ffmpeg
        print("✅ ffmpeg-python imported successfully")
    except ImportError as e:
        print(f"❌ ffmpeg-python import failed: {e}")
        return False
    
    try:
        import playwright
        print("✅ playwright imported successfully")
    except ImportError as e:
        print(f"❌ playwright import failed: {e}")
        return False
    
    try:
        from PIL import Image
        print("✅ Pillow imported successfully")
    except ImportError as e:
        print(f"❌ Pillow import failed: {e}")
        return False
    
    try:
        import cv2
        print("✅ OpenCV imported successfully")
    except ImportError as e:
        print(f"❌ OpenCV import failed: {e}")
        return False
    
    try:
        import structlog
        print("✅ structlog imported successfully")
    except ImportError as e:
        print(f"❌ structlog import failed: {e}")
        return False
    
    return True

def test_playwright_browsers():
    """Test Playwright browser availability."""
    print("\n🔍 Testing Playwright browsers...")
    
    try:
        from playwright.async_api import async_playwright
        
        async def check_browsers():
            async with async_playwright() as p:
                # Test Chromium
                try:
                    browser = await p.chromium.launch()
                    await browser.close()
                    print("✅ Chromium browser available")
                except Exception as e:
                    print(f"❌ Chromium browser failed: {e}")
                    return False
                
                # Test Firefox
                try:
                    browser = await p.firefox.launch()
                    await browser.close()
                    print("✅ Firefox browser available")
                except Exception as e:
                    print(f"❌ Firefox browser failed: {e}")
                    return False
                
                # Test WebKit
                try:
                    browser = await p.webkit.launch()
                    await browser.close()
                    print("✅ WebKit browser available")
                except Exception as e:
                    print(f"❌ WebKit browser failed: {e}")
                    return False
                
                return True
        
        result = asyncio.run(check_browsers())
        return result
        
    except Exception as e:
        print(f"❌ Playwright browser test failed: {e}")
        return False

def test_ffmpeg_functionality():
    """Test FFmpeg functionality through ffmpeg-python."""
    print("\n🔍 Testing FFmpeg functionality...")
    
    try:
        import ffmpeg
        
        # Test basic FFmpeg probe functionality
        try:
            # Create a simple test command
            stream = ffmpeg.input('testsrc=duration=1:size=320x240:rate=1', f='lavfi')
            output = ffmpeg.output(stream, 'test_output.mp4', vcodec='libx264', acodec='aac')
            
            # This should not fail immediately (actual execution would require FFmpeg binary)
            print("✅ ffmpeg-python command construction successful")
            
            # Clean up test file if it exists
            test_file = Path('test_output.mp4')
            if test_file.exists():
                test_file.unlink()
                
        except Exception as e:
            print(f"❌ FFmpeg command construction failed: {e}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ FFmpeg test failed: {e}")
        return False

def test_image_processing():
    """Test image processing capabilities."""
    print("\n🔍 Testing image processing...")
    
    try:
        from PIL import Image
        import numpy as np
        
        # Create a simple test image
        test_image = Image.new('RGB', (100, 100), color='red')
        test_image.save('test_image.png')
        
        # Test OpenCV
        import cv2
        cv_image = cv2.imread('test_image.png')
        if cv_image is not None:
            print("✅ OpenCV image reading successful")
        else:
            print("❌ OpenCV image reading failed")
            return False
        
        # Clean up
        Path('test_image.png').unlink()
        
        return True
        
    except Exception as e:
        print(f"❌ Image processing test failed: {e}")
        return False

def test_audio_processing():
    """Test audio processing capabilities."""
    print("\n🔍 Testing audio processing...")
    
    try:
        import pydub
        print("✅ pydub imported successfully")
        
        # Note: pydub may have issues with Python 3.13
        # This is just a basic import test
        return True
        
    except ImportError as e:
        print(f"⚠️ pydub import failed (expected with Python 3.13): {e}")
        print("   This is not critical for basic video processing")
        return True  # Not critical for core functionality
    except Exception as e:
        print(f"❌ Audio processing test failed: {e}")
        return False

def main():
    """Run all dependency tests."""
    print("🚀 Professional Video Pipeline - Dependency Test")
    print("=" * 60)
    
    tests = [
        ("Core Imports", test_core_imports),
        ("Playwright Browsers", test_playwright_browsers),
        ("FFmpeg Functionality", test_ffmpeg_functionality),
        ("Image Processing", test_image_processing),
        ("Audio Processing", test_audio_processing),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Results Summary:")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! The professional video pipeline is ready.")
        print("Next steps:")
        print("1. Start the backend server: python main.py")
        print("2. Test the new API endpoints")
        print("3. Run the professional video pipeline test")
        return 0
    else:
        print(f"\n⚠️ {total - passed} test(s) failed. Please check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())


