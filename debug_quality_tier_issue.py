#!/usr/bin/env python3
"""
Debug script to diagnose quality tier sums issue
"""

def debug_quality_tier_issue():
    """Debug why only Interactive shows data in Block 2"""
    
    print("🔍 Debugging Quality Tier Sums Issue")
    print("=" * 60)
    
    # Simulate the exact logic from backend
    def calculate_quality_tier_sums(folders, folder_projects, unassigned_projects):
        quality_tier_data = {
            'basic': {'completion_time': 0, 'creation_time': 0},
            'interactive': {'completion_time': 0, 'creation_time': 0},
            'advanced': {'completion_time': 0, 'creation_time': 0},
            'immersive': {'completion_time': 0, 'creation_time': 0}
        }
        
        def get_effective_quality_tier(project, folder_quality_tier='interactive'):
            if project.get('quality_tier'):
                tier = project['quality_tier'].lower()
                tier_mapping = {
                    'basic': 'basic',
                    'interactive': 'interactive', 
                    'advanced': 'advanced',
                    'immersive': 'immersive',
                    'starter': 'basic',
                    'medium': 'interactive',
                    'professional': 'immersive'
                }
                if tier in tier_mapping:
                    return tier_mapping[tier]
            folder_tier = folder_quality_tier.lower()
            tier_mapping = {
                'basic': 'basic',
                'interactive': 'interactive',
                'advanced': 'advanced', 
                'immersive': 'immersive',
                'starter': 'basic',
                'medium': 'interactive',
                'professional': 'immersive'
            }
            return tier_mapping.get(folder_tier, 'interactive')
        
        # Process folder projects
        for folder in folders:
            folder_quality_tier = folder.get('quality_tier', 'interactive').lower()
            print(f"📁 Processing folder {folder.get('id')} with quality_tier: {folder_quality_tier}")
            
            if folder['id'] in folder_projects:
                for project in folder_projects[folder['id']]:
                    effective_tier = get_effective_quality_tier(project, folder_quality_tier)
                    print(f"  📄 Project {project.get('id')}: project_tier={project.get('quality_tier')}, effective_tier={effective_tier}")
                    if effective_tier in quality_tier_data:
                        quality_tier_data[effective_tier]['completion_time'] += project.get('total_completion_time', 0) or 0
                        quality_tier_data[effective_tier]['creation_time'] += project.get('total_creation_hours', 0) or 0
                        print(f"    ✅ Added to {effective_tier}: completion_time={project.get('total_completion_time', 0)}, creation_time={project.get('total_creation_hours', 0)}")
                    else:
                        print(f"    ❌ Tier {effective_tier} not found in quality_tier_data")
            
            # Process subfolders
            if folder.get('children'):
                child_data = calculate_quality_tier_sums(folder['children'], folder_projects, [])
                for tier in quality_tier_data:
                    quality_tier_data[tier]['completion_time'] += child_data[tier]['completion_time']
                    quality_tier_data[tier]['creation_time'] += child_data[tier]['creation_time']
        
        # Process unassigned projects
        print(f"📄 Processing {len(unassigned_projects)} unassigned projects")
        for project in unassigned_projects:
            effective_tier = get_effective_quality_tier(project, 'interactive')
            print(f"  📄 Unassigned project {project.get('id')}: project_tier={project.get('quality_tier')}, effective_tier={effective_tier}")
            if effective_tier in quality_tier_data:
                quality_tier_data[effective_tier]['completion_time'] += project.get('total_completion_time', 0) or 0
                quality_tier_data[effective_tier]['creation_time'] += project.get('total_creation_hours', 0) or 0
                print(f"    ✅ Added unassigned to {effective_tier}: completion_time={project.get('total_completion_time', 0)}, creation_time={project.get('total_creation_hours', 0)}")
        
        return quality_tier_data
    
    # Test with different scenarios
    print("\n🧪 Test Scenario 1: Projects with different quality tiers")
    print("-" * 50)
    
    folders = [
        {'id': 1, 'name': 'Folder 1', 'quality_tier': 'interactive'}
    ]
    
    folder_projects = {
        1: [
            {'id': 1, 'title': 'Basic Project', 'quality_tier': 'basic', 'total_completion_time': 60, 'total_creation_hours': 120},
            {'id': 2, 'title': 'Interactive Project', 'quality_tier': 'interactive', 'total_completion_time': 120, 'total_creation_hours': 300},
            {'id': 3, 'title': 'Advanced Project', 'quality_tier': 'advanced', 'total_completion_time': 180, 'total_creation_hours': 720},
            {'id': 4, 'title': 'Immersive Project', 'quality_tier': 'immersive', 'total_completion_time': 240, 'total_creation_hours': 1200},
        ]
    }
    
    unassigned_projects = []
    
    result = calculate_quality_tier_sums(folders, folder_projects, unassigned_projects)
    
    print(f"\n📊 Result:")
    for tier, data in result.items():
        print(f"  {tier}: completion_time={data['completion_time']}, creation_time={data['creation_time']}")
    
    print("\n🧪 Test Scenario 2: Projects with legacy quality tiers")
    print("-" * 50)
    
    folders = [
        {'id': 1, 'name': 'Folder 1', 'quality_tier': 'medium'}
    ]
    
    folder_projects = {
        1: [
            {'id': 1, 'title': 'Starter Project', 'quality_tier': 'starter', 'total_completion_time': 60, 'total_creation_hours': 120},
            {'id': 2, 'title': 'Medium Project', 'quality_tier': 'medium', 'total_completion_time': 120, 'total_creation_hours': 300},
            {'id': 3, 'title': 'Professional Project', 'quality_tier': 'professional', 'total_completion_time': 180, 'total_creation_hours': 720},
        ]
    }
    
    result = calculate_quality_tier_sums(folders, folder_projects, unassigned_projects)
    
    print(f"\n📊 Result:")
    for tier, data in result.items():
        print(f"  {tier}: completion_time={data['completion_time']}, creation_time={data['creation_time']}")
    
    print("\n🧪 Test Scenario 3: Projects without quality_tier (should default to interactive)")
    print("-" * 50)
    
    folders = [
        {'id': 1, 'name': 'Folder 1', 'quality_tier': 'interactive'}
    ]
    
    folder_projects = {
        1: [
            {'id': 1, 'title': 'No Tier Project 1', 'quality_tier': None, 'total_completion_time': 60, 'total_creation_hours': 120},
            {'id': 2, 'title': 'No Tier Project 2', 'quality_tier': '', 'total_completion_time': 120, 'total_creation_hours': 300},
            {'id': 3, 'title': 'No Tier Project 3', 'quality_tier': 'unknown', 'total_completion_time': 180, 'total_creation_hours': 720},
        ]
    }
    
    result = calculate_quality_tier_sums(folders, folder_projects, unassigned_projects)
    
    print(f"\n📊 Result:")
    for tier, data in result.items():
        print(f"  {tier}: completion_time={data['completion_time']}, creation_time={data['creation_time']}")
    
    print("\n🔍 Possible Issues:")
    print("1. Projects might not have quality_tier set in database")
    print("2. quality_tier values might be different than expected")
    print("3. Data might not be passed correctly to the function")
    print("4. Legacy tier mapping might not be working")
    
    print("\n💡 Recommendations:")
    print("1. Check database for actual quality_tier values")
    print("2. Add more logging to see what data is being processed")
    print("3. Verify that projects have correct quality_tier values")
    print("4. Test with real data from the application")

if __name__ == "__main__":
    debug_quality_tier_issue() 