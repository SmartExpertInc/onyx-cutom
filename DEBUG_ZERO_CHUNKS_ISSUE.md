# Debug: Zero Chunks Returned Issue

**Date:** November 12, 2025  
**Issue:** Direct extraction returns 0 chunks despite successful API call  
**Status:** 🔍 INVESTIGATING

---

## Problem Summary

The new direct extraction method is being used correctly, but returns 0 chunks:

```
INFO:main:[SMARTDRIVE] Using DIRECT extraction for 1 files
INFO:main:[DIRECT_EXTRACT] Starting direct extraction for 1 files
INFO:httpx:HTTP Request: POST http://api_server:8080/document/get-file-content "HTTP/1.1 200 OK"
INFO:main:[DIRECT_EXTRACT] Received 0 chunks from API  ⚠️
```

This means:
- ✅ SmartDrive connector path is now using direct extraction
- ✅ API call succeeds (200 OK)
- ❌ But Vespa returns no chunks

---

## Investigation Steps Taken

### 1. Verified UserFile Table Structure

From `backend/onyx/db/models.py:3121-3141`:
```python
class UserFile(Base):
    id: Mapped[int]  # Primary key (what we pass as file_id)
    user_id: Mapped[UUID | None]
    file_id: Mapped[str]  # UUID for file storage
    document_id: Mapped[str]  # Vespa document ID
    name: Mapped[str]
```

### 2. Found How document_id is Set

From `backend/onyx/db/user_documents.py:57`:
```python
document_id="USER_FILE_CONNECTOR__" + file_path
```

So for file_id=57, the `document_id` stored in UserFile would be something like:
```
USER_FILE_CONNECTOR__<some-uuid>
```

### 3. The Problem

When a file is indexed to Vespa through the connector, the actual `document_id` in Vespa might be **different** from what's stored in the UserFile table.

**Possible causes:**
1. **ACL Permissions** - User doesn't have access to the document
2. **Document ID Mismatch** - Vespa document has different ID than UserFile.document_id
3. **Indexing Not Complete** - Document not yet in Vespa (though file shows as "INDEXED")
4. **Connector Transformation** - Connector changes document_id during indexing

---

## Diagnostic Logging Added

Added extensive debugging to `backend/onyx/server/documents/document.py:156-197`:

```python
# Log file_id -> document_id mapping
logger.info(f"[GET_FILE_CONTENT] Mapped {len(file_id_to_doc_id)} files:")
for file_id, doc_id in file_id_to_doc_id.items():
    logger.info(f"[GET_FILE_CONTENT]   file_id={file_id} -> document_id={doc_id}")

# Log ACL filters
logger.info(f"[GET_FILE_CONTENT] ACL filters: {user_acl_filters}")

# Log Vespa query
logger.info(f"[GET_FILE_CONTENT] Requesting chunks for {len(chunk_requests)} documents")

# Log results
logger.info(f"[GET_FILE_CONTENT] Retrieved {len(all_chunks)} chunks from Vespa")

# If zero chunks, try without ACL filters
if not all_chunks:
    all_chunks_no_acl = document_index.id_based_retrieval(
        chunk_requests=chunk_requests,
        filters=None,
    )
    
    if all_chunks_no_acl:
        logger.error(f"⚠️ ACL PERMISSION ISSUE: Chunks exist but are filtered by ACL")
    else:
        logger.error(f"⚠️ DOCUMENT NOT FOUND: No chunks in Vespa for these document_ids")
        logger.error(f"Searched for document_ids: {list(file_id_to_doc_id.values())}")
```

---

## Next Steps for User

**1. Restart Onyx Backend** to apply the new debug logging:
```bash
docker-compose restart api_server
```

**2. Try generating a product from the SmartDrive file again**

**3. Check the Onyx logs** for these patterns:

### Pattern A: ACL Permission Issue
```
[GET_FILE_CONTENT] Mapped 1 files:
[GET_FILE_CONTENT]   file_id=57 -> document_id=USER_FILE_CONNECTOR__<uuid>
[GET_FILE_CONTENT] Retrieved 0 chunks from Vespa
[GET_FILE_CONTENT] Without ACL filters: 5 chunks
⚠️ ACL PERMISSION ISSUE: Chunks exist but are filtered by ACL
```
**Solution:** User doesn't have ACL access to the document. Need to fix permissions.

### Pattern B: Document ID Mismatch
```
[GET_FILE_CONTENT] Mapped 1 files:
[GET_FILE_CONTENT]   file_id=57 -> document_id=USER_FILE_CONNECTOR__<uuid>
[GET_FILE_CONTENT] Retrieved 0 chunks from Vespa
[GET_FILE_CONTENT] Without ACL filters: 0 chunks
⚠️ DOCUMENT NOT FOUND: No chunks in Vespa for these document_ids
Searched for document_ids: ['USER_FILE_CONNECTOR__<uuid>']
```
**Solution:** The document_id in UserFile doesn't match what's in Vespa. Need to investigate how connectors transform document IDs during indexing.

### Pattern C: Success (Unexpected)
```
[GET_FILE_CONTENT] Mapped 1 files:
[GET_FILE_CONTENT]   file_id=57 -> document_id=USER_FILE_CONNECTOR__<uuid>
[GET_FILE_CONTENT] Retrieved 25 chunks from Vespa
```
**Solution:** It just works! Maybe timing issue was resolved by restart.

---

## Possible Solutions

### If ACL Issue:
Need to modify the endpoint to use more permissive ACL filters for user-uploaded files.

### If Document ID Mismatch:
Two options:
1. **Fix the mapping** - Update how UserFile.document_id is set during indexing
2. **Use different lookup** - Instead of querying by document_id, query Vespa by file_id or other metadata

### If Indexing Not Complete:
Wait longer or add retry logic.

---

## Alternative Approach

If the UserFile.document_id approach doesn't work, we can try:

**Option 1:** Query Vespa by file metadata instead of document_id:
- Use file_id (UUID) as a filter
- Search for documents with matching source metadata

**Option 2:** Use the old `/document/document-size-info` endpoint which might handle the mapping differently

**Option 3:** Query the actual Vespa document by the connector-generated ID pattern (may need to inspect connector code)

---

## Files Modified for Debugging

- `backend/onyx/server/documents/document.py` - Added extensive logging (lines 156-203)

---

## Expected Timeline

- **5 minutes**: User restarts Onyx backend
- **2 minutes**: User tests product generation
- **3 minutes**: Analyze logs to identify root cause
- **15-30 minutes**: Implement appropriate fix based on findings

Total: **~30-45 minutes** to diagnose and fix

