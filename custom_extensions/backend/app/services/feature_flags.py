import asyncpg
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class FeatureFlagService:
    def __init__(self, pool: asyncpg.Pool):
        self.pool = pool

    async def get_user_feature_flags(self, onyx_user_id: str) -> Dict[str, bool]:
        """Get all feature flags for a specific user"""
        try:
            async with self.pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT feature_name, is_enabled 
                    FROM user_feature_flags 
                    WHERE onyx_user_id = $1
                """, onyx_user_id)
                
                feature_flags = {}
                for row in rows:
                    feature_flags[row['feature_name']] = row['is_enabled']
                
                return feature_flags
        except Exception as e:
            logger.error(f"Error getting feature flags for user {onyx_user_id}: {e}")
            return {}

    async def check_feature_flag(self, onyx_user_id: str, feature_name: str) -> bool:
        """Check if a specific feature is enabled for a user"""
        try:
            async with self.pool.acquire() as conn:
                row = await conn.fetchrow("""
                    SELECT is_enabled 
                    FROM user_feature_flags 
                    WHERE onyx_user_id = $1 AND feature_name = $2
                """, onyx_user_id, feature_name)
                
                # If no record exists, default to enabled (true)
                return row['is_enabled'] if row else True
        except Exception as e:
            logger.error(f"Error checking feature flag {feature_name} for user {onyx_user_id}: {e}")
            return True  # Default to enabled on error

    async def update_feature_flag(self, onyx_user_id: str, feature_name: str, is_enabled: bool) -> bool:
        """Update a specific feature flag for a user"""
        try:
            async with self.pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO user_feature_flags (onyx_user_id, feature_name, is_enabled, updated_at)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (onyx_user_id, feature_name) 
                    DO UPDATE SET 
                        is_enabled = $3,
                        updated_at = $4
                """, onyx_user_id, feature_name, is_enabled, datetime.now(timezone.utc))
                
                return True
        except Exception as e:
            logger.error(f"Error updating feature flag {feature_name} for user {onyx_user_id}: {e}")
            return False

    async def bulk_update_feature_flag(self, user_emails: List[str], feature_name: str, is_enabled: bool) -> Dict[str, bool]:
        """Bulk update a feature flag for multiple users"""
        results = {}
        try:
            async with self.pool.acquire() as conn:
                for user_email in user_emails:
                    try:
                        await conn.execute("""
                            INSERT INTO user_feature_flags (onyx_user_id, feature_name, is_enabled, updated_at)
                            VALUES ($1, $2, $3, $4)
                            ON CONFLICT (onyx_user_id, feature_name) 
                            DO UPDATE SET 
                                is_enabled = $3,
                                updated_at = $4
                        """, user_email, feature_name, is_enabled, datetime.now(timezone.utc))
                        results[user_email] = True
                    except Exception as e:
                        logger.error(f"Error updating feature flag for user {user_email}: {e}")
                        results[user_email] = False
                
                return results
        except Exception as e:
            logger.error(f"Error in bulk update feature flag: {e}")
            return {email: False for email in user_emails}

    async def get_all_users_feature_flags(self) -> List[Dict[str, Any]]:
        """Get all users and their feature flag states for admin dashboard"""
        try:
            async with self.pool.acquire() as conn:
                # Get all unique users with their feature flags
                rows = await conn.fetch("""
                    SELECT 
                        uff.onyx_user_id,
                        uff.feature_name,
                        uff.is_enabled,
                        uff.updated_at,
                        uc.name as user_name
                    FROM user_feature_flags uff
                    LEFT JOIN user_credits uc ON uff.onyx_user_id = uc.onyx_user_id
                    ORDER BY uff.onyx_user_id, uff.feature_name
                """)
                
                # Group by user
                users_data = {}
                for row in rows:
                    user_id = row['onyx_user_id']
                    if user_id not in users_data:
                        users_data[user_id] = {
                            'onyx_user_id': user_id,
                            'name': row['user_name'] or user_id,
                            'feature_flags': {},
                            'updated_at': row['updated_at']
                        }
                    users_data[user_id]['feature_flags'][row['feature_name']] = row['is_enabled']
                
                return list(users_data.values())
        except Exception as e:
            logger.error(f"Error getting all users feature flags: {e}")
            return []

    async def get_available_features(self) -> List[str]:
        """Get list of all available features"""
        return [
            "settings_modal",
            "quality_tier_display", 
            "ai_image_generation",
            "advanced_editing",
            "analytics_dashboard",
            "custom_rates",
            "folder_management",
            "bulk_operations"
        ]

    async def initialize_user_feature_flags(self, onyx_user_id: str) -> bool:
        """Initialize default feature flags for a new user"""
        try:
            available_features = await self.get_available_features()
            async with self.pool.acquire() as conn:
                for feature_name in available_features:
                    await conn.execute("""
                        INSERT INTO user_feature_flags (onyx_user_id, feature_name, is_enabled)
                        VALUES ($1, $2, $3)
                        ON CONFLICT (onyx_user_id, feature_name) DO NOTHING
                    """, onyx_user_id, feature_name, True)  # Default to enabled
                
                return True
        except Exception as e:
            logger.error(f"Error initializing feature flags for user {onyx_user_id}: {e}")
            return False 