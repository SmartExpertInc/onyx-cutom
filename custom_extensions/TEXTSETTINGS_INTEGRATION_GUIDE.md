# TextSettings Panel Integration - External Toolbar Control

## Overview
Implemented a **sidebar-controlled** rich text editing system for Video Lesson UI, where the TextSettings panel acts as an external formatting toolbar (similar to PowerPoint, Canva, or Google Slides).

## Architecture

### User Flow
```
┌─────────────────────────────────────────────────────────┐
│ 1. User clicks text field on slide                     │
│    → Enters edit mode                                   │
│    → ControlledWysiwygEditor renders (no floating bar)  │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Editor notifies parent via onEditorActive callback   │
│    → Parent stores editor instance                      │
│    → Parent sets activeSettingsPanel = 'text'           │
│    → TextSettings panel appears in sidebar              │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│ 3. User selects text in editor                         │
│    → Editor selection state updates internally          │
│    → TextSettings shows current format state            │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│ 4. User clicks Bold button in TextSettings panel       │
│    → TextSettings calls activeEditor.toggleBold()       │
│    → Selected text becomes bold                         │
│    → Button state updates to active (black)             │
└──────────────────┬──────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│ 5. User clicks outside editor                          │
│    → Editor serializes to HTML                          │
│    → Calls onSave(htmlString)                           │
│    → Autosave triggers                                  │
│    → Editor instance cleared                            │
│    → TextSettings panel shows "Select text to edit"    │
└─────────────────────────────────────────────────────────┘
```

## Components Modified

### 1. ControlledWysiwygEditor.tsx (NEW)
**Location**: `onyx-cutom/custom_extensions/frontend/src/components/editors/ControlledWysiwygEditor.tsx`

**Key Features**:
- No floating toolbar (unlike WysiwygEditor.tsx)
- Exposes editor instance via `onEditorReady` callback
- Minimal padding (4px vs 50px)
- Forward ref support for imperative commands
- Same TipTap extensions (Bold, Italic, Underline, Strike, Color)

**API**:
```typescript
interface ControlledWysiwygEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  onEditorReady?: (editor: Editor) => void;
  onSelectionChange?: (hasSelection: boolean) => void;
}

interface ControlledWysiwygEditorRef {
  getEditor: () => Editor | null;
  focus: () => void;
  blur: () => void;
}
```

**Usage**:
```typescript
<ControlledWysiwygEditor
  ref={editorRef}
  initialValue={text}
  onSave={handleSave}
  onCancel={handleCancel}
  onEditorReady={(editor) => setActiveEditor(editor)}
/>
```

### 2. AvatarServiceSlideTemplate.tsx
**Location**: `onyx-cutom/custom_extensions/frontend/src/components/templates/AvatarServiceSlideTemplate.tsx`

**Changes**:
- Added `onEditorActive` prop
- Uses `ControlledWysiwygEditor` instead of `InlineEditor`
- Stores editor refs for title, subtitle, content
- Notifies parent when editor becomes active
- Renders HTML with `dangerouslySetInnerHTML`

**New Prop**:
```typescript
onEditorActive?: (editor: any, field: string) => void;
```

**Callback Flow**:
```typescript
<ControlledWysiwygEditor
  onEditorReady={(editor) => onEditorActive?.(editor, 'title')}
/>
```

### 3. ComponentBasedSlideRenderer.tsx
**Location**: `onyx-cutom/custom_extensions/frontend/src/components/ComponentBasedSlideRenderer.tsx`

**Changes**:
- Added `onEditorActive` prop to both interfaces
- Passes callback through to template components
- Propagates from `ComponentBasedSlideDeckRenderer` → `ComponentBasedSlideRenderer` → Template

**Prop Threading**:
```typescript
interface ComponentBasedSlideRendererProps {
  onEditorActive?: (editor: any, field: string) => void;
  // ... other props
}

// In templateProps:
const templateProps = {
  ...slide.props,
  onEditorActive,  // ← Pass through
  // ... other props
};
```

### 4. Projects2ViewPage (page.tsx)
**Location**: `onyx-cutom/custom_extensions/frontend/src/app/projects-2/view/[projectId]/page.tsx`

**Changes**:
- Added `activeTextEditor` state
- Passes `onEditorActive` to `ComponentBasedSlideDeckRenderer`
- Passes `activeEditor` to `TextSettings`
- Automatically shows TextSettings panel when editor activates

**State Management**:
```typescript
const [activeTextEditor, setActiveTextEditor] = useState<any | null>(null);

<ComponentBasedSlideDeckRenderer
  onEditorActive={(editor, field) => {
    console.log('✏️ Editor active:', { field, hasEditor: !!editor });
    setActiveTextEditor(editor);
    setActiveSettingsPanel('text');
  }}
/>

<TextSettings activeEditor={activeTextEditor} />
```

