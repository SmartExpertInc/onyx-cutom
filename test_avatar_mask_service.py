#!/usr/bin/env python3
"""
Test Avatar Mask Service
=======================

This script tests the new avatar mask service that creates professional avatar masks
from Elai API videos with green backgrounds.

Usage:
- python test_avatar_mask_service.py
"""

import asyncio
import logging
import sys
import os

# Add the backend path to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), 'custom_extensions', 'backend'))

from app.services.avatar_mask_service import AvatarMaskService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

async def test_avatar_mask_service():
    """Test the avatar mask service."""
    logger.info("🚀 Testing Avatar Mask Service")
    logger.info("=" * 50)
    
    # Initialize the service
    mask_service = AvatarMaskService()
    
    try:
        # Test voiceover texts
        voiceover_texts = [
            "Welcome to this demonstration of the avatar mask service. We are creating a professional video with green screen technology.",
            "This approach uses OpenCV for precise green screen detection and MoviePy for seamless video composition.",
            "The result is a high-quality avatar overlay that can be integrated into any presentation background."
        ]
        
        logger.info(f"📝 Using {len(voiceover_texts)} voiceover texts")
        for i, text in enumerate(voiceover_texts):
            logger.info(f"  {i+1}. {text[:100]}...")
        
        # Create avatar mask video
        logger.info("\n🎬 Creating avatar mask video...")
        output_path = await mask_service.create_avatar_mask_video(
            voiceover_texts=voiceover_texts,
            avatar_code="gia.casual",  # Using the same avatar as test_elai_api.py
            output_path="test_avatar_mask_output.mp4"
        )
        
        if output_path:
            logger.info(f"✅ Avatar mask video created successfully!")
            logger.info(f"📁 Output file: {output_path}")
            
            # Check file size
            if os.path.exists(output_path):
                file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
                logger.info(f"📊 File size: {file_size_mb:.2f} MB")
            
            return True
        else:
            logger.error("❌ Failed to create avatar mask video")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error during testing: {str(e)}")
        return False
    finally:
        # Cleanup
        mask_service.cleanup()

async def main():
    """Main function."""
    logger.info("🎯 Avatar Mask Service Test")
    logger.info("This test demonstrates the new avatar mask functionality")
    logger.info("based on the logic from test_elai_api.py and create_composite_video.py")
    logger.info("")
    
    success = await test_avatar_mask_service()
    
    if success:
        logger.info("\n🎉 Test completed successfully!")
        logger.info("The avatar mask service is working correctly.")
        logger.info("You can now use this service in your video generation pipeline.")
    else:
        logger.error("\n💥 Test failed!")
        logger.error("Please check the logs for details.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
