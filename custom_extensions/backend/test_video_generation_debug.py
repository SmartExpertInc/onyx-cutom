#!/usr/bin/env python3
"""
Comprehensive Video Generation Debug Test Script
===============================================

This script tests the complete video generation pipeline with detailed logging
to identify issues with text rendering and video scaling.
"""

import asyncio
import logging
import json
import os
import sys
from datetime import datetime

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configure detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f'video_generation_debug_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')
    ]
)

logger = logging.getLogger(__name__)

# Test slide data with various templates and content
TEST_SLIDES_DATA = [
    {
        "templateId": "title-slide",
        "slideId": "test-slide-1",
        "props": {
            "title": "Welcome to Our Presentation",
            "subtitle": "A comprehensive overview of our services",
            "author": "John Doe",
            "date": "2024-01-15"
        }
    },
    {
        "templateId": "big-image-left",
        "slideId": "test-slide-2", 
        "props": {
            "title": "Key Benefits",
            "subtitle": "Our solution provides significant advantages for your business needs. We focus on delivering high-quality results that exceed expectations.",
            "imagePath": "/static_design_images/placeholder.jpg",
            "imagePrompt": "professional business meeting"
        }
    },
    {
        "templateId": "bullet-points",
        "slideId": "test-slide-3",
        "props": {
            "title": "Main Features",
            "bullets": [
                "Advanced analytics and reporting",
                "Real-time collaboration tools", 
                "Secure cloud-based storage",
                "24/7 customer support"
            ],
            "bulletStyle": "check"
        }
    }
]

# Test voiceover texts
TEST_VOICEOVER_TEXTS = [
    "Welcome to our comprehensive presentation. Today we'll explore the key benefits and features of our solution.",
    "Our solution provides significant advantages for your business needs. We focus on delivering high-quality results that exceed expectations.",
    "Let's look at the main features: Advanced analytics and reporting, real-time collaboration tools, secure cloud-based storage, and 24/7 customer support."
]

async def test_html_template_generation():
    """Test HTML template generation with detailed logging."""
    logger.info("🧪 [TEST] Testing HTML template generation")
    
    try:
        from app.services.html_template_service import html_template_service
        
        for i, slide_data in enumerate(TEST_SLIDES_DATA):
            logger.info(f"🧪 [TEST] Testing slide {i+1}: {slide_data['templateId']}")
            
            template_id = slide_data['templateId']
            props = slide_data['props']
            theme = "dark-purple"
            
            # Test HTML generation
            html_content = html_template_service.generate_avatar_slide_html(
                template_id=template_id,
                props=props,
                theme=theme
            )
            
            logger.info(f"🧪 [TEST] Slide {i+1} HTML generated successfully")
            logger.info(f"🧪 [TEST] HTML length: {len(html_content)} characters")
            
            # Save HTML for inspection
            html_filename = f"debug_slide_{i+1}_{template_id}.html"
            with open(html_filename, 'w', encoding='utf-8') as f:
                f.write(html_content)
            logger.info(f"🧪 [TEST] HTML saved to: {html_filename}")
            
    except Exception as e:
        logger.error(f"🧪 [TEST] HTML template generation failed: {e}", exc_info=True)

async def test_html_to_png_conversion():
    """Test HTML to PNG conversion with detailed logging."""
    logger.info("🧪 [TEST] Testing HTML to PNG conversion")
    
    try:
        from app.services.html_to_image_service import html_to_image_service
        
        for i, slide_data in enumerate(TEST_SLIDES_DATA):
            logger.info(f"🧪 [TEST] Converting slide {i+1} to PNG")
            
            template_id = slide_data['templateId']
            props = slide_data['props']
            theme = "dark-purple"
            output_path = f"debug_slide_{i+1}_{template_id}.png"
            
            # Test PNG conversion
            success = await html_to_image_service.convert_slide_to_png(
                template_id=template_id,
                props=props,
                theme=theme,
                output_path=output_path
            )
            
            if success:
                logger.info(f"🧪 [TEST] Slide {i+1} PNG conversion successful: {output_path}")
                if os.path.exists(output_path):
                    file_size = os.path.getsize(output_path)
                    logger.info(f"🧪 [TEST] PNG file size: {file_size} bytes")
            else:
                logger.error(f"🧪 [TEST] Slide {i+1} PNG conversion failed")
                
    except Exception as e:
        logger.error(f"🧪 [TEST] HTML to PNG conversion failed: {e}", exc_info=True)

async def test_video_assembly():
    """Test video assembly with detailed logging."""
    logger.info("🧪 [TEST] Testing video assembly")
    
    try:
        from app.services.video_assembly_service import video_assembly_service
        
        output_path = "debug_presentation.mp4"
        
        # Test video assembly
        success = await video_assembly_service.create_slide_video_from_props(
            slides_props=TEST_SLIDES_DATA,
            theme="dark-purple",
            output_path=output_path,
            slide_duration=5.0,
            quality="high"
        )
        
        if success:
            logger.info(f"🧪 [TEST] Video assembly successful: {output_path}")
            if os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                logger.info(f"🧪 [TEST] Video file size: {file_size} bytes")
        else:
            logger.error(f"🧪 [TEST] Video assembly failed")
            
    except Exception as e:
        logger.error(f"🧪 [TEST] Video assembly failed: {e}", exc_info=True)

