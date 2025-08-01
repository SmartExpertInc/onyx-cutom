# custom_extensions/backend/app/services/pdf_generator_enhanced.py
import pyppeteer
import asyncio
import os
from fastapi import HTTPException
import logging
from pathlib import Path
from jinja2 import Environment, FileSystemLoader, select_autoescape
import random
import tempfile
import uuid
import gc
import time
import json
import traceback
from datetime import datetime

# Attempt to import settings (as before)
try:
    from app.core.config import settings
except ImportError:
    class DummySettings: CUSTOM_FRONTEND_URL = os.environ.get("CUSTOM_FRONTEND_URL", "http://custom_frontend:3001")
    settings = DummySettings()

# Attempt to import PDF merging library
try:
    from PyPDF2 import PdfMerger
    PDF_MERGER_AVAILABLE = True
except ImportError:
    try:
        from pypdf import PdfMerger
        PDF_MERGER_AVAILABLE = True
    except ImportError:
        PDF_MERGER_AVAILABLE = False
        logger.warning("PDF merging library not available. Install PyPDF2 or pypdf for slide deck PDF generation.")

# Enhanced logging configuration
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/tmp/pdf_generation_debug.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Create a separate logger for HTML content debugging
html_logger = logging.getLogger('pdf_html_debug')
html_logger.setLevel(logging.DEBUG)

PDF_CACHE_DIR = Path("/tmp/pdf_cache")
PDF_CACHE_DIR.mkdir(exist_ok=True)

CHROME_EXEC_PATH = '/usr/bin/chromium'

# Configuration constants for PDF generation - OPTIMIZED
PDF_MIN_SLIDE_HEIGHT = 600
PDF_MAX_SLIDE_HEIGHT = 3000
PDF_HEIGHT_SAFETY_MARGIN = 40
PDF_GENERATION_TIMEOUT = 60000  # Increased to 60 seconds
PDF_PAGE_TIMEOUT = 30000  # 30 seconds per page
MAX_CONCURRENT_SLIDES = 3  # Limit concurrent processing
BROWSER_MEMORY_LIMIT = 1024  # MB

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

# Enhanced browser launch options with debugging
def get_browser_launch_options():
    """Get optimized browser launch options for better stability and debugging."""
    logger.info("Configuring browser launch options for enhanced debugging")
    return {
        'headless': 'new',
        'args': [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage', 
            '--disable-gpu', 
            '--no-zygote', 
            f'--js-flags=--max-old-space-size={BROWSER_MEMORY_LIMIT}', 
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
            '--enable-logging',
            '--v=1',
            '--enable-logging=stderr',
            '--log-level=0'
        ],
        'dumpio': True,  # Capture browser console output
        'devtools': False,
        'ignoreHTTPSErrors': True,
        'defaultViewport': None
    }

async def log_slide_data_structure(slide_data: dict, slide_index: int = None, template_id: str = None):
    """Log detailed information about slide data structure."""
    slide_info = f"slide {slide_index}" if slide_index else "slide"
    template_info = f" ({template_id})" if template_id else ""
    
    logger.info(f"=== SLIDE DATA ANALYSIS for {slide_info}{template_info} ===")
    
    # Log basic slide structure
    logger.info(f"Slide data type: {type(slide_data)}")
    logger.info(f"Slide keys: {list(slide_data.keys()) if isinstance(slide_data, dict) else 'Not a dict'}")
    
    if isinstance(slide_data, dict):
        # Log template ID
        template_id = slide_data.get('templateId', 'Unknown')
        logger.info(f"Template ID: {template_id}")
        
        # Log props structure
        props = slide_data.get('props', {})
        logger.info(f"Props type: {type(props)}")
        logger.info(f"Props keys: {list(props.keys()) if isinstance(props, dict) else 'Not a dict'}")
        
        # Log specific properties for bullet points
        if template_id in ['bullet-points', 'bullet-points-right']:
            logger.info("=== BULLET POINTS TEMPLATE ANALYSIS ===")
            
            # Log bullets array
            bullets = props.get('bullets', [])
            logger.info(f"Bullets type: {type(bullets)}")
            logger.info(f"Bullets length: {len(bullets) if hasattr(bullets, '__len__') else 'Not iterable'}")
            
            if hasattr(bullets, '__iter__') and not isinstance(bullets, str):
                for i, bullet in enumerate(bullets):
                    logger.info(f"  Bullet {i}: type={type(bullet)}, value={bullet}")
            else:
                logger.warning(f"Bullets is not iterable: {bullets}")
            
            # Log title and content
            logger.info(f"Title: {props.get('title', 'No title')}")
            logger.info(f"Content: {props.get('content', 'No content')}")
            
            # Log any other relevant properties
            for key, value in props.items():
                if key not in ['bullets', 'title', 'content']:
                    logger.info(f"Additional prop '{key}': type={type(value)}, value={value}")
        
        # Log other template types
        elif template_id == 'pyramid':
            logger.info("=== PYRAMID TEMPLATE ANALYSIS ===")
            items = props.get('items', [])
            logger.info(f"Items type: {type(items)}")
            logger.info(f"Items length: {len(items) if hasattr(items, '__len__') else 'Not iterable'}")
            
            if hasattr(items, '__iter__') and not isinstance(items, str):
                for i, item in enumerate(items):
                    logger.info(f"  Item {i}: type={type(item)}, value={item}")
            else:
                logger.warning(f"Items is not iterable: {items}")
    
    logger.info(f"=== END SLIDE DATA ANALYSIS for {slide_info}{template_info} ===")

