#!/usr/bin/env python3
"""
Test script for content-slide PDF generation
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

# Test content-slide data
test_content_slides = [
    {
        "templateId": "content-slide",
        "props": {
            "title": "The Beginning of Our Journey",
            "content": "Our company was founded in [Year] by [Founder's Name] with a vision to [Founder's Vision]. The initial goal was to [Initial Goal], which laid the foundation for our growth and success.",
            "alignment": "left",
            "backgroundImage": ""
        }
    },
    {
        "templateId": "content-slide",
        "props": {
            "title": "Our Mission Statement",
            "content": "We are committed to delivering exceptional value to our customers through innovative solutions and unwavering dedication to quality. Our mission drives everything we do, from product development to customer service.",
            "alignment": "center",
            "backgroundImage": ""
        }
    },
    {
        "templateId": "content-slide",
        "props": {
            "title": "Key Success Factors",
            "content": "The success of our organization is built on several key factors:\n\n• Strong leadership and clear vision\n• Dedicated and talented team members\n• Customer-focused approach\n• Continuous innovation and improvement\n• Strong partnerships and relationships",
            "alignment": "left",
            "backgroundImage": ""
        }
    }
]

async def test_content_slide_height_calculation():
    """Test height calculation for content-slide templates"""
    print("Testing content-slide height calculation...")
    
    for i, slide_data in enumerate(test_content_slides):
        try:
            height = await calculate_slide_dimensions(slide_data, "dark-purple")
            print(f"  Slide {i+1} ({slide_data['props']['title'][:30]}...): {height}px")
        except Exception as e:
            print(f"  Error calculating height for slide {i+1}: {e}")

async def test_content_slide_pdf_generation():
    """Test PDF generation for content-slide templates"""
    print("\nTesting content-slide PDF generation...")
    
    for i, slide_data in enumerate(test_content_slides):
        try:
            # Calculate height first
            height = await calculate_slide_dimensions(slide_data, "dark-purple")
            
            # Generate PDF
            output_path = f"test_content_slide_{i+1}.pdf"
            success = await generate_single_slide_pdf(
                slide_data, 
                "dark-purple", 
                height, 
                output_path
            )
            
            if success:
                print(f"  ✓ Slide {i+1} PDF generated successfully: {output_path}")
            else:
                print(f"  ✗ Failed to generate PDF for slide {i+1}")
                
        except Exception as e:
            print(f"  ✗ Error generating PDF for slide {i+1}: {e}")

async def main():
    """Main test function"""
    print("=== Content-Slide PDF Generation Test ===\n")
    
    # Test height calculation
    await test_content_slide_height_calculation()
    
    # Test PDF generation
    await test_content_slide_pdf_generation()
    
    print("\n=== Test Complete ===")

if __name__ == "__main__":
    asyncio.run(main()) 