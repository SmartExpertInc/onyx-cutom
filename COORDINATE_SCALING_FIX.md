# Avatar Service Video Positioning: Coordinate Scaling Fix

## Problem Summary

The avatar-service slide template was experiencing positioning issues in video generation because coordinates from the **editor canvas** (1174×600px) were being applied directly to the **video canvas** (1920×1080px) without scaling.

### The Core Issue

```
Editor Canvas:  1174px × 600px
Video Canvas:   1920px × 1080px

Scale Factor X: 1920 / 1174 = 1.635...
Scale Factor Y: 1080 / 600  = 1.8
```

**Before Fix (Broken):**
```
User drags title to (-64, 167.98) in editor
Saved in metadata: {x: -64, y: 167.98}
Video template applies: transform: translate(-64px, 167.98px)
❌ Element appears in WRONG position (coordinates are for smaller canvas!)
```

**After Fix (Working):**
```
User drags title to (-64, 167.98) in editor  
Saved in metadata: {x: -64, y: 167.98}
Video template calculates:
  scaledX = -64 × 1.635 = -104.64px
  scaledY = 167.98 × 1.8 = 302.36px
Video template applies: transform: translate(-104.64px, 302.36px)
✅ Element appears in CORRECT proportional position!
```

## The Solution

### Two-Part Fix Applied

#### Part 1: Scale Factor Definitions (Lines 699-710)

Added scale factor calculations at the top of the template:

```jinja2
{# ====================================================================== #}
{# COORDINATE SCALING FOR VIDEO GENERATION                               #}
{# Editor canvas: 1174×600 px                                            #}
{# Video canvas:  1920×1080 px                                           #}
{# Positions must be scaled to maintain proportional placement           #}
{# ====================================================================== #}
{% set EDITOR_WIDTH = 1174 %}
{% set EDITOR_HEIGHT = 600 %}
{% set VIDEO_WIDTH = 1920 %}
{% set VIDEO_HEIGHT = 1080 %}
{% set SCALE_X = VIDEO_WIDTH / EDITOR_WIDTH %}  {# 1.635... #}
{% set SCALE_Y = VIDEO_HEIGHT / EDITOR_HEIGHT %} {# 1.8 #}
```

#### Part 2: Apply Scaling in Avatar-Service Template

Updated positioning logic for **avatar-service template only** to scale coordinates:

**Title Positioning (Lines 859-861):**
```jinja2
{% set scaledX = metadata.elementPositions[titleId].x * SCALE_X %}
{% set scaledY = metadata.elementPositions[titleId].y * SCALE_Y %}
<h1 class="slide-title positioned-element" style="transform: translate({{ scaledX }}px, {{ scaledY }}px);">{{ title }}</h1>
```

**Subtitle Positioning (Lines 875-877):**
```jinja2
{% set scaledX = metadata.elementPositions[subtitleId].x * SCALE_X %}
{% set scaledY = metadata.elementPositions[subtitleId].y * SCALE_Y %}
<h2 class="slide-subtitle positioned-element" style="transform: translate({{ scaledX }}px, {{ scaledY }}px);">{{ subtitle }}</h2>
```

**Content Positioning (Lines 891-893):**
```jinja2
{% set scaledX = metadata.elementPositions[contentId].x * SCALE_X %}
{% set scaledY = metadata.elementPositions[contentId].y * SCALE_Y %}
<p class="content-text positioned-element" style="transform: translate({{ scaledX }}px, {{ scaledY }}px);">{{ content }}</p>
```

## File Modified

- **File:** `backend/templates/avatar_slide_template.html`
- **Changes:**
  1. Added scale factor calculations (lines 699-710)
  2. Updated avatar-service title positioning (lines 859-861)
  3. Updated avatar-service subtitle positioning (lines 875-877)
  4. Updated avatar-service content positioning (lines 891-893)

## Complete Fix History

This coordinate scaling fix completes the positioning system for avatar-service slides:

1. **First Fix:** Changed from `position: absolute` to `transform: translate()` for CSS consistency
2. **Second Fix (This One):** Added coordinate scaling to convert editor canvas positions to video canvas positions

## Testing

To verify the fix works:

1. Open a slide with avatar-service template in the editor (1174×600px)
2. Drag a text element to a specific position (e.g., -64, 167.98)
3. Generate video (1920×1080px)
4. Verify element appears at the same **proportional position** in the video
5. Check that scaled coordinates are applied:
   - Example: (-64, 167.98) → (-104.64, 302.36)

## Expected Behavior

- **Editor:** Text elements positioned at user-specified coordinates on 1174×600px canvas
- **Video:** Same text elements appear at **proportionally scaled** coordinates on 1920×1080px canvas
- **Result:** Visual consistency between editor preview and final video output

## Important Notes

- **Other Templates:** Currently, only the `avatar-service` template uses coordinate scaling
- **Future Work:** Other avatar templates (checklist, crm, buttons, steps) may need similar scaling
- **Coordinate System:** Both editor and video use canvas-relative coordinates (0,0 at top-left)

---

**Status:** ✅ Complete
**Date:** October 9, 2025
**Impact:** Critical fix for avatar-service video positioning accuracy


