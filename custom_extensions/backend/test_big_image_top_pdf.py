#!/usr/bin/env python3
"""
Test script for big-image-top PDF generation
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

# Test big-image-top data
test_big_image_top_slides = [
    {
        "templateId": "big-image-top",
        "props": {
            "title": "Looking Ahead",
            "subtitle": "As we move forward, our vision is to [Vision Statement]. This vision will guide our strategies and initiatives as we continue to grow and adapt in a changing market.",
            "imagePrompt": "A high-quality illustration for the topic",
            "imageAlt": "Vision illustration",
            "imageSize": "large"
        }
    },
    {
        "templateId": "big-image-top",
        "props": {
            "title": "Our Strategic Approach",
            "subtitle": "We believe in a comprehensive approach that combines innovation, customer focus, and operational excellence. This multi-faceted strategy ensures we deliver exceptional value while maintaining sustainable growth.",
            "imagePrompt": "Strategic planning illustration",
            "imageAlt": "Strategy illustration",
            "imageSize": "large"
        }
    },
    {
        "templateId": "big-image-top",
        "props": {
            "title": "Innovation at the Core",
            "subtitle": "Innovation drives everything we do. From product development to customer service, we constantly seek new ways to improve and evolve. This commitment to innovation has been the cornerstone of our success.",
            "imagePrompt": "Innovation and technology illustration",
            "imageAlt": "Innovation illustration",
            "imageSize": "large"
        }
    }
]

async def test_big_image_top_height_calculation():
    """Test height calculation for big-image-top templates"""
    print("Testing big-image-top height calculation...")
    
    for i, slide_data in enumerate(test_big_image_top_slides):
        try:
            height = await calculate_slide_dimensions(slide_data, "dark-purple")
            print(f"  Slide {i+1} ({slide_data['props']['title'][:30]}...): {height}px")
        except Exception as e:
            print(f"  Error calculating height for slide {i+1}: {e}")

async def test_big_image_top_pdf_generation():
    """Test PDF generation for big-image-top templates"""
    print("\nTesting big-image-top PDF generation...")
    
    for i, slide_data in enumerate(test_big_image_top_slides):
        try:
            # Calculate height first
            height = await calculate_slide_dimensions(slide_data, "dark-purple")
            
            # Generate PDF
            output_path = f"test_big_image_top_{i+1}.pdf"
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
    print("=== Big Image Top PDF Generation Test ===\n")
    
    # Test height calculation
    await test_big_image_top_height_calculation()
    
    # Test PDF generation
    await test_big_image_top_pdf_generation()
    
    print("\n=== Test Complete ===")

if __name__ == "__main__":
    asyncio.run(main()) 