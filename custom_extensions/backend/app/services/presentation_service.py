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
import shutil
import subprocess
import uuid
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import json

# from .slide_capture_service import slide_capture_service, SlideVideoConfig  # DISABLED - Using clean pipeline only
from .video_composer_service import video_composer_service, CompositionConfig
from .video_generation_service import video_generation_service
from .avatar_mask_service import AvatarMaskService

logger = logging.getLogger(__name__)

@dataclass
class PresentationRequest:
    """Request configuration for video presentation generation."""
    slide_url: str
    voiceover_texts: List[str]
    # NEW: Accept actual slide data instead of just URL
    slides_data: Optional[List[Dict[str, Any]]] = None  # Actual slide content with text, props, etc.
    theme: Optional[str] = "dark-purple"  # Theme for slide generation
    avatar_code: Optional[str] = None  # Will be dynamically selected if None
    slide_only: bool = False  # Flag to generate slide-only video (no AI avatar)
    use_avatar_mask: bool = True  # Flag to use new avatar mask service (OpenCV + MoviePy)
    duration: float = 30.0
    layout: str = "picture_in_picture"  # side_by_side, picture_in_picture, split_screen
    quality: str = "high"  # high, medium, low
    resolution: tuple = (1920, 1080)
    project_name: str = "Generated Presentation"
    # NEW: Voice parameters
    voice_id: Optional[str] = None  # Voice ID from Elai API
    voice_provider: Optional[str] = None  # Voice provider (azure, elevenlabs, etc.)
    # NEW: Transitions between slides
    transitions: Optional[List[Dict[str, Any]]] = None  # Transition effects between slides

