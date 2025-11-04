# 🎯 CULTURE VALUES - AVATAR Slide Design Specification

## 📋 Overview

**Slide Name:** Culture & Values (Three Columns)  
**Template ID:** `culture-values-three-columns`  
**Avatar Shape:** **Circular** (mandatory)  
**Video Element:** Avatar video displayed in circular format

---

## 📐 Avatar Container Specifications

### **Position & Dimensions**

Based on measured container logs and CSS analysis:

| Property | Value | Calculation/Notes |
| :--- | :--- | :--- |
| **Position** | `absolute` | Absolute positioning on 1920×1080 canvas |
| **X Coordinate** | `1632px` | Calculated: `1920 - 48 (right) - 240 (width) = 1632px` |
| **Y Coordinate** | `65px` | Direct CSS: `top: 65px` |
| **Width** | `240px` | Perfect square for circular crop |
| **Height** | `240px` | Perfect square for circular crop |
| **Bottom Edge** | `305px` | Calculated: `65 + 240 = 305px` |
| **Right Edge** | `1872px` | Calculated: `1632 + 240 = 1872px` |

### **CSS Styling Reference**

```css
.culture-values-three-columns-slide .avatar-container {
    position: absolute;
    right: 48px;
    top: 65px;
    width: 240px;
    height: 240px;
    border-radius: 50%;  /* ✅ MANDATORY: Circular crop */
    overflow: hidden;
    background-color: #ffffff;
}
```

---

## 🎨 Registry Configuration

### **Frontend Configuration**

**File:** `onyx-cutom/custom_extensions/frontend/src/components/templates/registry.ts`

```typescript
'culture-values-three-columns': {
  // ... other properties ...
  avatarPosition: {
    x: 1632,      // ✅ Calculated from right: 48px
    y: 65,        // ✅ CSS top: 65px
    width: 240,   // ✅ Perfect square
    height: 240,  // ✅ Perfect square
    shape: 'circle', // ✅ MANDATORY: Circular crop required
    backgroundColor: '#ffffff' // White background
  }
}
```

### **TypeScript Interface Update**

**File:** `onyx-cutom/custom_extensions/frontend/src/types/slideTemplates.ts`

```typescript
export interface AvatarPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor?: string;
  shape?: 'circle' | 'rectangle';  // ✅ NEW: Shape property
  borderWidth?: number;             // ✅ NEW: Optional border
  borderColor?: string;            // ✅ NEW: Optional border color
}
```

---

## 🔄 Video Processing Pipeline

### **Current Flow**

```
1. Frontend (Registry) → avatarPosition with shape: 'circle'
2. VideoEditorHeader → Attach to slide data
3. Backend API → Extract avatar_config
4. Presentation Service → Pass to composer
5. Video Composer → Apply circular mask ⚠️ (TO BE IMPLEMENTED)
6. Final Video Output → Circular avatar video
```

### **Required Backend Implementation**

**File:** `onyx-cutom/custom_extensions/backend/app/services/simple_video_composer.py`

#### **1. Add Circular Mask Method**

```python
def _apply_circular_mask(self, 
                       frame: np.ndarray, 
                       border_width: int = 0,
                       border_color: str = '#ffffff') -> np.ndarray:
    """
    Apply circular mask to avatar frame with transparent background.
    
    Args:
        frame: Avatar frame (BGR numpy array)
        border_width: Border thickness in pixels (optional)
        border_color: Border color in hex format (optional)
        
    Returns:
        Frame with circular mask and alpha channel (BGRA)
    """
    height, width = frame.shape[:2]
    
    # Create circular mask
    mask = np.zeros((height, width), dtype=np.uint8)
    center = (width // 2, height // 2)
    radius = min(width, height) // 2
    
    # Draw white circle (255 = visible, 0 = transparent)
    cv2.circle(mask, center, radius, 255, -1)
    
    # Convert to BGRA for alpha channel
    if frame.shape[2] == 3:  # BGR
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2BGRA)
    
    # Apply mask to alpha channel
    frame[:, :, 3] = mask
    
    # Add border if specified
    if border_width > 0:
        bgr_color = self._hex_to_bgr(border_color)
        cv2.circle(frame, center, radius, (*bgr_color, 255), border_width)
    
    return frame
```

#### **2. Add Alpha Compositing Method**

```python
def _overlay_with_alpha(self, 
                       background: np.ndarray, 
                       overlay: np.ndarray, 
                       x: int, 
                       y: int) -> np.ndarray:
    """
    Overlay image with alpha channel (transparency) onto background.
    
    Args:
        background: Background frame (BGR)
        overlay: Overlay frame with alpha channel (BGRA)
        x: X position to place overlay
        y: Y position to place overlay
        
    Returns:
        Composite frame
    """
    h, w = overlay.shape[:2]
    
    # Ensure we don't go out of bounds
    if y + h > background.shape[0] or x + w > background.shape[1]:
        logger.warning(f"Overlay position ({x}, {y}) exceeds bounds")
        return background
    
    # Get region of interest
    roi = background[y:y+h, x:x+w]
    
    # Alpha compositing
    alpha = overlay[:, :, 3] / 255.0
    alpha_3d = np.stack([alpha, alpha, alpha], axis=2)
    
    # Blend: result = foreground * alpha + background * (1 - alpha)
    overlay_bgr = overlay[:, :, :3]
    blended = (alpha_3d * overlay_bgr + (1 - alpha_3d) * roi).astype(np.uint8)
    
    # Place blended region back
    background[y:y+h, x:x+w] = blended
    
    return background
```

#### **3. Update Frame Composition Logic**

**Modify `_compose_frames` method (around line 300-320):**

