#!/usr/bin/env python3
"""
Test script to verify the improved matching logic for quizzes and one-pagers
"""

def test_quiz_matching_strategies():
    """Test the improved quiz matching logic with multiple strategies"""
    print("=== Testing Improved Quiz Matching Logic ===\n")
    
    # Mock data structure similar to what the frontend receives
    all_user_microproducts = [
        # Strategy 1: Exact project name match
        {
            "id": 1,
            "projectName": "Course: Lesson 1",
            "microProductName": "Lesson 1",
            "design_microproduct_type": "QuizDisplay",
            "microproduct_content": {"quizTitle": "Quiz for Lesson 1"}
        },
        # Strategy 2: Project name contains lesson title
        {
            "id": 2,
            "projectName": "Advanced Course with Lesson 2 Quiz",
            "microProductName": "Advanced Quiz",
            "design_microproduct_type": "QuizDisplay",
            "microproduct_content": {"quizTitle": "Advanced Quiz"}
        },
        # Strategy 3: Microproduct name matches lesson title
        {
            "id": 3,
            "projectName": "Course Quiz Collection",
            "microProductName": "Lesson 3",
            "design_microproduct_type": "QuizDisplay",
            "microproduct_content": {"quizTitle": "Lesson 3 Quiz"}
        },
        # Strategy 4: Legacy pattern
        {
            "id": 4,
            "projectName": "Quiz - Course: Lesson 4",
            "microProductName": "Legacy Quiz",
            "design_microproduct_type": "QuizDisplay",
            "microproduct_content": {"quizTitle": "Legacy Quiz"}
        },
        # Strategy 5: Content-based matching
        {
            "id": 5,
            "projectName": "General Quiz",
            "microProductName": "General Quiz",
            "design_microproduct_type": "QuizDisplay",
            "microproduct_content": {
                "quizTitle": "General Quiz",
                "description": "This quiz covers Lesson 5 concepts"
            }
        },
        # Non-quiz item (should be ignored)
        {
            "id": 6,
            "projectName": "Course: Lesson 1",
            "microProductName": "Lesson 1",
            "design_microproduct_type": "TextPresentationDisplay",
            "microproduct_content": {"title": "Lesson 1 Content"}
        }
    ]
    
    parent_project_name = "Course"
    
    def find_existing_quiz(lesson_title):
        """Mock implementation of the improved quiz matching logic"""
        print(f"🔍 [QUIZ_DISCOVERY] Starting quiz discovery for lesson: '{lesson_title}'")
        print(f"🔍 [QUIZ_DISCOVERY] Parent project name: '{parent_project_name}'")
        print(f"🔍 [QUIZ_DISCOVERY] All user microproducts count: {len(all_user_microproducts)}")
        
        trimmed_title_to_match = lesson_title.strip()
        trimmed_parent_project_name = parent_project_name.strip()
        
        # Find all quizzes first
        all_quizzes = [mp for mp in all_user_microproducts if mp["design_microproduct_type"] == "QuizDisplay"]
        
        print(f"🔍 [QUIZ_DISCOVERY] Found {len(all_quizzes)} quizzes in allUserMicroproducts:")
        for i, quiz in enumerate(all_quizzes):
            print(f"  Quiz {i + 1}:", {
                "id": quiz["id"],
                "projectName": quiz["projectName"],
                "microProductName": quiz["microProductName"],
                "designMicroproductType": quiz["design_microproduct_type"]
            })
        
        # Strategy 1: Exact project name match (most reliable)
        for quiz in all_quizzes:
            mp_project_name = quiz["projectName"].strip()
            expected_project_name = f"{trimmed_parent_project_name}: {trimmed_title_to_match}"
            is_match = mp_project_name == expected_project_name
            print(f"🔍 [QUIZ_DISCOVERY] Strategy 1 (Exact): '{mp_project_name}' === '{expected_project_name}' = {is_match}")
            if is_match:
                print(f"✅ [QUIZ_DISCOVERY] Found quiz using Strategy 1 (Exact): {quiz['projectName']}")
                return quiz
        
        # Strategy 2: Project name contains lesson title
        for quiz in all_quizzes:
            mp_project_name = quiz["projectName"].strip()
            is_match = mp_project_name and trimmed_title_to_match in mp_project_name
            print(f"🔍 [QUIZ_DISCOVERY] Strategy 2 (Contains): '{mp_project_name}' contains '{trimmed_title_to_match}' = {is_match}")
            if is_match:
                print(f"✅ [QUIZ_DISCOVERY] Found quiz using Strategy 2 (Contains): {quiz['projectName']}")
                return quiz
        
        # Strategy 3: Microproduct name matches lesson title
        for quiz in all_quizzes:
            mp_micro_name = quiz.get("microProductName", "").strip()
            is_match = mp_micro_name == trimmed_title_to_match
            print(f"🔍 [QUIZ_DISCOVERY] Strategy 3 (MicroName): '{mp_micro_name}' === '{trimmed_title_to_match}' = {is_match}")
            if is_match:
                print(f"✅ [QUIZ_DISCOVERY] Found quiz using Strategy 3 (MicroName): {quiz['projectName']}")
                return quiz
        
        # Strategy 4: Legacy patterns for backward compatibility
        legacy_patterns = [
            f"Quiz - {trimmed_parent_project_name}: {trimmed_title_to_match}",
            f"{trimmed_parent_project_name}: Quiz - {trimmed_title_to_match}",
            f"Quiz - {trimmed_title_to_match}",
            trimmed_title_to_match
        ]
        
        for pattern in legacy_patterns:
            for quiz in all_quizzes:
                mp_project_name = quiz["projectName"].strip()
                is_match = mp_project_name == pattern
                print(f"🔍 [QUIZ_DISCOVERY] Strategy 4 (Legacy): '{mp_project_name}' === '{pattern}' = {is_match}")
                if is_match:
                    print(f"✅ [QUIZ_DISCOVERY] Found quiz using Strategy 4 (Legacy): {quiz['projectName']}")
                    return quiz
        
        # Strategy 5: Content-based matching
        for quiz in all_quizzes:
            content = quiz.get("microproduct_content", {})
            if not content:
                continue
            
            content_str = str(content).lower()
            lesson_title_lower = trimmed_title_to_match.lower()
            is_match = lesson_title_lower in content_str
            print(f"🔍 [QUIZ_DISCOVERY] Strategy 5 (Content): content contains '{lesson_title_lower}' = {is_match}")
            if is_match:
                print(f"✅ [QUIZ_DISCOVERY] Found quiz using Strategy 5 (Content): {quiz['projectName']}")
                return quiz
        
        print(f"❌ [QUIZ_DISCOVERY] No quiz found for lesson: '{trimmed_title_to_match}'")
        return None
    
    # Test cases
    test_cases = [
        ("Lesson 1", "Should find quiz using Strategy 1 (Exact)"),
        ("Lesson 2", "Should find quiz using Strategy 2 (Contains)"),
        ("Lesson 3", "Should find quiz using Strategy 3 (MicroName)"),
        ("Lesson 4", "Should find quiz using Strategy 4 (Legacy)"),
        ("Lesson 5", "Should find quiz using Strategy 5 (Content)"),
        ("Lesson 6", "Should not find any quiz"),
    ]
    
    for lesson_title, expected_result in test_cases:
        print(f"\n--- Testing: {lesson_title} ---")
        print(f"Expected: {expected_result}")
        result = find_existing_quiz(lesson_title)
        if result:
            print(f"✅ Found: {result['projectName']} (ID: {result['id']})")
        else:
            print("❌ Not found")
        print("-" * 50)

