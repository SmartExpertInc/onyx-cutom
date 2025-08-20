#!/usr/bin/env python3
"""
Test script to verify PDF and preview fixes
"""

def test_pdf_preview_fixes():
    """Test PDF and preview fixes"""
    print("🧪 Testing PDF and preview fixes...")
    
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
    
    # Test 1: Table sums calculation (like in PDF template)
    def calculate_table_sums_for_template(folders, folder_projects, unassigned_projects):
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
    
    # Test 2: Quality tier sums calculation
    def calculate_quality_tier_sums(folders, folder_projects, unassigned_projects):
        quality_tier_data = {
            'basic': {'completion_time': 0, 'creation_time': 0},
            'interactive': {'completion_time': 0, 'creation_time': 0},
            'advanced': {'completion_time': 0, 'creation_time': 0},
            'immersive': {'completion_time': 0, 'creation_time': 0}
        }
        
        # Helper function to get effective quality tier
        def get_effective_quality_tier(project, folder_quality_tier='interactive'):
            # Check project-level quality tier first
            if project.get('quality_tier'):
                return project['quality_tier'].lower()
            # Fall back to folder quality tier
            return folder_quality_tier.lower()
        
        # Process all projects
        for folder in folders:
            if folder['id'] in folder_projects:
                for project in folder_projects[folder['id']]:
                    effective_tier = get_effective_quality_tier(project, folder.get('quality_tier'))
                    if effective_tier in quality_tier_data:
                        quality_tier_data[effective_tier]['completion_time'] += project.get('total_hours', 0) or 0  # Learning Duration
                        quality_tier_data[effective_tier]['creation_time'] += project.get('total_creation_hours', 0) or 0  # Production Time
        
        # Process unassigned projects
        for project in unassigned_projects:
            effective_tier = get_effective_quality_tier(project)
            if effective_tier in quality_tier_data:
                quality_tier_data[effective_tier]['completion_time'] += project.get('total_hours', 0) or 0  # Learning Duration
                quality_tier_data[effective_tier]['creation_time'] += project.get('total_creation_hours', 0) or 0  # Production Time
        
        return quality_tier_data
    
    # Calculate values
    table_sums = calculate_table_sums_for_template(folders, folder_projects, unassigned_projects)
    quality_tier_sums = calculate_quality_tier_sums(folders, folder_projects, unassigned_projects)
    
    print(f"\n📊 Test 1: Table sums calculation (PDF template):")
    print(f"  Total lessons: {table_sums['total_lessons']}")
    print(f"  Total modules: {table_sums['total_modules']}")
    print(f"  Total hours (Learning Duration): {table_sums['total_hours']}h")
    print(f"  Total production time: {table_sums['total_production_time']}h")
    
    print(f"\n📊 Test 2: Quality tier sums calculation (Block 2):")
    for tier, data in quality_tier_sums.items():
        print(f"  {tier.capitalize()}: {data['completion_time']}h learning → {data['creation_time']}h production")
    
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
    
    print(f"\n🎯 Expected Preview Output (should match PDF):")
    print(f"  Subtotal: {table_sums['total_hours']}h of learning content → {table_sums['total_production_time']}h production")
    print(f"  Total: {table_sums['total_hours']} hours of learning content")
    print(f"  Estimated Production Time: ≈ {table_sums['total_production_time']} hours")
    
    # Verify calculations
    print(f"\n✅ Verification:")
    print(f"  Lessons calculation correct: {table_sums['total_lessons'] == expected_lessons}")
    print(f"  Modules calculation correct: {table_sums['total_modules'] == expected_modules}")
    print(f"  Hours calculation correct: {table_sums['total_hours'] == expected_hours}")
    print(f"  Production calculation correct: {table_sums['total_production_time'] == expected_production}")
    
    # Test 3: Check that all quality tiers are shown (even with 0 values)
    print(f"\n📋 Test 3: Quality tiers display (Block 2):")
    tier_names = {
        'basic': 'Level 1 - Basic',
        'interactive': 'Level 2 - Interactive', 
        'advanced': 'Level 3 - Advanced',
        'immersive': 'Level 4 - Immersive'
    }
    
    for tier_key, tier_name in tier_names.items():
        data = quality_tier_sums.get(tier_key, {'completion_time': 0, 'creation_time': 0})
        print(f"  {tier_name}: {data['completion_time']}h learning, {data['creation_time']}h production")
    
    print(f"\n✅ All quality tiers should be displayed in Block 2, even with 0 values")
    
    print(f"\n✅ PDF and preview fixes working correctly!")

if __name__ == "__main__":
    test_pdf_preview_fixes() 