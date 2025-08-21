#!/usr/bin/env python3
"""
Test script to simulate frontend data processing
"""

def test_frontend_data_processing():
    """Test frontend data processing logic"""
    
    print("🧪 Testing Frontend Data Processing")
    print("=" * 60)
    
    # Simulate the data that would come from the API
    mock_api_response = {
        'projects': [
            {
                'id': 1,
                'title': 'Basic Course',
                'quality_tier': 'basic',
                'total_completion_time': 60,
                'total_creation_hours': 120,
            },
            {
                'id': 2,
                'title': 'Interactive Course',
                'quality_tier': 'interactive',
                'total_completion_time': 120,
                'total_creation_hours': 300,
            },
            {
                'id': 3,
                'title': 'Advanced Course',
                'quality_tier': 'advanced',
                'total_completion_time': 180,
                'total_creation_hours': 720,
            },
            {
                'id': 4,
                'title': 'Immersive Course',
                'quality_tier': 'immersive',
                'total_completion_time': 240,
                'total_creation_hours': 1200,
            },
            {
                'id': 5,
                'title': 'No Tier Course',
                'quality_tier': None,
                'total_completion_time': 90,
                'total_creation_hours': 225,
            }
        ]
    }
    
    # Simulate frontend processing logic
    def getEffectiveQualityTier(project, folderQualityTier='interactive'):
        if project.get('quality_tier'):
            tier = project['quality_tier'].lower()
            tierMapping = {
                'basic': 'basic',
                'interactive': 'interactive',
                'advanced': 'advanced',
                'immersive': 'immersive',
                'starter': 'basic',
                'medium': 'interactive',
                'professional': 'immersive'
            }
            return tierMapping.get(tier, 'interactive')
        return 'interactive'
    
    # Initialize quality tier sums
    qualityTierSums = {
        'basic': {'completionTime': 0, 'creationTime': 0},
        'interactive': {'completionTime': 0, 'creationTime': 0},
        'advanced': {'completionTime': 0, 'creationTime': 0},
        'immersive': {'completionTime': 0, 'creationTime': 0}
    }
    
    # Process projects
    allProjects = mock_api_response['projects']
    print(f"📊 Processing {len(allProjects)} projects")
    
    for project in allProjects:
        effectiveTier = getEffectiveQualityTier(project, 'interactive')
        print(f"📄 Project {project['id']}: quality_tier={project['quality_tier']}, effective_tier={effectiveTier}")
        
        qualityTierSums[effectiveTier]['completionTime'] += project['total_completion_time'] or 0
        qualityTierSums[effectiveTier]['creationTime'] += project['total_creation_hours'] or 0
    
    print(f"\n📊 Final quality tier sums:")
    for tier, data in qualityTierSums.items():
        print(f"  {tier}: completionTime={data['completionTime']}, creationTime={data['creationTime']}")
    
    # Test with different scenarios
    print(f"\n🧪 Test Scenario: All projects with same tier")
    mock_same_tier_response = {
        'projects': [
            {'id': 1, 'title': 'Project 1', 'quality_tier': 'interactive', 'total_completion_time': 60, 'total_creation_hours': 120},
            {'id': 2, 'title': 'Project 2', 'quality_tier': 'interactive', 'total_completion_time': 120, 'total_creation_hours': 300},
            {'id': 3, 'title': 'Project 3', 'quality_tier': 'interactive', 'total_completion_time': 180, 'total_creation_hours': 720},
        ]
    }
    
    qualityTierSums2 = {
        'basic': {'completionTime': 0, 'creationTime': 0},
        'interactive': {'completionTime': 0, 'creationTime': 0},
        'advanced': {'completionTime': 0, 'creationTime': 0},
        'immersive': {'completionTime': 0, 'creationTime': 0}
    }
    
    for project in mock_same_tier_response['projects']:
        effectiveTier = getEffectiveQualityTier(project, 'interactive')
        qualityTierSums2[effectiveTier]['completionTime'] += project['total_completion_time'] or 0
        qualityTierSums2[effectiveTier]['creationTime'] += project['total_creation_hours'] or 0
    
    print(f"📊 Same tier result:")
    for tier, data in qualityTierSums2.items():
        print(f"  {tier}: completionTime={data['completionTime']}, creationTime={data['creationTime']}")

if __name__ == "__main__":
    test_frontend_data_processing() 