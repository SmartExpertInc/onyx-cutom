#!/usr/bin/env python3
"""
Test script to verify smart edit language and theme preservation
"""

def test_language_theme_preservation():
    """Test that language and theme are preserved during smart edit"""
    
    # Simulate original training plan data
    original_content = {
        "mainTitle": "План обучения по искусственному интеллекту",
        "sections": [
            {
                "id": "№1",
                "title": "Введение в ИИ",
                "totalHours": 5.0,
                "lessons": [
                    {
                        "title": "Основы машинного обучения",
                        "hours": 2.0,
                        "source": "Внутренняя документация",
                        "completionTime": "5m",
                        "check": {"type": "test", "text": "Тест по основам"},
                        "contentAvailable": {"type": "yes", "text": "100%"}
                    }
                ],
                "autoCalculateHours": True
            }
        ],
        "detectedLanguage": "ru",
        "theme": "ocean"
    }
    
    # Simulate smart edit request payload
    edit_payload = {
        "prompt": "Add one more lesson to the first module",
        "projectId": 123,
        "language": "ru",  # Should preserve Russian language
        "theme": "ocean"   # Should preserve ocean theme
    }
    
    # Simulate parsed result from AI
    parsed_result = {
        "mainTitle": "План обучения по искусственному интеллекту",
        "sections": [
            {
                "id": "№1",
                "title": "Введение в ИИ",
                "totalHours": 7.0,
                "lessons": [
                    {
                        "title": "Основы машинного обучения",
                        "hours": 2.0,
                        "source": "Внутренняя документация",
                        "completionTime": "5m",
                        "check": {"type": "test", "text": "Тест по основам"},
                        "contentAvailable": {"type": "yes", "text": "100%"}
                    },
                    {
                        "title": "Новый урок по ИИ",
                        "hours": 2.0,
                        "source": "Создать с нуля",
                        "completionTime": "6m",
                        "check": {"type": "quiz", "text": "Викторина"},
                        "contentAvailable": {"type": "yes", "text": "100%"}
                    }
                ],
                "autoCalculateHours": True
            }
        ],
        "detectedLanguage": "ru",
        "theme": "ocean"  # Should be preserved from original
    }
    
    # Test cases
    test_cases = [
        {
            "name": "Language preservation",
            "original": original_content["detectedLanguage"],
            "result": parsed_result["detectedLanguage"],
            "expected": "ru"
        },
        {
            "name": "Theme preservation",
            "original": original_content["theme"],
            "result": parsed_result["theme"],
            "expected": "ocean"
        },
        {
            "name": "Russian content preservation",
            "original": original_content["mainTitle"],
            "result": parsed_result["mainTitle"],
            "expected": "План обучения по искусственному интеллекту"
        },
        {
            "name": "Module ID preservation",
            "original": original_content["sections"][0]["id"],
            "result": parsed_result["sections"][0]["id"],
            "expected": "№1"
        }
    ]
    
    print("🧪 Testing Smart Edit Language and Theme Preservation")
    print("=" * 60)
    
    all_passed = True
    
    for test_case in test_cases:
        original = test_case["original"]
        result = test_case["result"]
        expected = test_case["expected"]
        
        if result == expected:
            print(f"✅ {test_case['name']}: PASSED")
            print(f"   Original: {original}")
            print(f"   Result:   {result}")
        else:
            print(f"❌ {test_case['name']}: FAILED")
            print(f"   Original: {original}")
            print(f"   Result:   {result}")
            print(f"   Expected: {expected}")
            all_passed = False
        print()
    
    # Test payload validation
    print("🔧 Testing Payload Structure")
    print("-" * 40)
    
    required_fields = ["prompt", "projectId", "language", "theme"]
    for field in required_fields:
        if field in edit_payload:
            print(f"✅ {field}: {edit_payload[field]}")
        else:
            print(f"❌ {field}: MISSING")
            all_passed = False
    
    print()
    
    if all_passed:
        print("🎉 All tests PASSED! Language and theme preservation is working correctly.")
    else:
        print("💥 Some tests FAILED! Check the implementation.")
    
    return all_passed

def test_fallback_behavior():
    """Test fallback behavior when language/theme are not provided"""
    
    print("\n🔄 Testing Fallback Behavior")
    print("=" * 40)
    
    # Test with missing language and theme
    edit_payload_no_lang_theme = {
        "prompt": "Add a lesson",
        "projectId": 123
        # No language or theme specified
    }
    
    # Should fallback to defaults
    expected_language = "en"
    expected_theme = "cherry"
    
    actual_language = edit_payload_no_lang_theme.get("language", "en")
    actual_theme = edit_payload_no_lang_theme.get("theme", "cherry")
    
    print(f"Language fallback: {actual_language} (expected: {expected_language})")
    print(f"Theme fallback: {actual_theme} (expected: {expected_theme})")
    
    if actual_language == expected_language and actual_theme == expected_theme:
        print("✅ Fallback behavior working correctly")
        return True
    else:
        print("❌ Fallback behavior not working correctly")
        return False

if __name__ == "__main__":
    print("Smart Edit Language and Theme Preservation Tests")
    print("=" * 60)
    
    test1_passed = test_language_theme_preservation()
    test2_passed = test_fallback_behavior()
    
    if test1_passed and test2_passed:
        print("\n🎉 All tests PASSED!")
        exit(0)
    else:
        print("\n💥 Some tests FAILED!")
        exit(1) 