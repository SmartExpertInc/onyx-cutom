# Prompt Storage Implementation Guide

## Overview

This implementation solves the URL length limitation issue when passing long prompts between pages. Instead of passing long prompts directly in the URL, they are stored in sessionStorage and referenced by a unique ID.

## How It Works

### 1. Prompt Storage (Generate Page)
When a user enters a prompt longer than 500 characters:
- A unique ID is generated (e.g., `prompt_1703123456789_abc123def`)
- The full prompt is stored in sessionStorage with this ID as the key
- Only the ID is passed in the URL parameters

### 2. Prompt Retrieval (Preview Pages)
When the preview page loads:
- It checks if the prompt parameter is a reference ID
- If it is, it retrieves the full prompt from sessionStorage
- The stored prompt is automatically cleaned up after retrieval
- If it's not a reference, it uses the prompt as-is

## Implementation Details

### Generate Page Changes
All handler functions now include this logic:
```typescript
// Store prompt in sessionStorage if it's long (over 500 characters)
let promptReference = finalPrompt;
if (finalPrompt.length > 500) {
  const promptId = generatePromptId();
  sessionStorage.setItem(promptId, finalPrompt);
  promptReference = promptId;
}
params.set("prompt", promptReference);
```

### Preview Page Implementation
In your preview pages, replace direct prompt usage with:

```typescript
import { getPromptFromUrlOrStorage } from "../../../utils/promptUtils";

// Instead of:
const prompt = searchParams.get('prompt') || '';

// Use:
const urlPrompt = searchParams.get('prompt') || '';
const prompt = getPromptFromUrlOrStorage(urlPrompt);
```

## Benefits

1. **No URL Length Limits**: Prompts of any length can be passed
2. **Backward Compatible**: Short prompts still work exactly as before
3. **Automatic Cleanup**: Stored prompts are removed after use
4. **Fallback Safe**: If sessionStorage fails, falls back to URL prompt
5. **No Breaking Changes**: Existing functionality remains intact

## Example Usage

### Before (Problematic):
```typescript
// This could break with long prompts
const prompt = searchParams.get('prompt') || '';
```

### After (Solution):
```typescript
// This handles both short and long prompts safely
const urlPrompt = searchParams.get('prompt') || '';
const prompt = getPromptFromUrlOrStorage(urlPrompt);
```

## Files Modified

1. **`custom_extensions/frontend/src/app/create/generate/page.tsx`**
   - Updated all handler functions to store long prompts
   - Added import for `generatePromptId` utility

2. **`custom_extensions/frontend/src/utils/promptUtils.ts`** (New)
   - Contains utility functions for prompt handling
   - `getPromptFromUrlOrStorage()` - Main function for retrieving prompts
   - `isPromptReference()` - Check if a prompt is a reference
   - `generatePromptId()` - Generate unique prompt IDs

## Next Steps

To complete the implementation, update your preview pages:

1. **Course Outline Preview**: `/create/course-outline`
2. **Lesson Presentation Preview**: `/create/lesson-presentation`
3. **Quiz Preview**: `/create/quiz`
4. **Text Presentation Preview**: `/create/text-presentation`

Each page should import and use `getPromptFromUrlOrStorage()` to handle the prompt parameter.

## Testing

1. **Short Prompts**: Should work exactly as before
2. **Long Prompts**: Should be stored in sessionStorage and referenced by ID
3. **Mixed Scenarios**: Should handle both cases seamlessly
4. **Error Cases**: Should fallback gracefully if sessionStorage fails

## Security Notes

- Prompts are stored in sessionStorage (client-side only)
- Automatically cleaned up after use
- No server-side storage of user prompts
- Session-based (cleared when browser tab closes) 