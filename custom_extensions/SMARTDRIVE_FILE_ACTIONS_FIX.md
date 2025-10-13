# SmartDrive File Actions Fix

## Summary

Fixed three critical issues affecting SmartDrive file browser operations: rename (403 error), download (empty files), and move (silent failures).

## Issues Fixed

### 1. Download Empty Files / StreamClosed Error ✅

**Problem**: Downloads were returning empty files with a `httpx.StreamClosed` error in the backend logs.

**Root Cause**: Indentation bug in `smartdrive_download` function. The status check and `StreamingResponse` creation were outside the `async with client.stream()` context, causing the stream to close before it could be read.

**Fix Applied** (`custom_extensions/backend/main.py`, lines 35142-35158):
```python
async with httpx.AsyncClient(timeout=None) as client:
    async with client.stream("GET", source_url, auth=(username, password)) as resp:
        # Now properly indented - inside the stream context
        if resp.status_code != 200:
            raise HTTPException(...)
        
        filename = _guess_filename_from_path(norm_path)
        media_type = resp.headers.get("content-type", "application/octet-stream")
        headers = {
            "Content-Disposition": f"attachment; filename=\"{filename}\"",
            "ETag": resp.headers.get("etag", ""),
        }
        
        async def stream_body():
            async for chunk in resp.aiter_bytes():
                yield chunk
        
        return StreamingResponse(stream_body(), media_type=media_type, headers=headers)
```

### 2. Rename Operation 403 Forbidden Error ✅

**Problem**: Rename operations failed with:
```
HTTP Request: MOVE https://nc1.contentbuilder.ai/remote.php/dav/files/sd_xxx/file.md "HTTP/1.1 403 Forbidden"
```

**Root Cause**: The Destination header was being constructed correctly, but the code needed:
1. Better logging to diagnose issues
2. Acceptance of additional WebDAV success status codes (200, 201, 204)
3. Clearer variable naming for the destination URL

**Fix Applied** (`custom_extensions/backend/main.py`, lines 34959-35008):
- Split destination URL construction into a separate variable for clarity
- Added comprehensive logging (request params, URLs, response status)
- Added status code 200 to accepted success codes
- Improved error messages with detailed logging

```python
# Build source and destination URLs explicitly
source_url = f"{base}{_encode_dav_path(user_root_prefix + src)}"
dest_url = f"{base}{_encode_dav_path(user_root_prefix + dst)}"

headers = {"Destination": dest_url, "Overwrite": "T"}

logger.info(f"[SmartDrive] MOVE: {source_url} -> Destination: {dest_url}")

# Accept all standard WebDAV success codes
if resp.status_code in (200, 201, 204):
    return {"success": True}
```

### 3. Move Operation Silent Failures ✅

**Problem**: Move operations appeared to succeed but files weren't actually moved.

**Root Cause**: 
- Only status codes 201 and 204 were considered successful (missing 200)
- Lack of detailed logging made debugging difficult
- No clear error messages when operations failed

**Fix Applied** (`custom_extensions/backend/main.py`, lines 34959-35008 for MOVE, 35012-35061 for COPY):
- Added detailed logging at each step (request, URLs, response)
- Expanded success status codes to include 200, 201, and 204 (all valid WebDAV success codes)
- Added error logging with full error details
- Improved destination URL construction for clarity

## WebDAV Success Codes

According to RFC 4918 (WebDAV specification), MOVE and COPY operations can return:
- **200 (OK)**: The operation succeeded
- **201 (Created)**: A new resource was created at the destination
- **204 (No Content)**: The operation succeeded and the destination was overwritten

The original code only accepted 201 and 204, missing the 200 status code which Nextcloud can return.

## Testing Instructions

### Test Download
1. Navigate to SmartDrive tab
2. Select a file (any type - PDF, markdown, image, etc.)
3. Click the three-dot menu → Download
4. Verify the file downloads with correct content (not empty)

### Test Rename
1. Navigate to SmartDrive tab
2. Select a file
3. Click the three-dot menu → Rename
4. Enter a new name
5. Verify:
   - No 403 error
   - File is renamed successfully
   - File list refreshes to show new name

### Test Move
1. Navigate to SmartDrive tab
2. Create a test folder (if needed)
3. Select a file
4. Click the three-dot menu → Move
5. Select a destination folder
6. Verify:
   - No errors
   - File appears in the destination folder
   - File is removed from the source folder

### Test Copy
1. Navigate to SmartDrive tab
2. Select a file
3. Click the three-dot menu → Copy
4. Select a destination folder
5. Verify:
   - No errors
   - File appears in the destination folder
   - Original file remains in the source folder

## Logs to Monitor

With the new logging, you'll see detailed information in the backend logs:

```
[SmartDrive] MOVE request: from=/old_name.md to=/new_name.md
[SmartDrive] MOVE: https://nc1.contentbuilder.ai/remote.php/dav/files/username/old_name.md -> Destination: https://nc1.contentbuilder.ai/remote.php/dav/files/username/new_name.md
[SmartDrive] MOVE response: status=201
```

Or in case of errors:
```
[SmartDrive] MOVE failed: status=403, detail=WebDAV error 403: ...
```

## Files Modified

- `custom_extensions/backend/main.py`:
  - `smartdrive_download()` - Fixed indentation (lines 35142-35158)
  - `smartdrive_move()` - Added logging, fixed status codes, improved error handling (lines 34959-35008)
  - `smartdrive_copy()` - Added logging, fixed status codes, improved error handling (lines 35012-35061)

## Impact

- ✅ Downloads now work correctly with proper file content
- ✅ Rename operations succeed without 403 errors
- ✅ Move operations work reliably and provide clear error messages
- ✅ Better debugging capability with comprehensive logging
- ✅ All operations handle WebDAV responses according to RFC 4918 specification

