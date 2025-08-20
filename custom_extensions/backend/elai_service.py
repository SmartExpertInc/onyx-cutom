#!/usr/bin/env python3
"""
Elai API Service
================

This module provides integration with the Elai API for creating video lessons with AI avatars.
It handles video creation, rendering, and downloading with proper error handling and logging.

Key Features:
- Create videos with AI avatars on green screen backgrounds
- Render videos with voiceover text
- Monitor rendering progress
- Download completed videos
- Support for multiple avatar types and voices
- Background color customization
- Error handling and retry logic
"""

import os
import sys
import time
import json
import logging
import requests
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass
from enum import Enum

# Configure logging
logger = logging.getLogger(__name__)

class AvatarType(Enum):
    """Supported avatar types for Elai API"""
    GIA_CASUAL = "gia.casual"
    DYLAN_CASUAL = "dylan.casual"
    ANNA_CASUAL = "anna.casual"
    LISA_CASUAL = "lisa.casual"

class VoiceType(Enum):
    """Supported voice types for Elai API"""
    ARIA_NEURAL = "en-US-AriaNeural"
    GUY_NEURAL = "en-US-GuyNeural"
    JENNY_NEURAL = "en-US-JennyNeural"
    TONY_NEURAL = "en-US-TonyNeural"

@dataclass
class ElaiVideoConfig:
    """Configuration for Elai video generation"""
    avatar_code: str = "gia.casual"
    voice: str = "en-US-AriaNeural"
    language: str = "English"
    background_color: str = "#00FF00"  # Green for chroma key
    avatar_scale: float = 0.1
    avatar_position: Tuple[int, int] = (510, 255)
    video_format: str = "16_9"
    resolution: str = "FullHD"
    music_volume: float = 0.0  # No background music for voiceover

@dataclass
class ElaiVideoResult:
    """Result of Elai video generation"""
    video_id: str
    download_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration: Optional[float] = None
    file_size: Optional[int] = None
    status: str = "created"
    error_message: Optional[str] = None

