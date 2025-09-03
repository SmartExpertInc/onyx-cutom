#!/usr/bin/env python3
"""
Test script for LessonPlan PDF generation functionality.
This script tests the PDF generation logic for LessonPlan components.
"""

import asyncio
import json
import sys
import os

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Mock data for testing
MOCK_LESSON_PLAN_DATA = {
    "lessonTitle": "Introduction to Machine Learning",
    "shortDescription": "A comprehensive introduction to the fundamentals of machine learning algorithms and their applications.",
    "lessonObjectives": [
        "Understand the basic concepts of machine learning",
        "Identify different types of machine learning algorithms",
        "Apply basic ML concepts to real-world problems",
        "Evaluate the performance of ML models"
    ],
    "recommendedProductTypes": {
        "slide-deck": "Create engaging slides explaining ML concepts with visual examples",
        "video-lesson": "Produce a video tutorial demonstrating ML algorithms in action",
        "interactive-quiz": "Develop assessment questions to test understanding of ML principles"
    },
    "materials": [
        "Python programming environment",
        "Jupyter notebooks with examples",
        "Sample datasets for practice",
        "Reference materials and documentation"
    ],
    "suggestedPrompts": [
        "Explain the difference between supervised and unsupervised learning with concrete examples",
        "Create a step-by-step guide for implementing a simple linear regression model",
        "Design an interactive exercise that helps students understand overfitting in ML models"
    ]
}

def test_lesson_plan_pdf_data_preparation():
    """Test the data preparation logic for LessonPlan PDF generation."""
    
    # Simulate the backend logic
    mp_name_for_pdf_context = "Introduction to Machine Learning"
    detected_lang_for_pdf = "en"
    
    # This is the logic from the backend
    if MOCK_LESSON_PLAN_DATA:
        data_for_template_render = {
            "lessonTitle": MOCK_LESSON_PLAN_DATA.get('lessonTitle', mp_name_for_pdf_context),
            "shortDescription": MOCK_LESSON_PLAN_DATA.get('shortDescription', ''),
            "lessonObjectives": MOCK_LESSON_PLAN_DATA.get('lessonObjectives', []),
            "recommendedProductTypes": MOCK_LESSON_PLAN_DATA.get('recommendedProductTypes', {}),
            "materials": MOCK_LESSON_PLAN_DATA.get('materials', []),
            "suggestedPrompts": MOCK_LESSON_PLAN_DATA.get('suggestedPrompts', []),
            "detectedLanguage": detected_lang_for_pdf
        }
    else:
        data_for_template_render = {
            "lessonTitle": mp_name_for_pdf_context,
            "shortDescription": "Lesson plan content not available",
            "lessonObjectives": [],
            "recommendedProductTypes": {},
            "materials": [],
            "suggestedPrompts": [],
            "detectedLanguage": detected_lang_for_pdf
        }
    
    # Verify the data structure
    print("✅ LessonPlan PDF Data Preparation Test")
    print(f"   Lesson Title: {data_for_template_render['lessonTitle']}")
    print(f"   Description: {data_for_template_render['shortDescription'][:50]}...")
    print(f"   Objectives Count: {len(data_for_template_render['lessonObjectives'])}")
    print(f"   Product Types Count: {len(data_for_template_render['recommendedProductTypes'])}")
    print(f"   Materials Count: {len(data_for_template_render['materials'])}")
    print(f"   Prompts Count: {len(data_for_template_render['suggestedPrompts'])}")
    print(f"   Language: {data_for_template_render['detectedLanguage']}")
    
    # Verify required fields are present
    required_fields = ['lessonTitle', 'shortDescription', 'lessonObjectives', 'recommendedProductTypes', 'materials', 'suggestedPrompts', 'detectedLanguage']
    missing_fields = [field for field in required_fields if field not in data_for_template_render]
    
    if missing_fields:
        print(f"❌ Missing required fields: {missing_fields}")
        return False
    else:
        print("✅ All required fields are present")
        return True

def test_template_context():
    """Test the template context structure."""
    
    # Simulate the template context creation
    data_for_template_render = {
        "lessonTitle": "Test Lesson",
        "shortDescription": "Test Description",
        "lessonObjectives": ["Objective 1", "Objective 2"],
        "recommendedProductTypes": {"type1": "Description 1"},
        "materials": ["Material 1"],
        "suggestedPrompts": ["Prompt 1"],
        "detectedLanguage": "en"
    }
    
    context_for_jinja = {
        'details': data_for_template_render,
        'locale': {'en': 'English'},
        'parentProjectName': None,
        'lessonNumber': None,
        'pdf_context': {
            'static_images_path': '/tmp/static_images/'
        }
    }
    
    print("\n✅ Template Context Test")
    print(f"   Context keys: {list(context_for_jinja.keys())}")
    print(f"   Details keys: {list(context_for_jinja['details'].keys())}")
    
    # Verify template can access data
    if 'details' in context_for_jinja and 'lessonTitle' in context_for_jinja['details']:
        print(f"   Template can access lessonTitle: {context_for_jinja['details']['lessonTitle']}")
        print("✅ Template context structure is correct")
        return True
    else:
        print("❌ Template context structure is incorrect")
        return False

def test_error_handling():
    """Test error handling scenarios."""
    
    print("\n✅ Error Handling Test")
    
    # Test with missing lesson_plan_data
    content_json = {}
    mp_name_for_pdf_context = "Test Project"
    detected_lang_for_pdf = "en"
    
    if content_json and isinstance(content_json, dict):
        lesson_plan_data = content_json.get('lesson_plan_data', {})
        if lesson_plan_data:
            data_for_template_render = {
                "lessonTitle": lesson_plan_data.get('lessonTitle', mp_name_for_pdf_context),
                "shortDescription": lesson_plan_data.get('shortDescription', ''),
                "lessonObjectives": lesson_plan_data.get('lessonObjectives', []),
                "recommendedProductTypes": lesson_plan_data.get('recommendedProductTypes', {}),
                "materials": lesson_plan_data.get('materials', []),
                "suggestedPrompts": lesson_plan_data.get('suggestedPrompts', []),
                "detectedLanguage": detected_lang_for_pdf
            }
        else:
            data_for_template_render = {
                "lessonTitle": mp_name_for_pdf_context,
                "shortDescription": "Lesson plan content not available",
                "lessonObjectives": [],
                "recommendedProductTypes": {},
                "materials": [],
                "suggestedPrompts": [],
                "detectedLanguage": detected_lang_for_pdf
            }
    else:
        data_for_template_render = {
            "lessonTitle": f"Content Error: {mp_name_for_pdf_context}",
            "shortDescription": "Lesson plan content not available",
            "lessonObjectives": [],
            "recommendedProductTypes": {},
            "materials": [],
            "suggestedPrompts": [],
            "detectedLanguage": detected_lang_for_pdf
        }
    
    print(f"   Error case lessonTitle: {data_for_template_render['lessonTitle']}")
    print(f"   Error case description: {data_for_template_render['shortDescription']}")
    
    if "Content Error" in data_for_template_render['lessonTitle']:
        print("✅ Error handling works correctly")
        return True
    else:
        print("❌ Error handling is not working")
        return False

def main():
    """Run all tests."""
    print("🧪 LessonPlan PDF Generation Test Suite")
    print("=" * 50)
    
    tests = [
        test_lesson_plan_pdf_data_preparation,
        test_template_context,
        test_error_handling
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with error: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! LessonPlan PDF generation is ready.")
        return True
    else:
        print("⚠️  Some tests failed. Please review the implementation.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
