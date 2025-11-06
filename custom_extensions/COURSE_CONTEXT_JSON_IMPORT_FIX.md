# Course Context JSON Import Fix

**Date**: October 21, 2025  
**Status**: ✅ Complete  
**Type**: Bug Fix  
**Severity**: Critical (Breaking standalone product generation)

## Problem

**Error**: 
```
UnboundLocalError: local variable 'json' referenced before assignment
```

**Impact**: All standalone product generation (presentations, quizzes, onepagers) was broken.

**Root Cause**: 
The `json` module was imported conditionally inside course context try blocks (for logging), but was used unconditionally later in the code for `json.dumps(wizard_dict)`. When generating standalone products (without course context), the conditional import never executed, but `json.dumps()` was still called.

## Error Location

**File**: `custom_extensions/backend/main.py`

**Affected Endpoints**:
1. `/api/custom/lesson-presentation/preview` (line ~23365)
2. `/api/custom/quiz/generate` (line ~29017)
3. `/api/custom/text-presentation/generate` (line ~30364)

**Error Traceback**:
```python
# Line 23106 (inside course context try block)
import json  # Only executed if course context present
logger.info(f"[COURSE_CONTEXT] FULL COURSE STRUCTURE: {json.dumps(...)}")

# Line 23365 (outside try block)
wizard_message = "WIZARD_REQUEST\n" + json.dumps(wizard_dict) + ...  # ERROR!
```

## Solution

**Moved `import json` to the beginning of each endpoint function** to ensure it's always available regardless of course context presence.

### Changes Made

#### 1. Presentation Endpoint (line 23150)

**Before**:
```python
@app.post("/api/custom/lesson-presentation/preview")
async def wizard_lesson_preview(payload: LessonWizardPreview, request: Request, pool: asyncpg.Pool = Depends(get_db_pool)):
    cookies = {ONYX_SESSION_COOKIE_NAME: request.cookies.get(ONYX_SESSION_COOKIE_NAME)}
    # ... rest of function
```

**After**:
```python
@app.post("/api/custom/lesson-presentation/preview")
async def wizard_lesson_preview(payload: LessonWizardPreview, request: Request, pool: asyncpg.Pool = Depends(get_db_pool)):
    import json  # ← Added here
    
    cookies = {ONYX_SESSION_COOKIE_NAME: request.cookies.get(ONYX_SESSION_COOKIE_NAME)}
    # ... rest of function
```

#### 2. Quiz Endpoint (line 28741)

**Before**:
```python
@app.post("/api/custom/quiz/generate")
async def quiz_generate(payload: QuizWizardPreview, request: Request):
    """Generate quiz content with streaming response"""
    logger.info(f"[QUIZ_PREVIEW_START] Quiz preview initiated")
    # ... rest of function
```

**After**:
```python
@app.post("/api/custom/quiz/generate")
async def quiz_generate(payload: QuizWizardPreview, request: Request):
    """Generate quiz content with streaming response"""
    import json  # ← Added here
    
    logger.info(f"[QUIZ_PREVIEW_START] Quiz preview initiated")
    # ... rest of function
```

#### 3. Text Presentation/Onepager Endpoint (line 30147)

**Before**:
```python
@app.post("/api/custom/text-presentation/generate")
async def text_presentation_generate(payload: TextPresentationWizardPreview, request: Request):
    """Generate text presentation content with streaming response"""
    logger.info(f"[TEXT_PRESENTATION_PREVIEW_START] Text presentation preview initiated")
    # ... rest of function
```

**After**:
```python
@app.post("/api/custom/text-presentation/generate")
async def text_presentation_generate(payload: TextPresentationWizardPreview, request: Request):
    """Generate text presentation content with streaming response"""
    import json  # ← Added here
    
    logger.info(f"[TEXT_PRESENTATION_PREVIEW_START] Text presentation preview initiated")
    # ... rest of function
```

#### 4. Removed Redundant Conditional Imports

Also removed the redundant `import json` statements that were inside the course context try blocks since json is now imported at the function level.

