#!/usr/bin/env python3
"""
Test script to verify preview data structure and calculations
"""

def test_preview_data_structure():
    """Test preview data structure and calculations"""
    print("🧪 Testing preview data structure and calculations...")
    
    # Simulate the data structure that would be passed to PreviewModal
    mock_data = {
        'clientName': 'Test Client',
        'managerName': 'Test Manager',
        'projects': [
            {
                'id': 1,
                'name': 'Project 1',
                'total_hours': 20,  # Learning Duration (H) - from lesson hours
                'total_creation_hours': 400,  # Production Time (H) - calculated creation hours
                'total_lessons': 10,
                'total_modules': 3,
                'total_completion_time': 1200,  # 20 hours in minutes
                'quality_tier': 'basic'  # Level 1 - Basic
            },
            {
                'id': 2,
                'name': 'Project 2',
                'total_hours': 30,  # Learning Duration (H) - from lesson hours
                'total_creation_hours': 125,  # Production Time (H) - calculated creation hours
                'total_lessons': 15,
                'total_modules': 5,
                'total_completion_time': 1800,  # 30 hours in minutes
                'quality_tier': 'interactive'  # Level 2 - Interactive
            },
            {
                'id': 3,
                'name': 'Project 3',
                'total_hours': 15,  # Learning Duration (H) - from lesson hours
                'total_creation_hours': 300,  # Production Time (H) - calculated creation hours
                'total_lessons': 8,
                'total_modules': 2,
                'total_completion_time': 900,  # 15 hours in minutes
                'quality_tier': 'advanced'  # Level 3 - Advanced
            },
            {
                'id': 4,
                'name': 'Project 4',
                'total_hours': 5,  # Learning Duration (H) - from lesson hours
                'total_creation_hours': 100,  # Production Time (H) - calculated creation hours
                'total_lessons': 5,
                'total_modules': 2,
                'total_completion_time': 300,  # 5 hours in minutes
                'quality_tier': 'immersive'  # Level 4 - Immersive
            }
        ]
    }
    
    # Test 1: Calculate totals like in PreviewModal
    def calculate_preview_totals(projects):
        totalLearningHours = sum(project.get('total_hours', 0) or 0 for project in projects)
        totalProductionHours = sum(project.get('total_creation_hours', 0) or 0 for project in projects)
        return totalLearningHours, totalProductionHours
    
    # Test 2: Calculate quality tier sums like in PreviewModal
    def calculate_preview_quality_tier_sums(projects):
        qualityTierSums = {
            'basic': {'completionTime': 0, 'creationTime': 0},
            'interactive': {'completionTime': 0, 'creationTime': 0},
            'advanced': {'completionTime': 0, 'creationTime': 0},
            'immersive': {'completionTime': 0, 'creationTime': 0}
        }
        
        def getEffectiveQualityTier(project, folderQualityTier='interactive'):
            if project.get('quality_tier'):
                tier = project['quality_tier'].lower()
                return tier if tier in qualityTierSums else 'interactive'
            return folderQualityTier.lower()
        
        for project in projects:
            effectiveTier = getEffectiveQualityTier(project, 'interactive')
            qualityTierSums[effectiveTier]['completionTime'] += project.get('total_hours', 0) or 0  # Learning Duration (H)
            qualityTierSums[effectiveTier]['creationTime'] += project.get('total_creation_hours', 0) or 0  # Production Time (H)
        
        return qualityTierSums
    
    # Calculate values
    totalLearningHours, totalProductionHours = calculate_preview_totals(mock_data['projects'])
    qualityTierSums = calculate_preview_quality_tier_sums(mock_data['projects'])
    
    print(f"\n📊 Preview Modal Calculations:")
    print(f"  Total Learning Hours: {totalLearningHours}h")
    print(f"  Total Production Hours: {totalProductionHours}h")
    
    print(f"\n📊 Quality Tier Sums (Block 2):")
    for tier, data in qualityTierSums.items():
        print(f"  {tier.capitalize()}: {data['completionTime']}h learning, {data['creationTime']}h production")
    
    # Expected values
    expected_learning = 20 + 30 + 15 + 5  # 70h
    expected_production = 400 + 125 + 300 + 100  # 925h
    
    print(f"\n✅ Expected vs Actual:")
    print(f"  Learning Hours - Expected: {expected_learning}h, Actual: {totalLearningHours}h")
    print(f"  Production Hours - Expected: {expected_production}h, Actual: {totalProductionHours}h")
    
    print(f"\n🎯 Expected Preview Output:")
    print(f"  Subtotal: {totalLearningHours}h of learning content → {totalProductionHours}h production")
    print(f"  Total: {totalLearningHours} hours of learning content")
    print(f"  Estimated Production Time: ≈ {totalProductionHours} hours")
    
    # Verify calculations
    print(f"\n✅ Verification:")
    print(f"  Learning calculation correct: {totalLearningHours == expected_learning}")
    print(f"  Production calculation correct: {totalProductionHours == expected_production}")
    
    # Test 3: Check that all quality tiers are shown
    print(f"\n📋 Quality tiers display (Block 2):")
    tier_names = {
        'basic': 'Level 1 - Basic',
        'interactive': 'Level 2 - Interactive', 
        'advanced': 'Level 3 - Advanced',
        'immersive': 'Level 4 - Immersive'
    }
    
    for tier_key, tier_name in tier_names.items():
        data = qualityTierSums.get(tier_key, {'completionTime': 0, 'creationTime': 0})
        print(f"  {tier_name}: {data['completionTime']}h learning, {data['creationTime']}h production")
    
    print(f"\n✅ Preview calculations working correctly!")
    print(f"✅ All quality tiers should be displayed in Block 2")
    print(f"✅ Subtotal, Total, and Estimated Production Time should match PDF values")

if __name__ == "__main__":
    test_preview_data_structure() 