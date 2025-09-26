#!/usr/bin/env python3
"""
Test script for the clean HTML → PNG → Video pipeline.

This script tests the new video generation system that replaces
the problematic screenshot-based approach.
"""

import asyncio
import logging
import sys
import os
import requests
import json
from datetime import datetime

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class CleanVideoPipelineTester:
    """Test the clean video generation pipeline."""
    
    def __init__(self, base_url: str = "http://localhost:8002"):
        """Initialize the tester."""
        self.base_url = base_url
        self.session = requests.Session()
        
    def test_api_availability(self) -> bool:
        """Test if the API endpoints are available."""
        try:
            logger.info("Testing API availability...")
            
            # Test templates endpoint
            response = self.session.get(f"{self.base_url}/api/custom/clean-video/templates")
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    templates = data.get("templates", [])
                    logger.info(f"✅ Templates endpoint working. Supported templates: {templates}")
                    return True
                else:
                    logger.error(f"❌ Templates endpoint failed: {data.get('error')}")
                    return False
            else:
                logger.error(f"❌ Templates endpoint returned {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ API availability test failed: {str(e)}")
            return False
    
    def test_pipeline(self) -> bool:
        """Test the complete pipeline."""
        try:
            logger.info("Testing complete clean video pipeline...")
            
            response = self.session.get(f"{self.base_url}/api/custom/clean-video/test")
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    logger.info("✅ Pipeline test successful!")
                    test_video = data.get("test_video")
                    if test_video:
                        logger.info(f"📹 Test video created: {test_video}")
                    return True
                else:
                    logger.error(f"❌ Pipeline test failed: {data.get('error')}")
                    return False
            else:
                logger.error(f"❌ Pipeline test returned {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Pipeline test failed: {str(e)}")
            return False
    
    def test_avatar_slide_generation(self) -> bool:
        """Test single avatar slide video generation."""
        try:
            logger.info("Testing avatar slide video generation...")
            
            # Test data for avatar checklist slide
            test_data = {
                "slideProps": {
                    "templateId": "avatar-checklist",
                    "title": "Test Video Generation",
                    "items": [
                        {"text": "HTML Templates ✓", "isPositive": True},
                        {"text": "PNG Conversion ✓", "isPositive": True},
                        {"text": "Video Assembly ✓", "isPositive": True},
                        {"text": "No UI Chrome ✓", "isPositive": True}
                    ]
                },
                "theme": "dark-purple",
                "slideDuration": 3.0,
                "quality": "medium"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/custom/clean-video/avatar-slide",
                json=test_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    logger.info("✅ Avatar slide video generation successful!")
                    logger.info(f"📹 Video URL: {data.get('video_url')}")
                    logger.info(f"📊 File size: {data.get('file_size')} bytes")
                    logger.info(f"⏱️ Duration: {data.get('duration')} seconds")
                    return True
                else:
                    logger.error(f"❌ Avatar slide generation failed: {data.get('error')}")
                    return False
            else:
                logger.error(f"❌ Avatar slide generation returned {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Avatar slide generation test failed: {str(e)}")
            return False
    
    def test_presentation_generation(self) -> bool:
        """Test multi-slide presentation video generation."""
        try:
            logger.info("Testing presentation video generation...")
            
            # Test data for multiple slides
            test_data = {
                "slidesProps": [
                    {
                        "templateId": "avatar-checklist",
                        "title": "Slide 1: Professional Communication",
                        "items": [
                            {"text": "Listen actively", "isPositive": True},
                            {"text": "Ask clarifying questions", "isPositive": True},
                            {"text": "Provide clear answers", "isPositive": True},
                            {"text": "Avoid interrupting", "isPositive": False}
                        ]
                    },
                    {
                        "templateId": "avatar-service",
                        "title": "Slide 2: Customer Service",
                        "subtitle": "Excellence in every interaction",
                        "content": "Building lasting relationships through professional service."
                    },
                    {
                        "templateId": "avatar-buttons",
                        "title": "Slide 3: Core Values",
                        "buttons": [
                            {"text": "Quality", "color": "#e91e63"},
                            {"text": "Trust", "color": "#e91e63"},
                            {"text": "Innovation", "color": "#e91e63"},
                            {"text": "Excellence", "color": "#e91e63"}
                        ]
                    }
                ],
                "theme": "dark-purple",
                "slideDuration": 4.0,
                "quality": "medium"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/custom/clean-video/presentation",
                json=test_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    logger.info("✅ Presentation video generation successful!")
                    logger.info(f"📹 Video URL: {data.get('video_url')}")
                    logger.info(f"📊 File size: {data.get('file_size')} bytes")
                    logger.info(f"⏱️ Total duration: {data.get('duration')} seconds")
                    logger.info(f"📚 Slides count: {data.get('slides_count')}")
                    return True
                else:
                    logger.error(f"❌ Presentation generation failed: {data.get('error')}")
                    return False
            else:
                logger.error(f"❌ Presentation generation returned {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Presentation generation test failed: {str(e)}")
            return False
    
    def run_all_tests(self) -> bool:
        """Run all tests."""
        logger.info("🚀 Starting Clean Video Pipeline Tests")
        logger.info("=" * 60)
        
        tests = [
            ("API Availability", self.test_api_availability),
            ("Pipeline Test", self.test_pipeline),
            ("Avatar Slide Generation", self.test_avatar_slide_generation),
            ("Presentation Generation", self.test_presentation_generation)
        ]
        
        results = []
        for test_name, test_func in tests:
            logger.info(f"\n🔍 Running {test_name}...")
            try:
                result = test_func()
                results.append((test_name, result))
                if result:
                    logger.info(f"✅ {test_name} PASSED")
                else:
                    logger.error(f"❌ {test_name} FAILED")
            except Exception as e:
                logger.error(f"❌ {test_name} ERROR: {str(e)}")
                results.append((test_name, False))
        
        # Summary
        logger.info("\n" + "=" * 60)
        logger.info("📊 TEST SUMMARY")
        logger.info("=" * 60)
        
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        for test_name, result in results:
            status = "✅ PASS" if result else "❌ FAIL"
            logger.info(f"{test_name:<30} {status}")
        
        logger.info(f"\nOverall: {passed}/{total} tests passed")
        
        if passed == total:
            logger.info("🎉 All tests passed! Clean video pipeline is working.")
            return True
        else:
            logger.error("🚨 Some tests failed. Check the logs above.")
            return False

def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Test Clean Video Pipeline")
    parser.add_argument("--url", default="http://localhost:8002", 
                       help="Base URL for the backend API")
    
    args = parser.parse_args()
    
    tester = CleanVideoPipelineTester(args.url)
    
    try:
        success = tester.run_all_tests()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        logger.info("\n🛑 Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"🚨 Test runner error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
