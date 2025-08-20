#!/usr/bin/env python3
"""
Video Lesson API Endpoints
==========================

This module provides API endpoints for video lesson generation using the Elai API.
It handles avatar video generation, video composition, and download functionality.

Key Features:
- Generate avatar videos with voiceover text
- Monitor video generation progress
- Compose final videos with slide backgrounds
- Download completed video lessons
- Error handling and progress tracking
"""

import os
import sys
import json
import logging
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List, Tuple
from pathlib import Path

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
import asyncpg

# Import video lesson services
try:
    from elai_service import ElaiAPIService, ElaiVideoConfig
    from video_composition_service import VideoCompositionService, VideoCompositionResult
    from slide_image_generator import SlideImageGenerator
    from video_lesson_generator import VideoLessonGenerator
    from moviepy.editor import VideoFileClip, concatenate_videoclips
    VIDEO_LESSON_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Video lesson generation services not available: {e}")
    VIDEO_LESSON_AVAILABLE = False

# Import main app dependencies
from main import get_current_onyx_user_id, get_db_pool

# Configure logging
logger = logging.getLogger(__name__)

# Elai API Configuration
ELAI_API_TOKEN = os.getenv("ELAI_API_TOKEN", "5774fLyEZuhr22LTmv6zwjZuk9M5rQ9e")
ELAI_BASE_URL = os.getenv("ELAI_BASE_URL", "https://api.elai.io")

# Create router
router = APIRouter(prefix="/api/custom/video-lesson", tags=["video-lesson"])

# Request/Response Models
class VideoGenerationRequest(BaseModel):
    """Request model for video lesson generation"""
    project_id: str
    slide_id: Optional[str] = None  # If None, generate for all slides
    avatar_code: str = "gia.1"  # Default avatar
    voice: str = "en-US-JennyNeural"  # Default voice
    background_color: str = "#00FF00"  # Green screen background
    language: str = "en"
    video_format: str = "mp4"
    resolution: str = "1920x1080"

class VideoGenerationResponse(BaseModel):
    """Response model for video generation"""
    success: bool
    video_id: Optional[str] = None
    message: str
    progress_url: Optional[str] = None

class VideoCompositionRequest(BaseModel):
    """Request model for video composition"""
    project_id: str
    slide_ids: List[str] = []
    avatar_scale: float = 0.8
    avatar_position: Optional[Tuple[int, int]] = None
    output_format: str = "mp4"

class VideoCompositionResponse(BaseModel):
    """Response model for video composition"""
    success: bool
    video_path: Optional[str] = None
    duration: Optional[float] = None
    file_size: Optional[int] = None
    message: str

# Import VideoLessonData from main
from main import VideoLessonData

@router.get("/avatars")
async def get_available_avatars():
    """
    Get list of available avatars for video generation.
    Returns avatar codes and preview URLs.
    """
    avatars = [
        {
            "code": "gia.casual",
            "name": "Gia Casual",
            "gender": "female",
            "preview_url": "https://elai-avatars.s3.us-east-2.amazonaws.com/common/gia/casual/gia_casual.png",
            "description": "Professional female avatar with casual style"
        },
        {
            "code": "dylan.casual", 
            "name": "Dylan Casual",
            "gender": "male",
            "preview_url": "https://elai-avatars.s3.us-east-2.amazonaws.com/common/dylan/casual/dylan_casual.png",
            "description": "Professional male avatar with casual style"
        },
        {
            "code": "anna.casual",
            "name": "Anna Casual", 
            "gender": "female",
            "preview_url": "https://elai-avatars.s3.us-east-2.amazonaws.com/common/anna/casual/anna_casual.png",
            "description": "Friendly female avatar with casual style"
        },
        {
            "code": "lisa.casual",
            "name": "Lisa Casual",
            "gender": "female", 
            "preview_url": "https://elai-avatars.s3.us-east-2.amazonaws.com/common/lisa/casual/lisa_casual.png",
            "description": "Confident female avatar with casual style"
        }
    ]
    
    return {"avatars": avatars}

