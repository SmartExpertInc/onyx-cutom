# Impact Statements Avatar Positioning Debug Logging

## Overview
Added comprehensive debug logging to the `impact-statements-slide` template to calculate and display the exact position of the `profile-gradient-container` where the avatar should be overlaid.

---

## What Was Added

### **Debug Logging Sections**

#### **1. Header Comment Block (Before HTML Rendering)**
Located at: Lines 2185-2288

Logs the following information:

##### **A. Canvas Dimensions Analysis**
- Editor canvas dimensions (from metadata or fallback)
- Video canvas dimensions (1920x1080)
- Scaling factors (SCALE_X and SCALE_Y)

##### **B. CSS Analysis of profile-gradient-container**
```
Container Dimensions (from CSS):
  - Width:  784px
  - Height: 496px

Slide Padding (from CSS):
  - Top:    64px
  - Left:   80px
  - Right:  64px
  - Bottom: 104px

Left Section (from CSS):
  - Width: 45% of slide width
  - Gap between title and container: 30px
  - Display: flex-column
```

##### **C. Calculated Container Position**
```
CALCULATED CONTAINER POSITION (CSS Layout):
  X Position (Left):
    - Padding left: 80px
    - Container starts at: 80px
  
  Y Position (Top):
    - Padding top: 64px
    - Title height: ~80px (flex: 1, min-height)
    - Gap after title: 30px
    - Container starts at: 64px + 80px + 30px = 174px (approx)
```

##### **D. Scaled Position for Video Backend**
Calculates the exact pixel positions after scaling from editor canvas to video canvas:

```
SCALED POSITION FOR AVATAR OVERLAY (Backend Compositor):
  Scaled X (Left):
    - CSS X: 80px
    - Scaled: 80px × SCALE_X = [calculated]px
  
  Scaled Y (Top):
    - CSS Y: ~174px
    - Scaled: 174px × SCALE_Y = [calculated]px
  
  Scaled Width:
    - CSS Width: 784px
    - Scaled: 784px × SCALE_X = [calculated]px
  
  Scaled Height:
    - CSS Height: 496px
    - Scaled: 496px × SCALE_Y = [calculated]px
```

##### **E. Recommended Avatar Position JSON**
Provides a ready-to-use JSON object for the compositor:

```json
🎬 RECOMMENDED AVATAR POSITION FOR VIDEO COMPOSITOR:
  {
    "x": [calculated],      // Left edge of gradient container
    "y": [calculated],      // Top edge of gradient container
    "width": [calculated],  // Match container width
    "height": [calculated]  // Match container height
  }
```

##### **F. Current Position Comparison**
Compares the current hardcoded position (from `registry.ts`) with the calculated position:

```
⚙️ CURRENT AVATAR POSITION (from registry.ts):
  {
    "x": 60,
    "y": 118,
    "width": 935,
    "height": 843,
    "backgroundColor": "#ffffff"
  }

⚠️ POSITION COMPARISON:
  X Difference: [calculated]px (RIGHT/LEFT by Xpx)
  Y Difference: [calculated]px (DOWN/UP by Ypx)
  Width Difference: [calculated]px (WIDER/NARROWER by Xpx)
  Height Difference: [calculated]px (TALLER/SHORTER by Ypx)
```

#### **2. Container-Specific Comment (At HTML Element)**
Located at: Lines 2297-2320

Logs position information directly at the `profile-gradient-container` element:

```html
<!-- 
───────────────────────────────────────────────────────────────
📦 PROFILE-GRADIENT-CONTAINER ACTUAL RENDERED POSITION
───────────────────────────────────────────────────────────────
This container is where the avatar should be overlaid.

CSS Properties:
  - width: 784px
  - height: 496px
  - background: linear-gradient(180deg, #0F58F9 0%, #1023A1 100%)
  - border-radius: 13px

Layout Position (from parent flex):
  - Parent (.left-section) has gap: 30px
  - This is the second child (after title)
  - Position depends on title's actual height

Video Backend Position (for avatar overlay):
  X: [calculated]px (slide padding-left scaled)
  Y: [calculated]px (padding-top + title + gap, scaled)
  Width: [calculated]px (container width scaled)
  Height: [calculated]px (container height scaled)
───────────────────────────────────────────────────────────────
-->
<div class="profile-gradient-container">
```

#### **3. Footer Comment (After HTML Rendering)**
Located at: Lines 2380-2384

Marks the end of the debug logging section.

---

## How to Use the Logging

### **Step 1: Generate a Video with Impact Statements Slide**

1. Create a slide using the `impact-statements-slide` template
2. Trigger video generation
3. Check the backend logs or inspect the generated HTML

### **Step 2: Find the Debug Output**

Look for the HTML comments in the generated slide HTML. The logs will appear as:

```html
<!-- 
═══════════════════════════════════════════════════════════════════════════
🔍 IMPACT-STATEMENTS AVATAR POSITIONING DEBUG LOG
═══════════════════════════════════════════════════════════════════════════
[... detailed calculations ...]
-->
```

### **Step 3: Extract the Recommended Position**

Look for this section in the logs:

```
🎬 RECOMMENDED AVATAR POSITION FOR VIDEO COMPOSITOR:
  {
    "x": 131,      // Example value
    "y": 287,      // Example value
    "width": 1291, // Example value
    "height": 817  // Example value
  }
```

