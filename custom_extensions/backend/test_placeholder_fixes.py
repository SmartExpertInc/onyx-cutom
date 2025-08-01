#!/usr/bin/env python3
"""
Test script for placeholder fixes in PDF generation
"""

import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'custom_extensions', 'backend'))

from app.services.pdf_generator import (
    calculate_slide_dimensions,
    generate_single_slide_pdf
)

# Test data for templates with placeholders
test_placeholder_slides = [
    {
        "templateId": "big-image-left",
        "props": {
            "title": "Big Image Left Test",
            "subtitle": "Testing the fixed height placeholder (350px)",
            "imagePrompt": "A professional business meeting"
        }
    },
    {
        "templateId": "bullet-points",
        "props": {
            "title": "Bullet Points Test",
            "bullets": [
                "First bullet point with placeholder",
                "Second bullet point with placeholder",
                "Third bullet point with placeholder"
            ],
            "imagePrompt": "A relevant illustration for bullet points"
        }
    },
    {
        "templateId": "two-column",
        "props": {
            "title": "Two Column Test",
            "leftTitle": "Left Column",
            "leftContent": "Content for the left column with square placeholder",
            "rightTitle": "Right Column", 
            "rightContent": "Content for the right column with square placeholder",
            "leftImagePrompt": "Left column illustration",
            "rightImagePrompt": "Right column illustration"
        }
    },
    {
        "templateId": "bullet-points-right",
        "props": {
            "title": "Bullet Points Right Test",
            "subtitle": "Testing bullet points with placeholder on the right",
            "bullets": [
                "First bullet point",
                "Second bullet point",
                "Third bullet point"
            ],
            "imagePrompt": "A relevant illustration for the bullet points"
        }
    }
]

async def test_placeholder_height_calculation():
    """Test height calculation for templates with placeholders"""
    print("Testing placeholder height calculation...")
    
    for i, slide_data in enumerate(test_placeholder_slides):
        try:
            height = await calculate_slide_dimensions(slide_data, "dark-purple")
            print(f"  Slide {i+1} ({slide_data['templateId']}): {height}px")
        except Exception as e:
            print(f"  Error calculating height for slide {i+1}: {e}")

async def test_placeholder_pdf_generation():
    """Test PDF generation for templates with placeholders"""
    print("\nTesting placeholder PDF generation...")
    
    for i, slide_data in enumerate(test_placeholder_slides):
        try:
            # Calculate height first
            height = await calculate_slide_dimensions(slide_data, "dark-purple")
            
            # Generate PDF
            output_path = f"test_placeholder_{slide_data['templateId']}_{i+1}.pdf"
            success = await generate_single_slide_pdf(
                slide_data, 
                "dark-purple", 
                height, 
                output_path
            )
            
            if success:
                print(f"  ✓ {slide_data['templateId']} PDF generated successfully: {output_path}")
            else:
                print(f"  ✗ Failed to generate PDF for {slide_data['templateId']}")
                
        except Exception as e:
            print(f"  ✗ Error generating PDF for {slide_data['templateId']}: {e}")

async def main():
    """Main test function"""
    print("=== Placeholder Fixes Test ===\n")
    
    # Test height calculation
    await test_placeholder_height_calculation()
    
    # Test PDF generation
    await test_placeholder_pdf_generation()
    
    print("\n=== Test Complete ===")
    print("\nExpected fixes:")
    print("- Big Image Left: Fixed height 350px (was 100%)")
    print("- Bullet Points: Square aspect-ratio 1:1 with min-height container")
    print("- Two Column: Square aspect-ratio 1:1 (was max-height 200px)")
    print("- Bullet Points Right: Square aspect-ratio 1:1 (inherits from .placeholder)")

if __name__ == "__main__":
    asyncio.run(main()) 