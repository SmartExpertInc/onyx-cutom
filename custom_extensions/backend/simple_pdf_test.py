#!/usr/bin/env python3
"""
Simple test for PDF generation using fallback method
"""

import sys
import os
from pathlib import Path

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'custom_extensions', 'backend'))

from app.services.pdf_generator import generate_fallback_pdf

# Simple test slide data
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
            "content": "This is a test content slide with some sample text."
        }
    }
]

def test_fallback_pdf():
    """Test the fallback PDF generation"""
    
    print("🧪 Testing Fallback PDF Generation")
    print("=" * 40)
    
    try:
        # Create output directory
        output_dir = '/app/tmp_pdf'
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate PDF
        output_filename = f"simple_test_{os.getpid()}.pdf"
        output_path = os.path.join(output_dir, output_filename)
        
        print(f"📄 Generating PDF: {output_path}")
        
        success = generate_fallback_pdf(
            slides_data=test_slides,
            theme="light-modern",
            output_path=output_path
        )
        
        if success and os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            print(f"✅ PDF generated successfully!")
            print(f"   📁 Path: {output_path}")
            print(f"   📊 Size: {file_size} bytes")
            print(f"   📄 Slides: {len(test_slides)}")
            return True
        else:
            print("❌ PDF generation failed")
            return False
            
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_fallback_pdf()
    if success:
        print("\n✅ Fallback PDF Generation is working!")
        sys.exit(0)
    else:
        print("\n❌ Fallback PDF Generation has issues!")
        sys.exit(1)
