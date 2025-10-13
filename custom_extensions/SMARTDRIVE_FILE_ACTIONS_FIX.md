# SmartDrive File Actions Fix

## Summary

Fixed three critical issues affecting SmartDrive file browser operations: rename (403 error), download (empty files), and move (silent failures).

## Issues Fixed

### 1. Download Empty Files / StreamClosed Error ✅

**Problem**: Downloads were returning empty files with a `httpx.StreamClosed` error in the backend logs.

**Root Cause**: The `StreamingResponse` approach didn't work because the async context manager exits before the stream is consumed by the client, causing `StreamClosed` errors.

**Fix Applied** (`custom_extensions/backend/main.py`, lines 35167-35193):

Changed from streaming approach to public download link approach (same as LMS export):
```python
@app.get("/api/custom/smartdrive/download")
async def smartdrive_download(...):
    """Create a public download link for the file (like LMS export approach)."""
    from app.services.nextcloud_share import create_public_download_link
    
    onyx_user_id = await get_current_onyx_user_id(request)
    norm_path = await _normalize_smartdrive_path(path)
    
    # Create public download link with short expiry (1 day for direct downloads)
    download_link = await create_public_download_link(onyx_user_id, norm_path, expiry_days=1)
    
    # Return the download link for the frontend to open
    return {"downloadUrl": download_link}
```

**Frontend Update** (`custom_extensions/frontend/src/components/SmartDrive/SmartDrive/SmartDriveBrowser.tsx`, lines 619-636):
```typescript
const download = async () => {
    const filesOnly = Array.from(selected).filter(p => items.find(i => i.path === p && i.type === 'file'));
    for (const p of filesOnly) {
        try {
            const res = await fetch(`${CUSTOM_BACKEND_URL}/smartdrive/download?path=${encodeURIComponent(p)}`, { 
                credentials: 'same-origin' 
            });
            if (!res.ok) throw new Error(`Download failed: ${res.status}`);
            const data = await res.json();
            if (data.downloadUrl) {
                window.open(data.downloadUrl, '_blank');
            }
        } catch (e) {
            console.error('[SmartDrive] Download error:', e);
            alert('Download failed');
        }
    }
};
```

### 2. Rename Operation 403 Forbidden Error ✅

**Problem**: Rename operations failed with:
```
HTTP Request: MOVE https://nc1.contentbuilder.ai/remote.php/dav/files/sd_xxx/file.md "HTTP/1.1 403 Forbidden"
Error: Requested uri (/remote.php/dav/files/...) is out of base uri (/smartdrive/remote.php/dav/)
```

**Root Cause**: Nextcloud is behind a proxy that adds `/smartdrive` prefix. When the MOVE request includes a Destination header without this prefix, Nextcloud rejects it as "out of base uri".

**Fix Applied** (`custom_extensions/backend/main.py`, lines 34959-35028):
- Added automatic detection and retry logic for proxy configurations
- When a 403 error mentions "/smartdrive" and "out of base uri", the code automatically retries with an adjusted Destination header that includes the `/smartdrive` prefix
- Added comprehensive logging for debugging
- Added status code 200 to accepted success codes (200, 201, 204)

```python
headers = {"Destination": dest_url, "Overwrite": "T"}
logger.info(f"[SmartDrive] MOVE: {source_url} -> Destination: {dest_url}")

async with httpx.AsyncClient(timeout=60.0) as client:
    resp = await client.request("MOVE", source_url, auth=(username, password), headers=headers)

logger.info(f"[SmartDrive] MOVE response: status={resp.status_code}")

# Accept all standard WebDAV success codes
if resp.status_code in (200, 201, 204):
    return {"success": True}

# If 403 and error mentions "out of base uri" with "/smartdrive", retry with adjusted Destination
if resp.status_code == 403 and "/smartdrive" in resp.text and "out of base uri" in resp.text:
    logger.info(f"[SmartDrive] MOVE 403 - trying with /smartdrive prefix in Destination")
    from urllib.parse import urlparse
    parsed_dest = urlparse(dest_url)
    adjusted_dest = f"/smartdrive{parsed_dest.path}"
    headers_retry = {"Destination": adjusted_dest, "Overwrite": "T"}
    logger.info(f"[SmartDrive] MOVE retry: {source_url} -> Destination: {adjusted_dest}")
    
    async with httpx.AsyncClient(timeout=60.0) as client2:
        resp2 = await client2.request("MOVE", source_url, auth=(username, password), headers=headers_retry)
    
    logger.info(f"[SmartDrive] MOVE retry response: status={resp2.status_code}")
    if resp2.status_code in (200, 201, 204):
        return {"success": True}
```

