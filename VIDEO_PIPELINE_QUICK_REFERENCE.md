# Video Generation Pipeline - Quick Reference Guide

## File Locations & Key Functions

### **Frontend Components**

| Component | File | Key Functions | Purpose |
|-----------|------|---------------|---------|
| **AvatarServiceSlideTemplate** | `frontend/src/components/templates/AvatarServiceSlideTemplate.tsx` | Lines 293-456 | Renders avatar-service slide with draggable text |
| **DragEnhancer** | `frontend/src/components/positioning/DragEnhancer.tsx` | Lines 26-249 | Handles text element dragging |
| **HybridTemplateBase** | `frontend/src/components/templates/base/HybridTemplateBase.tsx` | Lines 170-186 | Stores positions in metadata |
| **SmartSlideDeckViewer** | `frontend/src/components/SmartSlideDeckViewer.tsx` | Lines 483-497 | Manages slide deck state |
| **VideoDownloadButton** | `frontend/src/components/VideoDownloadButton.tsx` | Lines 31-92, 104-243 | Triggers video generation |

### **Backend Services**

| Service | File | Key Functions | Purpose |
|---------|------|---------------|---------|
| **Presentation Service** | `backend/app/services/presentation_service.py` | Lines 172-202, 259-400 | Orchestrates video generation |
| **HTML Template Service** | `backend/app/services/html_template_service.py` | Lines 38-166, 229-280 | Generates clean HTML |
| **HTML to Image Service** | `backend/app/services/html_to_image_service.py` | Lines 561-627, 162-200 | Converts HTML to PNG |
| **Video Assembly Service** | `backend/app/services/video_assembly_service.py` | Lines 48-141, 167-313 | Assembles PNGs into video |
| **Video Generation Service** | `backend/app/services/video_generation_service.py` | Lines 354-566 | Elai API integration |

### **Templates**

| Template | File | Lines | Purpose |
|----------|------|-------|---------|
| **Avatar Slide Template** | `backend/templates/avatar_slide_template.html` | 833-891 (avatar-service) | Video HTML template |
| **Single Slide PDF Template** | `backend/templates/single_slide_pdf_template.html` | 2066-2077 | PDF reference (working) |

---

## Key Functions Reference

### **Position Capture**

```typescript
// DragEnhancer.tsx (Lines 116-129)
const slideCanvas = container.closest('[data-slide-canvas="true"]');
const canvasRect = slideCanvas.getBoundingClientRect();
const canvasX = e.clientX - canvasRect.left;  // Canvas-relative
const canvasY = e.clientY - canvasRect.top;
```

### **Position Storage**

```typescript
// HybridTemplateBase.tsx (Lines 170-186)
const handlePositionChange = (elementId, position) => {
  const updatedSlide = {
    ...slide,
    metadata: {
      ...slide.metadata,
      elementPositions: {
        ...slide.metadata?.elementPositions,
        [elementId]: position
      }
    }
  };
  onSlideUpdate(updatedSlide);
};
```

### **HTML Generation**

```python
# html_template_service.py (Lines 106-128)
context_data = {
    "templateId": template_id,
    "theme": theme,
    "metadata": metadata,      # Contains elementPositions
    "slideId": slide_id,       # For ID generation
    **props                    # title, subtitle, content
}

html_content = template.render(**context_data)
```

### **Position Injection**

```jinja2
<!-- avatar_slide_template.html (Line 846 - FIXED) -->
{% set titleId = 'draggable-' + slideId + '-0' %}
{% if metadata.elementPositions[titleId] %}
  <h1 class="positioned-element" 
      style="transform: translate({{ metadata.elementPositions[titleId].x }}px, 
                                 {{ metadata.elementPositions[titleId].y }}px);">
    {{ title }}
  </h1>
{% endif %}
```

### **PNG Conversion**

```python
# html_to_image_service.py (Lines 162-200)
async with async_playwright() as p:
    browser = await p.chromium.launch(headless=True)
    page = await browser.new_page(viewport={'width': 1000, 'height': 1000})
    await page.set_content(html_content, wait_until='networkidle')
    await page.screenshot(path=output_path, type='png', full_page=True)
    await browser.close()
```

### **Video Assembly**

