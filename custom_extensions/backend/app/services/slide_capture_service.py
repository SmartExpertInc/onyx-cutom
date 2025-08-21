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
            
            # Create context with optimal settings and video recording enabled
            context = await self.browser.new_context(
                viewport={'width': config.width, 'height': config.height},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                record_video_dir="temp",
                record_video_size={'width': config.width, 'height': config.height}
            )
            
            # Create page
            page = await context.new_page()
            
            # Video recording is automatically started when context is created with record_video_dir
            
            # Navigate to slide URL
            logger.info(f"Navigating to slide URL: {config.slide_url}")
            await page.goto(
                config.slide_url,
                wait_until='networkidle',
                timeout=30000
            )
            
            # Wait for all resources to load
            await self._wait_for_all_resources(page)
            
            # Wait for the specified duration
            logger.info(f"Recording for {config.duration} seconds")
            await page.wait_for_timeout(int(config.duration * 1000))
            
            # Close page and context to stop recording
            await page.close()
            await context.close()
            
            # Get the video path from the context
            video_path = context.video.path() if context.video else None
            
            if not video_path:
                raise Exception("Failed to capture video")
            
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
            # Wait for fonts to load
            await page.wait_for_function("document.fonts.ready")
            
            # Wait for images to load
            await page.wait_for_function("""
                () => {
                    const images = Array.from(document.images);
                    return images.every(img => img.complete && img.naturalHeight !== 0);
                }
            """)
            
            # Wait for any CSS animations to settle
            await page.wait_for_timeout(1000)
            
            # Wait for any dynamic content
            await page.wait_for_timeout(500)
            
            logger.info("All page resources loaded")
            
        except Exception as e:
            logger.warning(f"Resource waiting failed: {e}")
    
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
