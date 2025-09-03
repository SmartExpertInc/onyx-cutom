# custom_extensions/backend/app/core/database.py
import os
import asyncpg
import logging
from typing import Optional, AsyncGenerator
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)

def get_main_db_pool():
    """Get the main application's database pool."""
    # Import here to avoid circular imports
    import main
    return main.DB_POOL

@asynccontextmanager
async def get_connection():
    """Get a database connection from the main application's pool."""
    pool = get_main_db_pool()
    if pool is None:
        raise RuntimeError("Database pool is not initialized")
    
    async with pool.acquire() as connection:
        yield connection

async def execute_query(query: str, *args, **kwargs):
    """Execute a database query."""
    async with get_connection() as conn:
        return await conn.execute(query, *args, **kwargs)

async def fetch_one(query: str, *args, **kwargs):
    """Fetch a single row from the database."""
    async with get_connection() as conn:
        return await conn.fetchrow(query, *args, **kwargs)

async def fetch_all(query: str, *args, **kwargs):
    """Fetch all rows from the database."""
    async with get_connection() as conn:
        return await conn.fetch(query, *args, **kwargs)

async def fetch_val(query: str, *args, **kwargs):
    """Fetch a single value from the database."""
    async with get_connection() as conn:
        return await conn.fetchval(query, *args, **kwargs)

async def execute_transaction(queries: list):
    """Execute multiple queries in a transaction."""
    async with get_connection() as conn:
        async with conn.transaction():
            results = []
            for query, args, kwargs in queries:
                if args and kwargs:
                    result = await conn.execute(query, *args, **kwargs)
                elif args:
                    result = await conn.execute(query, *args)
                elif kwargs:
                    result = await conn.execute(query, **kwargs)
                else:
                    result = await conn.execute(query)
                results.append(result)
            return results

# Database initialization
async def init_database():
    """Initialize the database with required tables."""
    try:
        # Create workspaces table
        await execute_query("""
            CREATE TABLE IF NOT EXISTS workspaces (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                created_by VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE,
                is_active BOOLEAN DEFAULT TRUE
            )
        """)
        
        # Create workspace_roles table
        await execute_query("""
            CREATE TABLE IF NOT EXISTS workspace_roles (
                id SERIAL PRIMARY KEY,
                workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                color VARCHAR(7) NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
                text_color VARCHAR(7) NOT NULL CHECK (text_color ~ '^#[0-9A-Fa-f]{6}$'),
                permissions JSONB NOT NULL,
                is_default BOOLEAN DEFAULT FALSE,
                created_by VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE,
                UNIQUE(workspace_id, name)
            )
        """)
        
        # Create workspace_members table
        await execute_query("""
            CREATE TABLE IF NOT EXISTS workspace_members (
                id SERIAL PRIMARY KEY,
                workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
                user_id VARCHAR(255) NOT NULL,
                role_id INTEGER NOT NULL REFERENCES workspace_roles(id) ON DELETE CASCADE,
                status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
                invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                joined_at TIMESTAMP WITH TIME ZONE,
                updated_at TIMESTAMP WITH TIME ZONE,
                UNIQUE(workspace_id, user_id)
            )
        """)
        
        # Create product_access table
        await execute_query("""
            CREATE TABLE IF NOT EXISTS product_access (
                id SERIAL PRIMARY KEY,
                product_id INTEGER NOT NULL,
                workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
                access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('workspace', 'role', 'individual')),
                target_id VARCHAR(255),
                granted_by VARCHAR(255) NOT NULL,
                granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(product_id, workspace_id, access_type, target_id)
            )
        """)
        
        # Create indexes for better performance
        await execute_query("CREATE INDEX IF NOT EXISTS idx_workspaces_created_by ON workspaces(created_by)")
        await execute_query("CREATE INDEX IF NOT EXISTS idx_workspace_roles_workspace_id ON workspace_roles(workspace_id)")
        await execute_query("CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id)")
        await execute_query("CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id)")
        await execute_query("CREATE INDEX IF NOT EXISTS idx_product_access_product_id ON product_access(product_id)")
        await execute_query("CREATE INDEX IF NOT EXISTS idx_product_access_workspace_id ON product_access(workspace_id)")
        
        logger.info("Database tables created successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

async def seed_default_roles(workspace_id: int, created_by: str):
    """Seed default roles for a new workspace."""
    from app.models.workspace_models import DEFAULT_ROLES
    
    try:
        for role_key, role_data in DEFAULT_ROLES.items():
            # Check if role already exists
            existing_role = await fetch_one(
                "SELECT id FROM workspace_roles WHERE workspace_id = $1 AND name = $2",
                workspace_id, role_data["name"]
            )
            
            if not existing_role:
                await execute_query("""
                    INSERT INTO workspace_roles (workspace_id, name, color, text_color, permissions, is_default, created_by)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                """, workspace_id, role_data["name"], role_data["color"], 
                     role_data["text_color"], role_data["permissions"], 
                     role_data["is_default"], created_by)
        
        logger.info(f"Default roles seeded for workspace {workspace_id}")
        
    except Exception as e:
        logger.error(f"Failed to seed default roles for workspace {workspace_id}: {e}")
        raise 