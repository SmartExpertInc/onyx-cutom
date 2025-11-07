"""
Structured logging configuration using structlog.
Integrates with existing Python logging.getLogger() calls.
"""
import logging
import sys
import json
import re
import traceback
from datetime import datetime, timezone
from typing import Any, Dict, Optional
import structlog
from structlog.stdlib import LoggerFactory
from structlog.processors import JSONRenderer, TimeStamper, add_log_level, StackInfoRenderer
from structlog.contextvars import merge_contextvars, clear_contextvars


# Context variables for request context
_request_context: Dict[str, Any] = {}


def set_request_context(user_id: Optional[str] = None, endpoint: Optional[str] = None, 
                       request_id: Optional[str] = None, **kwargs):
    """
    Set request context that will be included in all subsequent log entries.
    
    Args:
        user_id: Current user ID
        endpoint: API endpoint being called
        request_id: Unique request ID
        **kwargs: Additional context fields
    """
    global _request_context
    _request_context.clear()
    if user_id:
        _request_context['user_id'] = user_id
    if endpoint:
        _request_context['endpoint'] = endpoint
    if request_id:
        _request_context['request_id'] = request_id
    _request_context.update(kwargs)


def clear_request_context():
    """Clear the request context."""
    global _request_context
    _request_context.clear()


def get_request_context() -> Dict[str, Any]:
    """Get current request context."""
    return _request_context.copy()


def add_log_context(**kwargs):
    """Add additional context to current request context."""
    global _request_context
    _request_context.update(kwargs)


class StructuredLoggerAdapter(logging.LoggerAdapter):
    """
    Adapter that wraps standard logging.Logger to add structured logging.
    Maintains compatibility with existing logger.info(), logger.error() calls.
    """
    
    def process(self, msg, kwargs):
        """Process log message and add structured context."""
        # Get base context from request context
        context = get_request_context()
        
        # Add any extra context from the adapter
        if self.extra:
            context.update(self.extra)
        
        # Add context from kwargs['extra'] if present
        if 'extra' in kwargs:
            context.update(kwargs['extra'])
            del kwargs['extra']
        
        # Add structured fields to kwargs
        kwargs['extra'] = context
        
        return msg, kwargs
    
    def _log(self, level, msg, args, exc_info=None, extra=None, stack_info=False, **kwargs):
        """
        Override _log to add structured context and format exceptions properly.
        """
        # Merge extra context
        if extra is None:
            extra = {}
        
        # Get request context
        context = get_request_context()
        context.update(extra)
        
        # If there's an exception, extract traceback
        if exc_info:
            if isinstance(exc_info, BaseException):
                exc_info = (type(exc_info), exc_info, exc_info.__traceback__)
            elif exc_info is True:
                exc_info = sys.exc_info()
            
            if exc_info and exc_info[0]:
                # Extract error details
                error_type = exc_info[0].__name__
                error_msg = str(exc_info[1]) if exc_info[1] else ""
                error_trace = ''.join(traceback.format_exception(*exc_info))
                
                context['error'] = f"{error_type}: {error_msg}"
                context['trace'] = error_trace
                context['event'] = 'unexpected_backend_error'
        
        # Add timestamp
        context['timestamp'] = datetime.now(timezone.utc).isoformat()
        
        # Add log level
        context['level'] = logging.getLevelName(level).lower()
        
        # Add module/logger name
        context['module'] = self.logger.name
        
        # Call parent _log with structured context
        super()._log(level, msg, args, exc_info=exc_info, extra=context, 
                    stack_info=stack_info, **kwargs)


