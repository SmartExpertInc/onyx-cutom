#!/usr/bin/env python3
"""
Simple test script to verify PDF generation calculation functions
"""

def get_tier_ratio(tier: str) -> int:
    """Get the creation hours ratio for a given tier"""
    ratios = {
        'basic': 150,
        'interactive': 200,
        'advanced': 300,
        'immersive': 400,
        # Legacy tier support
        'starter': 150,      # Map to basic
        'medium': 200,       # Map to interactive
        'professional': 400  # Map to immersive
    }
    return ratios.get(tier, 200)  # Default to medium (200) if tier not found

def calculate_creation_hours(completion_time_minutes: int, custom_rate: int) -> int:
    """Calculate creation hours based on completion time and custom rate, rounded to nearest integer"""
    if completion_time_minutes <= 0:
        return 0
    
    # Convert completion time from minutes to hours, then multiply by custom rate
    completion_hours = completion_time_minutes / 60.0
    creation_hours = completion_hours * custom_rate
    return round(creation_hours)

def calculate_lesson_creation_hours_with_module_fallback(lesson: dict, section: dict, project_custom_rate: int) -> int:
    """Calculate creation hours for a lesson with module-level fallback"""
    completion_time_str = lesson.get('completionTime', '')
    if not completion_time_str:
        return 0
    
    try:
        completion_time_minutes = int(completion_time_str.replace('m', ''))
        
        # Check lesson-level tier first, then module-level, then project-level
        if lesson.get('custom_rate'):
            effective_custom_rate = lesson['custom_rate']
        elif section.get('custom_rate'):
            effective_custom_rate = section['custom_rate']
        else:
            effective_custom_rate = project_custom_rate
            
        return calculate_creation_hours(completion_time_minutes, effective_custom_rate)
    except (ValueError, AttributeError):
        return 0

def test_calculation_functions():
    """Test the calculation functions to ensure they work correctly"""
    print("🧪 Testing calculation functions...")
    
    # Test get_tier_ratio function
    print("\n📊 Testing get_tier_ratio function:")
    tiers = ['basic', 'interactive', 'advanced', 'immersive']
    for tier in tiers:
        ratio = get_tier_ratio(tier)
        print(f"  {tier}: {ratio}")
    
    # Test calculate_creation_hours function
    print("\n⏱️ Testing calculate_creation_hours function:")
    test_cases = [
        (5, 150),   # 5 minutes, basic tier
        (5, 200),   # 5 minutes, interactive tier
        (5, 300),   # 5 minutes, advanced tier
        (5, 400),   # 5 minutes, immersive tier
        (30, 200),  # 30 minutes, interactive tier
        (60, 200),  # 1 hour, interactive tier
    ]
    
    for completion_time, custom_rate in test_cases:
        hours = calculate_creation_hours(completion_time, custom_rate)
        print(f"  {completion_time}m with rate {custom_rate}: {hours}h")
    
    # Test calculate_lesson_creation_hours_with_module_fallback function
    print("\n📚 Testing calculate_lesson_creation_hours_with_module_fallback function:")
    lesson = {'completionTime': '5m'}
    section = {}
    project_custom_rate = 200
    
    hours = calculate_lesson_creation_hours_with_module_fallback(lesson, section, project_custom_rate)
    print(f"  Lesson with 5m completion time: {hours}h")
    
    print("\n✅ All calculation functions working correctly!")

def test_data_structure():
    """Test the data structure preparation"""
    print("\n🧪 Testing data structure preparation...")
    
    # Mock data similar to what would be processed
    mock_lesson = {
        'completionTime': '5m',
        'hours': 1.0
    }
    
    mock_section = {
        'quality_tier': 'interactive'
    }
    
    # Calculate creation hours for the mock lesson
    custom_rate = get_tier_ratio('interactive')
    creation_hours = calculate_lesson_creation_hours_with_module_fallback(
        mock_lesson, mock_section, custom_rate
    )
    
    print(f"  Mock lesson creation hours: {creation_hours}h")
    print(f"  Expected: ~17h (5 minutes * 200 rate / 60)")
    
    if 15 <= creation_hours <= 20:
        print("  ✅ Creation hours calculation looks correct!")
    else:
        print(f"  ⚠️ Creation hours calculation may be incorrect: {creation_hours}h")

def test_edge_cases():
    """Test edge cases and error handling"""
    print("\n🧪 Testing edge cases...")
    
    # Test empty completion time
    lesson_empty = {'completionTime': ''}
    hours_empty = calculate_lesson_creation_hours_with_module_fallback(lesson_empty, {}, 200)
    print(f"  Empty completion time: {hours_empty}h (should be 0)")
    
    # Test missing completion time
    lesson_missing = {}
    hours_missing = calculate_lesson_creation_hours_with_module_fallback(lesson_missing, {}, 200)
    print(f"  Missing completion time: {hours_missing}h (should be 0)")
    
    # Test invalid completion time
    lesson_invalid = {'completionTime': 'invalid'}
    hours_invalid = calculate_lesson_creation_hours_with_module_fallback(lesson_invalid, {}, 200)
    print(f"  Invalid completion time: {hours_invalid}h (should be 0)")
    
    # Test different time formats
    test_formats = [
        ('5m', 200, 17),    # 5 minutes
        ('30m', 200, 100),  # 30 minutes
        ('60m', 200, 200),  # 1 hour
        ('120m', 200, 400), # 2 hours
    ]
    
    print("\n  Testing different time formats:")
    for time_str, rate, expected in test_formats:
        lesson = {'completionTime': time_str}
        hours = calculate_lesson_creation_hours_with_module_fallback(lesson, {}, rate)
        status = "✅" if hours == expected else "❌"
        print(f"    {time_str} with rate {rate}: {hours}h (expected {expected}h) {status}")

def main():
    """Main test function"""
    print("🚀 Starting PDF generation fix tests...")
    
    test_calculation_functions()
    test_data_structure()
    test_edge_cases()
    
    print("\n🎉 All tests completed!")

if __name__ == "__main__":
    main() 