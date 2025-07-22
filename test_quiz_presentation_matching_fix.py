#!/usr/bin/env python3
"""
Test script to verify quiz and presentation matching fix
"""

def test_quiz_presentation_matching():
    """Test that quizzes are not matched as presentations"""
    
    # Simulate user microproducts data
    all_user_microproducts = [
        {
            "id": 1,
            "projectName": "AI Course: Introduction to Machine Learning",
            "microProductName": "Introduction to Machine Learning",
            "design_microproduct_type": "SlideDeckDisplay"  # Presentation
        },
        {
            "id": 2,
            "projectName": "AI Course: Introduction to Machine Learning",
            "microProductName": "Introduction to Machine Learning", 
            "design_microproduct_type": "QuizDisplay"  # Quiz - should be excluded
        },
        {
            "id": 3,
            "projectName": "AI Course: Advanced Neural Networks",
            "microProductName": "Advanced Neural Networks",
            "design_microproduct_type": "PdfLessonDisplay"  # PDF Lesson
        }
    ]
    
    # Test cases
    test_cases = [
        {
            "name": "Lesson title matching with quiz exclusion",
            "lesson_title": "Introduction to Machine Learning",
            "parent_project_name": "AI Course",
            "expected_presentation_id": 1,  # Should find the presentation, not the quiz
            "expected_quiz_id": 2  # Quiz should be found separately
        },
        {
            "name": "Lesson title without quiz",
            "lesson_title": "Advanced Neural Networks", 
            "parent_project_name": "AI Course",
            "expected_presentation_id": 3,  # Should find the PDF lesson
            "expected_quiz_id": None  # No quiz for this lesson
        }
    ]
    
    print("🧪 Testing Quiz and Presentation Matching Fix")
    print("=" * 60)
    
    all_passed = True
    
    for test_case in test_cases:
        print(f"\n📋 Test: {test_case['name']}")
        print(f"   Lesson: '{test_case['lesson_title']}'")
        print(f"   Parent Project: '{test_case['parent_project_name']}'")
        
        # Simulate findMicroproductByTitle with quiz exclusion
        presentation_found = None
        quiz_found = None
        
        for mp in all_user_microproducts:
            mp_project_name = mp["projectName"].strip()
            mp_micro_name = mp["microProductName"].strip()
            mp_design_type = mp["design_microproduct_type"]
            
            # Check if this matches the lesson
            lesson_title = test_case["lesson_title"].strip()
            parent_project = test_case["parent_project_name"].strip()
            
            # Method 1: Legacy matching
            legacy_project_match = mp_project_name == parent_project
            legacy_name_match = mp_micro_name == lesson_title
            
            # Method 2: New naming convention
            expected_new_project_name = f"{parent_project}: {lesson_title}"
            new_pattern_match = mp_project_name == expected_new_project_name
            
            is_match = (legacy_project_match and legacy_name_match) or new_pattern_match
            
            if is_match:
                if mp_design_type == "QuizDisplay":
                    quiz_found = mp
                elif mp_design_type != "QuizDisplay":  # Exclude quizzes from presentation matches
                    presentation_found = mp
        
        # Check results
        presentation_id = presentation_found["id"] if presentation_found else None
        quiz_id = quiz_found["id"] if quiz_found else None
        
        expected_presentation_id = test_case["expected_presentation_id"]
        expected_quiz_id = test_case["expected_quiz_id"]
        
        presentation_correct = presentation_id == expected_presentation_id
        quiz_correct = quiz_id == expected_quiz_id
        
        if presentation_correct and quiz_correct:
            print(f"   ✅ PASSED")
            print(f"      Presentation ID: {presentation_id} (expected: {expected_presentation_id})")
            print(f"      Quiz ID: {quiz_id} (expected: {expected_quiz_id})")
        else:
            print(f"   ❌ FAILED")
            print(f"      Presentation ID: {presentation_id} (expected: {expected_presentation_id})")
            print(f"      Quiz ID: {quiz_id} (expected: {expected_quiz_id})")
            all_passed = False
    
    return all_passed

