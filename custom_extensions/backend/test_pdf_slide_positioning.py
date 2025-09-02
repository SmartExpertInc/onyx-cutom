#!/usr/bin/env python3
"""
Comprehensive test script for diagnosing PDF slide positioning issues.

This script helps identify discrepancies between frontend slide positioning 
and PDF generation by testing various slide configurations and image transformations.
"""

import json
import os
import sys
import asyncio
import logging
from typing import Dict, Any, List
from pathlib import Path

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import necessary modules
from app.services.pdf_generator import generate_single_slide_pdf, log_slide_data_structure
from app.services.pdf_generator import process_presentation_slide_images

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PDFPositioningTester:
    """Test class for PDF positioning issues."""
    
    def __init__(self):
        self.test_results = []
        
    def create_test_slide_data(self, template_id: str, test_case: str) -> Dict[str, Any]:
        """Create test slide data for different scenarios."""
        
        base_slide = {
            'slideId': f'test-slide-{template_id}-{test_case}',
            'slideNumber': 1,
            'slideTitle': f'Test {template_id} - {test_case}',
            'templateId': template_id,
            'metadata': {
                'createdAt': '2025-01-14T10:00:00Z',
                'updatedAt': '2025-01-14T10:00:00Z',
                'elementPositions': {}
            },
            'props': {}
        }
        
        if template_id == 'bullet-points':
            base_slide['props'] = {
                'title': f'Test Bullet Points - {test_case}',
                'bullets': [
                    'First bullet point with test content',
                    'Second bullet point with test content',
                    'Third bullet point with test content'
                ],
                'bulletStyle': 'dot',
                'imagePath': '/static_design_images/test_image.png' if test_case == 'with_image' else None,
                'imageOffset': {'x': 19, 'y': -22} if test_case == 'with_offset' else None,
                'imageScale': 1.2 if test_case == 'with_scale' else None,
                'widthPx': 300 if test_case == 'with_dimensions' else None,
                'heightPx': 200 if test_case == 'with_dimensions' else None,
                'objectFit': 'cover'
            }
            
            # Add element positions for positioning test
            if test_case == 'with_positioning':
                base_slide['metadata']['elementPositions'] = {
                    f'{base_slide["slideId"]}-0': {'x': 50, 'y': 30},  # Title
                    f'{base_slide["slideId"]}-image': {'x': 25, 'y': 15}  # Image
                }
                
        elif template_id == 'big-image-left':
            base_slide['props'] = {
                'title': f'Test Big Image Left - {test_case}',
                'subtitle': 'Test subtitle content',
                'imagePath': '/static_design_images/test_image.png' if test_case != 'no_image' else None,
                'imageOffset': {'x': 15, 'y': -10} if test_case == 'with_offset' else None,
                'imageScale': 1.1 if test_case == 'with_scale' else None,
                'widthPx': 500 if test_case == 'with_dimensions' else None,
                'heightPx': 350 if test_case == 'with_dimensions' else None,
                'objectFit': 'cover'
            }
            
        elif template_id == 'two-column':
            base_slide['props'] = {
                'title': f'Test Two Column - {test_case}',
                'leftTitle': 'Left Column Title',
                'leftContent': 'Left column content for testing',
                'rightTitle': 'Right Column Title', 
                'rightContent': 'Right column content for testing',
                'leftImagePath': '/static_design_images/test_image_left.png' if test_case == 'with_images' else None,
                'rightImagePath': '/static_design_images/test_image_right.png' if test_case == 'with_images' else None,
                'columnRatio': '50-50'
            }
            
        return base_slide
    
    async def test_slide_data_processing(self, slide_data: Dict[str, Any]) -> Dict[str, Any]:
        """Test how slide data is processed."""
        logger.info(f"\n=== TESTING SLIDE DATA PROCESSING ===")
        logger.info(f"Template: {slide_data.get('templateId')}")
        logger.info(f"Test Case: {slide_data.get('slideTitle')}")
        
        # Test slide data structure logging
        await log_slide_data_structure(slide_data, 1, slide_data.get('templateId'))
        
        # Test image processing
        if slide_data.get('props'):
            props = slide_data['props']
            logger.info(f"\n--- IMAGE PROCESSING TEST ---")
            
            # Check for image paths
            image_props = ['imagePath', 'leftImagePath', 'rightImagePath']
            for prop in image_props:
                if prop in props and props[prop]:
                    logger.info(f"Found {prop}: {props[prop]}")
                    
                    # Test offset and scale processing
                    base_prop = prop.replace('ImagePath', '').replace('imagePath', 'image')
                    offset_prop = f"{base_prop}Offset" if base_prop != 'image' else 'imageOffset'
                    scale_prop = f"{base_prop}Scale" if base_prop != 'image' else 'imageScale'
                    
                    if offset_prop in props:
                        logger.info(f"  {offset_prop}: {props[offset_prop]}")
                    if scale_prop in props:
                        logger.info(f"  {scale_prop}: {props[scale_prop]}")
        
        # Test metadata processing
        metadata = slide_data.get('metadata', {})
        if metadata.get('elementPositions'):
            logger.info(f"\n--- ELEMENT POSITIONING TEST ---")
            for element_id, position in metadata['elementPositions'].items():
                logger.info(f"Element '{element_id}': x={position.get('x')}, y={position.get('y')}")
        
        return {
            'template_id': slide_data.get('templateId'),
            'test_case': slide_data.get('slideTitle'),
            'has_images': any(slide_data.get('props', {}).get(prop) for prop in ['imagePath', 'leftImagePath', 'rightImagePath']),
            'has_positioning': bool(metadata.get('elementPositions')),
            'has_transforms': any(slide_data.get('props', {}).get(prop) for prop in ['imageOffset', 'imageScale', 'leftImageOffset', 'rightImageOffset'])
        }
    
    def validate_html_output(self, html_content: str, slide_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate the generated HTML content."""
        logger.info(f"\n=== HTML VALIDATION TEST ===")
        
        validation_results = {
            'has_image_positioning_container': 'image-positioning-container' in html_content,
            'has_transformed_image': 'transformed-image' in html_content,
            'has_transform_style': 'transform:' in html_content,
            'has_object_fit': 'object-fit:' in html_content,
            'has_data_urls': 'data:image/' in html_content,
            'template_section_found': slide_data.get('templateId', '') in html_content
        }
        
        # Check for specific positioning elements
        props = slide_data.get('props', {})
        metadata = slide_data.get('metadata', {})
        
        # Validate image offset application
        if props.get('imageOffset'):
            offset = props['imageOffset']
            expected_transform = f"translate({offset['x']}px, {offset['y']}px)"
            validation_results['image_offset_applied'] = expected_transform in html_content
            if not validation_results['image_offset_applied']:
                logger.warning(f"Expected transform '{expected_transform}' not found in HTML")
        
        # Validate element positioning
        if metadata.get('elementPositions'):
            validation_results['element_positions_applied'] = True
            for element_id, position in metadata['elementPositions'].items():
                expected_transform = f"translate({position['x']}px, {position['y']}px)"
                if expected_transform not in html_content:
                    validation_results['element_positions_applied'] = False
                    logger.warning(f"Element position for '{element_id}' not applied correctly")
        
        # Log validation results
        for key, value in validation_results.items():
            status = "✓" if value else "✗"
            logger.info(f"{status} {key}: {value}")
        
        return validation_results
    
    async def run_comprehensive_test(self):
        """Run a comprehensive test of various slide configurations."""
        logger.info("=== STARTING COMPREHENSIVE PDF POSITIONING TEST ===")
        
        test_cases = [
            ('bullet-points', 'basic'),
            ('bullet-points', 'with_image'),
            ('bullet-points', 'with_offset'),
            ('bullet-points', 'with_scale'),
            ('bullet-points', 'with_positioning'),
            ('big-image-left', 'basic'),
            ('big-image-left', 'with_offset'),
            ('big-image-left', 'with_scale'),
            ('two-column', 'basic'),
            ('two-column', 'with_images'),
        ]
        
        for template_id, test_case in test_cases:
            logger.info(f"\n{'='*60}")
            logger.info(f"TESTING: {template_id} - {test_case}")
            logger.info(f"{'='*60}")
            
            # Create test slide data
            slide_data = self.create_test_slide_data(template_id, test_case)
            
            # Test data processing
            processing_result = await self.test_slide_data_processing(slide_data)
            
            # Store results
            self.test_results.append({
                'template_id': template_id,
                'test_case': test_case,
                'processing_result': processing_result,
                'slide_data': slide_data
            })
        
        # Generate summary report
        self.generate_summary_report()
    
    def generate_summary_report(self):
        """Generate a summary report of all test results."""
        logger.info(f"\n{'='*60}")
        logger.info("TEST SUMMARY REPORT")
        logger.info(f"{'='*60}")
        
        total_tests = len(self.test_results)
        templates_tested = set(result['template_id'] for result in self.test_results)
        
        logger.info(f"Total tests run: {total_tests}")
        logger.info(f"Templates tested: {', '.join(templates_tested)}")
        
        # Group results by template
        for template in templates_tested:
            template_results = [r for r in self.test_results if r['template_id'] == template]
            logger.info(f"\n{template.upper()} Template Results:")
            
            for result in template_results:
                test_case = result['test_case']
                processing = result['processing_result']
                
                status_indicators = []
                if processing['has_images']:
                    status_indicators.append("📷 Images")
                if processing['has_positioning']:
                    status_indicators.append("📍 Positioning")
                if processing['has_transforms']:
                    status_indicators.append("🔄 Transforms")
                
                status = " | ".join(status_indicators) if status_indicators else "Basic"
                logger.info(f"  {test_case}: {status}")
        
        # Identify potential issues
        logger.info(f"\n🔍 POTENTIAL ISSUES IDENTIFIED:")
        
        issues_found = []
        
        # Check for missing image processing
        image_tests = [r for r in self.test_results if r['processing_result']['has_images']]
        if not image_tests:
            issues_found.append("No image processing tests found")
        
        # Check for missing positioning tests
        positioning_tests = [r for r in self.test_results if r['processing_result']['has_positioning']]
        if not positioning_tests:
            issues_found.append("No element positioning tests found")
        
        if issues_found:
            for issue in issues_found:
                logger.warning(f"  ⚠️  {issue}")
        else:
            logger.info("  ✅ All test categories covered")
        
        logger.info(f"\n{'='*60}")
        logger.info("TEST COMPLETE")
        logger.info(f"{'='*60}")

async def main():
    """Main test function."""
    tester = PDFPositioningTester()
    await tester.run_comprehensive_test()
    
    # Provide recommendations
    logger.info(f"\n🔧 RECOMMENDATIONS:")
    logger.info("1. Check element ID consistency between frontend and PDF template")
    logger.info("2. Verify image offset and scale value formatting")
    logger.info("3. Ensure metadata.elementPositions structure matches template expectations")
    logger.info("4. Validate coordinate system consistency (frontend vs PDF)")
    logger.info("5. Test with actual image files to verify data URL conversion")

if __name__ == "__main__":
    asyncio.run(main()) 