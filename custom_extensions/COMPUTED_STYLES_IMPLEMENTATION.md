# Computed Styles Implementation (Option A)

## Overview
This document describes the implementation of **Option A: Reading Computed Styles** to solve the problem where TextSettings showed default values (e.g., 16px font size) instead of the actual rendered values from CSS (e.g., 40px from `2.5rem`).

## Problem Statement

### Before Implementation
When clicking on unedited text in a new slide:
- **Visual display**: Text appeared in Lora font at 40px (from CSS `fontSize: '2.5rem'`)
- **TextSettings panel**: Showed Arial at 16px (hardcoded defaults)
- **Root cause**: TipTap editor only knew about inline HTML styles, not container CSS

### The Disconnect
```
Template CSS (Container)          TipTap Content (Inline)
┌─────────────────────┐          ┌─────────────────────┐
│ <h1 style={...}>    │          │ "Plain text"        │
│   fontSize: 2.5rem  │    ≠     │ (no <span> tags)    │
│   fontFamily: Lora  │          │ (no inline styles)  │
└─────────────────────┘          └─────────────────────┘
       ↓                                  ↓
   What user sees              What TipTap knows
   (computed/rendered)         (inline only)
```

## Solution Architecture

### Data Flow

```
User clicks text
      ↓
ControlledWysiwygEditor opens
      ↓
Read DOM computed styles via window.getComputedStyle()
      ↓
Extract: fontSize, fontFamily, color, textAlign
      ↓
Pass to parent via onEditorReady(editor, computedStyles)
      ↓
Store in state: computedTextStyles
      ↓
Pass to TextSettings component
      ↓
Use as fallback: inlineValue || computedValue || defaultValue
      ↓
Display correct values in TextSettings panel!
```

## Implementation Details

### 1. ControlledWysiwygEditor.tsx

**Added ComputedStyles interface:**
```typescript
export interface ComputedStyles {
  fontSize?: string;
  fontFamily?: string;
  color?: string;
  textAlign?: string;
}
```

**Modified onEditorReady callback:**
```typescript
onEditorReady?: (editor: Editor, computedStyles?: ComputedStyles) => void;
```

**Added DOM style reading in useEffect:**
```typescript
useEffect(() => {
  if (editor) {
    const editorElement = editor.view.dom;
    const computedStyles = window.getComputedStyle(editorElement);
    
    const extractedStyles: ComputedStyles = {
      fontSize: computedStyles.fontSize,      // "40px" (computed from 2.5rem)
      fontFamily: computedStyles.fontFamily,  // "Lora, serif"
      color: computedStyles.color,            // "rgb(255, 255, 255)"
      textAlign: computedStyles.textAlign,    // "left"
    };
    
    onEditorReady?.(editor, extractedStyles);
  }
}, [editor, onEditorReady]);
```

### 2. AvatarServiceSlideTemplate.tsx

**Updated callback signature:**
```typescript
onEditorActive?: (editor: any, field: string, computedStyles?: any) => void;
```

**Pass computedStyles through:**
```typescript
onEditorReady={(editor, computedStyles) => 
  onEditorActive?.(editor, 'title', computedStyles)
}
```

### 3. ComponentBasedSlideRenderer.tsx

**Updated prop interfaces:**
```typescript
interface ComponentBasedSlideRendererProps {
  onEditorActive?: (editor: any, field: string, computedStyles?: any) => void;
}

interface ComponentBasedSlideDeckRendererProps {
  onEditorActive?: (editor: any, field: string, computedStyles?: any) => void;
}
```

### 4. page.tsx (Video Lesson Editor)

**Added state for computed styles:**
```typescript
const [activeTextEditor, setActiveTextEditor] = useState<any | null>(null);
const [computedTextStyles, setComputedTextStyles] = useState<any | null>(null);
```

**Updated onEditorActive callback:**
```typescript
onEditorActive={(editor, field, computedStyles) => {
  console.log('✏️ Editor active:', { field, hasEditor: !!editor, computedStyles });
  setActiveTextEditor(editor);
  setComputedTextStyles(computedStyles || null);
  setActiveSettingsPanel('text');
}}
```

**Pass to TextSettings:**
```typescript
<TextSettings 
  activeEditor={activeTextEditor} 
  computedStyles={computedTextStyles} 
/>
```

### 5. TextSettings.tsx

**Added ComputedStyles interface:**
```typescript
interface ComputedStyles {
  fontSize?: string;
  fontFamily?: string;
  color?: string;
  textAlign?: string;
}

interface TextSettingsProps {
  activeEditor?: any | null;
  computedStyles?: ComputedStyles | null;
}
```

