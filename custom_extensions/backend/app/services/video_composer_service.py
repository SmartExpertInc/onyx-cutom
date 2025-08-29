#!/usr/bin/env python3
"""
Professional Video Composition Service
====================================

This service provides high-quality video composition using FFmpeg for merging
slide videos with avatar videos into professional presentations.
"""

import asyncio
import logging
import os
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import json
from datetime import datetime

logger = logging.getLogger(__name__)

@dataclass
class VideoTrack:
    """Configuration for a video track in composition."""
    path: str
    start_time: float = 0
    duration: Optional[float] = None
    position: Tuple[int, int] = (0, 0)
    scale: Tuple[float, float] = (1.0, 1.0)
    opacity: float = 1.0

@dataclass
class CompositionConfig:
    """Configuration for video composition."""
    output_path: str
    resolution: Tuple[int, int] = (1920, 1080)
    framerate: int = 30
    video_codec: str = 'libx264'
    audio_codec: str = 'aac'
    quality: str = 'high'  # 'high', 'medium', 'low'
    layout: str = 'picture_in_picture'  # 'side_by_side', 'picture_in_picture', 'split_screen'

class ProfessionalVideoComposer:
    """Professional video composition service using FFmpeg."""
    
    def __init__(self):
        self.temp_dir = Path("temp/compositions")
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        
        # Quality presets for FFmpeg
        self.quality_presets = {
            'high': {'crf': 18, 'preset': 'slow'},
            'medium': {'crf': 23, 'preset': 'medium'},
            'low': {'crf': 28, 'preset': 'fast'}
        }
        
        logger.info("Professional Video Composer initialized")
    
    async def compose_presentation(
        self,
        slide_video: str,
        avatar_video: str,
        config: CompositionConfig,
        progress_callback=None
    ) -> str:
        """
        Compose slide and avatar videos with professional quality.
        
        Args:
            slide_video: Path to slide video file
            avatar_video: Path to avatar video file
            config: Composition configuration
            
        Returns:
            Path to the composed video file
        """
        try:
            logger.info(f"🎬 [VIDEO_COMPOSITION] Starting video composition: {config.layout}")
            logger.info(f"🎬 [VIDEO_COMPOSITION] Input files:")
            logger.info(f"  - Slide video: {slide_video}")
            logger.info(f"  - Avatar video: {avatar_video}")
            logger.info(f"  - Output path: {config.output_path}")
            logger.info(f"  - Resolution: {config.resolution}")
            logger.info(f"  - Quality: {config.quality}")
            
            # Validate input files
            if not os.path.exists(slide_video):
                logger.error(f"🎬 [VIDEO_COMPOSITION] Slide video not found: {slide_video}")
                raise FileNotFoundError(f"Slide video not found: {slide_video}")
            if not os.path.exists(avatar_video):
                logger.error(f"🎬 [VIDEO_COMPOSITION] Avatar video not found: {avatar_video}")
                raise FileNotFoundError(f"Avatar video not found: {avatar_video}")
            
            # Get video durations and dimensions
            slide_duration = await self._get_video_duration(slide_video)
            avatar_duration = await self._get_video_duration(avatar_video)
            
            slide_dimensions = await self._get_video_dimensions(slide_video)
            avatar_dimensions = await self._get_video_dimensions(avatar_video)
            
            logger.info(f"🎬 [VIDEO_COMPOSITION] Video analysis:")
            logger.info(f"  - Slide duration: {slide_duration}s, dimensions: {slide_dimensions}")
            logger.info(f"  - Avatar duration: {avatar_duration}s, dimensions: {avatar_dimensions}")
            
            # Use SimpleVideoComposer for reliable, single-method composition
            logger.info(f"🎬 [VIDEO_COMPOSITION] Using SimpleVideoComposer (OpenCV-based)")
            logger.info(f"🎬 [VIDEO_COMPOSITION] Eliminating dual-approach complexity")
            
            # Import and initialize SimpleVideoComposer
            from .simple_video_composer import SimpleVideoComposer
            simple_composer = SimpleVideoComposer()
            
            # Progress tracking - relay to external callback if provided
            def internal_progress_callback(progress):
                logger.info(f"🎬 [VIDEO_COMPOSITION] Composition progress: {progress}%")
                if progress_callback:
                    progress_callback(progress)
            
            # Compose videos using simple, reliable method
            success = await simple_composer.compose_videos(
                slide_video_path=slide_video,
                avatar_video_path=avatar_video,
                output_path=config.output_path,
                progress_callback=internal_progress_callback
            )
            
            # Cleanup
            simple_composer.cleanup()
            
            if success:
                logger.info("🎬 [VIDEO_COMPOSITION] Simple composition completed successfully")
                return config.output_path
            else:
                logger.error("🎬 [VIDEO_COMPOSITION] Simple composition failed")
                raise Exception("Video composition failed")
                
        except Exception as e:
            logger.error(f"Video composition failed: {e}")
            raise
    
    # NOTE: Old composition methods removed - replaced with SimpleVideoComposer
    # This eliminates the dual-approach complexity and provides single, reliable method
    
    async def _execute_ffmpeg_command(self, cmd: List[str], operation_name: str) -> str:
        """
        Execute FFmpeg command with proper error handling.
        
        Args:
            cmd: FFmpeg command as list
            operation_name: Name of the operation for logging
            
        Returns:
            Output file path
        """
        try:
            logger.info(f"🎬 [FFMPEG_EXECUTION] Executing FFmpeg command for: {operation_name}")
            logger.info(f"🎬 [FFMPEG_EXECUTION] Command: {' '.join(cmd)}")
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            logger.info(f"🎬 [FFMPEG_EXECUTION] Process completed with return code: {process.returncode}")
            
            if stdout:
                logger.info(f"🎬 [FFMPEG_EXECUTION] Stdout: {stdout.decode()}")
            if stderr:
                logger.info(f"🎬 [FFMPEG_EXECUTION] Stderr: {stderr.decode()}")
            
            if process.returncode != 0:
                error_msg = stderr.decode() if stderr else "Unknown FFmpeg error"
                logger.error(f"🎬 [FFMPEG_EXECUTION] {operation_name} failed: {error_msg}")
                raise Exception(f"{operation_name} failed: {error_msg}")
            
            logger.info(f"🎬 [FFMPEG_EXECUTION] {operation_name} completed successfully")
            output_path = cmd[-1]
            logger.info(f"🎬 [FFMPEG_EXECUTION] Output file: {output_path}")
            
            # Check if output file exists and get its size
            if os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                logger.info(f"🎬 [FFMPEG_EXECUTION] Output file size: {file_size} bytes")
            else:
                logger.warning(f"🎬 [FFMPEG_EXECUTION] Output file not found: {output_path}")
            
            return output_path
            
        except Exception as e:
            logger.error(f"FFmpeg execution failed: {e}")
            raise
    
    async def _get_video_duration(self, video_path: str) -> float:
        """
        Get video duration using FFprobe.
        
        Args:
            video_path: Path to video file
            
        Returns:
            Duration in seconds
        """
        try:
            cmd = [
                'ffprobe',
                '-v', 'quiet',
                '-show_entries', 'format=duration',
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
                logger.warning(f"Could not get duration for {video_path}: {stderr.decode()}")
                return 10.0  # Default duration
            
            data = json.loads(stdout.decode())
            duration = float(data['format']['duration'])
            
            return duration
            
        except Exception as e:
            logger.warning(f"Error getting video duration: {e}")
            return 10.0  # Default duration
    
    async def _get_video_dimensions(self, video_path: str) -> tuple:
        """
        Get video dimensions using FFprobe.
        
        Args:
            video_path: Path to video file
            
        Returns:
            Tuple of (width, height)
        """
        try:
            cmd = [
                'ffprobe',
                '-v', 'quiet',
                '-select_streams', 'v:0',
                '-show_entries', 'stream=width,height',
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
                logger.warning(f"Could not get dimensions for {video_path}: {stderr.decode()}")
                return (1920, 1080)  # Default dimensions
            
            data = json.loads(stdout.decode())
            streams = data.get('streams', [])
            
            if streams:
                width = streams[0].get('width', 1920)
                height = streams[0].get('height', 1080)
                return (width, height)
            else:
                logger.warning(f"No video streams found in {video_path}")
                return (1920, 1080)  # Default dimensions
            
        except Exception as e:
            logger.warning(f"Error getting video dimensions: {e}")
            return (1920, 1080)  # Default dimensions
    
    async def add_professional_intro(self, video_path: str, intro_duration: float = 3.0) -> str:
        """
        Add a professional intro animation to the video.
        
        Args:
            video_path: Path to input video
            intro_duration: Duration of intro in seconds
            
        Returns:
            Path to video with intro
        """
        try:
            output_path = video_path.replace('.mp4', '_with_intro.mp4')
            
            logger.info(f"Adding professional intro to video")
            
            # Create intro with fade-in effect
            cmd = [
                'ffmpeg',
                '-i', video_path,
                '-vf', f'fade=t=in:st=0:d={intro_duration},fade=t=out:st=-3:d=3',
                '-c:v', 'libx264',
                '-c:a', 'aac',
                '-crf', '18',
                '-preset', 'slow',
                '-y',
                output_path
            ]
            
            return await self._execute_ffmpeg_command(cmd, "Intro addition")
            
        except Exception as e:
            logger.error(f"Intro addition failed: {e}")
            raise
    
    async def optimize_for_web(self, video_path: str) -> str:
        """
        Optimize video for web streaming.
        
        Args:
            video_path: Path to input video
            
        Returns:
            Path to optimized video
        """
        try:
            output_path = video_path.replace('.mp4', '_optimized.mp4')
            
            logger.info(f"Optimizing video for web streaming")
            
            cmd = [
                'ffmpeg',
                '-i', video_path,
                '-c:v', 'libx264',
                '-c:a', 'aac',
                '-crf', '23',
                '-preset', 'medium',
                '-movflags', '+faststart',
                '-pix_fmt', 'yuv420p',
                '-y',
                output_path
            ]
            
            return await self._execute_ffmpeg_command(cmd, "Web optimization")
            
        except Exception as e:
            logger.error(f"Web optimization failed: {e}")
            raise
    
    async def create_thumbnail(self, video_path: str, output_path: str, time_offset: float = 5.0) -> str:
        """
        Create a thumbnail from video.
        
        Args:
            video_path: Path to input video
            output_path: Path for thumbnail output
            time_offset: Time offset in seconds for thumbnail
            
        Returns:
            Path to thumbnail image
        """
        try:
            logger.info(f"Creating thumbnail from video")
            
            cmd = [
                'ffmpeg',
                '-i', video_path,
                '-ss', str(time_offset),
                '-vframes', '1',
                '-q:v', '2',
                '-y',
                output_path
            ]
            
            return await self._execute_ffmpeg_command(cmd, "Thumbnail creation")
            
        except Exception as e:
            logger.error(f"Thumbnail creation failed: {e}")
            raise

# Global instance
video_composer_service = ProfessionalVideoComposer()