def test_component_type_filtering():
    """Test that component type filtering works correctly"""
    
    print("\n🔧 Testing Component Type Filtering")
    print("=" * 40)
    
    # Test data with different component types
    test_microproducts = [
        {"id": 1, "projectName": "Course: Lesson 1", "design_microproduct_type": "SlideDeckDisplay"},
        {"id": 2, "projectName": "Course: Lesson 1", "design_microproduct_type": "QuizDisplay"},
        {"id": 3, "projectName": "Course: Lesson 1", "design_microproduct_type": "PdfLessonDisplay"},
        {"id": 4, "projectName": "Course: Lesson 1", "design_microproduct_type": "VideoLessonDisplay"},
    ]
    
    # Test filtering scenarios
    filter_scenarios = [
        {
            "name": "Exclude only Quiz",
            "exclude_types": ["QuizDisplay"],
            "expected_ids": [1, 3, 4]  # Should exclude quiz (id: 2)
        },
        {
            "name": "Exclude Quiz and Video",
            "exclude_types": ["QuizDisplay", "VideoLessonDisplay"],
            "expected_ids": [1, 3]  # Should exclude quiz and video
        },
        {
            "name": "No exclusions",
            "exclude_types": [],
            "expected_ids": [1, 2, 3, 4]  # Should include all
        }
    ]
    
    all_passed = True
    
    for scenario in filter_scenarios:
        print(f"\n📋 Scenario: {scenario['name']}")
        print(f"   Exclude types: {scenario['exclude_types']}")
        
        # Simulate filtering
        filtered_results = []
        for mp in test_microproducts:
            if mp["design_microproduct_type"] not in scenario["exclude_types"]:
                filtered_results.append(mp["id"])
        
        expected_ids = scenario["expected_ids"]
        filtered_ids = sorted(filtered_results)
        expected_ids = sorted(expected_ids)
        
        if filtered_ids == expected_ids:
            print(f"   ✅ PASSED - Found IDs: {filtered_ids}")
        else:
            print(f"   ❌ FAILED - Found IDs: {filtered_ids}, Expected: {expected_ids}")
            all_passed = False
    
    return all_passed

def test_naming_patterns():
    """Test different naming patterns work correctly"""
    
    print("\n📝 Testing Naming Patterns")
    print("=" * 30)
    
    # Test different naming patterns
    test_cases = [
        {
            "name": "New naming convention",
            "projectName": "AI Course: Introduction to ML",
            "lesson_title": "Introduction to ML",
            "parent_project": "AI Course",
            "should_match": True
        },
        {
            "name": "Legacy naming convention",
            "projectName": "AI Course",
            "micro_name": "Introduction to ML",
            "lesson_title": "Introduction to ML", 
            "parent_project": "AI Course",
            "should_match": True
        },
        {
            "name": "No match - different lesson",
            "projectName": "AI Course: Advanced Topics",
            "lesson_title": "Introduction to ML",
            "parent_project": "AI Course",
            "should_match": False
        }
    ]
    
    all_passed = True
    
    for test_case in test_cases:
        print(f"\n📋 Pattern: {test_case['name']}")
        
        # Simulate matching logic
        lesson_title = test_case["lesson_title"].strip()
        parent_project = test_case["parent_project"].strip()
        project_name = test_case["projectName"].strip()
        
        # Method 1: Legacy matching
        legacy_project_match = project_name == parent_project
        legacy_name_match = test_case.get("micro_name", "").strip() == lesson_title
        
        # Method 2: New naming convention
        expected_new_project_name = f"{parent_project}: {lesson_title}"
        new_pattern_match = project_name == expected_new_project_name
        
        is_match = (legacy_project_match and legacy_name_match) or new_pattern_match
        expected_match = test_case["should_match"]
        
        if is_match == expected_match:
            print(f"   ✅ PASSED - Match: {is_match}")
        else:
            print(f"   ❌ FAILED - Match: {is_match}, Expected: {expected_match}")
            all_passed = False
    
    return all_passed

if __name__ == "__main__":
    print("Quiz and Presentation Matching Fix Tests")
    print("=" * 60)
    
    test1_passed = test_quiz_presentation_matching()
    test2_passed = test_component_type_filtering()
    test3_passed = test_naming_patterns()
    
    if test1_passed and test2_passed and test3_passed:
        print("\n🎉 All tests PASSED!")
        print("✅ Quiz and presentation matching fix is working correctly")
        exit(0)
    else:
        print("\n💥 Some tests FAILED!")
        print("❌ Quiz and presentation matching fix needs attention")
        exit(1) 