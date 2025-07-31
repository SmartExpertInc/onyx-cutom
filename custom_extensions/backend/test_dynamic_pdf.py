#!/usr/bin/env python3
"""
Test script for dynamic height PDF generation
"""

import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'custom_extensions', 'backend'))

from app.services.pdf_generator import (
    calculate_slide_dimensions,
    generate_single_slide_pdf,
    generate_slide_deck_pdf_with_dynamic_height
)

# Test slide data
test_slides = [
    {
        "templateId": "title-slide",
        "props": {
            "title": "Test Presentation",
            "subtitle": "A test presentation for dynamic height PDF generation",
            "author": "Test Author",
            "date": "2024-01-01"
        }
    },
    {
        "templateId": "bullet-points",
        "props": {
            "title": "Key Points",
            "bullets": [
                "First important point that demonstrates dynamic height calculation",
                "Second point with more content to test height expansion",
                "Third point with even more detailed content to ensure the slide grows properly",
                "Fourth point to make sure we have enough content to exceed minimum height",
                "Fifth point to test maximum height constraints",
                "Sixth point to ensure proper bullet point formatting and spacing"
            ],
            "bulletStyle": "check"
        }
    },
    {
        "templateId": "challenges-solutions",
        "props": {
            "title": "Challenges and Solutions",
            "challengesTitle": "Challenges",
            "solutionsTitle": "Solutions",
            "challenges": [
                "Complex content layout",
                "Dynamic height calculation",
                "PDF generation accuracy"
            ],
            "solutions": [
                "Per-slide PDF generation",
                "Accurate height measurement",
                "PDF merging approach"
            ]
        }
    },
    {
        "templateId": "process-steps",
        "props": {
            "title": "Implementation Process",
            "steps": [
                {"description": "Calculate individual slide heights"},
                {"description": "Generate separate PDFs for each slide"},
                {"description": "Merge all PDFs into final document"},
                {"description": "Ensure no white space at bottom"}
            ]
        }
    }
]

async def test_slide_height_calculation():
    """Test individual slide height calculation"""
    print("Testing slide height calculation...")
    
    for i, slide in enumerate(test_slides):
        print(f"\nCalculating height for slide {i + 1}: {slide['templateId']}")
        height = await calculate_slide_dimensions(slide, "dark-purple")
        print(f"Calculated height: {height}px")

async def test_single_slide_pdf():
    """Test single slide PDF generation"""
    print("\nTesting single slide PDF generation...")
    
    slide = test_slides[1]  # Use bullet points slide for testing
    height = await calculate_slide_dimensions(slide, "dark-purple")
    
    output_path = "/tmp/test_single_slide.pdf"
    success = await generate_single_slide_pdf(slide, "dark-purple", height, output_path)
    
    if success:
        print(f"Single slide PDF generated successfully: {output_path}")
        print(f"File size: {os.path.getsize(output_path)} bytes")
    else:
        print("Failed to generate single slide PDF")

async def test_slide_deck_pdf():
    """Test full slide deck PDF generation"""
    print("\nTesting slide deck PDF generation...")
    
    output_filename = f"test_slide_deck_{os.getpid()}.pdf"
    
    try:
        pdf_path = await generate_slide_deck_pdf_with_dynamic_height(
            slides_data=test_slides,
            theme="dark-purple",
            output_filename=output_filename,
            use_cache=False
        )
        
        print(f"Slide deck PDF generated successfully: {pdf_path}")
        print(f"File size: {os.path.getsize(pdf_path)} bytes")
        
        # Clean up
        try:
            os.remove(pdf_path)
            print("Test file cleaned up")
        except:
            pass
            
    except Exception as e:
        print(f"Error generating slide deck PDF: {e}")

async def main():
    """Run all tests"""
    print("Starting dynamic height PDF generation tests...")
    
    try:
        await test_slide_height_calculation()
        await test_single_slide_pdf()
        await test_slide_deck_pdf()
        
        print("\nAll tests completed successfully!")
        
    except Exception as e:
        print(f"Test failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main()) 