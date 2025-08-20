# Video Lesson Generation System

This document describes the implementation of a comprehensive video lesson generation system that uses the Elai API to create AI avatar videos and combines them with slide backgrounds to produce professional video lessons.

## Overview

The system implements a complete workflow for creating video lessons with AI avatars:

1. **Slide Image Generation**: Converts component-based slides to static images
2. **Avatar Video Generation**: Creates AI avatar videos with voiceover using Elai API
3. **Video Composition**: Combines slide images with avatar videos using chroma key removal
4. **Final Video Assembly**: Produces a complete video lesson file

## Architecture

### Backend Services

#### 1. Elai API Service (`elai_service.py`)
- **Purpose**: Handles communication with the Elai API for avatar video generation
- **Key Features**:
  - Create videos with AI avatars on green screen backgrounds
  - Monitor rendering progress
  - Download completed videos
  - Support for multiple avatar types and voices
  - Error handling and retry logic

#### 2. Video Composition Service (`video_composition_service.py`)
- **Purpose**: Handles video composition and chroma key removal
- **Key Features**:
  - Chroma key (green screen) removal from avatar videos
  - Composite video creation with slide backgrounds
  - Audio preservation from avatar videos
  - Professional video processing with OpenCV and MoviePy
  - Support for multiple video formats and resolutions

#### 3. Slide Image Generator (`slide_image_generator.py`)
- **Purpose**: Converts component-based slides to static images
- **Key Features**:
  - Convert component-based slides to static images
  - Support for all slide template types
  - Theme-aware rendering
  - High-quality image output
  - Background color customization

#### 4. Video Lesson Generator (`video_lesson_generator.py`)
- **Purpose**: Orchestrates the complete video lesson generation process
- **Key Features**:
  - Complete video lesson generation workflow
  - Integration with Elai API for avatar videos
  - Professional video composition with chroma key
  - Support for all slide template types
  - Theme-aware rendering
  - Progress tracking and error handling
  - Batch processing for multiple slides

### API Endpoints

#### Video Generation Endpoints

1. **POST `/api/custom/video-lesson/generate-avatar`**
   - Generates avatar videos for slides using Elai API
   - Parameters: project_id, slide_id (optional), avatar_code, voice, background_color, etc.
   - Returns: Video generation status and progress URL

2. **GET `/api/custom/video-lesson/progress/{project_id}`**
   - Monitors video generation progress
   - Returns: Current status of all video generation tasks

3. **POST `/api/custom/video-lesson/compose`**
   - Composes final video lesson by combining slide images with avatar videos
   - Parameters: project_id, slide_ids, avatar_scale, output_format
   - Returns: Composition status and video file information

4. **GET `/api/custom/video-lesson/download/{project_id}`**
   - Downloads the completed video lesson file
   - Returns: Video file for download

### Frontend Components

#### VideoLessonGenerator Component
- **Location**: `frontend/src/components/VideoLessonGenerator.tsx`
- **Purpose**: Provides user interface for video lesson generation
- **Features**:
  - Avatar and voice selection
  - Background color customization
  - Slide selection interface
  - Real-time progress monitoring
  - Video download functionality
  - Error handling and user feedback

## Installation and Setup

### Prerequisites

1. **Python Dependencies**
   ```bash
   pip install -r requirements_video_lesson.txt
   ```

2. **Environment Variables**
   ```bash
   # Elai API Configuration
   ELAI_API_TOKEN=your_elai_api_token_here
   ELAI_BASE_URL=https://api.elai.io
   
   # Database Configuration
   CUSTOM_PROJECTS_DATABASE_URL=your_database_url
   ```

3. **Database Setup**
   ```sql
   -- Run the migration script
   \i create_video_tasks_table.sql
   ```

### System Requirements

- **Python**: 3.8+
- **OpenCV**: For video processing
- **MoviePy**: For video editing and composition
- **Pillow**: For image processing
- **FFmpeg**: For video encoding (system dependency)

## Usage

### 1. Create a Video Lesson Project

1. Navigate to the video lesson creation interface
2. Select slides for video generation
3. Choose avatar and voice settings
4. Configure background color and avatar scale

### 2. Generate Avatar Videos

1. Click "Generate Avatar Videos" button
2. Monitor progress in real-time
3. Wait for all videos to complete rendering

