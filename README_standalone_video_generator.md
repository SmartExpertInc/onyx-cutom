# Standalone Video Generator - Proof of Concept

## 🎬 Overview

This standalone Python console application demonstrates the complete video generation and merging workflow that combines static slide content with AI avatar videos. It serves as a proof-of-concept for the video creation logic before integration into the main project.

## 🚀 Features

- **Slide Video Creation**: Converts static images to video using FFmpeg
- **AI Avatar Generation**: Creates avatar videos using the Elai API
- **Video Merging**: Combines slide and avatar videos with chroma key overlay
- **Professional Output**: High-quality final videos with proper audio
- **Comprehensive Logging**: Detailed progress tracking and error reporting

## 📋 Requirements

### System Requirements
- **Python 3.7+**
- **FFmpeg** installed and available in PATH
- **Internet connection** for Elai API access

### Python Dependencies
```bash
pip install -r requirements_standalone.txt
```

Or install manually:
```bash
pip install aiohttp requests
```

## 🔧 Installation

### 1. Install FFmpeg

**Windows:**
- Download from [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html)
- Add to system PATH

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**CentOS/RHEL:**
```bash
sudo yum install ffmpeg
```

### 2. Install Python Dependencies
```bash
pip install -r requirements_standalone.txt
```

### 3. Verify Installation
```bash
python standalone_video_generator.py --help
```

## 🎯 Usage

### Basic Usage
```bash
python standalone_video_generator.py <input_image_path>
```

### Example
```bash
python standalone_video_generator.py slide_image.jpg
```

### Input Requirements
- **Supported formats**: JPG, PNG, BMP, GIF, TIFF
- **Recommended resolution**: 1920x1080 or higher
- **File size**: Reasonable size (under 10MB recommended)

## 🔄 Workflow

The script performs the following steps:

### Step 1: Slide Video Creation
- Takes input image
- Creates a 10-second video loop using FFmpeg
- Scales and pads to 1920x1080 resolution
- Outputs MP4 format

### Step 2: Avatar Video Generation
- Fetches available avatars from Elai API
- Selects the second avatar from the list
- Creates avatar video with hardcoded voiceover text
- Uses green background for chroma key removal

### Step 3: Video Merging
- Applies chroma key filter to remove green background
- Overlays avatar video on slide video
- Positions avatar in bottom-right corner
- Maintains audio from avatar video

### Step 4: Final Output
- Saves final video to `output/` directory
- Cleans up temporary files
- Provides detailed logging

## 📁 Output Structure

```
project/
├── standalone_video_generator.py
├── requirements_standalone.txt
├── output/
│   └── final_video_YYYYMMDD_HHMMSS.mp4
├── temp/
│   ├── slide_video_YYYYMMDD_HHMMSS.mp4
│   └── avatar_video_VIDEOID_YYYYMMDD_HHMMSS.mp4
└── video_generator_YYYYMMDD_HHMMSS.log
```

## ⚙️ Configuration

### Video Settings
```python
# In standalone_video_generator.py
self.slide_duration = 10.0  # seconds
self.video_resolution = (1920, 1080)
self.frame_rate = 30
```

### Voiceover Text
```python
self.voiceover_text = """
Welcome to this demonstration of our AI video generation system. 
This technology combines static slide content with dynamic AI avatars 
to create engaging presentations. The system seamlessly merges 
visual content with natural speech synthesis for professional results.
"""
```

### Avatar Selection
```python
def select_avatar(self, avatars):
    # Selects the second avatar from the list
    return avatars[1] if len(avatars) > 1 else avatars[0]
```

## 🔍 Troubleshooting

### Common Issues

**1. FFmpeg not found**
```
❌ FFmpeg not found in PATH
```
**Solution**: Install FFmpeg and add to system PATH

**2. Elai API errors**
```
❌ Failed to fetch avatars: 401 - Unauthorized
```
**Solution**: Check API token in the script

**3. Input image not found**
```
❌ Input image not found: slide_image.jpg
```
**Solution**: Verify file path and permissions

**4. Video rendering timeout**
```
❌ Video rendering failed or timed out
```
**Solution**: Check internet connection and Elai API status

### Debug Mode
Enable detailed logging by modifying the logging level:
```python
logging.basicConfig(level=logging.DEBUG)
```

## 📊 Performance

### Typical Processing Times
- **Slide video creation**: 5-10 seconds
- **Avatar video generation**: 2-5 minutes (Elai API dependent)
- **Video merging**: 30-60 seconds
- **Total workflow**: 3-7 minutes

### File Sizes
- **Input image**: 1-5 MB
- **Slide video**: 2-5 MB
- **Avatar video**: 10-30 MB
- **Final video**: 15-40 MB

## 🔒 Security

### API Token
The script includes a hardcoded Elai API token for demonstration purposes. In production:
- Store tokens in environment variables
- Use secure credential management
- Implement proper authentication

### File Handling
- Validates input files
- Creates temporary directories
- Cleans up temporary files
- Uses secure file operations

## 🧪 Testing

### Test Scenarios
1. **Valid image input**: Should complete successfully
2. **Invalid image**: Should fail gracefully
3. **Network issues**: Should handle API failures
4. **FFmpeg errors**: Should provide clear error messages

### Test Commands
```bash
# Test with sample image
python standalone_video_generator.py test_image.jpg

# Test error handling
python standalone_video_generator.py nonexistent.jpg
```

## 📈 Monitoring

### Log Files
- **Location**: `video_generator_YYYYMMDD_HHMMSS.log`
- **Content**: Detailed progress, errors, and timing
- **Retention**: Manual cleanup required

### Key Metrics
- Processing time per step
- File sizes and quality
- API response times
- Error rates and types

## 🔄 Integration

### Main Project Integration
This standalone script demonstrates the core logic that can be integrated into the main project:

1. **Slide capture service**: Replace FFmpeg with Playwright
2. **Avatar generation**: Use existing Elai API service
3. **Video merging**: Adapt FFmpeg commands for production
4. **Error handling**: Implement robust fallback mechanisms

### API Integration Points
- Elai API for avatar generation
- FFmpeg for video processing
- File system for input/output
- Logging for monitoring

## 🎉 Success Criteria

A successful run should produce:
- ✅ Slide video from input image
- ✅ Avatar video from Elai API
- ✅ Merged final video with overlay
- ✅ Professional quality output
- ✅ Complete logging and cleanup

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review log files for detailed errors
3. Verify system requirements
4. Test with different input images

## 📄 License

This script is provided as a proof-of-concept demonstration. Use at your own risk and ensure compliance with Elai API terms of service.
