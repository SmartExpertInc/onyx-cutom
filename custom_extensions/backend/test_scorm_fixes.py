#!/usr/bin/env python3
"""
Test script to verify SCORM packaging fixes
"""
import asyncio
import os
import sys

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from services.scorm_packager import _process_image_paths_in_html, _render_quiz_html

async def test_image_processing():
    """Test image path processing"""
    print("Testing image processing...")
    
    # Test HTML with image paths
    test_html = '''
    <html>
    <body>
        <img src="/static_design_images/test.jpg" alt="Test Image">
        <div style="background-image: url('/static_design_images/bg.png')">Content</div>
    </body>
    </html>
    '''
    
    processed_html = await _process_image_paths_in_html(test_html)
    print(f"Original length: {len(test_html)}")
    print(f"Processed length: {len(processed_html)}")
    
    if "data:" in processed_html:
        print("✅ Image processing appears to be working (found data: URIs)")
    else:
        print("⚠️ No data URIs found - images may not exist or processing failed")

def test_quiz_rendering():
    """Test quiz HTML rendering"""
    print("\nTesting quiz rendering...")
    
    # Sample quiz data
    product_row = {
        'project_name': 'Test Quiz',
        'parent_project_name': 'Test Course',
        'lesson_number': 1
    }
    
    quiz_content = {
        'quizTitle': 'Sample Quiz',
        'questions': [
            {
                'question_type': 'multiple-choice',
                'question_text': 'What is 2 + 2?',
                'options': [
                    {'id': 'A', 'text': '3'},
                    {'id': 'B', 'text': '4'},
                    {'id': 'C', 'text': '5'}
                ],
                'correct_option_id': 'B',
                'explanation': 'Basic arithmetic: 2 + 2 = 4'
            }
        ]
    }
    
    quiz_html = _render_quiz_html(product_row, quiz_content)
    
    if len(quiz_html) > 1000:
        print("✅ Quiz HTML generated successfully")
        print(f"HTML length: {len(quiz_html)} characters")
        
        # Check for key components
        checks = [
            ('Quiz title section', 'quiz-title-section' in quiz_html),
            ('Question blocks', 'question-block' in quiz_html),
            ('Interactive JavaScript', 'selectOption' in quiz_html),
            ('SCORM integration', 'LMSSetValue' in quiz_html),
            ('PDF-style CSS', '@import url' in quiz_html and 'Inter' in quiz_html)
        ]
        
        for check_name, passed in checks:
            status = "✅" if passed else "❌"
            print(f"  {status} {check_name}")
    else:
        print("❌ Quiz HTML generation failed or too short")

async def main():
    """Run all tests"""
    print("SCORM Packaging Test Suite")
    print("=" * 40)
    
    await test_image_processing()
    test_quiz_rendering()
    
    print("\nTest complete!")

if __name__ == "__main__":
    asyncio.run(main()) 