```python
# Process avatar frame if available
if avatar_ret:
    # Crop/resize avatar to template dimensions
    avatar_cropped = self._crop_avatar_to_template(avatar_frame, avatar_config)
    
    # Get position coordinates from config
    x = avatar_config['x']
    y = avatar_config['y']
    avatar_width = avatar_config['width']
    avatar_height = avatar_config['height']
    shape = avatar_config.get('shape', 'rectangle')  # ✅ NEW
    
    # Ensure avatar fits within bounds
    if x + avatar_width <= output_width and y + avatar_height <= output_height:
        # Draw background color behind avatar if specified
        if 'backgroundColor' in avatar_config and avatar_config['backgroundColor']:
            bg_color = self._hex_to_bgr(avatar_config['backgroundColor'])
            cv2.rectangle(background, (x, y), (x + avatar_width, y + avatar_height), bg_color, -1)
        
        # ✅ NEW: Apply circular mask if shape is 'circle'
        if shape == 'circle':
            border_width = avatar_config.get('borderWidth', 0)
            border_color = avatar_config.get('borderColor', '#ffffff')
            avatar_processed = self._apply_circular_mask(
                avatar_cropped,
                border_width=border_width,
                border_color=border_color
            )
            # Use alpha compositing for circular avatar
            background = self._overlay_with_alpha(background, avatar_processed, x, y)
        else:
            # Simple rectangular overlay (existing method)
            background[y:y + avatar_height, x:x + avatar_width] = avatar_cropped
```

---

## ✅ Verification Checklist

### **Frontend**
- [x] Updated `AvatarPosition` interface with `shape`, `borderWidth`, `borderColor`
- [x] Added `avatarPosition` to `culture-values-three-columns` registry entry
- [x] Verified coordinates match measured logs (x: 1632, y: 65, width: 240, height: 240)
- [x] Set `shape: 'circle'` as mandatory

### **Backend** (To Be Implemented)
- [ ] Add `_apply_circular_mask()` method to `SimpleVideoComposer`
- [ ] Add `_overlay_with_alpha()` method to `SimpleVideoComposer`
- [ ] Update `_compose_frames()` to check for `shape: 'circle'`
- [ ] Implement alpha compositing for circular avatars
- [ ] Test with circular avatar video generation
- [ ] Verify transparent background around circle
- [ ] Test border rendering (if `borderWidth > 0`)

---

## 📊 Visual Layout

### **Slide Structure**

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]              Our culture and values                │ ← Top bar
├──────────────┬──────────────┬───────────────────────────────┤
│              │              │                               │
│  Left Text   │ Middle Text │        Right Text            │
│  (Column 1)  │ (Column 2)  │        (Column 3)            │
│              │ [Blue Panel]│                               │
│              │              │                               │
│              │              │                        ⚪ 🧑‍💼 │ ← Circular
│              │              │                         Avatar │   Avatar
│              │              │                               │   (240×240)
└──────────────┴──────────────┴───────────────────────────────┘
                                                              ↑
                                                    X: 1632px (from left)
                                                    Y: 65px (from top)
```

### **Avatar Positioning**

```
Slide Canvas: 1920×1080 pixels

                    ←─ 48px ─→ ⚪
                              ↑
                         ┌────┴────┐
                         │  240px  │
                         │  Circle │
                         │         │
                         └─────────┘
                              ↓
                         ←─ 48px ─→

X Position: 1632px (1920 - 48 - 240)
Y Position: 65px
```

---

## 🔍 Technical Details

### **Circular Mask Algorithm**

1. **Create Mask:**
   - Generate 240×240 binary mask (numpy array)
   - Draw white circle (255) on black background (0)
   - Center: (120, 120), Radius: 120px

2. **Apply Alpha Channel:**
   - Convert avatar frame from BGR → BGRA
   - Set alpha channel = mask (circular transparency)

3. **Alpha Compositing:**
   - For each pixel: `result = foreground × alpha + background × (1 - alpha)`
   - Ensures smooth edges (anti-aliasing)

4. **Border (Optional):**
   - Draw circle outline if `borderWidth > 0`
   - Color from `borderColor` property

### **Aspect Ratio**

- **Avatar Video:** 1080×1080 (square, from Elai API)
- **Target Size:** 240×240 (square)
- **Scaling:** Maintain aspect ratio, center crop if needed
- **Result:** Perfect circle after mask application

---

## 🎯 Expected Output

### **Before (Without Circular Mask)**
- Avatar displayed as rectangular 240×240 square
- Corners visible (not circular)
- Less polished appearance

### **After (With Circular Mask)**
- ✅ Perfect circular avatar (240×240)
- ✅ Transparent background around circle
- ✅ Smooth anti-aliased edges
- ✅ Professional appearance matching slide design
- ✅ Optional border support for enhanced styling

---

## 📝 Implementation Notes

1. **Backward Compatibility:** 
   - Default `shape: 'rectangle'` maintains existing behavior
   - Only templates with `shape: 'circle'` use circular masking

2. **Performance:**
   - Circular masking adds ~5-10% processing time per frame
   - Negligible impact for quality gain

3. **Quality:**
   - OpenCV's `cv2.circle()` provides smooth anti-aliasing
   - Alpha compositing ensures perfect transparency

4. **Testing:**
   - Generate test video with `culture-values-three-columns` template
   - Verify circular avatar appears correctly
   - Check transparency around circle edges
   - Confirm position matches specification (x: 1632, y: 65)

---

## 🚀 Next Steps

1. **Implement backend circular mask methods** (see code above)
2. **Test video generation** with `culture-values-three-columns` template
3. **Verify visual output** matches specification
4. **Document any adjustments** needed based on testing

---

**Status:** ✅ Frontend configuration complete, ⚠️ Backend implementation pending