```python
# video_assembly_service.py (Lines 96-109)
cmd = [
    'ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', file_list_path,
    '-vf', 'fps=25,scale=1920:1080',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
    '-pix_fmt', 'yuv420p',
    output_path
]
subprocess.run(cmd, timeout=300)
```

---

## Data Structures

### **Frontend Position Storage**

```typescript
interface ComponentBasedSlide {
  slideId: string;
  templateId: string;
  props: Record<string, any>;
  metadata?: {
    elementPositions?: Record<string, { x: number; y: number }>;
  };
}
```

### **Backend Context Data**

```python
{
    "templateId": "avatar-service-slide",
    "theme": "dark-purple",
    "metadata": {
        "elementPositions": {
            "draggable-slide-123-0": {"x": 115, "y": 240},
            "draggable-slide-123-1": {"x": 115, "y": 320},
            "draggable-slide-123-2": {"x": 115, "y": 420}
        }
    },
    "slideId": "slide-123",
    "title": "Клиентский сервис -",
    "subtitle": "это основа бизнеса",
    "content": "Теплый контакт с клиентом"
}
```

### **Elai API Canvas Objects**

```python
canvas_objects = [
    {
        "type": "avatar",
        "left": 510, "top": 255,
        "width": 1080, "height": 1080,
        "scaleX": 0.2, "scaleY": 0.2,
        "src": avatar_canvas_url
    },
    {
        "type": "text",
        "left": 115,  # From elementPositions
        "top": 240,   # From elementPositions
        "width": 800, "height": 100,
        "text": "Title text",
        "fontSize": 48
    }
]
```

---

## API Endpoints

### **Save Positions**
```http
PUT /api/custom-projects-backend/projects/update/{projectId}
Content-Type: application/json

{
  "microProductContent": {
    "slides": [{
      "slideId": "...",
      "templateId": "avatar-service-slide",
      "props": {...},
      "metadata": {
        "elementPositions": {...}
      }
    }]
  }
}
```

### **Generate Video**
```http
POST /api/custom/presentations
Content-Type: application/json

{
  "projectName": "Presentation Title",
  "voiceoverTexts": ["Welcome..."],
  "slidesData": [...],  // Includes metadata.elementPositions
  "theme": "dark-purple",
  "avatarCode": "gia.casual",
  "useAvatarMask": true,
  "layout": "picture_in_picture",
  "duration": 30.0,
  "quality": "high",
  "resolution": [1920, 1080]
}
```

### **Check Video Status**
```http
GET /api/custom/presentations/{jobId}

Response:
{
  "success": true,
  "status": "completed",
  "progress": 100,
  "videoUrl": "https://...",
  "job_id": "..."
}
```

---

## Coordinate Systems

### **Canvas-Relative (DragEnhancer)**
- **Origin:** Top-left of `[data-slide-canvas="true"]` container
- **Range:** (0, 0) to (canvas_width, canvas_height)
- **Used in:** Frontend drag operations

### **Transform-Relative (HTML Rendering)**
- **Origin:** Element's natural flexbox position
- **Range:** Any offset (+/- values allowed)
- **Used in:** HTML/PNG/Video rendering

### **Absolute-Relative (DEPRECATED)**
- **Origin:** Parent container's content box
- **Range:** Container-relative coordinates
- **Used in:** REMOVED from avatar-service (was causing offsets)

---

## Common Issues & Solutions

### **Issue: Text not appearing at dragged positions**
**Cause:** Position data not passed through pipeline  
**Solution:** Verify metadata.elementPositions is included in all API calls

### **Issue: 90px offset in avatar-service videos**
**Cause:** Using position: absolute instead of transform  
**Solution:** ✅ FIXED in this update

### **Issue: Positions work in PDF but not video**
**Cause:** Different templates or coordinate systems  
**Solution:** Use same template approach for both (transform: translate)

---

## Best Practices

### **For New Templates:**

1. **Always use** `transform: translate()` for dynamic positioning
2. **Add** `positioned-element` class to positioned elements
3. **Use** element ID pattern: `draggable-{slideId}-{index}`
4. **Check** `metadata.elementPositions` before applying
5. **Provide** fallback rendering when no positions exist

### **For Position Debugging:**

