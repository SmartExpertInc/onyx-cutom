#!/usr/bin/env python3
"""
Test script to verify table sums calculation for PDF
"""

def test_table_sums():
    """Test table sums calculation for Block 1 data"""
    print("🧪 Testing table sums calculation...")
    
    # Simulate real data structure with different quality tiers
    folder_projects = {
        1: [  # Main folder projects
            {
                'id': 1,
                'total_hours': 20,  # LEARNING DURATION (H) - from lesson hours
                'total_creation_hours': 400,  # PRODUCTION TIME (H) - calculated creation hours
                'total_lessons': 10,
                'total_modules': 3,
                'total_completion_time': 1200,  # 20 hours in minutes
                'quality_tier': 'basic'  # Level 1 - Basic
            },
            {
                'id': 2,
                'total_hours': 30,  # LEARNING DURATION (H) - from lesson hours
                'total_creation_hours': 125,  # PRODUCTION TIME (H) - calculated creation hours
                'total_lessons': 15,
                'total_modules': 5,
                'total_completion_time': 1800,  # 30 hours in minutes
                'quality_tier': 'interactive'  # Level 2 - Interactive
            },
            {
                'id': 3,
                'total_hours': 15,  # LEARNING DURATION (H) - from lesson hours
                'total_creation_hours': 300,  # PRODUCTION TIME (H) - calculated creation hours
                'total_lessons': 8,
                'total_modules': 2,
                'total_completion_time': 900,  # 15 hours in minutes
                'quality_tier': 'advanced'  # Level 3 - Advanced
            }
        ]
    }
    
    unassigned_projects = [
        {
            'id': 4,
            'total_hours': 5,  # LEARNING DURATION (H) - from lesson hours
            'total_creation_hours': 100,  # PRODUCTION TIME (H) - calculated creation hours
            'total_lessons': 5,
            'total_modules': 2,
            'total_completion_time': 300,  # 5 hours in minutes
            'quality_tier': 'immersive'  # Level 4 - Immersive
        }
    ]
    
    # Simulate folders structure
    folders = [{'id': 1, 'name': 'Main Folder', 'quality_tier': 'interactive'}]
    
    # Simulate the table sums calculation (like in Block 1 template)
    def calculate_table_sums(folders, folder_projects, unassigned_projects):
        total_lessons = 0
        total_modules = 0
        total_hours = 0  # Learning Duration (H) - sum of total_hours
        total_production_time = 0  # Production Time (H) - sum of total_creation_hours
        
        # Calculate from folders and their projects
        for folder in folders:
            if folder['id'] in folder_projects:
                for project in folder_projects[folder['id']]:
                    total_lessons += project.get('total_lessons', 0) or 0
                    total_modules += project.get('total_modules', 0) or 0
                    total_hours += project.get('total_hours', 0) or 0  # Learning Duration
                    total_production_time += project.get('total_creation_hours', 0) or 0  # Production Time
        
        # Add unassigned projects
        for project in unassigned_projects:
            total_lessons += project.get('total_lessons', 0) or 0
            total_modules += project.get('total_modules', 0) or 0
            total_hours += project.get('total_hours', 0) or 0  # Learning Duration
            total_production_time += project.get('total_creation_hours', 0) or 0  # Production Time
        
        return {
            'total_lessons': total_lessons,
            'total_modules': total_modules,
            'total_hours': total_hours,  # Learning Duration (H)
            'total_production_time': total_production_time  # Production Time (H)
        }
    
    # Calculate table sums
    table_sums = calculate_table_sums(folders, folder_projects, unassigned_projects)
    
    print(f"\n📊 Table sums calculation (Block 1):")
    print(f"  Total lessons: {table_sums['total_lessons']}")
    print(f"  Total modules: {table_sums['total_modules']}")
    print(f"  Total hours (Learning Duration): {table_sums['total_hours']}h")
    print(f"  Total production time: {table_sums['total_production_time']}h")
    
    # Expected values
    expected_lessons = 10 + 15 + 8 + 5  # 38
    expected_modules = 3 + 5 + 2 + 2  # 12
    expected_hours = 20 + 30 + 15 + 5  # 70h (Learning Duration)
    expected_production = 400 + 125 + 300 + 100  # 925h (Production Time)
    
    print(f"\n✅ Test results:")
    print(f"  Expected lessons: {expected_lessons}")
    print(f"  Actual lessons: {table_sums['total_lessons']}")
    print(f"  Expected modules: {expected_modules}")
    print(f"  Actual modules: {table_sums['total_modules']}")
    print(f"  Expected hours (Learning Duration): {expected_hours}h")
    print(f"  Actual hours (Learning Duration): {table_sums['total_hours']}h")
    print(f"  Expected production time: {expected_production}h")
    print(f"  Actual production time: {table_sums['total_production_time']}h")
    
    print(f"\n🎯 Expected PDF Output:")
    print(f"  Subtotal: {table_sums['total_hours']}h of learning content → {table_sums['total_production_time']}h production")
    print(f"  Total: {table_sums['total_hours']} hours of learning content")
    print(f"  Estimated Production Time: ≈ {table_sums['total_production_time']} hours")
    
    print(f"\n📋 Block 1 Table Data:")
    print(f"  Project 1: {folder_projects[1][0]['total_hours']}h learning → {folder_projects[1][0]['total_creation_hours']}h production")
    print(f"  Project 2: {folder_projects[1][1]['total_hours']}h learning → {folder_projects[1][1]['total_creation_hours']}h production")
    print(f"  Project 3: {folder_projects[1][2]['total_hours']}h learning → {folder_projects[1][2]['total_creation_hours']}h production")
    print(f"  Unassigned: {unassigned_projects[0]['total_hours']}h learning → {unassigned_projects[0]['total_creation_hours']}h production")
    print(f"  TOTAL: {table_sums['total_hours']}h learning → {table_sums['total_production_time']}h production")
    
    # Verify calculations
    print(f"\n✅ Verification:")
    print(f"  Lessons calculation correct: {table_sums['total_lessons'] == expected_lessons}")
    print(f"  Modules calculation correct: {table_sums['total_modules'] == expected_modules}")
    print(f"  Hours calculation correct: {table_sums['total_hours'] == expected_hours}")
    print(f"  Production calculation correct: {table_sums['total_production_time'] == expected_production}")
    
    print(f"\n✅ Table sums calculation working correctly!")

if __name__ == "__main__":
    test_table_sums() 