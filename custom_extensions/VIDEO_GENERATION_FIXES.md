# Video Generation Fixes

## Issues Found

### Issue 1: Video Products Showing as Courses
**Problem:** Generated videos (saved with `VideoProductDisplay` template) are incorrectly rendered in the video lesson editor instead of using the dedicated video player.

**Root Cause:** The view page (`/projects-2/view/[projectId]/page.tsx`) only checks for video lesson component names (`VideoLessonPresentationDisplay`, `VideoLesson`, `video_lesson_presentation`) but doesn't handle `VideoProductDisplay`.

**Current Code (lines 376-380):**
```typescript
const isVideoLesson = instanceData.component_name === 'VideoLessonPresentationDisplay' ||
                     instanceData.component_name === 'VideoLesson' ||
                     instanceData.component_name === 'video_lesson_presentation';

const isComponentBasedVideoLesson = instanceData.component_name === 'VideoLessonPresentationDisplay';
```

**Fix Required:** Add logic to handle `VideoProductDisplay` separately and render the dedicated video player component.

**Files to Modify:**
- `custom_extensions/frontend/src/app/projects-2/view/[projectId]/page.tsx`

### Issue 2: Placeholder Voiceover Text Instead of Real Text
**Problem:** Video generation uses placeholder text ("Welcome to slide X...") instead of the actual voiceover text from slides.

**Root Cause:** The backend only checks for voiceover text inside `props` (`slide_data.get('props', {}).get('voiceoverText')`), but the frontend sends it at the slide level (`slide.voiceoverText`).

**Frontend Extraction (VideoEditorHeader.tsx, line 222):**
```typescript
const voiceoverTexts = componentBasedSlideDeck.slides
  .map((slide: any) => slide.voiceoverText || slide.props?.voiceoverText || '')
  .filter((text: string) => text && text.trim().length > 0);
```

**Backend Extraction (presentation_service.py, line 1155):**
```python
slide_voiceover_text = slide_data.get('props', {}).get('voiceoverText', '')
```

**Problem:** Backend doesn't check slide level, only props level.

**Fix Applied:** Updated backend to check both locations:
```python
slide_voiceover_text = slide_data.get('voiceoverText', '') or slide_data.get('props', {}).get('voiceoverText', '')
```

## Fixes Applied

### ✅ Fix 2: Voiceover Text Extraction (COMPLETED)

**Files Modified:**
1. `custom_extensions/backend/app/services/presentation_service.py` (lines 646 & 1159)

**Changes:**
- Updated `_process_multi_slide_presentation` to check both slide level and props level for voiceover text
- Updated `_initiate_all_avatar_videos` to check both locations as well
- Added logging to warn when voiceover text is not found and placeholder is used
- Added logging to confirm when actual voiceover text is found

**Code Changes:**
```python
# Line 646: Multi-slide processing
slide_voiceover_text = slide_data.get('voiceoverText', '') or slide_data.get('props', {}).get('voiceoverText', '')
if not slide_voiceover_text:
    logger.warning(f"🎬 [MULTI_SLIDE_PROCESSING] ⚠️ No voiceover text found for slide {slide_index + 1}, using placeholder")
    slide_voiceover_text = f"Welcome to slide {slide_index + 1}. This presentation covers important topics."
else:
    logger.info(f"🎬 [MULTI_SLIDE_PROCESSING] ✅ Found voiceover text for slide {slide_index + 1}: '{slide_voiceover_text[:100]}...'")

# Line 1159: Batch avatar generation
slide_voiceover_text = slide_data.get('voiceoverText', '') or slide_data.get('props', {}).get('voiceoverText', '')
if not slide_voiceover_text:
    logger.warning(f"🎬 [BATCH_AVATAR] ⚠️ No voiceover text found for slide {slide_index + 1}, using placeholder")
    slide_voiceover_text = f"Welcome to slide {slide_index + 1}. This presentation covers important topics."
else:
    logger.info(f"🎬 [BATCH_AVATAR] ✅ Found voiceover text for slide {slide_index + 1}: '{slide_voiceover_text[:100]}...'")
```

### ✅ Fix 1: Video Product Display (COMPLETED)

**Files Modified:**
1. `custom_extensions/frontend/src/app/projects-2/view/[projectId]/page.tsx` (lines 375-391)

**Changes:**
- Added check for `VideoProductDisplay` component_name
- Redirects to `/projects/view/` route (which properly handles VideoProductDisplay)
- Prevents generated videos from being loaded in the video lesson editor

**Code Changes:**
```typescript
// Check if this is a generated Video Product (different from editable Video Lesson)
const isVideoProduct = instanceData.component_name === 'VideoProductDisplay';

if (isVideoProduct) {
  // Redirect to proper video product view (not the editor)
  console.log('🎬 [VIDEO_PRODUCT] Detected VideoProductDisplay, redirecting to video player view');
  // For now, just navigate to the old projects view which handles VideoProductDisplay
  window.location.href = `/projects/view/${projectId}`;
  return;
}
```

**Why this works:**
- The `/projects/view/` route already has proper rendering logic for `VideoProductDisplay`
- It uses the `VideoProductDisplay.tsx` component which shows a proper video player
- Separates "editable video lessons" from "final generated video products"

## Testing

### Test Fix 2 (Voiceover Text):
1. Restart backend
2. Generate a video with actual voiceover text in slides
3. Check logs for `✅ Found voiceover text` messages
4. Listen to generated avatar video - should speak the actual slide content, not placeholders

### Test Fix 1 (Video Display):
1. After implementing the fix, navigate to a generated video product
2. Should see video player, not video lesson editor
3. Video should play correctly
4. Download button should work

## Related Files

- `custom_extensions/backend/app/services/presentation_service.py` - Video generation orchestration
- `custom_extensions/frontend/src/app/projects-2/view/[projectId]/page.tsx` - Project view page
- `custom_extensions/frontend/src/components/VideoProductDisplay.tsx` - Video player component
- `custom_extensions/frontend/src/app/projects-2/view/components/VideoEditorHeader.tsx` - Video generation initiation

