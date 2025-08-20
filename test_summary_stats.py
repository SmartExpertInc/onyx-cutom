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
                'total_hours': 200,  # LEARNING DURATION (H)
                'total_creation_hours': 400,  # PRODUCTION TIME (H)
                'total_lessons': 10,
                'total_modules': 3,
                'total_completion_time': 1200  # 20 hours in minutes
            },
            {
                'total_hours': 330,  # LEARNING DURATION (H)
                'total_creation_hours': 125,  # PRODUCTION TIME (H)
                'total_lessons': 15,
                'total_modules': 5,
                'total_completion_time': 1800  # 30 hours in minutes
            }
        ]
    }
    
    unassigned_projects = [
        {
            'total_hours': 50,  # LEARNING DURATION (H)
            'total_creation_hours': 100,  # PRODUCTION TIME (H)
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
    
    # Simulate the total_hours calculation (from main.py)
    def calculate_total_hours(folder_projects, unassigned_projects):
        total_hours = 0
        
        # Sum up from all projects in folder_projects
        for folder_id, projects in folder_projects.items():
            for project in projects:
                total_hours += project.get('total_hours', 0) or 0
        
        # Sum up from unassigned projects
        for project in unassigned_projects:
            total_hours += project.get('total_hours', 0) or 0
        
        return total_hours
    
    # Simulate folders structure
    folders = [{'id': 1, 'name': 'Main Folder'}]
    
    # Calculate summary stats
    summary_stats = calculate_summary_stats(folders, folder_projects, unassigned_projects)
    
    # Calculate total_hours (LEARNING DURATION)
    total_hours = calculate_total_hours(folder_projects, unassigned_projects)
    
    # Add total_hours to summary_stats (as done in main.py)
    summary_stats['total_hours'] = total_hours
    
    print(f"📊 Summary stats calculation:")
    print(f"  - Total projects: {summary_stats['total_projects']}")
    print(f"  - Total lessons: {summary_stats['total_lessons']}")
    print(f"  - Total modules: {summary_stats['total_modules']}")
    print(f"  - Total creation time: {summary_stats['total_creation_time']}h")
    print(f"  - Total completion time: {summary_stats['total_completion_time']}m")
    print(f"  - Total hours (LEARNING DURATION): {summary_stats['total_hours']}h")
    
    expected_total_hours = 200 + 330 + 50  # all projects total_hours
    expected_creation_hours = 400 + 125 + 100  # all projects total_creation_hours
    
    print(f"\n✅ Test results:")
    print(f"  - Expected total hours (LEARNING DURATION): {expected_total_hours}")
    print(f"  - Actual total hours (LEARNING DURATION): {summary_stats['total_hours']}")
    print(f"  - Expected creation hours (PRODUCTION TIME): {expected_creation_hours}")
    print(f"  - Actual creation hours (PRODUCTION TIME): {summary_stats['total_creation_time']}")
    
    print(f"\n🎯 Expected PDF Output:")
    print(f"  Subtotal: {summary_stats['total_hours']}h of learning content → {summary_stats['total_creation_time']}h production")
    print(f"  Summary: Total: {summary_stats['total_hours']} hours of learning content")
    print(f"  Summary: Estimated Production Time: ≈ {summary_stats['total_creation_time']} hours")
    
    print(f"\n📋 Table Data:")
    print(f"  Project 1: {folder_projects[1][0]['total_hours']}h learning → {folder_projects[1][0]['total_creation_hours']}h production")
    print(f"  Project 2: {folder_projects[1][1]['total_hours']}h learning → {folder_projects[1][1]['total_creation_hours']}h production")
    print(f"  Unassigned: {unassigned_projects[0]['total_hours']}h learning → {unassigned_projects[0]['total_creation_hours']}h production")
    print(f"  TOTAL: {summary_stats['total_hours']}h learning → {summary_stats['total_creation_time']}h production")
    
    print(f"\n✅ Now using summary_stats.total_hours for LEARNING DURATION (H)!")

if __name__ == "__main__":
    test_summary_stats() 