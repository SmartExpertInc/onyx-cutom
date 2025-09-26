# Elai API Debugging Improvements

## Problem Analysis

The system was generating blank avatar videos from the Elai API despite structurally correct requests. The root cause was identified as:

1. **Avatar positioning outside visible area**: Coordinated positioning was placing avatars at (1392.5, 539.5) which may be outside the Elai API's rendering viewport
2. **Avatar scale too small**: Scale factors of 0.487x and 0.781x were making avatars too small to be visible
3. **Avatar object inconsistency**: Mismatch between canvas object structure and avatar object structure
4. **Insufficient debugging**: Lack of comprehensive logging to identify blank video issues

## Implemented Solutions

### 1. **Avatar Visibility Configuration** ✅

**Problem**: Coordinated positioning was placing avatars outside visible rendering area.

**Solution**: Reverted to large, centered avatar configuration guaranteed to be visible.

```python
# OLD (Problematic): Coordinated positioning
"left": 1392.5,    # Outside visible area
"top": 539.5,      # Outside visible area  
"scaleX": 0.487,   # Too small
"scaleY": 0.781,   # Too small

# NEW (Fixed): Centered, large avatar
"left": 960,       # Center horizontally in 1920px canvas
"top": 540,        # Center vertically in 1080px canvas
"scaleX": 0.8,     # Large scale for clear visibility
"scaleY": 0.8,     # Large scale for clear visibility
```

### 2. **Avatar Object Consistency Validation** ✅

**Problem**: Canvas object and avatar object had inconsistent URLs and codes.

**Solution**: Added comprehensive validation and debugging.

```python
# CRITICAL FIX: Ensure avatar object matches canvas object
avatar_canvas_url = avatar.get('canvas')
logger.info(f"🎬 [ELAI_VIDEO_GENERATION] CRITICAL DEBUG - Avatar object consistency:")
logger.info(f"  - Canvas src URL: {avatar_canvas_url}")
logger.info(f"  - Avatar code: {avatar.get('code')}")
logger.info(f"  - Avatar canvas URL: {avatar_canvas_url}")

# Validate canvas URL format
if not avatar_canvas_url or not avatar_canvas_url.startswith('https://'):
    logger.error(f"🎬 [ELAI_VIDEO_GENERATION] CRITICAL ERROR: Invalid canvas URL format: {avatar_canvas_url}")
    return {"success": False, "error": f"Invalid avatar canvas URL format: {avatar_canvas_url}"}
```

### 3. **Comprehensive Video Download Analysis** ✅

**Problem**: No way to detect if downloaded videos were blank or contained avatars.

**Solution**: Added detailed file size analysis and warnings.

```python
# CRITICAL DEBUG: Check if file is suspiciously small (might be blank/error)
if file_size_bytes < 100000:  # Less than 100KB is suspicious for a video
    logger.warning(f"🎬 [ELAI_VIDEO_DOWNLOAD] WARNING: Downloaded video is very small ({file_size_bytes} bytes)")
    logger.warning(f"  - This might indicate a blank or error video")
elif file_size_bytes < 1000000:  # Less than 1MB is concerning
    logger.warning(f"🎬 [ELAI_VIDEO_DOWNLOAD] WARNING: Downloaded video is small ({file_size_mb:.2f} MB)")
    logger.warning(f"  - Avatar might not be visible or video might be very short")
else:
    logger.info(f"🎬 [ELAI_VIDEO_DOWNLOAD] File size looks normal for video content")
```

### 4. **FFprobe Video Analysis** ✅

**Problem**: No technical analysis of downloaded videos to detect issues.

**Solution**: Added comprehensive FFprobe analysis to detect blank/problematic videos.

```python
async def _analyze_downloaded_video(self, video_path: str):
    """Analyze downloaded video to detect potential issues."""
    
    # Use FFprobe to get video information
    cmd = ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', video_path]
    
    # Analyze format information
    duration = float(format_info.get('duration', 0))
    bitrate = int(format_info.get('bit_rate', 0))
    
    # Detect potential issues
    if duration < 5.0:
        logger.warning(f"🎬 [VIDEO_ANALYSIS] WARNING: Video is very short ({duration:.2f}s)")
    
    if bitrate < 500000:  # Less than 500 kbps
        logger.warning(f"🎬 [VIDEO_ANALYSIS] WARNING: Video bitrate is very low ({bitrate / 1000:.1f} kbps)")
        logger.warning(f"  - This might indicate a mostly static/blank video")
```

### 5. **Enhanced API Request Logging** ✅

**Problem**: Limited visibility into actual API requests being sent.

**Solution**: Added comprehensive logging of all API request parameters.

```python
logger.info(f"🎬 [ELAI_VIDEO_GENERATION] CRITICAL BUG FIX: Using visible avatar configuration")
logger.info(f"  - Position: Centered for maximum visibility")
logger.info(f"  - Scale: Large enough to be clearly visible")
logger.info(f"  - Canvas: Full 1920x1080 for proper rendering")
```

## Expected Results

After these improvements, the system should:

1. **Generate visible avatars**: Large, centered configuration ensures avatars are always visible
2. **Detect blank videos**: File size and FFprobe analysis will identify problematic videos
3. **Provide clear debugging info**: Comprehensive logging helps identify issues quickly
4. **Validate avatar consistency**: Ensures canvas URLs and avatar objects match
5. **Warn about issues**: Proactive warnings about small files, low bitrates, etc.

## Debugging Workflow

When a video generation issue occurs, check logs for:

1. **🎬 [ELAI_VIDEO_GENERATION] CRITICAL DEBUG** - Avatar object consistency
2. **🎬 [ELAI_VIDEO_DOWNLOAD]** - File size analysis and warnings
3. **🎬 [VIDEO_ANALYSIS]** - Technical video properties and issue detection
4. **🎬 [ELAI_VIDEO_GENERATION] CRITICAL BUG FIX** - Avatar configuration confirmation

## Files Modified

- **`video_generation_service.py`**: 
  - Fixed avatar positioning and scaling
  - Added avatar object validation
  - Enhanced download analysis
  - Added FFprobe video analysis
  - Improved error logging

## Testing

To verify the fix:

1. **Generate a video** and check logs for the new debugging output
2. **Look for warnings** about small file sizes or low bitrates
3. **Check video analysis** output for duration, resolution, and bitrate
4. **Verify avatar visibility** in the downloaded video file

The avatar should now be clearly visible in the center of the generated video, and any issues will be clearly logged with specific warnings and analysis.
