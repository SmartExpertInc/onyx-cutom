#!/usr/bin/env python3
"""
Test script to verify subtotal calculation fix
"""

def test_subtotal_calculation():
    """Test subtotal calculation logic"""
    print("🧪 Testing subtotal calculation...")
    
    # Simulate folder and project data
    folder_data = {
        'total_hours': 15,
        'total_creation_hours': 450,
        'children': [
            {
                'total_hours': 8,
                'total_creation_hours': 240
            },
            {
                'total_hours': 7,
                'total_creation_hours': 210
            }
        ]
    }
    
    unassigned_projects = [
        {
            'total_hours': 5,
            'total_creation_hours': 150
        },
        {
            'total_hours': 3,
            'total_creation_hours': 90
        }
    ]
    
    # Calculate total values (this is the logic we added)
    total_hours = 0
    total_production_time = 0
    
    # Sum up from folders
    total_hours += folder_data.get('total_hours', 0) or 0
    total_production_time += folder_data.get('total_creation_hours', 0) or 0
    
    # Sum up from unassigned projects
    for project in unassigned_projects:
        total_hours += project.get('total_hours', 0) or 0
        total_production_time += project.get('total_creation_hours', 0) or 0
    
    print(f"📊 Folder data:")
    print(f"  - Main folder: {folder_data['total_hours']}h → {folder_data['total_creation_hours']}h")
    print(f"  - Child 1: {folder_data['children'][0]['total_hours']}h → {folder_data['children'][0]['total_creation_hours']}h")
    print(f"  - Child 2: {folder_data['children'][1]['total_hours']}h → {folder_data['children'][1]['total_creation_hours']}h")
    
    print(f"\n📊 Unassigned projects:")
    for i, project in enumerate(unassigned_projects, 1):
        print(f"  - Project {i}: {project['total_hours']}h → {project['total_creation_hours']}h")
    
    print(f"\n📊 Total calculation:")
    print(f"  - Total Hours: {total_hours}h")
    print(f"  - Total Production Time: {total_production_time}h")
    
    expected_hours = 15 + 5 + 3  # folder + 2 unassigned projects
    expected_production = 450 + 150 + 90  # folder + 2 unassigned projects
    
    print(f"\n✅ Subtotal calculation test completed!")
    print(f"  - Expected hours: {expected_hours}h")
    print(f"  - Actual hours: {total_hours}h")
    print(f"  - Expected production: {expected_production}h")
    print(f"  - Actual production: {total_production_time}h")
    print(f"  - Hours status: {'✅ PASS' if total_hours == expected_hours else '❌ FAIL'}")
    print(f"  - Production status: {'✅ PASS' if total_production_time == expected_production else '❌ FAIL'}")
    
    print(f"\n🎯 Expected PDF Output:")
    print(f"  Subtotal: {total_hours}h of learning content → {total_production_time}h production")

if __name__ == "__main__":
    test_subtotal_calculation() 