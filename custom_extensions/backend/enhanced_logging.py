"""
Enhanced Logging System for Preview Generation

This module provides comprehensive logging utilities to track every step
of the preview generation process, helping debug issues where previews
fail, show errors, or don't display anything.
"""

import logging
import json
import time
import traceback
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, Exception
from fastapi import HTTPException


class DetailedFormatter(logging.Formatter):
    """Enhanced formatter that includes timestamp, function info, and request ID"""
    
    def format(self, record):
        # Add timestamp, function name, and line number
        record.timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
        record.func_info = f"{record.funcName}:{record.lineno}"
        
        # Add request ID if available
        if hasattr(record, 'request_id'):
            record.request_id_str = f"[{record.request_id}]"
        else:
            record.request_id_str = "[NO-REQ-ID]"
            
        return super().format(record)


def setup_enhanced_logging(is_production: bool = False):
    """Setup enhanced logging configuration"""
    logger = logging.getLogger(__name__)
    
    if is_production:
        logging.basicConfig(
            level=logging.ERROR,
            format='%(timestamp)s %(levelname)s %(request_id_str)s %(func_info)s: %(message)s'
        )
    else:
        logging.basicConfig(
            level=logging.DEBUG,
            format='%(timestamp)s %(levelname)s %(request_id_str)s %(func_info)s: %(message)s'
        )

    # Apply the detailed formatter
    for handler in logging.root.handlers:
        handler.setFormatter(DetailedFormatter())
    
    return logger


def log_preview_step(request_id: str, step: str, details: Dict[str, Any] = None, error: Exception = None):
    """Centralized logging for preview generation steps"""
    logger = logging.getLogger(__name__)
    
    log_data = {
        "request_id": request_id,
        "step": step,
        "timestamp": datetime.now().isoformat(),
        "details": details or {}
    }
    
    if error:
        log_data["error"] = {
            "type": type(error).__name__,
            "message": str(error),
            "traceback": traceback.format_exc()
        }
        logger.error(f"PREVIEW_STEP_FAILED: {json.dumps(log_data, default=str)}")
    else:
        logger.info(f"PREVIEW_STEP: {json.dumps(log_data, default=str)}")


def log_onyx_request(request_id: str, endpoint: str, payload: Dict[str, Any], response_status: int = None, response_data: Any = None, error: Exception = None):
    """Log Onyx API requests and responses"""
    logger = logging.getLogger(__name__)
    
    log_data = {
        "request_id": request_id,
        "onyx_endpoint": endpoint,
        "payload_size": len(json.dumps(payload, default=str)),
        "payload_keys": list(payload.keys()) if isinstance(payload, dict) else "N/A"
    }
    
    if response_status:
        log_data["response_status"] = response_status
    if response_data:
        log_data["response_size"] = len(str(response_data))
    if error:
        log_data["error"] = {
            "type": type(error).__name__,
            "message": str(error)
        }
        logger.error(f"ONYX_REQUEST_FAILED: {json.dumps(log_data, default=str)}")
    else:
        logger.info(f"ONYX_REQUEST: {json.dumps(log_data, default=str)}")


def log_streaming_chunk(request_id: str, chunk_type: str, chunk_size: int, chunk_preview: str = None):
    """Log streaming response chunks"""
    logger = logging.getLogger(__name__)
    
    log_data = {
        "request_id": request_id,
        "chunk_type": chunk_type,
        "chunk_size": chunk_size
    }
    if chunk_preview:
        log_data["chunk_preview"] = chunk_preview[:100] + "..." if len(chunk_preview) > 100 else chunk_preview
    
    logger.debug(f"STREAMING_CHUNK: {json.dumps(log_data, default=str)}")


def log_text_processing(request_id: str, text_length: int, processing_type: str, details: Dict[str, Any] = None):
    """Log text processing steps"""
    logger = logging.getLogger(__name__)
    
    log_data = {
        "request_id": request_id,
        "text_length": text_length,
        "processing_type": processing_type,
        "timestamp": datetime.now().isoformat(),
        "details": details or {}
    }
    
    logger.info(f"TEXT_PROCESSING: {json.dumps(log_data, default=str)}")


