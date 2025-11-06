# Template-Based Avatar Positioning Implementation

## Overview
This implementation adds per-template avatar positioning, allowing each slide template to define its own avatar placement coordinates instead of using hardcoded values.

---

## How It Works

### Flow Diagram
```
Template Registry (Frontend)
    ↓ (defines avatarPosition)
Slide Creation
    ↓ (attaches avatarPosition to slide data)
Video Generation Request
    ↓ (includes avatarPosition in payload)
Backend Compositor
    ↓ (uses custom position or defaults)
Final Video Output
```

---

## Implementation Details

### 1. Frontend Changes

#### **A. Type Definition (`slideTemplates.ts`)**
Added `AvatarPosition` interface and included it in `TemplateComponentInfo`:

```typescript
export interface AvatarPosition {
  x: number;        // X position from left edge (pixels)
  y: number;        // Y position from top edge (pixels)
  width: number;    // Avatar width (pixels)
  height: number;   // Avatar height (pixels)
  backgroundColor?: string; // Optional background color
}

export interface TemplateComponentInfo {
  // ... existing fields ...
  avatarPosition?: AvatarPosition; // Optional avatar positioning
}
```

#### **B. Template Registry Updates (`registry.ts`)**
Added `avatarPosition` to 5 slide templates:

| Template ID | X | Y | Width | Height | Background |
|-------------|---|---|-------|--------|------------|
| `course-overview-slide` | 925 | 118 | 935 | 843 | `#110c35` |
| `work-life-balance-slide` | 925 | 118 | 935 | 843 | `#110c35` |
| `soft-skills-assessment-slide` | 925 | 118 | 935 | 843 | `#ffffff` |
| `phishing-definition-slide` | 925 | 118 | 935 | 843 | `#ffffff` |
| `impact-statements-slide` | 60 | 118 | 935 | 843 | `#ffffff` |

**Example**:
```typescript
'course-overview-slide': {
  // ... other properties ...
  avatarPosition: {
    x: 925,       // Right side of slide
    y: 118,       // Vertically centered
    width: 935,
    height: 843,
    backgroundColor: '#110c35'
  }
}
```

#### **C. Video Generation Flow (`VideoEditorHeader.tsx`)**
Modified `extractSlideData()` to attach avatar positions from the registry:

```typescript
// Helper function to attach avatar position from template registry to slides
const attachAvatarPositionsToSlides = (slides: any[]) => {
  return slides.map(slide => {
    const templateId = slide.templateId;
    if (templateId) {
      const template = SLIDE_TEMPLATE_REGISTRY[templateId];
      if (template?.avatarPosition) {
        console.log(`🎬 [AVATAR_POSITION] Attaching avatar position for template ${templateId}:`, template.avatarPosition);
        return {
          ...slide,
          avatarPosition: template.avatarPosition
        };
      }
    }
    return slide;
  });
};
```

**Result**: Each slide in the request payload now includes its template's `avatarPosition` if defined.

---

### 2. Backend Changes

#### **A. Compositor Configuration (`video_composer_service.py`)**
Added `avatar_position` to `CompositionConfig` dataclass:

```python
@dataclass
class CompositionConfig:
    output_path: str
    resolution: Tuple[int, int] = (1920, 1080)
    framerate: int = 30
    video_codec: str = 'libx264'
    audio_codec: str = 'aac'
    quality: str = 'high'
    layout: str = 'picture_in_picture'
    avatar_position: Optional[Dict] = None  # NEW: Custom avatar position
```

Updated `compose_presentation()` to pass `avatar_position` to the compositor:

```python
success = await simple_composer.compose_videos(
    slide_video_path=slide_video,
    avatar_video_path=avatar_video,
    output_path=config.output_path,
    progress_callback=progress_callback,
    avatar_position=config.avatar_position  # Pass custom position
)
```

#### **B. Frame Compositor (`simple_video_composer.py`)**
Updated `compose_videos()` to accept and use `avatar_position`:

