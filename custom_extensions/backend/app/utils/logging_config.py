"""
Structured logging configuration using structlog.
Integrates with existing Python logging.getLogger() calls.
"""
import logging
import sys
import json
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
            # Base log data
            log_data = {
                'timestamp': datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
                'level': record.levelname.lower(),
                'logger': record.name,
                'message': record.getMessage(),
            }
            
            # Add exception info if present
            if record.exc_info:
                error_type = record.exc_info[0].__name__ if record.exc_info[0] else 'Exception'
                error_msg = str(record.exc_info[1]) if record.exc_info[1] else ""
                error_trace = self.formatException(record.exc_info)
                
                log_data['error'] = f"{error_type}: {error_msg}"
                log_data['trace'] = error_trace
                log_data['event'] = 'unexpected_backend_error'
            
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
            
            return json.dumps(log_data, default=str)
    
    console_handler.setFormatter(JSONFormatter())
    root_logger.addHandler(console_handler)
    
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

