# SCORM Streaming Keep-Alive Implementation

## Problem

The SCORM export was timing out with **504 Gateway Timeout** errors because:
1. Slide height calculation with headless browser (Pyppeteer) takes 30-60+ seconds
2. No keep-alive packets were being sent during processing
3. Frontend/nginx timeout limits (typically 60 seconds) were being exceeded
4. User would see timeout errors despite the backend still processing

## Solution

Implemented a **streaming response architecture** that sends progress updates every ~10 seconds during SCORM package generation, matching the file extraction keep-alive pattern.

### Key Changes

#### 1. Backend Generator Functions (`scorm_packager.py`)

**A. `_render_slide_deck_html_with_progress`** (Lines 540-672)
- Async generator that yields progress updates during slide height calculation
- Sends heartbeat every 10 seconds with progress counter
- Returns: `{"type": "progress", "message": "..."}` or `{"type": "complete", "html": "..."}`

```python
# Calculate heights for each slide with progress updates every 10 seconds
start_time = time.time()
last_progress_time = start_time

for i, slide_data in enumerate(slides):
    height = await calculate_slide_dimensions(slide_data, theme, browser, effective_version)
    slide_heights.append(height)
    
    # Send keep-alive progress update every 10 seconds
    current_time = time.time()
    if current_time - last_progress_time >= 10:
        elapsed = int(current_time - start_time)
        yield {"type": "progress", "message": f"Processing slides... {i + 1}/{len(slides)} complete ({elapsed}s elapsed)"}
        last_progress_time = current_time
```

**B. `_render_slide_deck_html`** (Lines 675-681)
- Backward-compatible wrapper that uses the generator
- Maintains existing API for non-streaming callers

**C. `build_scorm_package_zip_with_progress`** (Lines 1387-1722)
- Main generator function that builds SCORM package with progress updates
- Yields progress at key stages:
  - Loading course outline
  - Fetching products
  - Processing each lesson
  - Rendering slide decks (forwards progress from `_render_slide_deck_html_with_progress`)
  - Generating SCORM manifest
  - Finalizing package
- Returns: `{"type": "progress", "message": "..."}` or `{"type": "complete", "filename": "...", "zip_bytes": b"..."}`

**D. `build_scorm_package_zip`** (Lines 1725-1735)
- Backward-compatible wrapper for existing callers

#### 2. Streaming API Endpoint (`main.py`)

**`export_scorm_package`** (Lines 40266-40333)
- Converts SCORM generation to a streaming response
- Nested async generator `generate_with_progress()` that:
  1. Validates user access
  2. Calls `build_scorm_package_zip_with_progress`
  3. Forwards progress updates as JSON packets
  4. Sends completion packet with filename
  5. Sends the ZIP file bytes
  6. Handles errors gracefully

```python
async for update in build_scorm_package_zip_with_progress(request.courseOutlineId, onyx_user_id):
    if update["type"] == "progress":
        # Send progress update as keep-alive
        progress_packet = {"type": "progress", "message": update["message"]}
        yield (json.dumps(progress_packet) + "\n").encode()
    elif update["type"] == "complete":
        # Send completion message with filename
        completion_packet = {"type": "complete", "filename": filename, "size": len(zip_bytes)}
        yield (json.dumps(completion_packet) + "\n").encode()
        # Send the ZIP bytes
        yield zip_bytes
```

#### 3. Frontend Streaming Handler (`ScormDownloadButton.tsx`)

**`handleDownload`** (Lines 18-120)
- Processes streaming response with two phases:
  1. **JSON Phase**: Reads progress/complete/error messages
  2. **Binary Phase**: Collects ZIP file bytes
- Updates toast notifications with progress messages
- Downloads file when complete

```typescript
// Process streaming response
const reader = res.body.getReader();
const decoder = new TextDecoder();
let buffer = '';
let zipBytes: Uint8Array[] = [];
let isProcessingJSON = true;

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  if (isProcessingJSON) {
    // Parse JSON messages and update UI
    const data = JSON.parse(line);
    if (data.type === 'progress') {
      updateToast(toastId, { description: data.message });
    } else if (data.type === 'complete') {
      filename = data.filename;
      isProcessingJSON = false;
    }
  } else {
    // Collect ZIP bytes
    zipBytes.push(value);
  }
}

// Create blob and trigger download
const blob = new Blob(zipBytes as BlobPart[], { type: 'application/zip' });
```

### Benefits

**Before:**
- Silent processing for 30-90+ seconds
- 504 Gateway Timeout errors
- No feedback to user about progress
- Backend kept calculating after frontend timeout

**After:**
- Progress updates every ~10 seconds maximum
- No timeout issues even with 2-minute+ processing
- User sees real-time progress:
  - "Loading course outline..."
  - "Fetching products for 'Course Name'..."
  - "Processing lesson 1/5: Lesson Title"
  - "Calculating slide dimensions for 15 slides..."
  - "Processing slides... 5/15 complete (20s elapsed)"
  - "All 15 slide dimensions calculated"
  - "Generating SCORM manifest..."
  - "Finalizing SCORM package..."
- Toast automatically updates with current status
- Graceful error handling

### Technical Details

**Keep-Alive Mechanism:**
- Progress updates sent at least every 10 seconds during slide processing
- Prevents HTTP connection timeout
- Headers set: `Cache-Control: no-cache`, `X-Accel-Buffering: no`

**Data Flow:**
1. Frontend initiates POST request
2. Backend starts streaming response
3. JSON packets sent for progress updates (newline-delimited)
4. Completion packet sent with metadata
5. Binary ZIP data sent
6. Frontend collects bytes and triggers download

**Error Handling:**
- Errors caught and sent as `{"type": "error", "message": "..."}` packets
- Frontend displays error in toast
- Connection cleaned up properly

### Impact on Existing Code

- **Backward Compatible**: Existing non-streaming callers still work
- **No Breaking Changes**: Original `build_scorm_package_zip` function maintained as wrapper
- **Progressive Enhancement**: Streaming only used when called from streaming endpoint

## Files Modified

1. **`custom_extensions/backend/app/services/scorm_packager.py`**
   - Added imports: `time`, `AsyncGenerator`
   - Added `_render_slide_deck_html_with_progress` generator (new)
   - Modified `_render_slide_deck_html` to use generator (wrapper)
   - Added `build_scorm_package_zip_with_progress` generator (new)
   - Modified `build_scorm_package_zip` to use generator (wrapper)

2. **`custom_extensions/backend/main.py`**
   - Modified `export_scorm_package` endpoint to use streaming response
   - Changed from returning ZIP directly to streaming JSON + binary
   - Added progress forwarding and error handling

3. **`custom_extensions/frontend/src/components/ScormDownloadButton.tsx`**
   - Modified `handleDownload` to process streaming response
   - Added two-phase parsing (JSON then binary)
   - Added real-time toast updates for progress

## Testing

To verify the fix:
1. Export a SCORM package for a training plan with multiple lessons containing presentations
2. Observe toast messages updating every ~10 seconds with progress
3. Verify no 504 timeout errors even for large courses (90+ seconds processing)
4. Confirm downloaded ZIP file is valid and contains all content

## Related Implementations

This implementation follows the same pattern as:
- File Extraction Keep-Alive (`FILE_EXTRACTION_KEEP_ALIVE_IMPLEMENTATION.md`)
- File Extraction Heartbeat Fix (`FILE_EXTRACTION_HEARTBEAT_FIX.md`)

Pattern ensures consistent user experience across all long-running operations.

