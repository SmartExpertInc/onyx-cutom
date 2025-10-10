# 🔍 Debug HTML Preview Feature

## Overview

A debug button has been added to the new video lesson UI (projects-2) that allows users to preview the static HTML output with finalized text positioning **before** committing to full video generation. This mirrors functionality from the old UI and provides critical verification for the coordinate scaling fix.

---

## Location

**File:** `onyx-cutom/custom_extensions/frontend/src/app/projects-2/view/components/VideoEditorHeader.tsx`

**Button Position:** In the header, between the "Share" button and "Generate" button

```
[Home] [Tools...] [Resize] [Grid] [Upgrade]     [Video Title]     [Play] | [Share] [Debug] [Generate]
                                                                                      ↑ NEW
```

---

## Implementation Details

### 1. Debug Button (Lines 1084-1095)

```tsx
<button
  onClick={handleDebugHtmlPreview}
  className="bg-gray-50 border-gray-300 text-black hover:bg-gray-100 rounded-[7px] px-3 py-1.5 border flex items-center gap-1.5 h-8 cursor-pointer"
  title="Preview static HTML with finalized text positioning"
>
  <svg>...</svg>  {/* Code brackets icon */}
  <span className="text-sm font-normal">Debug</span>
</button>
```

**Visual Design:**
- Gray background with border (matches "Share" button style)
- Code brackets icon (`</>`) for developer-friendly recognition
- Hover effect for interactivity
- Tooltip: "Preview static HTML with finalized text positioning"

---

### 2. Handler Function (Lines 172-230)

```tsx
const handleDebugHtmlPreview = async () => {
  try {
    // 1. Extract slide data from current state
    const slideData = await extractSlideData();
    
    if (!slideData.slides || slideData.slides.length === 0) {
      alert('No slide data found. Please make sure you have at least one slide.');
      return;
    }

    // 2. Call HTML preview endpoint
    const response = await fetch(`${CUSTOM_BACKEND_URL}/slide-html/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        slides: slideData.slides,
        theme: slideData.theme || 'dark-purple'
      })
    });

    if (!response.ok) {
      alert(`Failed to generate HTML preview: ${response.status}`);
      return;
    }

    // 3. Get HTML content and open in new window
    const htmlContent = await response.text();
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(htmlContent);
      previewWindow.document.close();
    } else {
      alert('Failed to open preview window. Please allow popups for this site.');
    }

  } catch (error) {
    alert(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
  }
};
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ User clicks "Debug" button                                       │
└────────────────────┬────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ handleDebugHtmlPreview() called                                  │
│ - Extracts current slide data from state                        │
│ - Uses same extractSlideData() as video generation              │
└────────────────────┬────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ POST /api/custom/slide-html/preview                             │
│ Body: {                                                          │
│   slides: [...],  // All slides with metadata                   │
│   theme: "dark-purple"                                           │
│ }                                                                │
└────────────────────┬────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ Backend (html_template_service.py)                              │
│ - Processes each slide                                           │
│ - Extracts elementPositions from metadata                        │
│ - Extracts canvasDimensions from metadata (NEW!)                │
│ - Calculates scale factors:                                     │
│   SCALE_X = 1920 / canvasDimensions.width                       │
│   SCALE_Y = 1080 / canvasDimensions.height                      │
│ - Applies scaling to each positioned element                    │
│ - Renders Jinja2 template (avatar_slide_template.html)          │
└────────────────────┬────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ Returns complete HTML with:                                      │
│ - CSS styles (1920×1080 canvas)                                 │
│ - Scaled element positions                                      │
│ - Debug comments showing calculations                           │
│ - All text elements at final positions                          │
└────────────────────┬────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend opens HTML in new window                               │
│ - User sees exact static HTML that would be used for video      │
│ - Can verify text positioning before video generation           │
│ - Can inspect HTML source to see debug comments                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Use Cases

### Use Case 1: Verify Positioning After Drag

**Scenario:** User drags a text element to a new position

