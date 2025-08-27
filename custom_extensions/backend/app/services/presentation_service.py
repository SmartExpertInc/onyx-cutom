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
            
            job.status = "processing"
            job.progress = 5.0
            
            # Step 1: Generate clean slide video
            logger.info(f"🎬 [PRESENTATION_PROCESSING] Step 1: Generating clean slide video for job {job_id}")
            job.progress = 10.0
            
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
                
                # Generate clean slide video with actual slide data
                logger.info(f"🎬 [PRESENTATION_PROCESSING] Calling clean video generation service:")
                logger.info(f"  - Slides count: {len(slides_data)}")
                logger.info(f"  - Theme: {request.theme or 'dark-purple'}")
                logger.info(f"  - Duration: {request.duration}")
                logger.info(f"  - Quality: {request.quality}")
                
                if len(slides_data) == 1:
                    # Single slide generation
                    logger.info(f"🎬 [PRESENTATION_PROCESSING] Using single slide generation")
                    result = await clean_video_generation_service.generate_avatar_slide_video(
                        slide_props=slides_data[0],
                        theme=request.theme or "dark-purple",
                        slide_duration=request.duration,
                        quality=request.quality
                    )
                else:
                    # Multiple slides generation
                    logger.info(f"🎬 [PRESENTATION_PROCESSING] Using multiple slides generation")
                    result = await clean_video_generation_service.generate_presentation_video(
                        slides_props=slides_data,
                        theme=request.theme or "dark-purple", 
                        slide_duration=request.duration,
                        quality=request.quality
                    )
                
                logger.info(f"🎬 [PRESENTATION_PROCESSING] Clean video generation result:")
                logger.info(f"  - Success: {result.get('success', False)}")
                logger.info(f"  - Video Path: {result.get('video_path', 'N/A')}")
                logger.info(f"  - File Size: {result.get('file_size', 'N/A')}")
                logger.info(f"  - Duration: {result.get('duration', 'N/A')}")
                logger.info(f"  - Slide Image Paths: {result.get('slide_image_paths', [])}")
                logger.info(f"  - Error: {result.get('error', 'None')}")
                
                if result["success"]:
                    slide_video_path = result["video_path"]
                    slide_image_paths = result.get("slide_image_paths", [])
                    logger.info(f"🎬 [PRESENTATION_PROCESSING] Clean video generation successful: {slide_video_path}")
                    
                    # Store the first slide image path for debugging
                    if slide_image_paths and len(slide_image_paths) > 0:
                        job.slide_image_path = slide_image_paths[0]  # Store the first slide image path
                        logger.info(f"🎬 [PRESENTATION_PROCESSING] Stored slide image path for debugging: {job.slide_image_path}")
                else:
                    logger.error(f"Clean video generation failed: {result['error']}")
                    raise Exception(f"Video generation failed: {result['error']}")
                    
            except Exception as slide_error:
                logger.error(f"Clean video generation error: {slide_error}")
                raise Exception(f"Video generation failed: {str(slide_error)}")
            
            job.progress = 30.0
            
            # Check if this is a slide-only video (no AI avatar)
            if request.slide_only:
                logger.info(f"🎬 [PRESENTATION_PROCESSING] SLIDE-ONLY MODE: Skipping avatar generation")
                logger.info(f"🎬 [PRESENTATION_PROCESSING] Using slide video directly as final video")
                
                # For slide-only mode, copy the slide video to the final output location
                output_filename = f"presentation_{job_id}.mp4"
                output_path = self.output_dir / output_filename
                
                import shutil
                shutil.copy2(slide_video_path, output_path)
                final_video_path = str(output_path)
                job.progress = 90.0
                
                logger.info(f"🎬 [PRESENTATION_PROCESSING] Slide-only video copied to: {final_video_path}")
                
            else:
                # Step 2: Generate avatar video via Elai API
                logger.info(f"🎬 [PRESENTATION_PROCESSING] Step 2: Generating avatar video for job {job_id}")
                logger.info(f"🎬 [PRESENTATION_PROCESSING] Avatar generation parameters:")
                logger.info(f"  - Voiceover texts count: {len(request.voiceover_texts)}")
                logger.info(f"  - Avatar code: {request.avatar_code}")
                logger.info(f"  - Duration: {request.duration}")
                
                for i, text in enumerate(request.voiceover_texts):
                    logger.info(f"  - Voiceover text {i+1}: {text[:200]}...")
                
                job.progress = 40.0
                
                # Add detailed logging for avatar generation
                logger.info(f"🎬 [PRESENTATION_PROCESSING] Starting avatar video generation...")
                logger.info(f"🎬 [PRESENTATION_PROCESSING] Avatar generation parameters:")
                logger.info(f"  - use_avatar_mask: {request.use_avatar_mask}")
                logger.info(f"  - avatar_code: {request.avatar_code}")
                logger.info(f"  - voiceover_texts_count: {len(request.voiceover_texts)}")
                logger.info(f"  - duration: {request.duration}")
                
                avatar_video_path = await self._generate_avatar_video(
                    request.voiceover_texts,
                    request.avatar_code,
                    request.duration,
                    request.use_avatar_mask
                )
                job.progress = 60.0
                
                logger.info(f"🎬 [PRESENTATION_PROCESSING] Avatar video generated: {avatar_video_path}")
                
                # Step 3: Compose final video
                logger.info(f"🎬 [PRESENTATION_PROCESSING] Step 3: Composing final video for job {job_id}")
                logger.info(f"🎬 [PRESENTATION_PROCESSING] Video composition parameters:")
                logger.info(f"  - Slide video path: {slide_video_path}")
                logger.info(f"  - Avatar video path: {avatar_video_path}")
                logger.info(f"  - Layout: {request.layout} (should be picture_in_picture for proper overlay)")
                logger.info(f"  - Resolution: {request.resolution}")
                logger.info(f"  - Quality: {request.quality}")
                
                job.progress = 70.0
                
                output_filename = f"presentation_{job_id}.mp4"
                output_path = self.output_dir / output_filename
                
                logger.info(f"🎬 [PRESENTATION_PROCESSING] Output configuration:")
                logger.info(f"  - Output filename: {output_filename}")
                logger.info(f"  - Output path: {output_path}")
                
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
            if request.slide_only:
                # For slide-only mode, only cleanup the temporary slide video
                await self._cleanup_temp_files([slide_video_path])
            else:
                # For full mode, cleanup both slide and avatar videos
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
            check_interval = 60  # 60 seconds - longer interval to reduce API calls
            start_time = datetime.now()
            consecutive_errors = 0  # Track consecutive error statuses
            max_consecutive_errors = 5  # Maximum consecutive errors before giving up
            
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

# Global instance
presentation_service = ProfessionalPresentationService()
