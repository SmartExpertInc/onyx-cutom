"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { ResponsivePie } from '@nivo/pie';

interface UserCredits {
  id: number;
  onyx_user_id: string;
  name: string;
  credits_balance: number;
  total_credits_used: number;
  credits_purchased: number;
  last_purchase_date: string | null;
  subscription_tier: string;
  created_at: string;
  updated_at: string;
}

interface ProductUsage {
  product_type: string;
  credits_used: number;
}

interface CreditUsageAnalyticsResponse {
  usage_by_product: ProductUsage[];
  total_credits_used: number;
}

interface TimelineActivity {
  id: string;
  type: 'purchase' | 'product_generation';
  title: string;
  credits: number;
  timestamp: string;
  product_type?: string;
}

interface UserTransactionHistoryResponse {
  user_id: number;
  user_email: string;
  user_name: string;
  transactions: TimelineActivity[];
}

interface CreditUsagePieChartProps {
  selectedUser: UserCredits | null;
}

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

const CreditUsagePieChart: React.FC<CreditUsagePieChartProps> = ({ selectedUser }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [allUsersData, setAllUsersData] = useState<CreditUsageAnalyticsResponse | null>(null);
  const [userTx, setUserTx] = useState<TimelineActivity[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchAllUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${CUSTOM_BACKEND_URL}/admin/credits/usage-analytics`, {
          credentials: 'same-origin',
        });
        if (!res.ok) throw new Error(`Failed analytics: ${res.status}`);
        const data: CreditUsageAnalyticsResponse = await res.json();
        if (!cancelled) setAllUsersData(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load analytics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Only fetch all-users analytics when no user is selected
    if (!selectedUser) {
      fetchAllUsers();
      setUserTx(null);
    }

    return () => {
      cancelled = true;
    };
  }, [selectedUser]);

  useEffect(() => {
    let cancelled = false;
    const fetchUserTx = async (userId: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${CUSTOM_BACKEND_URL}/admin/credits/user/${encodeURIComponent(userId)}/transactions`, {
          credentials: 'same-origin',
        });
        if (!res.ok) throw new Error(`Failed transactions: ${res.status}`);
        const data: UserTransactionHistoryResponse = await res.json();
        if (!cancelled) setUserTx(data.transactions || []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load user activity');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (selectedUser) {
      fetchUserTx(selectedUser.onyx_user_id);
    }

    return () => {
      cancelled = true;
    };
  }, [selectedUser]);

  // Build chart data depending on context
  const nivoData = useMemo(() => {
    if (selectedUser && userTx) {
      const map = new Map<string, number>();
      for (const tx of userTx) {
        if (tx.type !== 'product_generation') continue;
        const key = tx.product_type || 'Unknown';
        map.set(key, (map.get(key) || 0) + (tx.credits || 0));
      }
      return Array.from(map.entries()).map(([label, value]) => ({ id: label, label, value }));
    }

    if (!selectedUser && allUsersData) {
      return (allUsersData.usage_by_product || []).map(item => ({
        id: item.product_type,
        label: item.product_type,
        value: item.credits_used,
      }));
    }

    return [];
  }, [selectedUser, userTx, allUsersData]);

  const totalCredits = useMemo(() => {
    return nivoData.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  }, [nivoData]);

  const chartTitle = selectedUser 
    ? `Credit Usage for ${selectedUser.name}`
    : 'Credit Usage by Product Type for All Users';

  const summaryText = selectedUser 
    ? `Total Credits Used by ${selectedUser.name}`
    : 'Total Credits Used';

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6 h-[480px]">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{chartTitle}</h3>
      <div className="h-80">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-red-600">{error}</div>
        ) : (
          <ResponsivePie
            data={nivoData}
            margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#333333"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: 'color' }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
            tooltip={({ datum }: { datum: any }) => (
              <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                <div className="font-semibold text-gray-900">{datum.label}</div>
                <div className="text-gray-600">{Number(datum.value).toLocaleString()} credits</div>
              </div>
            )}
          />
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 text-center">
        <div className="text-2xl font-bold text-gray-900">{totalCredits.toLocaleString()}</div>
        <div className="text-sm text-gray-600">{summaryText}</div>
      </div>
    </div>
  );
};

export default CreditUsagePieChart;
