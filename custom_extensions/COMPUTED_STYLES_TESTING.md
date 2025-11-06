# Testing Guide: Computed Styles Feature

## Quick Test Checklist ✅

### Test 1: New Slide Title (Should show 40px, not 16px)
```
1. ✅ Add new slide to video lesson
2. ✅ Click on the title text (unedited)
3. ✅ Check TextSettings panel:
   - Font size dropdown: Should show "40" (not "16")
   - Font family dropdown: Should show "Lora (Elegant)" (not "Arial")
   - Color swatch: Should show white/theme color (not black)
```

**Why?** Title has CSS: `fontSize: '2.5rem'` → computes to `40px`

---

### Test 2: New Slide Subtitle (Should show 24px)
```
1. ✅ Click on subtitle text (unedited)
2. ✅ Check TextSettings panel:
   - Font size: Should show "24"
   - Font family: Should show "Lora (Elegant)" or theme font
```

**Why?** Subtitle has CSS: `fontSize: '1.5rem'` → computes to `24px`

---

### Test 3: New Slide Content (Should show ~19px)
```
1. ✅ Click on content/body text (unedited)
2. ✅ Check TextSettings panel:
   - Font size: Should show "19" or "20"
   - Font family: Should show theme content font
```

**Why?** Content has CSS: `fontSize: '1.2rem'` → computes to `~19.2px`

---

### Test 4: Apply Formatting (Inline overrides computed)
```
1. ✅ Click title (shows 40px from computed)
2. ✅ Select some text
3. ✅ Change font size to "48"
4. ✅ TextSettings should now show "48" (inline style)
5. ✅ Click outside to save
6. ✅ Click title again
7. ✅ Should still show "48" for formatted portion
```

**Why?** User's explicit choice (inline) takes priority over template CSS (computed)

---

### Test 5: Mixed Formatting
```
1. ✅ Click title with plain text
2. ✅ Select first word → Make it bold
3. ✅ Select second word → Change font size to 56
4. ✅ Click on first word: Bold active, size = 40 (computed)
5. ✅ Click on second word: Bold inactive, size = 56 (inline)
6. ✅ Click on unformatted word: No formatting, size = 40 (computed)
```

**Why?** Each text range maintains its own formatting state

---

### Test 6: Different Fields Different Sizes
```
1. ✅ Click title → Note the font size (e.g., 40)
2. ✅ Click subtitle → Should show DIFFERENT size (e.g., 24)
3. ✅ Click content → Should show DIFFERENT size (e.g., 19)
```

**Why?** Each field has its own template CSS

---

### Test 7: Theme Changes Affect Computed
```
1. ✅ Select slide with unedited text
2. ✅ Note current font family
3. ✅ Change theme (if feature exists)
4. ✅ Click text again
5. ✅ Font family should reflect new theme's font
```

**Why?** Computed styles read from current rendered CSS

---

## Expected Console Output

When clicking unedited title text, you should see:

```javascript
📏 [ControlledEditor] Computed styles: {
  fontSize: "40px",
  fontFamily: "Lora, serif",
  color: "rgb(255, 255, 255)",
  textAlign: "left"
}

✏️ Editor active: {
  field: "title",
  hasEditor: true,
  computedStyles: { fontSize: "40px", fontFamily: "Lora, serif", ... }
}

✏️ TextSettings synced with editor: {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  color: "rgb(255, 255, 255)",
  fontFamily: "Lora, serif",
  fontSize: "40px",
  textAlign: "left",
  hasInlineStyles: {
    inlineColor: null,
    inlineFontFamily: null,
    inlineFontSize: null
  },
  computedStyles: { fontSize: "40px", fontFamily: "Lora, serif", ... }
}
```

**Key indicators:**
- ✅ `fontSize: "40px"` (not "16px")
- ✅ `fontFamily: "Lora, serif"` (not default)
- ✅ `hasInlineStyles: { ... null, null, null }` (no inline styles yet)
- ✅ `computedStyles: { ... }` (present and populated)

---

## Common Scenarios