```python
async def compose_videos(self, 
                       slide_video_path: str, 
                       avatar_video_path: str, 
                       output_path: str,
                       progress_callback=None,
                       avatar_position: dict = None) -> bool:
    # Use custom avatar position if provided, otherwise use default
    active_avatar_config = avatar_position if avatar_position else self.avatar_template
    
    logger.info(f"🎬 [SIMPLE_COMPOSER] Using avatar position: {active_avatar_config}")
```

Updated internal methods to use `active_avatar_config`:
- `_compose_frames()` - receives `avatar_config` parameter
- `_crop_avatar_to_template()` - receives `avatar_config` parameter

**Frame Overlay Logic** (`_compose_frames`):
```python
# Get position coordinates from config
x = avatar_config['x']
y = avatar_config['y']
avatar_width = avatar_config['width']
avatar_height = avatar_config['height']

# Simple overlay (direct pixel replacement)
if x + avatar_width <= output_width and y + avatar_height <= output_height:
    background[y:y + avatar_height, x:x + avatar_width] = avatar_cropped
```

#### **C. Presentation Service (`presentation_service.py`)**
Updated both single-slide and multi-slide processing to extract and pass avatar position:

**Single-Slide Processing**:
```python
# Extract avatar position from slide data if available
avatar_position = slide_data.get('avatarPosition')
if avatar_position:
    logger.info(f"🎬 [SINGLE_SLIDE_PROCESSING] Using custom avatar position from template: {avatar_position}")

composition_config = CompositionConfig(
    output_path=str(output_path),
    resolution=request.resolution,
    quality=request.quality,
    layout=request.layout,
    avatar_position=avatar_position  # Pass custom position
)
```

**Multi-Slide Processing** (similar extraction for each slide):
```python
# Extract avatar position from slide data if available
avatar_position = slide_data.get('avatarPosition')
if avatar_position:
    logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] Slide {slide_index + 1}: Using custom avatar position from template: {avatar_position}")
```

---

## Data Flow Example

### **User Creates Slide with `course-overview-slide` Template**

1. **Frontend**: Template registry provides default `avatarPosition`:
   ```json
   {
     "x": 925,
     "y": 118,
     "width": 935,
     "height": 843,
     "backgroundColor": "#110c35"
   }
   ```

2. **Video Generation Request**: `VideoEditorHeader.tsx` attaches position to slide:
   ```json
   {
     "slideId": "slide-1",
     "templateId": "course-overview-slide",
     "props": { "title": "Course", "subtitle": "Overview" },
     "avatarPosition": {
       "x": 925,
       "y": 118,
       "width": 935,
       "height": 843,
       "backgroundColor": "#110c35"
     }
   }
   ```

3. **Backend Processing**: 
   - `presentation_service.py` extracts `avatarPosition` from slide data
   - Passes it to `CompositionConfig`
   - `video_composer_service.py` forwards it to `SimpleVideoComposer`
   - `simple_video_composer.py` uses custom position for frame overlay

4. **Result**: Avatar appears at `(925, 118)` with dimensions `935x843` in the final video

---

## Key Features

### ✅ **Per-Template Positioning**
Different templates can have different avatar layouts:
- **Right-aligned**: `x: 925` (course-overview, work-life-balance, etc.)
- **Left-aligned**: `x: 60` (impact-statements)

### ✅ **Backward Compatible**
Templates without `avatarPosition` use the default:
```python
self.avatar_template = {
    'width': 935,
    'height': 843,
    'x': 925,
    'y': 118
}
```

### ✅ **Easy to Extend**
To add positioning to a new template:
```typescript
'new-template': {
  // ... other properties ...
  avatarPosition: {
    x: 100,
    y: 200,
    width: 800,
    height: 700,
    backgroundColor: '#000000'
  }
}
```