async def test_elai_avatar_generation():
    """Test Elai avatar generation with detailed logging."""
    logger.info("🧪 [TEST] Testing Elai avatar generation")
    
    try:
        from app.services.video_generation_service import video_generation_service
        
        # Test avatar generation
        result = await video_generation_service.create_video_from_texts(
            project_name="Debug Test Presentation",
            voiceover_texts=TEST_VOICEOVER_TEXTS,
            avatar_code="avatar-1"  # Use a known avatar code
        )
        
        logger.info(f"🧪 [TEST] Elai avatar generation result: {result}")
        
        if result.get("success"):
            video_id = result.get("videoId")
            logger.info(f"🧪 [TEST] Avatar video created successfully: {video_id}")
        else:
            logger.error(f"🧪 [TEST] Avatar generation failed: {result.get('error')}")
            
    except Exception as e:
        logger.error(f"🧪 [TEST] Elai avatar generation failed: {e}", exc_info=True)

async def test_complete_pipeline():
    """Test the complete video generation pipeline."""
    logger.info("🧪 [TEST] Testing complete video generation pipeline")
    
    try:
        from app.services.presentation_service import ProfessionalPresentationService, PresentationRequest
        
        # Create presentation service
        service = ProfessionalPresentationService()
        
        # Create presentation request
        request = PresentationRequest(
            slide_url="http://localhost:3000/test-slide",
            voiceover_texts=TEST_VOICEOVER_TEXTS,
            slides_data=TEST_SLIDES_DATA,
            theme="dark-purple",
            avatar_code="avatar-1",
            duration=15.0,
            layout="side_by_side",
            quality="high",
            resolution=(1920, 1080),
            project_name="Debug Test Presentation"
        )
        
        # Create presentation
        job_id = await service.create_presentation(request)
        logger.info(f"🧪 [TEST] Presentation job created: {job_id}")
        
        # Wait for completion
        max_wait_time = 300  # 5 minutes
        wait_interval = 10   # 10 seconds
        
        for i in range(max_wait_time // wait_interval):
            job = await service.get_job_status(job_id)
            if job:
                logger.info(f"🧪 [TEST] Job status: {job.status}, progress: {job.progress}%")
                
                if job.status == "completed":
                    logger.info(f"🧪 [TEST] Presentation completed successfully!")
                    logger.info(f"🧪 [TEST] Video URL: {job.video_url}")
                    logger.info(f"🧪 [TEST] Thumbnail URL: {job.thumbnail_url}")
                    return True
                elif job.status == "failed":
                    logger.error(f"🧪 [TEST] Presentation failed: {job.error}")
                    return False
            
            await asyncio.sleep(wait_interval)
        
        logger.error(f"🧪 [TEST] Presentation timed out after {max_wait_time} seconds")
        return False
        
    except Exception as e:
        logger.error(f"🧪 [TEST] Complete pipeline test failed: {e}", exc_info=True)
        return False

async def main():
    """Run all tests with comprehensive logging."""
    logger.info("🚀 [DEBUG_TEST] Starting comprehensive video generation debug tests")
    logger.info("🚀 [DEBUG_TEST] Test environment:")
    logger.info(f"  - Current directory: {os.getcwd()}")
    logger.info(f"  - Python version: {sys.version}")
    logger.info(f"  - Test slides count: {len(TEST_SLIDES_DATA)}")
    logger.info(f"  - Voiceover texts count: {len(TEST_VOICEOVER_TEXTS)}")
    
    # Log test data
    logger.info("🚀 [DEBUG_TEST] Test slide data:")
    for i, slide in enumerate(TEST_SLIDES_DATA):
        logger.info(f"  Slide {i+1}: {slide['templateId']} - {slide['props'].get('title', 'No title')}")
    
    logger.info("🚀 [DEBUG_TEST] Test voiceover texts:")
    for i, text in enumerate(TEST_VOICEOVER_TEXTS):
        logger.info(f"  Text {i+1}: {text[:100]}...")
    
    # Run individual component tests
    logger.info("🧪 [TEST] ========================================")
    logger.info("🧪 [TEST] Testing HTML template generation")
    await test_html_template_generation()
    
    logger.info("🧪 [TEST] ========================================")
    logger.info("🧪 [TEST] Testing HTML to PNG conversion")
    await test_html_to_png_conversion()
    
    logger.info("🧪 [TEST] ========================================")
    logger.info("🧪 [TEST] Testing video assembly")
    await test_video_assembly()
    
    logger.info("🧪 [TEST] ========================================")
    logger.info("🧪 [TEST] Testing Elai avatar generation")
    await test_elai_avatar_generation()
    
    logger.info("🧪 [TEST] ========================================")
    logger.info("🧪 [TEST] Testing complete pipeline")
    success = await test_complete_pipeline()
    
    if success:
        logger.info("✅ [DEBUG_TEST] All tests completed successfully!")
    else:
        logger.error("❌ [DEBUG_TEST] Some tests failed. Check the logs for details.")
    
    logger.info("🚀 [DEBUG_TEST] Debug test session completed")

if __name__ == "__main__":
    asyncio.run(main())