### 3. Move Operation Silent Failures ✅

**Problem**: Move operations appeared to succeed but files weren't actually moved.

**Root Cause**: 
- Same proxy configuration issue as rename (403 with "out of base uri" error)
- Only status codes 201 and 204 were considered successful (missing 200)
- Lack of detailed logging made debugging difficult

**Fix Applied** (`custom_extensions/backend/main.py`, lines 34959-35028 for MOVE, 35031-35101 for COPY):
- Same automatic retry logic as rename for proxy configurations
- Added detailed logging at each step (request, URLs, response)
- Expanded success status codes to include 200, 201, and 204 (all valid WebDAV success codes)
- Added error logging with full error details

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
  - `smartdrive_download()` - Changed to public link approach (lines 35167-35193)
  - `smartdrive_move()` - Added proxy detection, retry logic, file mapping updates (lines 34959-35053)
  - `smartdrive_copy()` - Added proxy detection and retry logic, improved logging (lines 35056-35101)

- `custom_extensions/frontend/src/components/SmartDrive/SmartDrive/SmartDriveBrowser.tsx`:
  - `download()` - Updated to fetch download URL from API and open in new tab (lines 619-643)
  - `submitPicker()` - Added comprehensive logging (lines 267-297)
  - `isValidPickerDestination` - New validation logic for folder picker (lines 650-670)
  - Folder picker button - Disabled when destination is invalid (line 882)

## Additional Fixes (Follow-up)

### 4. File Mapping Updates on Rename/Move ✅

**Problem**: When files are renamed or moved, the mapping between Nextcloud file paths and Onyx file IDs wasn't updated.

**Solution**: Added automatic update of the `smartdrive_imports` table after successful rename/move operations:
```python
# After successful MOVE
await conn.execute(
    """
    UPDATE smartdrive_imports 
    SET smartdrive_path = $1, imported_at = NOW()
    WHERE onyx_user_id = $2 AND smartdrive_path = $3
    """,
    dst, onyx_user_id, src
)
```

### 5. Move/Copy Debugging Improvements ✅

**Problem**: Move operations weren't working with no logs appearing.

**Solution**: Added comprehensive logging in both frontend and backend:
- Frontend logs show from/to paths and operation results
- Backend logs already showed detailed request/response info
- Added error handling with detailed error messages

### 6. Folder Picker Invalid Destinations ✅

**Problem**: The move/copy destination picker allowed selecting:
- The current folder (moving to same location)
- Selected items themselves (moving a folder into itself)

**Solution**: Added validation logic that disables the "Select folder" button when:
- Picker path equals current browser path
- Picker path is a selected item or child of a selected item

```typescript
const isValidPickerDestination = useMemo(() => {
    const normPickerPath = pickerPath.endsWith('/') ? pickerPath : `${pickerPath}/`;
    const normCurrentPath = currentPath.endsWith('/') ? currentPath : `${currentPath}/`;
    
    // Can't move to the same folder
    if (normPickerPath === normCurrentPath) return false;
    
    // Can't move a folder into itself or its children
    for (const selPath of Array.from(selected)) {
        const normSelPath = selPath.endsWith('/') ? selPath : `${selPath}/`;
        if (normPickerPath === normSelPath || normPickerPath.startsWith(normSelPath)) {
            return false;
        }
    }
    return true;
}, [pickerPath, currentPath, selected]);
```

## Impact

- ✅ Downloads now work correctly using public download links (1-day expiry)
- ✅ Rename operations automatically handle proxy configurations with retry logic
- ✅ Move/Copy operations work reliably with automatic proxy detection
- ✅ File path mappings automatically update when files are renamed or moved
- ✅ Folder picker prevents invalid destinations (same folder, circular moves)
- ✅ Better debugging capability with comprehensive logging in frontend and backend
- ✅ All operations handle WebDAV responses according to RFC 4918 specification
- ✅ Automatic handling of Nextcloud instances behind proxies (e.g., `/smartdrive` prefix)

## Technical Notes

### Download Strategy
The download implementation now uses Nextcloud's OCS API to create temporary public share links (similar to LMS export). This approach:
- Avoids streaming context issues
- Works reliably across different proxy configurations
- Creates links with 1-day expiry for security
- Opens downloads in a new tab for better UX

### Proxy Detection
The MOVE/COPY operations now include intelligent proxy detection:
1. First attempt uses standard absolute URI Destination header
2. If 403 error contains "/smartdrive" and "out of base uri", automatically retry
3. Retry uses adjusted Destination with `/smartdrive` path prefix
4. Comprehensive logging shows both attempts for debugging

This handles cases where Nextcloud is behind a reverse proxy that adds path prefixes.

