"use client";

import React from 'react';
import { ResponsiveLine } from '@nivo/line';

interface PersonnelShortageChartData {
  month: string;
  shortage: number;
}

interface ChartData {
  industry: string;
  chartData: PersonnelShortageChartData[];
  totalShortage: number;
  trend: string;
  description: string;
}

interface PersonnelShortageChartProps {
  chartData: ChartData;
  isMobile?: boolean;
}

const PersonnelShortageChart: React.FC<PersonnelShortageChartProps> = ({ 
  chartData, 
  isMobile = false 
}) => {
  // Transform data for Nivo Line chart
  const nivoData = [
    {
      id: 'Personnel Shortage',
      data: chartData.chartData.map((item, index) => ({
        x: item.month,
        y: item.shortage,
        index: index
      }))
    }
  ];

  // Chart dimensions based on original static images
  const chartHeight = isMobile ? 220 : 280;
  const chartWidth = isMobile ? 320 : 360;

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200"
      style={{ 
        width: `${chartWidth}px`, 
        height: `${chartHeight}px`,
        minWidth: `${chartWidth}px`,
        minHeight: `${chartHeight}px`
      }}
    >
      <div className="p-4 h-full">
        <div className="h-full">
          <ResponsiveLine
            data={nivoData}
            margin={{ 
              top: 20, 
              right: 30, 
              bottom: 60, 
              left: 50 
            }}
            xScale={{ type: 'point' }}
            yScale={{
              type: 'linear',
              min: 'auto',
              max: 'auto',
              stacked: false,
              reverse: false
            }}
            curve="monotoneX"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legend: 'Месяц',
              legendOffset: 50,
              legendPosition: 'middle'
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Количество специалистов',
              legendOffset: -40,
              legendPosition: 'middle'
            }}
            colors={['#0F58F9']}
            lineWidth={3}
            pointSize={8}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabelYOffset={-12}
            enableArea={true}
            areaOpacity={0.1}
            useMesh={true}
            tooltip={({ point }) => (
              <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                <div className="font-semibold text-gray-900">{point.data.x}</div>
                <div className="text-gray-600">
                  Недостаток: {point.data.y} специалистов
                </div>
              </div>
            )}
            theme={{
              background: 'transparent',
              text: {
                fontSize: 12,
                fill: '#374151',
                fontFamily: 'Inter, sans-serif'
              },
              axis: {
                domain: {
                  line: {
                    stroke: '#E5E7EB',
                    strokeWidth: 1
                  }
                },
                legend: {
                  text: {
                    fontSize: 11,
                    fill: '#6B7280',
                    fontFamily: 'Inter, sans-serif'
                  }
                },
                ticks: {
                  line: {
                    stroke: '#E5E7EB',
                    strokeWidth: 1
                  },
                  text: {
                    fontSize: 10,
                    fill: '#6B7280',
                    fontFamily: 'Inter, sans-serif'
                  }
                }
              },
              grid: {
                line: {
                  stroke: '#F3F4F6',
                  strokeWidth: 1
                }
              },
              tooltip: {
                container: {
                  background: 'white',
                  color: '#374151',
                  fontSize: 12,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #E5E7EB'
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonnelShortageChart;
