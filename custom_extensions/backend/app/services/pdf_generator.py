# custom_extensions/backend/app/services/pdf_generator.py
import pyppeteer
import asyncio
import os
from fastapi import HTTPException
import logging
from pathlib import Path
from jinja2 import Environment, FileSystemLoader, select_autoescape
import random

# Attempt to import settings (as before)
try:
    from app.core.config import settings
except ImportError:
    class DummySettings: CUSTOM_FRONTEND_URL = os.environ.get("CUSTOM_FRONTEND_URL", "http://custom_frontend:3001")
    settings = DummySettings()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PDF_CACHE_DIR = Path("/tmp/pdf_cache")
PDF_CACHE_DIR.mkdir(exist_ok=True)

CHROME_EXEC_PATH = '/usr/bin/chromium'

# --- Setup Jinja2 Environment ---
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
if not os.path.exists(TEMPLATE_DIR):
    TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "templates")

logger.info(f"PDF Template Directory expected at: {TEMPLATE_DIR}")
if not os.path.isdir(TEMPLATE_DIR):
    logger.error(f"Jinja2 TEMPLATE_DIR does not exist: {TEMPLATE_DIR}")
    os.makedirs(TEMPLATE_DIR, exist_ok=True)

jinja_env = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
    autoescape=select_autoescape(['html', 'xml'])
)

def shuffle_filter(seq):
    try:
        result = list(seq)
        random.shuffle(result)
        return result
    except:
        return seq

jinja_env.filters['shuffle'] = shuffle_filter

