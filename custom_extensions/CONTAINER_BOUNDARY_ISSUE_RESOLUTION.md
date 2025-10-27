# Container Boundary Issue Resolution

## Problem

**Error**: `ModuleNotFoundError: No module named 'onyx'`

**Root Cause**: The `custom_extensions` backend runs in a **separate Docker container** from the main Onyx backend. This means:
- ❌ Cannot import Onyx modules directly (`from onyx.db.engine import ...`)
- ❌ Cannot access Onyx database directly
- ❌ Cannot use Onyx's internal file processing functions directly
- ✅ Can ONLY interact with Onyx via HTTP API calls

## Architecture Understanding

```
┌─────────────────────────┐
│  Custom Backend         │
│  Container              │
│  - custom_extensions/   │
│  - Port: 8001           │
│  - Language: Python     │
│  - Dependencies: httpx  │
└───────────┬─────────────┘
            │
            │ HTTP API Calls Only
            │
┌───────────▼─────────────┐
│  Onyx Backend           │
│  Container              │
│  - backend/onyx/        │
│  - Port: 8080           │
│  - Database Access      │
│  - File Processing      │
└─────────────────────────┘
```

## Attempted Solutions That Failed

### ❌ Attempt 1: Direct Database Access
```python
from onyx.db.engine import get_session_context_manager
from onyx.db.models import UserFile

with get_session_context_manager() as db_session:
    user_file = db_session.query(UserFile).filter(UserFile.id == file_id).first()
```

**Why it failed**: `ModuleNotFoundError: No module named 'onyx'` - Onyx modules not available in custom backend container

### ❌ Attempt 2: Non-existent API Endpoints
```python
response = await client.get(f"{ONYX_API_SERVER_URL}/user/file/{file_id}")
```

**Why it failed**: `405 Method Not Allowed` - These endpoints don't exist in Onyx's API

## Solution: Fall Back to Legacy AI Analysis

Since we cannot access the database or use non-existent APIs, we **fall back to the legacy AI-based file analysis** which was working before raw extraction was added.

### Implementation

**`extract_raw_file_content()` - Now Falls Back to Legacy**:
```python
async def extract_raw_file_content(file_id: int, cookies: Dict[str, str], max_tokens: Optional[int] = None) -> Dict[str, Any]:
    try:
        logger.info(f"[RAW_EXTRACTION] Starting raw content extraction for file {file_id}")
        
        # Since we're in a separate container, we can't access the Onyx database directly.
        # Instead, we'll use the legacy approach: fall back to AI analysis for now.
        
        logger.warning(f"[RAW_EXTRACTION] Raw extraction from indexed documents not yet supported in separate container")
        logger.info(f"[RAW_EXTRACTION] Falling back to legacy AI analysis for file {file_id}")
        
        # Fallback to legacy AI-based extraction
        return await extract_single_file_context_legacy(file_id, cookies)
        
    except Exception as e:
        logger.error(f"[RAW_EXTRACTION] Error extracting raw content from file {file_id}: {e}", exc_info=True)
        return {
            "file_id": file_id,
            "raw_content": f"Error extracting content: {str(e)}",
            "file_type": "error",
            "char_count": 0,
            "estimated_tokens": 0,
            "chunks": [],
            "extraction_method": "error",
            "metadata": {"error": str(e)}
        }
```

**Multi-File Relevance Scoring - Disabled**:
```python
# Step 1: Since we're in a separate container, we cannot access database directly
# Skip relevance scoring for now - it requires database access
logger.warning(f"[FILE_CONTEXT] Relevance-based token distribution not available in separate container")
logger.info(f"[FILE_CONTEXT] Using equal token distribution across {len(file_ids)} files")
file_info_list = []
```

## What Still Works

✅ **Legacy AI File Analysis**:
- Uses Onyx's chat API to analyze files
- Creates temporary chat session
- Attaches file via Onyx's existing file attachment mechanism
- AI describes file content
- Works for all file types (PDF, DOCX, images, etc.)

✅ **Single File Processing**:
- Individual file extraction works
- File context is generated via AI
- Content is used for product generation

✅ **Multi-File Processing**:
- Multiple files are processed sequentially
- Equal token budget per file (no prioritization)
- All files included in generation

## What Doesn't Work (Yet)

❌ **Raw Text Extraction**:
- Cannot extract raw text directly from files
- Cannot access indexed document content
- Requires database access (not available across containers)

