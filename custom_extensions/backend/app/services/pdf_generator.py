# custom_extensions/backend/app/services/pdf_generator.py
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
from datetime import datetime
import base64
import mimetypes
import math
from typing import AsyncGenerator

# Import pie chart generators
try:
    from .pie_chart_generator import pie_chart_generator
except ImportError:
    pie_chart_generator = None
    logger.warning("Pie chart generator not available")

# Import CSS pie chart generator
try:
    from ..utils.pie_chart_css_generator import generate_css_pie_chart
except ImportError:
    generate_css_pie_chart = None
    logger.warning("CSS pie chart generator not available")
import functools
import re

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

# Enhanced logging configuration for debugging
# Note: Using getLogger instead of basicConfig to avoid conflicts with main.py
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Create a separate logger for HTML content debugging
html_logger = logging.getLogger('pdf_html_debug')
html_logger.setLevel(logging.INFO)

# Create a separate logger for image fit debugging
image_fit_logger = logging.getLogger('pdf_image_fit_debug')
image_fit_logger.setLevel(logging.INFO)

PDF_CACHE_DIR = Path("/tmp/pdf_cache")
PDF_CACHE_DIR.mkdir(exist_ok=True)

CHROME_EXEC_PATH = '/usr/bin/chromium'

# Configuration constants for PDF generation - PERFORMANCE OPTIMIZED
PDF_MIN_SLIDE_HEIGHT = 600
PDF_MAX_SLIDE_HEIGHT = 3000
PDF_HEIGHT_SAFETY_MARGIN = 40
PDF_GENERATION_TIMEOUT = 30000  # Reduced from 60s to 30s
PDF_PAGE_TIMEOUT = 10000  # Reduced from 30s to 10s per page
MAX_CONCURRENT_SLIDES = 4  # Increased from 2 to 4 for better parallelization
BROWSER_MEMORY_LIMIT = 512  # Reduced from 1024 to 512 MB

# Dynamic parallelization based on system resources
import multiprocessing
import psutil

def get_optimal_concurrent_slides():
    """Determine optimal number of concurrent slides based on system resources"""
    try:
        # Get CPU count and available memory
        cpu_count = multiprocessing.cpu_count()
        memory_gb = psutil.virtual_memory().total / (1024**3)
        
        # Base calculation on CPU cores and available memory
        # Each browser instance uses ~100-200MB RAM
        max_by_cpu = cpu_count * 2  # 2 slides per CPU core
        max_by_memory = int(memory_gb * 2)  # 2 slides per GB of RAM
        
        # Take the minimum to avoid overwhelming the system
        optimal = min(max_by_cpu, max_by_memory, MAX_CONCURRENT_SLIDES)
        
        # Ensure minimum of 2 and maximum of 8
        optimal = max(2, min(optimal, 8))
        
        logger.info(f"System resources: {cpu_count} CPUs, {memory_gb:.1f}GB RAM")
        logger.info(f"Optimal concurrent slides: {optimal}")
        
        return optimal
    except Exception as e:
        logger.warning(f"Could not determine optimal concurrent slides: {e}, using default: {MAX_CONCURRENT_SLIDES}")
        return MAX_CONCURRENT_SLIDES

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

# Add math functions for pie chart calculations
jinja_env.filters['cos'] = lambda x: math.cos(float(x))
jinja_env.filters['sin'] = lambda x: math.sin(float(x))

# Font embedding functions for PDF generation
def get_font_as_base64(font_filename: str) -> str:
    """Convert a font file to base64 data URL for PDF embedding."""
    try:
        # Calculate the correct path to fonts from pdf_generator.py location
        current_dir = os.path.dirname(__file__)  # app/services/
        root_dir = os.path.dirname(os.path.dirname(current_dir))  # Go up 2 levels to root
        fonts_dir = os.path.join(root_dir, 'static', 'fonts')
        font_path = os.path.join(fonts_dir, font_filename)
        
        logger.info(f"🔤 Loading font: {font_path}")
        
        if os.path.exists(font_path):
            with open(font_path, 'rb') as font_file:
                font_data = font_file.read()
                # Only create base64 if file is reasonable size (< 1MB)
                if len(font_data) > 1024 * 1024:
                    logger.warning(f"Font file {font_filename} is large ({len(font_data)} bytes), this may impact PDF generation performance")
                
                font_base64 = base64.b64encode(font_data).decode('utf-8')
                data_url = f"data:font/truetype;base64,{font_base64}"
                logger.info(f"✅ Font {font_filename} embedded successfully ({len(font_data)} bytes → {len(data_url)} chars)")
                return data_url
        else:
            logger.warning(f"❌ Font file not found: {font_path}")
            # Try to list available fonts for debugging
            if os.path.exists(fonts_dir):
                available_fonts = [f for f in os.listdir(fonts_dir) if f.endswith('.ttf')]
                logger.info(f"Available fonts in {fonts_dir}: {available_fonts}")
            return ""
    except Exception as e:
        logger.error(f"❌ Failed to load font {font_filename}: {e}", exc_info=True)
        return ""

def get_embedded_fonts_css() -> str:
    """Generate CSS with embedded fonts for PDF rendering."""
    logger.info("🎨 Generating embedded fonts CSS for PDF rendering...")
    
    mont_regular_data = get_font_as_base64('fonnts.com-Mont_Regular.ttf')
    mont_bold_data = get_font_as_base64('fonnts.com-Mont_Bold.ttf')
    
    css = ""
    
    if mont_regular_data:
        css += f"""
        @font-face {{
          font-family: 'Mont Regular';
          src: url('{mont_regular_data}') format('truetype');
          font-weight: 400;
          font-style: normal;
          font-display: block;
        }}
        """
    else:
        # Fallback CSS if font embedding fails
        css += """
        @font-face {
          font-family: 'Mont Regular';
          src: local('Arial'), local('Helvetica');
          font-weight: 400;
          font-style: normal;
          font-display: block;
        }
        """
        logger.warning("Using fallback font for Mont Regular")
    
    if mont_bold_data:
        css += f"""
        @font-face {{
          font-family: 'Mont Bold';
          src: url('{mont_bold_data}') format('truetype');
          font-weight: 700;
          font-style: normal;
          font-display: block;
        }}
        """
    else:
        # Fallback CSS if font embedding fails
        css += """
        @font-face {
          font-family: 'Mont Bold';
          src: local('Arial Bold'), local('Helvetica Bold');
          font-weight: 700;
          font-style: normal;
          font-display: block;
        }
        """
        logger.warning("Using fallback font for Mont Bold")
    
    logger.info(f"✅ Embedded fonts CSS generated successfully ({len(css)} characters total)")
    return css

# Timeout wrapper to prevent 504 Gateway Timeout errors
def timeout_wrapper(timeout_seconds: int):
    """Decorator to add timeout to async functions to prevent 504 errors."""
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                return await asyncio.wait_for(func(*args, **kwargs), timeout=timeout_seconds)
            except asyncio.TimeoutError:
                logger.error(f"Function {func.__name__} timed out after {timeout_seconds} seconds")
                raise HTTPException(
                    status_code=408, 
                    detail=f"PDF generation timed out after {timeout_seconds} seconds. Please try with fewer slides or simpler content."
                )
        return wrapper
    return decorator

