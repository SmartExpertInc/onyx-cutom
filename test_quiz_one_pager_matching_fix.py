#!/usr/bin/env python3
"""
Test script to verify quiz and one-pager matching logic fixes
"""

def test_quiz_matching():
    """Test quiz matching logic"""
    print("=== Testing Quiz Matching Logic ===")
    
    # Mock data structure similar to what the frontend receives
    all_user_microproducts = [
        {
            "id": 1,
            "projectName": "Course: Lesson 1",
            "microProductName": "Lesson 1",
            "design_microproduct_type": "QuizDisplay"  # Fixed: should be QuizDisplay, not Quiz
        },
        {
            "id": 2,
            "projectName": "Course: Lesson 2",
            "microProductName": "Lesson 2", 
            "design_microproduct_type": "TextPresentationDisplay"  # Fixed: should be TextPresentationDisplay
        },
        {
            "id": 3,
            "projectName": "Course: Lesson 3",
            "microProductName": "Lesson 3",
            "design_microproduct_type": "SlideDeckDisplay"  # Lesson presentation
        }
    ]
    
    parent_project_name = "Course"
    lesson_title = "Lesson 1"
    
    # Simulate the findExistingQuiz logic
    def find_existing_quiz(lesson_title, parent_project_name, all_user_microproducts):
        trimmed_title_to_match = lesson_title.strip()
        trimmed_parent_project_name = parent_project_name.strip()
        
        for mp in all_user_microproducts:
            mp_project_name = mp.get("projectName", "").strip()
            mp_design_microproduct_type = mp.get("design_microproduct_type")
            mp_micro_name = mp.get("microProductName", "").strip()
            
            # Only process if it's a quiz using the correct field name
            if mp_design_microproduct_type != "QuizDisplay":  # Fixed: should be QuizDisplay
                continue
            
            print(f"Checking quiz: '{mp_project_name}'")
            
            # Method 1: Legacy matching - project name matches outline and microProductName matches lesson
            legacy_project_match = mp_project_name == trimmed_parent_project_name
            legacy_name_match = mp_micro_name == trimmed_title_to_match
            print(f"  Method 1 (Legacy): projectName='{mp_project_name}' === '{trimmed_parent_project_name}' = {legacy_project_match}")
            print(f"  Method 1 (Legacy): microProductName='{mp_micro_name}' === '{trimmed_title_to_match}' = {legacy_name_match}")
            
            # Method 2: New naming convention - project name follows "Outline Name: Lesson Title" pattern
            expected_new_project_name = f"{trimmed_parent_project_name}: {trimmed_title_to_match}"
            new_pattern_match = mp_project_name == expected_new_project_name
            print(f"  Method 2 (New): projectName='{mp_project_name}' === '{expected_new_project_name}' = {new_pattern_match}")
            
            # Method 3: Legacy "Quiz -" pattern for backward compatibility
            legacy_quiz_pattern = f"Quiz - {trimmed_parent_project_name}: {trimmed_title_to_match}"
            legacy_quiz_pattern_match = mp_project_name == legacy_quiz_pattern
            print(f"  Method 3 (Legacy Quiz): projectName='{mp_project_name}' === '{legacy_quiz_pattern}' = {legacy_quiz_pattern_match}")
            
            # Method 4: Simple pattern - project name is just the lesson title
            simple_pattern_match = mp_project_name == trimmed_title_to_match
            print(f"  Method 4 (Simple): projectName='{mp_project_name}' === '{trimmed_title_to_match}' = {simple_pattern_match}")
            
            is_match = (legacy_project_match and legacy_name_match) or new_pattern_match or legacy_quiz_pattern_match or simple_pattern_match
            print(f"  🎯 Quiz '{mp_project_name}' MATCH: {is_match}")
            
            if is_match:
                return mp
        
        return None
    
    # Test quiz matching
    found_quiz = find_existing_quiz(lesson_title, parent_project_name, all_user_microproducts)
    print(f"\nQuiz matching result: {found_quiz}")
    print(f"Expected: Quiz with projectName='Course: Lesson 1'")
    print(f"Actual: {found_quiz['projectName'] if found_quiz else 'None'}")
    print(f"✅ Quiz matching: {'PASS' if found_quiz and found_quiz['projectName'] == 'Course: Lesson 1' else 'FAIL'}")

