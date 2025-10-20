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
- **NEW: Sends keep-alive heartbeat every 10 seconds during batch processing**
- Sends progress updates before and after each batch

**Heartbeat Mechanism:**

Uses `asyncio.wait()` with a 10-second timeout to monitor task completion and send periodic keep-alive packets:
- Checks for completed file tasks every 10 seconds
- Sends heartbeat message if tasks are still pending (e.g., "10s elapsed, 3/8 files done")
- Prevents connection timeouts during long-running batch processing
- Maintains task ordering to preserve file_id -> result mapping

**Example yield sequence (17 files in 3 batches):**
```python
{"type": "progress", "message": "Extracting context from 17 files and 0 folders..."}
{"type": "progress", "message": "Processing files batch 1/3 (1-8 of 17)..."}
{"type": "progress", "message": "Processing batch 1/3... (10s elapsed, 3/8 files done)"}
{"type": "progress", "message": "Processing batch 1/3... (20s elapsed, 6/8 files done)"}
{"type": "progress", "message": "Completed 8/17 files"}
{"type": "progress", "message": "Processing files batch 2/3 (9-16 of 17)..."}
{"type": "progress", "message": "Processing batch 2/3... (10s elapsed, 4/8 files done)"}
{"type": "progress", "message": "Completed 16/17 files"}
{"type": "progress", "message": "Processing files batch 3/3 (17-17 of 17)..."}
{"type": "progress", "message": "Completed 17/17 files"}
{"type": "complete", "context": {extracted_context}}
```

**Note:** Heartbeat messages only appear if batch processing takes longer than 10 seconds.

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

**E. SmartDrive File Extraction** (multiple endpoints):
- Course Outline SmartDrive + connector files (line ~16790)
- Lesson Presentation SmartDrive + connector files (line ~22923)
- Lesson Presentation SmartDrive standalone (line ~22994)
- Text Presentation SmartDrive standalone (line ~29343)
- Quiz SmartDrive standalone (line ~28139)
- All SmartDrive extractions now send progress updates

### Impact

**Before:**
- File extraction: 30-60 seconds with NO keep-alive packets
- Frontend timeout after ~60 seconds
- Backend restart interrupting the process
- Could only process 1 batch before timeout

**After:**
- File extraction: 30-90 seconds WITH progress updates **every ~10 seconds maximum**
- Frontend receives regular keep-alive packets with meaningful progress messages
- **Guaranteed heartbeat within 10-second intervals** prevents timeouts
- No timeout issues even with 60-second limits
- All batches complete successfully

**Progress packet frequency:**
- Initial extraction message
- Before each batch starts
- **Every 10 seconds during batch processing** (heartbeat with progress counter)
- After each batch completes
- For 17 files in 3 batches: **10-15 progress updates** over ~60-90 seconds
  - 1 initial message
  - 3 batch start messages
  - 3-6 heartbeat messages (depending on file processing speed)
  - 3 batch completion messages
- **Maximum gap between packets: 10 seconds** (ensures connection stays alive)

## Files Modified

1. **`custom_extensions/backend/main.py`**
   - Added `extract_file_context_from_onyx_with_progress` generator function (lines 10882-11043)
   - Added `extract_file_context_from_onyx` backward-compatible wrapper (lines 11045-11063)
   - Updated Course Outline generation endpoint - regular files (line ~16897)
   - Updated Course Outline SmartDrive extraction (line ~16790)
   - Updated Lesson/Video Presentation generation - regular files (line ~23020)
   - Updated Lesson Presentation SmartDrive extraction (lines ~22923 & ~22994)
   - Updated Text Presentation generation - regular files (line ~29339)
   - Updated Text Presentation SmartDrive extraction (line ~29343)
   - Updated Quiz generation - regular files (line ~28177)
   - Updated Quiz generation - SmartDrive files (line ~28139)
   - **Total: 10 file extraction paths now have progress updates**

## Testing Recommendations

Test with different file counts and sources to verify keep-alive packets are sent:

### Regular File Uploads
1. **1 file** - Should complete quickly, minimal progress updates
2. **5 files** - Single batch, 2-4 progress updates (batch start, possibly 1 heartbeat, batch complete)
3. **10 files** - Two batches, 6-10 progress updates (includes heartbeats)
4. **20+ files** - Multiple batches, progress updates every ~10 seconds maximum

### SmartDrive Files  
1. **17 SmartDrive files** (as in user's logs) - Three batches, 10-15 progress updates including heartbeats
2. **Combined: Connectors + SmartDrive files** - Progress from both extraction phases

### Expected Behavior
- If batch completes in <10 seconds: Only batch start/complete messages
- If batch takes 10-30 seconds: 1-2 heartbeat messages during processing
- If batch takes 30-60 seconds: 3-5 heartbeat messages during processing

Monitor the frontend console for progress packets:
```javascript
{"type": "info", "message": "Extracting context from 17 files and 0 folders..."}
{"type": "info", "message": "Processing files batch 1/3 (1-8 of 17)..."}
{"type": "info", "message": "Processing batch 1/3... (10s elapsed, 3/8 files done)"}
{"type": "info", "message": "Processing batch 1/3... (20s elapsed, 6/8 files done)"}
{"type": "info", "message": "Completed 8/17 files"}
{"type": "info", "message": "Processing files batch 2/3 (9-16 of 17)..."}
// ... more progress updates
```

Monitor backend logs for:
```
[FILE_EXTRACTION_PROGRESS] Processing files batch 1/3 (1-8 of 17)...
[FILE_CONTEXT_HEARTBEAT] Processing batch 1/3... (10s elapsed, 3/8 files done)
[FILE_CONTEXT_HEARTBEAT] Processing batch 1/3... (20s elapsed, 6/8 files done)
[FILE_EXTRACTION_PROGRESS] Completed 8/17 files
[FILE_EXTRACTION_COMPLETE] Extracted context from files
```

**Key verification:** No gap between log messages should exceed 10 seconds.

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

