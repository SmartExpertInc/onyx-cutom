#!/usr/bin/env python3
"""
PDF Generator Service for Slide Decks
Handles dynamic height calculation and accurate 1:1 layout transfer
"""

import asyncio
import os
import sys
import tempfile
import uuid
import logging
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path

# Add the backend directory to the path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

try:
    import pyppeteer
    from pyppeteer import launch
    from pyppeteer.page import Page
    from pyppeteer.browser import Browser
    PYPPETEER_AVAILABLE = True
except ImportError:
    pyppeteer = None
    PYPPETEER_AVAILABLE = False
    logging.warning("pyppeteer not available. PDF generation will not work.")

try:
    import PyPDF2
    PDF_MERGE_AVAILABLE = True
except ImportError:
    try:
        import pypdf
        PDF_MERGE_AVAILABLE = True
    except ImportError:
        PDF_MERGE_AVAILABLE = False
        logging.warning("PDF merging library not available. Install PyPDF2 or pypdf.")

# Fallback PDF generation using reportlab
try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    logging.warning("reportlab not available for fallback PDF generation.")

from jinja2 import Environment, FileSystemLoader, Template

# Configure logging
logger = logging.getLogger(__name__)

# Configuration constants
PDF_MIN_SLIDE_HEIGHT = 600      # Minimum slide height in pixels
PDF_MAX_SLIDE_HEIGHT = 3000     # Maximum slide height in pixels
PDF_HEIGHT_SAFETY_MARGIN = 40   # Safety margin to prevent content cutoff
PDF_GENERATION_TIMEOUT = 60000  # Increased timeout for PDF generation (60 seconds)
PDF_WIDTH = 1200                # Standard slide width
PDF_DPI = 96                   # Standard DPI for web rendering

# Global browser instance for reuse
_browser_instance: Optional[Browser] = None
_browser_lock = asyncio.Lock()

class PDFGenerationError(Exception):
    """Custom exception for PDF generation errors"""
    pass

async def get_browser_instance() -> Browser:
    """Get or create a browser instance for PDF generation"""
    global _browser_instance
    
    if _browser_instance is None:
        try:
            logger.info("Creating new browser instance for PDF generation...")
            
            # More robust browser launch options
            _browser_instance = await launch(
                headless=True,
                args=[
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                    '--disable-features=TranslateUI',
                    '--disable-ipc-flooding-protection',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--disable-extensions',
                    '--disable-plugins',
                    '--disable-images',  # Disable images for faster rendering
                    '--disable-javascript',  # Disable JS for static content
                    '--disable-default-apps',
                    '--disable-sync',
                    '--disable-translate',
                    '--hide-scrollbars',
                    '--mute-audio',
                    '--no-default-browser-check',
                    '--safebrowsing-disable-auto-update',
                    '--disable-client-side-phishing-detection',
                    '--disable-component-update',
                    '--disable-domain-reliability',
                    '--disable-features=AudioServiceOutOfProcess',
                    '--disable-hang-monitor',
                    '--disable-prompt-on-repost',
                    '--disable-background-networking',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                    '--disable-features=TranslateUI',
                    '--disable-ipc-flooding-protection',
                    '--disable-renderer-backgrounding',
                    '--disable-features=TranslateUI',
                    '--disable-ipc-flooding-protection',
                ],
                timeout=PDF_GENERATION_TIMEOUT,
                ignoreHTTPSErrors=True,
                dumpio=True  # Enable logging for debugging
            )
            logger.info("Browser instance created successfully")
        except Exception as e:
            logger.error(f"Failed to create browser instance: {e}")
            raise PDFGenerationError(f"Browser initialization failed: {e}")
    
    return _browser_instance

async def cleanup_browser():
    """Clean up the browser instance"""
    global _browser_instance
    if _browser_instance:
        try:
            await _browser_instance.close()
            _browser_instance = None
            logger.info("Browser instance cleaned up")
        except Exception as e:
            logger.error(f"Error cleaning up browser: {e}")

def get_template_environment() -> Environment:
    """Get Jinja2 template environment"""
    template_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'templates')
    return Environment(
        loader=FileSystemLoader(template_dir),
        autoescape=True,
        trim_blocks=True,
        lstrip_blocks=True
    )

def create_slide_html(slide_data: Dict[str, Any], theme: str, slide_height: int) -> str:
    """Create HTML for a single slide with exact positioning"""
    
    env = get_template_environment()
    
    # Load the single slide template
    template = env.get_template('single_slide_pdf_template.html')
    
    # Prepare context with slide data and theme
    context = {
        'slide': slide_data,
        'theme': theme,
        'slide_height': slide_height,
        'slide_width': PDF_WIDTH,
        'is_pdf': True
    }
    
    return template.render(context)

