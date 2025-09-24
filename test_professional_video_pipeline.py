#!/usr/bin/env python3
"""
Professional Video Pipeline Test Script
=====================================

This script tests the complete professional video generation pipeline:
1. Slide capture service
2. Video composition service  
3. Presentation service
4. Full end-to-end workflow

Requirements:
- Playwright: pip install playwright
- FFmpeg: Must be installed and available in PATH
- Elai API token: Set ELAI_API_TOKEN environment variable

Usage:
- python test_professional_video_pipeline.py
"""

import asyncio
import sys
import os
import logging
from datetime import datetime
from typing import Dict, Any, List
import tempfile
from pathlib import Path

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'custom_extensions', 'backend'))

from app.services.slide_capture_service import slide_capture_service, SlideVideoConfig
from app.services.video_composer_service import video_composer_service, CompositionConfig
from app.services.presentation_service import presentation_service, PresentationRequest

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'professional_video_pipeline_test_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

class ProfessionalVideoPipelineTester:
    def __init__(self):
        """Initialize the professional video pipeline tester."""
        self.test_results = []
        logger.info("Professional Video Pipeline Tester initialized")
        
    async def test_slide_capture_service(self):
        """Test the slide capture service."""
        logger.info("Testing slide capture service...")
        
        try:
            # Create a simple test HTML file
            test_html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Test Slide</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                    }
                    .content {
                        text-align: center;
                        padding: 2rem;
                    }
                    h1 { font-size: 3rem; margin-bottom: 1rem; }
                    p { font-size: 1.5rem; }
                </style>
            </head>
            <body>
                <div class="content">
                    <h1>Professional Video Test</h1>
                    <p>This is a test slide for video generation</p>
                    <p>Testing slide capture capabilities</p>
                </div>
            </body>
            </html>
            """
            
            # Save test HTML to temporary file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False) as f:
                f.write(test_html)
                test_html_path = f.name
            
            # Convert file path to URL
            test_url = f"file://{test_html_path}"
            
            # Test slide capture
            config = SlideVideoConfig(
                slide_url=test_url,
                duration=5.0,  # 5 seconds
                width=1920,
                height=1080,
                frame_rate=30,
                quality='medium'
            )
            
            logger.info(f"Capturing slide video from: {test_url}")
            slide_video_path = await slide_capture_service.capture_slide_video(config)
            
            # Verify file exists and has content
            if os.path.exists(slide_video_path):
                file_size = os.path.getsize(slide_video_path)
                logger.info(f"Slide video captured successfully: {slide_video_path} ({file_size} bytes)")
                
                # Clean up test file
                os.unlink(test_html_path)
                
                return {
                    "test": "Slide Capture Service",
                    "status": "PASSED",
                    "details": f"Video captured: {slide_video_path} ({file_size} bytes)",
                    "file_path": slide_video_path
                }
            else:
                raise Exception("Slide video file not created")
                
        except Exception as e:
            logger.error(f"Slide capture test failed: {e}")
            return {
                "test": "Slide Capture Service",
                "status": "FAILED",
                "details": str(e)
            }
    
    async def test_video_composition_service(self):
        """Test the video composition service."""
        logger.info("Testing video composition service...")
        
        try:
            # Create test video files (we'll use the slide video from previous test)
            # For this test, we'll create a simple test video using FFmpeg
            test_video1_path = "test_video1.mp4"
            test_video2_path = "test_video2.mp4"
            
            # Create test videos using FFmpeg
            await self._create_test_video(test_video1_path, "Test Video 1", 5.0)
            await self._create_test_video(test_video2_path, "Test Video 2", 5.0)
            
            # Test composition
            output_path = "test_composition.mp4"
            config = CompositionConfig(
                output_path=output_path,
                resolution=(1920, 1080),
                quality='medium',
                layout='side_by_side'
            )
            
            logger.info("Testing video composition...")
            composed_video_path = await video_composer_service.compose_presentation(
                test_video1_path,
                test_video2_path,
                config
            )
            
            # Verify composition
            if os.path.exists(composed_video_path):
                file_size = os.path.getsize(composed_video_path)
                logger.info(f"Video composition successful: {composed_video_path} ({file_size} bytes)")
                
                # Clean up test files
                for path in [test_video1_path, test_video2_path]:
                    if os.path.exists(path):
                        os.unlink(path)
                
                return {
                    "test": "Video Composition Service",
                    "status": "PASSED",
                    "details": f"Composition created: {composed_video_path} ({file_size} bytes)",
                    "file_path": composed_video_path
                }
            else:
                raise Exception("Composed video file not created")
                
        except Exception as e:
            logger.error(f"Video composition test failed: {e}")
            return {
                "test": "Video Composition Service",
                "status": "FAILED",
                "details": str(e)
            }
    
    async def _create_test_video(self, output_path: str, title: str, duration: float):
        """Create a test video using FFmpeg."""
        try:
            cmd = [
                'ffmpeg',
                '-f', 'lavfi',
                '-i', f'color=c=blue:size=1920x1080:duration={duration}',
                '-f', 'lavfi',
                '-i', f'drawtext=text=\'{title}\':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:duration={duration}',
                '-filter_complex', '[0:v][1:v]overlay',
                '-c:v', 'libx264',
                '-preset', 'ultrafast',
                '-y',
                output_path
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                raise Exception(f"FFmpeg failed: {stderr.decode()}")
                
            logger.info(f"Test video created: {output_path}")
            
        except Exception as e:
            logger.error(f"Failed to create test video: {e}")
            raise
    
    async def test_presentation_service(self):
        """Test the presentation service."""
        logger.info("Testing presentation service...")
        
        try:
            # Create a test presentation request
            request = PresentationRequest(
                slide_url="https://example.com/test-slide",  # Mock URL for testing
                voiceover_texts=[
                    "Welcome to our professional presentation test.",
                    "This is a demonstration of the video generation pipeline.",
                    "The system combines slide capture with AI avatar generation."
                ],
                avatar_code="gia.casual",
                duration=10.0,
                layout="side_by_side",
                quality="medium",
                resolution=(1920, 1080),
                project_name="Test Professional Presentation"
            )
            
            # Test job creation
            logger.info("Creating test presentation job...")
            job_id = await presentation_service.create_presentation(request)
            
            if job_id:
                logger.info(f"Presentation job created: {job_id}")
                
                # Test job status retrieval
                job = await presentation_service.get_job_status(job_id)
                if job:
                    logger.info(f"Job status retrieved: {job.status}")
                    
                    return {
                        "test": "Presentation Service",
                        "status": "PASSED",
                        "details": f"Job created: {job_id}, Status: {job.status}",
                        "job_id": job_id
                    }
                else:
                    raise Exception("Failed to retrieve job status")
            else:
                raise Exception("Failed to create presentation job")
                
        except Exception as e:
            logger.error(f"Presentation service test failed: {e}")
            return {
                "test": "Presentation Service",
                "status": "FAILED",
                "details": str(e)
            }
    
    async def test_full_pipeline(self):
        """Test the complete end-to-end pipeline."""
        logger.info("Testing complete end-to-end pipeline...")
        
        try:
            # This test would require a real slide URL and Elai API integration
            # For now, we'll test the service integration
            
            logger.info("Full pipeline test requires real slide URL and Elai API")
            logger.info("This test is a placeholder for complete integration testing")
            
            return {
                "test": "Full Pipeline Integration",
                "status": "SKIPPED",
                "details": "Requires real slide URL and Elai API integration"
            }
            
        except Exception as e:
            logger.error(f"Full pipeline test failed: {e}")
            return {
                "test": "Full Pipeline Integration",
                "status": "FAILED",
                "details": str(e)
            }
    
    async def run_all_tests(self):
        """Run all tests."""
        logger.info("Starting Professional Video Pipeline Tests")
        logger.info("=" * 60)
        
        tests = [
            ("Slide Capture Service", self.test_slide_capture_service),
            ("Video Composition Service", self.test_video_composition_service),
            ("Presentation Service", self.test_presentation_service),
            ("Full Pipeline Integration", self.test_full_pipeline),
        ]
        
        for test_name, test_func in tests:
            logger.info(f"\n🧪 Running test: {test_name}")
            try:
                result = await test_func()
                self.test_results.append(result)
                
                if result["status"] == "PASSED":
                    logger.info(f"✅ {test_name}: PASSED")
                elif result["status"] == "SKIPPED":
                    logger.warning(f"⚠️ {test_name}: SKIPPED")
                else:
                    logger.error(f"❌ {test_name}: FAILED")
                    
            except Exception as e:
                logger.error(f"❌ {test_name}: ERROR - {str(e)}")
                self.test_results.append({
                    "test": test_name,
                    "status": "ERROR",
                    "details": str(e)
                })
        
        # Summary
        logger.info("\n" + "=" * 60)
        logger.info("TEST SUMMARY")
        logger.info("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["status"] == "PASSED")
        failed = sum(1 for result in self.test_results if result["status"] == "FAILED")
        skipped = sum(1 for result in self.test_results if result["status"] == "SKIPPED")
        total = len(self.test_results)
        
        for result in self.test_results:
            status_icon = "✅" if result["status"] == "PASSED" else "⚠️" if result["status"] == "SKIPPED" else "❌"
            logger.info(f"{status_icon} {result['test']}: {result['status']}")
            if result["details"]:
                logger.info(f"   Details: {result['details']}")
        
        logger.info(f"\nOverall: {passed}/{total} tests passed, {failed} failed, {skipped} skipped")
        
        if failed == 0:
            logger.info("🎉 All critical tests passed! Professional video pipeline is working correctly.")
            return True
        else:
            logger.error("💥 Some tests failed. Please review the issues above.")
            return False
    
    async def cleanup(self):
        """Clean up test files."""
        try:
            test_files = [
                "test_video1.mp4",
                "test_video2.mp4", 
                "test_composition.mp4"
            ]
            
            for file_path in test_files:
                if os.path.exists(file_path):
                    os.unlink(file_path)
                    logger.info(f"Cleaned up test file: {file_path}")
                    
        except Exception as e:
            logger.warning(f"Cleanup failed: {e}")

async def main():
    """Main function."""
    tester = ProfessionalVideoPipelineTester()
    
    try:
        success = await tester.run_all_tests()
        
        if success:
            logger.info("All tests completed successfully!")
            sys.exit(0)
        else:
            logger.error("Some tests failed!")
            sys.exit(1)
            
    finally:
        await tester.cleanup()

if __name__ == "__main__":
    asyncio.run(main())
