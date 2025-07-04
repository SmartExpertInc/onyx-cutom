"use client";

import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { 
  Download, RefreshCw, TrendingUp, AlertTriangle, Clock, Users, Activity
} from 'lucide-react';

interface RequestAnalytics {
  id: string;
  endpoint: string;
  method: string;
  user_id: string | null;
  status_code: number;
  response_time_ms: number;
  request_size_bytes: number | null;
  response_size_bytes: number | null;
  error_message: string | null;
  created_at: string;
}

interface AnalyticsDashboard {
  overview: {
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    error_requests: number;
    success_rate: number;
    avg_response_time: number;
    max_response_time: number;
    min_response_time: number;
    total_data_transferred: number;
    unique_users: number;
    unique_endpoints: number;
  };
  status_distribution: Array<{ status_code: number; count: number; avg_time: number }>;
  top_endpoints: Array<{
    endpoint: string;
    method: string;
    request_count: number;
    avg_response_time: number;
    error_count: number;
    error_rate: number;
    total_data: number;
  }>;
  top_users: Array<{
    user_id: string;
    request_count: number;
    avg_response_time: number;
    error_count: number;
    last_request: string | null;
  }>;
  hourly_distribution: Array<{ hour: number; request_count: number; avg_response_time: number }>;
  daily_distribution: Array<{
    date: string;
    request_count: number;
    avg_response_time: number;
    error_count: number;
  }>;
  method_distribution: Array<{
    method: string;
    request_count: number;
    avg_response_time: number;
    error_count: number;
  }>;
  recent_errors: Array<{
    id: string;
    endpoint: string;
    method: string;
    status_code: number;
    response_time_ms: number;
    error_message: string;
    user_id: string;
    created_at: string;
  }>;
  performance_percentiles: {
    p50: number;
    p95: number;
    p99: number;
  };
}

const AnalyticsPage = () => {
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (dateRange.from) params.append('date_from', dateRange.from);
      if (dateRange.to) params.append('date_to', dateRange.to);

      const response = await fetch(`/api/custom/analytics/dashboard?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }
      const data = await response.json();
      setDashboard(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [dateRange, refreshKey]);

  const handleExport = async (exportFormat: 'csv' | 'json') => {
    try {
      const params = new URLSearchParams();
      if (dateRange.from) params.append('date_from', dateRange.from);
      if (dateRange.to) params.append('date_to', dateRange.to);
      params.append('format', exportFormat);

      const response = await fetch(`/api/custom/analytics/export?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to export: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_export_${exportFormat}_${format(new Date(), 'yyyyMMdd_HHmmss')}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
  };

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return '#10b981';
    if (statusCode >= 300 && statusCode < 400) return '#3b82f6';
    if (statusCode >= 400 && statusCode < 500) return '#f59e0b';
    return '#ef4444';
  };

  const getMethodColor = (method: string) => {
    const colors: { [key: string]: string } = {
      GET: '#3b82f6',
      POST: '#10b981',
      PUT: '#f59e0b',
      DELETE: '#ef4444',
      PATCH: '#8b5cf6'
    };
    return colors[method] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">Error loading analytics</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Request Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Comprehensive tracking of all API requests across all accounts</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={() => setRefreshKey(prev => prev + 1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleExport('csv')}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.overview.total_requests.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.overview.success_rate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(dashboard.overview.avg_response_time)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unique Users</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard.overview.unique_users}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Percentiles</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">P50 (Median)</span>
                <span className="font-semibold">{formatDuration(dashboard.performance_percentiles.p50)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">P95</span>
                <span className="font-semibold">{formatDuration(dashboard.performance_percentiles.p95)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">P99</span>
                <span className="font-semibold">{formatDuration(dashboard.performance_percentiles.p99)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Transfer</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Transferred</span>
                <span className="font-semibold">{formatBytes(dashboard.overview.total_data_transferred)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Failed Requests</span>
                <span className="font-semibold text-red-600">{dashboard.overview.failed_requests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Error Requests</span>
                <span className="font-semibold text-red-600">{dashboard.overview.error_requests}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Range</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Fastest</span>
                <span className="font-semibold text-green-600">{formatDuration(dashboard.overview.min_response_time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average</span>
                <span className="font-semibold">{formatDuration(dashboard.overview.avg_response_time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Slowest</span>
                <span className="font-semibold text-red-600">{formatDuration(dashboard.overview.max_response_time)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Endpoints and Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Endpoints */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Endpoints</h3>
            <div className="space-y-3">
              {dashboard.top_endpoints.slice(0, 10).map((endpoint, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getMethodColor(endpoint.method) === '#3b82f6' ? 'bg-blue-100 text-blue-800' : 
                        getMethodColor(endpoint.method) === '#10b981' ? 'bg-green-100 text-green-800' :
                        getMethodColor(endpoint.method) === '#f59e0b' ? 'bg-yellow-100 text-yellow-800' :
                        getMethodColor(endpoint.method) === '#ef4444' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'}`}>
                        {endpoint.method}
                      </span>
                      <span className="text-sm font-medium text-gray-900 truncate" title={endpoint.endpoint}>
                        {endpoint.endpoint}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>{endpoint.request_count} requests</span>
                      <span>{formatDuration(endpoint.avg_response_time)} avg</span>
                      <span className={endpoint.error_rate > 5 ? 'text-red-600' : 'text-gray-500'}>
                        {endpoint.error_rate.toFixed(1)}% error
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Users */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Users</h3>
            <div className="space-y-3">
              {dashboard.top_users.slice(0, 10).map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 font-mono">
                        {user.user_id.substring(0, 8)}...
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>{user.request_count} requests</span>
                      <span>{formatDuration(user.avg_response_time)} avg</span>
                      <span className={user.error_count > 0 ? 'text-red-600' : 'text-gray-500'}>
                        {user.error_count} errors
                      </span>
                    </div>
                    {user.last_request && (
                      <div className="text-xs text-gray-400 mt-1">
                        Last: {format(new Date(user.last_request), 'MMM dd, HH:mm')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Errors */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Errors</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboard.recent_errors.slice(0, 20).map((error) => (
                  <tr key={error.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(error.created_at), 'MMM dd, HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        getMethodColor(error.method) === '#3b82f6' ? 'bg-blue-100 text-blue-800' : 
                        getMethodColor(error.method) === '#10b981' ? 'bg-green-100 text-green-800' :
                        getMethodColor(error.method) === '#f59e0b' ? 'bg-yellow-100 text-yellow-800' :
                        getMethodColor(error.method) === '#ef4444' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {error.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={error.endpoint}>
                      {error.endpoint}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        error.status_code >= 500 ? 'bg-red-100 text-red-800' :
                        error.status_code >= 400 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {error.status_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(error.response_time_ms)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {error.user_id ? (
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {error.user_id.substring(0, 8)}...
                        </span>
                      ) : (
                        <span className="text-gray-400">Anonymous</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="text-red-600 text-xs" title={error.error_message}>
                        {error.error_message.length > 50 
                          ? `${error.error_message.substring(0, 50)}...`
                          : error.error_message
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage; 