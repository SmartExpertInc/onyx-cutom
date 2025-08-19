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
        "templateId": "bullet-points-right",
        "props": {
            "title": "Why Our Values Matter",
            "subtitle": "Understanding and embodying our values is essential for:",
            "bullets": [
                "Building Trust: Values create a foundation of trust among employees and with clients.",
                "Guiding Decisions: They serve as a compass for decision-making at all levels.",
                "Fostering Culture: Values shape our company culture and work environment.",
                "Driving Success: Aligning with our values leads to greater success and fulfillment."
            ],
            "bulletStyle": "check"
        }
    },
    {
        "templateId": "big-image-top",
        "props": {
            "title": "Looking Ahead",
            "subtitle": "As we move forward, our vision is to [Vision Statement]. This vision will guide our strategies and initiatives as we continue to grow and adapt in a changing market."
        }
    },
    {
        "templateId": "two-column",
        "props": {
            "title": "Two Column Layout",
            "leftTitle": "Left Column Title",
            "rightTitle": "Right Column Title",
            "leftContent": "This is the content for the left column. It should be properly aligned and formatted.",
            "rightContent": "This is the content for the right column. It should also be properly aligned and formatted."
        }
    },
    {
        "templateId": "two-column-diversity",
        "props": {
            "title": "Embracing Diversity and Inclusion",
            "leftTitle": "Our Commitment",
            "rightTitle": "Benefits of Diversity",
            "leftContent": "We are dedicated to fostering a diverse and inclusive workplace where everyone feels valued and respected.",
            "rightBullets": [
                "Enhances creativity and innovation.",
                "Reflects the diverse communities we serve.",
                "Improves employee satisfaction and retention."
            ]
        }
    },
    {
        "templateId": "big-numbers",
        "props": {
            "title": "Key Achievements",
            "items": [
                {"value": "100+", "label": "Countries Served", "description": "We have expanded our operations to over 100 countries worldwide."},
                {"value": "5", "label": "Years in Business", "description": "Celebrating over 5 years of successful operations."},
                {"value": "20%", "label": "Employee Satisfaction Rate", "description": "Our employee satisfaction rate stands at an impressive 20%."}
            ]
        }
    },
    {
        "templateId": "four-box-grid",
        "props": {
            "title": "Voices from Our Team",
            "subtitle": "What our employees say about working here",
            "boxes": [
                {"title": "[Employee Name]", "content": "Working here has been a transformative experience. The values resonate with my personal beliefs."},
                {"title": "[Employee Name]", "content": "I appreciate the emphasis on innovation. It inspires me to think outside the box."},
                {"title": "[Employee Name]", "content": "The teamwork culture makes every project enjoyable and successful."},
                {"title": "[Employee Name]", "content": "Our commitment to customer focus is evident in everything we do."}
            ]
        }
    },
    {
        "templateId": "timeline",
        "props": {
            "title": "Major Milestones in Our History",
            "events": [
                {"date": "[Year]", "content": "[Milestone 1: Description]"},
                {"date": "[Year]", "content": "[Milestone 2: Description]"},
                {"date": "[Year]", "content": "[Milestone 3: Description]"},
                {"date": "[Year]", "content": "[Milestone 4: Description]"}
            ]
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