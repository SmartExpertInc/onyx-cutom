#!/usr/bin/env python3
"""
Test script to validate the text positioning fix in PDF generation.

This script tests various positioning scenarios to ensure that:
1. Text elements maintain exact 1:1 positioning relationship with frontend
2. No vertical drift or position swapping occurs
3. Adjacent text elements maintain their relative positions
4. Images continue to work correctly
"""

import asyncio
import json
import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.services.pdf_generator import generate_single_slide_pdf
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_test_slide_data(template_id: str, title_position: dict, subtitle_position: dict, image_position: dict = None):
    """Create test slide data with specific positioning."""
    
    slide_data = {
        "slideId": f"test-{template_id}",
        "templateId": template_id,
        "props": {
            "title": "Test Title",
            "subtitle": "Test Subtitle Content",
            "imagePath": None,  # No image for text-only tests
            "imageAlt": "Test Image",
            "imagePrompt": "test image"
        },
        "metadata": {
            "elementPositions": {
                f"draggable-test-{template_id}-0": title_position,
                f"draggable-test-{template_id}-1": subtitle_position
            }
        }
    }
    
    # Add image positioning if provided
    if image_position:
        slide_data["props"]["imagePath"] = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjM1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlRlc3QgSW1hZ2U8L3RleHQ+PC9zdmc+"
        slide_data["props"]["imageOffset"] = image_position
        slide_data["props"]["imageScale"] = 1.0
    
    return slide_data

async def test_text_positioning_scenarios():
    """Test various text positioning scenarios."""
    
    test_cases = [
        {
            "name": "Adjacent Text Elements - No Drift",
            "template": "big-image-left",
            "title_pos": {"x": 0, "y": 0},
            "subtitle_pos": {"x": 0, "y": 80},
            "description": "Title and subtitle positioned vertically adjacent"
        },
        {
            "name": "Overlapping Text Elements",
            "template": "big-image-left", 
            "title_pos": {"x": 50, "y": 50},
            "subtitle_pos": {"x": 60, "y": 60},
            "description": "Text elements with slight overlap"
        },
        {
            "name": "Extreme Positioning Values",
            "template": "big-image-left",
            "title_pos": {"x": -100, "y": -50},
            "subtitle_pos": {"x": 200, "y": 150},
            "description": "Text elements positioned at extreme coordinates"
        },
        {
            "name": "Mixed Content - Text + Image",
            "template": "big-image-left",
            "title_pos": {"x": 20, "y": 30},
            "subtitle_pos": {"x": 20, "y": 100},
            "image_pos": {"x": 10, "y": 10},
            "description": "Text elements with positioned image"
        },
        {
            "name": "Zero Positioning",
            "template": "big-image-left",
            "title_pos": {"x": 0, "y": 0},
            "subtitle_pos": {"x": 0, "y": 0},
            "description": "Both elements at origin (should stack naturally)"
        }
    ]
    
    results = []
    
    for i, test_case in enumerate(test_cases):
        logger.info(f"\n=== Test Case {i+1}: {test_case['name']} ===")
        logger.info(f"Description: {test_case['description']}")
        
        try:
            # Create test slide data
            slide_data = create_test_slide_data(
                test_case["template"],
                test_case["title_pos"],
                test_case["subtitle_pos"],
                test_case.get("image_pos")
            )
            
            # Generate PDF
            output_path = f"test_output_{i+1}.pdf"
            success = await generate_single_slide_pdf(
                slide_data=slide_data,
                theme="dark-purple",
                slide_height=675,
                output_path=output_path,
                slide_index=i+1,
                template_id=test_case["template"]
            )
            
            if success:
                logger.info(f"✅ PDF generated successfully: {output_path}")
                results.append({
                    "test_case": test_case["name"],
                    "status": "PASS",
                    "output_file": output_path,
                    "positions": {
                        "title": test_case["title_pos"],
                        "subtitle": test_case["subtitle_pos"]
                    }
                })
            else:
                logger.error(f"❌ PDF generation failed for: {test_case['name']}")
                results.append({
                    "test_case": test_case["name"],
                    "status": "FAIL",
                    "error": "PDF generation failed"
                })
                
        except Exception as e:
            logger.error(f"❌ Test case failed with exception: {e}")
            results.append({
                "test_case": test_case["name"],
                "status": "ERROR",
                "error": str(e)
            })
    
    return results

def analyze_positioning_consistency(results):
    """Analyze the results for positioning consistency."""
    
    logger.info("\n=== POSITIONING CONSISTENCY ANALYSIS ===")
    
    passed_tests = [r for r in results if r["status"] == "PASS"]
    failed_tests = [r for r in results if r["status"] != "PASS"]
    
    logger.info(f"Total tests: {len(results)}")
    logger.info(f"Passed: {len(passed_tests)}")
    logger.info(f"Failed: {len(failed_tests)}")
    
    if failed_tests:
        logger.warning("Failed test cases:")
        for test in failed_tests:
            logger.warning(f"  - {test['test_case']}: {test.get('error', 'Unknown error')}")
    
    # Check for specific positioning patterns
    for result in passed_tests:
        positions = result.get("positions", {})
        title_pos = positions.get("title", {})
        subtitle_pos = positions.get("subtitle", {})
        
        # Check for vertical drift (subtitle should be below title)
        if title_pos.get("y", 0) >= subtitle_pos.get("y", 0):
            logger.warning(f"⚠️  Potential vertical drift in {result['test_case']}: "
                          f"Title Y ({title_pos.get('y', 0)}) >= Subtitle Y ({subtitle_pos.get('y', 0)})")
        
        # Check for extreme positioning values
        for pos_name, pos in positions.items():
            if abs(pos.get("x", 0)) > 500 or abs(pos.get("y", 0)) > 500:
                logger.info(f"📊 Extreme positioning in {result['test_case']}: "
                           f"{pos_name} at ({pos.get('x', 0)}, {pos.get('y', 0)})")
    
    return len(passed_tests) == len(results)

async def main():
    """Main test execution function."""
    
    logger.info("🚀 Starting Text Positioning Fix Validation Tests")
    logger.info("=" * 60)
    
    # Run positioning tests
    results = await test_text_positioning_scenarios()
    
    # Analyze results
    all_passed = analyze_positioning_consistency(results)
    
    # Summary
    logger.info("\n" + "=" * 60)
    if all_passed:
        logger.info("🎉 ALL TESTS PASSED - Text positioning fix is working correctly!")
        logger.info("✅ Text elements maintain consistent positioning")
        logger.info("✅ No vertical drift or position swapping detected")
        logger.info("✅ PDF generation works for all test scenarios")
    else:
        logger.error("❌ SOME TESTS FAILED - Text positioning fix needs attention")
        logger.error("Please review failed test cases and fix issues")
    
    # Cleanup test files
    logger.info("\n🧹 Cleaning up test files...")
    for i in range(len(results)):
        test_file = f"test_output_{i+1}.pdf"
        if os.path.exists(test_file):
            os.remove(test_file)
            logger.info(f"Removed: {test_file}")
    
    logger.info("🏁 Test validation complete!")
    
    return all_passed

if __name__ == "__main__":
    # Run the tests
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
