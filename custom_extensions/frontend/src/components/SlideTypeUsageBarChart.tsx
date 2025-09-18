"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { ResponsiveBar, BarTooltipProps } from '@nivo/bar';


interface ProductUsage {
  product_id: string;
  total_generated: number;
}

interface SlidesAnalyticsResponse {
  usage_by_product: ProductUsage[];
}

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

const SlideTypeUsageBarChart: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [allUsersData, setAllUsersData] = useState<SlidesAnalyticsResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchAllUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${CUSTOM_BACKEND_URL}/admin/slides-analytics`, {
          credentials: 'same-origin',
        });
        if (!res.ok) throw new Error(`Failed analytics: ${res.status}`);
        const data: SlidesAnalyticsResponse = await res.json();
        if (!cancelled) setAllUsersData(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load analytics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  // Prepare bar chart data
  const nivoData = useMemo(() => {
    if (allUsersData) {
      return (allUsersData.usage_by_product || []).map(item => ({
        product: item.product_id, // this becomes the "index"
        amount: item.total_generated, // this becomes the "bar value"
      }));
    }

    return [];
  }, [allUsersData]);

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6 h-[480px]">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Slides generation across all users</h3>
      <div className="h-80">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-red-600">{error}</div>
        ) : (
          <ResponsiveBar
            data={nivoData}
            keys={["amount"]}
            indexBy="product"
            margin={{ top: 40, right: 40, bottom: 60, left: 60 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            colors={{ scheme: "nivo" }}
            borderColor={{
              from: "color",
              modifiers: [["darker", 1.6]],
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickRotation: -30,
              legend: "Product",
              legendPosition: "middle",
              legendOffset: 40,
            }}
            axisLeft={{
              legend: "Amount generated",
              legendPosition: "middle",
              legendOffset: -50,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{
              from: "color",
              modifiers: [["darker", 1.6]],
            }}
            tooltip={({ id, value, indexValue }: BarTooltipProps<any>) => (
              <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                <div className="font-semibold text-gray-900">{indexValue}</div>
                <div className="text-gray-600">
                  {Number(value).toLocaleString()} credits
                </div>
              </div>
            )}
            role="application"
            ariaLabel="Bar chart showing slide usage"
          />
        )}
      </div>
    </div>
  );
};

export default SlideTypeUsageBarChart;
