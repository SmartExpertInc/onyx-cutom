# Connector Streaming Fix - Exact Knowledge Base Approach Implementation

## 🐛 **Issue Identified**

### Problem: Connector Streaming Not Waiting for Complete Onyx Response
**Symptoms from logs**:
```
INFO:main:[enhanced_stream_chat_message_with_filters] Streaming completed. Total chars: 0, Lines processed: 255, Done received: False, Elapsed: 0.0s
WARNING:main:[CONNECTOR_CONTEXT] Search result is empty! This might indicate no documents in connectors or search failed
```

**Key Issues**:
1. **`Done received: False`** - Not waiting for proper termination signal
2. **`Elapsed: 0.0s`** - Connection closing too quickly  
3. **`Total chars: 0`** - No content extracted despite 255 lines processed
4. **Missing raw response logging** - Can't debug what Onyx actually returned

## 🔍 **Root Cause Analysis**

### Previous Connector Approach (Broken)
```python
# WRONG: Looking for SSE format with "data:" prefix
if line.startswith("data: "):
    data_str = line[6:]  # Remove "data: " prefix
    if data_str.strip() == "[DONE]":  # Wrong termination signal
        done_received = True
        break
    packet = json.loads(data_str)
    
    # WRONG: Looking for wrong packet structure
    if isinstance(packet, dict) and "answer" in packet:
        answer_chunk = packet["answer"]  # Onyx doesn't use this format
```

### Knowledge Base Approach (Working)
```python
# CORRECT: Direct JSON parsing, no "data:" prefix
payload_text = line.strip()
packet = json.loads(payload_text)

# CORRECT: Proper Onyx packet types
if "answer_piece" in packet:
    if answer_piece is None:
        done_received = True  # Proper termination
        break
    elif answer_piece:
        answer_content = answer_piece  # Correct content extraction

elif packet.get("stop_reason"):
    if packet["stop_reason"] == "finished":
        done_received = True  # Alternative termination
        break
```

## ✅ **Fix Applied**

### Updated `enhanced_stream_chat_message_with_filters()` Function

**File**: `custom_extensions/backend/main.py` (Lines 10087-10256)

**Key Changes**:

#### 1. Proper Timeout Management
```python
last_activity_time = start_time
max_idle_time = 120.0  # Wait up to 2 minutes without new content
max_total_time = 600.0  # Maximum 10 minutes total

# Check for timeouts - but be more patient
if elapsed_time > max_total_time:
    logger.warning(f"Maximum total time ({max_total_time}s) exceeded")
    break
    
# Only timeout on idle if we have NO content after significant time
if idle_time > max_idle_time and len(full_answer) == 0 and elapsed_time > 60.0:
    logger.warning(f"Maximum idle time ({max_idle_time}s) exceeded")
    break
```

#### 2. Correct Onyx Packet Handling
```python
# Handle different Onyx packet types (EXACT same as Knowledge Base)
answer_content = None

# Check for OnyxAnswerPiece
if "answer_piece" in packet:
    answer_piece = packet["answer_piece"]
    if answer_piece is None:
        # OnyxAnswerPiece with None signals end of answer
        logger.info(f"Received answer termination signal (answer_piece=None)")
        done_received = True
        break
    elif answer_piece:
        answer_content = answer_piece
        
# Check for AgentAnswerPiece (agent search responses)
elif packet.get("answer_type") and packet.get("answer_piece"):
    answer_content = packet["answer_piece"]
    logger.info(f"Received agent answer piece: {packet.get('answer_type')}")
    
# Check for QADocsResponse (search results)
elif packet.get("top_documents") or packet.get("rephrased_query"):
    logger.info(f"Received search results packet")
    last_activity_time = current_time  # Reset timer for search activity
    
# Check for StreamStopInfo
elif packet.get("stop_reason"):
    if packet["stop_reason"] == "finished":
        logger.info(f"Received stream stop signal: finished")
        done_received = True
        break
```

#### 3. Enhanced Logging and Debugging
```python
# For the first 10 packets, log full content to understand structure
if line_count <= 10:
    packet_str = str(packet)[:500] if packet else "empty"
    logger.info(f"Packet {line_count} content: {packet_str}")

# Log packet structure for debugging (every 50 lines to avoid spam)
if line_count % 50 == 0:
    packet_keys = list(packet.keys()) if isinstance(packet, dict) else "not-dict"
    logger.info(f"Line {line_count} packet keys: {packet_keys}")

# Log full raw response for debugging
logger.info(f"Full raw response: {full_answer}")
```

