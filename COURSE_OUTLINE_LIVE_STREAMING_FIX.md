# Course Outline Live Streaming Fix

## Problem Analysis

From the logs, we can see:
1. **No live updates during streaming**: No `[LIVE_STREAM]` or `[LIVE_STREAM_DEBUG]` messages during 1126 chunks
2. **Perfect final JSON**: The completed JSON structure is correct
3. **Regex pattern issues**: The current patterns in `extract_live_progress` don't match the actual JSON structure

## Root Cause

The regex patterns in `extract_live_progress` are not working with the actual JSON structure:
- **Module pattern**: `"title": "Module Title" with "id" nearby` - doesn't work
- **Reverse pattern**: `"id": "№1" with "title" nearby` - works correctly
- **Lesson pattern**: Too complex and matches wrong content

## Solution

### 1. Fix Regex Patterns

The working patterns based on actual JSON structure:

```python
# Working module pattern (id before title)
module_pattern = r'"id":\s*"(№\d+)"[^}]*?"title":\s*"([^"]+)"'

# Simple lesson pattern within lessons array
lesson_pattern = r'"title":\s*"Lesson\s+\d+\.\d+:\s*([^"]+)"[^}]*?"hours":\s*\d+'
```

### 2. Simplified Streaming Logic

Instead of complex incremental processing, use:

```python
# Send test update every 100 chunks to verify streaming
if chunks_received % 100 == 0:
    test_update = {"type": "test", "message": f"Processing chunk {chunks_received}"}
    yield (json.dumps(test_update) + "\n").encode()

# Simple pattern matching on full response
import re
modules_found = re.findall(r'"id":\s*"(№\d+)"[^}]*?"title":\s*"([^"]+)"', assistant_reply)
for module_id, title in modules_found:
    if module_id not in sent_modules:
        sent_modules.add(module_id)
        yield (json.dumps({"type": "module", "title": title, "id": module_id}) + "\n").encode()
```

### 3. Implementation Steps

1. **Update `extract_live_progress` function** with working regex patterns
2. **Add streaming verification** with test updates every 100 chunks  
3. **Simplify tracking logic** to avoid incremental processing issues
4. **Fix lesson title cleaning** in preview completion

### 4. Expected Results

- ✅ Test updates every 100 chunks confirm streaming works
- ✅ Modules appear in real-time as they're detected
- ✅ Lessons appear under their respective modules
- ✅ Clean lesson titles without "Lesson X.Y:" prefixes
- ✅ No duplicates sent to frontend

## Next Steps

1. Apply the regex pattern fixes
2. Test with a course outline generation
3. Verify live updates appear in frontend during streaming
4. Confirm lesson title cleaning works in preview 