@dataclass
class PresentationJob:
    """Job tracking for presentation generation."""
    job_id: str
    status: str  # queued, processing, completed, failed
    progress: float = 0.0
    error: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    slide_image_path: Optional[str] = None  # Path to generated slide image for debugging
    created_at: datetime = None
    completed_at: Optional[datetime] = None
    last_heartbeat: Optional[datetime] = None  # Track last heartbeat to prevent timeouts
    
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
        
        # Heartbeat configuration
        self.heartbeat_interval = 30  # Send heartbeat every 30 seconds
        self.heartbeat_tasks: Dict[str, asyncio.Task] = {}  # Track heartbeat tasks per job
        
        logger.info("Professional Presentation Service initialized")
    
    def _update_job_status(self, job_id: str, **kwargs):
        """
        Update job status with detailed logging to prevent connection timeouts.
        
        Args:
            job_id: Job ID to update
            **kwargs: Status fields to update (status, progress, error, etc.)
        """
        if job_id in self.jobs:
            job = self.jobs[job_id]
            old_status = job.status
            old_progress = job.progress
            
            for key, value in kwargs.items():
                setattr(job, key, value)
            
            # Log every status update with timestamp
            logger.info(f"🎬 [JOB_STATUS_UPDATE] Job {job_id}: {old_status}→{job.status}, {old_progress}%→{job.progress}%")
            logger.info(f"🎬 [JOB_STATUS_UPDATE] Timestamp: {datetime.now().isoformat()}")
            
            # Log specific updates
            if 'status' in kwargs:
                logger.info(f"🎬 [JOB_STATUS_UPDATE] Status changed: {old_status} → {kwargs['status']}")
            if 'progress' in kwargs:
                logger.info(f"🎬 [JOB_STATUS_UPDATE] Progress updated: {old_progress}% → {kwargs['progress']}%")
    
    async def _start_heartbeat(self, job_id: str):
        """
        Start heartbeat task for a job to prevent connection timeouts.
        
        Args:
            job_id: Job ID to start heartbeat for
        """
        logger.info(f"💓 [HEARTBEAT] Attempting to start heartbeat for job {job_id}")
        logger.info(f"💓 [HEARTBEAT] Current event loop: {asyncio.current_task()}")
        logger.info(f"💓 [HEARTBEAT] Job exists in tracking: {job_id in self.jobs}")
        async def heartbeat_task():
            """Send periodic heartbeat updates to keep connection alive."""
            logger.info(f"💓 [HEARTBEAT] Heartbeat task started for job {job_id}")
            try:
                heartbeat_count = 0
                while job_id in self.jobs:
                    job = self.jobs[job_id]
                    heartbeat_count += 1
                    
                    # Only send heartbeats for active jobs
                    if job.status in ["processing"]:
                        logger.info(f"💓 [HEARTBEAT] Job {job_id}: status={job.status}, progress={job.progress}% (beat #{heartbeat_count})")
                        logger.info(f"💓 [HEARTBEAT] Keeping connection alive - {datetime.now().isoformat()}")
                        
                        # Update last activity timestamp to show we're alive
                        job.last_heartbeat = datetime.now()
                    elif job.status in ["completed", "failed"]:
                        # Job is done, stop heartbeat
                        logger.info(f"💓 [HEARTBEAT] Job {job_id} finished with status {job.status}, stopping heartbeat after {heartbeat_count} beats")
                        break
                    else:
                        logger.info(f"💓 [HEARTBEAT] Job {job_id} status is {job.status}, continuing heartbeat")
                    
                    await asyncio.sleep(self.heartbeat_interval)
                    
            except asyncio.CancelledError:
                logger.info(f"💓 [HEARTBEAT] Heartbeat task cancelled for job {job_id} after {heartbeat_count} beats")
                raise  # Re-raise to properly handle cancellation
            except Exception as e:
                logger.error(f"💓 [HEARTBEAT] Heartbeat task failed for job {job_id} after {heartbeat_count} beats: {e}")
                logger.error(f"💓 [HEARTBEAT] Job status was: {self.jobs.get(job_id, {}).status if job_id in self.jobs else 'NOT_FOUND'}")
        
        # Cancel existing heartbeat if any
        if job_id in self.heartbeat_tasks:
            self.heartbeat_tasks[job_id].cancel()
        
        # Start new heartbeat task
        try:
            task = asyncio.create_task(heartbeat_task())
            self.heartbeat_tasks[job_id] = task
            logger.info(f"💓 [HEARTBEAT] Started heartbeat for job {job_id} (interval: {self.heartbeat_interval}s)")
        except Exception as e:
            logger.error(f"💓 [HEARTBEAT] Failed to start heartbeat for job {job_id}: {e}")
            # Continue without heartbeat rather than failing the job
            logger.warning(f"💓 [HEARTBEAT] Job {job_id} will continue without heartbeat")
    
    async def _stop_heartbeat(self, job_id: str):
        """
        Stop heartbeat task for a job.
        
        Args:
            job_id: Job ID to stop heartbeat for
        """
        if job_id in self.heartbeat_tasks:
            self.heartbeat_tasks[job_id].cancel()
            del self.heartbeat_tasks[job_id]
            logger.info(f"💓 [HEARTBEAT] Stopped heartbeat for job {job_id}")
    
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
            
            # Log voice parameters
            logger.info("🎤 [PRESENTATION_SERVICE] ========== PRESENTATION CREATION STARTED ==========")
            logger.info(f"🎤 [PRESENTATION_SERVICE] Job ID: {job_id}")
            logger.info("🎤 [PRESENTATION_SERVICE] Voice parameters received:")
            logger.info(f"  - voice_id: {request.voice_id}")
            logger.info(f"  - voice_provider: {request.voice_provider}")
            logger.info("🎤 [PRESENTATION_SERVICE] ========== VOICE PARAMETERS LOGGED ==========")
            
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
                    self.jobs[job_id].completed_at = datetime.now()
                    
                # Stop heartbeat for failed job (run in the main event loop)
                main_loop = asyncio.new_event_loop()
                main_loop.run_until_complete(self._stop_heartbeat(job_id))
                # CRITICAL FIX: Schedule cleanup for failed jobs too
                main_loop.run_until_complete(
                    self._schedule_job_cleanup(job_id, delay_minutes=5)
                )
                main_loop.close()
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
            logger.info(f"🎬 [PRESENTATION_PROCESSING] Starting presentation processing for job: {job_id}")
            logger.info(f"🎬 [PRESENTATION_PROCESSING] Request details:")
            logger.info(f"  - Slide URL: {request.slide_url}")
            logger.info(f"  - Theme: {request.theme}")
            logger.info(f"  - Duration: {request.duration}s")
            logger.info(f"  - Quality: {request.quality}")
            logger.info(f"  - Layout: {request.layout}")
            logger.info(f"  - Resolution: {request.resolution}")
            logger.info(f"  - Avatar Code: {request.avatar_code}")
            logger.info(f"  - Voiceover Texts Count: {len(request.voiceover_texts)}")
            logger.info(f"  - Slides Data Provided: {bool(request.slides_data)}")
            
            # Log voice parameters
            logger.info("🎤 [PRESENTATION_PROCESSING] Voice parameters:")
            logger.info(f"  - Voice ID: {request.voice_id}")
            logger.info(f"  - Voice Provider: {request.voice_provider}")
            logger.info("🎤 [PRESENTATION_PROCESSING] ========== VOICE PARAMETERS LOGGED ==========")
            
            if request.slides_data:
                logger.info(f"🎬 [PRESENTATION_PROCESSING] Slides data analysis:")
                for i, slide in enumerate(request.slides_data):
                    logger.info(f"  Slide {i+1}:")
                    logger.info(f"    - Template ID: {slide.get('templateId', 'N/A')}")
                    logger.info(f"    - Slide ID: {slide.get('slideId', 'N/A')}")
                    logger.info(f"    - Props Keys: {list(slide.get('props', {}).keys())}")
                    logger.info(f"    - Title: {slide.get('props', {}).get('title', 'N/A')}")
                    logger.info(f"    - Subtitle: {slide.get('props', {}).get('subtitle', 'N/A')}")
                    logger.info(f"    - Content: {slide.get('props', {}).get('content', 'N/A')[:100]}...")
            
            if request.voiceover_texts:
                logger.info(f"🎬 [PRESENTATION_PROCESSING] Voiceover texts:")
                for i, text in enumerate(request.voiceover_texts):
                    logger.info(f"  Text {i+1}: {text[:100]}...")
            
            # Start processing with heartbeat
            self._update_job_status(job_id, status="processing", progress=5.0)
            await self._start_heartbeat(job_id)
            
            # Step 1: Generate clean slide video
            logger.info(f"🎬 [PRESENTATION_PROCESSING] Step 1: Generating clean slide video for job {job_id}")
            self._update_job_status(job_id, progress=10.0)
            
            # Use ONLY the new clean HTML → PNG → Video pipeline (no screenshot fallback)
            try:
                # Use actual slide data if provided, otherwise extract from URL as fallback
                if request.slides_data and len(request.slides_data) > 0:
                    logger.info(f"🎬 [PRESENTATION_PROCESSING] Using provided slide data with {len(request.slides_data)} slides")
                    slides_data = request.slides_data
                    
                    # Detailed logging of slide data structure
                    logger.info(f"🎬 [PRESENTATION_PROCESSING] Detailed slide data analysis:")
                    for i, slide in enumerate(slides_data):
                        logger.info(f"  📄 Slide {i+1} Details:")
                        logger.info(f"    - Template ID: {slide.get('templateId', 'N/A')}")
                        logger.info(f"    - Slide ID: {slide.get('slideId', 'N/A')}")
                        logger.info(f"    - Props Type: {type(slide.get('props', {}))}")
                        logger.info(f"    - Props Keys: {list(slide.get('props', {}).keys())}")
                        
                        props = slide.get('props', {})
                        logger.info(f"    - Title: '{props.get('title', 'N/A')}'")
                        logger.info(f"    - Subtitle: '{props.get('subtitle', 'N/A')}'")
                        logger.info(f"    - Content: '{props.get('content', 'N/A')[:200]}...'")
                        logger.info(f"    - Voiceover Text: '{props.get('voiceoverText', 'N/A')[:200]}...'")
                        
                        # Log any additional properties
                        for key, value in props.items():
                            if key not in ['title', 'subtitle', 'content', 'voiceoverText']:
                                if isinstance(value, str) and len(value) > 100:
                                    logger.info(f"    - {key}: '{value[:100]}...'")
                                else:
                                    logger.info(f"    - {key}: {value}")
                else:
                    logger.warning("🎬 [PRESENTATION_PROCESSING] No slide data provided, trying to extract from URL as fallback")
                    # Try to extract slide props from URL or use fallback
                    slide_props = await self._extract_slide_props_from_url(request.slide_url)
                    slides_data = [slide_props]  # Convert single slide to list
                    logger.info(f"🎬 [PRESENTATION_PROCESSING] Extracted slide props: {slide_props}")
                
                # Import the clean video generation service
                from .clean_video_generation_service import clean_video_generation_service
                
                # Check if this is a multi-slide presentation
                if len(slides_data) > 1:
                    logger.info(f"🎬 [PRESENTATION_PROCESSING] MULTI-SLIDE MODE: Processing {len(slides_data)} slides")
                    final_video_path = await self._process_multi_slide_presentation(
                        job_id, slides_data, request, job
                    )
                else:
                    logger.info(f"🎬 [PRESENTATION_PROCESSING] SINGLE-SLIDE MODE: Processing 1 slide")
                    final_video_path = await self._process_single_slide_presentation(
                        job_id, slides_data[0], request, job
                    )
                
                # Step 4: Create thumbnail
                logger.info(f"Step 4: Creating thumbnail for job {job_id}")
                thumbnail_filename = f"thumbnail_{job_id}.jpg"
                thumbnail_path = self.output_dir / thumbnail_filename
                
                # Critical fix: Add explicit error handling around thumbnail creation
                try:
                    logger.info(f"🎬 [THUMBNAIL_CREATION] Starting thumbnail creation for job {job_id}")
                    await video_composer_service.create_thumbnail(
                        final_video_path,
                        str(thumbnail_path)
                    )
                    logger.info(f"🎬 [THUMBNAIL_CREATION] Thumbnail creation completed successfully for job {job_id}")
                except Exception as e:
                    logger.error(f"🎬 [THUMBNAIL_CREATION] Thumbnail creation failed for job {job_id}: {e}")
                    logger.warning(f"🎬 [THUMBNAIL_CREATION] Continuing with final completion despite thumbnail error")
                
                # CRITICAL FIX: Ensure final completion ALWAYS runs after thumbnail
                logger.info(f"🎬 [FINAL_COMPLETION] Starting final completion for job {job_id}")
                
                # Final completion update with detailed logging
                logger.info(f"🎬 [FINAL_COMPLETION] Presentation {job_id} processing completed successfully")
                logger.info(f"🎬 [FINAL_COMPLETION] Final video path: {final_video_path}")
                logger.info(f"🎬 [FINAL_COMPLETION] Thumbnail path: {str(thumbnail_path)}")
                
                # ROOT CAUSE DIAGNOSTIC: Add timing analysis
                current_time = datetime.now()
                if job_id in self.jobs:
                    job_start_time = self.jobs[job_id].created_at
                    total_processing_time = (current_time - job_start_time).total_seconds()
                    logger.info(f"🔍 [ROOT_CAUSE_DIAGNOSTIC] Job {job_id} total processing time: {total_processing_time:.1f} seconds")
                    logger.info(f"🔍 [ROOT_CAUSE_DIAGNOSTIC] Job start time: {job_start_time}")
                    logger.info(f"🔍 [ROOT_CAUSE_DIAGNOSTIC] Job completion time: {current_time}")
                    
                    if total_processing_time > 60:
                        logger.warning(f"🔍 [ROOT_CAUSE_DIAGNOSTIC] LONG PROCESSING TIME DETECTED: {total_processing_time:.1f}s")
                        logger.warning(f"🔍 [ROOT_CAUSE_DIAGNOSTIC] This may cause frontend polling timeout!")
                        logger.warning(f"🔍 [ROOT_CAUSE_DIAGNOSTIC] Frontend likely stopped polling before backend completion")
                
                # CRITICAL FIX: Update job status with all completion details - this MUST run
                try:
                    logger.info(f"🎬 [FINAL_COMPLETION] Updating job status to completed for job {job_id}")
                    logger.info(f"🔍 [ROOT_CAUSE_DIAGNOSTIC] About to send FINAL 100% status to frontend...")
                    
                    self._update_job_status(
                        job_id,
                        status="completed",
                        progress=100.0,
                        completed_at=datetime.now(),
                        video_url=f"/presentations/{job_id}/video",
                        thumbnail_url=f"/presentations/{job_id}/thumbnail"
                    )
                    logger.info(f"🎬 [FINAL_COMPLETION] Job status update completed successfully for job {job_id}")
                    logger.info(f"🔍 [ROOT_CAUSE_DIAGNOSTIC] ✅ FINAL 100% STATUS SENT TO FRONTEND!")
                    
                except Exception as e:
                    logger.error(f"🎬 [FINAL_COMPLETION] CRITICAL ERROR: Failed to update job status for {job_id}: {e}")
                    raise  # Re-raise this as it's critical
                
                # Stop heartbeat for completed job
                try:
                    logger.info(f"🎬 [FINAL_COMPLETION] Stopping heartbeat for job {job_id}")
                    await self._stop_heartbeat(job_id)
                    logger.info(f"🎬 [FINAL_COMPLETION] Heartbeat stopped successfully for job {job_id}")
                except Exception as e:
                    logger.error(f"🎬 [FINAL_COMPLETION] Failed to stop heartbeat for job {job_id}: {e}")
                    # Don't raise here as job is already completed
                
                logger.info(f"🎬 [FINAL_COMPLETION] Job {job_id} marked as completed with all URLs set")
                logger.info(f"🎬 [FINAL_COMPLETION] Frontend should now receive completion status and trigger download")
                logger.info(f"🎬 [FINAL_COMPLETION] *** COMPLETION PROCESS FINISHED FOR JOB {job_id} ***")
                
                # CRITICAL FIX: Schedule job cleanup after completion to prevent resource buildup
                # Clean up completed job from memory after a delay to allow frontend to download
                asyncio.create_task(self._schedule_job_cleanup(job_id, delay_minutes=30))
                
            except Exception as e:
                logger.error(f"Presentation processing failed: {e}")
                raise
            
        except Exception as e:
            logger.error(f"🎬 [PRESENTATION_FAILED] Presentation {job_id} failed: {e}")
            
            # Update job status with failure details
            self._update_job_status(
                job_id,
                status="failed",
                error=str(e),
                completed_at=datetime.now()
            )
            
            # Stop heartbeat for failed job
            await self._stop_heartbeat(job_id)
            
            logger.error(f"🎬 [PRESENTATION_FAILED] Job {job_id} marked as failed, heartbeat stopped")

    async def _process_single_slide_presentation(self, job_id: str, slide_data: Dict[str, Any], request: PresentationRequest, job: PresentationJob) -> str:
        """
        Process a single slide presentation (existing workflow).
        
        Args:
            job_id: Job ID
            slide_data: Single slide data
            request: Presentation request
            job: Job tracking object
            
        Returns:
            Path to final video
        """
        try:
            logger.info(f"🎬 [SINGLE_SLIDE_PROCESSING] Processing single slide presentation")
            
            # Import the clean video generation service
            from .clean_video_generation_service import clean_video_generation_service
            
            # Check if this is a slide-only video (no avatar needed)
            if request.slide_only:
                # Use hardcoded 10 second duration for debug rendering (fast testing)
                debug_duration = 10.0
                logger.info(f"🐛 [DEBUG_MODE] SINGLE-SLIDE SLIDE-ONLY MODE: Generating slide video with hardcoded {debug_duration}s duration (NO AVATAR)")
                
                # Generate slide video with debug duration
                result = await clean_video_generation_service.generate_avatar_slide_video(
                    slide_props=slide_data,
                    theme=request.theme or "dark-purple",
                    slide_duration=debug_duration,
                    quality=request.quality
                )
                
                if not result["success"]:
                    raise Exception(f"Slide video generation failed: {result['error']}")
                
                slide_video_path = result["video_path"]
                output_filename = f"presentation_{job_id}.mp4"
                output_path = self.output_dir / output_filename
                
                import shutil
                shutil.copy2(slide_video_path, output_path)
                final_video_path = str(output_path)
                self._update_job_status(job_id, progress=90.0)
                
                # Cleanup temporary files
                await self._cleanup_temp_files([slide_video_path])
                
                return final_video_path
            
            # OPTIMIZATION: Generate avatar video FIRST to get actual duration
            logger.info(f"🎬 [SINGLE_SLIDE_PROCESSING] Step 1: Generating avatar video (to determine duration)")
            avatar_video_path = await self._generate_avatar_video(
                request.voiceover_texts,
                request.avatar_code,
                request.duration,
                request.use_avatar_mask,
                voice_id=request.voice_id,
                voice_provider=request.voice_provider
            )
            self._update_job_status(job_id, progress=40.0)
            
            logger.info(f"🎬 [SINGLE_SLIDE_PROCESSING] Avatar video generated: {avatar_video_path}")
            
            # OPTIMIZATION: Extract actual duration from avatar video
            avatar_duration = await self._get_video_duration_from_file(avatar_video_path)
            logger.info(f"🎬 [SINGLE_SLIDE_PROCESSING] Avatar video duration: {avatar_duration:.2f} seconds")
            logger.info(f"🎬 [SINGLE_SLIDE_PROCESSING] Frame optimization: Using avatar duration instead of requested {request.duration}s")
            
            # Generate slide video with MATCHING duration to avatar
            logger.info(f"🎬 [SINGLE_SLIDE_PROCESSING] Step 2: Generating slide video with matching duration ({avatar_duration:.2f}s)")
            result = await clean_video_generation_service.generate_avatar_slide_video(
                slide_props=slide_data,
                theme=request.theme or "dark-purple",
                slide_duration=avatar_duration,  # Use avatar duration instead of request.duration
                quality=request.quality
            )
            
            if not result["success"]:
                raise Exception(f"Slide video generation failed: {result['error']}")
            
            slide_video_path = result["video_path"]
            slide_image_paths = result.get("slide_image_paths", [])
            logger.info(f"🎬 [SINGLE_SLIDE_PROCESSING] Slide video generated: {slide_video_path}")
            
            # Store the slide image path for debugging
            if slide_image_paths and len(slide_image_paths) > 0:
                job.slide_image_path = slide_image_paths[0]
            
            self._update_job_status(job_id, progress=70.0)
            
            # Compose final video
            logger.info(f"🎬 [SINGLE_SLIDE_PROCESSING] Composing final video")
            output_filename = f"presentation_{job_id}.mp4"
            output_path = self.output_dir / output_filename
            
            # Extract avatar position from slide data if available
            avatar_position = slide_data.get('avatarPosition')
            if avatar_position:
                logger.info(f"🎬 [SINGLE_SLIDE_PROCESSING] Using custom avatar position from template: {avatar_position}")
            else:
                logger.info(f"🎬 [SINGLE_SLIDE_PROCESSING] No custom avatar position, using default")
            
            composition_config = CompositionConfig(
                output_path=str(output_path),
                resolution=request.resolution,
                quality=request.quality,
                layout=request.layout,
                avatar_position=avatar_position  # Pass custom avatar position if available
            )
            
            final_video_path = await video_composer_service.compose_presentation(
                slide_video_path,
                avatar_video_path,
                composition_config
            )
            self._update_job_status(job_id, progress=90.0)
            
            logger.info(f"🎬 [SINGLE_SLIDE_PROCESSING] Final video composed: {final_video_path}")
            
            # Cleanup temporary files
            await self._cleanup_temp_files([slide_video_path, avatar_video_path])
            
            return final_video_path
            
        except Exception as e:
            logger.error(f"Single slide processing failed: {e}")
            raise

    async def _process_multi_slide_presentation(self, job_id: str, slides_data: List[Dict[str, Any]], request: PresentationRequest, job: PresentationJob) -> str:
        """
        Process a multi-slide presentation with individual avatar videos for each slide.
        OPTIMIZED: Initiates all avatar videos in parallel first, then processes sequentially.
        
        Args:
            job_id: Job ID
            slides_data: List of slide data
            request: Presentation request
            job: Job tracking object
            
        Returns:
            Path to final concatenated video
        """
        try:
            logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Processing multi-slide presentation with {len(slides_data)} slides")
            
            # Log mode
            if request.slide_only:
                logger.info(f"🐛 [DEBUG_MODE] SLIDE-ONLY MODE ENABLED: Skipping avatar generation (Debug Render)")
            else:
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Standard mode: Will generate avatars for each slide")
            
            # Import the clean video generation service
            from .clean_video_generation_service import clean_video_generation_service
            
            # List to store all individual slide videos
            individual_videos = []
            temp_files_to_cleanup = []
            
            # OPTIMIZATION: If not slide-only mode, initiate ALL avatar videos in parallel at once
            avatar_video_ids = []
            if not request.slide_only:
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] 🚀 OPTIMIZATION: Initiating all {len(slides_data)} avatar videos in parallel")
                avatar_video_ids = await self._initiate_all_avatar_videos(
                    slides_data=slides_data,
                    avatar_code=request.avatar_code,
                    voice_id=request.voice_id,
                    voice_provider=request.voice_provider
                )
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] ✅ All avatar videos rendering in parallel")
            
            # Process each slide individually (avatar videos are already rendering in parallel)
            for slide_index, slide_data in enumerate(slides_data):
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Processing slide {slide_index + 1}/{len(slides_data)}")
                
                # Update progress based on slide processing (more granular)
                base_progress = 10 + (slide_index * 70 // len(slides_data))
                self._update_job_status(job_id, progress=base_progress)
                
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Starting processing for slide {slide_index + 1} - Progress: {base_progress}%")
                
                # Extract voiceover text for this specific slide
                # Check both slide level and props level (frontend can send in either location)
                slide_voiceover_text = slide_data.get('voiceoverText', '') or slide_data.get('props', {}).get('voiceoverText', '')
                if not slide_voiceover_text:
                    # Fallback to generic text if no voiceover text found
                    logger.warning(f"🎬 [MULTI_SLIDE_PROCESSING] ⚠️ No voiceover text found for slide {slide_index + 1}, using placeholder")
                    slide_voiceover_text = f"Welcome to slide {slide_index + 1}. This presentation covers important topics."
                else:
                    logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] ✅ Found voiceover text for slide {slide_index + 1}: '{slide_voiceover_text[:100]}...'")
                
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Slide {slide_index + 1} voiceover: {slide_voiceover_text[:100]}...")
                
                # Check if this is slide-only mode
                if request.slide_only:
                    # Use hardcoded 10 second duration for debug rendering (fast testing)
                    debug_duration = 10.0
                    logger.info(f"🐛 [DEBUG_MODE] SLIDE-ONLY MODE: Generating slide video with hardcoded {debug_duration}s duration (NO AVATAR)")
                    slide_result = await clean_video_generation_service.generate_avatar_slide_video(
                        slide_props=slide_data,
                        theme=request.theme or "dark-purple",
                        slide_duration=debug_duration,
                        quality=request.quality
                    )
                    
                    if not slide_result["success"]:
                        raise Exception(f"Slide {slide_index + 1} video generation failed: {slide_result['error']}")
                    
                    slide_video_path = slide_result["video_path"]
                    temp_files_to_cleanup.append(slide_video_path)
                    individual_videos.append(slide_video_path)
                    logger.info(f"🐛 [DEBUG_MODE] Slide {slide_index + 1} video generated (no avatar): {slide_video_path}")
                    continue
                
                # OPTIMIZATION: Wait for avatar video (already rendering in parallel)
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Step 1: Waiting for avatar video {avatar_video_ids[slide_index]} (slide {slide_index + 1})")
                
                # Update progress to show avatar wait started
                avatar_start_progress = base_progress + 10
                self._update_job_status(job_id, progress=avatar_start_progress)
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Waiting for avatar for slide {slide_index + 1} - Progress: {avatar_start_progress}%")
                
                # Wait for the pre-initiated avatar video
                avatar_video_path = await self._wait_for_avatar_video(
                    video_id=avatar_video_ids[slide_index],
                    job_id=job_id,
                    slide_index=slide_index,
                    start_progress=base_progress + 10,
                    end_progress=base_progress + 30
                )
                temp_files_to_cleanup.append(avatar_video_path)
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Avatar video for slide {slide_index + 1} ready: {avatar_video_path}")
                
                # OPTIMIZATION: Extract actual duration from avatar video
                avatar_duration = await self._get_video_duration_from_file(avatar_video_path)
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Slide {slide_index + 1} avatar duration: {avatar_duration:.2f} seconds")
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Frame optimization: Using avatar duration instead of requested {request.duration}s")
                
                # Generate slide video with MATCHING duration to avatar
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Step 2: Generating slide video for slide {slide_index + 1} with matching duration ({avatar_duration:.2f}s)")
                slide_result = await clean_video_generation_service.generate_avatar_slide_video(
                    slide_props=slide_data,
                    theme=request.theme or "dark-purple",
                    slide_duration=avatar_duration,  # Use avatar duration instead of request.duration
                    quality=request.quality
                )
                
                if not slide_result["success"]:
                    raise Exception(f"Slide {slide_index + 1} video generation failed: {slide_result['error']}")
                
                slide_video_path = slide_result["video_path"]
                temp_files_to_cleanup.append(slide_video_path)
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Slide {slide_index + 1} video generated: {slide_video_path}")
                
                # Compose individual slide + avatar video with progress updates
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Composing individual video for slide {slide_index + 1}")
                individual_output_path = str(self.output_dir / f"slide_{slide_index + 1}_{job_id}.mp4")
                
                # Update progress for composition start
                composition_start_progress = base_progress + 30
                self._update_job_status(job_id, progress=composition_start_progress)
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Video composition started for slide {slide_index + 1} - Progress: {composition_start_progress}%")
                
                # Extract avatar position from slide data if available
                avatar_position = slide_data.get('avatarPosition')
                if avatar_position:
                    logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Slide {slide_index + 1}: Using custom avatar position from template: {avatar_position}")
                else:
                    logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Slide {slide_index + 1}: No custom avatar position, using default")
                
                composition_config = CompositionConfig(
                    output_path=individual_output_path,
                    resolution=request.resolution,
                    quality=request.quality,
                    layout=request.layout,
                    avatar_position=avatar_position  # Pass custom avatar position if available
                )
                
                individual_video_path = await video_composer_service.compose_presentation(
                    slide_video_path,
                    avatar_video_path,
                    composition_config
                )
                
                # Update progress for composition complete
                composition_end_progress = base_progress + 50
                self._update_job_status(job_id, progress=composition_end_progress)
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Video composition completed for slide {slide_index + 1} - Progress: {composition_end_progress}%")
                
                individual_videos.append(individual_video_path)
                temp_files_to_cleanup.append(individual_video_path)
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Individual video for slide {slide_index + 1} composed: {individual_video_path}")
            
            self._update_job_status(job_id, progress=80.0)
            
            # Concatenate all individual videos into final presentation
            logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Concatenating {len(individual_videos)} videos into final presentation")
            
            # Log if this is debug mode (slide-only)
            if request.slide_only:
                logger.info(f"🐛 [DEBUG_MODE] Slide-only mode: Videos contain NO AVATAR, only slide content")
            
            # Use transitions if provided, otherwise use simple concatenation
            if request.transitions and len(request.transitions) > 0:
                logger.info(f"🎞️ [MULTI_SLIDE_PROCESSING] Using {len(request.transitions)} transitions for concatenation")
                final_video_path = await self._concatenate_videos_with_transitions(
                    individual_videos, 
                    job_id, 
                    request.transitions
                )
            else:
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Using simple concatenation (no transitions)")
                final_video_path = await self._concatenate_videos(individual_videos, job_id)
            
            self._update_job_status(job_id, progress=90.0)
            
            logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Final multi-slide video created: {final_video_path}")
            
            # Cleanup temporary files
            await self._cleanup_temp_files(temp_files_to_cleanup)
            
            return final_video_path
            
        except Exception as e:
            logger.error(f"Multi-slide processing failed: {e}")
            raise

    async def _concatenate_videos(self, video_paths: List[str], job_id: str) -> str:
        """
        Concatenate multiple videos into a single video using FFmpeg.
        
        Args:
            video_paths: List of video file paths to concatenate
            job_id: Job ID for output filename
            
        Returns:
            Path to concatenated video
        """
        try:
            logger.info(f"🎬 [VIDEO_CONCATENATION] Concatenating {len(video_paths)} videos")
            
            # Validate that all video files exist
            for i, video_path in enumerate(video_paths):
                if not os.path.exists(video_path):
                    logger.error(f"🎬 [VIDEO_CONCATENATION] Video file {i+1} not found: {video_path}")
                    raise FileNotFoundError(f"Video file {i+1} not found: {video_path}")
                else:
                    file_size = os.path.getsize(video_path)
                    logger.info(f"🎬 [VIDEO_CONCATENATION] Video file {i+1} exists: {video_path} ({file_size} bytes)")
            
            # Convert relative paths to absolute paths
            absolute_video_paths = []
            for video_path in video_paths:
                if not os.path.isabs(video_path):
                    # Convert relative path to absolute path
                    absolute_path = os.path.abspath(video_path)
                    logger.info(f"🎬 [VIDEO_CONCATENATION] Converting relative path '{video_path}' to absolute path '{absolute_path}'")
                    absolute_video_paths.append(absolute_path)
                else:
                    absolute_video_paths.append(video_path)
            
            # Create a temporary file list for FFmpeg
            import tempfile
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
                for video_path in absolute_video_paths:
                    f.write(f"file '{video_path}'\n")
                concat_list_path = f.name
            
            logger.info(f"🎬 [VIDEO_CONCATENATION] Created concat list file: {concat_list_path}")
            logger.info(f"🎬 [VIDEO_CONCATENATION] Video paths in concat list:")
            for i, path in enumerate(absolute_video_paths):
                logger.info(f"  {i+1}: {path}")
            
            # Output path for concatenated video
            output_filename = f"presentation_{job_id}.mp4"
            output_path = str(self.output_dir / output_filename)
            
            # FFmpeg command to concatenate videos
            import subprocess
            cmd = [
                'ffmpeg',
                '-f', 'concat',
                '-safe', '0',
                '-i', concat_list_path,
                '-c', 'copy',  # Copy streams without re-encoding for speed
                '-y',  # Overwrite output file
                output_path
            ]
            
            logger.info(f"🎬 [VIDEO_CONCATENATION] Running FFmpeg command: {' '.join(cmd)}")
            
            # Run FFmpeg
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            # Clean up temporary concat list file
            try:
                os.unlink(concat_list_path)
            except:
                pass
            
            if result.returncode != 0:
                logger.error(f"🎬 [VIDEO_CONCATENATION] FFmpeg failed: {result.stderr}")
                raise Exception(f"Video concatenation failed: {result.stderr}")
            
            logger.info(f"🎬 [VIDEO_CONCATENATION] Successfully concatenated videos to: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Video concatenation failed: {e}")
            raise

    async def _check_video_has_audio(self, video_path: str) -> bool:
        """
        Check if a video file has an audio stream.
        
        Args:
            video_path: Path to video file
            
        Returns:
            True if video has audio, False otherwise
        """
        try:
            probe_cmd = [
                'ffprobe',
                '-v', 'error',
                '-select_streams', 'a',
                '-show_entries', 'stream=codec_type',
                '-of', 'default=noprint_wrappers=1',
                video_path
            ]
            result = subprocess.run(probe_cmd, capture_output=True, text=True, timeout=10)
            has_audio = bool(result.stdout.strip())
            logger.info(f"🎞️ [AUDIO_CHECK] {os.path.basename(video_path)}: has_audio={has_audio}")
            return has_audio
        except Exception as e:
            logger.warning(f"🎞️ [AUDIO_CHECK] Failed to check audio for {video_path}: {e}")
            return False  # Assume no audio if probe fails

    async def _concatenate_videos_with_transitions(
        self,
        video_paths: List[str],
        job_id: str,
        transitions: List[Dict[str, Any]]
    ) -> str:
        """
        Concatenate videos with fade transitions using FFmpeg xfade filter.
        
        Args:
            video_paths: List of paths to individual slide videos
            job_id: Job ID for output filename
            transitions: List of transition configurations
            
        Returns:
            Path to final concatenated video with transitions
        """
        try:
            logger.info(f"🎞️ [CONCATENATION_WITH_TRANSITIONS] Concatenating {len(video_paths)} videos with transitions")
            
            if not video_paths:
                logger.error("🎞️ [CONCATENATION_WITH_TRANSITIONS] No video files to concatenate")
                raise ValueError("No video files to concatenate")
            
            if len(video_paths) == 1:
                # If only one slide - just copy it
                output_filename = f"presentation_{job_id}.mp4"
                output_path = str(self.output_dir / output_filename)
                shutil.copy(video_paths[0], output_path)
                logger.info(f"🎞️ [CONCATENATION_WITH_TRANSITIONS] Single video, copied directly: {output_path}")
                return output_path
            
            # Validate all video files exist
            for i, video_path in enumerate(video_paths):
                if not os.path.exists(video_path):
                    logger.error(f"🎞️ [CONCATENATION_WITH_TRANSITIONS] Video file {i+1} not found: {video_path}")
                    raise FileNotFoundError(f"Video file {i+1} not found: {video_path}")
            
            # Check if videos have audio streams (for debug mode with slide-only videos)
            has_audio = await self._check_video_has_audio(video_paths[0])
            logger.info(f"🎞️ [CONCATENATION_WITH_TRANSITIONS] Videos have audio: {has_audio}")
            if not has_audio:
                logger.info(f"🐛 [DEBUG_MODE] Video-only mode detected: Will use xfade without audio crossfade")
            
            # Get duration of each video using ffprobe
            durations = []
            for i, video_path in enumerate(video_paths):
                probe_cmd = [
                    'ffprobe',
                    '-v', 'error',
                    '-show_entries', 'format=duration',
                    '-of', 'default=noprint_wrappers=1:nokey=1',
                    video_path
                ]
                result = subprocess.run(probe_cmd, capture_output=True, text=True)
                duration = float(result.stdout.strip())
                durations.append(duration)
                logger.info(f"  🎞️ Video {i+1}: {duration:.2f}s - {os.path.basename(video_path)}")
            
            # Map frontend transition types to FFmpeg xfade types
            # Most transitions match FFmpeg names directly from https://trac.ffmpeg.org/wiki/Xfade
            # Only 'none' needs special handling (no transition)
            transition_type_map = {
                'none': None,  # No transition, will use minimal fade
                # All other transitions use their FFmpeg xfade names directly:
                # fade, fadeblack, fadewhite, fadegrays
                # wipeleft, wiperight, wipeup, wipedown, wipetl, wipetr, wipebl, wipebr
                # slideleft, slideright, slideup, slidedown
                # smoothleft, smoothright, smoothup, smoothdown
                # circlecrop, circleclose, circleopen, rectcrop
                # horzclose, horzopen, vertclose, vertopen
                # diagbl, diagbr, diagtl, diagtr
                # hlslice, hrslice, vuslice, vdslice
                # dissolve, pixelize, radial, hblur, distance
                # squeezev, squeezeh, zoomin
                # hlwind, hrwind, vuwind, vdwind
                # coverleft, coverright, coverup, coverdown
                # revealleft, revealright, revealup, revealdown
            }
            
            # Build FFmpeg command with xfade filters
            inputs = []
            filter_complex_parts = []
            
            # Add all input files
            for i, video_path in enumerate(video_paths):
                inputs.extend(['-i', video_path])
            
            # Build filter_complex for sequential fade transitions
            offset = 0  # Transition start time
            current_video_stream = '[0:v]'
            current_audio_stream = '[0:a]'
            
            for i in range(len(video_paths) - 1):
                next_video_stream = f'[{i+1}:v]'
                next_audio_stream = f'[{i+1}:a]'
                output_video_stream = f'[v{i}]' if i < len(video_paths) - 2 else '[vout]'
                output_audio_stream = f'[a{i}]' if i < len(video_paths) - 2 else '[aout]'
                
                # Get transition config for this segment
                transition_config = transitions[i] if i < len(transitions) else {'type': 'none', 'duration': 0.5}
                transition_type_raw = transition_config.get('type', 'none')
                transition_duration = float(transition_config.get('duration', 0.5))
                
                # Map transition type - if not in map, use the raw type directly (FFmpeg xfade names)
                transition_type_ffmpeg = transition_type_map.get(transition_type_raw)
                if transition_type_ffmpeg is None and transition_type_raw != 'none':
                    # Type not in map, assume it's a valid FFmpeg xfade name
                    transition_type_ffmpeg = transition_type_raw
                
                logger.info(f"  🎞️ Transition {i+1}: {transition_type_raw} → {transition_type_ffmpeg} ({transition_duration}s)")
                
                # Calculate offset: sum of all previous videos minus overlap
                if i > 0:
                    offset += durations[i] - transition_duration
                else:
                    offset = durations[i] - transition_duration
                
                # Add xfade filter for video (if transition is not 'none')
                if transition_type_ffmpeg:
                    xfade_filter = (
                        f"{current_video_stream}{next_video_stream}"
                        f"xfade=transition={transition_type_ffmpeg}:"
                        f"duration={transition_duration}:"
                        f"offset={offset:.3f}"
                        f"{output_video_stream}"
                    )
                    filter_complex_parts.append(xfade_filter)
                    current_video_stream = output_video_stream
                else:
                    # No transition - just use concat
                    logger.info(f"  🎞️ No transition for segment {i+1}, will use simple cut")
                    # For 'none' transition, we still need to handle it, but without crossfade
                    # We'll use a simple concat approach for this segment
                    xfade_filter = (
                        f"{current_video_stream}{next_video_stream}"
                        f"xfade=transition=fade:"  # Use minimal fade
                        f"duration=0.01:"  # Extremely short duration
                        f"offset={offset:.3f}"
                        f"{output_video_stream}"
                    )
                    filter_complex_parts.append(xfade_filter)
                    current_video_stream = output_video_stream
                
                # Add acrossfade filter for audio (only if videos have audio)
                if has_audio:
                    if transition_type_ffmpeg:
                        acrossfade_filter = (
                            f"{current_audio_stream}{next_audio_stream}"
                            f"acrossfade=d={transition_duration}:"
                            f"c1=tri:"  # Triangular curve for fade out
                            f"c2=tri"   # Triangular curve for fade in
                            f"{output_audio_stream}"
                        )
                        filter_complex_parts.append(acrossfade_filter)
                        current_audio_stream = output_audio_stream
                    else:
                        # No audio crossfade for 'none' transition
                        acrossfade_filter = (
                            f"{current_audio_stream}{next_audio_stream}"
                            f"acrossfade=d=0.01:"  # Extremely short duration
                            f"c1=tri:"
                            f"c2=tri"
                            f"{output_audio_stream}"
                        )
                        filter_complex_parts.append(acrossfade_filter)
                        current_audio_stream = output_audio_stream
                else:
                    logger.info(f"  🐛 [DEBUG_MODE] Skipping audio crossfade for segment {i+1} (no audio stream)")
            
            # Build final filter_complex string
            filter_complex = ';'.join(filter_complex_parts)
            
            # Output path for concatenated video
            output_filename = f"presentation_{job_id}.mp4"
            output_path = str(self.output_dir / output_filename)
            
            # Form final FFmpeg command - adjust based on audio presence
            if has_audio:
                # Videos with audio (standard mode)
                ffmpeg_cmd = [
                    'ffmpeg',
                    '-y',  # Overwrite output file
                    *inputs,
                    '-filter_complex', filter_complex,
                    '-map', '[vout]',
                    '-map', '[aout]',
                    '-c:v', 'libx264',
                    '-preset', 'medium',
                    '-crf', '23',
                    '-pix_fmt', 'yuv420p',
                    '-c:a', 'aac',
                    '-b:a', '192k',
                    '-movflags', '+faststart',
                    output_path
                ]
            else:
                # Videos without audio (debug mode)
                logger.info(f"🐛 [DEBUG_MODE] Building FFmpeg command for video-only (no audio mapping)")
                ffmpeg_cmd = [
                    'ffmpeg',
                    '-y',  # Overwrite output file
                    *inputs,
                    '-filter_complex', filter_complex,
                    '-map', '[vout]',  # Video only, no audio mapping
                    '-c:v', 'libx264',
                    '-preset', 'medium',
                    '-crf', '23',
                    '-pix_fmt', 'yuv420p',
                    '-movflags', '+faststart',
                    output_path
                ]
            
            logger.info(f"🎞️ [CONCATENATION_WITH_TRANSITIONS] Running FFmpeg with xfade transitions...")
            logger.debug(f"Command: {' '.join(ffmpeg_cmd)}")
            
            # Execute command
            process = subprocess.run(
                ffmpeg_cmd,
                capture_output=True,
                text=True,
                timeout=600  # 10 minutes timeout
            )
            
            if process.returncode != 0:
                logger.error(f"🎞️ [CONCATENATION_WITH_TRANSITIONS] FFmpeg failed: {process.stderr}")
                raise Exception(f"FFmpeg concatenation with transitions failed: {process.stderr}")
            
            # Check result
            if not os.path.exists(output_path):
                logger.error(f"🎞️ [CONCATENATION_WITH_TRANSITIONS] Output file not created: {output_path}")
                raise Exception(f"Output file not created: {output_path}")
            
            output_size = os.path.getsize(output_path) / (1024 * 1024)  # MB
            logger.info(f"🎞️ [CONCATENATION_WITH_TRANSITIONS] ✅ Concatenation with transitions successful!")
            logger.info(f"🎞️ [CONCATENATION_WITH_TRANSITIONS] Output: {output_path}")
            logger.info(f"🎞️ [CONCATENATION_WITH_TRANSITIONS] Size: {output_size:.2f} MB")
            
            return output_path
            
        except subprocess.TimeoutExpired:
            logger.error(f"🎞️ [CONCATENATION_WITH_TRANSITIONS] FFmpeg timeout after 10 minutes")
            raise Exception("Video concatenation with transitions timeout")
        except Exception as e:
            logger.error(f"🎞️ [CONCATENATION_WITH_TRANSITIONS] Error during concatenation: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            raise
    
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
            # Import at module level to avoid circular imports
            from fastapi import Depends
            import asyncpg
            
            # Extract project ID from URL
            project_id_match = re.search(r'/projects/view/(\d+)', slide_url)
            if not project_id_match:
                logger.warning(f"Could not extract project ID from URL: {slide_url}")
                return self._get_fallback_slide()
            
            project_id = int(project_id_match.group(1))
            logger.info(f"Extracted project ID: {project_id}")
            
            # For now, just use fallback since database access needs refactoring
            # TODO: Implement proper database access without circular imports
            logger.info(f"Database integration needed for project {project_id}, using fallback")
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
    
    async def _get_video_duration_from_file(self, video_path: str) -> float:
        """
        Extract video duration from file using ffprobe.
        
        Args:
            video_path: Path to video file
            
        Returns:
            Duration in seconds (float)
        """
        try:
            if not os.path.exists(video_path):
                logger.error(f"🎬 [DURATION_EXTRACT] Video file not found: {video_path}")
                return 5.0  # Default fallback
            
            cmd = [
                'ffprobe',
                '-v', 'quiet',
                '-show_entries', 'format=duration',
                '-of', 'json',
                video_path
            ]
            
            logger.info(f"🎬 [DURATION_EXTRACT] Extracting duration from: {video_path}")
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode != 0:
                logger.warning(f"🎬 [DURATION_EXTRACT] ffprobe failed: {result.stderr}")
                return 5.0  # Default fallback
            
            data = json.loads(result.stdout)
            duration = float(data.get('format', {}).get('duration', 5.0))
            
            logger.info(f"🎬 [DURATION_EXTRACT] Extracted duration: {duration:.2f} seconds")
            return duration
            
        except subprocess.TimeoutExpired:
            logger.error(f"🎬 [DURATION_EXTRACT] ffprobe timeout")
            return 5.0
        except Exception as e:
            logger.error(f"🎬 [DURATION_EXTRACT] Error extracting duration: {str(e)}")
            return 5.0
    
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
    
    async def _generate_avatar_video_with_progress(
        self, 
        voiceover_texts: List[str], 
        avatar_code: Optional[str], 
        duration: float, 
        use_avatar_mask: bool, 
        job_id: str, 
        start_progress: float, 
        end_progress: float,
        voice_id: Optional[str] = None,
        voice_provider: Optional[str] = None
    ) -> str:
        """
        Generate avatar video using Elai API with progress updates.
        
        Args:
            voiceover_texts: List of voiceover texts
            avatar_code: Avatar code to use (None for auto-selection)
            duration: Video duration
            use_avatar_mask: Whether to use avatar mask
            job_id: Job ID for progress updates
            start_progress: Starting progress percentage
            end_progress: Ending progress percentage
            
        Returns:
            Path to generated avatar video
        """
        try:
            logger.info(f"🎬 [AVATAR_WITH_PROGRESS] Starting avatar generation: {start_progress}% → {end_progress}%")
            
            # Get avatar code if not provided
            if not avatar_code:
                avatar_code = await self._get_available_avatar()
                logger.info(f"🎬 [AVATAR_WITH_PROGRESS] Auto-selected avatar: {avatar_code}")
            
            # Create video with Elai API
            logger.info(f"🎤 [PRESENTATION_SERVICE] Calling video generation with voice parameters: voice_id={voice_id}, voice_provider={voice_provider}")
            result = await video_generation_service.create_video_from_texts(
                project_name="Avatar Video",
                voiceover_texts=voiceover_texts,
                avatar_code=avatar_code,
                voice_id=voice_id,
                voice_provider=voice_provider
            )
            
            if not result["success"]:
                raise Exception(f"Failed to create avatar video: {result['error']}")
            
            video_id = result["videoId"]
            logger.info(f"🎬 [AVATAR_WITH_PROGRESS] Avatar video created with ID: {video_id}")
            
            # Update progress - video creation started
            creation_progress = start_progress + ((end_progress - start_progress) * 0.2)
            self._update_job_status(job_id, progress=creation_progress)
            logger.info(f"🎬 [AVATAR_WITH_PROGRESS] Video creation started - Progress: {creation_progress}%")
            
            # Start rendering
            render_result = await video_generation_service.render_video(video_id)
            if not render_result["success"]:
                raise Exception(f"Failed to start avatar video rendering: {render_result['error']}")
            
            # Update progress - rendering started
            render_progress = start_progress + ((end_progress - start_progress) * 0.4)
            self._update_job_status(job_id, progress=render_progress)
            logger.info(f"🎬 [AVATAR_WITH_PROGRESS] Rendering started - Progress: {render_progress}%")
            
            # Wait for completion with progress updates
            avatar_video_path = await self._wait_for_avatar_completion_with_progress(
                video_id, job_id, render_progress, end_progress
            )
            
            # Final progress update
            self._update_job_status(job_id, progress=end_progress)
            logger.info(f"🎬 [AVATAR_WITH_PROGRESS] Avatar generation completed - Progress: {end_progress}%")
            
            return avatar_video_path
            
        except Exception as e:
            logger.error(f"Avatar video generation with progress failed: {e}")
            raise

    async def _initiate_avatar_video(
        self,
        voiceover_text: str,
        avatar_code: Optional[str],
        voice_id: Optional[str] = None,
        voice_provider: Optional[str] = None,
        slide_index: int = 0
    ) -> str:
        """
        Initiate avatar video creation and start rendering WITHOUT waiting for completion.
        Returns video_id immediately after rendering starts.
        
        Args:
            voiceover_text: Voiceover text for this slide
            avatar_code: Avatar code to use
            voice_id: Optional voice ID
            voice_provider: Optional voice provider
            slide_index: Slide index for logging
            
        Returns:
            video_id from Elai API
        """
        try:
            logger.info(f"🎬 [BATCH_AVATAR_INIT] Initiating avatar video for slide {slide_index + 1}")
            
            # Get avatar code if not provided
            if not avatar_code:
                avatar_code = await self._get_available_avatar()
                logger.info(f"🎬 [BATCH_AVATAR_INIT] Auto-selected avatar: {avatar_code}")
            
            # Create video with Elai API
            result = await video_generation_service.create_video_from_texts(
                project_name=f"Avatar Video - Slide {slide_index + 1}",
                voiceover_texts=[voiceover_text],
                avatar_code=avatar_code,
                voice_id=voice_id,
                voice_provider=voice_provider
            )
            
            if not result["success"]:
                raise Exception(f"Failed to create avatar video: {result['error']}")
            
            video_id = result["videoId"]
            logger.info(f"🎬 [BATCH_AVATAR_INIT] Avatar video created with ID: {video_id} for slide {slide_index + 1}")
            
            # Start rendering (but don't wait)
            render_result = await video_generation_service.render_video(video_id)
            if not render_result["success"]:
                raise Exception(f"Failed to start avatar video rendering: {render_result['error']}")
            
            logger.info(f"🎬 [BATCH_AVATAR_INIT] Rendering started for video {video_id} (slide {slide_index + 1})")
            
            return video_id
            
        except Exception as e:
            logger.error(f"🎬 [BATCH_AVATAR_INIT] Failed to initiate avatar video for slide {slide_index + 1}: {e}")
            raise

    async def _initiate_all_avatar_videos(
        self,
        slides_data: List[Dict[str, Any]],
        avatar_code: Optional[str],
        voice_id: Optional[str] = None,
        voice_provider: Optional[str] = None
    ) -> List[str]:
        """
        Initiate all avatar videos in parallel at once.
        
        Args:
            slides_data: List of all slide data
            avatar_code: Avatar code to use
            voice_id: Optional voice ID
            voice_provider: Optional voice provider
            
        Returns:
            List of video_ids in the same order as slides_data
        """
        logger.info(f"🎬 [BATCH_AVATAR] Starting parallel avatar video creation for {len(slides_data)} slides")
        
        # Create all tasks
        tasks = []
        for slide_index, slide_data in enumerate(slides_data):
            # Extract voiceover text - check both slide level and props level
            slide_voiceover_text = slide_data.get('voiceoverText', '') or slide_data.get('props', {}).get('voiceoverText', '')
            if not slide_voiceover_text:
                logger.warning(f"🎬 [BATCH_AVATAR] ⚠️ No voiceover text found for slide {slide_index + 1}, using placeholder")
                slide_voiceover_text = f"Welcome to slide {slide_index + 1}. This presentation covers important topics."
            else:
                logger.info(f"🎬 [BATCH_AVATAR] ✅ Found voiceover text for slide {slide_index + 1}: '{slide_voiceover_text[:100]}...'")
            
            # Create task for this slide
            task = self._initiate_avatar_video(
                voiceover_text=slide_voiceover_text,
                avatar_code=avatar_code,
                voice_id=voice_id,
                voice_provider=voice_provider,
                slide_index=slide_index
            )
            tasks.append(task)
        
        # Execute all tasks in parallel
        logger.info(f"🎬 [BATCH_AVATAR] Sending {len(tasks)} avatar creation requests in parallel...")
        video_ids = await asyncio.gather(*tasks)
        
        logger.info(f"🎬 [BATCH_AVATAR] All {len(video_ids)} avatar videos initiated and rendering started")
        for i, video_id in enumerate(video_ids):
            logger.info(f"  - Slide {i + 1}: {video_id}")
        
        return video_ids

    async def _wait_for_avatar_video(
        self,
        video_id: str,
        job_id: str,
        slide_index: int,
        start_progress: float,
        end_progress: float
    ) -> str:
        """
        Wait for a specific avatar video to complete and download it.
        
        Args:
            video_id: Elai video ID
            job_id: Job ID for progress updates
            slide_index: Slide index for logging
            start_progress: Starting progress percentage
            end_progress: Ending progress percentage
            
        Returns:
            Path to downloaded avatar video
        """
        logger.info(f"🎬 [BATCH_AVATAR_WAIT] Waiting for avatar video {video_id} (slide {slide_index + 1})")
        
        # Wait for completion with progress updates
        avatar_video_path = await self._wait_for_avatar_completion_with_progress(
            video_id, job_id, start_progress, end_progress
        )
        
        logger.info(f"🎬 [BATCH_AVATAR_WAIT] Avatar video ready: {avatar_video_path} (slide {slide_index + 1})")
        
        return avatar_video_path

    async def _generate_avatar_video(
        self, 
        voiceover_texts: List[str], 
        avatar_code: Optional[str], 
        duration: float, 
        use_avatar_mask: bool = True,
        voice_id: Optional[str] = None,
        voice_provider: Optional[str] = None
    ) -> str:
        """
        Generate avatar video using Elai API.
        
        Args:
            voiceover_texts: List of voiceover texts
            avatar_code: Avatar code to use (None for auto-selection)
            duration: Video duration
            use_avatar_mask: Whether to use avatar mask service
            voice_id: Optional voice ID from Elai API
            voice_provider: Optional voice provider (azure, elevenlabs, etc.)
            
        Returns:
            Path to generated avatar video
        """
        try:
            logger.info(f"🎬 [_GENERATE_AVATAR_VIDEO] Starting avatar video generation...")
            logger.info(f"🎬 [_GENERATE_AVATAR_VIDEO] Parameters received:")
            logger.info(f"  - voiceover_texts_count: {len(voiceover_texts)}")
            logger.info(f"  - avatar_code: {avatar_code}")
            logger.info(f"  - duration: {duration}")
            logger.info(f"  - use_avatar_mask: {use_avatar_mask}")
            
            # Get avatar code if not provided
            if not avatar_code:
                avatar_code = await self._get_available_avatar()
                logger.info(f"🎬 [_GENERATE_AVATAR_VIDEO] Auto-selected avatar: {avatar_code}")
            else:
                logger.info(f"🎬 [_GENERATE_AVATAR_VIDEO] Using specified avatar: {avatar_code}")
            
            logger.info(f"🎬 [_GENERATE_AVATAR_VIDEO] Decision point: use_avatar_mask = {use_avatar_mask}")
            
            # Use traditional Elai API method to generate avatar video
            # Video composition will be handled by SimpleVideoComposer (not avatar mask service)
            logger.info("🎬 [_GENERATE_AVATAR_VIDEO] DECISION: Using traditional Elai API generation")
            logger.info("🎬 [_GENERATE_AVATAR_VIDEO] Video composition will use SimpleVideoComposer (OpenCV)")
            return await self._generate_with_traditional_method(
                voiceover_texts, 
                avatar_code,
                voice_id=voice_id,
                voice_provider=voice_provider
            )
            
        except Exception as e:
            logger.error(f"Avatar video generation failed: {e}")
            raise
    
    async def _generate_with_avatar_mask_service(self, voiceover_texts: List[str], avatar_code: str) -> str:
        """
        Generate avatar video using the new Avatar Mask Service (OpenCV + MoviePy).
        
        Args:
            voiceover_texts: List of voiceover texts
            avatar_code: Avatar code to use
            
        Returns:
            Path to generated avatar video
        """
        try:
            logger.info("🎬 [_GENERATE_WITH_AVATAR_MASK_SERVICE] Starting Avatar Mask Service...")
            logger.info("🎬 [_GENERATE_WITH_AVATAR_MASK_SERVICE] Initializing AvatarMaskService...")
            
            # Initialize avatar mask service
            avatar_mask_service = AvatarMaskService()
            logger.info("🎬 [_GENERATE_WITH_AVATAR_MASK_SERVICE] AvatarMaskService initialized successfully")
            
            try:
                # Generate output path
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                output_path = str(self.output_dir / f"avatar_mask_video_{timestamp}.mp4")
                
                # Create avatar mask video
                avatar_video_path = await avatar_mask_service.create_avatar_mask_video(
                    voiceover_texts=voiceover_texts,
                    avatar_code=avatar_code,
                    output_path=output_path
                )
                
                if avatar_video_path and os.path.exists(avatar_video_path):
                    logger.info(f"✅ Avatar mask video created successfully: {avatar_video_path}")
                    return avatar_video_path
                else:
                    raise Exception("Avatar mask service returned no video path")
                    
            finally:
                # Cleanup
                avatar_mask_service.cleanup()
                
        except Exception as e:
            logger.error(f"Avatar mask service failed: {str(e)}")
            raise
    
    async def _generate_with_traditional_method(
        self, 
        voiceover_texts: List[str], 
        avatar_code: str,
        voice_id: Optional[str] = None,
        voice_provider: Optional[str] = None
    ) -> str:
        """
        Generate avatar video using traditional method (Elai API + FFmpeg).
        
        Args:
            voiceover_texts: List of voiceover texts
            avatar_code: Avatar code to use
            voice_id: Optional voice ID from Elai API
            voice_provider: Optional voice provider (azure, elevenlabs, etc.)
            
        Returns:
            Path to generated avatar video
        """
        try:
            logger.info("🎬 [_GENERATE_WITH_TRADITIONAL_METHOD] Starting traditional avatar generation method")
            logger.info("🎬 [_GENERATE_WITH_TRADITIONAL_METHOD] Using Elai API + FFmpeg approach")
            
            # Try with the specified avatar first
            try:
                logger.info("🎬 [_GENERATE_WITH_TRADITIONAL_METHOD] Calling _try_generate_with_avatar...")
                avatar_video_path = await self._try_generate_with_avatar(
                    voiceover_texts, 
                    avatar_code,
                    voice_id=voice_id,
                    voice_provider=voice_provider
                )
                logger.info(f"🎬 [_GENERATE_WITH_TRADITIONAL_METHOD] Traditional method completed: {avatar_video_path}")
                return avatar_video_path
            except Exception as first_error:
                logger.warning(f"Failed to generate video with avatar '{avatar_code}': {first_error}")
                
                # If the specified avatar fails, try with a fallback avatar
                logger.info("Trying with fallback avatar...")
                try:
                    # Use a known working avatar as fallback
                    fallback_avatar = "mikhailo"  # This avatar should have a valid canvas
                    avatar_video_path = await self._try_generate_with_avatar(
                        voiceover_texts, 
                        fallback_avatar,
                        voice_id=voice_id,
                        voice_provider=voice_provider
                    )
                    logger.info(f"Successfully generated video with fallback avatar '{fallback_avatar}'")
                    return avatar_video_path
                except Exception as fallback_error:
                    logger.error(f"Failed to generate video with fallback avatar: {fallback_error}")
                    raise Exception(f"Avatar video generation failed with both primary and fallback avatars: {first_error}")
                    
        except Exception as e:
            logger.error(f"Traditional avatar generation failed: {str(e)}")
            raise
    
    async def _try_generate_with_avatar(
        self, 
        voiceover_texts: List[str], 
        avatar_code: str,
        voice_id: Optional[str] = None,
        voice_provider: Optional[str] = None
    ) -> str:
        """
        Try to generate avatar video with a specific avatar.
        
        Args:
            voiceover_texts: List of voiceover texts
            avatar_code: Avatar code to use
            voice_id: Optional voice ID from Elai API
            voice_provider: Optional voice provider (azure, elevenlabs, etc.)
            
        Returns:
            Path to generated avatar video
        """
        try:
            # Create video with Elai API
            logger.info(f"🎤 [PRESENTATION_SERVICE] Calling video generation with voice parameters: voice_id={voice_id}, voice_provider={voice_provider}")
            result = await video_generation_service.create_video_from_texts(
                project_name="Avatar Video",
                voiceover_texts=voiceover_texts,
                avatar_code=avatar_code,
                voice_id=voice_id,
                voice_provider=voice_provider
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
    
    async def _wait_for_avatar_completion_with_progress(self, video_id: str, job_id: str, start_progress: float, end_progress: float) -> str:
        """
        Wait for avatar video to complete rendering with progress updates.
        
        Args:
            video_id: Elai video ID
            job_id: Job ID for progress updates
            start_progress: Starting progress percentage
            end_progress: Ending progress percentage
            
        Returns:
            Path to downloaded avatar video
        """
        try:
            logger.info(f"🎬 [AVATAR_WAIT_WITH_PROGRESS] Waiting for avatar video: {video_id}")
            logger.info(f"🎬 [AVATAR_WAIT_WITH_PROGRESS] Progress range: {start_progress}% → {end_progress}%")
            
            max_wait_time = 15 * 60  # 15 minutes
            check_interval = 30  # 30 seconds
            start_time = datetime.now()
            consecutive_errors = 0
            max_consecutive_errors = 5
            
            while (datetime.now() - start_time).total_seconds() < max_wait_time:
                status_result = await video_generation_service.check_video_status(video_id)
                
                if not status_result["success"]:
                    logger.warning(f"🎬 [AVATAR_WAIT_WITH_PROGRESS] Failed to check video status: {status_result['error']}")
                    await asyncio.sleep(check_interval)
                    continue
                
                status = status_result["status"]
                elai_progress = status_result["progress"]
                elapsed_time = (datetime.now() - start_time).total_seconds()
                
                # Calculate our progress based on Elai's progress
                our_progress = start_progress + ((end_progress - start_progress) * (elai_progress / 100))
                
                logger.info(f"🎬 [AVATAR_WAIT_WITH_PROGRESS] Status: {status}, Elai Progress: {elai_progress}%, Our Progress: {our_progress:.1f}%")
                logger.info(f"🎬 [AVATAR_WAIT_WITH_PROGRESS] Elapsed: {elapsed_time:.1f}s")
                
                # Update our job progress based on Elai progress
                if elai_progress > 0:
                    self._update_job_status(job_id, progress=our_progress)
                
                if status in ["rendered", "ready"]:
                    download_url = status_result["downloadUrl"]
                    if download_url:
                        # Download the video
                        avatar_video_path = await self._download_avatar_video(download_url, video_id)
                        logger.info(f"🎬 [AVATAR_WAIT_WITH_PROGRESS] Avatar video downloaded: {avatar_video_path}")
                        return avatar_video_path
                    else:
                        raise Exception("Video rendered but no download URL available")
                
                elif status == "failed":
                    raise Exception(f"Avatar video rendering failed: {status}")
                elif status == "error":
                    consecutive_errors += 1
                    logger.warning(f"🎬 [AVATAR_WAIT_WITH_PROGRESS] Error status (consecutive: {consecutive_errors}/{max_consecutive_errors})")
                    
                    if consecutive_errors >= max_consecutive_errors:
                        raise Exception(f"Avatar video rendering failed after {consecutive_errors} consecutive errors")
                else:
                    consecutive_errors = 0
                
                await asyncio.sleep(check_interval)
            
            raise Exception("Avatar video rendering timeout")
            
        except Exception as e:
            logger.error(f"Avatar video completion with progress failed: {e}")
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
            check_interval = 30  # 30 seconds - reduced interval for better heartbeat
            start_time = datetime.now()
            consecutive_errors = 0  # Track consecutive error statuses
            max_consecutive_errors = 5  # Maximum consecutive errors before giving up
            
            logger.info(f"💓 [AVATAR_WAITING] Starting avatar video wait loop with {check_interval}s intervals")
            
            while (datetime.now() - start_time).total_seconds() < max_wait_time:
                status_result = await video_generation_service.check_video_status(video_id)
                
                if not status_result["success"]:
                    logger.warning(f"💓 [AVATAR_WAITING] Failed to check video status: {status_result['error']}")
                    await asyncio.sleep(check_interval)
                    continue
                
                status = status_result["status"]
                progress = status_result["progress"]
                
                logger.info(f"💓 [AVATAR_WAITING] Avatar video status: {status}, Progress: {progress}%")
                logger.info(f"💓 [AVATAR_WAITING] Elapsed time: {(datetime.now() - start_time).total_seconds():.1f}s")
                
                if status in ["rendered", "ready"]:
                    download_url = status_result["downloadUrl"]
                    if download_url:
                        # Download the video
                        avatar_video_path = await self._download_avatar_video(download_url, video_id)
                        logger.info(f"Avatar video downloaded: {avatar_video_path}")
                        return avatar_video_path
                    else:
                        raise Exception("Video rendered but no download URL available")
                
                elif status == "failed":
                    # Only treat "failed" as permanent error, not "error" which can be temporary
                    raise Exception(f"Avatar video rendering failed: {status}")
                elif status == "error":
                    # Log error status but continue waiting - it might be temporary
                    consecutive_errors += 1
                    logger.warning(f"Avatar video reported error status (consecutive: {consecutive_errors}/{max_consecutive_errors}), continuing to wait...")
                    
                    # If we get too many consecutive errors, give up
                    if consecutive_errors >= max_consecutive_errors:
                        raise Exception(f"Avatar video rendering failed after {consecutive_errors} consecutive errors")
                    
                    # Don't raise exception, just continue waiting
                else:
                    # Reset consecutive error counter for non-error statuses
                    consecutive_errors = 0
                
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
    
    async def get_presentation_slide_image(self, job_id: str) -> Optional[str]:
        """
        Get the slide image file path for a presentation (for debugging).
        
        Args:
            job_id: Job ID
            
        Returns:
            Path to slide image file or None if not found
        """
        job = self.jobs.get(job_id)
        if not job:
            logger.warning(f"Job not found for slide image download: {job_id}")
            return None
        
        logger.info(f"Getting slide image for job {job_id}")
        logger.info(f"Job slide_image_path: {getattr(job, 'slide_image_path', 'Not set')}")
        
        # Look for slide image in the job's slide_image_path if available
        if hasattr(job, 'slide_image_path') and job.slide_image_path:
            if os.path.exists(job.slide_image_path):
                logger.info(f"Found slide image at job path: {job.slide_image_path}")
                return job.slide_image_path
            else:
                logger.warning(f"Job slide_image_path does not exist: {job.slide_image_path}")
        
        # Fallback: look for slide image in output directory
        slide_image_path = self.output_dir / f"slide_image_{job_id}.png"
        if slide_image_path.exists():
            logger.info(f"Found slide image at fallback path: {slide_image_path}")
            return str(slide_image_path)
        
        logger.warning(f"No slide image found for job {job_id}")
        return None
    
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
    
    async def _schedule_job_cleanup(self, job_id: str, delay_minutes: int = 30):
        """
        Schedule cleanup of a completed job after a delay.
        
        Args:
            job_id: Job ID to clean up
            delay_minutes: Minutes to wait before cleanup (default: 30)
        """
        try:
            # Wait for the specified delay
            await asyncio.sleep(delay_minutes * 60)
            
            # Check if job still exists and is completed
            if job_id in self.jobs:
                job = self.jobs[job_id]
                if job.status in ["completed", "failed"]:
                    logger.info(f"🧹 [CLEANUP] Starting scheduled cleanup for completed job: {job_id}")
                    
                    # Stop any remaining heartbeat tasks
                    if job_id in self.heartbeat_tasks:
                        self.heartbeat_tasks[job_id].cancel()
                        del self.heartbeat_tasks[job_id]
                        logger.info(f"🧹 [CLEANUP] Cleaned up heartbeat task for job {job_id}")
                    
                    # Remove job from memory
                    del self.jobs[job_id]
                    logger.info(f"🧹 [CLEANUP] Job {job_id} removed from memory after {delay_minutes} minutes")
                    
                    # Log current memory usage
                    active_jobs = len(self.jobs)
                    active_heartbeats = len(self.heartbeat_tasks)
                    logger.info(f"🧹 [CLEANUP] Memory state: {active_jobs} active jobs, {active_heartbeats} heartbeat tasks")
                else:
                    logger.info(f"🧹 [CLEANUP] Job {job_id} is still {job.status}, skipping cleanup")
            else:
                logger.info(f"🧹 [CLEANUP] Job {job_id} already cleaned up")
                
        except Exception as e:
            logger.error(f"🧹 [CLEANUP] Failed to clean up job {job_id}: {e}")

# Global instance
presentation_service = ProfessionalPresentationService()
