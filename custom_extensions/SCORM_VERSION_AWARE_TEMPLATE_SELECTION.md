# SCORM Version-Aware Template Selection Implementation

## Overview
Implemented version-aware template selection for SCORM exports to match the existing PDF generation system. This ensures that legacy presentations (v1) use the old template design in SCORM packages, while new presentations (v2) use the updated template design.

## Implementation Date
October 22, 2025

## Problem Statement
The SCORM export system was hardcoding the v2 template (`single_slide_pdf_template.html`) for all presentations, regardless of their version. This caused legacy presentations to be exported in SCORM packages with the new v2 design instead of preserving their original v1 appearance.

Meanwhile, the PDF generation system was correctly handling version-aware template selection, creating an inconsistency between PDF downloads and SCORM exports.

## Solution

### Backend Changes

#### File: `custom_extensions/backend/app/services/scorm_packager.py`

Updated the `_render_slide_deck_html` function (line 512) to implement version-aware template selection:

**Key Changes:**

1. **Version Extraction First (lines 515-521)**
   - Moved version extraction to the top of the function, before template loading
   - Extracts `templateVersion` from content or metadata
   - Sets `effective_version = None` if extraction fails

2. **Template Selection Logic (lines 525-534)**
   ```python
   # Select template based on version (matching PDF generation logic)
   # Use old template for legacy decks (no version or version < 'v2')
   if not effective_version or effective_version < 'v2':
       template_file = "single_slide_pdf_template_old.html"
       logger.info(f"📄 SCORM TEMPLATE SELECTION: Using LEGACY template for version: {effective_version}")
   else:
       template_file = "single_slide_pdf_template.html"
       logger.info(f"📄 SCORM TEMPLATE SELECTION: Using V2 template for version: {effective_version}")
   
   template = jinja_env.get_template(template_file)
   ```

3. **Updated Theme Handling (lines 550-555)**
   - Removed theme name mapping (no `dark-purple` → `dark-purple-v1` conversion)
   - Theme name stays unchanged; template CSS provides correct colors
   - Added logging to show which template is being used with which theme

## Template Selection Logic

The selection logic uses version-aware template files:

- **Legacy Presentations**: No `templateVersion` field OR `templateVersion < 'v2'`
  - Uses: `single_slide_pdf_template_old.html`
  - Maintains original v1 design with old color values

- **New Presentations**: `templateVersion >= 'v2'`
  - Uses: `single_slide_pdf_template.html`
  - Uses updated v2 design with new color values

### Important: Theme Handling

**No theme name mapping is performed in SCORM exports.** Each template file contains the same theme class names (e.g., `.theme-dark-purple`) but with different CSS variable values:

- **Old Template**: `.theme-dark-purple` has `--bg-color: #110c35` (old purple)
- **New Template**: `.theme-dark-purple` has `--bg-color: linear-gradient(#002D91, #000C5B)` (new gradient)

This is different from PDF generation, which may map theme names. For SCORM:
- Template selection handles version differences
- Theme name stays unchanged (e.g., `dark-purple`)
- CSS inside each template provides correct colors

## Logging and Debugging

Added comprehensive logging for debugging:

```
🔍 SCORM VERSION CHECK - product_id={id}, templateVersion={version}
📄 SCORM TEMPLATE SELECTION: Using {LEGACY/V2} template for version: {version}
✅ SCORM RENDERING - slides_count={count}
🎨 SCORM THEME - Using theme: {theme} with {V1 OLD/V2 NEW} template
```

Look for these emoji-prefixed logs to debug version issues in SCORM exports.

## Testing

To verify the implementation:

1. **Legacy Presentation** (created before v2 system):
   - Export to SCORM
   - Check logs for: `Using LEGACY template for version: None`
   - Verify SCORM package uses old design

2. **New Presentation** (created after v2 system):
   - Export to SCORM
   - Check logs for: `Using V2 template for version: v2`
   - Verify SCORM package uses new design

## Consistency Achieved

Both export methods now correctly handle version-aware rendering:

| Export Method | Version Detection | Template Selection | Theme Handling |
|---------------|-------------------|-------------------|----------------|
| PDF Download  | ✅ Correct        | ✅ Correct        | Maps theme names for v1    |
| SCORM Export  | ✅ Correct        | ✅ **FIXED**      | Uses original theme name   |

**Note**: The difference in theme handling is intentional:
- **PDF**: May map theme names (e.g., `dark-purple` → `dark-purple-v1`) because it has additional theme variants
- **SCORM**: Uses original theme name because each template file has version-specific CSS values built-in

## Related Files

- `custom_extensions/backend/app/services/scorm_packager.py` - SCORM packaging service (updated)
- `custom_extensions/backend/app/services/pdf_generator.py` - PDF generation service (reference implementation)
- `custom_extensions/backend/templates/single_slide_pdf_template.html` - V2 template
- `custom_extensions/backend/templates/single_slide_pdf_template_old.html` - V1 template
- `PDF_VERSION_AWARE_TEMPLATE_SELECTION.md` - PDF version implementation documentation
- `VERSIONED_SLIDES_IMPLEMENTATION.md` - Frontend version system documentation

## Notes

1. **Backward Compatibility**: Presentations without `templateVersion` field default to v1 template
2. **Theme Handling**: Template selection handles color differences; no theme name mapping needed
3. **No Frontend Changes**: All changes are backend-only
4. **Template Files**: Both template files already exist in the templates directory
5. **CSS Architecture**: Each template contains identical CSS class names with different color values

## Implementation Complete ✅

SCORM exports now correctly handle presentation versions, matching the behavior of PDF downloads.

Legacy presentations will maintain their original appearance in both PDF and SCORM exports, while new presentations will use the updated v2 design consistently across all export formats.

