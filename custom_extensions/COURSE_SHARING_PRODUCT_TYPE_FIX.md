# Course Sharing - Product Type Fixes

## Issues Resolved

### Issue 1: One-Pagers Not Showing Up in Shared Courses

**Problem:**
One-pagers (Text Presentations) were correctly showing up in non-shared course outlines but not appearing in shared courses.

**Root Cause:**
The shared course page was checking for the wrong product type name:
- ✅ **Correct type:** `'Text Presentation'` (as stored in the database)
- ❌ **What was being checked:** `'One Pager'` or `'OnePagerDisplay'`

**Solution:**
Updated the product type checks in the shared course page to match the actual database values:

```typescript
// OLD (incorrect)
const hasOnePager = lesson.attached_products?.some((p: any) => 
  p.type === 'One Pager' || p.component_name === 'OnePagerDisplay'
);

// NEW (correct)
const hasOnePager = lesson.attached_products?.some((p: any) => 
  p.type === 'Text Presentation' || p.component_name === 'TextPresentationDisplay'
);
```

**Additional Fixes:**
Also updated checks for other product types to match the view-new-2 page exactly:

- **Presentations:** Added `'Lesson Presentation'` as alternative type
- **Video Lessons:** Added `'Video Lesson Presentation'` as alternative type

**Result:**
✅ One-pagers now show up correctly in shared courses
✅ All product types use consistent naming with non-shared pages
✅ Product detection matches view-new-2 exactly

### Issue 2: Process-Steps Slides Display Issue

**Problem:**
Process-steps slides look correct when opening a presentation from non-shared courses, but appear wrong when opened from shared courses.

**Investigation:**
Checked the following components:
1. `ProcessStepsTemplate.tsx` - Template renders correctly with `isEditable` prop
2. `SmartSlideDeckViewer.tsx` - Correctly passes `isEditable={false}` to templates
3. `ComponentBasedSlideRenderer.tsx` - Properly propagates `isEditable` prop
4. Public product viewer - Sets `isEditable={false}` correctly

**Likely Cause:**
The process-steps template uses moveable elements and draggable attributes that may have CSS conflicts in read-only mode. The template relies on specific CSS classes and positioning that might not be loaded or applied correctly in the public view context.

**Potential Solutions to Try:**

1. **Ensure CSS is loaded:** The public product viewer might not be loading all the necessary CSS files that the process-steps template depends on.

2. **Check for missing wrapper classes:** The process-steps template might need specific wrapper classes that are present in the authenticated view but missing in public view.

3. **Investigate moveable/draggable attributes:** These might be causing layout issues when `isEditable={false}`:
   ```tsx
   data-moveable-element={`${slideId}-step-${index}`}
   data-draggable="true"
   ```

4. **Compare rendered HTML:** Need to compare the actual rendered HTML between:
   - Non-shared course presentation (working)
   - Shared course presentation (broken)

**Recommended Next Steps:**

1. Open browser DevTools on both views
2. Compare the rendered HTML for a process-steps slide
3. Check for missing CSS classes or styles
4. Look for JavaScript errors in the console
5. Verify that the slide container has the correct dimensions and overflow properties

**Temporary Workaround:**
If the issue persists, consider:
- Adding specific CSS overrides for process-steps in public view
- Disabling moveable/draggable attributes in read-only mode
- Using a simplified layout for process-steps in public view

## Files Modified

1. **custom_extensions/frontend/src/app/public/course/[share_token]/page.tsx**
   - Fixed product type checks for one-pagers: `'Text Presentation'`
   - Added missing type variants for presentations and video lessons
   - Updated all product detection logic to match view-new-2

## Product Type Reference

For future reference, here are the correct product types as stored in the database:

| Display Name | Database Type | Component Name |
|-------------|---------------|----------------|
| Presentation | `'Slide Deck'` or `'Lesson Presentation'` | `'SlideDeckDisplay'` or `'EditorPage'` |
| One-Pager | `'Text Presentation'` | `'TextPresentationDisplay'` |
| Quiz | `'Quiz'` | `'QuizDisplay'` |
| Video Lesson | `'Video Lesson'` or `'Video Lesson Presentation'` | `'VideoLessonDisplay'` |
| PDF Lesson | `'PDF Lesson'` | `'PdfLessonDisplay'` |

## Testing Checklist

- ✅ One-pagers show green checkmark in shared course outlines
- ✅ Clicking one-pager opens in public product viewer
- ✅ One-pager content displays correctly in read-only mode
- ✅ All other product types still work correctly
- ⚠️ Process-steps slides need further investigation
- ✅ Product type detection matches non-shared course outlines exactly

## Summary

The one-pager issue has been fully resolved by correcting the product type string from `'One Pager'` to `'Text Presentation'`. The process-steps issue requires further investigation of the rendered HTML and CSS in the public view context. The root cause is likely related to styling or layout differences rather than the component logic itself.

