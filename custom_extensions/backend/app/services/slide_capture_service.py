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
        logger.info("Initializing Professional Slide Capture Service...")
        
        self.browser = None
        
        # Create temp directory with absolute path and detailed logging
        try:
            # Get current working directory
            current_dir = os.getcwd()
            logger.info(f"Current working directory: {current_dir}")
            
            # Create temp directory with absolute path
            self.temp_dir = Path(current_dir) / "temp"
            logger.info(f"Creating temp directory: {self.temp_dir}")
            
            # Create temp directory and all parent directories
            self.temp_dir.mkdir(parents=True, exist_ok=True)
            logger.info(f"Temp directory created/verified: {self.temp_dir}")
            
            # Verify directory exists and is writable
            if not self.temp_dir.exists():
                raise Exception(f"Failed to create temp directory: {self.temp_dir}")
            
            if not os.access(self.temp_dir, os.W_OK):
                raise Exception(f"Temp directory not writable: {self.temp_dir}")
            
            logger.info(f"Temp directory is writable: {self.temp_dir}")
            
            # Create slides subdirectory
            self.slides_dir = self.temp_dir / "slides"
            logger.info(f"Creating slides directory: {self.slides_dir}")
            self.slides_dir.mkdir(parents=True, exist_ok=True)
            logger.info(f"Slides directory created/verified: {self.slides_dir}")
            
        except Exception as e:
            logger.error(f"Failed to create directories: {e}")
            raise
        
        # Quality presets for FFmpeg
        self.quality_presets = {
            'high': {'crf': 18, 'preset': 'slow'},
            'medium': {'crf': 23, 'preset': 'medium'},
            'low': {'crf': 28, 'preset': 'fast'}
        }
        
        logger.info("Professional Slide Capture Service initialized successfully")
    
    async def initialize_browser(self):
        """Initialize the Playwright browser with optimal settings."""
        try:
            logger.info("Initializing Playwright browser...")
            
            from playwright.async_api import async_playwright
            
            self.playwright = await async_playwright().start()
            logger.info("Playwright started successfully")
            
            # Launch browser with optimal settings for video capture
            logger.info("Launching Chromium browser...")
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
            logger.info(f"Starting slide capture process...")
            logger.info(f"Config: URL={config.slide_url}, Duration={config.duration}s, Resolution={config.width}x{config.height}")
            
            if not self.browser:
                logger.info("Browser not initialized, initializing now...")
                await self.initialize_browser()
            
            logger.info(f"Starting slide capture: {config.slide_url}")
            
            # Validate video recording environment
            logger.info("Validating video recording environment...")
            await self.validate_video_environment()
            
            # Create context with optimal settings
            logger.info("Creating browser context...")
            context = await self.browser.new_context(
                viewport={'width': config.width, 'height': config.height},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            logger.info("Browser context created")
            
            # Create page
            logger.info("Creating browser page...")
            page = await context.new_page()
            logger.info("Browser page created")
            
            # Validate video recording capability
            logger.info("Checking video recording capability...")
            if not hasattr(page, 'video') or page.video is None:
                logger.warning("Video recording not available, using screenshot fallback")
                await context.close()
                return await self.capture_with_screenshots(config)
            
            logger.info("Video recording capability confirmed")
            
            # Start video recording using the page.video API
            video_filename = f"slide_{datetime.now().strftime('%Y%m%d_%H%M%S')}.webm"
            video_path = str(self.temp_dir / video_filename)
            logger.info(f"Starting video recording to: {video_path}")
            
            # Ensure the temp directory exists before starting recording
            self.temp_dir.mkdir(parents=True, exist_ok=True)
            logger.info(f"Ensured temp directory exists: {self.temp_dir}")
            
            await page.video.start(path=video_path)
            logger.info("Video recording started")
            
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
            logger.info("Waiting for page resources to load...")
            await self._wait_for_all_resources(page)
            
            # Wait for the specified duration
            logger.info(f"Recording for {config.duration} seconds...")
            await page.wait_for_timeout(int(config.duration * 1000))
            
            # Stop video recording
            logger.info("Stopping video recording...")
            captured_video_path = await page.video.stop()
            logger.info(f"Video recording stopped: {captured_video_path}")
            
            await page.close()
            await context.close()
            logger.info("Browser page and context closed")
            
            if not captured_video_path:
                raise Exception("Failed to capture video - no path returned")
            
            video_path = captured_video_path
            
            # Verify the video file exists
            if not os.path.exists(video_path):
                raise Exception(f"Video file not found at: {video_path}")
            
            file_size = os.path.getsize(video_path)
            logger.info(f"Video captured successfully: {video_path} ({file_size} bytes)")
            
            # Convert to optimized MP4
            logger.info("Converting to optimized MP4...")
            output_path = await self._convert_to_optimized_mp4(video_path, config)
            
            # Clean up temporary file
            if os.path.exists(video_path):
                os.remove(video_path)
                logger.info(f"Cleaned up temporary video: {video_path}")
            
            logger.info(f"Slide video completed: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Slide capture failed: {e}")
            logger.error(f"Error details: {type(e).__name__}: {str(e)}")
            import traceback
            logger.error(f"Stack trace: {traceback.format_exc()}")
            raise
    
    async def _wait_for_all_resources(self, page):
        """Wait for all page resources to load completely."""
        try:
            logger.info("Starting resource wait process...")
            
            # Set a shorter timeout to prevent hanging on auth errors
            logger.info("Waiting 2 seconds for initial page load...")
            await page.wait_for_timeout(2000)  # Wait 2 seconds for initial load
            
            # Check if page is accessible (not showing auth error)
            try:
                logger.info("Checking page content for authentication errors...")
                page_content = await page.content()
                if "401" in page_content or "Unauthorized" in page_content:
                    logger.warning("Page shows authentication error, skipping resource wait")
                    return
                logger.info("Page content check passed - no auth errors detected")
            except Exception as content_error:
                logger.warning(f"Could not check page content: {content_error}, continuing")
            
            # Wait for fonts to load (with timeout)
            try:
                logger.info("Waiting for fonts to load...")
                await page.wait_for_function("document.fonts.ready", timeout=5000)
                logger.info("Fonts loaded successfully")
            except Exception as font_error:
                logger.warning(f"Font loading timeout: {font_error}, continuing...")
            
            # Wait for images to load (with timeout)
            try:
                logger.info("Waiting for images to load...")
                await page.wait_for_function("""
                    () => {
                        const images = Array.from(document.images);
                        return images.every(img => img.complete && img.naturalHeight !== 0);
                    }
                """, timeout=5000)
                logger.info("Images loaded successfully")
            except Exception as image_error:
                logger.warning(f"Image loading timeout: {image_error}, continuing...")
            
            # Wait for any CSS animations to settle
            logger.info("Waiting for CSS animations to settle...")
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
            logger.info(f"Converting video to optimized MP4...")
            logger.info(f"Input path: {input_path}")
            
            # Verify input file exists
            if not os.path.exists(input_path):
                raise Exception(f"Input video file not found: {input_path}")
            
            input_size = os.path.getsize(input_path)
            logger.info(f"Input file size: {input_size} bytes")
            
            output_path = input_path.replace('.webm', '.mp4')
            quality_settings = self.quality_presets[config.quality]
            
            logger.info(f"Output path: {output_path}")
            logger.info(f"Quality settings: {quality_settings}")
            
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
            
            logger.info(f"Running FFmpeg command: {' '.join(cmd)}")
            
            # Execute FFmpeg command
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                error_msg = stderr.decode() if stderr else "Unknown FFmpeg error"
                logger.error(f"FFmpeg conversion failed: {error_msg}")
                raise Exception(f"Video conversion failed: {error_msg}")
            
            # Verify output file exists
            if not os.path.exists(output_path):
                raise Exception(f"Output video file not created: {output_path}")
            
            output_size = os.path.getsize(output_path)
            logger.info(f"Output file size: {output_size} bytes")
            logger.info(f"Video conversion completed: {output_path}")
            
            return output_path
            
        except Exception as e:
            logger.error(f"Video conversion failed: {e}")
            logger.error(f"Error details: {type(e).__name__}: {str(e)}")
            import traceback
            logger.error(f"Stack trace: {traceback.format_exc()}")
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
            logger.info(f"Starting slide image capture...")
            logger.info(f"Config: URL={slide_url}, Output={output_path}, Resolution={width}x{height}")
            
            if not self.browser:
                logger.info("Browser not initialized, initializing now...")
                await self.initialize_browser()
            
            logger.info(f"Capturing slide as image: {slide_url}")
            
            logger.info("Creating browser context for image capture...")
            context = await self.browser.new_context(
                viewport={'width': width, 'height': height}
            )
            page = await context.new_page()
            logger.info("Browser page created for image capture")
            
            # Navigate to slide
            logger.info(f"Navigating to slide URL: {slide_url}")
            await page.goto(slide_url, wait_until='networkidle', timeout=30000)
            logger.info("Navigation completed")
            
            # Wait for resources
            logger.info("Waiting for page resources to load...")
            await self._wait_for_all_resources(page)
            
            # Ensure output directory exists
            output_dir = Path(output_path).parent
            output_dir.mkdir(parents=True, exist_ok=True)
            logger.info(f"Ensured output directory exists: {output_dir}")
            
            # Capture screenshot
            logger.info(f"Taking screenshot: {output_path}")
            await page.screenshot(path=output_path, full_page=False)
            
            # Verify screenshot was created
            if os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                logger.info(f"Slide image captured successfully: {output_path} ({file_size} bytes)")
            else:
                raise Exception(f"Screenshot file not created: {output_path}")
            
            await page.close()
            await context.close()
            logger.info("Browser page and context closed")
            
            return output_path
            
        except Exception as e:
            logger.error(f"Image capture failed: {e}")
            logger.error(f"Error details: {type(e).__name__}: {str(e)}")
            import traceback
            logger.error(f"Stack trace: {traceback.format_exc()}")
            raise
    
    async def close(self):
        """Close the browser and cleanup resources."""
        try:
            logger.info("Closing slide capture service...")
            
            if self.browser:
                logger.info("Closing browser...")
                await self.browser.close()
                logger.info("Browser closed")
                
            if hasattr(self, 'playwright'):
                logger.info("Stopping Playwright...")
                await self.playwright.stop()
                logger.info("Playwright stopped")
                
            logger.info("Slide capture service closed successfully")
        except Exception as e:
            logger.error(f"Error closing slide capture service: {e}")
            logger.error(f"Error details: {type(e).__name__}: {str(e)}")
    
    async def validate_video_environment(self):
        """Validate that video recording is supported before attempting capture."""
        try:
            logger.info("Validating video recording environment...")
            
            # Test browser video recording capability
            logger.info("Creating test browser context...")
            test_context = await self.browser.new_context()
            test_page = await test_context.new_page()
            logger.info("Test browser page created")
            
            if not hasattr(test_page, 'video') or test_page.video is None:
                logger.warning("Video recording not supported in current environment")
                await test_context.close()
                return False
            
            logger.info("Video recording capability detected")
            
            # Test video initialization
            test_video_filename = "test_video_check.webm"
            test_video_path = str(self.temp_dir / test_video_filename)
            logger.info(f"Testing video recording to: {test_video_path}")
            
            # Ensure temp directory exists
            self.temp_dir.mkdir(parents=True, exist_ok=True)
            
            await test_page.video.start(path=test_video_path)
            logger.info("Test video recording started")
            
            await test_page.video.stop()
            logger.info("Test video recording stopped")
            
            # Clean up test files
            if os.path.exists(test_video_path):
                os.remove(test_video_path)
                logger.info(f"Cleaned up test video: {test_video_path}")
                
            await test_context.close()
            logger.info("Test browser context closed")
            logger.info("Video recording environment validated successfully")
            return True
            
        except Exception as e:
            logger.warning(f"Video recording validation failed: {e}")
            logger.warning(f"Error details: {type(e).__name__}: {str(e)}")
            return False
    
    async def capture_with_screenshots(self, config: SlideVideoConfig) -> str:
        """Fallback method using screenshots converted to video."""
        logger.info("Using screenshot fallback method for slide capture")
        
        if not self.browser:
            logger.info("Browser not initialized, initializing now...")
            await self.initialize_browser()
            
        logger.info("Creating browser context for screenshot capture...")
        context = await self.browser.new_context(
            viewport={'width': config.width, 'height': config.height}
        )
        page = await context.new_page()
        logger.info("Browser page created for screenshot capture")
        
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
            
            logger.info("Waiting for page resources to load...")
            await self._wait_for_all_resources(page)
            
            # Take multiple screenshots over duration with timeout protection
            screenshots = []
            frame_count = int(config.duration * 2)  # 2 FPS for smoother video
            
            logger.info(f"Taking {frame_count} screenshots over {config.duration} seconds")
            
            # Add timeout protection to prevent infinite loops
            screenshot_start_time = datetime.now()
            max_screenshot_time = 60  # Maximum 60 seconds for screenshot capture
            
            # Ensure temp directory exists
            self.temp_dir.mkdir(parents=True, exist_ok=True)
            logger.info(f"Ensured temp directory exists for screenshots: {self.temp_dir}")
            
            for i in range(frame_count):
                # Check if we've exceeded the maximum time
                if (datetime.now() - screenshot_start_time).total_seconds() > max_screenshot_time:
                    logger.warning(f"Screenshot capture timeout after {max_screenshot_time} seconds, using {len(screenshots)} screenshots")
                    break
                
                try:
                    screenshot_filename = f"screenshot_{i:04d}.png"
                    screenshot_path = str(self.temp_dir / screenshot_filename)
                    logger.info(f"Taking screenshot {i+1}/{frame_count}: {screenshot_path}")
                    
                    await page.screenshot(path=screenshot_path, full_page=True)
                    
                    # Verify screenshot was created
                    if os.path.exists(screenshot_path):
                        file_size = os.path.getsize(screenshot_path)
                        logger.info(f"Screenshot {i+1} captured: {screenshot_path} ({file_size} bytes)")
                        screenshots.append(screenshot_path)
                    else:
                        logger.error(f"Screenshot {i+1} file not found: {screenshot_path}")
                        break
                    
                    if i < frame_count - 1:  # Don't wait after last frame
                        await page.wait_for_timeout(500)  # 0.5 second intervals
                        
                except Exception as screenshot_error:
                    logger.warning(f"Screenshot {i+1} failed: {screenshot_error}, continuing with available screenshots")
                    break
            
            if not screenshots:
                logger.error("No screenshots captured, creating minimal video")
                # Create a single screenshot as fallback
                screenshot_filename = "screenshot_0000.png"
                screenshot_path = str(self.temp_dir / screenshot_filename)
                logger.info(f"Creating fallback screenshot: {screenshot_path}")
                
                await page.screenshot(path=screenshot_path, full_page=True)
                
                if os.path.exists(screenshot_path):
                    file_size = os.path.getsize(screenshot_path)
                    logger.info(f"Fallback screenshot created: {screenshot_path} ({file_size} bytes)")
                    screenshots = [screenshot_path]
                else:
                    raise Exception(f"Failed to create fallback screenshot: {screenshot_path}")
            
            logger.info(f"Total screenshots captured: {len(screenshots)}")
            
            # Convert screenshots to video using FFmpeg
            output_filename = f"slide_video_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4"
            output_path = str(self.temp_dir / output_filename)
            logger.info(f"Converting screenshots to video: {output_path}")
            
            await self._convert_screenshots_to_video(screenshots, output_path, config)
            
            # Clean up screenshots
            logger.info("Cleaning up screenshot files...")
            for screenshot in screenshots:
                if os.path.exists(screenshot):
                    os.remove(screenshot)
                    logger.info(f"Cleaned up: {screenshot}")
            
            # Verify final video exists
            if os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                logger.info(f"Screenshot fallback completed: {output_path} ({file_size} bytes)")
                return output_path
            else:
                raise Exception(f"Final video file not found: {output_path}")
            
        except Exception as e:
            logger.error(f"Screenshot fallback failed: {e}")
            logger.error(f"Error details: {type(e).__name__}: {str(e)}")
            import traceback
            logger.error(f"Stack trace: {traceback.format_exc()}")
            raise
        finally:
            logger.info("Closing browser context...")
            await context.close()
            logger.info("Browser context closed")
    
    async def _convert_screenshots_to_video(self, screenshots: List[str], output_path: str, config: SlideVideoConfig):
        """Convert screenshot sequence to video using FFmpeg"""
        logger.info(f"Converting {len(screenshots)} screenshots to video")
        
        # First, check if FFmpeg is available
        if not await self._check_ffmpeg_availability():
            logger.warning("FFmpeg not available, creating fallback video using alternative method")
            return await self._create_fallback_video(screenshots, output_path, config)
        
        # Create input file list for FFmpeg
        input_list_filename = "input_list.txt"
        input_list_path = str(self.temp_dir / input_list_filename)
        logger.info(f"Creating FFmpeg input list: {input_list_path}")
        
        try:
            with open(input_list_path, 'w') as f:
                for screenshot in screenshots:
                    # Use absolute paths for FFmpeg
                    abs_screenshot_path = os.path.abspath(screenshot)
                    logger.info(f"Adding to input list: {abs_screenshot_path}")
                    f.write(f"file '{abs_screenshot_path}'\n")
                    f.write("duration 0.5\n")  # 0.5 seconds per frame
            
            logger.info(f"Input list created with {len(screenshots)} screenshots")
            
        except Exception as e:
            logger.error(f"Failed to create input list: {e}")
            raise
        
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
        
        logger.info(f"Running FFmpeg command: {' '.join(cmd)}")
        
        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                error_msg = stderr.decode() if stderr else "Unknown FFmpeg error"
                logger.error(f"FFmpeg screenshot conversion failed: {error_msg}")
                logger.warning("Attempting fallback video creation method")
                return await self._create_fallback_video(screenshots, output_path, config)
            
            logger.info("FFmpeg conversion completed successfully")
            
        except Exception as e:
            logger.error(f"FFmpeg process failed: {e}")
            logger.warning("Attempting fallback video creation method")
            return await self._create_fallback_video(screenshots, output_path, config)
        finally:
            # Clean up input list
            if os.path.exists(input_list_path):
                os.remove(input_list_path)
                logger.info(f"Cleaned up input list: {input_list_path}")
        
        logger.info(f"Successfully converted screenshots to video: {output_path}")
    
    async def _check_ffmpeg_availability(self) -> bool:
        """Check if FFmpeg is available in the system."""
        try:
            process = await asyncio.create_subprocess_exec(
                'ffmpeg', '-version',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                logger.info("FFmpeg is available")
                return True
            else:
                logger.warning("FFmpeg check failed")
                return False
                
        except Exception as e:
            logger.warning(f"FFmpeg availability check failed: {e}")
            return False
    
    async def _create_fallback_video(self, screenshots: List[str], output_path: str, config: SlideVideoConfig) -> str:
        """Create a fallback video when FFmpeg is not available."""
        logger.info("Creating fallback video using alternative method")
        
        try:
            # Try using moviepy as fallback
            from moviepy.editor import ImageSequenceClip
            
            # Load images as sequence
            image_sequence = []
            for screenshot in screenshots:
                if os.path.exists(screenshot):
                    image_sequence.append(screenshot)
            
            if not image_sequence:
                raise Exception("No valid screenshots found for fallback video")
            
            logger.info(f"Creating fallback video from {len(image_sequence)} images")
            
            # Create video clip from image sequence
            clip = ImageSequenceClip(image_sequence, fps=2)  # 2 FPS
            
            # Resize to target resolution
            clip = clip.resize((config.width, config.height))
            
            # Write video file
            clip.write_videofile(
                output_path,
                fps=2,
                codec='libx264',
                audio=False,
                verbose=False,
                logger=None
            )
            
            clip.close()
            
            logger.info(f"Fallback video created successfully: {output_path}")
            return output_path
            
        except ImportError:
            logger.warning("MoviePy not available, creating simple image sequence")
            return await self._create_image_sequence(screenshots, output_path, config)
        except Exception as e:
            logger.error(f"Fallback video creation failed: {e}")
            logger.warning("Creating simple image sequence as last resort")
            return await self._create_image_sequence(screenshots, output_path, config)
    
    async def _create_image_sequence(self, screenshots: List[str], output_path: str, config: SlideVideoConfig) -> str:
        """Create a simple image sequence when video creation fails."""
        logger.info("Creating image sequence as fallback")
        
        try:
            # Create a directory for the image sequence
            sequence_dir = output_path.replace('.mp4', '_sequence')
            os.makedirs(sequence_dir, exist_ok=True)
            
            # Copy screenshots to sequence directory with numbered names
            for i, screenshot in enumerate(screenshots):
                if os.path.exists(screenshot):
                    new_name = f"frame_{i:04d}.png"
                    new_path = os.path.join(sequence_dir, new_name)
                    
                    import shutil
                    shutil.copy2(screenshot, new_path)
            
            logger.info(f"Image sequence created in: {sequence_dir}")
            
            # Create a simple HTML viewer for the sequence
            html_path = output_path.replace('.mp4', '_viewer.html')
            await self._create_html_viewer(screenshots, html_path, config)
            
            logger.info(f"HTML viewer created: {html_path}")
            
            # Return the HTML viewer path instead of video
            return html_path
            
        except Exception as e:
            logger.error(f"Image sequence creation failed: {e}")
            # Return the first screenshot as absolute fallback
            if screenshots and os.path.exists(screenshots[0]):
                return screenshots[0]
            else:
                raise Exception("All fallback methods failed")
    
    async def _create_html_viewer(self, screenshots: List[str], html_path: str, config: SlideVideoConfig):
        """Create an HTML viewer for the image sequence."""
        try:
            html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Slide Sequence Viewer</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f0f0f0;
        }}
        .container {{
            max-width: {config.width}px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }}
        .controls {{
            text-align: center;
            margin-bottom: 20px;
        }}
        .controls button {{
            padding: 10px 20px;
            margin: 0 5px;
            font-size: 16px;
            cursor: pointer;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
        }}
        .controls button:hover {{
            background: #0056b3;
        }}
        .frame-container {{
            text-align: center;
            margin: 20px 0;
        }}
        .frame {{
            max-width: 100%;
            height: auto;
            border: 1px solid #ddd;
            border-radius: 5px;
        }}
        .info {{
            text-align: center;
            color: #666;
            margin-top: 10px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Slide Sequence Viewer</h1>
        <div class="controls">
            <button onclick="previousFrame()">Previous</button>
            <button onclick="playPause()">Play/Pause</button>
            <button onclick="nextFrame()">Next</button>
            <span id="frameInfo">Frame 1 of {len(screenshots)}</span>
        </div>
        <div class="frame-container">
            <img id="currentFrame" class="frame" src="{screenshots[0] if screenshots else ''}" alt="Slide">
        </div>
        <div class="info">
            <p>Resolution: {config.width}x{config.height} | Frames: {len(screenshots)} | Duration: {len(screenshots) * 0.5:.1f}s</p>
        </div>
    </div>

    <script>
        const frames = {screenshots};
        let currentFrameIndex = 0;
        let isPlaying = false;
        let playInterval;

        function updateFrame() {{
            const frame = document.getElementById('currentFrame');
            const info = document.getElementById('frameInfo');
            
            if (frames[currentFrameIndex]) {{
                frame.src = frames[currentFrameIndex];
                info.textContent = `Frame ${{currentFrameIndex + 1}} of ${{frames.length}}`;
            }}
        }}

        function nextFrame() {{
            currentFrameIndex = (currentFrameIndex + 1) % frames.length;
            updateFrame();
        }}

        function previousFrame() {{
            currentFrameIndex = (currentFrameIndex - 1 + frames.length) % frames.length;
            updateFrame();
        }}

        function playPause() {{
            if (isPlaying) {{
                clearInterval(playInterval);
                isPlaying = false;
            }} else {{
                playInterval = setInterval(nextFrame, 500); // 2 FPS
                isPlaying = true;
            }}
        }}

        // Auto-play on load
        setTimeout(playPause, 1000);
    </script>
</body>
</html>
            """
            
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
                
        except Exception as e:
            logger.error(f"HTML viewer creation failed: {e}")
            raise

# Global instance
# Screenshot services disabled - using clean HTML → PNG → Video pipeline only
# slide_capture_service = ProfessionalSlideCapture()

class DisabledSlideCapture:
    """Disabled slide capture service to prevent screenshot errors."""
    
    async def capture_slide_video(self, *args, **kwargs):
        raise Exception("Screenshot capture disabled - using clean video pipeline only")
    
    async def capture_with_screenshots(self, *args, **kwargs):
        raise Exception("Screenshot capture disabled - using clean video pipeline only")

slide_capture_service = DisabledSlideCapture()
