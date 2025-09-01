# Text Presentation Prompt Display Fix

## Issue
The text presentation (one-pager) preview page was showing the prompt reference key (e.g., `prompt_1756735176980_ggtsq9vil`) in the input field instead of the actual prompt text.

## Root Cause
The text presentation page wasn't properly synchronizing the local prompt state with URL parameter changes when navigating from other pages with stored prompt references.

## Fix Applied

### Changes Made to `TextPresentationClient.tsx`

1. **Added URL Parameter Synchronization**
   ```typescript
   // Sync prompt state with URL changes
   useEffect(() => {
     const urlPrompt = params?.get("prompt") || "";
     const processedPrompt = getPromptFromUrlOrStorage(urlPrompt);
     if (processedPrompt !== prompt) {
       setPrompt(processedPrompt);
     }
   }, [params?.get("prompt")]);
   ```

2. **Enhanced onChange Handler**
   - Already had proper prompt storage logic
   - Uses local state for display
   - Properly updates URL with storage references for long prompts

3. **State Management**
   - Uses `getPromptFromUrlOrStorage()` for initial state
   - Maintains local `prompt` state for display
   - Automatically processes reference IDs to actual text

## Expected Behavior

After this fix:
- ✅ **Input field shows actual prompt text** (not reference keys)
- ✅ **Long prompts are handled correctly** (stored in sessionStorage)
- ✅ **Short prompts work as before** (passed directly in URL)
- ✅ **URL navigation maintains prompt context**
- ✅ **Editing prompts updates both display and storage**

## Testing

To verify the fix:
1. Enter a long prompt (>500 characters) on the generate page
2. Navigate to text presentation preview
3. Check that the input field shows the **actual prompt text**
4. Verify that the preview generation uses the correct prompt
5. Test editing the prompt in the input field

The text presentation page should now behave exactly like the other preview pages that were already working correctly. 