**Steps:**
1. Drag title element from default position to `(-89, 36.98)` in editor
2. Click "Debug" button
3. New window opens showing static HTML
4. Verify element appears at correct proportional position
5. Check HTML source comments for calculation details:
   ```html
   <!-- 
   Original Position (Editor Canvas):
     x: -89px
     y: 36.98px
   
   Scaling Calculation:
     scaledX = -89 × 2.254 = -200.56px
     scaledY = 36.98 × 1.8 = 66.57px
   
   Final Transform: translate(-200.56px, 66.57px)
   -->
   ```

---

### Use Case 2: Debug Coordinate Scaling

**Scenario:** Developer wants to verify the actual canvas dimensions fix is working

**Steps:**
1. Open avatar-service slide
2. Drag an element
3. Click "Debug" button
4. Open browser DevTools (F12) → Console
5. Check logs for:
   ```javascript
   🔍 [DEBUG_HTML_PREVIEW] Starting HTML preview generation...
   🔍 [DEBUG_HTML_PREVIEW] Slide data extracted: {slideCount: 1, theme: "dark-purple"}
   🔍 [DEBUG_HTML_PREVIEW] HTML generated successfully, length: 27070
   🔍 [DEBUG_HTML_PREVIEW] Preview opened in new window
   ```
6. In new window, view source and search for "Canvas Dimensions Analysis"
7. Verify it shows:
   ```html
   ACTUAL Editor Canvas (from metadata):
     - Width:  852.01px
     - Source: metadata.canvasDimensions  ✅
   ```
8. Confirm scale factors use actual dimensions:
   ```html
   SCALE_X: 2.253521 (1920/852)  ✅ CORRECT
   ```

---

### Use Case 3: Compare Editor vs Video Output

**Scenario:** User wants to ensure editor preview matches video output

**Steps:**
1. Position elements in editor
2. Click "Debug" to see static HTML preview
3. Compare visual positioning between:
   - Editor preview (left side)
   - Debug HTML preview (new window)
4. Both should show same proportional positions
5. Proceed to "Generate" video only if satisfied

---

## Key Features

### ✅ Same Data Source as Video Generation

The debug preview uses the **exact same** `extractSlideData()` function as video generation, ensuring what you see in the preview is what will be in the video.

```tsx
// Both use the same function
const slideData = await extractSlideData();

// handleDebugHtmlPreview → extractSlideData()
// handleVideoGeneration → extractSlideData()
```

---

### ✅ Shows Actual Canvas Dimensions

The HTML preview includes the critical fix that uses **actual measured canvas dimensions** instead of hardcoded design dimensions.

**Before the fix:**
```
Editor canvas assumed: 1174×600px
Actual canvas: 852×600px
Scale factor: 1920/1174 = 1.635  ❌ WRONG (37.8% error)
```

**After the fix:**
```
Editor canvas measured: 852×600px from metadata.canvasDimensions
Scale factor: 1920/852 = 2.254  ✅ CORRECT
```

The debug preview will show these correct calculations!

---

### ✅ Comprehensive Debug Comments

The generated HTML includes extensive comments for debugging:

```html
<!-- 
═══════════════════════════════════════════════════════════════════════════
🔍 AVATAR-SERVICE POSITIONING DEBUG LOG
═══════════════════════════════════════════════════════════════════════════
Template ID: avatar-service-slide
Slide ID: slide-1760049105947-lroy50so6

📐 Canvas Dimensions Analysis:
  ACTUAL Editor Canvas (from metadata):
    - Width:  852.01px
    - Height: 600.00px
    - Aspect Ratio: 1.420000 (852:600)
    - Source: metadata.canvasDimensions
  
  Video Canvas (Backend):
    - Width:  1920px
    - Height: 1080px
    - Aspect Ratio: 1.778000 (1.778:1 - 16:9)
  
  Dimension Comparison:
    - Width Scaling:  2.253501x (1920/852)
    - Height Scaling: 1.800000x (1080/600)

📏 Scale Factors (using ACTUAL dimensions):
  - SCALE_X: 2.253501 (1920/852)
  - SCALE_Y: 1.800000 (1080/600)

Metadata Available: YES
Canvas Dimensions in Metadata: YES
Element Positions Available: YES
Total Positioned Elements: 2
Position Keys: ['draggable-slide-...-0', 'draggable-slide-...-1']
═══════════════════════════════════════════════════════════════════════════
-->
```

---

### ✅ Per-Element Positioning Details