# Enhanced logging functions for debugging
async def log_slide_data_structure(slide_data: dict, slide_index: int = None, template_id: str = None):
    """Log detailed slide data structure for debugging."""
    slide_info = f"slide {slide_index}" if slide_index else "slide"
    template_info = f" ({template_id})" if template_id else ""
    
    logger.info(f"=== COMPREHENSIVE SLIDE DATA ANALYSIS for {slide_info}{template_info} ===")
    
    # Log basic slide structure
    logger.info(f"PDF GEN: Slide data type: {type(slide_data)}")
    logger.info(f"PDF GEN: Slide keys: {list(slide_data.keys()) if isinstance(slide_data, dict) else 'Not a dict'}")
    
    if isinstance(slide_data, dict):
        # Log template ID
        template_id = slide_data.get('templateId', 'Unknown')
        logger.info(f"PDF GEN: Template ID: {template_id}")
        
        # Log slide ID
        slide_id = slide_data.get('slideId', 'Unknown')
        logger.info(f"PDF GEN: Slide ID: {slide_id}")
        
        # Log metadata
        metadata = slide_data.get('metadata', {})
        logger.info(f"PDF GEN: Metadata keys: {list(metadata.keys()) if isinstance(metadata, dict) else 'No metadata'}")
        
        # Log element positions if available
        if 'elementPositions' in metadata:
            element_positions = metadata['elementPositions']
            logger.info(f"PDF GEN: Element positions found: {len(element_positions)} elements")
            for element_id, position in element_positions.items():
                logger.info(f"PDF GEN:   Element '{element_id}': x={position.get('x', 'N/A')}, y={position.get('y', 'N/A')}")
        
        # Log props structure
        props = slide_data.get('props', {})
        logger.info(f"PDF GEN: Props type: {type(props)}")
        logger.info(f"PDF GEN: Props keys: {list(props.keys()) if isinstance(props, dict) else 'Not a dict'}")
        
        # === IMAGE PLACEHOLDER PROPERTIES ANALYSIS ===
        logger.info(f"PDF GEN: === IMAGE PLACEHOLDER PROPERTIES ANALYSIS ===")
        
        # Check for image path properties
        image_path_props = ['imagePath', 'leftImagePath', 'rightImagePath']
        for prop_name in image_path_props:
            if prop_name in props:
                image_path = props[prop_name]
                logger.info(f"PDF GEN: {prop_name}: {image_path}")
                logger.info(f"PDF GEN:   Type: {type(image_path)}")
                logger.info(f"PDF GEN:   Is data URL: {str(image_path).startswith('data:') if image_path else False}")
            else:
                logger.info(f"PDF GEN: {prop_name}: NOT PRESENT")
        
        # Check for image sizing properties
        size_props = ['widthPx', 'heightPx', 'leftWidthPx', 'leftHeightPx', 'rightWidthPx', 'rightHeightPx']
        for prop_name in size_props:
            if prop_name in props:
                size_value = props[prop_name]
                logger.info(f"PDF GEN: {prop_name}: {size_value}")
                logger.info(f"PDF GEN:   Type: {type(size_value)}")
                logger.info(f"PDF GEN:   Is number: {isinstance(size_value, (int, float))}")
            else:
                logger.info(f"PDF GEN: {prop_name}: NOT PRESENT")
        
        # Check for object fit properties
        fit_props = ['objectFit', 'leftObjectFit', 'rightObjectFit']
        for prop_name in fit_props:
            if prop_name in props:
                fit_value = props[prop_name]
                logger.info(f"PDF GEN: {prop_name}: {fit_value}")
                logger.info(f"PDF GEN:   Type: {type(fit_value)}")
                logger.info(f"PDF GEN:   Valid values: cover, contain, fill")
            else:
                logger.info(f"PDF GEN: {prop_name}: NOT PRESENT")
        
        # Check for transform properties
        transform_props = ['imageScale', 'imageOffset', 'leftImageScale', 'leftImageOffset', 'rightImageScale', 'rightImageOffset']
        for prop_name in transform_props:
            if prop_name in props:
                transform_value = props[prop_name]
                logger.info(f"PDF GEN: {prop_name}: {transform_value}")
                logger.info(f"PDF GEN:   Type: {type(transform_value)}")
                if prop_name.endswith('Scale'):
                    logger.info(f"PDF GEN:   Is number: {isinstance(transform_value, (int, float))}")
                elif prop_name.endswith('Offset'):
                    if isinstance(transform_value, dict):
                        logger.info(f"PDF GEN:   Offset keys: {list(transform_value.keys())}")
                        logger.info(f"PDF GEN:   X: {transform_value.get('x', 'N/A')}")
                        logger.info(f"PDF GEN:   Y: {transform_value.get('y', 'N/A')}")
            else:
                logger.info(f"PDF GEN: {prop_name}: NOT PRESENT")
        
        # Check for image prompt properties
        prompt_props = ['imagePrompt', 'imageAlt', 'leftImagePrompt', 'leftImageAlt', 'rightImagePrompt', 'rightImageAlt']
        for prop_name in prompt_props:
            if prop_name in props:
                prompt_value = props[prop_name]
                logger.info(f"PDF GEN: {prop_name}: {prompt_value}")
                logger.info(f"PDF GEN:   Type: {type(prompt_value)}")
            else:
                logger.info(f"PDF GEN: {prop_name}: NOT PRESENT")
        
        # === TEMPLATE-SPECIFIC ANALYSIS ===
        logger.info(f"PDF GEN: === TEMPLATE-SPECIFIC ANALYSIS ===")
        
        if template_id == 'big-image-left':
            logger.info(f"PDF GEN: Big Image Left Template Analysis:")
            logger.info(f"PDF GEN:   Title: {props.get('title', 'No title')}")
            logger.info(f"PDF GEN:   Subtitle: {props.get('subtitle', 'No subtitle')}")
            logger.info(f"PDF GEN:   Image Path: {props.get('imagePath', 'No image')}")
            logger.info(f"PDF GEN:   Width: {props.get('widthPx', 'Default')}px")
            logger.info(f"PDF GEN:   Height: {props.get('heightPx', 'Default')}px")
            logger.info(f"PDF GEN:   Object Fit: {props.get('objectFit', 'Default cover')}")
            logger.info(f"PDF GEN:   Image Scale: {props.get('imageScale', 'Default 1.0')}")
            logger.info(f"PDF GEN:   Image Offset: {props.get('imageOffset', 'Default {x:0, y:0}')}")
            
        elif template_id == 'big-image-top':
            logger.info(f"PDF GEN: Big Image Top Template Analysis:")
            logger.info(f"PDF GEN:   Title: {props.get('title', 'No title')}")
            logger.info(f"PDF GEN:   Subtitle: {props.get('subtitle', 'No subtitle')}")
            logger.info(f"PDF GEN:   Image Path: {props.get('imagePath', 'No image')}")
            logger.info(f"PDF GEN:   Width: {props.get('widthPx', 'Default 100%')}")
            logger.info(f"PDF GEN:   Height: {props.get('heightPx', 'Default 240px')}")
            logger.info(f"PDF GEN:   Object Fit: {props.get('objectFit', 'Default cover')}")
            logger.info(f"PDF GEN:   Image Scale: {props.get('imageScale', 'Default 1.0')}")
            logger.info(f"PDF GEN:   Image Offset: {props.get('imageOffset', 'Default {x:0, y:0}')}")
            
        elif template_id == 'bullet-points':
            logger.info(f"PDF GEN: Bullet Points Template Analysis:")
            logger.info(f"PDF GEN:   Title: {props.get('title', 'No title')}")
            logger.info(f"PDF GEN:   Image Path: {props.get('imagePath', 'No image')}")
            logger.info(f"PDF GEN:   Width: {props.get('widthPx', 'Default 50%')}")
            logger.info(f"PDF GEN:   Height: {props.get('heightPx', 'Default 50%')}")
            logger.info(f"PDF GEN:   Object Fit: {props.get('objectFit', 'Default cover')}")
            logger.info(f"PDF GEN:   Image Scale: {props.get('imageScale', 'Default 1.0')}")
            logger.info(f"PDF GEN:   Image Offset: {props.get('imageOffset', 'Default {x:0, y:0}')}")
            
            # Log bullets array
            bullets = props.get('bullets', [])
            logger.info(f"PDF GEN:   Bullets type: {type(bullets)}")
            logger.info(f"PDF GEN:   Bullets length: {len(bullets) if hasattr(bullets, '__len__') else 'Not iterable'}")
            
            if hasattr(bullets, '__iter__') and not isinstance(bullets, str):
                for i, bullet in enumerate(bullets):
                    logger.info(f"PDF GEN:     Bullet {i}: {bullet}")
            else:
                logger.warning(f"PDF GEN:   Bullets is not iterable: {bullets}")
                
        elif template_id == 'bullet-points-right':
            logger.info(f"PDF GEN: Bullet Points Right Template Analysis:")
            logger.info(f"PDF GEN:   Title: {props.get('title', 'No title')}")
            logger.info(f"PDF GEN:   Subtitle: {props.get('subtitle', 'No subtitle')}")
            logger.info(f"PDF GEN:   Image Path: {props.get('imagePath', 'No image')}")
            logger.info(f"PDF GEN:   Width: {props.get('widthPx', 'Default 320px')}")
            logger.info(f"PDF GEN:   Height: {props.get('heightPx', 'Default 320px')}")
            logger.info(f"PDF GEN:   Object Fit: {props.get('objectFit', 'Default cover')}")
            logger.info(f"PDF GEN:   Image Scale: {props.get('imageScale', 'Default 1.0')}")
            logger.info(f"PDF GEN:   Image Offset: {props.get('imageOffset', 'Default {x:0, y:0}')}")
            
            # Log bullets array
            bullets = props.get('bullets', [])
            logger.info(f"PDF GEN:   Bullets type: {type(bullets)}")
            logger.info(f"PDF GEN:   Bullets length: {len(bullets) if hasattr(bullets, '__len__') else 'Not iterable'}")
            
            if hasattr(bullets, '__iter__') and not isinstance(bullets, str):
                for i, bullet in enumerate(bullets):
                    logger.info(f"PDF GEN:     Bullet {i}: {bullet}")
            else:
                logger.warning(f"PDF GEN:   Bullets is not iterable: {bullets}")
        
        # Log all other properties
        logger.info(f"PDF GEN: === ALL OTHER PROPERTIES ===")
        for key, value in props.items():
            if key not in image_path_props + size_props + fit_props + transform_props + prompt_props + ['title', 'subtitle', 'bullets']:
                logger.info(f"PDF GEN: Additional prop '{key}': type={type(value)}, value={value}")
        
        # Log specific properties for big image templates
        if template_id in ['big-image-left', 'big-image-top']:
            logger.info("=== BIG IMAGE TEMPLATE ANALYSIS ===")
            
            # Log image-related properties
            image_props = ['imagePath', 'imageUrl', 'imageAlt', 'imagePrompt']
            size_props = ['widthPx', 'heightPx', 'objectFit', 'imageScale', 'imageOffset']
            
            for prop_name in image_props:
                value = props.get(prop_name)
                logger.info(f"Image prop '{prop_name}': type={type(value)}, value={value}")
            
            for prop_name in size_props:
                value = props.get(prop_name)
                logger.info(f"Size prop '{prop_name}': type={type(value)}, value={value}")
            
            # Log title and subtitle
            logger.info(f"Title: {props.get('title', 'No title')}")
            logger.info(f"Subtitle: {props.get('subtitle', 'No subtitle')}")
    
    logger.info(f"PDF GEN: === END COMPREHENSIVE SLIDE DATA ANALYSIS for {slide_info}{template_info} ===")

async def log_image_fit_properties(slide_data: dict, slide_index: int = None, template_id: str = None):
    """Log image fit properties specifically for debugging fit styles in PDF."""
    slide_info = f"slide {slide_index}" if slide_index else "slide"
    template_info = f" ({template_id})" if template_id else ""
    
    image_fit_logger.info(f"=== IMAGE FIT ANALYSIS for {slide_info}{template_info} ===")
    
    if isinstance(slide_data, dict):
        template_id = slide_data.get('templateId', 'Unknown')
        props = slide_data.get('props', {})
        
        # Check if this is a template with images
        if template_id in ['big-image-left', 'big-image-top', 'bullet-points', 'bullet-points-right']:
            image_fit_logger.info(f"Template: {template_id}")
            
            # Log image path without base64 data
            image_path = props.get('imagePath')
            if image_path:
                if image_path.startswith('data:'):
                    image_fit_logger.info(f"Image path: [BASE64 DATA URL - {len(image_path)} characters]")
                else:
                    image_fit_logger.info(f"Image path: {image_path}")
            else:
                image_fit_logger.info(f"Image path: NOT SET")
            
            # Log size and fit properties
            width_px = props.get('widthPx')
            height_px = props.get('heightPx')
            object_fit = props.get('objectFit')
            image_scale = props.get('imageScale')
            image_offset = props.get('imageOffset')
            
            image_fit_logger.info(f"Width: {width_px}px")
            image_fit_logger.info(f"Height: {height_px}px")
            image_fit_logger.info(f"Object fit: {object_fit}")
            image_fit_logger.info(f"Image scale: {image_scale}")
            image_fit_logger.info(f"Image offset: {image_offset}")
            
            # Check if objectFit is missing
            if object_fit is None:
                image_fit_logger.warning(f"⚠️ OBJECT FIT IS MISSING for {slide_info}{template_info}")
                image_fit_logger.warning(f"⚠️ This will cause PDF to use default 'cover' instead of user-selected fit style")
            else:
                image_fit_logger.info(f"✅ Object fit is present: {object_fit}")
            
            # Log what the PDF template will receive
            pdf_object_fit = object_fit if object_fit else 'cover'
            image_fit_logger.info(f"PDF template will use object-fit: {pdf_object_fit}")
            
        elif template_id == 'two-column':
            image_fit_logger.info(f"Template: {template_id}")
            
            # Log left image properties without base64
            left_image_path = props.get('leftImagePath')
            left_object_fit = props.get('leftObjectFit')
            left_width_px = props.get('leftWidthPx')
            left_height_px = props.get('leftHeightPx')
            
            if left_image_path:
                if left_image_path.startswith('data:'):
                    image_fit_logger.info(f"Left image path: [BASE64 DATA URL - {len(left_image_path)} characters]")
                else:
                    image_fit_logger.info(f"Left image path: {left_image_path}")
            else:
                image_fit_logger.info(f"Left image path: NOT SET")
                
            image_fit_logger.info(f"Left object fit: {left_object_fit}")
            image_fit_logger.info(f"Left width: {left_width_px}px")
            image_fit_logger.info(f"Left height: {left_height_px}px")
            
            if left_object_fit is None:
                image_fit_logger.warning(f"⚠️ LEFT OBJECT FIT IS MISSING for {slide_info}{template_info}")
            else:
                image_fit_logger.info(f"✅ Left object fit is present: {left_object_fit}")
            
            # Log right image properties without base64
            right_image_path = props.get('rightImagePath')
            right_object_fit = props.get('rightObjectFit')
            right_width_px = props.get('rightWidthPx')
            right_height_px = props.get('rightHeightPx')
            
            if right_image_path:
                if right_image_path.startswith('data:'):
                    image_fit_logger.info(f"Right image path: [BASE64 DATA URL - {len(right_image_path)} characters]")
                else:
                    image_fit_logger.info(f"Right image path: {right_image_path}")
            else:
                image_fit_logger.info(f"Right image path: NOT SET")
                
            image_fit_logger.info(f"Right object fit: {right_object_fit}")
            image_fit_logger.info(f"Right width: {right_width_px}px")
            image_fit_logger.info(f"Right height: {right_height_px}px")
            
            if right_object_fit is None:
                image_fit_logger.warning(f"⚠️ RIGHT OBJECT FIT IS MISSING for {slide_info}{template_info}")
            else:
                image_fit_logger.info(f"✅ Right object fit is present: {right_object_fit}")
    
    image_fit_logger.info(f"=== END IMAGE FIT ANALYSIS for {slide_info}{template_info} ===")

