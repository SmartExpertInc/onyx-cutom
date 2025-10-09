# Avatar-Service Positioning: Logging Examples

## Complete Log Sequence Example

This document shows a **complete real-world example** of logs generated when a user drags the title element on an avatar-service slide and then generates a video.

---

## Scenario

**Action:** User drags title element from default position to `(-64, 167.98)` on an avatar-service slide

**Slide ID:** `slide-abc123`

**Template:** `avatar-service`

---

## Layer 1: Browser Console - Drag Complete

```javascript
🎯 [DRAG_COMPLETE] Element drag finished
  📍 Element ID: draggable-slide-abc123-0
  📊 Final Position: Object { x: -64, y: 167.98 }
  📏 Drag Distance: 245.67 px
  🎨 Element: H1 slide-title
  🔢 Position State: Object {
    transform: "translate(-64px, 167.98px)",
    savedInState: { x: -64, y: 167.98 }
  }
  ➡️ Calling onPositionChange callback...
```

---

## Layer 2: Browser Console - Position Save

```javascript
💾 [POSITION_SAVE] Saving position to slide metadata
  📍 Element ID: draggable-slide-abc123-0
  📊 Position: Object { x: -64, y: 167.98 }
  🎬 Slide ID: slide-abc123
  🎨 Template ID: avatar-service
  🎯 AVATAR-SERVICE SLIDE DETECTED!
  📐 Editor Canvas: 1174×600px
  🎥 Video Canvas: 1920×1080px
  📏 Scale Factors: Object {
    scaleX: "1.635",
    scaleY: "1.800"
  }
  🔢 Expected Scaled Position: Object {
    scaledX: "-104.64",
    scaledY: "302.36"
  }
  📦 Updated Metadata: Object {
    previousPositions: {},
    newPositions: {
      draggable-slide-abc123-0: { x: -64, y: 167.98 }
    },
    totalElementsPositioned: 1
  }
  ✅ Position saved successfully
```

---

## Layer 3: Server Logs - Backend Scaling Analysis

```
INFO: 🎬 [HTML_TEMPLATE] Generating HTML for template: avatar-service, theme: dark-purple
INFO: 🎬 [HTML_TEMPLATE] Props received:
INFO:   - Props type: <class 'dict'>
INFO:   - Props keys: ['title', 'subtitle', 'content', 'avatarPath', 'avatarAlt']
INFO: 🎬 [HTML_TEMPLATE] Metadata received: {'elementPositions': {'draggable-slide-abc123-0': {'x': -64, 'y': 167.98}}, 'updatedAt': '2025-10-09T12:34:56.789Z'}
INFO: 🎬 [HTML_TEMPLATE] Slide ID received: slide-abc123
INFO: 
INFO: ═══════════════════════════════════════════════════════════════════════════
INFO: 🎯 [AVATAR-SERVICE] COORDINATE SCALING ANALYSIS
INFO: ═══════════════════════════════════════════════════════════════════════════
INFO: Template: avatar-service
INFO: Slide ID: slide-abc123
INFO: 
INFO: 📐 Canvas Dimensions:
INFO:   - Editor Canvas: 1174×600px
INFO:   - Video Canvas:  1920×1080px
INFO: 
INFO: 📏 Scale Factors:
INFO:   - SCALE_X: 1.635971 (1920/1174)
INFO:   - SCALE_Y: 1.800000 (1080/600)
INFO: 
INFO: 📍 Element Positions to be Scaled:
INFO:   Total elements: 1
INFO: 
INFO:   Element: draggable-slide-abc123-0
INFO:     Original (Editor):  x=-64.00px, y=167.98px
INFO:     Scaled (Video):     x=-104.64px, y=302.36px
INFO:     Calculation:        x=-64.00×1.636=-104.64, y=167.98×1.800=302.36
INFO:     Final Transform:    translate(-104.64px, 302.36px)
INFO: 
INFO: ═══════════════════════════════════════════════════════════════════════════
INFO: 
INFO: 🔍 [TEXT_POSITIONING_DEBUG] === RENDERING TEMPLATE ===
INFO: 🎬 [HTML_TEMPLATE] HTML content generated successfully
INFO: 🎬 [HTML_TEMPLATE] HTML content length: 12456 characters
```