For each positioned element:

```html
<!-- 
───────────────────────────────────────────────────────────────
📍 TITLE POSITIONING
───────────────────────────────────────────────────────────────
Element ID: draggable-slide-1760049105947-lroy50so6-0
Original Position (Editor Canvas):
  x: -85.05303955078125px
  y: 86px

Scaling Calculation:
  scaledX = -85.053 × 2.254 = -191.667px
  scaledY = 86 × 1.800 = 154.800px

Final Transform: translate(-191.667px, 154.800px)
───────────────────────────────────────────────────────────────
-->
<h1 class="slide-title positioned-element" 
    style="transform: translate(-191.667px, 154.800px);">
  Клиентский сервис - это основа успеха
</h1>
```

This allows developers to:
- See original editor coordinates
- See scaling calculation step-by-step
- See final applied transform
- Verify the math is correct

---

## Error Handling

### No Slides Found
```javascript
alert('No slide data found. Please make sure you have at least one slide.');
```

### API Request Failed
```javascript
alert(`Failed to generate HTML preview: ${response.status} ${response.statusText}`);
```

### Popup Blocked
```javascript
alert('Failed to open preview window. Please allow popups for this site.');
```

### General Errors
```javascript
alert(`Error: ${error.message}`);
```

All errors are logged to console with `🔍 [DEBUG_HTML_PREVIEW]` prefix for easy filtering.

---

## Console Logging

All debug preview operations log to console:

```javascript
🔍 [DEBUG_HTML_PREVIEW] Starting HTML preview generation...
🔍 [DEBUG_HTML_PREVIEW] Slide data extracted: {slideCount: 1, theme: "dark-purple"}
🔍 [DEBUG_HTML_PREVIEW] HTML generated successfully, length: 27070
🔍 [DEBUG_HTML_PREVIEW] Preview opened in new window
```

Or in case of errors:
```javascript
🔍 [DEBUG_HTML_PREVIEW] No slide data found
🔍 [DEBUG_HTML_PREVIEW] Failed to generate HTML: <error details>
🔍 [DEBUG_HTML_PREVIEW] Failed to open preview window (popup blocked?)
🔍 [DEBUG_HTML_PREVIEW] Error generating HTML preview: <error details>
```

---

## Comparison with Old UI

### Old UI (SmartSlideDeckViewer)

**Location:** Toolbar with other slide actions

**Endpoint:** `/api/custom/slide-html/preview`

**Behavior:**
- Single button click
- Opens HTML in new window
- Shows current slide only

### New UI (projects-2) - THIS IMPLEMENTATION

**Location:** Header with Generate button

**Endpoint:** Same `/api/custom/slide-html/preview`

**Behavior:**
- Single button click
- Opens HTML in new window
- Shows **all slides** in deck (improved!)
- Uses same data extraction as video generation (improved!)

---

## Backend Endpoint

**URL:** `/api/custom/slide-html/preview`

**Method:** POST

**Request Body:**
```json
{
  "slides": [
    {
      "slideId": "slide-1760049105947-lroy50so6",
      "templateId": "avatar-service-slide",
      "props": { "title": "...", "content": "..." },
      "metadata": {
        "elementPositions": {
          "draggable-slide-...-0": { "x": -85.053, "y": 86 }
        },
        "canvasDimensions": {
          "width": 852.0075073242188,
          "height": 599.9999389648438,
          "aspectRatio": 1.4200126566581885
        }
      }
    }
  ],
  "theme": "dark-purple"
}
```

**Response:** Complete HTML document (text/html)

**Backend Processing:**
1. Loops through all slides
2. For each slide, extracts:
   - `elementPositions` from metadata
   - `canvasDimensions` from metadata (NEW!)
3. Calculates scale factors using actual dimensions
4. Renders Jinja2 template with scaled positions
5. Concatenates all slide HTML
6. Returns complete HTML document

---

## Testing Checklist

### Basic Functionality
- [ ] Button appears in header between Share and Generate
- [ ] Button has code brackets icon and "Debug" label
- [ ] Clicking button triggers HTML generation
- [ ] New window opens with HTML preview
- [ ] HTML shows current slide content

