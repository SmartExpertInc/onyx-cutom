# Agentic RAG Implementation - Fixes Applied

## Overview

This document summarizes all bugs fixed during the implementation of agentic RAG for connectors.

## Bugs Fixed

### 1. Missing Pydantic Import ✅

**Error:** `NameError: name 'model_validator' is not defined`

**File:** `backend/onyx/server/documents/models.py`

**Fix:** Added missing import
```python
from pydantic import model_validator
```

**Status:** ✅ Fixed

---

### 2. Incorrect API URL Constant ✅

**Error:** `NameError: name 'ONYX_API_URL' is not defined`

**File:** `custom_extensions/backend/main.py`

**Fix:** Changed `ONYX_API_URL` to `ONYX_API_SERVER_URL` in 2 locations:
- Line 13466 (Stage 1 - skeleton generation)
- Line 13547 (Stage 2 - focused collection)

**Status:** ✅ Fixed

---

### 3. Non-existent Method Call ✅

**Error:** `'VespaIndex' object has no attribute 'semantic_retrieval'`

**File:** `backend/onyx/server/documents/document.py`

**Root Cause:** Tried to use `semantic_retrieval()` which doesn't exist in VespaIndex

**Fix:** Changed to use `hybrid_retrieval()` which is the correct method in Onyx:

```python
# Before (WRONG):
chunks = document_index.semantic_retrieval(
    query=query_text,
    filters=filters,
    num_to_retrieve=num_hits,
)

# After (CORRECT):
# 1. Generate query embedding
embedding_model = EmbeddingModel(...)
query_embedding = embedding_model.encode([query_text])[0]

# 2. Use hybrid_retrieval
chunks = document_index.hybrid_retrieval(
    query=query_text,
    query_embedding=query_embedding,
    final_keywords=None,
    filters=filters,
    hybrid_alpha=0.5,
    time_decay_multiplier=1.0,
    num_to_retrieve=num_hits,
    ranking_profile_type=QueryExpansionType.SEMANTIC,
    offset=0,
)
```

**Benefits of hybrid_retrieval:**
- Combines semantic (vector) and keyword (BM25) search
- Already handles query embeddings internally
- Supports source_type filtering
- Supports ACL filtering
- Returns properly ranked results

**Status:** ✅ Fixed

---

### 4. Incorrect Import Path ✅

**Error:** `ModuleNotFoundError: No module named 'onyx.shared_configs'`

**File:** `backend/onyx/server/documents/document.py`

**Root Cause:** Incorrect import path for `MODEL_SERVER_HOST` and `MODEL_SERVER_PORT`

**Fix:** Removed incorrect import statement:
```python
# WRONG:
from onyx.shared_configs.configs import MODEL_SERVER_HOST, MODEL_SERVER_PORT

# CORRECT (already imported at top of file):
from shared_configs.configs import MODEL_SERVER_HOST
from shared_configs.configs import MODEL_SERVER_PORT
```

**Status:** ✅ Fixed

---

## Implementation Timeline

1. **Initial Implementation** - Created connector agentic RAG function and updated all 4 product endpoints
2. **Bug Fix #1** - Fixed missing `model_validator` import
3. **Bug Fix #2** - Fixed `ONYX_API_URL` → `ONYX_API_SERVER_URL`
4. **Bug Fix #3** - Fixed `semantic_retrieval` → `hybrid_retrieval`
5. **Bug Fix #4** - Fixed import path for `MODEL_SERVER_HOST`
6. **Diagnostic Logging** - Added debug logging to diagnose ACL and indexing issues

## Current Status

### ✅ Completed
- All syntax errors fixed
- All import errors resolved
- All method call errors fixed
- Diagnostic logging added
- Fallback mechanisms in place

### ⚠️ Pending Testing
- Verify Notion connector is indexed in Vespa
- Test with actual connector content
- Verify progress updates reach frontend
- Compare quality with old chat-based method

## Files Modified

1. **`backend/onyx/server/documents/models.py`**
   - Added `model_validator` import
   - Extended models for connector support

2. **`backend/onyx/server/documents/document.py`**
   - Fixed import paths
   - Changed `semantic_retrieval` to `hybrid_retrieval`
   - Added proper embedding generation
   - Added diagnostic logging

3. **`custom_extensions/backend/main.py`**
   - Fixed `ONYX_API_URL` constant name
   - Created `collect_agentic_context_from_connectors_streaming()`
   - Updated 4 product endpoints

## How to Test

1. **Restart API server** to apply all fixes:
   ```bash
   docker compose restart api_server
   ```

2. **Verify Notion connector is indexed**:
   ```bash
   docker compose exec postgres psql -U postgres -d postgres -c "SELECT COUNT(*) FROM document WHERE source_type = 'notion';"
   ```

3. **Try creating a product from Notion**:
   - Go to Onyx UI
   - Create Text Presentation
   - Select "From Connectors" → Notion
   - Enter a topic (e.g., "AWS")
   - Click Generate

4. **Check logs** for diagnostic messages:
   ```bash
   docker compose logs api_server | grep GET_CONNECTOR_CONTENT
   ```

5. **Expected behavior**:
   - If content indexed: Agentic RAG should retrieve chunks and generate product
   - If no content: Diagnostic logs will show "NO CONTENT" and fallback to old method
   - If ACL blocks: Diagnostic logs will show "ACL BLOCKING" and fallback to old method

## Next Steps

Once Notion content is properly indexed in Vespa:

1. ✅ Agentic RAG will automatically activate
2. ✅ Progress updates will stream to frontend
3. ✅ Higher quality products will be generated
4. ✅ Better token efficiency (focused chunks)
5. ✅ Faster generation (targeted retrieval)

## Fallback Behavior

The system gracefully degrades if agentic RAG fails:
- Catches all exceptions
- Logs detailed error information  
- Falls back to old chat-based extraction
- Product still generates (may be lower quality)
- User experience is not disrupted

## Documentation

- [`AGENTIC_RAG_CONNECTORS_COMPLETE.md`](AGENTIC_RAG_CONNECTORS_COMPLETE.md) - Full implementation guide
- [`CONNECTOR_TROUBLESHOOTING.md`](CONNECTOR_TROUBLESHOOTING.md) - Troubleshooting guide
- [`direct-vector.plan.md`](direct-vector.plan.md) - Original implementation plan