### Scenario A: "It still shows 16px"
**Cause**: `computedStyles` not being passed or read
**Check**:
1. Console logs should show `computedStyles: { fontSize: "40px", ... }`
2. If missing, check `onEditorReady` callback chain
3. Verify `window.getComputedStyle()` is executing

### Scenario B: "It shows weird values like 39.99px"
**Cause**: Browser computes rem values with decimals
**Solution**: This is normal! Browser calculates `2.5rem × 16px = 40px` with floating point precision

### Scenario C: "Font family shows as long string"
**Cause**: CSS fallback chain like "Lora, Georgia, serif"
**Solution**: TextSettings matches against options, shows "Lora (Elegant)"

### Scenario D: "After formatting, it reverts to 16px"
**Cause**: Inline style applied but computed style lost
**Check**: Should never happen with current implementation (inline takes priority)

---

## Visual Comparison

### BEFORE Implementation
```
Click new slide title:
┌─────────────────────────────┐
│ TextSettings Panel          │
├─────────────────────────────┤
│ Font family: [Arial      ▼] │  ← Wrong (should be Lora)
│ Font size:   [16         ▼] │  ← Wrong (should be 40)
│ Color:       [⬛]            │  ← Wrong (should be white)
└─────────────────────────────┘

Visual output: 40px Lora white text
Settings show:  16px Arial black
```

### AFTER Implementation
```
Click new slide title:
┌─────────────────────────────┐
│ TextSettings Panel          │
├─────────────────────────────┤
│ Font family: [Lora       ▼] │  ✓ Correct!
│ Font size:   [40         ▼] │  ✓ Correct!
│ Color:       [⬜]            │  ✓ Correct!
└─────────────────────────────┘

Visual output: 40px Lora white text
Settings show:  40px Lora white ← MATCHES!
```

---

## Developer Testing

### Unit Test Concept
```typescript
describe('ControlledWysiwygEditor computed styles', () => {
  it('should read and pass computed styles on editor ready', () => {
    const mockOnEditorReady = jest.fn();
    render(
      <ControlledWysiwygEditor
        initialValue="Test"
        onSave={() => {}}
        onCancel={() => {}}
        onEditorReady={mockOnEditorReady}
        style={{ fontSize: '2.5rem', fontFamily: 'Lora, serif' }}
      />
    );
    
    expect(mockOnEditorReady).toHaveBeenCalledWith(
      expect.any(Object), // editor
      expect.objectContaining({
        fontSize: expect.stringMatching(/\d+px/),
        fontFamily: expect.stringContaining('Lora')
      })
    );
  });
});
```

### Integration Test
```typescript
it('TextSettings should show computed font size for unformatted text', () => {
  const { getByText } = render(
    <TextSettings
      activeEditor={mockEditor}
      computedStyles={{ fontSize: '40px' }}
    />
  );
  
  const fontSizeButton = getByText('40');
  expect(fontSizeButton).toBeInTheDocument();
});
```

---

## Success Criteria

✅ **Feature is working correctly when:**

1. New unedited text shows CSS-defined sizes (not hardcoded defaults)
2. TextSettings panel matches visual output
3. Console logs show `computedStyles` being passed
4. Applying formatting creates inline styles that override computed
5. Saving and reloading preserves inline styles
6. Different fields (title, subtitle, content) show different computed values
7. No TypeScript errors or console warnings

---

## Rollback Plan

If issues occur, you can revert by:
1. Remove `computedStyles` prop from TextSettings
2. Remove computed style reading from ControlledWysiwygEditor
3. Restore hardcoded defaults: `fontSize: '16px'`, `fontFamily: 'Arial'`

Files to revert:
- `ControlledWysiwygEditor.tsx`
- `TextSettings.tsx`
- `page.tsx`
- `AvatarServiceSlideTemplate.tsx`
- `ComponentBasedSlideRenderer.tsx`

---

## Next Steps

Consider future enhancements:
- [ ] Show visual indicator when value is "inherited" vs "custom"
- [ ] Add "Reset to template default" button
- [ ] Support for more CSS properties (line-height, letter-spacing)
- [ ] Extend to other templates beyond AvatarServiceSlideTemplate
- [ ] Add unit and integration tests

---

**Happy Testing! 🚀**


