#!/usr/bin/env python3
"""
Script to check and fix quality_tier values in database
"""

import asyncio
import asyncpg
import os

async def check_and_fix_quality_tiers():
    """Check and fix quality_tier values in database"""
    
    print("🔍 Checking and Fixing Quality Tiers in Database")
    print("=" * 60)
    
    # Database connection - try to get from environment or use default
    DATABASE_URL = os.getenv('DATABASE_URL') or os.getenv('POSTGRES_URL') or "postgresql://user:password@localhost/dbname"
    
    print(f"🔗 Using DATABASE_URL: {DATABASE_URL[:50]}..." if len(DATABASE_URL) > 50 else f"🔗 Using DATABASE_URL: {DATABASE_URL}")
    
    try:
        # Connect to database
        conn = await asyncpg.connect(DATABASE_URL)
        
        # Step 1: Check current quality_tier distribution
        print("\n📊 Step 1: Checking current quality_tier distribution")
        check_query = """
            SELECT 
                quality_tier,
                COUNT(*) as count
            FROM projects 
            WHERE deleted_at IS NULL
            GROUP BY quality_tier
            ORDER BY count DESC
        """
        
        rows = await conn.fetch(check_query)
        
        print("Current quality_tier distribution:")
        total_projects = 0
        null_count = 0
        for row in rows:
            tier = row['quality_tier'] or 'NULL'
            count = row['count']
            total_projects += count
            if tier == 'NULL':
                null_count = count
            print(f"  {tier}: {count} projects")
        
        print(f"\n📈 Summary:")
        print(f"  Total projects: {total_projects}")
        print(f"  Projects with NULL quality_tier: {null_count}")
        print(f"  Projects with quality_tier: {total_projects - null_count}")
        
        if null_count == 0:
            print("\n✅ All projects already have quality_tier set!")
            await conn.close()
            return
        
        # Step 2: Show some examples of projects with NULL quality_tier
        print(f"\n📋 Step 2: Examples of projects with NULL quality_tier")
        examples_query = """
            SELECT 
                id,
                project_name,
                microproduct_name,
                quality_tier,
                created_at
            FROM projects 
            WHERE deleted_at IS NULL AND quality_tier IS NULL
            ORDER BY created_at DESC
            LIMIT 5
        """
        
        examples = await conn.fetch(examples_query)
        
        print("Examples of projects with NULL quality_tier:")
        for i, row in enumerate(examples):
            title = row['project_name'] or row['microproduct_name'] or 'Untitled'
            print(f"  {i+1}. ID: {row['id']}, Title: '{title}', Created: {row['created_at']}")
        
        # Step 3: Ask user what to do
        print(f"\n🔧 Step 3: Fix Options")
        print("Choose an option:")
        print("  1. Set all NULL quality_tier to 'basic'")
        print("  2. Set all NULL quality_tier to 'interactive'")
        print("  3. Set all NULL quality_tier to 'advanced'")
        print("  4. Set all NULL quality_tier to 'immersive'")
        print("  5. Skip fixing (just check)")
        
        # For now, let's set them to 'basic' as a safe default
        choice = 1  # You can change this
        
        if choice == 1:
            tier_to_set = 'basic'
        elif choice == 2:
            tier_to_set = 'interactive'
        elif choice == 3:
            tier_to_set = 'advanced'
        elif choice == 4:
            tier_to_set = 'immersive'
        else:
            print("Skipping fix.")
            await conn.close()
            return
        
        print(f"\n🔧 Step 4: Setting NULL quality_tier to '{tier_to_set}'")
        
        # Update query
        update_query = """
            UPDATE projects 
            SET quality_tier = $1
            WHERE deleted_at IS NULL AND quality_tier IS NULL
        """
        
        result = await conn.execute(update_query, tier_to_set)
        print(f"✅ Updated {result.split()[-1]} projects")
        
        # Step 5: Verify the fix
        print(f"\n📊 Step 5: Verifying the fix")
        verify_query = """
            SELECT 
                quality_tier,
                COUNT(*) as count
            FROM projects 
            WHERE deleted_at IS NULL
            GROUP BY quality_tier
            ORDER BY count DESC
        """
        
        verify_rows = await conn.fetch(verify_query)
        
        print("Updated quality_tier distribution:")
        for row in verify_rows:
            tier = row['quality_tier'] or 'NULL'
            count = row['count']
            print(f"  {tier}: {count} projects")
        
        await conn.close()
        
        print(f"\n✅ Quality tier fix completed!")
        print(f"Now all projects should have proper quality_tier values.")
        print(f"Restart your application and check the Block 2 table.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Make sure DATABASE_URL is set correctly in your environment")

if __name__ == "__main__":
    asyncio.run(check_and_fix_quality_tiers()) 