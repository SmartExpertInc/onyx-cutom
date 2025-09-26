#!/usr/bin/env python3
"""
Test New Avatar Mask Integration
===============================

This script tests that the new avatar mask service is properly integrated
into the presentation service flow.

Usage:
- python test_new_avatar_mask_integration.py
"""

import asyncio
import logging
import sys
import os

# Add the backend path to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), 'custom_extensions', 'backend'))

from app.services.presentation_service import ProfessionalPresentationService, PresentationRequest

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

async def test_new_avatar_mask_integration():
    """Test that the new avatar mask service is properly integrated."""
    logger.info("🚀 Testing New Avatar Mask Integration")
    logger.info("=" * 60)
    
    # Initialize the presentation service
    presentation_service = ProfessionalPresentationService()
    
    try:
        # Test data
        voiceover_texts = [
            "Welcome to this test of the new avatar mask integration. We are verifying that the OpenCV and MoviePy approach is working correctly.",
            "This test will create a professional video using the avatar mask service with green screen technology and precise masking.",
            "The result should be a high-quality video with the avatar properly masked and overlaid on the slide background."
        ]
        
        # Test slide data (simplified)
        slides_data = [
            {
                "templateId": "avatar-service",
                "props": {
                    "title": "Avatar Mask Integration Test",
                    "subtitle": "Testing OpenCV + MoviePy Approach",
                    "content": "This slide tests the new avatar mask service integration."
                }
            }
        ]
        
        logger.info(f"📝 Test configuration:")
        logger.info(f"  - Voiceover texts: {len(voiceover_texts)}")
        logger.info(f"  - Slides data: {len(slides_data)}")
        logger.info(f"  - Avatar mask enabled: True")
        
        # Create presentation request with avatar mask enabled
        request = PresentationRequest(
            slide_url="",  # Not needed when using slides_data
            voiceover_texts=voiceover_texts,
            slides_data=slides_data,
            theme="dark-purple",
            avatar_code="gia.casual",  # Use the same avatar as test_elai_api.py
            use_avatar_mask=True,  # Enable the new avatar mask service
            slide_only=False,  # Full video with avatar
            duration=30.0,
            layout="side_by_side",
            quality="high",
            resolution=(1920, 1080),
            project_name="Avatar Mask Integration Test"
        )
        
        logger.info("🎬 Creating presentation with avatar mask service...")
        
        # Create the presentation
        job_id = await presentation_service.create_presentation(request)
        logger.info(f"✅ Presentation job created: {job_id}")
        
        # Monitor the job
        logger.info("🔄 Monitoring job progress...")
        max_wait_time = 20 * 60  # 20 minutes
        check_interval = 30  # 30 seconds
        start_time = asyncio.get_event_loop().time()
        
        while (asyncio.get_event_loop().time() - start_time) < max_wait_time:
            job = await presentation_service.get_job_status(job_id)
            
            if not job:
                logger.error("❌ Job not found")
                return False
            
            logger.info(f"📊 Job status: {job.status}, Progress: {job.progress:.1f}%")
            
            if job.status == "completed":
                logger.info("✅ Job completed successfully!")
                logger.info(f"📁 Video URL: {job.video_url}")
                logger.info(f"🖼️ Thumbnail URL: {job.thumbnail_url}")
                return True
            elif job.status == "failed":
                logger.error(f"❌ Job failed: {job.error}")
                return False
            
            await asyncio.sleep(check_interval)
        
        logger.error("⏰ Job timed out")
        return False
        
    except Exception as e:
        logger.error(f"❌ Test failed: {str(e)}")
        return False