def generate_fallback_pdf(slides_data: List[Dict[str, Any]], theme: str, output_path: str) -> bool:
    """
    Fallback PDF generation using reportlab when pyppeteer fails
    """
    if not REPORTLAB_AVAILABLE:
        logger.error("Reportlab not available for fallback PDF generation")
        return False
    
    try:
        logger.info("Using fallback PDF generation with reportlab")
        
        # Create PDF document
        doc = SimpleDocTemplate(output_path, pagesize=A4)
        styles = getSampleStyleSheet()
        
        # Create custom styles for slides
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=20,
            alignment=TA_CENTER
        )
        
        content_style = ParagraphStyle(
            'CustomContent',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=12,
            alignment=TA_LEFT
        )
        
        # Build content for each slide
        story = []
        
        for i, slide in enumerate(slides_data):
            # Add slide title
            title = slide.get('props', {}).get('title', f'Slide {i + 1}')
            story.append(Paragraph(title, title_style))
            
            # Add slide content based on template
            template_id = slide.get('templateId', 'unknown')
            props = slide.get('props', {})
            
            if template_id == 'title-slide':
                if props.get('subtitle'):
                    story.append(Paragraph(props['subtitle'], content_style))
                if props.get('author'):
                    story.append(Paragraph(f"Author: {props['author']}", content_style))
                if props.get('date'):
                    story.append(Paragraph(f"Date: {props['date']}", content_style))
            
            elif template_id == 'content-slide':
                if props.get('content'):
                    story.append(Paragraph(props['content'], content_style))
            
            elif template_id == 'bullet-points':
                if props.get('bullets'):
                    for bullet in props['bullets']:
                        story.append(Paragraph(f"• {bullet}", content_style))
            
            elif template_id == 'big-image-left':
                if props.get('subtitle'):
                    story.append(Paragraph(props['subtitle'], content_style))
            
            # Add spacing between slides
            story.append(Spacer(1, 30))
        
        # Build PDF
        doc.build(story)
        
        logger.info(f"Fallback PDF generated successfully: {output_path}")
        return True
        
    except Exception as e:
        logger.error(f"Error in fallback PDF generation: {e}")
        return False

async def calculate_slide_dimensions(slide_data: Dict[str, Any], theme: str, browser: Optional[Browser] = None) -> int:
    """
    Calculate the exact height needed for a slide based on its content
    Uses Pyppeteer to render the slide and measure its actual height
    """
    
    if not PYPPETEER_AVAILABLE:
        logger.warning("Pyppeteer not available, using fallback height")
        return PDF_MIN_SLIDE_HEIGHT
    
    try:
        # Use provided browser or get global instance
        if browser is None:
            async with _browser_lock:
                browser = await get_browser_instance()
        
        # Create a new page for measurement
        page = await browser.newPage()
        
        # Set viewport for consistent rendering
        await page.setViewport({
            'width': PDF_WIDTH,
            'height': PDF_MAX_SLIDE_HEIGHT,
            'deviceScaleFactor': 1
        })
        
        # Create HTML with minimum height for initial measurement
        html_content = create_slide_html(slide_data, theme, PDF_MIN_SLIDE_HEIGHT)
        
        # Set content and wait for rendering with increased timeout
        await page.setContent(html_content, waitUntil='domcontentloaded', timeout=30000)
        
        # Wait a bit for any dynamic content to settle
        await asyncio.sleep(1)
        
        # Measure the actual content height using JavaScript
        height_script = """
        () => {
            const slidePage = document.querySelector('.slide-page');
            if (!slidePage) return 600;
            
            const slideRect = slidePage.getBoundingClientRect();
            const slideContent = slidePage.querySelector('.slide-content');
            if (!slideContent) return slideRect.height;
            
            // Find the actual bottom-most element
            const allElements = slideContent.querySelectorAll('*');
            let maxBottom = slideContent.getBoundingClientRect().bottom;
            
            allElements.forEach(el => {
                const elRect = el.getBoundingClientRect();
                if (elRect.bottom > maxBottom) {
                    maxBottom = elRect.bottom;
                }
            });
            
            // Calculate total height
            const totalHeight = maxBottom - slideRect.top;
            const finalHeight = Math.max(600, Math.min(Math.ceil(totalHeight), 3000));
            
            return finalHeight;
        }
        """
        
        calculated_height = await page.evaluate(height_script)
        
        # Apply safety margin
        final_height = min(calculated_height + PDF_HEIGHT_SAFETY_MARGIN, PDF_MAX_SLIDE_HEIGHT)
        final_height = max(final_height, PDF_MIN_SLIDE_HEIGHT)
        
        await page.close()
        
        logger.info(f"Calculated height for slide {slide_data.get('templateId', 'unknown')}: {final_height}px")
        return final_height
        
    except Exception as e:
        logger.error(f"Error calculating slide dimensions: {e}")
        await page.close() if 'page' in locals() else None
        return PDF_MIN_SLIDE_HEIGHT

