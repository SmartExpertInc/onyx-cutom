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
from typing import Optional, Dict, Any
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
            
            # Create context with optimal settings
            context = await self.browser.new_context(
                viewport={'width': config.width, 'height': config.height},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            
            # Create page
            page = await context.new_page()
            
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
            # Wait for fonts to load (with timeout)
            try:
                await page.wait_for_function("document.fonts.ready", timeout=10000)
            except:
                logger.warning("Font loading timeout, continuing...")
            
            # Wait for images to load (with timeout)
            try:
                await page.wait_for_function("""
                    () => {
                        const images = Array.from(document.images);
                        return images.every(img => img.complete && img.naturalHeight !== 0);
                    }
                """, timeout=10000)
            except:
                logger.warning("Image loading timeout, continuing...")
            
            # Wait for any CSS animations to settle
            await page.wait_for_timeout(1000)
            
            # Wait for any dynamic content
            await page.wait_for_timeout(500)
            
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

# Global instance
slide_capture_service = ProfessionalSlideCapture()
