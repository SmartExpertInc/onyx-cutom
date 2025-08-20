#!/usr/bin/env python3
"""
Video Lesson Generator Service
=============================

This module provides the main service for generating complete video lessons by orchestrating:
1. Slide image generation from component-based slide data
2. Avatar video creation using Elai API
3. Video composition with chroma key removal
4. Final video lesson assembly

Key Features:
- Complete video lesson generation workflow
- Integration with Elai API for avatar videos
- Professional video composition with chroma key
- Support for all slide template types
- Theme-aware rendering
- Progress tracking and error handling
- Batch processing for multiple slides
"""

import os
import sys
import json
import logging
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass
from pathlib import Path

# Import our services
from elai_service import ElaiAPIService, ElaiVideoConfig, ElaiVideoResult
from video_composition_service import VideoCompositionService, VideoCompositionConfig, VideoCompositionResult
from slide_image_generator import SlideImageGenerator, SlideImageConfig, SlideImageResult

# Configure logging
logger = logging.getLogger(__name__)

@dataclass
class VideoLessonConfig:
    """Configuration for video lesson generation"""
    # Slide image generation
    slide_image_width: int = 1920
    slide_image_height: int = 1080
    slide_image_format: str = "png"
    slide_background_color: str = "#ffffff"
    
    # Avatar video generation
    avatar_code: str = "gia.casual"
    voice: str = "en-US-AriaNeural"
    language: str = "English"
    avatar_background_color: str = "#00FF00"  # Green for chroma key
    avatar_scale: float = 0.1
    avatar_position: Tuple[int, int] = (510, 255)
    
    # Video composition
    output_format: str = "mp4"
    output_codec: str = "libx264"
    audio_codec: str = "aac"
    fps: int = 25
    enable_audio: bool = True
    
    # Directories
    slide_images_dir: str = "slide_images"
    avatar_videos_dir: str = "avatar_videos"
    output_videos_dir: str = "output_videos"
    temp_dir: str = "temp_videos"

@dataclass
class VideoLessonSlideResult:
    """Result for a single slide in video lesson generation"""
    slide_id: str
    slide_title: str
    slide_image_path: Optional[str] = None
    avatar_video_path: Optional[str] = None
    final_video_path: Optional[str] = None
    success: bool = False
    error_message: Optional[str] = None
    processing_time: float = 0.0

@dataclass
class VideoLessonResult:
    """Result of complete video lesson generation"""
    lesson_title: str
    slides_results: List[VideoLessonSlideResult]
    total_slides: int
    successful_slides: int
    failed_slides: int
    total_processing_time: float
    output_directory: str
    success: bool
    error_message: Optional[str] = None

