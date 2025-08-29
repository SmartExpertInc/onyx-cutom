"use client";

import React, { useState, useEffect } from 'react';

interface AnalyticsData {
  totalUsers: number;
  totalCreditsUsed: number;
  totalCreditsPurchased: number;
  usageByProduct: Array<{
    product_type: string;
    credits_used: number;
  }>;
  userActivity: Array<{
    date: string;
    active_users: number;
    credits_used: number;
  }>;
}

const AnalyticsTab: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${CUSTOM_BACKEND_URL}/admin/credits/usage-analytics`, {
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }

      const data = await response.json();
      setAnalyticsData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <p className="text-gray-600">Overview of system usage and user activity</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total Credits Used</h3>
          <p className="text-3xl font-bold text-blue-600">{analyticsData.totalCreditsUsed.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total Credits Purchased</h3>
          <p className="text-3xl font-bold text-green-600">{analyticsData.totalCreditsPurchased.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
          <p className="text-3xl font-bold text-purple-600">{analyticsData.totalUsers.toLocaleString()}</p>
        </div>
      </div>

      {/* Usage by Product Type */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage by Product Type</h3>
        <div className="space-y-2">
          {analyticsData.usageByProduct.map((product, index) => (
            <div key={product.product_type} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="font-medium">{product.product_type}</span>
              <span className="text-blue-600 font-semibold">{product.credits_used.toLocaleString()} credits</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab; 