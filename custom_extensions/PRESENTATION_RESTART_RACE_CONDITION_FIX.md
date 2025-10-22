# Presentation Preview Restart Race Condition Fix

## Problem

Users reported that presentation previews would:
1. Generate correctly and display slides
2. As soon as the last slide finished generating, everything would erase
3. The system would automatically restart generation
4. The debug message showed "Slides found: 0" even though slides were visible in the preview

This caused frustrating infinite restart loops where valid presentations were repeatedly regenerated.

## Root Cause

There was a **race condition** between two `useEffect` hooks that both triggered when `streamDone` became `true`:

### Hook 1: JSON Conversion (Line 892)
```typescript
useEffect(() => {
  if (!streamDone) return;
  if (jsonConvertedRef.current) return;
  const json = tryParsePresentationJson(content);
  if (json) {
    const md = convertPresentationJsonToMarkdown(json);
    jsonConvertedRef.current = true;
    setOriginalJsonResponse(content); // Store original JSON
    setContent(md); // Update to markdown
  }
}, [streamDone, content]);
```

### Hook 2: Slide Count Check (Line 995)
```typescript
useEffect(() => {
  if (!streamDone) return;
  
  const countParsedSlides = (text: string): number => {
    // Try to count slides from content
    const json = tryParsePresentationJson(text);
    if (json && Array.isArray(json.slides)) {
      return json.slides.length;
    }
    // Fall back to markdown parsing...
  };
  
  const slideCount = countParsedSlides(content);
  
  if (slideCount === 0) {
    // RESTART GENERATION
  }
}, [streamDone, content, ...]);
```

### The Problem

When `streamDone` changed to `true`:

1. **Both hooks were triggered simultaneously**
2. **React does NOT guarantee execution order** for useEffects with the same dependencies
3. If Hook 2 (slide count) executed **before** Hook 1 (JSON conversion):
   - Hook 2 would try to count slides from `content`
   - But `content` might still be in an intermediate state (post-stream, pre-conversion)
   - Or it might be markdown that wasn't fully processed yet
   - `countParsedSlides` would return 0
   - System would restart generation

This created the observed behavior:
- Preview UI showed slides correctly (Hook 1 had converted JSON to markdown for display)
- But Hook 2's slide counting ran on the wrong content state
- Returned 0 slides → triggered restart
- User saw slides disappear and regeneration start

## Solution

### 1. Priority-Based Slide Counting

Modified `countParsedSlides` to check sources in priority order:

```typescript
const countParsedSlides = (text: string): number => {
  if (!text || !text.trim()) return 0;

  // PRIORITY 1: Check originalJsonResponse first (most reliable)
  if (originalJsonResponse) {
    try {
      const parsedJson = JSON.parse(originalJsonResponse);
      if (parsedJson && Array.isArray(parsedJson.slides)) {
        console.log(`[RESTART_CHECK] Counting slides from originalJsonResponse: ${parsedJson.slides.length} slides`);
        return parsedJson.slides.length;
      }
    } catch (e) {
      console.warn(`[RESTART_CHECK] Failed to parse originalJsonResponse, falling back to content parsing`, e);
    }
  }

  // PRIORITY 2: Try parsing as JSON from current content
  const json = tryParsePresentationJson(text);
  if (json && Array.isArray(json.slides)) {
    console.log(`[RESTART_CHECK] Counting slides from JSON in content: ${json.slides.length} slides`);
    return json.slides.length;
  }

  // PRIORITY 3: Parse as markdown
  const cleanedText = cleanContent(text);
  // ... markdown parsing logic
  console.log(`[RESTART_CHECK] Counting slides from markdown: ${slides.length} slides`);
  return slides.length;
};
```

### 2. Added `originalJsonResponse` to Dependencies

```typescript
}, [streamDone, content, formatRetryCounter, loading, isGenerating, error, isHandlingInsufficientCredits, originalJsonResponse]);
```

This ensures the slide counting re-runs when `originalJsonResponse` is set by Hook 1.

### 3. Enhanced Logging

Added detailed console logs to track which parsing method succeeds:
- `[RESTART_CHECK] Counting slides from originalJsonResponse: X slides`
- `[RESTART_CHECK] Counting slides from JSON in content: X slides`
- `[RESTART_CHECK] Counting slides from markdown: X slides`

This makes debugging future issues much easier.

## Why This Fix Works

### Before (Race Condition)
```
Stream completes → streamDone = true
  ↓
  ├─ Hook 1: Convert JSON → Set originalJsonResponse + Set content(markdown)
  ├─ Hook 2: Count slides from content → Returns 0 (wrong state) → RESTART
  ↓
(Order not guaranteed, Hook 2 might run first)
```

### After (Priority-Based)
```
Stream completes → streamDone = true
  ↓
  ├─ Hook 1: Convert JSON → Set originalJsonResponse + Set content(markdown)
  ├─ Hook 2: Count slides:
  │    ├─ Check originalJsonResponse first ✓ → Returns correct count
  │    ├─ Fallback to JSON in content ✓
  │    └─ Fallback to markdown parsing ✓
  ↓
(Correct count found regardless of execution order)
```

## Testing Scenarios

### Test 1: JSON Response
**Input**: AI returns valid JSON with 10 slides  
**Expected**:
- Hook 1 converts to markdown, sets `originalJsonResponse`
- Hook 2 counts from `originalJsonResponse` → 10 slides ✓
- No restart triggered

### Test 2: Markdown Response
**Input**: AI returns markdown (legacy format)  
**Expected**:
- `originalJsonResponse` remains empty/undefined
- Hook 2 falls through to markdown parsing
- Correctly counts slides from markdown
- No restart if slides found

### Test 3: Malformed Response
**Input**: AI returns gibberish or malformed content  
**Expected**:
- All parsing methods return 0
- Restart triggered correctly (this is the intended behavior)
- Up to 2 restart attempts before showing error

## Files Modified

| File | Lines | Changes |
|------|-------|---------|
| `LessonPresentationClient.tsx` | 1013-1045 | Enhanced `countParsedSlides` with priority-based checking |
| `LessonPresentationClient.tsx` | 1083 | Added `originalJsonResponse` to dependency array |

## Impact

### Before Fix
- ❌ Valid presentations restarted unnecessarily
- ❌ User saw slides disappear after generation
- ❌ Wasted credits on repeated generations
- ❌ Frustrating user experience

### After Fix
- ✅ Presentations counted correctly regardless of hook execution order
- ✅ Slides remain visible after generation
- ✅ No wasted credits
- ✅ Smooth user experience
- ✅ Better debugging with detailed logs

## Related Issues

- Debug window showing "Slides found: 0" (now removed in previous fix)
- Infinite restart loops
- Presentations erasing after successful generation

## Prevention

This type of race condition can be prevented by:
1. **Avoiding shared state mutations** in multiple useEffects with the same dependencies
2. **Using refs or intermediate state** to coordinate between effects
3. **Priority-based checking** from most reliable to least reliable sources
4. **Explicit dependency tracking** to ensure re-runs when state changes

## Additional Notes

The `originalJsonResponse` state was already being set in the JSON conversion hook (line 955):
```typescript
setOriginalJsonResponse(content); // Store original JSON for finalization
```

This fix leverages that existing state to provide a race-condition-proof slide counting mechanism.

---

**Status**: ✅ Fixed  
**Date**: October 22, 2025  
**Severity**: High (caused infinite restart loops)  
**User Impact**: High (core presentation generation workflow)

