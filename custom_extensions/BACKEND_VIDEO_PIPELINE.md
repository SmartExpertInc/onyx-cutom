# Backend Video Generation Pipeline - Technical Deep Dive

## Table of Contents
1. [Overview](#overview)
2. [Architecture Components](#architecture-components)
3. [Phase 1: Slide Rendering](#phase-1-slide-rendering-html-to-video)
4. [Phase 2: Avatar Video Generation](#phase-2-avatar-video-generation-elai-api)
5. [Phase 3: Video Composition](#phase-3-video-composition-opencv-overlay)
6. [Phase 4: Video Concatenation](#phase-4-video-concatenation-with-transitions)
7. [FFmpeg Operations](#ffmpeg-operations-in-depth)
8. [Complete Flow Diagrams](#complete-flow-diagrams)
9. [Performance Optimization](#performance-optimization)
10. [Error Handling](#error-handling-and-recovery)

---

## Overview

The ContentBuilder.ai backend video generation pipeline is a sophisticated multi-stage system that transforms slide templates and AI-generated voiceovers into professional presentation videos. The pipeline consists of four main phases:

1. **Slide Rendering** - Convert HTML/CSS templates to video frames
2. **Avatar Generation** - Create AI avatar videos via Elai API
3. **Video Composition** - Overlay avatar videos onto slide videos using OpenCV
4. **Video Concatenation** - Combine multiple slides with transitions using FFmpeg

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **HTML Rendering** | Playwright / html2image | Convert slides to PNG images |
| **Image-to-Video** | FFmpeg | Convert PNG sequences to video |
| **AI Avatar** | Elai API | Generate realistic avatar voiceovers |
| **Video Composition** | OpenCV (cv2) | Frame-by-frame avatar overlay |
| **Video Effects** | FFmpeg xfade filter | Transition effects between slides |
| **Audio Processing** | FFmpeg acrossfade | Audio crossfading |
| **Orchestration** | Python asyncio | Concurrent video generation |

---

## Architecture Components

### Service Layer Structure

```
backend/app/services/
├── presentation_service.py         # Main orchestrator
├── html_template_service.py        # HTML template generation
├── html_to_image_service.py        # HTML → PNG conversion
├── video_assembly_service.py       # PNG → Video conversion
├── video_generation_service.py     # Elai API integration
├── simple_video_composer.py        # OpenCV video composition
└── avatar_mask_service.py          # Avatar masking utilities
```

### Core Services

#### 1. **ProfessionalPresentationService**
- **File:** `presentation_service.py`
- **Role:** Main orchestrator coordinating all video generation phases
- **Key Methods:**
  - `generate_presentation()` - Entry point for multi-slide presentations
  - `_process_single_slide_presentation()` - Single slide workflow
  - `_initiate_all_avatar_videos()` - Batch avatar generation
  - `_concatenate_videos_with_transitions()` - Final video assembly

#### 2. **HTMLTemplateService**
- **File:** `html_template_service.py`
- **Role:** Generate clean HTML from slide templates
- **Key Methods:**
  - `generate_clean_html_for_video()` - Create video-optimized HTML
  - `generate_avatar_slide_html()` - Render slide with props

#### 3. **HTMLToImageService**
- **File:** `html_to_image_service.py`
- **Role:** Convert HTML to PNG images
- **Supported Methods:**
  - Playwright (preferred)
  - html2image
  - imgkit
  - weasyprint

#### 4. **VideoAssemblyService**
- **File:** `video_assembly_service.py`
- **Role:** Create videos from PNG sequences
- **Key Methods:**
  - `create_video_from_pngs()` - FFmpeg PNG-to-video conversion

#### 5. **VideoGenerationService**
- **File:** `video_generation_service.py`
- **Role:** Elai API integration for avatar videos
- **Key Methods:**
  - `create_video_from_texts()` - Generate avatar video
  - `wait_for_video_completion()` - Poll Elai API for completion

#### 6. **SimpleVideoComposer**
- **File:** `simple_video_composer.py`
- **Role:** OpenCV-based frame-by-frame video composition
- **Key Methods:**
  - `compose_videos_simple()` - Main composition entry point
  - `_compose_frames()` - Frame processing loop
  - `_apply_circular_mask()` - Circular avatar masking
  - `_apply_arch_mask()` - Arch-shaped avatar masking

---

## Phase 1: Slide Rendering (HTML to Video)

### Process Flow

```
Slide Data → HTML Template → PNG Image → Video File
    ↓            ↓              ↓            ↓
  Props    Jinja2 Render   Playwright   FFmpeg
```

### Step 1: HTML Template Generation

**Service:** `HTMLTemplateService`

**Process:**
1. Receive slide data from frontend (templateId, props, theme)
2. Validate and normalize props
3. Render Jinja2 template with props
4. Generate clean HTML optimized for video

**Code Example:**
```python
# html_template_service.py
async def generate_clean_html_for_video(
    self, 
    template_id: str, 
    props: Dict[str, Any], 
    theme: str = "dark-purple"
) -> str:
    """Generate clean HTML optimized for video generation."""
    
    # Validate and normalize props
    validated_props = self.validate_avatar_slide_props(template_id, props)
    
    # Generate HTML with validated props
    html_content = self.generate_avatar_slide_html(
        template_id, 
        validated_props, 
        theme
    )
    
    return html_content
```

**HTML Output Structure:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            width: 1920px; 
            height: 1080px; 
            overflow: hidden;
        }
        /* Template-specific styles */
    </style>
</head>
<body>
    <!-- Rendered slide content -->
    <div class="slide-container">
        <!-- Dynamic content based on template -->
    </div>
</body>
</html>
```

### Step 2: HTML to PNG Conversion

**Service:** `HTMLToImageService`

**Preferred Method: Playwright**

```python
# html_to_image_service.py
async def convert_html_to_png_playwright(
    self, 
    html_content: str, 
    output_path: str
) -> bool:
    """Convert HTML to PNG using Playwright browser automation."""
    
    from playwright.async_api import async_playwright
    
    async with async_playwright() as p:
        # Launch headless browser
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(
            viewport={'width': 1920, 'height': 1080}
        )
        
        # Set HTML content
        await page.set_content(html_content, wait_until='networkidle')
        
        # Wait for fonts and images to load
        await asyncio.sleep(1)
        
        # Capture screenshot
        await page.screenshot(
            path=output_path,
            full_page=False,
            clip={'x': 0, 'y': 0, 'width': 1920, 'height': 1080}
        )
        
        await browser.close()
        return True
```

**Why Playwright?**
- ✅ Accurate CSS rendering (flexbox, grid, gradients)
- ✅ Font loading support
- ✅ Image embedding
- ✅ JavaScript execution (if needed)
- ✅ Pixel-perfect 1920×1080 output

### Step 3: PNG to Video Conversion

**Service:** `VideoAssemblyService`

**Method:** FFmpeg concat demuxer

```python
# video_assembly_service.py
async def create_video_from_pngs(
    self, 
    png_paths: List[str], 
    output_path: str,
    slide_duration: float = 5.0
) -> bool:
    """Create video from PNG images using FFmpeg."""
    
    # Create temporary file list for FFmpeg concat
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt') as f:
        for png_path in png_paths:
            f.write(f"file '{os.path.abspath(png_path)}'\n")
            f.write(f"duration {slide_duration}\n")
        
        # Add last image without duration (FFmpeg requirement)
        f.write(f"file '{os.path.abspath(png_paths[-1])}'\n")
        
        file_list_path = f.name
    
    # Build FFmpeg command
    cmd = [
        'ffmpeg',
        '-y',                    # Overwrite output
        '-f', 'concat',          # Use concat demuxer
        '-safe', '0',            # Allow absolute paths
        '-i', file_list_path,    # Input file list
        '-vf', 'fps=25,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=#110c35',
        '-c:v', 'libx264',       # H.264 codec
        '-preset', 'medium',     # Encoding speed/quality balance
        '-crf', '18',            # Quality (lower = better)
        '-pix_fmt', 'yuv420p',   # Color format (universal compatibility)
        output_path
    ]
    
    result = subprocess.run(cmd, capture_output=True, timeout=300)
    return result.returncode == 0
```

**FFmpeg Parameters Explained:**

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `-f concat` | - | Use concat demuxer for image sequences |
| `-safe 0` | - | Allow absolute file paths |
| `-vf fps=25` | 25 fps | Set frame rate to 25 frames per second |
| `-vf scale=1920:1080` | 1920×1080 | Ensure output dimensions |
| `-c:v libx264` | H.264 | Video codec (universal compatibility) |
| `-preset medium` | - | Balance speed and quality |
| `-crf 18` | 18 | Constant Rate Factor (0-51, lower = better quality) |
| `-pix_fmt yuv420p` | - | Color format for maximum compatibility |

**Output:** Silent video file with slide content (no audio yet)

---

## Phase 2: Avatar Video Generation (Elai API)

### Elai API Integration

**Service:** `VideoGenerationService`

**Process:**
1. Prepare avatar video request
2. Submit to Elai API
3. Poll for completion
4. Download avatar video

### Step 1: Prepare Elai API Request

```python
# video_generation_service.py
async def create_video_from_texts(
    self,
    project_name: str,
    voiceover_texts: List[str],
    avatar_code: str,
    voice_id: Optional[str] = None,
    voice_provider: Optional[str] = None,
    elai_background_color: str = None
) -> Dict[str, Any]:
    """Create avatar video via Elai API."""
    
    # Determine background color
    background_color = elai_background_color or "#ffffff"
    
    # Build Elai API request payload
    video_request = {
        "name": project_name,
        "slides": [{
            "canvas": {
                "objects": [
                    {
                        "type": "avatar",
                        "avatar": avatar_code,  # e.g., "angela", "john"
                        "avatarVendor": "elai",
                        "x": 960,      # Center position
                        "y": 540,
                        "width": 800,
                        "height": 1000,
                        "zIndex": 10
                    }
                ],
                "background": background_color,  # Dynamic per-slide color
                "version": "4.4.0"
            },
            "speech": {
                "ssml": voiceover_text,
                "provider": voice_provider or "azure",  # azure, elevenlabs, etc.
                "voice": voice_id or "en-US-Standard-A"
            }
        }]
    }
    
    # Submit to Elai API
    response = await self.elai_client.post("/videos", json=video_request)
    video_id = response.json()["_id"]
    
    return {"video_id": video_id, "success": True}
```

### Step 2: Poll for Video Completion

**Challenge:** Elai API processing is asynchronous (takes 20-60 seconds)

**Solution:** Polling with exponential backoff

```python
async def wait_for_video_completion(
    self,
    video_id: str,
    max_wait_time: int = 300  # 5 minutes
) -> Dict[str, Any]:
    """Poll Elai API until video is ready."""
    
    start_time = asyncio.get_event_loop().time()
    poll_interval = 2  # Start with 2 seconds
    
    while True:
        elapsed = asyncio.get_event_loop().time() - start_time
        
        if elapsed > max_wait_time:
            raise TimeoutError(f"Video generation timeout: {video_id}")
        
        # Check video status
        response = await self.elai_client.get(f"/videos/{video_id}")
        video_data = response.json()
        status = video_data.get("status")
        
        logger.info(f"🎬 Video {video_id} status: {status} ({elapsed:.1f}s elapsed)")
        
        if status == "rendered":
            # Video is ready!
            video_url = video_data.get("url")
            return {"status": "completed", "url": video_url}
        
        elif status == "failed":
            error = video_data.get("error", "Unknown error")
            raise Exception(f"Elai video generation failed: {error}")
        
        # Wait before next poll (exponential backoff)
        await asyncio.sleep(poll_interval)
        poll_interval = min(poll_interval * 1.2, 10)  # Cap at 10 seconds
```

### Step 3: Download Avatar Video

```python
async def download_video(self, video_url: str, output_path: str) -> bool:
    """Download avatar video from Elai CDN."""
    
    async with aiohttp.ClientSession() as session:
        async with session.get(video_url) as response:
            if response.status == 200:
                with open(output_path, 'wb') as f:
                    f.write(await response.read())
                return True
    
    return False
```

**Avatar Video Output:**
- Format: MP4 (H.264 video + AAC audio)
- Resolution: Typically 1024×1280 or similar (portrait)
- Duration: Matches voiceover length
- Audio: Generated speech with natural prosody
- Background: Solid color (from `elaiBackgroundColor`)

---

## Phase 3: Video Composition (OpenCV Overlay)

### The Challenge

We have two videos:
1. **Slide video** - 1920×1080, silent, contains slide content
2. **Avatar video** - Variable size (portrait), with audio, contains speaking avatar

**Goal:** Overlay avatar video onto slide video at precise position with masking (circular/arch/rectangular)

### OpenCV Frame-by-Frame Composition

**Service:** `SimpleVideoComposer`

**Why OpenCV?**
- ✅ Pixel-perfect control over positioning
- ✅ Support for alpha channel transparency
- ✅ Custom masking (circular, arch shapes)
- ✅ Frame-by-frame processing for perfect sync
- ✅ No quality loss from re-encoding

### Composition Algorithm

**High-Level Process:**
```
For each frame (0 to min(slide_frames, avatar_frames)):
    1. Read slide frame (background)
    2. Read avatar frame (overlay)
    3. Crop/resize avatar to target dimensions
    4. Apply mask (if circular or arch)
    5. Alpha blend avatar onto slide
    6. Write composed frame to output
```

### Step 1: Video Capture Setup

```python
# simple_video_composer.py
async def _compose_frames(
    self, 
    slide_video_path: str, 
    avatar_video_path: str, 
    output_path: str,
    avatar_config: dict
) -> bool:
    """Compose videos frame by frame using OpenCV."""
    
    # Open video captures
    slide_cap = cv2.VideoCapture(slide_video_path)
    avatar_cap = cv2.VideoCapture(avatar_video_path)
    
    # Get properties
    output_width = 1920
    output_height = 1080
    output_fps = 25.0
    
    # Get frame counts
    slide_frame_count = int(slide_cap.get(cv2.CAP_PROP_FRAME_COUNT))
    avatar_frame_count = int(avatar_cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Use minimum frame count to avoid processing unnecessary frames
    total_frames = min(slide_frame_count, avatar_frame_count)
    
    logger.info(f"🎬 Processing {total_frames} frames")
    logger.info(f"  - Slide frames: {slide_frame_count}")
    logger.info(f"  - Avatar frames: {avatar_frame_count}")
    
    # Create video writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    video_writer = cv2.VideoWriter(
        output_path, 
        fourcc, 
        output_fps, 
        (output_width, output_height)
    )
```

### Step 2: Frame Processing Loop

```python
    frame_count = 0
    
    while True:
        # Read frames
        slide_ret, slide_frame = slide_cap.read()
        avatar_ret, avatar_frame = avatar_cap.read()
        
        # Break if either video ended
        if not slide_ret or not avatar_ret:
            break
        
        # Create background (slide frame resized to 1920x1080)
        background = cv2.resize(slide_frame, (output_width, output_height))
        
        # Process avatar frame
        if avatar_ret:
            # Crop avatar to target dimensions
            avatar_cropped = self._crop_avatar_to_template(
                avatar_frame, 
                avatar_config
            )
            
            # Get position from config
            x = avatar_config['x']
            y = avatar_config['y']
            avatar_width = avatar_config['width']
            avatar_height = avatar_config['height']
            shape = avatar_config.get('shape', 'rectangle')
            
            # Boundary check
            if x + avatar_width <= output_width and y + avatar_height <= output_height:
                # Apply mask based on shape
                if shape == 'circle':
                    avatar_processed = self._apply_circular_mask(avatar_cropped)
                elif shape == 'arch':
                    avatar_processed = self._apply_arch_mask(avatar_cropped)
                else:
                    # Rectangular (no mask)
                    avatar_processed = cv2.cvtColor(
                        avatar_cropped, 
                        cv2.COLOR_BGR2BGRA
                    )
                    avatar_processed[:, :, 3] = 255  # Fully opaque
                
                # Alpha blend onto background
                background = self._overlay_with_alpha(
                    background, 
                    avatar_processed, 
                    x, 
                    y
                )
        
        # Write composed frame
        video_writer.write(background)
        frame_count += 1
    
    # Cleanup
    slide_cap.release()
    avatar_cap.release()
    video_writer.release()
    
    logger.info(f"🎬 Composed {frame_count} frames successfully")
    return True
```

### Step 3: Avatar Cropping

**Problem:** Avatar videos are portrait (e.g., 1024×1280), but we need specific dimensions

**Solution:** Smart center cropping

```python
def _crop_avatar_to_template(
    self, 
    avatar_frame: np.ndarray, 
    avatar_config: dict
) -> np.ndarray:
    """Crop avatar frame to template dimensions using center cropping."""
    
    avatar_height, avatar_width = avatar_frame.shape[:2]
    target_width = avatar_config['width']
    target_height = avatar_config['height']
    
    # Calculate aspect ratios
    avatar_aspect = avatar_width / avatar_height
    target_aspect = target_width / target_height
    
    if avatar_aspect > target_aspect:
        # Avatar is wider - crop horizontally
        new_width = int(avatar_height * target_aspect)
        x_offset = (avatar_width - new_width) // 2
        cropped = avatar_frame[:, x_offset:x_offset + new_width]
    else:
        # Avatar is taller - crop vertically
        new_height = int(avatar_width / target_aspect)
        y_offset = (avatar_height - new_height) // 2
        cropped = avatar_frame[y_offset:y_offset + new_height, :]
    
    # Resize to exact target dimensions
    resized = cv2.resize(
        cropped, 
        (target_width, target_height),
        interpolation=cv2.INTER_LINEAR
    )
    
    return resized
```

### Step 4: Circular Masking

**Purpose:** Create circular avatar (like `border-radius: 50%`)

```python
def _apply_circular_mask(self, frame: np.ndarray) -> np.ndarray:
    """Apply circular mask to avatar frame with transparent background."""
    
    height, width = frame.shape[:2]
    
    # Create circular mask
    mask = np.zeros((height, width), dtype=np.uint8)
    center = (width // 2, height // 2)
    radius = min(width, height) // 2
    
    # Draw filled circle (255 = opaque, 0 = transparent)
    cv2.circle(mask, center, radius, 255, -1)
    
    # Convert frame to BGRA (add alpha channel)
    frame_bgra = cv2.cvtColor(frame, cv2.COLOR_BGR2BGRA)
    
    # Apply mask to alpha channel
    frame_bgra[:, :, 3] = mask
    
    return frame_bgra
```

**Visual Result:**
```
Before Mask:                After Circular Mask:
┌─────────────┐            ┌─────────────┐
│             │            │             │
│  ┌───────┐  │            │    ●●●●●    │
│  │Avatar │  │    →       │  ●●●●●●●●●  │
│  │ Image │  │            │  ●●Avatar●● │
│  └───────┘  │            │  ●●●●●●●●●  │
│             │            │    ●●●●●    │
└─────────────┘            └─────────────┘
                              (● = opaque
                               spaces = transparent)
```

### Step 5: Arch Masking

**Purpose:** Create arch-shaped avatar (rounded top, sharp bottom)

```python
def _apply_arch_mask(self, frame: np.ndarray) -> np.ndarray:
    """Apply arch mask (rounded top corners, sharp bottom)."""
    
    height, width = frame.shape[:2]
    mask = np.zeros((height, width), dtype=np.uint8)
    
    # Radius for rounded top (50% of width)
    radius = width // 2
    
    # Draw bottom rectangle (sharp edges)
    cv2.rectangle(mask, (0, radius), (width, height), 255, -1)
    
    # Draw top-left rounded corner (180° to 270°)
    cv2.ellipse(
        mask,
        center=(radius, radius),
        axes=(radius, radius),
        angle=0,
        startAngle=180,
        endAngle=270,
        color=255,
        thickness=-1
    )
    
    # Draw top-right rounded corner (270° to 360°)
    cv2.ellipse(
        mask,
        center=(radius, radius),
        axes=(radius, radius),
        angle=0,
        startAngle=270,
        endAngle=360,
        color=255,
        thickness=-1
    )
    
    # Convert to BGRA and apply mask
    frame_bgra = cv2.cvtColor(frame, cv2.COLOR_BGR->BGRA)
    frame_bgra[:, :, 3] = mask
    
    return frame_bgra
```

**Visual Result:**
```
Before Mask:                After Arch Mask:
┌─────────────┐            ╭─────────────╮
│             │            │             │
│  ┌───────┐  │            │  ┌───────┐  │
│  │Avatar │  │    →       │  │Avatar │  │
│  │ Image │  │            │  │ Image │  │
│  └───────┘  │            │  └───────┘  │
│             │            │             │
└─────────────┘            └─────────────┘
```

### Step 6: Alpha Blending

**Purpose:** Overlay transparent avatar onto slide background

```python
def _overlay_with_alpha(
    self,
    background: np.ndarray,  # BGR (1920×1080)
    foreground: np.ndarray,  # BGRA (with alpha channel)
    x: int,
    y: int
) -> np.ndarray:
    """Alpha blend foreground onto background at (x, y)."""
    
    fg_height, fg_width = foreground.shape[:2]
    
    # Extract region of interest from background
    roi = background[y:y+fg_height, x:x+fg_width]
    
    # Split foreground into RGB and alpha
    fg_rgb = foreground[:, :, 0:3]  # BGR channels
    fg_alpha = foreground[:, :, 3] / 255.0  # Normalize alpha to [0, 1]
    
    # Expand alpha to 3 channels for broadcasting
    alpha_3ch = np.dstack([fg_alpha] * 3)
    
    # Alpha blending formula:
    # output = background * (1 - alpha) + foreground * alpha
    blended = (roi * (1 - alpha_3ch) + fg_rgb * alpha_3ch).astype(np.uint8)
    
    # Place blended region back into background
    background[y:y+fg_height, x:x+fg_width] = blended
    
    return background
```

**Alpha Blending Math:**

For each pixel at position (px, py):
```
alpha = foreground_alpha[px, py] / 255.0  # Normalize to [0.0, 1.0]

output_red   = background_red   * (1 - alpha) + foreground_red   * alpha
output_green = background_green * (1 - alpha) + foreground_green * alpha
output_blue  = background_blue  * (1 - alpha) + foreground_blue  * alpha
```

**Examples:**
- `alpha = 1.0` (opaque) → 100% foreground, 0% background
- `alpha = 0.5` (semi-transparent) → 50% foreground, 50% background
- `alpha = 0.0` (transparent) → 0% foreground, 100% background

### Step 7: Audio Merging

**Challenge:** OpenCV processes video only, but we need audio from avatar video

**Solution:** FFmpeg audio extraction and muxing

```python
async def _merge_audio(
    self,
    video_path: str,
    avatar_video_path: str,
    output_path: str
) -> bool:
    """Merge audio from avatar video into composed video."""
    
    # FFmpeg command to copy audio stream
    cmd = [
        'ffmpeg',
        '-y',
        '-i', video_path,         # Input: composed video (no audio)
        '-i', avatar_video_path,  # Input: avatar video (with audio)
        '-map', '0:v:0',          # Take video from first input
        '-map', '1:a:0',          # Take audio from second input
        '-c:v', 'copy',           # Copy video (no re-encoding)
        '-c:a', 'aac',            # Encode audio as AAC
        '-shortest',              # Match shortest stream duration
        output_path
    ]
    
    result = subprocess.run(cmd, capture_output=True, timeout=60)
    return result.returncode == 0
```

**Output:** Final composed video with slide content + avatar overlay + voiceover audio

---

## Phase 4: Video Concatenation with Transitions

### The Challenge

After composing all slides individually, we have:
- Slide 1 video (5 seconds)
- Slide 2 video (7 seconds)
- Slide 3 video (6 seconds)
- ...

**Goal:** Combine all slides into a single presentation video with smooth transitions

### FFmpeg xfade Filter

**Service:** `ProfessionalPresentationService._concatenate_videos_with_transitions()`

**FFmpeg xfade filter** provides professional transitions between videos:
- Fades, dissolves, wipes
- Slides, zooms, circles
- 40+ transition effects

### Step 1: Analyze Input Videos

```python
async def _concatenate_videos_with_transitions(
    self,
    video_paths: List[str],
    job_id: str,
    transitions: List[Dict[str, Any]]
) -> str:
    """Concatenate videos with transitions using FFmpeg xfade."""
    
    # Get duration of each video
    durations = []
    for video_path in video_paths:
        probe_cmd = [
            'ffprobe',
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            video_path
        ]
        result = subprocess.run(probe_cmd, capture_output=True, text=True)
        duration = float(result.stdout.strip())
        durations.append(duration)
        logger.info(f"  Video {i+1}: {duration:.2f}s")
    
    # Example: [5.0, 7.0, 6.0, 8.0]
```

### Step 2: Map Transition Types

```python
    # Map frontend transition types to FFmpeg xfade types
    transition_type_map = {
        # Basic
        'none': None,
        'fade': 'fade',
        'dissolve': 'dissolve',
        
        # Wipes - Directional
        'wipeleft': 'wipeleft',
        'wiperight': 'wiperight',
        'wipeup': 'wipeup',
        'wipedown': 'wipedown',
        
        # Wipes - Diagonal
        'wipetl': 'wipetl',  # Top-left
        'wipetr': 'wipetr',  # Top-right
        'wipebl': 'wipebl',  # Bottom-left
        'wipebr': 'wipebr',  # Bottom-right
        
        # Slides
        'slideleft': 'slideleft',
        'slideright': 'slideright',
        'slideup': 'slideup',
        'slidedown': 'slidedown',
        
        # Smooth transitions
        'smoothleft': 'smoothleft',
        'smoothright': 'smoothright',
        'smoothup': 'smoothup',
        'smoothdown': 'smoothdown',
        
        # Circle effects
        'circlecrop': 'circlecrop',
        'circleopen': 'circleopen',
        'circleclose': 'circleclose',
        'radial': 'radial',
        
        # Diagonal transitions
        'diagtl': 'diagtl',
        'diagtr': 'diagtr',
        'diagbl': 'diagbl',
        'diagbr': 'diagbr',
        
        # Slice effects
        'hlslice': 'hlslice',
        'hrslice': 'hrslice',
        'vuslice': 'vuslice',
        'vdslice': 'vdslice',
        
        # Squeeze & Zoom
        'squeezeh': 'squeezeh',
        'squeezev': 'squeezev',
        'zoomin': 'zoomin',
        
        # Special effects
        'distance': 'distance',
        'hblur': 'hblur',
        'pixelize': 'pixelize'
    }
```

### Step 3: Build FFmpeg Filter Complex

**Concept:** Chain xfade filters to transition between consecutive videos

**Timeline Example:**
```
Video 1: 0.0s ──────────────► 5.0s
                  Fade (0.5s overlap)
Video 2:           4.5s ──────────────────► 11.5s
                              Dissolve (1.0s overlap)
Video 3:                       10.5s ────────────► 16.5s
```

**Filter Complex Structure:**
```
[0:v][1:v] xfade=transition=fade:duration=0.5:offset=4.5 [v0];
[v0][2:v] xfade=transition=dissolve:duration=1.0:offset=10.5 [vout]
```

**Implementation:**
```python
    # Build filter_complex for sequential transitions
    filter_complex_parts = []
    offset = 0
    current_video_stream = '[0:v]'
    current_audio_stream = '[0:a]'
    
    for i in range(len(video_paths) - 1):
        next_video_stream = f'[{i+1}:v]'
        next_audio_stream = f'[{i+1}:a]'
        output_video_stream = f'[v{i}]' if i < len(video_paths) - 2 else '[vout]'
        output_audio_stream = f'[a{i}]' if i < len(video_paths) - 2 else '[aout]'
        
        # Get transition config
        transition_config = transitions[i] if i < len(transitions) else {
            'type': 'fade', 
            'duration': 0.5
        }
        transition_type = transition_config.get('type', 'fade')
        transition_duration = float(transition_config.get('duration', 0.5))
        
        # Map to FFmpeg type
        ffmpeg_transition = transition_type_map.get(transition_type, 'fade')
        
        # Calculate offset
        if i > 0:
            offset += durations[i] - transition_duration
        else:
            offset = durations[i] - transition_duration
        
        # Build xfade filter for video
        xfade_filter = (
            f"{current_video_stream}{next_video_stream}"
            f"xfade=transition={ffmpeg_transition}:"
            f"duration={transition_duration}:"
            f"offset={offset:.3f}"
            f"{output_video_stream}"
        )
        filter_complex_parts.append(xfade_filter)
        current_video_stream = output_video_stream
        
        # Build acrossfade filter for audio
        acrossfade_filter = (
            f"{current_audio_stream}{next_audio_stream}"
            f"acrossfade=d={transition_duration}:"
            f"c1=tri:"  # Triangular fade out curve
            f"c2=tri"   # Triangular fade in curve
            f"{output_audio_stream}"
        )
        filter_complex_parts.append(acrossfade_filter)
        current_audio_stream = output_audio_stream
    
    filter_complex = ';'.join(filter_complex_parts)
```

### Step 4: Execute FFmpeg Command

```python
    # Build complete FFmpeg command
    cmd = ['ffmpeg', '-y']
    
    # Add all input files
    for video_path in video_paths:
        cmd.extend(['-i', video_path])
    
    # Add filter_complex
    cmd.extend([
        '-filter_complex', filter_complex,
        '-map', '[vout]',  # Map video output
        '-map', '[aout]',  # Map audio output
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '18',
        '-c:a', 'aac',
        '-b:a', '192k',
        output_path
    ])
    
    logger.info(f"🎞️ Running FFmpeg concatenation command")
    logger.info(f"  Command: {' '.join(cmd[:10])}...")  # Log first part
    
    # Execute
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=600  # 10 minute timeout
    )
    
    if result.returncode == 0:
        logger.info(f"✅ Concatenation successful: {output_path}")
        return output_path
    else:
        logger.error(f"❌ FFmpeg failed: {result.stderr}")
        raise Exception("Video concatenation failed")
```

### Transition Effects Gallery

#### 1. Fade (Default)
```
Frame 1: ████████████ (100% video 1)
Frame 2: ███████████▒ (90% video 1, 10% video 2)
Frame 3: ██████████▒▒ (80% video 1, 20% video 2)
Frame 4: █████████▒▒▒ (70% video 1, 30% video 2)
...
Frame N: ▒▒▒▒▒▒▒▒▒▒▒▒ (100% video 2)
```

#### 2. Wipeleft
```
Frame 1: ████████████ (video 1)
Frame 2: ▒███████████ (video 2 enters from left)
Frame 3: ▒▒██████████
Frame 4: ▒▒▒█████████
...
Frame N: ▒▒▒▒▒▒▒▒▒▒▒▒ (video 2)
```

#### 3. Circlecrop
```
Frame 1: ████████████ (video 1)
Frame 2: ████●███████ (video 2 small circle)
Frame 3: ███●●●██████ (circle grows)
Frame 4: ██●●●●●█████
...
Frame N: ▒▒▒▒▒▒▒▒▒▒▒▒ (video 2 fills screen)
```

#### 4. Slideleft
```
Frame 1: ████████████ (video 1)
Frame 2: ▒███████████ (video 2 slides in from right)
Frame 3: ▒▒▒▒████████ (video 1 slides out to left)
Frame 4: ▒▒▒▒▒▒▒▒████
...
Frame N: ▒▒▒▒▒▒▒▒▒▒▒▒ (video 2)
```

---

## FFmpeg Operations In Depth

### FFmpeg Command Anatomy

```bash
ffmpeg \
  -y \                              # Overwrite output
  -i input1.mp4 \                   # Input file 1
  -i input2.mp4 \                   # Input file 2
  -filter_complex "..." \           # Complex filters
  -map "[vout]" \                   # Map video stream
  -map "[aout]" \                   # Map audio stream
  -c:v libx264 \                    # Video codec
  -preset fast \                    # Encoding preset
  -crf 18 \                         # Quality
  -c:a aac \                        # Audio codec
  -b:a 192k \                       # Audio bitrate
  output.mp4                        # Output file
```

### Key FFmpeg Filters Used

#### 1. **concat** - Concatenate images/videos
```bash
# PNG sequence to video
-f concat -safe 0 -i filelist.txt

# filelist.txt format:
file '/path/to/image1.png'
duration 5.0
file '/path/to/image2.png'
duration 5.0
```

#### 2. **xfade** - Crossfade between videos
```bash
[0:v][1:v]xfade=transition=fade:duration=0.5:offset=4.5[vout]
```
- `transition`: Effect type (fade, wipeleft, etc.)
- `duration`: Transition length in seconds
- `offset`: When transition starts (in seconds)

#### 3. **acrossfade** - Audio crossfade
```bash
[0:a][1:a]acrossfade=d=0.5:c1=tri:c2=tri[aout]
```
- `d`: Duration
- `c1`: Fade-out curve (tri, qua, cub, etc.)
- `c2`: Fade-in curve

#### 4. **scale** - Resize video
```bash
-vf scale=1920:1080:force_original_aspect_ratio=decrease
```

#### 5. **pad** - Add padding/borders
```bash
-vf pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=#110c35
```
- Centers video and fills with color

#### 6. **fps** - Set frame rate
```bash
-vf fps=25
```

### FFmpeg Encoding Parameters

| Parameter | Purpose | Common Values |
|-----------|---------|---------------|
| `-c:v libx264` | Video codec | H.264 (universal compatibility) |
| `-preset` | Speed/quality balance | ultrafast, fast, medium, slow, veryslow |
| `-crf` | Quality (Constant Rate Factor) | 18 (high), 23 (medium), 28 (low) |
| `-pix_fmt yuv420p` | Pixel format | Maximum compatibility |
| `-c:a aac` | Audio codec | AAC (universal) |
| `-b:a` | Audio bitrate | 128k, 192k, 256k |

**CRF Scale:**
```
0 = Lossless (huge files)
18 = Visually lossless (high quality)
23 = Default (good quality)
28 = Low quality
51 = Worst possible quality
```

---

## Complete Flow Diagrams

### Single-Slide Video Generation

```
┌─────────────────────────────────────────────────────────────┐
│ 1. FRONTEND                                                  │
│    User clicks "Generate Video"                              │
│    ↓                                                          │
│    Payload: { templateId, props, voiceover_text }           │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP POST
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. PRESENTATION SERVICE                                      │
│    _process_single_slide_presentation()                      │
│    ↓                                                          │
│    Extract: elaiBackgroundColor, avatarPosition              │
└─┬──────────────────────────┬────────────────────────────────┘
  │ Parallel                 │
  ▼                          ▼
┌─────────────────────┐  ┌──────────────────────────────────┐
│ 3A. SLIDE RENDERING │  │ 3B. AVATAR GENERATION            │
│                     │  │                                  │
│ HTML Template       │  │ Video Generation Service         │
│      ↓              │  │      ↓                           │
│ HTMLToImageService  │  │ POST to Elai API                 │
│      ↓              │  │      ↓                           │
│ Playwright          │  │ Poll for completion (20-60s)     │
│      ↓              │  │      ↓                           │
│ PNG (1920x1080)     │  │ Download avatar video            │
│      ↓              │  │      ↓                           │
│ VideoAssemblyService│  │ avatar.mp4 (with audio)          │
│      ↓              │  │                                  │
│ FFmpeg concat       │  │                                  │
│      ↓              │  │                                  │
│ slide.mp4 (silent)  │  │                                  │
└──────────┬──────────┘  └──────────────┬───────────────────┘
           │                            │
           │  Both complete             │
           ▼                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. VIDEO COMPOSITION                                         │
│    SimpleVideoComposer                                       │
│    ↓                                                          │
│    For each frame:                                           │
│      1. Read slide frame (background)                        │
│      2. Read avatar frame (overlay)                          │
│      3. Crop avatar to target dimensions                     │
│      4. Apply mask (circle/arch/rect)                        │
│      5. Alpha blend onto slide                               │
│      6. Write composed frame                                 │
│    ↓                                                          │
│    composed_video.mp4 (no audio)                            │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. AUDIO MERGING                                             │
│    FFmpeg audio muxing                                       │
│    ↓                                                          │
│    -i composed_video.mp4 (video only)                       │
│    -i avatar.mp4 (audio source)                             │
│    -map 0:v -map 1:a                                        │
│    ↓                                                          │
│    final_video.mp4 (video + audio)                          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
                    ✅ Complete Video
```

### Multi-Slide Presentation Generation

```
┌──────────────────────────────────────────────────────────────┐
│ 1. FRONTEND                                                   │
│    User clicks "Generate Presentation"                        │
│    ↓                                                           │
│    Payload: [                                                 │
│      { slide1_data, voiceover1, avatarPosition1 },           │
│      { slide2_data, voiceover2, avatarPosition2 },           │
│      { slide3_data, voiceover3, avatarPosition3 },           │
│      ...                                                      │
│    ]                                                          │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTP POST
                             ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. PRESENTATION SERVICE                                       │
│    generate_presentation()                                    │
│    ↓                                                           │
│    Extract data for all slides                               │
└─┬────────────────────────────────────────────────────────────┘
  │
  ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. BATCH AVATAR VIDEO GENERATION                              │
│    _initiate_all_avatar_videos()                             │
│    ↓                                                           │
│    For each slide (in parallel):                             │
│      POST to Elai API with elaiBackgroundColor               │
│    ↓                                                           │
│    Wait for all videos (concurrent polling)                  │
│    ↓                                                           │
│    Download all avatar videos                                │
│    ↓                                                           │
│    [avatar1.mp4, avatar2.mp4, avatar3.mp4, ...]             │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. RENDER SLIDE VIDEOS                                        │
│    For each slide (sequential):                              │
│      ↓                                                         │
│      Generate HTML → PNG → Video                             │
│      ↓                                                         │
│      [slide1.mp4, slide2.mp4, slide3.mp4, ...]              │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. COMPOSE EACH SLIDE                                         │
│    For each slide (sequential):                              │
│      ↓                                                         │
│      SimpleVideoComposer.compose_videos_simple()             │
│      ↓                                                         │
│      Overlay avatarN.mp4 onto slideN.mp4                     │
│      ↓                                                         │
│      [composed1.mp4, composed2.mp4, composed3.mp4, ...]      │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. CONCATENATE WITH TRANSITIONS                               │
│    _concatenate_videos_with_transitions()                    │
│    ↓                                                           │
│    Build FFmpeg filter_complex:                              │
│      [0:v][1:v]xfade=transition=fade:duration=0.5[v0];      │
│      [v0][2:v]xfade=transition=dissolve:duration=1.0[vout]  │
│    ↓                                                           │
│    Execute FFmpeg command                                    │
│    ↓                                                           │
│    presentation_final.mp4                                    │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
                ✅ Complete Presentation
```

---

## Performance Optimization

### 1. Parallel Avatar Generation

**Problem:** Generating avatars sequentially takes N × 30s

**Solution:** Batch initiation with concurrent polling

```python
async def _initiate_all_avatar_videos(
    self,
    slides_data: List[Dict[str, Any]],
    avatar_code: str,
    voice_id: Optional[str],
    voice_provider: Optional[str]
) -> List[str]:
    """Initiate all avatar videos in parallel."""
    
    video_ids = []
    
    # Initiate all requests in parallel
    tasks = []
    for i, slide_data in enumerate(slides_data):
        voiceover_text = slide_data.get("voiceover_text", "")
        elai_background_color = slide_data.get("elaiBackgroundColor", "#ffffff")
        
        task = self._initiate_avatar_video(
            voiceover_text,
            avatar_code,
            voice_id,
            voice_provider,
            i,
            elai_background_color
        )
        tasks.append(task)
    
    # Wait for all initiations
    video_ids = await asyncio.gather(*tasks)
    
    logger.info(f"🚀 All {len(video_ids)} avatar videos initiated")
    
    # Poll all videos concurrently
    download_tasks = []
    for video_id in video_ids:
        task = video_generation_service.wait_for_video_completion(video_id)
        download_tasks.append(task)
    
    # Wait for all completions
    video_data = await asyncio.gather(*download_tasks)
    
    logger.info(f"✅ All {len(video_data)} avatar videos completed")
    
    return [data["url"] for data in video_data]
```

**Performance Gain:**
- Sequential: 3 slides × 30s = 90 seconds
- Parallel: max(30s, 30s, 30s) = 30 seconds
- **3× faster for 3 slides!**

### 2. Frame Count Optimization

**Problem:** Processing unnecessary frames when videos differ in length

**Solution:** Use minimum frame count

```python
# Before (slow)
total_frames = max(slide_frame_count, avatar_frame_count)
# Processes 1500 frames even if avatar has only 140

# After (fast)
total_frames = min(slide_frame_count, avatar_frame_count)
# Processes only 140 frames
```

**Performance Gain:**
- Before: 1500 frames @ 30ms/frame = 45 seconds
- After: 140 frames @ 30ms/frame = 4.2 seconds
- **10× faster!**

### 3. FFmpeg Preset Selection

```python
def _get_preset(self, quality: str) -> str:
    """Get FFmpeg preset based on quality setting."""
    return {
        'low': 'ultrafast',    # Fast encoding, larger file
        'medium': 'fast',      # Balanced
        'high': 'medium'       # Slower encoding, smaller file
    }.get(quality, 'fast')
```

**Encoding Time Comparison (1080p, 10s video):**
- `ultrafast`: 2 seconds
- `fast`: 5 seconds
- `medium`: 10 seconds
- `slow`: 20 seconds
- `veryslow`: 40 seconds

### 4. Caching Strategies

**HTML Template Caching:**
```python
# Cache compiled Jinja2 templates
from functools import lru_cache

@lru_cache(maxsize=100)
def get_compiled_template(template_id: str):
    return jinja2_env.get_template(f"{template_id}.html")
```

**Playwright Browser Reuse:**
```python
# Reuse browser context instead of launching new browser each time
async with async_playwright() as p:
    browser = await p.chromium.launch(headless=True)
    
    for slide in slides:
        page = await browser.new_page()  # Reuse browser
        # ... render slide ...
        await page.close()
    
    await browser.close()
```

---

## Error Handling and Recovery

### 1. Elai API Failures

**Timeout Handling:**
```python
try:
    video_data = await video_generation_service.wait_for_video_completion(
        video_id,
        max_wait_time=300  # 5 minute timeout
    )
except TimeoutError as e:
    logger.error(f"❌ Elai API timeout: {video_id}")
    # Retry with different avatar or fallback
    video_data = await self._retry_avatar_generation(
        voiceover_text,
        fallback_avatar="default"
    )
```

**API Rate Limiting:**
```python
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=60),
    retry=retry_if_exception_type(RateLimitError)
)
async def _call_elai_api(self, endpoint: str, data: dict):
    """Call Elai API with automatic retry on rate limit."""
    response = await self.elai_client.post(endpoint, json=data)
    
    if response.status_code == 429:  # Rate limit
        raise RateLimitError("Elai API rate limit exceeded")
    
    return response
```

### 2. Video Composition Failures

**Boundary Check:**
```python
# Prevent avatar from exceeding canvas bounds
if x + avatar_width > output_width or y + avatar_height > output_height:
    logger.warning(f"⚠️ Avatar out of bounds, skipping overlay")
    logger.warning(f"  Position: ({x}, {y})")
    logger.warning(f"  Size: {avatar_width}×{avatar_height}")
    logger.warning(f"  Canvas: {output_width}×{output_height}")
    return slide_frame  # Return slide without avatar
```

**Frame Read Failures:**
```python
while True:
    slide_ret, slide_frame = slide_cap.read()
    avatar_ret, avatar_frame = avatar_cap.read()
    
    if not slide_ret and not avatar_ret:
        break  # Normal end
    
    if not slide_ret:
        # Slide video ended early - use solid background
        slide_frame = np.full((1080, 1920, 3), (17, 12, 53), dtype=np.uint8)
    
    if not avatar_ret:
        # Avatar video ended early - freeze last frame or continue without
        logger.warning("⚠️ Avatar video ended early, continuing with slide only")
        # Could freeze last avatar frame or just show slide
```

### 3. FFmpeg Failures

**Command Execution:**
```python
try:
    result = subprocess.run(
        ffmpeg_cmd,
        capture_output=True,
        text=True,
        timeout=600  # 10 minute timeout
    )
    
    if result.returncode != 0:
        logger.error(f"❌ FFmpeg failed with code {result.returncode}")
        logger.error(f"stderr: {result.stderr}")
        
        # Check for specific errors
        if "Invalid data found" in result.stderr:
            raise ValueError("Input video corrupted")
        elif "No such file or directory" in result.stderr:
            raise FileNotFoundError("Input file missing")
        else:
            raise Exception(f"FFmpeg error: {result.stderr}")
            
except subprocess.TimeoutExpired:
    logger.error("❌ FFmpeg timeout (10 minutes)")
    # Kill process and clean up
    raise TimeoutError("Video processing timeout")
```

### 4. Disk Space Management

**Cleanup Strategy:**
```python
async def _cleanup_temporary_files(self, job_id: str):
    """Clean up temporary files after video generation."""
    
    temp_patterns = [
        f"temp_{job_id}_*.mp4",
        f"temp_{job_id}_*.png",
        f"slide_{job_id}_*.mp4",
        f"avatar_{job_id}_*.mp4",
        f"composed_{job_id}_*.mp4"
    ]
    
    for pattern in temp_patterns:
        for temp_file in Path(self.temp_dir).glob(pattern):
            try:
                temp_file.unlink()
                logger.info(f"🗑️ Deleted temp file: {temp_file.name}")
            except Exception as e:
                logger.warning(f"⚠️ Failed to delete {temp_file}: {e}")
```

**Disk Space Check:**
```python
def _check_disk_space(self, required_mb: int = 1000):
    """Check if sufficient disk space is available."""
    
    stat = shutil.disk_usage(self.output_dir)
    available_mb = stat.free // (1024 * 1024)
    
    if available_mb < required_mb:
        raise IOError(
            f"Insufficient disk space: {available_mb}MB available, "
            f"{required_mb}MB required"
        )
    
    logger.info(f"💾 Disk space: {available_mb}MB available")
```

---

## Summary

The backend video generation pipeline is a sophisticated multi-stage system that:

1. **Renders slides** from HTML templates to PNG images using Playwright
2. **Converts PNGs** to video using FFmpeg concat demuxer
3. **Generates avatars** via Elai API with dynamic background colors
4. **Composes videos** frame-by-frame using OpenCV with:
   - Smart cropping to maintain aspect ratios
   - Alpha blending for transparency
   - Circular and arch masking for shape control
5. **Concatenates slides** with professional transitions using FFmpeg xfade filter
6. **Optimizes performance** through:
   - Parallel avatar generation
   - Frame count minimization
   - Smart FFmpeg preset selection
7. **Handles errors** gracefully with retry logic and fallbacks

The entire pipeline is designed for:
- ✅ **Scalability** - Process multiple slides concurrently
- ✅ **Quality** - Pixel-perfect rendering and composition
- ✅ **Flexibility** - Support for various avatar shapes and transitions
- ✅ **Reliability** - Comprehensive error handling and recovery
- ✅ **Performance** - Optimized for speed without sacrificing quality

---

**Last Updated:** November 5, 2025  
**Pipeline Version:** 2.0  
**Technology Stack:** Python 3.9+, OpenCV 4.8+, FFmpeg 5.0+, Playwright 1.40+

