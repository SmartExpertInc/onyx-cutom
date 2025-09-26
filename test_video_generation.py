#!/usr/bin/env python3
"""
Video Generation System Test Script
===================================

This script tests the video generation implementation by:
1. Testing avatar fetching
2. Testing video creation with sample data
3. Validating the complete workflow

Usage:
    python test_video_generation.py
"""

import asyncio
import json
import sys
import os
from datetime import datetime

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'custom_extensions', 'backend'))

try:
    from app.services.video_generation_service import video_generation_service
except ImportError as e:
    print(f"❌ Failed to import video generation service: {e}")
    print("Make sure you're running this from the project root directory")
    sys.exit(1)

def print_section(title):
    """Print a formatted section header."""
    print(f"\n{'='*60}")
    print(f" {title}")
    print(f"{'='*60}")

def print_success(message):
    """Print a success message."""
    print(f"✅ {message}")

def print_error(message):
    """Print an error message."""
    print(f"❌ {message}")

def print_info(message):
    """Print an info message."""
    print(f"ℹ️  {message}")

async def test_avatar_fetching():
    """Test fetching avatars from Elai API."""
    print_section("Testing Avatar Fetching")
    
    try:
        print_info("Fetching avatars from Elai API...")
        result = await video_generation_service.get_avatars()
        
        if result["success"]:
            avatars = result["avatars"]
            print_success(f"Successfully fetched {len(avatars)} avatars")
            
            # Display some avatar information
            for i, avatar in enumerate(avatars[:3]):  # Show first 3 avatars
                print(f"  {i+1}. {avatar.get('name', 'Unknown')} ({avatar.get('gender', 'Unknown')})")
                if avatar.get('variants'):
                    variants = [v.get('code', 'unknown') for v in avatar['variants']]
                    print(f"     Variants: {', '.join(variants)}")
                if avatar.get('limit') == 300:
                    print(f"     ⭐ Extended duration (5 min) supported")
                print()
            
            return avatars
        else:
            print_error(f"Failed to fetch avatars: {result['error']}")
            return None
            
    except Exception as e:
        print_error(f"Exception during avatar fetching: {str(e)}")
        return None

async def test_video_creation(avatars):
    """Test video creation with sample data."""
    print_section("Testing Video Creation")
    
    if not avatars:
        print_error("No avatars available for testing")
        return False
    
    # Find an avatar with extended duration support
    test_avatar = None
    for avatar in avatars:
        if avatar.get('limit') == 300 and avatar.get('variants'):
            test_avatar = avatar
            break
    
    if not test_avatar:
        print_error("No avatar with extended duration support found")
        return False
    
    # Get the first variant
    variant = test_avatar['variants'][0]
    
    print_info(f"Using avatar: {test_avatar['name']} ({variant['code']})")
    
    # Prepare sample slide data
    sample_slides = [
        {
            "voiceover_text": "Welcome to this test video. This is the first slide of our presentation."
        },
        {
            "voiceover_text": "This is the second slide. We're testing the video generation system."
        },
        {
            "voiceover_text": "And this is the final slide. Thank you for watching this test video."
        }
    ]
    
    # Prepare avatar data
    avatar_data = {
        "code": f"{test_avatar['code']}.{variant['code']}",
        "name": test_avatar['name'],
        "gender": test_avatar['gender'],
        "canvas_url": variant['canvas'],
        "voice": test_avatar.get('defaultVoice', 'en-US-AriaNeural'),
        "voice_provider": "azure" if not test_avatar.get('defaultVoice', '').startswith('elevenlabs') else 'elevenlabs'
    }
    
    try:
        print_info("Creating test video...")
        print_info("Note: This will take up to 15 minutes to complete")
        
        result = await video_generation_service.generate_video(sample_slides, avatar_data)
        
        if result["success"]:
            print_success("Video generation completed successfully!")
            print_info(f"Video ID: {result['video_id']}")
            print_info(f"Download URL: {result['download_url']}")
            return True
        else:
            print_error(f"Video generation failed: {result['error']}")
            return False
            
    except Exception as e:
        print_error(f"Exception during video creation: {str(e)}")
        return False

async def test_api_endpoints():
    """Test the API endpoints (simulated)."""
    print_section("Testing API Endpoints")
    
    print_info("Testing avatar endpoint...")
    try:
        result = await video_generation_service.get_avatars()
        if result["success"]:
            print_success("Avatar endpoint working correctly")
        else:
            print_error(f"Avatar endpoint failed: {result['error']}")
    except Exception as e:
        print_error(f"Avatar endpoint exception: {str(e)}")
    
    print_info("Testing video status endpoint...")
    try:
        # Test with a dummy video ID
        status = await video_generation_service.check_video_status("dummy_id")
        if status:
            print_success("Video status endpoint working correctly")
        else:
            print_info("Video status endpoint returned empty (expected for dummy ID)")
    except Exception as e:
        print_error(f"Video status endpoint exception: {str(e)}")

async def main():
    """Main test function."""
    print_section("Video Generation System Test")
    print_info(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test 1: Avatar fetching
    avatars = await test_avatar_fetching()
    
    # Test 2: API endpoints
    await test_api_endpoints()
    
    # Test 3: Video creation (optional - takes time)
    if avatars:
        print_info("\n" + "="*60)
        print_info("VIDEO CREATION TEST")
        print_info("="*60)
        print_info("This test will create an actual video and may take up to 15 minutes.")
        print_info("Do you want to run the video creation test? (y/n): ", end="")
        
        try:
            response = input().lower().strip()
            if response in ['y', 'yes']:
                await test_video_creation(avatars)
            else:
                print_info("Skipping video creation test")
        except KeyboardInterrupt:
            print_info("\nTest interrupted by user")
    
    print_section("Test Summary")
    print_success("Video generation system test completed!")
    print_info("Check the logs above for any errors or issues.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print_info("\nTest interrupted by user")
    except Exception as e:
        print_error(f"Test failed with exception: {str(e)}")
        sys.exit(1)
