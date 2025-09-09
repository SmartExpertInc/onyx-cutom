#!/usr/bin/env python3
"""
Simple Video Composer
=====================

A reliable, single-method video composition system using pure OpenCV.
Replaces the dual-approach complexity with one robust solution.

Key Features:
- Pure OpenCV for video processing (no MoviePy dependencies)
- Template-aware avatar scaling and positioning
- Frame-by-frame composition with progress feedback
- Single method - no fallback complexity
- Preserves original slide video as background canvas
- FFmpeg for final audio merge only
"""

import cv2
import numpy as np
import asyncio
import logging
import os
import subprocess
import json
from typing import Tuple, Optional
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)

class SimpleVideoComposer:
    """
    Simple, reliable video composer using pure OpenCV.
    
    Eliminates the dual-approach complexity and provides a single,
    robust method for composing slide and avatar videos.
    """
    
    def __init__(self):
        """Initialize the Simple Video Composer."""
        self.temp_dir = Path("temp/simple_compositions")
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        
        # Avatar template dimensions (from avatar-service template)
        self.avatar_template = {
            'width': 935,   # Target avatar width in template
            'height': 843,  # Target avatar height in template
            'x': 925,       # X position on slide (1920 - 935 - 60)
            'y': 118,       # Y position on slide ((1080 - 843) / 2)
        }
        
        logger.info("🎬 [SIMPLE_COMPOSER] SimpleVideoComposer initialized")
        logger.info(f"🎬 [SIMPLE_COMPOSER] Avatar template: {self.avatar_template}")
    
    async def compose_videos(self, 
                           slide_video_path: str, 
                           avatar_video_path: str, 
                           output_path: str,
                           progress_callback=None) -> bool:
        """
        Compose slide and avatar videos using OpenCV.
        
        Args:
            slide_video_path: Path to slide video (from working pipeline)
            avatar_video_path: Path to avatar video (from Elai API)
            output_path: Path for output video
            progress_callback: Optional callback for progress updates
            
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info("🎬 [SIMPLE_COMPOSER] Starting video composition")
            logger.info(f"🎬 [SIMPLE_COMPOSER] Input files:")
            logger.info(f"  - Slide video: {slide_video_path}")
            logger.info(f"  - Avatar video: {avatar_video_path}")
            logger.info(f"  - Output path: {output_path}")
            
            # Validate input files
            if not os.path.exists(slide_video_path):
                logger.error(f"🎬 [SIMPLE_COMPOSER] Slide video not found: {slide_video_path}")
                return False
            if not os.path.exists(avatar_video_path):
                logger.error(f"🎬 [SIMPLE_COMPOSER] Avatar video not found: {avatar_video_path}")
                return False
            
            # Get video properties
            slide_props = await self._get_video_properties(slide_video_path)
            avatar_props = await self._get_video_properties(avatar_video_path)
            
            logger.info(f"🎬 [SIMPLE_COMPOSER] Video properties:")
            logger.info(f"  - Slide: {slide_props}")
            logger.info(f"  - Avatar: {avatar_props}")
            
            # Create temporary video without audio
            temp_video_path = str(self.temp_dir / f"temp_composition_{int(datetime.now().timestamp())}.mp4")
            
            # Compose videos frame by frame
            success = await self._compose_frames(
                slide_video_path, 
                avatar_video_path, 
                temp_video_path,
                slide_props,
                avatar_props,
                progress_callback
            )
            
            if not success:
                logger.error("🎬 [SIMPLE_COMPOSER] Frame composition failed")
                return False
            
            # Add audio from avatar video
            success = await self._add_audio(temp_video_path, avatar_video_path, output_path)
            
            # Cleanup temporary file
            try:
                os.remove(temp_video_path)
            except Exception as e:
                logger.warning(f"Could not remove temp file: {e}")
            
            if success:
                logger.info(f"🎬 [SIMPLE_COMPOSER] Video composition completed successfully: {output_path}")
                return True
            else:
                logger.error("🎬 [SIMPLE_COMPOSER] Audio merge failed")
                return False
                
        except Exception as e:
            logger.error(f"🎬 [SIMPLE_COMPOSER] Video composition failed: {str(e)}")
            return False
    
    async def _get_video_properties(self, video_path: str) -> dict:
        """Get video properties using FFprobe."""
        try:
            cmd = [
                'ffprobe',
                '-v', 'quiet',
                '-show_entries', 'stream=width,height,r_frame_rate,duration:format=duration',
                '-of', 'json',
                video_path
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                logger.warning(f"Could not get properties for {video_path}: {stderr.decode()}")
                return {'width': 1920, 'height': 1080, 'fps': 25.0, 'duration': 10.0}
            
            data = json.loads(stdout.decode())
            
            # Extract video stream properties
            video_stream = None
            for stream in data.get('streams', []):
                if stream.get('codec_type') == 'video':
                    video_stream = stream
                    break
            
            if not video_stream:
                logger.warning(f"No video stream found in {video_path}")
                return {'width': 1920, 'height': 1080, 'fps': 25.0, 'duration': 10.0}
            
            # Parse frame rate
            fps_str = video_stream.get('r_frame_rate', '25/1')
            if '/' in fps_str:
                num, den = fps_str.split('/')
                fps = float(num) / float(den)
            else:
                fps = float(fps_str)
            
            # Get duration
            duration = float(data.get('format', {}).get('duration', video_stream.get('duration', 10.0)))
            
            return {
                'width': video_stream.get('width', 1920),
                'height': video_stream.get('height', 1080),
                'fps': fps,
                'duration': duration
            }
            
        except Exception as e:
            logger.warning(f"Error getting video properties: {e}")
            return {'width': 1920, 'height': 1080, 'fps': 25.0, 'duration': 10.0}
    
    async def _compose_frames(self, 
                            slide_video_path: str, 
                            avatar_video_path: str, 
                            output_path: str,
                            slide_props: dict,
                            avatar_props: dict,
                            progress_callback=None) -> bool:
        """
        Compose videos frame by frame using OpenCV.
        
        This method:
        1. Uses slide video as full background canvas (1920x1080)
        2. Scales avatar to template dimensions (935x843)
        3. Positions avatar at template coordinates (925, 118)
        4. Overlays avatar onto slide frame by frame
        """
        try:
            logger.info("🎬 [SIMPLE_COMPOSER] Starting frame-by-frame composition")
            
            # Open video captures
            slide_cap = cv2.VideoCapture(slide_video_path)
            avatar_cap = cv2.VideoCapture(avatar_video_path)
            
            # Use slide video properties as base
            output_width = 1920
            output_height = 1080
            output_fps = slide_props['fps']
            
            # Calculate total frames for progress tracking
            slide_frame_count = int(slide_cap.get(cv2.CAP_PROP_FRAME_COUNT))
            avatar_frame_count = int(avatar_cap.get(cv2.CAP_PROP_FRAME_COUNT))
            total_frames = max(slide_frame_count, avatar_frame_count)
            
            logger.info(f"🎬 [SIMPLE_COMPOSER] Frame composition setup:")
            logger.info(f"  - Output dimensions: {output_width}x{output_height}")
            logger.info(f"  - Output FPS: {output_fps}")
            logger.info(f"  - Slide frames: {slide_frame_count}")
            logger.info(f"  - Avatar frames: {avatar_frame_count}")
            logger.info(f"  - Total frames to process: {total_frames}")
            
            # Define video codec and writer
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            video_writer = cv2.VideoWriter(output_path, fourcc, output_fps, (output_width, output_height))
            
            if not video_writer.isOpened():
                logger.error("🎬 [SIMPLE_COMPOSER] Failed to open video writer")
                return False
            
            frame_count = 0
            last_progress = -1
            
            logger.info("🎬 [SIMPLE_COMPOSER] Processing frames with CROPPING (not resizing) to maintain avatar aspect ratio...")
            
            while True:
                # Read slide frame (background)
                slide_ret, slide_frame = slide_cap.read()
                
                # Read avatar frame (overlay)
                avatar_ret, avatar_frame = avatar_cap.read()
                
                # Break if we've reached the end of either video
                if not slide_ret and not avatar_ret:
                    break
                
                # Create background frame
                if slide_ret:
                    # Use slide frame as background, ensure it's 1920x1080
                    background = cv2.resize(slide_frame, (output_width, output_height))
                else:
                    # If slide video ended, use last frame or create solid background
                    background = np.full((output_height, output_width, 3), (17, 12, 53), dtype=np.uint8)  # Dark purple
                
                # Process avatar frame if available
                if avatar_ret:
                    # CRITICAL FIX: Crop avatar instead of resizing to maintain aspect ratio
                    avatar_cropped = self._crop_avatar_to_template(avatar_frame)
                    
                    # Get position coordinates
                    x = self.avatar_template['x']
                    y = self.avatar_template['y']
                    
                    # Ensure avatar fits within bounds
                    if x + self.avatar_template['width'] <= output_width and y + self.avatar_template['height'] <= output_height:
                        # Simple overlay (replace method - could be enhanced with alpha blending)
                        background[y:y + self.avatar_template['height'], 
                                 x:x + self.avatar_template['width']] = avatar_cropped
                    else:
                        logger.warning(f"🎬 [SIMPLE_COMPOSER] Avatar position out of bounds: ({x}, {y})")
                
                # Write composed frame
                video_writer.write(background)
                frame_count += 1
                
                # Progress callback
                if progress_callback and total_frames > 0:
                    progress = int((frame_count / total_frames) * 100)
                    if progress != last_progress and progress % 5 == 0:  # Report every 5%
                        progress_callback(progress)
                        last_progress = progress
                        logger.info(f"🎬 [SIMPLE_COMPOSER] Frame composition progress: {progress}%")
                
                # Break if we've processed enough frames
                if frame_count >= total_frames:
                    break
            
            # Cleanup
            slide_cap.release()
            avatar_cap.release()
            video_writer.release()
            
            logger.info(f"🎬 [SIMPLE_COMPOSER] Frame composition completed: {frame_count} frames processed")
            
            # Verify output file
            if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                logger.info(f"🎬 [SIMPLE_COMPOSER] Output video created: {os.path.getsize(output_path)} bytes")
                return True
            else:
                logger.error("🎬 [SIMPLE_COMPOSER] Output video not created or empty")
                return False
                
        except Exception as e:
            logger.error(f"🎬 [SIMPLE_COMPOSER] Frame composition error: {str(e)}")
            return False
    
    async def _add_audio(self, video_path: str, audio_source_path: str, output_path: str) -> bool:
        """
        Add audio from avatar video to the composed video using FFmpeg.
        
        Args:
            video_path: Path to video without audio
            audio_source_path: Path to video with audio (avatar video)
            output_path: Path for final output with audio
            
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info("🎬 [SIMPLE_COMPOSER] Adding audio to composed video")
            
            cmd = [
                'ffmpeg',
                '-i', video_path,        # Video input (no audio)
                '-i', audio_source_path, # Audio source (avatar video)
                '-c:v', 'copy',          # Copy video stream as-is
                '-c:a', 'aac',           # Encode audio as AAC
                '-map', '0:v:0',         # Use video from first input
                '-map', '1:a:0',         # Use audio from second input
                '-shortest',             # End when shortest input ends
                '-y',                    # Overwrite output
                output_path
            ]
            
            logger.info(f"🎬 [SIMPLE_COMPOSER] FFmpeg audio command: {' '.join(cmd)}")
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                logger.error(f"🎬 [SIMPLE_COMPOSER] Audio merge failed: {stderr.decode()}")
                return False
            
            logger.info("🎬 [SIMPLE_COMPOSER] Audio merge completed successfully")
            
            # Verify final output
            if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
                logger.info(f"🎬 [SIMPLE_COMPOSER] Final video created: {file_size_mb:.2f} MB")
                return True
            else:
                logger.error("🎬 [SIMPLE_COMPOSER] Final video not created or empty")
                return False
                
        except Exception as e:
            logger.error(f"🎬 [SIMPLE_COMPOSER] Audio merge error: {str(e)}")
            return False
    
    def _crop_avatar_to_template(self, avatar_frame: np.ndarray) -> np.ndarray:
        """
        Crop avatar frame to template dimensions while maintaining aspect ratio.
        
        This method ensures the avatar maintains its correct height and aspect ratio
        by cropping excess width from the sides instead of stretching the image.
        
        Args:
            avatar_frame: Input avatar frame (numpy array)
            
        Returns:
            Cropped avatar frame matching template dimensions (935x843)
        """
        try:
            # Get input frame dimensions
            input_height, input_width = avatar_frame.shape[:2]
            
            # Target template dimensions
            target_width = self.avatar_template['width']   # 935
            target_height = self.avatar_template['height'] # 843
            
            logger.debug(f"🎬 [SIMPLE_COMPOSER] Cropping avatar frame:")
            logger.debug(f"  - Input dimensions: {input_width}x{input_height}")
            logger.debug(f"  - Target dimensions: {target_width}x{target_height}")
            
            # Step 1: Scale the frame to match the target height while maintaining aspect ratio
            scale_factor = target_height / input_height
            scaled_width = int(input_width * scale_factor)
            scaled_height = target_height
            
            # Resize to target height
            avatar_scaled = cv2.resize(avatar_frame, (scaled_width, scaled_height))
            
            logger.debug(f"  - Scaled dimensions: {scaled_width}x{scaled_height}")
            
            # Step 2: Crop from center if scaled width is larger than target width
            if scaled_width > target_width:
                # Calculate crop start position (center crop)
                crop_start_x = (scaled_width - target_width) // 2
                crop_end_x = crop_start_x + target_width
                
                # Crop the frame
                avatar_cropped = avatar_scaled[:, crop_start_x:crop_end_x]
                
                logger.debug(f"  - Cropped from center: x={crop_start_x} to x={crop_end_x}")
            else:
                # If scaled width is smaller than target width, pad with background
                # This should rarely happen with proper aspect ratios
                logger.warning(f"🎬 [SIMPLE_COMPOSER] Scaled width ({scaled_width}) < target width ({target_width}), padding required")
                
                # Create background (dark purple to match theme)
                background = np.full((target_height, target_width, 3), (17, 12, 53), dtype=np.uint8)
                
                # Calculate padding to center the scaled frame
                pad_start_x = (target_width - scaled_width) // 2
                pad_end_x = pad_start_x + scaled_width
                
                # Place scaled frame in center of background
                background[:, pad_start_x:pad_end_x] = avatar_scaled
                avatar_cropped = background
            
            # Verify final dimensions
            final_height, final_width = avatar_cropped.shape[:2]
            if final_width != target_width or final_height != target_height:
                logger.error(f"🎬 [SIMPLE_COMPOSER] Cropping failed: got {final_width}x{final_height}, expected {target_width}x{target_height}")
                # Fallback to resize if cropping fails
                avatar_cropped = cv2.resize(avatar_frame, (target_width, target_height))
            
            logger.debug(f"  - Final dimensions: {final_width}x{final_height}")
            return avatar_cropped
            
        except Exception as e:
            logger.error(f"🎬 [SIMPLE_COMPOSER] Avatar cropping error: {str(e)}")
            # Fallback to resize if cropping fails
            return cv2.resize(avatar_frame, (self.avatar_template['width'], self.avatar_template['height']))
    
    def cleanup(self):
        """Cleanup temporary files and resources."""
        try:
            # Remove temporary directory if empty
            if self.temp_dir.exists() and not any(self.temp_dir.iterdir()):
                self.temp_dir.rmdir()
                logger.info("🎬 [SIMPLE_COMPOSER] Temporary directory cleaned up")
        except Exception as e:
            logger.warning(f"Could not cleanup temp directory: {e}")
