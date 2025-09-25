"use client";

import React, { useMemo } from 'react';
import { ResponsiveBar, BarTooltipProps } from '@nivo/bar';


interface SlideTypeUsageBarChartProps {
  template_ids: string[];
  usage_by_template: Array<{
    template_id: string;
    total_generated: number;
  }>;
  loading?: boolean;
  error?: string | null;
}

const SlideTypeUsageBarChart: React.FC<SlideTypeUsageBarChartProps> = ({ template_ids, usage_by_template, loading = false, error = null }) => {
  // Prepare bar chart data
  const nivoData = useMemo(() => {
    if (usage_by_template) {
      // Debug: log raw response
      console.debug('Raw usage_by_template:', usage_by_template);

      const grouped: Record<string, number> = {};
      for (const item of usage_by_template || []) {
        if (!item.template_id) continue;
        if (template_ids.length > 0 && !template_ids.includes(item.template_id)) continue;
        grouped[item.template_id] = (grouped[item.template_id] || 0) + (item.total_generated || 0);
      }
      const result = Object.entries(grouped)
        .map(([template, amount]) => ({ template, amount }))
        .sort((a, b) => b.amount - a.amount);

      // Debug: log processed data
      console.debug('Bar chart data:', result);
      return result;
    }
    return [];
  }, [usage_by_template, template_ids]);

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
            indexBy="template"
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
              legend: "Template name",
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
                  {Number(value).toLocaleString()} slides generated
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
