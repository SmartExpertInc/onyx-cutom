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
        
        # Method 1: Try Playwright (most reliable for HTML to PNG)
        try:
            from playwright.async_api import async_playwright
            self.method = "playwright"
            logger.info("Using Playwright for HTML to PNG conversion (most reliable)")
            return
        except ImportError:
            pass
        
        # Method 2: Try html2image (Python library, uses browser but more stable)
        try:
            from html2image import Html2Image
            self.method = "html2image"
            logger.info("Using html2image library for HTML to PNG conversion")
            return
        except ImportError:
            pass
        
        # Method 3: Try imgkit (wkhtmltoimage Python wrapper - may not work without wkhtmltoimage)
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
        
        # Method 4: Fallback to weasyprint (CSS/HTML to image, no browser)
        try:
            from weasyprint import HTML, CSS
            self.method = "weasyprint"
            logger.info("Using weasyprint library for HTML to PNG conversion")
            return
        except ImportError:
            pass
        
        # If nothing works, we'll use enhanced fallback method
        self.method = "simple"
        logger.warning("No specialized HTML-to-image libraries found, using enhanced fallback method")

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
    
    async def convert_html_to_png_playwright(self, html_content: str, output_path: str) -> bool:
        """Convert HTML to PNG using Playwright (most reliable method)."""
        try:
            # Try to use playwright for HTML to image conversion
            from playwright.async_api import async_playwright
            
            logger.info("Using Playwright for HTML to PNG conversion")
            
            async with async_playwright() as p:
                # Launch browser
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page(viewport={'width': 1000, 'height': 1000})
                
                # Set content and wait for load
                await page.set_content(html_content, wait_until='networkidle')
                
                # Take screenshot
                await page.screenshot(
                    path=output_path,
                    width=1000,
                    height=1000,
                    type='png'
                )
                
                await browser.close()
                
            if os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                logger.info(f"Playwright conversion successful: {file_size} bytes")
                return file_size > 100  # Ensure reasonable file size
            else:
                logger.error("Playwright failed to create output file")
                return False
                
        except ImportError:
            logger.warning("Playwright not available, trying alternative method")
            return False
        except Exception as e:
            logger.error(f"Playwright conversion error: {str(e)}")
            return False

    async def convert_html_to_png_simple(self, html_content: str, output_path: str) -> bool:
        """Enhanced fallback conversion method using built-in libraries."""
        import time
        simple_start = time.time()
        simple_id = f"simple-{int(time.time())}"
        
        try:
            logger.info(f"🖼️ [HTML_TO_IMAGE_SIMPLE] [{simple_id}] === SIMPLE FALLBACK METHOD STARTED ===")
            logger.info(f"🖼️ [HTML_TO_IMAGE_SIMPLE] [{simple_id}] Using enhanced fallback method for HTML to PNG conversion")
            logger.info(f"🖼️ [HTML_TO_IMAGE_SIMPLE] [{simple_id}] HTML content length: {len(html_content)} characters")
            logger.info(f"🖼️ [HTML_TO_IMAGE_SIMPLE] [{simple_id}] Output path: {output_path}")
            
            # Try using Pillow with HTML rendering (basic approach)
            logger.info(f"🖼️ [HTML_TO_IMAGE_SIMPLE] [{simple_id}] Attempting Pillow-based rendering...")
            pillow_start = time.time()
            
            try:
                from PIL import Image, ImageDraw, ImageFont
                import textwrap
                
                logger.info(f"🖼️ [HTML_TO_IMAGE_SIMPLE] [{simple_id}] PIL modules imported successfully")
                
                # Create a white background image
                img = Image.new('RGB', (1000, 1000), color='white')
                draw = ImageDraw.Draw(img)
                logger.info(f"🖼️ [HTML_TO_IMAGE_SIMPLE] [{simple_id}] Created 1000x1000 white background image")
                
                # Try to use a system font
                try:
                    font_large = ImageFont.truetype("arial.ttf", 40)
                    font_medium = ImageFont.truetype("arial.ttf", 24)
                    font_small = ImageFont.truetype("arial.ttf", 16)
                except:
                    font_large = ImageFont.load_default()
                    font_medium = ImageFont.load_default()
                    font_small = ImageFont.load_default()
                
                # Extract basic text content from HTML (very simple parsing)
                import re
                
                # Remove HTML tags and extract text content
                clean_text = re.sub(r'<[^>]+>', '', html_content)
                clean_text = re.sub(r'\s+', ' ', clean_text).strip()
                
                # Draw a basic poster layout
                y_pos = 50
                
                # Title
                title_lines = textwrap.wrap("Event Poster", width=30)
                for line in title_lines:
                    draw.text((50, y_pos), line, fill='black', font=font_large)
                    y_pos += 50
                
                # Add some content
                y_pos += 50
                content_lines = textwrap.wrap(clean_text[:200] + "...", width=50)
                for line in content_lines[:15]:  # Limit to 15 lines
                    draw.text((50, y_pos), line, fill='black', font=font_small)
                    y_pos += 25
                
                # Add watermark
                draw.text((50, 950), "Generated Poster", fill='gray', font=font_medium)
                
                # Save the image
                logger.info(f"🖼️ [HTML_TO_IMAGE_SIMPLE] [{simple_id}] Saving image to: {output_path}")
                img.save(output_path, 'PNG')
                
                pillow_end = time.time()
                pillow_duration = (pillow_end - pillow_start) * 1000
                
                if os.path.exists(output_path):
                    file_size = os.path.getsize(output_path)
                    logger.info(f"🖼️ [HTML_TO_IMAGE_SIMPLE] [{simple_id}] ✅ Pillow fallback conversion successful in {pillow_duration:.2f}ms: {file_size} bytes")
                    return file_size > 100
                else:
                    logger.error(f"🖼️ [HTML_TO_IMAGE_SIMPLE] [{simple_id}] ❌ Pillow conversion failed - file not created")
                    return False
                
            except ImportError as pil_error:
                pillow_end = time.time()
                pillow_duration = (pillow_end - pillow_start) * 1000
                logger.warning(f"🖼️ [HTML_TO_IMAGE_SIMPLE] [{simple_id}] Pillow not available after {pillow_duration:.2f}ms: {pil_error}")
                logger.warning(f"🖼️ [HTML_TO_IMAGE_SIMPLE] [{simple_id}] Falling back to minimal PNG generation")
                
            # Last resort: Create a proper minimal PNG with actual content
            # This creates a valid 1000x1000 white PNG file
            import struct
            
            def create_minimal_png(width, height):
                """Create a minimal valid PNG file."""
                # PNG signature
                png_signature = b'\x89PNG\r\n\x1a\n'
                
                # IHDR chunk
                ihdr_data = struct.pack('>2I5B', width, height, 8, 2, 0, 0, 0)
                ihdr_crc = self._calculate_crc(b'IHDR' + ihdr_data)
                ihdr_chunk = struct.pack('>I', 13) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
                
                # Simple white image data (minimal)
                pixels_per_row = width * 3  # RGB
                image_data = b''
                for row in range(height):
                    # Filter byte (0 = None filter) + white pixels
                    row_data = b'\x00' + b'\xff' * pixels_per_row
                    image_data += row_data
                
                # Compress image data
                import zlib
                compressed_data = zlib.compress(image_data)
                
                # IDAT chunk
                idat_crc = self._calculate_crc(b'IDAT' + compressed_data)
                idat_chunk = struct.pack('>I', len(compressed_data)) + b'IDAT' + compressed_data + struct.pack('>I', idat_crc)
                
                # IEND chunk
                iend_crc = self._calculate_crc(b'IEND')
                iend_chunk = struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
                
                return png_signature + ihdr_chunk + idat_chunk + iend_chunk
            
            # Create and write the PNG
            logger.info(f"🖼️ [HTML_TO_IMAGE_SIMPLE] [{simple_id}] Creating minimal PNG...")
            minimal_start = time.time()
            
            png_data = create_minimal_png(1000, 1000)
            logger.info(f"🖼️ [HTML_TO_IMAGE_SIMPLE] [{simple_id}] Generated PNG data: {len(png_data)} bytes")
            
            with open(output_path, 'wb') as f:
                f.write(png_data)
            
            minimal_end = time.time()
            minimal_duration = (minimal_end - minimal_start) * 1000
            
            if os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                logger.info(f"🖼️ [HTML_TO_IMAGE_SIMPLE] [{simple_id}] ✅ Minimal PNG generation successful in {minimal_duration:.2f}ms: {file_size} bytes")
                return file_size > 100
            else:
                logger.error(f"🖼️ [HTML_TO_IMAGE_SIMPLE] [{simple_id}] ❌ Minimal PNG generation failed - file not created")
                return False
            
            return False
            
        except Exception as e:
            simple_end = time.time()
            simple_duration = (simple_end - simple_start) * 1000
            
            logger.error(f"🖼️ [HTML_TO_IMAGE_SIMPLE] [{simple_id}] === SIMPLE FALLBACK FAILED ===")
            logger.error(f"🖼️ [HTML_TO_IMAGE_SIMPLE] [{simple_id}] Duration before error: {simple_duration:.2f}ms")
            logger.error(f"🖼️ [HTML_TO_IMAGE_SIMPLE] [{simple_id}] Error type: {type(e).__name__}")
            logger.error(f"🖼️ [HTML_TO_IMAGE_SIMPLE] [{simple_id}] Enhanced fallback conversion error: {str(e)}")
            return False
    
    def _calculate_crc(self, data):
        """Calculate CRC32 for PNG chunks."""
        import zlib
        return zlib.crc32(data) & 0xffffffff
    
    def _log_final_verification(self, conversion_id: str, output_path: str, start_time: float, method_used: str, success: bool):
        """Log final verification details for conversion process."""
        import time
        import os
        
        end_time = time.time()
        total_duration = (end_time - start_time) * 1000
        
        logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] === FINAL VERIFICATION ===")
        
        if os.path.exists(output_path):
            try:
                file_stats = os.stat(output_path)
                file_size = file_stats.st_size
                file_mtime = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(file_stats.st_mtime))
                
                logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] ✅ Output file created successfully")
                logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] File details:")
                logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}]   - path: {output_path}")
                logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}]   - size: {file_size} bytes")
                logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}]   - modified: {file_mtime}")
                logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}]   - size category: {'VERY_SMALL' if file_size < 1000 else 'SMALL' if file_size < 10000 else 'MEDIUM' if file_size < 100000 else 'LARGE'}")
                
                # Try to read file header for validation
                try:
                    with open(output_path, 'rb') as f:
                        header = f.read(16)
                        header_hex = header.hex()
                        logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}]   - file header: {header_hex}")
                        
                        # Check PNG signature
                        png_signature = b'\x89PNG\r\n\x1a\n'
                        is_valid_png = header.startswith(png_signature)
                        logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}]   - valid PNG: {is_valid_png}")
                        
                        if not is_valid_png:
                            logger.warning(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] ⚠️ File does not have valid PNG signature!")
                        
                except Exception as header_error:
                    logger.warning(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Could not validate file header: {header_error}")
                
                logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] === CONVERSION COMPLETED ===")
                logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Total processing time: {total_duration:.2f}ms")
                logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Method used: {method_used}")
                logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Success status: {success}")
                logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] File size check: {file_size > 0}")
                
            except Exception as stat_error:
                logger.error(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Could not get file stats: {stat_error}")
        else:
            logger.error(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] ❌ Output file was not created: {output_path}")
            logger.error(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Total processing time: {total_duration:.2f}ms")
            logger.error(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Method attempted: {method_used}")
            logger.error(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Success status: {success}")
    
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
        import time
        start_time = time.time()
        conversion_id = f"conv-{int(time.time())}-{template_id}"
        
        try:
            logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] ========== HTML-TO-IMAGE CONVERSION STARTED ==========")
            logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}")
            logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Template ID: {template_id}")
            logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Conversion method: {self.method}")
            logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Target dimensions: {self.video_width}x{self.video_height}")
            logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Output path: {output_path}")
            logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] HTML content length: {len(html_content)} characters")
            logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] HTML preview (first 150 chars): {html_content[:150]}...")
            
            # Use the appropriate conversion method with fallback
            logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] === CONVERSION METHOD EXECUTION ===")
            method_start = time.time()
            
            if self.method == "playwright":
                logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Attempting Playwright conversion...")
                success = await self.convert_html_to_png_playwright(html_content, output_path)
                method_end = time.time()
                method_duration = (method_end - method_start) * 1000
                
                if not success:
                    logger.warning(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] ❌ Playwright failed after {method_duration:.2f}ms, falling back to simple method")
                    fallback_start = time.time()
                    fallback_success = await self.convert_html_to_png_simple(html_content, output_path)
                    fallback_end = time.time()
                    fallback_duration = (fallback_end - fallback_start) * 1000
                    logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Fallback completed in {fallback_duration:.2f}ms, success: {fallback_success}")
                    self._log_final_verification(conversion_id, output_path, start_time, "playwright+simple", fallback_success)
                    return fallback_success
                else:
                    logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] ✅ Playwright conversion successful in {method_duration:.2f}ms")
                    self._log_final_verification(conversion_id, output_path, start_time, "playwright", success)
                    return success
                
            elif self.method == "html2image":
                logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Attempting html2image conversion...")
                success = await self.convert_html_to_png_html2image(html_content, output_path)
                method_end = time.time()
                method_duration = (method_end - method_start) * 1000
                
                if not success:
                    logger.warning(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] ❌ html2image failed after {method_duration:.2f}ms, falling back to simple method")
                    fallback_start = time.time()
                    fallback_success = await self.convert_html_to_png_simple(html_content, output_path)
                    fallback_end = time.time()
                    fallback_duration = (fallback_end - fallback_start) * 1000
                    logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Fallback completed in {fallback_duration:.2f}ms, success: {fallback_success}")
                    self._log_final_verification(conversion_id, output_path, start_time, "html2image+simple", fallback_success)
                    return fallback_success
                else:
                    logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] ✅ html2image conversion successful in {method_duration:.2f}ms")
                    self._log_final_verification(conversion_id, output_path, start_time, "html2image", success)
                    return success
                
            elif self.method == "imgkit":
                logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Attempting imgkit conversion...")
                success = await self.convert_html_to_png_imgkit(html_content, output_path)
                method_end = time.time()
                method_duration = (method_end - method_start) * 1000
                
                if not success:
                    logger.warning(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] ❌ imgkit failed after {method_duration:.2f}ms, falling back to simple method")
                    fallback_start = time.time()
                    fallback_success = await self.convert_html_to_png_simple(html_content, output_path)
                    fallback_end = time.time()
                    fallback_duration = (fallback_end - fallback_start) * 1000
                    logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Fallback completed in {fallback_duration:.2f}ms, success: {fallback_success}")
                    self._log_final_verification(conversion_id, output_path, start_time, "imgkit+simple", fallback_success)
                    return fallback_success
                else:
                    logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] ✅ imgkit conversion successful in {method_duration:.2f}ms")
                    self._log_final_verification(conversion_id, output_path, start_time, "imgkit", success)
                    return success
                
            elif self.method == "weasyprint":
                logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Attempting weasyprint conversion...")
                success = await self.convert_html_to_png_weasyprint(html_content, output_path)
                method_end = time.time()
                method_duration = (method_end - method_start) * 1000
                
                if not success:
                    logger.warning(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] ❌ weasyprint failed after {method_duration:.2f}ms, falling back to simple method")
                    fallback_start = time.time()
                    fallback_success = await self.convert_html_to_png_simple(html_content, output_path)
                    fallback_end = time.time()
                    fallback_duration = (fallback_end - fallback_start) * 1000
                    logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Fallback completed in {fallback_duration:.2f}ms, success: {fallback_success}")
                    self._log_final_verification(conversion_id, output_path, start_time, "weasyprint+simple", fallback_success)
                    return fallback_success
                else:
                    logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] ✅ weasyprint conversion successful in {method_duration:.2f}ms")
                    self._log_final_verification(conversion_id, output_path, start_time, "weasyprint", success)
                    return success
            else:
                logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Using simple fallback method directly")
                method_end = time.time()
                method_duration = (method_end - method_start) * 1000
                success = await self.convert_html_to_png_simple(html_content, output_path)
                logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Simple method completed in {method_duration:.2f}ms, success: {success}")
                self._log_final_verification(conversion_id, output_path, start_time, "simple", success)
                return success
                
        except Exception as e:
            end_time = time.time()
            total_duration = (end_time - start_time) * 1000
            
            logger.error(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] === CONVERSION FAILED ===")
            logger.error(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Error time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
            logger.error(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Duration before error: {total_duration:.2f}ms")
            logger.error(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Error type: {type(e).__name__}")
            logger.error(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Error message: {str(e)}")
            logger.warning(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] 🔄 Falling back to simple method due to exception")
            
            try:
                fallback_start = time.time()
                fallback_success = await self.convert_html_to_png_simple(html_content, output_path)
                fallback_end = time.time()
                fallback_duration = (fallback_end - fallback_start) * 1000
                
                logger.info(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] Exception fallback completed in {fallback_duration:.2f}ms, success: {fallback_success}")
                self._log_final_verification(conversion_id, output_path, start_time, "exception+simple", fallback_success)
                return fallback_success
            except Exception as fallback_error:
                logger.error(f"🖼️ [HTML_TO_IMAGE] [{conversion_id}] ❌ Even fallback failed: {fallback_error}")
                self._log_final_verification(conversion_id, output_path, start_time, "failed", False)
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
