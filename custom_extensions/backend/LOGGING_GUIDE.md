# Enhanced Logging Guide for Preview Generation

This guide explains how to use the enhanced logging system to debug issues where preview generation fails, shows errors, or doesn't display anything.

## Overview

The enhanced logging system provides comprehensive tracking of every step in the preview generation process, including:

- **Request lifecycle tracking** with unique request IDs
- **Detailed step-by-step logging** of each operation
- **Onyx API request/response logging** 
- **Text processing logging** for compression, chunking, and virtual file creation
- **Streaming response chunk logging**
- **Database operation logging**
- **Cache operation logging**
- **Performance metrics**
- **Error tracking** with full stack traces

## Quick Start

### 1. Import the Enhanced Logging Module

```python
from enhanced_logging import (
    log_preview_step,
    log_onyx_request,
    log_streaming_chunk,
    log_text_processing,
    log_cache_operation,
    log_database_operation,
    log_performance_metric,
    PreviewGenerationError,
    RequestTracker,
    create_request_id
)
```

### 2. Setup Enhanced Logging

```python
from enhanced_logging import setup_enhanced_logging

# In your main.py startup
logger = setup_enhanced_logging(is_production=False)  # Set to True for production
```

### 3. Add Logging to Your Preview Endpoints

```python
@app.post("/api/custom/course-outline/preview")
async def wizard_outline_preview(payload: OutlineWizardPreview, request: Request):
    # Generate unique request ID for tracking
    request_id = create_request_id()
    start_time = time.time()
    
    # Log request start
    log_preview_step(request_id, "preview_start", {
        "endpoint": "course-outline/preview",
        "prompt_length": len(payload.prompt),
        "prompt_preview": payload.prompt[:100] + "..." if len(payload.prompt) > 100 else payload.prompt,
        "modules": payload.modules,
        "lessons_per_module": payload.lessonsPerModule,
        "language": payload.language,
        "from_files": payload.fromFiles,
        "from_text": payload.fromText,
        "text_mode": payload.textMode,
        "user_text_length": len(payload.userText) if payload.userText else 0,
        "has_chat_session": bool(payload.chatSessionId)
    })
    
    try:
        # Your existing code here...
        
        # Log each major step
        log_preview_step(request_id, "authentication_success", {"session_cookie_present": True})
        log_preview_step(request_id, "chat_session_created", {"chat_id": chat_id})
        log_preview_step(request_id, "payload_preparation_complete", {"wizard_payload_keys": list(wiz_payload.keys())})
        
        # Log text processing
        if payload.fromText and payload.userText:
            log_text_processing(request_id, len(payload.userText), "text_analysis", {
                "text_mode": payload.textMode,
                "compression_needed": len(payload.userText) > TEXT_SIZE_THRESHOLD
            })
        
        # Log Onyx API request
        log_onyx_request(request_id, "/chat/send-message", send_payload)
        
        # Log streaming chunks
        log_streaming_chunk(request_id, "delta", len(delta_text), delta_text[:50])
        
        # Log completion
        log_preview_step(request_id, "preview_complete", {
            "total_duration": time.time() - start_time,
            "assistant_reply_length": len(assistant_reply),
            "modules_count": len(modules_preview)
        })
        
        return StreamingResponse(streamer(), media_type="application/json")
        
    except Exception as e:
        # Log error with full context
        log_preview_step(request_id, "preview_generation_failed", {
            "total_duration": time.time() - start_time,
            "error_type": type(e).__name__,
            "error_message": str(e)
        }, error=e)
        
        # Re-raise with enhanced context
        if isinstance(e, HTTPException):
            raise e
        else:
            raise PreviewGenerationError("preview_generation", f"Unexpected error: {str(e)}", e)
```

## Using the RequestTracker Context Manager

For even easier tracking, use the `RequestTracker` context manager:

```python
@app.post("/api/custom/lesson-presentation/preview")
async def wizard_lesson_preview(payload: LessonWizardPreview, request: Request, pool: asyncpg.Pool = Depends(get_db_pool)):
    with RequestTracker() as tracker:
        # Each step is automatically logged
        tracker.add_step("authentication_check", {"has_cookie": bool(request.cookies.get(ONYX_SESSION_COOKIE_NAME))})
        
        # Your code here...
        
        tracker.add_step("chat_session_setup", {"chat_id": chat_id})
        tracker.add_step("payload_built", {"payload_size": len(json.dumps(wizard_dict))})
        tracker.add_step("streaming_started")
        
        return StreamingResponse(streamer(), media_type="text/plain")
```

## Log Output Format

The enhanced logging produces structured JSON logs that are easy to parse and analyze:

### Preview Step Log
```json
{
  "request_id": "a1b2c3d4",
  "step": "preview_start",
  "timestamp": "2024-01-15T10:30:45.123456",
  "details": {
    "endpoint": "course-outline/preview",
    "prompt_length": 150,
    "modules": 3,
    "language": "en"
  }
}
```

### Error Log
```json
{
  "request_id": "a1b2c3d4",
  "step": "preview_generation_failed",
  "timestamp": "2024-01-15T10:30:47.456789",
  "details": {
    "total_duration": 2.333,
    "error_type": "ConnectionError",
    "error_message": "Failed to connect to Onyx API"
  },
  "error": {
    "type": "ConnectionError",
    "message": "Failed to connect to Onyx API",
    "traceback": "Traceback (most recent call last):\n..."
  }
}
```

