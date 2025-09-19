"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import { 
  Download, RefreshCw, TrendingUp, AlertTriangle, Clock, Users, Activity, Filter, X, Calendar, Search
} from 'lucide-react';
import SlideTypeUsageBarChart from '../../../../components/SlideTypeUsageBarChart';
import { useLanguage } from '../../../../contexts/LanguageContext';


interface AnalyticsDashboard {
  recent_errors: Array<{
    id: string;
    slide_type: string;
    props: string;
    error_message: string;
    user_email: string;
    user_id: string;
    created_at: string;
  }>;
}

const SlidesAnalyticsTab: React.FC = () => {
  const { t } = useLanguage();
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });
  const [filters, setFilters] = useState({
    endpoint: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    endpoint: ''
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

  /*
  useEffect(() => {
    fetchDashboard();
  }, [dateRange, appliedFilters, refreshKey]);
  */

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
    setFilters({ endpoint: ''});
    setAppliedFilters({ endpoint: ''});
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">{t('interface.analytics.loadingData', 'Loading analytics data...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
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
      <div className="p-6">
        <p className="text-gray-600">{t('interface.analytics.noDataAvailable', 'No analytics data available')}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Slides Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Tracking of slides types creation across all accounts</p>
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
      {(appliedFilters.endpoint) && (
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
                  {t('interface.analytics.endpoint', 'Slide type')}: {appliedFilters.endpoint}
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
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
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

          {/* Type Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('interface.analytics.endpoint', 'Type')}</label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('interface.analytics.filterEndpoint', 'Filter slide type...')}
                value={filters.endpoint}
                onChange={(e) => setFilters(prev => ({ ...prev, endpoint: e.target.value }))}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex gap-6 mb-6">
        <div className="w-full">
          <SlideTypeUsageBarChart/>
        </div>
      </div>

      {/* Fallbacks */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('interface.analytics.recentErrors', 'Fallbacks')}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('interface.analytics.time', 'Time')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('interface.analytics.method', 'Slide type')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('interface.analytics.endpoint', 'Props')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('interface.analytics.user', 'User')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('interface.analytics.status', 'Error')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(dashboard.recent_errors || []).slice(0, 20).map((error) => (
                <tr key={error.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(error.created_at), 'MMM dd, HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={error.slide_type}>
                    {error.slide_type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={error.props}>
                    {error.props}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {error.user_email ? (
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {error.user_email.substring(0, 8)}...
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
  );
};

export default SlidesAnalyticsTab; 