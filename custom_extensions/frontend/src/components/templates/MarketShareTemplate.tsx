// custom_extensions/frontend/src/components/templates/MarketShareTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import { MarketShareTemplateProps } from '@/types/slideTemplates';

interface InlineEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

function InlineEditor({ 
  initialValue, 
  onSave, 
  onCancel, 
  multiline = false, 
  placeholder = "",
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

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [value, multiline]);

  // Set initial height for textarea to match content
  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      // Set initial height based on content
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [multiline]);

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        className={`inline-editor-textarea ${className}`}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={{
          ...style,
          // Only override browser defaults, preserve all passed styles
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
        rows={1}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      className={`inline-editor-input ${className}`}
      type="text"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      style={{
        ...style,
        // Only override browser defaults, preserve all passed styles
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
  slideId,
  title = 'Market share',
  subtitle,
  chartData = [
    {
      label: 'Mercury',
      description: 'Mercury is the closest planet to the Sun',
      percentage: 85,
      color: '#2a5490',
      year: '2023'
    },
    {
      label: 'Mars',
      description: 'Despite being red, Mars is a cold place',
      percentage: 40,
      color: '#9ca3af',
      year: '2024'
    }
  ],
  bottomText = 'Follow the link in the graph to modify its data and then paste the new one here. For more info, click here',
  theme,
  onUpdate,
  isEditable = false
}: MarketShareTemplateProps) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, contentColor, accentColor } = currentTheme.colors;

  // State for inline editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingLabel, setEditingLabel] = useState<number | null>(null);
  const [editingDesc, setEditingDesc] = useState<number | null>(null);
  const [editingBottomText, setEditingBottomText] = useState(false);
  const [editingYear, setEditingYear] = useState<number | null>(null);
  const [editingPercentage, setEditingPercentage] = useState<number | null>(null);

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

  const handleTitleSave = (newTitle: string) => {
    setEditingTitle(false);
    const newData = { title: newTitle, chartData, bottomText };
    scheduleAutoSave(newData);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  const handleLabelSave = (index: number, newLabel: string) => {
    setEditingLabel(null);
    const newChartData = [...chartData];
    newChartData[index] = { ...newChartData[index], label: newLabel };
    const newData = { title, chartData: newChartData, bottomText };
    scheduleAutoSave(newData);
  };

  const handleLabelCancel = (index: number) => {
    setEditingLabel(null);
  };

  const handleDescSave = (index: number, newDesc: string) => {
    setEditingDesc(null);
    const newChartData = [...chartData];
    newChartData[index] = { ...newChartData[index], description: newDesc };
    const newData = { title, chartData: newChartData, bottomText };
    scheduleAutoSave(newData);
  };

  const handleDescCancel = (index: number) => {
    setEditingDesc(null);
  };

  const handleYearSave = (index: number, newYear: string) => {
    setEditingYear(null);
    const newChartData = [...chartData];
    newChartData[index] = { ...newChartData[index], year: newYear };
    const newData = { title, chartData: newChartData, bottomText };
    scheduleAutoSave(newData);
  };

  const handleYearCancel = (index: number) => {
    setEditingYear(null);
  };

  const handlePercentageSave = (index: number, newValue: string) => {
    setEditingPercentage(null);
    const newPercentage = parseFloat(newValue) || 0;
    const newChartData = [...chartData];
    newChartData[index] = { ...newChartData[index], percentage: newPercentage };
    const newData = { title, chartData: newChartData, bottomText };
    scheduleAutoSave(newData);
  };

  const handlePercentageCancel = (index: number) => {
    setEditingPercentage(null);
  };

  const handleBottomTextSave = (newText: string) => {
    setEditingBottomText(false);
    const newData = { title, chartData, bottomText: newText };
    scheduleAutoSave(newData);
  };

  const handleBottomTextCancel = () => {
    setEditingBottomText(false);
  };

  const handleAddColumn = () => {
    const newColumn = {
      label: `New Item ${chartData.length + 1}`,
      description: 'Add your description here',
      percentage: 50,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      year: `${new Date().getFullYear()}`
    };
    const newChartData = [...chartData, newColumn];
    const newData = { title, chartData: newChartData, bottomText };
    scheduleAutoSave(newData);
  };

  const handleRemoveColumn = (index: number) => {
    if (chartData.length > 1) {
      const newChartData = chartData.filter((_: any, i: number) => i !== index);
      const newData = { title, chartData: newChartData, bottomText };
      scheduleAutoSave(newData);
    }
  };

  const startEditingTitle = () => {
    setEditingTitle(true);
  };

  const startEditingLabel = (index: number) => {
    setEditingLabel(index);
  };

  const startEditingDesc = (index: number) => {
    setEditingDesc(index);
  };

  const startEditingYear = (index: number) => {
    setEditingYear(index);
  };

  const startEditingPercentage = (index: number) => {
    setEditingPercentage(index);
  };

  const startEditingBottomText = () => {
    setEditingBottomText(true);
  };

  // Create chart bars with relative heights based on the reference
  const maxValue = Math.max(...chartData.map((item: any) => item.percentage), 100);
  const chartHeights = chartData.map((item: any) => (item.percentage / maxValue) * 100);

  // Grid values for Y-axis
  const gridValues = [0, 25, 50, 75, 100];

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
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
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
              onClick={() => isEditable && startEditingTitle()}
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
              
              {/* Chart Container with Grid */}
              <div className="relative mb-4" style={{ height: '300px', width: `${chartData.length * 80 + 80}px` }}>
                
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs font-medium" style={{ color: contentColor, width: '30px' }}>
                  {gridValues.slice().reverse().map((value) => (
                    <div key={value} className="flex items-center">
                      {value}
                    </div>
                  ))}
                </div>
                
                {/* Grid lines */}
                <div className="absolute left-8 top-0 h-full w-full">
                  {gridValues.map((value) => (
                    <div 
                      key={value}
                      className="absolute w-full border-t border-gray-200"
                      style={{ 
                        top: `${100 - (value / 100) * 100}%`,
                        borderColor: contentColor,
                        opacity: 0.3
                      }}
                    ></div>
                  ))}
                </div>
                
                {/* Chart bars container */}
                <div className="absolute left-8 top-0 h-full flex items-end gap-8">
                  
                  {chartData.map((item: any, index: number) => (
                    <div key={index} className="flex flex-col items-center relative group">
                      {/* Main data bar */}
                      <div 
                        className="w-16 rounded transition-all duration-300 hover:opacity-80"
                        style={{ 
                          backgroundColor: item.color,
                          height: `${Math.max(chartHeights[index] * 2.5, 30)}px`,
                          marginBottom: '8px'
                        }}
                      ></div>
                      
                      {/* Year label */}
                      <div>
                        {editingYear === index && isEditable ? (
                          <InlineEditor
                            initialValue={item.year || `${new Date().getFullYear()}`}
                            onSave={(value) => handleYearSave(index, value)}
                            onCancel={() => handleYearCancel(index)}
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
                            onClick={() => isEditable && startEditingYear(index)}
                          >
                            {item.year || `${new Date().getFullYear()}`}
                          </p>
                        )}
                      </div>
                      
                      {/* Remove button - only visible on hover */}
                      {isEditable && chartData.length > 1 && (
                        <button
                          onClick={() => handleRemoveColumn(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
                          style={{ fontSize: '10px' }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {/* Add new column button */}
                  {isEditable && (
                    <div className="flex flex-col items-center">
                      <button
                        onClick={handleAddColumn}
                        className="w-16 h-16 border-2 border-dashed border-gray-400 rounded flex items-center justify-center text-gray-400 hover:border-gray-600 hover:text-gray-600 transition-colors"
                        style={{ marginBottom: '8px' }}
                      >
                        <span className="text-2xl">+</span>
                      </button>
                      <p className="text-sm text-gray-400">Add</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom description */}
              <div className="text-center max-w-lg mt-8">
                {editingBottomText && isEditable ? (
                  <InlineEditor
                    initialValue={bottomText}
                    onSave={handleBottomTextSave}
                    onCancel={handleBottomTextCancel}
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
                    onClick={() => isEditable && startEditingBottomText()}
                  >
                    {bottomText}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Legend Section - Right side */}
          <div className="flex flex-col gap-8 ml-16">
            
            {chartData.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-4">
                <div 
                  className="w-6 h-6 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div>
                  {editingLabel === index && isEditable ? (
                    <InlineEditor
                      initialValue={item.label}
                      onSave={(value) => handleLabelSave(index, value)}
                      onCancel={() => handleLabelCancel(index)}
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
                      onClick={() => isEditable && startEditingLabel(index)}
                    >
                      {item.label}
                    </h3>
                  )}
                  
                  {editingDesc === index && isEditable ? (
                    <InlineEditor
                      initialValue={item.description}
                      onSave={(value) => handleDescSave(index, value)}
                      onCancel={() => handleDescCancel(index)}
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
                      onClick={() => isEditable && startEditingDesc(index)}
                    >
                      {item.description}
                    </p>
                  )}
                  
                  {/* Percentage display and editing */}
                  <div className="mt-2">
                    {editingPercentage === index && isEditable ? (
                      <InlineEditor
                        initialValue={item.percentage.toString()}
                        onSave={(value) => handlePercentageSave(index, value)}
                        onCancel={() => handlePercentageCancel(index)}
                        style={{
                          color: item.color,
                          fontSize: '1.5rem',
                          fontWeight: 'bold'
                        }}
                      />
                    ) : (
                      <p 
                        className="text-2xl font-bold cursor-pointer hover:opacity-80"
                        style={{ color: item.color }}
                        onClick={() => isEditable && startEditingPercentage(index)}
                      >
                        {item.percentage}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
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