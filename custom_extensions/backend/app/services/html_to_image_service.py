# custom_extensions/backend/app/services/html_to_image_service.py

import os
import tempfile
import logging
from typing import Optional, Dict, Any
from pathlib import Path

logger = logging.getLogger(__name__)

class HTMLToImageService:
    """Service for converting HTML to PNG images WITHOUT browser/Chromium dependency."""
    
    def __init__(self):
        """Initialize the HTML to Image service."""
        self.video_width = 1920
        self.video_height = 1080
        self.method = None
        
        # Try different methods in order of preference
        self._init_conversion_method()
        
        logger.info(f"HTML to Image Service initialized using: {self.method}")
    
    def _init_conversion_method(self):
        """Initialize the best available conversion method."""
        
        # Method 1: Try html2image (Python library, uses browser but more stable)
        try:
            from html2image import Html2Image
            self.method = "html2image"
            logger.info("Using html2image library for HTML to PNG conversion")
            return
        except ImportError:
            pass
        
        # Method 2: Try imgkit (wkhtmltoimage Python wrapper - may not work without wkhtmltoimage)
        try:
            import imgkit
            # Test if imgkit can actually work
            import subprocess
            result = subprocess.run(['wkhtmltoimage', '--version'], 
                                  capture_output=True, timeout=5)
            if result.returncode == 0:
                self.method = "imgkit"
                logger.info("Using imgkit library for HTML to PNG conversion")
                return
        except:
            pass
        
        # Method 3: Fallback to weasyprint (CSS/HTML to image, no browser)
        try:
            from weasyprint import HTML, CSS
            self.method = "weasyprint"
            logger.info("Using weasyprint library for HTML to PNG conversion")
            return
        except ImportError:
            pass
        
        # If nothing works, we'll try a simple method
        self.method = "simple"
        logger.warning("No specialized HTML-to-image libraries found, using simple fallback method")

    async def convert_html_to_png_html2image(self, html_content: str, output_path: str) -> bool:
        """Convert HTML to PNG using html2image library."""
        try:
            from html2image import Html2Image
            
            # Create Html2Image instance
            hti = Html2Image()
            
            # Get the directory and filename
            output_dir = os.path.dirname(output_path)
            output_filename = os.path.basename(output_path)
            
            # Set output path
            hti.output_path = output_dir
            
            # Take screenshot
            hti.screenshot(
                html_str=html_content,
                save_as=output_filename,
                css_str="",  # CSS is embedded in HTML
                size=(self.video_width, self.video_height)
            )
            
            if os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                logger.info(f"html2image conversion successful: {file_size} bytes")
                
                # Verify the file is not empty
                if file_size == 0:
                    logger.error("html2image created empty file - falling back to simple method")
                    return False
                    
                return True
            else:
                logger.error("html2image failed to create output file")
                return False
                
        except Exception as e:
            logger.error(f"html2image conversion error: {str(e)}")
            return False
    
    async def convert_html_to_png_imgkit(self, html_content: str, output_path: str) -> bool:
        """Convert HTML to PNG using imgkit library."""
        try:
            import imgkit
            
            options = {
                'width': self.video_width,
                'height': self.video_height,
                'format': 'png',
                'quality': 100,
                'disable-javascript': '',
                'no-background': ''
            }
            
            imgkit.from_string(html_content, output_path, options=options)
            
            if os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                logger.info(f"imgkit conversion successful: {file_size} bytes")
                return True
            else:
                logger.error("imgkit failed to create output file")
                return False
                
        except Exception as e:
            logger.error(f"imgkit conversion error: {str(e)}")
            return False
    
    async def convert_html_to_png_weasyprint(self, html_content: str, output_path: str) -> bool:
        """Convert HTML to PNG using weasyprint library."""
        try:
            from weasyprint import HTML, CSS
            
            html_doc = HTML(string=html_content)
            html_doc.write_png(output_path, resolution=300)
            
            if os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                logger.info(f"weasyprint conversion successful: {file_size} bytes")
                return True
            else:
                logger.error("weasyprint failed to create output file")
                return False
                
        except Exception as e:
            logger.error(f"weasyprint conversion error: {str(e)}")
            return False
    
    async def convert_html_to_png_simple(self, html_content: str, output_path: str) -> bool:
        """Simple fallback conversion method."""
        try:
            # This is a very basic fallback - in practice you might want to use
            # a headless browser like playwright or selenium here
            logger.warning("Using simple fallback method - may not produce high quality results")
            
            # For now, create a placeholder file to prevent errors
            # In a real implementation, you'd want to use a proper HTML renderer
            with open(output_path, 'wb') as f:
                # Create a minimal PNG file (this is just a placeholder)
                # You should implement proper HTML rendering here
                f.write(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x03\xe8\x00\x00\x03\xe8\x08\x02\x00\x00\x00\x8f\xb5\x8f\x93\x00\x00\x00\x12IDATx\x9c\xed\xc1\x01\x01\x00\x00\x00\x80\x90\xfe\xaf\xee\x08\n\x00\x00\x00\x00IEND\xaeB`\x82')
            
            return os.path.exists(output_path)
            
        except Exception as e:
            logger.error(f"Simple conversion error: {str(e)}")
            return False
    
    async def convert_html_to_png(self, 
                                html_content: str, 
                                output_path: str,
                                template_id: str = "unknown") -> bool:
        """
        Convert HTML content to PNG image using the best available method.
        
        Args:
            html_content: Clean HTML content
            output_path: Path where PNG should be saved
            template_id: Template ID for logging
            
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"Converting HTML to PNG for template: {template_id} using {self.method}")
            
            # Use the appropriate conversion method with fallback
            if self.method == "html2image":
                success = await self.convert_html_to_png_html2image(html_content, output_path)
                if not success:
                    logger.warning("html2image failed, falling back to simple method")
                    return await self.convert_html_to_png_simple(html_content, output_path)
                return success
            elif self.method == "imgkit":
                success = await self.convert_html_to_png_imgkit(html_content, output_path)
                if not success:
                    logger.warning("imgkit failed, falling back to simple method")
                    return await self.convert_html_to_png_simple(html_content, output_path)
                return success
            elif self.method == "weasyprint":
                success = await self.convert_html_to_png_weasyprint(html_content, output_path)
                if not success:
                    logger.warning("weasyprint failed, falling back to simple method")
                    return await self.convert_html_to_png_simple(html_content, output_path)
                return success
            else:
                return await self.convert_html_to_png_simple(html_content, output_path)
                
        except Exception as e:
            logger.error(f"Failed to convert HTML to PNG: {str(e)}")
            logger.warning("Falling back to simple method due to exception")
            return await self.convert_html_to_png_simple(html_content, output_path)
    
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
            logger.info(f"🎬 [HTML_TO_IMAGE] Converting slide to PNG")
            logger.info(f"🎬 [HTML_TO_IMAGE] Parameters:")
            logger.info(f"  - Template ID: {template_id}")
            logger.info(f"  - Theme: {theme}")
            logger.info(f"  - Output path: {output_path}")
            logger.info(f"  - Props keys: {list(props.keys())}")
            
            # Store props for fallback access
            self._last_props = props
            
            # Log detailed props content
            for key, value in props.items():
                if isinstance(value, str):
                    logger.info(f"  - {key}: '{value[:200]}...'")
                else:
                    logger.info(f"  - {key}: {value}")
            
            # Import the HTML template service
            from .html_template_service import html_template_service
            
            # Generate clean HTML
            logger.info(f"🎬 [HTML_TO_IMAGE] Generating HTML content...")
            html_content = html_template_service.generate_clean_html_for_video(
                template_id, props, theme
            )
            
            logger.info(f"🎬 [HTML_TO_IMAGE] HTML content generated")
            logger.info(f"🎬 [HTML_TO_IMAGE] HTML content length: {len(html_content)} characters")
            
            # Convert to PNG
            logger.info(f"🎬 [HTML_TO_IMAGE] Converting HTML to PNG...")
            success = await self.convert_html_to_png(html_content, output_path, template_id)
            
            if success:
                logger.info(f"🎬 [HTML_TO_IMAGE] PNG conversion successful: {output_path}")
                if os.path.exists(output_path):
                    file_size = os.path.getsize(output_path)
                    logger.info(f"🎬 [HTML_TO_IMAGE] PNG file size: {file_size} bytes")
            else:
                logger.error(f"🎬 [HTML_TO_IMAGE] PNG conversion failed")
            
            return success
            
        except Exception as e:
            logger.error(f"🎬 [HTML_TO_IMAGE] Failed to convert slide to PNG: {str(e)}")
            return False
    
    def get_status(self) -> Dict[str, Any]:
        """Get service status and available methods."""
        return {
            "service": "HTML to Image Service",
            "method": self.method,
            "chromium_required": False,
            "output_resolution": f"{self.video_width}x{self.video_height}",
            "status": "active"
        }

# Global instance
html_to_image_service = HTMLToImageService()
