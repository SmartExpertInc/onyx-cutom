#!/usr/bin/env python3
"""
Video Composition Service
=========================

This module provides video composition functionality for creating final video lessons
by combining slide images with AI avatar videos using chroma key (green screen) removal.

Key Features:
- Chroma key (green screen) removal from avatar videos
- Composite video creation with slide backgrounds
- Audio preservation from avatar videos
- Professional video processing with OpenCV and MoviePy
- Support for multiple video formats and resolutions
- Error handling and progress tracking
"""

import os
import sys
import cv2
import numpy as np
from moviepy.editor import VideoFileClip, ImageClip, CompositeVideoClip
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass
from pathlib import Path

# Configure logging
logger = logging.getLogger(__name__)

@dataclass
class VideoCompositionConfig:
    """Configuration for video composition"""
    output_format: str = "mp4"
    output_codec: str = "libx264"
    audio_codec: str = "aac"
    fps: int = 25
    resolution: Tuple[int, int] = (1920, 1080)  # Full HD
    chroma_key_color: str = "#00FF00"  # Green
    chroma_key_tolerance: float = 0.3
    avatar_scale: float = 0.5
    avatar_position: Tuple[int, int] = (960, 540)  # Center
    enable_audio: bool = True
    temp_dir: str = "temp_videos"

@dataclass
class VideoCompositionResult:
    """Result of video composition"""
    output_path: str
    duration: float
    file_size: int
    resolution: Tuple[int, int]
    success: bool
    error_message: Optional[str] = None