❌ **Relevance-Based Token Distribution**:
- Cannot score file relevance via semantic search
- Cannot prioritize files based on user query
- Requires document_id from database

❌ **Smart Chunking Per File**:
- Cannot apply per-file token limits
- Cannot use intelligent sampling based on relevance
- Requires knowledge of file content before AI analysis

## Future Solutions

### Option 1: Create New Onyx API Endpoints (Recommended)

Add these endpoints to Onyx's API:

```python
# In backend/onyx/server/user_documents/api.py

@router.get("/user/file/{file_id}/metadata")
def get_file_metadata(
    file_id: int,
    user: User = Depends(current_user),
    db_session: Session = Depends(get_session),
) -> FileMetadata:
    """Get file metadata including document_id"""
    user_file = db_session.query(UserFile).filter(
        UserFile.id == file_id,
        UserFile.user_id == user.id
    ).first()
    
    if not user_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    return {
        "id": user_file.id,
        "name": user_file.name,
        "document_id": user_file.document_id,
        "file_id": user_file.file_id,
        "file_size": user_file.file_size,
        "created_at": user_file.created_at
    }

@router.get("/user/file/{file_id}/content")
def get_file_raw_content(
    file_id: int,
    user: User = Depends(current_user),
    db_session: Session = Depends(get_session),
) -> Response:
    """Get raw file content"""
    user_file = db_session.query(UserFile).filter(
        UserFile.id == file_id,
        UserFile.user_id == user.id
    ).first()
    
    if not user_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Use existing file store infrastructure
    file_store = get_default_file_store(db_session)
    file_content = file_store.read_file(user_file.file_id, mode="b")
    
    return StreamingResponse(file_content, media_type="application/octet-stream")
```

**Benefits**:
- ✅ Proper API-based access
- ✅ Respects permissions and security
- ✅ Can be used by any external service
- ✅ Follows REST principles

### Option 2: Merge Custom Backend into Onyx Container

Move `custom_extensions` into the main Onyx container.

**Benefits**:
- ✅ Direct database access available
- ✅ Can import Onyx modules
- ✅ Faster (no HTTP overhead)

**Drawbacks**:
- ❌ Harder to maintain separate codebase
- ❌ Deployment complexity
- ❌ Less modularity

### Option 3: Use Onyx's Document Search API (Partial Solution)

For indexed files, we can use `/search` API to get content:

```python
response = await client.post(
    f"{ONYX_API_SERVER_URL}/search",
    json={
        "query": "",  # Empty query to get all content
        "filters": {"document_id": [document_id]},
        "retrieval_options": {"run_search": "always"}
    },
    cookies=cookies
)
```

**Benefits**:
- ✅ Works for indexed files
- ✅ No new API endpoints needed

**Limitations**:
- ❌ Only works if file is already indexed
- ❌ Doesn't return file metadata
- ❌ Requires document_id (which we can't get without database access)

## Current Status

- ✅ **Application works** - Falls back to legacy AI analysis
- ✅ **No errors** - Container boundary issues resolved
- ✅ **File processing works** - Uses existing Onyx chat API
- ⚠️  **Raw extraction disabled** - Not available across containers
- ⚠️  **Relevance scoring disabled** - Not available across containers
- ⚠️  **Smart chunking disabled** - Not available without raw extraction

## Recommendation

**Short Term** (Current Solution):
- ✅ Use legacy AI analysis (working now)
- ✅ Process files sequentially
- ✅ No prioritization needed for most use cases

**Long Term** (Future Enhancement):
- 📋 Add new Onyx API endpoints for file metadata and content
- 📋 Implement raw extraction using those APIs
- 📋 Enable relevance-based token distribution
- 📋 Implement smart chunking per file

The current solution is **production-ready** and provides the same functionality users had before. The advanced features (raw extraction, relevance scoring) can be added later when proper API endpoints are available.

## Files Modified

- `custom_extensions/backend/main.py`
  - Line ~11992: `extract_raw_file_content()` - Now falls back to legacy
  - Line ~10953: Relevance scoring - Disabled for container boundary

## Testing

The application now:
- ✅ Starts without errors
- ✅ Processes files via AI analysis
- ✅ Generates products with file context
- ✅ Handles multiple files
- ✅ Works with all file types (PDF, DOCX, images, etc.)