### ✅ **Comprehensive Logging**
Every stage logs avatar position decisions:
- Frontend: `🎬 [AVATAR_POSITION] Attaching avatar position for template...`
- Backend: `🎬 [SINGLE_SLIDE_PROCESSING] Using custom avatar position from template...`
- Compositor: `🎬 [SIMPLE_COMPOSER] Using avatar position: {...}`

---

## Testing

### **Manual Test Procedure**

1. Create a new video lesson with multiple slides using different templates
2. Include at least:
   - One `course-overview-slide` (right-aligned, x: 925)
   - One `impact-statements-slide` (left-aligned, x: 60)
3. Generate video
4. Verify avatar positions:
   - Course overview: Avatar on RIGHT side
   - Impact statements: Avatar on LEFT side

### **Expected Log Output**

**Frontend**:
```
🎬 [AVATAR_POSITION] Attaching avatar position for template course-overview-slide: {x: 925, y: 118, ...}
🎬 [AVATAR_POSITION] Attaching avatar position for template impact-statements-slide: {x: 60, y: 118, ...}
```

**Backend**:
```
🎬 [MULTI_SLIDE_PROCESSING] Slide 1: Using custom avatar position from template: {'x': 925, 'y': 118, ...}
🎬 [SIMPLE_COMPOSER] Using avatar position: {'x': 925, 'y': 118, ...}
🎬 [MULTI_SLIDE_PROCESSING] Slide 2: Using custom avatar position from template: {'x': 60, 'y': 118, ...}
🎬 [SIMPLE_COMPOSER] Using avatar position: {'x': 60, 'y': 118, ...}
```

---

## Files Modified

### **Frontend**
1. `onyx-cutom/custom_extensions/frontend/src/types/slideTemplates.ts`
   - Added `AvatarPosition` interface
   - Extended `TemplateComponentInfo` with `avatarPosition` field

2. `onyx-cutom/custom_extensions/frontend/src/components/templates/registry.ts`
   - Added `avatarPosition` to 5 templates

3. `onyx-cutom/custom_extensions/frontend/src/app/projects-2/view/components/VideoEditorHeader.tsx`
   - Added `attachAvatarPositionsToSlides()` helper
   - Integrated with `extractSlideData()`
   - Imported `SLIDE_TEMPLATE_REGISTRY`

### **Backend**
1. `onyx-cutom/custom_extensions/backend/app/services/video_composer_service.py`
   - Added `avatar_position` to `CompositionConfig`
   - Updated `compose_presentation()` to pass position

2. `onyx-cutom/custom_extensions/backend/app/services/simple_video_composer.py`
   - Updated `compose_videos()` signature with `avatar_position` parameter
   - Updated `_compose_frames()` to accept and use `avatar_config`
   - Updated `_crop_avatar_to_template()` to accept `avatar_config`

3. `onyx-cutom/custom_extensions/backend/app/services/presentation_service.py`
   - Updated `_process_single_slide_presentation()` to extract and pass `avatarPosition`
   - Updated `_process_multi_slide_presentation()` to extract and pass `avatarPosition`

---

## Benefits

1. **Flexibility**: Each template controls its own avatar placement
2. **Consistency**: Avatar position is part of the template definition
3. **Maintainability**: No hardcoded coordinates scattered across backend
4. **Scalability**: Easy to add new templates with custom positions
5. **Transparency**: Comprehensive logging for debugging

---

## Future Enhancements

### **Potential Additions**:
1. **Frontend UI**: Visual avatar position editor in template designer
2. **Multiple Avatars**: Support for multiple avatars per slide with different positions
3. **Dynamic Positioning**: Calculate positions based on content layout
4. **Circular Masking**: Add optional circular avatar mask (currently rectangular)
5. **Animation Support**: Define avatar entrance/exit animations per template

---

## Conclusion

This implementation successfully decouples avatar positioning from the video compositor, making it a **template-level concern** rather than a **global configuration**. The system now supports **per-template avatar layouts** while maintaining full **backward compatibility** with existing slides.

**Status**: ✅ **COMPLETE AND READY FOR TESTING**