1. **Frontend:** Check browser console for position updates
2. **Backend:** Check logs for elementPositions in metadata
3. **HTML:** Verify `transform: translate()` in generated HTML
4. **PNG:** Check debug PNG images in `output/presentations/`
5. **Video:** Compare video frame with frontend screenshot

---

## Quick Debugging Commands

```bash
# Check if position CSS is in HTML
grep "transform: translate" /tmp/html_debug_*.html

# Check element positions in logs
grep "elementPositions" backend.log

# Verify PNG files generated
ls -lh output/presentations/slide_image_debug_*.png

# Check video file size (should be reasonable)
ls -lh output/presentations/*.mp4
```

---

## Performance Metrics

### **Typical Processing Times:**

| Stage | Duration | Notes |
|-------|----------|-------|
| Position Capture | <50ms | Real-time drag operation |
| Position Save | ~200ms | HTTP PUT to backend |
| HTML Generation | <100ms | Jinja2 template rendering |
| PNG Rendering | 2-5s | Playwright browser screenshot |
| Video Assembly | 5-10s | FFmpeg encoding (per slide) |
| Elai API (if used) | 60-180s | Server-side avatar rendering |

### **Resource Usage:**

- **Browser Memory:** ~200MB per Playwright instance
- **Disk Space:** ~2MB per PNG, ~10-50MB per video
- **CPU:** High during FFmpeg encoding
- **Network:** ~5-10MB upload to Elai API (if used)

---

## Dependencies

### **Frontend:**
```json
{
  "react": "^18.x",
  "framer-motion": "^10.x" // For animations, not positioning
}
```

### **Backend:**
```txt
jinja2>=3.0.0        # Template rendering
playwright>=1.40.0   # HTML to PNG (primary method)
asyncio              # Async operations
httpx                # Elai API client
```

### **System:**
```bash
# Required system packages
chromium-browser     # For Playwright
ffmpeg              # For video assembly
```

---

## Monitoring & Logs

### **Key Log Patterns:**

**Position Capture:**
```
[DragEnhancer] Position changed: draggable-slide-123-0 -> {x: 115, y: 240}
```

**Position Storage:**
```
🔍 page.tsx: Triggering auto-save with updated data
```

**HTML Generation:**
```
🔍 [TEXT_POSITIONING_DEBUG] Element positions found: 3 items
🔍 [TEXT_POSITIONING_DEBUG] draggable-slide-123-0: {x: 115, y: 240}
```

**Position Injection:**
```
✅ POSITIONING CSS FOUND in HTML
  1. transform: translate(115px, 240px)
```

**PNG Conversion:**
```
🖼️ [HTML_TO_IMAGE] Playwright conversion successful: 1,234,567 bytes
```

**Video Assembly:**
```
🎬 [VIDEO_ASSEMBLY] Video creation successful: output.mp4
```

---

## Support & Troubleshooting

### **If Positions Don't Work:**

1. **Check Frontend:**
   - Are elements wrapped in `<div data-draggable="true">`?
   - Is parent marked with `data-slide-canvas="true"`?
   - Do position updates show in console?

2. **Check Storage:**
   - Does metadata.elementPositions exist in database?
   - Are element IDs correctly formatted?
   - Are x/y values numbers (not strings)?

3. **Check Backend:**
   - Is metadata passed to html_template_service?
   - Is slideId extracted/provided correctly?
   - Does HTML contain `transform: translate()`?

4. **Check Rendering:**
   - Is Playwright available?
   - Do debug PNGs show correct positions?
   - Is video frame rate correct (25 FPS)?

### **Debug Checklist:**

```
□ Frontend drag works (visual feedback)
□ Position saved (check network tab)
□ Database updated (query microproduct_content)
□ Backend receives metadata (check logs)
□ HTML contains transforms (check /tmp/html_debug_*.html)
□ PNG shows positions (check output/presentations/slide_image_debug_*.png)
□ Video preserves positions (watch generated video)
```

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-10-09 | 1.0 | Initial pipeline analysis |
| 2025-10-09 | 1.1 | **Fixed avatar-service positioning** |

---

**Last Updated:** October 9, 2025  
**Status:** Production Ready  
**Maintainer:** Development Team



