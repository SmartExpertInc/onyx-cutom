#!/usr/bin/env python3
"""
Dependencies module for video lesson API
========================================

This module contains dependency functions that can be imported by both main.py
and video_lesson_api.py without causing circular imports.
"""

from typing import Optional
import asyncpg
from fastapi import Request

# Global variables to store the actual dependency functions
_current_user_id_func = None
_db_pool_func = None

def set_dependencies(user_id_func, db_pool_func):
    """Set the actual dependency functions from main.py"""
    global _current_user_id_func, _db_pool_func
    _current_user_id_func = user_id_func
    _db_pool_func = db_pool_func

async def get_current_onyx_user_id(request: Request) -> str:
    """Get current user ID - delegates to the actual function from main.py"""
    if _current_user_id_func:
        return await _current_user_id_func(request)
    return "default_user_id"

async def get_db_pool() -> Optional[asyncpg.Pool]:
    """Get database pool - delegates to the actual function from main.py"""
    if _db_pool_func:
        return await _db_pool_func()
    return None