async def log_html_content(html_content: str, slide_index: int = None, template_id: str = None):
    """Log HTML content for debugging."""
    slide_info = f"slide {slide_index}" if slide_index else "slide"
    template_info = f" ({template_id})" if template_id else ""
    
    # Log HTML content to file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    html_filename = f"/tmp/html_debug_{timestamp}_{slide_index or 'unknown'}_{template_id or 'unknown'}.html"
    
    try:
        with open(html_filename, 'w', encoding='utf-8') as f:
            f.write(html_content)
        logger.info(f"HTML content saved to: {html_filename}")
    except Exception as e:
        logger.error(f"Failed to save HTML content: {e}")
    
    # Log key parts of HTML for quick reference
    html_logger.info(f"=== HTML CONTENT for {slide_info}{template_info} ===")
    
    # Look for bullet points related content
    if 'bullet-points' in html_content or 'bullet-points-right' in html_content:
        html_logger.info("Found bullet points template in HTML")
        
        # Extract and log bullet points related sections
        lines = html_content.split('\n')
        for i, line in enumerate(lines):
            if any(keyword in line for keyword in ['bullet-points', 'placeholder', 'bullet-item']):
                html_logger.info(f"Line {i+1}: {line.strip()}")
    
    # Log CSS styles related to bullet points
    if 'bullet-points' in html_content:
        css_start = html_content.find('/* Bullet Points Template')
        if css_start != -1:
            css_end = html_content.find('}', css_start) + 1
            bullet_css = html_content[css_start:css_end]
            html_logger.info(f"Bullet points CSS found: {bullet_css}")
    
    html_logger.info(f"=== END HTML CONTENT for {slide_info}{template_info} ===")

async def log_browser_console_output(page, slide_index: int = None, template_id: str = None):
    """Log browser console output for debugging."""
    slide_info = f"slide {slide_index}" if slide_index else "slide"
    template_info = f" ({template_id})" if template_id else ""
    
    try:
        # Get console logs
        logs = await page.evaluate("""
            () => {
                return window.consoleLogs || [];
            }
        """)
        
        if logs:
            logger.info(f"=== BROWSER CONSOLE OUTPUT for {slide_info}{template_info} ===")
            for log in logs:
                logger.info(f"Console: {log}")
            logger.info(f"=== END BROWSER CONSOLE OUTPUT for {slide_info}{template_info} ===")
        else:
            logger.info(f"No console output captured for {slide_info}{template_info}")
            
    except Exception as e:
        logger.error(f"Failed to capture console output: {e}")

