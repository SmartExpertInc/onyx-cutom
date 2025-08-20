#!/usr/bin/env python3
"""
Slide Image Generator Service
============================

This module provides functionality to generate slide images from component-based slide data
for use in video lesson creation. It converts slide templates to static images that can be
used as backgrounds for avatar videos.

Key Features:
- Convert component-based slides to static images
- Support for all slide template types
- Theme-aware rendering
- High-quality image output
- Background color customization
- Error handling and validation
"""

import os
import sys
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass
from pathlib import Path
import base64
from io import BytesIO

# For image generation, we'll use a headless browser approach
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False
    logging.warning("Selenium not available. Using fallback image generation.")

# Configure logging
logger = logging.getLogger(__name__)

@dataclass
class SlideImageConfig:
    """Configuration for slide image generation"""
    width: int = 1920
    height: int = 1080
    format: str = "png"
    quality: int = 95
    background_color: str = "#ffffff"
    output_dir: str = "slide_images"
    chrome_options: Optional[List[str]] = None

@dataclass
class SlideImageResult:
    """Result of slide image generation"""
    image_path: str
    slide_id: str
    slide_title: str
    success: bool
    error_message: Optional[str] = None
    file_size: Optional[int] = None

class SlideImageGenerator:
    """Service for generating slide images from component-based slide data"""
    
    def __init__(self, config: SlideImageConfig = None):
        """Initialize the slide image generator."""
        self.config = config or SlideImageConfig()
        self._ensure_output_dir()
        self.driver = None
        
        logger.info("Slide Image Generator initialized")
        logger.info(f"Configuration: {self.config}")
    
    def _ensure_output_dir(self):
        """Ensure the output directory exists."""
        os.makedirs(self.config.output_dir, exist_ok=True)
    
    def _setup_webdriver(self):
        """Setup headless Chrome webdriver for image generation."""
        if not SELENIUM_AVAILABLE:
            raise RuntimeError("Selenium is required for slide image generation")
        
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument(f"--window-size={self.config.width},{self.config.height}")
        
        if self.config.chrome_options:
            for option in self.config.chrome_options:
                chrome_options.add_argument(option)
        
        self.driver = webdriver.Chrome(options=chrome_options)
        logger.info("WebDriver initialized")
    
    def _cleanup_webdriver(self):
        """Clean up the webdriver."""
        if self.driver:
            self.driver.quit()
            self.driver = None
            logger.info("WebDriver cleaned up")
    
    def _create_slide_html(self, slide_data: Dict[str, Any], theme_data: Dict[str, Any] = None) -> str:
        """
        Create HTML for a slide based on its template and props.
        
        Args:
            slide_data: Component-based slide data
            theme_data: Theme configuration data
            
        Returns:
            HTML string for the slide
        """
        template_id = slide_data.get('templateId', 'content-slide')
        props = slide_data.get('props', {})
        slide_title = slide_data.get('slideTitle', 'Untitled Slide')
        
        # Default theme colors
        theme_colors = {
            'primary': '#1a1a1a',
            'secondary': '#666666',
            'accent': '#007bff',
            'background': self.config.background_color,
            'text': '#333333'
        }
        
        if theme_data and 'colors' in theme_data:
            theme_colors.update(theme_data['colors'])
        
        # Create HTML based on template type
        if template_id == 'title-slide':
            return self._create_title_slide_html(slide_title, props, theme_colors)
        elif template_id == 'hero-title-slide':
            return self._create_hero_title_slide_html(slide_title, props, theme_colors)
        elif template_id == 'bullet-points':
            return self._create_bullet_points_html(slide_title, props, theme_colors)
        elif template_id == 'content-slide':
            return self._create_content_slide_html(slide_title, props, theme_colors)
        elif template_id == 'two-column':
            return self._create_two_column_html(slide_title, props, theme_colors)
        elif template_id == 'process-steps':
            return self._create_process_steps_html(slide_title, props, theme_colors)
        elif template_id == 'comparison-slide':
            return self._create_comparison_slide_html(slide_title, props, theme_colors)
        elif template_id == 'four-box-grid':
            return self._create_four_box_grid_html(slide_title, props, theme_colors)
        elif template_id == 'big-numbers':
            return self._create_big_numbers_html(slide_title, props, theme_colors)
        elif template_id == 'pyramid':
            return self._create_pyramid_html(slide_title, props, theme_colors)
        elif template_id == 'timeline':
            return self._create_timeline_html(slide_title, props, theme_colors)
        else:
            # Fallback to content slide
            return self._create_content_slide_html(slide_title, props, theme_colors)
    
    def _create_title_slide_html(self, title: str, props: Dict[str, Any], colors: Dict[str, str]) -> str:
        """Create HTML for title slide."""
        subtitle = props.get('subtitle', '')
        author = props.get('author', '')
        date = props.get('date', '')
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{title}</title>
            <style>
                body {{
                    margin: 0;
                    padding: 0;
                    width: {self.config.width}px;
                    height: {self.config.height}px;
                    background-color: {colors['background']};
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    color: {colors['text']};
                }}
                .title {{
                    font-size: 48px;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 20px;
                    color: {colors['primary']};
                }}
                .subtitle {{
                    font-size: 24px;
                    text-align: center;
                    margin-bottom: 40px;
                    color: {colors['secondary']};
                }}
                .author {{
                    font-size: 18px;
                    text-align: center;
                    margin-bottom: 10px;
                    color: {colors['secondary']};
                }}
                .date {{
                    font-size: 16px;
                    text-align: center;
                    color: {colors['secondary']};
                }}
            </style>
        </head>
        <body>
            <div class="title">{title}</div>
            {f'<div class="subtitle">{subtitle}</div>' if subtitle else ''}
            {f'<div class="author">{author}</div>' if author else ''}
            {f'<div class="date">{date}</div>' if date else ''}
        </body>
        </html>
        """
    
    def _create_hero_title_slide_html(self, title: str, props: Dict[str, Any], colors: Dict[str, str]) -> str:
        """Create HTML for hero title slide."""
        subtitle = props.get('subtitle', '')
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{title}</title>
            <style>
                body {{
                    margin: 0;
                    padding: 0;
                    width: {self.config.width}px;
                    height: {self.config.height}px;
                    background-color: {colors['background']};
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    color: {colors['text']};
                }}
                .hero-title {{
                    font-size: 72px;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 30px;
                    color: {colors['primary']};
                    line-height: 1.2;
                }}
                .hero-subtitle {{
                    font-size: 32px;
                    text-align: center;
                    color: {colors['secondary']};
                    max-width: 80%;
                    line-height: 1.4;
                }}
            </style>
        </head>
        <body>
            <div class="hero-title">{title}</div>
            {f'<div class="hero-subtitle">{subtitle}</div>' if subtitle else ''}
        </body>
        </html>
        """
    
    def _create_bullet_points_html(self, title: str, props: Dict[str, Any], colors: Dict[str, str]) -> str:
        """Create HTML for bullet points slide."""
        bullets = props.get('bullets', [])
        max_columns = props.get('maxColumns', 1)
        
        bullet_html = ""
        for i, bullet in enumerate(bullets):
            bullet_html += f'<li>{bullet}</li>'
        
        columns_style = f"grid-template-columns: repeat({max_columns}, 1fr);" if max_columns > 1 else ""
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{title}</title>
            <style>
                body {{
                    margin: 0;
                    padding: 40px;
                    width: {self.config.width}px;
                    height: {self.config.height}px;
                    background-color: {colors['background']};
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: {colors['text']};
                }}
                .title {{
                    font-size: 36px;
                    font-weight: bold;
                    margin-bottom: 30px;
                    color: {colors['primary']};
                }}
                .bullets {{
                    display: grid;
                    {columns_style}
                    gap: 20px;
                    list-style: none;
                    padding: 0;
                }}
                .bullets li {{
                    font-size: 24px;
                    line-height: 1.5;
                    padding: 15px;
                    background-color: rgba(0, 123, 255, 0.1);
                    border-left: 4px solid {colors['accent']};
                    border-radius: 4px;
                }}
            </style>
        </head>
        <body>
            <div class="title">{title}</div>
            <ul class="bullets">{bullet_html}</ul>
        </body>
        </html>
        """
    
    def _create_content_slide_html(self, title: str, props: Dict[str, Any], colors: Dict[str, str]) -> str:
        """Create HTML for content slide."""
        content = props.get('content', '')
        alignment = props.get('alignment', 'left')
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{title}</title>
            <style>
                body {{
                    margin: 0;
                    padding: 40px;
                    width: {self.config.width}px;
                    height: {self.config.height}px;
                    background-color: {colors['background']};
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: {colors['text']};
                }}
                .title {{
                    font-size: 36px;
                    font-weight: bold;
                    margin-bottom: 30px;
                    color: {colors['primary']};
                }}
                .content {{
                    font-size: 24px;
                    line-height: 1.6;
                    text-align: {alignment};
                    white-space: pre-wrap;
                }}
            </style>
        </head>
        <body>
            <div class="title">{title}</div>
            <div class="content">{content}</div>
        </body>
        </html>
        """
    
    def _create_two_column_html(self, title: str, props: Dict[str, Any], colors: Dict[str, str]) -> str:
        """Create HTML for two-column slide."""
        left_title = props.get('leftTitle', 'Left Column')
        left_content = props.get('leftContent', '')
        right_title = props.get('rightTitle', 'Right Column')
        right_content = props.get('rightContent', '')
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{title}</title>
            <style>
                body {{
                    margin: 0;
                    padding: 40px;
                    width: {self.config.width}px;
                    height: {self.config.height}px;
                    background-color: {colors['background']};
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: {colors['text']};
                }}
                .title {{
                    font-size: 36px;
                    font-weight: bold;
                    margin-bottom: 30px;
                    color: {colors['primary']};
                }}
                .columns {{
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                    height: calc(100% - 100px);
                }}
                .column {{
                    padding: 20px;
                    background-color: rgba(0, 123, 255, 0.05);
                    border-radius: 8px;
                }}
                .column-title {{
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 15px;
                    color: {colors['primary']};
                }}
                .column-content {{
                    font-size: 18px;
                    line-height: 1.5;
                }}
            </style>
        </head>
        <body>
            <div class="title">{title}</div>
            <div class="columns">
                <div class="column">
                    <div class="column-title">{left_title}</div>
                    <div class="column-content">{left_content}</div>
                </div>
                <div class="column">
                    <div class="column-title">{right_title}</div>
                    <div class="column-content">{right_content}</div>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _create_process_steps_html(self, title: str, props: Dict[str, Any], colors: Dict[str, str]) -> str:
        """Create HTML for process steps slide."""
        steps = props.get('steps', [])
        layout = props.get('layout', 'vertical')
        
        steps_html = ""
        for i, step in enumerate(steps, 1):
            steps_html += f"""
                <div class="step">
                    <div class="step-number">{i}</div>
                    <div class="step-content">{step}</div>
                </div>
            """
        
        layout_style = "flex-direction: row;" if layout == "horizontal" else "flex-direction: column;"
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{title}</title>
            <style>
                body {{
                    margin: 0;
                    padding: 40px;
                    width: {self.config.width}px;
                    height: {self.config.height}px;
                    background-color: {colors['background']};
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: {colors['text']};
                }}
                .title {{
                    font-size: 36px;
                    font-weight: bold;
                    margin-bottom: 30px;
                    color: {colors['primary']};
                }}
                .steps {{
                    display: flex;
                    {layout_style}
                    gap: 20px;
                    justify-content: space-around;
                }}
                .step {{
                    display: flex;
                    align-items: center;
                    padding: 20px;
                    background-color: rgba(0, 123, 255, 0.1);
                    border-radius: 8px;
                    flex: 1;
                }}
                .step-number {{
                    font-size: 32px;
                    font-weight: bold;
                    color: {colors['accent']};
                    margin-right: 15px;
                    min-width: 50px;
                }}
                .step-content {{
                    font-size: 18px;
                    line-height: 1.4;
                }}
            </style>
        </head>
        <body>
            <div class="title">{title}</div>
            <div class="steps">{steps_html}</div>
        </body>
        </html>
        """
    
    def _create_comparison_slide_html(self, title: str, props: Dict[str, Any], colors: Dict[str, str]) -> str:
        """Create HTML for comparison slide."""
        before_title = props.get('beforeTitle', 'Before')
        before_content = props.get('beforeContent', '')
        after_title = props.get('afterTitle', 'After')
        after_content = props.get('afterContent', '')
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{title}</title>
            <style>
                body {{
                    margin: 0;
                    padding: 40px;
                    width: {self.config.width}px;
                    height: {self.config.height}px;
                    background-color: {colors['background']};
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: {colors['text']};
                }}
                .title {{
                    font-size: 36px;
                    font-weight: bold;
                    margin-bottom: 30px;
                    color: {colors['primary']};
                }}
                .comparison {{
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                    height: calc(100% - 100px);
                }}
                .column {{
                    padding: 20px;
                    border-radius: 8px;
                }}
                .before {{
                    background-color: rgba(220, 53, 69, 0.1);
                    border: 2px solid #dc3545;
                }}
                .after {{
                    background-color: rgba(40, 167, 69, 0.1);
                    border: 2px solid #28a745;
                }}
                .column-title {{
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 15px;
                }}
                .before .column-title {{
                    color: #dc3545;
                }}
                .after .column-title {{
                    color: #28a745;
                }}
                .column-content {{
                    font-size: 18px;
                    line-height: 1.5;
                }}
            </style>
        </head>
        <body>
            <div class="title">{title}</div>
            <div class="comparison">
                <div class="column before">
                    <div class="column-title">{before_title}</div>
                    <div class="column-content">{before_content}</div>
                </div>
                <div class="column after">
                    <div class="column-title">{after_title}</div>
                    <div class="column-content">{after_content}</div>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _create_four_box_grid_html(self, title: str, props: Dict[str, Any], colors: Dict[str, str]) -> str:
        """Create HTML for four-box grid slide."""
        boxes = props.get('boxes', [])
        
        boxes_html = ""
        for i, box in enumerate(boxes[:4]):  # Limit to 4 boxes
            boxes_html += f"""
                <div class="box">
                    <div class="box-number">{i+1}</div>
                    <div class="box-content">{box}</div>
                </div>
            """
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{title}</title>
            <style>
                body {{
                    margin: 0;
                    padding: 40px;
                    width: {self.config.width}px;
                    height: {self.config.height}px;
                    background-color: {colors['background']};
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: {colors['text']};
                }}
                .title {{
                    font-size: 36px;
                    font-weight: bold;
                    margin-bottom: 30px;
                    color: {colors['primary']};
                }}
                .grid {{
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: 1fr 1fr;
                    gap: 20px;
                    height: calc(100% - 100px);
                }}
                .box {{
                    padding: 20px;
                    background-color: rgba(0, 123, 255, 0.1);
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }}
                .box-number {{
                    font-size: 32px;
                    font-weight: bold;
                    color: {colors['accent']};
                    margin-bottom: 10px;
                }}
                .box-content {{
                    font-size: 18px;
                    line-height: 1.4;
                }}
            </style>
        </head>
        <body>
            <div class="title">{title}</div>
            <div class="grid">{boxes_html}</div>
        </body>
        </html>
        """
    
    def _create_big_numbers_html(self, title: str, props: Dict[str, Any], colors: Dict[str, str]) -> str:
        """Create HTML for big numbers slide."""
        items = props.get('items', [])
        
        items_html = ""
        for item in items:
            value = item.get('value', '')
            label = item.get('label', '')
            description = item.get('description', '')
            
            items_html += f"""
                <div class="item">
                    <div class="value">{value}</div>
                    <div class="label">{label}</div>
                    <div class="description">{description}</div>
                </div>
            """
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{title}</title>
            <style>
                body {{
                    margin: 0;
                    padding: 40px;
                    width: {self.config.width}px;
                    height: {self.config.height}px;
                    background-color: {colors['background']};
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: {colors['text']};
                }}
                .title {{
                    font-size: 36px;
                    font-weight: bold;
                    margin-bottom: 30px;
                    color: {colors['primary']};
                }}
                .items {{
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 30px;
                    height: calc(100% - 100px);
                }}
                .item {{
                    padding: 30px;
                    background-color: rgba(0, 123, 255, 0.1);
                    border-radius: 8px;
                    text-align: center;
                }}
                .value {{
                    font-size: 48px;
                    font-weight: bold;
                    color: {colors['accent']};
                    margin-bottom: 10px;
                }}
                .label {{
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: {colors['primary']};
                }}
                .description {{
                    font-size: 16px;
                    line-height: 1.4;
                    color: {colors['secondary']};
                }}
            </style>
        </head>
        <body>
            <div class="title">{title}</div>
            <div class="items">{items_html}</div>
        </body>
        </html>
        """
    
    def _create_pyramid_html(self, title: str, props: Dict[str, Any], colors: Dict[str, str]) -> str:
        """Create HTML for pyramid slide."""
        items = props.get('items', [])
        
        items_html = ""
        for i, item in enumerate(items):
            items_html += f"""
                <div class="pyramid-item" style="width: {100 - (i * 15)}%;">
                    <div class="item-content">{item}</div>
                </div>
            """
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{title}</title>
            <style>
                body {{
                    margin: 0;
                    padding: 40px;
                    width: {self.config.width}px;
                    height: {self.config.height}px;
                    background-color: {colors['background']};
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: {colors['text']};
                }}
                .title {{
                    font-size: 36px;
                    font-weight: bold;
                    margin-bottom: 30px;
                    color: {colors['primary']};
                }}
                .pyramid {{
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    height: calc(100% - 100px);
                }}
                .pyramid-item {{
                    padding: 20px;
                    background-color: rgba(0, 123, 255, 0.1);
                    border-radius: 8px;
                    text-align: center;
                    transition: width 0.3s ease;
                }}
                .item-content {{
                    font-size: 18px;
                    line-height: 1.4;
                }}
            </style>
        </head>
        <body>
            <div class="title">{title}</div>
            <div class="pyramid">{items_html}</div>
        </body>
        </html>
        """
    
    def _create_timeline_html(self, title: str, props: Dict[str, Any], colors: Dict[str, str]) -> str:
        """Create HTML for timeline slide."""
        steps = props.get('steps', [])
        
        steps_html = ""
        for i, step in enumerate(steps):
            steps_html += f"""
                <div class="timeline-item">
                    <div class="timeline-marker">{i+1}</div>
                    <div class="timeline-content">{step}</div>
                </div>
            """
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{title}</title>
            <style>
                body {{
                    margin: 0;
                    padding: 40px;
                    width: {self.config.width}px;
                    height: {self.config.height}px;
                    background-color: {colors['background']};
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: {colors['text']};
                }}
                .title {{
                    font-size: 36px;
                    font-weight: bold;
                    margin-bottom: 30px;
                    color: {colors['primary']};
                }}
                .timeline {{
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    height: calc(100% - 100px);
                }}
                .timeline-item {{
                    display: flex;
                    align-items: center;
                    padding: 15px;
                    background-color: rgba(0, 123, 255, 0.1);
                    border-radius: 8px;
                }}
                .timeline-marker {{
                    font-size: 24px;
                    font-weight: bold;
                    color: {colors['accent']};
                    margin-right: 20px;
                    min-width: 40px;
                }}
                .timeline-content {{
                    font-size: 18px;
                    line-height: 1.4;
                }}
            </style>
        </head>
        <body>
            <div class="title">{title}</div>
            <div class="timeline">{steps_html}</div>
        </body>
        </html>
        """
    
    def generate_slide_image(self, slide_data: Dict[str, Any], theme_data: Dict[str, Any] = None) -> SlideImageResult:
        """
        Generate an image for a single slide.
        
        Args:
            slide_data: Component-based slide data
            theme_data: Theme configuration data
            
        Returns:
            SlideImageResult with image information
        """
        slide_id = slide_data.get('slideId', 'unknown')
        slide_title = slide_data.get('slideTitle', 'Untitled Slide')
        
        logger.info(f"Generating image for slide: {slide_title}")
        
        try:
            # Create HTML for the slide
            html_content = self._create_slide_html(slide_data, theme_data)
            
            # Setup webdriver if not already done
            if not self.driver:
                self._setup_webdriver()
            
            # Create temporary HTML file
            temp_html_path = os.path.join(self.config.output_dir, f"temp_{slide_id}.html")
            with open(temp_html_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            # Load the HTML in the browser
            self.driver.get(f"file://{os.path.abspath(temp_html_path)}")
            
            # Wait for page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Take screenshot
            output_filename = f"slide_{slide_id}.{self.config.format}"
            output_path = os.path.join(self.config.output_dir, output_filename)
            
            self.driver.save_screenshot(output_path)
            
            # Clean up temporary HTML file
            os.remove(temp_html_path)
            
            # Get file size
            file_size = os.path.getsize(output_path)
            
            logger.info(f"Slide image generated successfully: {output_path}")
            
            return SlideImageResult(
                image_path=output_path,
                slide_id=slide_id,
                slide_title=slide_title,
                success=True,
                file_size=file_size
            )
            
        except Exception as e:
            logger.error(f"Error generating slide image: {str(e)}")
            return SlideImageResult(
                image_path="",
                slide_id=slide_id,
                slide_title=slide_title,
                success=False,
                error_message=str(e)
            )
    
    def generate_slide_deck_images(self, slide_deck: Dict[str, Any], theme_data: Dict[str, Any] = None) -> List[SlideImageResult]:
        """
        Generate images for all slides in a slide deck.
        
        Args:
            slide_deck: Component-based slide deck data
            theme_data: Theme configuration data
            
        Returns:
            List of SlideImageResult for each slide
        """
        slides = slide_deck.get('slides', [])
        logger.info(f"Generating images for {len(slides)} slides")
        
        results = []
        
        try:
            for i, slide_data in enumerate(slides):
                logger.info(f"Processing slide {i+1}/{len(slides)}")
                result = self.generate_slide_image(slide_data, theme_data)
                results.append(result)
                
                if result.success:
                    logger.info(f"Slide {i+1} completed: {result.image_path}")
                else:
                    logger.error(f"Slide {i+1} failed: {result.error_message}")
            
            logger.info(f"Slide deck image generation completed. {sum(1 for r in results if r.success)}/{len(results)} slides successful")
            
        except Exception as e:
            logger.error(f"Error generating slide deck images: {str(e)}")
        
        finally:
            # Clean up webdriver
            self._cleanup_webdriver()
        
        return results
    
    def cleanup(self):
        """Clean up resources."""
        self._cleanup_webdriver()


# Factory function to create slide image generator
def create_slide_image_generator(config: SlideImageConfig = None) -> SlideImageGenerator:
    """Create and return a slide image generator instance."""
    return SlideImageGenerator(config)


if __name__ == "__main__":
    # Test the generator
    try:
        generator = create_slide_image_generator()
        
        # Test with sample slide data
        test_slide = {
            'slideId': 'test_slide_1',
            'slideTitle': 'Test Slide',
            'templateId': 'title-slide',
            'props': {
                'title': 'Test Title',
                'subtitle': 'Test Subtitle',
                'author': 'Test Author',
                'date': '2024-01-01'
            }
        }
        
        result = generator.generate_slide_image(test_slide)
        
        if result.success:
            print(f"Test successful: {result.image_path}")
        else:
            print(f"Test failed: {result.error_message}")
            
    except Exception as e:
        print(f"Test failed: {e}")