async def log_image_fit_properties(slide_data: dict, slide_index: int = None, template_id: str = None):
    """Log image fit properties specifically for debugging fit styles in PDF."""
    slide_info = f"slide {slide_index}" if slide_index else "slide"
    template_info = f" ({template_id})" if template_id else ""
    
    image_fit_logger.info(f"=== IMAGE FIT ANALYSIS for {slide_info}{template_info} ===")
    
    if isinstance(slide_data, dict):
        template_id = slide_data.get('templateId', 'Unknown')
        props = slide_data.get('props', {})
        
        # Check if this is a template with images
        if template_id in ['big-image-left', 'big-image-top', 'bullet-points', 'bullet-points-right']:
            image_fit_logger.info(f"Template: {template_id}")
            
            # Log image path without base64 data
            image_path = props.get('imagePath')
            if image_path:
                if image_path.startswith('data:'):
                    image_fit_logger.info(f"Image path: [BASE64 DATA URL - {len(image_path)} characters]")
                else:
                    image_fit_logger.info(f"Image path: {image_path}")
            else:
                image_fit_logger.info(f"Image path: NOT SET")
            
            # Log size and fit properties
            width_px = props.get('widthPx')
            height_px = props.get('heightPx')
            object_fit = props.get('objectFit')
            image_scale = props.get('imageScale')
            image_offset = props.get('imageOffset')
            
            image_fit_logger.info(f"Width: {width_px}px")
            image_fit_logger.info(f"Height: {height_px}px")
            image_fit_logger.info(f"Object fit: {object_fit}")
            image_fit_logger.info(f"Image scale: {image_scale}")
            image_fit_logger.info(f"Image offset: {image_offset}")
            
            # Check if objectFit is missing
            if object_fit is None:
                image_fit_logger.warning(f"⚠️ OBJECT FIT IS MISSING for {slide_info}{template_info}")
                image_fit_logger.warning(f"⚠️ This will cause PDF to use default 'cover' instead of user-selected fit style")
            else:
                image_fit_logger.info(f"✅ Object fit is present: {object_fit}")
            
            # Log what the PDF template will receive
            pdf_object_fit = object_fit if object_fit else 'cover'
            image_fit_logger.info(f"PDF template will use object-fit: {pdf_object_fit}")
            
        elif template_id == 'two-column':
            image_fit_logger.info(f"Template: {template_id}")
            
            # Log left image properties without base64
            left_image_path = props.get('leftImagePath')
            left_object_fit = props.get('leftObjectFit')
            left_width_px = props.get('leftWidthPx')
            left_height_px = props.get('leftHeightPx')
            
            if left_image_path:
                if left_image_path.startswith('data:'):
                    image_fit_logger.info(f"Left image path: [BASE64 DATA URL - {len(left_image_path)} characters]")
                else:
                    image_fit_logger.info(f"Left image path: {left_image_path}")
            else:
                image_fit_logger.info(f"Left image path: NOT SET")
                
            image_fit_logger.info(f"Left object fit: {left_object_fit}")
            image_fit_logger.info(f"Left width: {left_width_px}px")
            image_fit_logger.info(f"Left height: {left_height_px}px")
            
            if left_object_fit is None:
                image_fit_logger.warning(f"⚠️ LEFT OBJECT FIT IS MISSING for {slide_info}{template_info}")
            else:
                image_fit_logger.info(f"✅ Left object fit is present: {left_object_fit}")
            
            # Log right image properties without base64
            right_image_path = props.get('rightImagePath')
            right_object_fit = props.get('rightObjectFit')
            right_width_px = props.get('rightWidthPx')
            right_height_px = props.get('rightHeightPx')
            
            if right_image_path:
                if right_image_path.startswith('data:'):
                    image_fit_logger.info(f"Right image path: [BASE64 DATA URL - {len(right_image_path)} characters]")
                else:
                    image_fit_logger.info(f"Right image path: {right_image_path}")
            else:
                image_fit_logger.info(f"Right image path: NOT SET")
                
            image_fit_logger.info(f"Right object fit: {right_object_fit}")
            image_fit_logger.info(f"Right width: {right_width_px}px")
            image_fit_logger.info(f"Right height: {right_height_px}px")
            
            if right_object_fit is None:
                image_fit_logger.warning(f"⚠️ RIGHT OBJECT FIT IS MISSING for {slide_info}{template_info}")
            else:
                image_fit_logger.info(f"✅ Right object fit is present: {right_object_fit}")
    
    image_fit_logger.info(f"=== END IMAGE FIT ANALYSIS for {slide_info}{template_info} ===")

async def log_html_content(html_content: str, slide_index: int = None, template_id: str = None):
    """Log detailed HTML content analysis for debugging."""
    slide_info = f"slide {slide_index}" if slide_index else "slide"
    template_info = f" ({template_id})" if template_id else ""
    
    logger.info(f"PDF GEN: === HTML CONTENT ANALYSIS for {slide_info}{template_info} ===")
    
    # Log HTML content to file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    html_filename = f"/tmp/html_debug_{timestamp}_{slide_index or 'unknown'}_{template_id or 'unknown'}.html"
    
    try:
        with open(html_filename, 'w', encoding='utf-8') as f:
            f.write(html_content)
        logger.info(f"PDF GEN: HTML content saved to: {html_filename}")
    except Exception as e:
        logger.error(f"PDF GEN: Failed to save HTML content: {e}")
    
    # Analyze HTML content for image placeholder elements
    logger.info(f"PDF GEN: === IMAGE PLACEHOLDER HTML ANALYSIS ===")
    
    # Look for image positioning containers
    if 'image-positioning-container' in html_content:
        logger.info(f"PDF GEN: Found image-positioning-container elements")
        
        # Extract and log image positioning container sections
        lines = html_content.split('\n')
        for i, line in enumerate(lines):
            if 'image-positioning-container' in line:
                logger.info(f"PDF GEN: Line {i+1}: {line.strip()}")
                
                # Look for style attributes in the next few lines
                for j in range(i, min(i + 10, len(lines))):
                    if 'style=' in lines[j]:
                        logger.info(f"PDF GEN:   Style line {j+1}: {lines[j].strip()}")
                    if 'transform:' in lines[j]:
                        logger.info(f"PDF GEN:   Transform line {j+1}: {lines[j].strip()}")
    
    # Look for transformed-image elements
    if 'transformed-image' in html_content:
        logger.info(f"PDF GEN: Found transformed-image elements")
        
        lines = html_content.split('\n')
        for i, line in enumerate(lines):
            if 'transformed-image' in line:
                logger.info(f"PDF GEN: Line {i+1}: {line.strip()}")
                
                # Look for style attributes in the next few lines
                for j in range(i, min(i + 10, len(lines))):
                    if 'style=' in lines[j]:
                        logger.info(f"PDF GEN:   Style line {j+1}: {lines[j].strip()}")
                    if 'object-fit:' in lines[j]:
                        logger.info(f"PDF GEN:   Object-fit line {j+1}: {lines[j].strip()}")
                    if 'transform:' in lines[j]:
                        logger.info(f"PDF GEN:   Transform line {j+1}: {lines[j].strip()}")
    
    # Look for template-specific sections
    template_sections = ['big-image-left', 'big-image-top', 'bullet-points', 'bullet-points-right']
    for template_section in template_sections:
        if template_section in html_content:
            logger.info(f"PDF GEN: Found {template_section} template section")
            
            # Extract the template section
            lines = html_content.split('\n')
            for i, line in enumerate(lines):
                if template_section in line and 'elif slide.templateId' in line:
                    logger.info(f"PDF GEN: Template section start line {i+1}: {line.strip()}")
                    
                    # Log the next 20 lines to see the template structure
                    for j in range(i, min(i + 20, len(lines))):
                        if '{% endif %}' in lines[j]:
                            logger.info(f"PDF GEN: Template section end line {j+1}: {lines[j].strip()}")
                            break
                        if any(keyword in lines[j] for keyword in ['imagePath', 'widthPx', 'heightPx', 'objectFit', 'imageScale', 'imageOffset']):
                            logger.info(f"PDF GEN:   Property line {j+1}: {lines[j].strip()}")
    
    # Look for element positioning
    if 'elementPositions' in html_content:
        logger.info(f"PDF GEN: Found elementPositions in HTML")
        
        lines = html_content.split('\n')
        for i, line in enumerate(lines):
            if 'elementPositions' in line:
                logger.info(f"PDF GEN: ElementPositions line {i+1}: {line.strip()}")
    
    # Look for transform attributes
    if 'transform:' in html_content:
        logger.info(f"PDF GEN: Found transform attributes in HTML")
        
        lines = html_content.split('\n')
        for i, line in enumerate(lines):
            if 'transform:' in line:
                logger.info(f"PDF GEN: Transform line {i+1}: {line.strip()}")
    
    # Look for object-fit attributes
    if 'object-fit:' in html_content:
        logger.info(f"PDF GEN: Found object-fit attributes in HTML")
        
        lines = html_content.split('\n')
        for i, line in enumerate(lines):
            if 'object-fit:' in line:
                logger.info(f"PDF GEN: Object-fit line {i+1}: {line.strip()}")
    
    # Look for width and height attributes
    if 'widthPx' in html_content or 'heightPx' in html_content:
        logger.info(f"PDF GEN: Found widthPx/heightPx in HTML")
        
        lines = html_content.split('\n')
        for i, line in enumerate(lines):
            if 'widthPx' in line or 'heightPx' in line:
                logger.info(f"PDF GEN: Size property line {i+1}: {line.strip()}")
    
    # Look for image data URLs
    if 'data:image' in html_content:
        logger.info(f"PDF GEN: Found image data URLs in HTML")
        
        lines = html_content.split('\n')
        for i, line in enumerate(lines):
            if 'data:image' in line:
                # Truncate the data URL for logging
                truncated_line = line[:200] + "..." if len(line) > 200 else line
                logger.info(f"PDF GEN: Image data URL line {i+1}: {truncated_line.strip()}")
    
    logger.info(f"PDF GEN: === END HTML CONTENT ANALYSIS for {slide_info}{template_info} ===")

async def log_browser_console_output(page, slide_index: int = None, template_id: str = None):
    """Log browser console output and element positioning for debugging."""
    slide_info = f"slide {slide_index}" if slide_index else "slide"
    template_info = f" ({template_id})" if template_id else ""
    
    logger.info(f"PDF GEN: === BROWSER CONSOLE AND ELEMENT ANALYSIS for {slide_info}{template_info} ===")
    
    try:
        # Get console logs
        logs = await page.evaluate("""
            () => {
                return window.consoleLogs || [];
            }
        """)
        
        if logs:
            logger.info(f"PDF GEN: Browser console logs found: {len(logs)} entries")
            for i, log in enumerate(logs):
                logger.info(f"PDF GEN: Console log {i+1}: {log}")
        else:
            logger.info(f"PDF GEN: No browser console logs found")
        
        # Analyze element positioning and styling
        element_analysis = await page.evaluate("""
            () => {
                const analysis = {
                    imageElements: [],
                    positionedElements: [],
                    transformedElements: [],
                    containerElements: []
                };
                
                // Find all image elements
                const images = document.querySelectorAll('img');
                images.forEach((img, index) => {
                    const rect = img.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(img);
                    analysis.imageElements.push({
                        index: index,
                        src: img.src ? img.src.substring(0, 100) + '...' : 'No src',
                        width: rect.width,
                        height: rect.height,
                        top: rect.top,
                        left: rect.left,
                        objectFit: computedStyle.objectFit,
                        transform: computedStyle.transform,
                        position: computedStyle.position,
                        zIndex: computedStyle.zIndex
                    });
                });
                
                // Find positioned elements
                const positioned = document.querySelectorAll('[style*="transform"], [style*="position: absolute"]');
                positioned.forEach((el, index) => {
                    const rect = el.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(el);
                    analysis.positionedElements.push({
                        index: index,
                        tagName: el.tagName,
                        className: el.className,
                        width: rect.width,
                        height: rect.height,
                        top: rect.top,
                        left: rect.left,
                        transform: computedStyle.transform,
                        position: computedStyle.position,
                        zIndex: computedStyle.zIndex
                    });
                });
                
                // Find transformed elements
                const transformed = document.querySelectorAll('.transformed-image, .image-positioning-container');
                transformed.forEach((el, index) => {
                    const rect = el.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(el);
                    analysis.transformedElements.push({
                        index: index,
                        tagName: el.tagName,
                        className: el.className,
                        width: rect.width,
                        height: rect.height,
                        top: rect.top,
                        left: rect.left,
                        transform: computedStyle.transform,
                        objectFit: computedStyle.objectFit,
                        overflow: computedStyle.overflow
                    });
                });
                
                // Find container elements
                const containers = document.querySelectorAll('.image-container, .placeholder-container, .content-container');
                containers.forEach((el, index) => {
                    const rect = el.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(el);
                    analysis.containerElements.push({
                        index: index,
                        tagName: el.tagName,
                        className: el.className,
                        width: rect.width,
                        height: rect.height,
                        top: rect.top,
                        left: rect.left,
                        display: computedStyle.display,
                        flexDirection: computedStyle.flexDirection,
                        alignItems: computedStyle.alignItems,
                        justifyContent: computedStyle.justifyContent
                    });
                });
                
                return analysis;
            }
        """)
        
        # Log element analysis
        if element_analysis:
            logger.info(f"PDF GEN: === ELEMENT POSITIONING ANALYSIS ===")
            
            # Log image elements
            if element_analysis.get('imageElements'):
                logger.info(f"PDF GEN: Found {len(element_analysis['imageElements'])} image elements:")
                for img in element_analysis['imageElements']:
                    logger.info(f"PDF GEN:   Image {img['index']}: {img['width']}x{img['height']} at ({img['left']}, {img['top']})")
                    logger.info(f"PDF GEN:     Object-fit: {img['objectFit']}, Transform: {img['transform']}")
                    logger.info(f"PDF GEN:     Position: {img['position']}, Z-index: {img['zIndex']}")
            
            # Log positioned elements
            if element_analysis.get('positionedElements'):
                logger.info(f"PDF GEN: Found {len(element_analysis['positionedElements'])} positioned elements:")
                for el in element_analysis['positionedElements']:
                    logger.info(f"PDF GEN:   {el['tagName']}.{el['className']}: {el['width']}x{el['height']} at ({el['left']}, {el['top']})")
                    logger.info(f"PDF GEN:     Transform: {el['transform']}, Position: {el['position']}")
            
            # Log transformed elements
            if element_analysis.get('transformedElements'):
                logger.info(f"PDF GEN: Found {len(element_analysis['transformedElements'])} transformed elements:")
                for el in element_analysis['transformedElements']:
                    logger.info(f"PDF GEN:   {el['tagName']}.{el['className']}: {el['width']}x{el['height']} at ({el['left']}, {el['top']})")
                    logger.info(f"PDF GEN:     Transform: {el['transform']}, Object-fit: {el['objectFit']}")
                    logger.info(f"PDF GEN:     Overflow: {el['overflow']}")
            
            # Log container elements
            if element_analysis.get('containerElements'):
                logger.info(f"PDF GEN: Found {len(element_analysis['containerElements'])} container elements:")
                for el in element_analysis['containerElements']:
                    logger.info(f"PDF GEN:   {el['tagName']}.{el['className']}: {el['width']}x{el['height']} at ({el['left']}, {el['top']})")
                    logger.info(f"PDF GEN:     Display: {el['display']}, Flex-direction: {el['flexDirection']}")
                    logger.info(f"PDF GEN:     Align-items: {el['alignItems']}, Justify-content: {el['justifyContent']}")
            
    except Exception as e:
        logger.error(f"PDF GEN: Error analyzing browser elements: {e}")
    
    logger.info(f"PDF GEN: === END BROWSER CONSOLE AND ELEMENT ANALYSIS for {slide_info}{template_info} ===")

