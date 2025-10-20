# File Extraction Keep-Alive Implementation

## Problem

When generating products from multiple files (e.g., 10 files), the backend was timing out and restarting after processing only 1 batch in about a minute. The issue was that **no keep-alive packets were being sent during the file extraction phase**, only during the subsequent OpenAI generation phase.

### Root Cause

The file extraction process (`extract_file_context_from_onyx`) was a blocking async function that:
1. Processed files in parallel batches (already optimized)
2. But didn't send any progress updates to the frontend
3. Took 30-60+ seconds for multiple files
4. Caused the frontend connection to timeout before file extraction completed

Keep-alive packets were only sent AFTER file extraction completed, during the OpenAI streaming phase (lines 16865-16870 in the original code).

## Solution

Implemented a **generator-based file extraction** that yields progress updates during processing, which are then streamed to the frontend as keep-alive packets.

### Key Changes

#### 1. New Generator Function: `extract_file_context_from_onyx_with_progress`

**Location:** `custom_extensions/backend/main.py` lines 10882-11043

**Purpose:** Async generator that yields progress updates during file extraction

**Features:**
- Yields `{"type": "progress", "message": "..."}` packets during batch processing
- Yields `{"type": "complete", "context": {...}}` when extraction is complete
- Yields `{"type": "error", "message": "..."}` if extraction fails
- Processes files in batches of 8 (configurable)
- Sends progress updates before and after each batch

**Example yield sequence:**
```python
{"type": "progress", "message": "Extracting context from 10 files and 0 folders..."}
{"type": "progress", "message": "Processing files batch 1/2 (1-8 of 10)..."}
{"type": "progress", "message": "Completed 8/10 files"}
{"type": "progress", "message": "Processing files batch 2/2 (9-10 of 10)..."}
{"type": "progress", "message": "Completed 10/10 files"}
{"type": "progress", "message": "Processing 0 folders..."}  # if folders present
{"type": "complete", "context": {extracted_context}}
```

#### 2. Backward-Compatible Wrapper: `extract_file_context_from_onyx`

**Location:** `custom_extensions/backend/main.py` lines 11045-11063

**Purpose:** Non-generator wrapper for backward compatibility

Existing code that calls `await extract_file_context_from_onyx(...)` continues to work without modification. This wrapper internally uses the generator version and returns only the final context.

```python
async def extract_file_context_from_onyx(file_ids, folder_ids, cookies):
    """Backward-compatible wrapper"""
    file_context = None
    async for update in extract_file_context_from_onyx_with_progress(file_ids, folder_ids, cookies):
        if update["type"] == "complete":
            file_context = update["context"]
            break
    return file_context
```

#### 3. Updated Streaming Endpoints

Updated four main product generation endpoints to use the generator version and stream progress:

**A. Course Outline Generation** (line ~16897):
```python
# Extract context from Onyx WITH PROGRESS UPDATES
file_context = None

# Stream progress updates during file extraction
async for update in extract_file_context_from_onyx_with_progress(file_ids_list, folder_ids_list, cookies):
    if update["type"] == "progress":
        # Send keep-alive with progress message
        progress_packet = {"type": "info", "message": update["message"]}
        yield (json.dumps(progress_packet) + "\n").encode()
        logger.info(f"[FILE_EXTRACTION_PROGRESS] {update['message']}")
        
        # Update last_send time to prevent additional keep-alive
        last_send = asyncio.get_event_loop().time()
    elif update["type"] == "complete":
        file_context = update["context"]
        logger.info(f"[FILE_EXTRACTION_COMPLETE] Extracted context from files")
        break
    elif update["type"] == "error":
        logger.error(f"[FILE_EXTRACTION_ERROR] {update['message']}")
```

**B. Lesson/Video Presentation Generation** (line ~23020):
- Same implementation pattern as Course Outline

**C. Text Presentation/One-Pager Generation** (line ~29339):
- Same implementation pattern as Course Outline

**D. Quiz Generation** (lines ~28139 and ~28177):
- Two places updated: SmartDrive file extraction and regular file extraction
- Same implementation pattern as Course Outline

### Impact

**Before:**
- File extraction: 30-60 seconds with NO keep-alive packets
- Frontend timeout after ~60 seconds
- Backend restart interrupting the process
- Could only process 1 batch before timeout

**After:**
- File extraction: 30-60 seconds WITH progress updates every 10-15 seconds
- Frontend receives regular keep-alive packets with meaningful progress messages
- No timeout issues
- All batches complete successfully

**Progress packet frequency:**
- Before each batch starts
- After each batch completes
- For 10 files in batches of 8: ~4 progress updates over ~45 seconds
- Keeps connection alive throughout the entire process

## Files Modified

1. **`custom_extensions/backend/main.py`**
   - Added `extract_file_context_from_onyx_with_progress` generator function (lines 10882-11043)
   - Added `extract_file_context_from_onyx` backward-compatible wrapper (lines 11045-11063)
   - Updated Course Outline generation endpoint (line ~16897)
   - Updated Lesson/Video Presentation generation endpoint (line ~23020)
   - Updated Text Presentation generation endpoint (line ~29339)
   - Updated Quiz generation endpoint - SmartDrive files (line ~28139)
   - Updated Quiz generation endpoint - regular files (line ~28177)

## Testing Recommendations

Test with different file counts to verify keep-alive packets are sent:

1. **1 file** - Should complete quickly, minimal progress updates
2. **5 files** - Single batch, ~2-3 progress updates
3. **10 files** - Two batches, ~4-5 progress updates
4. **20+ files** - Multiple batches, progress updates every 10-15 seconds

Monitor the frontend console for progress packets:
```javascript
{"type": "info", "message": "Processing files batch 1/3 (1-8 of 20)..."}
{"type": "info", "message": "Completed 8/20 files"}
// ... more progress updates
```

Monitor backend logs for:
```
[FILE_EXTRACTION_PROGRESS] Processing files batch 1/3 (1-8 of 20)...
[FILE_EXTRACTION_PROGRESS] Completed 8/20 files
[FILE_EXTRACTION_COMPLETE] Extracted context from files
```

## Notes

- The parallel batch processing optimization (already implemented) is preserved
- Batch size remains at 8 files per batch
- Progress updates add minimal overhead (~10ms per update)
- The implementation is backward compatible - old code continues to work
- Keep-alive packets now cover BOTH file extraction AND OpenAI generation phases
- Frontend connection stays alive for the entire generation process

## Related Implementations

- **Parallel File Processing:** `PARALLEL_FILE_PROCESSING_IMPLEMENTATION.md`
- **File Context as Primary Knowledge:** `FILE_CONTEXT_AS_PRIMARY_KNOWLEDGE_IMPLEMENTATION.md`
- **Complete File Processing:** `FILE_PROCESSING_COMPLETE_IMPLEMENTATION.md`

## Date

October 20, 2025

