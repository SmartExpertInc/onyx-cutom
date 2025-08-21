#!/usr/bin/env python3
"""
Test script to check real data from database
"""

import asyncio
import asyncpg
import os

async def test_real_data():
    """Test real data from database"""
    
    print("🔍 Testing Real Data from Database")
    print("=" * 60)
    
    # Database connection - try to get from environment or use default
    DATABASE_URL = os.getenv('DATABASE_URL') or os.getenv('POSTGRES_URL') or "postgresql://user:password@localhost/dbname"
    
    print(f"🔗 Using DATABASE_URL: {DATABASE_URL[:50]}..." if len(DATABASE_URL) > 50 else f"🔗 Using DATABASE_URL: {DATABASE_URL}")
    
    try:
        # Connect to database
        conn = await asyncpg.connect(DATABASE_URL)
        
        # Test query to get projects with quality_tier
        query = """
            SELECT 
                p.id,
                p.project_name,
                p.microproduct_name,
                p.quality_tier,
                p.folder_id,
                p.onyx_user_id
            FROM projects p
            WHERE p.deleted_at IS NULL
            AND p.quality_tier IS NOT NULL
            ORDER BY p.created_at DESC
            LIMIT 10
        """
        
        rows = await conn.fetch(query)
        
        print(f"📊 Found {len(rows)} projects with quality_tier")
        
        if len(rows) == 0:
            print("❌ No projects found with quality_tier")
            
            # Check if there are any projects at all
            all_projects_query = """
                SELECT COUNT(*) as total_projects,
                       COUNT(quality_tier) as projects_with_quality_tier,
                       COUNT(CASE WHEN quality_tier IS NULL THEN 1 END) as projects_without_quality_tier
                FROM projects
                WHERE deleted_at IS NULL
            """
            
            stats = await conn.fetchrow(all_projects_query)
            print(f"📈 Project statistics:")
            print(f"   Total projects: {stats['total_projects']}")
            print(f"   Projects with quality_tier: {stats['projects_with_quality_tier']}")
            print(f"   Projects without quality_tier: {stats['projects_without_quality_tier']}")
            
            # Check unique quality_tier values
            unique_tiers_query = """
                SELECT DISTINCT quality_tier, COUNT(*) as count
                FROM projects
                WHERE deleted_at IS NULL AND quality_tier IS NOT NULL
                GROUP BY quality_tier
                ORDER BY count DESC
            """
            
            unique_tiers = await conn.fetch(unique_tiers_query)
            print(f"🎯 Unique quality_tier values:")
            for tier in unique_tiers:
                print(f"   {tier['quality_tier']}: {tier['count']} projects")
        else:
            print("✅ Projects with quality_tier found:")
            for i, row in enumerate(rows):
                print(f"  {i+1}. ID: {row['id']}, Title: {row['project_name'] or row['microproduct_name']}, Quality Tier: {row['quality_tier']}, Folder: {row['folder_id']}")
        
        # Test quality tier mapping
        print(f"\n🧪 Testing Quality Tier Mapping:")
        tier_mapping = {
            'basic': 'basic',
            'interactive': 'interactive', 
            'advanced': 'advanced',
            'immersive': 'immersive',
            'starter': 'basic',
            'medium': 'interactive',
            'professional': 'immersive'
        }
        
        for row in rows[:5]:  # Test first 5 projects
            original_tier = row['quality_tier']
            if original_tier:
                mapped_tier = tier_mapping.get(original_tier.lower(), 'interactive')
                print(f"  {original_tier} -> {mapped_tier}")
            else:
                print(f"  None -> interactive (default)")
        
        await conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Make sure DATABASE_URL is set correctly in your environment")

if __name__ == "__main__":
    asyncio.run(test_real_data()) 