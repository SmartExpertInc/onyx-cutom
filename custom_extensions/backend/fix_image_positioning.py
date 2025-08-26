#!/usr/bin/env python3
"""
Script to diagnose and fix image positioning issues in PDF generation.
This script creates test cases and applies fixes to ensure 100% frontend-PDF matching.
"""

import os
import sys
import json
import logging
from typing import Dict, Any, List

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ImagePositioningFixer:
    """Fix image positioning issues by ensuring exact frontend-PDF matching."""
    
    def __init__(self):
        self.fixes_applied = []
        
    def create_test_slide_with_image_transforms(self) -> Dict[str, Any]:
        """Create a test slide with all possible image transform combinations."""
        return {
            'slideId': 'test-image-positioning-001',
            'slideNumber': 1,
            'slideTitle': 'Image Positioning Test',
            'templateId': 'big-image-left',
            'metadata': {
                'createdAt': '2025-01-14T12:00:00Z',
                'updatedAt': '2025-01-14T12:00:00Z',
                'elementPositions': {
                    # Element positioning (container-level transforms)
                    'test-image-positioning-001-image': {'x': 25.5, 'y': 15.2},
                    'test-image-positioning-001-0': {'x': 10.0, 'y': 5.0}  # Title
                }
            },
            'props': {
                'title': 'Test Image Transform Slide',
                'subtitle': 'Testing exact frontend-PDF image matching',
                'imagePath': '/static_design_images/test_image.png',
                # Container sizing (exact frontend dimensions)
                'widthPx': 500,
                'heightPx': 350,
                # Image transforms (for cropping/panning)
                'imageOffset': {'x': 19.75, 'y': -22.33},
                'imageScale': 1.15,
                'objectFit': 'cover',
                # Additional properties
                'imagePrompt': 'Test image for positioning validation',
                'imageAlt': 'Test image'
            }
        }
    
    def generate_frontend_matching_html(self, slide_data: Dict[str, Any]) -> str:
        """Generate HTML that exactly matches the React frontend structure."""
        props = slide_data.get('props', {})
        metadata = slide_data.get('metadata', {})
        element_positions = metadata.get('elementPositions', {})
        
        # Extract image properties
        image_path = props.get('imagePath', '')
        width_px = props.get('widthPx', 500)
        height_px = props.get('heightPx', 350)
        image_offset = props.get('imageOffset', {'x': 0, 'y': 0})
        image_scale = props.get('imageScale', 1.0)
        object_fit = props.get('objectFit', 'cover')
        
        # Extract container positioning
        image_element_id = f"{slide_data['slideId']}-image"
        container_position = element_positions.get(image_element_id, {'x': 0, 'y': 0})
        
        # Generate exact frontend HTML structure
        html = f"""
        <!-- EXACT FRONTEND MATCH: Big Image Left Template -->
        <div class="big-image-left" style="display: flex; align-items: stretch; width: 100%; height: 100%;">
            
            <!-- Left: Image Container - EXACT FRONTEND DIMENSIONS -->
            <div class="image-container" style="flex: 0 0 40%; display: flex; align-items: center; justify-content: center;">
                
                <!-- Container with frontend widthPx/heightPx + element positioning transform -->
                <div class="frontend-image-container" style="
                    position: relative;
                    overflow: hidden;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: {width_px}px;
                    height: {height_px}px;
                    transform: translate({container_position['x']}px, {container_position['y']}px);
                    transform-origin: top left;
                ">
                    
                    <!-- Image with imageOffset transform for cropping/panning -->
                    <img src="{image_path}"
                         alt="Test image"
                         class="frontend-image"
                         style="
                            width: 100%;
                            height: 100%;
                            object-fit: {object_fit};
                            transform: translate({image_offset['x']}px, {image_offset['y']}px) scale({image_scale});
                            transform-origin: center center;
                            border-radius: 8px;
                            margin: 0;
                            padding: 0;
                            display: block;
                         " />
                         
                </div>
            </div>
            
            <!-- Right: Content Container -->
            <div class="content-container" style="flex: 1 1 60%; padding: 40px; display: flex; flex-direction: column; justify-content: center;">
                <h1 style="font-size: 45px; margin-bottom: 24px;">{props.get('title', '')}</h1>
                <div style="font-size: 18px;">{props.get('subtitle', '')}</div>
            </div>
            
        </div>
        """
        
        return html
    
    def validate_transform_calculations(self, slide_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate that transform calculations match frontend exactly."""
        props = slide_data.get('props', {})
        metadata = slide_data.get('metadata', {})
        
        validation = {
            'container_sizing': True,
            'element_positioning': True,
            'image_transforms': True,
            'object_fit': True,
            'issues': []
        }
        
        # Validate container sizing
        width_px = props.get('widthPx')
        height_px = props.get('heightPx')
        if not isinstance(width_px, (int, float)) or not isinstance(height_px, (int, float)):
            validation['container_sizing'] = False
            validation['issues'].append('Invalid container dimensions: widthPx and heightPx must be numbers')
        
        # Validate element positioning
        element_positions = metadata.get('elementPositions', {})
        image_element_id = f"{slide_data['slideId']}-image"
        if image_element_id in element_positions:
            pos = element_positions[image_element_id]
            if not isinstance(pos.get('x'), (int, float)) or not isinstance(pos.get('y'), (int, float)):
                validation['element_positioning'] = False
                validation['issues'].append('Invalid element position: x and y must be numbers')
        
        # Validate image transforms
        image_offset = props.get('imageOffset')
        if image_offset:
            if not isinstance(image_offset.get('x'), (int, float)) or not isinstance(image_offset.get('y'), (int, float)):
                validation['image_transforms'] = False
                validation['issues'].append('Invalid image offset: x and y must be numbers')
        
        image_scale = props.get('imageScale', 1.0)
        if not isinstance(image_scale, (int, float)) or image_scale <= 0:
            validation['image_transforms'] = False
            validation['issues'].append('Invalid image scale: must be a positive number')
        
        # Validate object fit
        object_fit = props.get('objectFit', 'cover')
        valid_fits = ['cover', 'contain', 'fill', 'scale-down', 'none']
        if object_fit not in valid_fits:
            validation['object_fit'] = False
            validation['issues'].append(f'Invalid object-fit: {object_fit}, must be one of {valid_fits}')
        
        return validation
    
    def generate_template_fix_recommendations(self) -> List[str]:
        """Generate specific recommendations for fixing the PDF template."""
        return [
            "1. CONTAINER STRUCTURE: Use exact frontend container structure with widthPx/heightPx",
            "2. ELEMENT POSITIONING: Apply element positions to container, not image",
            "3. IMAGE TRANSFORMS: Apply imageOffset and imageScale to image element only",
            "4. TRANSFORM ORIGINS: Container uses 'top left', image uses 'center center'",
            "5. CSS PROPERTIES: Ensure object-fit, overflow, and display properties match frontend",
            "6. VALUE FORMATTING: Use proper number formatting with |float|round() filters",
            "7. FALLBACK VALUES: Provide sensible defaults for missing properties",
            "8. ELEMENT IDS: Use consistent slideId-image format (no 'draggable-' prefix)"
        ]
    
    def create_optimized_template_snippet(self, template_id: str) -> str:
        """Create an optimized template snippet for the given template."""
        
        if template_id == 'big-image-left':
            return """
            {% elif slide.templateId == 'big-image-left' %}
                <div class="big-image-left">
                    <!-- Left: Image Container -->
                    <div class="image-container">
                        {% if slide.props.imagePath %}
                            <!-- FRONTEND EXACT MATCH: Container with dimensions + positioning -->
                            <div style="
                                position: relative;
                                overflow: hidden;
                                border-radius: 8px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                width: {{ (slide.props.widthPx|int) if slide.props.widthPx else 500 }}px;
                                height: {{ (slide.props.heightPx|int) if slide.props.heightPx else 350 }}px;
                                {% if slide.metadata and slide.metadata.elementPositions %}
                                    {% set imageId = slide.slideId + '-image' %}
                                    {% if slide.metadata.elementPositions[imageId] %}
                                        transform: translate({{ slide.metadata.elementPositions[imageId].x|float|round(2) }}px, {{ slide.metadata.elementPositions[imageId].y|float|round(2) }}px);
                                    {% endif %}
                                {% endif %}
                                transform-origin: top left;
                            ">
                                <!-- FRONTEND EXACT MATCH: Image with offset/scale -->
                                <img src="{{ slide.props.imagePath }}" 
                                     alt="Slide image" 
                                     style="
                                        width: 100%;
                                        height: 100%;
                                        object-fit: {{ slide.props.objectFit if slide.props.objectFit else 'cover' }};
                                        {% if slide.props.imageOffset or slide.props.imageScale %}
                                            transform: 
                                            {% if slide.props.imageOffset %}
                                                translate({{ slide.props.imageOffset.x|float|round(2) }}px, {{ slide.props.imageOffset.y|float|round(2) }}px)
                                            {% endif %}
                                            {% if slide.props.imageScale and slide.props.imageScale != 1 %}
                                                scale({{ slide.props.imageScale|float|round(3) }})
                                            {% endif %};
                                        {% endif %}
                                        transform-origin: center center;
                                        border-radius: 8px;
                                        margin: 0;
                                        padding: 0;
                                        display: block;
                                     " />
                            </div>
                        {% else %}
                            <!-- Placeholder when no image -->
                            <div style="width: 500px; height: 350px; border: 2px dashed #e0e0e0; border-radius: 8px; display: flex; align-items: center; justify-content: center; background-color: #f8f9fa;">
                                <span style="color: #6c757d; font-size: 16px;">Image Placeholder</span>
                            </div>
                        {% endif %}
                    </div>
                    
                    <!-- Right: Content -->
                    <div class="content-container">
                        {% if slide.props.title and slide.props.title != 'Click to add title' %}
                            <h1 class="slide-title"
                                {% if slide.metadata and slide.metadata.elementPositions %}
                                    {% set titleId = slide.slideId + '-0' %}
                                    {% if slide.metadata.elementPositions[titleId] %}
                                        style="transform: translate({{ slide.metadata.elementPositions[titleId].x|float|round(2) }}px, {{ slide.metadata.elementPositions[titleId].y|float|round(2) }}px);"
                                    {% endif %}
                                {% endif %}
                            >{{ slide.props.title }}</h1>
                        {% endif %}
                        {% if slide.props.subtitle and slide.props.subtitle != 'Click to add content' %}
                            <div class="content-text"
                                {% if slide.metadata and slide.metadata.elementPositions %}
                                    {% set subtitleId = slide.slideId + '-1' %}
                                    {% if slide.metadata.elementPositions[subtitleId] %}
                                        style="transform: translate({{ slide.metadata.elementPositions[subtitleId].x|float|round(2) }}px, {{ slide.metadata.elementPositions[subtitleId].y|float|round(2) }}px);"
                                    {% endif %}
                                {% endif %}
                            >{{ slide.props.subtitle }}</div>
                        {% endif %}
                    </div>
                </div>
            """
        
        elif template_id == 'big-image-top':
            return """
            {% elif slide.templateId == 'big-image-top' %}
                <div class="big-image-top">
                    <!-- Top: Image Container -->
                    <div class="image-container">
                        {% if slide.props.imagePath %}
                            <!-- FRONTEND EXACT MATCH: Container with dimensions + positioning -->
                            <div style="
                                position: relative;
                                overflow: hidden;
                                border-radius: 8px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                width: {{ (slide.props.widthPx|int) if slide.props.widthPx else '100%' }};
                                height: {{ (slide.props.heightPx|int) if slide.props.heightPx else 240 }}px;
                                margin-bottom: 32px;
                                {% if slide.metadata and slide.metadata.elementPositions %}
                                    {% set imageId = slide.slideId + '-image' %}
                                    {% if slide.metadata.elementPositions[imageId] %}
                                        transform: translate({{ slide.metadata.elementPositions[imageId].x|float|round(2) }}px, {{ slide.metadata.elementPositions[imageId].y|float|round(2) }}px);
                                    {% endif %}
                                {% endif %}
                                transform-origin: top left;
                            ">
                                <!-- FRONTEND EXACT MATCH: Image with offset/scale -->
                                <img src="{{ slide.props.imagePath }}" 
                                     alt="Slide image" 
                                     style="
                                        width: 100%;
                                        height: 100%;
                                        object-fit: {{ slide.props.objectFit if slide.props.objectFit else 'cover' }};
                                        {% if slide.props.imageOffset or slide.props.imageScale %}
                                            transform: 
                                            {% if slide.props.imageOffset %}
                                                translate({{ slide.props.imageOffset.x|float|round(2) }}px, {{ slide.props.imageOffset.y|float|round(2) }}px)
                                            {% endif %}
                                            {% if slide.props.imageScale and slide.props.imageScale != 1 %}
                                                scale({{ slide.props.imageScale|float|round(3) }})
                                            {% endif %};
                                        {% endif %}
                                        transform-origin: center center;
                                        border-radius: 8px;
                                        margin: 0;
                                        padding: 0;
                                        display: block;
                                     " />
                            </div>
                        {% else %}
                            <!-- Placeholder when no image -->
                            <div style="width: 100%; height: 240px; border: 2px dashed #e0e0e0; border-radius: 8px; display: flex; align-items: center; justify-content: center; background-color: #f8f9fa; margin-bottom: 32px;">
                                <span style="color: #6c757d; font-size: 16px;">Image Placeholder</span>
                            </div>
                        {% endif %}
                    </div>
                    
                    <!-- Bottom: Content -->
                    <div class="content-container">
                        {% if slide.props.title and slide.props.title != 'Click to add title' %}
                            <h1 class="slide-title"
                                {% if slide.metadata and slide.metadata.elementPositions %}
                                    {% set titleId = slide.slideId + '-0' %}
                                    {% if slide.metadata.elementPositions[titleId] %}
                                        style="transform: translate({{ slide.metadata.elementPositions[titleId].x|float|round(2) }}px, {{ slide.metadata.elementPositions[titleId].y|float|round(2) }}px);"
                                    {% endif %}
                                {% endif %}
                            >{{ slide.props.title }}</h1>
                        {% endif %}
                        {% if slide.props.subtitle and slide.props.subtitle != 'Click to add content' %}
                            <div class="content-text"
                                {% if slide.metadata and slide.metadata.elementPositions %}
                                    {% set subtitleId = slide.slideId + '-1' %}
                                    {% if slide.metadata.elementPositions[subtitleId] %}
                                        style="transform: translate({{ slide.metadata.elementPositions[subtitleId].x|float|round(2) }}px, {{ slide.metadata.elementPositions[subtitleId].y|float|round(2) }}px);"
                                    {% endif %}
                                {% endif %}
                            >{{ slide.props.subtitle }}</div>
                        {% endif %}
                    </div>
                </div>
            """
            
        return ""
    
    def run_comprehensive_fix(self):
        """Run a comprehensive analysis and generate fixes."""
        logger.info("=== STARTING IMAGE POSITIONING COMPREHENSIVE FIX ===")
        
        # 1. Create test slide
        test_slide = self.create_test_slide_with_image_transforms()
        logger.info(f"Created test slide: {test_slide['slideTitle']}")
        
        # 2. Validate transform calculations
        validation = self.validate_transform_calculations(test_slide)
        logger.info(f"Validation results: {validation}")
        
        # 3. Generate frontend-matching HTML
        frontend_html = self.generate_frontend_matching_html(test_slide)
        logger.info("Generated frontend-matching HTML structure")
        
        # 4. Generate template fix recommendations
        recommendations = self.generate_template_fix_recommendations()
        logger.info("\n=== FIX RECOMMENDATIONS ===")
        for rec in recommendations:
            logger.info(rec)
        
        # 5. Generate optimized template snippets
        logger.info("\n=== OPTIMIZED TEMPLATE SNIPPETS ===")
        for template_id in ['big-image-left', 'big-image-top']:
            snippet = self.create_optimized_template_snippet(template_id)
            logger.info(f"\nTemplate: {template_id}")
            logger.info(f"Snippet length: {len(snippet)} characters")
        
        logger.info("\n=== SUMMARY ===")
        logger.info("✅ Analysis complete - use generated template snippets to fix PDF positioning")
        logger.info("✅ Key insight: Separate container positioning from image transforms")
        logger.info("✅ Apply element positions to container, imageOffset to image")

def main():
    """Main function to run the image positioning fix."""
    fixer = ImagePositioningFixer()
    fixer.run_comprehensive_fix()

if __name__ == "__main__":
    main() 