class VideoLessonGenerator:
    """Main service for generating complete video lessons"""
    
    def __init__(self, config: VideoLessonConfig = None):
        """Initialize the video lesson generator."""
        self.config = config or VideoLessonConfig()
        self._ensure_directories()
        
        # Initialize services
        self.elai_service = None
        self.video_composition_service = None
        self.slide_image_generator = None
        
        logger.info("Video Lesson Generator initialized")
        logger.info(f"Configuration: {self.config}")
    
    def _ensure_directories(self):
        """Ensure all required directories exist."""
        directories = [
            self.config.slide_images_dir,
            self.config.avatar_videos_dir,
            self.config.output_videos_dir,
            self.config.temp_dir
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
            logger.info(f"Ensured directory exists: {directory}")
    
    def _initialize_services(self):
        """Initialize all required services."""
        try:
            # Initialize Elai service
            self.elai_service = ElaiAPIService(os.getenv("ELAI_API_TOKEN"))
            logger.info("Elai service initialized")
            
            # Initialize video composition service
            composition_config = VideoCompositionConfig(
                output_format=self.config.output_format,
                output_codec=self.config.output_codec,
                audio_codec=self.config.audio_codec,
                fps=self.config.fps,
                enable_audio=self.config.enable_audio,
                temp_dir=self.config.temp_dir
            )
            self.video_composition_service = VideoCompositionService(composition_config)
            logger.info("Video composition service initialized")
            
            # Initialize slide image generator
            slide_config = SlideImageConfig(
                width=self.config.slide_image_width,
                height=self.config.slide_image_height,
                format=self.config.slide_image_format,
                background_color=self.config.slide_background_color,
                output_dir=self.config.slide_images_dir
            )
            self.slide_image_generator = SlideImageGenerator(slide_config)
            logger.info("Slide image generator initialized")
            
        except Exception as e:
            logger.error(f"Error initializing services: {str(e)}")
            raise
    
    def _generate_slide_image(self, slide_data: Dict[str, Any], theme_data: Dict[str, Any] = None) -> Optional[str]:
        """
        Generate an image for a slide.
        
        Args:
            slide_data: Component-based slide data
            theme_data: Theme configuration data
            
        Returns:
            Path to generated image file, or None if failed
        """
        try:
            result = self.slide_image_generator.generate_slide_image(slide_data, theme_data)
            if result.success:
                logger.info(f"Slide image generated: {result.image_path}")
                return result.image_path
            else:
                logger.error(f"Failed to generate slide image: {result.error_message}")
                return None
        except Exception as e:
            logger.error(f"Error generating slide image: {str(e)}")
            return None
    
    def _generate_avatar_video(self, slide_title: str, voiceover_text: str) -> Optional[str]:
        """
        Generate an avatar video for a slide.
        
        Args:
            slide_title: Title of the slide
            voiceover_text: Text to be spoken by the avatar
            
        Returns:
            Path to generated video file, or None if failed
        """
        try:
            # Configure Elai video generation
            elai_config = ElaiVideoConfig(
                avatar_code=self.config.avatar_code,
                voice=self.config.voice,
                language=self.config.language,
                background_color=self.config.avatar_background_color,
                avatar_scale=self.config.avatar_scale,
                avatar_position=self.config.avatar_position
            )
            
            # Generate the video
            result = self.elai_service.create_video_for_slide(
                slide_title=slide_title,
                voiceover_text=voiceover_text,
                background_color=self.config.avatar_background_color,
                config=elai_config
            )
            
            if result.success and result.download_url:
                # The video should already be downloaded by the Elai service
                # We need to find the downloaded file
                video_filename = f"elai_slide_{result.video_id}.mp4"
                video_path = os.path.join(self.config.avatar_videos_dir, video_filename)
                
                if os.path.exists(video_path):
                    logger.info(f"Avatar video generated: {video_path}")
                    return video_path
                else:
                    logger.error(f"Avatar video file not found: {video_path}")
                    return None
            else:
                logger.error(f"Failed to generate avatar video: {result.error_message}")
                return None
                
        except Exception as e:
            logger.error(f"Error generating avatar video: {str(e)}")
            return None
    
    def _compose_final_video(self, slide_image_path: str, avatar_video_path: str, output_filename: str) -> Optional[str]:
        """
        Compose the final video by overlaying avatar on slide image.
        
        Args:
            slide_image_path: Path to slide image
            avatar_video_path: Path to avatar video
            output_filename: Name for output video file
            
        Returns:
            Path to final composed video, or None if failed
        """
        try:
            output_path = os.path.join(self.config.output_videos_dir, output_filename)
            
            result = self.video_composition_service.compose_video_with_slide(
                slide_image_path=slide_image_path,
                avatar_video_path=avatar_video_path,
                output_path=output_path
            )
            
            if result.success:
                logger.info(f"Final video composed: {result.output_path}")
                return result.output_path
            else:
                logger.error(f"Failed to compose final video: {result.error_message}")
                return None
                
        except Exception as e:
            logger.error(f"Error composing final video: {str(e)}")
            return None
    
    def generate_video_lesson(self, 
                             slide_deck: Dict[str, Any], 
                             theme_data: Dict[str, Any] = None) -> VideoLessonResult:
        """
        Generate a complete video lesson from a slide deck.
        
        Args:
            slide_deck: Component-based slide deck data
            theme_data: Theme configuration data
            
        Returns:
            VideoLessonResult with complete generation results
        """
        start_time = datetime.now()
        lesson_title = slide_deck.get('lessonTitle', 'Untitled Lesson')
        slides = slide_deck.get('slides', [])
        
        logger.info(f"Starting video lesson generation: {lesson_title}")
        logger.info(f"Processing {len(slides)} slides")
        
        # Initialize services
        self._initialize_services()
        
        slides_results = []
        successful_slides = 0
        failed_slides = 0
        
        try:
            for i, slide_data in enumerate(slides):
                slide_start_time = datetime.now()
                slide_id = slide_data.get('slideId', f'slide_{i+1}')
                slide_title = slide_data.get('slideTitle', f'Slide {i+1}')
                voiceover_text = slide_data.get('voiceoverText', '')
                
                logger.info(f"Processing slide {i+1}/{len(slides)}: {slide_title}")
                
                slide_result = VideoLessonSlideResult(
                    slide_id=slide_id,
                    slide_title=slide_title
                )
                
                try:
                    # Step 1: Generate slide image
                    logger.info(f"Step 1: Generating slide image for {slide_title}")
                    slide_image_path = self._generate_slide_image(slide_data, theme_data)
                    
                    if not slide_image_path:
                        slide_result.error_message = "Failed to generate slide image"
                        slides_results.append(slide_result)
                        failed_slides += 1
                        continue
                    
                    slide_result.slide_image_path = slide_image_path
                    
                    # Step 2: Generate avatar video
                    logger.info(f"Step 2: Generating avatar video for {slide_title}")
                    avatar_video_path = self._generate_avatar_video(slide_title, voiceover_text)
                    
                    if not avatar_video_path:
                        slide_result.error_message = "Failed to generate avatar video"
                        slides_results.append(slide_result)
                        failed_slides += 1
                        continue
                    
                    slide_result.avatar_video_path = avatar_video_path
                    
                    # Step 3: Compose final video
                    logger.info(f"Step 3: Composing final video for {slide_title}")
                    safe_title = "".join(c for c in slide_title if c.isalnum() or c in (' ', '-', '_')).rstrip()
                    output_filename = f"slide_{i+1:02d}_{safe_title}.{self.config.output_format}"
                    
                    final_video_path = self._compose_final_video(
                        slide_image_path=slide_image_path,
                        avatar_video_path=avatar_video_path,
                        output_filename=output_filename
                    )
                    
                    if not final_video_path:
                        slide_result.error_message = "Failed to compose final video"
                        slides_results.append(slide_result)
                        failed_slides += 1
                        continue
                    
                    slide_result.final_video_path = final_video_path
                    slide_result.success = True
                    successful_slides += 1
                    
                    logger.info(f"Slide {i+1} completed successfully: {final_video_path}")
                    
                except Exception as e:
                    slide_result.error_message = f"Unexpected error: {str(e)}"
                    logger.error(f"Error processing slide {i+1}: {str(e)}")
                    failed_slides += 1
                
                finally:
                    # Calculate processing time for this slide
                    slide_end_time = datetime.now()
                    slide_result.processing_time = (slide_end_time - slide_start_time).total_seconds()
                    slides_results.append(slide_result)
            
            # Calculate total processing time
            end_time = datetime.now()
            total_processing_time = (end_time - start_time).total_seconds()
            
            # Create result
            result = VideoLessonResult(
                lesson_title=lesson_title,
                slides_results=slides_results,
                total_slides=len(slides),
                successful_slides=successful_slides,
                failed_slides=failed_slides,
                total_processing_time=total_processing_time,
                output_directory=self.config.output_videos_dir,
                success=failed_slides == 0
            )
            
            logger.info(f"Video lesson generation completed:")
            logger.info(f"  - Total slides: {len(slides)}")
            logger.info(f"  - Successful: {successful_slides}")
            logger.info(f"  - Failed: {failed_slides}")
            logger.info(f"  - Total time: {total_processing_time:.2f} seconds")
            logger.info(f"  - Output directory: {self.config.output_videos_dir}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error in video lesson generation: {str(e)}")
            return VideoLessonResult(
                lesson_title=lesson_title,
                slides_results=slides_results,
                total_slides=len(slides),
                successful_slides=successful_slides,
                failed_slides=failed_slides,
                total_processing_time=(datetime.now() - start_time).total_seconds(),
                output_directory=self.config.output_videos_dir,
                success=False,
                error_message=str(e)
            )
        
        finally:
            # Cleanup
            self._cleanup()
    
    async def generate_video_lesson_async(self, 
                                        slide_deck: Dict[str, Any], 
                                        theme_data: Dict[str, Any] = None) -> VideoLessonResult:
        """
        Async version of generate_video_lesson for use in FastAPI endpoints.
        
        Args:
            slide_deck: Component-based slide deck data
            theme_data: Theme configuration data
            
        Returns:
            VideoLessonResult with complete generation results
        """
        # Run the synchronous method in a thread pool
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, 
            self.generate_video_lesson, 
            slide_deck, 
            theme_data
        )
    
    def _cleanup(self):
        """Clean up resources."""
        try:
            if self.slide_image_generator:
                self.slide_image_generator.cleanup()
            if self.video_composition_service:
                self.video_composition_service.cleanup_temp_files()
            logger.info("Cleanup completed")
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")


