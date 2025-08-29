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
    layout: str = 'side_by_side'  # 'side_by_side', 'picture_in_picture', 'split_screen'

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
        config: CompositionConfig
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
            logger.info(f"Starting video composition: {config.layout}")
            
            # Validate input files
            if not os.path.exists(slide_video):
                raise FileNotFoundError(f"Slide video not found: {slide_video}")
            if not os.path.exists(avatar_video):
                raise FileNotFoundError(f"Avatar video not found: {avatar_video}")
            
            # Get video durations
            slide_duration = await self._get_video_duration(slide_video)
            avatar_duration = await self._get_video_duration(avatar_video)
            
            logger.info(f"Slide duration: {slide_duration}s, Avatar duration: {avatar_duration}s")
            
            # Choose composition method based on layout
            if config.layout == 'side_by_side':
                return await self._compose_side_by_side(slide_video, avatar_video, config)
            elif config.layout == 'picture_in_picture':
                return await self._compose_pip(slide_video, avatar_video, config)
            elif config.layout == 'split_screen':
                return await self._compose_split_screen(slide_video, avatar_video, config)
            else:
                raise ValueError(f"Unsupported layout: {config.layout}")
                
        except Exception as e:
            logger.error(f"Video composition failed: {e}")
            raise
    
    async def _compose_side_by_side(self, slide_video: str, avatar_video: str, config: CompositionConfig) -> str:
        """Side-by-side composition with professional quality."""
        try:
            logger.info("Creating side-by-side composition")
            
            # Calculate dimensions for each half
            half_width = config.resolution[0] // 2
            full_height = config.resolution[1]
            
            # Build FFmpeg command for side-by-side composition
            cmd = [
                'ffmpeg',
                '-i', slide_video,
                '-i', avatar_video,
                '-filter_complex', f'[0:v]scale={half_width}:{full_height}[slide];[1:v]scale={half_width}:{full_height}[avatar];[slide][avatar]hstack=inputs=2',
                '-c:v', config.video_codec,
                '-c:a', config.audio_codec,
                '-crf', str(self.quality_presets[config.quality]['crf']),
                '-preset', self.quality_presets[config.quality]['preset'],
                '-pix_fmt', 'yuv420p',
                '-r', str(config.framerate),
                '-movflags', '+faststart',
                '-y',
                config.output_path
            ]
            
            return await self._execute_ffmpeg_command(cmd, "Side-by-side composition")
            
        except Exception as e:
            logger.error(f"Side-by-side composition failed: {e}")
            raise
    
    async def _compose_pip(self, slide_video: str, avatar_video: str, config: CompositionConfig) -> str:
        """Picture-in-picture composition with professional overlay."""
        try:
            logger.info("Creating picture-in-picture composition")
            
            # Calculate overlay dimensions (25% of main video)
            overlay_width = config.resolution[0] // 4
            overlay_height = config.resolution[1] // 4
            
            # Position overlay in bottom-right corner
            overlay_x = config.resolution[0] - overlay_width - 20  # 20px margin
            overlay_y = config.resolution[1] - overlay_height - 20  # 20px margin
            
            # Build FFmpeg command for PiP composition
            cmd = [
                'ffmpeg',
                '-i', slide_video,
                '-i', avatar_video,
                '-filter_complex', f'[0:v][1:v]overlay={overlay_x}:{overlay_y}:shortest=1',
                '-c:v', config.video_codec,
                '-c:a', config.audio_codec,
                '-crf', str(self.quality_presets[config.quality]['crf']),
                '-preset', self.quality_presets[config.quality]['preset'],
                '-pix_fmt', 'yuv420p',
                '-r', str(config.framerate),
                '-movflags', '+faststart',
                '-y',
                config.output_path
            ]
            
            return await self._execute_ffmpeg_command(cmd, "Picture-in-picture composition")
            
        except Exception as e:
            logger.error(f"Picture-in-picture composition failed: {e}")
            raise
    
    async def _compose_split_screen(self, slide_video: str, avatar_video: str, config: CompositionConfig) -> str:
        """Split screen composition with custom positioning."""
        try:
            logger.info("Creating split screen composition")
            
            # Create a more sophisticated split screen layout
            # Slide takes 70% of width, avatar takes 30%
            slide_width = int(config.resolution[0] * 0.7)
            avatar_width = config.resolution[0] - slide_width
            full_height = config.resolution[1]
            
            # Build FFmpeg command for split screen composition
            cmd = [
                'ffmpeg',
                '-i', slide_video,
                '-i', avatar_video,
                '-filter_complex', f'[0:v]scale={slide_width}:{full_height}[slide];[1:v]scale={avatar_width}:{full_height}[avatar];[slide][avatar]hstack=inputs=2',
                '-c:v', config.video_codec,
                '-c:a', config.audio_codec,
                '-crf', str(self.quality_presets[config.quality]['crf']),
                '-preset', self.quality_presets[config.quality]['preset'],
                '-pix_fmt', 'yuv420p',
                '-r', str(config.framerate),
                '-movflags', '+faststart',
                '-y',
                config.output_path
            ]
            
            return await self._execute_ffmpeg_command(cmd, "Split screen composition")
            
        except Exception as e:
            logger.error(f"Split screen composition failed: {e}")
            raise
    
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
            logger.info(f"Executing FFmpeg command: {' '.join(cmd)}")
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                error_msg = stderr.decode() if stderr else "Unknown FFmpeg error"
                logger.error(f"{operation_name} failed: {error_msg}")
                raise Exception(f"{operation_name} failed: {error_msg}")
            
            logger.info(f"{operation_name} completed successfully")
            return cmd[-1]  # Return output path
            
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
