# custom_extensions/backend/app/services/video_generation_service.py

import asyncio
import httpx
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import os

logger = logging.getLogger(__name__)

class ElaiVideoGenerationService:
    """Service for generating videos using the Elai API."""
    
    def __init__(self):
        self.api_base = "https://apis.elai.io/api/v1"
        self.api_token = "5774fLyEZuhr22LTmv6zwjZuk9M5rQ9e"
        self.headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        self.max_wait_time = 15 * 60  # 15 minutes
        self.poll_interval = 30  # 30 seconds
    
    async def create_video(self, slides_data: List[Dict[str, Any]], avatar_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a video with the given slides and avatar data.
        
        Args:
            slides_data: List of slide data with voiceover text
            avatar_data: Avatar configuration data
            
        Returns:
            Dict containing video creation response
        """
        try:
            # Prepare slides for Elai API
            elai_slides = []
            for i, slide in enumerate(slides_data):
                elai_slide = {
                    "id": i + 1,
                    "status": "edited",
                    "canvas": {
                        "objects": [{
                            "type": "avatar",
                            "left": 510,
                            "top": 255,
                            "fill": "#4868FF",
                            "scaleX": 0.1,
                            "scaleY": 0.1,
                            "width": 1080,
                            "height": 1080,
                            "src": avatar_data.get("canvas_url"),
                            "avatarType": "transparent",
                            "animation": {
                                "type": None,
                                "exitType": None
                            }
                        }],
                        "background": "#ffffff",
                        "version": "4.4.0"
                    },
                    "avatar": {
                        "code": avatar_data.get("code"),
                        "name": avatar_data.get("name"),
                        "gender": avatar_data.get("gender"),
                        "canvas": avatar_data.get("canvas_url")
                    },
                    "animation": "fade_in",
                    "language": "English",
                    "speech": slide.get("voiceover_text", ""),
                    "voice": avatar_data.get("voice", "en-US-AriaNeural"),
                    "voiceType": "text",
                    "voiceProvider": avatar_data.get("voice_provider", "azure")
                }
                elai_slides.append(elai_slide)
            
            # Prepare video request
            video_request = {
                "name": f"Video Lesson - {datetime.now().isoformat()}",
                "slides": elai_slides,
                "tags": ["video_lesson", "generated", "presentation"],
                "public": False,
                "data": {
                    "skipEmails": False,
                    "subtitlesEnabled": "false",
                    "format": "16_9",
                    "resolution": "FullHD"
                }
            }
            
            # Create video
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_base}/videos",
                    headers=self.headers,
                    json=video_request,
                    timeout=60.0
                )
                
                if not response.is_success:
                    logger.error(f"Failed to create video: {response.status_code} - {response.text}")
                    raise Exception(f"Video creation failed: {response.status_code}")
                
                result = response.json()
                logger.info(f"Video created successfully: {result.get('_id')}")
                return result
                
        except Exception as e:
            logger.error(f"Error creating video: {str(e)}")
            raise
    
    async def render_video(self, video_id: str) -> bool:
        """
        Start rendering the video.
        
        Args:
            video_id: The ID of the video to render
            
        Returns:
            True if render started successfully
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_base}/videos/render/{video_id}",
                    headers=self.headers,
                    timeout=30.0
                )
                
                if response.is_success:
                    logger.info(f"Video render started for {video_id}")
                    return True
                else:
                    logger.error(f"Failed to start render: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error starting video render: {str(e)}")
            return False
    
    async def check_video_status(self, video_id: str) -> Dict[str, Any]:
        """
        Check the current status of a video.
        
        Args:
            video_id: The ID of the video to check
            
        Returns:
            Dict containing video status information
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.api_base}/videos/{video_id}",
                    headers=self.headers,
                    timeout=30.0
                )
                
                if response.is_success:
                    return response.json()
                else:
                    logger.error(f"Failed to get video status: {response.status_code} - {response.text}")
                    return {}
                    
        except Exception as e:
            logger.error(f"Error checking video status: {str(e)}")
            return {}
    
    async def wait_for_completion(self, video_id: str) -> Optional[str]:
        """
        Wait for video rendering to complete and return the download URL.
        
        Args:
            video_id: The ID of the video to monitor
            
        Returns:
            Download URL if successful, None if failed or timeout
        """
        start_time = datetime.now()
        
        while (datetime.now() - start_time).total_seconds() < self.max_wait_time:
            try:
                status_data = await self.check_video_status(video_id)
                
                if not status_data:
                    logger.warning("Failed to get video status, retrying...")
                    await asyncio.sleep(self.poll_interval)
                    continue
                
                status = status_data.get("status", "unknown")
                logger.info(f"Video {video_id} status: {status}")
                
                if status in ["rendered", "ready"]:
                    # Try different possible URL fields
                    download_url = (
                        status_data.get("videoUrl") or 
                        status_data.get("url") or 
                        status_data.get("playerData", {}).get("url")
                    )
                    
                    if download_url:
                        logger.info(f"Video {video_id} completed successfully")
                        return download_url
                    else:
                        logger.error(f"Video {video_id} rendered but no download URL found")
                        return None
                        
                elif status in ["failed", "error"]:
                    logger.error(f"Video {video_id} rendering failed: {status}")
                    return None
                    
                elif status in ["rendering", "queued", "draft", "validating"]:
                    # Still processing, continue waiting
                    await asyncio.sleep(self.poll_interval)
                    
                else:
                    logger.warning(f"Unknown status for video {video_id}: {status}")
                    await asyncio.sleep(self.poll_interval)
                    
            except Exception as e:
                logger.error(f"Error monitoring video {video_id}: {str(e)}")
                await asyncio.sleep(self.poll_interval)
        
        logger.error(f"Video {video_id} generation timeout after {self.max_wait_time} seconds")
        return None
    
    async def generate_video(self, slides_data: List[Dict[str, Any]], avatar_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Complete video generation process: create, render, and wait for completion.
        
        Args:
            slides_data: List of slide data with voiceover text
            avatar_data: Avatar configuration data
            
        Returns:
            Dict containing result with success status and download URL
        """
        try:
            # Validate inputs
            if not slides_data or len(slides_data) == 0:
                return {"success": False, "error": "No slides provided"}
            
            if not avatar_data:
                return {"success": False, "error": "No avatar data provided"}
            
            # Validate each slide has voiceover text
            for i, slide in enumerate(slides_data):
                if not slide.get("voiceover_text"):
                    return {"success": False, "error": f"Slide {i + 1} has no voiceover text"}
            
            # Create video
            video_data = await self.create_video(slides_data, avatar_data)
            video_id = video_data.get("_id")
            
            if not video_id:
                return {"success": False, "error": "Failed to get video ID from creation response"}
            
            # Start rendering
            render_success = await self.render_video(video_id)
            if not render_success:
                return {"success": False, "error": "Failed to start video rendering"}
            
            # Wait for completion
            download_url = await self.wait_for_completion(video_id)
            
            if download_url:
                return {
                    "success": True,
                    "video_id": video_id,
                    "download_url": download_url
                }
            else:
                return {"success": False, "error": "Video generation failed or timed out"}
                
        except Exception as e:
            logger.error(f"Video generation failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_avatars(self) -> Dict[str, Any]:
        """
        Fetch available avatars from Elai API.
        
        Returns:
            Dict containing avatar list or error
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.api_base}/avatars",
                    headers=self.headers,
                    timeout=30.0
                )
                
                if response.is_success:
                    avatars = response.json()
                    return {"success": True, "avatars": avatars}
                else:
                    logger.error(f"Failed to fetch avatars: {response.status_code} - {response.text}")
                    return {"success": False, "error": f"Failed to fetch avatars: {response.status_code}"}
                    
        except Exception as e:
            logger.error(f"Error fetching avatars: {str(e)}")
            return {"success": False, "error": str(e)}

# Global instance
video_generation_service = ElaiVideoGenerationService()
