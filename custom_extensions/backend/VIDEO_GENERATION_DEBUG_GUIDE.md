# Video Generation Debug Guide

## Overview

This guide documents the comprehensive logging and debugging implementation for the video generation pipeline. The system now provides detailed logging at every step to identify issues with text rendering and video scaling.

## 🔍 **Debugging Implementation**

### **1. Presentation Service Logging**

**File:** `app/services/presentation_service.py`

**Enhanced Logging:**
- ✅ **Request Analysis**: Logs all incoming request parameters
- ✅ **Slide Data Analysis**: Detailed breakdown of slide content and properties
- ✅ **Voiceover Text Logging**: Captures all voiceover texts being sent
- ✅ **Process Tracking**: Step-by-step progress logging
- ✅ **Error Handling**: Comprehensive error logging with context

**Key Log Tags:**
- `🎬 [PRESENTATION_PROCESSING]` - Main processing flow
- `📄 Slide Details` - Individual slide analysis
- `🎤 Voiceover Texts` - Text content logging

### **2. Elai Video Generation Service Logging**

**File:** `app/services/video_generation_service.py`

**Enhanced Logging:**
- ✅ **API Request Logging**: Full JSON payload logging
- ✅ **Avatar Selection**: Detailed avatar search and selection
- ✅ **Response Analysis**: Complete API response logging
- ✅ **Error Tracking**: Detailed error analysis

**Key Log Tags:**
- `🎬 [ELAI_VIDEO_GENERATION]` - Elai API operations
- `🎭 Avatar Selection` - Avatar configuration
- `📡 API Communication` - Request/response logging

### **3. HTML Template Service Logging**

**File:** `app/services/html_template_service.py`

**Enhanced Logging:**
- ✅ **Props Analysis**: Detailed property content logging
- ✅ **Template Rendering**: HTML generation tracking
- ✅ **Content Validation**: Template content verification

**Key Log Tags:**
- `🎬 [HTML_TEMPLATE]` - Template generation
- `📝 Props Analysis` - Property content logging
- `🌐 HTML Generation` - Template rendering

### **4. HTML to Image Service Logging**

**File:** `app/services/html_to_image_service.py`

**Enhanced Logging:**
- ✅ **Conversion Process**: Step-by-step conversion tracking
- ✅ **File Generation**: PNG file creation and validation
- ✅ **Error Analysis**: Conversion failure debugging

**Key Log Tags:**
- `🎬 [HTML_TO_IMAGE]` - Image conversion
- `🖼️ PNG Generation` - File creation
- `📊 File Analysis` - File size and validation

### **5. Video Assembly Service Logging**

**File:** `app/services/video_assembly_service.py`

**Enhanced Logging:**
- ✅ **Slide Processing**: Individual slide conversion tracking
- ✅ **PNG Generation**: File creation and validation
- ✅ **Video Assembly**: Final video creation process

**Key Log Tags:**
- `🎬 [VIDEO_ASSEMBLY]` - Video assembly process
- `📄 Slide Processing` - Individual slide handling
- `🎥 Video Creation` - Final video generation

### **6. Video Composition Service Logging**

**File:** `app/services/video_composer_service.py`

**Enhanced Logging:**
- ✅ **Input Analysis**: Video file validation and analysis
- ✅ **FFmpeg Commands**: Complete command logging
- ✅ **Output Validation**: File creation verification

**Key Log Tags:**
- `🎬 [VIDEO_COMPOSITION]` - Video composition
- `🎬 [FFMPEG_EXECUTION]` - FFmpeg command execution
- `📊 Video Analysis` - File dimensions and properties

## 🧪 **Debug Test Script**

**File:** `test_video_generation_debug.py`

**Features:**
- ✅ **Component Testing**: Individual service testing
- ✅ **Pipeline Testing**: Complete end-to-end testing
- ✅ **Comprehensive Logging**: Detailed test result logging
- ✅ **File Generation**: Debug files for inspection

**Test Components:**
1. **HTML Template Generation**: Tests template rendering
2. **HTML to PNG Conversion**: Tests image generation
3. **Video Assembly**: Tests video creation from images
4. **Elai Avatar Generation**: Tests avatar video creation
5. **Complete Pipeline**: Tests full end-to-end process

## 📊 **Data Flow Tracking**

### **Frontend to Backend Data Transfer**

1. **Slide Data Structure:**
   ```json
   {
     "templateId": "big-image-left",
     "slideId": "slide-1",
     "props": {
       "title": "Slide Title",
       "subtitle": "Slide content...",
       "imagePath": "/static_design_images/image.jpg"
     }
   }
   ```

2. **Voiceover Text Structure:**
   ```json
   {
     "voiceoverTexts": [
       "First voiceover text...",
       "Second voiceover text..."
     ]
   }
   ```

### **Backend Processing Pipeline**

