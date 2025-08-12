# MoveableManager Debug Guide

## Quick Start

### 1. Enable Debug Mode
In browser console:
```javascript
window.__MOVEABLE_DEBUG__ = true;
```

### 2. Test Image Upload Flow
1. Open a slide with ClickableImagePlaceholder (e.g., BigImageTopTemplate)
2. Click placeholder → select file
3. Watch console logs for the complete flow

### 3. Test Moveable Functionality
1. After image upload, click on the image
2. Look for moveable handles (blue squares)
3. Try dragging and resizing
4. Watch console logs for transform events

## Expected Log Flow

### Image Upload Flow
```
[ClickableImagePlaceholder] handleClick { elementId: "slide-1-image", isEditable: true }
[ClickableImagePlaceholder] handleImageUploaded_start { elementId: "slide-1-image", newImagePath: true, refExists: true }
[ClickableImagePlaceholder] imageLoaded { elementId: "slide-1-image", imgW: 1920, imgH: 1080, refExists: true }
[ClickableImagePlaceholder] sizeCalculation { elementId: "slide-1-image", cropMode: "contain", targetWidth: 384, targetHeight: 216 }
[ClickableImagePlaceholder] handleImageUploaded_complete { elementId: "slide-1-image", newImagePath: true, refExists: true, targetWidth: 384, targetHeight: 216 }
[BigImageTopTemplate] handleImageUploaded { slideId: "slide-1", newImagePath: true, imageRefExists: true }
[BigImageTopTemplate] handleSizeTransformChange { slideId: "slide-1", payload: {...}, imageRefExists: true }
```

### Moveable Registration Flow
```
[BigImageTopTemplate] render { slideId: "slide-1", isEditable: true, hasImagePath: true, imageRefExists: true }
[useMoveableManager] hookInit { slideId: "slide-1", isEditable: true, hasOnUpdate: true }
[BigImageTopTemplate] moveableElementsCreated { slideId: "slide-1", elementsCount: 3, elementIds: ["slide-1-image", "slide-1-title", "slide-1-subtitle"], isEnabled: true }
[MoveableManager] render { slideId: "slide-1", isEnabled: true, elementsCount: 3, selectedElementId: null }
[MoveableManager] initializeElements { slideId: "slide-1", elementsCount: 3, elementIds: ["slide-1-image", "slide-1-title", "slide-1-subtitle"] }
[MoveableManager] registerElement { elementId: "slide-1-image", refExists: true, elementType: "image", slideId: "slide-1" }
```

### Element Selection Flow
```
[MoveableManager] elementSelected { elementId: "slide-1-image", elementType: "image", slideId: "slide-1" }
[MoveableManager] renderingMoveable { elementId: "slide-1-image", elementType: "image", isShiftPressed: false, slideId: "slide-1" }
```

### Transform Events
```
[MoveableManager] onDrag { elementId: "slide-1-image", x: 10, y: 5, slideId: "slide-1" }
[useMoveableManager] handlePositionChange { elementId: "slide-1-image", position: {x: 10, y: 5}, slideId: "slide-1" }
[MoveableManager] onDragEnd { elementId: "slide-1-image", x: 15, y: 8, slideId: "slide-1" }
[useMoveableManager] handleTransformEnd { elementId: "slide-1-image", transform: {...}, slideId: "slide-1" }
```

## Common Issues & Solutions

### Issue 1: Images Disappear After Upload

**Symptoms:**
- Image preview appears briefly then disappears
- No error in console
- `imagePath` becomes undefined

**Debug Steps:**
1. Check if `onImageUploaded` is called with valid URL
2. Verify `imagePath` prop is being set correctly
3. Look for race conditions in state updates

**Expected Logs:**
```
[ClickableImagePlaceholder] handleImageUploaded_start { elementId: "slide-1-image", newImagePath: true, refExists: true }
[BigImageTopTemplate] handleImageUploaded { slideId: "slide-1", newImagePath: true, imageRefExists: true }
[ClickableImagePlaceholder] renderingImage { elementId: "slide-1-image", imagePath: true, refExists: true, cropMode: "contain" }
```

### Issue 2: MoveableManager Not Attaching

**Symptoms:**
- No blue handles appear when clicking elements
- Elements not draggable
- `isEnabled` might be false

**Debug Steps:**
1. Check if `isEditable` is true
2. Verify refs are properly connected
3. Look for missing `data-moveable-element` attributes

**Expected Logs:**
```
[BigImageTopTemplate] render { slideId: "slide-1", isEditable: true, hasImagePath: true, imageRefExists: true }
[MoveableManager] render { slideId: "slide-1", isEnabled: true, elementsCount: 3, selectedElementId: null }
[MoveableManager] registerElement { elementId: "slide-1-image", refExists: true, elementType: "image", slideId: "slide-1" }
```

