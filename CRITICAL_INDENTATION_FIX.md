# Critical Indentation Fix - Legacy Extractor Guard

## Issue
The legacy file extractor was still running even after successful agentic extraction due to incorrect indentation.

## Root Cause
After adding the guard check `if file_context is None:`, the line that sets `file_context = None` in the exception handler was **outside** the except block:

```python
except Exception as e:
    logger.error(f"[SMARTDRIVE] Direct extraction failed, using fallback: {e}")
file_context = None  # ❌ WRONG - runs always, even on success!

if file_context is None:  # Always True because line above always runs
    # Legacy extractor runs unconditionally
```

## Fix Applied
Moved `file_context = None` **inside** the except block:

```python
except Exception as e:
    logger.error(f"[SMARTDRIVE] Direct extraction failed, using fallback: {e}")
    file_context = None  # ✅ CORRECT - only runs on exception

if file_context is None:  # Now only True when extraction actually failed
    # Legacy extractor only runs as fallback
```

## Locations Fixed (4 total)
1. **Course Outline** - SmartDrive only path (line 21257-21258)
2. **Lesson Presentation** - SmartDrive only path (line 29304-29305)
3. **Quiz** - SmartDrive only path (line 34946-34947)
4. **Text Presentation** - SmartDrive only path (line 36937-36938)

## Expected Behavior Now
- ✅ Agentic extraction runs and succeeds with 15 chunks
- ✅ `file_context` remains set to the agentic result dictionary
- ✅ Guard check `if file_context is None:` evaluates to False
- ✅ Legacy extractor is **skipped**
- ✅ Final assembler receives the 15 agentic chunks
- ✅ Presentation uses rich, focused content instead of generic summary

## Testing
Re-run the Ukrainian PDF test. Expected logs:
```
INFO:main:[SMARTDRIVE] Agentic extraction success: 15 chunks
INFO:main:[HYBRID_STREAM] Starting OpenAI generation with enhanced context
INFO:main:[FIDELITY_DEBUG] File context (string): ~40000 chars  # Full agentic chunks
```

**No longer expected:**
```
INFO:main:[ENDPOINT_FALLBACK] Falling back to legacy extraction...  # Should NOT appear
```

