#!/usr/bin/env python3
"""
Test script for PDF generation system
Tests both browser-based and fallback PDF generation methods
"""

import asyncio
import sys
import os
import tempfile
from pathlib import Path

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'custom_extensions', 'backend'))

from app.services.pdf_generator import (
    generate_slide_deck_pdf_with_dynamic_height,
    generate_fallback_pdf,
    cleanup
)

# Test slide data
test_slides = [
    {
        "templateId": "title-slide",
        "props": {
            "title": "Test Presentation",
            "subtitle": "A sample presentation for testing",
            "author": "Test Author",
            "date": "2024-01-01"
        }
    },
    {
        "templateId": "content-slide",
        "props": {
            "title": "Content Slide",
            "content": "This is a test content slide with some sample text to verify that the PDF generation is working correctly."
        }
    },
    {
        "templateId": "bullet-points",
        "props": {
            "title": "Bullet Points Slide",
            "bullets": [
                "First bullet point",
                "Second bullet point",
                "Third bullet point with longer text to test wrapping",
                "Fourth bullet point"
            ]
        }
    },
    {
        "templateId": "big-image-left",
        "props": {
            "title": "Image Slide",
            "subtitle": "This slide has an image placeholder on the left side",
            "imagePath": None,
            "imageAlt": "Sample image"
        }
    }
]

async def test_pdf_generation():
    """Test the PDF generation system"""
    
    print("🧪 Testing PDF Generation System")
    print("=" * 50)
    
    try:
        # Test the main PDF generation function
        print("📄 Testing main PDF generation...")
        
        output_filename = f"test_presentation_{os.getpid()}.pdf"
        output_path = await generate_slide_deck_pdf_with_dynamic_height(
            slides_data=test_slides,
            theme="dark-purple",
            output_filename=output_filename,
            use_cache=False
        )
        
        if os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            print(f"✅ PDF generated successfully!")
            print(f"   📁 Path: {output_path}")
            print(f"   📊 Size: {file_size} bytes")
            print(f"   📄 Slides: {len(test_slides)}")
        else:
            print("❌ PDF file not found after generation")
            return False
            
    except Exception as e:
        print(f"❌ PDF generation failed: {e}")
        return False
    
    try:
        # Test fallback PDF generation
        print("\n🔄 Testing fallback PDF generation...")
        
        fallback_filename = f"test_fallback_{os.getpid()}.pdf"
        fallback_path = os.path.join('/app/tmp_pdf', fallback_filename)
        
        success = generate_fallback_pdf(
            slides_data=test_slides,
            theme="light-modern",
            output_path=fallback_path
        )
        
        if success and os.path.exists(fallback_path):
            file_size = os.path.getsize(fallback_path)
            print(f"✅ Fallback PDF generated successfully!")
            print(f"   📁 Path: {fallback_path}")
            print(f"   📊 Size: {file_size} bytes")
        else:
            print("❌ Fallback PDF generation failed")
            return False
            
    except Exception as e:
        print(f"❌ Fallback PDF generation failed: {e}")
        return False
    
    print("\n🎉 All tests passed!")
    return True

async def main():
    """Main test function"""
    try:
        success = await test_pdf_generation()
        if success:
            print("\n✅ PDF Generation System is working correctly!")
            sys.exit(0)
        else:
            print("\n❌ PDF Generation System has issues!")
            sys.exit(1)
    except Exception as e:
        print(f"\n💥 Test failed with exception: {e}")
        sys.exit(1)
    finally:
        # Cleanup
        await cleanup()

if __name__ == "__main__":
    asyncio.run(main())