@router.post("/generate-avatar", response_model=VideoGenerationResponse)
async def generate_avatar_video(
    request: VideoGenerationRequest,
    onyx_user_id: str = Depends(get_current_onyx_user_id),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    """
    Generate an avatar video for a specific slide using Elai API.
    
    This endpoint creates a video with an AI avatar speaking the voiceover text
    on a green screen background for later composition with slide images.
    """
    if not VIDEO_LESSON_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Video lesson generation services are not available"
        )
    
    if not ELAI_API_TOKEN:
        raise HTTPException(
            status_code=500,
            detail="Elai API token not configured"
        )
    
    try:
        # Get project data
        async with pool.acquire() as conn:
            project_data = await conn.fetchrow(
                """
                SELECT microproduct_content, project_name
                FROM projects 
                WHERE id = $1 AND onyx_user_id = $2
                """,
                request.project_id,
                onyx_user_id
            )
            
            if not project_data:
                raise HTTPException(
                    status_code=404,
                    detail="Project not found"
                )
        
        # Parse video lesson data
        video_lesson_data = VideoLessonData(**project_data['microproduct_content'])
        
        # Find the specific slide or all slides
        slides_to_process = []
        if request.slide_id:
            slide = next((s for s in video_lesson_data.slides if s.slideId == request.slide_id), None)
            if not slide:
                raise HTTPException(
                    status_code=404,
                    detail=f"Slide with ID {request.slide_id} not found"
                )
            slides_to_process = [slide]
        else:
            slides_to_process = video_lesson_data.slides
        
        if not slides_to_process:
            raise HTTPException(
                status_code=400,
                detail="No slides found to process"
            )
        
        # Initialize Elai service
        elai_config = ElaiVideoConfig(
            avatar_code=request.avatar_code,
            voice=request.voice,
            background_color=request.background_color,
            language=request.language,
            video_format=request.video_format,
            resolution=request.resolution
        )
        
        elai_service = ElaiAPIService(ELAI_API_TOKEN)
        
        # Generate videos for each slide
        generated_videos = []
        for slide in slides_to_process:
            if not slide.voiceoverText:
                logger.warning(f"No voiceover text for slide {slide.slideId}")
                continue
            
            # Create video with avatar
            video_id = elai_service.create_slide_video(
                slide_title=slide.slideTitle,
                voiceover_text=slide.voiceoverText,
                background_color=request.background_color,
                config=elai_config
            )
            
            if video_id:
                # Start rendering
                if elai_service.render_video(video_id):
                    generated_videos.append({
                        'slide_id': slide.slideId,
                        'video_id': video_id,
                        'title': slide.slideTitle
                    })
                    logger.info(f"Started rendering video {video_id} for slide {slide.slideId}")
                else:
                    logger.error(f"Failed to start rendering for video {video_id}")
            else:
                logger.error(f"Failed to create video for slide {slide.slideId}")
        
        if not generated_videos:
            return VideoGenerationResponse(
                success=False,
                message="Failed to generate any videos"
            )
        
        # Store video generation data in database for tracking
        async with pool.acquire() as conn:
            for video_data in generated_videos:
                await conn.execute(
                    """
                    INSERT INTO video_generation_tasks (
                        project_id, slide_id, video_id, avatar_code, voice,
                        background_color, status, created_at, onyx_user_id
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    """,
                    request.project_id,
                    video_data['slide_id'],
                    video_data['video_id'],
                    request.avatar_code,
                    request.voice,
                    request.background_color,
                    'rendering',
                    datetime.now(timezone.utc),
                    onyx_user_id
                )
        
        return VideoGenerationResponse(
            success=True,
            video_id=generated_videos[0]['video_id'] if len(generated_videos) == 1 else None,
            message=f"Started generating {len(generated_videos)} avatar videos",
            progress_url=f"/api/custom/video-lesson/progress/{request.project_id}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating avatar video: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate avatar video: {str(e)}"
        )

