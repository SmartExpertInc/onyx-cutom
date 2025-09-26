#!/usr/bin/env python3
"""
Standalone Video Generator - Proof of Concept
============================================

This script demonstrates the complete video generation and merging workflow:
1. Creates a slide video from a static image
2. Generates an AI avatar video using the Elai API
3. Merges the videos with avatar overlay
4. Downloads the final video

Requirements:
- Python 3.7+
- FFmpeg installed and available in PATH
- requests library: pip install requests
- aiohttp library: pip install aiohttp

Usage:
- python standalone_video_generator.py [input_image_path]

Example:
- python standalone_video_generator.py slide_image.jpg
"""

import os
import sys
import asyncio
import aiohttp
import requests
import json
import time
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Any
import subprocess
import tempfile
import shutil

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'video_generator_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

class StandaloneVideoGenerator:
    """Standalone video generation and merging system."""
    
    def __init__(self):
        """Initialize the video generator."""
        self.elai_api_token = "5774fLyEZuhr22LTmv6zwjZuk9M5rQ9e"
        self.elai_api_base = "https://apis.elai.io/api/v1"
        self.output_dir = Path("output")
        self.temp_dir = Path("temp")
        
        # Create output and temp directories
        self.output_dir.mkdir(exist_ok=True)
        self.temp_dir.mkdir(exist_ok=True)
        
        # Video configuration
        self.slide_duration = 10.0  # seconds
        self.video_resolution = (1920, 1080)
        self.frame_rate = 30
        
        # Voiceover text for the avatar
        self.voiceover_text = """
        Welcome to this demonstration of our AI video generation system. 
        This technology combines static slide content with dynamic AI avatars 
        to create engaging presentations. The system seamlessly merges 
        visual content with natural speech synthesis for professional results.
        """
        
        logger.info("Standalone Video Generator initialized")
        logger.info(f"Output directory: {self.output_dir}")
        logger.info(f"Temp directory: {self.temp_dir}")
    
    def check_ffmpeg(self) -> bool:
        """Check if FFmpeg is available in the system."""
        try:
            result = subprocess.run(['ffmpeg', '-version'], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                logger.info("✅ FFmpeg is available")
                return True
            else:
                logger.error("❌ FFmpeg check failed")
                return False
        except (subprocess.TimeoutExpired, FileNotFoundError):
            logger.error("❌ FFmpeg not found in PATH")
            return False
    
    async def get_avatars(self) -> List[Dict[str, Any]]:
        """Fetch available avatars from the Elai API."""
        logger.info("Fetching available avatars from Elai API...")
        
        headers = {
            "Authorization": f"Bearer {self.elai_api_token}",
            "Accept": "application/json"
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.elai_api_base}/avatars", headers=headers) as response:
                    if response.status == 200:
                        avatars = await response.json()
                        logger.info(f"✅ Retrieved {len(avatars)} avatars")
                        return avatars
                    else:
                        error_text = await response.text()
                        logger.error(f"❌ Failed to fetch avatars: {response.status} - {error_text}")
                        return []
        except Exception as e:
            logger.error(f"❌ Exception fetching avatars: {e}")
            return []
    
    def select_avatar(self, avatars: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Select the second avatar from the list."""
        if len(avatars) < 2:
            logger.warning(f"Only {len(avatars)} avatars available, using first one")
            return avatars[0] if avatars else None
        
        selected_avatar = avatars[1]  # Second avatar
        logger.info(f"Selected avatar: {selected_avatar.get('name', 'Unknown')}")
        logger.info(f"Avatar code: {selected_avatar.get('code', 'Unknown')}")
        return selected_avatar
    
    async def create_slide_video(self, image_path: str) -> str:
        """Create a video from a static image using FFmpeg."""
        logger.info(f"Creating slide video from image: {image_path}")
        
        # Validate input image
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Input image not found: {image_path}")
        
        # Generate output path
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = self.temp_dir / f"slide_video_{timestamp}.mp4"
        
        # FFmpeg command to create video from image
        cmd = [
            'ffmpeg',
            '-loop', '1',  # Loop the input image
            '-i', image_path,  # Input image
            '-c:v', 'libx264',  # Video codec
            '-t', str(self.slide_duration),  # Duration
            '-pix_fmt', 'yuv420p',  # Pixel format
            '-vf', f'scale={self.video_resolution[0]}:{self.video_resolution[1]}:force_original_aspect_ratio=decrease,pad={self.video_resolution[0]}:{self.video_resolution[1]}:(ow-iw)/2:(oh-ih)/2',  # Scale and pad
            '-r', str(self.frame_rate),  # Frame rate
            '-y',  # Overwrite output
            str(output_path)
        ]
        
        logger.info(f"Running FFmpeg command: {' '.join(cmd)}")
        
        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                logger.info(f"✅ Slide video created: {output_path}")
                return str(output_path)
            else:
                error_msg = stderr.decode() if stderr else "Unknown FFmpeg error"
                logger.error(f"❌ FFmpeg failed: {error_msg}")
                raise Exception(f"FFmpeg failed: {error_msg}")
                
        except Exception as e:
            logger.error(f"❌ Exception creating slide video: {e}")
            raise
    
    async def create_avatar_video(self, avatar: Dict[str, Any]) -> str:
        """Create an AI avatar video using the Elai API."""
        logger.info("Creating AI avatar video...")
        
        # COORDINATED MODE: Avatar positioned to match composition template expectations
        # Template requirements: 935x843 at position (925, 118) on 1920x1080 canvas
        template_width = 935
        template_height = 843
        template_x = 925
        template_y = 118
        canvas_width = 1920
        canvas_height = 1080
        
        # Calculate scale factors to fill template area
        scale_x = template_width / canvas_width   # 935/1920 ≈ 0.487
        scale_y = template_height / canvas_height # 843/1080 ≈ 0.781
        
        # Calculate positioning (Elai uses center-point positioning)
        center_x = template_x + (template_width / 2)   # 925 + 467.5 = 1392.5
        center_y = template_y + (template_height / 2)  # 118 + 421.5 = 539.5
        
        logger.info(f"🎬 [STANDALONE_ELAI] Coordinated avatar parameters:")
        logger.info(f"  - Template area: {template_width}x{template_height} at ({template_x}, {template_y})")
        logger.info(f"  - Scale factors: scaleX={scale_x:.3f}, scaleY={scale_y:.3f}")
        logger.info(f"  - Center position: left={center_x:.1f}, top={center_y:.1f}")
        
        # Prepare the video creation request
        video_data = {
            "name": f"Avatar Video - {datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "slides": [
                {
                    "id": 1,
                    "status": "edited",
                    "canvas": {
                        "objects": [
                            {
                                "type": "avatar",
                                "left": center_x,    # Positions avatar center in template area
                                "top": center_y,     # Positions avatar center in template area
                                "fill": "#4868FF",
                                "scaleX": scale_x,   # Scales to fill template width
                                "scaleY": scale_y,   # Scales to fill template height
                                "width": canvas_width,
                                "height": canvas_height,
                                "src": avatar.get("canvas", ""),
                                "avatarType": "transparent",
                                "animation": {
                                    "type": None,
                                    "exitType": None
                                }
                            }
                        ],
                        "background": "#00FF00",  # Green background for chroma key
                        "version": "4.4.0"
                    },
                    "avatar": {
                        "code": avatar.get("code", ""),
                        "name": avatar.get("name", ""),
                        "gender": avatar.get("gender", "female"),
                        "canvas": avatar.get("canvas", "")
                    },
                    "animation": "fade_in",
                    "language": "English",
                    "speech": self.voiceover_text.strip(),
                    "voice": "en-US-AriaNeural",
                    "voiceType": "text",
                    "voiceProvider": "azure"
                }
            ],
            "tags": ["standalone", "demo", "avatar"]
        }
        
        headers = {
            "Authorization": f"Bearer {self.elai_api_token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        try:
            # Create video
            logger.info("Sending video creation request to Elai API...")
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.elai_api_base}/videos",
                    json=video_data,
                    headers=headers
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        video_id = result.get("_id")
                        logger.info(f"✅ Video created with ID: {video_id}")
                    else:
                        error_text = await response.text()
                        logger.error(f"❌ Video creation failed: {response.status} - {error_text}")
                        raise Exception(f"Video creation failed: {error_text}")
            
            # Start rendering
            logger.info("Starting video rendering...")
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.elai_api_base}/videos/render/{video_id}",
                    headers=headers
                ) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"❌ Render start failed: {response.status} - {error_text}")
                        raise Exception(f"Render start failed: {error_text}")
                    logger.info("✅ Video rendering started")
            
            # Wait for completion and download
            download_url = await self._wait_for_completion(video_id)
            if not download_url:
                raise Exception("Video rendering failed or timed out")
            
            # Download the video
            avatar_video_path = await self._download_video(download_url, video_id)
            logger.info(f"✅ Avatar video downloaded: {avatar_video_path}")
            return avatar_video_path
            
        except Exception as e:
            logger.error(f"❌ Exception creating avatar video: {e}")
            raise
    
    async def _wait_for_completion(self, video_id: str, max_wait_minutes: int = 15) -> Optional[str]:
        """Wait for video rendering to complete."""
        logger.info(f"Waiting for video completion (max {max_wait_minutes} minutes)...")
        
        start_time = time.time()
        max_wait_seconds = max_wait_minutes * 60
        check_interval = 30  # Check every 30 seconds
        
        headers = {
            "Authorization": f"Bearer {self.elai_api_token}",
            "Accept": "application/json"
        }
        
        while time.time() - start_time < max_wait_seconds:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(
                        f"{self.elai_api_base}/videos/{video_id}",
                        headers=headers
                    ) as response:
                        if response.status == 200:
                            video_data = await response.json()
                            status = video_data.get("status", "unknown")
                            logger.info(f"Video status: {status}")
                            
                            if status in ["rendered", "ready"]:
                                download_url = video_data.get("videoUrl") or video_data.get("url")
                                if download_url:
                                    logger.info(f"✅ Video ready for download: {download_url}")
                                    return download_url
                                else:
                                    logger.error("Video rendered but no download URL found")
                                    return None
                            elif status in ["failed", "error"]:
                                logger.error(f"Video rendering failed: {status}")
                                return None
                            elif status in ["rendering", "queued", "draft", "validating"]:
                                elapsed_minutes = (time.time() - start_time) / 60
                                logger.info(f"Still {status}... (elapsed: {elapsed_minutes:.1f} minutes)")
                            else:
                                logger.warning(f"Unknown status: {status}")
                        else:
                            logger.warning(f"Status check failed: {response.status}")
            
            except Exception as e:
                logger.warning(f"Status check exception: {e}")
            
            await asyncio.sleep(check_interval)
        
        logger.error(f"Timeout after {max_wait_minutes} minutes")
        return None
    
    async def _download_video(self, download_url: str, video_id: str) -> str:
        """Download the rendered video."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = self.temp_dir / f"avatar_video_{video_id}_{timestamp}.mp4"
        
        logger.info(f"Downloading video to: {output_path}")
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(download_url) as response:
                    if response.status == 200:
                        with open(output_path, 'wb') as f:
                            async for chunk in response.content.iter_chunked(8192):
                                f.write(chunk)
                        
                        file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
                        logger.info(f"✅ Video downloaded: {file_size_mb:.2f} MB")
                        return str(output_path)
                    else:
                        raise Exception(f"Download failed: {response.status}")
        except Exception as e:
            logger.error(f"❌ Download exception: {e}")
            raise
    
    async def merge_videos(self, slide_video_path: str, avatar_video_path: str) -> str:
        """Merge the slide video and avatar video with overlay."""
        logger.info("Merging videos with avatar overlay...")
        
        # Generate output path
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = self.output_dir / f"final_video_{timestamp}.mp4"
        
        # FFmpeg command for video merging with chroma key
        cmd = [
            'ffmpeg',
            '-i', slide_video_path,  # Background video (slide)
            '-i', avatar_video_path,  # Foreground video (avatar)
            '-filter_complex', 
            '[1:v]chromakey=0x00FF00:0.1:0.2[ckout];[0:v][ckout]overlay=W-w-50:H-h-50',  # Chroma key and overlay
            '-c:v', 'libx264',  # Video codec
            '-c:a', 'aac',  # Audio codec
            '-crf', '23',  # Quality
            '-preset', 'medium',  # Encoding preset
            '-pix_fmt', 'yuv420p',  # Pixel format
            '-y',  # Overwrite output
            str(output_path)
        ]
        
        logger.info(f"Running FFmpeg merge command: {' '.join(cmd)}")
        
        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
                logger.info(f"✅ Videos merged successfully: {output_path}")
                logger.info(f"Final video size: {file_size_mb:.2f} MB")
                return str(output_path)
            else:
                error_msg = stderr.decode() if stderr else "Unknown FFmpeg error"
                logger.error(f"❌ FFmpeg merge failed: {error_msg}")
                raise Exception(f"FFmpeg merge failed: {error_msg}")
                
        except Exception as e:
            logger.error(f"❌ Exception merging videos: {e}")
            raise
    
    async def cleanup_temp_files(self):
        """Clean up temporary files."""
        logger.info("Cleaning up temporary files...")
        try:
            for file_path in self.temp_dir.glob("*"):
                if file_path.is_file():
                    file_path.unlink()
                    logger.info(f"Cleaned up: {file_path}")
        except Exception as e:
            logger.warning(f"Cleanup warning: {e}")
    
    async def run_workflow(self, input_image_path: str):
        """Run the complete video generation workflow."""
        logger.info("🚀 Starting Standalone Video Generation Workflow")
        logger.info("=" * 60)
        
        try:
            # Step 1: Check FFmpeg availability
            if not self.check_ffmpeg():
                raise Exception("FFmpeg is required but not available")
            
            # Step 2: Get available avatars
            avatars = await self.get_avatars()
            if not avatars:
                raise Exception("No avatars available")
            
            # Step 3: Select avatar
            selected_avatar = self.select_avatar(avatars)
            if not selected_avatar:
                raise Exception("Failed to select avatar")
            
            # Step 4: Create slide video
            slide_video_path = await self.create_slide_video(input_image_path)
            
            # Step 5: Create avatar video
            avatar_video_path = await self.create_avatar_video(selected_avatar)
            
            # Step 6: Merge videos
            final_video_path = await self.merge_videos(slide_video_path, avatar_video_path)
            
            # Step 7: Cleanup
            await self.cleanup_temp_files()
            
            logger.info("🎉 Workflow completed successfully!")
            logger.info(f"📁 Final video: {final_video_path}")
            logger.info("=" * 60)
            
            return final_video_path
            
        except Exception as e:
            logger.error(f"❌ Workflow failed: {e}")
            logger.error("=" * 60)
            raise

def main():
    """Main function."""
    print("🎬 Standalone Video Generator - Proof of Concept")
    print("=" * 60)
    
    # Check command line arguments
    if len(sys.argv) != 2:
        print("Usage: python standalone_video_generator.py <input_image_path>")
        print("Example: python standalone_video_generator.py slide_image.jpg")
        sys.exit(1)
    
    input_image_path = sys.argv[1]
    
    # Validate input file
    if not os.path.exists(input_image_path):
        print(f"❌ Input image not found: {input_image_path}")
        sys.exit(1)
    
    print(f"📸 Input image: {input_image_path}")
    print("⏳ Starting video generation workflow...")
    print()
    
    # Create and run the video generator
    generator = StandaloneVideoGenerator()
    
    try:
        # Run the workflow
        final_video_path = asyncio.run(generator.run_workflow(input_image_path))
        
        print()
        print("✅ Video generation completed successfully!")
        print(f"🎬 Final video: {final_video_path}")
        print()
        print("🎉 Proof of concept demonstration complete!")
        print("The video shows the slide content with an AI avatar overlay.")
        
    except Exception as e:
        print(f"❌ Video generation failed: {e}")
        print()
        print("💡 Troubleshooting tips:")
        print("1. Make sure FFmpeg is installed and available in PATH")
        print("2. Check your internet connection for Elai API access")
        print("3. Verify the input image file is valid")
        print("4. Check the log file for detailed error information")
        sys.exit(1)

if __name__ == "__main__":
    main()
