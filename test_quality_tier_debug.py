#!/usr/bin/env python3
"""
Test script to debug quality tier data flow
"""

def test_quality_tier_data_flow():
    """Test the complete data flow for quality tiers"""
    
    print("🔍 Testing Quality Tier Data Flow")
    print("=" * 60)
    
    # Simulate what might be happening in the database
    print("📊 Simulating Database Data:")
    
    # Scenario 1: All projects have quality_tier set
    scenario1 = [
        {'id': 1, 'title': 'Basic Course', 'quality_tier': 'basic', 'completion_time': 60, 'creation_hours': 120},
        {'id': 2, 'title': 'Interactive Course', 'quality_tier': 'interactive', 'completion_time': 120, 'creation_hours': 300},
        {'id': 3, 'title': 'Advanced Course', 'quality_tier': 'advanced', 'completion_time': 180, 'creation_hours': 720},
        {'id': 4, 'title': 'Immersive Course', 'quality_tier': 'immersive', 'completion_time': 240, 'creation_hours': 1200},
    ]
    
    print("✅ Scenario 1: All projects have quality_tier")
    for project in scenario1:
        print(f"  Project {project['id']}: quality_tier='{project['quality_tier']}'")
    
    # Scenario 2: Some projects have NULL quality_tier
    scenario2 = [
        {'id': 1, 'title': 'Basic Course', 'quality_tier': 'basic', 'completion_time': 60, 'creation_hours': 120},
        {'id': 2, 'title': 'Interactive Course', 'quality_tier': 'interactive', 'completion_time': 120, 'creation_hours': 300},
        {'id': 3, 'title': 'Advanced Course', 'quality_tier': None, 'completion_time': 180, 'creation_hours': 720},
        {'id': 4, 'title': 'Immersive Course', 'quality_tier': None, 'completion_time': 240, 'creation_hours': 1200},
    ]
    
    print("\n❌ Scenario 2: Some projects have NULL quality_tier")
    for project in scenario2:
        print(f"  Project {project['id']}: quality_tier={project['quality_tier']}")
    
    # Scenario 3: All projects have NULL quality_tier (default to interactive)
    scenario3 = [
        {'id': 1, 'title': 'Basic Course', 'quality_tier': None, 'completion_time': 60, 'creation_hours': 120},
        {'id': 2, 'title': 'Interactive Course', 'quality_tier': None, 'completion_time': 120, 'creation_hours': 300},
        {'id': 3, 'title': 'Advanced Course', 'quality_tier': None, 'completion_time': 180, 'creation_hours': 720},
        {'id': 4, 'title': 'Immersive Course', 'quality_tier': None, 'completion_time': 240, 'creation_hours': 1200},
    ]
    
    print("\n❌ Scenario 3: All projects have NULL quality_tier (would all default to interactive)")
    for project in scenario3:
        print(f"  Project {project['id']}: quality_tier={project['quality_tier']} -> would default to 'interactive'")
    
    # Test the mapping logic
    print(f"\n🧪 Testing Quality Tier Mapping Logic:")
    
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
            return tier_mapping.get(tier, 'interactive')
        return folder_quality_tier.lower()
    
    print("📋 Testing with different scenarios:")
    
    # Test Scenario 1
    print("\n  Scenario 1 Results:")
    quality_tier_sums = {'basic': 0, 'interactive': 0, 'advanced': 0, 'immersive': 0}
    for project in scenario1:
        effective_tier = get_effective_quality_tier(project, 'interactive')
        quality_tier_sums[effective_tier] += project['completion_time']
        print(f"    Project {project['id']}: {project['quality_tier']} -> {effective_tier}")
    print(f"    Final sums: {quality_tier_sums}")
    
    # Test Scenario 2
    print("\n  Scenario 2 Results:")
    quality_tier_sums = {'basic': 0, 'interactive': 0, 'advanced': 0, 'immersive': 0}
    for project in scenario2:
        effective_tier = get_effective_quality_tier(project, 'interactive')
        quality_tier_sums[effective_tier] += project['completion_time']
        print(f"    Project {project['id']}: {project['quality_tier']} -> {effective_tier}")
    print(f"    Final sums: {quality_tier_sums}")
    
    # Test Scenario 3
    print("\n  Scenario 3 Results:")
    quality_tier_sums = {'basic': 0, 'interactive': 0, 'advanced': 0, 'immersive': 0}
    for project in scenario3:
        effective_tier = get_effective_quality_tier(project, 'interactive')
        quality_tier_sums[effective_tier] += project['completion_time']
        print(f"    Project {project['id']}: {project['quality_tier']} -> {effective_tier}")
    print(f"    Final sums: {quality_tier_sums}")
    
    print(f"\n💡 Analysis:")
    print("  - If all projects have NULL quality_tier, they all default to 'interactive'")
    print("  - This would explain why only 'interactive' shows data")
    print("  - The solution is to ensure projects have correct quality_tier values in the database")
    
    print(f"\n🔧 Recommended Actions:")
    print("  1. Check database: SELECT quality_tier, COUNT(*) FROM projects WHERE deleted_at IS NULL GROUP BY quality_tier")
    print("  2. Update projects: UPDATE projects SET quality_tier = 'basic' WHERE quality_tier IS NULL AND [condition]")
    print("  3. Verify the quality_tier values are being set correctly when projects are created")

if __name__ == "__main__":
    test_quality_tier_data_flow() 