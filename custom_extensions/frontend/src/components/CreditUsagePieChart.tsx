"use client";

import React from 'react';
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

// Product names for the chart
const PRODUCT_NAMES = [
  'Course Outline',
  'Video Lesson', 
  'Quiz',
  'Presentation',
  'One-Pager'
];

// Helper function to create product data
const createProductData = (credits: number[]) => 
  PRODUCT_NAMES.map((name, index) => ({
    name,
    credits: credits[index]
  }));

// Mock data for credit usage by product type (all users)
const mockCreditUsageData = createProductData([125, 210, 180, 320, 165]);

// Mock data for individual user credit usage
const mockUserCreditUsageData: Record<string, Array<{ name: string; credits: number }>> = {
  'user1@example.com': createProductData([25, 45, 30, 60, 35]),
  'user2@example.com': createProductData([15, 80, 50, 40, 25]),
  'user3@example.com': createProductData([35, 25, 40, 70, 30])
};

interface CreditUsagePieChartProps {
  selectedUser: UserCredits | null;
}

const CreditUsagePieChart: React.FC<CreditUsagePieChartProps> = ({ selectedUser }) => {
  // Use all users data when no user is selected, or individual user data when selected
  const chartData = selectedUser 
    ? (mockUserCreditUsageData[selectedUser.onyx_user_id] || mockCreditUsageData)
    : mockCreditUsageData;
  
  const totalCredits = chartData.reduce((sum: number, item: { credits: number }) => sum + item.credits, 0);
  
  // Transform data for Nivo
  const nivoData = chartData.map(item => ({
    id: item.name,
    label: item.name,
    value: item.credits
  }));

  const chartTitle = selectedUser 
    ? `Credit Usage for ${selectedUser.name}`
    : "Credit Usage by Product Type for All Users";

  const summaryText = selectedUser 
    ? `Total Credits Used by ${selectedUser.name}`
    : "Total Credits Used";

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6 h-[480px]">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{chartTitle}</h3>
      <div className="h-80">
        <ResponsivePie
          data={nivoData}
          margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          borderWidth={1}
          borderColor={{
            from: 'color',
            modifiers: [['darker', 0.2]]
          }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: 'color' }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{
            from: 'color',
            modifiers: [['darker', 2]]
          }}
          tooltip={({ datum }) => (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
              <div className="font-semibold text-gray-900">{datum.label}</div>
              <div className="text-gray-600">{datum.value.toLocaleString()} credits</div>
            </div>
          )}
        />
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
