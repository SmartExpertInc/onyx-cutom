# custom_extensions/backend/app/services/html_to_png_service.py

import os
import tempfile
import asyncio
import logging
from typing import Optional, Dict, Any
from pathlib import Path

logger = logging.getLogger(__name__)

class HTMLToPNGService:
    """Service for converting HTML to high-quality PNG images using headless browser."""
    
    def __init__(self):
        """Initialize the HTML to PNG service."""
        self.browser = None
        self.page = None
        self.video_width = 1920
        self.video_height = 1080
        
        logger.info("HTML to PNG Service initialized")
    
    async def _get_browser_launch_options(self):
        """Get browser launch options optimized for server environment."""
        return {
            'headless': True,
            'args': [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-extensions',
                '--disable-plugins',
                '--disable-images',
                '--disable-javascript',
                '--disable-default-apps',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-field-trial-config',
                '--disable-back-forward-cache',
                '--disable-ipc-flooding-protection',
                '--mute-audio',
                '--no-first-run',
                '--no-default-browser-check',
                '--no-zygote',
                '--single-process',
                '--deterministic-fetch',
                '--memory-pressure-off',
                '--max_old_space_size=4096',
                f'--window-size={self.video_width},{self.video_height}',
                '--hide-scrollbars',
                '--disable-scrollbars'
            ],
            'ignoreDefaultArgs': ['--enable-automation'],
            'timeout': 60000
        }
    
    async def _init_browser(self):
        """Initialize the browser instance."""
        try:
            from playwright.async_api import async_playwright
            
            if not self.browser:
                self.playwright = await async_playwright().start()
                
                # Try different browsers in order of preference
                browsers_to_try = ['chromium', 'webkit', 'firefox']
                
                for browser_type in browsers_to_try:
                    try:
                        browser_launcher = getattr(self.playwright, browser_type)
                        launch_options = await self._get_browser_launch_options()
                        
                        self.browser = await browser_launcher.launch(**launch_options)
                        logger.info(f"Successfully initialized {browser_type} browser")
                        break
                        
                    except Exception as e:
                        logger.warning(f"Failed to launch {browser_type}: {str(e)}")
                        continue
                
                if not self.browser:
                    raise Exception("Failed to launch any browser")
            
            return True
            
        except ImportError:
            logger.error("Playwright not available - PNG generation will not work")
            logger.error("Install with: pip install playwright && playwright install")
            return False
        except Exception as e:
            logger.error(f"Failed to initialize browser: {str(e)}")
            return False
    
    async def convert_html_to_png(self, 
                                html_content: str, 
                                output_path: str,
                                template_id: str = "unknown") -> bool:
        """
        Convert HTML content to PNG image.
        
        Args:
            html_content: Clean HTML content
            output_path: Path where PNG should be saved
            template_id: Template ID for logging
            
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"Converting HTML to PNG for template: {template_id}")
            
            # Initialize browser if needed
            if not await self._init_browser():
                return False
            
            # Create a new page
            page = await self.browser.new_page()
            
            try:
                # Set viewport to exact video dimensions
                await page.set_viewport_size({
                    "width": self.video_width, 
                    "height": self.video_height
                })
                
                # Create temporary HTML file
                with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False) as f:
                    f.write(html_content)
                    temp_html_path = f.name
                
                try:
                    # Load the HTML content
                    file_url = f"file://{os.path.abspath(temp_html_path)}"
                    await page.goto(file_url, wait_until='networkidle', timeout=30000)
                    
                    # Wait for any fonts or styling to load
                    await page.wait_for_timeout(2000)
                    
                    # Take screenshot with exact dimensions
                    await page.screenshot(
                        path=output_path,
                        width=self.video_width,
                        height=self.video_height,
                        full_page=False,
                        type='png',
                        quality=100
                    )
                    
                    # Verify the file was created and has reasonable size
                    if os.path.exists(output_path):
                        file_size = os.path.getsize(output_path)
                        if file_size > 1000:  # At least 1KB
                            logger.info(f"Successfully created PNG: {output_path} ({file_size} bytes)")
                            return True
                        else:
                            logger.error(f"PNG file too small: {file_size} bytes")
                            return False
                    else:
                        logger.error(f"PNG file not created: {output_path}")
                        return False
                        
                finally:
                    # Clean up temporary HTML file
                    try:
                        os.unlink(temp_html_path)
                    except:
                        pass
                        
            finally:
                # Close the page
                await page.close()
                
        except Exception as e:
            logger.error(f"Failed to convert HTML to PNG: {str(e)}")
            return False
    
    async def convert_slide_to_png(self, 
                                 template_id: str,
                                 props: Dict[str, Any],
                                 theme: str,
                                 output_path: str) -> bool:
        """
        Convert a slide with props to PNG image.
        
        Args:
            template_id: Avatar template ID
            props: Slide properties
            theme: Theme name
            output_path: Where to save PNG
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Import the HTML template service
            from .html_template_service import html_template_service
            
            # Generate clean HTML
            html_content = html_template_service.generate_clean_html_for_video(
                template_id, props, theme
            )
            
            # Convert to PNG
            return await self.convert_html_to_png(html_content, output_path, template_id)
            
        except Exception as e:
            logger.error(f"Failed to convert slide to PNG: {str(e)}")
            return False
    
    async def close(self):
        """Close browser and cleanup resources."""
        try:
            if self.browser:
                await self.browser.close()
                self.browser = None
            
            if hasattr(self, 'playwright'):
                await self.playwright.stop()
                
            logger.info("HTML to PNG service closed")
            
        except Exception as e:
            logger.error(f"Error closing HTML to PNG service: {str(e)}")

# Global instance
html_to_png_service = HTMLToPNGService()
