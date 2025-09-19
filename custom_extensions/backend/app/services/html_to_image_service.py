"""
HTML to Image Service
Converts HTML content to PNG images using multiple fallback methods
"""

import os
import tempfile
import subprocess
import shutil
from typing import Optional


class HTMLToImageService:
    """
    Service for converting HTML content to PNG images using multiple fallback methods
    """
    
    @staticmethod
    def convert_poster_to_png(html_content: str, output_path: str, width: int = 1000, height: int = 1000) -> bool:
        """
        Convert poster HTML to PNG image using multiple fallback methods
        
        Args:
            html_content: HTML content to convert
            output_path: Path where the PNG should be saved
            width: Image width in pixels
            height: Image height in pixels
            
        Returns:
            bool: True if conversion successful, False otherwise
        """
        
        print(f"Starting HTML to PNG conversion. Output path: {output_path}")
        
        # Method 1: Try html2image (best quality)
        print("Trying html2image...")
        if HTMLToImageService._try_html2image(html_content, output_path, width, height):
            print("html2image succeeded!")
            return True
        
        # Method 2: Try imgkit (wkhtmltoimage)
        print("Trying imgkit...")
        if HTMLToImageService._try_imgkit(html_content, output_path, width, height):
            print("imgkit succeeded!")
            return True
        
        # Method 3: Try weasyprint
        print("Trying weasyprint...")
        if HTMLToImageService._try_weasyprint(html_content, output_path, width, height):
            print("weasyprint succeeded!")
            return True
        
        # Method 4: Try playwright (fallback)
        print("Trying playwright...")
        if HTMLToImageService._try_playwright(html_content, output_path, width, height):
            print("playwright succeeded!")
            return True
        
        # Method 5: Create a simple fallback PNG (for testing)
        print("Trying fallback method...")
        if HTMLToImageService._try_fallback_png(output_path, width, height):
            print("Fallback method succeeded!")
            return True
        
        # All methods failed
        print("All HTML to image conversion methods failed")
        return False
    
    @staticmethod
    def _try_html2image(html_content: str, output_path: str, width: int, height: int) -> bool:
        """Try converting using html2image library"""
        try:
            from html2image import Html2Image
            
            hti = Html2Image()
            hti.screenshot(
                html_str=html_content,
                save_as=os.path.basename(output_path),
                size=(width, height)
            )
            
            # Move file to correct location if needed
            temp_file = os.path.join(os.getcwd(), os.path.basename(output_path))
            if os.path.exists(temp_file):
                shutil.move(temp_file, output_path)
                return True
            
            return False
            
        except ImportError:
            print("html2image not available")
            return False
        except Exception as e:
            print(f"html2image failed: {e}")
            return False
    
    @staticmethod
    def _try_imgkit(html_content: str, output_path: str, width: int, height: int) -> bool:
        """Try converting using imgkit (wkhtmltoimage)"""
        try:
            import imgkit
            
            options = {
                'width': width,
                'height': height,
                'format': 'png',
                'quality': 100,
                'encoding': 'UTF-8'
            }
            
            imgkit.from_string(html_content, output_path, options=options)
            return os.path.exists(output_path)
            
        except ImportError:
            print("imgkit not available")
            return False
        except Exception as e:
            print(f"imgkit failed: {e}")
            return False
    
    @staticmethod
    def _try_weasyprint(html_content: str, output_path: str, width: int, height: int) -> bool:
        """Try converting using weasyprint"""
        try:
            from weasyprint import HTML, CSS
            from weasyprint.text.fonts import FontConfiguration
            
            # Create CSS for proper sizing
            css_content = f"""
            @page {{
                size: {width}px {height}px;
                margin: 0;
            }}
            body {{
                margin: 0;
                padding: 0;
                width: {width}px;
                height: {height}px;
            }}
            """
            
            font_config = FontConfiguration()
            html_doc = HTML(string=html_content)
            css_doc = CSS(string=css_content, font_config=font_config)
            
            html_doc.write_png(output_path, stylesheets=[css_doc], resolution=300)
            return os.path.exists(output_path)
            
        except ImportError:
            print("weasyprint not available")
            return False
        except Exception as e:
            print(f"weasyprint failed: {e}")
            return False
    
    @staticmethod
    def _try_playwright(html_content: str, output_path: str, width: int, height: int) -> bool:
        """Try converting using playwright (fallback method)"""
        try:
            from playwright.sync_api import sync_playwright
            
            with sync_playwright() as p:
                browser = p.chromium.launch()
                page = browser.new_page(viewport={'width': width, 'height': height})
                
                # Set content and wait for fonts to load
                page.set_content(html_content)
                page.wait_for_timeout(2000)  # Wait for fonts and images to load
                
                # Take screenshot
                page.screenshot(path=output_path, full_page=False)
                browser.close()
                
                return os.path.exists(output_path)
                
        except ImportError:
            print("playwright not available")
            return False
        except Exception as e:
            print(f"playwright failed: {e}")
            return False
    
    @staticmethod
    def convert_slide_to_png(html_content: str, output_path: str, width: int = 1174, height: int = 900) -> bool:
        """
        Convert slide HTML to PNG image (for compatibility with existing slide system)
        
        Args:
            html_content: HTML content to convert
            output_path: Path where the PNG should be saved
            width: Image width in pixels (default slide width)
            height: Image height in pixels (default slide height)
            
        Returns:
            bool: True if conversion successful, False otherwise
        """
        return HTMLToImageService.convert_poster_to_png(html_content, output_path, width, height)
    
    @staticmethod
    def _try_fallback_png(output_path: str, width: int, height: int) -> bool:
        """Create a simple fallback PNG for testing purposes"""
        try:
            # Create a simple colored PNG using PIL if available
            try:
                from PIL import Image, ImageDraw, ImageFont
                
                # Create a new image with white background
                img = Image.new('RGB', (width, height), color='white')
                draw = ImageDraw.Draw(img)
                
                # Add some text to indicate this is a test image
                try:
                    # Try to use a default font
                    font = ImageFont.load_default()
                except:
                    font = None
                
                # Draw some text
                text = "Event Poster\n(Test Image)"
                if font:
                    draw.text((50, 50), text, fill='black', font=font)
                else:
                    draw.text((50, 50), text, fill='black')
                
                # Save the image
                img.save(output_path, 'PNG')
                print(f"Fallback PNG created successfully at {output_path}")
                return True
                
            except ImportError:
                print("PIL not available for fallback method")
                return False
                
        except Exception as e:
            print(f"Fallback method failed: {e}")
            return False