async def test_traditional_method():
    """Test the traditional method for comparison."""
    logger.info("\n🔄 Testing Traditional Method (for comparison)")
    logger.info("=" * 60)
    
    # Initialize the presentation service
    presentation_service = ProfessionalPresentationService()
    
    try:
        # Test data
        voiceover_texts = [
            "This is a test of the traditional avatar generation method for comparison.",
            "This uses the old approach with direct FFmpeg overlay.",
            "We can compare the results with the new avatar mask service."
        ]
        
        # Test slide data (simplified)
        slides_data = [
            {
                "templateId": "avatar-service",
                "props": {
                    "title": "Traditional Method Test",
                    "subtitle": "Testing FFmpeg Direct Overlay",
                    "content": "This slide tests the traditional avatar generation method."
                }
            }
        ]
        
        logger.info(f"📝 Test configuration:")
        logger.info(f"  - Voiceover texts: {len(voiceover_texts)}")
        logger.info(f"  - Slides data: {len(slides_data)}")
        logger.info(f"  - Avatar mask enabled: False")
        
        # Create presentation request with avatar mask disabled
        request = PresentationRequest(
            slide_url="",  # Not needed when using slides_data
            voiceover_texts=voiceover_texts,
            slides_data=slides_data,
            theme="dark-purple",
            avatar_code="gia.casual",
            use_avatar_mask=False,  # Disable the new avatar mask service
            slide_only=False,
            duration=30.0,
            layout="side_by_side",
            quality="high",
            resolution=(1920, 1080),
            project_name="Traditional Method Test"
        )
        
        logger.info("🎬 Creating presentation with traditional method...")
        
        # Create the presentation
        job_id = await presentation_service.create_presentation(request)
        logger.info(f"✅ Presentation job created: {job_id}")
        
        # Monitor the job
        logger.info("🔄 Monitoring job progress...")
        max_wait_time = 20 * 60  # 20 minutes
        check_interval = 30  # 30 seconds
        start_time = asyncio.get_event_loop().time()
        
        while (asyncio.get_event_loop().time() - start_time) < max_wait_time:
            job = await presentation_service.get_job_status(job_id)
            
            if not job:
                logger.error("❌ Job not found")
                return False
            
            logger.info(f"📊 Job status: {job.status}, Progress: {job.progress:.1f}%")
            
            if job.status == "completed":
                logger.info("✅ Job completed successfully!")
                logger.info(f"📁 Video URL: {job.video_url}")
                logger.info(f"🖼️ Thumbnail URL: {job.thumbnail_url}")
                return True
            elif job.status == "failed":
                logger.error(f"❌ Job failed: {job.error}")
                return False
            
            await asyncio.sleep(check_interval)
        
        logger.error("⏰ Job timed out")
        return False
        
    except Exception as e:
        logger.error(f"❌ Test failed: {str(e)}")
        return False

async def main():
    """Main function."""
    logger.info("🎯 New Avatar Mask Integration Test")
    logger.info("This test verifies that the new avatar mask service is properly integrated")
    logger.info("into the presentation service flow.")
    logger.info("")
    
    # Test 1: New avatar mask service
    logger.info("🧪 Test 1: New Avatar Mask Service (OpenCV + MoviePy)")
    success1 = await test_new_avatar_mask_integration()
    
    if success1:
        logger.info("\n✅ Test 1 PASSED: New avatar mask service is working!")
    else:
        logger.error("\n❌ Test 1 FAILED: New avatar mask service has issues!")
    
    # Test 2: Traditional method (for comparison)
    logger.info("\n🧪 Test 2: Traditional Method (FFmpeg Direct)")
    success2 = await test_traditional_method()
    
    if success2:
        logger.info("\n✅ Test 2 PASSED: Traditional method is working!")
    else:
        logger.error("\n❌ Test 2 FAILED: Traditional method has issues!")
    
    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("📊 TEST SUMMARY")
    logger.info("=" * 60)
    logger.info(f"New Avatar Mask Service: {'✅ PASSED' if success1 else '❌ FAILED'}")
    logger.info(f"Traditional Method: {'✅ PASSED' if success2 else '❌ FAILED'}")
    
    if success1 and success2:
        logger.info("\n🎉 Both methods are working! You can now compare the results.")
        logger.info("The new avatar mask service should provide better quality with precise masking.")
    elif success1:
        logger.info("\n🎉 New avatar mask service is working! Traditional method needs investigation.")
    elif success2:
        logger.info("\n⚠️ Only traditional method is working. New avatar mask service needs debugging.")
    else:
        logger.error("\n💥 Both methods failed. Check the logs for details.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
