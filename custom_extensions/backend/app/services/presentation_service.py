#!/usr/bin/env python3
"""
Professional Presentation Service
===============================

This service orchestrates the complete video presentation generation pipeline,
combining slide capture, avatar generation, and video composition.
"""

import asyncio
import logging
import os
import uuid
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import json

# from .slide_capture_service import slide_capture_service, SlideVideoConfig  # DISABLED - Using clean pipeline only
from .video_composer_service import video_composer_service, CompositionConfig
from .video_generation_service import video_generation_service

logger = logging.getLogger(__name__)

@dataclass
class PresentationRequest:
    """Request configuration for video presentation generation."""
    slide_url: str
    voiceover_texts: List[str]
    avatar_code: Optional[str] = None  # Will be dynamically selected if None
    duration: float = 30.0
    layout: str = "side_by_side"  # side_by_side, picture_in_picture, split_screen
    quality: str = "high"  # high, medium, low
    resolution: tuple = (1920, 1080)
    project_name: str = "Generated Presentation"

@dataclass
class PresentationJob:
    """Job tracking for presentation generation."""
    job_id: str
    status: str  # queued, processing, completed, failed
    progress: float = 0.0
    error: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    created_at: datetime = None
    completed_at: Optional[datetime] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()

class ProfessionalPresentationService:
    """Professional presentation generation service."""
    
    def __init__(self):
        self.output_dir = Path("output/presentations")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Job tracking
        self.jobs: Dict[str, PresentationJob] = {}
        
        logger.info("Professional Presentation Service initialized")
    
    async def create_presentation(self, request: PresentationRequest) -> str:
        """
        Create a new video presentation.
        
        Args:
            request: Presentation request configuration
            
        Returns:
            Job ID for tracking
        """
        try:
            job_id = str(uuid.uuid4())
            
            # Create job tracking
            job = PresentationJob(
                job_id=job_id,
                status="queued"
            )
            self.jobs[job_id] = job
            
            logger.info(f"Created presentation job: {job_id}")
            
            # Start background processing (completely detached)
            loop = asyncio.get_event_loop()
            loop.create_task(self._process_presentation_detached(job_id, request))
            
            return job_id
            
        except Exception as e:
            logger.error(f"Failed to create presentation: {e}")
            raise
    
    async def get_job_status(self, job_id: str) -> Optional[PresentationJob]:
        """
        Get the status of a presentation job.
        
        Args:
            job_id: Job ID to check
            
        Returns:
            Job status or None if not found
        """
        return self.jobs.get(job_id)
    
    async def _process_presentation_detached(self, job_id: str, request: PresentationRequest):
        """
        Completely detached presentation processing that won't block any endpoints.
        Runs in a separate thread to avoid blocking the main event loop.
        """
        import concurrent.futures
        
        def run_blocking_processing():
            """Run the processing in a separate thread."""
            try:
                # Create a new event loop for this thread
                import asyncio
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
                # Run the processing
                loop.run_until_complete(self._process_presentation(job_id, request))
                
            except Exception as e:
                logger.error(f"Thread processing failed for {job_id}: {e}")
                if job_id in self.jobs:
                    self.jobs[job_id].status = "failed"
                    self.jobs[job_id].error = str(e)
            finally:
                try:
                    loop.close()
                except:
                    pass
        
        # Run in thread pool to avoid blocking main event loop
        executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
        executor.submit(run_blocking_processing)
    
    async def _process_presentation(self, job_id: str, request: PresentationRequest):
        """
        Process presentation generation in background.
        
        Args:
            job_id: Job ID
            request: Presentation request
        """
        job = self.jobs[job_id]
        
        try:
            logger.info(f"Starting presentation processing for job: {job_id}")
            job.status = "processing"
            job.progress = 5.0
            
            # Step 1: Capture slide video
            logger.info(f"Step 1: Generating clean slide video for job {job_id}")
            job.progress = 10.0
            
            # Use ONLY the new clean HTML → PNG → Video pipeline (no screenshot fallback)
            try:
                # Try to extract slide props from URL or use fallback
                slides_props = await self._extract_slide_props_from_url(request.slide_url)
                
                # Import the clean video generation service
                from .clean_video_generation_service import clean_video_generation_service
                
                # Generate clean slide video for all slides
                if isinstance(slides_props, list) and len(slides_props) > 1:
                    # Multiple slides - use presentation video generation
                    logger.info(f"Generating presentation video with {len(slides_props)} slides")
                    result = await clean_video_generation_service.generate_presentation_video(
                        slides_props=slides_props,
                        theme="dark-purple",  # Could be extracted from request
                        slide_duration=request.duration,
                        quality=request.quality
                    )
                else:
                    # Single slide - use single slide generation
                    slide_props = slides_props[0] if isinstance(slides_props, list) else slides_props
                    logger.info(f"Generating single slide video")
                    result = await clean_video_generation_service.generate_avatar_slide_video(
                        slide_props=slide_props,
                        theme="dark-purple",  # Could be extracted from request
                        slide_duration=request.duration,
                        quality=request.quality
                    )
                
                if result["success"]:
                    slide_video_path = result["video_path"]
                    logger.info(f"Clean video generation successful: {slide_video_path}")
                else:
                    logger.error(f"Clean video generation failed: {result['error']}")
                    raise Exception(f"Video generation failed: {result['error']}")
                    
            except Exception as slide_error:
                logger.error(f"Clean video generation error: {slide_error}")
                raise Exception(f"Video generation failed: {str(slide_error)}")
            
            job.progress = 30.0
            
            # Step 2: Generate avatar video via Elai API
            logger.info(f"Step 2: Generating avatar video for job {job_id}")
            job.progress = 40.0
            
            avatar_video_path = await self._generate_avatar_video(
                request.voiceover_texts,
                request.avatar_code,
                request.duration
            )
            job.progress = 60.0
            
            logger.info(f"Avatar video generated: {avatar_video_path}")
            
            # Step 3: Compose final video
            logger.info(f"Step 3: Composing final video for job {job_id}")
            job.progress = 70.0
            
            output_filename = f"presentation_{job_id}.mp4"
            output_path = self.output_dir / output_filename
            
            composition_config = CompositionConfig(
                output_path=str(output_path),
                resolution=request.resolution,
                quality=request.quality,
                layout=request.layout
            )
            
            final_video_path = await video_composer_service.compose_presentation(
                slide_video_path,
                avatar_video_path,
                composition_config
            )
            job.progress = 90.0
            
            logger.info(f"Final video composed: {final_video_path}")
            
            # Step 4: Create thumbnail
            logger.info(f"Step 4: Creating thumbnail for job {job_id}")
            thumbnail_filename = f"thumbnail_{job_id}.jpg"
            thumbnail_path = self.output_dir / thumbnail_filename
            
            await video_composer_service.create_thumbnail(
                final_video_path,
                str(thumbnail_path)
            )
            
            # Step 5: Cleanup temporary files
            await self._cleanup_temp_files([slide_video_path, avatar_video_path])
            
            # Update job status
            job.status = "completed"
            job.progress = 100.0
            job.completed_at = datetime.now()
            job.video_url = f"/presentations/{job_id}/video"
            job.thumbnail_url = f"/presentations/{job_id}/thumbnail"
            
            logger.info(f"Presentation {job_id} completed successfully")
            
        except Exception as e:
            logger.error(f"Presentation {job_id} failed: {e}")
            job.status = "failed"
            job.error = str(e)
            job.completed_at = datetime.now()
    
    async def _extract_slide_props_from_url(self, slide_url: str) -> Dict[str, Any]:
        """
        Extract slide properties from URL by parsing project ID and getting data from database.
        
        Args:
            slide_url: URL of the slide (e.g., /projects/view/123)
            
        Returns:
            Slide properties dict
        """
        try:
            import re
            import asyncpg
            from fastapi import HTTPException
            
            # Extract project ID from URL
            project_id_match = re.search(r'/projects/view/(\d+)', slide_url)
            if not project_id_match:
                logger.warning(f"Could not extract project ID from URL: {slide_url}")
                return self._get_fallback_slide()
            
            project_id = int(project_id_match.group(1))
            logger.info(f"Extracted project ID: {project_id}")
            
            # Get database pool from dependency injection context
            # Since we can't use Depends here, we'll need to get the pool differently
            # For now, we'll use a global pool or create a new connection
            try:
                # Try to get the database pool from the current context
                # This is a workaround since we can't use Depends in this method
                import os
                database_url = os.getenv("DATABASE_URL")
                if not database_url:
                    logger.error("DATABASE_URL not found in environment")
                    return self._get_fallback_slide()
                
                # Create a new connection pool for this operation
                pool = await asyncpg.create_pool(database_url)
                
                async with pool.acquire() as conn:
                    # Get project data from database (similar to PDF generation)
                    # Note: We don't include user authentication here since this is a background service
                    target_row_dict = await conn.fetchrow(
                        """
                        SELECT p.project_name, p.microproduct_name, p.microproduct_content,
                               dt.component_name as design_component_name
                        FROM projects p
                        LEFT JOIN design_templates dt ON p.design_template_id = dt.id
                        WHERE p.id = $1;
                        """,
                        project_id
                    )
                
                await pool.close()
                
                if not target_row_dict:
                    logger.warning(f"Project {project_id} not found in database")
                    return self._get_fallback_slide()
                
                content_json = target_row_dict.get('microproduct_content')
                component_name = target_row_dict.get("design_component_name")
                
                if not content_json or not isinstance(content_json, dict):
                    logger.warning(f"Invalid content JSON for project {project_id}")
                    return self._get_fallback_slide()
                
                # Check if this is a slide deck project
                if component_name not in ["SlideDeckDisplay", "VideoLessonPresentationDisplay"]:
                    logger.warning(f"Project {project_id} is not a slide deck (component: {component_name})")
                    return self._get_fallback_slide()
                
                # Extract slides from content
                slides = content_json.get('slides', [])
                if not slides or not isinstance(slides, list):
                    logger.warning(f"No slides found in project {project_id}")
                    return self._get_fallback_slide()
                
                # Process all slides for video generation
                if len(slides) > 0:
                    logger.info(f"Extracted {len(slides)} slides from project {project_id}")
                    
                    # Convert all slides to the format expected by video generation
                    processed_slides = []
                    for i, slide in enumerate(slides):
                        slide_data = {
                            "templateId": slide.get('templateId', 'content-slide'),
                            "title": slide.get('props', {}).get('title', f'Slide {i+1}'),
                            "subtitle": slide.get('props', {}).get('subtitle', ''),
                            "content": slide.get('props', {}).get('content', ''),
                            "bullets": slide.get('props', {}).get('bullets', []),
                            "steps": slide.get('props', {}).get('steps', []),
                            "challenges": slide.get('props', {}).get('challenges', []),
                            "solutions": slide.get('props', {}).get('solutions', []),
                            "boxes": slide.get('props', {}).get('boxes', []),
                            "items": slide.get('props', {}).get('items', []),
                            "leftTitle": slide.get('props', {}).get('leftTitle', ''),
                            "leftContent": slide.get('props', {}).get('leftContent', ''),
                            "rightTitle": slide.get('props', {}).get('rightTitle', ''),
                            "rightContent": slide.get('props', {}).get('rightContent', ''),
                            "imagePath": slide.get('props', {}).get('imagePath', ''),
                            "imagePrompt": slide.get('props', {}).get('imagePrompt', ''),
                            "imageAlt": slide.get('props', {}).get('imageAlt', ''),
                            "leftImagePath": slide.get('props', {}).get('leftImagePath', ''),
                            "rightImagePath": slide.get('props', {}).get('rightImagePath', ''),
                            "leftImagePrompt": slide.get('props', {}).get('leftImagePrompt', ''),
                            "rightImagePrompt": slide.get('props', {}).get('rightImagePrompt', ''),
                            "leftImageAlt": slide.get('props', {}).get('leftImageAlt', ''),
                            "rightImageAlt": slide.get('props', {}).get('rightImageAlt', ''),
                            "bulletStyle": slide.get('props', {}).get('bulletStyle', 'dot'),
                            "maxColumns": slide.get('props', {}).get('maxColumns', 1),
                            "layout": slide.get('props', {}).get('layout', 'horizontal'),
                            "alignment": slide.get('props', {}).get('alignment', 'left'),
                            "textAlign": slide.get('props', {}).get('textAlign', 'center'),
                            "showAccent": slide.get('props', {}).get('showAccent', False),
                            "accentPosition": slide.get('props', {}).get('accentPosition', 'left'),
                            "titleSize": slide.get('props', {}).get('titleSize', 'large'),
                            "subtitleSize": slide.get('props', {}).get('subtitleSize', 'medium'),
                            "author": slide.get('props', {}).get('author', ''),
                            "date": slide.get('props', {}).get('date', ''),
                            "columnRatio": slide.get('props', {}).get('columnRatio', '50-50'),
                            "beforeTitle": slide.get('props', {}).get('beforeTitle', ''),
                            "beforeContent": slide.get('props', {}).get('beforeContent', ''),
                            "afterTitle": slide.get('props', {}).get('afterTitle', ''),
                            "afterContent": slide.get('props', {}).get('afterContent', ''),
                            "backgroundImage": slide.get('props', {}).get('backgroundImage', ''),
                            "voiceoverText": slide.get('voiceoverText', ''),
                            # Include all other props that might be present
                            **{k: v for k, v in slide.get('props', {}).items() 
                               if k not in ['title', 'subtitle', 'content', 'bullets', 'steps', 'challenges', 
                                           'solutions', 'boxes', 'items', 'leftTitle', 'leftContent', 
                                           'rightTitle', 'rightContent', 'imagePath', 'imagePrompt', 
                                           'imageAlt', 'leftImagePath', 'rightImagePath', 'leftImagePrompt', 
                                           'rightImagePrompt', 'leftImageAlt', 'rightImageAlt', 'bulletStyle', 
                                           'maxColumns', 'layout', 'alignment', 'textAlign', 'showAccent', 
                                           'accentPosition', 'titleSize', 'subtitleSize', 'author', 'date', 
                                           'columnRatio', 'beforeTitle', 'beforeContent', 'afterTitle', 
                                           'afterContent', 'backgroundImage']}
                        }
                        processed_slides.append(slide_data)
                        logger.info(f"Processed slide {i+1}: templateId={slide.get('templateId')}, title='{slide_data['title']}'")
                    
                    return processed_slides
                else:
                    logger.warning(f"No slides found in project {project_id}")
                    return [self._get_fallback_slide()]
                    
            except Exception as db_error:
                logger.error(f"Database error extracting slide props: {str(db_error)}")
                return self._get_fallback_slide()
            
        except Exception as e:
            logger.error(f"Error extracting slide props from URL: {str(e)}")
            return self._get_fallback_slide()
    
    def _get_fallback_slide(self) -> Dict[str, Any]:
        """Get a fallback slide when data extraction fails."""
        return {
            "templateId": "avatar-checklist",
            "title": "Professional Communication",
            "items": [
                {"text": "Listen actively to client needs", "isPositive": True},
                {"text": "Provide clear and helpful responses", "isPositive": True},
                {"text": "Follow up on commitments", "isPositive": True},
                {"text": "Avoid generic or cold responses", "isPositive": False}
            ]
        }
    
    async def _get_available_avatar(self) -> str:
        """
        Get an available avatar code from Elai API.
        
        Returns:
            Avatar code string
        """
        try:
            # Get avatars from video generation service
            avatars_response = await video_generation_service.get_avatars()
            
            if not avatars_response["success"]:
                logger.error(f"Failed to fetch avatars: {avatars_response['error']}")
                # Fallback to common avatar codes
                fallback_avatars = ["anna", "james", "sara", "john", "emily", "david"]
                logger.info(f"Using fallback avatar: {fallback_avatars[0]}")
                return fallback_avatars[0]
            
            avatars = avatars_response["avatars"]
            if not avatars:
                logger.error("No avatars available")
                return "anna"  # Final fallback
            
            # Prefer female avatars, then any available
            preferred_genders = ["female", "male", None]
            
            for gender in preferred_genders:
                for avatar in avatars:
                    if gender is None or avatar.get("gender") == gender:
                        avatar_code = avatar.get("code")
                        if avatar_code:
                            logger.info(f"Selected avatar: {avatar_code} ({avatar.get('name', 'Unknown')})")
                            return avatar_code
            
            # If no preference match, take first available
            first_avatar = avatars[0]
            avatar_code = first_avatar.get("code", "anna")
            logger.info(f"Using first available avatar: {avatar_code}")
            return avatar_code
            
        except Exception as e:
            logger.error(f"Error getting available avatar: {str(e)}")
            return "anna"  # Final fallback
    
    async def _generate_avatar_video(self, voiceover_texts: List[str], avatar_code: Optional[str], duration: float) -> str:
        """
        Generate avatar video using Elai API.
        
        Args:
            voiceover_texts: List of voiceover texts
            avatar_code: Avatar code to use (None for auto-selection)
            duration: Video duration
            
        Returns:
            Path to generated avatar video
        """
        try:
            logger.info(f"Generating avatar video with {len(voiceover_texts)} voiceover texts")
            
            # Get avatar code if not provided
            if not avatar_code:
                avatar_code = await self._get_available_avatar()
                logger.info(f"Auto-selected avatar: {avatar_code}")
            else:
                logger.info(f"Using specified avatar: {avatar_code}")
            
            # Create video with Elai API
            result = await video_generation_service.create_video_from_texts(
                project_name="Avatar Video",
                voiceover_texts=voiceover_texts,
                avatar_code=avatar_code
            )
            
            if not result["success"]:
                raise Exception(f"Failed to create avatar video: {result['error']}")
            
            video_id = result["videoId"]
            logger.info(f"Avatar video created with ID: {video_id}")
            
            # Start rendering
            render_result = await video_generation_service.render_video(video_id)
            if not render_result["success"]:
                raise Exception(f"Failed to start avatar video rendering: {render_result['error']}")
            
            # Wait for completion
            avatar_video_path = await self._wait_for_avatar_completion(video_id)
            
            return avatar_video_path
            
        except Exception as e:
            logger.error(f"Avatar video generation failed: {e}")
            raise
    
    async def _wait_for_avatar_completion(self, video_id: str) -> str:
        """
        Wait for avatar video to complete rendering.
        
        Args:
            video_id: Elai video ID
            
        Returns:
            Path to downloaded avatar video
        """
        try:
            logger.info(f"Waiting for avatar video completion: {video_id}")
            
            max_wait_time = 15 * 60  # 15 minutes
            check_interval = 30  # 30 seconds
            start_time = datetime.now()
            
            while (datetime.now() - start_time).total_seconds() < max_wait_time:
                status_result = await video_generation_service.check_video_status(video_id)
                
                if not status_result["success"]:
                    logger.warning(f"Failed to check video status: {status_result['error']}")
                    await asyncio.sleep(check_interval)
                    continue
                
                status = status_result["status"]
                progress = status_result["progress"]
                
                logger.info(f"Avatar video status: {status}, Progress: {progress}%")
                
                if status in ["rendered", "ready"]:
                    download_url = status_result["downloadUrl"]
                    if download_url:
                        # Download the video
                        avatar_video_path = await self._download_avatar_video(download_url, video_id)
                        logger.info(f"Avatar video downloaded: {avatar_video_path}")
                        return avatar_video_path
                    else:
                        raise Exception("Video rendered but no download URL available")
                
                elif status in ["failed", "error"]:
                    raise Exception(f"Avatar video rendering failed: {status}")
                
                await asyncio.sleep(check_interval)
            
            raise Exception("Avatar video rendering timeout")
            
        except Exception as e:
            logger.error(f"Avatar video completion failed: {e}")
            raise
    
    async def _download_avatar_video(self, download_url: str, video_id: str) -> str:
        """
        Download avatar video from Elai.
        
        Args:
            download_url: URL to download video from
            video_id: Video ID for filename
            
        Returns:
            Path to downloaded video
        """
        try:
            import aiohttp
            
            output_filename = f"avatar_{video_id}.mp4"
            output_path = self.output_dir / output_filename
            
            logger.info(f"Downloading avatar video: {download_url}")
            
            async with aiohttp.ClientSession() as session:
                async with session.get(download_url) as response:
                    if response.status != 200:
                        raise Exception(f"Failed to download video: {response.status}")
                    
                    with open(output_path, 'wb') as f:
                        async for chunk in response.content.iter_chunked(8192):
                            f.write(chunk)
            
            logger.info(f"Avatar video downloaded: {output_path}")
            return str(output_path)
            
        except Exception as e:
            logger.error(f"Avatar video download failed: {e}")
            raise
    
    async def _cleanup_temp_files(self, file_paths: List[str]):
        """
        Clean up temporary files.
        
        Args:
            file_paths: List of file paths to clean up
        """
        try:
            for file_path in file_paths:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.info(f"Cleaned up temporary file: {file_path}")
        except Exception as e:
            logger.warning(f"Cleanup failed: {e}")
    
    async def get_presentation_video(self, job_id: str) -> Optional[str]:
        """
        Get the video file path for a completed presentation.
        
        Args:
            job_id: Job ID
            
        Returns:
            Path to video file or None if not found
        """
        job = self.jobs.get(job_id)
        if not job or job.status != "completed":
            return None
        
        video_path = self.output_dir / f"presentation_{job_id}.mp4"
        return str(video_path) if video_path.exists() else None
    
    async def get_presentation_thumbnail(self, job_id: str) -> Optional[str]:
        """
        Get the thumbnail file path for a completed presentation.
        
        Args:
            job_id: Job ID
            
        Returns:
            Path to thumbnail file or None if not found
        """
        job = self.jobs.get(job_id)
        if not job or job.status != "completed":
            return None
        
        thumbnail_path = self.output_dir / f"thumbnail_{job_id}.jpg"
        return str(thumbnail_path) if thumbnail_path.exists() else None
    
    async def list_jobs(self, limit: int = 50) -> List[PresentationJob]:
        """
        List recent presentation jobs.
        
        Args:
            limit: Maximum number of jobs to return
            
        Returns:
            List of presentation jobs
        """
        jobs = list(self.jobs.values())
        jobs.sort(key=lambda x: x.created_at, reverse=True)
        return jobs[:limit]
    
    async def cleanup_old_jobs(self, days: int = 7):
        """
        Clean up old completed jobs and their files.
        
        Args:
            days: Number of days to keep jobs
        """
        try:
            cutoff_date = datetime.now() - timedelta(days=days)
            
            for job_id, job in list(self.jobs.items()):
                if job.created_at < cutoff_date:
                    # Remove job from tracking
                    del self.jobs[job_id]
                    
                    # Remove associated files
                    video_path = self.output_dir / f"presentation_{job_id}.mp4"
                    thumbnail_path = self.output_dir / f"thumbnail_{job_id}.jpg"
                    
                    if video_path.exists():
                        video_path.unlink()
                    if thumbnail_path.exists():
                        thumbnail_path.unlink()
                    
                    logger.info(f"Cleaned up old job: {job_id}")
            
        except Exception as e:
            logger.error(f"Job cleanup failed: {e}")

# Global instance
presentation_service = ProfessionalPresentationService()