# Factory function to create video lesson generator
def create_video_lesson_generator(config: VideoLessonConfig = None) -> VideoLessonGenerator:
    """Create and return a video lesson generator instance."""
    return VideoLessonGenerator(config)


if __name__ == "__main__":
    # Test the generator
    try:
        generator = create_video_lesson_generator()
        
        # Test with sample slide deck data
        test_slide_deck = {
            'lessonTitle': 'Test Video Lesson',
            'slides': [
                {
                    'slideId': 'test_slide_1',
                    'slideTitle': 'Introduction',
                    'templateId': 'title-slide',
                    'props': {
                        'title': 'Welcome to the Lesson',
                        'subtitle': 'An introduction to the topic',
                        'author': 'Test Author',
                        'date': '2024-01-01'
                    },
                    'voiceoverText': 'Welcome to this lesson. Today we will explore an important topic that will help you understand the fundamentals.'
                },
                {
                    'slideId': 'test_slide_2',
                    'slideTitle': 'Key Points',
                    'templateId': 'bullet-points',
                    'props': {
                        'title': 'Key Points',
                        'bullets': [
                            'First important point with detailed explanation',
                            'Second key insight with comprehensive analysis',
                            'Third critical element with thorough examination'
                        ]
                    },
                    'voiceoverText': 'Let\'s look at the key points. First, we have an important concept to understand. Second, there\'s a critical insight that will help you succeed. And third, we need to examine this element carefully.'
                }
            ]
        }
        
        result = generator.generate_video_lesson(test_slide_deck)
        
        print(f"Video lesson generation completed:")
        print(f"  - Success: {result.success}")
        print(f"  - Total slides: {result.total_slides}")
        print(f"  - Successful: {result.successful_slides}")
        print(f"  - Failed: {result.failed_slides}")
        print(f"  - Total time: {result.total_processing_time:.2f} seconds")
        print(f"  - Output directory: {result.output_directory}")
        
        if not result.success:
            print(f"  - Error: {result.error_message}")
            
    except Exception as e:
        print(f"Test failed: {e}")
