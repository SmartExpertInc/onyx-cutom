import React from 'react';
import { BarChartInfographicsTemplate } from './templates/BarChartInfographicsTemplate';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

const BarChartDemo: React.FC = () => {
  const theme = getSlideTheme(DEFAULT_SLIDE_THEME);
  
  const demoData = {
    slideId: 'demo-bar-chart',
    title: 'Quarterly Performance Metrics',
    chartData: {
      categories: [
        { label: 'Q1 Sales', value: 85, color: '#0ea5e9', description: 'Excellent start to the year' },
        { label: 'Q2 Sales', value: 72, color: '#06b6d4', description: 'Strong continued growth' },
        { label: 'Q3 Sales', value: 68, color: '#67e8f9', description: 'Slight seasonal dip' },
        { label: 'Q4 Sales', value: 95, color: '#0891b2', description: 'Record breaking quarter' },
        { label: 'Marketing', value: 78, color: '#f97316', description: 'Effective campaigns' },
        { label: 'Support', value: 92, color: '#fb923c', description: 'Outstanding customer service' }
      ]
    },
    monthlyData: [
      { month: 'January', description: 'New year momentum drives strong sales', color: '#0ea5e9' },
      { month: 'February', description: 'Valentine\'s campaign boosts revenue', color: '#0ea5e9' },
      { month: 'March', description: 'Spring launch successful', color: '#0ea5e9' },
      { month: 'April', description: 'Easter promotions perform well', color: '#f97316' },
      { month: 'May', description: 'Mother\'s day specials', color: '#f97316' },
      { month: 'June', description: 'Summer sales campaign', color: '#f97316' }
    ],
    descriptionText: 'Comprehensive overview of our quarterly performance across all departments'
  };

  const handleUpdate = (newData: any) => {
    console.log('Bar Chart updated:', newData);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <BarChartInfographicsTemplate
        {...demoData}
        theme={theme}
        onUpdate={handleUpdate}
        isEditable={true}
      />
    </div>
  );
};

export default BarChartDemo; 