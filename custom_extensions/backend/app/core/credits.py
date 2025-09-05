import asyncpg
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

async def get_or_create_user_credits(pool: asyncpg.Pool, user_id: int) -> Dict[str, Any]:
    """
    Get or create user credits record.
    This is a placeholder implementation.
    """
    try:
        async with pool.acquire() as conn:
            # Check if user credits exist
            credits_row = await conn.fetchrow(
                "SELECT * FROM user_credits WHERE user_id = $1",
                user_id
            )
            
            if credits_row:
                return dict(credits_row)
            
            # Create default credits if they don't exist
            await conn.execute(
                """
                INSERT INTO user_credits (user_id, credits_remaining, created_at, updated_at)
                VALUES ($1, $2, NOW(), NOW())
                ON CONFLICT (user_id) DO NOTHING
                """,
                user_id, 100  # Default 100 credits
            )
            
            # Return the created record
            credits_row = await conn.fetchrow(
                "SELECT * FROM user_credits WHERE user_id = $1",
                user_id
            )
            
            return dict(credits_row) if credits_row else {"credits_remaining": 100}
            
    except Exception as e:
        logger.error(f"Error getting/creating user credits: {e}")
        # Return default values if database operation fails
        return {"credits_remaining": 100}

async def deduct_credits(pool: asyncpg.Pool, user_id: int, amount: int) -> bool:
    """
    Deduct credits from user account.
    Returns True if successful, False if insufficient credits.
    """
    try:
        async with pool.acquire() as conn:
            # Update credits atomically
            result = await conn.fetchrow(
                """
                UPDATE user_credits 
                SET credits_remaining = credits_remaining - $2, updated_at = NOW()
                WHERE user_id = $1 AND credits_remaining >= $2
                RETURNING credits_remaining
                """,
                user_id, amount
            )
            
            if result is not None:
                logger.info(f"Deducted {amount} credits from user {user_id}. Remaining: {result['credits_remaining']}")
                return True
            else:
                logger.warning(f"Insufficient credits for user {user_id}. Requested: {amount}")
                return False
                
    except Exception as e:
        logger.error(f"Error deducting credits: {e}")
        return False 