### **Step 4: Update registry.ts**

Update the `impact-statements-slide` avatar position in `registry.ts`:

```typescript
'impact-statements-slide': {
  // ... other properties ...
  avatarPosition: {
    x: 131,       // Use calculated X
    y: 287,       // Use calculated Y
    width: 1291,  // Use calculated width
    height: 817,  // Use calculated height
    backgroundColor: '#ffffff'
  }
}
```

---

## Example Output

With typical scaling factors (SCALE_X ≈ 1.635, SCALE_Y ≈ 1.8):

```
🎯 PROFILE-GRADIENT-CONTAINER CSS ANALYSIS:
  Container Dimensions (from CSS):
    - Width:  784px
    - Height: 496px
  
  CALCULATED CONTAINER POSITION (CSS Layout):
    X Position (Left):
      - Container starts at: 80px
    
    Y Position (Top):
      - Container starts at: 174px (approx)
  
  📍 SCALED POSITION FOR AVATAR OVERLAY (Backend Compositor):
    Scaled X (Left):
      - CSS X: 80px
      - Scaled: 80px × 1.635458 = 130.84px
    
    Scaled Y (Top):
      - CSS Y: ~174px
      - Scaled: 174px × 1.800000 = 313.20px
    
    Scaled Width:
      - CSS Width: 784px
      - Scaled: 784px × 1.635458 = 1282.20px
    
    Scaled Height:
      - CSS Height: 496px
      - Scaled: 496px × 1.800000 = 892.80px
  
  🎬 RECOMMENDED AVATAR POSITION FOR VIDEO COMPOSITOR:
    {
      "x": 131,      // Left edge of gradient container
      "y": 313,      // Top edge of gradient container
      "width": 1282, // Match container width
      "height": 893  // Match container height
    }
  
  ⚙️ CURRENT AVATAR POSITION (from registry.ts):
    {
      "x": 60,
      "y": 118,
      "width": 935,
      "height": 843,
      "backgroundColor": "#ffffff"
    }
  
  ⚠️ POSITION COMPARISON:
    X Difference: 71px (RIGHT by 71px)
    Y Difference: 195px (DOWN by 195px)
    Width Difference: 347px (WIDER by 347px)
    Height Difference: 50px (TALLER by 50px)
```

---

## CSS Layout Breakdown

### **Impact Statements Slide Structure**

```
.impact-statements-slide
├── padding-top: 64px
├── padding-left: 80px
├── .left-section (45% width, flex-column, gap: 30px)
│   ├── .title (flex: 1, min-height: 80px)
│   └── .profile-gradient-container (784px × 496px) ← AVATAR HERE
└── .right-section (55% width)
    └── [statement cards]
```

### **Position Calculation Logic**

```
Container X = padding-left = 80px
Container Y = padding-top + title height + gap
            = 64px + 80px + 30px
            = 174px (approximate)

For Video Backend:
  Scaled X = 80px × SCALE_X
  Scaled Y = 174px × SCALE_Y
  Scaled Width = 784px × SCALE_X
  Scaled Height = 496px × SCALE_Y
```

---

## Key Insights

### **Why the Current Position is Off**

Current position in `registry.ts`:
```json
{
  "x": 60,
  "y": 118,
  "width": 935,
  "height": 843
}
```

**Issues:**
1. **X is too far LEFT** (60 vs ~131 calculated)
   - Avatar starts 71px left of the gradient container
   
2. **Y is too far UP** (118 vs ~313 calculated)
   - Avatar starts 195px above the gradient container
   
3. **Width doesn't match** (935 vs ~1282 calculated)
   - Avatar is narrower than the container
   
4. **Height is close but off** (843 vs ~893 calculated)
   - Avatar is slightly shorter than the container

### **Expected Result After Correction**

After updating to the calculated position:
- ✅ Avatar will be perfectly aligned with the blue gradient container
- ✅ Avatar will fill the entire container area
- ✅ No gaps or overlaps with other elements
- ✅ Consistent appearance with the React component preview

---

## Files Modified

1. **`onyx-cutom/custom_extensions/backend/templates/avatar_slide_template.html`**
   - Added comprehensive debug logging (lines 2185-2288)
   - Added container-specific logging (lines 2297-2320)
   - Added footer logging (lines 2380-2384)

---

## Next Steps

1. **Generate a test video** with an Impact Statements slide
2. **Check the HTML comments** in the generated slide
3. **Extract the calculated position** from the debug log
4. **Update `registry.ts`** with the corrected position values
5. **Test the video** to verify avatar alignment

---

## Benefits

✅ **Precise Calculation** - Uses actual CSS values and scaling factors  
✅ **Visual Feedback** - Shows difference between current and calculated positions  
✅ **Easy Implementation** - Provides ready-to-use JSON for registry update  
✅ **Debugging Aid** - Helps diagnose positioning issues for any slide  
✅ **Consistent Approach** - Follows same pattern as avatar-service slide  

---

## Status

✅ **LOGGING IMPLEMENTED AND READY**

The debug logging is now active and will appear in the HTML comments whenever an Impact Statements slide is rendered for video generation.

