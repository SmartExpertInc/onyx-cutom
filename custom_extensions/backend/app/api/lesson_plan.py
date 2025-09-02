# custom_extensions/backend/app/api/lesson_plan.py
from fastapi import APIRouter, HTTPException, Depends, Request, status
from typing import Dict, Any
import asyncpg
import json
import logging
from datetime import datetime, timezone
from ..models.lesson_plan_models import LessonPlanGenerateRequest, LessonPlanData
from ..services.lesson_plan_service import LessonPlanService
from ..core.database import get_db_pool
from ..core.auth import get_current_onyx_user_id
from ..core.credits import get_or_create_user_credits, deduct_credits

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/custom", tags=["lesson-plan"])

@router.post("/lesson-plan/generate")
async def generate_lesson_plan(
    payload: LessonPlanGenerateRequest, 
    request: Request, 
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    """
    Generate a lesson plan directly from a course outline project.
    This endpoint bypasses the preview/finalize flow and generates the final lesson plan immediately.
    """
    try:
        # Get current user ID
        onyx_user_id = await get_current_onyx_user_id(request)
        
        # Initialize lesson plan service
        lesson_plan_service = LessonPlanService(pool)
        
        # Generate the lesson plan
        result = await lesson_plan_service.generate_lesson_plan(
            onyx_user_id=onyx_user_id,
            payload=payload,
            request=request
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating lesson plan: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate lesson plan: {str(e)}") 