class ElaiAPIService:
    """Service for interacting with the Elai API"""
    
    def __init__(self, api_token: str):
        """Initialize the Elai API service with authentication token."""
        self.api_token = api_token
        self.base_url = "https://apis.elai.io/api/v1"
        self.headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
        
        logger.info("Elai API Service initialized")
        logger.info(f"Base URL: {self.base_url}")
        
    def log_request_response(self, method: str, url: str, request_data: Dict = None, response: requests.Response = None):
        """Log detailed request and response information."""
        logger.info(f"\n{'='*60}")
        logger.info(f"REQUEST: {method.upper()} {url}")
        logger.info(f"Headers: {json.dumps(dict(self.session.headers), indent=2)}")
        
        if request_data:
            logger.info(f"Request Body: {json.dumps(request_data, indent=2)}")
        
        if response:
            logger.info(f"Response Status: {response.status_code}")
            logger.info(f"Response Headers: {json.dumps(dict(response.headers), indent=2)}")
            
            try:
                response_json = response.json()
                logger.info(f"Response Body: {json.dumps(response_json, indent=2)}")
            except json.JSONDecodeError:
                logger.info(f"Response Body (text): {response.text}")
        
        logger.info(f"{'='*60}\n")

    def create_slide_video(self, 
                          slide_title: str, 
                          voiceover_text: str, 
                          background_color: str = "#00FF00",
                          config: ElaiVideoConfig = None) -> Optional[str]:
        """
        Create a video for a single slide with avatar and voiceover.
        
        Args:
            slide_title: Title of the slide
            voiceover_text: Text to be spoken by the avatar
            background_color: Background color (default: green for chroma key)
            config: Video configuration
            
        Returns:
            Video ID if successful, None if failed
        """
        if config is None:
            config = ElaiVideoConfig()
            
        logger.info(f"Creating video for slide: {slide_title}")
        logger.info(f"Voiceover text: {voiceover_text[:100]}...")
        
        # Create video data structure
        video_data = {
            "name": f"{slide_title} - {datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "slides": [
                {
                    "id": 1,
                    "status": "edited",
                    "canvas": {
                        "objects": [
                            {
                                "type": "avatar",
                                "left": config.avatar_position[0],
                                "top": config.avatar_position[1],
                                "fill": "#4868FF",
                                "scaleX": config.avatar_scale,
                                "scaleY": config.avatar_scale,
                                "width": 1080,
                                "height": 1080,
                                "src": f"https://elai-avatars.s3.us-east-2.amazonaws.com/common/{config.avatar_code.split('.')[0]}/{config.avatar_code.split('.')[1]}/{config.avatar_code.replace('.', '_')}.png",
                                "avatarType": "transparent",
                                "animation": {
                                    "type": None,
                                    "exitType": None
                                }
                            }
                        ],
                        "background": background_color,
                        "version": "4.4.0"
                    },
                    "avatar": {
                        "code": config.avatar_code,
                        "name": config.avatar_code.replace('.', ' ').title(),
                        "gender": "female" if config.avatar_code.startswith("gia") or config.avatar_code.startswith("anna") or config.avatar_code.startswith("lisa") else "male",
                        "canvas": f"https://elai-avatars.s3.us-east-2.amazonaws.com/common/{config.avatar_code.split('.')[0]}/{config.avatar_code.split('.')[1]}/{config.avatar_code.replace('.', '_')}.png"
                    },
                    "animation": "fade_in",
                    "language": config.language,
                    "speech": voiceover_text.strip(),
                    "voice": config.voice,
                    "voiceType": "text",
                    "voiceProvider": "azure"
                }
            ],
            "tags": ["video-lesson", "slide", "avatar", "voiceover"],
            "data": {
                "format": config.video_format,
                "resolution": config.resolution,
                "musicVolume": config.music_volume,
                "subtitlesEnabled": "false"
            }
        }
        
        try:
            url = f"{self.base_url}/videos"
            response = self.session.post(url, json=video_data)
            self.log_request_response("POST", url, video_data, response)
            
            if response.status_code == 200:
                result = response.json()
                video_id = result.get("_id")
                logger.info(f"Video created successfully! Video ID: {video_id}")
                return video_id
            else:
                logger.error(f"Failed to create video. Status: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Exception during video creation: {str(e)}")
            return None

    def render_video(self, video_id: str) -> bool:
        """
        Start rendering the video.
        
        Args:
            video_id: The ID of the video to render
            
        Returns:
            True if render request was successful
        """
        logger.info(f"Starting render for video ID: {video_id}")
        
        try:
            url = f"{self.base_url}/videos/render/{video_id}"
            response = self.session.post(url)
            self.log_request_response("POST", url, None, response)
            
            if response.status_code == 200:
                logger.info("Video render started successfully!")
                return True
            else:
                logger.error(f"Failed to start render. Status: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Exception during render start: {str(e)}")
            return False

    def check_video_status(self, video_id: str) -> Dict[str, Any]:
        """
        Check the current status of the video.
        
        Args:
            video_id: The ID of the video to check
            
        Returns:
            Video data including status
        """
        try:
            url = f"{self.base_url}/videos/{video_id}"
            response = self.session.get(url)
            self.log_request_response("GET", url, None, response)
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to get video status. Status: {response.status_code}")
                return {}
                
        except Exception as e:
            logger.error(f"Exception during status check: {str(e)}")
            return {}

    def wait_for_completion(self, video_id: str, max_wait_minutes: int = 15) -> Optional[str]:
        """
        Wait for video rendering to complete and return the download URL.
        
        Args:
            video_id: The ID of the video to monitor
            max_wait_minutes: Maximum time to wait in minutes
            
        Returns:
            Download URL if successful, None if failed or timeout
        """
        logger.info(f"Waiting for video completion (max {max_wait_minutes} minutes)...")
        
        start_time = time.time()
        max_wait_seconds = max_wait_minutes * 60
        check_interval = 30  # Check every 30 seconds
        
        while time.time() - start_time < max_wait_seconds:
            video_data = self.check_video_status(video_id)
            
            if not video_data:
                logger.warning("Failed to get video status, retrying...")
                time.sleep(check_interval)
                continue
            
            status = video_data.get("status", "unknown")
            logger.info(f"Current status: {status}")
            
            if status in ["rendered", "ready"]:
                logger.info(f"Video rendering completed with status: {status}!")
                
                # Try different possible URL fields
                download_url = video_data.get("videoUrl") or video_data.get("url") or video_data.get("playerData", {}).get("url")
                
                if download_url:
                    logger.info(f"Download URL: {download_url}")
                    return download_url
                else:
                    logger.error("Video rendered but no download URL found")
                    logger.error(f"Available fields: {list(video_data.keys())}")
                    if "playerData" in video_data:
                        logger.error(f"Player data: {video_data['playerData']}")
                    return None
                    
            elif status in ["failed", "error"]:
                logger.error(f"Video rendering failed with status: {status}")
                return None
                
            elif status in ["rendering", "queued", "draft", "ready", "validating"]:
                elapsed_minutes = (time.time() - start_time) / 60
                logger.info(f"Still {status}... (elapsed: {elapsed_minutes:.1f} minutes)")
                time.sleep(check_interval)
                
            else:
                logger.warning(f"Unknown status: {status} - continuing to monitor...")
                time.sleep(check_interval)
        
        logger.error(f"Timeout after {max_wait_minutes} minutes")
        return None

    def download_video(self, download_url: str, filename: str = None) -> bool:
        """
        Download the rendered video to local storage.
        
        Args:
            download_url: The URL to download the video from
            filename: Optional filename, will generate one if not provided
            
        Returns:
            True if download successful, False otherwise
        """
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"elai_slide_video_{timestamp}.mp4"
        
        logger.info(f"Downloading video to: {filename}")
        
        try:
            # Use a separate session for download to avoid timeout issues
            download_response = requests.get(download_url, stream=True, timeout=300)
            download_response.raise_for_status()
            
            total_size = int(download_response.headers.get('content-length', 0))
            downloaded_size = 0
            
            with open(filename, 'wb') as f:
                for chunk in download_response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded_size += len(chunk)
                        
                        if total_size > 0:
                            progress = (downloaded_size / total_size) * 100
                            logger.info(f"Download progress: {progress:.1f}%")
            
            file_size_mb = os.path.getsize(filename) / (1024 * 1024)
            logger.info(f"Video downloaded successfully!")
            logger.info(f"File: {filename}")
            logger.info(f"Size: {file_size_mb:.2f} MB")
            
            return True
            
        except Exception as e:
            logger.error(f"Download failed: {str(e)}")
            return False

    def create_video_for_slide(self, 
                              slide_title: str, 
                              voiceover_text: str, 
                              background_color: str = "#00FF00",
                              config: ElaiVideoConfig = None) -> ElaiVideoResult:
        """
        Complete workflow: create, render, wait, and download video for a slide.
        
        Args:
            slide_title: Title of the slide
            voiceover_text: Text to be spoken by the avatar
            background_color: Background color (default: green for chroma key)
            config: Video configuration
            
        Returns:
            ElaiVideoResult with video information
        """
        logger.info(f"Starting complete video workflow for slide: {slide_title}")
        
        # Step 1: Create video
        video_id = self.create_slide_video(slide_title, voiceover_text, background_color, config)
        if not video_id:
            return ElaiVideoResult(
                video_id="",
                status="failed",
                error_message="Failed to create video"
            )
        
        # Step 2: Start rendering
        if not self.render_video(video_id):
            return ElaiVideoResult(
                video_id=video_id,
                status="failed",
                error_message="Failed to start render"
            )
        
        # Step 3: Wait for completion
        download_url = self.wait_for_completion(video_id, max_wait_minutes=15)
        if not download_url:
            return ElaiVideoResult(
                video_id=video_id,
                status="failed",
                error_message="Failed to complete rendering"
            )
        
        # Step 4: Download video
        filename = f"elai_slide_{video_id}.mp4"
        if not self.download_video(download_url, filename):
            return ElaiVideoResult(
                video_id=video_id,
                status="failed",
                error_message="Failed to download video"
            )
        
        logger.info(f"Complete video workflow successful for slide: {slide_title}")
        return ElaiVideoResult(
            video_id=video_id,
            download_url=download_url,
            status="completed",
            file_size=os.path.getsize(filename) if os.path.exists(filename) else None
        )

    async def create_video_for_slide_async(self, 
                                         slide_title: str, 
                                         voiceover_text: str, 
                                         background_color: str = "#00FF00",
                                         config: ElaiVideoConfig = None) -> ElaiVideoResult:
        """
        Async version of create_video_for_slide for use in FastAPI endpoints.
        
        Args:
            slide_title: Title of the slide
            voiceover_text: Text to be spoken by the avatar
            background_color: Background color (default: green for chroma key)
            config: Video configuration
            
        Returns:
            ElaiVideoResult with video information
        """
        # Run the synchronous method in a thread pool
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, 
            self.create_video_for_slide, 
            slide_title, 
            voiceover_text, 
            background_color, 
            config
        )


# Factory function to create Elai service instance
def create_elai_service() -> ElaiAPIService:
    """Create and return an Elai API service instance."""
    api_token = os.getenv("ELAI_API_TOKEN", "5774fLyEZuhr22LTmv6zwjZuk9M5rQ9e")
    if not api_token:
        raise ValueError("ELAI_API_TOKEN environment variable not set")
    
    return ElaiAPIService(api_token)


if __name__ == "__main__":
    # Test the service
    try:
        service = create_elai_service()
        result = service.create_video_for_slide(
            slide_title="Test Slide",
            voiceover_text="This is a test of the Elai API integration for video lesson generation.",
            background_color="#00FF00"
        )
        print(f"Test result: {result}")
    except Exception as e:
        print(f"Test failed: {e}")