**Before** (in all three endpoints):
```python
if course_structure:
    wizard_dict["courseStructure"] = course_structure
    logger.info(f"[COURSE_CONTEXT] Course structure added to wizard request")
    # Log full course structure
    import json  # ← Redundant
    logger.info(f"[COURSE_CONTEXT] FULL COURSE STRUCTURE: {json.dumps(...)}")
```

**After**:
```python
if course_structure:
    wizard_dict["courseStructure"] = course_structure
    logger.info(f"[COURSE_CONTEXT] Course structure added to wizard request")
    # Log full course structure
    logger.info(f"[COURSE_CONTEXT] FULL COURSE STRUCTURE: {json.dumps(...)}")
```

## Testing

### Scenario 1: Standalone Product (No Course Context)
**Test**: Generate presentation without `outlineProjectId`  
**Expected**: ✅ Works - json is imported at function start  
**Result**: ✅ PASS

### Scenario 2: Course Lesson Product (With Course Context)
**Test**: Generate presentation for lesson in a course  
**Expected**: ✅ Works - json imported at function start, course logging works  
**Result**: ✅ PASS

### Scenario 3: All Product Types
**Test**: Generate presentation, quiz, and onepager (both standalone and course-based)  
**Expected**: ✅ All work correctly  
**Result**: ✅ PASS

## Impact Analysis

### What Was Broken
❌ **Standalone product generation completely broken** (presentations, quizzes, onepagers)  
❌ Users couldn't create any products outside of courses  
❌ Production-blocking issue

### What Now Works
✅ **Standalone product generation works**  
✅ **Course-based product generation works**  
✅ **Course context logging works**  
✅ **No conditional import issues**

## Why This Happened

The issue was introduced when adding comprehensive logging for course context (in `COURSE_CONTEXT_LOGGING_AND_SCOPE_IMPROVEMENTS.md`). The logging code imported `json` conditionally to log the full course structure, but the main code path always needed `json` for `json.dumps(wizard_dict)`.

**Timeline**:
1. ✅ Original code: `json` imported at module level (worked)
2. ➕ Added course context logging with conditional `import json` inside try block
3. ❌ Forgot that `json.dumps()` is used unconditionally later
4. 🔥 Standalone products broke (no course context → no import → error)
5. ✅ Fixed by moving import to function start

## Prevention

**Lesson Learned**: 
- Never conditionally import modules that are used unconditionally elsewhere
- Import standard library modules at the beginning of functions or at module level
- Test both code paths when adding conditional features

**Best Practice**:
```python
# ✅ GOOD: Import at function start
def my_function():
    import json
    # ... can use json anywhere in function

# ❌ BAD: Conditional import for unconditional use
def my_function():
    if some_condition:
        import json  # Only imports if condition true
    # ... json.dumps() used here regardless → ERROR!
```

## Related Issues

- `COURSE_CONTEXT_DATABASE_FIXES.md` - Previous course context fixes
- `COURSE_CONTEXT_LOGGING_AND_SCOPE_IMPROVEMENTS.md` - Where conditional import was introduced
- `SAME_LESSON_PRODUCTS_QUIZ_ENHANCEMENT.md` - Quiz enhancement that uses course context

## Files Modified

1. **`custom_extensions/backend/main.py`**:
   - Added `import json` at start of `wizard_lesson_preview()` (line ~23152)
   - Added `import json` at start of `quiz_generate()` (line ~28744)
   - Added `import json` at start of `text_presentation_generate()` (line ~30150)
   - Removed 3 redundant conditional imports

**Total Changes**: 6 locations (3 additions, 3 removals)

## Verification

- ✅ No linter errors
- ✅ json available throughout all three endpoint functions
- ✅ Course context logging still works
- ✅ Standalone product generation works
- ✅ Course-based product generation works

---

## Conclusion

This was a critical bug that completely broke standalone product generation. The fix was simple - move the `json` import to the beginning of each endpoint function to ensure it's always available, regardless of whether course context is present.

**Status**: ✅ Fixed and Verified  
**Severity**: Critical → Resolved  
**Testing**: All scenarios passing

