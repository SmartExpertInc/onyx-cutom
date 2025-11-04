# Avatar Position Analysis - Course Overview Slide

## How `avatarPosition` is Applied to Output Video

### 1. Video Composition Flow

The `avatarPosition` settings from `registry.ts` are used during frame-by-frame video composition in `simple_video_composer.py`:

**File**: `onyx-cutom/custom_extensions/backend/app/services/simple_video_composer.py`

**Key Method**: `_compose_frames()` (lines 202-356)

**Process**:
1. **Slide video** is used as the **full background canvas** (1920×1080 pixels)
2. **Avatar video** is cropped/scaled to match `avatarPosition.width` × `avatarPosition.height`
3. **Background color** (if specified) is drawn as a rectangle at position `(x, y)` with size `(width, height)`
4. **Avatar video** is overlaid on top of the background rectangle at the same position

**Code Reference**:
```python
# Lines 305-319: Avatar positioning logic
x = avatar_config['x']           # Absolute X position on 1920×1080 slide
y = avatar_config['y']           # Absolute Y position on 1920×1080 slide
avatar_width = avatar_config['width']
avatar_height = avatar_config['height']

# Draw background color behind avatar if specified
if 'backgroundColor' in avatar_config:
    bg_color = self._hex_to_bgr(avatar_config['backgroundColor'])
    cv2.rectangle(background, (x, y), (x + avatar_width, y + avatar_height), bg_color, -1)

# Overlay avatar video
background[y:y + avatar_height, x:x + avatar_width] = avatar_cropped
```

**Critical Point**: The `x`, `y`, `width`, `height` values are **absolute pixel coordinates** on the 1920×1080 slide canvas, NOT relative to any container.

---

## Current Registry Settings

**File**: `onyx-cutom/custom_extensions/frontend/src/components/templates/registry.ts` (lines 1623-1629)

```typescript
avatarPosition: {
  x: 925,       // Right side of slide
  y: 118,       // Vertically centered
  width: 935,
  height: 843,
  backgroundColor: '#ffffff'  // White background for avatar video
}
```

---

## Measured Values (from Logs)

**Right Panel Position**:
- **X**: 864px
- **Y**: 0px  
- **Width**: 1056px
- **Height**: 1080px
- **Right Edge**: 1920px (864 + 1056) ✅

**Note**: The logs do NOT include the image-container position. This is needed to verify alignment.

---

## Analysis & Verification

### ✅ Current Avatar Position Checks

1. **X Position**: 925px
   - Relative to right panel: 925 - 864 = **61px from left edge of right panel** ✅
   - Fits within right panel: 925 ≥ 864 ✅

2. **Width**: 935px
   - Avatar right edge: 925 + 935 = **1860px**
   - Fits within slide: 1860 < 1920 ✅
   - Fits within right panel: 1860 < (864 + 1056) = 1920 ✅

3. **Y Position**: 118px
   - From top of slide: 118px ✅
   - Fits within slide: 118 < 1080 ✅

4. **Height**: 843px
   - Avatar bottom edge: 118 + 843 = **961px**
   - Fits within slide: 961 < 1080 ✅

### ⚠️ Missing Information

**Image Container Position** is NOT in the provided logs. To properly verify alignment, we need:
- Image container X position (should match avatar x: 925px)
- Image container Y position (should match avatar y: 118px)
- Image container width (should match avatar width: 935px)
- Image container height (should match avatar height: 843px)

---

## Expected vs Actual Comparison

Based on CSS analysis:
- **Right Panel**: 55% width = 1056px, starts at X=864px ✅ **MATCHES LOGS**
- **Image Container**: 
  - CSS: `position: absolute; bottom: -43px; height: 91%`
  - Expected height: 91% of 1080px = **982.8px ≈ 983px**
  - Expected Y: 1080 - 983 - 43 = **54px** (but CSS shows `bottom: -43px`, which means it extends below)
  - **Issue**: CSS doesn't specify horizontal position (`left` or `right` not specified)

---

## Recommendations

### Option 1: Measure Image Container (RECOMMENDED)
Run the slide template again and capture the **IMAGE CONTAINER** position from the logs. Then:
- If image container X ≠ 925px → **Update registry x value**
- If image container Y ≠ 118px → **Update registry y value**
- If image container width ≠ 935px → **Update registry width value**
- If image container height ≠ 843px → **Update registry height value**

### Option 2: Update Based on CSS Calculation
If image-container uses default positioning (left: 0 within right-panel):
- **Expected X**: 864px (right panel left edge)
- **But registry says**: 925px (61px offset from left edge)

**Question**: Is there padding or margin on the image-container that creates this 61px offset?

### Option 3: Verify with Visual Testing
Generate a test video with current settings and visually verify if avatar aligns with the image container in the slide.

---

## Changes Applied ✅

**File Updated**: `onyx-cutom/custom_extensions/frontend/src/components/templates/registry.ts`

**Previous Values**:
```typescript
avatarPosition: {
  x: 925,
  y: 118,
  width: 935,
  height: 843
}
```

**Updated Values** (based on measured right panel and CSS calculations):
```typescript
avatarPosition: {
  x: 864,       // ✅ Right panel left edge (measured: 864px)
  y: 140,       // ✅ Calculated from CSS: bottom=-43px, height=983px
  width: 1056,  // ✅ Right panel full width (measured: 1056px)
  height: 983   // ✅ CSS: 91% of 1080px = 983px
}
```

**Rationale**:
1. **X Position (864px)**: Aligns with measured right panel left edge
2. **Width (1056px)**: Matches measured right panel width (image-container should fill the panel)
3. **Height (983px)**: Based on CSS `height: 91%` = 91% of 1080px
4. **Y Position (140px)**: Calculated from `bottom: -43px` and height=983px

**⚠️ Verification Needed**: The Y position (140px) should be verified with actual image-container measurement from browser logs, as the original value was 118px and the calculated value is 140px.

---

## Next Steps

1. **Generate a test video** with updated values and verify avatar alignment
2. **Capture image-container position** from browser logs to confirm Y position
3. **Adjust Y position** if measured value differs from calculated 140px

---

## CSS Reference (for manual calculation)

```css
.course-overview-slide .right-panel {
    width: 55%;           /* = 1056px */
    height: 100%;         /* = 1080px */
    position: relative;
}

.course-overview-slide .image-container {
    position: absolute;
    bottom: -43px;        /* Extends 43px below right-panel */
    height: 91%;          /* = 983px */
    /* No left/right/width specified - likely fills container */
}
```

**Note**: Without explicit horizontal positioning, the image-container might:
- Fill the entire right-panel width (1056px), OR
- Have default positioning (x = 864px relative to slide), OR
- Be centered (requiring calculation)

**This ambiguity is why we need the actual measured position from the browser.**