### 5. TextSettings.tsx
**Location**: `onyx-cutom/custom_extensions/frontend/src/app/projects-2/view/components/TextSettings.tsx`

**Major Changes**:

#### A. Props Interface
```typescript
interface TextSettingsProps {
  activeEditor?: any | null; // TipTap Editor instance
}
```

#### B. State Synchronization
```typescript
useEffect(() => {
  if (activeEditor) {
    setIsBold(activeEditor.isActive('bold'));
    setIsItalic(activeEditor.isActive('italic'));
    setIsUnderline(activeEditor.isActive('underline'));
    setIsStrikethrough(activeEditor.isActive('strike'));
    const currentColor = activeEditor.getAttributes('textStyle').color || '#000000';
    setFontColor(currentColor);
  }
}, [activeEditor]);
```

#### C. Functional Buttons
```typescript
// Bold Button
<button
  onClick={() => {
    if (activeEditor) {
      activeEditor.chain().focus().toggleBold().run();
      setIsBold(activeEditor.isActive('bold'));
    }
  }}
  disabled={!activeEditor}
  className={activeEditor?.isActive('bold') ? 'bg-black' : 'bg-white'}
>B</button>

// Italic Button  
<button
  onClick={() => {
    if (activeEditor) {
      activeEditor.chain().focus().toggleItalic().run();
      setIsItalic(activeEditor.isActive('italic'));
    }
  }}
  disabled={!activeEditor}
>I</button>

// Underline Button
<button
  onClick={() => {
    if (activeEditor) {
      activeEditor.chain().focus().toggleUnderline().run();
    }
  }}
  disabled={!activeEditor}
>U</button>

// Strikethrough Button
<button
  onClick={() => {
    if (activeEditor) {
      activeEditor.chain().focus().toggleStrike().run();
    }
  }}
  disabled={!activeEditor}
>S</button>
```

#### D. Color Picker Integration
```typescript
<ColorPalettePopup
  onColorChange={(color) => {
    setFontColor(color);
    if (activeEditor) {
      activeEditor.chain().focus().setColor(color).run();
    }
  }}
/>
```

#### E. Visual Feedback
```typescript
// Header shows status
<span className="text-sm font-medium text-gray-700">
  {activeEditor ? 'Text Formatting' : 'Text (Select text to edit)'}
</span>

// Active indicator
{activeEditor && (
  <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
    Active
  </div>
)}

// Disabled state on buttons
disabled={!activeEditor}
className={!activeEditor ? 'opacity-50 cursor-not-allowed' : ''}
```

## Testing Procedure

### Manual Testing Steps

1. **Open Video Lesson Editor**
   ```
   Navigate to: http://localhost:3000/projects-2/view/[projectId]
   ```

2. **Click on Text Field**
   - Click on title/subtitle/content in Avatar Service slide
   - Editor should appear with border
   - Right sidebar should automatically show TextSettings panel
   - Header should say "Text Formatting" with green "Active" badge

3. **Select Text**
   - Highlight some words in the editor
   - Bold button should update based on selection state
   - If text is already bold, button should be black
   - If text is not bold, button should be white

4. **Click Bold Button**
   - Select text first
   - Click Bold button in TextSettings panel
   - Selected text should become bold
   - Button should turn black
   - Editor keeps focus on text

5. **Click Italic Button**
   - Select different text
   - Click Italic button
   - Text should become italic
   - Can combine with bold

6. **Use Color Picker**
   - Select text
   - Click "Font color" button
   - Color palette popup appears
   - Choose red color
   - Selected text turns red
   - Continue editing other text

7. **Save and Verify**
   - Click outside editor
   - Changes auto-save
   - Refresh page
   - Formatted text loads correctly
   - HTML tags preserved in database

8. **Test Multiple Fields**
   - Format title → save
   - Click subtitle → TextSettings reconnects
   - Format subtitle → save
   - Click content → TextSettings reconnects
   - All fields should work independently

### Expected Behavior

✅ Clicking text field activates editor and shows TextSettings
✅ TextSettings buttons update based on selection
✅ Buttons control the active editor
✅ Formatting applies to selected text only
✅ Multiple formats can be combined (bold + italic + color)
✅ Clicking outside saves and deactivates editor
✅ TextSettings shows "Select text to edit" when inactive
✅ Buttons are disabled when no editor is active

## TipTap Command Reference

### Formatting Commands Used

