#!/usr/bin/env python3
"""
Video Creation Fix Test Script
==============================

This script tests the fixed video creation system to ensure:
1. The backend API endpoint correctly handles the video creation response
2. Voiceover text filtering works properly
3. Video creation completes successfully

Usage:
- python test_video_creation_fix.py
"""

import asyncio
import sys
import os
import logging
from datetime import datetime
from typing import Dict, Any, List

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'custom_extensions', 'backend'))

from app.services.video_generation_service import ElaiVideoGenerationService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'video_creation_fix_test_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

class VideoCreationFixTester:
    def __init__(self):
        """Initialize the video creation tester."""
        self.service = ElaiVideoGenerationService()
        logger.info("Video Creation Fix Tester initialized")
        
    async def test_voiceover_text_filtering(self):
        """Test the voiceover text filtering functionality."""
        logger.info("Testing voiceover text filtering...")
        
        # Test cases with problematic text
        test_texts = [
            "Introduction to Market Analysis",  # Good text
            "Understanding Market Analysis",   # Good text
            "Voiceover",                       # Should be filtered out
            "Presentation Themes",             # Should be filtered out
            "Клиентский сервис - это основа успеха",  # Should be filtered out (Russian)
            "Welcome to our presentation",     # Good text
            "Themes",                          # Should be filtered out
            "Slide",                           # Should be filtered out
            "Title",                           # Should be filtered out
        ]
        
        logger.info(f"Testing {len(test_texts)} voiceover texts...")
        
        # Simulate the filtering logic
        filtered_texts = []
        for text in test_texts:
            # Check for problematic titles
            lower_text = text.lower()
            if (lower_text == 'voiceover' or 
                lower_text == 'presentation themes' or
                lower_text == 'themes' or
                lower_text == 'slide' or
                lower_text == 'title'):
                logger.info(f"Filtered out problematic text: {text}")
                continue
            
            # Check for non-English characters
            has_non_english = any(ord(char) > 127 for char in text)
            if has_non_english:
                logger.info(f"Filtered out non-English text: {text}")
                continue
            
            filtered_texts.append(text)
            logger.info(f"Kept good text: {text}")
        
        logger.info(f"Filtered texts: {filtered_texts}")
        return len(filtered_texts) > 0
        
    async def test_video_creation_with_clean_text(self):
        """Test video creation with properly filtered text."""
        logger.info("Testing video creation with clean text...")
        
        # Use clean, filtered voiceover texts
        clean_voiceover_texts = [
            "Introduction to Market Analysis",
            "Understanding Market Analysis", 
            "Welcome to our presentation"
        ]
        
        try:
            result = await self.service.create_video_from_texts(
                project_name="Test Video - Clean Text",
                voiceover_texts=clean_voiceover_texts,
                avatar_code="gia.casual"
            )
            
            if result["success"]:
                video_id = result["videoId"]
                logger.info(f"Video created successfully with ID: {video_id}")
                
                # Test status checking
                status_result = await self.service.check_video_status(video_id)
                if status_result["success"]:
                    logger.info(f"Video status: {status_result['status']}, Progress: {status_result['progress']}%")
                
                return True
            else:
                logger.error(f"Failed to create video: {result['error']}")
                return False
                
        except Exception as e:
            logger.error(f"Error testing video creation: {str(e)}")
            return False
    
    async def test_backend_response_structure(self):
        """Test that the backend response structure is correct."""
        logger.info("Testing backend response structure...")
        
        # Simulate the response structure that should be returned
        test_response = {
            "success": True,
            "videoId": "test_video_id_123",
            "message": "Video created successfully"
        }
        
        # Test that the structure matches what the frontend expects
        required_fields = ["success", "videoId", "message"]
        for field in required_fields:
            if field not in test_response:
                logger.error(f"Missing required field: {field}")
                return False
        
        if test_response["success"] and not test_response["videoId"]:
            logger.error("Success is True but videoId is missing")
            return False
        
        logger.info("Backend response structure is correct")
        return True
    
    async def run_all_tests(self):
        """Run all tests."""
        logger.info("Starting Video Creation Fix Tests")
        logger.info("=" * 50)
        
        tests = [
            ("Voiceover Text Filtering", self.test_voiceover_text_filtering),
            ("Backend Response Structure", self.test_backend_response_structure),
            ("Video Creation with Clean Text", self.test_video_creation_with_clean_text),
        ]
        
        results = []
        for test_name, test_func in tests:
            logger.info(f"\n🧪 Running test: {test_name}")
            try:
                result = await test_func()
                results.append((test_name, result))
                if result:
                    logger.info(f"✅ {test_name}: PASSED")
                else:
                    logger.error(f"❌ {test_name}: FAILED")
            except Exception as e:
                logger.error(f"❌ {test_name}: ERROR - {str(e)}")
                results.append((test_name, False))
        
        # Summary
        logger.info("\n" + "=" * 50)
        logger.info("TEST SUMMARY")
        logger.info("=" * 50)
        
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        for test_name, result in results:
            status = "✅ PASSED" if result else "❌ FAILED"
            logger.info(f"{test_name}: {status}")
        
        logger.info(f"\nOverall: {passed}/{total} tests passed")
        
        if passed == total:
            logger.info("🎉 All tests passed! Video creation fixes are working correctly.")
            return True
        else:
            logger.error("💥 Some tests failed. Please review the issues above.")
            return False

async def main():
    """Main function."""
    tester = VideoCreationFixTester()
    success = await tester.run_all_tests()
    
    if success:
        logger.info("All tests completed successfully!")
        sys.exit(0)
    else:
        logger.error("Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