@router.get("/progress/{project_id}")
async def get_video_generation_progress(
    project_id: str,
    onyx_user_id: str = Depends(get_current_onyx_user_id),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    """
    Get the progress of video generation for a project.
    """
    if not VIDEO_LESSON_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Video lesson generation services are not available"
        )
    
    try:
        async with pool.acquire() as conn:
            tasks = await conn.fetch(
                """
                SELECT slide_id, video_id, status, created_at, avatar_code, voice
                FROM video_generation_tasks
                WHERE project_id = $1 AND onyx_user_id = $2
                ORDER BY created_at DESC
                """,
                project_id,
                onyx_user_id
            )
        
        if not tasks:
            return {
                "project_id": project_id,
                "total_tasks": 0,
                "completed": 0,
                "rendering": 0,
                "failed": 0,
                "tasks": []
            }
        
        # Check status of each video
        elai_service = ElaiAPIService(ELAI_API_TOKEN, ELAI_BASE_URL)
        progress_data = []
        
        for task in tasks:
            status_info = elai_service.check_video_status(task['video_id'])
            current_status = status_info.get('status', 'unknown')
            
            # Update database with current status
            async with pool.acquire() as conn:
                await conn.execute(
                    """
                    UPDATE video_generation_tasks
                    SET status = $1, updated_at = $2
                    WHERE video_id = $3
                    """,
                    current_status,
                    datetime.now(timezone.utc),
                    task['video_id']
                )
            
            progress_data.append({
                'slide_id': task['slide_id'],
                'video_id': task['video_id'],
                'status': current_status,
                'created_at': task['created_at'].isoformat(),
                'avatar_code': task['avatar_code'],
                'voice': task['voice'],
                'download_url': status_info.get('downloadUrl') if current_status == 'done' else None
            })
        
        # Count statuses
        status_counts = {}
        for task in progress_data:
            status = task['status']
            status_counts[status] = status_counts.get(status, 0) + 1
        
        return {
            "project_id": project_id,
            "total_tasks": len(tasks),
            "completed": status_counts.get('done', 0),
            "rendering": status_counts.get('rendering', 0),
            "failed": status_counts.get('failed', 0),
            "tasks": progress_data
        }
        
    except Exception as e:
        logger.error(f"Error getting video generation progress: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get progress: {str(e)}"
        )

