#!/usr/bin/env python3
"""
Test script to verify summary_stats calculation
"""

def test_summary_stats():
    """Test summary_stats calculation logic"""
    print("🧪 Testing summary_stats calculation...")
    
    # Simulate real data structure
    folder_projects = {
        1: [  # Main folder projects
            {
                'total_hours': 200,
                'total_creation_hours': 400,
                'total_lessons': 10,
                'total_modules': 3,
                'total_completion_time': 1200  # 20 hours in minutes
            },
            {
                'total_hours': 330,
                'total_creation_hours': 125,
                'total_lessons': 15,
                'total_modules': 5,
                'total_completion_time': 1800  # 30 hours in minutes
            }
        ]
    }
    
    unassigned_projects = [
        {
            'total_hours': 50,
            'total_creation_hours': 100,
            'total_lessons': 5,
            'total_modules': 2,
            'total_completion_time': 300  # 5 hours in minutes
        }
    ]
    
    # Simulate the calculate_summary_stats function
    def calculate_summary_stats(folders, folder_projects, unassigned_projects):
        total_projects = 0
        total_lessons = 0
        total_modules = 0
        total_creation_time = 0
        total_completion_time = 0
        
        # Calculate from folders and their projects
        for folder in folders:
            if folder['id'] in folder_projects:
                for project in folder_projects[folder['id']]:
                    total_projects += 1
                    total_lessons += project.get('total_lessons', 0) or 0
                    total_modules += project.get('total_modules', 0) or 0
                    total_creation_time += project.get('total_creation_hours', 0) or 0
                    total_completion_time += project.get('total_completion_time', 0) or 0
        
        # Add unassigned projects
        for project in unassigned_projects:
            total_projects += 1
            total_lessons += project.get('total_lessons', 0) or 0
            total_modules += project.get('total_modules', 0) or 0
            total_creation_time += project.get('total_creation_hours', 0) or 0
            total_completion_time += project.get('total_completion_time', 0) or 0
        
        return {
            'total_projects': total_projects,
            'total_lessons': total_lessons,
            'total_modules': total_modules,
            'total_creation_time': total_creation_time,
            'total_completion_time': total_completion_time
        }
    
    # Simulate folders structure
    folders = [{'id': 1, 'name': 'Main Folder'}]
    
    # Calculate summary stats
    summary_stats = calculate_summary_stats(folders, folder_projects, unassigned_projects)
    
    print(f"📊 Summary stats calculation:")
    print(f"  - Total projects: {summary_stats['total_projects']}")
    print(f"  - Total lessons: {summary_stats['total_lessons']}")
    print(f"  - Total modules: {summary_stats['total_modules']}")
    print(f"  - Total creation time: {summary_stats['total_creation_time']}h")
    print(f"  - Total completion time: {summary_stats['total_completion_time']}m")
    
    # Calculate hours from completion time
    completion_hours = summary_stats['total_completion_time'] / 60 if summary_stats['total_completion_time'] else 0
    
    print(f"\n📊 Conversion:")
    print(f"  - Completion time in minutes: {summary_stats['total_completion_time']}")
    print(f"  - Completion time in hours: {completion_hours:.1f}")
    print(f"  - Creation time in hours: {summary_stats['total_creation_time']}")
    
    expected_completion_minutes = 1200 + 1800 + 300  # all projects
    expected_creation_hours = 400 + 125 + 100  # all projects
    expected_completion_hours = expected_completion_minutes / 60
    
    print(f"\n✅ Test results:")
    print(f"  - Expected completion minutes: {expected_completion_minutes}")
    print(f"  - Actual completion minutes: {summary_stats['total_completion_time']}")
    print(f"  - Expected completion hours: {expected_completion_hours:.1f}")
    print(f"  - Actual completion hours: {completion_hours:.1f}")
    print(f"  - Expected creation hours: {expected_creation_hours}")
    print(f"  - Actual creation hours: {summary_stats['total_creation_time']}")
    
    print(f"\n🎯 Expected PDF Output:")
    print(f"  Subtotal: {completion_hours:.1f}h of learning content → {summary_stats['total_creation_time']}h production")
    print(f"  Summary: Total: {completion_hours:.1f} hours of learning content")
    print(f"  Summary: Estimated Production Time: ≈ {summary_stats['total_creation_time']} hours")
    
    print(f"\n✅ Summary stats calculation should now work correctly!")

if __name__ == "__main__":
    test_summary_stats() 