**Updated sync logic with fallback chain:**
```typescript
// Priority: inline styles → computed styles → defaults
const inlineColor = activeEditor.getAttributes('textStyle').color;
const currentColor = inlineColor || computedStyles?.color || '#000000';
setFontColor(currentColor);

const inlineFontFamily = activeEditor.getAttributes('textStyle').fontFamily;
const currentFontFamily = inlineFontFamily || computedStyles?.fontFamily || 'Arial, sans-serif';
setFontFamily(currentFontFamily);

const inlineFontSize = activeEditor.getAttributes('textStyle').fontSize;
const currentFontSize = inlineFontSize || computedStyles?.fontSize || '16px';
setFontSize(currentFontSize);
```

## How It Works

### Example: Title Field

**1. Template defines CSS:**
```typescript
const titleStyles: React.CSSProperties = {
  fontSize: '2.5rem',              // 40px when base is 16px
  fontFamily: 'Lora, serif',
  color: '#ffffff',
  // ...
};
```

**2. User clicks title → Editor opens:**
```typescript
<ControlledWysiwygEditor
  initialValue="Клиентский сервис"  // Plain text, no HTML
  style={titleStyles}                // CSS applied to container
/>
```

**3. Editor reads computed values:**
```typescript
const computedStyles = window.getComputedStyle(editor.view.dom);
// computedStyles.fontSize = "40px" (browser computed 2.5rem → 40px)
// computedStyles.fontFamily = "Lora, serif"
```

**4. TextSettings receives both:**
```typescript
<TextSettings
  activeEditor={editor}              // Has inline styles (none initially)
  computedStyles={{ fontSize: '40px', fontFamily: 'Lora, serif', ... }}
/>
```

**5. TextSettings displays correct value:**
```typescript
// Check inline first (none), fallback to computed
const fontSize = editor.getAttributes('textStyle').fontSize  // undefined
              || computedStyles?.fontSize                    // "40px" ✓
              || '16px';                                     // (not used)

// Display: "40px" in dropdown!
```

**6. User applies formatting:**
```typescript
// User selects text and clicks "Bold"
editor.chain().focus().toggleBold().run();

// Now inline style exists:
// Content: "<strong>Клиентский сервис</strong>"

// Font size still from computed (no inline font-size yet)
// Bold is inline: isActive('bold') = true
```

## Advantages

### 1. **Accurate UI State**
- TextSettings always shows what the user sees
- No confusion between defaults and actual styles

### 2. **Seamless UX**
- New text shows inherited styles correctly
- Formatted text shows inline styles explicitly
- Clear distinction between "inherited" and "custom" formatting

### 3. **Minimal Storage**
- Only explicit user changes are stored as inline HTML
- Template defaults remain in CSS (cleaner data)

### 4. **Backwards Compatible**
- Existing formatted text (with inline styles) works unchanged
- New text gains computed style awareness

## Testing Guide

### Test Case 1: New Slide, Unedited Text
1. Add a new slide
2. Click on the title (unedited, plain text)
3. **Expected**: TextSettings shows:
   - Font size: `40` (computed from template's `2.5rem`)
   - Font family: `Lora (Elegant)` (from template CSS)
   - Color: White/theme color (from template CSS)

### Test Case 2: Previously Formatted Text
1. Open a slide with previously formatted text (e.g., bold, colored)
2. Click on the formatted text
3. **Expected**: TextSettings shows:
   - Bold button: Active (inline style)
   - Font size: Explicit value if changed, or computed if inherited
   - Color: Explicit value if changed, or computed if inherited

### Test Case 3: Apply Formatting to New Text
1. Click unedited title
2. **Before formatting**: Font size shows `40` (computed)
3. Select text → Change font size to `48`
4. **After formatting**: Font size shows `48` (now inline)
5. Save and reload
6. **After reload**: Font size still shows `48` (persisted inline)

### Test Case 4: Subtitle vs. Content Different Sizes
1. Click subtitle → Should show `24` (from `1.5rem`)
2. Click content → Should show `19.2` (from `1.2rem`)
3. Each field displays its own computed styles correctly

## Console Logging

The implementation includes detailed logging for debugging:

```typescript
console.log('📏 [ControlledEditor] Computed styles:', {
  fontSize: "40px",
  fontFamily: "Lora, serif",
  color: "rgb(255, 255, 255)",
  textAlign: "left"
});

console.log('✏️ TextSettings synced with editor:', {
  bold: false,
  italic: false,
  fontSize: "40px",
  fontFamily: "Lora, serif",
  hasInlineStyles: { inlineColor: null, inlineFontFamily: null, inlineFontSize: null },
  computedStyles: { fontSize: "40px", ... }
});
```

## Summary

**Problem**: TextSettings showed hardcoded defaults instead of actual rendered CSS values.

**Solution**: Read computed styles from the DOM using `window.getComputedStyle()` and pass them through the component tree to TextSettings as a fallback.

**Result**: TextSettings now accurately reflects what the user sees, whether it's inherited CSS or explicit inline formatting.

**Key Principle**: `inline styles > computed styles > defaults`

This creates an intuitive editing experience where the UI always matches the visual output! 🎨✨


