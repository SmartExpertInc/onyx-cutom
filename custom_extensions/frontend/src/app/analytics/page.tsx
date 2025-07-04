"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Activity,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Zap,
  Target,
  BarChart,
  PieChart,
  LineChart
} from "lucide-react";

interface RequestData {
  id: string;
  userId: string;
  userName: string;
  endpoint: string;
  status: 'completed' | 'in_progress' | 'error' | 'timeout';
  startTime: string;
  endTime?: string;
  duration?: number;
  attempts: number;
  errorMessage?: string;
  requestType: 'preview' | 'finalize' | 'edit' | 'other';
  projectType: string;
  userTier: string;
}

interface AnalyticsData {
  totalRequests: number;
  completedRequests: number;
  failedRequests: number;
  inProgressRequests: number;
  averageCompletionTime: number;
  successRate: number;
  topEndpoints: Array<{ endpoint: string; count: number; avgTime: number }>;
  userActivity: Array<{ userId: string; userName: string; requestCount: number; avgTime: number }>;
  hourlyDistribution: Array<{ hour: number; count: number }>;
  dailyTrends: Array<{ date: string; count: number; avgTime: number }>;
  errorBreakdown: Array<{ error: string; count: number }>;
  performanceMetrics: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<RequestData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch data from backend APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch analytics metrics
        const metricsResponse = await fetch(`/api/custom/analytics/metrics?time_range=${timeRange}`, {
          credentials: 'include'
        });
        
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
          setAnalytics(metricsData);
        } else {
          console.error('Failed to fetch analytics metrics');
        }
        
        // Fetch requests data
        const requestsResponse = await fetch(`/api/custom/analytics/requests?time_range=${timeRange}&limit=100`, {
          credentials: 'include'
        });
        
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          setData(requestsData.requests || []);
        } else {
          console.error('Failed to fetch requests data');
        }
        
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(async () => {
      try {
        // Fetch analytics metrics
        const metricsResponse = await fetch(`/api/custom/analytics/metrics?time_range=${timeRange}`, {
          credentials: 'include'
        });
        
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
          setAnalytics(metricsData);
        }
        
        // Fetch requests data
        const requestsResponse = await fetch(`/api/custom/analytics/requests?time_range=${timeRange}&limit=100`, {
          credentials: 'include'
        });
        
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          setData(requestsData.requests || []);
        }
      } catch (error) {
        console.error('Error auto-refreshing analytics data:', error);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, timeRange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'timeout': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'in_progress': return <Clock size={16} />;
      case 'error': return <XCircle size={16} />;
      case 'timeout': return <AlertCircle size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const filteredData = data.filter(request => {
    if (filterStatus !== 'all' && request.status !== filterStatus) return false;
    if (filterType !== 'all' && request.requestType !== filterType) return false;
    if (searchTerm && !request.userName.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !request.endpoint.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="animate-spin" size={24} />
          <span className="text-lg font-medium">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-indigo-600" size={24} />
              <h1 className="text-2xl font-bold text-gray-900">Request Analytics Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </button>
              <button 
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/custom/analytics/export?time_range=${timeRange}&format=csv`, {
                      credentials: 'include'
                    });
                    
                    if (response.ok) {
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `analytics_export_${timeRange}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    } else {
                      console.error('Failed to export analytics data');
                    }
                  } catch (error) {
                    console.error('Error exporting analytics data:', error);
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="error">Error</option>
              <option value="timeout">Timeout</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="preview">Preview</option>
              <option value="finalize">Finalize</option>
              <option value="edit">Edit</option>
              <option value="other">Other</option>
            </select>
            
            <input
              type="text"
              placeholder="Search by user or endpoint..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[250px]"
            />
          </div>
        </div>

        {analytics && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.totalRequests.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Activity className="text-blue-600" size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <TrendingUp className="text-green-500" size={16} />
                  <span className="text-sm text-green-600">+12.5% from yesterday</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.successRate}%</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Target className="text-green-600" size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="text-sm text-green-600">{analytics.completedRequests} successful</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-3xl font-bold text-gray-900">{formatDuration(analytics.averageCompletionTime)}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Zap className="text-purple-600" size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Clock className="text-purple-500" size={16} />
                  <span className="text-sm text-purple-600">P95: {formatDuration(analytics.performanceMetrics.p95)}</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-3xl font-bold text-gray-900">{analytics.userActivity.length}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Users className="text-orange-600" size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Users className="text-orange-500" size={16} />
                  <span className="text-sm text-orange-600">+3 new today</span>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Performance Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Distribution</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">P50 (Median)</span>
                    <span className="font-medium">{formatDuration(analytics.performanceMetrics.p50)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">P90</span>
                    <span className="font-medium">{formatDuration(analytics.performanceMetrics.p90)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">P95</span>
                    <span className="font-medium">{formatDuration(analytics.performanceMetrics.p95)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">P99</span>
                    <span className="font-medium">{formatDuration(analytics.performanceMetrics.p99)}</span>
                  </div>
                </div>
              </div>

              {/* Top Endpoints */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Endpoints</h3>
                <div className="space-y-3">
                  {analytics.topEndpoints.map((endpoint, index) => (
                    <div key={endpoint.endpoint} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className="text-sm text-gray-900 truncate max-w-[200px]">
                          {endpoint.endpoint.split('/').pop()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{endpoint.count} requests</span>
                        <span className="text-sm font-medium">{formatDuration(Math.round(endpoint.avgTime))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analytics.errorBreakdown.map((error) => (
                  <div key={error.error} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{error.error}</span>
                    <span className="text-lg font-bold text-red-600">{error.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Requests Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Requests</h3>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredData.length} of {data.length} requests
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endpoint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attempts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.slice(0, 50).map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {request.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-indigo-600">
                              {request.userName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                          <div className="text-sm text-gray-500">{request.userTier}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.endpoint.split('/').pop()}</div>
                      <div className="text-sm text-gray-500">{request.projectType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.duration ? formatDuration(request.duration) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.attempts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.startTime).toLocaleString()}
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
} 