1. **Presentation Service** → Receives and validates data
2. **HTML Template Service** → Generates HTML from slide data
3. **HTML to Image Service** → Converts HTML to PNG images
4. **Video Assembly Service** → Creates video from PNG images
5. **Elai Video Service** → Generates avatar videos
6. **Video Composition Service** → Merges slide and avatar videos

## 🔧 **Troubleshooting Guide**

### **Text Rendering Issues**

**Symptoms:**
- Text appears incorrect in final video
- Text styling is wrong
- Text positioning is off

**Debug Steps:**
1. Check `🎬 [HTML_TEMPLATE]` logs for props content
2. Verify `🎬 [HTML_TO_IMAGE]` logs for HTML generation
3. Inspect generated HTML files for content accuracy
4. Check PNG files for visual verification

**Common Issues:**
- Props not being passed correctly from frontend
- Template not receiving correct data
- HTML generation failing
- Image conversion losing content

### **Video Scaling Issues**

**Symptoms:**
- Avatar video too large/small
- Slide content stretched
- Poor video quality

**Debug Steps:**
1. Check `🎬 [VIDEO_COMPOSITION]` logs for dimensions
2. Verify `🎬 [FFMPEG_EXECUTION]` logs for commands
3. Analyze video file properties
4. Check Elai API response for avatar dimensions

**Common Issues:**
- Elai avatar dimensions incorrect
- FFmpeg scaling parameters wrong
- Video composition layout issues
- Resolution mismatches

### **Data Transfer Issues**

**Symptoms:**
- Missing slide content
- Wrong voiceover texts
- Template not matching

**Debug Steps:**
1. Check `🎬 [PRESENTATION_PROCESSING]` logs for request data
2. Verify frontend data structure
3. Check API endpoint parameters
4. Validate slide data format

## 📋 **Log Analysis Checklist**

### **Before Running Tests:**
- [ ] Check log level is set to INFO
- [ ] Verify all services are initialized
- [ ] Ensure test data is properly formatted
- [ ] Check file permissions for output directories

### **During Test Execution:**
- [ ] Monitor `🎬 [PRESENTATION_PROCESSING]` logs
- [ ] Check `🎬 [HTML_TEMPLATE]` for content accuracy
- [ ] Verify `🎬 [HTML_TO_IMAGE]` conversion success
- [ ] Monitor `🎬 [VIDEO_ASSEMBLY]` progress
- [ ] Check `🎬 [ELAI_VIDEO_GENERATION]` API responses
- [ ] Verify `🎬 [VIDEO_COMPOSITION]` file creation

### **After Test Completion:**
- [ ] Review generated HTML files
- [ ] Check PNG image quality
- [ ] Verify video file properties
- [ ] Analyze error logs if any
- [ ] Compare expected vs actual results

## 🚀 **Running Debug Tests**

### **1. Individual Component Testing:**
```bash
cd onyx-cutom/custom_extensions/backend
python test_video_generation_debug.py
```

### **2. Log File Analysis:**
```bash
# Check the generated log file
tail -f video_generation_debug_YYYYMMDD_HHMMSS.log
```

### **3. Generated Files Inspection:**
- `debug_slide_*_*.html` - Generated HTML templates
- `debug_slide_*_*.png` - Generated PNG images
- `debug_presentation.mp4` - Final video output

## 📈 **Performance Monitoring**

### **Key Metrics to Track:**
- **HTML Generation Time**: Template rendering performance
- **PNG Conversion Time**: Image generation speed
- **Video Assembly Time**: Video creation performance
- **Elai API Response Time**: Avatar generation speed
- **File Sizes**: Output file size analysis

### **Expected Performance:**
- HTML Generation: < 1 second per slide
- PNG Conversion: < 5 seconds per slide
- Video Assembly: < 30 seconds for 3 slides
- Elai Avatar Generation: < 60 seconds
- Total Pipeline: < 3 minutes

## 🔍 **Advanced Debugging**

### **1. HTML Content Analysis:**
```bash
# Inspect generated HTML files
cat debug_slide_1_title-slide.html
```

### **2. Image Quality Check:**
```bash
# Check PNG file properties
file debug_slide_1_title-slide.png
identify debug_slide_1_title-slide.png
```

### **3. Video Analysis:**
```bash
# Analyze video properties
ffprobe debug_presentation.mp4
```

### **4. Log Pattern Analysis:**
```bash
# Search for specific error patterns
grep "ERROR" video_generation_debug_*.log
grep "Failed" video_generation_debug_*.log
```

## 📞 **Support and Troubleshooting**

### **Common Error Patterns:**

1. **"Props not found"** → Check frontend data structure
2. **"Template rendering failed"** → Verify template files
3. **"PNG conversion failed"** → Check HTML content
4. **"Video assembly failed"** → Verify PNG files
5. **"Elai API error"** → Check API credentials and request format

### **Getting Help:**
1. Run the debug test script
2. Collect all log files
3. Gather generated HTML/PNG files
4. Document the specific issue
5. Share logs and files for analysis

---

**Last Updated:** January 2024
**Version:** 1.0
**Status:** Production Ready
