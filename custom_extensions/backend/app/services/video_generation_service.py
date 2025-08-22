# custom_extensions/backend/app/services/video_generation_service.py

import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class ElaiVideoGenerationService:
    """Service for generating videos using the Elai API."""
    
    def __init__(self):
        self.api_base = "https://apis.elai.io/api/v1"
        self.api_token = "5774fLyEZuhr22LTmv6zwjZuk9M5rQ9e"
        self.max_wait_time = 8 * 60  # 8 minutes (reduced for faster response)
        self.poll_interval = 20  # 20 seconds (faster polling)
        
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
        Create a video from voiceover texts and avatar code.
        """
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
            avatar = None
            for av in avatars_response["avatars"]:
                if av.get("code") == avatar_code:
                    avatar = av
                    break
            
            if not avatar:
                return {
                    "success": False,
                    "error": f"Avatar with code '{avatar_code}' not found"
                }
            
            # Prepare slides for Elai API
            elai_slides = []
            for i, voiceover_text in enumerate(cleaned_texts):
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
                            "src": avatar.get("canvas"),
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
            video_request = {
                "name": project_name,
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
            
            logger.info(f"Creating video with {len(elai_slides)} slides")
            
            # Create video
            response = await self.client.post(
                f"{self.api_base}/videos",
                headers=self.headers,
                json=video_request
            )
            
            if response.is_success:
                result = response.json()
                video_id = result.get("_id")
                logger.info(f"Video created successfully: {video_id}")
                return {
                    "success": True,
                    "videoId": video_id,
                    "message": "Video created successfully"
                }
            else:
                logger.error(f"Failed to create video: {response.status_code} - {response.text}")
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
                progress = status_data.get("progress", 0)
                elapsed = (datetime.now() - start_time).total_seconds()
                
                logger.info(f"Video {video_id} status: {status}, progress: {progress}%")
                
                # Add timeout warning for long rendering
                if status == "rendering" and elapsed > 300:  # 5 minutes
                    logger.warning(f"Video {video_id} has been rendering for {elapsed:.0f}s - this may take a while")
                
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
