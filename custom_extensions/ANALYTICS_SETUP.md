# Analytics Dashboard Setup Guide

## Overview!
The analytics dashboard provides comprehensive tracking of all API requests across all accounts, including performance metrics, error tracking, and detailed request analysis.

## Features
- **Real-time Analytics**: Track all API requests with detailed performance metrics
- **Performance Monitoring**: Response time percentiles (P50, P95, P99), average response times
- **Error Tracking**: Detailed error logs with status codes, error messages, and user context
- **User Analytics**: Track request patterns by user, endpoint usage, and data transfer
- **Export Capabilities**: Export data in CSV or JSON format
- **Date Range Filtering**: Analyze data for specific time periods
- **Professional UI**: Clean, modern interface with charts and detailed tables

## Setup Instructions

### 1. Database Setup
The analytics table is automatically created during application startup. No manual database setup is required.

### 2. Backend Configuration
The analytics endpoints are already added to the backend (`main.py`):
- `/api/custom/analytics/dashboard` - Main dashboard data
- `/api/custom/analytics/requests` - Paginated request data with filters
- `/api/custom/analytics/export` - Data export functionality

### 3. Frontend Access
The analytics page is accessible at:
```
http://your-domain/analytics
```

**Note**: This page is only accessible via direct link - it's not linked from the main navigation to keep it private.

## Analytics Data Collected

### Request Metrics
- **Total Requests**: Count of all API requests
- **Success Rate**: Percentage of successful requests (2xx status codes)
- **Average Response Time**: Mean response time across all requests
- **Performance Percentiles**: P50, P95, P99 response times
- **Data Transfer**: Total bytes transferred (request + response)

### Error Tracking
- **Failed Requests**: Count of requests with 4xx/5xx status codes
- **Error Messages**: Detailed error information for debugging
- **Error Rates**: Percentage of errors per endpoint and user

### User Analytics
- **Unique Users**: Number of distinct users making requests
- **Top Users**: Most active users with request counts and error rates
- **User Patterns**: Request frequency and timing analysis

### Endpoint Analytics
- **Top Endpoints**: Most frequently used API endpoints
- **Method Distribution**: Breakdown by HTTP method (GET, POST, PUT, DELETE)
- **Endpoint Performance**: Response times and error rates per endpoint

## Usage Examples

### Viewing Analytics
1. Navigate to `/analytics` in your browser
2. Use date range filters to analyze specific time periods
3. Review overview cards for key metrics
4. Drill down into specific sections for detailed analysis

### Exporting Data
1. Set desired date range using the date pickers
2. Click "Export CSV" or "Export JSON" buttons
3. Download will start automatically with timestamped filename

### Filtering Data
- **Date Range**: Select specific start and end dates
- **Real-time Refresh**: Click the refresh button to update data
- **Detailed Tables**: Scroll through recent errors and top endpoints

## Security Considerations

### Access Control
- The analytics page is not linked from main navigation
- Access is controlled by direct URL access
- Consider implementing authentication/authorization if needed

### Data Privacy
- User IDs are truncated in the UI for privacy
- Error messages may contain sensitive information
- Consider data retention policies for analytics data

### Performance Impact
- Analytics tracking adds minimal overhead to API requests
- Database indexes optimize query performance
- Consider archiving old analytics data for large datasets

## Troubleshooting

### No Data Showing
1. Check if the `request_analytics` table exists in your database
2. Verify that the analytics middleware is active in the backend
3. Check browser console for any JavaScript errors

### Slow Performance
1. Ensure database indexes are created
2. Consider limiting date ranges for large datasets
3. Check database connection and query performance

### Export Issues
1. Verify file permissions for downloads
2. Check browser download settings
3. Ensure sufficient memory for large exports

## API Endpoints Reference

### GET /api/custom/analytics/dashboard
Returns comprehensive dashboard data with optional date filtering.

**Query Parameters:**
- `date_from` (optional): Start date (YYYY-MM-DD)
- `date_to` (optional): End date (YYYY-MM-DD)

### GET /api/custom/analytics/requests
Returns paginated request data with advanced filtering.

**Query Parameters:**
- `page` (default: 1): Page number
- `limit` (default: 50, max: 1000): Items per page
- `date_from`, `date_to`: Date range filtering
- `status_code`: Filter by HTTP status code
- `method`: Filter by HTTP method
- `endpoint`: Filter by endpoint path
- `user_id`: Filter by user ID
- `min_response_time`, `max_response_time`: Response time range
- `has_error`: Filter by error status (true/false)

### GET /api/custom/analytics/export
Exports analytics data in CSV or JSON format.

**Query Parameters:**
- `date_from`, `date_to`: Date range filtering
- `format` (default: csv): Export format (csv or json)

## Maintenance

### Data Retention
Consider implementing a data retention policy:
- Archive old analytics data to separate tables
- Implement automatic cleanup of old records
- Monitor database size and performance

### Performance Monitoring
- Monitor query performance on analytics endpoints
- Consider caching for frequently accessed data
- Optimize database indexes based on usage patterns

### Updates
- Keep analytics tracking middleware updated
- Monitor for new API endpoints that may need tracking
- Update export formats as needed 