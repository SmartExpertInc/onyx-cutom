#!/usr/bin/env python3
"""
Test script to verify data processing logic for PDF generation
"""

import json
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

def test_data_processing():
    """Test the data processing logic"""
    
    # Sample test data
    test_projects = [
        {
            "id": 1,
            "title": "Course 1",
            "project_name": "Course 1",
            "microproduct_name": "Course 1",
            "created_at": "2024-01-01T00:00:00",
            "design_microproduct_type": "Training Plan",
            "folder_id": 1,
            "order": 0,
            "microproduct_content": {
                "sections": [
                    {
                        "lessons": [
                            {"hours": 2, "completionTime": "30m"},
                            {"hours": 1.5, "completionTime": "20m"}
                        ]
                    }
                ]
            },
            "total_lessons": 2,
            "total_hours": 3.5,
            "total_completion_time": 50
        },
        {
            "id": 2,
            "title": "Course 2",
            "project_name": "Course 2",
            "microproduct_name": "Course 2",
            "created_at": "2024-01-02T00:00:00",
            "design_microproduct_type": "PDF Lesson",
            "folder_id": 1,
            "order": 1,
            "microproduct_content": {
                "sections": [
                    {
                        "lessons": [
                            {"hours": 1, "completionTime": "15m"}
                        ]
                    }
                ]
            },
            "total_lessons": 1,
            "total_hours": 1,
            "total_completion_time": 15
        },
        {
            "id": 3,
            "title": "Unassigned Course",
            "project_name": "Unassigned Course",
            "microproduct_name": "Unassigned Course",
            "created_at": "2024-01-03T00:00:00",
            "design_microproduct_type": "Training Plan",
            "folder_id": None,
            "order": 0,
            "microproduct_content": {
                "sections": [
                    {
                        "lessons": [
                            {"hours": 0.5, "completionTime": "10m"}
                        ]
                    }
                ]
            },
            "total_lessons": 1,
            "total_hours": 0.5,
            "total_completion_time": 10
        }
    ]
    
    # Test folder structure
    test_folders = [
        {
            "id": 1,
            "name": "Test Folder",
            "created_at": "2024-01-01T00:00:00",
            "order": 0,
            "parent_id": None,
            "quality_tier": "interactive",
            "project_count": 2,
            "total_lessons": 3,
            "total_hours": 4.5,
            "total_completion_time": 65
        }
    ]
    
    # Group projects by folder
    folder_projects = {}
    unassigned_projects = []
    
    for project in test_projects:
        if project['folder_id']:
            if project['folder_id'] not in folder_projects:
                folder_projects[project['folder_id']] = []
            folder_projects[project['folder_id']].append(project)
        else:
            unassigned_projects.append(project)
    
    print("=== Test Data Processing ===")
    print(f"Total projects: {len(test_projects)}")
    print(f"Projects in folders: {len([p for p in test_projects if p['folder_id']])}")
    print(f"Unassigned projects: {len(unassigned_projects)}")
    print()
    
    # Calculate totals like the backend
    total_lessons = 0
    total_hours = 0
    total_production_time = 0
    
    # Process folders
    for folder in test_folders:
        folder_projects_list = folder_projects.get(folder['id'], [])
        folder_lessons = sum(p['total_lessons'] for p in folder_projects_list)
        folder_hours = sum(p['total_hours'] for p in folder_projects_list)
        folder_production = folder_hours * 300
        
        print(f"Folder: {folder['name']}")
        print(f"  Projects: {len(folder_projects_list)}")
        print(f"  Lessons: {folder_lessons}")
        print(f"  Hours: {folder_hours}")
        print(f"  Production Time: {folder_production}h")
        print()
        
        total_lessons += folder_lessons
        total_hours += folder_hours
        total_production_time += folder_production
        
        # Process individual projects in folder
        for project in folder_projects_list:
            project_production = project['total_hours'] * 300
            print(f"  Project: {project['title']}")
            print(f"    Lessons: {project['total_lessons']}")
            print(f"    Hours: {project['total_hours']}")
            print(f"    Production Time: {project_production}h")
            print()
    
    # Process unassigned projects
    for project in unassigned_projects:
        project_production = project['total_hours'] * 300
        print(f"Unassigned Project: {project['title']}")
        print(f"  Lessons: {project['total_lessons']}")
        print(f"  Hours: {project['total_hours']}")
        print(f"  Production Time: {project_production}h")
        print()
        
        total_lessons += project['total_lessons']
        total_hours += project['total_hours']
        total_production_time += project_production
    
    print("=== Summary ===")
    print(f"Total Lessons: {total_lessons}")
    print(f"Total Hours: {total_hours}")
    print(f"Total Production Time: {total_production_time}h")
    print(f"Production Time Formula: {total_hours} * 300 = {total_hours * 300}h")
    
    # Verify the calculation
    expected_production = total_hours * 300
    if total_production_time == expected_production:
        print("✅ Production time calculation is correct!")
    else:
        print(f"❌ Production time calculation error: {total_production_time} != {expected_production}")

if __name__ == "__main__":
    test_data_processing() 