async def generate_single_slide_pdf(
    slide_data: Dict[str, Any], 
    theme: str, 
    slide_height: int, 
    output_path: str, 
    browser: Optional[Browser] = None
) -> bool:
    """
    Generate a single slide PDF with exact dimensions
    """
    
    if not PYPPETEER_AVAILABLE:
        logger.error("Pyppeteer not available for PDF generation")
        return False
    
    try:
        # Use provided browser or get global instance
        if browser is None:
            async with _browser_lock:
                browser = await get_browser_instance()
        
        # Create a new page for PDF generation
        page = await browser.newPage()
        
        # Set viewport to match slide dimensions
        await page.setViewport({
            'width': PDF_WIDTH,
            'height': slide_height,
            'deviceScaleFactor': 1
        })
        
        # Create HTML with exact height
        html_content = create_slide_html(slide_data, theme, slide_height)
        
        # Set content and wait for rendering with increased timeout
        await page.setContent(html_content, waitUntil='domcontentloaded', timeout=30000)
        
        # Wait for any dynamic content to settle
        await asyncio.sleep(1)
        
        # Generate PDF with exact dimensions
        pdf_options = {
            'path': output_path,
            'width': f'{PDF_WIDTH}px',
            'height': f'{slide_height}px',
            'printBackground': True,
            'margin': {
                'top': '0',
                'right': '0',
                'bottom': '0',
                'left': '0'
            },
            'preferCSSPageSize': True,
            'format': None  # Use custom dimensions
        }
        
        await page.pdf(pdf_options)
        await page.close()
        
        # Verify PDF was created
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            logger.info(f"Single slide PDF generated successfully: {output_path}")
            return True
        else:
            logger.error(f"PDF file not created or empty: {output_path}")
            return False
            
    except Exception as e:
        logger.error(f"Error generating single slide PDF: {e}")
        await page.close() if 'page' in locals() else None
        return False

async def merge_pdfs(pdf_paths: List[str], output_path: str) -> bool:
    """
    Merge multiple PDF files into a single PDF
    """
    
    if not PDF_MERGE_AVAILABLE:
        logger.error("PDF merging library not available. Install PyPDF2 or pypdf.")
        return False
    
    try:
        if PDF_MERGE_AVAILABLE:
            try:
                import PyPDF2
                merger = PyPDF2.PdfMerger()
            except ImportError:
                import pypdf
                merger = pypdf.PdfMerger()
            
            # Add each PDF to the merger
            for pdf_path in pdf_paths:
                if os.path.exists(pdf_path):
                    with open(pdf_path, 'rb') as pdf_file:
                        merger.append(pdf_file)
                else:
                    logger.warning(f"PDF file not found: {pdf_path}")
            
            # Write the merged PDF
            with open(output_path, 'wb') as output_file:
                merger.write(output_file)
            
            merger.close()
            
            logger.info(f"PDFs merged successfully: {output_path}")
            return True
            
    except Exception as e:
        logger.error(f"Error merging PDFs: {e}")
        return False

