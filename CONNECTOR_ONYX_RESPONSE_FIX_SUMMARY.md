# Connector Onyx Response Fix - Knowledge Base Approach Implementation

## 🐛 **Issue Identified**

### Problem: Connector Context Extraction Not Waiting for Onyx Response Properly
**Symptoms**: When using connectors for content generation, the system doesn't wait for Onyx's response correctly, leading to incomplete or missing context extraction.

**Root Cause**: The connector approach was using a simple API call without proper streaming response handling, unlike the "From Knowledge Base" approach which has perfect message sending/response awaiting logic.

## 🔍 **Analysis of Knowledge Base vs Connector Approaches**

### Knowledge Base Approach (Working Correctly)
1. **Uses Search Persona**: Creates chat session with Search persona (ID 0)
2. **Structured Prompt**: Comprehensive prompt requesting formatted response
3. **Proper Streaming**: Uses `enhanced_stream_chat_message()` for proper response handling
4. **Response Parsing**: Extracts SUMMARY, KEY_TOPICS, IMPORTANT_DETAILS, RELEVANT_SOURCES
5. **Comprehensive Context**: Returns structured context in consistent format

### Connector Approach (Previous - Problematic)
1. **No Persona**: Just used temporary UUID session
2. **Simple Message**: Basic "Search for information about: {prompt}"
3. **Direct API Call**: Simple POST to `/chat/send-message` without streaming
4. **Basic Extraction**: Just extracted raw content without structure
5. **Inconsistent Format**: Different return format from other approaches

## ✅ **Fix Applied**

### 1. Updated `extract_connector_context_from_onyx()` Function

**File**: `custom_extensions/backend/main.py` (Lines 9749-9898)

**Key Changes**:

#### A. Same Session Creation Pattern
```python
# Create a temporary chat session with the Search persona (ID 0)
search_persona_id = 0
temp_chat_id = await create_onyx_chat_session(search_persona_id, cookies)
logger.info(f"[CONNECTOR_CONTEXT] Created search chat session: {temp_chat_id}")
```

#### B. Comprehensive Structured Prompt
```python
search_prompt = f"""
Please search within the following connector sources for information relevant to this topic: "{prompt}"

Search only within these specific sources: {', '.join(connector_list)}

I need you to:
1. Search within the specified connector sources only
2. Find the most relevant information related to this topic
3. Provide a comprehensive summary of what you find
4. Extract key topics, concepts, and important details
5. Identify any specific examples, case studies, or practical applications

Please format your response as:
SUMMARY: [comprehensive summary of relevant information found]
KEY_TOPICS: [comma-separated list of key topics and concepts]
IMPORTANT_DETAILS: [specific details, examples, or practical information]
RELEVANT_SOURCES: [mention of any specific documents or sources that were particularly relevant]

Focus only on content from these connector sources: {', '.join(connector_list)}
Be thorough and comprehensive in your search and analysis.
"""
```

#### C. Proper Streaming Response Handling
```python
search_result = await enhanced_stream_chat_message_with_filters(temp_chat_id, search_prompt, cookies, connector_list)
```

#### D. Same Response Parsing Logic
```python
# Extract content flexibly using string searching (identical to Knowledge Base)
if "SUMMARY:" in search_result:
    summary_start = search_result.find("SUMMARY:") + 8
    # ... same parsing logic as Knowledge Base
```

#### E. Consistent Return Format
```python
return {
    "connector_search": True,
    "topic": prompt,
    "connector_sources": connector_list,
    "summary": summary,
    "key_topics": key_topics,
    "important_details": important_details,
    "relevant_sources": relevant_sources,
    "full_search_result": search_result,
    "file_summaries": [{
        "file_id": "connector_search",
        "name": f"Connector Search: {', '.join(connector_list)}",
        "summary": summary,
        "topics": key_topics,
        "key_info": important_details
    }]
}
```

### 2. Created `enhanced_stream_chat_message_with_filters()` Function

**File**: `custom_extensions/backend/main.py` (Lines 10087-10180)

**Purpose**: Specialized version of `enhanced_stream_chat_message()` that includes connector source filtering.

**Key Features**:
```python
retrieval_options = {
    "run_search": "always",  # Always search for connectors
    "real_time": False,
    "filters": {
        "connectorSources": connector_sources  # Filter by specific connector sources
    }
}
```

**Streaming Logic**: Identical to Knowledge Base approach with proper event-stream handling, JSON parsing, and progress logging.

## 🔄 **How the Fix Works**

### Message Flow (Now Identical to Knowledge Base)
1. **Session Creation**: Create search persona chat session
2. **Structured Query**: Send comprehensive formatted prompt
3. **Streaming Response**: Properly handle Onyx's streaming response
4. **Content Parsing**: Extract structured sections from response
5. **Context Return**: Return formatted context for OpenAI generation

### Connector Filtering Integration
1. **Filter Application**: `retrieval_options.filters.connectorSources` limits search scope
2. **Source Validation**: Only searches within specified connector sources
3. **Response Verification**: Logs and validates that content comes from correct sources

### Response Quality Improvements
1. **Structured Output**: AI now provides organized SUMMARY, KEY_TOPICS, etc.
2. **Comprehensive Context**: More detailed and useful context for generation
3. **Better Logging**: Detailed progress tracking and debugging information
4. **Consistent Format**: Same structure as Knowledge Base and file-based approaches

## 🧪 **Expected Results**

### Before Fix (Problematic)
- ❌ Basic API call without proper response handling
- ❌ Minimal context extraction
- ❌ Inconsistent response format
- ❌ Poor error handling and logging

### After Fix (Improved)
- ✅ **Proper Streaming**: Uses same robust streaming logic as Knowledge Base
- ✅ **Rich Context**: Structured summary, key topics, details, and sources
- ✅ **Connector Filtering**: Only searches within selected connector sources
- ✅ **Consistent Format**: Same response structure across all approaches
- ✅ **Better Reliability**: Comprehensive error handling and fallbacks
- ✅ **Enhanced Logging**: Detailed progress tracking for debugging

## 📋 **Testing the Fix**

### Test Connector-Based Generation
1. **Select Connectors**: Choose specific connectors on `/create/from-files/specific`
2. **Generate Content**: Create Course Outline, Quiz, or other content types
3. **Verify Context**: Check logs for proper context extraction
4. **Validate Filtering**: Ensure content only comes from selected connectors

### Expected Log Output
```
[CONNECTOR_CONTEXT] Starting connector search for sources: slack,confluence
[CONNECTOR_CONTEXT] Created search chat session: abc123
[enhanced_stream_chat_message_with_filters] Streaming completed. Total chars: 2500, Lines processed: 150
[CONNECTOR_CONTEXT] Extracted summary: 450 chars
[CONNECTOR_CONTEXT] Extracted 8 key topics
```

## 🎯 **Key Improvements**

1. **Unified Approach**: Connector search now uses same proven pattern as Knowledge Base
2. **Better Context Quality**: Structured, comprehensive context instead of raw text
3. **Proper Async Handling**: Full streaming response processing with timeouts
4. **Source Filtering**: Reliable filtering by connector sources
5. **Error Resilience**: Comprehensive fallback handling for edge cases
6. **Debugging Support**: Extensive logging for troubleshooting

The connector approach now provides the same high-quality, reliable context extraction as the Knowledge Base approach, but filtered to specific connector sources as requested by the user. 