def log_cache_operation(request_id: str, operation: str, cache_key: str, success: bool, details: Dict[str, Any] = None):
    """Log cache operations"""
    logger = logging.getLogger(__name__)
    
    log_data = {
        "request_id": request_id,
        "operation": operation,
        "cache_key": cache_key,
        "success": success,
        "timestamp": datetime.now().isoformat(),
        "details": details or {}
    }
    
    if success:
        logger.info(f"CACHE_OPERATION: {json.dumps(log_data, default=str)}")
    else:
        logger.warning(f"CACHE_OPERATION_FAILED: {json.dumps(log_data, default=str)}")


def log_database_operation(request_id: str, operation: str, table: str, success: bool, details: Dict[str, Any] = None, error: Exception = None):
    """Log database operations"""
    logger = logging.getLogger(__name__)
    
    log_data = {
        "request_id": request_id,
        "operation": operation,
        "table": table,
        "success": success,
        "timestamp": datetime.now().isoformat(),
        "details": details or {}
    }
    
    if error:
        log_data["error"] = {
            "type": type(error).__name__,
            "message": str(error)
        }
        logger.error(f"DB_OPERATION_FAILED: {json.dumps(log_data, default=str)}")
    else:
        logger.info(f"DB_OPERATION: {json.dumps(log_data, default=str)}")


def log_performance_metric(request_id: str, metric_name: str, value: float, unit: str = "seconds", details: Dict[str, Any] = None):
    """Log performance metrics"""
    logger = logging.getLogger(__name__)
    
    log_data = {
        "request_id": request_id,
        "metric_name": metric_name,
        "value": value,
        "unit": unit,
        "timestamp": datetime.now().isoformat(),
        "details": details or {}
    }
    
    logger.info(f"PERFORMANCE_METRIC: {json.dumps(log_data, default=str)}")


class PreviewGenerationError(Exception):
    """Custom exception for preview generation errors"""
    def __init__(self, step: str, message: str, original_error: Exception = None):
        self.step = step
        self.message = message
        self.original_error = original_error
        super().__init__(f"Preview generation failed at step '{step}': {message}")


class RequestTracker:
    """Context manager for tracking request lifecycle"""
    
    def __init__(self, request_id: str = None):
        self.request_id = request_id or str(uuid.uuid4())[:8]
        self.start_time = time.time()
        self.steps = []
        
    def __enter__(self):
        log_preview_step(self.request_id, "request_start", {
            "request_id": self.request_id,
            "start_time": self.start_time
        })
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = time.time() - self.start_time
        log_preview_step(self.request_id, "request_end", {
            "duration": duration,
            "total_steps": len(self.steps),
            "success": exc_type is None
        })
        
        if exc_type:
            log_preview_step(self.request_id, "request_failed", {
                "error_type": exc_type.__name__,
                "error_message": str(exc_val)
            }, error=exc_val)
    
    def add_step(self, step: str, details: Dict[str, Any] = None):
        """Add a step to the request tracking"""
        self.steps.append({
            "step": step,
            "timestamp": datetime.now().isoformat(),
            "details": details or {}
        })
        log_preview_step(self.request_id, step, details)


def create_request_id() -> str:
    """Generate a unique request ID for tracking"""
    return str(uuid.uuid4())[:8]


def log_request_start(request_id: str, endpoint: str, payload_summary: Dict[str, Any] = None):
    """Log the start of a request"""
    log_preview_step(request_id, "request_start", {
        "endpoint": endpoint,
        "payload_summary": payload_summary or {}
    })


def log_request_end(request_id: str, duration: float, success: bool = True, error: Exception = None):
    """Log the end of a request"""
    details = {
        "duration": duration,
        "success": success
    }
    
    if error:
        log_preview_step(request_id, "request_end_failed", details, error=error)
    else:
        log_preview_step(request_id, "request_end_success", details) 