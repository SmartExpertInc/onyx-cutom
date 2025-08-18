import asyncpg
from fastapi import HTTPException

async def get_db_pool():
    """Get database pool - matches your existing pattern from main.py"""
    # Import here to avoid circular imports
    from main import DB_POOL
    
    if DB_POOL is None:
        detail_msg = "Database service not available."
        raise HTTPException(status_code=503, detail=detail_msg)
    return DB_POOL

async def get_db():
    """Get database connection for dependency injection"""
    pool = await get_db_pool()
    async with pool.acquire() as connection:
        yield connection 