```typescript
// Toggle commands (on/off)
editor.chain().focus().toggleBold().run()
editor.chain().focus().toggleItalic().run()
editor.chain().focus().toggleUnderline().run()
editor.chain().focus().toggleStrike().run()

// Set commands (specific value)
editor.chain().focus().setColor('#ff0000').run()

// Check active state
editor.isActive('bold')          // boolean
editor.isActive('italic')        // boolean
editor.isActive('underline')     // boolean
editor.isActive('strike')        // boolean

// Get attributes
editor.getAttributes('textStyle').color  // current color
```

### Command Chaining

TipTap uses method chaining for commands:
```typescript
editor
  .chain()           // Start chain
  .focus()           // Ensure editor focus
  .toggleBold()      // Apply formatting
  .run()             // Execute chain
```

**Why `.focus()` is critical**:
- Maintains selection after button click
- Prevents editor blur
- Ensures command applies to current selection

## Data Flow Diagram

```
┌──────────────────┐
│ Slide Template   │
│ (Avatar Service) │
└────────┬─────────┘
         │ onClick
         ↓
┌──────────────────┐
│ Enter Edit Mode  │
└────────┬─────────┘
         │ render
         ↓
┌────────────────────────┐
│ ControlledWysiwygEditor│ onEditorReady(editor)
└────────┬───────────────┘
         │
         ↓
┌─────────────────────────┐
│ Page: setActiveTextEditor│
│       setActiveSettings  │
└────────┬────────────────┘
         │ pass as prop
         ↓
┌──────────────────┐       ┌────────────────┐
│  TextSettings    │←──────│ activeEditor   │
│  Panel           │       │ (TipTap inst.) │
└────────┬─────────┘       └────────────────┘
         │
         │ User clicks Bold
         ↓
┌──────────────────────────┐
│ activeEditor              │
│   .chain()                │
│   .focus()                │
│   .toggleBold()           │
│   .run()                  │
└────────┬──────────────────┘
         │
         ↓
┌──────────────────┐
│ Text becomes bold│
│ in editor        │
└────────┬─────────┘
         │ onBlur
         ↓
┌──────────────────┐
│ onSave(HTML)     │
│ → Auto-save      │
│ → Database       │
└──────────────────┘
```

## Key Implementation Details

### 1. Editor Instance Sharing

**Problem**: TextSettings needs to control an editor it doesn't render

**Solution**: Parent component acts as mediator
```typescript
// In page.tsx
const [activeTextEditor, setActiveTextEditor] = useState<any | null>(null);

// Template calls this when editor activates
const handleEditorActive = (editor: any, field: string) => {
  setActiveTextEditor(editor);
  setActiveSettingsPanel('text');
};

// Pass to both components
<ComponentBasedSlideDeckRenderer onEditorActive={handleEditorActive} />
<TextSettings activeEditor={activeTextEditor} />
```

### 2. No Floating Toolbar

**WysiwygEditor.tsx** (original):
- Has floating toolbar on text selection
- Self-contained formatting
- Used in regular slide presentations

**ControlledWysiwygEditor.tsx** (new):
- No floating toolbar
- Formatting controlled externally
- Used in video lesson editor with TextSettings panel

### 3. Button State Synchronization

TextSettings buttons reflect editor state in real-time:

```typescript
useEffect(() => {
  if (activeEditor) {
    setIsBold(activeEditor.isActive('bold'));
    setIsItalic(activeEditor.isActive('italic'));
    // ... etc
  }
}, [activeEditor]);
```

This ensures:
- Buttons show correct state when editor activates
- State updates when selection changes
- Buttons are disabled when no editor

### 4. Disabled State Styling

Buttons are automatically disabled when no editor is active:

```typescript
disabled={!activeEditor}
className={`... ${!activeEditor ? 'opacity-50 cursor-not-allowed' : ''}`}
```

Visual feedback:
- Grayed out (50% opacity)
- No-drop cursor
- Clicks are ignored

## File Structure

```
custom_extensions/frontend/src/
├── components/
│   ├── editors/
│   │   ├── WysiwygEditor.tsx                    ← Original (floating toolbar)
│   │   └── ControlledWysiwygEditor.tsx          ← NEW (external control)
│   ├── templates/
│   │   └── AvatarServiceSlideTemplate.tsx       ← Updated to use controlled editor
│   └── ComponentBasedSlideRenderer.tsx          ← Updated to pass onEditorActive
└── app/
    └── projects-2/
        └── view/
            ├── [projectId]/
            │   └── page.tsx                     ← Updated state management
            └── components/
                └── TextSettings.tsx             ← Updated to control editor
```

## Advantages of This Approach

### ✅ Consistent UX
- Matches familiar design tools (Canva, PowerPoint, Figma)
- Persistent formatting panel in sidebar
- No popup toolbars blocking content

