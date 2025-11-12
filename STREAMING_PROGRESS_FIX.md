# Streaming Progress Updates for Agentic RAG

## Problem
The agentic RAG extraction was taking 90-120 seconds without sending any progress updates to the frontend, causing timeouts. Users had no visibility into what was happening during the long extraction process.

## Solution
Added a streaming progress generator that yields real-time updates to the frontend during both Stage 1 (skeleton generation) and Stage 2 (focused chunk collection).

## Changes Made

### 1. New Generator Function (`collect_agentic_context_with_streaming`)
**File:** `custom_extensions/backend/main.py`

Created a new async generator function that wraps `collect_agentic_context` and streams progress updates:

- Uses an asyncio Queue to capture progress messages
- Runs the agentic collection in a background task
- Yields progress updates as they arrive: `("progress", message)`
- Yields the final result: `("complete", context)`
- Yields errors: `("error", error_message)`

### 2. Updated All Product Endpoints
**Files:** Updated 6 endpoints in `custom_extensions/backend/main.py`

Modified all endpoints that use agentic extraction to use the new streaming version:
- `/api/custom/text-presentation/generate`
- `/api/custom/quiz/generate`
- `/api/custom/course-outline/generate`
- `/api/custom/lesson-presentation/generate`

**Change pattern:**
```python
# OLD (no progress)
file_context = await collect_agentic_context(
    file_ids=file_ids,
    ...
    progress_callback=None
)

# NEW (with streaming progress)
async for update_type, update_data in collect_agentic_context_with_streaming(
    file_ids=file_ids,
    ...
):
    if update_type == "progress":
        yield json.dumps({"type": "info", "message": update_data}) + "\n"
    elif update_type == "complete":
        file_context = update_data
```

### 3. Enhanced Progress Messages
**File:** `custom_extensions/backend/main.py` - `collect_agentic_context` function

Added informative progress messages at key stages:

**Stage 1 (Skeleton Generation):**
- 📄 "Analyzing document structure from N file(s)..."
- 🔍 "Performing initial content scan..."
- 🧠 "Generating content outline..."
- ✅ "Generated outline with N sections"

**Stage 2 (Focused Collection):**
- 📑 "Finding content for section X/Y: [Section Title]"
- 🔎 "Assessing relevance and ranking chunks..."
- ✅ "Context collection complete! Collected N unique chunks"
- 🚀 "Generating final content..."

## Frontend Experience

Users will now see real-time updates like:
```
📄 Analyzing document structure from 1 file(s)...
🔍 Performing initial content scan...
🧠 Generating content outline...
✅ Generated outline with 10 sections
📑 Finding content for section 1/10: Введение в организационную культуру
🔎 Assessing relevance and ranking chunks...
📑 Finding content for section 2/10: Структура организационной культуры
🔎 Assessing relevance and ranking chunks...
...
✅ Context collection complete! Collected 25 unique chunks
🚀 Generating final content...
```

## Benefits

1. **No More Timeouts:** Frontend receives continuous updates, keeping the connection alive
2. **User Visibility:** Users can see what's happening during long extractions
3. **Progress Tracking:** Users know which section is being processed (X/Y)
4. **Professional UX:** Informative messages with emojis make the wait more engaging
5. **Debugging Aid:** Progress messages also appear in logs for troubleshooting

## Technical Details

### Async Queue Pattern
The streaming generator uses Python's `asyncio.Queue` to handle progress messages from the background task without blocking:

```python
progress_queue = Queue()

async def progress_callback(message: str):
    await progress_queue.put(message)

# Run collection in background
task = asyncio.create_task(collect_agentic_context(..., progress_callback=progress_callback))

# Yield messages as they arrive
while not task.done():
    try:
        message = await asyncio.wait_for(progress_queue.get(), timeout=0.1)
        yield ("progress", message)
    except asyncio.TimeoutError:
        continue
```

### Frontend Integration
The frontend receives updates as Server-Sent Events (SSE):
```json
{"type": "info", "message": "📄 Analyzing document structure from 1 file(s)..."}
{"type": "info", "message": "🔍 Performing initial content scan..."}
...
```

## Testing

To test:
1. Generate a text presentation from a large file (e.g., organizational culture PDF)
2. Watch the frontend for real-time progress updates
3. Verify no timeout errors occur
4. Check backend logs for matching progress messages

Expected timeline:
- Stage 1 (skeleton): 15-30 seconds → 4 progress updates
- Stage 2 (focused collection): 10-15 seconds per section → 2 updates per section × N sections
- Total: 90-120 seconds with ~20-30 progress updates (for 10 sections)

## Files Modified

- `custom_extensions/backend/main.py`:
  - Added `collect_agentic_context_with_streaming()` function
  - Enhanced progress messages in `collect_agentic_context()`
  - Updated 6 product generation endpoints to use streaming version