async def log_computed_styles(page, slide_index: int = None, template_id: str = None):
    """Log computed styles for key elements."""
    slide_info = f"slide {slide_index}" if slide_index else "slide"
    template_info = f" ({template_id})" if template_id else ""
    
    try:
        styles_info = await page.evaluate("""
            () => {
                const results = {};
                
                // Check for bullet points elements
                const bulletElements = document.querySelectorAll('.bullet-points, .bullet-points-right, .placeholder, .placeholder-container, .bullet-item');
                if (bulletElements.length > 0) {
                    results.bulletElements = [];
                    bulletElements.forEach((el, index) => {
                        const computedStyle = window.getComputedStyle(el);
                        const rect = el.getBoundingClientRect();
                        results.bulletElements.push({
                            index: index,
                            tagName: el.tagName,
                            className: el.className,
                            id: el.id,
                            styles: {
                                width: computedStyle.width,
                                height: computedStyle.height,
                                display: computedStyle.display,
                                position: computedStyle.position,
                                top: computedStyle.top,
                                left: computedStyle.left,
                                margin: computedStyle.margin,
                                padding: computedStyle.padding,
                                backgroundColor: computedStyle.backgroundColor,
                                color: computedStyle.color,
                                fontSize: computedStyle.fontSize,
                                fontFamily: computedStyle.fontFamily,
                                lineHeight: computedStyle.lineHeight,
                                textAlign: computedStyle.textAlign,
                                overflow: computedStyle.overflow,
                                boxSizing: computedStyle.boxSizing
                            },
                            rect: {
                                top: rect.top,
                                left: rect.left,
                                width: rect.width,
                                height: rect.height,
                                bottom: rect.bottom,
                                right: rect.right
                            },
                            textContent: el.textContent ? el.textContent.substring(0, 100) : 'No text'
                        });
                    });
                }
                
                // Check for slide container
                const slideContainer = document.querySelector('.slide-page, .slide-content');
                if (slideContainer) {
                    const computedStyle = window.getComputedStyle(slideContainer);
                    const rect = slideContainer.getBoundingClientRect();
                    results.slideContainer = {
                        tagName: slideContainer.tagName,
                        className: slideContainer.className,
                        styles: {
                            width: computedStyle.width,
                            height: computedStyle.height,
                            minHeight: computedStyle.minHeight,
                            maxHeight: computedStyle.maxHeight,
                            display: computedStyle.display,
                            position: computedStyle.position,
                            overflow: computedStyle.overflow,
                            boxSizing: computedStyle.boxSizing,
                            padding: computedStyle.padding,
                            margin: computedStyle.margin,
                            backgroundColor: computedStyle.backgroundColor
                        },
                        rect: {
                            top: rect.top,
                            left: rect.left,
                            width: rect.width,
                            height: rect.height,
                            bottom: rect.bottom,
                            right: rect.right
                        }
                    };
                }
                
                // Check for any CSS custom properties
                const root = document.documentElement;
                const computedRootStyle = window.getComputedStyle(root);
                results.cssVariables = {
                    '--bg-color': computedRootStyle.getPropertyValue('--bg-color'),
                    '--title-color': computedRootStyle.getPropertyValue('--title-color'),
                    '--content-color': computedRootStyle.getPropertyValue('--content-color'),
                    '--accent-color': computedRootStyle.getPropertyValue('--accent-color')
                };
                
                return results;
            }
        """)
        
        logger.info(f"=== COMPUTED STYLES for {slide_info}{template_info} ===")
        logger.info(f"Styles info: {json.dumps(styles_info, indent=2)}")
        logger.info(f"=== END COMPUTED STYLES for {slide_info}{template_info} ===")
        
    except Exception as e:
        logger.error(f"Failed to capture computed styles: {e}")

async def log_page_lifecycle_events(page, slide_index: int = None, template_id: str = None):
    """Log page lifecycle events."""
    slide_info = f"slide {slide_index}" if slide_index else "slide"
    template_info = f" ({template_id})" if template_id else ""
    
    try:
        # Set up event listeners
        await page.evaluate("""
            () => {
                window.pageEvents = [];
                
                const events = ['DOMContentLoaded', 'load', 'beforeunload', 'unload'];
                events.forEach(eventType => {
                    window.addEventListener(eventType, (e) => {
                        window.pageEvents.push({
                            type: eventType,
                            timestamp: Date.now(),
                            detail: e.type
                        });
                    });
                });
                
                // Monitor font loading
                if (document.fonts) {
                    document.fonts.ready.then(() => {
                        window.pageEvents.push({
                            type: 'fontsReady',
                            timestamp: Date.now(),
                            detail: 'All fonts loaded'
                        });
                    });
                }
                
                // Monitor CSS loading
                const styleSheets = document.styleSheets;
                for (let i = 0; i < styleSheets.length; i++) {
                    try {
                        const rules = styleSheets[i].cssRules || styleSheets[i].rules;
                        if (rules) {
                            window.pageEvents.push({
                                type: 'stylesheetLoaded',
                                timestamp: Date.now(),
                                detail: `Stylesheet ${i} loaded with ${rules.length} rules`
                            });
                        }
                    } catch (e) {
                        window.pageEvents.push({
                            type: 'stylesheetError',
                            timestamp: Date.now(),
                            detail: `Stylesheet ${i} error: ${e.message}`
                        });
                    }
                }
            }
        """)
        
        # Wait a bit for events to occur
        await asyncio.sleep(2)
        
        # Get events
        events = await page.evaluate("() => window.pageEvents || []")
        
        if events:
            logger.info(f"=== PAGE LIFECYCLE EVENTS for {slide_info}{template_info} ===")
            for event in events:
                logger.info(f"Event: {event}")
            logger.info(f"=== END PAGE LIFECYCLE EVENTS for {slide_info}{template_info} ===")
        else:
            logger.info(f"No page lifecycle events captured for {slide_info}{template_info}")
            
    except Exception as e:
        logger.error(f"Failed to capture page lifecycle events: {e}")

