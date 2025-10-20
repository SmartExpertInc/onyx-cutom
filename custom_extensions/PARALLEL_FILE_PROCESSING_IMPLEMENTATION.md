# Parallel File Processing Implementation

## Problem Solved

**Issue:** Files were processed sequentially (one by one) when creating content from multiple files, causing:
- 10 files × 15-30 seconds each = 2.5-5 minutes total processing time
- Frequent timeouts after only 2-3 files were processed
- System restarts before all files could be processed

**Root Cause:** Sequential `for file_id in file_ids` loop in `extract_file_context_from_onyx()` that awaited each file extraction before starting the next.

## Solution Implemented

Implemented **batch parallel processing** using `asyncio.gather()` to process multiple files concurrently in batches, similar to the existing avatar video optimization in `presentation_service.py`.

## Changes Made

### File: `custom_extensions/backend/main.py`

### 1. New Batch Processing Helper Function (Lines ~10633-10691)

Added `process_file_batch_with_progress()` function that:
- Processes files in configurable batches (default: 8 files at a time)
- Executes each batch in parallel using `asyncio.gather()`
- Sends optional progress updates to keep frontend connection alive
- Handles exceptions gracefully per file
- Adds brief pauses between batches to avoid overwhelming the system

```python
async def process_file_batch_with_progress(
    file_ids: List[int],
    cookies: Dict[str, str],
    batch_size: int = 8,
    progress_callback: Optional[Callable[[str], Awaitable[None]]] = None
) -> List[Optional[Dict[str, Any]]]:
    """
    Process files in batches to avoid overwhelming the system.
    Sends progress updates to keep frontend connection alive.
    """
```

**Key Features:**
- **Parallel Execution**: Uses `asyncio.gather()` to process multiple files simultaneously
- **Progress Updates**: Optional callback for keeping frontend connection alive
- **Error Handling**: Catches exceptions per file without failing the entire batch
- **Batch Management**: Configurable batch size for optimal performance vs. load
- **Gentle Processing**: 0.5-second pause between batches

### 2. Updated File Processing in `extract_file_context_from_onyx()` (Lines ~10723-10747)

Replaced sequential loop with:
- Single call to `process_file_batch_with_progress()` for all files
- Simplified result processing (no retry loops since they're handled in `extract_single_file_context()`)
- Cleaner error detection and logging

**Before (Sequential):**
```python
for file_id in file_ids:
    file_context = None
    for retry_attempt in range(3):
        file_context = await extract_single_file_context(file_id, cookies)
        # ... retry logic ...
```

**After (Parallel Batches):**
```python
if file_ids:
    logger.info(f"[FILE_CONTEXT] Starting batch parallel processing for {len(file_ids)} files")
    file_results = await process_file_batch_with_progress(file_ids, cookies, batch_size=8)
    # Process results...
```

### 3. Updated Folder Processing (Lines ~10749-10766)

Replaced sequential folder processing with:
- Single parallel batch using `asyncio.gather()` for all folders
- Simplified exception handling using `return_exceptions=True`
- Cleaner result processing

**Before (Sequential):**
```python
for folder_id in folder_ids:
    try:
        folder_context = await extract_folder_context(folder_id, cookies)
        # ... process ...
```

**After (Parallel):**
```python
if folder_ids:
    folder_tasks = [extract_folder_context(folder_id, cookies) for folder_id in folder_ids]
    folder_results = await asyncio.gather(*folder_tasks, return_exceptions=True)
    # Process results...
```

## Performance Improvements

### Before (Sequential Processing)

- **10 files**: 10 × 20 seconds = 200 seconds (3.3 minutes)
- **Result**: Often timed out after 2-3 files

### After (Batch Parallel Processing with batch_size=8)

- **Batch 1**: 8 files in parallel = ~25 seconds (max of individual processing times)
- **Batch 2**: 2 files in parallel = ~20 seconds
- **Total**: ~45 seconds

**Speed Improvement: 77% faster! (200s → 45s)**

### Scalability

| Files | Sequential Time | Parallel Time (batch=8) | Speedup |
|-------|----------------|-------------------------|---------|
| 3     | 60s            | 25s                     | 58%     |
| 10    | 200s           | 45s                     | 77%     |
| 20    | 400s           | 70s                     | 82%     |
| 50    | 1000s (16m)    | 160s (2.6m)             | 84%     |

## Configuration

The `batch_size` parameter can be adjusted based on system load and network conditions:

- `batch_size=5`: Conservative approach for slower networks or limited resources
- `batch_size=8`: **Recommended default** - balanced performance and load
- `batch_size=10`: Aggressive approach for maximum speed with good infrastructure

## Keep-Alive Support

The implementation includes optional `progress_callback` parameter that enables:
- Periodic progress updates during batch processing
- Frontend connection keep-alive messages
- Better user experience with visible progress

This can be integrated with existing streaming response patterns (like those used in preview generation) to send progress updates.

## Error Handling

### Robust Exception Management

1. **Per-File Exceptions**: Each file's exception is caught and logged without failing the entire batch
2. **Batch-Level Recovery**: Failed files return `None`, allowing successful files to be processed
3. **Exception Tracking**: Using `return_exceptions=True` in `asyncio.gather()` prevents one failure from canceling other tasks

### Logging

Enhanced logging at multiple levels:
- `[FILE_CONTEXT]` prefix for all file processing logs
- Batch progress: "Processing batch X/Y: files N to M"
- Individual file success/failure
- Total extraction summary

## Testing Recommendations

Test with various file counts to ensure robustness:

1. **Single file** (1 file): Should work as before
2. **Small batch** (3 files): All in one batch
3. **Medium batch** (10 files): Multiple batches (2 batches with size=8)
4. **Large batch** (20+ files): Many batches to test pagination and timeout prevention

### Monitor For

- "Processing batch X/Y" messages in logs
- Successful extraction counts matching input
- Total processing time significantly reduced
- No timeout errors
- Connection staying alive during processing

## Compatibility

- ✅ **Backward Compatible**: Works with existing file extraction logic
- ✅ **Optional Progress**: Progress callback is optional, works without it
- ✅ **Cache Compatible**: Works with existing `FILE_CONTEXT_CACHE`
- ✅ **Error Tolerant**: Gracefully handles partial failures
- ✅ **Folder Support**: Both files and folders processed in parallel

## Implementation Pattern

This implementation follows the same pattern used successfully in:
- `presentation_service.py` - `_initiate_all_avatar_videos()` (lines 1134-1184)
- Uses proven `asyncio.gather()` pattern for parallel processing
- Similar progress tracking and error handling approach

## Future Enhancements

Potential improvements for future iterations:

1. **Dynamic Batch Sizing**: Adjust batch size based on file size or system load
2. **Progress Streaming**: Integrate with streaming endpoints to show real-time progress
3. **Retry Logic in Batch**: Add configurable retry logic at batch level
4. **Metrics Collection**: Track and report batch processing statistics
5. **Rate Limiting**: Add adaptive rate limiting if API constraints detected

## Files Modified

- `custom_extensions/backend/main.py`:
  - Added `process_file_batch_with_progress()` function
  - Updated `extract_file_context_from_onyx()` file processing
  - Updated `extract_file_context_from_onyx()` folder processing

## Related Documentation

- `PARALLEL_AVATAR_GENERATION_OPTIMIZATION.md` - Similar optimization pattern for video generation
- `TIMEOUT_ISSUE_FIXED.md` - Related timeout handling improvements

