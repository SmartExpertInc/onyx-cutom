import React, { useState, useRef, useEffect } from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

interface BarChartInfographicsTemplateProps {
  slideId: string;
  title?: string;
  chartData?: {
    categories: Array<{
      label: string;
      value: number;
      color: string;
      description: string;
    }>;
  };
  monthlyData?: Array<{
    month: string;
    description: string;
    color: string;
  }>;
  descriptionText?: string;
  theme?: SlideTheme;
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
}

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

  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [value, multiline]);

  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
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

export const BarChartInfographicsTemplate: React.FC<BarChartInfographicsTemplateProps> = ({
  slideId,
  title = 'Bar Chart Infographics',
  chartData = {
    categories: [
      { label: 'Category A', value: 75, color: '#0ea5e9', description: 'High performance category' },
      { label: 'Category B', value: 60, color: '#06b6d4', description: 'Medium performance category' },
      { label: 'Category C', value: 45, color: '#67e8f9', description: 'Average performance category' },
      { label: 'Category D', value: 30, color: '#0891b2', description: 'Below average category' },
      { label: 'Category E', value: 85, color: '#f97316', description: 'Excellent performance category' },
      { label: 'Category F', value: 55, color: '#fb923c', description: 'Good performance category' }
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
  descriptionText = 'To modify this graph, click on it, follow the link, change the data and paste it here',
  theme,
  onUpdate,
  isEditable = false
}: BarChartInfographicsTemplateProps) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent } = currentTheme.colors;
  
  // State for inline editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingMonth, setEditingMonth] = useState<number | null>(null);
  const [editingMonthDesc, setEditingMonthDesc] = useState<number | null>(null);
  const [editingDescText, setEditingDescText] = useState(false);
  const [editingCategoryLabel, setEditingCategoryLabel] = useState<number | null>(null);
  const [editingCategoryValue, setEditingCategoryValue] = useState<number | null>(null);
  const [editingCategoryDesc, setEditingCategoryDesc] = useState<number | null>(null);

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
    const newData = { title: newTitle, chartData, monthlyData, descriptionText };
    scheduleAutoSave(newData);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  const handleDescTextSave = (newText: string) => {
    setEditingDescText(false);
    const newData = { title, chartData, monthlyData, descriptionText: newText };
    scheduleAutoSave(newData);
  };

  const handleDescTextCancel = () => {
    setEditingDescText(false);
  };

  const handleMonthSave = (monthIndex: number, newValue: string) => {
    setEditingMonth(null);
    const newMonthlyData = [...monthlyData];
    newMonthlyData[monthIndex] = { ...newMonthlyData[monthIndex], month: newValue };
    const newData = { title, chartData, monthlyData: newMonthlyData, descriptionText };
    scheduleAutoSave(newData);
  };

  const handleMonthCancel = (monthIndex: number) => {
    setEditingMonth(null);
  };

  const handleMonthDescSave = (monthIndex: number, newValue: string) => {
    setEditingMonthDesc(null);
    const newMonthlyData = [...monthlyData];
    newMonthlyData[monthIndex] = { ...newMonthlyData[monthIndex], description: newValue };
    const newData = { title, chartData, monthlyData: newMonthlyData, descriptionText };
    scheduleAutoSave(newData);
  };

  const handleMonthDescCancel = (monthIndex: number) => {
    setEditingMonthDesc(null);
  };

  const handleCategoryLabelSave = (categoryIndex: number, newValue: string) => {
    setEditingCategoryLabel(null);
    const newCategories = [...chartData.categories];
    newCategories[categoryIndex] = { ...newCategories[categoryIndex], label: newValue };
    const newData = { title, chartData: { categories: newCategories }, monthlyData, descriptionText };
    scheduleAutoSave(newData);
  };

  const handleCategoryLabelCancel = (categoryIndex: number) => {
    setEditingCategoryLabel(null);
  };

  const handleCategoryValueSave = (categoryIndex: number, newValue: string) => {
    setEditingCategoryValue(null);
    const newValueNum = parseFloat(newValue) || 0;
    const newCategories = [...chartData.categories];
    newCategories[categoryIndex] = { ...newCategories[categoryIndex], value: newValueNum };
    const newData = { title, chartData: { categories: newCategories }, monthlyData, descriptionText };
    scheduleAutoSave(newData);
  };

  const handleCategoryValueCancel = (categoryIndex: number) => {
    setEditingCategoryValue(null);
  };

  const handleCategoryDescSave = (categoryIndex: number, newValue: string) => {
    setEditingCategoryDesc(null);
    const newCategories = [...chartData.categories];
    newCategories[categoryIndex] = { ...newCategories[categoryIndex], description: newValue };
    const newData = { title, chartData: { categories: newCategories }, monthlyData, descriptionText };
    scheduleAutoSave(newData);
  };

  const handleCategoryDescCancel = (categoryIndex: number) => {
    setEditingCategoryDesc(null);
  };

  const startEditingTitle = () => {
    setEditingTitle(true);
  };

  const startEditingDescText = () => {
    setEditingDescText(true);
  };

  const startEditingMonth = (index: number) => {
    setEditingMonth(index);
  };

  const startEditingMonthDesc = (index: number) => {
    setEditingMonthDesc(index);
  };

  const startEditingCategoryLabel = (index: number) => {
    setEditingCategoryLabel(index);
  };

  const startEditingCategoryValue = (index: number) => {
    setEditingCategoryValue(index);
  };

  const startEditingCategoryDesc = (index: number) => {
    setEditingCategoryDesc(index);
  };

  // Calculate max value for scaling
  const maxValue = Math.max(...chartData.categories.map(cat => cat.value));

  // Render bar chart
  const renderBarChart = () => {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="space-y-4">
          {chartData.categories.map((category, index) => (
            <div key={index} className="flex items-center space-x-4">
              {/* Category Label */}
              <div className="w-24 text-sm font-medium text-right">
                {editingCategoryLabel === index && isEditable ? (
                  <InlineEditor
                    initialValue={category.label}
                    onSave={(value) => handleCategoryLabelSave(index, value)}
                    onCancel={() => handleCategoryLabelCancel(index)}
                    style={{
                      color: themeContent,
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      textAlign: 'right'
                    }}
                  />
                ) : (
                  <span 
                    className="cursor-pointer hover:opacity-80"
                    style={{ color: themeContent }}
                    onClick={() => isEditable && startEditingCategoryLabel(index)}
                  >
                    {category.label}
                  </span>
                )}
              </div>
              
              {/* Bar */}
              <div className="flex-1 relative">
                <div 
                  className="h-8 rounded-lg transition-all duration-300 relative"
                  style={{ 
                    backgroundColor: category.color,
                    width: `${(category.value / maxValue) * 100}%`,
                    minWidth: '20px'
                  }}
                >
                  {/* Value label on bar */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {editingCategoryValue === index && isEditable ? (
                      <InlineEditor
                        initialValue={category.value.toString()}
                        onSave={(value) => handleCategoryValueSave(index, value)}
                        onCancel={() => handleCategoryValueCancel(index)}
                        style={{
                          color: '#ffffff',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          background: 'rgba(0,0,0,0.3)',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          border: '1px solid #ffffff',
                          minWidth: '30px'
                        }}
                      />
                    ) : (
                      <span 
                        className="text-white text-sm font-bold cursor-pointer hover:opacity-80"
                        onClick={() => isEditable && startEditingCategoryValue(index)}
                      >
                        {category.value}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div className="w-48 text-sm">
                {editingCategoryDesc === index && isEditable ? (
                  <InlineEditor
                    initialValue={category.description}
                    onSave={(value) => handleCategoryDescSave(index, value)}
                    onCancel={() => handleCategoryDescCancel(index)}
                    multiline={true}
                    style={{
                      color: themeContent,
                      fontSize: '0.875rem',
                      lineHeight: '1.4'
                    }}
                  />
                ) : (
                  <p 
                    className="cursor-pointer hover:opacity-80"
                    style={{ color: themeContent }}
                    onClick={() => isEditable && startEditingCategoryDesc(index)}
                  >
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="relative w-full h-full flex flex-col justify-center items-center p-8 font-sans"
      style={{ 
        background: themeBg,
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
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
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
              onClick={() => isEditable && startEditingTitle()}
            >
              {title}
            </h1>
          )}
          {editingDescText && isEditable ? (
            <InlineEditor
              initialValue={descriptionText}
              onSave={handleDescTextSave}
              onCancel={handleDescTextCancel}
              multiline={true}
              style={{
                color: themeContent,
                fontSize: '1.125rem',
                lineHeight: '1.6',
                opacity: 0.7,
                textAlign: 'center',
                marginTop: '1rem'
              }}
            />
          ) : (
            <p 
              className="text-lg mt-4 opacity-70 cursor-pointer hover:opacity-80"
              style={{ color: themeContent }}
              onClick={() => isEditable && startEditingDescText()}
            >
              {descriptionText}
            </p>
          )}
        </div>

        {/* Main Layout Container */}
        <div className="flex items-start justify-center gap-16">
          
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
                      onSave={(value) => handleMonthSave(index, value)}
                      onCancel={() => handleMonthCancel(index)}
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
                      onClick={() => isEditable && startEditingMonth(index)}
                    >
                      {item.month}
                    </span>
                  )}
                </div>
                <div className="text-base leading-relaxed">
                  {editingMonthDesc === index && isEditable ? (
                    <InlineEditor
                      initialValue={item.description}
                      onSave={(value) => handleMonthDescSave(index, value)}
                      onCancel={() => handleMonthDescCancel(index)}
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
                      onClick={() => isEditable && startEditingMonthDesc(index)}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Center - Bar Chart */}
          <div className="flex flex-col items-center">
            <div 
              className="p-8 rounded-lg shadow-lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {renderBarChart()}
            </div>
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
                        onSave={(value) => handleMonthSave(actualIndex, value)}
                        onCancel={() => handleMonthCancel(actualIndex)}
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
                        onClick={() => isEditable && startEditingMonth(actualIndex)}
                      >
                        {item.month}
                      </span>
                    )}
                  </div>
                  <div className="text-base leading-relaxed">
                    {editingMonthDesc === actualIndex && isEditable ? (
                      <InlineEditor
                        initialValue={item.description}
                        onSave={(value) => handleMonthDescSave(actualIndex, value)}
                        onCancel={() => handleMonthDescCancel(actualIndex)}
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
                        onClick={() => isEditable && startEditingMonthDesc(actualIndex)}
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

export default BarChartInfographicsTemplate; 