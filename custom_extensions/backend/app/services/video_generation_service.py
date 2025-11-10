# custom_extensions/backend/app/services/video_generation_service.py

import asyncio
import json
import logging
import os
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# Elai API Limits (based on typical API constraints)
# Adjust these based on actual Elai API documentation
MAX_VOICEOVER_TEXT_LENGTH = 5000      # Max characters per voiceover text
MAX_TOTAL_TEXT_LENGTH = 50000         # Max total characters across all texts
MAX_PROJECT_NAME_LENGTH = 200          # Max project name length
MAX_PAYLOAD_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB max payload size
MAX_SLIDES_PER_REQUEST = 50            # Max slides in single request

# Warning thresholds (trigger warnings before hitting limits)
WARN_VOICEOVER_TEXT_LENGTH = 4000      # 80% of max
WARN_TOTAL_TEXT_LENGTH = 40000         # 80% of max
WARN_PAYLOAD_SIZE_BYTES = 4 * 1024 * 1024  # 80% of max (4 MB)

class ElaiVideoGenerationService:
    """Service for generating videos using the Elai API."""
    
    def __init__(self):
        self.api_base = "https://apis.elai.io/api/v1"
        self.api_token = "5774fLyEZuhr22LTmv6zwjZuk9M5rQ9e"
        
        # ✅ NEW: Dynamic timeout configuration
        self.base_wait_time = 10 * 60   # 10 minutes base
        self.per_slide_time = 2 * 60    # 2 minutes per additional slide
        self.min_wait_time = 5 * 60     # Minimum 5 minutes
        self.max_wait_time = 60 * 60    # Maximum 60 minutes (safety cap)
        
        # Adaptive polling configuration
        self.initial_poll_interval = 10      # Start with 10 seconds
        self.max_poll_interval = 60          # Cap at 60 seconds
        self.poll_backoff_multiplier = 1.5   # Increase by 50% each time
        self.poll_reset_on_change = True     # Reset to initial on status change
        
        # ✅ NEW: Dynamic download timeout configuration
        self.min_download_timeout = 60           # Minimum 1 minute
        self.base_download_timeout = 5 * 60      # Base 5 minutes
        self.timeout_per_mb = 2                  # 2 seconds per MB
        self.max_download_timeout = 30 * 60      # Maximum 30 minutes (safety cap)
        
        # Deprecated: kept for backward compatibility
        self.poll_interval = 30  # 30 seconds (deprecated, use adaptive polling)
    
    def calculate_timeout(self, slide_count: int = 1) -> int:
        """
        Calculate dynamic timeout based on number of slides.
        
        Args:
            slide_count: Number of slides in presentation
            
        Returns:
            Timeout in seconds
            
        Formula:
            timeout = base_time + (slide_count × per_slide_time)
            capped between min_wait_time and max_wait_time
            
        Examples:
            1 slide  → 12 min (10 + 1×2)
            5 slides → 20 min (10 + 5×2)
            10 slides → 30 min (10 + 10×2)
            15 slides → 40 min (10 + 15×2)
        """
        timeout = self.base_wait_time + (slide_count * self.per_slide_time)
        
        # Apply min/max constraints
        timeout = max(self.min_wait_time, timeout)
        timeout = min(self.max_wait_time, timeout)
        
        logger.info(
            f"⏱️ [DYNAMIC_TIMEOUT] Calculated timeout: {timeout}s ({timeout/60:.1f} min) "
            f"for {slide_count} slide(s)"
        )
        
        return timeout
    
    def calculate_download_timeout(self, file_size_bytes: int) -> float:
        """
        Calculate dynamic download timeout based on expected file size.
        
        Args:
            file_size_bytes: Expected file size in bytes
            
        Returns:
            Timeout in seconds
            
        Formula:
            timeout = base_timeout + (file_size_mb × timeout_per_mb)
            capped between min_download_timeout and max_download_timeout
            
        Examples:
            10 MB  → 320 seconds (5.3 min)
            50 MB  → 400 seconds (6.7 min)
            200 MB → 700 seconds (11.7 min)
            500 MB → 1300 seconds (21.7 min)
        """
        if file_size_bytes <= 0:
            # If size unknown, use base timeout
            logger.warning("📥 [DOWNLOAD_TIMEOUT] File size unknown, using base timeout")
            return self.base_download_timeout
        
        file_size_mb = file_size_bytes / (1024 * 1024)
        timeout = self.base_download_timeout + (file_size_mb * self.timeout_per_mb)
        
        # Apply min/max constraints
        timeout = max(self.min_download_timeout, timeout)
        timeout = min(self.max_download_timeout, timeout)
        
        logger.info(
            f"⏱️ [DOWNLOAD_TIMEOUT] Calculated timeout: {timeout}s ({timeout/60:.1f} min) "
            f"for {file_size_mb:.1f} MB file"
        )
        
        return timeout
    
    def _get_client(self):
        """Get or create HTTP client in the current event loop."""
        try:
            import httpx
            # Create a new client for each request to avoid event loop issues
            return httpx.AsyncClient(timeout=60.0)
        except ImportError:
            logger.error("httpx not available - video generation will not work")
            return None
        except Exception as e:
            logger.error(f"Failed to create HTTP client: {e}")
            return None
    
    @property
    def headers(self):
        """Get headers for API requests."""
        return {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    
    def _validate_payload_size(
        self, 
        video_request: Dict[str, Any],
        voiceover_texts: List[str]
    ) -> Dict[str, Any]:
        """
        Validate payload size before sending to API.
        
        Checks:
        1. Individual text lengths
        2. Total text length across all texts
        3. Total JSON payload size
        4. Number of slides
        
        Args:
            video_request: Complete video request payload
            voiceover_texts: List of voiceover texts
            
        Returns:
            Dict with validation results:
            - valid: bool (True if payload is valid)
            - issues: List of validation issues
            - warnings: List of warnings (non-blocking)
            - payload_size: Size of payload in bytes
        """
        issues = []
        warnings = []
        
        # Calculate payload size
        import sys
        payload_json = json.dumps(video_request)
        payload_size = len(payload_json.encode('utf-8'))
        
        logger.info(f"📊 [PAYLOAD_VALIDATION] Starting payload validation")
        logger.info(f"📊 [PAYLOAD_VALIDATION] Payload size: {payload_size:,} bytes ({payload_size / 1024:.2f} KB)")
        
        # Check 1: Individual text lengths
        total_text_length = 0
        for i, text in enumerate(voiceover_texts):
            text_length = len(text)
            total_text_length += text_length
            
            if text_length > MAX_VOICEOVER_TEXT_LENGTH:
                issues.append(
                    f"Voiceover text {i+1} exceeds maximum length: "
                    f"{text_length:,} chars (max: {MAX_VOICEOVER_TEXT_LENGTH:,})"
                )
            elif text_length > WARN_VOICEOVER_TEXT_LENGTH:
                warnings.append(
                    f"Voiceover text {i+1} approaching limit: "
                    f"{text_length:,} chars (limit: {MAX_VOICEOVER_TEXT_LENGTH:,})"
                )
        
        # Check 2: Total text length
        if total_text_length > MAX_TOTAL_TEXT_LENGTH:
            issues.append(
                f"Total voiceover text exceeds maximum: "
                f"{total_text_length:,} chars (max: {MAX_TOTAL_TEXT_LENGTH:,})"
            )
        elif total_text_length > WARN_TOTAL_TEXT_LENGTH:
            warnings.append(
                f"Total voiceover text approaching limit: "
                f"{total_text_length:,} chars (limit: {MAX_TOTAL_TEXT_LENGTH:,})"
            )
        
        # Check 3: Payload size
        if payload_size > MAX_PAYLOAD_SIZE_BYTES:
            issues.append(
                f"Payload size exceeds maximum: "
                f"{payload_size:,} bytes (max: {MAX_PAYLOAD_SIZE_BYTES:,} bytes / "
                f"{MAX_PAYLOAD_SIZE_BYTES / (1024*1024):.1f} MB)"
            )
        elif payload_size > WARN_PAYLOAD_SIZE_BYTES:
            warnings.append(
                f"Payload size approaching limit: "
                f"{payload_size:,} bytes (limit: {MAX_PAYLOAD_SIZE_BYTES:,} bytes / "
                f"{MAX_PAYLOAD_SIZE_BYTES / (1024*1024):.1f} MB)"
            )
        
        # Check 4: Number of slides
        num_slides = len(video_request.get('slides', []))
        if num_slides > MAX_SLIDES_PER_REQUEST:
            issues.append(
                f"Number of slides exceeds maximum: "
                f"{num_slides} slides (max: {MAX_SLIDES_PER_REQUEST})"
            )
        
        # Check 5: Project name length
        project_name = video_request.get('name', '')
        if len(project_name) > MAX_PROJECT_NAME_LENGTH:
            issues.append(
                f"Project name exceeds maximum length: "
                f"{len(project_name)} chars (max: {MAX_PROJECT_NAME_LENGTH})"
            )
        
        valid = len(issues) == 0
        
        # Log results
        if valid:
            logger.info(f"✅ [PAYLOAD_VALIDATION] Payload validation passed")
            logger.info(f"📊 [PAYLOAD_VALIDATION] Statistics:")
            logger.info(f"  - Texts: {len(voiceover_texts)}")
            logger.info(f"  - Total text length: {total_text_length:,} chars")
            logger.info(f"  - Payload size: {payload_size:,} bytes ({payload_size / 1024:.2f} KB)")
            logger.info(f"  - Slides: {num_slides}")
        else:
            logger.error(f"❌ [PAYLOAD_VALIDATION] Payload validation FAILED")
            logger.error(f"❌ [PAYLOAD_VALIDATION] Issues found:")
            for issue in issues:
                logger.error(f"  - {issue}")
        
        if warnings:
            logger.warning(f"⚠️ [PAYLOAD_VALIDATION] Warnings:")
            for warning in warnings:
                logger.warning(f"  - {warning}")
        
        return {
            'valid': valid,
            'issues': issues,
            'warnings': warnings,
            'payload_size': payload_size,
            'stats': {
                'num_texts': len(voiceover_texts),
                'total_text_length': total_text_length,
                'num_slides': num_slides,
                'project_name_length': len(project_name)
            }
        }
    
    def _smart_truncate_texts(
        self, 
        texts: List[str], 
        max_individual: int = MAX_VOICEOVER_TEXT_LENGTH,
        max_total: int = MAX_TOTAL_TEXT_LENGTH
    ) -> tuple:
        """
        Intelligently truncate texts to fit within limits while preserving as much content as possible.
        
        Strategy:
        1. First, truncate any texts exceeding individual limit
        2. If total still exceeds limit, proportionally reduce all texts
        3. Preserve sentence boundaries when possible
        
        Args:
            texts: List of voiceover texts to truncate
            max_individual: Maximum length per text
            max_total: Maximum total length
            
        Returns:
            Tuple of (truncated_texts, was_truncated)
        """
        was_truncated = False
        truncated_texts = []
        
        # Step 1: Enforce individual limits
        for i, text in enumerate(texts):
            if len(text) > max_individual:
                # Try to truncate at sentence boundary
                truncated = text[:max_individual]
                
                # Find last sentence ending
                last_period = truncated.rfind('.')
                last_exclaim = truncated.rfind('!')
                last_question = truncated.rfind('?')
                last_sentence = max(last_period, last_exclaim, last_question)
                
                if last_sentence > max_individual * 0.8:  # Keep if we retain 80%+
                    truncated = truncated[:last_sentence + 1]
                else:
                    truncated = truncated + "..."
                
                truncated_texts.append(truncated)
                was_truncated = True
                logger.warning(
                    f"⚠️ [TEXT_TRUNCATION] Text {i+1} truncated from {len(text)} to {len(truncated)} chars"
                )
            else:
                truncated_texts.append(text)
        
        # Step 2: Check total length
        total_length = sum(len(t) for t in truncated_texts)
        
        if total_length > max_total:
            # Calculate proportional reduction needed
            reduction_factor = max_total / total_length
            logger.warning(
                f"⚠️ [TEXT_TRUNCATION] Total length {total_length} exceeds {max_total}, "
                f"applying {reduction_factor:.2%} reduction"
            )
            
            final_texts = []
            for i, text in enumerate(truncated_texts):
                new_length = int(len(text) * reduction_factor)
                if new_length < len(text):
                    # Truncate proportionally
                    truncated = text[:new_length]
                    
                    # Try to preserve sentence boundary
                    last_sentence = max(
                        truncated.rfind('.'),
                        truncated.rfind('!'),
                        truncated.rfind('?')
                    )
                    
                    if last_sentence > new_length * 0.7:
                        truncated = truncated[:last_sentence + 1]
                    else:
                        truncated = truncated.rstrip() + "..."
                    
                    final_texts.append(truncated)
                    was_truncated = True
                    logger.warning(
                        f"⚠️ [TEXT_TRUNCATION] Text {i+1} further reduced from {len(text)} to {len(truncated)} chars"
                    )
                else:
                    final_texts.append(text)
            
            truncated_texts = final_texts
        
        final_total = sum(len(t) for t in truncated_texts)
        logger.info(f"📊 [TEXT_TRUNCATION] Final total length: {final_total:,} chars")
        
        return truncated_texts, was_truncated
    
    def _get_adaptive_poll_interval(
        self,
        elapsed_time: float,
        current_interval: float,
        status_changed: bool = False
    ) -> float:
        """
        Calculate adaptive polling interval using exponential backoff.
        
        Strategy:
        - Start with fast polling (10s)
        - Gradually increase interval (exponential backoff)
        - Cap at maximum (60s)
        - Reset to initial on status change
        
        Args:
            elapsed_time: Time elapsed since start (seconds)
            current_interval: Current polling interval (seconds)
            status_changed: Whether status changed since last poll
            
        Returns:
            Next polling interval in seconds
        """
        # Reset to initial interval if status changed
        if status_changed and self.poll_reset_on_change:
            logger.info(
                f"⏱️ [ADAPTIVE_POLLING] Status changed - resetting to initial interval: {self.initial_poll_interval}s"
            )
            return self.initial_poll_interval
        
        # Exponential backoff: multiply current interval
        next_interval = current_interval * self.poll_backoff_multiplier
        
        # Apply cap
        next_interval = min(next_interval, self.max_poll_interval)
        
        # Log interval changes
        if next_interval != current_interval:
            logger.info(
                f"⏱️ [ADAPTIVE_POLLING] Increasing interval: {current_interval:.1f}s → {next_interval:.1f}s "
                f"(elapsed: {elapsed_time:.1f}s)"
            )
        
        return next_interval
    
    async def get_avatars(self) -> Dict[str, Any]:
        """
        Fetch available avatars from Elai API.
        
        Returns:
            Dict containing avatar list or error
        """
        client = self._get_client()
        if not client:
            return {
                "success": False,
                "error": "HTTP client not available - httpx may not be installed"
            }
        
        try:
            response = await client.get(
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
        finally:
            await client.aclose()
    
    async def get_voices(self) -> Dict[str, Any]:
        """
        Fetch available voices from Elai API.
        
        Returns:
            Dict containing voices list or error
        """
        client = self._get_client()
        if not client:
            return {
                "success": False,
                "error": "HTTP client not available - httpx may not be installed"
            }
        
        try:
            response = await client.get(
                f"{self.api_base}/voices",
                headers=self.headers
            )
            
            if response.is_success:
                voices = response.json()
                logger.info(f"Successfully fetched voices")
                return {"success": True, "voices": voices}
            else:
                logger.error(f"Failed to fetch voices: {response.status_code} - {response.text}")
                return {
                    "success": False,
                    "error": f"Failed to fetch voices: {response.status_code}"
                }
                
        except Exception as e:
            logger.error(f"Error fetching voices: {str(e)}")
            return {"success": False, "error": str(e)}
        finally:
            await client.aclose()
    
    async def create_video_from_texts(self, project_name: str, voiceover_texts: List[str], avatar_code: str, voice_id: str = None, voice_provider: str = None, elai_background_color: str = None) -> Dict[str, Any]:
        """
        Create video from voiceover texts using Elai API.
        
        Args:
            project_name: Name of the project
            voiceover_texts: List of voiceover texts
            avatar_code: Avatar code to use
            voice_id: Voice ID from Elai API (optional)
            voice_provider: Voice provider (azure, elevenlabs, etc.) (optional)
            elai_background_color: Background color for Elai video canvas (optional, defaults to #ffffff)
            
        Returns:
            Dict containing result with success status and video ID
        """
        logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Starting video creation from texts")
        logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Parameters:")
        logger.info(f"  - Project name: {project_name}")
        logger.info(f"  - Voiceover texts count: {len(voiceover_texts)}")
        logger.info(f"  - Avatar code: {avatar_code}")
        logger.info(f"  - Voice ID: {voice_id}")
        logger.info(f"  - Voice Provider: {voice_provider}")
        
        for i, text in enumerate(voiceover_texts):
            logger.info(f"  - Voiceover text {i+1}: {text[:200]}...")
        
        client = self._get_client()
        if not client:
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
            
            # ✅ ENHANCED: Clean and validate voiceover texts with payload size awareness
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
                
                # Validate minimum length
                if len(cleaned_text) < 5:
                    logger.warning(f"Voiceover text too short at index {i}: '{cleaned_text}'")
                    continue
                
                cleaned_texts.append(cleaned_text)
                logger.info(f"Cleaned voiceover text {i+1}: {cleaned_text[:100]}... (length: {len(cleaned_text)} chars)")
            
            if not cleaned_texts:
                return {
                    "success": False,
                    "error": "No valid voiceover texts after cleaning"
                }
            
            # ✅ NEW: Smart truncation if needed
            truncated_texts, was_truncated = self._smart_truncate_texts(cleaned_texts)
            if was_truncated:
                logger.warning(
                    f"⚠️ [PAYLOAD_VALIDATION] Voiceover texts were automatically truncated to fit API limits"
                )
            
            cleaned_texts = truncated_texts
            
            # Get avatars to find the specified one
            avatars_response = await self.get_avatars()
            if not avatars_response["success"]:
                return {
                    "success": False,
                    "error": f"Failed to get avatars: {avatars_response['error']}"
                }
            
            # Find the specified avatar (handle variant codes like "gia.casual")
            logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Searching for avatar with code: {avatar_code}")
            logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Available avatars count: {len(avatars_response['avatars'])}")
            
            avatar = None
            selected_variant = None
            
            # Check if avatar_code contains a variant (e.g., "gia.casual")
            if '.' in avatar_code:
                base_code, variant_code = avatar_code.split('.', 1)
                logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Looking for avatar '{base_code}' with variant '{variant_code}'")
                
                for av in avatars_response["avatars"]:
                    if av.get("code") == base_code:
                        # Check if this avatar has the specified variant
                        if av.get("variants"):
                            for variant in av["variants"]:
                                if variant.get("code") == variant_code:
                                    avatar = av
                                    selected_variant = variant
                                    logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Found avatar: {avatar.get('name', 'Unknown')} with variant: {variant.get('name', 'Unknown')}")
                                    break
                            if avatar:
                                break
            else:
                # No variant specified, look for exact match
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
            
            # Check if avatar has valid canvas URL
            if not avatar.get("canvas"):
                logger.error(f"🎬 [ELAI_VIDEO_GENERATION] Avatar '{avatar.get('name', 'Unknown')}' has empty canvas URL")
                logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Looking for alternative avatar with valid canvas...")
                
                # Try to find an alternative avatar with valid canvas
                alternative_avatar = None
                for av in avatars_response["avatars"]:
                    if av.get("canvas") and av.get("canvas").strip():
                        alternative_avatar = av
                        logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Found alternative avatar: {alternative_avatar.get('name', 'Unknown')} (code: {alternative_avatar.get('code', 'Unknown')})")
                        break
                
                if alternative_avatar:
                    avatar = alternative_avatar
                    logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Using alternative avatar: {avatar.get('name', 'Unknown')} (code: {avatar.get('code', 'Unknown')})")
                else:
                    logger.error(f"🎬 [ELAI_VIDEO_GENERATION] No avatars with valid canvas found")
                    return {
                        "success": False,
                        "error": f"No avatars with valid canvas URL found"
                    }
            
            # Validate avatar canvas URL before proceeding
            # Use variant canvas URL if available, otherwise use avatar canvas URL
            avatar_canvas_url = selected_variant.get('canvas') if selected_variant else avatar.get('canvas')
            logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Avatar validation:")
            logger.info(f"  - Avatar code: {avatar.get('code')}")
            logger.info(f"  - Selected variant: {selected_variant.get('name') if selected_variant else 'None'}")
            logger.info(f"  - Avatar canvas URL: {avatar_canvas_url}")
            
            # Validate canvas URL format
            if not avatar_canvas_url or not avatar_canvas_url.startswith('https://'):
                logger.error(f"🎬 [ELAI_VIDEO_GENERATION] CRITICAL ERROR: Invalid canvas URL format: {avatar_canvas_url}")
                return {
                    "success": False,
                    "error": f"Invalid avatar canvas URL format: {avatar_canvas_url}"
                }
            
            # Additional validation: Check URL contains expected patterns
            if 'cloudfront.net' not in avatar_canvas_url and 'elai.io' not in avatar_canvas_url:
                logger.warning(f"🎬 [ELAI_VIDEO_GENERATION] WARNING: Unusual canvas URL domain: {avatar_canvas_url}")
            
            logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Canvas URL validation passed: {avatar_canvas_url[:50]}...")
            
            # Determine background color: use provided color, or fallback to white
            background_color = elai_background_color if elai_background_color else "#ffffff"
            logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Using Elai background color: {background_color}")
            
            logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Preparing video request with CORRECT 1080x1080 dimensions")
            logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Video request configuration:")
            logger.info(f"  - Name: {project_name}")
            logger.info(f"  - Format: 1:1 aspect ratio (CORRECT)")
            logger.info(f"  - Resolution: 1080p (CORRECT)")
            logger.info(f"  - Avatar scale: 0.3x0.3 (appropriate for 1080x1080)")
            logger.info(f"  - Avatar canvas URL: {avatar.get('canvas', 'N/A')[:100]}...")
            logger.info(f"  - Background color: {background_color}")

            # FIXED: Official Elai API structure with correct 1080x1080 dimensions
            # Use actual avatar data instead of hardcoded example values
            video_request = {
                "name": project_name[:MAX_PROJECT_NAME_LENGTH],  # ✅ Enforce project name limit
                "slides": [{
                    "id": 1,
                    "canvas": {
                        "objects": [{
                            "type": "avatar",
                            "left": 151.5,     # Exact from example
                            "top": 36,         # Exact from example
                            "fill": "#4868FF", # Exact from example
                            "scaleX": 0.3,     # Exact from example
                            "scaleY": 0.3,     # Exact from example
                            "width": 1080,     # Exact from example
                            "height": 1080,    # Exact from example
                            "src": avatar_canvas_url,  # Use selected avatar/variant canvas URL
                            "avatarType": "transparent",  # Exact from example
                            "animation": {
                                "type": None,
                                "exitType": None
                            }
                        }],
                        "background": background_color,  # ✅ Dynamic background color from slide template
                        "version": "4.4.0"        # Exact from example
                    },
                    "avatar": {
                        "code": avatar_code,     # Use the original avatar_code (may include variant)
                        "gender": avatar.get("gender", "female"),       # Use actual avatar gender
                        "canvas": avatar_canvas_url  # Use selected avatar/variant canvas URL
                    },
                    "animation": "fade_in",
                    "language": "English",
                    "speech": " ".join(cleaned_texts),
                    "voice": voice_id if voice_id else "en-US-AriaNeural",
                    "voiceType": "text",
                    "voiceProvider": voice_provider if voice_provider else "azure"
                }],
                "tags": ["video_lesson", "generated", "presentation"],
                "format": "1_1",  # CRITICAL FIX: Specify 1:1 aspect ratio for 1080x1080
                "resolution": "1080p"  # CRITICAL FIX: Specify 1080p resolution
            }
            
            # ✅ NEW: Validate payload size before sending
            validation = self._validate_payload_size(video_request, cleaned_texts)
            
            if not validation['valid']:
                error_msg = "Payload validation failed: " + "; ".join(validation['issues'])
                logger.error(f"❌ [ELAI_VIDEO_GENERATION] {error_msg}")
                return {
                    "success": False,
                    "error": error_msg,
                    "validation_details": validation
                }
            
            # Log warnings (non-blocking)
            if validation['warnings']:
                for warning in validation['warnings']:
                    logger.warning(f"⚠️ [ELAI_VIDEO_GENERATION] {warning}")
            
            # Log payload statistics
            logger.info(f"📊 [ELAI_VIDEO_GENERATION] Payload statistics:")
            logger.info(f"  - Size: {validation['payload_size']:,} bytes ({validation['payload_size'] / 1024:.2f} KB)")
            logger.info(f"  - Texts: {validation['stats']['num_texts']}")
            logger.info(f"  - Total text length: {validation['stats']['total_text_length']:,} chars")
            logger.info(f"  - Slides: {validation['stats']['num_slides']}")
            
            logger.info(f"🎬 [ELAI_VIDEO_GENERATION] Making API call to Elai")
            logger.info(f"🎬 [ELAI_VIDEO_GENERATION] API endpoint: {self.api_base}/videos")
            
            # Create video
            response = await client.post(
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
                # logger.info(f"  - Full response: {json.dumps(result, indent=2)}")
                
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
        finally:
            await client.aclose()

    async def create_video(self, slides_data: List[Dict[str, Any]], avatar_data: Dict[str, Any], voice_id: str = None, voice_provider: str = None) -> Dict[str, Any]:
        """
        Create a video with the given slides and avatar data.
        
        Args:
            slides_data: List of slide data with voiceover text
            avatar_data: Avatar configuration data
            voice_id: Voice ID from Elai API (optional)
            voice_provider: Voice provider (azure, elevenlabs, etc.) (optional)
            
        Returns:
            Dict containing video creation response
        """
        client = self._get_client()
        if not client:
            return {
                "success": False,
                "error": "HTTP client not available - httpx may not be installed"
            }
        
        try:
            # Prepare slides for Elai API
            elai_slides = []
            for i, slide in enumerate(slides_data):
                # Extract slide data
                slide_id = slide.get("slideId", f"slide-{i}")
                props = slide.get("props", {})
                metadata = slide.get("metadata", {})
                element_positions = metadata.get("elementPositions", {})
                
                # 🔍 COMPREHENSIVE POSITIONING DEBUG
                logger.info(f"🔍 POSITIONING DEBUG for slide {i+1} (ID: {slide_id})")
                logger.info(f"   📋 Slide data keys: {list(slide.keys())}")
                logger.info(f"   📋 Props keys: {list(props.keys())}")
                logger.info(f"   📋 Metadata keys: {list(metadata.keys()) if metadata else 'None'}")
                logger.info(f"   📋 Element positions dict: {element_positions}")
                logger.info(f"   📋 Number of positions: {len(element_positions)}")
                logger.info(f"   📋 Available position keys: {list(element_positions.keys()) if element_positions else 'None'}")
                
                # Check if we have any positioning data at all
                if not element_positions:
                    logger.warning(f"   ⚠️ NO ELEMENT POSITIONS FOUND for slide {slide_id}")
                    logger.warning(f"   ⚠️ This means positions will use fallback defaults!")
                else:
                    logger.info(f"   ✅ Element positions found: {len(element_positions)} items")
                
                # Build canvas objects starting with avatar
                canvas_objects = [{
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
                }]
                
                # Add text elements with dynamic positioning
                text_elements_added = 0
                
                # Add title if present
                if props.get("title") and props.get("title") != "Click to add title":
                    title_id = f"draggable-{slide_id}-0"
                    logger.info(f"   🎯 Looking for title ID: '{title_id}'")
                    logger.info(f"   🎯 Available position keys: {list(element_positions.keys()) if element_positions else 'None'}")
                    
                    title_position = element_positions.get(title_id, {"x": 100, "y": 100})  # Default position
                    logger.info(f"   🎯 Title position found: {title_position}")
                    logger.info(f"   🎯 Using fallback? {title_id not in element_positions}")
                    
                    canvas_objects.append({
                        "type": "text",
                        "left": title_position.get("x", 100),
                        "top": title_position.get("y", 100),
                        "width": 800,
                        "height": 100,
                        "fill": "#000000",
                        "fontSize": 48,
                        "fontFamily": "Arial",
                        "fontWeight": "bold",
                        "text": props.get("title"),
                        "textAlign": "left",
                        "textDecoration": "none"
                    })
                    text_elements_added += 1
                    logger.info(f"   ✅ Added title text element at position ({title_position.get('x', 100)}, {title_position.get('y', 100)})")
                    logger.info(f"   📤 Sending to Elai API: left={title_position.get('x', 100)}, top={title_position.get('y', 100)}")
                
                # Add subtitle if present
                if props.get("subtitle") and props.get("subtitle") != "Click to add content":
                    subtitle_id = f"draggable-{slide_id}-1"
                    logger.info(f"   🎯 Looking for subtitle ID: '{subtitle_id}'")
                    
                    subtitle_position = element_positions.get(subtitle_id, {"x": 100, "y": 200})  # Default position
                    logger.info(f"   🎯 Subtitle position found: {subtitle_position}")
                    logger.info(f"   🎯 Using fallback? {subtitle_id not in element_positions}")
                    
                    canvas_objects.append({
                        "type": "text",
                        "left": subtitle_position.get("x", 100),
                        "top": subtitle_position.get("y", 200),
                        "width": 800,
                        "height": 80,
                        "fill": "#333333",
                        "fontSize": 32,
                        "fontFamily": "Arial",
                        "fontWeight": "normal",
                        "text": props.get("subtitle"),
                        "textAlign": "left",
                        "textDecoration": "none"
                    })
                    text_elements_added += 1
                    logger.info(f"   ✅ Added subtitle text element at position ({subtitle_position.get('x', 100)}, {subtitle_position.get('y', 200)})")
                    logger.info(f"   📤 Sending to Elai API: left={subtitle_position.get('x', 100)}, top={subtitle_position.get('y', 200)}")
                
                # Add content text if present
                if props.get("content") and props.get("content") != "Click to add content":
                    content_id = f"draggable-{slide_id}-2"
                    logger.info(f"   🎯 Looking for content ID: '{content_id}'")
                    
                    content_position = element_positions.get(content_id, {"x": 100, "y": 300})  # Default position
                    logger.info(f"   🎯 Content position found: {content_position}")
                    logger.info(f"   🎯 Using fallback? {content_id not in element_positions}")
                    
                    canvas_objects.append({
                        "type": "text",
                        "left": content_position.get("x", 100),
                        "top": content_position.get("y", 300),
                        "width": 800,
                        "height": 200,
                        "fill": "#666666",
                        "fontSize": 24,
                        "fontFamily": "Arial",
                        "fontWeight": "normal",
                        "text": props.get("content"),
                        "textAlign": "left",
                        "textDecoration": "none"
                    })
                    text_elements_added += 1
                    logger.info(f"   ✅ Added content text element at position ({content_position.get('x', 100)}, {content_position.get('y', 300)})")
                    logger.info(f"   📤 Sending to Elai API: left={content_position.get('x', 100)}, top={content_position.get('y', 300)}")
                
                logger.info(f"   📊 SUMMARY for slide {i+1}:")
                logger.info(f"      - Added {text_elements_added} text elements")
                logger.info(f"      - Element positions available: {list(element_positions.keys()) if element_positions else 'None'}")
                logger.info(f"      - Canvas objects count: {len(canvas_objects)}")
                
                # 🔍 FINAL DEBUG: Log the complete canvas objects being sent to Elai
                logger.info(f"   📤 FINAL CANVAS OBJECTS for Elai API:")
                for j, obj in enumerate(canvas_objects):
                    if obj.get("type") == "text":
                        logger.info(f"      Text {j}: left={obj.get('left')}, top={obj.get('top')}, text='{obj.get('text', '')[:50]}...'")
                    else:
                        logger.info(f"      {obj.get('type', 'unknown')} {j}: left={obj.get('left')}, top={obj.get('top')}")
                
                logger.info(f"🔍 END POSITIONING DEBUG for slide {i+1}")
                logger.info("=" * 80)
                
                # Extract Elai background color from slide data (from template registry)
                elai_background_color = slide.get("elaiBackgroundColor")
                if not elai_background_color:
                    # Fallback: try to extract from avatarPosition backgroundColor
                    avatar_position = slide.get("avatarPosition", {})
                    elai_background_color = avatar_position.get("backgroundColor")
                # Only fallback to white if no color was found at all
                if not elai_background_color:
                    elai_background_color = "#ffffff"  # Final fallback only if truly missing
                
                logger.info(f"🎨 [ELAI_BACKGROUND] Slide {i+1} using background color: {elai_background_color}")
                
                elai_slide = {
                    "id": i + 1,
                    "status": "edited",
                    "canvas": {
                        "objects": canvas_objects,
                        "background": elai_background_color,  # ✅ Dynamic background color from slide template
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
                    "voice": voice_id if voice_id else avatar_data.get("voice", "en-US-AriaNeural"),
                    "voiceType": "text",
                    "voiceProvider": voice_provider if voice_provider else avatar_data.get("voice_provider", "azure")
                }
                elai_slides.append(elai_slide)
            
            # Log voice parameters used in Elai API payload
            logger.info("🎤 [ELAI_VIDEO_GENERATION] ========== VOICE PARAMETERS IN ELAI PAYLOAD ==========")
            for i, slide in enumerate(elai_slides):
                logger.info(f"🎤 [ELAI_VIDEO_GENERATION] Slide {i+1} voice configuration:")
                logger.info(f"  - Voice: {slide.get('voice')}")
                logger.info(f"  - Voice Provider: {slide.get('voiceProvider')}")
                logger.info(f"  - Voice Type: {slide.get('voiceType')}")
                logger.info(f"  - Speech Text: {slide.get('speech', '')[:100]}...")
            logger.info("🎤 [ELAI_VIDEO_GENERATION] ========== VOICE PARAMETERS LOGGED ==========")
            
            # Prepare video request
            video_request = {
                "name": f"Video Lesson - {datetime.now().isoformat()}",
                "slides": elai_slides,
                "tags": ["video_lesson", "generated", "presentation"],
                "format": "1_1",  # CRITICAL FIX: Specify 1:1 aspect ratio for 1080x1080
                "resolution": "1080p"  # CRITICAL FIX: Specify 1080p resolution
            }
            
            # Create video
            logger.info("🎤 [ELAI_VIDEO_GENERATION] ========== ELAI API CALL STARTED ==========")
            logger.info(f"🎤 [ELAI_VIDEO_GENERATION] Making POST request to: {self.api_base}/videos")
            logger.info(f"🎤 [ELAI_VIDEO_GENERATION] Request payload summary:")
            logger.info(f"  - Video name: {video_request['name']}")
            logger.info(f"  - Slides count: {len(video_request['slides'])}")
            logger.info(f"  - Format: {video_request['format']}")
            logger.info(f"  - Resolution: {video_request['resolution']}")
            
            response = await client.post(
                f"{self.api_base}/videos",
                headers=self.headers,
                json=video_request
            )
            
            logger.info(f"🎤 [ELAI_VIDEO_GENERATION] Elai API response status: {response.status_code}")
            logger.info("🎤 [ELAI_VIDEO_GENERATION] ========== ELAI API CALL COMPLETED ==========")
            
            if response.is_success:
                result = response.json()
                video_id = result.get('_id')
                logger.info(f"🎤 [ELAI_VIDEO_GENERATION] ✅ Video created successfully with ID: {video_id}")
                logger.info("🎤 [ELAI_VIDEO_GENERATION] ========== VOICE INTEGRATION SUCCESS ==========")
                return result
            else:
                logger.error(f"🎤 [ELAI_VIDEO_GENERATION] ❌ Failed to create video: {response.status_code} - {response.text}")
                logger.error("🎤 [ELAI_VIDEO_GENERATION] ========== VOICE INTEGRATION FAILED ==========")
                raise Exception(f"Video creation failed: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Error creating video: {str(e)}")
            raise
        finally:
            await client.aclose()
    
    async def create_video_from_elai_request(self, elai_video_request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a video directly from an Elai video request format (used by frontend).
        
        Args:
            elai_video_request: Complete Elai API video request payload with slides, canvas objects, etc.
            
        Returns:
            Dict containing video creation response with video ID
        """
        client = self._get_client()
        if not client:
            return {
                "success": False,
                "error": "HTTP client not available - httpx may not be installed"
            }
        
        try:
            logger.info(f"🎬 [ELAI_VIDEO_FROM_REQUEST] Creating video from frontend request")
            logger.info(f"🎬 [ELAI_VIDEO_FROM_REQUEST] Video name: {elai_video_request.get('name', 'Unknown')}")
            logger.info(f"🎬 [ELAI_VIDEO_FROM_REQUEST] Slides count: {len(elai_video_request.get('slides', []))}")
            
            # Make API call to Elai
            response = await client.post(
                f"{self.api_base}/videos",
                headers=self.headers,
                json=elai_video_request
            )
            
            logger.info(f"🎬 [ELAI_VIDEO_FROM_REQUEST] API response status: {response.status_code}")
            
            if response.is_success:
                result = response.json()
                video_id = result.get("_id")
                
                logger.info(f"🎬 [ELAI_VIDEO_FROM_REQUEST] Video created successfully: {video_id}")
                return {
                    "success": True,
                    "videoId": video_id,
                    "_id": video_id
                }
            else:
                error_text = response.text
                logger.error(f"🎬 [ELAI_VIDEO_FROM_REQUEST] Video creation failed: {response.status_code} - {error_text}")
                return {
                    "success": False,
                    "error": f"Video creation failed: {response.status_code} - {error_text}"
                }
                
        except Exception as e:
            logger.error(f"Error creating video from request: {str(e)}")
            return {
                "success": False,
                "error": f"Failed to create video: {str(e)}"
            }
        finally:
            await client.aclose()
    
    async def render_video(self, video_id: str) -> Dict[str, Any]:
        """
        Start rendering the video.
        
        Args:
            video_id: The ID of the video to render
            
        Returns:
            Dict containing render response
        """
        client = self._get_client()
        if not client:
            return {
                "success": False,
                "error": "HTTP client not available - httpx may not be installed"
            }
        
        try:
            response = await client.post(
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
        finally:
            await client.aclose()
    
    async def check_video_status(self, video_id: str) -> Dict[str, Any]:
        """
        Check the current status of a video.
        
        Args:
            video_id: The ID of the video to check
            
        Returns:
            Dict containing video status information
        """
        client = self._get_client()
        if not client:
            return {
                "success": False,
                "error": "HTTP client not available - httpx may not be installed"
            }
        
        try:
            response = await client.get(
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
        finally:
            await client.aclose()
    
    async def wait_for_completion(self, video_id: str, slide_count: int = 1) -> Optional[str]:
        """
        Wait for video rendering to complete with adaptive exponential backoff and dynamic timeout.
        
        Enhanced polling strategy:
        - Starts with fast polling (10s) when video just started
        - Gradually increases interval using exponential backoff
        - Resets to fast polling when status changes (activity detected)
        - Caps at 60 seconds to avoid excessive delays
        - Dynamic timeout based on number of slides
        
        Args:
            video_id: The ID of the video to monitor
            slide_count: Number of slides in presentation (for dynamic timeout calculation)
            
        Returns:
            Download URL if successful, None if failed or timeout
        """
        start_time = datetime.now()
        current_interval = self.initial_poll_interval
        last_status = None
        poll_count = 0
        
        # Calculate dynamic timeout based on slide count
        max_wait = self.calculate_timeout(slide_count)
        
        logger.info(f"⏱️ [ADAPTIVE_POLLING] Starting adaptive polling for video {video_id}")
        logger.info(f"⏱️ [ADAPTIVE_POLLING] Configuration:")
        logger.info(f"  - Initial interval: {self.initial_poll_interval}s")
        logger.info(f"  - Max interval: {self.max_poll_interval}s")
        logger.info(f"  - Backoff multiplier: {self.poll_backoff_multiplier}x")
        logger.info(f"  - Timeout: {max_wait}s ({max_wait/60:.1f} min) for {slide_count} slide(s)")
        
        while (datetime.now() - start_time).total_seconds() < max_wait:
            try:
                poll_count += 1
                elapsed_time = (datetime.now() - start_time).total_seconds()
                
                status_data = await self.check_video_status(video_id)
                
                if not status_data:
                    logger.warning(f"⏱️ [ADAPTIVE_POLLING] Failed to get video status, retrying...")
                    await asyncio.sleep(current_interval)
                    continue
                
                status = status_data.get("status", "unknown")
                status_changed = (status != last_status)
                
                logger.info(
                    f"⏱️ [ADAPTIVE_POLLING] Poll #{poll_count}: status={status}, "
                    f"elapsed={elapsed_time:.1f}s, next_interval={current_interval:.1f}s"
                )
                
                if status in ["rendered", "ready"]:
                    # Try different possible URL fields
                    download_url = (
                        status_data.get("videoUrl") or 
                        status_data.get("url") or 
                        status_data.get("playerData", {}).get("url")
                    )
                    
                    if download_url:
                        logger.info(
                            f"✅ [ADAPTIVE_POLLING] Video {video_id} completed successfully "
                            f"(polls: {poll_count}, time: {elapsed_time:.1f}s)"
                        )
                        return download_url
                    else:
                        logger.error(f"Video {video_id} rendered but no download URL found")
                        return None
                        
                elif status == "failed":
                    logger.error(f"Video {video_id} rendering failed permanently")
                    return None
                    
                elif status == "error":
                    # Check if this is a permanent error or temporary issue
                    error_details = status_data.get("data", {}).get("error", {})
                    error_message = error_details.get("message", "").lower() if isinstance(error_details, dict) else ""
                    
                    # Check for permanent error indicators
                    permanent_errors = [
                        "avatar not found",
                        "invalid avatar",
                        "canvas error",
                        "rendering failed",
                        "permanent error"
                    ]
                    
                    if any(err in error_message for err in permanent_errors):
                        logger.error(f"Video {video_id} rendering failed with permanent error: {error_message}")
                        return None
                    else:
                        logger.warning(f"Video {video_id} reported temporary error status, continuing to wait...")
                        # Don't change interval for temporary errors
                        await asyncio.sleep(current_interval)
                    
                elif status in ["rendering", "queued", "draft", "validating"]:
                    # Normal processing states - apply adaptive interval
                    last_status = status
                    
                    # Calculate next interval
                    current_interval = self._get_adaptive_poll_interval(
                        elapsed_time,
                        current_interval,
                        status_changed
                    )
                    
                    await asyncio.sleep(current_interval)
                    
                else:
                    logger.warning(f"Unknown status for video {video_id}: {status}")
                    await asyncio.sleep(current_interval)
                    
            except Exception as e:
                logger.error(f"Error monitoring video {video_id}: {str(e)}")
                await asyncio.sleep(current_interval)
        
        logger.error(
            f"❌ [ADAPTIVE_POLLING] Video {video_id} generation timeout after {max_wait}s "
            f"({max_wait/60:.1f} min) for {slide_count} slide(s) (polls: {poll_count})"
        )
        return None
    
    async def download_video(self, download_url: str, output_path: str) -> bool:
        """
        Download the rendered video to local storage with dynamic timeout.
        
        Args:
            download_url: The URL to download the video from
            output_path: Path where to save the video
            
        Returns:
            True if download successful, False otherwise
        """
        client = self._get_client()
        if not client:
            logger.error("HTTP client not available")
            return False
        
        try:
            logger.info(f"📥 [DOWNLOAD] Starting video download")
            logger.info(f"📥 [DOWNLOAD] URL: {download_url}")
            logger.info(f"📥 [DOWNLOAD] Output: {output_path}")
            
            # ✅ STEP 1: HEAD request to get file size (with short timeout)
            expected_size = 0
            download_timeout = self.base_download_timeout
            
            try:
                head_response = await client.head(download_url, timeout=30)
                expected_size = int(head_response.headers.get('content-length', 0))
                
                if expected_size > 0:
                    logger.info(f"📥 [DOWNLOAD] Expected file size: {expected_size / (1024*1024):.2f} MB")
                    
                    # Calculate dynamic timeout based on file size
                    download_timeout = self.calculate_download_timeout(expected_size)
                else:
                    logger.warning("📥 [DOWNLOAD] File size not available from headers, using base timeout")
                    
            except Exception as e:
                logger.warning(f"📥 [DOWNLOAD] HEAD request failed: {e}, using base timeout")
            
            # ✅ STEP 2: Download with dynamic timeout
            logger.info(f"⏱️ [DOWNLOAD] Using timeout: {download_timeout}s ({download_timeout/60:.1f} min)")
            
            start_time = datetime.now()
            response = await client.get(download_url, timeout=download_timeout)  # ✅ Dynamic!
            response.raise_for_status()
            
            # Get total size for progress tracking
            total_size = int(response.headers.get('content-length', 0))
            downloaded_size = 0
            last_log_progress = 0
            
            # Create output directory if it doesn't exist
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Download the video with progress logging
            logger.info(f"📥 [DOWNLOAD] Starting file transfer...")
            with open(output_path, 'wb') as f:
                async for chunk in response.aiter_bytes(chunk_size=8192):
                    f.write(chunk)
                    downloaded_size += len(chunk)
                    
                    if total_size > 0:
                        progress = (downloaded_size / total_size) * 100
                        # Log every 10% progress
                        if progress - last_log_progress >= 10:
                            elapsed = (datetime.now() - start_time).total_seconds()
                            if elapsed > 0:
                                speed_mbps = (downloaded_size / (1024*1024)) / elapsed
                                logger.info(
                                    f"📥 [DOWNLOAD] Progress: {progress:.1f}% "
                                    f"({downloaded_size/(1024*1024):.1f}/{total_size/(1024*1024):.1f} MB) "
                                    f"Speed: {speed_mbps:.2f} MB/s"
                                )
                                last_log_progress = progress
            
            # Calculate final statistics
            elapsed_total = (datetime.now() - start_time).total_seconds()
            final_size_mb = downloaded_size / (1024*1024)
            avg_speed = final_size_mb / elapsed_total if elapsed_total > 0 else 0
            
            logger.info(f"✅ [DOWNLOAD] Video downloaded successfully")
            logger.info(f"✅ [DOWNLOAD] File: {output_path}")
            logger.info(f"✅ [DOWNLOAD] Size: {final_size_mb:.2f} MB")
            logger.info(f"✅ [DOWNLOAD] Time: {elapsed_total:.1f}s ({elapsed_total/60:.1f} min)")
            logger.info(f"✅ [DOWNLOAD] Avg speed: {avg_speed:.2f} MB/s")
            
            # Verify file was downloaded
            if os.path.exists(output_path):
                file_size_bytes = os.path.getsize(output_path)
                file_size_mb = file_size_bytes / (1024 * 1024)
                
                # Check if file is suspiciously small (might be blank/error)
                if file_size_bytes < 100000:  # Less than 100KB is suspicious for a video
                    logger.warning(f"⚠️ [DOWNLOAD] WARNING: Downloaded video is very small ({file_size_bytes} bytes)")
                    logger.warning(f"  - This might indicate a blank or error video")
                elif file_size_bytes < 1000000:  # Less than 1MB is concerning
                    logger.warning(f"⚠️ [DOWNLOAD] WARNING: Downloaded video is small ({file_size_mb:.2f} MB)")
                    logger.warning(f"  - Avatar might not be visible or video might be very short")
                else:
                    logger.info(f"✅ [DOWNLOAD] File size looks normal for video content")
                
                # Analyze video properties to detect blank videos
                await self._analyze_downloaded_video(output_path)
                
                return True
            else:
                logger.error("❌ [DOWNLOAD] Download completed but file not found")
                return False
                
        except Exception as e:
            # Enhanced error handling with timeout specifics
            import httpx
            if isinstance(e, httpx.TimeoutException):
                logger.error(
                    f"❌ [DOWNLOAD] Timeout after {download_timeout}s "
                    f"({download_timeout/60:.1f} min): {str(e)}"
                )
            else:
                logger.error(f"❌ [DOWNLOAD] Error: {str(e)}")
            return False
        finally:
            await client.aclose()
    
    async def _analyze_downloaded_video(self, video_path: str):
        """
        Analyze downloaded video to detect potential issues.
        
        Args:
            video_path: Path to the downloaded video file
        """
        try:
            logger.info(f"🎬 [VIDEO_ANALYSIS] Analyzing downloaded video: {video_path}")
            
            # Use FFprobe to get video information
            cmd = [
                'ffprobe',
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_format',
                '-show_streams',
                video_path
            ]
            
            import subprocess
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                import json
                data = json.loads(result.stdout)
                
                # Analyze format information
                format_info = data.get('format', {})
                duration = float(format_info.get('duration', 0))
                bitrate = int(format_info.get('bit_rate', 0))
                
                logger.info(f"🎬 [VIDEO_ANALYSIS] Video properties:")
                logger.info(f"  - Duration: {duration:.2f} seconds")
                logger.info(f"  - Bitrate: {bitrate} bps ({bitrate / 1000:.1f} kbps)")
                
                # Analyze video streams
                video_streams = [s for s in data.get('streams', []) if s.get('codec_type') == 'video']
                if video_streams:
                    video_stream = video_streams[0]
                    width = video_stream.get('width', 0)
                    height = video_stream.get('height', 0)
                    fps = video_stream.get('r_frame_rate', '0/1')
                    
                    logger.info(f"  - Resolution: {width}x{height}")
                    logger.info(f"  - Frame rate: {fps}")
                    
                    # Detect potential issues
                    if duration < 5.0:
                        logger.warning(f"🎬 [VIDEO_ANALYSIS] WARNING: Video is very short ({duration:.2f}s)")
                    
                    if bitrate < 500000:  # Less than 500 kbps
                        logger.warning(f"🎬 [VIDEO_ANALYSIS] WARNING: Video bitrate is very low ({bitrate / 1000:.1f} kbps)")
                        logger.warning(f"  - This might indicate a mostly static/blank video")
                    
                    if width != 1920 or height != 1080:
                        logger.warning(f"🎬 [VIDEO_ANALYSIS] WARNING: Unexpected resolution {width}x{height} (expected 1920x1080)")
                else:
                    logger.error(f"🎬 [VIDEO_ANALYSIS] ERROR: No video streams found in file")
                
                # Analyze audio streams
                audio_streams = [s for s in data.get('streams', []) if s.get('codec_type') == 'audio']
                if audio_streams:
                    audio_stream = audio_streams[0]
                    sample_rate = audio_stream.get('sample_rate', 0)
                    logger.info(f"  - Audio sample rate: {sample_rate} Hz")
                else:
                    logger.warning(f"🎬 [VIDEO_ANALYSIS] WARNING: No audio streams found")
                    
            else:
                logger.error(f"🎬 [VIDEO_ANALYSIS] ERROR: FFprobe failed: {result.stderr}")
                
        except Exception as e:
            logger.warning(f"🎬 [VIDEO_ANALYSIS] Could not analyze video: {str(e)}")
            # Don't fail the whole process if analysis fails
    
    async def generate_video(self, slides_data: List[Dict[str, Any]], avatar_data: Dict[str, Any], voice_id: str = None, voice_provider: str = None) -> Dict[str, Any]:
        """
        Complete video generation process: create, render, and wait for completion.
        
        Args:
            slides_data: List of slide data with voiceover text
            avatar_data: Avatar configuration data
            voice_id: Voice ID from Elai API (optional)
            voice_provider: Voice provider (azure, elevenlabs, etc.) (optional)
            
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
            video_data = await self.create_video(slides_data, avatar_data, voice_id, voice_provider)
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
        """Close the HTTP client. (No-op since clients are now closed immediately after use)"""
        pass

# Global instance
video_generation_service = ElaiVideoGenerationService()
