// custom_extensions/frontend/src/components/templates/PieChartInfographicsTemplate.tsx

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

// Pie Chart Infographics Template Props
export interface PieChartInfographicsTemplateProps extends BaseTemplateProps {
  title: string;
  chartData: {
    segments: Array<{
      label: string;
      percentage: number;
      color: string;
      description?: string;
    }>;
  };
  monthlyData: Array<{
    month: string;
    description: string;
    color?: string;
  }>;
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
  chartSize?: number;
  theme?: any;
}

interface InlineEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  multiline?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function InlineEditor({ 
  initialValue, 
  onSave, 
  onCancel, 
  multiline = false,
  className = "",
  style = {}
}: InlineEditorProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      onSave(value);
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      onSave(value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    onSave(value);
  };

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        className={`inline-editor-textarea ${className}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        style={{
          ...style,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          resize: 'none',
          overflow: 'hidden',
          width: '100%',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          minHeight: '1.6em',
          boxSizing: 'border-box',
          display: 'block',
          lineHeight: '1.6'
        }}
        rows={2}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      className={`inline-editor-input ${className}`}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      style={{
        ...style,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
        width: '100%',
        boxSizing: 'border-box',
        display: 'block'
      }}
    />
  );
}

export const PieChartInfographicsTemplate: React.FC<PieChartInfographicsTemplateProps> = ({
  title = 'Pie Chart Infographics',
  chartData = {
    segments: [
      { label: '5%', percentage: 5, color: '#0ea5e9', description: 'Small segment' },
      { label: '20%', percentage: 20, color: '#06b6d4', description: 'Medium segment' },
      { label: '25%', percentage: 25, color: '#67e8f9', description: 'Large segment' },
      { label: '25%', percentage: 25, color: '#0891b2', description: 'Another large' },
      { label: '13%', percentage: 13, color: '#f97316', description: 'Orange segment' },
      { label: '12%', percentage: 12, color: '#fb923c', description: 'Light orange' }
    ]
  },
  monthlyData = [
    { month: 'Month 1', description: 'Mercury is the smallest planet of them all', color: '#0ea5e9' },
    { month: 'Month 2', description: 'Jupiter is the biggest planet of them all', color: '#0ea5e9' },
    { month: 'Month 3', description: 'Venus has a very poisonous atmosphere', color: '#0ea5e9' },
    { month: 'Month 4', description: 'Saturn is a gas giant and has rings', color: '#f97316' },
    { month: 'Month 5', description: 'Neptune is far away from Earth', color: '#f97316' },
    { month: 'Month 6', description: 'Despite being red, Mars is actually cold', color: '#f97316' }
  ],
  backgroundColor = '#ffffff',
  titleColor = '#1f2937',
  textColor = '#374151',
  chartSize = 280,
  theme,
  isEditable = false,
  onUpdate
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent } = currentTheme.colors;
  
  // State for inline editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingMonth, setEditingMonth] = useState<number | null>(null);
  const [editingMonthDesc, setEditingMonthDesc] = useState<number | null>(null);

  // Auto-save timeout
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const scheduleAutoSave = (newData: any) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (onUpdate) {
        onUpdate(newData);
      }
    }, 300);
  };

  const handleTitleUpdate = (newTitle: string) => {
    setEditingTitle(false);
    const newData = { title: newTitle, chartData, monthlyData };
    scheduleAutoSave(newData);
  };

  const handleMonthUpdate = (monthIndex: number, newValue: string) => {
    setEditingMonth(null);
    const newMonthlyData = [...monthlyData];
    newMonthlyData[monthIndex] = { ...newMonthlyData[monthIndex], month: newValue };
    const newData = { title, chartData, monthlyData: newMonthlyData };
    scheduleAutoSave(newData);
  };

  const handleMonthDescUpdate = (monthIndex: number, newValue: string) => {
    setEditingMonthDesc(null);
    const newMonthlyData = [...monthlyData];
    newMonthlyData[monthIndex] = { ...newMonthlyData[monthIndex], description: newValue };
    const newData = { title, chartData, monthlyData: newMonthlyData };
    scheduleAutoSave(newData);
  };

  // Create SVG pie chart
  const createPieChart = () => {
    const size = chartSize;
    const radius = size * 0.35;
    const centerX = size / 2;
    const centerY = size / 2;
    
    let cumulativePercentage = 0;
    
    return chartData.segments.map((segment, index) => {
      const startAngle = (cumulativePercentage / 100) * 2 * Math.PI - Math.PI / 2;
      const endAngle = ((cumulativePercentage + segment.percentage) / 100) * 2 * Math.PI - Math.PI / 2;
      
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      const largeArcFlag = segment.percentage > 50 ? 1 : 0;
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');
      
      // Calculate text position for percentage label
      const textAngle = (startAngle + endAngle) / 2;
      const textRadius = radius * 0.7;
      const textX = centerX + textRadius * Math.cos(textAngle);
      const textY = centerY + textRadius * Math.sin(textAngle);
      
      cumulativePercentage += segment.percentage;
      
      return (
        <g key={index}>
          <path
            d={pathData}
            fill={segment.color}
            stroke="#ffffff"
            strokeWidth="2"
            className="transition-all duration-300 hover:opacity-80"
          />
          <text
            x={textX}
            y={textY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#ffffff"
            fontSize="16"
            fontWeight="bold"
            className="select-none"
          >
            {segment.label}
          </text>
        </g>
      );
    });
  };

  return (
    <div 
      className="relative w-full h-full flex flex-col justify-center items-center p-8 font-sans"
      style={{ 
        backgroundColor: themeBg,
        minHeight: '600px'
      }}
    >
      {/* Main Content Container */}
      <div className="w-full max-w-7xl mx-auto">
        
        {/* Title */}
        <div className="text-center mb-12">
          {editingTitle && isEditable ? (
            <InlineEditor
              initialValue={title}
              onSave={handleTitleUpdate}
              onCancel={() => setEditingTitle(false)}
              style={{
                color: themeTitle,
                fontSize: '3.5rem',
                fontWeight: 'bold',
                lineHeight: '1.2',
                textAlign: 'center'
              }}
            />
          ) : (
            <h1 
              className="text-6xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: themeTitle }}
              onClick={() => isEditable && setEditingTitle(true)}
            >
              {title}
            </h1>
          )}
          <p 
            className="text-lg mt-4 opacity-70"
            style={{ color: themeContent }}
          >
            To modify this graph, click on it, follow the link, change the data and paste it here
          </p>
        </div>

        {/* Main Layout Container */}
        <div className="flex items-center justify-center gap-16">
          
          {/* Left Column - Months 1-3 */}
          <div className="flex flex-col gap-8">
            {monthlyData.slice(0, 3).map((item, index) => (
              <div key={index} className="flex flex-col gap-3 max-w-xs">
                <div 
                  className="px-6 py-3 rounded-lg font-bold text-white text-center text-lg"
                  style={{ backgroundColor: item.color || '#0ea5e9' }}
                >
                  {editingMonth === index && isEditable ? (
                    <InlineEditor
                      initialValue={item.month}
                      onSave={(value) => handleMonthUpdate(index, value)}
                      onCancel={() => setEditingMonth(null)}
                      style={{
                        color: '#ffffff',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.125rem'
                      }}
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:opacity-80"
                      onClick={() => isEditable && setEditingMonth(index)}
                    >
                      {item.month}
                    </span>
                  )}
                </div>
                <div className="text-base leading-relaxed">
                  {editingMonthDesc === index && isEditable ? (
                    <InlineEditor
                      initialValue={item.description}
                      onSave={(value) => handleMonthDescUpdate(index, value)}
                      onCancel={() => setEditingMonthDesc(null)}
                      multiline={true}
                      style={{
                        color: themeContent,
                        fontSize: '1rem',
                        lineHeight: '1.5'
                      }}
                    />
                  ) : (
                    <p 
                      className="cursor-pointer hover:opacity-80"
                      style={{ color: themeContent }}
                      onClick={() => isEditable && setEditingMonthDesc(index)}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Center - Pie Chart */}
          <div className="flex flex-col items-center">
            <svg 
              width={chartSize} 
              height={chartSize} 
              className="filter drop-shadow-lg"
            >
              <circle
                cx={chartSize / 2}
                cy={chartSize / 2}
                r={chartSize * 0.12}
                fill={themeBg}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              {createPieChart()}
            </svg>
          </div>

          {/* Right Column - Months 4-6 */}
          <div className="flex flex-col gap-8">
            {monthlyData.slice(3, 6).map((item, index) => {
              const actualIndex = index + 3;
              return (
                <div key={actualIndex} className="flex flex-col gap-3 max-w-xs">
                  <div 
                    className="px-6 py-3 rounded-lg font-bold text-white text-center text-lg"
                    style={{ backgroundColor: item.color || '#f97316' }}
                  >
                    {editingMonth === actualIndex && isEditable ? (
                      <InlineEditor
                        initialValue={item.month}
                        onSave={(value) => handleMonthUpdate(actualIndex, value)}
                        onCancel={() => setEditingMonth(null)}
                        style={{
                          color: '#ffffff',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          fontSize: '1.125rem'
                        }}
                      />
                    ) : (
                      <span 
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => isEditable && setEditingMonth(actualIndex)}
                      >
                        {item.month}
                      </span>
                    )}
                  </div>
                  <div className="text-base leading-relaxed">
                    {editingMonthDesc === actualIndex && isEditable ? (
                      <InlineEditor
                        initialValue={item.description}
                        onSave={(value) => handleMonthDescUpdate(actualIndex, value)}
                        onCancel={() => setEditingMonthDesc(null)}
                        multiline={true}
                        style={{
                          color: themeContent,
                          fontSize: '1rem',
                          lineHeight: '1.5'
                        }}
                      />
                    ) : (
                      <p 
                        className="cursor-pointer hover:opacity-80"
                        style={{ color: themeContent }}
                        onClick={() => isEditable && setEditingMonthDesc(actualIndex)}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PieChartInfographicsTemplate;