# Professional Video Generation Pipeline Documentation

## Overview

This system provides a complete solution for creating professional video presentations by combining web-captured slides with AI avatar videos. The pipeline consists of three main components:

1. **Slide Capture Service**: Captures web slides as high-quality video
2. **Video Composition Service**: Merges slide and avatar videos with professional layouts
3. **Presentation Service**: Orchestrates the entire workflow

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   Elai API      │
│                 │    │                  │    │                 │
│ - React UI      │◄──►│ - FastAPI        │◄──►│ - Avatar Gen    │
│ - Progress      │    │ - Job Tracking   │    │ - Video Render  │
│ - Download      │    │ - File Serving   │    │ - Status Check  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Core Services  │
                    │                  │
                    │ - Slide Capture  │
                    │ - Video Compose  │
                    │ - Presentation   │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   External Tools │
                    │                  │
                    │ - Playwright     │
                    │ - FFmpeg         │
                    │ - Chrome Headless│
                    └──────────────────┘
```

## Components

### 1. Slide Capture Service (`slide_capture_service.py`)

**Purpose**: Captures web slides as high-quality video using Playwright and Chrome headless.

**Key Features**:
- Headless browser automation with Playwright
- High-quality video output (1920x1080, 30fps)
- Professional encoding with FFmpeg
- Resource waiting (fonts, images, animations)
- Configurable quality settings

**Usage**:
```python
from app.services.slide_capture_service import slide_capture_service, SlideVideoConfig

config = SlideVideoConfig(
    slide_url="https://example.com/slide",
    duration=30.0,
    width=1920,
    height=1080,
    frame_rate=30,
    quality='high'
)

video_path = await slide_capture_service.capture_slide_video(config)
```

### 2. Video Composition Service (`video_composer_service.py`)

**Purpose**: Merges slide and avatar videos with professional layouts using FFmpeg.

**Supported Layouts**:
- **Side-by-side**: Slide and avatar side by side
- **Picture-in-picture**: Avatar overlay on slide
- **Split screen**: Custom split ratios

**Key Features**:
- Professional color correction
- Audio processing and mixing
- Optimized encoding settings
- Web-streaming optimization
- Thumbnail generation

**Usage**:
```python
from app.services.video_composer_service import video_composer_service, CompositionConfig

config = CompositionConfig(
    output_path="output.mp4",
    resolution=(1920, 1080),
    quality='high',
    layout='side_by_side'
)

final_video = await video_composer_service.compose_presentation(
    slide_video_path,
    avatar_video_path,
    config
)
```

### 3. Presentation Service (`presentation_service.py`)

**Purpose**: Orchestrates the complete video generation workflow.

**Key Features**:
- Job tracking and progress monitoring
- Background processing
- Error handling and recovery
- File management and cleanup
- Status reporting

**Usage**:
```python
from app.services.presentation_service import presentation_service, PresentationRequest

request = PresentationRequest(
    slide_url="https://example.com/slide",
    voiceover_texts=["Welcome to our presentation"],
    avatar_code="gia.casual",
    duration=30.0,
    layout="side_by_side",
    quality="high"
)

job_id = await presentation_service.create_presentation(request)
```

## API Endpoints

### Create Presentation
```http
POST /api/custom/presentations
Content-Type: application/json

{
  "slideUrl": "https://example.com/slide",
  "voiceoverTexts": ["Welcome to our presentation"],
  "avatarCode": "gia.casual",
  "duration": 30.0,
  "layout": "side_by_side",
  "quality": "high",
  "resolution": [1920, 1080],
  "projectName": "My Presentation"
}
```

**Response**:
```json
{
  "success": true,
  "jobId": "uuid-here",
  "message": "Presentation generation started"
}
```

### Get Job Status
```http
GET /api/custom/presentations/{job_id}
```

**Response**:
```json
{
  "success": true,
  "jobId": "uuid-here",
  "status": "processing",
  "progress": 45.0,
  "error": null,
  "videoUrl": "/api/custom/presentations/{job_id}/video",
  "thumbnailUrl": "/api/custom/presentations/{job_id}/thumbnail",
  "createdAt": "2024-01-01T12:00:00Z",
  "completedAt": null
}
```

### Download Video
```http
GET /api/custom/presentations/{job_id}/video
```

### Get Thumbnail
```http
GET /api/custom/presentations/{job_id}/thumbnail
```

## Frontend Integration

### Professional Video Presentation Button

The `ProfessionalVideoPresentationButton` component provides a complete UI for creating professional videos:

```tsx
import { ProfessionalVideoPresentationButton } from './ProfessionalVideoPresentationButton';

<ProfessionalVideoPresentationButton
  projectName="My Presentation"
  onError={(error) => console.error(error)}
  onSuccess={(jobId, videoUrl) => console.log('Video ready:', videoUrl)}
  onProgress={(progress, status) => console.log(`${progress}% - ${status}`)}
