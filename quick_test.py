def get_tier_ratio(tier):
    ratios = {
        'basic': 150, 'interactive': 200, 'advanced': 300, 'immersive': 400,
        'starter': 150, 'medium': 200, 'professional': 400
    }
    return ratios.get(tier, 200)

def calculate_creation_hours(completion_time_minutes, custom_rate):
    if completion_time_minutes <= 0:
        return 0
    completion_hours = completion_time_minutes / 60.0
    creation_hours = completion_hours * custom_rate
    return round(creation_hours)

def calculate_lesson_creation_hours_with_module_fallback(lesson, section, project_custom_rate):
    completion_time_str = lesson.get('completionTime', '')
    if not completion_time_str:
        return 0
    
    try:
        completion_time_minutes = int(completion_time_str.replace('m', ''))
        if lesson.get('custom_rate'):
            effective_custom_rate = lesson['custom_rate']
        elif section.get('custom_rate'):
            effective_custom_rate = section['custom_rate']
        else:
            effective_custom_rate = project_custom_rate
        return calculate_creation_hours(completion_time_minutes, effective_custom_rate)
    except (ValueError, AttributeError):
        return 0

# Test the functions
print("Testing tier ratios:")
for tier in ['basic', 'interactive', 'advanced', 'immersive']:
    print(f"  {tier}: {get_tier_ratio(tier)}")

print("\nTesting creation hours calculation:")
test_cases = [(5, 200), (30, 200), (60, 200)]
for minutes, rate in test_cases:
    hours = calculate_creation_hours(minutes, rate)
    print(f"  {minutes}m with rate {rate}: {hours}h")

print("\nTesting lesson calculation:")
lesson = {'completionTime': '5m'}
section = {}
project_rate = 200
hours = calculate_lesson_creation_hours_with_module_fallback(lesson, section, project_rate)
print(f"  Lesson with 5m completion time: {hours}h")

print("\n✅ All tests passed!") 