// custom_extensions/frontend/src/components/templates/MarketShareTemplate.tsx

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BaseTemplateProps } from '@/types/slideTemplates';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

// Market Share Template Props
export interface MarketShareTemplateProps extends BaseTemplateProps {
  title: string;
  subtitle?: string;
  primaryMetric: {
    label: string;
    description: string;
    percentage?: number;
    color?: string;
  };
  secondaryMetric: {
    label: string;
    description: string;
    percentage?: number;
    color?: string;
  };
  chartData?: {
    primaryValue: number;
    secondaryValue: number;
    primaryColor?: string;
    secondaryColor?: string;
    primaryYear?: string;
    secondaryYear?: string;
  };
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
  accentColor?: string;
  bottomText?: string;
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

export const MarketShareTemplate: React.FC<MarketShareTemplateProps> = ({
  title = 'Market share',
  subtitle,
  primaryMetric = {
    label: 'Mercury',
    description: 'Mercury is the closest planet to the Sun',
    percentage: 85,
    color: '#2a5490'
  },
  secondaryMetric = {
    label: 'Mars',
    description: 'Despite being red, Mars is a cold place',
    percentage: 40,
    color: '#9ca3af'
  },
  chartData = {
    primaryValue: 85,
    secondaryValue: 40,
    primaryColor: '#2a5490',
    secondaryColor: '#9ca3af',
    primaryYear: '2023',
    secondaryYear: '2024'
  },
  bottomText = 'Follow the link in the graph to modify its data and then paste the new one here. For more info, click here',
  slideId,
  isEditable = false,
  onUpdate,
  theme
}: MarketShareTemplateProps) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, contentColor, accentColor } = currentTheme.colors;

  // State for inline editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingPrimaryLabel, setEditingPrimaryLabel] = useState(false);
  const [editingPrimaryDesc, setEditingPrimaryDesc] = useState(false);
  const [editingSecondaryLabel, setEditingSecondaryLabel] = useState(false);
  const [editingSecondaryDesc, setEditingSecondaryDesc] = useState(false);
  const [editingBottomText, setEditingBottomText] = useState(false);
  const [editingPrimaryYear, setEditingPrimaryYear] = useState(false);
  const [editingSecondaryYear, setEditingSecondaryYear] = useState(false);

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
    const newData = { title: newTitle, primaryMetric, secondaryMetric, chartData };
    scheduleAutoSave(newData);
  };

  const handlePrimaryLabelUpdate = (newLabel: string) => {
    setEditingPrimaryLabel(false);
    const newPrimaryMetric = { ...primaryMetric, label: newLabel };
    const newData = { title, primaryMetric: newPrimaryMetric, secondaryMetric, chartData };
    scheduleAutoSave(newData);
  };

  const handlePrimaryDescUpdate = (newDesc: string) => {
    setEditingPrimaryDesc(false);
    const newPrimaryMetric = { ...primaryMetric, description: newDesc };
    const newData = { title, primaryMetric: newPrimaryMetric, secondaryMetric, chartData };
    scheduleAutoSave(newData);
  };

  const handleSecondaryLabelUpdate = (newLabel: string) => {
    setEditingSecondaryLabel(false);
    const newSecondaryMetric = { ...secondaryMetric, label: newLabel };
    const newData = { title, primaryMetric, secondaryMetric: newSecondaryMetric, chartData };
    scheduleAutoSave(newData);
  };

  const handleSecondaryDescUpdate = (newDesc: string) => {
    setEditingSecondaryDesc(false);
    const newSecondaryMetric = { ...secondaryMetric, description: newDesc };
    const newData = { title, primaryMetric, secondaryMetric: newSecondaryMetric, chartData };
    scheduleAutoSave(newData);
  };

  const handleBottomTextUpdate = (newText: string) => {
    setEditingBottomText(false);
    const newData = { title, primaryMetric, secondaryMetric, chartData, bottomText: newText };
    scheduleAutoSave(newData);
  };

  const handlePrimaryYearUpdate = (newYear: string) => {
    setEditingPrimaryYear(false);
    const newChartData = { ...chartData, primaryYear: newYear };
    const newData = { title, primaryMetric, secondaryMetric, chartData: newChartData };
    scheduleAutoSave(newData);
  };

  const handleSecondaryYearUpdate = (newYear: string) => {
    setEditingSecondaryYear(false);
    const newChartData = { ...chartData, secondaryYear: newYear };
    const newData = { title, primaryMetric, secondaryMetric, chartData: newChartData };
    scheduleAutoSave(newData);
  };

  // Chart colors using theme
  const primaryChartColor = accentColor || '#2563eb';
  const secondaryChartColor = contentColor || '#6b7280';

  // Create chart bars with relative heights based on the reference
  const maxValue = Math.max(chartData.primaryValue, chartData.secondaryValue, 100);
  const primaryHeight = (chartData.primaryValue / maxValue) * 100;
  const secondaryHeight = (chartData.secondaryValue / maxValue) * 100;

  return (
    <div 
      className="relative w-full h-full flex flex-col justify-center items-center p-8 font-sans"
      style={{ 
        backgroundColor: backgroundColor,
        minHeight: '600px'
      }}
    >
      {/* Main Content Container */}
      <div className="w-full max-w-6xl mx-auto">
        
        {/* Title */}
        <div className="text-center mb-16">
          {editingTitle && isEditable ? (
            <InlineEditor
              initialValue={title}
              onSave={handleTitleUpdate}
              onCancel={() => setEditingTitle(false)}
              style={{
                color: titleColor,
                fontSize: '3.5rem',
                fontWeight: 'bold',
                lineHeight: '1.2',
                textAlign: 'center'
              }}
            />
          ) : (
            <h1 
              className="text-6xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: titleColor }}
              onClick={() => isEditable && setEditingTitle(true)}
            >
              {title}
            </h1>
          )}
        </div>

        {/* Main Layout Container - Recreating exact reference layout */}
        <div className="flex items-center justify-between">
          
          {/* Chart Section - Centered */}
          <div className="flex-1 flex justify-center">
            <div className="flex flex-col items-center">
              
              {/* Y-axis scale */}
              <div className="flex items-end justify-center mb-4" style={{ height: '300px' }}>
                <div className="flex items-end gap-12">
                  
                  {/* First period */}
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-16 rounded transition-all duration-300 hover:opacity-80"
                      style={{ 
                        backgroundColor: primaryChartColor,
                        height: `${Math.max(primaryHeight * 2.5, 40)}px`,
                        marginBottom: '8px'
                      }}
                    ></div>
                    {editingPrimaryYear && isEditable ? (
                      <InlineEditor
                        initialValue={chartData.primaryYear || '2023'}
                        onSave={handlePrimaryYearUpdate}
                        onCancel={() => setEditingPrimaryYear(false)}
                        style={{
                          color: contentColor,
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          textAlign: 'center'
                        }}
                      />
                    ) : (
                      <p 
                        className="text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ color: contentColor }}
                        onClick={() => isEditable && setEditingPrimaryYear(true)}
                      >
                        {chartData.primaryYear || '2023'}
                      </p>
                    )}
                  </div>

                  {/* Second period */}
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-16 rounded transition-all duration-300 hover:opacity-80"
                      style={{ 
                        backgroundColor: secondaryChartColor,
                        height: `${Math.max(secondaryHeight * 2.5, 30)}px`,
                        marginBottom: '8px'
                      }}
                    ></div>
                    {editingSecondaryYear && isEditable ? (
                      <InlineEditor
                        initialValue={chartData.secondaryYear || '2024'}
                        onSave={handleSecondaryYearUpdate}
                        onCancel={() => setEditingSecondaryYear(false)}
                        style={{
                          color: contentColor,
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          textAlign: 'center'
                        }}
                      />
                    ) : (
                      <p 
                        className="text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ color: contentColor }}
                        onClick={() => isEditable && setEditingSecondaryYear(true)}
                      >
                        {chartData.secondaryYear || '2024'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom description */}
              <div className="text-center max-w-lg mt-8">
                {editingBottomText && isEditable ? (
                  <InlineEditor
                    initialValue={bottomText}
                    onSave={handleBottomTextUpdate}
                    onCancel={() => setEditingBottomText(false)}
                    multiline={true}
                    style={{
                      color: contentColor,
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                      textAlign: 'center',
                      opacity: 0.8
                    }}
                  />
                ) : (
                  <p 
                    className="text-sm leading-relaxed cursor-pointer hover:opacity-80"
                    style={{ color: contentColor, opacity: 0.8 }}
                    onClick={() => isEditable && setEditingBottomText(true)}
                  >
                    {bottomText}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Legend Section - Right side */}
          <div className="flex flex-col gap-12 ml-16">
            
            {/* Primary Metric */}
            <div className="flex items-center gap-4">
              <div 
                className="w-6 h-6 rounded-full flex-shrink-0"
                style={{ backgroundColor: primaryChartColor }}
              ></div>
              <div>
                {editingPrimaryLabel && isEditable ? (
                  <InlineEditor
                    initialValue={primaryMetric.label}
                    onSave={handlePrimaryLabelUpdate}
                    onCancel={() => setEditingPrimaryLabel(false)}
                    style={{
                      color: titleColor,
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      marginBottom: '8px'
                    }}
                  />
                ) : (
                  <h3 
                    className="text-3xl font-bold mb-2 cursor-pointer hover:opacity-80"
                    style={{ color: titleColor }}
                    onClick={() => isEditable && setEditingPrimaryLabel(true)}
                  >
                    {primaryMetric.label}
                  </h3>
                )}
                {editingPrimaryDesc && isEditable ? (
                  <InlineEditor
                    initialValue={primaryMetric.description}
                    onSave={handlePrimaryDescUpdate}
                    onCancel={() => setEditingPrimaryDesc(false)}
                    multiline={true}
                    style={{
                      color: contentColor,
                      fontSize: '1rem',
                      lineHeight: '1.5'
                    }}
                  />
                ) : (
                  <p 
                    className="text-lg leading-relaxed max-w-sm cursor-pointer hover:opacity-80"
                    style={{ color: contentColor }}
                    onClick={() => isEditable && setEditingPrimaryDesc(true)}
                  >
                    {primaryMetric.description}
                  </p>
                )}
              </div>
            </div>

            {/* Secondary Metric */}
            <div className="flex items-center gap-4">
              <div 
                className="w-6 h-6 rounded-full flex-shrink-0"
                style={{ backgroundColor: secondaryChartColor }}
              ></div>
              <div>
                {editingSecondaryLabel && isEditable ? (
                  <InlineEditor
                    initialValue={secondaryMetric.label}
                    onSave={handleSecondaryLabelUpdate}
                    onCancel={() => setEditingSecondaryLabel(false)}
                    style={{
                      color: titleColor,
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      marginBottom: '8px'
                    }}
                  />
                ) : (
                  <h3 
                    className="text-3xl font-bold mb-2 cursor-pointer hover:opacity-80"
                    style={{ color: titleColor }}
                    onClick={() => isEditable && setEditingSecondaryLabel(true)}
                  >
                    {secondaryMetric.label}
                  </h3>
                )}
                {editingSecondaryDesc && isEditable ? (
                  <InlineEditor
                    initialValue={secondaryMetric.description}
                    onSave={handleSecondaryDescUpdate}
                    onCancel={() => setEditingSecondaryDesc(false)}
                    multiline={true}
                    style={{
                      color: contentColor,
                      fontSize: '1rem',
                      lineHeight: '1.5'
                    }}
                  />
                ) : (
                  <p 
                    className="text-lg leading-relaxed max-w-sm cursor-pointer hover:opacity-80"
                    style={{ color: contentColor }}
                    onClick={() => isEditable && setEditingSecondaryDesc(true)}
                  >
                    {secondaryMetric.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Navigation Dots - matching reference exactly */}
      <div className="absolute bottom-8 left-8 flex gap-2">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: contentColor, opacity: 0.4 }}
        ></div>
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: contentColor, opacity: 0.8 }}
        ></div>
      </div>
      
      <div className="absolute bottom-8 right-8 flex gap-2">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: contentColor, opacity: 0.4 }}
        ></div>
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: contentColor, opacity: 0.8 }}
        ></div>
      </div>
    </div>
  );
};

export default MarketShareTemplate;