@router.post("/compose", response_model=VideoCompositionResponse)
async def compose_video_lesson(
    request: VideoCompositionRequest,
    onyx_user_id: str = Depends(get_current_onyx_user_id),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    """
    Compose the final video lesson by combining slide images with avatar videos.
    
    This endpoint downloads completed avatar videos, generates slide images,
    and creates the final composite video with chroma key removal.
    """
    if not VIDEO_LESSON_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Video lesson generation services are not available"
        )
    
    try:
        # Get project data
        async with pool.acquire() as conn:
            project_data = await conn.fetchrow(
                """
                SELECT microproduct_content, project_name
                FROM projects 
                WHERE id = $1 AND onyx_user_id = $2
                """,
                request.project_id,
                onyx_user_id
            )
            
            if not project_data:
                raise HTTPException(
                    status_code=404,
                    detail="Project not found"
                )
        
        # Parse video lesson data
        video_lesson_data = VideoLessonData(**project_data['microproduct_content'])
        
        # Get completed video tasks
        async with pool.acquire() as conn:
            completed_tasks = await conn.fetch(
                """
                SELECT slide_id, video_id, avatar_code, voice
                FROM video_generation_tasks
                WHERE project_id = $1 AND onyx_user_id = $2 AND status = 'done'
                """,
                request.project_id,
                onyx_user_id
            )
        
        if not completed_tasks:
            raise HTTPException(
                status_code=400,
                detail="No completed videos found. Please wait for video generation to complete."
            )
        
        # Filter by requested slide IDs if specified
        if request.slide_ids:
            completed_tasks = [t for t in completed_tasks if t['slide_id'] in request.slide_ids]
        
        if not completed_tasks:
            raise HTTPException(
                status_code=400,
                detail="No completed videos found for the specified slides"
            )
        
        # Initialize services
        elai_service = ElaiAPIService(ELAI_API_TOKEN, ELAI_BASE_URL)
        composition_service = VideoCompositionService()
        image_generator = SlideImageGenerator()
        
        # Create output directory
        output_dir = f"output_videos/{request.project_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        os.makedirs(output_dir, exist_ok=True)
        
        # Process each slide
        composition_results = []
        for task in completed_tasks:
            slide = next((s for s in video_lesson_data.slides if s.slideId == task['slide_id']), None)
            if not slide:
                continue
            
            try:
                # Download avatar video
                avatar_video_path = elai_service.download_video(
                    task['video_id'],
                    output_dir
                )
                
                if not avatar_video_path:
                    logger.error(f"Failed to download video {task['video_id']}")
                    continue
                
                # Generate slide image
                slide_image_path = image_generator.generate_slide_image(
                    slide,
                    output_dir,
                    theme="dark-purple"  # Default theme
                )
                
                if not slide_image_path:
                    logger.error(f"Failed to generate image for slide {slide.slideId}")
                    continue
                
                # Compose final video
                output_video_path = os.path.join(
                    output_dir,
                    f"slide_{slide.slideNumber}_{slide.slideId}.{request.output_format}"
                )
                
                result = composition_service.compose_video_with_slide(
                    slide_image_path=slide_image_path,
                    avatar_video_path=avatar_video_path,
                    output_path=output_video_path,
                    avatar_scale=request.avatar_scale,
                    avatar_position=request.avatar_position
                )
                
                if result.success:
                    composition_results.append(result)
                    logger.info(f"Successfully composed video for slide {slide.slideId}")
                else:
                    logger.error(f"Failed to compose video for slide {slide.slideId}: {result.error_message}")
                
            except Exception as e:
                logger.error(f"Error processing slide {task['slide_id']}: {str(e)}")
                continue
        
        if not composition_results:
            return VideoCompositionResponse(
                success=False,
                message="Failed to compose any videos"
            )
        
        # Create final combined video if multiple slides
        if len(composition_results) > 1:
            final_video_path = os.path.join(output_dir, f"complete_lesson.{request.output_format}")
            
            # Combine all videos into one
            video_clips = []
            for result in composition_results:
                if os.path.exists(result.output_path):
                    clip = VideoFileClip(result.output_path)
                    video_clips.append(clip)
            
            if video_clips:
                final_clip = concatenate_videoclips(video_clips)
                final_clip.write_videofile(
                    final_video_path,
                    codec='libx264',
                    audio_codec='aac'
                )
                final_clip.close()
                
                # Clean up individual clips
                for clip in video_clips:
                    clip.close()
                
                # Get final video stats
                final_stats = os.stat(final_video_path)
                
                return VideoCompositionResponse(
                    success=True,
                    video_path=final_video_path,
                    duration=final_clip.duration,
                    file_size=final_stats.st_size,
                    message=f"Successfully composed {len(composition_results)} slides into final video"
                )
        
        # Return single video result
        result = composition_results[0]
        return VideoCompositionResponse(
            success=True,
            video_path=result.output_path,
            duration=result.duration,
            file_size=result.file_size,
            message=f"Successfully composed video for {len(composition_results)} slide(s)"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error composing video lesson: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to compose video lesson: {str(e)}"
        )

@router.get("/download/{project_id}")
async def download_video_lesson(
    project_id: str,
    onyx_user_id: str = Depends(get_current_onyx_user_id),
    pool: asyncpg.Pool = Depends(get_db_pool)
):
    """
    Download the completed video lesson file.
    """
    try:
        # Find the video file for this project
        output_dir = f"output_videos/{project_id}"
        if not os.path.exists(output_dir):
            raise HTTPException(
                status_code=404,
                detail="Video lesson not found. Please generate the video first."
            )
        
        # Look for the final video file
        video_files = []
        for file in os.listdir(output_dir):
            if file.endswith(('.mp4', '.avi', '.mov')):
                video_files.append(os.path.join(output_dir, file))
        
        if not video_files:
            raise HTTPException(
                status_code=404,
                detail="No video files found"
            )
        
        # Return the most recent video file
        video_path = max(video_files, key=os.path.getctime)
        
        return FileResponse(
            path=video_path,
            filename=f"video_lesson_{project_id}.mp4",
            media_type="video/mp4"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading video lesson: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to download video lesson: {str(e)}"
        )