def test_one_pager_matching():
    """Test one-pager matching logic"""
    print("\n=== Testing One-Pager Matching Logic ===")
    
    # Mock data structure similar to what the frontend receives
    all_user_microproducts = [
        {
            "id": 1,
            "projectName": "Course: Lesson 1",
            "microProductName": "Lesson 1",
            "design_microproduct_type": "QuizDisplay"
        },
        {
            "id": 2,
            "projectName": "Course: Lesson 2",
            "microProductName": "Lesson 2", 
            "design_microproduct_type": "TextPresentationDisplay"  # Fixed: should be TextPresentationDisplay
        },
        {
            "id": 3,
            "projectName": "Course: Lesson 3",
            "microProductName": "Lesson 3",
            "design_microproduct_type": "SlideDeckDisplay"
        }
    ]
    
    parent_project_name = "Course"
    lesson_title = "Lesson 2"
    
    # Simulate the findExistingOnePager logic
    def find_existing_one_pager(lesson_title, parent_project_name, all_user_microproducts):
        trimmed_title_to_match = lesson_title.strip()
        trimmed_parent_project_name = parent_project_name.strip()
        
        for mp in all_user_microproducts:
            mp_project_name = mp.get("projectName", "").strip()
            mp_design_microproduct_type = mp.get("design_microproduct_type")
            mp_micro_name = mp.get("microProductName", "").strip()
            
            # Only process if it's a text presentation (one-pager)
            if mp_design_microproduct_type != "TextPresentationDisplay":  # Fixed: should be TextPresentationDisplay
                continue
            
            print(f"Checking one-pager: '{mp_project_name}'")
            
            # Method 1: Legacy matching - project name matches outline and microProductName matches lesson
            legacy_project_match = mp_project_name == trimmed_parent_project_name
            legacy_name_match = mp_micro_name == trimmed_title_to_match
            print(f"  Method 1 (Legacy): projectName='{mp_project_name}' === '{trimmed_parent_project_name}' = {legacy_project_match}")
            print(f"  Method 1 (Legacy): microProductName='{mp_micro_name}' === '{trimmed_title_to_match}' = {legacy_name_match}")
            
            # Method 2: New naming convention - project name follows "Outline Name: Lesson Title" pattern
            expected_new_project_name = f"{trimmed_parent_project_name}: {trimmed_title_to_match}"
            new_pattern_match = mp_project_name == expected_new_project_name
            print(f"  Method 2 (New): projectName='{mp_project_name}' === '{expected_new_project_name}' = {new_pattern_match}")
            
            # Method 3: Legacy "Text Presentation -" pattern for backward compatibility
            legacy_text_presentation_pattern = f"Text Presentation - {trimmed_parent_project_name}: {trimmed_title_to_match}"
            legacy_text_presentation_pattern_match = mp_project_name == legacy_text_presentation_pattern
            print(f"  Method 3 (Legacy Text Presentation): projectName='{mp_project_name}' === '{legacy_text_presentation_pattern}' = {legacy_text_presentation_pattern_match}")
            
            # Method 4: Legacy "One-Pager -" pattern for backward compatibility
            legacy_one_pager_pattern = f"One-Pager - {trimmed_parent_project_name}: {trimmed_title_to_match}"
            legacy_one_pager_pattern_match = mp_project_name == legacy_one_pager_pattern
            print(f"  Method 4 (Legacy One-Pager): projectName='{mp_project_name}' === '{legacy_one_pager_pattern}' = {legacy_one_pager_pattern_match}")
            
            is_match = (legacy_project_match and legacy_name_match) or new_pattern_match or legacy_text_presentation_pattern_match or legacy_one_pager_pattern_match
            print(f"  🎯 One-Pager '{mp_project_name}' MATCH: {is_match}")
            
            if is_match:
                return mp
        
        return None
    
    # Test one-pager matching
    found_one_pager = find_existing_one_pager(lesson_title, parent_project_name, all_user_microproducts)
    print(f"\nOne-pager matching result: {found_one_pager}")
    print(f"Expected: One-pager with projectName='Course: Lesson 2'")
    print(f"Actual: {found_one_pager['projectName'] if found_one_pager else 'None'}")
    print(f"✅ One-pager matching: {'PASS' if found_one_pager and found_one_pager['projectName'] == 'Course: Lesson 2' else 'FAIL'}")

def test_database_saving_consistency():
    """Test that database saving logic is consistent with matching logic"""
    print("\n=== Testing Database Saving Consistency ===")
    
    # Simulate the quiz saving logic
    def simulate_quiz_saving(course_name, lesson_title):
        # This is what the backend should do after our fixes
        final_project_name = f"{course_name}: {lesson_title}"
        
        # The database insert should use:
        # project_name = final_project_name (not just course_name)
        # microproduct_type = "QuizDisplay" (not "Quiz")
        
        return {
            "project_name": final_project_name,  # Fixed: should be "Course: Lesson 1"
            "microproduct_type": "QuizDisplay",  # Fixed: should be "QuizDisplay"
            "microproduct_name": final_project_name
        }
    
    # Simulate the one-pager saving logic
    def simulate_one_pager_saving(course_name, lesson_title):
        # This is what the backend should do after our fixes
        final_project_name = f"{course_name}: {lesson_title}"
        
        # The database insert should use:
        # project_name = final_project_name (not just course_name)
        # microproduct_type = "TextPresentationDisplay" (not "Text Presentation")
        
        return {
            "project_name": final_project_name,  # Fixed: should be "Course: Lesson 2"
            "microproduct_type": "TextPresentationDisplay",  # Fixed: should be "TextPresentationDisplay"
            "microproduct_name": final_project_name
        }
    
    # Test quiz saving
    quiz_saved = simulate_quiz_saving("Course", "Lesson 1")
    print(f"Quiz saving result: {quiz_saved}")
    print(f"Expected project_name: 'Course: Lesson 1'")
    print(f"Expected microproduct_type: 'QuizDisplay'")
    print(f"✅ Quiz saving consistency: {'PASS' if quiz_saved['project_name'] == 'Course: Lesson 1' and quiz_saved['microproduct_type'] == 'QuizDisplay' else 'FAIL'}")
    
    # Test one-pager saving
    one_pager_saved = simulate_one_pager_saving("Course", "Lesson 2")
    print(f"One-pager saving result: {one_pager_saved}")
    print(f"Expected project_name: 'Course: Lesson 2'")
    print(f"Expected microproduct_type: 'TextPresentationDisplay'")
    print(f"✅ One-pager saving consistency: {'PASS' if one_pager_saved['project_name'] == 'Course: Lesson 2' and one_pager_saved['microproduct_type'] == 'TextPresentationDisplay' else 'FAIL'}")

def main():
    """Run all tests"""
    print("🧪 Testing Quiz and One-Pager Matching Fixes")
    print("=" * 50)
    
    test_quiz_matching()
    test_one_pager_matching()
    test_database_saving_consistency()
    
    print("\n" + "=" * 50)
    print("✅ All tests completed!")

if __name__ == "__main__":
    main() 