class VideoCompositionService:
    """Service for composing videos with slide backgrounds and avatar overlays"""
    
    def __init__(self, config: VideoCompositionConfig = None):
        """Initialize the video composition service."""
        self.config = config or VideoCompositionConfig()
        self._ensure_temp_dir()
        
        logger.info("Video Composition Service initialized")
        logger.info(f"Configuration: {self.config}")
    
    def _ensure_temp_dir(self):
        """Ensure the temporary directory exists."""
        os.makedirs(self.config.temp_dir, exist_ok=True)
    
    def create_chroma_key_mask(self, frame: np.ndarray) -> np.ndarray:
        """
        Create a chroma key mask for green screen removal.
        
        Args:
            frame: Input video frame (BGR format)
            
        Returns:
            Alpha mask (0-255, where 255 = keep, 0 = remove)
        """
        # Convert BGR to different color spaces for better detection
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        
        # Define green color ranges in HSV
        lower_green_hsv = np.array([35, 30, 30])
        upper_green_hsv = np.array([85, 255, 255])
        mask_hsv = cv2.inRange(hsv, lower_green_hsv, upper_green_hsv)
        
        # Define green color ranges in LAB
        lower_green_lab = np.array([0, 0, 100])
        upper_green_lab = np.array([255, 120, 255])
        mask_lab = cv2.inRange(lab, lower_green_lab, upper_green_lab)
        
        # Combine masks
        green_mask = cv2.bitwise_or(mask_hsv, mask_lab)
        
        # Apply edge-preserving filter to reduce noise
        green_mask = cv2.medianBlur(green_mask, 5)
        
        # Morphological operations for cleanup
        kernel_small = np.ones((2, 2), np.uint8)
        kernel_large = np.ones((4, 4), np.uint8)
        
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
        
        return alpha_mask
    
    def create_alpha_mask_video(self, input_video_path: str, output_mask_path: str) -> bool:
        """
        Create an alpha mask video for chroma key removal.
        
        Args:
            input_video_path: Path to input video with green background
            output_mask_path: Path to save the alpha mask video
            
        Returns:
            True if successful, False otherwise
        """
        logger.info(f"Creating alpha mask video: {input_video_path} -> {output_mask_path}")
        
        try:
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
            mask_out = cv2.VideoWriter(output_mask_path, fourcc, fps, (width, height), False)
            
            frame_count = 0
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                frame_count += 1
                
                # Create alpha mask for this frame
                alpha_mask = self.create_chroma_key_mask(frame)
                
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
            
            logger.info(f"Alpha mask video created successfully: {output_mask_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error creating alpha mask video: {str(e)}")
            return False
    
    def compose_video_with_slide(self, 
                                slide_image_path: str,
                                avatar_video_path: str,
                                output_path: str,
                                avatar_scale: float = None,
                                avatar_position: Tuple[int, int] = None) -> VideoCompositionResult:
        """
        Compose a video by overlaying an avatar video on a slide image.
        
        Args:
            slide_image_path: Path to the slide image
            avatar_video_path: Path to the avatar video (with green background)
            output_path: Path for the output composite video
            avatar_scale: Scale factor for the avatar (optional)
            avatar_position: Position of the avatar (optional)
            
        Returns:
            VideoCompositionResult with composition details
        """
        logger.info(f"Composing video: {slide_image_path} + {avatar_video_path} -> {output_path}")
        
        # Use config defaults if not provided
        avatar_scale = avatar_scale or self.config.avatar_scale
        avatar_position = avatar_position or self.config.avatar_position
        
        try:
            # Step 1: Create alpha mask for the avatar video
            mask_path = os.path.join(self.config.temp_dir, f"mask_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4")
            if not self.create_alpha_mask_video(avatar_video_path, mask_path):
                return VideoCompositionResult(
                    output_path="",
                    duration=0,
                    file_size=0,
                    resolution=(0, 0),
                    success=False,
                    error_message="Failed to create alpha mask"
                )
            
            # Step 2: Load the avatar video (for duration and audio)
            avatar_clip = VideoFileClip(avatar_video_path)
            duration = avatar_clip.duration
            audio = avatar_clip.audio if self.config.enable_audio else None
            avatar_width, avatar_height = avatar_clip.size
            
            logger.info(f"Avatar video: {avatar_width}x{avatar_height}, {duration:.2f}s")
            
            # Step 3: Create slide video (resize to match avatar dimensions)
            slide_clip = ImageClip(slide_image_path, duration=duration).resize((avatar_width, avatar_height))
            logger.info(f"Slide resized to: {avatar_width}x{avatar_height}")
            
            # Step 4: Load the alpha mask
            mask_clip = VideoFileClip(mask_path, has_mask=False)
            
            # Step 5: Apply professional masking using MoviePy
            logger.info("Applying chroma key masking...")
            
            # Apply mask to avatar
            avatar_with_mask = avatar_clip.set_mask(mask_clip.to_mask())
            
            # Step 6: Create composite with proper layering
            logger.info("Creating composite video...")
            composite = CompositeVideoClip([slide_clip, avatar_with_mask], size=(avatar_width, avatar_height))
            
            # Step 7: Add original audio if enabled
            if audio and self.config.enable_audio:
                logger.info("Adding audio...")
                composite = composite.set_audio(audio)
            
            # Step 8: Write final video
            logger.info(f"Rendering final video: {output_path}")
            
            composite.write_videofile(
                output_path,
                fps=self.config.fps,
                codec=self.config.output_codec,
                audio_codec=self.config.audio_codec,
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
            file_size = os.path.getsize(output_path)
            
            logger.info(f"Video composition completed successfully!")
            logger.info(f"Output: {output_path}")
            logger.info(f"Size: {file_size / (1024 * 1024):.2f} MB")
            logger.info(f"Duration: {duration:.2f} seconds")
            
            # Cleanup temporary files
            if os.path.exists(mask_path):
                os.remove(mask_path)
                logger.info(f"Cleaned up temporary file: {mask_path}")
            
            return VideoCompositionResult(
                output_path=output_path,
                duration=duration,
                file_size=file_size,
                resolution=(avatar_width, avatar_height),
                success=True
            )
            
        except Exception as e:
            logger.error(f"Error composing video: {str(e)}")
            return VideoCompositionResult(
                output_path="",
                duration=0,
                file_size=0,
                resolution=(0, 0),
                success=False,
                error_message=str(e)
            )
    
    def create_video_lesson(self, 
                           slides_data: List[Dict[str, Any]],
                           output_dir: str = "output_videos") -> List[VideoCompositionResult]:
        """
        Create a complete video lesson from multiple slides.
        
        Args:
            slides_data: List of slide data dictionaries with:
                - slide_image_path: Path to slide image
                - avatar_video_path: Path to avatar video
                - slide_title: Title of the slide
                - voiceover_text: Voiceover text
            output_dir: Directory to save output videos
            
        Returns:
            List of VideoCompositionResult for each slide
        """
        logger.info(f"Creating video lesson with {len(slides_data)} slides")
        
        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)
        
        results = []
        
        for i, slide_data in enumerate(slides_data):
            slide_title = slide_data.get('slide_title', f'Slide {i+1}')
            slide_image_path = slide_data.get('slide_image_path')
            avatar_video_path = slide_data.get('avatar_video_path')
            
            if not slide_image_path or not avatar_video_path:
                logger.error(f"Missing required paths for slide {i+1}")
                results.append(VideoCompositionResult(
                    output_path="",
                    duration=0,
                    file_size=0,
                    resolution=(0, 0),
                    success=False,
                    error_message="Missing required paths"
                ))
                continue
            
            # Create output filename
            safe_title = "".join(c for c in slide_title if c.isalnum() or c in (' ', '-', '_')).rstrip()
            output_filename = f"slide_{i+1:02d}_{safe_title}.{self.config.output_format}"
            output_path = os.path.join(output_dir, output_filename)
            
            # Compose the video
            result = self.compose_video_with_slide(
                slide_image_path=slide_image_path,
                avatar_video_path=avatar_video_path,
                output_path=output_path
            )
            
            results.append(result)
            
            if result.success:
                logger.info(f"Slide {i+1} completed: {output_path}")
            else:
                logger.error(f"Slide {i+1} failed: {result.error_message}")
        
        logger.info(f"Video lesson creation completed. {sum(1 for r in results if r.success)}/{len(results)} slides successful")
        return results
    
    def cleanup_temp_files(self):
        """Clean up temporary files."""
        try:
            import shutil
            if os.path.exists(self.config.temp_dir):
                shutil.rmtree(self.config.temp_dir)
                logger.info(f"Cleaned up temporary directory: {self.config.temp_dir}")
        except Exception as e:
            logger.error(f"Error cleaning up temp files: {str(e)}")


# Factory function to create video composition service
def create_video_composition_service(config: VideoCompositionConfig = None) -> VideoCompositionService:
    """Create and return a video composition service instance."""
    return VideoCompositionService(config)


if __name__ == "__main__":
    # Test the service
    try:
        service = create_video_composition_service()
        
        # Test with sample data
        test_slides = [
            {
                'slide_image_path': 'base_slide_image.jpg',
                'avatar_video_path': 'elai_green_screen_video_20250805_134324.mp4',
                'slide_title': 'Introduction',
                'voiceover_text': 'Welcome to this lesson.'
            }
        ]
        
        results = service.create_video_lesson(test_slides)
        
        for i, result in enumerate(results):
            if result.success:
                print(f"Slide {i+1} successful: {result.output_path}")
            else:
                print(f"Slide {i+1} failed: {result.error_message}")
                
    except Exception as e:
        print(f"Test failed: {e}")
