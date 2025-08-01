#!/usr/bin/env python3
"""
Test script for hero-title-slide PDF generation
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

# Test hero-title-slide data
test_hero_title_slides = [
    {
        "templateId": "hero-title-slide",
        "props": {
            "title": "Виявлення та Просування Нових Лідів для Генерації Продажів",
            "subtitle": "Визначення лідів, перспектив і можливостей: шлях до успіху в продажах 2025 року.",
            "showAccent": True,
            "accentPosition": "left",
            "textAlign": "center",
            "titleSize": "xlarge",
            "subtitleSize": "medium",
            "backgroundImage": ""
        }
    },
    {
        "templateId": "hero-title-slide",
        "props": {
            "title": "Strategic Innovation and Growth",
            "subtitle": "Driving sustainable business transformation through cutting-edge technology and forward-thinking strategies.",
            "showAccent": True,
            "accentPosition": "right",
            "textAlign": "center",
            "titleSize": "xlarge",
            "subtitleSize": "medium",
            "backgroundImage": ""
        }
    },
    {
        "templateId": "hero-title-slide",
        "props": {
            "title": "Customer-Centric Excellence",
            "subtitle": "Building lasting relationships through exceptional service, innovative solutions, and unwavering commitment to customer success.",
            "showAccent": True,
            "accentPosition": "top",
            "textAlign": "left",
            "titleSize": "large",
            "subtitleSize": "large",
            "backgroundImage": ""
        }
    },
    {
        "templateId": "hero-title-slide",
        "props": {
            "title": "Future-Ready Solutions",
            "subtitle": "Empowering organizations to thrive in the digital age with scalable, secure, and innovative technology solutions.",
            "showAccent": False,
            "accentPosition": "left",
            "textAlign": "right",
            "titleSize": "xlarge",
            "subtitleSize": "medium",
            "backgroundImage": ""
        }
    }
]

async def test_hero_title_slide_height_calculation():
    """Test height calculation for hero-title-slide templates"""
    print("Testing hero-title-slide height calculation...")
    
    for i, slide_data in enumerate(test_hero_title_slides):
        try:
            height = await calculate_slide_dimensions(slide_data, "dark-purple")
            print(f"  Slide {i+1} ({slide_data['props']['title'][:30]}...): {height}px")
        except Exception as e:
            print(f"  Error calculating height for slide {i+1}: {e}")

async def test_hero_title_slide_pdf_generation():
    """Test PDF generation for hero-title-slide templates"""
    print("\nTesting hero-title-slide PDF generation...")
    
    for i, slide_data in enumerate(test_hero_title_slides):
        try:
            # Calculate height first
            height = await calculate_slide_dimensions(slide_data, "dark-purple")
            
            # Generate PDF
            output_path = f"test_hero_title_slide_{i+1}.pdf"
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
    print("=== Hero Title Slide PDF Generation Test ===\n")
    
    # Test height calculation
    await test_hero_title_slide_height_calculation()
    
    # Test PDF generation
    await test_hero_title_slide_pdf_generation()
    
    print("\n=== Test Complete ===")

if __name__ == "__main__":
    asyncio.run(main()) 