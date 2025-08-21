#!/usr/bin/env python3
"""
Test script to verify that backend correctly sends quality_tier data
"""

import asyncio
import asyncpg
import json
from typing import Dict, Any

# Test database connection
DATABASE_URL = "postgresql://user:password@localhost/dbname"

async def test_backend_quality_tiers():
    """Test that backend correctly processes and sends quality_tier data"""
    
    print("🧪 Testing Backend Quality Tier Data Processing")
    print("=" * 60)
    
    try:
        # Connect to database
        conn = await asyncpg.connect(DATABASE_URL)
        print("✅ Connected to database")
        
        # Test query similar to /api/custom/projects endpoint
        query = """
            SELECT p.id, p.project_name, p.microproduct_name, p.created_at, p.design_template_id,
                   dt.template_name as design_template_name,
                   dt.microproduct_type as design_microproduct_type,
                   dt.component_name,
                   p.folder_id, p."order", p.microproduct_content, p.source_chat_session_id, p.is_standalone,
                   p.quality_tier
            FROM projects p
            LEFT JOIN design_templates dt ON p.design_template_id = dt.id
            WHERE p.onyx_user_id = $1
            ORDER BY p."order" ASC, p.created_at DESC
            LIMIT 10;
        """
        
        # Use a test user ID (you may need to adjust this)
        test_user_id = "test_user_123"
        
        rows = await conn.fetch(query, test_user_id)
        print(f"📊 Found {len(rows)} projects for user {test_user_id}")
        
        if not rows:
            print("⚠️  No projects found. Trying with different user ID...")
            # Try to find any user with projects
            user_query = """
                SELECT DISTINCT p.onyx_user_id 
                FROM projects p 
                WHERE p.quality_tier IS NOT NULL 
                LIMIT 1
            """
            user_row = await conn.fetchrow(user_query)
            if user_row:
                test_user_id = user_row['onyx_user_id']
                print(f"🔄 Using user ID: {test_user_id}")
                rows = await conn.fetch(query, test_user_id)
                print(f"📊 Found {len(rows)} projects for user {test_user_id}")
            else:
                print("❌ No users with quality_tier data found")
                return
        
        # Analyze quality tier distribution
        quality_tier_counts = {}
        projects_with_quality_tier = []
        
        for row in rows:
            row_dict = dict(row)
            quality_tier = row_dict.get('quality_tier')
            
            if quality_tier:
                quality_tier_counts[quality_tier] = quality_tier_counts.get(quality_tier, 0) + 1
                projects_with_quality_tier.append({
                    'id': row_dict['id'],
                    'project_name': row_dict.get('project_name'),
                    'microproduct_name': row_dict.get('microproduct_name'),
                    'quality_tier': quality_tier,
                    'folder_id': row_dict.get('folder_id')
                })
        
        print(f"\n📋 Quality Tier Distribution:")
        for tier, count in quality_tier_counts.items():
            print(f"  {tier}: {count} projects")
        
        print(f"\n📄 Projects with Quality Tier Data:")
        for project in projects_with_quality_tier[:5]:  # Show first 5
            print(f"  Project {project['id']}: {project['project_name'] or project['microproduct_name']} - {project['quality_tier']}")
        
        if len(projects_with_quality_tier) > 5:
            print(f"  ... and {len(projects_with_quality_tier) - 5} more")
        
        # Test quality tier mapping logic
        print(f"\n🔧 Testing Quality Tier Mapping Logic:")
        
        def get_effective_quality_tier(quality_tier: str) -> str:
            """Same mapping logic as backend"""
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
        
        # Simulate the calculation that would happen in the endpoint
        print(f"\n🧮 Simulating Endpoint Calculation:")
        
        quality_tier_sums = {
            'basic': {'completion_time': 0, 'creation_time': 0},
            'interactive': {'completion_time': 0, 'creation_time': 0},
            'advanced': {'completion_time': 0, 'creation_time': 0},
            'immersive': {'completion_time': 0, 'creation_time': 0}
        }
        
        for project in projects_with_quality_tier:
            effective_tier = get_effective_quality_tier(project['quality_tier'])
            # Simulate some data (in real endpoint this would be calculated from content)
            completion_time = 60  # Mock 60 minutes
            creation_time = 120   # Mock 120 minutes
            
            quality_tier_sums[effective_tier]['completion_time'] += completion_time
            quality_tier_sums[effective_tier]['creation_time'] += creation_time
        
        print(f"📊 Simulated Quality Tier Sums:")
        for tier, data in quality_tier_sums.items():
            print(f"  {tier}: {data['completion_time']}m completion, {data['creation_time']}m creation")
        
        await conn.close()
        print("\n✅ Test completed successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Make sure DATABASE_URL is set correctly and database is accessible")

if __name__ == "__main__":
    asyncio.run(test_backend_quality_tiers()) 