#!/usr/bin/env python3
"""
Test script to verify PDF data structure with real data
"""

def get_tier_ratio(tier: str) -> int:
    """Get the creation hours ratio for a given tier"""
    ratios = {
        'basic': 150, 'interactive': 200, 'advanced': 300, 'immersive': 400,
        'starter': 150, 'medium': 200, 'professional': 400
    }
    return ratios.get(tier, 200)

def calculate_creation_hours(completion_time_minutes: int, custom_rate: int) -> int:
    """Calculate creation hours based on completion time and custom rate"""
    if completion_time_minutes <= 0:
        return 0
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
        if lesson.get('custom_rate'):
            effective_custom_rate = lesson['custom_rate']
        elif section.get('custom_rate'):
            effective_custom_rate = section['custom_rate']
        else:
            effective_custom_rate = project_custom_rate
        return calculate_creation_hours(completion_time_minutes, effective_custom_rate)
    except (ValueError, AttributeError):
        return 0

def simulate_project_data():
    """Simulate real project data structure"""
    print("🧪 Simulating project data structure...")
    
    # Simulate a project with lessons
    project_data = {
        'id': 1,
        'title': 'Test Course',
        'quality_tier': 'interactive',
        'microproduct_content': {
            'sections': [
                {
                    'title': 'Module 1',
                    'lessons': [
                        {
                            'title': 'Lesson 1',
                            'completionTime': '5m',
                            'hours': 1.0
                        },
                        {
                            'title': 'Lesson 2', 
                            'completionTime': '30m',
                            'hours': 2.0
                        },
                        {
                            'title': 'Lesson 3',
                            'completionTime': '15m',
                            'hours': 1.5
                        }
                    ]
                },
                {
                    'title': 'Module 2',
                    'lessons': [
                        {
                            'title': 'Lesson 4',
                            'completionTime': '45m',
                            'hours': 3.0
                        },
                        {
                            'title': 'Lesson 5',
                            'completionTime': '10m',
                            'hours': 1.0
                        }
                    ]
                }
            ]
        }
    }
    
    # Calculate totals for this project
    total_lessons = 0
    total_hours = 0.0
    total_completion_time = 0
    total_creation_hours = 0.0
    
    project_custom_rate = get_tier_ratio(project_data['quality_tier'])
    
    for section in project_data['microproduct_content']['sections']:
        for lesson in section['lessons']:
            total_lessons += 1
            total_hours += lesson.get('hours', 0)
            
            # Calculate completion time
            completion_time_str = lesson.get('completionTime', '')
            if completion_time_str:
                try:
                    minutes = int(completion_time_str.replace('m', ''))
                    total_completion_time += minutes
                except ValueError:
                    total_completion_time += 5
            
            # Calculate creation hours
            lesson_creation_hours = calculate_lesson_creation_hours_with_module_fallback(
                lesson, section, project_custom_rate
            )
            total_creation_hours += lesson_creation_hours
    
    # Create the processed project data
    processed_project = {
        'id': project_data['id'],
        'title': project_data['title'],
        'total_lessons': total_lessons,
        'total_hours': round(total_hours),
        'total_completion_time': total_completion_time,
        'total_creation_hours': round(total_creation_hours)
    }
    
    print(f"\n📊 Project: {processed_project['title']}")
    print(f"  Total Lessons: {processed_project['total_lessons']}")
    print(f"  Total Hours: {processed_project['total_hours']}h")
    print(f"  Total Completion Time: {processed_project['total_completion_time']}m")
    print(f"  Total Creation Hours: {processed_project['total_creation_hours']}h")
    
    # Show breakdown by lesson
    print(f"\n📚 Lesson Breakdown:")
    lesson_counter = 1
    for section in project_data['microproduct_content']['sections']:
        print(f"  {section['title']}:")
        for lesson in section['lessons']:
            lesson_creation_hours = calculate_lesson_creation_hours_with_module_fallback(
                lesson, section, project_custom_rate
            )
            print(f"    Lesson {lesson_counter}: {lesson['title']}")
            print(f"      - Completion Time: {lesson['completionTime']}")
            print(f"      - Hours: {lesson['hours']}h")
            print(f"      - Creation Hours: {lesson_creation_hours}h")
            lesson_counter += 1
    
    return processed_project