async def generate_pdf_from_html_template_enhanced(
    template_name: str,
    context_data: dict,
    output_filename: str,
    use_cache: bool = True,
    landscape: bool = False
) -> str:
    """Enhanced version with extensive logging."""
    
    logger.info(f"=== STARTING ENHANCED PDF GENERATION ===")
    logger.info(f"Template: {template_name}")
    logger.info(f"Output filename: {output_filename}")
    logger.info(f"Landscape: {landscape}")
    logger.info(f"Context data keys: {list(context_data.keys()) if isinstance(context_data, dict) else 'Not a dict'}")
    
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
        # Log template rendering process
        logger.info("=== TEMPLATE RENDERING PHASE ===")
        template = jinja_env.get_template(template_name)
        logger.info(f"Template loaded successfully: {template_name}")
        
        logger.info(f"PDF GEN Context Data Type: {type(context_data)}")
        logger.info(f"PDF GEN Context Data['details'] Type: {type(context_data.get('details'))}")
        if isinstance(context_data.get('details'), dict):
            logger.info(f"PDF GEN Context Data['details']['details'] Type: {type(context_data.get('details', {}).get('details'))}")
            if isinstance(context_data.get('details', {}).get('details'), dict):
                logger.info(f"PDF GEN ContentBlocks Type: {type(context_data.get('details', {}).get('details', {}).get('contentBlocks'))}")
        
        html_content = template.render(**context_data)
        logger.info("HTML content rendered from template successfully.")
        
        # Log HTML content for debugging
        await log_html_content(html_content)
        
    except Exception as e:
        logger.error(f"Error rendering HTML template '{template_name}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to render PDF template: {e}")

    try:
        # Log browser launch process
        logger.info("=== BROWSER LAUNCH PHASE ===")
        browser = await pyppeteer.launch(**get_browser_launch_options())
        logger.info(f"Browser launched successfully. Version: {await browser.version()}")
        
        page = await browser.newPage()
        logger.info("New page created successfully.")
        
        # Set up console logging
        await page.evaluate("""
            () => {
                window.consoleLogs = [];
                const originalLog = console.log;
                const originalWarn = console.warn;
                const originalError = console.error;
                
                console.log = (...args) => {
                    window.consoleLogs.push({type: 'log', args: args.map(arg => String(arg))});
                    originalLog.apply(console, args);
                };
                
                console.warn = (...args) => {
                    window.consoleLogs.push({type: 'warn', args: args.map(arg => String(arg))});
                    originalWarn.apply(console, args);
                };
                
                console.error = (...args) => {
                    window.consoleLogs.push({type: 'error', args: args.map(arg => String(arg))});
                    originalError.apply(console, args);
                };
            }
        """)
        
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
        logger.info("Viewport set to 1174x600")
        
        # Set content from string
        logger.info("=== CONTENT SETTING PHASE ===")
        await page.setContent(html_content)
        logger.info("HTML content set in Pyppeteer page successfully.")
        
        # Log page lifecycle events
        await log_page_lifecycle_events(page)
        
        # Wait for fonts to load and rendering to complete
        logger.info("Waiting for fonts to load...")
        await page.waitForFunction("""
            () => {
                return document.fonts && document.fonts.ready && document.fonts.ready.then(() => true);
            }
        """, timeout=10000)
        
        # Additional delay for complex rendering
        await asyncio.sleep(2)
        logger.info("Rendering delay completed")

        # Log computed styles before height calculation
        await log_computed_styles(page)

        # *** CRITICAL FIX: Calculate accurate slide heights ***
        logger.info("=== HEIGHT CALCULATION PHASE ===")
        slide_heights = await page.evaluate("""
            () => {
                const slidePages = document.querySelectorAll('.slide-page');
                const heights = [];
                
                console.log(`Found ${slidePages.length} slide pages`);
                
                slidePages.forEach((slidePage, index) => {
                    // Force a reflow to ensure accurate measurements
                    slidePage.offsetHeight;
                    
                    // Get the actual computed height including all content
                    const slideRect = slidePage.getBoundingClientRect();
                    const slideComputedStyle = window.getComputedStyle(slidePage);
                    
                    console.log(`Slide ${index + 1} computed style:`, {
                        width: slideComputedStyle.width,
                        height: slideComputedStyle.height,
                        minHeight: slideComputedStyle.minHeight,
                        maxHeight: slideComputedStyle.maxHeight
                    });
                    
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
        logger.info("=== CSS APPLICATION PHASE ===")
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
        logger.info("Final reflow completed")

        # Log computed styles after CSS application
        await log_computed_styles(page)

        # *** CRITICAL FIX: Generate PDF with proper page sizing ***
        logger.info("=== PDF GENERATION PHASE ===")
         
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
        
        # Log browser console output before PDF generation
        await log_browser_console_output(page)
        
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
        
        logger.info("=== ENHANCED PDF GENERATION COMPLETED SUCCESSFULLY ===")
        return str(pdf_path_in_cache)
        
    except Exception as e:
        logger.error(f"Error during enhanced PDF generation: {e}", exc_info=True)
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

async def generate_single_slide_pdf_enhanced(slide_data: dict, theme: str, slide_height: int, output_path: str, browser=None, slide_index: int = None, template_id: str = None) -> bool:
    """Enhanced version of single slide PDF generation with extensive logging."""
    
    logger.info(f"=== STARTING ENHANCED SINGLE SLIDE PDF GENERATION ===")
    
    # Log slide data structure
    await log_slide_data_structure(slide_data, slide_index, template_id)
    
    should_close_browser = browser is None
    page = None
    
    # Get slide info for logging
    slide_info = f"slide {slide_index}" if slide_index else "slide"
    template_info = f" ({template_id})" if template_id else ""
    
    try:
        logger.info(f"Starting PDF generation for {slide_info}{template_info} (height: {slide_height}px)")
        
        if browser is None:
            logger.info("Launching new browser instance")
            browser = await pyppeteer.launch(**get_browser_launch_options())
        
        page = await browser.newPage()
        logger.info("New page created")
        
        # Set up console logging
        await page.evaluate("""
            () => {
                window.consoleLogs = [];
                const originalLog = console.log;
                const originalWarn = console.warn;
                const originalError = console.error;
                
                console.log = (...args) => {
                    window.consoleLogs.push({type: 'log', args: args.map(arg => String(arg))});
                    originalLog.apply(console, args);
                };
                
                console.warn = (...args) => {
                    window.consoleLogs.push({type: 'warn', args: args.map(arg => String(arg))});
                    originalWarn.apply(console, args);
                };
                
                console.error = (...args) => {
                    window.consoleLogs.push({type: 'error', args: args.map(arg => String(arg))});
                    originalError.apply(console, args);
                };
            }
        """)
        
        # Set viewport to match slide dimensions exactly
        await page.setViewport({'width': 1174, 'height': slide_height})
        logger.info(f"Viewport set to 1174x{slide_height}")
        
        # Create context for single slide with calculated height
        # Add safety checks for slide data
        safe_slide_data = slide_data.copy() if slide_data else {}
        if 'props' not in safe_slide_data or not safe_slide_data['props']:
            safe_slide_data['props'] = {}
        
        # Ensure all required properties exist with safe defaults
        default_props = {
            'title': 'Untitled Slide',
            'subtitle': '',
            'content': '',
            'bullets': [],
            'steps': [],
            'challenges': [],
            'solutions': [],
            'items': [],
            'boxes': [],
            'levels': [],
            'events': []
        }
        
        # Merge existing props with defaults, preserving existing data
        for key, default_value in default_props.items():
            if key not in safe_slide_data['props']:
                safe_slide_data['props'][key] = default_value
        
        # Special safety check for 'items' property to prevent it from being overwritten with dict.items()
        if 'items' in safe_slide_data['props']:
            items_value = safe_slide_data['props']['items']
            if callable(items_value):
                logger.warning(f"WARNING: 'items' property is callable (type: {type(items_value)}), replacing with empty list")
                safe_slide_data['props']['items'] = []
            elif not hasattr(items_value, '__iter__') or isinstance(items_value, str):
                logger.warning(f"WARNING: 'items' property is not iterable (type: {type(items_value)}), replacing with empty list")
                safe_slide_data['props']['items'] = []
        
        context_data = {
            'slide': safe_slide_data,
            'theme': theme,
            'slide_height': slide_height
        }
        
        # Render the single slide template
        try:
            # Debug logging to see the data structure
            logger.info(f"DEBUG: Template data for {slide_info}{template_info}: slide.props.items type = {type(safe_slide_data.get('props', {}).get('items'))}")
            if safe_slide_data.get('props', {}).get('items'):
                logger.info(f"DEBUG: slide.props.items content = {safe_slide_data['props']['items']}")
            
            template = jinja_env.get_template("single_slide_pdf_template.html")
            html_content = template.render(**context_data)
            logger.info("Template rendered successfully")
            
            # Log HTML content for debugging
            await log_html_content(html_content, slide_index, template_id)
            
        except Exception as template_error:
            logger.error(f"Template rendering error for {slide_info}{template_info}: {template_error}", exc_info=True)
            # Fallback to a simple template
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head><style>
                body {{ margin: 0; padding: 40px; font-family: Arial, sans-serif; background: #f0f0f0; }}
                .slide-page {{ width: 1174px; height: {slide_height}px; background: white; padding: 40px; border-radius: 8px; }}
                .slide-content {{ display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; }}
                .slide-title {{ font-size: 32px; font-weight: bold; margin-bottom: 20px; }}
                .content {{ font-size: 18px; }}
            </style></head>
            <body>
                <div class="slide-page">
                    <div class="slide-content">
                        <div class="slide-title">{safe_slide_data.get('props', {}).get('title', 'Untitled Slide')}</div>
                        <div class="content">Slide content could not be rendered properly.</div>
                    </div>
                </div>
            </body>
            </html>
            """
        
        # Set content and wait for rendering
        logger.info("Setting HTML content in page")
        await page.setContent(html_content)
        
        logger.info("Waiting for fonts to load")
        await page.waitForFunction("""
            () => {
                return document.fonts && document.fonts.ready && document.fonts.ready.then(() => true);
            }
        """, timeout=PDF_PAGE_TIMEOUT)
        
        # Additional delay for complex rendering
        await asyncio.sleep(1)
        logger.info("Rendering delay completed")
        
        # Log page lifecycle events
        await log_page_lifecycle_events(page, slide_index, template_id)
        
        # Log computed styles
        await log_computed_styles(page, slide_index, template_id)
        
        # Log browser console output
        await log_browser_console_output(page, slide_index, template_id)
        
        # Generate PDF
        logger.info("Generating PDF")
        await page.pdf({
            'path': output_path,
            'width': '1174px',
            'height': f'{slide_height}px',
            'printBackground': True,
            'margin': {'top': '0px', 'right': '0px', 'bottom': '0px', 'left': '0px'},
            'displayHeaderFooter': False,
            'omitBackground': False
        })
        
        logger.info(f"PDF generated successfully at {output_path}")
        
        # Verify file was created
        if os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            logger.info(f"PDF file created successfully. Size: {file_size} bytes")
            return True
        else:
            logger.error(f"PDF file was not created at {output_path}")
            return False
        
    except Exception as e:
        logger.error(f"Error during enhanced single slide PDF generation for {slide_info}{template_info}: {e}", exc_info=True)
        return False
        
    finally:
        if page and not page.isClosed():
            await page.close()
        if should_close_browser and browser:
            await browser.close()
            logger.info("Browser closed")

# Export the enhanced functions
__all__ = [
    'generate_pdf_from_html_template_enhanced',
    'generate_single_slide_pdf_enhanced',
    'log_slide_data_structure',
    'log_html_content',
    'log_browser_console_output',
    'log_computed_styles',
    'log_page_lifecycle_events'
] 