/>
```

**Features**:
- Automatic voiceover text extraction
- Progress tracking with visual feedback
- Preview and download functionality
- Error handling and recovery
- Job status monitoring

## Installation and Setup

### 1. Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements-professional-video.txt

# Install Playwright browsers
playwright install chromium

# Install FFmpeg (system dependent)
# Ubuntu/Debian: sudo apt install ffmpeg
# macOS: brew install ffmpeg
# Windows: Download from https://ffmpeg.org/download.html
```

### 2. Environment Variables

```bash
# Elai API configuration
ELAI_API_TOKEN=your_elai_api_token

# Backend configuration
CUSTOM_PROJECTS_DATABASE_URL=your_database_url
ONYX_DATABASE_URL=your_onyx_database_url
```

### 3. Directory Structure

```
custom_extensions/
├── backend/
│   ├── app/
│   │   └── services/
│   │       ├── slide_capture_service.py
│   │       ├── video_composer_service.py
│   │       ├── presentation_service.py
│   │       └── video_generation_service.py
│   ├── main.py
│   └── requirements-professional-video.txt
├── frontend/
│   └── src/
│       └── components/
│           └── ProfessionalVideoPresentationButton.tsx
└── output/
    └── presentations/
```

## Quality Settings

### Video Quality Presets

| Quality | CRF | Preset | Use Case |
|---------|-----|--------|----------|
| High    | 18  | slow   | Professional presentations |
| Medium  | 23  | medium | Standard quality |
| Low     | 28  | fast   | Quick previews |

### Resolution Options

- **Full HD**: 1920x1080 (recommended)
- **HD**: 1280x720
- **4K**: 3840x2160 (high-end)

### Layout Options

1. **Side-by-side**: Professional split layout
2. **Picture-in-picture**: Avatar overlay
3. **Split screen**: Custom ratios (70/30, 60/40)

## Performance Optimization

### 1. Browser Optimization

The slide capture service uses optimized Chrome settings:
- Hardware acceleration enabled
- Background throttling disabled
- Memory optimization
- GPU acceleration

### 2. Video Processing

- Async processing with background tasks
- Temporary file cleanup
- Progress tracking
- Error recovery

### 3. File Management

- Automatic cleanup of temporary files
- Job-based file organization
- Configurable retention policies

## Error Handling

### Common Issues and Solutions

1. **Playwright Installation**
   ```bash
   playwright install chromium
   ```

2. **FFmpeg Not Found**
   ```bash
   # Install FFmpeg for your system
   sudo apt install ffmpeg  # Ubuntu/Debian
   brew install ffmpeg      # macOS
   ```

3. **Memory Issues**
   - Reduce video quality settings
   - Use shorter durations
   - Increase system memory

4. **Network Timeouts**
   - Increase timeout settings
   - Check network connectivity
   - Verify slide URLs

## Testing

### Run Test Suite

```bash
python test_professional_video_pipeline.py
```

**Test Coverage**:
- Slide capture service
- Video composition service
- Presentation service
- Full pipeline integration

### Manual Testing

1. **Slide Capture Test**:
   ```python
   # Test with local HTML file
   config = SlideVideoConfig(
       slide_url="file:///path/to/test.html",
       duration=5.0
   )
   ```

2. **Composition Test**:
   ```python
   # Test with sample videos
   config = CompositionConfig(
       output_path="test_output.mp4",
       layout="side_by_side"
   )
   ```

## Production Deployment

### Docker Configuration

```dockerfile
FROM python:3.11-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    wget \
    gnupg \
    ca-certificates

# Install Playwright
RUN pip install playwright
RUN playwright install chromium

# Copy application
COPY . /app
WORKDIR /app

# Install Python dependencies
RUN pip install -r requirements-professional-video.txt

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Monitoring

- Job status tracking
- Progress monitoring
- Error logging
- Performance metrics

### Scaling

- Horizontal scaling with load balancers
- Queue-based processing
- Distributed file storage
- Caching strategies

## Troubleshooting

### Debug Mode

Enable detailed logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Common Logs

- `Slide capture started`: Browser initialization
- `Video captured`: Slide video creation
- `Composition started`: Video merging
- `Presentation completed`: Final output ready

### Performance Issues

1. **Slow Processing**:
   - Reduce video quality
   - Use faster presets
   - Optimize slide content

2. **Memory Usage**:
   - Monitor system resources
   - Implement cleanup
   - Use streaming for large files

## Future Enhancements

### Planned Features

1. **Advanced Layouts**:
   - Custom positioning
   - Multiple avatar support
   - Dynamic transitions

2. **Quality Improvements**:
   - AI-powered content analysis
   - Automatic timing optimization
   - Professional effects

3. **Integration**:
   - LMS platform support
   - Cloud storage integration
   - Real-time collaboration

### API Extensions

- Batch processing
- Template management
- Custom branding
- Analytics and metrics

## Support

For technical support and questions:
- Check the troubleshooting section
- Review error logs
- Test with sample content
- Contact development team

## License

This system is part of the ContentBuilder.ai platform and follows the same licensing terms.
