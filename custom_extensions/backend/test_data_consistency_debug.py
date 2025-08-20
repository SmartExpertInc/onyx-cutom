#!/usr/bin/env python3
"""
Debug script to test data consistency between PDF and preview processing
"""

import json
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from main import round_hours_in_content

def test_data_processing():
    """Test the data processing to see what the actual difference is"""
    
    # Sample data that might have decimal hours
    sample_data = {
        "lessonTitle": "Test Lesson",
        "contentBlocks": [
            {
                "type": "paragraph",
                "text": "This is a test paragraph"
            }
        ],
        "sections": [
            {
                "title": "Section 1",
                "lessons": [
                    {
                        "title": "Lesson 1",
                        "hours": 2.5,
                        "completionTime": "2.5h"
                    },
                    {
                        "title": "Lesson 2", 
                        "hours": 1.75,
                        "completionTime": "1.75h"
                    }
                ]
            }
        ],
        "slides": [
            {
                "title": "Slide 1",
                "hours": 3.25
            }
        ]
    }
    
    print("=== ORIGINAL DATA ===")
    print(json.dumps(sample_data, indent=2))
    
    print("\n=== AFTER round_hours_in_content ===")
    processed_data = round_hours_in_content(sample_data)
    print(json.dumps(processed_data, indent=2))
    
    # Test with JSON string
    print("\n=== TESTING WITH JSON STRING ===")
    json_string = json.dumps(sample_data)
    print(f"JSON string: {json_string[:100]}...")
    
    # Parse and process
    parsed_data = json.loads(json_string)
    processed_from_string = round_hours_in_content(parsed_data)
    print("Processed from string:")
    print(json.dumps(processed_from_string, indent=2))
    
    # Check if they're the same
    print("\n=== COMPARISON ===")
    print(f"Direct processing == String processing: {processed_data == processed_from_string}")

if __name__ == "__main__":
    test_data_processing() 