async def log_transform_applications(page, slide_data: dict, slide_index: int = None, template_id: str = None):
    """Log detailed information about transform applications."""
    slide_info = f"slide {slide_index}" if slide_index else "slide"
    template_info = f" ({template_id})" if template_id else ""
    
    logger.info(f"PDF GEN: === TRANSFORM APPLICATION ANALYSIS for {slide_info}{template_info} ===")
    
    # Log image offset and scale properties
    props = slide_data.get('props', {})
    
    # Check for image properties
    image_props = ['imagePath', 'leftImagePath', 'rightImagePath']
    for prop in image_props:
        if prop in props:
            logger.info(f"PDF GEN: Found {prop}: {props[prop]}")
            
            # Check for corresponding offset and scale
            if prop == 'imagePath':
                offset_prop = 'imageOffset'
                scale_prop = 'imageScale'
            elif prop == 'leftImagePath':
                offset_prop = 'leftImageOffset'
                scale_prop = 'leftImageScale'
            elif prop == 'rightImagePath':
                offset_prop = 'rightImageOffset'
                scale_prop = 'rightImageScale'
            
            if offset_prop in props:
                offset = props[offset_prop]
                logger.info(f"PDF GEN:   {offset_prop}: {offset}")
                if isinstance(offset, dict):
                    logger.info(f"PDF GEN:     X: {offset.get('x', 'undefined')}")
                    logger.info(f"PDF GEN:     Y: {offset.get('y', 'undefined')}")
            else:
                logger.info(f"PDF GEN:   {offset_prop}: NOT PRESENT")
            
            if scale_prop in props:
                scale = props[scale_prop]
                logger.info(f"PDF GEN:   {scale_prop}: {scale}")
            else:
                logger.info(f"PDF GEN:   {scale_prop}: NOT PRESENT")
    
    # Check for element positions in metadata
    metadata = slide_data.get('metadata', {})
    if 'elementPositions' in metadata:
        element_positions = metadata['elementPositions']
        logger.info(f"PDF GEN: Element positions found: {len(element_positions)} elements")
        for element_id, position in element_positions.items():
            logger.info(f"PDF GEN:   Element '{element_id}': x={position.get('x', 'undefined')}, y={position.get('y', 'undefined')}")
    else:
        logger.info(f"PDF GEN: No element positions found in metadata")
    
    # Check browser for actual transform applications
    try:
        transform_info = await page.evaluate("""
            () => {
                const results = {
                    imageTransforms: [],
                    elementTransforms: [],
                    computedTransforms: []
                };
                
                // Check all images for transforms
                const images = document.querySelectorAll('img');
                images.forEach((img, index) => {
                    const computedStyle = window.getComputedStyle(img);
                    const transform = computedStyle.transform;
                    const rect = img.getBoundingClientRect();
                    
                    results.imageTransforms.push({
                        index: index,
                        src: img.src.substring(0, 100) + '...',
                        transform: transform,
                        transformOrigin: computedStyle.transformOrigin,
                        objectFit: computedStyle.objectFit,
                        position: computedStyle.position,
                        rect: {
                            top: rect.top,
                            left: rect.left,
                            width: rect.width,
                            height: rect.height
                        }
                    });
                });
                
                // Check all elements with transforms
                const allElements = document.querySelectorAll('*');
                allElements.forEach((el, index) => {
                    const computedStyle = window.getComputedStyle(el);
                    const transform = computedStyle.transform;
                    
                    if (transform && transform !== 'none' && transform !== 'matrix(1, 0, 0, 1, 0, 0)') {
                        const rect = el.getBoundingClientRect();
                        results.elementTransforms.push({
                            index: index,
                            tagName: el.tagName,
                            className: el.className,
                            id: el.id,
                            transform: transform,
                            transformOrigin: computedStyle.transformOrigin,
                            position: computedStyle.position,
                            rect: {
                                top: rect.top,
                                left: rect.left,
                                width: rect.width,
                                height: rect.height
                            }
                        });
                    }
                });
                
                return results;
            }
        """)
        
        if transform_info:
            # Log image transforms
            if transform_info.get('imageTransforms'):
                logger.info(f"PDF GEN: Found {len(transform_info['imageTransforms'])} images with transforms:")
                for img in transform_info['imageTransforms']:
                    logger.info(f"PDF GEN:   Image {img['index']}: {img['src']}")
                    logger.info(f"PDF GEN:     Transform: {img['transform']}")
                    logger.info(f"PDF GEN:     Transform-origin: {img['transformOrigin']}")
                    logger.info(f"PDF GEN:     Object-fit: {img['objectFit']}")
                    logger.info(f"PDF GEN:     Position: {img['position']}")
                    logger.info(f"PDF GEN:     Rect: {img['rect']['width']}x{img['rect']['height']} at ({img['rect']['left']}, {img['rect']['top']})")
            
            # Log element transforms
            if transform_info.get('elementTransforms'):
                logger.info(f"PDF GEN: Found {len(transform_info['elementTransforms'])} elements with transforms:")
                for el in transform_info['elementTransforms']:
                    logger.info(f"PDF GEN:   {el['tagName']}.{el['className']}: {el['transform']}")
                    logger.info(f"PDF GEN:     Transform-origin: {el['transformOrigin']}")
                    logger.info(f"PDF GEN:     Position: {el['position']}")
                    logger.info(f"PDF GEN:     Rect: {el['rect']['width']}x{el['rect']['height']} at ({el['rect']['left']}, {el['rect']['top']})")
    
    except Exception as e:
        logger.error(f"PDF GEN: Error analyzing transforms: {e}")
    
    logger.info(f"PDF GEN: === END TRANSFORM APPLICATION ANALYSIS for {slide_info}{template_info} ===")

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

# Optimized browser launch options
def get_browser_launch_options():
    """Get optimized browser launch options for performance and stability."""
    logger.info("Configuring browser launch options for optimal performance")
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
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--force-color-profile=srgb',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows'
        ],
        'dumpio': False,  # Disabled for performance
        'devtools': False,
        'ignoreHTTPSErrors': True,
        'defaultViewport': None,
        'executablePath': CHROME_EXEC_PATH,
        'timeout': PDF_GENERATION_TIMEOUT
    }

async def generate_pdf_from_html_template(
    template_name: str,
    context_data: dict,
    output_filename: str,
    use_cache: bool = True,
    landscape: bool = False
) -> str:
    """Enhanced PDF generation with extensive logging for debugging."""
    
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
        
        # Transform image paths for PDF generation using base64 data URLs
        if isinstance(context_data.get('details'), dict) and 'contentBlocks' in context_data['details']:
            content_blocks = context_data['details']['contentBlocks']
            
            # Calculate the correct path to static_design_images from pdf_generator.py location
            # pdf_generator.py is in app/services/, static_design_images is at root level
            # So we need to go up 2 levels: ../../static_design_images/
            current_dir = os.path.dirname(__file__)  # app/services/
            root_dir = os.path.dirname(os.path.dirname(current_dir))  # Go up 2 levels to root
            static_images_dir = os.path.join(root_dir, 'static_design_images')
            static_images_abs_path = os.path.abspath(static_images_dir)
            
            logger.info(f"PDF GEN: Processing {len(content_blocks)} content blocks for image path transformation")
            logger.info(f"PDF GEN: Current file location: {__file__}")
            logger.info(f"PDF GEN: Current dir: {current_dir}")
            logger.info(f"PDF GEN: Root dir: {root_dir}")
            logger.info(f"PDF GEN: Static images dir: {static_images_dir}")
            logger.info(f"PDF GEN: Static images absolute path: {static_images_abs_path}")
            logger.info(f"PDF GEN: Static images directory exists: {os.path.exists(static_images_abs_path)}")
            
            for block in content_blocks:
                if block.get('type') == 'image':
                    original_src = block.get('src', '')
                    logger.info(f"PDF GEN: Processing image block with src: {original_src}")
                    logger.info(f"PDF GEN: Image attributes - alignment: {block.get('alignment')}, maxWidth: {block.get('maxWidth')}, width: {block.get('width')}, height: {block.get('height')}, borderRadius: {block.get('borderRadius')}")
                    
                    # Only transform if not already a data URL
                    if original_src and not original_src.startswith('data:'):
                        if original_src.startswith('/static_design_images/'):
                            filename = original_src.replace('/static_design_images/', '')
                            full_path = os.path.join(static_images_abs_path, filename)
                            
                            logger.info(f"PDF GEN: Original: {original_src}")
                            logger.info(f"PDF GEN: Filename: {filename}")
                            logger.info(f"PDF GEN: Full path: {full_path}")
                            logger.info(f"PDF GEN: File exists: {os.path.exists(full_path)}")
                            
                            if os.path.exists(full_path):
                                try:
                                    # Read the image file and convert to base64
                                    with open(full_path, 'rb') as image_file:
                                        image_data = image_file.read()
                                        image_base64 = base64.b64encode(image_data).decode('utf-8')
                                        
                                        # Determine MIME type
                                        mime_type, _ = mimetypes.guess_type(full_path)
                                        if not mime_type:
                                            mime_type = 'image/jpeg'  # Default fallback
                                        
                                        # Create data URL
                                        data_url = f"data:{mime_type};base64,{image_base64}"
                                        
                                        logger.info(f"PDF GEN: MIME type: {mime_type}")
                                        logger.info(f"PDF GEN: Image size: {len(image_data)} bytes")
                                        logger.info(f"PDF GEN: Base64 length: {len(image_base64)} chars")
                                        logger.info(f"PDF GEN: Data URL length: {len(data_url)} chars")
                                        
                                        block['src'] = data_url
                                        logger.info(f"PDF GEN: Successfully converted to data URL")
                                        logger.info(f"PDF GEN: Final image attributes - alignment: {block.get('alignment')}, maxWidth: {block.get('maxWidth')}, width: {block.get('width')}, height: {block.get('height')}, borderRadius: {block.get('borderRadius')}")
                                        
                                except Exception as e:
                                    logger.error(f"PDF GEN: Failed to read image file {full_path}: {e}")
                                    logger.info(f"PDF GEN: Keeping original src: {original_src}")
                            else:
                                logger.warning(f"PDF GEN: Image file not found: {full_path}")
                                logger.info(f"PDF GEN: Keeping original src: {original_src}")
                                
                        elif original_src.startswith('/'):
                            filename = original_src.lstrip('/')
                            # Handle case where it might be just the filename without the static_design_images prefix
                            if not filename.startswith('static_design_images/'):
                                full_path = os.path.join(static_images_abs_path, filename)
                            else:
                                full_path = os.path.join(root_dir, filename)
                            
                            logger.info(f"PDF GEN: Absolute path: {original_src} -> {full_path}")
                            logger.info(f"PDF GEN: File exists: {os.path.exists(full_path)}")
                            
                            if os.path.exists(full_path):
                                try:
                                    # Read the image file and convert to base64
                                    with open(full_path, 'rb') as image_file:
                                        image_data = image_file.read()
                                        image_base64 = base64.b64encode(image_data).decode('utf-8')
                                        
                                        # Determine MIME type
                                        mime_type, _ = mimetypes.guess_type(full_path)
                                        if not mime_type:
                                            mime_type = 'image/jpeg'  # Default fallback
                                        
                                        # Create data URL
                                        data_url = f"data:{mime_type};base64,{image_base64}"
                                        
                                        block['src'] = data_url
                                        logger.info(f"PDF GEN: Successfully converted absolute path to data URL")
                                        
                                except Exception as e:
                                    logger.error(f"PDF GEN: Failed to read image file {full_path}: {e}")
                            else:
                                logger.warning(f"PDF GEN: Image file not found: {full_path}")
                        else:
                            logger.info(f"PDF GEN: Keeping original src: {original_src}")
                    else:
                        logger.info(f"PDF GEN: Already transformed or no src: {original_src}")
                        logger.info(f"PDF GEN: Final image attributes - alignment: {block.get('alignment')}, maxWidth: {block.get('maxWidth')}, width: {block.get('width')}, height: {block.get('height')}, borderRadius: {block.get('borderRadius')}")
        
        
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
        
        # Set content from string
        await page.setContent(html_content)
        logger.info("HTML content set in Pyppeteer page.")
        
        # Wait for fonts to load and rendering to complete - OPTIMIZED
        try:
            await page.waitForFunction("""
                () => {
                    // Quick font readiness check with fallback
                    if (document.fonts && document.fonts.ready) {
                        return document.fonts.ready.then(() => true);
                    }
                    // Fallback: just check if document is loaded
                    return document.readyState === 'complete';
                }
            """, timeout=5000)  # Reduced from 10s to 5s
        except Exception as e:
            logger.warning(f"Font loading timeout, proceeding anyway: {e}")
            # Continue with PDF generation even if fonts aren't fully loaded
        
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