def test_one_pager_matching_strategies():
    """Test the improved one-pager matching logic with multiple strategies"""
    print("\n=== Testing Improved One-Pager Matching Logic ===\n")
    
    # Mock data structure similar to what the frontend receives
    all_user_microproducts = [
        # Strategy 1: Exact project name match
        {
            "id": 101,
            "projectName": "Course: Lesson 1",
            "microProductName": "Lesson 1",
            "design_microproduct_type": "TextPresentationDisplay",
            "microproduct_content": {"title": "Lesson 1 One-Pager"}
        },
        # Strategy 2: Project name contains lesson title
        {
            "id": 102,
            "projectName": "Advanced Course with Lesson 2 One-Pager",
            "microProductName": "Advanced One-Pager",
            "design_microproduct_type": "TextPresentationDisplay",
            "microproduct_content": {"title": "Advanced One-Pager"}
        },
        # Strategy 3: Microproduct name matches lesson title
        {
            "id": 103,
            "projectName": "Course One-Pager Collection",
            "microProductName": "Lesson 3",
            "design_microproduct_type": "TextPresentationDisplay",
            "microproduct_content": {"title": "Lesson 3 One-Pager"}
        },
        # Strategy 4: Legacy pattern
        {
            "id": 104,
            "projectName": "Text Presentation - Course: Lesson 4",
            "microProductName": "Legacy One-Pager",
            "design_microproduct_type": "TextPresentationDisplay",
            "microproduct_content": {"title": "Legacy One-Pager"}
        },
        # Strategy 5: Content-based matching
        {
            "id": 105,
            "projectName": "General One-Pager",
            "microProductName": "General One-Pager",
            "design_microproduct_type": "TextPresentationDisplay",
            "microproduct_content": {
                "title": "General One-Pager",
                "description": "This one-pager covers Lesson 5 concepts"
            }
        },
        # Non-one-pager item (should be ignored)
        {
            "id": 106,
            "projectName": "Course: Lesson 1",
            "microProductName": "Lesson 1",
            "design_microproduct_type": "QuizDisplay",
            "microproduct_content": {"quizTitle": "Lesson 1 Quiz"}
        }
    ]
    
    parent_project_name = "Course"
    
    def find_existing_one_pager(lesson_title):
        """Mock implementation of the improved one-pager matching logic"""
        print(f"🔍 [ONE_PAGER_DISCOVERY] Starting one-pager discovery for lesson: '{lesson_title}'")
        print(f"🔍 [ONE_PAGER_DISCOVERY] Parent project name: '{parent_project_name}'")
        print(f"🔍 [ONE_PAGER_DISCOVERY] All user microproducts count: {len(all_user_microproducts)}")
        
        trimmed_title_to_match = lesson_title.strip()
        trimmed_parent_project_name = parent_project_name.strip()
        
        # Find all one-pagers first
        all_one_pagers = [mp for mp in all_user_microproducts if mp["design_microproduct_type"] == "TextPresentationDisplay"]
        
        print(f"🔍 [ONE_PAGER_DISCOVERY] Found {len(all_one_pagers)} one-pagers in allUserMicroproducts:")
        for i, one_pager in enumerate(all_one_pagers):
            print(f"  One-Pager {i + 1}:", {
                "id": one_pager["id"],
                "projectName": one_pager["projectName"],
                "microProductName": one_pager["microProductName"],
                "designMicroproductType": one_pager["design_microproduct_type"]
            })
        
        # Strategy 1: Exact project name match (most reliable)
        for one_pager in all_one_pagers:
            mp_project_name = one_pager["projectName"].strip()
            expected_project_name = f"{trimmed_parent_project_name}: {trimmed_title_to_match}"
            is_match = mp_project_name == expected_project_name
            print(f"🔍 [ONE_PAGER_DISCOVERY] Strategy 1 (Exact): '{mp_project_name}' === '{expected_project_name}' = {is_match}")
            if is_match:
                print(f"✅ [ONE_PAGER_DISCOVERY] Found one-pager using Strategy 1 (Exact): {one_pager['projectName']}")
                return one_pager
        
        # Strategy 2: Project name contains lesson title
        for one_pager in all_one_pagers:
            mp_project_name = one_pager["projectName"].strip()
            is_match = mp_project_name and trimmed_title_to_match in mp_project_name
            print(f"🔍 [ONE_PAGER_DISCOVERY] Strategy 2 (Contains): '{mp_project_name}' contains '{trimmed_title_to_match}' = {is_match}")
            if is_match:
                print(f"✅ [ONE_PAGER_DISCOVERY] Found one-pager using Strategy 2 (Contains): {one_pager['projectName']}")
                return one_pager
        
        # Strategy 3: Microproduct name matches lesson title
        for one_pager in all_one_pagers:
            mp_micro_name = one_pager.get("microProductName", "").strip()
            is_match = mp_micro_name == trimmed_title_to_match
            print(f"🔍 [ONE_PAGER_DISCOVERY] Strategy 3 (MicroName): '{mp_micro_name}' === '{trimmed_title_to_match}' = {is_match}")
            if is_match:
                print(f"✅ [ONE_PAGER_DISCOVERY] Found one-pager using Strategy 3 (MicroName): {one_pager['projectName']}")
                return one_pager
        
        # Strategy 4: Legacy patterns for backward compatibility
        legacy_patterns = [
            f"Text Presentation - {trimmed_parent_project_name}: {trimmed_title_to_match}",
            f"One-Pager - {trimmed_parent_project_name}: {trimmed_title_to_match}",
            f"{trimmed_parent_project_name}: Text Presentation - {trimmed_title_to_match}",
            f"{trimmed_parent_project_name}: One-Pager - {trimmed_title_to_match}",
            f"Text Presentation - {trimmed_title_to_match}",
            f"One-Pager - {trimmed_title_to_match}",
            trimmed_title_to_match
        ]
        
        for pattern in legacy_patterns:
            for one_pager in all_one_pagers:
                mp_project_name = one_pager["projectName"].strip()
                is_match = mp_project_name == pattern
                print(f"🔍 [ONE_PAGER_DISCOVERY] Strategy 4 (Legacy): '{mp_project_name}' === '{pattern}' = {is_match}")
                if is_match:
                    print(f"✅ [ONE_PAGER_DISCOVERY] Found one-pager using Strategy 4 (Legacy): {one_pager['projectName']}")
                    return one_pager
        
        # Strategy 5: Content-based matching
        for one_pager in all_one_pagers:
            content = one_pager.get("microproduct_content", {})
            if not content:
                continue
            
            content_str = str(content).lower()
            lesson_title_lower = trimmed_title_to_match.lower()
            is_match = lesson_title_lower in content_str
            print(f"🔍 [ONE_PAGER_DISCOVERY] Strategy 5 (Content): content contains '{lesson_title_lower}' = {is_match}")
            if is_match:
                print(f"✅ [ONE_PAGER_DISCOVERY] Found one-pager using Strategy 5 (Content): {one_pager['projectName']}")
                return one_pager
        
        print(f"❌ [ONE_PAGER_DISCOVERY] No one-pager found for lesson: '{trimmed_title_to_match}'")
        return None
    
    # Test cases
    test_cases = [
        ("Lesson 1", "Should find one-pager using Strategy 1 (Exact)"),
        ("Lesson 2", "Should find one-pager using Strategy 2 (Contains)"),
        ("Lesson 3", "Should find one-pager using Strategy 3 (MicroName)"),
        ("Lesson 4", "Should find one-pager using Strategy 4 (Legacy)"),
        ("Lesson 5", "Should find one-pager using Strategy 5 (Content)"),
        ("Lesson 6", "Should not find any one-pager"),
    ]
    
    for lesson_title, expected_result in test_cases:
        print(f"\n--- Testing: {lesson_title} ---")
        print(f"Expected: {expected_result}")
        result = find_existing_one_pager(lesson_title)
        if result:
            print(f"✅ Found: {result['projectName']} (ID: {result['id']})")
        else:
            print("❌ Not found")
        print("-" * 50)

if __name__ == "__main__":
    test_quiz_matching_strategies()
    test_one_pager_matching_strategies()
    print("\n🎉 All tests completed!") 