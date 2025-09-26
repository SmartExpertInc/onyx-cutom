# Smart Edit Minimal Changes Fix

## Problem
Smart Edit is replacing entire course outlines instead of making minimal edits. When user asks to "add 5th module about AI" to a 4-module course, the AI returns only 1 module about AI instead of the original 4 modules + 1 new AI module.

## Changes Applied
1. **Enhanced OpenAI Prompt** - Updated the user prompt in `custom_extensions/backend/main.py` around line 18535 to include:
   - Explicit instructions to preserve existing content
   - Step-by-step rules for minimal editing
   - Concrete example of correct vs wrong behavior
   - Clear directive to start with original JSON as base

2. **Lower Temperature** - Reduced temperature from 0.2 to 0.1 for more deterministic behavior

## Current Prompt Structure
```
ORIGINAL JSON: {existing_course_json}

EDIT INSTRUCTION: {user_request}

CRITICAL EDIT RULES:
1. START with the ORIGINAL JSON as your base - do NOT regenerate from scratch
2. KEEP ALL existing modules/sections and lessons exactly as they are
3. ONLY ADD, MODIFY, or REMOVE what the instruction specifically requests
4. If adding a new module: ADD it to the existing sections array
5. If modifying a lesson: CHANGE only that specific lesson
6. PRESERVE all existing IDs, titles, hours, sources, and other fields
7. NEVER replace the entire course with something completely different
8. The result should be the ORIGINAL + your targeted changes

EXAMPLE: If original has 4 modules and instruction says 'add module 5 about AI', 
return the SAME 4 modules PLUS the new AI module as the 5th module.
```

## Issue Still Persists
Despite these changes, the AI is still replacing the entire course. This suggests:

1. **Model behavior**: The AI model might not be following instructions consistently
2. **JSON processing**: There might be issues in how the response is parsed/normalized
3. **Context length**: The original JSON might be too long, causing the AI to summarize instead of preserve

## Additional Recommendations

### 1. Strengthen System Message
Update the system message to be more explicit:
```python
{"role": "system", "content": "You are ContentBuilder.ai assistant. You MUST make minimal edits to preserve existing content. NEVER replace entire training plans unless explicitly requested to do so. Follow the edit rules in the user message exactly."}
```

### 2. Add Debugging
Add logging to see what the AI actually returns:
```python
logger.info(f"[SMART_EDIT_DEBUG] AI returned content length: {len(content_text)}")
logger.info(f"[SMART_EDIT_DEBUG] AI content preview: {content_text[:500]}...")
```

### 3. Consider Alternative Approaches
- **JSON Patch approach**: Instead of asking for full JSON, ask for JSON Patch operations
- **Structured prompting**: Use function calling to ensure structured responses
- **Multi-step process**: First ask what to change, then apply the changes programmatically

### 4. Validate Response Structure
Add validation to ensure the response has the same number of modules as the original (unless explicitly requested to remove):
```python
original_module_count = len(existing_content.get("sections", []))
updated_module_count = len(updated_content_dict.get("sections", []))
if updated_module_count < original_module_count:
    logger.warning(f"Module count decreased from {original_module_count} to {updated_module_count}")
```

## Testing
To test the fix:
1. Create a 4-module training plan
2. Use Smart Edit with prompt: "Add a 5th module about AI tools"
3. Verify result contains all 4 original modules + 1 new AI module
4. Check that existing module IDs, titles, and content are preserved

## Status
- ✅ Enhanced prompt with explicit preservation rules
- ✅ Lowered temperature for more deterministic behavior
- ❌ Issue still persists - AI replacing entire course
- 🔄 Need additional debugging and possibly alternative approach 