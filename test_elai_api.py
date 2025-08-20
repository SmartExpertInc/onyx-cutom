#!/usr/bin/env python3
"""
Elai API Test Script
===================

This script tests the Elai API by:
1. Creating a video with only an avatar on green background
2. Rendering the video
3. Monitoring the rendering progress
4. Downloading the completed video

Requirements:
- requests library: pip install requests
- Set ELAI_API_TOKEN environment variable

Usage:
- Set your Elai API token: export ELAI_API_TOKEN="your_token_here"
- Run: python test_elai_api.py
"""

import os
import sys
import time
import json
import logging
import requests
from datetime import datetime
from typing import Dict, Any, Optional
import urllib.parse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'elai_api_test_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

class ElaiAPITester:
    def __init__(self, api_token: str):
        """Initialize the Elai API tester with authentication token."""
        self.api_token = api_token
        self.base_url = "https://apis.elai.io/api/v1"
        self.headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
        
        logger.info("Elai API Tester initialized")
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

    def create_green_screen_video(self) -> Optional[str]:
        """
        Create a video with avatar on green background.
        Returns the video ID if successful.
        """
        logger.info("Creating video with avatar on green background...")
        
        # Create a short script with just 4 sentences (under 60 seconds)
        voiceover_script = """
        Welcome to this Elai API test demonstration. We are creating a green screen avatar video for seamless integration into custom slide presentations. This technology enables professional avatar overlays on any background design. Thank you for testing this innovative video creation approach.
        """
        
        video_data = {
            "name": f"Green Screen Avatar Test - {datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "slides": [
                {
                    "id": 1,
                    "status": "edited",
                    "canvas": {
                        "objects": [
                            {
                                "type": "avatar",
                                "left": 510,
                                "top": 255,
                                "fill": "#4868FF",
                                "scaleX": 0.1,
                                "scaleY": 0.1,
                                "width": 1080,
                                "height": 1080,
                                "src": "https://elai-avatars.s3.us-east-2.amazonaws.com/common/gia/casual/gia_casual.png",
                                "avatarType": "transparent",
                                "animation": {
                                    "type": None,
                                    "exitType": None
                                }
                            }
                        ],
                        "background": "#00FF00",  # Pure green background for chroma key
                        "version": "4.4.0"
                    },
                    "avatar": {
                        "code": "gia.casual",
                        "name": "Gia Casual",
                        "gender": "female",
                        "canvas": "https://elai-avatars.s3.us-east-2.amazonaws.com/common/gia/casual/gia_casual.png"
                    },
                    "animation": "fade_in",
                    "language": "English",
                    "speech": voiceover_script.strip(),
                    "voice": "en-US-AriaNeural",
                    "voiceType": "text",
                    "voiceProvider": "azure"
                }
            ],
            "tags": ["test", "green-screen", "api", "avatar"]
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
        Returns True if render request was successful.
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
        Returns the video data including status.
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
            filename = f"elai_green_screen_video_{timestamp}.mp4"
        
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

    def run_full_test(self) -> bool:
        """
        Run the complete test: create, render, wait, and download.
        Returns True if all steps successful.
        """
        logger.info("Starting full Elai API test...")
        
        # Step 1: Create video
        video_id = self.create_green_screen_video()
        if not video_id:
            return False
        
        # Step 2: Start rendering
        if not self.render_video(video_id):
            return False
        
        # Step 3: Wait for completion
        download_url = self.wait_for_completion(video_id, max_wait_minutes=15)
        if not download_url:
            return False
        
        # Step 4: Download video
        if not self.download_video(download_url):
            return False
        
        logger.info("Full test completed successfully!")
        return True


def main():
    """Main function to run the Elai API test."""
    # Get API token from environment variable
    api_token = os.getenv("ELAI_API_TOKEN", "5774fLyEZuhr22LTmv6zwjZuk9M5rQ9e")
    
    if not api_token:
        logger.error("ELAI_API_TOKEN environment variable not set!")
        logger.info("Please set your Elai API token:")
        logger.info("export ELAI_API_TOKEN='your_token_here'")
        sys.exit(1)
    
    # Initialize tester
    tester = ElaiAPITester(api_token)
    
    # Run the full test
    success = tester.run_full_test()
    
    if success:
        logger.info("All tests passed!")
        sys.exit(0)
    else:
        logger.error("Test failed!")
        sys.exit(1)


if __name__ == "__main__":
    main() 
