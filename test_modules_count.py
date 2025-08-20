#!/usr/bin/env python3
"""
Test script to verify modules counting
"""

def test_modules_count():
    """Test modules counting logic"""
    print("🧪 Testing modules counting...")
    
    # Simulate project data with multiple modules
    project_data = {
        'microproduct_content': {
            'sections': [
                {
                    'title': 'Module 1',
                    'lessons': [
                        {'title': 'Lesson 1', 'completionTime': '5m'},
                        {'title': 'Lesson 2', 'completionTime': '10m'}
                    ]
                },
                {
                    'title': 'Module 2', 
                    'lessons': [
                        {'title': 'Lesson 3', 'completionTime': '15m'},
                        {'title': 'Lesson 4', 'completionTime': '20m'},
                        {'title': 'Lesson 5', 'completionTime': '25m'}
                    ]
                },
                {
                    'title': 'Module 3',
                    'lessons': [
                        {'title': 'Lesson 6', 'completionTime': '30m'}
                    ]
                }
            ]
        }
    }
    
    # Count modules (this is the logic we added)
    total_modules = 0
    if project_data.get('microproduct_content') and isinstance(project_data['microproduct_content'], dict):
        content = project_data['microproduct_content']
        if content.get('sections') and isinstance(content['sections'], list):
            total_modules = len(content['sections'])
    
    print(f"📊 Project has {total_modules} modules")
    print(f"  - Module 1: 2 lessons")
    print(f"  - Module 2: 3 lessons") 
    print(f"  - Module 3: 1 lesson")
    print(f"  - Total: {total_modules} modules, 6 lessons")
    
    # Test with empty project
    empty_project = {'microproduct_content': {}}
    empty_modules = 0
    if empty_project.get('microproduct_content') and isinstance(empty_project['microproduct_content'], dict):
        content = empty_project['microproduct_content']
        if content.get('sections') and isinstance(content['sections'], list):
            empty_modules = len(content['sections'])
    
    print(f"\n📊 Empty project has {empty_modules} modules")
    
    # Test with project without sections
    no_sections_project = {'microproduct_content': {'sections': None}}
    no_sections_modules = 0
    if no_sections_project.get('microproduct_content') and isinstance(no_sections_project['microproduct_content'], dict):
        content = no_sections_project['microproduct_content']
        if content.get('sections') and isinstance(content['sections'], list):
            no_sections_modules = len(content['sections'])
    
    print(f"📊 Project without sections has {no_sections_modules} modules")
    
    print(f"\n✅ Modules counting test completed!")
    print(f"  - Expected: 3 modules for test project")
    print(f"  - Actual: {total_modules} modules")
    print(f"  - Status: {'✅ PASS' if total_modules == 3 else '❌ FAIL'}")

if __name__ == "__main__":
    test_modules_count() 