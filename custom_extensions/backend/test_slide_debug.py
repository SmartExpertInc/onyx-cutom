#!/usr/bin/env python3
"""
Test script specifically for debugging the big-numbers slide issue.
"""

import asyncio
import sys
import os
import json
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent / "onyx-cutom" / "custom_extensions" / "backend"
sys.path.insert(0, str(backend_dir))

from app.services.pdf_generator import test_single_slide_generation

# The exact slide data that's failing
BIG_NUMBERS_SLIDE = {
    "slideId": "slide_11_achievements",
    "templateId": "big-numbers",
    "props": {
        "title": "Key Achievements",
        "items": [
            {
                "label": "Countries Served",
                "value": "100+",
                "description": "We have expanded our operations to over 100 countries worldwide."
            },
            {
                "label": "Years in Business",
                "value": "5",
                "description": "Celebrating over 5 years of successful operations."
            },
            {
                "label": "Employee Satisfaction Rate",
                "value": "20%",
                "description": "Our employee satisfaction rate stands at an impressive 20%."
            }
        ]
    }
}

async def test_big_numbers_slide():
    """Test the big-numbers slide specifically."""
    print("🧪 Testing big-numbers slide specifically...")
    print("📊 Slide data:")
    print(json.dumps(BIG_NUMBERS_SLIDE, indent=2))
    print("=" * 60)
    
    # Test the slide
    result = await test_single_slide_generation(BIG_NUMBERS_SLIDE, "light-modern", 11)
    
    print("\n" + "=" * 60)
    print("📋 TEST RESULTS:")
    print(f"   Success: {result['success']}")
    print(f"   Template ID: {result['template_id']}")
    print(f"   Height calculation success: {result['height_calculation_success']}")
    print(f"   PDF generation success: {result['pdf_generation_success']}")
    print(f"   Calculated height: {result['calculated_height']}")
    
    if result['error']:
        print(f"   ❌ Error: {result['error']}")
    else:
        print("   ✅ No errors found")
    
    return result

if __name__ == "__main__":
    asyncio.run(test_big_numbers_slide()) 