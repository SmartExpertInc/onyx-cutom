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

from .video_generation_service import video_generation_service
from .simple_video_composer import SimpleVideoComposer

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
                loop.run_until_complete(self._process_presentation(request, job_id))
                
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
    
    async def _wait_for_avatar_video(self, video_id: str, max_wait_time: int = 600) -> str:
        """
        Wait for avatar video to be ready and return the video URL.
        
        Args:
            video_id: Elai video ID
            max_wait_time: Maximum wait time in seconds
            
        Returns:
            Video URL when ready
        """
        import time
        start_time = time.time()
        poll_count = 0
        
        logger.info(f"🎬 [AVATAR_WAIT] Starting to wait for avatar video: {video_id}")
        logger.info(f"🎬 [AVATAR_WAIT] Max wait time: {max_wait_time}s")
        
        while time.time() - start_time < max_wait_time:
            try:
                poll_count += 1
                elapsed = time.time() - start_time
                
                # Check video status using Elai API
                logger.info(f"🎬 [AVATAR_WAIT] Poll #{poll_count}: Checking video status (elapsed: {elapsed:.1f}s)")
                response = await video_generation_service.client.get(
                    f"{video_generation_service.api_base}/videos/{video_id}",
                    headers=video_generation_service.headers
                )
                
                logger.info(f"🎬 [AVATAR_WAIT] Response status code: {response.status_code}")
                
                if response.is_success:
                    video_data = response.json()
                    status = video_data.get('status')
                    progress = video_data.get('progress', 'unknown')
                    video_url = video_data.get('url')
                    
                    logger.info(f"🎬 [AVATAR_WAIT] Elai video status: {status}, progress: {progress}")
                    logger.info(f"🎬 [AVATAR_WAIT] Video URL in response: {video_url[:100] if video_url else 'None'}...")
                    
                    if status == 'ready':
                        if video_url:
                            logger.info(f"🎬 [AVATAR_WAIT] ✅ Avatar video ready after {elapsed:.1f}s: {video_url}")
                            return video_url
                        else:
                            logger.warning(f"🎬 [AVATAR_WAIT] Status is 'ready' but no URL provided, continuing to poll...")
                    elif status == 'failed':
                        error_msg = video_data.get('error', 'Unknown error')
                        logger.error(f"🎬 [AVATAR_WAIT] ❌ Avatar video generation failed: {error_msg}")
                        raise Exception(f"Avatar video generation failed: {error_msg}")
                    else:
                        logger.info(f"🎬 [AVATAR_WAIT] Still processing (status: {status}), will check again in 10s...")
                else:
                    logger.error(f"🎬 [AVATAR_WAIT] API request failed: {response.status_code}")
                    logger.error(f"🎬 [AVATAR_WAIT] Response text: {response.text[:500]}")
                
                # Wait before next check
                logger.info(f"🎬 [AVATAR_WAIT] Sleeping for 10 seconds before next poll...")
                await asyncio.sleep(10)
                
            except Exception as e:
                logger.error(f"🎬 [AVATAR_WAIT] Error checking avatar video status (poll #{poll_count}): {e}")
                logger.error(f"🎬 [AVATAR_WAIT] Will retry in 10 seconds...")
                await asyncio.sleep(10)
        
        logger.error(f"🎬 [AVATAR_WAIT] ❌ Timeout: Avatar video not ready after {max_wait_time}s ({poll_count} polls)")
        raise Exception(f"Avatar video not ready after {max_wait_time} seconds")
    
    async def _process_presentation(self, request: PresentationRequest, job_id: str):
        """
        Process presentation generation using Remotion rendering pipeline.
        
        Args:
            request: Presentation request
            job_id: Job ID
        """
        import subprocess
        import json
        import os
        from pathlib import Path
        
        job = self.jobs[job_id]
        
        try:
            logger.info(f"🎬 [REACTION_PROCESSING] Starting Remotion-based presentation processing for job: {job_id}")
            logger.info(f"🎬 [REACTION_PROCESSING] Request details:")
            logger.info(f"  - Theme: {request.theme}")
            logger.info(f"  - Duration: {request.duration}s")
            logger.info(f"  - Avatar Code: {request.avatar_code}")
            logger.info(f"  - Voiceover Texts Count: {len(request.voiceover_texts)}")
            logger.info(f"  - Slides Data Provided: {bool(request.slides_data)}")
            
            # Start processing with heartbeat
            self._update_job_status(job_id, status="processing", progress=5.0)
            await self._start_heartbeat(job_id)
            
            # Step 1: Prepare slide data
            logger.info(f"🎬 [REACTION_PROCESSING] Step 1: Preparing slide data for job {job_id}")
            self._update_job_status(job_id, progress=10.0)
            
            if not request.slides_data or len(request.slides_data) == 0:
                raise Exception("No slide data provided for Remotion rendering")
            
            slides_data = request.slides_data
            logger.info(f"🎬 [REACTION_PROCESSING] Processing {len(slides_data)} slides with Remotion")
            
            # Step 2: Generate avatar video using Elai API
            logger.info(f"🎬 [REACTION_PROCESSING] Step 2: Generating avatar video for job {job_id}")
            self._update_job_status(job_id, progress=20.0)
            
            # Create avatar video using Elai API
            avatar_result = await video_generation_service.create_video_from_texts(
                project_name=f"Avatar Video - {job_id}",
                voiceover_texts=request.voiceover_texts,
                avatar_code=request.avatar_code
            )
            
            if not avatar_result["success"]:
                raise Exception(f"Avatar video generation failed: {avatar_result['error']}")
            
            avatar_video_id = avatar_result["videoId"]
            logger.info(f"🎬 [REACTION_PROCESSING] Avatar video created with ID: {avatar_video_id}")
            
            # Step 3: Wait for avatar video to be ready
            logger.info(f"🎬 [REACTION_PROCESSING] Step 3: Waiting for avatar video to be ready")
            self._update_job_status(job_id, progress=40.0)
            
            avatar_video_url = await self._wait_for_avatar_video(avatar_video_id)
            logger.info(f"🎬 [REACTION_PROCESSING] Avatar video ready: {avatar_video_url}")
            
            # Step 3.5: Download avatar video locally for Remotion
            logger.info(f"🎬 [REACTION_PROCESSING] Step 3.5: Downloading avatar video locally")
            self._update_job_status(job_id, progress=50.0)
            
            import httpx
            avatar_local_path = self.output_dir / f"avatar_{job_id}.mp4"
            
            logger.info(f"🎬 [REACTION_PROCESSING] Downloading from: {avatar_video_url}")
            logger.info(f"🎬 [REACTION_PROCESSING] Saving to: {avatar_local_path}")
            
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.get(avatar_video_url)
                if response.status_code != 200:
                    raise Exception(f"Failed to download avatar video: {response.status_code}")
                
                with open(avatar_local_path, 'wb') as f:
                    f.write(response.content)
            
            logger.info(f"🎬 [REACTION_PROCESSING] Avatar video downloaded: {os.path.getsize(avatar_local_path)} bytes")
            
            # Step 3.6: Get avatar video duration for accurate Remotion rendering
            logger.info(f"🎬 [REACTION_PROCESSING] Step 3.6: Getting avatar video duration")
            
            # Use FFprobe to get video duration
            ffprobe_cmd = [
                "ffprobe", "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                str(avatar_local_path)
            ]
            
            ffprobe_process = await asyncio.create_subprocess_exec(
                *ffprobe_cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await ffprobe_process.communicate()
            
            try:
                avatar_duration = float(stdout.decode().strip())
                logger.info(f"🎬 [REACTION_PROCESSING] Avatar video duration: {avatar_duration}s")
            except ValueError:
                logger.warning(f"🎬 [REACTION_PROCESSING] Could not parse avatar duration, using default: {request.duration}s")
                avatar_duration = request.duration
            
            # Step 4: Render slide video using Remotion
            logger.info(f"🎬 [REACTION_PROCESSING] Step 4: Rendering slide video with Remotion")
            self._update_job_status(job_id, progress=60.0)
            
            # Prepare Remotion input data
            remotion_data = {
                "slides": []
            }
            
            for i, slide in enumerate(slides_data):
                slide_data = {
                    "id": f"slide-{i}",
                    "title": slide.get("props", {}).get("title", ""),
                    "subtitle": slide.get("props", {}).get("subtitle", ""),
                    "content": slide.get("props", {}).get("content", ""),
                    "theme": request.theme or "dark-purple",
                    "elementPositions": slide.get("metadata", {}).get("elementPositions", {}),
                    "slideId": slide.get("slideId", f"slide-{i}"),
                    "avatarVideoPath": str(avatar_local_path),  # Local file path for Remotion
                    "duration": avatar_duration  # Use actual avatar duration
                }
                remotion_data["slides"].append(slide_data)
            
            # Write Remotion input file
            remotion_input_path = self.output_dir / f"remotion_input_{job_id}.json"
            with open(remotion_input_path, 'w') as f:
                json.dump(remotion_data, f, indent=2)
            
            logger.info(f"🎬 [REACTION_PROCESSING] Remotion input data written to: {remotion_input_path}")
            
            # Step 5: Execute Remotion render
            logger.info(f"🎬 [REACTION_PROCESSING] Step 5: Executing Remotion render")
            self._update_job_status(job_id, progress=80.0)
            
            # Set up Remotion render command
            # CRITICAL: __file__ is /app/app/services/presentation_service.py
            # parent = /app/app/services, parent.parent = /app/app, parent.parent.parent = /app
            backend_dir = Path(__file__).parent.parent.parent  # /app/ directory
            compositions_dir = backend_dir / "video_compositions"
            output_video_path = self.output_dir / f"presentation_{job_id}.mp4"
            
            # Calculate duration in frames (match avatar video duration)
            fps = 30
            duration_in_frames = int(avatar_duration * fps)
            
            logger.info(f"🎬 [REACTION_PROCESSING] Remotion render settings:")
            logger.info(f"  - Duration: {avatar_duration}s ({duration_in_frames} frames)")
            logger.info(f"  - FPS: {fps}")
            logger.info(f"  - Resolution: 1920x1080")
            
            # Prepare Remotion render command
            # CRITICAL: Use correct Remotion v4 command structure (props file controls all settings)
            render_cmd = [
                "npx", "remotion", "render",
                "video_compositions/src/Root.tsx",  # Entry file path from backend/
                "AvatarServiceSlide",  # Composition ID
                str(output_video_path),  # Output file path
                "--props", str(remotion_input_path)  # Props JSON (includes duration via composition)
            ]
            
            logger.info(f"🎬 [REACTION_PROCESSING] Remotion render configuration:")
            logger.info(f"  - Entry file: video_compositions/src/Root.tsx")
            logger.info(f"  - Composition: AvatarServiceSlide")
            logger.info(f"  - Output path: {output_video_path}")
            logger.info(f"  - Props file: {remotion_input_path}")
            logger.info(f"  - Working directory: {backend_dir}")
            logger.info(f"  - Expected duration: {avatar_duration}s ({duration_in_frames} frames @ {fps}fps)")
            logger.info(f"🎬 [REACTION_PROCESSING] Executing command: {' '.join(render_cmd)}")
            
            # Execute Remotion render with proper async handling
            process = await asyncio.create_subprocess_exec(
                *render_cmd,
                cwd=str(backend_dir),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            logger.info(f"🎬 [REACTION_PROCESSING] Remotion process finished with return code: {process.returncode}")
            logger.info(f"🎬 [REACTION_PROCESSING] Stdout length: {len(stdout)} bytes")
            logger.info(f"🎬 [REACTION_PROCESSING] Stderr length: {len(stderr)} bytes")
            
            # Log output for debugging
            if stdout:
                stdout_text = stdout.decode('utf-8', errors='ignore')
                logger.info(f"🎬 [REACTION_PROCESSING] Stdout: {stdout_text[:2000]}")  # First 2000 chars
            if stderr:
                stderr_text = stderr.decode('utf-8', errors='ignore')
                logger.info(f"🎬 [REACTION_PROCESSING] Stderr: {stderr_text[:2000]}")  # First 2000 chars
            
            # Check return code
            if process.returncode != 0:
                logger.error(f"🎬 [REACTION_PROCESSING] ❌ Remotion render failed with code {process.returncode}")
                raise Exception(f"Remotion render failed (code {process.returncode}): {stderr_text[:500] if stderr else 'No error output'}")
            
            # CRITICAL: Verify output file exists and has valid size
            if not output_video_path.exists():
                logger.error(f"🎬 [REACTION_PROCESSING] ❌ Output video file not created: {output_video_path}")
                raise Exception("Remotion completed but output file was not created")
            
            file_size = os.path.getsize(output_video_path)
            logger.info(f"🎬 [REACTION_PROCESSING] Output video file size: {file_size} bytes ({file_size / 1024 / 1024:.2f} MB)")
            
            # CRITICAL: Validate file integrity (minimum 100KB for valid video)
            if file_size < 100000:
                logger.error(f"🎬 [REACTION_PROCESSING] ❌ Video file corrupted or incomplete: {file_size} bytes")
                logger.error(f"🎬 [REACTION_PROCESSING] Expected minimum: 100,000 bytes")
                logger.error(f"🎬 [REACTION_PROCESSING] This indicates Remotion rendering failed silently")
                raise Exception(f"Video file corrupted (only {file_size} bytes). Rendering failed.")
            
            logger.info(f"🎬 [REACTION_PROCESSING] ✅ Remotion render completed successfully")
            logger.info(f"🎬 [REACTION_PROCESSING] ✅ Output video verified: {output_video_path}")
            logger.info(f"🎬 [REACTION_PROCESSING] ✅ File size validated: {file_size / 1024 / 1024:.2f} MB")
            
            # Step 6: Create thumbnail
            logger.info(f"🎬 [REACTION_PROCESSING] Step 6: Creating thumbnail")
            self._update_job_status(job_id, progress=90.0)
            
            thumbnail_filename = f"thumbnail_{job_id}.jpg"
            thumbnail_path = self.output_dir / thumbnail_filename
            
            # Create thumbnail using FFmpeg
            thumbnail_cmd = [
                "ffmpeg", "-y",
                "-i", str(output_video_path),
                "-ss", "00:00:01",
                "-vframes", "1",
                "-q:v", "2",
                str(thumbnail_path)
            ]
            
            thumbnail_process = await asyncio.create_subprocess_exec(
                *thumbnail_cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            await thumbnail_process.communicate()
            
            if thumbnail_process.returncode != 0:
                logger.warning(f"🎬 [REACTION_PROCESSING] Thumbnail creation failed, continuing without thumbnail")
            else:
                logger.info(f"🎬 [REACTION_PROCESSING] Thumbnail created: {thumbnail_path}")
            
            # Step 7: Final completion
            logger.info(f"🎬 [REACTION_PROCESSING] Step 7: Final completion")
            self._update_job_status(job_id, progress=100.0)
            
            # Update job status with completion details
            self._update_job_status(
                job_id,
                status="completed",
                progress=100.0,
                completed_at=datetime.now(),
                video_url=f"/presentations/{job_id}/video",
                thumbnail_url=f"/presentations/{job_id}/thumbnail"
            )
            
            logger.info(f"🎬 [REACTION_PROCESSING] Job {job_id} completed successfully")
            logger.info(f"🎬 [REACTION_PROCESSING] Final video: {output_video_path}")
            
            # Stop heartbeat for completed job
            await self._stop_heartbeat(job_id)
            
            # Schedule job cleanup
            asyncio.create_task(self._schedule_job_cleanup(job_id, delay_minutes=30))
            
        except Exception as e:
            logger.error(f"🎬 [REACTION_PROCESSING] Presentation {job_id} failed: {e}")
            
            # Update job status with failure details
            self._update_job_status(
                job_id,
                status="failed",
                error=str(e),
                completed_at=datetime.now()
            )
            
            # Stop heartbeat for failed job
            await self._stop_heartbeat(job_id)
            
            logger.error(f"🎬 [REACTION_PROCESSING] Job {job_id} marked as failed")

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
            
            # Generate clean slide video
            logger.info(f"🎬 [SINGLE_SLIDE_PROCESSING] Generating clean slide video")
            result = await clean_video_generation_service.generate_avatar_slide_video(
                slide_props=slide_data,
                theme=request.theme or "dark-purple",
                slide_duration=request.duration,
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
            
            self._update_job_status(job_id, progress=30.0)
            
            # Check if this is a slide-only video
            if request.slide_only:
                logger.info(f"🎬 [SINGLE_SLIDE_PROCESSING] SLIDE-ONLY MODE: Using slide video directly")
                output_filename = f"presentation_{job_id}.mp4"
                output_path = self.output_dir / output_filename
                
                import shutil
                shutil.copy2(slide_video_path, output_path)
                final_video_path = str(output_path)
                self._update_job_status(job_id, progress=90.0)
                
                # Cleanup temporary files
                await self._cleanup_temp_files([slide_video_path])
                
                return final_video_path
            
            # Generate avatar video
            logger.info(f"🎬 [SINGLE_SLIDE_PROCESSING] Generating avatar video")
            avatar_video_path = await self._generate_avatar_video(
                request.voiceover_texts,
                request.avatar_code,
                request.duration,
                request.use_avatar_mask
            )
            self._update_job_status(job_id, progress=60.0)
            
            logger.info(f"🎬 [SINGLE_SLIDE_PROCESSING] Avatar video generated: {avatar_video_path}")
            
            # Compose final video
            logger.info(f"🎬 [SINGLE_SLIDE_PROCESSING] Composing final video")
            output_filename = f"presentation_{job_id}.mp4"
            output_path = self.output_dir / output_filename
            
            composer = SimpleVideoComposer()
            success = await composer.compose_videos(
                slide_video_path=slide_video_path,
                avatar_video_path=avatar_video_path,
                output_path=str(output_path),
                progress_callback=lambda p: self._update_job_status(job_id, progress=60.0 + (p * 0.3))
            )
            
            if not success:
                raise Exception("Video composition failed")
            
            final_video_path = str(output_path)
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
            
            # Import the clean video generation service
            from .clean_video_generation_service import clean_video_generation_service
            
            # List to store all individual slide videos
            individual_videos = []
            temp_files_to_cleanup = []
            
            # Process each slide individually
            for slide_index, slide_data in enumerate(slides_data):
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Processing slide {slide_index + 1}/{len(slides_data)}")
                
                # Update progress based on slide processing (more granular)
                base_progress = 10 + (slide_index * 70 // len(slides_data))
                self._update_job_status(job_id, progress=base_progress)
                
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Starting processing for slide {slide_index + 1} - Progress: {base_progress}%")
                
                # Extract voiceover text for this specific slide
                slide_voiceover_text = slide_data.get('props', {}).get('voiceoverText', '')
                if not slide_voiceover_text:
                    # Fallback to generic text if no voiceover text found
                    slide_voiceover_text = f"Welcome to slide {slide_index + 1}. This presentation covers important topics."
                
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Slide {slide_index + 1} voiceover: {slide_voiceover_text[:100]}...")
                
                # Generate clean slide video for this slide
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Generating slide video for slide {slide_index + 1}")
                slide_result = await clean_video_generation_service.generate_avatar_slide_video(
                    slide_props=slide_data,
                    theme=request.theme or "dark-purple",
                    slide_duration=request.duration,
                    quality=request.quality
                )
                
                if not slide_result["success"]:
                    raise Exception(f"Slide {slide_index + 1} video generation failed: {slide_result['error']}")
                
                slide_video_path = slide_result["video_path"]
                temp_files_to_cleanup.append(slide_video_path)
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Slide {slide_index + 1} video generated: {slide_video_path}")
                
                # Check if this is slide-only mode
                if request.slide_only:
                    logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] SLIDE-ONLY MODE: Using slide video directly")
                    individual_videos.append(slide_video_path)
                    continue
                
                # Generate avatar video for this slide with progress updates
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Generating avatar video for slide {slide_index + 1}")
                
                # Update progress to show avatar generation started
                avatar_start_progress = base_progress + 10
                self._update_job_status(job_id, progress=avatar_start_progress)
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Avatar generation started for slide {slide_index + 1} - Progress: {avatar_start_progress}%")
                
                avatar_video_path = await self._generate_avatar_video_with_progress(
                    [slide_voiceover_text],  # Use slide-specific voiceover text
                    request.avatar_code,
                    request.duration,
                    request.use_avatar_mask,
                    job_id,
                    base_progress + 10,  # Start progress
                    base_progress + 30   # End progress
                )
                temp_files_to_cleanup.append(avatar_video_path)
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Avatar video for slide {slide_index + 1} generated: {avatar_video_path}")
                
                # Compose individual slide + avatar video with progress updates
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Composing individual video for slide {slide_index + 1}")
                individual_output_path = str(self.output_dir / f"slide_{slide_index + 1}_{job_id}.mp4")
                
                # Update progress for composition start
                composition_start_progress = base_progress + 30
                self._update_job_status(job_id, progress=composition_start_progress)
                logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Video composition started for slide {slide_index + 1} - Progress: {composition_start_progress}%")
                
                composer = SimpleVideoComposer()
                success = await composer.compose_videos(
                    slide_video_path=slide_video_path,
                    avatar_video_path=avatar_video_path,
                    output_path=individual_output_path,
                    progress_callback=None
                )
                
                if not success:
                    raise Exception(f"Video composition failed for slide {slide_index + 1}")
                
                individual_video_path = individual_output_path
                
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
    
    async def _generate_avatar_video_with_progress(self, voiceover_texts: List[str], avatar_code: Optional[str], duration: float, use_avatar_mask: bool, job_id: str, start_progress: float, end_progress: float) -> str:
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
            result = await video_generation_service.create_video_from_texts(
                project_name="Avatar Video",
                voiceover_texts=voiceover_texts,
                avatar_code=avatar_code
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

    async def _generate_avatar_video(self, voiceover_texts: List[str], avatar_code: Optional[str], duration: float, use_avatar_mask: bool = True) -> str:
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
            return await self._generate_with_traditional_method(voiceover_texts, avatar_code)
            
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
    
    async def _generate_with_traditional_method(self, voiceover_texts: List[str], avatar_code: str) -> str:
        """
        Generate avatar video using traditional method (Elai API + FFmpeg).
        
        Args:
            voiceover_texts: List of voiceover texts
            avatar_code: Avatar code to use
            
        Returns:
            Path to generated avatar video
        """
        try:
            logger.info("🎬 [_GENERATE_WITH_TRADITIONAL_METHOD] Starting traditional avatar generation method")
            logger.info("🎬 [_GENERATE_WITH_TRADITIONAL_METHOD] Using Elai API + FFmpeg approach")
            
            # Try with the specified avatar first
            try:
                logger.info("🎬 [_GENERATE_WITH_TRADITIONAL_METHOD] Calling _try_generate_with_avatar...")
                avatar_video_path = await self._try_generate_with_avatar(voiceover_texts, avatar_code)
                logger.info(f"🎬 [_GENERATE_WITH_TRADITIONAL_METHOD] Traditional method completed: {avatar_video_path}")
                return avatar_video_path
            except Exception as first_error:
                logger.warning(f"Failed to generate video with avatar '{avatar_code}': {first_error}")
                
                # If the specified avatar fails, try with a fallback avatar
                logger.info("Trying with fallback avatar...")
                try:
                    # Use a known working avatar as fallback
                    fallback_avatar = "mikhailo"  # This avatar should have a valid canvas
                    avatar_video_path = await self._try_generate_with_avatar(voiceover_texts, fallback_avatar)
                    logger.info(f"Successfully generated video with fallback avatar '{fallback_avatar}'")
                    return avatar_video_path
                except Exception as fallback_error:
                    logger.error(f"Failed to generate video with fallback avatar: {fallback_error}")
                    raise Exception(f"Avatar video generation failed with both primary and fallback avatars: {first_error}")
                    
        except Exception as e:
            logger.error(f"Traditional avatar generation failed: {str(e)}")
            raise
    
    async def _try_generate_with_avatar(self, voiceover_texts: List[str], avatar_code: str) -> str:
        """
        Try to generate avatar video with a specific avatar.
        
        Args:
            voiceover_texts: List of voiceover texts
            avatar_code: Avatar code to use
            
        Returns:
            Path to generated avatar video
        """
        try:
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
