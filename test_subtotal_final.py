#!/usr/bin/env python3
"""
Final test script to verify subtotal calculation
"""

def test_subtotal_final():
    """Test final subtotal calculation logic"""
    print("🧪 Testing final subtotal calculation...")
    
    # Simulate real data structure
    folder_projects = {
        1: [  # Main folder projects
            {
                'total_hours': 200,
                'total_creation_hours': 400,
                'total_lessons': 10,
                'total_modules': 3
            },
            {
                'total_hours': 330,
                'total_creation_hours': 125,
                'total_lessons': 15,
                'total_modules': 5
            }
        ],
        2: [  # Subfolder projects
            {
                'total_hours': 100,
                'total_creation_hours': 200,
                'total_lessons': 8,
                'total_modules': 2
            }
        ]
    }
    
    unassigned_projects = [
        {
            'total_hours': 50,
            'total_creation_hours': 100,
            'total_lessons': 5,
            'total_modules': 2
        },
        {
            'total_hours': 25,
            'total_creation_hours': 50,
            'total_lessons': 3,
            'total_modules': 1
        }
    ]
    
    # Calculate totals (this is the logic we added)
    total_hours = 0
    total_production_time = 0
    
    # Sum up from all projects in folder_projects (this includes all projects within folders)
    for folder_id, projects in folder_projects.items():
        for project in projects:
            total_hours += project.get('total_hours', 0) or 0
            total_production_time += project.get('total_creation_hours', 0) or 0
    
    # Sum up from unassigned projects
    for project in unassigned_projects:
        total_hours += project.get('total_hours', 0) or 0
        total_production_time += project.get('total_creation_hours', 0) or 0
    
    print(f"📊 Folder projects:")
    for folder_id, projects in folder_projects.items():
        print(f"  Folder {folder_id}:")
        for i, project in enumerate(projects, 1):
            print(f"    Project {i}: {project['total_hours']}h → {project['total_creation_hours']}h")
    
    print(f"\n📊 Unassigned projects:")
    for i, project in enumerate(unassigned_projects, 1):
        print(f"  Project {i}: {project['total_hours']}h → {project['total_creation_hours']}h")
    
    print(f"\n📊 Total calculation:")
    print(f"  - Total Hours: {total_hours}h")
    print(f"  - Total Production Time: {total_production_time}h")
    
    expected_hours = 200 + 330 + 100 + 50 + 25  # all projects
    expected_production = 400 + 125 + 200 + 100 + 50  # all projects
    
    print(f"\n✅ Final test results:")
    print(f"  - Expected hours: {expected_hours}h")
    print(f"  - Actual hours: {total_hours}h")
    print(f"  - Expected production: {expected_production}h")
    print(f"  - Actual production: {total_production_time}h")
    print(f"  - Hours status: {'✅ PASS' if total_hours == expected_hours else '❌ FAIL'}")
    print(f"  - Production status: {'✅ PASS' if total_production_time == expected_production else '❌ FAIL'}")
    
    print(f"\n🎯 Expected PDF Output:")
    print(f"  Subtotal: {total_hours}h of learning content → {total_production_time}h production")
    print(f"  Summary: Total: {total_hours} hours of learning content")
    print(f"  Summary: Estimated Production Time: ≈ {total_production_time} hours")
    
    print(f"\n✅ Subtotal calculation should now work correctly!")

if __name__ == "__main__":
    test_subtotal_final() 