#### 4. Proper Activity Tracking
```python
if answer_content:
    full_answer += answer_content
    last_activity_time = current_time  # Reset activity timer on content
    
    # Log progress every 200 chars to track streaming
    if len(full_answer) - last_log_length >= 200:
        logger.info(f"Accumulated {len(full_answer)} chars so far...")
        last_log_length = len(full_answer)
```

#### 5. Comprehensive Error Detection
```python
# If we got no content and stream ended quickly, something went wrong
if len(full_answer) == 0 and final_elapsed < 60.0 and not done_received:
    logger.error(f"Stream ended prematurely! Only {final_elapsed:.1f}s elapsed, {line_count} lines processed, no content received")
    logger.error(f"This suggests an issue with the Onyx search or streaming connection")
```

## 🔄 **Expected Results After Fix**

### Before Fix (Broken Logs)
```
INFO:main:[enhanced_stream_chat_message_with_filters] Streaming completed. Total chars: 0, Lines processed: 255, Done received: False, Elapsed: 0.0s
WARNING:main:[CONNECTOR_CONTEXT] Search result is empty!
```

### After Fix (Expected Working Logs)
```
INFO:main:[enhanced_stream_chat_message_with_filters] Starting to read lines from stream...
INFO:main:[enhanced_stream_chat_message_with_filters] Packet 1 content: {'top_documents': [...]}
INFO:main:[enhanced_stream_chat_message_with_filters] Received search results packet
INFO:main:[enhanced_stream_chat_message_with_filters] Progress: Line 25, Elapsed: 2.5s, Idle: 0.1s, Chars: 0
INFO:main:[enhanced_stream_chat_message_with_filters] Accumulated 200 chars so far...
INFO:main:[enhanced_stream_chat_message_with_filters] Accumulated 400 chars so far...
INFO:main:[enhanced_stream_chat_message_with_filters] Received answer termination signal (answer_piece=None) after 150 lines
INFO:main:[enhanced_stream_chat_message_with_filters] Streaming completed. Total chars: 850, Lines processed: 150, Done received: True, Elapsed: 15.2s
INFO:main:[enhanced_stream_chat_message_with_filters] Full raw response: [actual response content here]
INFO:main:[CONNECTOR_CONTEXT] Received search result (850 chars)
INFO:main:[CONNECTOR_CONTEXT] Extracted summary: 200 chars
INFO:main:[CONNECTOR_CONTEXT] Extracted 5 key topics
```

## 🧪 **Testing the Fix**

### Test Connector-Based Generation
1. **Select Connectors**: Choose connectors on `/create/from-files/specific`
2. **Generate Content**: Create Course Outline or other content types  
3. **Monitor Logs**: Check for proper streaming behavior
4. **Verify Content**: Ensure context is extracted from connector sources

### Key Indicators of Success
- ✅ **`Done received: True`** - Proper termination signal received
- ✅ **`Elapsed: >5s`** - Reasonable time for Onyx to search and respond
- ✅ **`Total chars: >0`** - Actual content extracted from response
- ✅ **Full raw response logged** - Can see exactly what Onyx returned
- ✅ **Packet structure logged** - Can debug any remaining issues

## 🎯 **Key Improvements**

### 1. **Unified Streaming Logic**
- Connector approach now uses **identical** streaming logic as Knowledge Base
- Same packet handling, timeouts, and termination conditions
- Consistent behavior across all content creation methods

### 2. **Proper Wait Conditions** 
- **Only terminates on proper signals**: `answer_piece=None` or `stop_reason="finished"`
- **No premature timeouts**: Waits up to 10 minutes total, 2 minutes idle
- **Activity-based timing**: Resets idle timer on search results or content

### 3. **Enhanced Debugging**
- **Full packet logging**: First 10 packets logged completely
- **Structure inspection**: Packet keys logged every 50 lines  
- **Raw response logging**: Complete Onyx response logged for debugging
- **Progress tracking**: Regular updates on streaming progress

### 4. **Robust Error Handling**
- **Premature termination detection**: Identifies when stream ends unexpectedly
- **Comprehensive fallbacks**: Handles various error conditions gracefully
- **Detailed error reporting**: Clear indication of what went wrong

The connector streaming now uses the **exact same proven approach** as the Knowledge Base, ensuring reliable context extraction from selected connector sources with comprehensive logging for debugging any remaining issues. 