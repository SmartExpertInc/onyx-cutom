#!/usr/bin/env python3
"""
Test script for the new analytics endpoints
"""

import asyncio
import asyncpg
import os
from typing import Dict, Any

# Mock user ID for testing
TEST_USER_ID = "test_user_123"

async def test_product_distribution():
    """Test the product distribution endpoint logic"""
    
    # Database connection
    database_url = os.getenv("CUSTOM_PROJECTS_DATABASE_URL")
    if not database_url:
        print("❌ CUSTOM_PROJECTS_DATABASE_URL not set")
        return
    
    try:
        pool = await asyncpg.create_pool(database_url)
        
        async with pool.acquire() as conn:
            # Test product distribution query
            query = """
                SELECT dt.component_name, COUNT(*) as count
                FROM projects p
                LEFT JOIN design_templates dt ON p.design_template_id = dt.id
                WHERE p.onyx_user_id = $1
                GROUP BY dt.component_name 
                ORDER BY count DESC
            """
            
            rows = await conn.fetch(query, TEST_USER_ID)
            print(f"📊 Product distribution query returned {len(rows)} component types")
            
            for row in rows:
                print(f"  - {row['component_name']}: {row['count']}")
                
    except Exception as e:
        print(f"❌ Error testing product distribution: {e}")
    finally:
        if 'pool' in locals():
            await pool.close()

async def test_quality_distribution():
    """Test the quality distribution endpoint logic"""
    
    # Database connection
    database_url = os.getenv("CUSTOM_PROJECTS_DATABASE_URL")
    if not database_url:
        print("❌ CUSTOM_PROJECTS_DATABASE_URL not set")
        return
    
    try:
        pool = await asyncpg.create_pool(database_url)
        
        async with pool.acquire() as conn:
            # Test quality distribution query
            query = """
                WITH lesson_quality_tiers AS (
                    SELECT 
                        COALESCE(
                            lesson->>'quality_tier',
                            section->>'quality_tier', 
                            p.quality_tier,
                            pf.quality_tier,
                            'interactive'
                        ) as effective_quality_tier
                    FROM projects p
                    LEFT JOIN project_folders pf ON p.folder_id = pf.id
                    CROSS JOIN LATERAL jsonb_array_elements(p.microproduct_content->'sections') AS section
                    CROSS JOIN LATERAL jsonb_array_elements(section->'lessons') AS lesson
                    WHERE p.onyx_user_id = $1
                    AND p.microproduct_content IS NOT NULL
                    AND p.microproduct_content->>'sections' IS NOT NULL
                )
                SELECT 
                    LOWER(effective_quality_tier) as quality_tier,
                    COUNT(*) as count
                FROM lesson_quality_tiers
                GROUP BY LOWER(effective_quality_tier)
                ORDER BY count DESC
            """
            
            rows = await conn.fetch(query, TEST_USER_ID)
            print(f"📊 Quality distribution query returned {len(rows)} quality tiers")
            
            for row in rows:
                print(f"  - {row['quality_tier']}: {row['count']}")
                
    except Exception as e:
        print(f"❌ Error testing quality distribution: {e}")
    finally:
        if 'pool' in locals():
            await pool.close()

async def main():
    """Run all tests"""
    print("🧪 Testing Analytics Endpoints")
    print("=" * 50)
    
    print("\n1. Testing Product Distribution:")
    await test_product_distribution()
    
    print("\n2. Testing Quality Distribution:")
    await test_quality_distribution()
    
    print("\n✅ Tests completed!")

if __name__ == "__main__":
    asyncio.run(main()) 