# Clean Video Generation Pipeline

## Overview

This document describes the new **HTML → PNG → Video** pipeline that replaces the problematic screenshot-based video generation system. The new pipeline generates clean, professional videos from avatar slide templates without UI chrome or browser artifacts.

## Architecture

```
Frontend Props → Static HTML Template → PNG Image → Video Assembly
     ↓                ↓                    ↓           ↓
[positions,text] → [clean slide] → [1920x1080] → [MP4 output]
```

## Key Components

### 1. HTML Template Service (`html_template_service.py`)
- Generates clean HTML from frontend props
- Supports all avatar slide templates
- Handles theme application
- No UI chrome, only slide content

### 2. HTML to PNG Service (`html_to_png_service.py`) 
- Converts HTML to high-quality PNG images
- Uses headless browser (Playwright)
- Exact 1920x1080 video dimensions
- High DPI support for crisp quality

### 3. Video Assembly Service (`video_assembly_service.py`)
- Assembles PNG images into video using FFmpeg
- Configurable slide duration
- Multiple quality settings
- Professional video encoding

### 4. Clean Video Generation Service (`clean_video_generation_service.py`)
- Orchestrates the complete pipeline
- Handles single slides and presentations
- Provides validation and error handling
- Clean API interface

## Supported Avatar Templates

- `avatar-checklist` - Question mark with checklist items
- `avatar-crm` - CRM interface layout with banner and checklist  
- `avatar-service` - Service-focused layout with title and content
- `avatar-buttons` - Title with grid of action buttons
- `avatar-steps` - Sequential steps with arrows

## API Endpoints

### Test Pipeline
```
GET /api/custom/clean-video/test
```

### Get Supported Templates
```
GET /api/custom/clean-video/templates
```

### Generate Single Avatar Slide Video
```
POST /api/custom/clean-video/avatar-slide
{
  "slideProps": {
    "templateId": "avatar-checklist",
    "title": "Professional Communication",
    "items": [
      {"text": "Listen actively", "isPositive": true},
      {"text": "Avoid interrupting", "isPositive": false}
    ]
  },
  "theme": "dark-purple",
  "slideDuration": 5.0,
  "quality": "high"
}
```

### Generate Multi-Slide Presentation
```
POST /api/custom/clean-video/presentation
{
  "slidesProps": [
    {
      "templateId": "avatar-checklist",
      "title": "Slide 1 Title",
      ...
    },
    {
      "templateId": "avatar-service", 
      "title": "Slide 2 Title",
      ...
    }
  ],
  "theme": "dark-purple",
  "slideDuration": 5.0,
  "quality": "high"
}
```

## Fixed Issues

### ✅ Avatar Selection Bug
- **Problem**: Hardcoded `'gia.casual'` avatar that may not exist
- **Solution**: Dynamic avatar fetching from ELAI API with intelligent fallbacks
- **Implementation**: Auto-selects first available avatar, prefers female avatars

### ✅ UI Chrome Artifacts  
- **Problem**: Screenshots captured browser UI, buttons, errors
- **Solution**: Clean HTML templates with no UI elements
- **Implementation**: Pure slide content rendered at exact video dimensions

### ✅ Authentication Complexity
- **Problem**: Browser-based capture required complex auth setup
- **Solution**: Direct HTML rendering without browser session
- **Implementation**: Headless browser with minimal auth requirements

### ✅ Inconsistent Framing
- **Problem**: Variable browser window sizes and UI states
- **Solution**: Fixed 1920x1080 dimensions for all output
- **Implementation**: Exact video dimensions in HTML and PNG conversion

## Quality Improvements

### High-Quality Output
- **1920x1080 resolution** - Standard Full HD video
- **25 FPS encoding** - Smooth video playback
- **Professional codecs** - H.264 with optimized settings
- **Multiple quality levels** - High, Medium, Low presets

### Performance Optimizations
- **Single render per slide** - No multiple screenshots needed
- **Efficient image processing** - Direct HTML to PNG conversion
- **Temporary file cleanup** - Automatic resource management
- **Configurable timeouts** - Prevents hanging processes

### Reliability Features
- **Comprehensive error handling** - Graceful failure modes
- **Validation pipeline** - Props validation before processing
- **Service isolation** - Independent service components
- **Logging and debugging** - Detailed operation tracking

## Testing

### Manual Testing
```bash
# Test the complete pipeline
python test_clean_video_pipeline.py

# Test with custom backend URL
python test_clean_video_pipeline.py --url http://localhost:8002
```

### API Testing
```bash
# Test pipeline availability
curl http://localhost:8002/api/custom/clean-video/test

# Get supported templates
curl http://localhost:8002/api/custom/clean-video/templates
```

## Dependencies

### Required Packages
- `playwright` - Headless browser for HTML to PNG conversion
- `ffmpeg` - Video assembly and encoding
- `jinja2` - HTML template rendering
- `aiohttp` - Async HTTP client (existing)

### Installation
```bash
# Install Python packages
pip install playwright

# Install browser
playwright install chromium

# Install FFmpeg (varies by system)
# Ubuntu: apt install ffmpeg  
# macOS: brew install ffmpeg
# Windows: Download from ffmpeg.org
```

## Configuration

### Environment Variables
- `ELAI_API_TOKEN` - For avatar video generation (existing)
- `CUSTOM_FRONTEND_URL` - Frontend URL for API calls (existing)

### File Paths
- Templates: `backend/templates/avatar_slide_template.html`
- Output: `output/clean_videos/`
- Temporary files: System temp directory (auto-cleanup)

## Migration Guide

### From Screenshot System
1. **Replace API calls** - Use new `/clean-video/` endpoints
2. **Update frontend integration** - Send props instead of URLs
3. **Test all templates** - Verify each avatar slide type
4. **Monitor performance** - Should be faster than screenshots

### Backward Compatibility
- Old presentation API endpoints remain functional
- New clean video endpoints are separate
- No breaking changes to existing functionality

## Troubleshooting

### Common Issues

#### FFmpeg Not Found
```
ERROR: FFmpeg not found in standard locations
```
**Solution**: Install FFmpeg and ensure it's in system PATH

#### Playwright Browser Missing
```
ERROR: Playwright not available - PNG generation will not work
```
**Solution**: Run `playwright install chromium`

#### Avatar Not Found
```
ERROR: Avatar with code 'gia.casual' not found
```
**Solution**: Fixed! Now auto-selects available avatar

#### Template Not Supported
```
ERROR: Unsupported template: unknown-template
```
**Solution**: Check `/api/custom/clean-video/templates` for supported types

### Performance Tuning

#### For High Volume
- Use "medium" or "low" quality settings
- Reduce slide duration for faster processing
- Scale horizontally with multiple instances

#### For Best Quality  
- Use "high" quality setting
- Ensure sufficient disk space for temporary files
- Allow longer processing times

## Future Enhancements

### Planned Features
- [ ] Custom theme support
- [ ] Variable slide dimensions
- [ ] Audio synchronization
- [ ] Transition effects between slides
- [ ] Batch processing optimization

### Integration Opportunities
- [ ] Direct avatar overlay (no green screen)
- [ ] Real-time preview generation
- [ ] Template customization API
- [ ] Video analytics and metrics
