# Smart Edit Minimal Changes Fix

## Problem
Smart Edit is replacing entire course outlines instead of making minimal edits. When user asks to "add 5th module about AI" to a 4-module course, the AI returns only 1 module about AI instead of the original 4 modules + 1 new AI module.

## Root Cause Identified
From the logs, the issue is clear:

**Original Course (4 modules):**
```json
{
  "mainTitle": "Choosing the Right Pricing Strategy",
  "sections": [
    {"id": "№1", "title": "Understanding Pricing Strategies", ...},
    {"id": "№2", "title": "Market Analysis for Pricing", ...},
    {"id": "№3", "title": "Implementing Pricing Strategies", ...},
    {"id": "№4", "title": "Evaluating Pricing Strategies", ...}
  ]
}
```

**AI Response (completely wrong):**
```json
{
  "mainTitle": "Example Training Program",
  "sections": [
    {"id": "№1", "title": "Introduction to Topic", ...}
  ]
}
```

The AI is **completely ignoring** the original JSON and using the `DEFAULT_TRAINING_PLAN_JSON_EXAMPLE_FOR_LLM` template instead.

## Changes Applied
1. **Enhanced OpenAI Prompt** - Updated the user prompt in `custom_extensions/backend/main.py` around line 18535
2. **Lower Temperature** - Reduced temperature from 0.2 to 0.1 for more deterministic behavior
3. **Removed Template Reference** - Removed confusing `DEFAULT_TRAINING_PLAN_JSON_EXAMPLE_FOR_LLM` reference
4. **Added Debug Logging** - Can see exactly what AI returns

## Current Issue
The AI is still not following the original JSON. The prompt needs to be even more explicit.

## Immediate Fix Required

### Update the prompt to be extremely explicit:
```python
user_prompt = (
    f"EXISTING TRAINING PLAN TO EDIT:\n{original_json_str}\n\n" +
    f"EDIT REQUEST: {payload.prompt}\n\n" +
    f"CRITICAL: You MUST start with the JSON above and only make the requested change.\n" +
    f"The current course is about '{existing_content.get('mainTitle', '')}' with {len(existing_content.get('sections', []))} modules.\n" +
    f"PRESERVE this exact title and all existing modules.\n" +
    f"If adding a module, add it to the existing sections array.\n" +
    f"NEVER create a generic 'Example Training Program'.\n\n" +
    f"Return the complete JSON with your minimal edit applied."
)
```

### Add validation after AI response:
```python
# After parsing updated_content_dict
if isinstance(existing_content, dict) and isinstance(updated_content_dict, dict):
    original_title = existing_content.get("mainTitle", "")
    updated_title = updated_content_dict.get("mainTitle", "")
    
    # Check if AI used wrong template
    if "Example Training Program" in updated_title or updated_title.lower() != original_title.lower():
        logger.error(f"[SMART_EDIT_ERROR] AI used wrong template! Original: '{original_title}', Got: '{updated_title}'")
        # Fallback: merge the new content with original
        # Or return error to user
```

## Alternative Approach: Programmatic Merge

Instead of relying on AI to preserve content, parse the AI request and apply changes programmatically:

1. **Parse user intent**: "add 5th module about AI"
2. **Extract new content**: Generate only the new module
3. **Merge programmatically**: Add new module to existing sections array
4. **Preserve everything else**: Keep original title, theme, existing modules

```python
# Pseudo-code for programmatic approach
if "add" in payload.prompt.lower() and "module" in payload.prompt.lower():
    # Generate only the new module content
    new_module_prompt = f"Create a single training module about: {extract_topic(payload.prompt)}"
    new_module = await generate_single_module(new_module_prompt)
    
    # Merge with existing content
    updated_content = copy.deepcopy(existing_content)
    updated_content["sections"].append(new_module)
    
    return updated_content
```

## Testing
To test the fix:
1. Create a 4-module training plan about "Pricing Strategy"
2. Use Smart Edit: "add 5th module about AI tools"
3. **Expected result**: 5 modules total (4 original + 1 new)
4. **Current wrong result**: 1 generic module

## Status
- ✅ Enhanced prompt with explicit preservation rules
- ✅ Lowered temperature for more deterministic behavior  
- ✅ Removed confusing template reference
- ✅ Added debug logging to see AI responses
- ❌ **Issue still persists** - AI ignoring original JSON
- 🔄 **Need immediate fix**: Either stronger prompt or programmatic merge approach

## Recommended Next Action
Implement the programmatic merge approach as a fallback when AI doesn't preserve original content properly. 