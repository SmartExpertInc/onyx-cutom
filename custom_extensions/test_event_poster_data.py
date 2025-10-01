#!/usr/bin/env python3

import asyncio
import asyncpg
import json
import os

async def test_event_poster_data():
    """Test what's actually stored in the database for the event poster"""
    
    # Database connection
    database_url = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/onyx_dev")
    
    try:
        conn = await asyncpg.connect(database_url)
        
        # Query the specific project
        project_id = 20
        query = """
        SELECT 
            id, project_name, product_type, microproduct_type, microproduct_name,
            microproduct_content, design_template_id, created_at,
            is_standalone
        FROM projects 
        WHERE id = $1
        """
        
        row = await conn.fetchrow(query, project_id)
        
        if row:
            print(f"🔍 Project {project_id} found in database:")
            print(f"  - ID: {row['id']}")
            print(f"  - Project Name: {row['project_name']}")
            print(f"  - Product Type: {row['product_type']}")
            print(f"  - Microproduct Type: {row['microproduct_type']}")
            print(f"  - Microproduct Name: {row['microproduct_name']}")
            print(f"  - Design Template ID: {row['design_template_id']}")
            print(f"  - Is Standalone: {row['is_standalone']}")
            print(f"  - Created At: {row['created_at']}")
            print(f"  - Microproduct Content Type: {type(row['microproduct_content'])}")
            
            content = row['microproduct_content']
            if content:
                print(f"  - Microproduct Content:")
                if isinstance(content, str):
                    try:
                        parsed = json.loads(content)
                        print(f"    📄 Parsed JSON: {json.dumps(parsed, indent=4, ensure_ascii=False)}")
                    except Exception as e:
                        print(f"    ❌ Failed to parse as JSON: {e}")
                        print(f"    📄 Raw string: {content[:500]}...")
                else:
                    print(f"    📄 Direct object: {json.dumps(content, indent=4, ensure_ascii=False)}")
            else:
                print(f"  - ❌ No microproduct_content found!")
                
        else:
            print(f"❌ Project {project_id} not found in database")
            
        # Also check design_templates table for context
        template_query = """
        SELECT id, template_name, component_name, microproduct_type
        FROM design_templates 
        WHERE id = $1
        """
        
        template_row = await conn.fetchrow(template_query, 1)  # Template ID 1 from the project
        if template_row:
            print(f"\n🎨 Design Template {template_row['id']}:")
            print(f"  - Template Name: {template_row['template_name']}")
            print(f"  - Component Name: {template_row['component_name']}")
            print(f"  - Microproduct Type: {template_row['microproduct_type']}")
        
        await conn.close()
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_event_poster_data()) 