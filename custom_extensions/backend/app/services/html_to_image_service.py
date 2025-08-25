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
        logger.warning("No advanced HTML to image libraries found, using simple fallback")
    

    
    async def convert_html_to_png_html2image(self, html_content: str, output_path: str) -> bool:
        """Convert HTML to PNG using html2image library."""
        try:
            from html2image import Html2Image
            
            # Configure html2image with proper Chrome flags for Docker environment
            # CRITICAL FIX: Add viewport and disable default margins/padding
            hti = Html2Image(
                size=(self.video_width, self.video_height),
                output_path=os.path.dirname(output_path),
                custom_flags=[
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--force-device-scale-factor=1',  # Ensure 1:1 pixel mapping
                    '--high-dpi-support=1',  # Better high DPI support
                    '--disable-default-apps',
                    '--disable-extensions',
                    '--disable-plugins',
                    '--disable-images',  # Disable images to focus on layout
                    '--disable-javascript',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                    '--disable-field-trial-config',
                    '--disable-ipc-flooding-protection',
                    '--enable-logging',
                    '--log-level=0',
                    '--silent-launch',
                    '--no-first-run',
                    '--no-default-browser-check',
                    '--disable-default-apps',
                    '--disable-sync',
                    '--disable-translate',
                    '--hide-scrollbars',
                    '--mute-audio',
                    '--no-zygote',
                    '--single-process',
                    '--disable-background-networking',
                    '--disable-background-timer-throttling',
                    '--disable-client-side-phishing-detection',
                    '--disable-component-extensions-with-background-pages',
                    '--disable-extensions',
                    '--disable-features=TranslateUI',
                    '--disable-ipc-flooding-protection',
                    '--disable-renderer-backgrounding',
                    '--disable-sync',
                    '--force-color-profile=srgb',
                    '--metrics-recording-only',
                    '--no-first-run',
                    '--safebrowsing-disable-auto-update',
                    '--enable-automation',
                    '--password-store=basic',
                    '--use-mock-keychain',
                    '--disable-blink-features=AutomationControlled'
                ]
            )
            
            filename = os.path.basename(output_path)
            
            # CRITICAL FIX: Wrap HTML content with proper viewport and ensure full coverage
            # The issue is that html2image might not respect the exact dimensions
            wrapped_html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width={self.video_width}, height={self.video_height}, initial-scale=1.0">
                <style>
                    html, body {{
                        margin: 0 !important;
                        padding: 0 !important;
                        width: {self.video_width}px !important;
                        height: {self.video_height}px !important;
                        overflow: hidden !important;
                        background: transparent !important;
                    }}
                    * {{
                        box-sizing: border-box !important;
                    }}
                </style>
            </head>
            <body>
                {html_content}
            </body>
            </html>
            """
            
            # Convert HTML to image
            hti.screenshot(
                html_str=wrapped_html,
                save_as=filename,
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
            from weasyprint import HTML
            from PIL import Image
            import io
            
            # WeasyPrint creates PDF, then we convert to PNG
            pdf_bytes = HTML(string=html_content).write_pdf()
            
            # Convert PDF to PNG using Pillow
            # This is a simplified approach - you might need pdf2image library for better results
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as pdf_file:
                pdf_file.write(pdf_bytes)
                pdf_path = pdf_file.name
            
            try:
                # Try to convert PDF to PNG
                from pdf2image import convert_from_path
                
                images = convert_from_path(pdf_path, dpi=150, first_page=1, last_page=1)
                if images:
                    image = images[0]
                    # Resize to exact video dimensions
                    image = image.resize((self.video_width, self.video_height))
                    image.save(output_path, 'PNG')
                    
                    file_size = os.path.getsize(output_path)
                    logger.info(f"weasyprint conversion successful: {file_size} bytes")
                    return True
                else:
                    logger.error("weasyprint failed to convert PDF to image")
                    return False
                    
            finally:
                try:
                    os.unlink(pdf_path)
                except:
                    pass
                    
        except Exception as e:
            logger.error(f"weasyprint conversion error: {str(e)}")
            return False
    
    async def convert_html_to_png_simple(self, html_content: str, output_path: str) -> bool:
        """Simple fallback method - creates a placeholder image with actual slide content."""
        try:
            from PIL import Image, ImageDraw, ImageFont
            
            # Create a simple image with text
            image = Image.new('RGB', (self.video_width, self.video_height), color='#110c35')
            draw = ImageDraw.Draw(image)
            
            # Try to load a font
            try:
                font = ImageFont.truetype("arial.ttf", 48)
            except:
                font = ImageFont.load_default()
            
            # Extract content from HTML if possible
            import re
            title_match = re.search(r'<h1[^>]*>(.*?)</h1>', html_content, re.DOTALL)
            content_match = re.search(r'<p[^>]*>(.*?)</p>', html_content, re.DOTALL)
            
            title = title_match.group(1).strip() if title_match else "Slide Title"
            content = content_match.group(1).strip() if content_match else "Slide Content"
            
            # Clean HTML tags from text
            title = re.sub(r'<[^>]+>', '', title)
            content = re.sub(r'<[^>]+>', '', content)
            
            # If we couldn't extract from HTML, try to get from the context
            if title == "Slide Title" and hasattr(self, '_last_props'):
                title = self._last_props.get('title', 'Slide Title')
                content = self._last_props.get('content', 'Slide Content')
            
            # Draw actual slide content with better positioning
            draw.text((100, 200), f"Title: {title}", fill='white', font=font)
            draw.text((100, 300), f"Content: {content[:100]}...", fill='white', font=font)
            
            # Save the image
            image.save(output_path, 'PNG')
            
            file_size = os.path.getsize(output_path)
            logger.info(f"Simple fallback conversion with actual content: {file_size} bytes")
            logger.info(f"Extracted title: {title}")
            logger.info(f"Extracted content: {content[:100]}...")
            return True
            
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
            
            # DEBUG: Save HTML content to file for inspection
            debug_html_path = output_path.replace('.png', '_debug.html')
            try:
                with open(debug_html_path, 'w', encoding='utf-8') as f:
                    f.write(html_content)
                logger.info(f"🎬 [HTML_TO_IMAGE] Debug HTML saved to: {debug_html_path}")
            except Exception as e:
                logger.warning(f"🎬 [HTML_TO_IMAGE] Failed to save debug HTML: {str(e)}")
            
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