### 3. Compose Final Video

1. Click "Compose Final Video" button
2. System downloads avatar videos and generates slide images
3. Combines videos using chroma key removal
4. Produces final video lesson file

### 4. Download Video

1. Click "Download" button
2. Video lesson file is downloaded to your device

## Configuration

### Avatar Options

The system supports multiple avatar types:

- **Female Avatars**: Gia, Anna, Lisa
- **Male Avatars**: John, Mike, David

### Voice Options

Multiple voice options are available:

- **US English**: Jenny, Guy
- **UK English**: Sonia, Ryan
- **Other Languages**: Spanish, French, German

### Video Settings

- **Resolution**: 1920x1080 (default)
- **Format**: MP4 (default)
- **Background**: Green screen (#00FF00) for chroma key removal
- **Avatar Scale**: 0.5 to 1.5 (default: 0.8)

## Technical Details

### Video Processing Pipeline

1. **Slide to Image Conversion**
   - Parse component-based slide data
   - Generate static images using theme templates
   - Save images in high resolution

2. **Avatar Video Generation**
   - Send voiceover text to Elai API
   - Configure avatar and voice settings
   - Monitor rendering progress
   - Download completed videos

3. **Chroma Key Removal**
   - Load avatar video with green screen background
   - Apply chroma key filter to remove green background
   - Create alpha mask for transparency

4. **Video Composition**
   - Overlay avatar video on slide image
   - Preserve audio from avatar video
   - Scale and position avatar as needed
   - Export final composite video

5. **Video Assembly**
   - Concatenate multiple slide videos
   - Maintain audio synchronization
   - Create final video lesson file

### Error Handling

The system includes comprehensive error handling:

- **API Failures**: Retry logic for Elai API calls
- **Video Processing**: Fallback options for failed compositions
- **File Operations**: Proper cleanup of temporary files
- **User Feedback**: Clear error messages and status updates

### Performance Optimization

- **Parallel Processing**: Multiple videos can be generated simultaneously
- **Caching**: Slide images are cached to avoid regeneration
- **Progress Tracking**: Real-time updates on generation progress
- **Resource Management**: Efficient memory usage for video processing

## Troubleshooting

### Common Issues

1. **Elai API Errors**
   - Verify API token is valid
   - Check API rate limits
   - Ensure voiceover text is not empty

2. **Video Processing Failures**
   - Verify FFmpeg is installed
   - Check available disk space
   - Ensure video files are not corrupted

3. **Chroma Key Issues**
   - Verify background color is pure green (#00FF00)
   - Check lighting conditions in avatar videos
   - Adjust chroma key sensitivity if needed

### Debug Mode

Enable debug logging by setting:
```bash
export LOG_LEVEL=DEBUG
```

## API Reference

### Request Models

```typescript
interface VideoGenerationRequest {
  project_id: string;
  slide_id?: string;
  avatar_code: string;
  voice: string;
  background_color: string;
  language: string;
  video_format: string;
  resolution: string;
}

interface VideoCompositionRequest {
  project_id: string;
  slide_ids: string[];
  avatar_scale: number;
  avatar_position?: [number, number];
  output_format: string;
}
```

### Response Models

```typescript
interface VideoGenerationResponse {
  success: boolean;
  video_id?: string;
  message: string;
  progress_url?: string;
}

interface VideoCompositionResponse {
  success: boolean;
  video_path?: string;
  duration?: number;
  file_size?: number;
  message: string;
}
```

## Future Enhancements

### Planned Features

1. **Advanced Video Effects**
   - Transitions between slides
   - Custom animations
   - Background music integration

2. **Enhanced Avatar Options**
   - Custom avatar uploads
   - Gesture and expression control
   - Multiple avatars per video

3. **Performance Improvements**
   - GPU acceleration for video processing
   - Distributed rendering
   - Cloud storage integration

4. **User Experience**
   - Video preview functionality
   - Template customization
   - Batch processing interface

## Support

For technical support or questions about the video lesson generation system:

1. Check the troubleshooting section above
2. Review the API documentation
3. Contact the development team
4. Submit issues through the project repository

## License

This video lesson generation system is part of the ContentBuilder.ai platform and is subject to the same licensing terms.