### Positioning Verification
- [ ] Drag an element in editor
- [ ] Click Debug button
- [ ] Element appears at same proportional position in preview
- [ ] HTML source shows correct original coordinates
- [ ] HTML source shows correct scaled coordinates
- [ ] Transform calculation matches expected values

### Canvas Dimensions Fix
- [ ] HTML source shows "metadata.canvasDimensions" as source
- [ ] Actual canvas width shown (~852px, not 1174px)
- [ ] Scale factors calculated from actual dimensions
- [ ] SCALE_X shows ~2.254 (not 1.635)
- [ ] Debug comments show dimension mismatch warning

### Multiple Slides
- [ ] Create deck with 3+ slides
- [ ] Position elements on different slides
- [ ] Click Debug button
- [ ] All slides shown in preview
- [ ] Each slide has correct positioning

### Error Handling
- [ ] Test with no slides (should show alert)
- [ ] Test with popup blocker enabled (should show alert)
- [ ] Check console for error logs

---

## Benefits

### 🎯 For Users

1. **Verify Before Generating:** See exact positioning before committing to 10-minute video generation
2. **Visual Confirmation:** Compare editor preview with final HTML output
3. **Quick Iteration:** Make positioning adjustments and verify immediately
4. **No Wasted Time:** Avoid generating videos with incorrect positioning

### 🔧 For Developers

1. **Debug Coordinate Scaling:** Verify the actual canvas dimensions fix is working
2. **Inspect Calculations:** View step-by-step scaling math in HTML comments
3. **Compare Data Sources:** Ensure same data used for preview and video generation
4. **Log Analysis:** Comprehensive console logs for troubleshooting

### 📊 For QA

1. **Positioning Tests:** Verify text elements at correct positions
2. **Regression Tests:** Ensure fix remains working after changes
3. **Cross-browser Tests:** Verify HTML renders correctly in different browsers
4. **Dimension Tests:** Verify actual canvas dimensions are captured correctly

---

## Known Limitations

### 1. Popup Blockers

**Issue:** Some browsers block the `window.open()` call

**Mitigation:** User alert prompts to allow popups

**Alternative:** Could download HTML as file instead of opening in window

### 2. Single Window Per Click

**Issue:** Each click replaces previous preview window

**Mitigation:** Use `window.open('', '_blank')` to open new tab each time

**Current Behavior:** Opens in new tab (default browser behavior)

### 3. No Interactive Elements

**Issue:** HTML preview is static, can't edit or drag elements

**Mitigation:** This is intentional - shows final output, not interactive editor

**Use Case:** Verification only, not editing

---

## Future Enhancements

### Possible Improvements

1. **Download as File:**
   ```tsx
   const blob = new Blob([htmlContent], { type: 'text/html' });
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = `slide-preview-${Date.now()}.html`;
   a.click();
   ```

2. **Split Button:**
   - Main: "Debug HTML"
   - Dropdown: "Preview All Slides" / "Preview Current Slide"

3. **Preview Modal:**
   - Instead of new window, show modal with iframe
   - Includes "Download HTML" button
   - Side-by-side editor vs preview comparison

4. **Position Grid Overlay:**
   - Draw grid lines on preview showing coordinate system
   - Highlight positioned elements with labels
   - Show distance measurements between elements

---

## Related Documentation

- `ACTUAL_CANVAS_DIMENSIONS_FIX.md` - Complete explanation of the canvas dimension fix
- `CANVAS_FIX_TESTING_GUIDE.md` - Step-by-step testing instructions
- `COMPLETE_FIX_SUMMARY.md` - Executive summary of the positioning fixes

---

## Conclusion

The debug HTML preview button provides a critical verification step for text positioning before video generation. It:

- ✅ Uses the same data as video generation
- ✅ Shows actual canvas dimensions fix in action
- ✅ Provides comprehensive debug information
- ✅ Saves time by avoiding incorrectly positioned videos
- ✅ Mirrors functionality from the old UI
- ✅ Integrates seamlessly into the new projects-2 interface

**The button is ready for testing and use!** 🎉

---

**Implementation Date:** October 10, 2025  
**Status:** ✅ COMPLETE  
**Location:** `projects-2/view/components/VideoEditorHeader.tsx`  
**Endpoint:** `/api/custom/slide-html/preview`  

