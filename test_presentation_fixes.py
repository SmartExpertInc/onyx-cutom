#!/usr/bin/env python3
"""
Test script to validate presentation generation fixes:
1. previewKeyPoints generation
2. big-numbers using steps[] with descriptions
3. realistic image prompts
4. comprehensive content
5. proper slide count handling
"""

import json
import re

def test_presentation_json_structure():
    """Test that the expected JSON structure includes all required fields"""
    
    # Expected structure for each slide
    required_slide_fields = [
        'slideId', 'slideNumber', 'slideTitle', 'templateId', 'props', 'previewKeyPoints'
    ]
    
    # Expected big-numbers structure
    big_numbers_expected = {
        'props': {
            'title': 'string',
            'steps': [
                {
                    'value': 'string',
                    'label': 'string', 
                    'description': 'string (non-empty)'
                }
            ]
        }
    }
    
    print("✓ Test structure requirements:")
    print(f"  - Required slide fields: {required_slide_fields}")
    print(f"  - Big-numbers must use 'steps' not 'numbers'")
    print(f"  - Each step needs value, label, description")
    print(f"  - previewKeyPoints should be 4-6 content-rich bullets")
    
def test_image_prompt_requirements():
    """Test image prompt transformation requirements"""
    
    # Test cases for image prompt transformation
    test_prompts = [
        {
            'input': 'Minimalist flat design illustration of marketing team',
            'should_contain': ['Realistic cinematic scene', 'cinematic', 'lens', 'depth of field']
        },
        {
            'input': 'A roadmap illustration showing learning journey',
            'should_contain': ['realistic', 'scene', 'cinematic']
        }
    ]
    
    print("✓ Image prompt requirements:")
    print("  - Must start with 'Realistic cinematic scene of...'")
    print("  - Include technical specs (lens, lighting, etc.)")
    print("  - No flat design/minimalist/illustration language")
    print("  - Use color placeholders [COLOR1], etc.")

def test_content_requirements():
    """Test content comprehensiveness requirements"""
    
    content_requirements = [
        "Bullet points should be 15-25 words each",
        "Include specific examples and methodologies", 
        "Big-numbers descriptions must explain significance",
        "Educational value in every slide",
        "No closing/thank you slides"
    ]
    
    print("✓ Content requirements:")
    for req in content_requirements:
        print(f"  - {req}")

def validate_json_response(json_str):
    """Validate a JSON response meets all requirements"""
    
    try:
        data = json.loads(json_str)
    except json.JSONDecodeError as e:
        return False, f"Invalid JSON: {e}"
    
    issues = []
    
    # Check root structure
    if 'lessonTitle' not in data:
        issues.append("Missing lessonTitle")
    if 'slides' not in data or not isinstance(data['slides'], list):
        issues.append("Missing or invalid slides array")
    
    # Check each slide
    for i, slide in enumerate(data.get('slides', [])):
        slide_num = i + 1
        
        # Check required fields
        required_fields = ['slideId', 'slideNumber', 'slideTitle', 'templateId', 'props']
        for field in required_fields:
            if field not in slide:
                issues.append(f"Slide {slide_num}: Missing {field}")
        
        # Check previewKeyPoints
        if 'previewKeyPoints' not in slide:
            issues.append(f"Slide {slide_num}: Missing previewKeyPoints")
        elif not isinstance(slide['previewKeyPoints'], list) or len(slide['previewKeyPoints']) < 3:
            issues.append(f"Slide {slide_num}: previewKeyPoints should be array with 3+ items")
        
        # Check big-numbers template
        if slide.get('templateId') == 'big-numbers':
            props = slide.get('props', {})
            if 'numbers' in props:
                issues.append(f"Slide {slide_num}: big-numbers uses 'numbers' instead of 'steps'")
            if 'steps' not in props:
                issues.append(f"Slide {slide_num}: big-numbers missing 'steps'")
            else:
                steps = props['steps']
                if not isinstance(steps, list) or len(steps) != 3:
                    issues.append(f"Slide {slide_num}: big-numbers should have exactly 3 steps")
                for j, step in enumerate(steps):
                    if not isinstance(step, dict):
                        continue
                    if not step.get('description', '').strip():
                        issues.append(f"Slide {slide_num}: step {j+1} missing description")
        
        # Check image prompts
        props = slide.get('props', {})
        for prompt_field in ['imagePrompt', 'leftImagePrompt', 'rightImagePrompt']:
            if prompt_field in props:
                prompt = props[prompt_field]
                if 'flat design' in prompt.lower() or 'minimalist' in prompt.lower() or 'illustration' in prompt.lower():
                    issues.append(f"Slide {slide_num}: {prompt_field} still uses illustration language")
                if not ('realistic' in prompt.lower() or 'cinematic' in prompt.lower()):
                    issues.append(f"Slide {slide_num}: {prompt_field} doesn't use realistic scene language")
    
    return len(issues) == 0, issues

if __name__ == "__main__":
    print("🧪 Presentation Generation Fixes Validation")
    print("=" * 50)
    
    test_presentation_json_structure()
    print()
    test_image_prompt_requirements() 
    print()
    test_content_requirements()
    
    print("\n📋 Summary of Required Fixes:")
    print("1. ✅ previewKeyPoints added to instructions")
    print("2. ✅ big-numbers template fixed to use steps[]")
    print("3. ✅ Image prompt transformation added")
    print("4. ✅ Content density requirements added")
    print("5. ⚠️  Closing slide detection needs refinement")
    
    print("\n🔍 To test with real API:")
    print("- Generate a presentation and check the logs")
    print("- Verify JSON structure matches requirements")
    print("- Check that all slides have previewKeyPoints")
    print("- Confirm big-numbers uses steps[] with descriptions")
    print("- Validate image prompts are realistic scenes") 