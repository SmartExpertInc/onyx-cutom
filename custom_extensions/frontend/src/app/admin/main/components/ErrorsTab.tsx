"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { format, subHours } from 'date-fns';
import { 
  RefreshCw, AlertTriangle, Filter, X, Calendar, Search, Download, 
  ChevronDown, ChevronUp, Copy, Eye, EyeOff, Clock, User, FileText, 
  AlertCircle, Info, XCircle, ArrowRight, Settings
} from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';

interface LogEntry {
  timestamp: string;
  level?: string;
  user_id?: string;
  endpoint?: string;
  request_id?: string;
  event?: string;
  error?: string;
  trace?: string;
  module?: string;
  message?: string;
  additional_context?: any;
  labels?: {
    container?: string;
    job?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface LogsResponse {
  logs: LogEntry[];
  total: number;
  query: string;
  start_time: string;
  end_time: string;
}

const ErrorsTab: React.FC = () => {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
  const [selectedLog, setSelectedLog] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    user_id: '',
    endpoint: '',
    level: '',
    event: '',
    hours: '1'
  });
  const [appliedFilters, setAppliedFilters] = useState({
    user_id: '',
    endpoint: '',
    level: '',
    event: '',
    hours: '1'
  });
  const [isFiltering, setIsFiltering] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [limit, setLimit] = useState(100);
  const [contextModalOpen, setContextModalOpen] = useState(false);
  const [contextLogs, setContextLogs] = useState<LogEntry[]>([]);
  const [contextLoading, setContextLoading] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);
  const [contextMinutesBefore, setContextMinutesBefore] = useState(5);
  const [contextMinutesAfter, setContextMinutesAfter] = useState(5);
  const [selectedErrorLog, setSelectedErrorLog] = useState<LogEntry | null>(null);

  // Debounced filter application
  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setAppliedFilters(filters);
      setIsFiltering(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
      const params = new URLSearchParams();
      if (appliedFilters.user_id) params.append('user_id', appliedFilters.user_id);
      if (appliedFilters.endpoint) params.append('endpoint', appliedFilters.endpoint);
      if (appliedFilters.level) params.append('level', appliedFilters.level);
      if (appliedFilters.event) params.append('event', appliedFilters.event);
      params.append('hours', appliedFilters.hours);
      params.append('limit', limit.toString());

      const response = await fetch(`${CUSTOM_BACKEND_URL}/admin/analytics/logs?${params}`, {
        cache: 'no-store',
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status}`);
      }

      const data: LogsResponse = await response.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [appliedFilters, refreshKey, limit]);

  const toggleLogExpansion = (index: number) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const getLevelColor = (level?: string) => {
    if (!level) return 'bg-gray-100 text-gray-800';
    const levelLower = level.toLowerCase();
    if (levelLower === 'error' || levelLower === 'critical') return 'bg-red-100 text-red-800';
    if (levelLower === 'warning') return 'bg-yellow-100 text-yellow-800';
    if (levelLower === 'info') return 'bg-blue-100 text-blue-800';
    if (levelLower === 'debug') return 'bg-gray-100 text-gray-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getLevelIcon = (level?: string) => {
    if (!level) return <Info className="w-4 h-4" />;
    const levelLower = level.toLowerCase();
    if (levelLower === 'error' || levelLower === 'critical') return <XCircle className="w-4 h-4" />;
    if (levelLower === 'warning') return <AlertTriangle className="w-4 h-4" />;
    if (levelLower === 'info') return <Info className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
    } catch {
      return timestamp;
    }
  };

  const clearAllFilters = useCallback(() => {
    setFilters({ user_id: '', endpoint: '', level: '', event: '', hours: '1' });
    setAppliedFilters({ user_id: '', endpoint: '', level: '', event: '', hours: '1' });
  }, []);

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const fetchContextLogs = async (errorLog: LogEntry) => {
    setContextLoading(true);
    setContextError(null);
    setSelectedErrorLog(errorLog);
    setContextModalOpen(true);
    
    try {
      const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';
      const params = new URLSearchParams();
      params.append('timestamp', errorLog.timestamp);
      params.append('minutes_before', contextMinutesBefore.toString());
      params.append('minutes_after', contextMinutesAfter.toString());
      params.append('limit', '5000');

      const response = await fetch(`${CUSTOM_BACKEND_URL}/admin/analytics/logs/around?${params}`, {
        cache: 'no-store',
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch context logs: ${response.status}`);
      }

      const data: LogsResponse = await response.json();
      setContextLogs(data.logs || []);
    } catch (err) {
      console.error('Error fetching context logs:', err);
      setContextError(err instanceof Error ? err.message : 'An error occurred while fetching context logs');
    } finally {
      setContextLoading(false);
    }
  };

  const handleJumpToError = (log: LogEntry) => {
    fetchContextLogs(log);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">{t('interface.logs.loadingData', 'Loading logs...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{t('interface.logs.errorLoading', 'Error loading logs')}</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('interface.logs.retry', 'Retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">System Logs & Errors</h2>
          <p className="text-gray-600 mt-1">View and filter structured logs from Loki</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title={t('interface.logs.refreshData', 'Refresh data')}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={exportLogs}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{t('interface.logs.exportJson', 'Export JSON')}</span>
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(appliedFilters.user_id || appliedFilters.endpoint || appliedFilters.level || appliedFilters.event) && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-wrap">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {t('interface.logs.activeFilters', 'Active Filters:')}
                {isFiltering && (
                  <span className="ml-2 inline-flex items-center">
                    <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                  </span>
                )}
              </span>
              {appliedFilters.user_id && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {t('interface.logs.userId', 'User ID')}: {appliedFilters.user_id}
                </span>
              )}
              {appliedFilters.endpoint && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {t('interface.logs.endpoint', 'Endpoint')}: {appliedFilters.endpoint}
                </span>
              )}
              {appliedFilters.level && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {t('interface.logs.level', 'Level')}: {appliedFilters.level}
                </span>
              )}
              {appliedFilters.event && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {t('interface.logs.event', 'Event')}: {appliedFilters.event}
                </span>
              )}
            </div>
            <button
              onClick={clearAllFilters}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title={t('interface.logs.clearAllFilters', 'Clear all filters')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-700">{t('interface.logs.filters', 'Filters')}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* User ID Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <User className="w-3 h-3 inline mr-1" />
              {t('interface.logs.userId', 'User ID')}
            </label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('interface.logs.filterUserId', 'Filter by user ID...')}
                value={filters.user_id}
                onChange={(e) => setFilters(prev => ({ ...prev, user_id: e.target.value }))}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Endpoint Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <FileText className="w-3 h-3 inline mr-1" />
              {t('interface.logs.endpoint', 'Endpoint')}
            </label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('interface.logs.filterEndpoint', 'Filter endpoint...')}
                value={filters.endpoint}
                onChange={(e) => setFilters(prev => ({ ...prev, endpoint: e.target.value }))}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Level Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('interface.logs.level', 'Level')}
            </label>
            <select
              value={filters.level}
              onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">{t('interface.logs.allLevels', 'All Levels')}</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Event Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('interface.logs.event', 'Event')}
            </label>
            <input
              type="text"
              placeholder={t('interface.logs.filterEvent', 'Filter event...')}
              value={filters.event}
              onChange={(e) => setFilters(prev => ({ ...prev, event: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Time Range Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <Clock className="w-3 h-3 inline mr-1" />
              {t('interface.logs.timeRange', 'Time Range')}
            </label>
            <select
              value={filters.hours}
              onChange={(e) => setFilters(prev => ({ ...prev, hours: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="1">Last 1 hour</option>
              <option value="6">Last 6 hours</option>
              <option value="24">Last 24 hours</option>
              <option value="168">Last 7 days</option>
            </select>
          </div>
        </div>

        {/* Limit Selector */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('interface.logs.maxResults', 'Max Results')}
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={500}>500</option>
            <option value={1000}>1000</option>
          </select>
        </div>
      </div>

      {/* Logs Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {logs.length} {logs.length === 1 ? 'log entry' : 'log entries'}
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">{t('interface.logs.noLogsFound', 'No logs found matching the current filters')}</p>
          </div>
        ) : (
          logs.map((log, index) => {
            const isExpanded = expandedLogs.has(index);
            const hasError = log.error || log.trace;
            const logJson = JSON.stringify(log, null, 2);

            return (
              <div
                key={index}
                className={`bg-white border rounded-lg shadow-sm transition-all ${
                  hasError ? 'border-red-200 bg-red-50' : 'border-gray-200'
                }`}
              >
                {/* Log Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleLogExpansion(index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {getLevelIcon(log.level)}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getLevelColor(log.level)}`}>
                          {log.level?.toUpperCase() || 'UNKNOWN'}
                        </span>
                        {log.event && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {log.event}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      
                      {log.message && (
                        <p className="text-sm text-gray-900 mb-2 font-medium">{log.message}</p>
                      )}
                      
                      {log.error && (
                        <p className="text-sm text-red-700 mb-2 font-medium">{log.error}</p>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-gray-600 flex-wrap gap-2">
                        {log.user_id && (
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            <span className="font-mono">{log.user_id.substring(0, 12)}...</span>
                          </span>
                        )}
                        {log.endpoint && (
                          <span className="flex items-center">
                            <FileText className="w-3 h-3 mr-1" />
                            <span className="truncate max-w-xs" title={log.endpoint}>{log.endpoint}</span>
                          </span>
                        )}
                        {log.module && (
                          <span className="text-gray-500">{log.module}</span>
                        )}
                        {log.request_id && (
                          <span className="font-mono text-gray-500">ID: {log.request_id.substring(0, 8)}...</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(logJson);
                        }}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        title="Copy JSON"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {(log.level?.toLowerCase() === 'error' || log.level?.toLowerCase() === 'critical' || log.error) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJumpToError(log);
                          }}
                          className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="Jump to error context"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded JSON View */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-700">Full Log Entry (JSON)</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(logJson);
                        }}
                        className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-96 overflow-y-auto">
                      {logJson}
                    </pre>
                    
                    {/* Stack Trace if available */}
                    {log.trace && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Stack Trace</h4>
                        <pre className="bg-red-50 border border-red-200 text-red-900 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-64 overflow-y-auto whitespace-pre-wrap">
                          {log.trace}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Context Modal */}
      {contextModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Error Context Logs</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Logs around error timestamp: {selectedErrorLog && formatTimestamp(selectedErrorLog.timestamp)}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Time Range Configuration */}
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-gray-600">Before:</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={contextMinutesBefore}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 5;
                        setContextMinutesBefore(val);
                        if (selectedErrorLog) {
                          fetchContextLogs(selectedErrorLog);
                        }
                      }}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    <label className="text-xs text-gray-600">min</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-gray-600">After:</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={contextMinutesAfter}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 5;
                        setContextMinutesAfter(val);
                        if (selectedErrorLog) {
                          fetchContextLogs(selectedErrorLog);
                        }
                      }}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    <label className="text-xs text-gray-600">min</label>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setContextModalOpen(false);
                    setContextLogs([]);
                    setSelectedErrorLog(null);
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {contextLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Loading context logs...</p>
                </div>
              ) : contextError ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
                  <p className="text-red-600 mb-4">Error loading context logs</p>
                  <p className="text-gray-600 text-sm">{contextError}</p>
                </div>
              ) : contextLogs.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No logs found in the specified time range</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contextLogs.map((log, index) => {
                    const isErrorLog = log.timestamp === selectedErrorLog?.timestamp;
                    const hasError = log.error || log.trace;
                    const logJson = JSON.stringify(log, null, 2);

                    return (
                      <div
                        key={index}
                        className={`bg-white border rounded-lg shadow-sm transition-all ${
                          isErrorLog
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : hasError
                            ? 'border-red-200 bg-red-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                {getLevelIcon(log.level)}
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getLevelColor(log.level)}`}>
                                  {log.level?.toUpperCase() || 'UNKNOWN'}
                                </span>
                                {isErrorLog && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    TARGET ERROR
                                  </span>
                                )}
                                {log.event && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    {log.event}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatTimestamp(log.timestamp)}
                                </span>
                              </div>
                              
                              {log.message && (
                                <p className="text-sm text-gray-900 mb-2 font-medium">{log.message}</p>
                              )}
                              
                              {log.error && (
                                <p className="text-sm text-red-700 mb-2 font-medium">{log.error}</p>
                              )}

                              <div className="flex items-center space-x-4 text-xs text-gray-600 flex-wrap gap-2">
                                {log.user_id && (
                                  <span className="flex items-center">
                                    <User className="w-3 h-3 mr-1" />
                                    <span className="font-mono">{log.user_id.substring(0, 12)}...</span>
                                  </span>
                                )}
                                {log.endpoint && (
                                  <span className="flex items-center">
                                    <FileText className="w-3 h-3 mr-1" />
                                    <span className="truncate max-w-xs" title={log.endpoint}>{log.endpoint}</span>
                                  </span>
                                )}
                                {log.module && (
                                  <span className="text-gray-500">{log.module}</span>
                                )}
                              </div>
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(logJson);
                              }}
                              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors ml-4"
                              title="Copy JSON"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing {contextLogs.length} log entries around the error
              </div>
              <button
                onClick={() => {
                  setContextModalOpen(false);
                  setContextLogs([]);
                  setSelectedErrorLog(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorsTab;

