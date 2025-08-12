# Language Regeneration Test

## Issue Description
When content is displayed, changing the language to regenerate works for English and Spanish but not for Ukrainian and Russian.

## Debug Steps Added

### Frontend Debug Logging
1. Added console logging to track language dropdown changes
2. Added console logging to track language state changes in useEffect
3. Added console logging to track request body language parameter
4. Added URL parameter synchronization for language changes
5. Added params to useEffect dependency array

### Backend Debug Logging
1. Added logging to track received language parameter
2. Added logging to track wizard message language
3. Added logging to track full payload

## Test Cases

### Test Case 1: English to Ukrainian
1. Generate content in English
2. Change language dropdown to Ukrainian
3. Check console logs for language change events
4. Verify backend receives "uk" language parameter
5. Verify content regenerates in Ukrainian

### Test Case 2: English to Russian
1. Generate content in English
2. Change language dropdown to Russian
3. Check console logs for language change events
4. Verify backend receives "ru" language parameter
5. Verify content regenerates in Russian

### Test Case 3: Spanish to Ukrainian
1. Generate content in Spanish
2. Change language dropdown to Ukrainian
3. Check console logs for language change events
4. Verify backend receives "uk" language parameter
5. Verify content regenerates in Ukrainian

## Expected Behavior
- Language dropdown changes should trigger console logs
- useEffect should detect language change and trigger regeneration
- Backend should receive correct language parameter
- Content should regenerate in the selected language

## Potential Issues
1. Language state not updating properly
2. useEffect dependency array missing params
3. URL parameter not syncing with state
4. Backend not processing language parameter correctly
5. AI assistant not following language enforcement rules

## Debug Commands
Check browser console for:
- `[LANGUAGE_DEBUG] Language dropdown changed from X to Y`
- `[LANGUAGE_DEBUG] Language changed to: Y`
- `[LANGUAGE_DEBUG] Request body language: Y`

Check backend logs for:
- `[LESSON_PREVIEW_DEBUG] Received language parameter: Y`
- `[LESSON_PREVIEW_DEBUG] Wizard dict language: Y`