---

## Layer 4: Generated HTML - Header Comment

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- ... styles ... -->
</head>
<body>
    <!-- ... scale factor definitions ... -->
    
    <div class="slide-page">
        <div class="slide-content theme-dark-purple">
            <!-- 
            ═══════════════════════════════════════════════════════════════════════════
            🔍 AVATAR-SERVICE POSITIONING DEBUG LOG
            ═══════════════════════════════════════════════════════════════════════════
            Template ID: avatar-service
            Slide ID: slide-abc123
            Canvas Dimensions:
              - Editor: 1174×600px
              - Video:  1920×1080px
            Scale Factors:
              - SCALE_X: 1.635971223021583 (1920/1174)
              - SCALE_Y: 1.8 (1080/600)
            
            Metadata Available: YES
            Element Positions Available: YES
            Total Positioned Elements: 1
            Position Keys: ['draggable-slide-abc123-0']
            ═══════════════════════════════════════════════════════════════════════════
            -->
            
            <div class="avatar-service">
                <!-- Dark shape -->
                <div class="dark-shape"></div>
                
                <div class="content-container">
                    <div class="left-content">
```

---

## Layer 4: Generated HTML - Title Element

```html
                        <!-- Title with positioning support -->
                        <!-- 
                        ───────────────────────────────────────────────────────────────
                        📍 TITLE POSITIONING
                        ───────────────────────────────────────────────────────────────
                        Element ID: draggable-slide-abc123-0
                        Original Position (Editor Canvas):
                          x: -64px
                          y: 167.98px
                        
                        Scaling Calculation:
                          scaledX = -64 × 1.635971223021583 = -104.70215587338052px
                          scaledY = 167.98 × 1.8 = 302.364px
                        
                        Final Transform: translate(-104.70215587338052px, 302.364px)
                        ───────────────────────────────────────────────────────────────
                        -->
                        <h1 class="slide-title positioned-element" 
                            style="transform: translate(-104.70215587338052px, 302.364px);">
                            Professional Service Excellence
                        </h1>
```

---

## Multi-Element Example

When **all three elements** (title, subtitle, content) are positioned:

### Browser Console

```javascript
// First drag - Title
🎯 [DRAG_COMPLETE] Element drag finished
  📍 Element ID: draggable-slide-abc123-0
  📊 Final Position: { x: -64, y: 167.98 }

💾 [POSITION_SAVE] Saving position to slide metadata
  📍 Element ID: draggable-slide-abc123-0
  🔢 Expected Scaled Position: { scaledX: "-104.64", scaledY: "302.36" }
  📦 Updated Metadata: { totalElementsPositioned: 1 }

// Second drag - Subtitle
🎯 [DRAG_COMPLETE] Element drag finished
  📍 Element ID: draggable-slide-abc123-1
  📊 Final Position: { x: 20, y: 250 }

💾 [POSITION_SAVE] Saving position to slide metadata
  📍 Element ID: draggable-slide-abc123-1
  🔢 Expected Scaled Position: { scaledX: "32.72", scaledY: "450.00" }
  📦 Updated Metadata: { totalElementsPositioned: 2 }

// Third drag - Content
🎯 [DRAG_COMPLETE] Element drag finished
  📍 Element ID: draggable-slide-abc123-2
  📊 Final Position: { x: 15, y: 330 }

💾 [POSITION_SAVE] Saving position to slide metadata
  📍 Element ID: draggable-slide-abc123-2
  🔢 Expected Scaled Position: { scaledX: "24.54", scaledY: "594.00" }
  📦 Updated Metadata: { totalElementsPositioned: 3 }
