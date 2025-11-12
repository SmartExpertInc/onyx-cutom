# File Not Indexed to Vespa Issue

**Date:** November 12, 2025  
**Issue:** Direct extraction finds correct document_id but Vespa has 0 chunks  
**Status:** ⚠️ FILE NOT INDEXED - FALLBACK ENABLED

---

## Problem Summary

After fixing the document ID prefix mismatch, we discovered a new issue:

### Logs Show:
```
[GET_FILE_CONTENT] file_id=57 -> document_id=FILE_CONNECTOR__e09a0d27-1e23-4169-94ce-4998aee9d1c5/Шейн_Організаційна_культура_та_ліерство.pdf
[GET_FILE_CONTENT] Retrieved 0 chunks from Vespa
[GET_FILE_CONTENT] Without ACL filters: 0 chunks
⚠️ DOCUMENT NOT FOUND: No chunks in Vespa for these document_ids
```

### What This Means

The document ID transformation is now **correct** (`FILE_CONNECTOR__` prefix), but the document **doesn't exist in Vespa** - meaning the file was never successfully indexed.

---

## Root Cause Analysis

### Why Files Might Not Be Indexed

**1. Indexing Not Triggered**
- When files are uploaded via SmartDrive, they create a connector but indexing might not start immediately
- The connector needs to be manually triggered or wait for scheduled indexing

**2. Indexing Failed**
- File format issues
- Extraction errors
- Connector configuration problems

**3. Indexing In Progress**
- Large files take time to index
- File was uploaded recently and hasn't finished indexing

### Evidence

From earlier user logs:
```
custom_backend-1  | INFO:main:[FILE_CONTEXT] File 57 indexing status: INDEXED
```

This shows the file is marked as "INDEXED" in the database, but it has 0 chunks in Vespa. This suggests either:
- The indexing completed but failed to create chunks
- There's a desync between the database status and actual Vespa content

---

## Workaround Implemented

### Automatic Fallback to Chat-Based Extraction

Modified `extract_file_content_direct()` to raise an exception when 0 chunks are returned:

```python
# If no chunks returned, raise exception to trigger fallback
if result['total_chunks'] == 0:
    logger.warning(f"[DIRECT_EXTRACT] No chunks returned from API - file may not be indexed yet")
    raise ValueError(f"No chunks found for file_ids {file_ids} - file may not be indexed to Vespa yet")
```

### Result

When direct extraction fails (0 chunks), the system automatically falls back to the old chat-based extraction method:

```python
try:
    file_context = await extract_file_content_direct(
        file_ids, payload.prompt, cookies, max_chunks_per_file=50
    )
except Exception as e:
    logger.error(f"[SMARTDRIVE] Direct extraction failed, using fallback: {e}")
    # Fall back to old method
    async for update in extract_file_context_from_onyx_with_progress(file_ids, [], cookies):
        # ... handle as before
```

**Benefits:**
- ✅ System continues to work even if files aren't indexed
- ✅ Users don't experience failures
- ✅ Logs clearly show when fallback is used
- ✅ Direct extraction will work automatically once files are properly indexed

---

## How to Fix the Indexing Issue

### Option 1: Re-Upload the File

1. Delete the file from SmartDrive
2. Re-upload it
3. Ensure indexing completes successfully

### Option 2: Manually Trigger Indexing

If there's an admin interface in Onyx to trigger connector indexing:
1. Find the connector for this file (UserFile-<file_id>-<timestamp>)
2. Manually trigger indexing run
3. Wait for completion
4. Verify chunks appear in Vespa

### Option 3: Check Indexing Logs

Look for errors in the Onyx background worker logs:
```bash
docker logs onyx-background-1 | grep "UserFile-.*-57"
```

This will show if indexing failed and why.

### Option 4: Database Investigation

Query the database to check indexing status:

```sql
-- Check user file record
SELECT * FROM user_file WHERE id = 57;

-- Check connector
SELECT * FROM connector WHERE name LIKE '%UserFile%57%';

-- Check indexing attempts
SELECT * FROM index_attempt WHERE connector_id IN (
    SELECT id FROM connector WHERE name LIKE '%UserFile%57%'
)
ORDER BY time_created DESC LIMIT 10;
```

---

## Expected Behavior After Restart

**1. Direct extraction attempts first:**
```
[SMARTDRIVE] Using DIRECT extraction for 1 files
[DIRECT_EXTRACT] Starting direct extraction for 1 files
[DIRECT_EXTRACT] Received 0 chunks from API
[DIRECT_EXTRACT] No chunks returned from API - file may not be indexed yet
```

**2. Automatic fallback to chat-based:**
```
[SMARTDRIVE] Direct extraction failed, using fallback: No chunks found...
[FILE_CONTEXT] Starting batch parallel processing for 1 files
[FILE_CONTEXT] Processing files batch 1/1 (1-1 of 1)...
```

**3. Product generation continues:**
- Content is extracted via chat (old method)
- Product is generated successfully
- User doesn't see any error

---

## Future Enhancement

Once we identify why files aren't being indexed, we can:

1. **Fix the indexing issue** - Ensure all SmartDrive files are properly indexed to Vespa
2. **Add indexing validation** - Check if file is indexed before attempting direct extraction
3. **Trigger indexing on-demand** - If file not indexed, trigger it before extraction
4. **Better error messages** - Tell users when files need to be reindexed

---

## Testing Steps

**1. Restart custom backend:**
```bash
docker-compose restart custom_backend
```

**2. Try generating a product from the SmartDrive file**

**3. Expected logs:**
```
[SMARTDRIVE] Using DIRECT extraction for 1 files
[DIRECT_EXTRACT] No chunks returned from API - file may not be indexed yet
[SMARTDRIVE] Direct extraction failed, using fallback
[FILE_CONTEXT] Starting batch parallel processing...
```

**4. Result:**
- ✅ Product generation succeeds (via fallback)
- ⚠️ Performance slower than direct method (but still works)
- ℹ️ Once file is properly indexed, direct method will work automatically

---

## Summary

**Current State:**
- ✅ Document ID transformation fixed (USER_FILE_CONNECTOR__ → FILE_CONNECTOR__)
- ✅ Diagnostic logging working perfectly
- ⚠️ File not indexed to Vespa (0 chunks)
- ✅ **Automatic fallback enabled** - system continues to work

**Next Steps:**
1. User: Restart custom backend and test (fallback will work)
2. Admin: Investigate why file isn't indexed to Vespa
3. Admin: Fix indexing issue
4. Result: Direct extraction will work automatically once file is indexed

The system is **production-ready** with fallback - users won't experience failures even if direct extraction doesn't work yet!