### Onyx Request Log
```json
{
  "request_id": "a1b2c3d4",
  "onyx_endpoint": "/chat/send-message",
  "payload_size": 2048,
  "payload_keys": ["chat_session_id", "message", "stream_response"],
  "response_status": 200,
  "response_size": 1024
}
```

## Debugging Common Issues

### 1. Preview Shows Nothing

Look for these log patterns:
- `PREVIEW_STEP: preview_start` - Request started
- `PREVIEW_STEP: authentication_success` - Authentication passed
- `PREVIEW_STEP: chat_session_created` - Chat session created
- `ONYX_REQUEST: /chat/send-message` - Onyx API called
- `STREAMING_CHUNK: delta` - Response chunks received
- `PREVIEW_STEP: preview_complete` - Preview finished

If you see `preview_start` but no `preview_complete`, the issue is likely in the streaming response.

### 2. Preview Shows Errors

Look for:
- `PREVIEW_STEP_FAILED` - Step-specific failures
- `ONYX_REQUEST_FAILED` - Onyx API failures
- `TEXT_PROCESSING` - Text processing issues
- `DB_OPERATION_FAILED` - Database issues

### 3. Slow Preview Generation

Look for:
- `PERFORMANCE_METRIC` - Timing information
- `TEXT_PROCESSING` - Large text processing
- `ONYX_REQUEST` - API response times

### 4. Authentication Issues

Look for:
- `PREVIEW_STEP_FAILED` with step "authentication_failed"
- Missing session cookies
- Invalid chat session IDs

## Log Analysis Commands

### Find Failed Requests
```bash
grep "PREVIEW_STEP_FAILED" logs/app.log
```

### Find Slow Requests (>10 seconds)
```bash
grep "PERFORMANCE_METRIC" logs/app.log | grep '"value":[0-9]\{2,\}'
```

### Find Onyx API Failures
```bash
grep "ONYX_REQUEST_FAILED" logs/app.log
```

### Find Text Processing Issues
```bash
grep "TEXT_PROCESSING" logs/app.log
```

### Track Specific Request
```bash
grep "a1b2c3d4" logs/app.log | jq '.'
```

## Production Considerations

### 1. Log Level Configuration
```python
# Development
setup_enhanced_logging(is_production=False)  # DEBUG level

# Production
setup_enhanced_logging(is_production=True)   # ERROR level only
```

### 2. Log Rotation
Configure log rotation to prevent disk space issues:
```python
import logging.handlers

handler = logging.handlers.RotatingFileHandler(
    'logs/app.log',
    maxBytes=100*1024*1024,  # 100MB
    backupCount=5
)
```

### 3. Sensitive Data Filtering
The logging system automatically filters sensitive data, but you can add custom filters:
```python
def filter_sensitive_data(record):
    if hasattr(record, 'msg'):
        # Remove API keys, passwords, etc.
        record.msg = re.sub(r'api_key["\']?\s*[:=]\s*["\'][^"\']+["\']', 'api_key=***', record.msg)
    return True
```

## Integration with Monitoring Tools

### 1. Structured Logging for ELK Stack
The JSON format is compatible with Elasticsearch:
```python
# Log to file in JSON format
handler = logging.FileHandler('logs/app.json')
handler.setFormatter(logging.Formatter('%(message)s'))
```

### 2. Metrics for Prometheus
Extract metrics from logs:
```python
# Log metrics for Prometheus scraping
log_performance_metric(request_id, "preview_duration", duration, "seconds")
log_performance_metric(request_id, "text_length", len(text), "characters")
```

### 3. Alerting Rules
Set up alerts based on log patterns:
- Multiple `PREVIEW_STEP_FAILED` in 5 minutes
- `ONYX_REQUEST_FAILED` with 5xx status codes
- `PERFORMANCE_METRIC` with duration > 30 seconds

## Troubleshooting Checklist

When preview generation fails:

1. **Check Request Start**: Look for `preview_start` log
2. **Check Authentication**: Look for `authentication_success` or `authentication_failed`
3. **Check Chat Session**: Look for `chat_session_created` or `chat_session_creation_failed`
4. **Check Text Processing**: Look for `TEXT_PROCESSING` logs
5. **Check Onyx API**: Look for `ONYX_REQUEST` or `ONYX_REQUEST_FAILED`
6. **Check Streaming**: Look for `STREAMING_CHUNK` logs
7. **Check Completion**: Look for `preview_complete` or `preview_generation_failed`
8. **Check Performance**: Look for `PERFORMANCE_METRIC` logs
9. **Check Database**: Look for `DB_OPERATION` logs
10. **Check Cache**: Look for `CACHE_OPERATION` logs

## Example Debug Session

```bash
# 1. Start the application with enhanced logging
python main.py

# 2. Generate a preview that fails

# 3. Check the logs
tail -f logs/app.log | grep "a1b2c3d4"

# 4. Look for the failure pattern
grep "a1b2c3d4" logs/app.log | grep -E "(FAILED|ERROR)"

# 5. Check performance
grep "a1b2c3d4" logs/app.log | grep "PERFORMANCE_METRIC"

# 6. Check Onyx API calls
grep "a1b2c3d4" logs/app.log | grep "ONYX_REQUEST"
```

This enhanced logging system will help you quickly identify where preview generation is failing and why, making debugging much more efficient. 