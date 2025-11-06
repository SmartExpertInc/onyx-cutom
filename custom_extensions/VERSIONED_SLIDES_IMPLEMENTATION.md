# Versioned Presentation Slides Implementation

## Summary

Successfully implemented a versioning system for presentation slides that allows old presentations to render with legacy designs while new presentations use updated designs, all without breaking existing content.

## Implementation Details

### 1. Template Duplication ✅

- **Created 73 `*_old.tsx` files** for all non-avatar slide templates
- Each `_old` file is a frozen snapshot of the original design
- Component names and exports correctly suffixed with `_old`
- Fixed via automated script: `fix_old_component_names.mjs`

### 2. Registry & Resolution ✅

**File**: `custom_extensions/frontend/src/components/templates/registry.ts`

- Added `resolveTemplateIdForVersion()` function that maps template IDs based on deck version
- Added `getTemplateResolved()` wrapper for version-aware template lookup
- Auto-registers `_old` variants at runtime for immediate legacy support
- Logic: if `templateVersion` is missing or < 'v2', resolve to `templateId_old`

### 3. Frontend Rendering ✅

**Files Modified**:
- `custom_extensions/frontend/src/components/ComponentBasedSlideRenderer.tsx`
  - Uses `getTemplateResolved()` instead of `getTemplate()`
  - Accepts `deckTemplateVersion` prop
  
- `custom_extensions/frontend/src/components/SmartSlideDeckViewer.tsx`
  - Passes `deck.templateVersion` to renderer
  
- `custom_extensions/frontend/src/components/LessonPlanView.tsx`
  - Forwards `deck.templateVersion` in carousel viewer

### 4. Backend PDF/SCORM ✅

**Files Modified**:
- `custom_extensions/backend/app/services/pdf_generator.py`
  - Added `deck_template_version` parameter to `generate_slide_deck_pdf_with_dynamic_height()`
  - Maps `templateId -> templateId_old` for legacy decks in `process_slide_batch()`
  - Extracts version from deck metadata before PDF generation
  
- `custom_extensions/backend/app/services/scorm_packager.py`
  - Maps `templateId -> templateId_old` in `_render_slide_deck_html()` for legacy decks
  - Checks `content.templateVersion` before rendering

### 5. Bug Fixes ✅

Fixed variable naming issues in 3 new slide templates:
- `BenefitsListSlideTemplate.tsx`
- `SolutionStepsSlideTemplate.tsx`
- `ProofStatisticsSlideTemplate.tsx`

Changed destructuring from `_themeBg, _themeTitle, _themeContent, _themeAccent` to remove underscores.

## How It Works

### For Legacy Presentations (Pre-existing)

1. Deck has no `templateVersion` field or `templateVersion < 'v2'`
2. Frontend resolver maps `title-slide` → `title-slide_old`
3. Backend PDF/SCORM maps `templateId` → `templateId_old` before rendering
4. Presentation renders with frozen `_old` designs

### For New Presentations

1. Deck created with `templateVersion: 'v2'` (to be implemented in save logic)
2. Frontend resolver returns original template ID unchanged
3. Backend passes through original `templateId`
4. Presentation renders with updated designs

## Scripts Created

1. **`custom_extensions/frontend/scripts/duplicate_slides_old.mjs`**
   - Duplicates all non-avatar templates to `*_old.tsx`
   - Renames exports to add `_old` suffix
   - Run: `node custom_extensions/frontend/scripts/duplicate_slides_old.mjs`

2. **`custom_extensions/frontend/scripts/fix_old_component_names.mjs`**
   - Fixes component identifier mismatches in `_old` files
   - Ensures exports match default export names
   - Run: `node custom_extensions/frontend/scripts/fix_old_component_names.mjs`

## Remaining Tasks

### 1. Set `templateVersion='v2'` on New Deck Creation

**Where to implement**:
- Backend: When creating new presentations via API
- Frontend: In `SmartSlideDeckViewer.tsx` when saving new decks
- AI Generation: Ensure generated decks include `templateVersion: 'v2'`

**Example**:
```typescript
const newDeck: ComponentBasedSlideDeck = {
  lessonTitle: 'My Presentation',
  slides: [...],
  templateVersion: 'v2',  // ← Add this
  metadata: {
    createdAt: new Date().toISOString()
  }
};
```

### 2. Environment Variable (Optional)

Set `SLIDES_DEFAULT_VERSION=v2` to treat decks with missing `templateVersion` as new instead of legacy.

**Frontend** (`.env.local` or build command):
```bash
SLIDES_DEFAULT_VERSION=v2
```

**Backend** (environment or config):
```python
DEFAULT_SLIDES_VERSION = os.getenv('SLIDES_DEFAULT_VERSION', 'v1')
```

### 3. Testing

Recommended smoke tests:
- Load a pre-existing presentation → verify it uses `_old` templates
- Create a new presentation with `templateVersion: 'v2'` → verify it uses new templates
- Generate PDF for legacy deck → verify `_old` templates in output
- Generate PDF for new deck → verify new templates in output

## Files Changed

### Frontend
- `src/components/templates/registry.ts` - Added resolver functions
- `src/components/ComponentBasedSlideRenderer.tsx` - Version-aware rendering
- `src/components/SmartSlideDeckViewer.tsx` - Pass version to renderer
- `src/components/LessonPlanView.tsx` - Pass version in carousel
- `src/components/templates/*_old.tsx` - 73 frozen template snapshots
- `src/components/templates/BenefitsListSlideTemplate.tsx` - Fixed variable names
- `src/components/templates/SolutionStepsSlideTemplate.tsx` - Fixed variable names
- `src/components/templates/ProofStatisticsSlideTemplate.tsx` - Fixed variable names

### Backend
- `app/services/pdf_generator.py` - Version-aware PDF generation
- `app/services/scorm_packager.py` - Version-aware SCORM HTML rendering

### Scripts
- `scripts/duplicate_slides_old.mjs` - Template duplication utility
- `scripts/fix_old_component_names.mjs` - Export name fixer

## Benefits

✅ **Zero breaking changes** - All existing presentations continue to work
✅ **Clean migration path** - New designs can be merged with same IDs
✅ **Minimal code changes** - Single version flag controls routing
✅ **Consistent across stack** - Works in React, PDF, and SCORM
✅ **No database changes** - Version stored in JSON content field
✅ **Easy rollback** - Remove version flag to revert to legacy

## Notes

- Avatar templates are excluded from versioning (not duplicated)
- The `_old` templates are frozen code snapshots - they won't receive updates
- New templates with the original IDs can be freely updated
- The registry auto-registers `_old` variants, so no manual registration needed

