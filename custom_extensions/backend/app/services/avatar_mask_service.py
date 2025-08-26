#!/usr/bin/env python3
"""
Avatar Mask Service
==================

This service creates professional avatar masks from Elai API videos with green backgrounds.
Based on the logic from test_elai_api.py and create_composite_video.py.

Key features:
1. Creates 1920x1080 videos with green background and positioned avatar
2. Uses OpenCV for professional green screen detection
3. Creates alpha masks using HSV + LAB color spaces
4. Applies morphological operations and edge feathering
5. Uses MoviePy for final video composition
"""

import cv2
import numpy as np
import asyncio
import os
import logging
import tempfile
import shutil
from typing import Optional, Tuple
from moviepy.editor import VideoFileClip, ImageClip, CompositeVideoClip
from datetime import datetime

logger = logging.getLogger(__name__)

class AvatarMaskService:
    """Service for creating professional avatar masks from Elai API videos."""
    
    def __init__(self):
        """Initialize the avatar mask service."""
        self.temp_dir = tempfile.mkdtemp(prefix="avatar_mask_")
        logger.info(f"Avatar mask service initialized with temp dir: {self.temp_dir}")
    
    async def create_avatar_mask_video(self, 
                                     voiceover_texts: list[str], 
                                     avatar_code: str = "gia.casual",
                                     output_path: str = None) -> Optional[str]:
        """
        Create a video with avatar on green background and generate mask.
        
        Args:
            voiceover_texts: List of text scripts for voiceover
            avatar_code: Avatar code to use (default: gia.casual)
            output_path: Output path for final video (optional)
            
        Returns:
            Path to the final composite video, or None if failed
        """
        try:
            logger.info("🎬 [AVATAR_MASK_SERVICE] Starting create_avatar_mask_video...")
            logger.info(f"🎬 [AVATAR_MASK_SERVICE] Parameters:")
            logger.info(f"  - voiceover_texts_count: {len(voiceover_texts)}")
            logger.info(f"  - avatar_code: {avatar_code}")
            logger.info(f"  - output_path: {output_path}")
            logger.info(f"🎬 [AVATAR_MASK_SERVICE] Creating avatar mask video with {len(voiceover_texts)} voiceover texts")
            
            # Step 1: Create Elai API video with green background
            logger.info("🎬 [AVATAR_MASK_SERVICE] Step 1: Creating Elai green screen video...")
            elai_video_path = await self._create_elai_green_screen_video(voiceover_texts, avatar_code)
            if not elai_video_path:
                logger.error("🎬 [AVATAR_MASK_SERVICE] Failed to create Elai green screen video")
                return None
            logger.info(f"🎬 [AVATAR_MASK_SERVICE] Elai green screen video created: {elai_video_path}")
            
            # Step 2: Create professional alpha mask
            mask_video_path = await self._create_professional_mask(elai_video_path)
            if not mask_video_path:
                logger.error("Failed to create alpha mask")
                return None
            
            # Step 3: Create slide video (placeholder - will be replaced by actual slide)
            slide_video_path = await self._create_slide_video(elai_video_path)
            if not slide_video_path:
                logger.error("Failed to create slide video")
                return None
            
            # Step 4: Create final composite video
            if not output_path:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                output_path = os.path.join(self.temp_dir, f"avatar_mask_composite_{timestamp}.mp4")
            
            composite_path = await self._create_composite_video(
                slide_video_path, 
                elai_video_path, 
                mask_video_path, 
                output_path
            )
            
            if composite_path:
                logger.info(f"Avatar mask video created successfully: {composite_path}")
                return composite_path
            else:
                logger.error("Failed to create composite video")
                return None
                
        except Exception as e:
            logger.error(f"Error in create_avatar_mask_video: {str(e)}")
            return None
    
    async def _create_elai_green_screen_video(self, voiceover_texts: list[str], avatar_code: str) -> Optional[str]:
        """
        Create Elai API video with green background and positioned avatar.
        Based on test_elai_api.py logic.
        """
        try:
            logger.info("Creating Elai green screen video...")
            
            # Import here to avoid circular imports
            from .video_generation_service import VideoGenerationService
            
            # Create video generation service
            video_service = VideoGenerationService()
            
            # Create video with green background configuration
            # This will use the same logic as test_elai_api.py
            project_name = f"Green Screen Avatar - {datetime.now().strftime('%Y%m%d_%H%M%S')}"
            result = await video_service.create_video_from_texts(
                project_name=project_name,
                voiceover_texts=voiceover_texts,
                avatar_code=avatar_code,
                green_screen_mode=True  # New parameter to enable green screen mode
            )
            
            if result.get("success") and result.get("videoId"):
                # Wait for video completion and get download URL
                video_path = await self._wait_for_video_completion(video_service, result["videoId"])
                return video_path
            else:
                logger.error(f"Elai video creation failed: {result.get('error', 'Unknown error')}")
                return None
                
        except Exception as e:
            logger.error(f"Error creating Elai green screen video: {str(e)}")
            return None
    
    async def _wait_for_video_completion(self, video_service, video_id: str) -> Optional[str]:
        """
        Wait for Elai video completion and download the video.
        """
        try:
            logger.info(f"Waiting for Elai video completion: {video_id}")
            
            # Start rendering
            render_result = await video_service.render_video(video_id)
            if not render_result.get("success"):
                logger.error(f"Failed to start video rendering: {render_result.get('error')}")
                return None
            
            # Wait for completion
            download_url = await video_service.wait_for_completion(video_id)
            if not download_url:
                logger.error("Video rendering failed or timed out")
                return None
            
            # Download the video
            video_path = os.path.join(self.temp_dir, f"elai_green_screen_{video_id}.mp4")
            download_result = await video_service.download_video(download_url, video_path)
            
            if download_result and os.path.exists(video_path):
                logger.info(f"Elai video downloaded: {video_path}")
                return video_path
            else:
                logger.error("Failed to download Elai video")
                return None
                
        except Exception as e:
            logger.error(f"Error waiting for video completion: {str(e)}")
            return None
    
    async def _create_professional_mask(self, input_video_path: str) -> Optional[str]:
        """
        Create professional alpha mask for green screen removal.
        Based on create_composite_video.py logic.
        """
        try:
            logger.info("Creating professional alpha mask...")
            
            # Generate mask output path
            mask_video_path = os.path.join(self.temp_dir, "avatar_mask.mp4")
            
            # Run mask creation in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None, 
                self._create_mask_sync, 
                input_video_path, 
                mask_video_path
            )
            
            if result and os.path.exists(mask_video_path):
                logger.info(f"Alpha mask created: {mask_video_path}")
                return mask_video_path
            else:
                logger.error("Mask creation failed")
                return None
                
        except Exception as e:
            logger.error(f"Error creating professional mask: {str(e)}")
            return None
    
    def _create_mask_sync(self, input_video_path: str, mask_video_path: str) -> bool:
        """
        Synchronous version of mask creation using OpenCV.
        Based on create_professional_mask function from create_composite_video.py
        """
        try:
            logger.info(f"Creating mask from: {input_video_path}")
            logger.info(f"Mask output: {mask_video_path}")
            
            # Open input video
            cap = cv2.VideoCapture(input_video_path)
            
            # Get video properties
            fps = int(cap.get(cv2.CAP_PROP_FPS))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            logger.info(f"Video info: {width}x{height}, {fps} FPS, {total_frames} frames")
            
            # Create mask video writer (grayscale)
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            mask_out = cv2.VideoWriter(mask_video_path, fourcc, fps, (width, height), False)
            
            frame_count = 0
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                frame_count += 1
                
                # Convert to different color spaces for better detection
                hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
                lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
                
                # More precise green detection in HSV
                lower_green = np.array([35, 30, 30])
                upper_green = np.array([85, 255, 255])
                mask_hsv = cv2.inRange(hsv, lower_green, upper_green)
                
                # Additional green detection in LAB color space
                lower_green_lab = np.array([0, 0, 100])
                upper_green_lab = np.array([255, 120, 255])
                mask_lab = cv2.inRange(lab, lower_green_lab, upper_green_lab)
                
                # Combine masks
                green_mask = cv2.bitwise_or(mask_hsv, mask_lab)
                
                # Apply edge-preserving filter to reduce noise
                green_mask = cv2.medianBlur(green_mask, 5)
                
                # Morphological operations for cleanup
                kernel_small = np.ones((2,2), np.uint8)
                kernel_large = np.ones((4,4), np.uint8)
                
                # Close small gaps
                green_mask = cv2.morphologyEx(green_mask, cv2.MORPH_CLOSE, kernel_small)
                # Remove small noise
                green_mask = cv2.morphologyEx(green_mask, cv2.MORPH_OPEN, kernel_small)
                # Smooth edges
                green_mask = cv2.morphologyEx(green_mask, cv2.MORPH_CLOSE, kernel_large)
                
                # Create alpha mask (white = keep, black = remove)
                alpha_mask = cv2.bitwise_not(green_mask)
                
                # Apply edge feathering for smooth transitions
                alpha_mask = cv2.GaussianBlur(alpha_mask, (3, 3), 0)
                
                # Write the mask frame
                mask_out.write(alpha_mask)
                
                # Progress indicator
                if frame_count % 30 == 0:
                    progress = (frame_count / total_frames) * 100
                    logger.info(f"Creating mask: {progress:.1f}% ({frame_count}/{total_frames} frames)")
            
            # Release everything
            cap.release()
            mask_out.release()
            cv2.destroyAllWindows()
            
            logger.info("Alpha mask creation completed!")
            return True
            
        except Exception as e:
            logger.error(f"Error in mask creation: {str(e)}")
            return False
    
    async def _create_slide_video(self, reference_video_path: str) -> Optional[str]:
        """
        Create a slide video that matches the avatar video dimensions.
        This is a placeholder - in real implementation, this would be the actual slide.
        """
        try:
            logger.info("Creating slide video...")
            
            # Get reference video properties
            cap = cv2.VideoCapture(reference_video_path)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fps = int(cap.get(cv2.CAP_PROP_FPS))
            duration = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) / fps
            cap.release()
            
            # Create a simple colored background as placeholder
            # In real implementation, this would be the actual slide image
            slide_video_path = os.path.join(self.temp_dir, "slide_background.mp4")
            
            # Create a simple colored background video
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            slide_out = cv2.VideoWriter(slide_video_path, fourcc, fps, (width, height))
            
            # Create a dark purple background (matching the theme)
            background_color = (17, 12, 53)  # BGR format for OpenCV
            
            for _ in range(int(duration * fps)):
                frame = np.full((height, width, 3), background_color, dtype=np.uint8)
                slide_out.write(frame)
            
            slide_out.release()
            
            logger.info(f"Slide video created: {slide_video_path}")
            return slide_video_path
            
        except Exception as e:
            logger.error(f"Error creating slide video: {str(e)}")
            return None
    
    async def _create_composite_video(self, 
                                    slide_video_path: str, 
                                    avatar_video_path: str, 
                                    mask_video_path: str, 
                                    output_path: str) -> Optional[str]:
        """
        Create final composite video using MoviePy.
        Based on create_composite_video function from create_composite_video.py
        """
        try:
            logger.info("Creating composite video...")
            
            # Run composition in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                self._create_composite_sync,
                slide_video_path,
                avatar_video_path,
                mask_video_path,
                output_path
            )
            
            if result and os.path.exists(output_path):
                logger.info(f"Composite video created: {output_path}")
                return output_path
            else:
                logger.error("Composite video creation failed")
                return None
                
        except Exception as e:
            logger.error(f"Error creating composite video: {str(e)}")
            return None
    
    def _create_composite_sync(self, 
                             slide_video_path: str, 
                             avatar_video_path: str, 
                             mask_video_path: str, 
                             output_path: str) -> bool:
        """
        Synchronous version of composite video creation using MoviePy.
        Based on create_composite_video function from create_composite_video.py
        """
        try:
            # Load the avatar video (for duration and audio)
            logger.info("Loading avatar video...")
            avatar_clip = VideoFileClip(avatar_video_path)
            duration = avatar_clip.duration
            audio = avatar_clip.audio
            avatar_width, avatar_height = avatar_clip.size
            logger.info(f"Avatar video duration: {duration:.2f} seconds")
            logger.info(f"Avatar dimensions: {avatar_width}x{avatar_height}")
            
            # Load the slide video
            logger.info("Loading slide video...")
            slide_clip = VideoFileClip(slide_video_path)
            
            # Load the alpha mask
            logger.info("Loading alpha mask...")
            mask_clip = VideoFileClip(mask_video_path, has_mask=False)
            
            # Apply mask to avatar
            logger.info("Applying mask to avatar...")
            avatar_with_mask = avatar_clip.set_mask(mask_clip.to_mask())
            
            # Create composite with proper layering
            logger.info("Creating composite...")
            composite = CompositeVideoClip([slide_clip, avatar_with_mask], size=(avatar_width, avatar_height))
            
            # Add original audio
            logger.info("Adding audio...")
            composite = composite.set_audio(audio)
            
            # Write final video
            logger.info(f"Rendering final video: {output_path}")
            composite.write_videofile(
                output_path,
                fps=25,
                codec='libx264',
                audio_codec='aac',
                preset='medium',
                ffmpeg_params=['-pix_fmt', 'yuv420p'],
                temp_audiofile='temp-audio.m4a',
                remove_temp=True,
                verbose=False,
                logger=None
            )
            
            # Cleanup
            avatar_clip.close()
            mask_clip.close()
            slide_clip.close()
            composite.close()
            
            # Get file size
            file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
            logger.info(f"Composite video created successfully!")
            logger.info(f"Output file: {output_path}")
            logger.info(f"File size: {file_size_mb:.2f} MB")
            logger.info(f"Duration: {duration:.2f} seconds")
            
            return True
            
        except Exception as e:
            logger.error(f"Error in composite creation: {str(e)}")
            return False
    
    def cleanup(self):
        """Clean up temporary files."""
        try:
            if os.path.exists(self.temp_dir):
                shutil.rmtree(self.temp_dir)
                logger.info(f"Cleaned up temp directory: {self.temp_dir}")
        except Exception as e:
            logger.warning(f"Could not cleanup temp directory: {str(e)}")
    
    def __del__(self):
        """Destructor to ensure cleanup."""
        self.cleanup()
