# custom_extensions/backend/app/services/video_assembly_service.py

import os
import subprocess
import tempfile
import logging
from typing import List, Optional, Dict, Any
from pathlib import Path

logger = logging.getLogger(__name__)

class VideoAssemblyService:
    """Service for assembling PNG images into video using FFmpeg."""
    
    def __init__(self):
        """Initialize the video assembly service."""
        self.ffmpeg_path = self._find_ffmpeg()
        self.default_fps = 1/5  # 5 seconds per slide
        self.output_fps = 25  # Standard video FPS
        
        logger.info(f"Video Assembly Service initialized. FFmpeg: {self.ffmpeg_path}")
    
    def _find_ffmpeg(self) -> str:
        """Find FFmpeg executable path."""
        # Try common locations
        possible_paths = [
            'ffmpeg',  # System PATH
            '/usr/bin/ffmpeg',
            '/usr/local/bin/ffmpeg',
            'C:\\ffmpeg\\bin\\ffmpeg.exe',
            'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe'
        ]
        
        for path in possible_paths:
            try:
                result = subprocess.run([path, '-version'], 
                                      capture_output=True, 
                                      timeout=5)
                if result.returncode == 0:
                    logger.info(f"Found FFmpeg at: {path}")
                    return path
            except:
                continue
        
        logger.warning("FFmpeg not found in standard locations")
        return 'ffmpeg'  # Hope it's in PATH
    
    async def create_video_from_pngs(self, 
                                   png_paths: List[str], 
                                   output_path: str,
                                   slide_duration: float = 5.0,
                                   quality: str = "high") -> bool:
        """
        Create video from PNG images.
        
        Args:
            png_paths: List of PNG file paths
            output_path: Output video path
            slide_duration: Duration per slide in seconds
            quality: Video quality (high, medium, low)
            
        Returns:
            True if successful, False otherwise
        """
        try:
            logger.info(f"Creating video from {len(png_paths)} PNG images")
            
            if not png_paths:
                logger.error("No PNG paths provided")
                return False
            
            # Verify all PNG files exist
            missing_files = []
            for png_path in png_paths:
                if not os.path.exists(png_path):
                    missing_files.append(png_path)
            
            if missing_files:
                logger.error(f"Missing PNG files: {missing_files}")
                return False
            
            # Create temporary file list for FFmpeg
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
                for png_path in png_paths:
                    # Write each image with duration
                    f.write(f"file '{os.path.abspath(png_path)}'\n")
                    f.write(f"duration {slide_duration}\n")
                
                # Add last image without duration (FFmpeg requirement)
                if png_paths:
                    f.write(f"file '{os.path.abspath(png_paths[-1])}'\n")
                
                file_list_path = f.name
            
            try:
                # Build FFmpeg command
                cmd = [
                    self.ffmpeg_path,
                    '-y',  # Overwrite output
                    '-f', 'concat',
                    '-safe', '0',
                    '-i', file_list_path,
                    '-vf', 'fps=25,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2',
                    '-c:v', 'libx264',
                    '-preset', self._get_preset(quality),
                    '-crf', str(self._get_crf(quality)),
                    '-pix_fmt', 'yuv420p',
                    output_path
                ]
                
                logger.info(f"Running FFmpeg command: {' '.join(cmd)}")
                
                # Run FFmpeg
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=300  # 5 minute timeout
                )
                
                if result.returncode == 0:
                    # Verify output file was created
                    if os.path.exists(output_path):
                        file_size = os.path.getsize(output_path)
                        logger.info(f"Video created successfully: {output_path} ({file_size} bytes)")
                        return True
                    else:
                        logger.error("FFmpeg succeeded but output file not found")
                        return False
                else:
                    logger.error(f"FFmpeg failed with return code {result.returncode}")
                    logger.error(f"FFmpeg stderr: {result.stderr}")
                    return False
                    
            finally:
                # Clean up temporary file list
                try:
                    os.unlink(file_list_path)
                except:
                    pass
                    
        except subprocess.TimeoutExpired:
            logger.error("FFmpeg command timed out")
            return False
        except Exception as e:
            logger.error(f"Failed to create video from PNGs: {str(e)}")
            return False
    
    def _get_preset(self, quality: str) -> str:
        """Get FFmpeg preset based on quality."""
        presets = {
            "high": "slow",
            "medium": "medium", 
            "low": "fast"
        }
        return presets.get(quality, "medium")
    
    def _get_crf(self, quality: str) -> int:
        """Get FFmpeg CRF value based on quality."""
        crf_values = {
            "high": 18,    # High quality
            "medium": 23,  # Medium quality
            "low": 28      # Lower quality
        }
        return crf_values.get(quality, 23)
    
    async def create_slide_video_from_props(self,
                                          slides_props: List[Dict[str, Any]],
                                          theme: str,
                                          output_path: str,
                                          slide_duration: float = 5.0,
                                          quality: str = "high") -> bool:
        """
        Create video from slide props using HTML → PNG → Video pipeline.
        
        Args:
            slides_props: List of slide props with templateId and properties
            theme: Theme name
            output_path: Output video path
            slide_duration: Duration per slide in seconds
            quality: Video quality
            
        Returns:
            True if successful, False otherwise
        """
        png_paths = []
        temp_files = []
        
        try:
            logger.info(f"Creating video from {len(slides_props)} slides")
            
            # Import services (Chromium-free)
            from .html_to_image_service import html_to_image_service
            
            # Generate PNG for each slide
            for i, slide_props in enumerate(slides_props):
                template_id = slide_props.get("templateId")
                if not template_id:
                    logger.error(f"Slide {i} missing templateId")
                    continue
                
                # Create temporary PNG file
                temp_png = tempfile.NamedTemporaryFile(
                    suffix=f'_slide_{i}.png', 
                    delete=False
                )
                temp_png.close()
                temp_files.append(temp_png.name)
                
                # Convert slide to PNG (Chromium-free)
                success = await html_to_image_service.convert_slide_to_png(
                    template_id=template_id,
                    props=slide_props,
                    theme=theme,
                    output_path=temp_png.name
                )
                
                if success:
                    png_paths.append(temp_png.name)
                    logger.info(f"Generated PNG for slide {i}: {template_id}")
                else:
                    logger.error(f"Failed to generate PNG for slide {i}: {template_id}")
            
            if not png_paths:
                logger.error("No PNGs generated successfully")
                return False
            
            # Create video from PNGs
            success = await self.create_video_from_pngs(
                png_paths=png_paths,
                output_path=output_path,
                slide_duration=slide_duration,
                quality=quality
            )
            
            return success
            
        except Exception as e:
            logger.error(f"Failed to create slide video: {str(e)}")
            return False
        finally:
            # Clean up temporary PNG files
            for temp_file in temp_files:
                try:
                    if os.path.exists(temp_file):
                        os.unlink(temp_file)
                except:
                    pass
    
    def check_ffmpeg_available(self) -> bool:
        """Check if FFmpeg is available."""
        try:
            result = subprocess.run([self.ffmpeg_path, '-version'], 
                                  capture_output=True, 
                                  timeout=5)
            return result.returncode == 0
        except:
            return False

# Global instance
video_assembly_service = VideoAssemblyService()