async def calculate_slide_dimensions(slide_data: dict, theme: str, browser=None) -> int:
    """
    Calculate the exact height needed for a single slide.
    
    Args:
        slide_data: The slide data dictionary
        theme: The theme name
        browser: Optional browser instance to reuse
    
    Returns:
        int: The calculated height in pixels
    """
    should_close_browser = browser is None
    page = None
    
    # Get slide info for logging
    template_id = slide_data.get('templateId', 'unknown')
    
    try:
        if browser is None:
            browser = await pyppeteer.launch(**get_browser_launch_options())
        
        page = await browser.newPage()
        
        # Set viewport to match slide width
        await page.setViewport({'width': 1174, 'height': 800})
        
        # Create context for single slide
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
            'slide_height': 600,  # Start with minimum height
            'embedded_fonts_css': get_embedded_fonts_css()  # Add embedded fonts CSS
        }
        
        # Render the single slide template
        try:
            # Debug logging to see the data structure
            logger.info(f"DEBUG: Template data for {template_id}: slide.props.steps type = {type(safe_slide_data.get('props', {}).get('steps'))}")
            if safe_slide_data.get('props', {}).get('steps'):
                logger.info(f"DEBUG: slide.props.steps content = {safe_slide_data['props']['steps']}")
            
            # Additional debug logging for big-numbers template
            if template_id == 'big-numbers':
                logger.info(f"=== BIG NUMBERS TEMPLATE DEBUG for {template_id} ===")
                logger.info(f"Slide data: {safe_slide_data}")
                logger.info(f"Props: {safe_slide_data.get('props', {})}")
                logger.info(f"Steps: {safe_slide_data.get('props', {}).get('steps', [])}")
                logger.info(f"Title: {safe_slide_data.get('props', {}).get('title', 'NO TITLE')}")
                logger.info(f"Metadata: {safe_slide_data.get('metadata', {})}")
                logger.info(f"Element positions: {safe_slide_data.get('metadata', {}).get('elementPositions', {})}")
                logger.info(f"=== END BIG NUMBERS TEMPLATE DEBUG ===")
            
            template = jinja_env.get_template("single_slide_pdf_template.html")
            html_content = template.render(**context_data)
        except Exception as template_error:
            logger.error(f"Template rendering error for {template_id}: {template_error}", exc_info=True)
            # Fallback to a simple template
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head><style>
                body {{ margin: 0; padding: 40px; font-family: Arial, sans-serif; background: #f0f0f0; }}
                .slide-page {{ width: 1174px; height: 600px; background: white; padding: 40px; border-radius: 8px; }}
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
        await page.setContent(html_content)
        try:
            await page.waitForFunction("""
                () => {
                    // Quick font readiness check with fallback
                    if (document.fonts && document.fonts.ready) {
                        return document.fonts.ready.then(() => true);
                    }
                    // Fallback: just check if document is loaded
                    return document.readyState === 'complete';
                }
            """, timeout=3000)  # Even shorter timeout for height calculation
        except Exception as e:
            logger.warning(f"Font loading timeout during height calculation for {template_id}, proceeding anyway: {e}")
            # Continue with height calculation even if fonts aren't fully loaded
        
        # Additional delay for complex rendering
        await asyncio.sleep(1)
        
        # Calculate the actual height needed
        height_result = await page.evaluate("""
            () => {
                const slidePage = document.querySelector('.slide-page');
                if (!slidePage) return 600;
                
                // Force a reflow to ensure accurate measurements
                slidePage.offsetHeight;
                
                // Get the actual computed height including all content
                const slideRect = slidePage.getBoundingClientRect();
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
                    
                    // Ensure minimum height and reasonable maximum
                    const finalHeight = Math.max(600, Math.min(Math.ceil(totalHeight), 3000));
                    
                    console.log(`Slide height calculation: Final: ${finalHeight}px, Content: ${Math.ceil(contentRect.height)}px, MaxBottom: ${Math.ceil(maxBottom - slideRect.top)}px`);
                    
                    return finalHeight;
                }
                
                return 600;
            }
        """)
        
        # Add safety margin
        final_height = max(PDF_MIN_SLIDE_HEIGHT, min(int(height_result) + PDF_HEIGHT_SAFETY_MARGIN, PDF_MAX_SLIDE_HEIGHT))
        
        logger.info(f"Calculated height for {template_id}: {final_height}px (original: {height_result}px)")
        return final_height
        
    except Exception as e:
        logger.error(f"Error calculating slide dimensions for {template_id}: {e}", exc_info=True)
        return PDF_MIN_SLIDE_HEIGHT
        
    finally:
        if page and not page.isClosed():
            await page.close()
        if should_close_browser and browser:
            await browser.close()

async def generate_single_slide_pdf(slide_data: dict, theme: str, slide_height: int, output_path: str, browser=None, slide_index: int = None, template_id: str = None) -> bool:
    """
    Generate a PDF for a single slide with exact dimensions.
    
    Args:
        slide_data: The slide data dictionary
        theme: The theme name
        slide_height: The calculated height for this slide
        output_path: Where to save the PDF
        browser: Optional browser instance to reuse
        slide_index: Optional slide index for logging (1-based)
        template_id: Optional template ID for logging
    
    Returns:
        bool: True if successful, False otherwise
    """
    logger.info(f"=== STARTING ENHANCED SINGLE SLIDE PDF GENERATION ===")
    logger.info(f"PDF GEN: Slide Index: {slide_index}")
    logger.info(f"PDF GEN: Template ID: {template_id}")
    logger.info(f"PDF GEN: Theme: {theme}")
    logger.info(f"PDF GEN: Slide Height: {slide_height}px")
    logger.info(f"PDF GEN: Output Path: {output_path}")
    
    # Enable detailed logging for debugging
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
            'slide_height': slide_height,
            'embedded_fonts_css': get_embedded_fonts_css()  # Add embedded fonts CSS
        }
        
        # Generate pie chart CSS if needed
        if safe_slide_data.get('templateId') == 'pie-chart-infographics' and generate_css_pie_chart:
            try:
                chart_data = safe_slide_data.get('props', {}).get('chartData', {})
                segments = chart_data.get('segments', [])
                
                if segments:
                    logger.info(f"Generating CSS pie chart for {slide_info}{template_info}")
                    chart_id = f"pie-chart-{slide_index}" if slide_index is not None else "pie-chart"
                    css_pie_chart = generate_css_pie_chart(segments, chart_id)
                    context_data['pie_chart_html'] = css_pie_chart['html']
                    context_data['pie_chart_css'] = css_pie_chart['css']
                    context_data['pie_chart_image'] = ""  # Empty for CSS version
                    logger.info(f"CSS pie chart generated successfully for {slide_info}{template_info}")
                else:
                    logger.warning(f"No segments found for pie chart in {slide_info}{template_info}")
                    context_data['pie_chart_html'] = ""
                    context_data['pie_chart_css'] = ""
                    context_data['pie_chart_image'] = ""
            except Exception as e:
                logger.error(f"Error generating CSS pie chart for {slide_info}{template_info}: {e}")
                context_data['pie_chart_html'] = ""
                context_data['pie_chart_css'] = ""
                context_data['pie_chart_image'] = ""
        else:
            context_data['pie_chart_html'] = ""
            context_data['pie_chart_css'] = ""
            context_data['pie_chart_image'] = ""
        
        # Generate pie chart CSS if needed
        if safe_slide_data.get('templateId') == 'pie-chart-infographics' and generate_css_pie_chart:
            try:
                chart_data = safe_slide_data.get('props', {}).get('chartData', {})
                segments = chart_data.get('segments', [])
                
                if segments:
                    logger.info(f"Generating CSS pie chart for {slide_info}{template_info}")
                    chart_id = f"pie-chart-{slide_index}" if slide_index is not None else "pie-chart"
                    css_pie_chart = generate_css_pie_chart(segments, chart_id)
                    context_data['pie_chart_html'] = css_pie_chart['html']
                    context_data['pie_chart_css'] = css_pie_chart['css']
                    context_data['pie_chart_image'] = ""  # Empty for CSS version
                    logger.info(f"CSS pie chart generated successfully for {slide_info}{template_info}")
                else:
                    logger.warning(f"No segments found for pie chart in {slide_info}{template_info}")
                    context_data['pie_chart_html'] = ""
                    context_data['pie_chart_css'] = ""
                    context_data['pie_chart_image'] = ""
            except Exception as e:
                logger.error(f"Error generating CSS pie chart for {slide_info}{template_info}: {e}")
                context_data['pie_chart_html'] = ""
                context_data['pie_chart_css'] = ""
                context_data['pie_chart_image'] = ""
        else:
            context_data['pie_chart_html'] = ""
            context_data['pie_chart_css'] = ""
            context_data['pie_chart_image'] = ""
        
        # Process presentation slide images (convert imagePath to base64 data URLs)
        if safe_slide_data.get('props'):
            props = safe_slide_data['props']
            
            # Calculate the correct path to static_design_images from pdf_generator.py location
            current_dir = os.path.dirname(__file__)  # app/services/
            root_dir = os.path.dirname(os.path.dirname(current_dir))  # Go up 2 levels to root
            static_images_dir = os.path.join(root_dir, 'static_design_images')
            static_images_abs_path = os.path.abspath(static_images_dir)
            
            logger.info(f"PDF GEN: Processing presentation slide images")
            logger.info(f"PDF GEN: Static images absolute path: {static_images_abs_path}")
            
            # List of image path properties to process
            image_props = ['imagePath', 'leftImagePath', 'rightImagePath', 'imageUrl']
            
            # Enhanced image processing with better positioning data
            for prop_name in image_props:
                if prop_name in props and props[prop_name]:
                    image_path = props[prop_name]
                    logger.info(f"PDF GEN: Processing {prop_name}: {image_path}")
                    
                    # Handle both data URLs and file paths
                    if image_path.startswith('data:'):
                        logger.info(f"PDF GEN: {prop_name} is already a data URL")
                        continue
                    
                    # Process file path (remove leading slash and construct full path)
                    if image_path.startswith('/static_design_images/'):
                        # Extract filename from path
                        filename = os.path.basename(image_path)
                        logger.info(f"PDF GEN: {prop_name} - Original: {image_path}")
                        logger.info(f"PDF GEN: {prop_name} - Filename: {filename}")
                        
                        # Construct full path
                        full_image_path = os.path.join(static_images_abs_path, filename)
                        logger.info(f"PDF GEN: {prop_name} - Full path: {full_image_path}")
                        
                        # Check if file exists
                        if os.path.exists(full_image_path):
                            logger.info(f"PDF GEN: {prop_name} - File exists: True")
                            
                            try:
                                # Read and convert to base64
                                with open(full_image_path, 'rb') as img_file:
                                    img_data = img_file.read()
                                    
                                    # Detect MIME type
                                    mime_type = 'image/jpeg'  # default
                                    if filename.lower().endswith('.png'):
                                        mime_type = 'image/png'
                                    elif filename.lower().endswith('.gif'):
                                        mime_type = 'image/gif'
                                    elif filename.lower().endswith('.webp'):
                                        mime_type = 'image/jpeg'  # Convert WebP to JPEG for better PDF compatibility
                                    
                                    logger.info(f"PDF GEN: {prop_name} - MIME type: {mime_type}")
                                    logger.info(f"PDF GEN: {prop_name} - Image size: {len(img_data)} bytes")
                                    
                                    # Convert to base64 data URL
                                    img_base64 = base64.b64encode(img_data).decode('utf-8')
                                    data_url = f"data:{mime_type};base64,{img_base64}"
                                    
                                    # Update the prop with data URL
                                    props[prop_name] = data_url
                                    logger.info(f"PDF GEN: {prop_name} - Successfully converted to data URL")
                                    
                            except Exception as e:
                                logger.error(f"PDF GEN: {prop_name} - Failed to convert to data URL: {e}")
                                # Keep original path as fallback
                        else:
                            logger.warning(f"PDF GEN: {prop_name} - File does not exist: {full_image_path}")
                    
            # Process and normalize positioning data for better PDF compatibility
            positioning_props = [
                ('imageOffset', 'imageScale', 'widthPx', 'heightPx', 'objectFit'),
                ('leftImageOffset', 'leftImageScale', 'leftWidthPx', 'leftHeightPx', 'leftObjectFit'),
                ('rightImageOffset', 'rightImageScale', 'rightWidthPx', 'rightHeightPx', 'rightObjectFit')
            ]
            
            for offset_prop, scale_prop, width_prop, height_prop, fit_prop in positioning_props:
                # Ensure image offset is properly formatted
                if offset_prop in props and props[offset_prop]:
                    offset = props[offset_prop]
                    if isinstance(offset, dict) and 'x' in offset and 'y' in offset:
                        # Ensure x and y are numbers, not None
                        props[offset_prop] = {
                            'x': float(offset['x']) if offset['x'] is not None else 0.0,
                            'y': float(offset['y']) if offset['y'] is not None else 0.0
                        }
                        logger.info(f"PDF GEN: Normalized {offset_prop}: {props[offset_prop]}")
                
                # Ensure image scale is a number
                if scale_prop in props and props[scale_prop]:
                    try:
                        props[scale_prop] = float(props[scale_prop])
                        logger.info(f"PDF GEN: Normalized {scale_prop}: {props[scale_prop]}")
                    except (ValueError, TypeError):
                        props[scale_prop] = 1.0
                        logger.warning(f"PDF GEN: Invalid {scale_prop}, defaulting to 1.0")
                
                # Ensure dimensions are numbers
                for dim_prop in [width_prop, height_prop]:
                    if dim_prop in props and props[dim_prop]:
                        try:
                            props[dim_prop] = int(float(props[dim_prop]))
                            logger.info(f"PDF GEN: Normalized {dim_prop}: {props[dim_prop]}")
                        except (ValueError, TypeError):
                            props[dim_prop] = None
                            logger.warning(f"PDF GEN: Invalid {dim_prop}, setting to None")
                
                # Ensure object fit is valid
                if fit_prop in props and props[fit_prop]:
                    valid_fits = ['cover', 'contain', 'fill', 'scale-down', 'none']
                    if props[fit_prop] not in valid_fits:
                        props[fit_prop] = 'cover'
                        logger.warning(f"PDF GEN: Invalid {fit_prop}, defaulting to 'cover'")
            
            # Ensure metadata is properly structured for element positioning
            if 'metadata' not in safe_slide_data:
                safe_slide_data['metadata'] = {}
            
            metadata = safe_slide_data['metadata']
            if 'elementPositions' not in metadata:
                metadata['elementPositions'] = {}
            
            # Log final positioning data
            logger.info(f"PDF GEN: Final element positions: {metadata.get('elementPositions', {})}")
            for prop_name in image_props:
                if prop_name in props:
                    base_prop = prop_name.replace('ImagePath', '')
                    offset_prop = f"{base_prop}ImageOffset" if base_prop else "imageOffset"
                    scale_prop = f"{base_prop}ImageScale" if base_prop else "imageScale"
                    
                    if offset_prop in props:
                        logger.info(f"PDF GEN: {prop_name} positioning - offset: {props.get(offset_prop)}, scale: {props.get(scale_prop)}")
        
        # Log comprehensive template context for debugging
        logger.info(f"PDF GEN: === TEMPLATE RENDERING ANALYSIS ===")
        logger.info(f"PDF GEN: Template file: single_slide_pdf_template.html")
        logger.info(f"PDF GEN: Context data keys: {list(context_data.keys())}")
        logger.info(f"PDF GEN: Theme in context: {context_data.get('theme')}")
        logger.info(f"PDF GEN: Slide height in context: {context_data.get('slide_height')}")
        logger.info(f"PDF GEN: Slide data keys: {list(safe_slide_data.keys())}")
        
        # Render the single slide template
        try:
            # ✅ NEW: Log image fit properties before template rendering
            await log_image_fit_properties(safe_slide_data, slide_index, template_id)
            
            # ✅ NEW: Log text positioning properties for big-image-left template
            await log_text_positioning_properties(safe_slide_data, slide_index, template_id)
            
            # Additional debug logging for specific templates
            template_id = safe_slide_data.get('templateId', 'unknown')
            logger.info(f"DEBUG: Processing template: {template_id}")
            
            if template_id == 'org-chart':
                chart_data = safe_slide_data.get('props', {}).get('chartData', [])
                logger.info(f"DEBUG: org-chart chartData length: {len(chart_data)}")
                logger.info(f"DEBUG: org-chart chartData: {chart_data}")
            
            elif template_id == 'contraindications-indications':
                contraindications = safe_slide_data.get('props', {}).get('contraindications', [])
                indications = safe_slide_data.get('props', {}).get('indications', [])
                logger.info(f"DEBUG: contraindications length: {len(contraindications)}")
                logger.info(f"DEBUG: indications length: {len(indications)}")
                logger.info(f"DEBUG: contraindications: {contraindications}")
                logger.info(f"DEBUG: indications: {indications}")
            
            elif template_id == 'metrics-analytics':
                metrics = safe_slide_data.get('props', {}).get('metrics', [])
                logger.info(f"DEBUG: metrics-analytics metrics length: {len(metrics)}")
                logger.info(f"DEBUG: metrics-analytics metrics: {metrics}")
            
            # Additional debug logging for specific templates
            template_id = safe_slide_data.get('templateId', 'unknown')
            logger.info(f"DEBUG: Processing template: {template_id}")
            
            if template_id == 'org-chart':
                chart_data = safe_slide_data.get('props', {}).get('chartData', [])
                logger.info(f"DEBUG: org-chart chartData length: {len(chart_data)}")
                logger.info(f"DEBUG: org-chart chartData: {chart_data}")
            
            elif template_id == 'contraindications-indications':
                contraindications = safe_slide_data.get('props', {}).get('contraindications', [])
                indications = safe_slide_data.get('props', {}).get('indications', [])
                logger.info(f"DEBUG: contraindications length: {len(contraindications)}")
                logger.info(f"DEBUG: indications length: {len(indications)}")
                logger.info(f"DEBUG: contraindications: {contraindications}")
                logger.info(f"DEBUG: indications: {indications}")
            
            elif template_id == 'metrics-analytics':
                metrics = safe_slide_data.get('props', {}).get('metrics', [])
                logger.info(f"DEBUG: metrics-analytics metrics length: {len(metrics)}")
                logger.info(f"DEBUG: metrics-analytics metrics: {metrics}")
            
            template = jinja_env.get_template("single_slide_pdf_template.html")
            html_content = template.render(**context_data)
            logger.info("Template rendered successfully")
            
            # Log HTML content for debugging - DISABLED FOR PERFORMANCE
            # await log_html_content(html_content, slide_index, template_id)
            
        except Exception as template_error:
            logger.error(f"PDF GEN: Template rendering error for {slide_info}{template_info}: {template_error}", exc_info=True)
            # Fallback to a simple template
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head><style>
                body {{ margin: 0; padding: 40px; font-family: Arial, sans-serif; background: #f0f0f0; }}
                .slide-page {{ width: 1174px; height: 600px; background: white; padding: 40px; border-radius: 8px; }}
                .slide-content {{ display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; }}
                .slide-title {{ font-size: 32px; font-weight: bold; margin-bottom: 20px; }}
                .content {{ font-size: 18px; }}
            </style></head>
            <body>
                <div class="slide-page">
                    <div class="slide-content">
                        <div class="slide-title">{safe_slide_data.get('props', {}).get('title', 'Untitled Slide')}</div>
                        <div class="content">Slide content could not be rendered properly. Template error: {template_error}</div>
                    </div>
                </div>
            </body>
            </html>
            """
        
        # Enhanced HTML content analysis for debugging
        logger.info(f"PDF GEN: === HTML CONTENT ANALYSIS for {slide_info}{template_info} ===")
        
        # Save HTML content for debugging
        debug_html_path = f"/tmp/html_debug_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{slide_index}_{template_id}.html"
        try:
            with open(debug_html_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            logger.info(f"PDF GEN: HTML content saved to: {debug_html_path}")
        except Exception as e:
            logger.warning(f"PDF GEN: Could not save HTML debug file: {e}")
        
        # Analyze HTML content for positioning and transform issues
        html_lines = html_content.split('\n')
        logger.info(f"PDF GEN: === IMAGE PLACEHOLDER HTML ANALYSIS ===")
        
        # Look for image positioning containers
        for i, line in enumerate(html_lines, 1):
            if 'image-positioning-container' in line:
                logger.info(f"PDF GEN: Found image-positioning-container elements")
                logger.info(f"PDF GEN: Line {i}: {line.strip()}")
                
                # Look for style attributes in subsequent lines
                for j in range(i, min(i + 10, len(html_lines))):
                    if 'style=' in html_lines[j] and any(attr in html_lines[j] for attr in ['width:', 'height:', 'transform:']):
                        logger.info(f"PDF GEN:   Style line {j + 1}: {html_lines[j].strip()}")
        
        # Look for transformed images
        for i, line in enumerate(html_lines, 1):
            if 'transformed-image' in line:
                logger.info(f"PDF GEN: Found transformed-image elements")
                logger.info(f"PDF GEN: Line {i}: {line.strip()}")
                
                # Look for style attributes in subsequent lines
                for j in range(i, min(i + 10, len(html_lines))):
                    if 'style=' in html_lines[j]:
                        logger.info(f"PDF GEN:   Style line {j + 1}: {html_lines[j].strip()}")
                    if 'object-fit:' in html_lines[j]:
                        logger.info(f"PDF GEN:   Object-fit line {j + 1}: {html_lines[j].strip()}")
        
        # Look for template sections
        template_sections = ['big-image-left', 'big-image-top', 'bullet-points', 'bullet-points-right']
        for section in template_sections:
            if section in html_content:
                logger.info(f"PDF GEN: Found {section} template section")
        
        # Look for transform and object-fit attributes
        transform_count = 0
        objectfit_count = 0
        for i, line in enumerate(html_lines, 1):
            if 'transform:' in line:
                transform_count += 1
                logger.info(f"PDF GEN: Transform line {i}: {line.strip()}")
            if 'object-fit:' in line:
                objectfit_count += 1
                logger.info(f"PDF GEN: Object-fit line {i}: {line.strip()}")
        
        # Look for image data URLs
        for i, line in enumerate(html_lines, 1):
            if 'data:image/' in line and 'src=' in line:
                # Extract just the beginning of the data URL for logging
                src_start = line.find('src="data:image/')
                if src_start != -1:
                    src_end = line.find('"', src_start + 5)
                    if src_end != -1:
                        data_url_preview = line[src_start:min(src_end, src_start + 100)]
                        logger.info(f"PDF GEN: Image data URL line {i}: <img {data_url_preview}...")
        
        logger.info(f"PDF GEN: === END HTML CONTENT ANALYSIS for {slide_info}{template_info} ===")
        
        # Set content and wait for rendering
        await page.setContent(html_content)
        logger.info(f"PDF GEN: Setting HTML content in page")
        
        # Log browser console output for debugging
        await log_browser_console_output(page, slide_index, template_id)
        
        # Log transform applications for debugging
        await log_transform_applications(page, slide_data, slide_index, template_id)
        
        logger.info("Waiting for fonts to load")
        try:
            await page.waitForFunction("""
                () => {
                    // Quick font readiness check with fallback
                    if (document.fonts && document.fonts.ready) {
                        return document.fonts.ready.then(() => true);
                    }
                    // Fallback: just check if document is loaded
                    return document.readyState === 'complete';
                }
            """, timeout=5000)  # Fixed timeout to 5s instead of PDF_PAGE_TIMEOUT
        except Exception as e:
            logger.warning(f"Font loading timeout for {slide_info}{template_info}, proceeding anyway: {e}")
            # Continue with PDF generation even if fonts aren't fully loaded
        
        # Additional delay for complex rendering
        await asyncio.sleep(1)
        logger.info("Rendering delay completed")
        
        # Log computed styles - DISABLED FOR PERFORMANCE
        # await log_computed_styles(page, slide_index, template_id)
        
        # Log browser console output - DISABLED FOR PERFORMANCE
        # await log_browser_console_output(page, slide_index, template_id)
        
        # Generate PDF with exact dimensions
        await page.pdf({
            'path': output_path,
            'landscape': False,
            'printBackground': True,
            'margin': {'top': '0px', 'right': '0px', 'bottom': '0px', 'left': '0px'},
            'preferCSSPageSize': True,
            'displayHeaderFooter': False,
            'omitBackground': False
        })
        
        logger.info(f"✓ Generated PDF for {slide_info}{template_info}: {output_path}")
        return True
        
    except Exception as e:
        logger.error(f"✗ Error generating PDF for {slide_info}{template_info}: {e}", exc_info=True)
        return False
        
    finally:
        if page and not page.isClosed():
            await page.close()
        if should_close_browser and browser:
            await browser.close()

async def process_slide_batch(slides_batch: list, theme: str, browser=None) -> list:
    """
    Process a batch of slides in parallel for better performance.
    
    Args:
        slides_batch: List of (slide_data, slide_height, output_path, slide_index, template_id) tuples
        theme: The theme name
        browser: Optional browser instance to reuse
    
    Returns:
        list: List of successful output paths
    """
    tasks = []
    for slide_data, slide_height, output_path, slide_index, template_id in slides_batch:
        task = generate_single_slide_pdf(slide_data, theme, slide_height, output_path, browser, slide_index, template_id)
        tasks.append(task)
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    successful_paths = []
    for i, result in enumerate(results):
        slide_index = slides_batch[i][3] + 1  # Convert to 1-based index
        template_id = slides_batch[i][4]
        if isinstance(result, Exception):
            logger.error(f"✗ Failed to generate slide {slide_index} ({template_id}): {result}", exc_info=True)
        elif result:
            successful_paths.append(slides_batch[i][2])  # output_path
            logger.info(f"✓ Successfully generated slide {slide_index} ({template_id})")
    
    return successful_paths

@timeout_wrapper(120)  # 2 minute timeout to prevent 504 errors
async def generate_slide_deck_pdf_with_progress(
    slides_data: list,
    theme: str,
    output_filename: str,
    use_cache: bool = True
) -> AsyncGenerator[dict, None]:
    """
    Generate a PDF slide deck with progress updates yielded as async generator.
    
    Args:
        slides_data: List of slide data dictionaries
        theme: The theme name
        output_filename: The output filename
        use_cache: Whether to use caching
    
    Yields:
        dict: Progress update messages
    """
    # Always yield a start message to ensure this is detected as an async generator
    yield {'type': 'progress', 'message': 'Initializing PDF generation...', 'current': 0, 'total': len(slides_data)}
    
    pdf_path_in_cache = PDF_CACHE_DIR / output_filename
    
    if use_cache and pdf_path_in_cache.exists():
        yield {'type': 'progress', 'message': 'Using cached PDF...', 'current': len(slides_data), 'total': len(slides_data)}
        yield {'type': 'complete', 'message': 'Using cached PDF', 'path': str(pdf_path_in_cache), 'total_time': 0}
        return
    
    if not PDF_MERGER_AVAILABLE:
        yield {'type': 'error', 'message': 'PDF merging library not available'}
        return
    
    browser = None
    temp_pdf_paths = []
    start_time = time.time()
    
    try:
        # Step 1: Calculate heights for all slides in parallel
        yield {'type': 'progress', 'message': 'Calculating slide dimensions...', 'current': 0, 'total': len(slides_data)}
        browser = await pyppeteer.launch(**get_browser_launch_options())
        
        # Create tasks for parallel height calculation
        async def calculate_slide_height(slide_data, slide_index):
            template_id = slide_data.get('templateId', 'unknown')
            try:
                height = await calculate_slide_dimensions(slide_data, theme, browser)
                return height
            except Exception as e:
                logger.error(f"Failed to calculate height for slide {slide_index + 1}: {e}")
                return PDF_MIN_SLIDE_HEIGHT
        
        # Create tasks for all slides
        height_tasks = []
        for i, slide_data in enumerate(slides_data):
            task = calculate_slide_height(slide_data, i)
            height_tasks.append(task)
        
        # Execute height calculations in parallel
        import asyncio
        slide_heights = await asyncio.gather(*height_tasks, return_exceptions=True)
        
        # Convert exceptions to default height
        for i, height in enumerate(slide_heights):
            if isinstance(height, Exception):
                logger.error(f"Height calculation failed for slide {i + 1}: {height}")
                slide_heights[i] = PDF_MIN_SLIDE_HEIGHT
        
        await browser.close()
        browser = None
        
        yield {'type': 'progress', 'message': 'Starting individual slide generation...', 'current': 0, 'total': len(slides_data)}
        
        # Step 2: Generate individual PDFs
        slide_tasks = []
        for i, (slide_data, slide_height) in enumerate(zip(slides_data, slide_heights)):
            template_id = slide_data.get('templateId', 'unknown')
            temp_pdf_path = f"/tmp/slide_{i}_{uuid.uuid4().hex[:8]}.pdf"
            slide_tasks.append((slide_data, slide_height, temp_pdf_path, i, template_id))
        
        # Process slides in batches with dynamic sizing
        batch_size = get_optimal_concurrent_slides()
        successful_paths = []
        
        for batch_start in range(0, len(slide_tasks), batch_size):
            batch_end = min(batch_start + batch_size, len(slide_tasks))
            batch = slide_tasks[batch_start:batch_end]
            
            yield {'type': 'progress', 'message': f'Processing batch {batch_start//batch_size + 1}/{(len(slide_tasks) + batch_size - 1)//batch_size}...', 'current': batch_start, 'total': len(slides_data)}
            
            batch_browser = await pyppeteer.launch(**get_browser_launch_options())
            
            try:
                # Process slides in parallel within the batch
                batch_results = []
                
                # Create async tasks for parallel processing
                async def process_slide(slide_data, slide_height, temp_pdf_path, slide_index, template_id):
                    try:
                        success = await generate_single_slide_pdf(
                            slide_data, theme, slide_height, temp_pdf_path, batch_browser, slide_index, template_id
                        )
                        
                        if success:
                            return temp_pdf_path
                        else:
                            return None
                    except Exception as e:
                        logger.error(f"Error processing slide {slide_index + 1}: {e}")
                        return None
                
                # Create tasks for all slides in the batch
                tasks = []
                for slide_data, slide_height, temp_pdf_path, slide_index, template_id in batch:
                    task = process_slide(slide_data, slide_height, temp_pdf_path, slide_index, template_id)
                    tasks.append(task)
                
                # Send progress message for batch start
                yield {'type': 'progress', 'message': f'Generating {len(batch)} slides in parallel...', 'current': batch_start, 'total': len(slides_data)}
                
                # Execute all tasks in parallel
                import asyncio
                results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Process results and send individual progress updates
                for i, result in enumerate(results):
                    slide_index = batch_start + i
                    template_id = batch[i][4]  # template_id is the 5th element
                    
                    if isinstance(result, Exception):
                        logger.error(f"Task failed with exception: {result}")
                        yield {'type': 'error', 'message': f'Failed to generate slide {slide_index + 1}: {template_id}'}
                    elif result is not None:
                        batch_results.append(result)
                        yield {'type': 'progress', 'message': f'✓ Generated slide {slide_index + 1}: {template_id}', 'current': slide_index + 1, 'total': len(slides_data), 'slide_index': slide_index, 'template_id': template_id}
                    else:
                        yield {'type': 'error', 'message': f'Failed to generate slide {slide_index + 1}: {template_id}'}
                
                successful_paths.extend(batch_results)
                temp_pdf_paths.extend(batch_results)
                
            except Exception as e:
                logger.error(f"Failed to process batch: {e}")
                yield {'type': 'error', 'message': f'Failed to process slide batch: {str(e)[:200]}'}
                return
            finally:
                await batch_browser.close()
                gc.collect()
        
        if len(successful_paths) != len(slides_data):
            yield {'type': 'error', 'message': f'Only {len(successful_paths)}/{len(slides_data)} slides were generated successfully'}
            return
        
        # Step 3: Merge PDFs
        yield {'type': 'progress', 'message': f'Merging {len(temp_pdf_paths)} slide PDFs...', 'current': len(slides_data), 'total': len(slides_data)}
        
        merger = PdfMerger()
        try:
            for pdf_path in temp_pdf_paths:
                if os.path.exists(pdf_path):
                    merger.append(pdf_path)
            
            if os.path.exists(pdf_path_in_cache):
                os.remove(pdf_path_in_cache)
            
            merger.write(str(pdf_path_in_cache))
            merger.close()
            
            # Clean up temporary files
            for temp_path in temp_pdf_paths:
                try:
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
                except:
                    pass
            
            total_time = time.time() - start_time
            yield {'type': 'complete', 'message': f'PDF generation completed in {total_time:.2f}s', 'path': str(pdf_path_in_cache), 'total_time': total_time}
            
        except Exception as e:
            logger.error(f"Failed to merge PDFs: {e}")
            merger.close()
            yield {'type': 'error', 'message': f'Failed to merge PDFs: {str(e)[:200]}'}
            return
        
    except Exception as e:
        logger.error(f"Error in PDF generation: {e}")
        yield {'type': 'error', 'message': f'PDF generation failed: {str(e)[:200]}'}
    finally:
        if browser:
            await browser.close()

async def generate_slide_deck_pdf_with_dynamic_height(
    slides_data: list,
    theme: str,
    output_filename: str,
    use_cache: bool = True
) -> str:
    """
    Generate a PDF slide deck with dynamic height per slide.
    OPTIMIZED VERSION with better resource management and parallel processing.
    
    Args:
        slides_data: List of slide data dictionaries
        theme: The theme name
        output_filename: The output filename
        use_cache: Whether to use caching
    
    Returns:
        str: Path to the generated PDF
    """
    pdf_path_in_cache = PDF_CACHE_DIR / output_filename
    
    if use_cache and pdf_path_in_cache.exists():
        logger.info(f"PDF CACHE: Serving cached PDF: {pdf_path_in_cache}")
        return str(pdf_path_in_cache)
    
    if not PDF_MERGER_AVAILABLE:
        raise HTTPException(status_code=500, detail="PDF merging library not available. Install PyPDF2 or pypdf.")
    
    browser = None
    temp_pdf_paths = []
    start_time = time.time()
    
    try:
        logger.info(f"Generating slide deck PDF with {len(slides_data)} slides, theme: {theme}")
        
        # Step 1: Calculate heights for all slides with a single browser instance
        logger.info("Calculating slide heights...")
        browser = await pyppeteer.launch(**get_browser_launch_options())
        
        slide_heights = []
        for i, slide_data in enumerate(slides_data):
            template_id = slide_data.get('templateId', 'unknown')
            logger.info(f"Calculating height for slide {i + 1}/{len(slides_data)} (templateId: {template_id})")
            try:
                height = await calculate_slide_dimensions(slide_data, theme, browser)
                slide_heights.append(height)
                logger.info(f"✓ Slide {i + 1} ({template_id}) height calculated: {height}px")
            except Exception as e:
                logger.error(f"✗ Failed to calculate height for slide {i + 1} ({template_id}): {e}", exc_info=True)
                slide_heights.append(PDF_MIN_SLIDE_HEIGHT)
        
        # Close the height calculation browser to free memory
        await browser.close()
        browser = None
        
        # Step 2: Generate individual PDFs in batches for better performance
        logger.info("Generating individual slide PDFs...")
        
        # Create temporary paths for all slides
        slide_tasks = []
        for i, (slide_data, slide_height) in enumerate(zip(slides_data, slide_heights)):
            template_id = slide_data.get('templateId', 'unknown')
            temp_pdf_path = f"/tmp/slide_{i}_{uuid.uuid4().hex[:8]}.pdf"
            slide_tasks.append((slide_data, slide_height, temp_pdf_path, i, template_id))
        
        # Process slides in batches to avoid memory issues
        batch_size = MAX_CONCURRENT_SLIDES
        successful_paths = []
        
        for batch_start in range(0, len(slide_tasks), batch_size):
            batch_end = min(batch_start + batch_size, len(slide_tasks))
            batch = slide_tasks[batch_start:batch_end]
            
            logger.info(f"Processing batch {batch_start//batch_size + 1}/{(len(slide_tasks) + batch_size - 1)//batch_size} ({len(batch)} slides)")
            
            # Log batch details
            for slide_data, slide_height, temp_pdf_path, slide_index, template_id in batch:
                logger.info(f"  - Slide {slide_index + 1} ({template_id}): height={slide_height}px, output={temp_pdf_path}")
            
            # Launch a new browser for each batch to prevent memory accumulation
            batch_browser = await pyppeteer.launch(**get_browser_launch_options())
            
            try:
                batch_results = await process_slide_batch(batch, theme, batch_browser)
                successful_paths.extend(batch_results)
                temp_pdf_paths.extend(batch_results)
            except Exception as e:
                logger.error(f"Failed to process batch: {e}", exc_info=True)
                # Clean up any generated PDFs in this batch
                for _, _, path, slide_index, template_id in batch:
                    try:
                        if os.path.exists(path):
                            os.remove(path)
                    except:
                        pass
                raise HTTPException(status_code=500, detail=f"Failed to process slide batch: {str(e)[:200]}")
            finally:
                await batch_browser.close()
                # Force garbage collection after each batch
                gc.collect()
        
        if len(successful_paths) != len(slides_data):
            logger.error(f"Only {len(successful_paths)}/{len(slides_data)} slides were generated successfully")
            # Clean up any generated PDFs
            for path in temp_pdf_paths:
                try:
                    os.remove(path)
                except:
                    pass
            raise HTTPException(status_code=500, detail=f"Failed to generate all slides. Only {len(successful_paths)}/{len(slides_data)} were successful.")
        
        # Step 3: Merge all PDFs into final document
        logger.info(f"Merging {len(temp_pdf_paths)} slide PDFs...")
        merger = PdfMerger()
        
        try:
            for pdf_path in temp_pdf_paths:
                if os.path.exists(pdf_path):
                    merger.append(pdf_path)
                else:
                    logger.warning(f"PDF file not found: {pdf_path}")
            
            # Write the merged PDF
            if os.path.exists(pdf_path_in_cache):
                os.remove(pdf_path_in_cache)
            
            merger.write(str(pdf_path_in_cache))
            merger.close()
            
        except Exception as e:
            logger.error(f"Failed to merge PDFs: {e}")
            merger.close()
            raise HTTPException(status_code=500, detail=f"Failed to merge PDFs: {str(e)[:200]}")
        
        # Clean up temporary PDF files
        for pdf_path in temp_pdf_paths:
            try:
                if os.path.exists(pdf_path):
                    os.remove(pdf_path)
            except Exception as e:
                logger.warning(f"Failed to clean up temporary PDF {pdf_path}: {e}")
        
        total_time = time.time() - start_time
        logger.info(f"Slide deck PDF generated successfully in {total_time:.2f}s: {pdf_path_in_cache}")
        return str(pdf_path_in_cache)
        
    except Exception as e:
        logger.error(f"Error generating slide deck PDF: {e}", exc_info=True)
        
        # Clean up any generated PDFs
        for path in temp_pdf_paths:
            try:
                if os.path.exists(path):
                    os.remove(path)
            except:
                pass
        
        raise HTTPException(status_code=500, detail=f"Failed to generate slide deck PDF: {str(e)[:200]}")
        
    finally:
        if browser:
            try:
                await browser.close()
            except:
                pass
        # Force garbage collection
        gc.collect()

async def test_single_slide_generation(slide_data: dict, theme: str, slide_index: int = None) -> dict:
    """
    Test generation of a single slide in isolation to identify issues.
    
    Args:
        slide_data: The slide data dictionary
        theme: The theme name
        slide_index: Optional slide index for logging
    
    Returns:
        dict: Test results with success status and details
    """
    template_id = slide_data.get('templateId', 'unknown')
    slide_info = f"slide {slide_index}" if slide_index else "slide"
    
    logger.info(f"🧪 Testing {slide_info} ({template_id}) in isolation...")
    
    result = {
        'success': False,
        'slide_index': slide_index,
        'template_id': template_id,
        'error': None,
        'height_calculation_success': False,
        'pdf_generation_success': False,
        'calculated_height': None
    }
    
    browser = None
    temp_pdf_path = None
    
    try:
        # Test 1: Height calculation
        logger.info(f"  📏 Testing height calculation for {slide_info} ({template_id})...")
        try:
            browser = await pyppeteer.launch(**get_browser_launch_options())
            height = await calculate_slide_dimensions(slide_data, theme, browser)
            result['height_calculation_success'] = True
            result['calculated_height'] = height
            logger.info(f"  ✅ Height calculation successful: {height}px")
        except Exception as e:
            result['error'] = f"Height calculation failed: {str(e)}"
            logger.error(f"  ❌ Height calculation failed for {slide_info} ({template_id}): {e}", exc_info=True)
            return result
        finally:
            if browser:
                await browser.close()
                browser = None
        
        # Test 2: PDF generation
        logger.info(f"  📄 Testing PDF generation for {slide_info} ({template_id})...")
        try:
            temp_pdf_path = f"/tmp/test_slide_{slide_index}_{uuid.uuid4().hex[:8]}.pdf"
            browser = await pyppeteer.launch(**get_browser_launch_options())
            success = await generate_single_slide_pdf(slide_data, theme, result['calculated_height'], temp_pdf_path, browser, slide_index, template_id)
            
            if success:
                result['pdf_generation_success'] = True
                result['success'] = True
                logger.info(f"  ✅ PDF generation successful: {temp_pdf_path}")
            else:
                result['error'] = "PDF generation returned False"
                logger.error(f"  ❌ PDF generation returned False for {slide_info} ({template_id})")
        except Exception as e:
            result['error'] = f"PDF generation failed: {str(e)}"
            logger.error(f"  ❌ PDF generation failed for {slide_info} ({template_id}): {e}", exc_info=True)
        finally:
            if browser:
                await browser.close()
        
        return result
        
    except Exception as e:
        result['error'] = f"General test failure: {str(e)}"
        logger.error(f"  ❌ General test failure for {slide_info} ({template_id}): {e}", exc_info=True)
        return result
    finally:
        # Clean up temporary file
        if temp_pdf_path and os.path.exists(temp_pdf_path):
            try:
                os.remove(temp_pdf_path)
            except:
                pass

async def test_all_slides_individually(slides_data: list, theme: str) -> dict:
    """
    Test each slide individually to identify which one is causing issues.
    
    Args:
        slides_data: List of slide data dictionaries
        theme: The theme name
    
    Returns:
        dict: Summary of test results
    """
    logger.info(f"🧪 Testing all {len(slides_data)} slides individually...")
    
    results = []
    failed_slides = []
    
    for i, slide_data in enumerate(slides_data):
        slide_index = i + 1  # 1-based index
        result = await test_single_slide_generation(slide_data, theme, slide_index)
        results.append(result)
        
        if not result['success']:
            failed_slides.append({
                'slide_index': slide_index,
                'template_id': result['template_id'],
                'error': result['error']
            })
    
    # Summary
    successful_count = len([r for r in results if r['success']])
    failed_count = len(failed_slides)
    
    summary = {
        'total_slides': len(slides_data),
        'successful_slides': successful_count,
        'failed_slides': failed_count,
        'failed_slide_details': failed_slides,
        'all_results': results
    }
    
    logger.info(f"🧪 Individual slide test summary:")
    logger.info(f"  📊 Total slides: {summary['total_slides']}")
    logger.info(f"  ✅ Successful: {summary['successful_slides']}")
    logger.info(f"  ❌ Failed: {summary['failed_slides']}")
    
    if failed_slides:
        logger.error(f"  🚨 Failed slides:")
        for failed in failed_slides:
            logger.error(f"    - Slide {failed['slide_index']} ({failed['template_id']}): {failed['error']}")
    
    return summary

async def log_text_positioning_properties(slide_data: dict, slide_index: int = None, template_id: str = None):
    """Log text positioning properties specifically for debugging text positioning in PDF."""
    slide_info = f"slide {slide_index}" if slide_index else "slide"
    template_info = f" ({template_id})" if template_id else ""
    
    logger.info(f"=== TEXT POSITIONING ANALYSIS for {slide_info}{template_info} ===")
    
    if isinstance(slide_data, dict):
        template_id = slide_data.get('templateId', 'Unknown')
        props = slide_data.get('props', {})
        metadata = slide_data.get('metadata', {})
        
        # Check if this is a big-image-left template
        if template_id == 'big-image-left':
            logger.info(f"Template: {template_id}")
            
            # Log text content
            title = props.get('title', 'NOT SET')
            subtitle = props.get('subtitle', 'NOT SET')
            logger.info(f"Title: '{title}'")
            logger.info(f"Subtitle: '{subtitle}'")
            
            # Log metadata and element positions
            element_positions = metadata.get('elementPositions', {})
            logger.info(f"Metadata exists: {bool(metadata)}")
            logger.info(f"Element positions exist: {bool(element_positions)}")
            logger.info(f"Element positions keys: {list(element_positions.keys()) if element_positions else 'None'}")
            
            # Log specific element positions for big-image-left template
            slide_id = slide_data.get('slideId', 'unknown')
            title_id = f'draggable-{slide_id}-0'
            subtitle_id = f'draggable-{slide_id}-1'
            
            title_position = element_positions.get(title_id)
            subtitle_position = element_positions.get(subtitle_id)
            
            logger.info(f"Title element ID: {title_id}")
            logger.info(f"Title position: {title_position}")
            logger.info(f"Subtitle element ID: {subtitle_id}")
            logger.info(f"Subtitle position: {subtitle_position}")
            
            # Log what the template will receive
            logger.info(f"Template will receive title position: {title_position}")
            logger.info(f"Template will receive subtitle position: {subtitle_position}")
            
            # Log all props keys to see what's available
            logger.info(f"All props keys: {list(props.keys())}")
            logger.info(f"All metadata keys: {list(metadata.keys()) if metadata else 'None'}")
            
            # Check for any text-specific positioning properties
            text_position = props.get('textPosition')
            text_transform = props.get('textTransform')
            text_align = props.get('textAlign')
            
            logger.info(f"Text position prop: {text_position}")
            logger.info(f"Text transform prop: {text_transform}")
            logger.info(f"Text align prop: {text_align}")
            
            # Log image info without base64 data
            image_path = props.get('imagePath', '')
            if image_path:
                if image_path.startswith('data:'):
                    logger.info(f"Image: [BASE64 DATA URL - {len(image_path)} characters]")
                else:
                    logger.info(f"Image: {image_path}")
            else:
                logger.info(f"Image: NOT SET")
            
            # Log the complete slide data structure for debugging (excluding base64)
            logger.info(f"Complete slide data structure:")
            logger.info(f"  templateId: {slide_data.get('templateId')}")
            logger.info(f"  slideId: {slide_data.get('slideId')}")
            logger.info(f"  props keys: {list(props.keys())}")
            logger.info(f"  metadata keys: {list(metadata.keys()) if metadata else 'None'}")
    
    logger.info(f"=== END TEXT POSITIONING ANALYSIS for {slide_info}{template_info} ===")