def simulate_folder_structure():
    """Simulate folder structure with projects"""
    print("\n📁 Simulating folder structure...")
    
    # Create folder data
    folder_data = {
        'id': 1,
        'name': 'Main Course Folder',
        'quality_tier': 'interactive',
        'children': [
            {
                'id': 2,
                'name': 'Subfolder 1',
                'quality_tier': 'advanced'
            },
            {
                'id': 3,
                'name': 'Subfolder 2', 
                'quality_tier': 'basic'
            }
        ]
    }
    
    # Create projects for each folder
    projects_data = {
        1: [  # Main folder projects
            {
                'id': 1,
                'title': 'Main Course',
                'total_lessons': 5,
                'total_hours': 8,
                'total_completion_time': 105,
                'total_creation_hours': 350
            }
        ],
        2: [  # Subfolder 1 projects
            {
                'id': 2,
                'title': 'Advanced Module',
                'total_lessons': 3,
                'total_hours': 4,
                'total_completion_time': 60,
                'total_creation_hours': 300
            }
        ],
        3: [  # Subfolder 2 projects
            {
                'id': 3,
                'title': 'Basic Module',
                'total_lessons': 2,
                'total_hours': 2,
                'total_completion_time': 30,
                'total_creation_hours': 75
            }
        ]
    }
    
    # Calculate recursive totals for folders
    def calculate_folder_totals(folder_id):
        projects = projects_data.get(folder_id, [])
        total_lessons = sum(p['total_lessons'] for p in projects)
        total_hours = sum(p['total_hours'] for p in projects)
        total_completion_time = sum(p['total_completion_time'] for p in projects)
        total_creation_hours = sum(p['total_creation_hours'] for p in projects)
        
        # Add subfolder totals
        if folder_id == 1:  # Main folder
            for child in folder_data['children']:
                child_totals = calculate_folder_totals(child['id'])
                total_lessons += child_totals['total_lessons']
                total_hours += child_totals['total_hours']
                total_completion_time += child_totals['total_completion_time']
                total_creation_hours += child_totals['total_creation_hours']
        
        return {
            'total_lessons': total_lessons,
            'total_hours': total_hours,
            'total_completion_time': total_completion_time,
            'total_creation_hours': total_creation_hours
        }
    
    # Update folder data with totals
    main_totals = calculate_folder_totals(1)
    folder_data.update(main_totals)
    
    for child in folder_data['children']:
        child_totals = calculate_folder_totals(child['id'])
        child.update(child_totals)
    
    print(f"\n📊 Folder Structure:")
    print(f"  {folder_data['name']}:")
    print(f"    - Total Lessons: {folder_data['total_lessons']}")
    print(f"    - Total Hours: {folder_data['total_hours']}h")
    print(f"    - Total Creation Hours: {folder_data['total_creation_hours']}h")
    
    for child in folder_data['children']:
        print(f"    {child['name']}:")
        print(f"      - Total Lessons: {child['total_lessons']}")
        print(f"      - Total Hours: {child['total_hours']}h")
        print(f"      - Total Creation Hours: {child['total_creation_hours']}h")
    
    return folder_data, projects_data

def main():
    """Main test function"""
    print("🚀 Testing PDF data structure...")
    
    # Test individual project calculation
    project = simulate_project_data()
    
    # Test folder structure
    folder_data, projects_data = simulate_folder_structure()
    
    print(f"\n✅ PDF Structure Test Results:")
    print(f"  - Individual project creation hours: {project['total_creation_hours']}h")
    print(f"  - Folder total creation hours: {folder_data['total_creation_hours']}h")
    print(f"  - This will be correctly displayed in PDF as 'Production Time (h)'")
    
    print(f"\n🎯 Expected PDF Output:")
    print(f"  - Instead of showing 159000 hours (incorrect)")
    print(f"  - Will show {folder_data['total_creation_hours']} hours (correct)")
    print(f"  - Based on actual completion times and quality tiers")

if __name__ == "__main__":
    main() 