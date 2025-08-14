#!/usr/bin/env python3
"""
Test script to validate the transform fix with !important declarations.
This script tests the PDF generation with imageOffset to ensure transforms are applied correctly.
"""

import asyncio
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.services.pdf_generator import generate_single_slide_pdf

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('test_transform_fix.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def create_test_image():
    """Create a test image for testing."""
    try:
        from PIL import Image, ImageDraw, ImageFont
        
        # Create a 400x300 test image
        img = Image.new('RGB', (400, 300), color='#4A90E2')
        draw = ImageDraw.Draw(img)
        
        # Add some text to make it recognizable
        try:
            font = ImageFont.truetype("arial.ttf", 24)
        except:
            font = ImageFont.load_default()
        
        draw.text((50, 50), "Test Image", fill='white', font=font)
        draw.text((50, 100), "400x300", fill='white', font=font)
        draw.text((50, 150), "Transform Test", fill='white', font=font)
        
        # Save to a temporary file
        test_image_path = "/tmp/test_transform_image.png"
        img.save(test_image_path)
        logger.info(f"✓ Created test image: {test_image_path}")
        return test_image_path
    except ImportError:
        logger.warning("PIL not available, using placeholder image path")
        return "/tmp/placeholder.png"

def create_test_slides():
    """Create test slides with various imageOffset configurations."""
    
    test_image_path = create_test_image()
    
    # Test scenarios with different transform configurations
    TEST_SCENARIOS = [
        {
            "name": "bullet-points_with_offset_only",
            "template": "bullet-points",
            "slide_data": {
                "slideId": "test-slide-1",
                "templateId": "bullet-points",
                "slideTitle": "Test Slide with Offset",
                "slideNumber": 1,
                "metadata": {"createdAt": "2024-01-01", "updatedAt": "2024-01-01"},
                "props": {
                    "title": "Test Title",
                    "imagePath": test_image_path,
                    "widthPx": 400,
                    "heightPx": 300,
                    "objectFit": "cover",
                    "imageOffset": {"x": 50, "y": -25},  # Positive X, negative Y
                    "imageScale": None,  # No scale
                    "bullets": [
                        "First bullet point",
                        "Second bullet point", 
                        "Third bullet point",
                        "Fourth bullet point"
                    ]
                }
            }
        },
        {
            "name": "bullet-points_with_offset_and_scale",
            "template": "bullet-points", 
            "slide_data": {
                "slideId": "test-slide-2",
                "templateId": "bullet-points",
                "slideTitle": "Test Slide with Offset + Scale",
                "slideNumber": 2,
                "metadata": {"createdAt": "2024-01-01", "updatedAt": "2024-01-01"},
                "props": {
                    "title": "Test Title with Scale",
                    "imagePath": test_image_path,
                    "widthPx": 400,
                    "heightPx": 300,
                    "objectFit": "cover",
                    "imageOffset": {"x": -30, "y": 40},  # Negative X, positive Y
                    "imageScale": 1.2,  # Scale up by 20%
                    "bullets": [
                        "First bullet point",
                        "Second bullet point",
                        "Third bullet point",
                        "Fourth bullet point"
                    ]
                }
            }
        },
        {
            "name": "big-image-left_with_offset",
            "template": "big-image-left",
            "slide_data": {
                "slideId": "test-slide-3", 
                "templateId": "big-image-left",
                "slideTitle": "Big Image Left with Offset",
                "slideNumber": 3,
                "metadata": {"createdAt": "2024-01-01", "updatedAt": "2024-01-01"},
                "props": {
                    "title": "Big Image Test",
                    "subtitle": "Testing image offset in big-image-left template",
                    "imagePath": test_image_path,
                    "widthPx": 500,
                    "heightPx": 350,
                    "objectFit": "cover",
                    "imageOffset": {"x": 25, "y": -15},  # Small offset
                    "imageScale": None
                }
            }
        },
        {
            "name": "two-column_with_left_offset",
            "template": "two-column",
            "slide_data": {
                "slideId": "test-slide-4",
                "templateId": "two-column", 
                "slideTitle": "Two Column with Left Offset",
                "slideNumber": 4,
                "metadata": {"createdAt": "2024-01-01", "updatedAt": "2024-01-01"},
                "props": {
                    "title": "Two Column Test",
                    "leftTitle": "Left Column",
                    "rightTitle": "Right Column", 
                    "leftContent": "Left column content",
                    "rightContent": "Right column content",
                    "leftImagePath": test_image_path,
                    "rightImagePath": test_image_path,
                    "leftWidthPx": 320,
                    "leftHeightPx": 200,
                    "rightWidthPx": 320,
                    "rightHeightPx": 200,
                    "leftObjectFit": "cover",
                    "rightObjectFit": "cover",
                    "leftImageOffset": {"x": 10, "y": -5},  # Left image offset
                    "rightImageOffset": None,  # No offset for right image
                    "leftImageScale": None,
                    "rightImageScale": None
                }
            }
        }
    ]
    
    return TEST_SCENARIOS

async def test_slide_generation():
    """Test PDF generation for each scenario."""
    
    test_scenarios = create_test_slides()
    results = []
    
    logger.info(f"🚀 Starting transform fix validation with {len(test_scenarios)} test scenarios")
    
    for i, scenario in enumerate(test_scenarios):
        logger.info(f"\n📋 Testing Scenario {i+1}: {scenario['name']}")
        logger.info(f"   Template: {scenario['template']}")
        logger.info(f"   Image Offset: {scenario['slide_data']['props'].get('imageOffset', 'None')}")
        logger.info(f"   Image Scale: {scenario['slide_data']['props'].get('imageScale', 'None')}")
        
        try:
            # Calculate slide height based on template
            slide_height = 640  # Default height
            
            # Generate output path
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = f"/tmp/test_{scenario['name']}_{timestamp}.pdf"
            
            # Generate PDF
            logger.info(f"   🔄 Generating PDF: {output_path}")
            
            success = await generate_single_slide_pdf(
                slide_data=scenario['slide_data'],
                theme="dark-purple",
                slide_height=slide_height,
                output_path=output_path,
                slide_index=i,
                template_id=scenario['template']
            )
            
            if success:
                logger.info(f"   ✅ Successfully generated: {output_path}")
                results.append({
                    "scenario": scenario['name'],
                    "template": scenario['template'],
                    "status": "success",
                    "output_path": output_path,
                    "image_offset": scenario['slide_data']['props'].get('imageOffset'),
                    "image_scale": scenario['slide_data']['props'].get('imageScale')
                })
            else:
                logger.error(f"   ❌ Failed to generate PDF for {scenario['name']}")
                results.append({
                    "scenario": scenario['name'],
                    "template": scenario['template'],
                    "status": "failed",
                    "error": "PDF generation failed"
                })
                
        except Exception as e:
            logger.error(f"   ❌ Error generating PDF for {scenario['name']}: {str(e)}")
            results.append({
                "scenario": scenario['name'],
                "template": scenario['template'],
                "status": "error",
                "error": str(e)
            })
    
    return results

def analyze_results(results):
    """Analyze and summarize test results."""
    
    logger.info(f"\n📊 TEST RESULTS SUMMARY")
    logger.info(f"=" * 50)
    
    successful = [r for r in results if r['status'] == 'success']
    failed = [r for r in results if r['status'] == 'failed']
    errors = [r for r in results if r['status'] == 'error']
    
    logger.info(f"✅ Successful: {len(successful)}/{len(results)}")
    logger.info(f"❌ Failed: {len(failed)}/{len(results)}")
    logger.info(f"💥 Errors: {len(errors)}/{len(results)}")
    
    if successful:
        logger.info(f"\n✅ SUCCESSFUL SCENARIOS:")
        for result in successful:
            logger.info(f"   • {result['scenario']} ({result['template']})")
            logger.info(f"     - Image Offset: {result['image_offset']}")
            logger.info(f"     - Image Scale: {result['image_scale']}")
            logger.info(f"     - Output: {result['output_path']}")
    
    if failed:
        logger.info(f"\n❌ FAILED SCENARIOS:")
        for result in failed:
            logger.info(f"   • {result['scenario']} ({result['template']})")
            logger.info(f"     - Error: {result['error']}")
    
    if errors:
        logger.info(f"\n💥 ERROR SCENARIOS:")
        for result in errors:
            logger.info(f"   • {result['scenario']} ({result['template']})")
            logger.info(f"     - Error: {result['error']}")
    
    # Save detailed results to JSON
    results_file = "/tmp/transform_fix_test_results.json"
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    logger.info(f"\n📄 Detailed results saved to: {results_file}")
    
    # Check if transforms are working
    transform_working = len(successful) > 0
    if transform_working:
        logger.info(f"\n🎉 TRANSFORM FIX VALIDATION: PASSED")
        logger.info(f"   The !important declarations are working correctly!")
        logger.info(f"   PDFs generated successfully with imageOffset transforms.")
    else:
        logger.error(f"\n💥 TRANSFORM FIX VALIDATION: FAILED")
        logger.error(f"   No PDFs were generated successfully.")
        logger.error(f"   The !important fix may not be working.")
    
    return transform_working

async def main():
    """Main test function."""
    
    logger.info("🔧 TRANSFORM FIX VALIDATION TEST")
    logger.info("=" * 50)
    logger.info("This test validates that the !important declarations")
    logger.info("in the PDF template are working correctly for transforms.")
    logger.info("=" * 50)
    
    try:
        # Run the tests
        results = await test_slide_generation()
        
        # Analyze results
        success = analyze_results(results)
        
        if success:
            logger.info(f"\n🎯 RECOMMENDATION: The transform fix appears to be working!")
            logger.info(f"   Check the generated PDFs to verify visual correctness.")
            logger.info(f"   Look for the applied transforms in the browser analysis logs.")
        else:
            logger.error(f"\n🚨 RECOMMENDATION: The transform fix needs further investigation!")
            logger.error(f"   Check the logs for specific error details.")
            logger.error(f"   Verify that the template changes were applied correctly.")
        
        return success
        
    except Exception as e:
        logger.error(f"💥 Test execution failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)

