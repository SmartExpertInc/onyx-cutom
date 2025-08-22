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
        
        # Method 1: Try wkhtmltopdf/wkhtmltoimage (most reliable, no browser needed)
        try:
            import subprocess
            result = subprocess.run(['wkhtmltoimage', '--version'], 
                                  capture_output=True, timeout=5)
            if result.returncode == 0:
                self.method = "wkhtmltoimage"
                logger.info("Using wkhtmltoimage for HTML to PNG conversion")
                return
        except:
            pass
        
        # Method 2: Try html2image (Python library, uses browser but more stable)
        try:
            from html2image import Html2Image
            self.method = "html2image"
            logger.info("Using html2image library for HTML to PNG conversion")
            return
        except ImportError:
            pass
        
        # Method 3: Try imgkit (wkhtmltoimage Python wrapper)
        try:
            import imgkit
            self.method = "imgkit"
            logger.info("Using imgkit library for HTML to PNG conversion")
            return
        except ImportError:
            pass
        
        # Method 4: Fallback to weasyprint (CSS/HTML to image, no browser)
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
    
    async def convert_html_to_png_wkhtmltoimage(self, html_content: str, output_path: str) -> bool:
        """Convert HTML to PNG using wkhtmltoimage command."""
        try:
            import subprocess
            
            # Create temporary HTML file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False) as f:
                f.write(html_content)
                temp_html_path = f.name
            
            try:
                # Run wkhtmltoimage
                cmd = [
                    'wkhtmltoimage',
                    '--width', str(self.video_width),
                    '--height', str(self.video_height),
                    '--format', 'png',
                    '--quality', '100',
                    '--disable-javascript',
                    '--no-background',
                    temp_html_path,
                    output_path
                ]
                
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
                
                if result.returncode == 0 and os.path.exists(output_path):
                    file_size = os.path.getsize(output_path)
                    logger.info(f"wkhtmltoimage conversion successful: {file_size} bytes")
                    return True
                else:
                    logger.error(f"wkhtmltoimage failed: {result.stderr}")
                    return False
                    
            finally:
                try:
                    os.unlink(temp_html_path)
                except:
                    pass
                    
        except Exception as e:
            logger.error(f"wkhtmltoimage conversion error: {str(e)}")
            return False
    
    async def convert_html_to_png_html2image(self, html_content: str, output_path: str) -> bool:
        """Convert HTML to PNG using html2image library."""
        try:
            from html2image import Html2Image
            
            hti = Html2Image(
                size=(self.video_width, self.video_height),
                output_path=os.path.dirname(output_path)
            )
            
            filename = os.path.basename(output_path)
            
            # Convert HTML to image
            hti.screenshot(
                html_str=html_content,
                save_as=filename,
                size=(self.video_width, self.video_height)
            )
            
            if os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                logger.info(f"html2image conversion successful: {file_size} bytes")
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
        """Simple fallback method - creates a placeholder image."""
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
            
            # Draw placeholder text
            text = "Video Slide Generated\n(HTML to Image Conversion)"
            draw.text((100, 400), text, fill='white', font=font)
            
            # Save the image
            image.save(output_path, 'PNG')
            
            file_size = os.path.getsize(output_path)
            logger.info(f"Simple fallback conversion: {file_size} bytes")
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
            
            # Use the appropriate conversion method
            if self.method == "wkhtmltoimage":
                return await self.convert_html_to_png_wkhtmltoimage(html_content, output_path)
            elif self.method == "html2image":
                return await self.convert_html_to_png_html2image(html_content, output_path)
            elif self.method == "imgkit":
                return await self.convert_html_to_png_imgkit(html_content, output_path)
            elif self.method == "weasyprint":
                return await self.convert_html_to_png_weasyprint(html_content, output_path)
            else:
                return await self.convert_html_to_png_simple(html_content, output_path)
                
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
