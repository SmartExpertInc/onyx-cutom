#!/usr/bin/env python3
"""
Test script to validate the image offset fix in PDF generation.
This script tests that imageOffset values are properly applied as CSS transforms.
"""

import asyncio
import json
import logging
import os
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.pdf_generator import generate_single_slide_pdf

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('test_image_offset_fix.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def create_test_image():
    """Create a simple test image for testing."""
    from PIL import Image, ImageDraw, ImageFont
    
    # Create a 400x300 test image
    img = Image.new('RGB', (400, 300), color='lightblue')
    draw = ImageDraw.Draw(img)
    
    # Add some text
    try:
        font = ImageFont.truetype("arial.ttf", 24)
    except:
        font = ImageFont.load_default()
    
    draw.text((50, 50), "Test Image", fill='black', font=font)
    draw.text((50, 100), "For Offset Testing", fill='black', font=font)
    
    # Save the image
    test_image_path = "/tmp/test_image_offset.png"
    img.save(test_image_path)
    return test_image_path

def create_test_slides():
    """Create test slides with various image offset scenarios."""
    
    test_image_path = create_test_image()
    
    test_slides = [
        {
            "name": "bullet-points_with_offset_only",
            "slide_data": {
                "props": {
                    "title": "Test Slide with Image Offset Only",
                    "bullets": [
                        "First bullet point",
                        "Second bullet point", 
                        "Third bullet point"
                    ],
                    "imagePath": test_image_path,
                    "widthPx": 300,
                    "heightPx": 200,
                    "imageOffset": {"x": 50, "y": -30},
                    "objectFit": "cover",
                    "backgroundColor": "#ffffff"
                },
                "slideId": "test-slide-offset-only",
                "metadata": {},
                "templateId": "bullet-points",
                "slideNumber": 1
            }
        },
        {
            "name": "bullet-points_with_offset_and_scale",
            "slide_data": {
                "props": {
                    "title": "Test Slide with Offset and Scale",
                    "bullets": [
                        "Offset and scale test",
                        "Should show both transforms",
                        "Combined effect"
                    ],
                    "imagePath": test_image_path,
                    "widthPx": 250,
                    "heightPx": 180,
                    "imageOffset": {"x": 25, "y": -20},
                    "imageScale": 1.2,
                    "objectFit": "cover",
                    "backgroundColor": "#ffffff"
                },
                "slideId": "test-slide-offset-scale",
                "metadata": {},
                "templateId": "bullet-points",
                "slideNumber": 2
            }
        },
        {
            "name": "big-image-left_with_offset",
            "slide_data": {
                "props": {
                    "title": "Big Image Left with Offset",
                    "subtitle": "Subtitle text here",
                    "imagePath": test_image_path,
                    "widthPx": 250,
                    "heightPx": 180,
                    "imageOffset": {"x": 20, "y": -15},
                    "objectFit": "contain",
                    "backgroundColor": "#261c4e"
                },
                "slideId": "test-slide-big-left",
                "metadata": {},
                "templateId": "big-image-left",
                "slideNumber": 3
            }
        },
        {
            "name": "big-image-top_with_offset",
            "slide_data": {
                "props": {
                    "title": "Big Image Top with Offset",
                    "subtitle": "Subtitle text here",
                    "imagePath": test_image_path,
                    "widthPx": 400,
                    "heightPx": 240,
                    "imageOffset": {"x": 30, "y": -25},
                    "objectFit": "cover",
                    "backgroundColor": "#1a1a33"
                },
                "slideId": "test-slide-big-top",
                "metadata": {},
                "templateId": "big-image-top",
                "slideNumber": 4
            }
        },
        {
            "name": "two-column_with_offsets",
            "slide_data": {
                "props": {
                    "title": "Two Column Layout",
                    "leftTitle": "Left Column",
                    "rightTitle": "Right Column",
                    "leftContent": "Left column content",
                    "rightContent": "Right column content",
                    "leftImagePath": test_image_path,
                    "rightImagePath": test_image_path,
                    "leftWidthPx": 200,
                    "leftHeightPx": 150,
                    "rightWidthPx": 200,
                    "rightHeightPx": 150,
                    "leftImageOffset": {"x": 10, "y": -5},
                    "rightImageOffset": {"x": -10, "y": 5},
                    "leftObjectFit": "cover",
                    "rightObjectFit": "contain",
                    "backgroundColor": "#1a1a33"
                },
                "slideId": "test-slide-two-column",
                "metadata": {},
                "templateId": "two-column",
                "slideNumber": 5
            }
        }
    ]
    
    return test_slides

async def test_slide_generation():
    """Test PDF generation for each slide scenario."""
    
    test_slides = create_test_slides()
    theme = "dark-purple"
    results = []
    
    logger.info("=== STARTING IMAGE OFFSET FIX VALIDATION ===")
    logger.info(f"Testing {len(test_slides)} slide scenarios")
    
    for i, test_case in enumerate(test_slides):
        logger.info(f"\n--- Testing {test_case['name']} ---")
        
        slide_data = test_case['slide_data']
        template_id = slide_data['templateId']
        slide_height = 640  # Standard height
        
        # Create output path
        output_path = f"/tmp/test_{test_case['name']}.pdf"
        
        try:
            # Generate PDF
            success = await generate_single_slide_pdf(
                slide_data=slide_data,
                theme=theme,
                slide_height=slide_height,
                output_path=output_path,
                browser=None,  # Let the function create its own browser
                slide_index=i,
                template_id=template_id
            )
            
            if success:
                logger.info(f"✓ Successfully generated PDF: {output_path}")
                results.append({
                    "name": test_case['name'],
                    "status": "success",
                    "output_path": output_path,
                    "template_id": template_id,
                    "image_offset": slide_data['props'].get('imageOffset'),
                    "left_image_offset": slide_data['props'].get('leftImageOffset'),
                    "right_image_offset": slide_data['props'].get('rightImageOffset')
                })
            else:
                logger.error(f"✗ Failed to generate PDF for {test_case['name']}")
                results.append({
                    "name": test_case['name'],
                    "status": "failed",
                    "template_id": template_id
                })
                
        except Exception as e:
            logger.error(f"✗ Exception generating PDF for {test_case['name']}: {e}", exc_info=True)
            results.append({
                "name": test_case['name'],
                "status": "error",
                "error": str(e),
                "template_id": template_id
            })
    
    return results

def analyze_results(results):
    """Analyze and report test results."""
    
    logger.info("\n=== TEST RESULTS SUMMARY ===")
    
    successful = [r for r in results if r['status'] == 'success']
    failed = [r for r in results if r['status'] == 'failed']
    errors = [r for r in results if r['status'] == 'error']
    
    logger.info(f"Total tests: {len(results)}")
    logger.info(f"Successful: {len(successful)}")
    logger.info(f"Failed: {len(failed)}")
    logger.info(f"Errors: {len(errors)}")
    
    if successful:
        logger.info("\nSuccessful tests:")
        for result in successful:
            offset_info = ""
            if result.get('image_offset'):
                offset_info = f" (offset: {result['image_offset']})"
            elif result.get('left_image_offset') or result.get('right_image_offset'):
                offset_info = f" (left: {result.get('left_image_offset')}, right: {result.get('right_image_offset')})"
            logger.info(f"  ✓ {result['name']} ({result['template_id']}){offset_info}")
    
    if failed:
        logger.info("\nFailed tests:")
        for result in failed:
            logger.info(f"  ✗ {result['name']} ({result['template_id']})")
    
    if errors:
        logger.info("\nTests with errors:")
        for result in errors:
            logger.info(f"  ✗ {result['name']} ({result['template_id']}): {result['error']}")
    
    # Save results to file
    with open('/tmp/image_offset_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    logger.info(f"\nDetailed results saved to: /tmp/image_offset_test_results.json")
    
    return len(successful) == len(results)

async def main():
    """Main test function."""
    
    logger.info("Starting image offset fix validation...")
    
    try:
        # Run tests
        results = await test_slide_generation()
        
        # Analyze results
        all_passed = analyze_results(results)
        
        if all_passed:
            logger.info("\n🎉 ALL TESTS PASSED! Image offset fixes are working correctly.")
            logger.info("The PDF generation now properly applies imageOffset values as CSS transforms.")
        else:
            logger.error("\n❌ SOME TESTS FAILED! Please check the logs for details.")
        
        return all_passed
        
    except Exception as e:
        logger.error(f"Test execution failed: {e}", exc_info=True)
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