async def generate_pdf_from_html_template(
    template_name: str,
    context_data: dict,
    output_filename: str,
    use_cache: bool = True,
    landscape: bool = False
) -> str:
    pdf_path_in_cache = PDF_CACHE_DIR / output_filename
    if use_cache and pdf_path_in_cache.exists():
        logger.info(f"PDF CACHE: Serving cached PDF: {pdf_path_in_cache}")
        return str(pdf_path_in_cache)

    browser = None
    page = None
    temp_pdf_path = os.path.join("/tmp", f"temp_html_pdf_{output_filename}")

    logger.info(f"PDF GEN (from HTML template): Rendering template '{template_name}'")
    logger.info(f"PDF GEN: Temp output at {temp_pdf_path}, final cache at {pdf_path_in_cache}")

    try:
        template = jinja_env.get_template(template_name)
        logger.info(f"PDF GEN Context Data Type: {type(context_data)}")
        logger.info(f"PDF GEN Context Data['details'] Type: {type(context_data.get('details'))}")
        if isinstance(context_data.get('details'), dict):
            logger.info(f"PDF GEN Context Data['details']['details'] Type: {type(context_data.get('details', {}).get('details'))}")
            if isinstance(context_data.get('details', {}).get('details'), dict):
                logger.info(f"PDF GEN ContentBlocks Type: {type(context_data.get('details', {}).get('details', {}).get('contentBlocks'))}")
        html_content = template.render(**context_data)
        logger.info("HTML content rendered from template.")
    except Exception as e:
        logger.error(f"Error rendering HTML template '{template_name}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to render PDF template: {e}")

    launch_options = {
        'headless': 'new', 
        'args': [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage', 
            '--disable-gpu', 
            '--no-zygote', 
            '--js-flags=--max-old-space-size=512', 
            '--single-process', 
            '--disable-extensions', 
            '--disable-background-networking', 
            '--disable-default-apps', 
            '--disable-sync', 
            '--disable-translate', 
            '--hide-scrollbars', 
            '--metrics-recording-only', 
            '--mute-audio', 
            '--no-first-run', 
            '--safeBrowse-disable-auto-update',
            '--font-render-hinting=none',
            '--enable-font-antialiasing',
            '--force-color-profile=srgb'
        ], 
        'dumpio': True, 
        'executablePath': CHROME_EXEC_PATH
    }

    try:
        browser = await pyppeteer.launch(**launch_options)
        logger.info(f"Browser launched for HTML content. Version: {await browser.version()}")
        page = await browser.newPage()
        logger.info("New page created for HTML content.")
        
        # Preload emoji fonts to ensure they're available
        await page.evaluateOnNewDocument("""
            // Preload emoji fonts
            const emojiFonts = [
                'Noto Color Emoji',
                'Noto Emoji', 
                'Segoe UI Emoji',
                'Apple Color Emoji',
                'Android Emoji',
                'Twemoji Mozilla',
                'Symbola'
            ];
            
            // Create a test element to force font loading
            const testElement = document.createElement('div');
            testElement.style.fontFamily = emojiFonts.join(', ');
            testElement.style.position = 'absolute';
            testElement.style.visibility = 'hidden';
            testElement.textContent = '🚀📚💡✅❌⚠️';
            document.head.appendChild(testElement);
        """)
        
        # Set viewport to match PDF slide dimensions exactly - CRITICAL FIX
        await page.setViewport({'width': 1174, 'height': 600})  # Start with minimum height
        
        # Set content from string
        await page.setContent(html_content)
        logger.info("HTML content set in Pyppeteer page.")
        
        # Wait for fonts to load and rendering to complete
        await page.waitForFunction("""
            () => {
                return document.fonts && document.fonts.ready && document.fonts.ready.then(() => true);
            }
        """, timeout=10000)
        
        # Additional delay for complex rendering
        await asyncio.sleep(2)

        # *** CRITICAL FIX: Calculate accurate slide heights ***
        slide_heights = await page.evaluate("""
            () => {
                const slidePages = document.querySelectorAll('.slide-page');
                const heights = [];
                
                slidePages.forEach((slidePage, index) => {
                    // Force a reflow to ensure accurate measurements
                    slidePage.offsetHeight;
                    
                    // Get the actual computed height including all content
                    const slideRect = slidePage.getBoundingClientRect();
                    const slideComputedStyle = window.getComputedStyle(slidePage);
                    
                    // Get all child elements to find the true content bounds
                    const slideContent = slidePage.querySelector('.slide-content');
                    if (slideContent) {
                        slideContent.offsetHeight; // Force reflow
                        const contentRect = slideContent.getBoundingClientRect();
                        
                        // Find the actual bottom-most element
                        const allElements = slideContent.querySelectorAll('*');
                        let maxBottom = contentRect.bottom;
                        
                        allElements.forEach(el => {
                            const elRect = el.getBoundingClientRect();
                            if (elRect.bottom > maxBottom) {
                                maxBottom = elRect.bottom;
                            }
                        });
                        
                        // Calculate total height from top of slide to bottom of content
                        const totalHeight = maxBottom - slideRect.top;
                        
                        // Ensure minimum height of 600px and reasonable maximum
                        const finalHeight = Math.max(600, Math.min(Math.ceil(totalHeight), 3000));
                        
                        heights.push({
                            index: index,
                            height: finalHeight,
                            contentHeight: Math.ceil(contentRect.height),
                            maxBottom: Math.ceil(maxBottom - slideRect.top)
                        });
                        
                        console.log(`Slide ${index + 1}: Final height: ${finalHeight}px, Content: ${Math.ceil(contentRect.height)}px, MaxBottom: ${Math.ceil(maxBottom - slideRect.top)}px`);
                    } else {
                        heights.push({
                            index: index,
                            height: 600,
                            contentHeight: 600,
                            maxBottom: 600
                        });
                        console.log(`Slide ${index + 1}: Fallback height: 600px`);
                    }
                });
                
                return heights;
            }
        """)
        
        logger.info(f"Calculated accurate slide heights: {slide_heights}")

        # Validate and sanitize slide heights
        if not slide_heights or not isinstance(slide_heights, list) or len(slide_heights) == 0:
            logger.warning("No valid slide heights calculated, using fallback heights")
            slide_heights = [{'index': i, 'height': 600} for i in range(10)]
        
        # Ensure all heights are valid numbers
        for slide_height in slide_heights:
            if not isinstance(slide_height, dict) or 'height' not in slide_height:
                slide_height['height'] = 600
            elif not isinstance(slide_height['height'], (int, float)) or slide_height['height'] <= 0:
                slide_height['height'] = 600
            else:
                slide_height['height'] = max(600, min(int(slide_height['height']), 3000))

        # *** CRITICAL FIX: Apply individual CSS page sizes ***
        await page.evaluate("""
            (heights) => {
                // Create dynamic CSS for each page with exact dimensions
                let dynamicCSS = '';
                
                heights.forEach((slideHeight, index) => {
                    const height = Math.max(600, Math.min(slideHeight.height, 3000));
                    
                    // Create CSS for this specific page
                    dynamicCSS += `
                        .slide-page:nth-child(${index + 1}) {
                            width: 1174px !important;
                            height: ${height}px !important;
                            min-height: ${height}px !important;
                            max-height: ${height}px !important;
                            page-break-after: always;
                            page-break-inside: avoid;
                            overflow: visible;
                            box-sizing: border-box;
                        }
                        
                        .slide-page:nth-child(${index + 1}) .slide-content {
                            width: 1174px !important;
                            height: ${height}px !important;
                            min-height: ${height}px !important;
                            max-height: ${height}px !important;
                            overflow: visible;
                            box-sizing: border-box;
                        }
                        
                        .slide-page:nth-child(${index + 1}) .slide,
                        .slide-page:nth-child(${index + 1}) .title-slide,
                        .slide-page:nth-child(${index + 1}) .big-image-left,
                        .slide-page:nth-child(${index + 1}) .bullet-points,
                        .slide-page:nth-child(${index + 1}) .process-steps,
                        .slide-page:nth-child(${index + 1}) .challenges-solutions {
                            width: 1174px !important;
                            height: ${height}px !important;
                            min-height: ${height}px !important;
                            max-height: ${height}px !important;
                            box-sizing: border-box;
                        }
                    `;
                    
                    console.log(`Applied CSS for slide ${index + 1}: ${height}px height`);
                });
                
                // Remove last page break
                if (heights.length > 0) {
                    dynamicCSS += `
                        .slide-page:nth-child(${heights.length}) {
                            page-break-after: auto !important;
                        }
                    `;
                }
                
                // Inject the dynamic CSS
                const styleElement = document.createElement('style');
                styleElement.textContent = dynamicCSS;
                document.head.appendChild(styleElement);
                
                console.log('Dynamic CSS applied for individual page sizing');
            }
        """, slide_heights)

        # Force a final reflow to ensure all styles are applied
        await asyncio.sleep(1)
        await page.evaluate("() => { document.body.offsetHeight; }")

        # *** CRITICAL FIX: Generate PDF with proper page sizing ***
        logger.info("Generating PDF with individual page heights...")
         
        # Calculate total document height for debugging
        total_height = await page.evaluate("""
            () => {
                const slidePages = document.querySelectorAll('.slide-page');
                let totalHeight = 0;
                slidePages.forEach(slide => {
                    totalHeight += slide.offsetHeight;
                });
                return totalHeight;
            }
        """)
        
        logger.info(f"Total document height: {total_height}px")
        
        # *** FINAL CRITICAL FIX: Remove width/height parameters to let CSS control everything ***
        await page.pdf({
            'path': temp_pdf_path, 
            'landscape': landscape,
            'printBackground': True,
            'margin': {'top': '0px', 'right': '0px', 'bottom': '0px', 'left': '0px'},
            'preferCSSPageSize': True,  # *** CRITICAL: Enable CSS page sizing ***
            'displayHeaderFooter': False,
            'omitBackground': False
            # *** REMOVED: format, width, height - let CSS @page control everything ***
        })
        
        logger.info(f"PDF generated with dynamic page heights at {temp_pdf_path}")

        if os.path.exists(pdf_path_in_cache): 
            os.remove(pdf_path_in_cache)
        os.rename(temp_pdf_path, pdf_path_in_cache)
        logger.info(f"PDF moved to cache: {pdf_path_in_cache}")
        return str(pdf_path_in_cache)
        
    except Exception as e:
        logger.error(f"Error during PDF generation: {e}", exc_info=True)
        if browser and browser.process and browser.process.returncode is not None:
             logger.error(f"Browser process exited with code: {browser.process.returncode}")
        if os.path.exists(temp_pdf_path):
            try: 
                os.remove(temp_pdf_path)
            except OSError: 
                pass
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)[:200]}")
        
    finally:
        if page and not page.isClosed(): 
            await page.close()
        if browser: 
            await browser.close()
            logger.info("Browser for HTML PDF closed.")