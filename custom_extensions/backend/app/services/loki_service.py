"""
Service for querying logs from Loki.
"""
import httpx
from typing import Dict, Optional, Any
from datetime import datetime, timedelta, timezone
import os


LOKI_URL = os.getenv("LOKI_URL", "http://loki:3100")


class LokiService:
    """Service for querying logs from Loki."""
    
    def __init__(self, loki_url: str = LOKI_URL):
        self.loki_url = loki_url.rstrip('/')
        self.base_url = f"{self.loki_url}/loki/api/v1"
    
    async def query_logs(
        self,
        query: str = '{job="custom_backend"}',
        limit: int = 100,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        direction: str = "backward"
    ) -> Dict[str, Any]:
        """
        Query logs from Loki using LogQL.
        
        Args:
            query: LogQL query string (e.g., '{job="custom_backend"} |= "error"')
            limit: Maximum number of log entries to return
            start_time: Start time for query (defaults to 1 hour ago)
            end_time: End time for query (defaults to now)
            direction: Query direction ("forward" or "backward")
        
        Returns:
            Dictionary containing log entries and metadata
        """
        # Default time range: last hour
        if end_time is None:
            end_time = datetime.now(timezone.utc)
        if start_time is None:
            start_time = end_time - timedelta(hours=1)
        
        # Convert to nanoseconds (Loki uses nanoseconds)
        start_ns = int(start_time.timestamp() * 1e9)
        end_ns = int(end_time.timestamp() * 1e9)
        
        # Build query URL
        query_url = f"{self.base_url}/query_range"
        
        params = {
            "query": query,
            "limit": limit,
            "start": start_ns,
            "end": end_ns,
            "direction": direction
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(query_url, params=params)
                response.raise_for_status()
                data = response.json()
                
                # Parse Loki response
                logs = []
                if "data" in data and "result" in data["data"]:
                    for stream_result in data["data"]["result"]:
                        stream = stream_result.get("stream", {})
                        values = stream_result.get("values", [])
                        
                        for timestamp_ns, log_line in values:
                            # Parse timestamp (nanoseconds to datetime)
                            timestamp = datetime.fromtimestamp(
                                int(timestamp_ns) / 1e9,
                                tz=timezone.utc
                            )
                            
                            # Try to parse JSON log line
                            log_entry = {
                                "timestamp": timestamp.isoformat(),
                                "labels": stream,
                                "message": log_line
                            }
                            
                            # Try to parse as JSON if it looks like JSON
                            try:
                                import json
                                if log_line.strip().startswith('{'):
                                    parsed = json.loads(log_line)
                                    log_entry.update(parsed)
                                    log_entry["raw_message"] = log_line
                            except (json.JSONDecodeError, ValueError):
                                pass
                            
                            logs.append(log_entry)
                
                return {
                    "logs": logs,
                    "total": len(logs),
                    "query": query,
                    "start_time": start_time.isoformat(),
                    "end_time": end_time.isoformat()
                }
        
        except httpx.HTTPStatusError as e:
            raise Exception(f"Loki query failed with status {e.response.status_code}: {e.response.text}")
        except httpx.RequestError as e:
            raise Exception(f"Failed to connect to Loki: {str(e)}")
        except Exception as e:
            raise Exception(f"Unexpected error querying Loki: {str(e)}")
    
    async def query_logs_by_filters(
        self,
        user_id: Optional[str] = None,
        endpoint: Optional[str] = None,
        level: Optional[str] = None,
        event: Optional[str] = None,
        limit: int = 100,
        hours: int = 1
    ) -> Dict[str, Any]:
        """
        Query logs with common filters.
        
        Args:
            user_id: Filter by user ID
            endpoint: Filter by endpoint
            level: Filter by log level (error, info, warning, etc.)
            event: Filter by event type
            limit: Maximum number of logs to return
            hours: Number of hours to look back
        
        Returns:
            Dictionary containing filtered log entries
        """
        # Build LogQL query
        # Match Promtail config.yml: fields are extracted as labels
        # Promtail extracts: level, user_id, endpoint, event, module, request_id as labels
        # Use label filtering (most efficient) with JSON field filtering as fallback
        
        # Start with label filters (matching Promtail's label extraction)
        label_filters = ['job="custom_backend"']
        
        # Add label filters for fields that Promtail extracts as labels
        if level:
            label_filters.append(f'level="{level}"')
        if user_id:
            label_filters.append(f'user_id="{user_id}"')
        if endpoint:
            # Use regex for partial matching in label
            label_filters.append(f'endpoint=~".*{endpoint}.*"')
        if event:
            label_filters.append(f'event="{event}"')
        
        # Build query with label selectors
        # Format: {job="custom_backend", level="error", user_id="123"}
        query = '{' + ', '.join(label_filters) + '}'
        
        # Log the query for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.info("LogQL query: %s", query)
        
        # Calculate time range
        end_time = datetime.now(timezone.utc)
        start_time = end_time - timedelta(hours=hours)
        
        return await self.query_logs(
            query=query,
            limit=limit,
            start_time=start_time,
            end_time=end_time
        )
    
    async def query_logs_around_timestamp(
        self,
        target_timestamp: datetime,
        minutes_before: int = 5,
        minutes_after: int = 5,
        limit: int = 1000
    ) -> Dict[str, Any]:
        """
        Query logs around a specific timestamp.
        
        Args:
            target_timestamp: The timestamp to center the query around
            minutes_before: Number of minutes before the target timestamp to include
            minutes_after: Number of minutes after the target timestamp to include
            limit: Maximum number of log entries to return
        
        Returns:
            Dictionary containing log entries and metadata, sorted by timestamp
        """
        # Calculate time range around the target timestamp
        start_time = target_timestamp - timedelta(minutes=minutes_before)
        end_time = target_timestamp + timedelta(minutes=minutes_after)
        
        # Query all logs in the time range (no level filter)
        query = '{job="custom_backend"}'
        
        result = await self.query_logs(
            query=query,
            limit=limit,
            start_time=start_time,
            end_time=end_time,
            direction="forward"  # Forward to get chronological order
        )
        
        # Sort logs by timestamp
        if result.get("logs"):
            result["logs"].sort(key=lambda x: x.get("timestamp", ""))
        
        return result


# Singleton instance
_loki_service: Optional[LokiService] = None


def get_loki_service() -> LokiService:
    """Get or create Loki service instance."""
    global _loki_service
    if _loki_service is None:
        _loki_service = LokiService()
    return _loki_service

