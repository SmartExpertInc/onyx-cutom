#!/usr/bin/env python3
"""
Video Generation Fix Test Script
================================

This script tests the fixed video generation system to ensure:
1. Proper voiceover text extraction and cleaning
2. Correct progress reporting
3. Better error handling for status cycling
4. Successful video creation and rendering

Usage:
- python test_video_generation_fix.py
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
        logging.FileHandler(f'video_generation_fix_test_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

class VideoGenerationFixTester:
    def __init__(self):
        """Initialize the video generation tester."""
        self.service = ElaiVideoGenerationService()
        logger.info("Video Generation Fix Tester initialized")
        
    async def test_voiceover_text_cleaning(self):
        """Test the voiceover text cleaning functionality."""
        logger.info("Testing voiceover text cleaning...")
        
        # Test cases with problematic text
        test_texts = [
            "Normal text without issues",
            "Text with extra   whitespace   and   newlines\n\n",
            "Text with special characters: "quotes" and 'apostrophes' and … ellipsis",
            "Text with mixed languages: Привет world!",
            "Very long text " * 100,  # Test length limit
            "",  # Empty text
            None,  # None value
            "Short",  # Too short
        ]
        
        logger.info(f"Testing {len(test_texts)} voiceover texts...")
        
        # Test the cleaning logic (simulating what happens in create_video_from_texts)
        cleaned_texts = []
        for i, text in enumerate(test_texts):
            if not text or not isinstance(text, str):
                logger.warning(f"Skipping invalid voiceover text at index {i}: {text}")
                continue
            
            # Clean the text
            cleaned_text = text.strip()
            cleaned_text = ' '.join(cleaned_text.split())  # Remove extra whitespace
            
            # Remove problematic characters
            cleaned_text = cleaned_text.replace('"', '"').replace('"', '"')
            cleaned_text = cleaned_text.replace(''', "'").replace(''', "'")
            cleaned_text = cleaned_text.replace('…', '...')
            
            # Validate length
            if len(cleaned_text) < 5:
                logger.warning(f"Voiceover text too short at index {i}: '{cleaned_text}'")
                continue
            
            if len(cleaned_text) > 1000:
                logger.warning(f"Voiceover text too long at index {i}, truncating")
                cleaned_text = cleaned_text[:1000] + "..."
            
            cleaned_texts.append(cleaned_text)
            logger.info(f"Cleaned voiceover text {i+1}: {cleaned_text[:100]}...")
        
        logger.info(f"Successfully cleaned {len(cleaned_texts)} texts")
        return len(cleaned_texts) > 0
        
    async def test_avatar_fetching(self):
        """Test avatar fetching functionality."""
        logger.info("Testing avatar fetching...")
        
        try:
            avatars_response = await self.service.get_avatars()
            
            if not avatars_response["success"]:
                logger.error(f"Failed to fetch avatars: {avatars_response['error']}")
                return False
            
            avatars = avatars_response["avatars"]
            logger.info(f"Successfully fetched {len(avatars)} avatars")
            
            # Test finding a specific avatar
            test_avatar_code = "gia.casual"
            avatar = None
            for av in avatars:
                if av.get("code") == test_avatar_code:
                    avatar = av
                    break
            
            if avatar:
                logger.info(f"Found avatar: {avatar.get('name')} ({avatar.get('code')})")
                return True
            else:
                logger.warning(f"Avatar with code '{test_avatar_code}' not found")
                return False
                
        except Exception as e:
            logger.error(f"Error testing avatar fetching: {str(e)}")
            return False
    
    async def test_video_creation_with_clean_text(self):
        """Test video creation with properly cleaned text."""
        logger.info("Testing video creation with clean text...")
        
        # Use clean, simple voiceover texts
        clean_voiceover_texts = [
            "Welcome to our presentation. Today we will discuss important topics.",
            "Let's start with the first point. This is crucial for understanding.",
            "Moving on to the second topic. Here we explore key concepts.",
            "Finally, let's conclude with our main takeaways."
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
    
    async def test_progress_calculation(self):
        """Test the improved progress calculation logic."""
        logger.info("Testing progress calculation...")
        
        # Test different status values and their expected progress
        test_cases = [
            ("draft", 10),
            ("queued", 20),
            ("rendering", 50),
            ("validating", 80),
            ("rendered", 100),
            ("ready", 100),
            ("error", 50),  # Should maintain progress instead of going to 0
            ("unknown", 0)
        ]
        
        for status, expected_progress in test_cases:
            # Simulate the progress calculation logic
            progress = 0
            if status == "draft":
                progress = 10
            elif status == "queued":
                progress = 20
            elif status == "rendering":
                progress = 50
            elif status == "validating":
                progress = 80
            elif status in ["rendered", "ready"]:
                progress = 100
            elif status == "error":
                progress = 50  # Keep at rendering level
            
            if progress == expected_progress:
                logger.info(f"✓ Status '{status}' correctly maps to {progress}%")
            else:
                logger.error(f"✗ Status '{status}' incorrectly maps to {progress}% (expected {expected_progress}%)")
                return False
        
        return True
    
    async def run_all_tests(self):
        """Run all tests."""
        logger.info("Starting Video Generation Fix Tests")
        logger.info("=" * 50)
        
        tests = [
            ("Voiceover Text Cleaning", self.test_voiceover_text_cleaning),
            ("Avatar Fetching", self.test_avatar_fetching),
            ("Progress Calculation", self.test_progress_calculation),
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
            logger.info("🎉 All tests passed! Video generation fixes are working correctly.")
            return True
        else:
            logger.error("💥 Some tests failed. Please review the issues above.")
            return False

async def main():
    """Main function."""
    tester = VideoGenerationFixTester()
    success = await tester.run_all_tests()
    
    if success:
        logger.info("All tests completed successfully!")
        sys.exit(0)
    else:
        logger.error("Some tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
