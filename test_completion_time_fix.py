#!/usr/bin/env python3
"""
Test script to verify completion time parsing fix for language-specific time units
"""

def parse_completion_time_to_minutes(completion_time_str: str) -> int:
    """
    Parse completion time string to minutes, handling all language-specific time units.
    
    Args:
        completion_time_str: String like "5m", "6м", "7хв", "8m", etc.
    
    Returns:
        Minutes as integer, defaults to 5 if parsing fails
    """
    if not completion_time_str:
        return 5
    
    time_str = str(completion_time_str).strip()
    if not time_str:
        return 5
    
    # Remove all language-specific minute units
    # English: m, Russian: м, Ukrainian: хв, Spanish: m
    cleaned_str = time_str.replace('m', '').replace('м', '').replace('хв', '')
    
    try:
        minutes = int(cleaned_str)
        return minutes if minutes > 0 else 5
    except (ValueError, TypeError):
        return 5

def test_completion_time_parsing():
    """Test the completion time parsing function with various inputs"""
    
    test_cases = [
        # English format
        ("5m", 5),
        ("6m", 6),
        ("7m", 7),
        ("8m", 8),
        ("10m", 10),
        
        # Russian format
        ("5м", 5),
        ("6м", 6),
        ("7м", 7),
        ("8м", 8),
        ("10м", 10),
        
        # Ukrainian format
        ("5хв", 5),
        ("6хв", 6),
        ("7хв", 7),
        ("8хв", 8),
        ("10хв", 10),
        
        # Edge cases
        ("", 5),
        ("0", 5),
        ("0m", 5),
        ("0м", 5),
        ("0хв", 5),
        ("invalid", 5),
        ("5", 5),
        ("10", 10),
        ("15m", 15),
        ("15м", 15),
        ("15хв", 15),
        
        # Mixed cases (should not happen in practice but good to test)
        ("5mм", 5),
        ("6мхв", 6),
    ]
    
    print("Testing completion time parsing...")
    print("=" * 50)
    
    all_passed = True
    for input_str, expected in test_cases:
        result = parse_completion_time_to_minutes(input_str)
        status = "✅ PASS" if result == expected else "❌ FAIL"
        print(f"{status}: '{input_str}' -> {result} (expected: {expected})")
        if result != expected:
            all_passed = False
    
    print("=" * 50)
    if all_passed:
        print("🎉 All tests passed!")
    else:
        print("💥 Some tests failed!")
    
    return all_passed

def test_sql_equivalent():
    """Test the SQL equivalent logic"""
    
    # This simulates the SQL logic we want to implement
    def sql_parse_completion_time(completion_time_str: str) -> int:
        import re
        if not completion_time_str:
            return 5
        
        # SQL equivalent: WHEN lesson->>'completionTime' ~ '^[0-9]+[mмхв]$' THEN
        if re.match(r'^[0-9]+[mмхв]$', completion_time_str):
            # SQL equivalent: REGEXP_REPLACE(lesson->>'completionTime', '[^0-9]', '', 'g')
            cleaned = re.sub(r'[^0-9]', '', completion_time_str)
            try:
                minutes = int(cleaned)
                return minutes if minutes > 0 else 5
            except (ValueError, TypeError):
                return 5
        else:
            return 5
    
    test_cases = [
        ("5m", 5),
        ("6м", 6),
        ("7хв", 7),
        ("8m", 8),
        ("", 5),
        ("invalid", 5),
        ("5", 5),  # This would fail the regex but should still work
    ]
    
    print("\nTesting SQL equivalent logic...")
    print("=" * 50)
    
    all_passed = True
    for input_str, expected in test_cases:
        result = sql_parse_completion_time(input_str)
        status = "✅ PASS" if result == expected else "❌ FAIL"
        print(f"{status}: '{input_str}' -> {result} (expected: {expected})")
        if result != expected:
            all_passed = False
    
    print("=" * 50)
    if all_passed:
        print("🎉 All SQL tests passed!")
    else:
        print("💥 Some SQL tests failed!")
    
    return all_passed

if __name__ == "__main__":
    print("Completion Time Parsing Fix Test")
    print("=" * 50)
    
    # Test the Python function
    python_passed = test_completion_time_parsing()
    
    # Test the SQL equivalent
    sql_passed = test_sql_equivalent()
    
    print("\n" + "=" * 50)
    if python_passed and sql_passed:
        print("🎉 All tests passed! The fix is ready.")
    else:
        print("💥 Some tests failed! Please review the implementation.") 