### Issue 3: Crop Modal Issues

**Symptoms:**
- Crop button appears but modal doesn't work
- Crop options don't persist
- Image doesn't update after crop change

**Debug Steps:**
1. Check if `handleCropModeChange` is called
2. Verify `onCropModeChange` callback is working
3. Look for state update issues

**Expected Logs:**
```
[ClickableImagePlaceholder] cropButtonClick { elementId: "slide-1-image" }
[ClickableImagePlaceholder] handleCropModeChange { elementId: "slide-1-image", oldMode: "contain", newMode: "cover", hasDimensions: true }
[BigImageTopTemplate] handleCropModeChange { slideId: "slide-1", mode: "cover", imageRefExists: true }
[useMoveableManager] handleCropModeChange { elementId: "slide-1-image", cropMode: "cover", slideId: "slide-1" }
```

## Runtime Assertions

The system includes runtime assertions that will show in console when debug mode is enabled:

```javascript
// These will show if refs are missing
console.assert(!!imageRef.current, '[BigImageTopTemplate] Missing imageRef for slide-1-image');
console.assert(!!titleRef.current, '[BigImageTopTemplate] Missing titleRef for slide-1-title');
console.assert(!!subtitleRef.current, '[BigImageTopTemplate] Missing subtitleRef for slide-1-subtitle');
```

## Manual Testing Commands

### Enable/Disable Debug
```javascript
// Enable
window.__MOVEABLE_DEBUG__ = true;

// Disable
window.__MOVEABLE_DEBUG__ = false;
```

### Inspect Elements
```javascript
// Import the debug utilities
import { inspectElement, diagnoseMoveableIssues } from '@/utils/debug';

// Inspect a specific element
inspectElement('slide-1-image');

// Run full diagnosis
diagnoseMoveableIssues();
```

### Check Element Styles
```javascript
// Check if element has correct attributes
document.querySelector('[data-moveable-element="slide-1-image"]');

// Check computed styles
const element = document.querySelector('[data-moveable-element="slide-1-image"]');
const styles = window.getComputedStyle(element);
console.log('Position:', styles.position);
console.log('Transform:', styles.transform);
console.log('Pointer Events:', styles.pointerEvents);
```

## Network Debugging

### Check Upload Requests
1. Open DevTools → Network tab
2. Upload an image
3. Look for the upload request
4. Check response status and URL

### Expected Network Flow
```
POST /api/upload-image
Status: 200
Response: { url: "https://cdn.example.com/image.jpg" }
```

## Performance Monitoring

### Check for Memory Leaks
```javascript
// Monitor component re-renders
let renderCount = 0;
const originalLog = console.log;
console.log = function(...args) {
  if (args[0]?.includes('render')) {
    renderCount++;
    console.log(`[Render #${renderCount}]`, ...args);
  }
  originalLog.apply(console, args);
};
```

### Monitor Event Listeners
```javascript
// Check for event listener leaks
const originalAddEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function(type, listener, options) {
  console.log(`[Event] Adding ${type} listener to`, this);
  return originalAddEventListener.call(this, type, listener, options);
};
```

## Troubleshooting Checklist

- [ ] Debug mode enabled (`window.__MOVEABLE_DEBUG__ = true`)
- [ ] Console logs showing expected flow
- [ ] No runtime assertions failing
- [ ] Refs properly connected (`refExists: true`)
- [ ] `isEditable` is true
- [ ] `data-moveable-element` attributes present
- [ ] No CSS conflicts (pointer-events, z-index)
- [ ] Network requests successful
- [ ] Image URLs valid and accessible
- [ ] No race conditions in state updates

## Reporting Issues

When reporting issues, include:

1. **Console logs** (with debug mode enabled)
2. **Network tab** (HAR file if needed)
3. **Steps to reproduce**
4. **Expected vs actual behavior**
5. **Browser/OS information**
6. **Any error messages**

Example report:
```
Issue: Images disappear after upload

Steps:
1. Open BigImageTopTemplate
2. Click placeholder
3. Select image file
4. Image appears briefly then disappears

Console logs:
[ClickableImagePlaceholder] handleImageUploaded_start { elementId: "slide-1-image", newImagePath: true, refExists: true }
[BigImageTopTemplate] handleImageUploaded { slideId: "slide-1", newImagePath: true, imageRefExists: true }
// ... more logs

Expected: Image should persist and be draggable
Actual: Image disappears after upload
```
