#!/usr/bin/env python3
"""
Debug script to check analytics data in the database
"""

import asyncio
import asyncpg
import os
from typing import Dict, Any

# Test user ID - replace with a real user ID from your database
TEST_USER_ID = "test_user_123"  # Change this to a real user ID

async def debug_database_data():
    """Debug what data is actually in the database"""
    
    # Database connection
    database_url = os.getenv("CUSTOM_PROJECTS_DATABASE_URL")
    if not database_url:
        print("❌ CUSTOM_PROJECTS_DATABASE_URL not set")
        return
    
    try:
        pool = await asyncpg.create_pool(database_url)
        
        async with pool.acquire() as conn:
            print("🔍 Debugging Database Data")
            print("=" * 50)
            
            # 1. Check if user exists and has projects
            print("\n1. Checking user projects:")
            user_projects_query = """
                SELECT COUNT(*) as project_count, 
                       COUNT(DISTINCT p.folder_id) as folder_count
                FROM projects p
                WHERE p.onyx_user_id = $1
            """
            user_stats = await conn.fetchrow(user_projects_query, TEST_USER_ID)
            print(f"   User {TEST_USER_ID}: {user_stats['project_count']} projects, {user_stats['folder_count']} folders")
            
            # 2. Check design templates
            print("\n2. Checking design templates:")
            templates_query = """
                SELECT dt.id, dt.component_name, dt.template_name, COUNT(p.id) as project_count
                FROM design_templates dt
                LEFT JOIN projects p ON dt.id = p.design_template_id AND p.onyx_user_id = $1
                GROUP BY dt.id, dt.component_name, dt.template_name
                ORDER BY project_count DESC
            """
            templates = await conn.fetch(templates_query, TEST_USER_ID)
            print(f"   Found {len(templates)} design templates:")
            for template in templates:
                print(f"     - {template['component_name']} ({template['template_name']}): {template['project_count']} projects")
            
            # 3. Check projects with their component names
            print("\n3. Checking projects with component names:")
            projects_query = """
                SELECT p.id, p.project_name, dt.component_name, dt.template_name
                FROM projects p
                LEFT JOIN design_templates dt ON p.design_template_id = dt.id
                WHERE p.onyx_user_id = $1
                ORDER BY p.created_at DESC
                LIMIT 10
            """
            projects = await conn.fetch(projects_query, TEST_USER_ID)
            print(f"   Recent projects for user {TEST_USER_ID}:")
            for project in projects:
                print(f"     - {project['project_name']} -> {project['component_name']} ({project['template_name']})")
            
            # 4. Check if projects have microproduct_content
            print("\n4. Checking microproduct_content:")
            content_query = """
                SELECT 
                    COUNT(*) as total_projects,
                    COUNT(CASE WHEN microproduct_content IS NOT NULL THEN 1 END) as with_content,
                    COUNT(CASE WHEN microproduct_content->>'sections' IS NOT NULL THEN 1 END) as with_sections
                FROM projects
                WHERE onyx_user_id = $1
            """
            content_stats = await conn.fetchrow(content_query, TEST_USER_ID)
            print(f"   Content stats: {content_stats['total_projects']} total, {content_stats['with_content']} with content, {content_stats['with_sections']} with sections")
            
            # 5. Check quality tiers in projects
            print("\n5. Checking quality tiers:")
            quality_query = """
                SELECT quality_tier, COUNT(*) as count
                FROM projects
                WHERE onyx_user_id = $1 AND quality_tier IS NOT NULL
                GROUP BY quality_tier
                ORDER BY count DESC
            """
            quality_stats = await conn.fetch(quality_query, TEST_USER_ID)
            print(f"   Project quality tiers:")
            for stat in quality_stats:
                print(f"     - {stat['quality_tier']}: {stat['count']}")
            
            # 6. Check if there are any lessons with quality tiers
            print("\n6. Checking lessons with quality tiers:")
            lesson_quality_query = """
                SELECT 
                    COUNT(*) as total_lessons,
                    COUNT(CASE WHEN lesson->>'quality_tier' IS NOT NULL THEN 1 END) as with_quality_tier
                FROM projects p
                CROSS JOIN LATERAL jsonb_array_elements(p.microproduct_content->'sections') AS section
                CROSS JOIN LATERAL jsonb_array_elements(section->'lessons') AS lesson
                WHERE p.onyx_user_id = $1
                AND p.microproduct_content IS NOT NULL
                AND p.microproduct_content->>'sections' IS NOT NULL
            """
            try:
                lesson_stats = await conn.fetchrow(lesson_quality_query, TEST_USER_ID)
                print(f"   Lesson quality stats: {lesson_stats['total_lessons']} total lessons, {lesson_stats['with_quality_tier']} with quality tier")
            except Exception as e:
                print(f"   Error checking lesson quality: {e}")
            
            # 7. Test the exact product distribution query
            print("\n7. Testing product distribution query:")
            product_query = """
                SELECT dt.component_name, COUNT(*) as count
                FROM projects p
                LEFT JOIN design_templates dt ON p.design_template_id = dt.id
                WHERE p.onyx_user_id = $1
                GROUP BY dt.component_name 
                ORDER BY count DESC
            """
            product_rows = await conn.fetch(product_query, TEST_USER_ID)
            print(f"   Product distribution results:")
            for row in product_rows:
                print(f"     - {row['component_name']}: {row['count']}")
            
            # 8. Test the exact quality distribution query
            print("\n8. Testing quality distribution query:")
            quality_dist_query = """
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
            try:
                quality_dist_rows = await conn.fetch(quality_dist_query, TEST_USER_ID)
                print(f"   Quality distribution results:")
                for row in quality_dist_rows:
                    print(f"     - {row['quality_tier']}: {row['count']}")
            except Exception as e:
                print(f"   Error in quality distribution query: {e}")
                
    except Exception as e:
        print(f"❌ Error debugging database: {e}")
    finally:
        if 'pool' in locals():
            await pool.close()

async def main():
    """Run debug"""
    print("🐛 Debugging Analytics Data")
    print("=" * 50)
    print(f"Using test user ID: {TEST_USER_ID}")
    print("⚠️  Make sure to change TEST_USER_ID to a real user ID from your database!")
    
    await debug_database_data()
    
    print("\n✅ Debug completed!")

if __name__ == "__main__":
    asyncio.run(main()) 