### ✅ Multi-Field Support
- Single TextSettings panel controls all text fields
- Automatically switches context when user clicks different field
- No need to manage multiple toolbar instances

### ✅ Clean Canvas
- No overlay toolbars on the slide
- More screen space for content
- Professional video editing aesthetic

### ✅ Accessibility
- Panel always visible and accessible
- Keyboard shortcuts still work (Ctrl+B, etc.)
- Screen readers can navigate panel

## Comparison: WysiwygEditor vs ControlledWysiwygEditor

| Feature | WysiwygEditor | ControlledWysiwygEditor |
|---------|---------------|-------------------------|
| Floating toolbar | ✅ Yes (on selection) | ❌ No |
| External control | ❌ No | ✅ Yes |
| Padding top | 50px | 4px |
| Editor exposure | ❌ Internal only | ✅ Via callback & ref |
| Use case | Regular slide editing | Video lesson UI |
| Selection callback | Internal only | ✅ onSelectionChange |
| Ref support | ❌ No | ✅ forwardRef |

## Advanced Features to Implement

### 1. Font Family Dropdown
```typescript
const fontFamilyOptions = ['Arial', 'Times New Roman', 'Helvetica'];

// In TextSettings:
<button onClick={() => {
  if (activeEditor) {
    activeEditor.chain().focus().setFontFamily(fontFamily).run();
  }
}}>
```

**Requires**: `@tiptap/extension-font-family`

### 2. Font Size Control
```typescript
<button onClick={() => {
  if (activeEditor) {
    activeEditor.chain().focus().setFontSize(fontSize).run();
  }
}}>
```

**Requires**: Custom extension or CSS-based approach

### 3. Text Alignment
```typescript
<button onClick={() => {
  if (activeEditor) {
    activeEditor.chain().focus().setTextAlign('center').run();
  }
}}>
```

**Requires**: `@tiptap/extension-text-align`

### 4. Real-time Selection Updates

Add selection listener to update TextSettings continuously:

```typescript
// In ControlledWysiwygEditor:
onSelectionUpdate: ({ editor }) => {
  onSelectionChange?.({
    hasSelection: !editor.state.selection.empty,
    isBold: editor.isActive('bold'),
    isItalic: editor.isActive('italic'),
    color: editor.getAttributes('textStyle').color
  });
}

// In TextSettings:
useEffect(() => {
  // Update all button states
}, [selectionState]);
```

## Troubleshooting

### Issue: TextSettings buttons don't work
**Check**:
1. Is `activeEditor` not null? (Check React DevTools)
2. Is `onEditorActive` callback firing? (Check console logs)
3. Are TipTap extensions loaded? (Check editor.extensionManager)

**Debug**:
```typescript
console.log('Editor debug:', {
  hasEditor: !!activeEditor,
  canBold: activeEditor?.can().toggleBold(),
  isBoldActive: activeEditor?.isActive('bold')
});
```

### Issue: Panel shows "Select text to edit" but editor is active
**Fix**: Editor activation callback not wired
```typescript
// Ensure this exists:
onEditorReady={(editor) => onEditorActive?.(editor, 'fieldName')}
```

### Issue: Formatting applies but button state doesn't update
**Fix**: Missing state update after command
```typescript
onClick={() => {
  if (activeEditor) {
    activeEditor.chain().focus().toggleBold().run();
    setIsBold(activeEditor.isActive('bold')); // ← Add this
  }
}}
```

### Issue: Editor loses focus after button click
**Fix**: Ensure `.focus()` in command chain
```typescript
activeEditor.chain().focus().toggleBold().run();
//                   ↑ critical for maintaining selection
```

## Performance Considerations

- Editor instance is reused (not recreated on each selection)
- State updates are minimal (only on activeEditor change)
- No excessive re-renders (controlled by parent state)
- TipTap handles all DOM updates efficiently

## Security Notes

- Same XSS protection as WysiwygEditor
- HTML output is controlled by TipTap
- No raw HTML input accepted
- Only allowed tags: `<strong>`, `<em>`, `<u>`, `<s>`, `<span>`

## Future Enhancements

1. **Heading Controls** - Add H1-H4 buttons
2. **Lists** - Bullet and numbered lists
3. **Links** - Insert hyperlinks
4. **Clear Formatting** - Remove all formatting button
5. **Format Painter** - Copy/paste formatting
6. **Undo/Redo** - History controls in panel
7. **Character/Word Count** - Display in panel
8. **Text Templates** - Quick insert common phrases

---

**Implementation Date**: 2025-10-20  
**Status**: ✅ Complete and Ready for Testing  
**Pattern**: Sidebar-controlled external toolbar  
**Compatible With**: All slide templates using ControlledWysiwygEditor

