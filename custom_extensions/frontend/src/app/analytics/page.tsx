"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import { 
  Download, RefreshCw, TrendingUp, AlertTriangle, Clock, Users, Activity, Filter, X, Calendar, Search
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

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
    ai_parser_requests: number;
    avg_ai_parser_tokens: number;
    max_ai_parser_tokens: number;
    min_ai_parser_tokens: number;
    total_ai_parser_tokens: number;
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
  const { t } = useLanguage();
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });
  const [filters, setFilters] = useState({
    endpoint: '',
    method: '',
    statusCode: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    endpoint: '',
    method: '',
    statusCode: ''
  });
  const [isFiltering, setIsFiltering] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Debounced filter application
  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setAppliedFilters(filters);
      setIsFiltering(false);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [filters]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const devUserId = "dummy-onyx-user-id-for-testing";
      if (devUserId && process.env.NODE_ENV === 'development') {
        headers['X-Dev-Onyx-User-ID'] = devUserId;
      }

      const params = new URLSearchParams();
      if (dateRange.from) params.append('date_from', dateRange.from);
      if (dateRange.to) params.append('date_to', dateRange.to);
      if (appliedFilters.endpoint) params.append('endpoint', appliedFilters.endpoint);
      if (appliedFilters.method) params.append('method', appliedFilters.method);
      if (appliedFilters.statusCode) params.append('status_code', appliedFilters.statusCode);

      const response = await fetch(`${CUSTOM_BACKEND_URL}/analytics/dashboard?${params}`, {
        headers,
        cache: 'no-store',
        credentials: 'same-origin'
      });
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
  }, [dateRange, appliedFilters, refreshKey]);

  const handleExport = async (exportFormat: 'csv' | 'json') => {
    try {
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const devUserId = "dummy-onyx-user-id-for-testing";
      if (devUserId && process.env.NODE_ENV === 'development') {
        headers['X-Dev-Onyx-User-ID'] = devUserId;
      }

      const params = new URLSearchParams();
      if (dateRange.from) params.append('date_from', dateRange.from);
      if (dateRange.to) params.append('date_to', dateRange.to);
      if (appliedFilters.endpoint) params.append('endpoint', appliedFilters.endpoint);
      if (appliedFilters.method) params.append('method', appliedFilters.method);
      if (appliedFilters.statusCode) params.append('status_code', appliedFilters.statusCode);
      params.append('format', exportFormat);

      const response = await fetch(`${CUSTOM_BACKEND_URL}/analytics/export?${params}`, {
        headers,
        cache: 'no-store',
        credentials: 'same-origin'
      });
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

  const clearAllFilters = useCallback(() => {
    setFilters({ endpoint: '', method: '', statusCode: '' });
    setAppliedFilters({ endpoint: '', method: '', statusCode: '' });
  }, []);

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
          <p className="text-gray-600">{t('interface.analytics.loadingData', 'Loading analytics data...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{t('interface.analytics.errorLoading', 'Error loading analytics')}</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('interface.analytics.retry', 'Retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">{t('interface.analytics.noDataAvailable', 'No analytics data available')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title Section */}
          <div className="py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('interface.analytics.title', 'Request Analytics Dashboard')}</h1>
                <p className="text-gray-600 mt-1">{t('interface.analytics.subtitle', 'Comprehensive tracking of all API requests across all accounts')}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setRefreshKey(prev => prev + 1)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title={t('interface.analytics.refreshData', 'Refresh data')}
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleExport('csv')}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('interface.analytics.exportCsv', 'Export CSV')}</span>
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('interface.analytics.exportJson', 'Export JSON')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(appliedFilters.endpoint || appliedFilters.method || appliedFilters.statusCode) && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {t('interface.analytics.activeFilters', 'Active Filters:')}
                      {isFiltering && (
                        <span className="ml-2 inline-flex items-center">
                          <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                        </span>
                      )}
                    </span>
                    {appliedFilters.endpoint && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {t('interface.analytics.endpoint', 'Endpoint')}: {appliedFilters.endpoint}
                      </span>
                    )}
                    {appliedFilters.method && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {t('interface.analytics.method', 'Method')}: {appliedFilters.method}
                      </span>
                    )}
                    {appliedFilters.statusCode && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {t('interface.analytics.status', 'Status')}: {appliedFilters.statusCode}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={clearAllFilters}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    title={t('interface.analytics.clearAllFilters', 'Clear all filters')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Filters Section */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <Filter className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-medium text-gray-700">{t('interface.analytics.filters', 'Filters')}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Date Range */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('interface.analytics.dateRange', 'Date Range')}</label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <span className="text-gray-500 text-sm">{t('interface.analytics.to', 'to')}</span>
                    <div className="relative flex-1">
                      <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Endpoint Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('interface.analytics.endpoint', 'Endpoint')}</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('interface.analytics.filterEndpoint', 'Filter endpoint...')}
                      value={filters.endpoint}
                      onChange={(e) => setFilters(prev => ({ ...prev, endpoint: e.target.value }))}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Method Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('interface.analytics.httpMethod', 'HTTP Method')}</label>
                  <select
                    value={filters.method}
                    onChange={(e) => setFilters(prev => ({ ...prev, method: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">{t('interface.analytics.allMethods', 'All Methods')}</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>

                {/* Status Code Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('interface.analytics.statusCode', 'Status Code')}</label>
                  <input
                    type="number"
                    placeholder={t('interface.analytics.statusCodePlaceholder', 'e.g., 200, 404')}
                    value={filters.statusCode}
                    onChange={(e) => setFilters(prev => ({ ...prev, statusCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-black">{t('interface.analytics.totalRequests', 'Total Requests')}</p>
                <p className="text-2xl font-bold text-black">{dashboard.overview.total_requests.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-black">{t('interface.analytics.successRate', 'Success Rate')}</p>
                <p className="text-2xl font-bold text-black">{dashboard.overview.success_rate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-black">{t('interface.analytics.avgResponseTime', 'Avg Response Time')}</p>
                <p className="text-2xl font-bold text-black">{formatDuration(dashboard.overview.avg_response_time)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('interface.analytics.performancePercentiles', 'Performance Percentiles')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-black">{t('interface.analytics.p50Median', 'P50 (Median)')}</span>
                <span className="font-semibold text-gray-900">{formatDuration(dashboard.performance_percentiles.p50)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">{t('interface.analytics.p95', 'P95')}</span>
                <span className="font-semibold text-gray-900">{formatDuration(dashboard.performance_percentiles.p95)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">{t('interface.analytics.p99', 'P99')}</span>
                <span className="font-semibold text-gray-900">{formatDuration(dashboard.performance_percentiles.p99)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('interface.analytics.dataTransfer', 'Data Transfer')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-black">{t('interface.analytics.totalTransferred', 'Total Transferred')}</span>
                <span className="font-semibold text-gray-900">{formatBytes(dashboard.overview.total_data_transferred)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">{t('interface.analytics.failedRequests', 'Failed Requests')}</span>
                <span className="font-semibold text-red-600">{dashboard.overview.failed_requests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">{t('interface.analytics.errorRequests', 'Error Requests')}</span>
                <span className="font-semibold text-red-600">{dashboard.overview.error_requests}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('interface.analytics.responseTimeRange', 'Response Time Range')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-black">{t('interface.analytics.fastest', 'Fastest')}</span>
                <span className="font-semibold text-green-600">{formatDuration(dashboard.overview.min_response_time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">{t('interface.analytics.average', 'Average')}</span>
                <span className="font-semibold text-gray-900">{formatDuration(dashboard.overview.avg_response_time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">{t('interface.analytics.slowest', 'Slowest')}</span>
                <span className="font-semibold text-red-600">{formatDuration(dashboard.overview.max_response_time)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('interface.analytics.aiModelUsage', 'AI Model Usage')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-black">{t('interface.analytics.totalAiRequests', 'Total Requests')}</span>
                <span className="font-semibold text-purple-600">{(dashboard.overview.ai_parser_requests || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">{t('interface.analytics.avgTokens', 'Avg Tokens')}</span>
                <span className="font-semibold text-gray-900">{(dashboard.overview.avg_ai_parser_tokens || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">{t('interface.analytics.totalTokens', 'Total Tokens')}</span>
                <span className="font-semibold text-gray-900">{(dashboard.overview.total_ai_parser_tokens || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">{t('interface.analytics.tokenRange', 'Token Range')}</span>
                <span className="font-semibold text-gray-900">{(dashboard.overview.min_ai_parser_tokens || 0).toLocaleString()} - {(dashboard.overview.max_ai_parser_tokens || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Endpoints */}
        <div className="mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('interface.analytics.topEndpoints', 'Top Endpoints')}</h3>
            <div className="space-y-3">
              {(dashboard.top_endpoints || []).slice(0, 3).map((endpoint, index) => (
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
                    <div className="flex items-center space-x-4 mt-1 text-xs text-black">
                      <span>{endpoint.request_count} {t('interface.analytics.requests', 'requests')}</span>
                      <span>{formatDuration(endpoint.avg_response_time)} {t('interface.analytics.avg', 'avg')}</span>
                      <span className={endpoint.error_rate > 5 ? 'text-red-600' : 'text-black'}>
                        {endpoint.error_rate.toFixed(1)}% {t('interface.analytics.error', 'error')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Errors */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('interface.analytics.recentErrors', 'Recent Errors')}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('interface.analytics.time', 'Time')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('interface.analytics.method', 'Method')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('interface.analytics.endpoint', 'Endpoint')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('interface.analytics.status', 'Status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('interface.analytics.responseTime', 'Response Time')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('interface.analytics.user', 'User')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('interface.analytics.errorMessage', 'Error')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(dashboard.recent_errors || []).slice(0, 20).map((error) => (
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
                        <span className="text-gray-400">{t('interface.analytics.anonymous', 'Anonymous')}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="text-red-600 text-xs" title={error.error_message || t('interface.analytics.noErrorMessage', 'No error message')}>
                        {error.error_message && error.error_message.length > 50 
                          ? `${error.error_message.substring(0, 50)}...`
                          : error.error_message || t('interface.analytics.noErrorMessage', 'No error message')
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