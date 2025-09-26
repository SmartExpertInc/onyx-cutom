# custom_extensions/backend/app/services/clean_video_generation_service.py

import os
import asyncio
import tempfile
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)

class CleanVideoGenerationService:
    """
    Clean video generation service using HTML → PNG → Video pipeline.
    
    This replaces the problematic screenshot-based approach with a clean
    HTML template rendering system.
    """
    
    def __init__(self):
        """Initialize the clean video generation service."""
        self.output_dir = Path("output/clean_videos")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info("Clean Video Generation Service initialized")
    
    async def generate_avatar_slide_video(self,
                                        slide_props: Dict[str, Any],
                                        theme: str = "dark-purple",
                                        slide_duration: float = 5.0,
                                        quality: str = "high") -> Dict[str, Any]:
        """
        Generate video for a single avatar slide.
        
        Args:
            slide_props: Slide properties including templateId
            theme: Theme name
            slide_duration: Duration in seconds
            quality: Video quality
            
        Returns:
            Result dict with success status and video path
        """
        try:
            template_id = slide_props.get("templateId")
            if not template_id:
                return {
                    "success": False,
                    "error": "Missing templateId in slide props"
                }
            
            logger.info(f"Generating video for avatar slide: {template_id}")
            
            # Import services
            from .video_assembly_service import video_assembly_service
            
            # Generate output filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"avatar_slide_{template_id}_{timestamp}.mp4"
            output_path = str(self.output_dir / output_filename)
            
            # Generate video using the assembly service
            result = await video_assembly_service.create_slide_video_from_props(
                slides_props=[slide_props],
                theme=theme,
                output_path=output_path,
                slide_duration=slide_duration,
                quality=quality
            )
            
            if result["success"]:
                file_size = result.get("file_size", 0)
                logger.info(f"Avatar slide video generated: {output_path} ({file_size} bytes)")
                
                return {
                    "success": True,
                    "video_path": output_path,
                    "video_url": f"/api/custom/download/{output_filename}",
                    "file_size": file_size,
                    "duration": slide_duration,
                    "slide_image_paths": result.get("slide_image_paths", [])  # Include slide image paths
                }
            else:
                return {
                    "success": False,
                    "error": result.get("error", "Failed to generate video from slide")
                }
                
        except Exception as e:
            logger.error(f"Failed to generate avatar slide video: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def generate_presentation_video(self,
                                        slides_props: List[Dict[str, Any]], 
                                        theme: str = "dark-purple",
                                        slide_duration: float = 5.0,
                                        quality: str = "high") -> Dict[str, Any]:
        """
        Generate video for multiple avatar slides.
        
        Args:
            slides_props: List of slide properties
            theme: Theme name
            slide_duration: Duration per slide in seconds
            quality: Video quality
            
        Returns:
            Result dict with success status and video path
        """
        try:
            if not slides_props:
                return {
                    "success": False,
                    "error": "No slides provided"
                }
            
            logger.info(f"Generating presentation video with {len(slides_props)} slides")
            
            # Import services
            from .video_assembly_service import video_assembly_service
            
            # Generate output filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"avatar_presentation_{len(slides_props)}slides_{timestamp}.mp4"
            output_path = str(self.output_dir / output_filename)
            
            # Generate video using the assembly service
            success = await video_assembly_service.create_slide_video_from_props(
                slides_props=slides_props,
                theme=theme,
                output_path=output_path,
                slide_duration=slide_duration,
                quality=quality
            )
            
            if success:
                file_size = os.path.getsize(output_path)
                total_duration = len(slides_props) * slide_duration
                
                logger.info(f"Presentation video generated: {output_path} ({file_size} bytes, {total_duration}s)")
                
                return {
                    "success": True,
                    "video_path": output_path,
                    "video_url": f"/api/custom/download/{output_filename}",
                    "file_size": file_size,
                    "duration": total_duration,
                    "slides_count": len(slides_props)
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to generate presentation video"
                }
                
        except Exception as e:
            logger.error(f"Failed to generate presentation video: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def test_pipeline(self) -> Dict[str, Any]:
        """
        Test the complete HTML → PNG → Video pipeline.
        
        Returns:
            Test result dict
        """
        try:
            logger.info("Testing clean video generation pipeline")
            
            # Test slide props
            test_slide = {
                "templateId": "avatar-checklist",
                "title": "Pipeline Test",
                "items": [
                    {"text": "HTML Generation ✓", "isPositive": True},
                    {"text": "PNG Conversion ✓", "isPositive": True},
                    {"text": "Video Assembly ✓", "isPositive": True},
                    {"text": "No UI Chrome ✓", "isPositive": True}
                ]
            }
            
            # Generate test video
            result = await self.generate_avatar_slide_video(
                slide_props=test_slide,
                theme="dark-purple",
                slide_duration=3.0,
                quality="medium"
            )
            
            if result["success"]:
                logger.info("Pipeline test successful!")
                return {
                    "success": True,
                    "message": "Clean video generation pipeline working",
                    "test_video": result["video_path"]
                }
            else:
                logger.error(f"Pipeline test failed: {result['error']}")
                return {
                    "success": False,
                    "error": f"Pipeline test failed: {result['error']}"
                }
                
        except Exception as e:
            logger.error(f"Pipeline test error: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_supported_templates(self) -> List[str]:
        """Get list of supported avatar template IDs."""
        return [
            "avatar-checklist",
            "avatar-crm", 
            "avatar-service",
            "avatar-buttons",
            "avatar-steps"
        ]
    
    async def validate_slide_props(self, slide_props: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate slide properties.
        
        Args:
            slide_props: Slide properties to validate
            
        Returns:
            Validation result
        """
        try:
            template_id = slide_props.get("templateId")
            if not template_id:
                return {
                    "valid": False,
                    "error": "Missing templateId"
                }
            
            supported_templates = await self.get_supported_templates()
            if template_id not in supported_templates:
                return {
                    "valid": False,
                    "error": f"Unsupported template: {template_id}. Supported: {supported_templates}"
                }
            
            # Import and use template service for validation
            from .html_template_service import html_template_service
            
            validated_props = html_template_service.validate_avatar_slide_props(
                template_id, slide_props
            )
            
            return {
                "valid": True,
                "validated_props": validated_props
            }
            
        except Exception as e:
            return {
                "valid": False,
                "error": str(e)
            }

# Global instance
clean_video_generation_service = CleanVideoGenerationService()
