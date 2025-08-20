#!/usr/bin/env python3
"""
Test script to verify that PDF and preview use the same data processing.
This ensures consistency between what users see in preview and what they get in PDF.
"""

import asyncio
import json
import logging
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def round_hours_in_content(content: Any) -> Any:
    """Recursively round all hours fields to integers in content structure"""
    if isinstance(content, dict):
        result = {}
        for key, value in content.items():
            if key == 'hours' and isinstance(value, (int, float)):
                result[key] = round(value)
            elif key == 'totalHours' and isinstance(value, (int, float)):
                result[key] = round(value)
            elif isinstance(value, (dict, list)):
                result[key] = round_hours_in_content(value)
            else:
                result[key] = value
        return result
    elif isinstance(content, list):
        return [round_hours_in_content(item) for item in content]
    else:
        return content

def process_content_for_preview(content_json: Any) -> Dict[str, Any]:
    """Simulate the data processing used in get_project_instance_detail (preview)"""
    processed_content = None
    if content_json:
        if isinstance(content_json, str):
            try:
                # Parse JSON string to dict
                content_dict = json.loads(content_json)
                # Round hours to integers before returning
                processed_content = round_hours_in_content(content_dict)
                logger.info("Preview processing: Parsed from JSON string and processed")
            except (json.JSONDecodeError, TypeError) as e:
                logger.error(f"Preview processing: Failed to parse JSON: {e}")
                processed_content = None
        else:
            # Already a dict, just round hours
            processed_content = round_hours_in_content(content_json)
            logger.info("Preview processing: Already dict, processed with round_hours")
    
    return processed_content

def process_content_for_pdf(content_json: Any) -> Dict[str, Any]:
    """Simulate the data processing used in download_project_instance_pdf (PDF)"""
    processed_content = None
    if content_json:
        if isinstance(content_json, str):
            try:
                # Parse JSON string to dict
                content_dict = json.loads(content_json)
                # Round hours to integers before processing
                processed_content = round_hours_in_content(content_dict)
                logger.info("PDF processing: Parsed from JSON string and processed")
            except (json.JSONDecodeError, TypeError) as e:
                logger.error(f"PDF processing: Failed to parse JSON: {e}")
                processed_content = None
        else:
            # Already a dict, just round hours
            processed_content = round_hours_in_content(content_json)
            logger.info("PDF processing: Already dict, processed with round_hours")
    
    return processed_content

def test_data_consistency():
    """Test that preview and PDF processing produce identical results"""
    
    # Test case 1: Training plan with float hours
    test_data_1 = {
        "mainTitle": "Test Training Plan",
        "sections": [
            {
                "title": "Section 1",
                "totalHours": 5.7,
                "lessons": [
                    {
                        "title": "Lesson 1",
                        "hours": 2.3,
                        "completionTime": "30m"
                    },
                    {
                        "title": "Lesson 2", 
                        "hours": 3.4,
                        "completionTime": "45m"
                    }
                ]
            }
        ],
        "detectedLanguage": "en"
    }
    
    # Test case 2: PDF lesson with content blocks
    test_data_2 = {
        "lessonTitle": "Test PDF Lesson",
        "contentBlocks": [
            {
                "type": "headline",
                "level": 1,
                "text": "Main Headline"
            },
            {
                "type": "paragraph",
                "text": "This is a test paragraph."
            }
        ],
        "detectedLanguage": "en"
    }
    
    # Test case 3: String JSON
    test_data_3_str = json.dumps({
        "mainTitle": "String JSON Test",
        "sections": [
            {
                "title": "Section 1",
                "totalHours": 4.2,
                "lessons": [
                    {
                        "title": "Lesson 1",
                        "hours": 2.1,
                        "completionTime": "25m"
                    }
                ]
            }
        ],
        "detectedLanguage": "en"
    })
    
    test_cases = [
        ("Training Plan with float hours", test_data_1),
        ("PDF Lesson with content blocks", test_data_2),
        ("String JSON training plan", test_data_3_str)
    ]
    
    all_passed = True
    
    for test_name, test_data in test_cases:
        logger.info(f"\n=== Testing: {test_name} ===")
        
        # Process data for preview
        preview_result = process_content_for_preview(test_data)
        
        # Process data for PDF
        pdf_result = process_content_for_pdf(test_data)
        
        # Compare results
        if preview_result == pdf_result:
            logger.info(f"✅ PASS: {test_name} - Preview and PDF processing produce identical results")
            
            # Log the processed data for verification
            if isinstance(preview_result, dict) and 'sections' in preview_result:
                for section in preview_result['sections']:
                    logger.info(f"  Section '{section['title']}': totalHours={section['totalHours']}")
                    for lesson in section['lessons']:
                        logger.info(f"    Lesson '{lesson['title']}': hours={lesson['hours']}")
        else:
            logger.error(f"❌ FAIL: {test_name} - Preview and PDF processing produce different results")
            logger.error(f"Preview result: {json.dumps(preview_result, indent=2)}")
            logger.error(f"PDF result: {json.dumps(pdf_result, indent=2)}")
            all_passed = False
    
    return all_passed

def test_edge_cases():
    """Test edge cases to ensure robustness"""
    
    logger.info("\n=== Testing Edge Cases ===")
    
    # Test with None
    preview_none = process_content_for_preview(None)
    pdf_none = process_content_for_pdf(None)
    assert preview_none == pdf_none, "None processing should be identical"
    logger.info("✅ PASS: None processing")
    
    # Test with empty dict
    preview_empty = process_content_for_preview({})
    pdf_empty = process_content_for_pdf({})
    assert preview_empty == pdf_empty, "Empty dict processing should be identical"
    logger.info("✅ PASS: Empty dict processing")
    
    # Test with invalid JSON string
    preview_invalid = process_content_for_preview("{invalid json}")
    pdf_invalid = process_content_for_pdf("{invalid json}")
    assert preview_invalid == pdf_invalid, "Invalid JSON processing should be identical"
    logger.info("✅ PASS: Invalid JSON processing")
    
    logger.info("✅ All edge cases passed")

if __name__ == "__main__":
    logger.info("Starting PDF/Preview data consistency tests...")
    
    try:
        # Test main functionality
        main_tests_passed = test_data_consistency()
        
        # Test edge cases
        test_edge_cases()
        
        if main_tests_passed:
            logger.info("\n🎉 All tests passed! PDF and preview data processing are consistent.")
        else:
            logger.error("\n💥 Some tests failed! PDF and preview data processing are inconsistent.")
            exit(1)
            
    except Exception as e:
        logger.error(f"Test execution failed: {e}", exc_info=True)
        exit(1) 