def setup_structured_logging(is_production: bool = False):
    """
    Setup structured logging that works with existing logging.getLogger() calls.
    
    Args:
        is_production: If True, only log ERROR and CRITICAL. If False, log INFO and above.
    """
    # Set log level
    log_level = logging.ERROR if is_production else logging.INFO
    
    # Configure structlog
    structlog.configure(
        processors=[
            merge_contextvars,  # Merge context variables
            add_log_level,      # Add log level
            TimeStamper(fmt="iso"),  # Add ISO timestamp
            StackInfoRenderer(),     # Add stack info for exceptions
            JSONRenderer()           # Output as JSON
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=LoggerFactory(),
        cache_logger_on_first_use=True,
    )
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Remove existing handlers to avoid duplicates
    root_logger.handlers = []
    
    # Create console handler that outputs JSON
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    
    # Use JSON formatter for structured output
    class JSONFormatter(logging.Formatter):
        """Formatter that outputs logs as JSON."""
        
        def format(self, record: logging.LogRecord) -> str:
            """Format log record as JSON."""
            # Get the base message (without traceback appended)
            # Python's logging system appends traceback to the message, so we need to extract it
            message = record.getMessage()
            
            # Base log data
            log_data = {
                'timestamp': datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
                'level': record.levelname.lower(),
                'logger': record.name,
                'message': message,
            }
            
            # Parse Uvicorn access log format if it's an access log
            # Format: "IP:PORT - \"METHOD PATH HTTP/VERSION\" STATUS_CODE STATUS_TEXT"
            message = record.getMessage()
            if record.name == "uvicorn.access" and "HTTP/" in message:
                # Try to parse Uvicorn access log format
                access_pattern = r'(\d+\.\d+\.\d+\.\d+):(\d+)\s+-\s+"(\w+)\s+([^"]+)\s+HTTP/[^"]+"\s+(\d+)\s+(.*)'
                match = re.match(access_pattern, message)
                if match:
                    ip, port, method, path, status_code, status_text = match.groups()
                    log_data['ip'] = ip
                    log_data['port'] = int(port)
                    log_data['method'] = method
                    log_data['path'] = path
                    log_data['endpoint'] = path  # Also set as endpoint for consistency
                    log_data['status_code'] = int(status_code)
                    log_data['status_text'] = status_text
                    # Set level based on status code
                    status = int(status_code)
                    if status >= 500:
                        log_data['level'] = 'error'
                    elif status >= 400:
                        log_data['level'] = 'warning'
                    else:
                        log_data['level'] = 'info'
                    log_data['event'] = 'http_request'
            
            # Add exception info if present
            if record.exc_info:
                error_type = record.exc_info[0].__name__ if record.exc_info[0] else 'Exception'
                error_msg = str(record.exc_info[1]) if record.exc_info[1] else ""
                error_trace = self.formatException(record.exc_info)
                
                log_data['error'] = f"{error_type}: {error_msg}"
                # Store traceback as a single string with normalized line endings
                # json.dumps will escape the newlines, but we normalize them first
                log_data['trace'] = error_trace.replace('\r\n', '\n').replace('\r', '\n')
                log_data['event'] = 'unexpected_backend_error'
                
                # Remove traceback from message if it was appended by Python's logging
                # Python's getMessage() may include the traceback, so we clean it up
                if error_trace in message:
                    # Remove the traceback from the message
                    message = message.replace(error_trace, '').strip()
                    log_data['message'] = message
            
            # Check if trace is already in log_data (from StructuredLoggerAdapter via extra context)
            # This happens when StructuredLoggerAdapter._log() adds trace to context
            if 'trace' in log_data and isinstance(log_data['trace'], str):
                # Normalize line endings to ensure consistent formatting
                log_data['trace'] = log_data['trace'].replace('\r\n', '\n').replace('\r', '\n')
            
            # Add any extra fields from record
            if hasattr(record, 'user_id'):
                log_data['user_id'] = record.user_id
            if hasattr(record, 'endpoint'):
                log_data['endpoint'] = record.endpoint
            if hasattr(record, 'request_id'):
                log_data['request_id'] = record.request_id
            if hasattr(record, 'module'):
                log_data['module'] = record.module
            if hasattr(record, 'additional_context'):
                log_data['additional_context'] = record.additional_context
            
            # Add any other extra fields
            for key, value in record.__dict__.items():
                if key not in ['name', 'msg', 'args', 'created', 'filename', 'funcName',
                              'levelname', 'levelno', 'lineno', 'module', 'msecs', 'message',
                              'pathname', 'process', 'processName', 'relativeCreated', 'thread',
                              'threadName', 'exc_info', 'exc_text', 'stack_info', 'user_id',
                              'endpoint', 'request_id', 'module', 'additional_context', 'error',
                              'trace', 'event', 'timestamp', 'level', 'logger', 'message']:
                    if not key.startswith('_'):
                        log_data[key] = value
            
            # Ensure JSON is output as a single line (no pretty printing)
            # This is critical for Docker log drivers which expect one JSON object per line
            json_output = json.dumps(log_data, default=str, ensure_ascii=False)
            # Remove any actual newlines that might have been introduced (shouldn't happen, but safety check)
            json_output = json_output.replace('\n', '\\n').replace('\r', '\\r')
            return json_output
    
    console_handler.setFormatter(JSONFormatter())
    root_logger.addHandler(console_handler)
    
    # Configure Uvicorn access logger to use structured logging
    access_logger = logging.getLogger("uvicorn.access")
    access_logger.setLevel(log_level)
    access_logger.handlers = []
    access_handler = logging.StreamHandler(sys.stdout)
    access_handler.setLevel(log_level)
    access_handler.setFormatter(JSONFormatter())
    access_logger.addHandler(access_handler)
    access_logger.propagate = False  # Prevent duplicate logs
    
    # Configure Uvicorn error logger
    error_logger = logging.getLogger("uvicorn.error")
    error_logger.setLevel(log_level)
    error_logger.handlers = []
    error_handler = logging.StreamHandler(sys.stdout)
    error_handler.setLevel(log_level)
    error_handler.setFormatter(JSONFormatter())
    error_logger.addHandler(error_handler)
    error_logger.propagate = False
    
    # Configure Uvicorn main logger
    uvicorn_logger = logging.getLogger("uvicorn")
    uvicorn_logger.setLevel(log_level)
    uvicorn_logger.handlers = []
    uvicorn_handler = logging.StreamHandler(sys.stdout)
    uvicorn_handler.setLevel(log_level)
    uvicorn_handler.setFormatter(JSONFormatter())
    uvicorn_logger.addHandler(uvicorn_handler)
    uvicorn_logger.propagate = False
    
    return root_logger


def get_structured_logger(name: str = __name__) -> StructuredLoggerAdapter:
    """
    Get a structured logger that's compatible with existing logging.getLogger() usage.
    
    Usage:
        logger = get_structured_logger(__name__)
        logger.info("Something happened", extra={"key": "value"})
        logger.error("Error occurred", exc_info=True)
    
    Args:
        name: Logger name (typically __name__)
    
    Returns:
        StructuredLoggerAdapter instance
    """
    base_logger = logging.getLogger(name)
    return StructuredLoggerAdapter(base_logger, {})


# Convenience function that works like logging.getLogger but returns structured logger
def getLogger(name: str = __name__) -> StructuredLoggerAdapter:
    """
    Drop-in replacement for logging.getLogger() that returns a structured logger.
    
    Usage:
        logger = getLogger(__name__)
        logger.info("Message")
        logger.error("Error", exc_info=True)
    """
    return get_structured_logger(name)

