# 🔍 HTML Preview Debug Button - Implementation Guide

## Overview

Added an HTML Preview debug button to the new video lesson UI (page.tsx) to allow users to preview the static HTML with all positioning applied **before** generating the video. This is critical for debugging text positioning issues.

---

## Implementation Details

### File Modified

**File:** `onyx-cutom/custom_extensions/frontend/src/app/projects/view/[projectId]/page.tsx`

**Lines Modified:** 
- Line 46: Added import for `HtmlPreviewButton`
- Lines 2050-2075: Added button next to VideoDownloadButton

### Code Added

```typescript
import HtmlPreviewButton from '@/components/HtmlPreviewButton';

// ... later in the component ...

{projectInstanceData.component_name === COMPONENT_NAME_VIDEO_LESSON_PRESENTATION ? (
  <div className="flex items-center gap-3">
    {/* HTML Preview Debug Button */}
    <HtmlPreviewButton
      projectName={projectInstanceData.name}
      onError={(error) => {
        console.error('HTML preview error:', error);
        alert(`HTML preview failed: ${error}`);
      }}
      onSuccess={(message) => {
        console.log('HTML preview success:', message);
      }}
      className=""
    />
    
    {/* Video Download Button */}
    <VideoDownloadButton
      projectName={projectInstanceData.name}
      onError={(error) => {
        console.error('Video generation error:', error);
        alert(`Video generation failed: ${error}`);
      }}
      onSuccess={(downloadUrl) => {
        console.log('Video generated successfully:', downloadUrl);
      }}
    />
  </div>
) : (
  // ... PDF download button for other types ...
)}
```

---

## How It Works

### Data Flow

```
1. User clicks "🔍 Preview HTML" button
   ↓
2. HtmlPreviewButton extracts slide data from window.currentSlideData
   (SmartSlideDeckViewer exposes this)
   ↓
3. Sends POST request to /api/custom-projects-backend/slide-html/preview
   {
     slides: [...],
     theme: "dark-purple"
   }
   ↓
4. Backend generates static HTML with:
   - Scaled coordinates (using actual canvas dimensions)
   - Transform positioning
   - Debug comments with calculation details
   ↓
5. Opens HTML in new browser tab
   ↓
6. User can inspect HTML source to verify positioning
```

---

## What This Debug Button Shows

### 1. Canvas Dimension Analysis

```html
<!-- 
📐 Canvas Dimensions Analysis:
  ACTUAL Editor Canvas (from metadata):
    - Width:  852.01px
    - Source: metadata.canvasDimensions
    - ⚠️ MISMATCH: Actual canvas is -27.42% different!
  
  Video Canvas (Backend):
    - Width:  1920px
    - Height: 1080px
-->
```

### 2. Scale Factor Calculations

```html
<!-- 
📏 Scale Factors (using ACTUAL dimensions):
  - SCALE_X: 2.253521 (1920/852)  ✅
  - SCALE_Y: 1.800000 (1080/600)
  - Scale Factor Ratio: 0.798757
-->
```

### 3. Per-Element Positioning

```html
<!-- 
📍 TITLE POSITIONING
Element ID: draggable-slide-123-0
Original Position (Editor Canvas):
  x: -85.05px
  y: 86px

Scaling Calculation:
  scaledX = -85.05 × 2.254 = -191.67px
  scaledY = 86 × 1.800 = 154.80px

Final Transform: translate(-191.67px, 154.80px)
-->
<h1 class="slide-title positioned-element" 
    style="transform: translate(-191.67px, 154.80px);">
  Клиентский сервис - это основа успеха
</h1>
```

---

## Button Appearance

### Location
**Top-right toolbar area**, next to the "Create Professional Video" button

### Style
- **Color:** Purple (`bg-purple-600`)
- **Icon:** Code icon (`<Code />`)
- **Text:** "🔍 Preview HTML"
- **State:** Shows "Generating HTML Preview..." when loading

### Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│ [Back] [Open Products]          [🔍 Preview HTML] [📹 Create Professional Video] │
└─────────────────────────────────────────────────────────┘
```

---

## Use Cases

### 1. **Debug Positioning Before Video Generation**
- Click button to preview HTML
- Inspect element positions in browser DevTools
- Verify coordinates are scaled correctly
- Check if canvas dimensions are accurate

### 2. **Verify Coordinate Scaling**
- View HTML source (Ctrl+U / Cmd+U)
- Search for "COORDINATE SCALING ANALYSIS"
- Check SCALE_X and SCALE_Y values
- Verify they use actual canvas dimensions (852×600)

### 3. **Troubleshoot Position Conflicts**
- Preview HTML after each drag
- Compare "Original Position" vs "Scaled Position"
- Verify transform calculations are correct
- Check if metadata.canvasDimensions is present

### 4. **Compare Editor vs Video Layout**
- Open HTML preview in one window
- Open editor in another window
- Compare element positions visually
- Verify proportions match

---

## Example Debugging Workflow

### Step 1: Drag Element
```javascript
// Browser Console
💾 [POSITION_SAVE] Saving position to slide metadata
  📊 Position: {x: -85.053, y: 86}
  canvasDimensions: {width: 852.01, height: 600}
```

### Step 2: Click "🔍 Preview HTML"
```javascript
// Browser Console
🔍 [HTML_PREVIEW] Starting HTML preview generation...
🔍 [HTML_PREVIEW] Slides count: 1
🔍 [HTML_PREVIEW] Theme: dark-purple
```

### Step 3: Inspect HTML in New Tab
```html
<!-- Check HTML source for: -->
Original Position: x: -85.053px, y: 86px
Scaling Calculation: scaledX = -85.053 × 2.254 = -191.67px
Final Transform: translate(-191.67px, 154.80px)
```

### Step 4: Verify Positioning
- Element should be at same proportional position as in editor
- No horizontal offset
- No vertical offset

---

## Backend Endpoint

### Endpoint
`POST /api/custom-projects-backend/slide-html/preview`

### Request Body
```json
{
  "slides": [
    {
      "slideId": "slide-123",
      "templateId": "avatar-service-slide",
      "props": {...},
      "metadata": {
        "canvasDimensions": {
          "width": 852.01,
          "height": 600,
          "aspectRatio": 1.420
        },
        "elementPositions": {
          "draggable-slide-123-0": {"x": -85.053, "y": 86}
        }
      }
    }
  ],
  "theme": "dark-purple"
}
```

### Response
```json
{
  "success": true,
  "html": "<!DOCTYPE html>...",
  "template_id": "avatar-service-slide",
  "theme": "dark-purple",
  "slide_id": "slide-123"
}
```

---

## Key Features

### 1. **Automatic Data Extraction**
- Reads from `window.currentSlideData` (exposed by SmartSlideDeckViewer)
- No manual data entry required
- Always uses current slide state

### 2. **Real-Time Preview**
- Shows HTML as it will appear in video
- Includes all coordinate scaling
- Shows actual canvas dimensions used

### 3. **Detailed Debug Comments**
- HTML source contains debug comments
- Shows calculation steps
- Identifies dimension mismatches

### 4. **Non-Destructive**
- Opens in new tab (doesn't navigate away)
- Doesn't modify any data
- Can preview multiple times

---

## Comparison: Old UI vs New UI

### Old UI (projects-2/view/[projectId]/page.tsx)
- Debug buttons were in a separate debug panel
- Multiple debug buttons grouped together
- More technical appearance

### New UI (projects/view/[projectId]/page.tsx)
- Debug button next to main action button
- Integrated into toolbar
- Professional appearance matching UI theme

**Both implementations use the same `HtmlPreviewButton` component!**

---

## Testing Guide

### Test 1: Button Appears
1. Open a Video Lesson Presentation project
2. Look for purple "🔍 Preview HTML" button
3. Button should be next to "Create Professional Video"

✅ **Pass:** Button visible and properly styled  
❌ **Fail:** Button not visible or misaligned

### Test 2: HTML Preview Works
1. Click "🔍 Preview HTML" button
2. New tab should open with static HTML
3. HTML should show the current slide

✅ **Pass:** HTML opens in new tab  
❌ **Fail:** Error or no HTML shown

### Test 3: Positioning Visible
1. View page source in preview (Ctrl+U)
2. Search for "AVATAR-SERVICE POSITIONING DEBUG LOG"
3. Should see canvas dimensions and scale factors

✅ **Pass:** Debug comments visible  
❌ **Fail:** No debug comments in source

### Test 4: Correct Dimensions Used
1. Check HTML source for "ACTUAL Editor Canvas"
2. Should show 852×600 (not 1174×600)
3. Should show "Source: metadata.canvasDimensions"

✅ **Pass:** Actual dimensions used  
❌ **Fail:** Still using hardcoded 1174×600

### Test 5: Correct Scale Factors
1. Check HTML source for "SCALE_X"
2. Should show 2.253521 (1920/852)
3. Should NOT show 1.635434 (1920/1174)

✅ **Pass:** Correct scale factors  
❌ **Fail:** Wrong scale factors

---

## Benefits

### For Users:
- **Quick debugging** - Preview before generating video
- **Visual verification** - See exact HTML that will be rendered
- **Time saving** - Catch positioning errors before video generation
- **Learning tool** - Understand how positioning works

### For Developers:
- **Debugging tool** - Inspect HTML source directly
- **Verification** - Confirm coordinates are scaled correctly
- **Testing** - Test positioning changes immediately
- **Documentation** - HTML comments show calculations

---

## Related Components

| Component | Purpose |
|-----------|---------|
| `HtmlPreviewButton.tsx` | Button component for HTML preview |
| `VideoDownloadButton.tsx` | Main video generation button |
| `SlideImageDownloadButton.tsx` | Download slide images |
| `StandaloneSlideImageButton.tsx` | Generate standalone slide image |
| `SlideVideoButton.tsx` | Generate slide-only video |

---

## API Endpoint Details

### Endpoint Implementation
**File:** `onyx-cutom/custom_extensions/backend/main.py`

**Route:** `/slide-html/preview`

**Method:** POST

**Purpose:** Generate static HTML for a single slide with positioning

**Returns:** HTML string with debug comments

---

## Next Steps

### Immediate Testing:
1. Open a Video Lesson Presentation
2. Drag an element to a new position
3. Click "🔍 Preview HTML"
4. Verify HTML shows correct positioning

### Advanced Testing:
1. Drag multiple elements
2. Preview HTML
3. Check all elements have correct positions
4. Verify scale factors use actual canvas (852×600)

### Verification:
1. Compare element positions in editor vs HTML
2. Proportions should match exactly
3. No horizontal or vertical offset
4. Debug comments show correct calculations

---

## Status

✅ **IMPLEMENTATION COMPLETE**

- [x] HtmlPreviewButton component exists and works
- [x] Imported in page.tsx
- [x] Added to toolbar next to VideoDownloadButton
- [x] Proper error/success handlers
- [x] Styled to match UI theme
- [x] No linting errors
- [x] Ready for testing

---

**Implementation Date:** October 10, 2025  
**Component:** Video Lesson Presentation UI  
**Purpose:** Debug text positioning before video generation  
**Status:** Ready for user testing  

---

## Summary

The HTML Preview debug button has been successfully added to the new UI (`page.tsx`). It appears next to the "Create Professional Video" button and allows users to preview the static HTML with all positioning applied before generating the video. This provides a critical debugging tool for verifying coordinate scaling and element positioning.

**Click the purple "🔍 Preview HTML" button to test it!**

