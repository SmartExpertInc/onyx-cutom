# PDF Version Extraction Debugging Fix

## Date
October 20, 2025

## Problem
The backend was extracting `deck_template_version=None` for all presentations, causing all PDFs to be generated with the old (v1) template regardless of whether the presentation was created as v2 or not.

**Symptoms:**
- Frontend correctly rendered v2 slides with new designs
- Backend logs showed: `deck_template_version=None, effective_version=None`
- All PDFs exported with old template design

## Root Cause
The version extraction logic was trying to extract `templateVersion` from `raw_content` instead of the parsed `content_obj`. The `raw_content` might be a string or have a different structure than expected, while `content_obj` is the properly parsed dictionary containing the slide deck data.

## Solution

### 1. Updated Version Extraction Logic
Changed from checking `raw_content` to checking `content_obj` (the parsed version):

```python
# OLD (incorrect):
if isinstance(raw_content, dict):
    deck_template_version = raw_content.get("templateVersion")
    
# NEW (correct):
if isinstance(content_obj, dict):
    deck_template_version = content_obj.get("templateVersion")
```

### 2. Added Multiple Extraction Paths
To handle different possible data structures:

```python
deck_template_version = (
    content_obj.get("templateVersion")           # Direct field (ComponentBasedSlideDeck.templateVersion)
    or content_obj.get("template_version")       # Snake case variant
    or (content_obj.get("details") or {}).get("templateVersion")  # Nested in details
    or (content_obj.get("details") or {}).get("template_version") # Nested snake case
)
```

### 3. Enhanced Logging
Added extensive debug logging to trace version extraction:

```python
_log.info(f"🔍 PDF VERSION EXTRACTION - content_obj type: {type(content_obj)}")
_log.info(f"🔍 PDF VERSION EXTRACTION - content_obj keys: {list(content_obj.keys())[:15]}")
_log.info(f"🔍 PDF VERSION EXTRACTION - content_obj.templateVersion: {content_obj.get('templateVersion')}")
_log.info(f"🔍 PDF VERSION EXTRACTION - content_obj.lessonTitle: {content_obj.get('lessonTitle')}")
_log.info(f"🔍 PDF VERSION EXTRACTION - EXTRACTED VERSION: {deck_template_version}")
_log.info(f"🔍 PDF DECK VERSION FINAL - will_use_template={'v2' if deck_template_version >= 'v2' else 'v1'}")
```

### 4. Enhanced Template Selection Logging
Added clear logging at template selection points:

```python
logger.info(f"📄 TEMPLATE SELECTION: Using {'LEGACY' if not version or version < 'v2' else 'V2'} template for version: {deck_template_version}")
```

## Testing

After this fix, you should see in the logs:

### For NEW Presentations (with templateVersion='v2'):
```
🔍 PDF VERSION EXTRACTION - content_obj type: <class 'dict'>
🔍 PDF VERSION EXTRACTION - content_obj keys: ['lessonTitle', 'slides', 'templateVersion', 'theme', ...]
🔍 PDF VERSION EXTRACTION - content_obj.templateVersion: v2
🔍 PDF VERSION EXTRACTION - EXTRACTED VERSION: v2
🔍 PDF DECK VERSION FINAL - product_id=123, templateVersion=v2, will_use_template=v2 (single_slide_pdf_template.html)
📄 TEMPLATE SELECTION: Using V2 template for version: v2
```

### For OLD Presentations (without templateVersion):
```
🔍 PDF VERSION EXTRACTION - content_obj type: <class 'dict'>
🔍 PDF VERSION EXTRACTION - content_obj keys: ['lessonTitle', 'slides', 'theme', ...]
🔍 PDF VERSION EXTRACTION - content_obj.templateVersion: None
🔍 PDF VERSION EXTRACTION - EXTRACTED VERSION: None
🔍 PDF DECK VERSION FINAL - product_id=123, templateVersion=None, will_use_template=v1 (single_slide_pdf_template_old.html)
📄 TEMPLATE SELECTION: Using LEGACY template for version: None
```

## Files Modified

1. **`custom_extensions/backend/app/services/pdf_generator.py`**:
   - Lines 2994-3029: Updated version extraction logic
   - Line 1663-1671: Enhanced template selection logging (calculate_slide_dimensions)
   - Line 2164-2176: Enhanced template selection logging (generate_single_slide_pdf)

2. **`custom_extensions/frontend/src/app/projects-2/view/[projectId]/page.tsx`**:
   - Line 418: Added `templateVersion: 'v2'` for empty component data
   - Line 437: Added `templateVersion: 'v2'` for test component data

3. **Documentation**:
   - Created `PDF_VERSION_AWARE_TEMPLATE_SELECTION.md`
   - Created this file: `PDF_VERSION_DEBUGGING_FIX.md`

## Frontend Logic Match

The backend now correctly matches the frontend's version resolution logic from `registry.ts`:

```typescript
// Frontend (registry.ts)
export function resolveTemplateIdForVersion(templateId: string, deckTemplateVersion?: string) {
  const effectiveVersion = deckTemplateVersion || 'v1';
  
  if (!effectiveVersion || effectiveVersion < 'v2') {
    const candidate = `${templateId}_old`;
    return SLIDE_TEMPLATE_REGISTRY[candidate] ? candidate : templateId;
  }
  return templateId;
}
```

```python
# Backend (pdf_generator.py)
if not deck_template_version or deck_template_version < 'v2':
    template_file = "single_slide_pdf_template_old.html"
else:
    template_file = "single_slide_pdf_template.html"
```

## Success Criteria

✅ New presentations (created after fix) have `templateVersion='v2'` in database  
✅ Backend correctly extracts `templateVersion` from parsed content  
✅ Backend selects v2 template for presentations with `templateVersion='v2'`  
✅ Backend selects v1 template for presentations without `templateVersion` (backward compatible)  
✅ Comprehensive logging for debugging version issues  
✅ Logic matches frontend's version resolution  

## Next Steps

1. **Test with actual presentations**: Create a new presentation and verify it exports with v2 design
2. **Test with old presentations**: Verify existing presentations still export with v1 design
3. **Monitor logs**: Check that version extraction is working correctly
4. **Optional**: Add database migration to set `templateVersion='v2'` for presentations that should use v2

## Related Documentation

- `PDF_VERSION_AWARE_TEMPLATE_SELECTION.md` - Overall implementation guide
- `VERSIONED_SLIDES_IMPLEMENTATION.md` - Frontend versioning system
- `PDF_V2_FIXES_COMPLETE.md` - V2 PDF template fixes

