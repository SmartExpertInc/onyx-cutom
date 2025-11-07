# Structured Logging with Loki Integration

This document describes the structured logging setup integrated with Loki for the custom backend.

## Overview

The system uses:
- **Loki**: Log aggregation system
- **Promtail**: Log shipper that collects logs from Docker containers
- **Structured Logging**: Python backend with structlog integration
- **Backend Endpoint**: `/api/custom/logs` to query logs from Loki

## Components

### 1. Docker Services

Added to `docker-compose.dev.yml`:
- **loki**: Grafana Loki service on port 3100
- **promtail**: Log shipper that collects Docker container logs

### 2. Structured Logging Configuration

**File**: `custom_extensions/backend/app/utils/logging_config.py`

Features:
- Compatible with existing `logging.getLogger(__name__)` calls
- Automatically adds structured context (user_id, endpoint, request_id)
- Outputs JSON formatted logs to stdout (collected by Promtail)
- Integrates with production/dev environment settings

### 3. Log Structure

Each log entry includes:
```json
{
  "timestamp": "2025-01-07T12:34:56Z",
  "level": "error",
  "logger": "module.name",
  "message": "Error message",
  "user_id": "12345",
  "endpoint": "/api/custom/projects",
  "request_id": "abc-123-def",
  "event": "unexpected_backend_error",
  "error": "ValueError: Invalid input",
  "trace": "Full stack trace...",
  "module": "app.services.project_service",
  "additional_context": {
    "method": "POST",
    "response_time_ms": 150
  }
}
```

### 4. Backend Endpoint

**Endpoint**: `GET /api/custom/logs`

**Query Parameters**:
- `user_id` (optional): Filter by user ID
- `endpoint` (optional): Filter by endpoint path
- `level` (optional): Filter by log level (error, info, warning, etc.)
- `event` (optional): Filter by event type
- `limit` (optional, default: 100): Maximum number of logs (1-1000)
- `hours` (optional, default: 1): Hours to look back (1-168)

**Example**:
```bash
GET /api/custom/logs?user_id=12345&level=error&hours=24&limit=50
```

**Response**:
```json
{
  "logs": [
    {
      "timestamp": "2025-01-07T12:34:56Z",
      "level": "error",
      "user_id": "12345",
      "endpoint": "/api/custom/projects",
      "message": "Error message",
      "error": "ValueError: Invalid input",
      "trace": "...",
      "labels": {
        "container": "onyx-stack-custom-backend",
        "job": "custom_backend"
      }
    }
  ],
  "total": 1,
  "query": "{job=\"custom_backend\"} | json | user_id=\"12345\" | json | level=\"error\"",
  "start_time": "2025-01-06T12:34:56Z",
  "end_time": "2025-01-07T12:34:56Z"
}
```

## Usage in Code

### Basic Usage (Compatible with existing code)

```python
from app.utils.logging_config import get_structured_logger

logger = get_structured_logger(__name__)

# Works exactly like standard logging
logger.info("Something happened")
logger.error("Error occurred", exc_info=True)
logger.warning("Warning message")
```

### With Additional Context

```python
logger.error(
    "Request failed",
    exc_info=True,
    extra={
        "event": "unexpected_backend_error",
        "additional_context": {
            "method": "POST",
            "status_code": 500
        }
    }
)
```

### Request Context (Automatic)

The middleware automatically sets request context:
- `user_id`: From request state
- `endpoint`: From request URL path
- `request_id`: Generated UUID per request

This context is automatically included in all log entries during the request.

## Configuration

### Environment Variables

- `LOKI_URL`: Loki service URL (default: `http://loki:3100`)
- `IS_PRODUCTION`: Set to `True` for production (logs only ERROR and CRITICAL)

### Loki Configuration

**File**: `deployment/data/loki/local-config.yaml`
- Retention: 7 days (168 hours)
- Storage: Filesystem
- Port: 3100

### Promtail Configuration

**File**: `deployment/data/promtail/config.yml`
- Collects logs from Docker containers
- Parses JSON structured logs
- Extracts labels for filtering
- Sends to Loki

## Integration with Existing Logging

The structured logging is fully compatible with existing code:

```python
# Old code (still works)
logger = logging.getLogger(__name__)
logger.info("Message")

# New code (recommended)
from app.utils.logging_config import get_structured_logger
logger = get_structured_logger(__name__)
logger.info("Message")  # Now includes structured context
```

## Frontend Integration

The frontend can query logs using the `/api/custom/logs` endpoint:

```typescript
// Example: Fetch error logs for a specific user
const response = await fetch(
  `/api/custom/logs?user_id=${userId}&level=error&hours=24`
);
const data = await response.json();
console.log(data.logs);
```

## Troubleshooting

### Logs not appearing in Loki

1. Check if Loki and Promtail containers are running:
   ```bash
   docker-compose ps loki promtail
   ```

2. Check Promtail logs:
   ```bash
   docker-compose logs promtail
   ```

3. Verify container names match Promtail config:
   - Container name should match regex in `promtail/config.yml`
   - Default: `onyx-stack-custom-backend`

### Logs not structured

1. Ensure structured logging is initialized in `main.py`:
   ```python
   setup_structured_logging(is_production=IS_PRODUCTION)
   ```

2. Check that logs are JSON formatted (check container stdout)

### Endpoint returns empty results

1. Verify Loki is accessible from backend:
   ```bash
   docker-compose exec custom_backend curl http://loki:3100/ready
   ```

2. Check query syntax in Loki service logs

3. Verify time range (default is last 1 hour)

## Next Steps

- Frontend dashboard implementation (not included in this phase)
- Log retention policies
- Alerting rules (can be added to Loki)
- Grafana integration for visualization

