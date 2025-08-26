# custom_extensions/backend/app/services/video_generation_service.py

import asyncio
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class ElaiVideoGenerationService:
    """Service for generating videos using the Elai API."""
    
    def __init__(self):
        self.api_base = "https://apis.elai.io/api/v1"
        self.api_token = "5774fLyEZuhr22LTmv6zwjZuk9M5rQ9e"
        self.max_wait_time = 15 * 60  # 15 minutes
        self.poll_interval = 30  # 30 seconds
        
        # Initialize httpx client safely
        self.client = None
        self._init_client()
    
    def _init_client(self):
        """Initialize the HTTP client safely."""
        try:
            import httpx
            self.client = httpx.AsyncClient(timeout=60.0)
            logger.info("HTTP client initialized successfully")
        except ImportError:
            logger.error("httpx not available - video generation will not work")
            self.client = None
        except Exception as e:
            logger.error(f"Failed to initialize HTTP client: {e}")
            self.client = None
    
    @property
    def headers(self):
        """Get headers for API requests."""
        return {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    
    async def get_avatars(self) -> Dict[str, Any]:
        """
        Fetch available avatars from Elai API.
        
        Returns:
            Dict containing avatar list or error
        """
        if not self.client:
            return {
                "success": False, 
                "error": "HTTP client not available - httpx may not be installed"
            }
        
        try:
            response = await self.client.get(
                f"{self.api_base}/avatars",
                headers=self.headers
            )
            
            if response.is_success:
                avatars = response.json()
                logger.info(f"Successfully fetched {len(avatars)} avatars")
                return {"success": True, "avatars": avatars}
            else:
                logger.error(f"Failed to fetch avatars: {response.status_code} - {response.text}")
                return {
                    "success": False, 
                    "error": f"Failed to fetch avatars: {response.status_code}"
                }
                
        except Exception as e:
            logger.error(f"Error fetching avatars: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def create_video_from_texts(self, project_name: str, voiceover_texts: List[str], avatar_code: str) -> Dict[str, Any]:
        """
        Create video from voiceover texts using Elai API.
        
        Args:
            project_name: Name of the project
            voiceover_texts: List of voiceover texts
            avatar_code: Avatar code to use
            
        Returns:
            Dict containing result with success status and video ID
        """
        logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Starting video creation from texts")
        logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Parameters:")
        logger.info(f"  - Project name: {project_name}")
        logger.info(f"  - Voiceover texts count: {len(voiceover_texts)}")
        logger.info(f"  - Avatar code: {avatar_code}")
        
        for i, text in enumerate(voiceover_texts):
            logger.info(f"  - Voiceover text {i+1}: {text[:200]}...")
        if not self.client:
            return {
                "success": False,
                "error": "HTTP client not available - httpx may not be installed"
            }
        
        try:
            # Validate inputs
            if not voiceover_texts or len(voiceover_texts) == 0:
                return {
                    "success": False,
                    "error": "No voiceover texts provided"
                }
            
            if not avatar_code:
                return {
                    "success": False,
                    "error": "No avatar code provided"
                }
            
            # Clean and validate voiceover texts
            cleaned_texts = []
            for i, text in enumerate(voiceover_texts):
                if not text or not isinstance(text, str):
                    logger.warning(f"Skipping invalid voiceover text at index {i}: {text}")
                    continue
                
                # Clean the text
                cleaned_text = text.strip()
                cleaned_text = ' '.join(cleaned_text.split())  # Remove extra whitespace
                
                # Remove problematic characters that might cause API issues
                cleaned_text = cleaned_text.replace('"', '"').replace('"', '"')
                cleaned_text = cleaned_text.replace(''', "'").replace(''', "'")
                cleaned_text = cleaned_text.replace('…', '...')
                
                # Validate length
                if len(cleaned_text) < 5:
                    logger.warning(f"Voiceover text too short at index {i}: '{cleaned_text}'")
                    continue
                
                if len(cleaned_text) > 1000:
                    logger.warning(f"Voiceover text too long at index {i}, truncating")
                    cleaned_text = cleaned_text[:1000] + "..."
                
                cleaned_texts.append(cleaned_text)
                logger.info(f"Cleaned voiceover text {i+1}: {cleaned_text[:100]}...")
            
            if not cleaned_texts:
                return {
                    "success": False,
                    "error": "No valid voiceover texts after cleaning"
                }
            
            # Get avatars to find the specified one
            avatars_response = await self.get_avatars()
            if not avatars_response["success"]:
                return {
                    "success": False,
                    "error": f"Failed to get avatars: {avatars_response['error']}"
                }
            
            # Find the specified avatar
            logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Searching for avatar with code: {avatar_code}")
            logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Available avatars count: {len(avatars_response['avatars'])}")
            
            avatar = None
            for av in avatars_response["avatars"]:
                if av.get("code") == avatar_code:
                    avatar = av
                    logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Found avatar: {avatar.get('name', 'Unknown')} (code: {avatar.get('code', 'Unknown')})")
                    break
            
            if not avatar:
                logger.error(f"🎬 [ELAI_VIDEO_GENERATION] Avatar with code '{avatar_code}' not found")
                logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Available avatar codes: {[av.get('code') for av in avatars_response['avatars'][:10]]}...")
                return {
                    "success": False,
                    "error": f"Avatar with code '{avatar_code}' not found"
                }
            
            # Validate avatar has required properties
            logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Avatar details:")
            logger.info(f"  - Name: {avatar.get('name', 'Unknown')}")
            logger.info(f"  - Code: {avatar.get('code', 'Unknown')}")
            logger.info(f"  - Canvas: {avatar.get('canvas', 'None')}")
            logger.info(f"  - Gender: {avatar.get('gender', 'Unknown')}")
            
            if not avatar.get("canvas"):
                logger.warning(f"🎬 [ELAI_VIDEO_GENERATION] Avatar canvas is empty, this might cause issues")
            
            # Prepare slides for Elai API
            logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Preparing {len(cleaned_texts)} slides for Elai API")
            
            elai_slides = []
            for i, voiceover_text in enumerate(cleaned_texts):
                logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Creating slide {i+1} with text: {voiceover_text[:100]}...")
                
                elai_slide = {
                    "id": i + 1,
                    "status": "edited",
                    "canvas": {
                        "objects": [{
                            "type": "avatar",
                            "left": 540,  # Center the avatar in 1080x1080 canvas
                            "top": 270,   # Center the avatar in 1080x1080 canvas
                            "fill": "#4868FF",
                            "scaleX": 0.8,   # Larger avatar size (80% of canvas) for better visibility
                            "scaleY": 0.8,   # Larger avatar size (80% of canvas) for better visibility
                            "width": 1080,
                            "height": 1080,
                            "src": avatar.get("canvas"),
                            "avatarType": "transparent",
                            "animation": {
                                "type": None,
                                "exitType": None
                            }
                        }],
                        "background": "transparent",  # Transparent background for overlay
                        "version": "4.4.0"
                    },
                    "avatar": {
                        "code": avatar.get("code"),
                        "name": avatar.get("name"),
                        "gender": avatar.get("gender"),
                        "canvas": avatar.get("canvas")
                    },
                    "animation": "fade_in",
                    "language": "English",
                    "speech": voiceover_text,
                    "voice": "en-US-AriaNeural",
                    "voiceType": "text",
                    "voiceProvider": "azure"
                }
                elai_slides.append(elai_slide)
            
            # Prepare video request
            logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Preparing video request")
            logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Video request configuration:")
            logger.info(f"  - Name: {project_name}")
            logger.info(f"  - Slides count: {len(elai_slides)}")
            logger.info(f"  - Format: 16_9")
            logger.info(f"  - Resolution: FullHD")
            logger.info(f"  - Avatar canvas URL: {avatar.get('canvas', 'N/A')[:100]}...")
            
            video_request = {
                "name": project_name,
                "slides": elai_slides,
                "tags": ["video_lesson", "generated", "presentation"],
                "public": False,
                "data": {
                    "skipEmails": False,
                    "subtitlesEnabled": "false",
                    "format": "1_1",  # Square format for better overlay composition
                    "resolution": "FullHD"  # High resolution for quality
                }
            }
            
            logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Video request JSON payload:")
            logger.info(f"  {json.dumps(video_request, indent=2)}")
            
            logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Making API call to Elai")
            logger.info(f"🎬 [ELAI_VIDEO_GENERATION] API endpoint: {self.api_base}/videos")
            logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Headers: {self.headers}")
            
            # Create video
            response = await self.client.post(
                f"{self.api_base}/videos",
                headers=self.headers,
                json=video_request
            )
            
            logger.info(f"🎬 [ELAI_VIDEO_GENERATION] API response status: {response.status_code}")
            logger.info(f"🎬 [ELAI_VIDEO_GENERATION] API response headers: {dict(response.headers)}")
            
            if response.is_success:
                result = response.json()
                video_id = result.get("_id")
                
                logger.info(f"🎬 [ELAI_VIDEO_GENERATION] API response successful")
                logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Video data received:")
                logger.info(f"  - Video ID: {video_id}")
                logger.info(f"  - Full response: {json.dumps(result, indent=2)}")
                
                logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Video created successfully: {video_id}")
                return {
                    "success": True,
                    "videoId": video_id,
                    "message": "Video created successfully"
                }
            else:
                logger.error(f"🎬 [ELAI_VIDEO_GENERATION] API request failed")
                logger.error(f"🎬 [ELAI_VIDEO_GENERATION] Status code: {response.status_code}")
                logger.error(f"🎬 [ELAI_VIDEO_GENERATION] Response text: {response.text}")
                return {
                    "success": False,
                    "error": f"Video creation failed: {response.status_code} - {response.text}"
                }
                
        except Exception as e:
            logger.error(f"Error creating video: {str(e)}")
            return {
                "success": False,
                "error": f"Failed to create video: {str(e)}"
            }

    async def create_video(self, slides_data: List[Dict[str, Any]], avatar_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a video with the given slides and avatar data.
        
        Args:
            slides_data: List of slide data with voiceover text
            avatar_data: Avatar configuration data
            
        Returns:
            Dict containing video creation response
        """
        if not self.client:
            return {
                "success": False,
                "error": "HTTP client not available - httpx may not be installed"
            }
        
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
                            "scaleX": 0.2,   # Slightly larger than original 0.1 but still safe
                            "scaleY": 0.2,   # Slightly larger than original 0.1 but still safe
                            "width": 1080,
                            "height": 1080,
                            "src": avatar_data.get("canvas_url"),
                            "avatarType": "transparent",
                            "animation": {
                                "type": None,
                                "exitType": None
                            }
                        }],
                        "background": "#ffffff",  # Keep original white background for safety
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
            response = await self.client.post(
                f"{self.api_base}/videos",
                headers=self.headers,
                json=video_request
            )
            
            if response.is_success:
                result = response.json()
                logger.info(f"Video created successfully: {result.get('_id')}")
                return result
            else:
                logger.error(f"Failed to create video: {response.status_code} - {response.text}")
                raise Exception(f"Video creation failed: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Error creating video: {str(e)}")
            raise
    
    async def render_video(self, video_id: str) -> Dict[str, Any]:
        """
        Start rendering the video.
        
        Args:
            video_id: The ID of the video to render
            
        Returns:
            Dict containing render response
        """
        if not self.client:
            return {
                "success": False,
                "error": "HTTP client not available - httpx may not be installed"
            }
        
        try:
            response = await self.client.post(
                f"{self.api_base}/videos/render/{video_id}",
                headers=self.headers
            )
            
            if response.is_success:
                logger.info(f"Video render started for {video_id}")
                return {
                    "success": True,
                    "message": "Video rendering started successfully"
                }
            else:
                logger.error(f"Failed to start render: {response.status_code} - {response.text}")
                return {
                    "success": False,
                    "error": f"Failed to start render: {response.status_code} - {response.text}"
                }
                
        except Exception as e:
            logger.error(f"Error starting video render: {str(e)}")
            return {
                "success": False,
                "error": f"Failed to start video render: {str(e)}"
            }
    
    async def check_video_status(self, video_id: str) -> Dict[str, Any]:
        """
        Check the current status of a video.
        
        Args:
            video_id: The ID of the video to check
            
        Returns:
            Dict containing video status information
        """
        if not self.client:
            return {
                "success": False,
                "error": "HTTP client not available - httpx may not be installed"
            }
        
        try:
            response = await self.client.get(
                f"{self.api_base}/videos/{video_id}",
                headers=self.headers
            )
            
            if response.is_success:
                video_data = response.json()
                status = video_data.get("status", "unknown")
                
                # Calculate progress based on status with better handling of cycling states
                progress = 0
                if status == "draft":
                    progress = 10
                elif status == "queued":
                    progress = 20
                elif status == "rendering":
                    progress = 50
                elif status == "validating":
                    progress = 80
                elif status in ["rendered", "ready"]:
                    progress = 100
                elif status == "error":
                    # Don't set progress to 0 for error status - maintain previous progress
                    # This helps with the cycling issue where status alternates between rendering and error
                    progress = 50  # Keep at rendering level
                
                # Get download URL if available
                download_url = (
                    video_data.get("videoUrl") or 
                    video_data.get("url") or 
                    video_data.get("playerData", {}).get("url")
                )
                
                # Log detailed status information for debugging
                logger.info(f"Video {video_id} status: {status}, progress: {progress}%")
                if status == "error":
                    logger.warning(f"Video {video_id} reported error status - this may be temporary")
                    # Log additional error details if available
                    error_details = video_data.get("error", {})
                    if error_details:
                        logger.warning(f"Video {video_id} error details: {error_details}")
                
                return {
                    "success": True,
                    "status": status,
                    "progress": progress,
                    "downloadUrl": download_url,
                    "videoUrl": download_url,
                    "data": video_data
                }
            else:
                logger.error(f"Failed to get video status: {response.status_code} - {response.text}")
                return {
                    "success": False,
                    "error": f"Failed to get video status: {response.status_code} - {response.text}"
                }
                
        except Exception as e:
            logger.error(f"Error checking video status: {str(e)}")
            return {
                "success": False,
                "error": f"Error checking video status: {str(e)}"
            }
    
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
    
    async def close(self):
        """Close the HTTP client."""
        if self.client:
            await self.client.aclose()

# Global instance
video_generation_service = ElaiVideoGenerationService()