```

### Server Logs

```
INFO: 🎯 [AVATAR-SERVICE] COORDINATE SCALING ANALYSIS
INFO: 📍 Element Positions to be Scaled:
INFO:   Total elements: 3
INFO: 
INFO:   Element: draggable-slide-abc123-0
INFO:     Original (Editor):  x=-64.00px, y=167.98px
INFO:     Scaled (Video):     x=-104.64px, y=302.36px
INFO:     Calculation:        x=-64.00×1.636=-104.64, y=167.98×1.800=302.36
INFO:     Final Transform:    translate(-104.64px, 302.36px)
INFO: 
INFO:   Element: draggable-slide-abc123-1
INFO:     Original (Editor):  x=20.00px, y=250.00px
INFO:     Scaled (Video):     x=32.72px, y=450.00px
INFO:     Calculation:        x=20.00×1.636=32.72, y=250.00×1.800=450.00
INFO:     Final Transform:    translate(32.72px, 450.00px)
INFO: 
INFO:   Element: draggable-slide-abc123-2
INFO:     Original (Editor):  x=15.00px, y=330.00px
INFO:     Scaled (Video):     x=24.54px, y=594.00px
INFO:     Calculation:        x=15.00×1.636=24.54, y=330.00×1.800=594.00
INFO:     Final Transform:    translate(24.54px, 594.00px)
```

---

## Error Case: No Metadata Available

### Server Logs

```
INFO: 🎯 [AVATAR-SERVICE] COORDINATE SCALING ANALYSIS
INFO: ⚠️ No element positions found in metadata
INFO:    Elements will use default layout positions
INFO: 
INFO: ═══════════════════════════════════════════════════════════════════════════
```

### Generated HTML

```html
<!-- 
═══════════════════════════════════════════════════════════════════════════
🔍 AVATAR-SERVICE POSITIONING DEBUG LOG
═══════════════════════════════════════════════════════════════════════════
Metadata Available: NO
Element Positions Available: NO
═══════════════════════════════════════════════════════════════════════════
-->

<!-- 📍 TITLE: No metadata available, using default layout -->
<h1 class="slide-title">Professional Service Excellence</h1>

<!-- 📍 SUBTITLE: No metadata available, using default layout -->
<h2 class="slide-subtitle">Expert Solutions</h2>

<!-- 📍 CONTENT: No metadata available, using default layout -->
<p class="content-text">Delivering exceptional results...</p>
```

---

## Debugging Workflow Example

### Problem: Element appears in wrong position in video

**Step 1:** Check Browser Console
```javascript
✅ 🎯 [DRAG_COMPLETE] logged
✅ 💾 [POSITION_SAVE] logged
✅ Expected Scaled Position shown
```

**Step 2:** Check Server Logs
```
✅ 🎯 [AVATAR-SERVICE] COORDINATE SCALING ANALYSIS found
✅ Element positions logged
✅ Calculations shown
⚠️ PROBLEM FOUND: scaledX = -64.00×1.636=1046.40 (should be negative!)
```

**Step 3:** Check Generated HTML
```html
✅ Positioning comments present
⚠️ Transform shows: translate(1046.40px, 302.36px)
   SHOULD BE: translate(-104.64px, 302.36px)
```

**Conclusion:** Bug in coordinate scaling calculation (missing negative sign)

---

## Search Commands for Logs

### Browser Console (DevTools)

Filter by log markers:
- `DRAG_COMPLETE`
- `POSITION_SAVE`
- `AVATAR-SERVICE`

### Server Logs (grep)

```bash
# Find all avatar-service scaling logs
grep "AVATAR-SERVICE" backend.log

# Find specific element positioning
grep "draggable-slide-abc123-0" backend.log

# Find coordinate calculations
grep "Calculation:" backend.log
```

### Generated HTML (View Source)

```
Ctrl+F (or Cmd+F) then search:
- "POSITIONING DEBUG LOG"
- "TITLE POSITIONING"
- "SUBTITLE POSITIONING"
- "CONTENT POSITIONING"
- "Element ID: draggable-"
```

---

## Log Timestamp Correlation

Match logs across layers using timestamps:

```javascript
// Browser: 12:34:56.789
💾 [POSITION_SAVE] Saving position to slide metadata
  // ... metadata with updatedAt: "2025-10-09T12:34:56.789Z"
```

```
// Server: 12:35:02.123 (request received)
INFO: 🎬 [HTML_TEMPLATE] Metadata received: 
  {'updatedAt': '2025-10-09T12:34:56.789Z'}
```

**Time Difference:** ~5-6 seconds between save and video generation request

---

**Reference:** See `POSITIONING_LOGGING_SYSTEM.md` for complete documentation

**Last Updated:** October 9, 2025

