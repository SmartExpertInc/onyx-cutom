#!/usr/bin/env python3
"""
Test script for pyramid PDF generation
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

# Test pyramid data
test_pyramid_slides = [
    {
        "templateId": "pyramid",
        "props": {
            "title": "Key Metrics of Effective System Architecture",
            "subtitle": "Effective system architecture is measured by how well it delivers on key objectives, balancing user needs, operational demands, and technical robustness.",
            "items": [
                {"heading": "User Satisfaction", "description": "Achieving user delight through intuitive interfaces and seamless experiences."},
                {"heading": "Operational Efficiency", "description": "Optimizing resources and processes for maximum productivity and cost-effectiveness."},
                {"heading": "System Reliability", "description": "Ensuring stability and consistent performance under various conditions and loads."}
            ]
        }
    },
    {
        "templateId": "pyramid",
        "props": {
            "title": "Strategic Business Priorities",
            "subtitle": "Our business strategy is built on three fundamental pillars that drive sustainable growth and competitive advantage.",
            "items": [
                {"heading": "Innovation Leadership", "description": "Pioneering new technologies and approaches that set industry standards."},
                {"heading": "Customer Excellence", "description": "Delivering exceptional value and experiences that exceed expectations."},
                {"heading": "Operational Excellence", "description": "Streamlining processes and maximizing efficiency across all operations."}
            ]
        }
    },
    {
        "templateId": "pyramid",
        "props": {
            "title": "Digital Transformation Framework",
            "subtitle": "A comprehensive approach to modernizing business operations through technology and process optimization.",
            "items": [
                {"heading": "Technology Integration", "description": "Seamlessly integrating cutting-edge technologies into existing workflows."},
                {"heading": "Process Optimization", "description": "Redesigning and streamlining business processes for maximum efficiency."},
                {"heading": "Cultural Change", "description": "Fostering a culture of innovation and continuous improvement."}
            ]
        }
    },
    {
        "templateId": "pyramid",
        "props": {
            "title": "Quality Assurance Pyramid",
            "subtitle": "A systematic approach to ensuring product quality through multiple layers of testing and validation.",
            "items": [
                {"heading": "Unit Testing", "description": "Testing individual components and functions in isolation."},
                {"heading": "Integration Testing", "description": "Verifying that components work together correctly."},
                {"heading": "System Testing", "description": "End-to-end testing of the complete system functionality."}
            ]
        }
    }
]

async def test_pyramid_height_calculation():
    """Test height calculation for pyramid templates"""
    print("Testing pyramid height calculation...")
    
    for i, slide_data in enumerate(test_pyramid_slides):
        try:
            height = await calculate_slide_dimensions(slide_data, "dark-purple")
            print(f"  Slide {i+1} ({slide_data['props']['title'][:30]}...): {height}px")
        except Exception as e:
            print(f"  Error calculating height for slide {i+1}: {e}")

async def test_pyramid_pdf_generation():
    """Test PDF generation for pyramid templates"""
    print("\nTesting pyramid PDF generation...")
    
    for i, slide_data in enumerate(test_pyramid_slides):
        try:
            # Calculate height first
            height = await calculate_slide_dimensions(slide_data, "dark-purple")
            
            # Generate PDF
            output_path = f"test_pyramid_{i+1}.pdf"
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
    print("=== Pyramid PDF Generation Test ===\n")
    
    # Test height calculation
    await test_pyramid_height_calculation()
    
    # Test PDF generation
    await test_pyramid_pdf_generation()
    
    print("\n=== Test Complete ===")

if __name__ == "__main__":
    asyncio.run(main()) 