async def generate_slide_deck_pdf_with_dynamic_height(
    slides_data: List[Dict[str, Any]],
    theme: str,
    output_filename: str,
    use_cache: bool = True
) -> str:
    """
    Generate a complete slide deck PDF with dynamic height calculation
    Each slide is generated individually with exact dimensions, then merged
    """
    
    if not slides_data:
        raise PDFGenerationError("No slides provided for PDF generation")
    
    # Create output directory
    output_dir = os.path.join('/app/tmp_pdf')
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, output_filename)
    
    # Check cache if enabled
    if use_cache and os.path.exists(output_path):
        logger.info(f"Using cached PDF: {output_path}")
        return output_path
    
    logger.info(f"Generating slide deck PDF with {len(slides_data)} slides")
    
    # Try browser-based generation first
    if PYPPETEER_AVAILABLE:
        try:
            # Check if pyppeteer is available
            if not PYPPETEER_AVAILABLE:
                raise PDFGenerationError("Pyppeteer not available")
            
            # Get browser instance
            try:
                async with _browser_lock:
                    browser = await get_browser_instance()
            except Exception as e:
                logger.error(f"Failed to initialize browser: {e}")
                raise PDFGenerationError(f"Browser initialization failed: {e}")
            
            try:
                # Calculate heights for all slides
                logger.info("Calculating slide heights...")
                slide_heights = []
                
                for i, slide in enumerate(slides_data):
                    logger.info(f"Calculating height for slide {i + 1}/{len(slides_data)}")
                    try:
                        height = await calculate_slide_dimensions(slide, theme, browser)
                        slide_heights.append(height)
                    except Exception as e:
                        logger.error(f"Failed to calculate height for slide {i + 1}: {e}")
                        slide_heights.append(PDF_MIN_SLIDE_HEIGHT)
                
                # Generate individual PDFs for each slide
                logger.info("Generating individual slide PDFs...")
                temp_pdf_paths = []
                
                for i, (slide, height) in enumerate(zip(slides_data, slide_heights)):
                    temp_filename = f"slide_{i}_{uuid.uuid4().hex[:8]}.pdf"
                    temp_path = os.path.join(output_dir, temp_filename)
                    
                    logger.info(f"Generating PDF for slide {i + 1}/{len(slides_data)}")
                    try:
                        success = await generate_single_slide_pdf(slide, theme, height, temp_path, browser)
                        
                        if success:
                            temp_pdf_paths.append(temp_path)
                        else:
                            logger.error(f"Failed to generate PDF for slide {i + 1}")
                    except Exception as e:
                        logger.error(f"Exception generating PDF for slide {i + 1}: {e}")
                
                if not temp_pdf_paths:
                    raise PDFGenerationError("No slide PDFs were generated successfully")
                
                # Merge all PDFs into final document
                logger.info("Merging PDFs into final document...")
                success = await merge_pdfs(temp_pdf_paths, output_path)
                
                if not success:
                    raise PDFGenerationError("Failed to merge PDFs")
                
                # Clean up temporary files
                for temp_path in temp_pdf_paths:
                    try:
                        os.remove(temp_path)
                    except Exception as e:
                        logger.warning(f"Failed to clean up temp file {temp_path}: {e}")
                
                logger.info(f"Slide deck PDF generated successfully: {output_path}")
                return output_path
                
            except Exception as e:
                logger.error(f"Browser-based PDF generation failed: {e}")
                # Fall through to fallback method
                
        except Exception as e:
            logger.error(f"Browser-based PDF generation failed: {e}")
            # Fall through to fallback method
    
    # Fallback to reportlab-based generation
    logger.info("Attempting fallback PDF generation...")
    if REPORTLAB_AVAILABLE:
        success = generate_fallback_pdf(slides_data, theme, output_path)
        if success:
            logger.info(f"Fallback PDF generated successfully: {output_path}")
            return output_path
        else:
            raise PDFGenerationError("Both browser-based and fallback PDF generation failed")
    else:
        raise PDFGenerationError("No PDF generation method available. Install pyppeteer or reportlab.")

async def test_all_slides_individually(slides_data: List[Dict[str, Any]], theme: str) -> Dict[str, Any]:
    """
    Test function to debug individual slide generation
    """
    
    results = {
        'total_slides': len(slides_data),
        'successful_slides': 0,
        'failed_slides': 0,
        'slide_details': []
    }
    
    if not PYPPETEER_AVAILABLE:
        results['error'] = 'Pyppeteer not available'
        return results
    
    try:
        async with _browser_lock:
            browser = await get_browser_instance()
    except Exception as e:
        results['error'] = f'Browser initialization failed: {e}'
        return results
    
    try:
        for i, slide in enumerate(slides_data):
            slide_result = {
                'slide_number': i + 1,
                'template_id': slide.get('templateId', 'unknown'),
                'status': 'unknown',
                'height': None,
                'error': None
            }
            
            try:
                # Calculate height
                height = await calculate_slide_dimensions(slide, theme, browser)
                slide_result['height'] = height
                
                # Test PDF generation
                temp_path = f"/tmp/test_slide_{i}.pdf"
                success = await generate_single_slide_pdf(slide, theme, height, temp_path, browser)
                
                if success:
                    slide_result['status'] = 'success'
                    results['successful_slides'] += 1
                    
                    # Clean up test file
                    try:
                        os.remove(temp_path)
                    except:
                        pass
                else:
                    slide_result['status'] = 'pdf_generation_failed'
                    results['failed_slides'] += 1
                    
            except Exception as e:
                slide_result['status'] = 'error'
                slide_result['error'] = str(e)
                results['failed_slides'] += 1
            
            results['slide_details'].append(slide_result)
            
            logger.info(f"Tested slide {i + 1}: {slide_result['status']}")
    
    except Exception as e:
        logger.error(f"Error in slide testing: {e}")
        results['error'] = str(e)
    
    return results

# Cleanup function for application shutdown
async def cleanup():
    """Cleanup function to be called on application shutdown"""
    await cleanup_browser()
