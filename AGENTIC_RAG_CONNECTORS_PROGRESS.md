# Agentic RAG for Connectors - Implementation Progress

## Completed

### 1. Onyx API Updates ✅
- **File**: `backend/onyx/server/documents/models.py`
  - Extended `FileContentRequest` to accept `source_types: list[str] | None`
  - Added validation to ensure either `file_ids` OR `source_types` is provided
  - Extended `FileContentResponse` with `connector_chunks: list[FileChunk] | None` field

### 2. Onyx Endpoint Extension ✅
- **File**: `backend/onyx/server/documents/document.py`
  - Created `_get_connector_content_by_source_types()` helper function
  - Uses semantic search with source_type filter (e.g., DocumentSource.SLACK, DocumentSource.NOTION)
  - Supports semantic ranking when query is provided
  - Returns chunks in same format as file retrieval for compatibility
  - Modified main `get_file_content()` to dispatch to appropriate handler based on request type

### 3. Custom Backend - Connector Agentic RAG Function ✅
- **File**: `custom_extensions/backend/main.py` (lines 13432-13615)
  - Created `collect_agentic_context_from_connectors_streaming()` function
  - Implements 2-stage agentic workflow:
    - Stage 1: Skeleton generation from broad connector search
    - Stage 2: Focused chunk collection for each skeleton item
  - Yields progress updates for frontend display
  - Returns context in same format as file agentic RAG for compatibility
  - Includes graceful error handling with fallback to old method

### 4. Product Endpoints Updated ✅

#### A. Course Outline Preview ✅
- **File**: `custom_extensions/backend/main.py` (lines 20888-21027)
- Connectors-only scenario: Uses agentic RAG
- Connectors + files scenario: Uses agentic RAG for both
- Fallback to old chat-based method on error

#### B. Lesson Presentation Preview ✅
- **File**: `custom_extensions/backend/main.py` (lines 28939-29078)
- Connectors-only scenario: Uses agentic RAG
- Connectors + files scenario: Uses agentic RAG for both
- Fallback to old chat-based method on error

## Remaining Work

### 5. Product Endpoints - Pending ⚠️

#### C. Quiz Generate
- **File**: `custom_extensions/backend/main.py` (around line 34000)
- Need to find connector extraction logic
- Replace with `collect_agentic_context_from_connectors_streaming()`
- Same pattern as Course Outline and Lesson Presentation

#### D. Text Presentation Generate
- **File**: `custom_extensions/backend/main.py` (around line 35700)
- Need to find connector extraction logic
- Replace with `collect_agentic_context_from_connectors_streaming()`
- Same pattern as Course Outline and Lesson Presentation

## Implementation Pattern

For each remaining endpoint, the update follows this pattern:

```python
# OLD CODE (to be replaced):
connector_context = await extract_connector_context_from_onyx(
    payload.connectorSources, payload.prompt, cookies
)

# NEW CODE (agentic RAG):
connector_sources_list = [s.strip() for s in payload.connectorSources.split(',')]
connector_context = None

try:
    async for update_type, update_data in collect_agentic_context_from_connectors_streaming(
        connector_sources=connector_sources_list,
        original_prompt=payload.prompt,
        product_type="Quiz",  # or "Text Presentation"
        cookies=cookies
    ):
        if update_type == "progress":
            progress_packet = {"type": "info", "message": update_data}
            yield (json.dumps(progress_packet) + "\n").encode()
        elif update_type == "complete":
            connector_context = update_data
            logger.info(f"[QUIZ] Agentic connector extraction success")
        elif update_type == "error":
            raise Exception(update_data)
    
    if connector_context is None:
        raise Exception("No context returned from agentic connector extraction")
except Exception as e:
    logger.warning(f"[QUIZ] Agentic connector extraction failed, using fallback: {e}")
    connector_context = await extract_connector_context_from_onyx(
        payload.connectorSources, payload.prompt, cookies
    )
```

## Benefits of Agentic RAG for Connectors

1. **Intelligent Context Collection**: Two-stage process ensures relevant content
2. **Semantic Ranking**: Chunks ranked by relevance to query
3. **Deduplication**: Avoids redundant content across skeleton items
4. **Progress Updates**: Real-time feedback to frontend
5. **Scalability**: Handles large connector datasets efficiently
6. **Consistency**: Same quality extraction for files and connectors

## Testing Required

1. **Connectors Only**: Create products from Slack/Notion only
2. **Connectors + Files**: Create products from Slack + PDF files
3. **All Products**: Test Course Outline ✅, Lesson Presentation ✅, Quiz ⚠️, Text Presentation ⚠️
4. **Progress Display**: Verify frontend shows agentic RAG progress
5. **Quality Comparison**: Compare output vs old chat-based method

## Next Steps

1. ⚠️ Update Quiz endpoint
2. ⚠️ Update Text Presentation endpoint
3. ✅ Run syntax validation
4. ⚠️ Test all scenarios
5. 📝 Document final implementation

