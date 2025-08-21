#!/usr/bin/env python3
"""
Test script to check API endpoint /api/custom/projects
"""

import requests
import json
import sys

def test_api_endpoint():
    """Test the /api/custom/projects endpoint"""
    
    print("🧪 Testing API Endpoint /api/custom/projects")
    print("=" * 60)
    
    # API endpoint URL (adjust as needed)
    base_url = "http://localhost:8000"  # Default FastAPI port
    endpoint = "/api/custom/projects"
    
    try:
        # Make request to the endpoint
        print(f"🌐 Making request to: {base_url}{endpoint}")
        
        # You might need to add authentication headers here
        headers = {
            "Content-Type": "application/json",
            # Add any required auth headers
        }
        
        response = requests.get(f"{base_url}{endpoint}", headers=headers, timeout=10)
        
        print(f"📊 Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Received {len(data)} projects")
            
            # Analyze quality tier distribution
            quality_tier_counts = {}
            projects_with_quality_tier = []
            
            for project in data:
                quality_tier = project.get('quality_tier')
                if quality_tier:
                    quality_tier_counts[quality_tier] = quality_tier_counts.get(quality_tier, 0) + 1
                    projects_with_quality_tier.append({
                        'id': project['id'],
                        'project_name': project.get('project_name'),
                        'microproduct_name': project.get('microproduct_name'),
                        'quality_tier': quality_tier,
                        'total_completion_time': project.get('total_completion_time'),
                        'total_creation_hours': project.get('total_creation_hours')
                    })
            
            print(f"\n📋 Quality Tier Distribution:")
            for tier, count in quality_tier_counts.items():
                print(f"  {tier}: {count} projects")
            
            print(f"\n📄 Sample Projects with Quality Tier Data:")
            for project in projects_with_quality_tier[:5]:  # Show first 5
                print(f"  Project {project['id']}: {project['project_name'] or project['microproduct_name']} - {project['quality_tier']} (completion: {project['total_completion_time']}, creation: {project['total_creation_hours']})")
            
            if len(projects_with_quality_tier) > 5:
                print(f"  ... and {len(projects_with_quality_tier) - 5} more")
            
            # Test quality tier mapping logic
            print(f"\n🔧 Testing Quality Tier Mapping Logic:")
            
            def get_effective_quality_tier(quality_tier: str) -> str:
                """Same mapping logic as frontend"""
                if not quality_tier:
                    return 'interactive'
                
                tier = quality_tier.lower()
                tier_mapping = {
                    # New tier names
                    'basic': 'basic',
                    'interactive': 'interactive',
                    'advanced': 'advanced',
                    'immersive': 'immersive',
                    # Old tier names (legacy support)
                    'starter': 'basic',
                    'medium': 'interactive',
                    'professional': 'immersive'
                }
                return tier_mapping.get(tier, 'interactive')
            
            # Test mapping for each found quality tier
            for tier in quality_tier_counts.keys():
                effective_tier = get_effective_quality_tier(tier)
                print(f"  '{tier}' -> '{effective_tier}'")
            
            # Simulate frontend calculation
            print(f"\n🧮 Simulating Frontend Calculation:")
            
            quality_tier_sums = {
                'basic': {'completion_time': 0, 'creation_time': 0},
                'interactive': {'completion_time': 0, 'creation_time': 0},
                'advanced': {'completion_time': 0, 'creation_time': 0},
                'immersive': {'completion_time': 0, 'creation_time': 0}
            }
            
            for project in projects_with_quality_tier:
                effective_tier = get_effective_quality_tier(project['quality_tier'])
                completion_time = project['total_completion_time'] or 0
                creation_time = project['total_creation_hours'] or 0
                
                quality_tier_sums[effective_tier]['completion_time'] += completion_time
                quality_tier_sums[effective_tier]['creation_time'] += creation_time
            
            print(f"📊 Simulated Quality Tier Sums:")
            for tier, data in quality_tier_sums.items():
                print(f"  {tier}: {data['completion_time']}m completion, {data['creation_time']}m creation")
            
            # Check if we have data for all tiers
            tiers_with_data = [tier for tier, data in quality_tier_sums.items() if data['completion_time'] > 0 or data['creation_time'] > 0]
            print(f"\n🎯 Tiers with data: {tiers_with_data}")
            
            if len(tiers_with_data) < 4:
                print("⚠️  Warning: Not all quality tiers have data!")
                print("   This might explain why only some tiers show in Block 2")
            else:
                print("✅ All quality tiers have data - Block 2 should show all tiers")
            
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error: Could not connect to the API")
        print("💡 Make sure the backend is running on the correct port")
    except requests.exceptions.Timeout:
        print("❌ Timeout error: Request took too long")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_api_endpoint() 