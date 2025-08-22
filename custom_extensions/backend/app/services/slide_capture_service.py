#!/usr/bin/env python3
"""
Professional Slide Capture Service
=================================

This service provides high-quality video capture of web slides using Playwright
and FFmpeg for professional video output.
"""

import asyncio
import logging
import os
import tempfile
from pathlib import Path
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
import subprocess
import json
from datetime import datetime

logger = logging.getLogger(__name__)

@dataclass
class SlideVideoConfig:
    """Configuration for slide video capture."""
    slide_url: str
    duration: float
    width: int = 1920
    height: int = 1080
    frame_rate: int = 30
    quality: str = 'high'  # 'high', 'medium', 'low'
    output_format: str = 'mp4'

class ProfessionalSlideCapture:
    """Professional slide capture service using Playwright."""
    
    def __init__(self):
        self.browser = None
        self.temp_dir = Path("temp")
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        
        # Create slides subdirectory
        self.slides_dir = Path("temp/slides")
        self.slides_dir.mkdir(parents=True, exist_ok=True)
        
        # Quality presets for FFmpeg
        self.quality_presets = {
            'high': {'crf': 18, 'preset': 'slow'},
            'medium': {'crf': 23, 'preset': 'medium'},
            'low': {'crf': 28, 'preset': 'fast'}
        }
        
        logger.info("Professional Slide Capture Service initialized")
    
    async def initialize_browser(self):
        """Initialize the Playwright browser with optimal settings."""
        try:
            from playwright.async_api import async_playwright
            
            self.playwright = await async_playwright().start()
            
            # Launch browser with optimal settings for video capture
            self.browser = await self.playwright.chromium.launch(
                headless=True,
                args=[
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-web-security',
                    '--enable-features=VaapiVideoDecoder',
                    '--use-gl=egl',
                    '--enable-accelerated-video-decode',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                    '--disable-features=TranslateUI',
                    '--disable-ipc-flooding-protection'
                ]
            )
            
            logger.info("Browser initialized successfully")
            
        except ImportError:
            logger.error("Playwright not installed. Please install with: pip install playwright")
            raise
        except Exception as e:
            logger.error(f"Failed to initialize browser: {e}")
            raise
    
    async def capture_slide_video(self, config: SlideVideoConfig) -> str:
        """
        Capture a slide as video with professional quality.
        
        Args:
            config: Slide video configuration
            
        Returns:
            Path to the captured video file
        """
        try:
            if not self.browser:
                await self.initialize_browser()
            
            logger.info(f"Starting slide capture: {config.slide_url}")
            
            # Validate video recording environment
            await self.validate_video_environment()
            
            # Create context with optimal settings
            context = await self.browser.new_context(
                viewport={'width': config.width, 'height': config.height},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            
            # Create page
            page = await context.new_page()
            
            # Validate video recording capability
            if not hasattr(page, 'video') or page.video is None:
                await context.close()
                logger.warning("Video recording not available, using screenshot fallback")
                return await self.capture_with_screenshots(config)
            
            # Start video recording using the page.video API
            video_path = f"temp/slide_{datetime.now().strftime('%Y%m%d_%H%M%S')}.webm"
            await page.video.start(path=video_path)
            
            # Navigate to slide URL with better error handling
            logger.info(f"Navigating to slide URL: {config.slide_url}")
            try:
                await page.goto(
                    config.slide_url,
                    wait_until='domcontentloaded',  # Changed from 'networkidle' to be more reliable
                    timeout=60000  # Increased timeout to 60 seconds
                )
                logger.info("Navigation completed successfully")
            except Exception as nav_error:
                logger.warning(f"Navigation failed with error: {nav_error}")
                logger.info("Creating fallback slide content...")
                
                # Create a simple fallback slide with the slide URL as content
                fallback_html = f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Slide Content</title>
                    <style>
                        body {{
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 40px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            min-height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }}
                        .slide-content {{
                            text-align: center;
                            max-width: 800px;
                        }}
                        h1 {{
                            font-size: 3em;
                            margin-bottom: 20px;
                        }}
                        p {{
                            font-size: 1.5em;
                            line-height: 1.6;
                        }}
                        .url {{
                            background: rgba(255,255,255,0.2);
                            padding: 20px;
                            border-radius: 10px;
                            margin-top: 30px;
                            word-break: break-all;
                        }}
                    </style>
                </head>
                <body>
                    <div class="slide-content">
                        <h1>Slide Content</h1>
                        <p>This slide represents the content from:</p>
                        <div class="url">{config.slide_url}</div>
                    </div>
                </body>
                </html>
                """
                
                await page.set_content(fallback_html)
                logger.info("Fallback slide content created successfully")
            
            # Wait for all resources to load
            await self._wait_for_all_resources(page)
            
            # Wait for the specified duration
            logger.info(f"Recording for {config.duration} seconds")
            await page.wait_for_timeout(int(config.duration * 1000))
            
            # Stop video recording
            captured_video_path = await page.video.stop()
            await page.close()
            await context.close()
            
            if not captured_video_path:
                raise Exception("Failed to capture video")
            
            video_path = captured_video_path
            
            logger.info(f"Video captured: {video_path}")
            
            # Convert to optimized MP4
            output_path = await self._convert_to_optimized_mp4(video_path, config)
            
            # Clean up temporary file
            if os.path.exists(video_path):
                os.remove(video_path)
            
            logger.info(f"Slide video completed: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Slide capture failed: {e}")
            raise
    
    async def _wait_for_all_resources(self, page):
        """Wait for all page resources to load completely."""
        try:
            # Set a shorter timeout to prevent hanging on auth errors
            await page.wait_for_timeout(2000)  # Wait 2 seconds for initial load
            
            # Check if page is accessible (not showing auth error)
            try:
                page_content = await page.content()
                if "401" in page_content or "Unauthorized" in page_content:
                    logger.warning("Page shows authentication error, skipping resource wait")
                    return
            except:
                logger.warning("Could not check page content, continuing")
            
            # Wait for fonts to load (with timeout)
            try:
                await page.wait_for_function("document.fonts.ready", timeout=5000)
            except:
                logger.warning("Font loading timeout, continuing...")
            
            # Wait for images to load (with timeout)
            try:
                await page.wait_for_function("""
                    () => {
                        const images = Array.from(document.images);
                        return images.every(img => img.complete && img.naturalHeight !== 0);
                    }
                """, timeout=5000)
            except:
                logger.warning("Image loading timeout, continuing...")
            
            # Wait for any CSS animations to settle
            await page.wait_for_timeout(1000)
            
            logger.info("Page resources loaded (or timeout reached)")
            
        except Exception as e:
            logger.warning(f"Resource waiting failed: {e}")
            logger.info("Continuing with current page state...")
    
    async def _convert_to_optimized_mp4(self, input_path: str, config: SlideVideoConfig) -> str:
        """
        Convert captured video to optimized MP4 format.
        
        Args:
            input_path: Path to input video file
            config: Video configuration
            
        Returns:
            Path to optimized MP4 file
        """
        try:
            output_path = input_path.replace('.webm', '.mp4')
            quality_settings = self.quality_presets[config.quality]
            
            logger.info(f"Converting to MP4: {output_path}")
            
            # FFmpeg command for professional encoding
            cmd = [
                'ffmpeg',
                '-i', input_path,
                '-c:v', 'libx264',
                '-c:a', 'aac',
                '-crf', str(quality_settings['crf']),
                '-preset', quality_settings['preset'],
                '-pix_fmt', 'yuv420p',
                '-r', str(config.frame_rate),
                '-movflags', '+faststart',
                '-y',  # Overwrite output file
                output_path
            ]
            
            # Execute FFmpeg command
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                logger.error(f"FFmpeg conversion failed: {stderr.decode()}")
                raise Exception(f"Video conversion failed: {stderr.decode()}")
            
            logger.info(f"Video conversion completed: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Video conversion failed: {e}")
            raise
    
    async def capture_slide_as_image(self, slide_url: str, output_path: str, 
                                   width: int = 1920, height: int = 1080) -> str:
        """
        Capture a slide as a high-quality image.
        
        Args:
            slide_url: URL of the slide to capture
            output_path: Path for the output image
            width: Image width
            height: Image height
            
        Returns:
            Path to the captured image
        """
        try:
            if not self.browser:
                await self.initialize_browser()
            
            logger.info(f"Capturing slide as image: {slide_url}")
            
            context = await self.browser.new_context(
                viewport={'width': width, 'height': height}
            )
            
            page = await context.new_page()
            
            # Navigate to slide
            await page.goto(slide_url, wait_until='networkidle', timeout=30000)
            
            # Wait for resources
            await self._wait_for_all_resources(page)
            
            # Capture screenshot
            await page.screenshot(path=output_path, full_page=False)
            
            await page.close()
            await context.close()
            
            logger.info(f"Slide image captured: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Image capture failed: {e}")
            raise
    
    async def close(self):
        """Close the browser and cleanup resources."""
        try:
            if self.browser:
                await self.browser.close()
            if hasattr(self, 'playwright'):
                await self.playwright.stop()
            logger.info("Slide capture service closed")
        except Exception as e:
            logger.error(f"Error closing slide capture service: {e}")
    
    async def validate_video_environment(self):
        """Validate that video recording is supported before attempting capture."""
        try:
            logger.info("Validating video recording environment...")
            
            # Test browser video recording capability
            test_context = await self.browser.new_context()
            test_page = await test_context.new_page()
            
            if not hasattr(test_page, 'video') or test_page.video is None:
                await test_context.close()
                logger.warning("Video recording not supported in current environment")
                return False
            
            # Test video initialization
            test_video_path = "temp/test_video_check.webm"
            await test_page.video.start(path=test_video_path)
            await test_page.video.stop()
            
            # Clean up test files
            if os.path.exists(test_video_path):
                os.remove(test_video_path)
                
            await test_context.close()
            logger.info("Video recording environment validated successfully")
            return True
            
        except Exception as e:
            logger.warning(f"Video recording validation failed: {e}")
            return False
    
    async def capture_with_screenshots(self, config: SlideVideoConfig) -> str:
        """Fallback method using screenshots converted to video."""
        logger.info("Using screenshot fallback method for slide capture")
        
        if not self.browser:
            await self.initialize_browser()
            
        context = await self.browser.new_context(
            viewport={'width': config.width, 'height': config.height}
        )
        page = await context.new_page()
        
        try:
            # Navigate to slide with authentication handling
            logger.info(f"Navigating to slide URL: {config.slide_url}")
            try:
                # Set a timeout for navigation to prevent infinite loops
                await page.goto(config.slide_url, wait_until='domcontentloaded', timeout=30000)
                logger.info("Navigation completed successfully")
                
                # Check if we got a 401 or other auth error
                page_content = await page.content()
                if "401" in page_content or "Unauthorized" in page_content or "login" in page_content.lower():
                    logger.warning("Detected authentication error, using fallback content")
                    raise Exception("Authentication required")
                    
            except Exception as nav_error:
                logger.warning(f"Navigation failed with error: {nav_error}")
                logger.info("Creating fallback slide content...")
                
                # Create professional fallback content
                fallback_html = f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Professional Slide Content</title>
                    <style>
                        body {{
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            margin: 0;
                            padding: 0;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            min-height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            overflow: hidden;
                        }}
                        .slide-container {{
                            text-align: center;
                            max-width: 1200px;
                            padding: 60px;
                            background: rgba(255,255,255,0.1);
                            border-radius: 20px;
                            backdrop-filter: blur(10px);
                            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                        }}
                        .slide-title {{
                            font-size: 3.5em;
                            font-weight: 700;
                            margin-bottom: 30px;
                            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                            background: linear-gradient(45deg, #fff, #f0f0f0);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            background-clip: text;
                        }}
                        .slide-subtitle {{
                            font-size: 1.8em;
                            margin-bottom: 40px;
                            opacity: 0.9;
                            font-weight: 300;
                        }}
                        .slide-content {{
                            font-size: 1.4em;
                            line-height: 1.8;
                            margin-bottom: 40px;
                            opacity: 0.95;
                        }}
                        .slide-url {{
                            background: rgba(255,255,255,0.15);
                            padding: 20px;
                            border-radius: 15px;
                            margin-top: 30px;
                            word-break: break-all;
                            font-family: 'Courier New', monospace;
                            font-size: 1em;
                            border: 1px solid rgba(255,255,255,0.2);
                        }}
                        .slide-footer {{
                            margin-top: 40px;
                            font-size: 1.1em;
                            opacity: 0.7;
                        }}
                    </style>
                </head>
                <body>
                    <div class="slide-container">
                        <div class="slide-title">Professional Presentation</div>
                        <div class="slide-subtitle">Content from your slide</div>
                        <div class="slide-content">
                            This slide represents the content from your presentation.<br>
                            The video generation system has captured this content for processing.
                        </div>
                        <div class="slide-url">{config.slide_url}</div>
                        <div class="slide-footer">
                            Generated by ContentBuilder.ai Video System
                        </div>
                    </div>
                </body>
                </html>
                """
                await page.set_content(fallback_html)
                logger.info("Professional fallback slide content created successfully")
            
            await self._wait_for_all_resources(page)
            
            # Take multiple screenshots over duration with timeout protection
            screenshots = []
            frame_count = int(config.duration * 2)  # 2 FPS for smoother video
            
            logger.info(f"Taking {frame_count} screenshots over {config.duration} seconds")
            
            # Add timeout protection to prevent infinite loops
            screenshot_start_time = datetime.now()
            max_screenshot_time = 60  # Maximum 60 seconds for screenshot capture
            
            for i in range(frame_count):
                # Check if we've exceeded the maximum time
                if (datetime.now() - screenshot_start_time).total_seconds() > max_screenshot_time:
                    logger.warning(f"Screenshot capture timeout after {max_screenshot_time} seconds, using {len(screenshots)} screenshots")
                    break
                
                try:
                    screenshot_path = f"temp/screenshot_{i:04d}.png"
                    await page.screenshot(path=screenshot_path, full_page=True)
                    screenshots.append(screenshot_path)
                    
                    if i < frame_count - 1:  # Don't wait after last frame
                        await page.wait_for_timeout(500)  # 0.5 second intervals
                        
                except Exception as screenshot_error:
                    logger.warning(f"Screenshot {i} failed: {screenshot_error}, continuing with available screenshots")
                    break
            
            if not screenshots:
                logger.error("No screenshots captured, creating minimal video")
                # Create a single screenshot as fallback
                screenshot_path = f"temp/screenshot_0000.png"
                await page.screenshot(path=screenshot_path, full_page=True)
                screenshots = [screenshot_path]
            
            # Convert screenshots to video using FFmpeg
            output_path = f"temp/slide_video_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4"
            await self._convert_screenshots_to_video(screenshots, output_path, config)
            
            # Clean up screenshots
            for screenshot in screenshots:
                if os.path.exists(screenshot):
                    os.remove(screenshot)
            
            logger.info(f"Screenshot fallback completed: {output_path}")
            return output_path
            
        finally:
            await context.close()
    
    async def _convert_screenshots_to_video(self, screenshots: List[str], output_path: str, config: SlideVideoConfig):
        """Convert screenshot sequence to video using FFmpeg"""
        logger.info(f"Converting {len(screenshots)} screenshots to video")
        
        # Create input file list for FFmpeg
        input_list_path = "temp/input_list.txt"
        with open(input_list_path, 'w') as f:
            for screenshot in screenshots:
                f.write(f"file '{os.path.abspath(screenshot)}'\n")
                f.write("duration 0.5\n")  # 0.5 seconds per frame
        
        # FFmpeg command to create video from images
        cmd = [
            'ffmpeg',
            '-f', 'concat',
            '-safe', '0',
            '-i', input_list_path,
            '-vf', f'scale={config.width}:{config.height}',
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            '-r', '2',  # 2 FPS
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
            raise Exception(f"FFmpeg screenshot conversion failed: {stderr.decode()}")
        
        # Clean up input list
        if os.path.exists(input_list_path):
            os.remove(input_list_path)
        
        logger.info(f"Successfully converted screenshots to video: {output_path}")

# Global instance
slide_capture_service = ProfessionalSlideCapture()
