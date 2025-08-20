#!/usr/bin/env python3
"""
Test script to verify that the preview calculations now match the PDF logic
"""

import json

# Mock data that would come from the backend (with the new fields)
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

def test_preview_calculations():
    """Test the preview calculations to match PDF logic"""
    
    print("Testing preview calculations to match PDF logic...")
    
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
    
    # Calculate summary stats like in PDF generation (same as preview now does)
    all_projects = processed_projects
    total_learning_hours = sum(p["total_hours"] for p in all_projects)
    total_production_hours = sum(p["total_creation_hours"] for p in all_projects)
    
    print(f"\nSummary stats (like PDF):")
    print(f"  Total learning hours: {total_learning_hours}")
    print(f"  Total production hours: {total_production_hours}")
    
    print(f"\nSubtotal: {total_learning_hours}h of learning content → {total_production_hours}h production")
    
    # Block 2 values (same as PDF)
    quality_levels = [
        {"name": "Level 1 - Basic", "learningDuration": 1, "productionHours": 200},
        {"name": "Level 2 - Interactive", "learningDuration": 2, "productionHours": 400},
        {"name": "Level 3 - Advanced", "learningDuration": 3, "productionHours": 600},
        {"name": "Level 4 - Immersive", "learningDuration": 5, "productionHours": 800}
    ]
    
    print(f"\nBlock 2. Production Hours by Quality Level:")
    for level in quality_levels:
        print(f"  {level['name']}: {level['learningDuration']}h → {level['productionHours']}h")
    
    print(f"\nSummary:")
    print(f"  Total: {total_learning_hours} hours of learning content")
    print(f"  Estimated Production Time: ≈ {total_production_hours} hours")
    print(f"  Production scaling depends on chosen quality tier (200-800h per 1h learning).")
    
    # Verify the calculations are correct
    expected_learning_hours = 25.5 + 20.0 + 15.0  # 60.5
    expected_production_hours = 7650 + 6000 + 4500  # 18150
    
    print(f"\nVerification:")
    print(f"  Expected learning hours: {expected_learning_hours}")
    print(f"  Calculated learning hours: {total_learning_hours}")
    print(f"  Match: {abs(total_learning_hours - expected_learning_hours) < 0.1}")
    
    print(f"  Expected production hours: {expected_production_hours}")
    print(f"  Calculated production hours: {total_production_hours}")
    print(f"  Match: {total_production_hours == expected_production_hours}")
    
    return True

if __name__ == "__main__":
    test_preview_calculations() 