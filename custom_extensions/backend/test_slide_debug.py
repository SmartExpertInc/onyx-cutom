#!/usr/bin/env python3
"""
Test script to debug slide generation issues by testing slides individually.
This helps identify which specific slide is causing the "Only 14/15 were successful" error.
"""

import asyncio
import sys
import os
import json
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent / "onyx-cutom" / "custom_extensions" / "backend"
sys.path.insert(0, str(backend_dir))

from app.services.pdf_generator import test_all_slides_individually, test_single_slide_generation

# Sample slide data for testing - you can replace this with your actual slide data
SAMPLE_SLIDES = [
    {
        "templateId": "title-slide",
        "props": {
            "title": "Sample Title Slide",
            "subtitle": "Sample Subtitle",
            "author": "Test Author",
            "date": "2024-01-01"
        }
    },
    {
        "templateId": "bullet-points",
        "props": {
            "title": "Sample Bullet Points",
            "subtitle": "Key points to remember",
            "bullets": [
                "First bullet point",
                "Second bullet point",
                "Third bullet point",
                "Fourth bullet point"
            ],
            "bulletStyle": "arrow"
        }
    },
    {
        "templateId": "two-column",
        "props": {
            "title": "Sample Two Column",
            "leftTitle": "Left Column",
            "leftContent": "This is the left column content",
            "rightTitle": "Right Column", 
            "rightContent": "This is the right column content"
        }
    },
    {
        "templateId": "big-numbers",
        "props": {
            "title": "Sample Big Numbers",
            "items": [
                {"value": "100", "label": "Users", "description": "Active users"},
                {"value": "50", "label": "Projects", "description": "Completed projects"},
                {"value": "25", "label": "Teams", "description": "Working teams"}
            ]
        }
    },
    {
        "templateId": "four-box-grid",
        "props": {
            "title": "Sample Four Box Grid",
            "boxes": [
                {"heading": "Box 1", "text": "Content for box 1"},
                {"heading": "Box 2", "text": "Content for box 2"},
                {"heading": "Box 3", "text": "Content for box 3"},
                {"heading": "Box 4", "text": "Content for box 4"}
            ]
        }
    },
    {
        "templateId": "timeline",
        "props": {
            "title": "Sample Timeline",
            "steps": [
                {"heading": "Step 1", "description": "First step description"},
                {"heading": "Step 2", "description": "Second step description"},
                {"heading": "Step 3", "description": "Third step description"}
            ]
        }
    },
    {
        "templateId": "challenges-solutions",
        "props": {
            "title": "Sample Challenges & Solutions",
            "challengesTitle": "Challenges",
            "challenges": ["Challenge 1", "Challenge 2", "Challenge 3"],
            "solutionsTitle": "Solutions",
            "solutions": ["Solution 1", "Solution 2", "Solution 3"]
        }
    },
    {
        "templateId": "process-steps",
        "props": {
            "title": "Sample Process Steps",
            "steps": [
                {"title": "Step 1", "description": "First process step"},
                {"title": "Step 2", "description": "Second process step"},
                {"title": "Step 3", "description": "Third process step"}
            ]
        }
    },
    {
        "templateId": "big-image-top",
        "props": {
            "title": "Sample Big Image Top",
            "subtitle": "Sample subtitle for big image slide"
        }
    },
    {
        "templateId": "big-image-left",
        "props": {
            "title": "Sample Big Image Left",
            "subtitle": "Sample subtitle for left image slide"
        }
    },
    {
        "templateId": "bullet-points-right",
        "props": {
            "title": "Sample Bullet Points Right",
            "subtitle": "Key points on the right",
            "bullets": [
                "Right bullet 1",
                "Right bullet 2",
                "Right bullet 3",
                "Right bullet 4"
            ],
            "bulletStyle": "check"
        }
    },
    {
        "templateId": "title-slide",
        "props": {
            "title": "Second Title Slide",
            "subtitle": "Another title slide"
        }
    },
    {
        "templateId": "title-slide",
        "props": {
            "title": "Third Title Slide",
            "subtitle": "Yet another title slide"
        }
    },
    {
        "templateId": "content-slide",
        "props": {
            "title": "Sample Content Slide",
            "content": "This is a content slide with some sample text content."
        }
    },
    {
        "templateId": "two-column",
        "props": {
            "title": "Sample Two Column Diversity",
            "leftTitle": "Our Commitment",
            "leftContent": "We are dedicated to fostering a diverse and inclusive workplace.",
            "rightTitle": "Benefits of Diversity",
            "rightBullets": [
                "Increased creativity",
                "Better problem solving",
                "Improved performance"
            ]
        }
    }
]

async def main():
    """Main test function."""
    print("🧪 Starting individual slide testing...")
    print(f"📊 Testing {len(SAMPLE_SLIDES)} sample slides")
    print("=" * 60)
    
    # Test all slides individually
    summary = await test_all_slides_individually(SAMPLE_SLIDES, "light-modern")
    
    print("\n" + "=" * 60)
    print("📋 FINAL SUMMARY:")
    print(f"   Total slides tested: {summary['total_slides']}")
    print(f"   ✅ Successful: {summary['successful_slides']}")
    print(f"   ❌ Failed: {summary['failed_slides']}")
    
    if summary['failed_slides']:
        print("\n🚨 FAILED SLIDES:")
        for failed in summary['failed_slide_details']:
            print(f"   - Slide {failed['slide_index']} ({failed['template_id']})")
            print(f"     Error: {failed['error']}")
            print()
    else:
        print("\n🎉 All slides passed individual testing!")
    
    # Save detailed results to file
    results_file = "slide_test_results.json"
    with open(results_file, 'w') as f:
        json.dump(summary, f, indent=2)
    print(f"\n📄 Detailed results saved to: {results_file}")

if __name__ == "__main__":
    asyncio.run(main()) 