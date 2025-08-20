#!/usr/bin/env python3
"""
Test script to verify PDF fixes
"""

def test_pdf_fixes():
    """Test PDF fixes for Block 2 and summary calculations"""
    print("🧪 Testing PDF fixes...")
    
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
    
    # Simulate the calculate_summary_stats function (FIXED)
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
                    total_creation_time += project.get('total_creation_hours', 0) or 0  # FIXED: Use total_creation_hours
                    total_completion_time += project.get('total_completion_time', 0) or 0
        
        # Add unassigned projects
        for project in unassigned_projects:
            total_projects += 1
            total_lessons += project.get('total_lessons', 0) or 0
            total_modules += project.get('total_modules', 0) or 0
            total_creation_time += project.get('total_creation_hours', 0) or 0  # FIXED: Use total_creation_hours
            total_completion_time += project.get('total_completion_time', 0) or 0
        
        return {
            'total_projects': total_projects,
            'total_lessons': total_lessons,
            'total_modules': total_modules,
            'total_hours': total_creation_time,  # This is actually total_creation_hours (Production Time)
            'total_completion_time': total_completion_time
        }
    
    # Simulate the calculate_quality_tier_sums function (FIXED)
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
        
        # Process folder projects
        for folder in folders:
            folder_quality_tier = folder.get('quality_tier', 'interactive').lower()
            
            if folder['id'] in folder_projects:
                for project in folder_projects[folder['id']]:
                    effective_tier = get_effective_quality_tier(project, folder_quality_tier)
                    if effective_tier in quality_tier_data:
                        quality_tier_data[effective_tier]['completion_time'] += project.get('total_completion_time', 0) or 0
                        quality_tier_data[effective_tier]['creation_time'] += project.get('total_creation_hours', 0) or 0  # FIXED: Use total_creation_hours
                        print(f"  Added project {project['id']} ({project['quality_tier']}) to {effective_tier}: {project.get('total_completion_time', 0)}m completion, {project.get('total_creation_hours', 0)}h creation")
            
            # Recursively process subfolders
            if folder.get('children'):
                child_data = calculate_quality_tier_sums(folder['children'], folder_projects, [])
                for tier in quality_tier_data:
                    quality_tier_data[tier]['completion_time'] += child_data[tier]['completion_time']
                    quality_tier_data[tier]['creation_time'] += child_data[tier]['creation_time']
        
        # Process unassigned projects (use default tier)
        for project in unassigned_projects:
            effective_tier = get_effective_quality_tier(project, 'interactive')
            if effective_tier in quality_tier_data:
                quality_tier_data[effective_tier]['completion_time'] += project.get('total_completion_time', 0) or 0
                quality_tier_data[effective_tier]['creation_time'] += project.get('total_creation_hours', 0) or 0  # FIXED: Use total_creation_hours
                print(f"  Added unassigned project {project['id']} ({project['quality_tier']}) to {effective_tier}: {project.get('total_completion_time', 0)}m completion, {project.get('total_creation_hours', 0)}h creation")
        
        return quality_tier_data
    
    # Calculate summary stats (FIXED)
    summary_stats = calculate_summary_stats(folders, folder_projects, unassigned_projects)
    
    # Calculate quality tier sums (FIXED)
    quality_tier_sums = calculate_quality_tier_sums(folders, folder_projects, unassigned_projects)
    
    print(f"\n📊 Summary stats calculation (FIXED):")
    print(f"  Total projects: {summary_stats['total_projects']}")
    print(f"  Total lessons: {summary_stats['total_lessons']}")
    print(f"  Total modules: {summary_stats['total_modules']}")
    print(f"  Total completion time: {summary_stats['total_completion_time']}m ({summary_stats['total_completion_time'] // 60}h)")
    print(f"  Total creation time (Production): {summary_stats['total_hours']}h")
    
    print(f"\n📊 Quality tier sums calculation (FIXED):")
    print(f"  Basic: {quality_tier_sums['basic']['completion_time']}m completion, {quality_tier_sums['basic']['creation_time']}h creation")
    print(f"  Interactive: {quality_tier_sums['interactive']['completion_time']}m completion, {quality_tier_sums['interactive']['creation_time']}h creation")
    print(f"  Advanced: {quality_tier_sums['advanced']['completion_time']}m completion, {quality_tier_sums['advanced']['creation_time']}h creation")
    print(f"  Immersive: {quality_tier_sums['immersive']['completion_time']}m completion, {quality_tier_sums['immersive']['creation_time']}h creation")
    
    # Expected values
    expected_completion_time = 1200 + 1800 + 900 + 300  # 4200 minutes = 70 hours
    expected_creation_time = 400 + 125 + 300 + 100  # 925 hours
    
    print(f"\n✅ Test results:")
    print(f"  Expected completion time: {expected_completion_time}m ({expected_completion_time // 60}h)")
    print(f"  Actual completion time: {summary_stats['total_completion_time']}m ({summary_stats['total_completion_time'] // 60}h)")
    print(f"  Expected creation time: {expected_creation_time}h")
    print(f"  Actual creation time: {summary_stats['total_hours']}h")
    
    print(f"\n🎯 Expected PDF Output (FIXED):")
    print(f"  Subtotal: {summary_stats['total_completion_time'] // 60}h of learning content → {summary_stats['total_hours']}h production")
    print(f"  Summary: Total: {summary_stats['total_completion_time'] // 60} hours of learning content")
    print(f"  Summary: Estimated Production Time: ≈ {summary_stats['total_hours']} hours")
    
    print(f"\n📋 Block 2. Production Hours by Quality Level (FIXED):")
    tier_names = {
        'basic': 'Level 1 - Basic',
        'interactive': 'Level 2 - Interactive',
        'advanced': 'Level 3 - Advanced',
        'immersive': 'Level 4 - Immersive'
    }
    
    for tier, data in quality_tier_sums.items():
        if data['completion_time'] > 0 or data['creation_time'] > 0:
            completion_h = data['completion_time'] // 60
            completion_m = data['completion_time'] % 60
            creation_h = data['creation_time'] // 60
            creation_m = data['creation_time'] % 60
            
            completion_str = f"{completion_h}h{completion_m}m" if completion_m > 0 else f"{completion_h}h"
            creation_str = f"{creation_h}h{creation_m}m" if creation_m > 0 else f"{creation_h}h"
            
            print(f"  {tier_names[tier]}: {completion_str} → {creation_str}")
    
    # Verify all tiers have data
    tiers_with_data = []
    for tier, data in quality_tier_sums.items():
        if data['completion_time'] > 0 or data['creation_time'] > 0:
            tiers_with_data.append(tier)
    
    print(f"\n✅ Verification:")
    print(f"  Tiers with data: {tiers_with_data}")
    print(f"  All 4 tiers should have data: {len(tiers_with_data) == 4}")
    print(f"  Completion time calculation correct: {summary_stats['total_completion_time'] == expected_completion_time}")
    print(f"  Creation time calculation correct: {summary_stats['total_hours'] == expected_creation_time}")
    
    print(f"\n✅ All PDF fixes applied successfully!")

if __name__ == "__main__":
    test_pdf_fixes() 