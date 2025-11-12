# Connector Agentic RAG - Troubleshooting Guide

## Issue: 0 Chunks Retrieved from Connectors

### Current Status
The agentic RAG implementation is working correctly, but no chunks are being returned for Notion connector searches. The system is falling back to the old chat-based method.

### Logs Analysis
```
INFO:main:[AGENTIC_CONNECTOR_STAGE1] Retrieved 0 chunks for skeleton generation
WARNING:main:[AGENTIC_CONNECTOR_STAGE1] No chunks found from connectors
```

### Connector Name Verification ✅
The connector name "notion" is **CORRECT** (lowercase). From `backend/onyx/configs/constants.py`:
```python
class DocumentSource(str, Enum):
    NOTION = "notion"  # ✓ Correct
```

### Possible Causes

#### 1. No Notion Content Indexed Yet ⚠️ MOST LIKELY
The Notion connector may not have indexed any content into Vespa yet.

**How to Verify:**
1. Check if Notion connector is set up and running
2. Check connector status in Onyx UI: Settings → Connectors
3. Look for indexing logs showing Notion content being processed
4. Check Vespa directly for documents with `source_type=notion`

**How to Fix:**
1. Go to Onyx Settings → Connectors
2. Find your Notion connector
3. Click "Re-Index" or "Sync Now"
4. Wait for indexing to complete (check background tasks)
5. Try creating a product again

#### 2. ACL Permissions Blocking Access 🔒
The user may not have permission to access the Notion documents.

**How to Diagnose:**
With the new diagnostic logging added, restart your containers and try again:
```bash
docker compose restart api_server
```

Look for these log messages in api_server logs:
```
[GET_CONNECTOR_CONTENT] Without ACL: X chunks found
⚠️ ACL BLOCKING: Content exists but ACL filters block access
```

If you see this, it means:
- Content IS indexed
- But user permissions are blocking access

**How to Fix:**
1. Check connector permissions in Onyx UI
2. Ensure the user is in the correct access groups
3. Re-index the connector to update permissions
4. Check if the connector is set to "Public" or restricted to specific groups

#### 3. Query Not Matching Any Documents 🔍
The search query might not match any Notion documents.

**How to Diagnose:**
Look for this in api_server logs:
```
[GET_CONNECTOR_CONTENT] Without ACL: 0 chunks found
⚠️ NO CONTENT: No documents indexed for source_types=['notion']
```

This confirms no content is indexed at all.

### Diagnostic Commands

#### Check if Notion connector exists:
```bash
docker compose exec postgres psql -U postgres -d postgres -c "SELECT * FROM connector WHERE source = 'notion';"
```

#### Check if any Notion documents are indexed:
```bash
docker compose exec postgres psql -U postgres -d postgres -c "SELECT COUNT(*) FROM document WHERE source_type = 'notion';"
```

#### Check connector credential pair status:
```bash
docker compose exec postgres psql -U postgres -d postgres -c "SELECT cc.id, c.name, c.source, cc.status FROM connector_credential_pair cc JOIN connector c ON cc.connector_id = c.id WHERE c.source = 'notion';"
```

### Recent Fix: Changed to hybrid_retrieval

**Issue:** The initial implementation tried to use `semantic_retrieval()` which doesn't exist in VespaIndex.

**Fix Applied:** Changed to use `hybrid_retrieval()` which is the correct method in Onyx. This method:
- Generates query embeddings automatically
- Performs hybrid search (semantic + keyword)
- Supports source_type filtering
- Returns properly ranked results

This is now fixed and should work correctly after restarting the API server.

### Expected Behavior with Diagnostic Logging

After restarting `api_server`, when you try to create a product from Notion, you should see:

**If content exists but ACL blocks:**
```
[GET_CONNECTOR_CONTENT] Retrieved 0 chunks from Vespa
[GET_CONNECTOR_CONTENT] No chunks found for source_types: ['notion']
[GET_CONNECTOR_CONTENT] Retrying without ACL filters for debugging...
[GET_CONNECTOR_CONTENT] Without ACL: 25 chunks found
⚠️ ACL BLOCKING: Content exists but ACL filters block access
User ACL filters: [...]
Sample chunk access: [...]
```

**If no content indexed:**
```
[GET_CONNECTOR_CONTENT] Retrieved 0 chunks from Vespa
[GET_CONNECTOR_CONTENT] No chunks found for source_types: ['notion']
[GET_CONNECTOR_CONTENT] Retrying without ACL filters for debugging...
[GET_CONNECTOR_CONTENT] Without ACL: 0 chunks found
⚠️ NO CONTENT: No documents indexed for source_types=['notion']
```

### Quick Test with Files

To verify the agentic RAG system is working, try creating a product from **files** instead of connectors:

1. Upload a PDF to Smart Drive
2. Create a Text Presentation from that file
3. You should see agentic RAG progress messages
4. The product should be generated successfully

This will confirm the agentic RAG implementation is working correctly.

### Fallback Behavior ✅ Working

The system is correctly falling back to the old chat-based method when agentic RAG returns 0 chunks. This is the expected graceful degradation behavior.

You can see in the logs:
```
WARNING:main:[TEXT_PRESENTATION] Agentic connector extraction failed, using fallback: No content found in selected connectors
INFO:main:[CONNECTOR_CONTEXT] Starting connector search for sources: notion
```

This means your product should still generate, just using the old method instead of agentic RAG.

### Next Steps

1. **Restart api_server** to enable diagnostic logging:
   ```bash
   docker compose restart api_server
   ```

2. **Try creating a product from Notion again**

3. **Check the api_server logs** for diagnostic messages:
   ```bash
   docker compose logs api_server | grep GET_CONNECTOR_CONTENT
   ```

4. **Based on the diagnostic output:**
   - If "ACL BLOCKING": Fix permissions
   - If "NO CONTENT": Index Notion content
   - If no diagnostic logs appear: Check if API request is reaching Onyx

5. **Verify Notion connector is running:**
   - Go to Onyx UI → Settings → Connectors
   - Find Notion connector
   - Check status and last sync time
   - Try manual re-index

### Testing After Fix

Once Notion content is indexed:

1. Create a Text Presentation from Notion
2. You should see progress messages:
   - "🔍 Scanning content from notion..."
   - "📋 Creating text presentation outline..."
   - "✅ Generated skeleton with X items"
   - "📚 Focusing on: [Topic]"
   - "✅ Collected X unique chunks"
3. The product should be generated with high-quality, focused content

### Additional Notes

- The connector name is case-sensitive: use lowercase "notion", not "Notion"
- Multiple connectors can be specified: `["notion", "slack"]`
- The fallback mechanism ensures products still generate even if agentic RAG fails
- Diagnostic logging is temporary and can be removed after diagnosis

### Contact Information

If the issue persists after following these steps:
1. Share the diagnostic logs from api_server
2. Confirm connector status in Onyx UI
3. Share database query results (connector and document counts)

