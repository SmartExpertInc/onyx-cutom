import asyncpg
import logging
from typing import Dict, Any
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

async def get_or_create_user_credits(pool: asyncpg.Pool, user_id: int) -> Dict[str, Any]:
    """
    Get or create user credits record.
    This is a placeholder implementation.
    """
    try:
        async with pool.acquire() as conn:
            # Check if user credits exist - use onyx_user_id field (correct schema)
            credits_row = await conn.fetchrow(
                "SELECT * FROM user_credits WHERE onyx_user_id = $1",
                str(user_id)  # Convert to string to match onyx_user_id type
            )
            
            if credits_row:
                return dict(credits_row)
            
            # Create default credits if they don't exist - use correct field name
            await conn.execute(
                """
                INSERT INTO user_credits (onyx_user_id, name, credits_balance, credits_purchased)
                VALUES ($1, $2, $3, $3)
                ON CONFLICT (onyx_user_id) DO NOTHING
                """,
                str(user_id), "User", 100, 100  # Default 100 credits, matching main.py schema
            )
            
            # Create SmartDrive account placeholder for new user
            try:
                await conn.execute(
                    """
                    INSERT INTO smartdrive_accounts (onyx_user_id, sync_cursor, created_at, updated_at)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (onyx_user_id) DO NOTHING
                    """,
                    str(user_id),  # Use user_id as onyx_user_id
                    '{}',  # Empty JSON cursor
                    datetime.now(timezone.utc),
                    datetime.now(timezone.utc)
                )
                logger.info(f"Created SmartDrive account placeholder for new user (via credits.py): {user_id}")
            except Exception as e:
                logger.error(f"Error creating SmartDrive account for new user {user_id}: {e}")
                # Don't raise exception to avoid blocking user creation
            
            # Return the created record - use correct field name
            credits_row = await conn.fetchrow(
                "SELECT * FROM user_credits WHERE onyx_user_id = $1",
                str(user_id)
            )
            
            return dict(credits_row) if credits_row else {"credits_balance": 100}
            
    except Exception as e:
        logger.error(f"Error getting/creating user credits: {e}")
        # Return default values if database operation fails
        return {"credits_balance": 100}

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