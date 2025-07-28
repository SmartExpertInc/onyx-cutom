#!/usr/bin/env python3
"""
Script to fix product visibility issues by updating the is_standalone flag
for existing products based on their naming patterns and relationships.
"""

import asyncio
import asyncpg
import os
import logging
from typing import List, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', '5432')),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'onyx_custom'),
}

async def get_db_connection():
    """Create database connection"""
    return await asyncpg.connect(**DB_CONFIG)

async def get_all_projects(conn: asyncpg.Connection) -> List[Dict[str, Any]]:
    """Get all projects from the database"""
    query = """
    SELECT id, project_name, microproduct_name, product_type, microproduct_type, 
           source_chat_session_id, is_standalone, created_at
    FROM projects 
    WHERE deleted_at IS NULL
    ORDER BY created_at ASC
    """
    rows = await conn.fetch(query)
    return [dict(row) for row in rows]

async def get_training_plans(conn: asyncpg.Connection) -> List[Dict[str, Any]]:
    """Get all training plans (outlines) from the database"""
    query = """
    SELECT id, project_name, microproduct_name, source_chat_session_id, created_at
    FROM projects 
    WHERE (product_type = 'Training Plan' OR microproduct_type = 'Training Plan')
    AND deleted_at IS NULL
    ORDER BY created_at ASC
    """
    rows = await conn.fetch(query)
    return [dict(row) for row in rows]

def analyze_product_relationships(projects: List[Dict[str, Any]], training_plans: List[Dict[str, Any]]) -> Dict[int, bool]:
    """
    Analyze product relationships and determine if they should be standalone
    Returns a dict mapping project_id to is_standalone value
    """
    # Create lookup maps
    training_plan_names = {tp['project_name']: tp for tp in training_plans}
    training_plan_chat_sessions = {tp['source_chat_session_id']: tp for tp in training_plans if tp['source_chat_session_id']}
    
    # Results mapping
    is_standalone_updates = {}
    
    for project in projects:
        project_id = project['id']
        project_name = project['project_name']
        product_type = (project['product_type'] or '').lower()
        microproduct_type = (project['microproduct_type'] or '').lower()
        chat_session_id = project['source_chat_session_id']
        
        # Skip training plans themselves
        if product_type == 'training plan' or microproduct_type == 'training plan':
            continue
            
        # Check if product already has explicit is_standalone flag
        if project['is_standalone'] is not None:
            logger.info(f"Project {project_id} ({project_name}) already has explicit is_standalone={project['is_standalone']}")
            continue
            
        # Determine if this product belongs to an outline
        belongs_to_outline = False
        
        # Method 1: Check naming patterns
        if ' - ' in project_name and ': ' in project_name:
            # Pattern: "Content Type - Outline Name: Lesson Title"
            parts = project_name.split(' - ')
            if len(parts) >= 2:
                outline_part = parts[1].split(': ')[0].strip()
                if outline_part in training_plan_names:
                    belongs_to_outline = True
                    logger.info(f"Project {project_id} ({project_name}) belongs to outline via naming pattern 1")
                    
        elif ': ' in project_name:
            # Pattern: "Outline Name: Lesson Title"
            outline_part = project_name.split(': ')[0].strip()
            if outline_part in training_plan_names:
                belongs_to_outline = True
                logger.info(f"Project {project_id} ({project_name}) belongs to outline via naming pattern 2")
                
        # Method 2: Check if project name exactly matches a training plan name
        elif project_name in training_plan_names:
            belongs_to_outline = True
            logger.info(f"Project {project_id} ({project_name}) matches training plan name exactly")
            
        # Method 3: Check chat session relationship
        elif chat_session_id and chat_session_id in training_plan_chat_sessions:
            belongs_to_outline = True
            logger.info(f"Project {project_id} ({project_name}) shares chat session with training plan")
            
        # Method 4: Content type specific rules
        else:
            # For text presentations, lesson presentations, and video lessons, default to standalone if no clear relationship
            if (product_type in ['text presentation', 'lesson presentation', 'video lesson'] or 
                microproduct_type in ['text presentation', 'lesson presentation', 'video lesson']):
                belongs_to_outline = False
                logger.info(f"Project {project_id} ({project_name}) - {product_type} defaults to standalone")
            # For quizzes and PDF lessons, be more conservative
            elif product_type in ['quiz', 'pdf lesson'] or microproduct_type in ['quiz', 'pdf lesson']:
                # If we can't determine relationship, default to not standalone (belongs to outline)
                belongs_to_outline = True
                logger.info(f"Project {project_id} ({project_name}) - {product_type} defaults to outline-based")
        
        # Set the is_standalone flag (inverse of belongs_to_outline)
        is_standalone = not belongs_to_outline
        is_standalone_updates[project_id] = is_standalone
        
        logger.info(f"Project {project_id} ({project_name}) -> is_standalone={is_standalone}")
    
    return is_standalone_updates

async def update_is_standalone_flags(conn: asyncpg.Connection, updates: Dict[int, bool]):
    """Update the is_standalone flag for projects"""
    if not updates:
        logger.info("No updates needed")
        return
        
    # Prepare batch update
    update_query = """
    UPDATE projects 
    SET is_standalone = $2 
    WHERE id = $1
    """
    
    # Execute updates in batches
    batch_size = 100
    project_ids = list(updates.keys())
    
    for i in range(0, len(project_ids), batch_size):
        batch_ids = project_ids[i:i + batch_size]
        batch_updates = [(pid, updates[pid]) for pid in batch_ids]
        
        await conn.executemany(update_query, batch_updates)
        logger.info(f"Updated batch {i//batch_size + 1}: {len(batch_updates)} projects")
    
    logger.info(f"Successfully updated is_standalone flag for {len(updates)} projects")

async def main():
    """Main function to fix product visibility"""
    logger.info("Starting product visibility fix...")
    
    try:
        # Connect to database
        conn = await get_db_connection()
        logger.info("Connected to database")
        
        # Get all projects and training plans
        projects = await get_all_projects(conn)
        training_plans = await get_training_plans(conn)
        
        logger.info(f"Found {len(projects)} total projects")
        logger.info(f"Found {len(training_plans)} training plans")
        
        # Analyze relationships
        updates = analyze_product_relationships(projects, training_plans)
        
        # Update database
        await update_is_standalone_flags(conn, updates)
        
        logger.info("Product visibility fix completed successfully!")
        
    except Exception as e:
        logger.error(f"Error during product visibility fix: {e}")
        raise
    finally:
        if 'conn' in locals():
            await conn.close()

if __name__ == "__main__":
    asyncio.run(main()) 