#!/usr/bin/env python3
"""
Test script to verify that the preview data processing works correctly
"""

import json

# Mock data that would come from the backend
mock_projects_data = [
    {
        "id": 1,
        "projectName": "Test Training Plan",
        "microproduct_name": "Test Plan",
        "design_microproduct_type": "Training Plan",
        "folder_id": 1,
        "total_lessons": 10,
        "total_hours": 25.5,
        "total_completion_time": 600,
        "total_modules": 3,
        "total_creation_hours": 7650
    },
    {
        "id": 2,
        "projectName": "Another Training Plan",
        "microproduct_name": "Another Plan",
        "design_microproduct_type": "Training Plan",
        "folder_id": 1,
        "total_lessons": 8,
        "total_hours": 20.0,
        "total_completion_time": 480,
        "total_modules": 2,
        "total_creation_hours": 6000
    },
    {
        "id": 3,
        "projectName": "Unassigned Project",
        "microproduct_name": "Unassigned",
        "design_microproduct_type": "Training Plan",
        "folder_id": None,
        "total_lessons": 5,
        "total_hours": 15.0,
        "total_completion_time": 300,
        "total_modules": 1,
        "total_creation_hours": 4500
    }
]

def test_data_processing():
    """Test the data processing logic"""
    
    print("Testing data processing logic...")
    
    # Simulate the frontend processing
    processed_projects = []
    for p in mock_projects_data:
        processed_project = {
            "id": p["id"],
            "title": p["projectName"],
            "folderId": p["folder_id"],
            "total_lessons": p["total_lessons"],
            "total_hours": p["total_hours"],
            "total_completion_time": p["total_completion_time"],
            "total_modules": p["total_modules"],
            "total_creation_hours": p["total_creation_hours"]
        }
        processed_projects.append(processed_project)
    
    print("Processed projects:")
    for p in processed_projects:
        print(f"  - {p['title']}: {p['total_modules']} modules, {p['total_hours']}h learning, {p['total_creation_hours']}h production")
    
    # Simulate folder grouping
    folder_projects = {}
    unassigned_projects = []
    
    for project in processed_projects:
        if project["folderId"]:
            if project["folderId"] not in folder_projects:
                folder_projects[project["folderId"]] = []
            folder_projects[project["folderId"]].append(project)
        else:
            unassigned_projects.append(project)
    
    print(f"\nFolder projects: {len(folder_projects)} folders")
    for folder_id, projects in folder_projects.items():
        total_modules = sum(p["total_modules"] for p in projects)
        total_hours = sum(p["total_hours"] for p in projects)
        total_creation_hours = sum(p["total_creation_hours"] for p in projects)
        print(f"  Folder {folder_id}: {total_modules} modules, {total_hours}h learning, {total_creation_hours}h production")
    
    print(f"\nUnassigned projects: {len(unassigned_projects)}")
    for p in unassigned_projects:
        print(f"  - {p['title']}: {p['total_modules']} modules, {p['total_hours']}h learning, {p['total_creation_hours']}h production")
    
    # Calculate totals
    all_projects = list(folder_projects.values()) + [unassigned_projects]
    all_projects_flat = [p for sublist in all_projects for p in sublist]
    
    total_modules = sum(p["total_modules"] for p in all_projects_flat)
    total_hours = sum(p["total_hours"] for p in all_projects_flat)
    total_creation_hours = sum(p["total_creation_hours"] for p in all_projects_flat)
    
    print(f"\nTotals:")
    print(f"  Total modules: {total_modules}")
    print(f"  Total learning hours: {total_hours}")
    print(f"  Total production hours: {total_creation_hours}")
    
    print(f"\nSubtotal: {total_hours}h of learning content → {total_creation_hours}h production")
    
    return True

if __name__ == "__main__":
    test_data_processing() 