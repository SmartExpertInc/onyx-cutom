import React, { useState, useRef, useEffect } from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import { PieChartInfographicsTemplateProps } from '@/types/slideTemplates';

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

export const PieChartInfographicsTemplate: React.FC<PieChartInfographicsTemplateProps> = ({
  slideId,
  title = 'Pie Chart Infographics',
  chartData = {
    segments: [
      { label: '15%', percentage: 15, color: '#0ea5e9', description: 'Blue segment' },
      { label: '20%', percentage: 20, color: '#06b6d4', description: 'Cyan segment' },
      { label: '25%', percentage: 25, color: '#67e8f9', description: 'Light blue segment' },
      { label: '20%', percentage: 20, color: '#0891b2', description: 'Dark blue segment' },
      { label: '12%', percentage: 12, color: '#f97316', description: 'Orange segment' },
      { label: '8%', percentage: 8, color: '#fb923c', description: 'Light orange segment' }
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
}: PieChartInfographicsTemplateProps) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent } = currentTheme.colors;
  
  // State for inline editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingMonth, setEditingMonth] = useState<number | null>(null);
  const [editingMonthDesc, setEditingMonthDesc] = useState<number | null>(null);
  const [editingDescText, setEditingDescText] = useState(false);
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

  const handlePercentageSave = (segmentIndex: number, newValue: string) => {
    setEditingPercentage(null);
    const newPercentage = parseFloat(newValue) || 0;
    
    // Update the segment with new percentage
    const newSegments = [...chartData.segments];
    newSegments[segmentIndex] = {
      ...newSegments[segmentIndex],
      percentage: newPercentage,
      label: `${newPercentage}%`
    };
    
    const newData = { 
      title, 
      chartData: { segments: newSegments }, 
      monthlyData,
      descriptionText
    };
    scheduleAutoSave(newData);
  };

  const handlePercentageCancel = (segmentIndex: number) => {
    setEditingPercentage(null);
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

  const startEditingPercentage = (index: number) => {
    setEditingPercentage(index);
  };

  // NEW: Simple pie chart using CSS transforms
  const renderPieChart = () => {
    const totalPercentage = chartData.segments.reduce((sum, segment) => sum + segment.percentage, 0);
    let currentAngle = 0;

    return (
      <div className="relative w-[280px] h-[280px]">
        {/* Pie chart segments using CSS transforms */}
        {chartData.segments.map((segment, index) => {
          const segmentAngle = (segment.percentage / totalPercentage) * 360;
          const rotation = currentAngle;
          currentAngle += segmentAngle;

          return (
            <div
              key={index}
              className="absolute top-0 left-0 w-full h-full"
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'center'
              }}
            >
              <div
                className="absolute top-0 left-1/2 w-1/2 h-full origin-left"
                style={{
                  backgroundColor: segment.color,
                  transform: `rotate(${segmentAngle}deg)`,
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
                }}
              />
            </div>
          );
        })}

        {/* Inner circle (donut hole) */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[67px] h-[67px] rounded-full border-2"
          style={{
            backgroundColor: themeBg,
            borderColor: '#e5e7eb'
          }}
        />

        {/* Percentage labels */}
        {chartData.segments.map((segment, index) => {
          const segmentAngle = (segment.percentage / totalPercentage) * 360;
          const labelAngle = currentAngle - segmentAngle / 2;
          currentAngle -= segmentAngle;

          // Calculate label position
          const radius = 70; // Distance from center
          const angleRad = (labelAngle - 90) * Math.PI / 180;
          const x = 140 + radius * Math.cos(angleRad);
          const y = 140 + radius * Math.sin(angleRad);

          return (
            <div
              key={`label-${index}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:opacity-80"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: 'bold',
                fontFamily: 'Arial, Helvetica, sans-serif',
                textShadow: '1px 1px 2px #000000',
                userSelect: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                background: 'rgba(0,0,0,0.3)',
                zIndex: 20
              }}
              onClick={() => isEditable && startEditingPercentage(index)}
            >
              {editingPercentage === index && isEditable ? (
                <InlineEditor
                  initialValue={segment.percentage.toString()}
                  onSave={(value) => handlePercentageSave(index, value)}
                  onCancel={() => handlePercentageCancel(index)}
                  style={{
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: '4px',
                    padding: '2px 4px',
                    border: '1px solid #ffffff',
                    minWidth: '40px'
                  }}
                />
              ) : (
                segment.label
              )}
            </div>
          );
        })}
      </div>
    );
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

          {/* Center - Pie Chart */}
          <div className="flex flex-col items-center">
            <div 
              className="relative w-[280px] h-[280px] rounded-full shadow-lg overflow-hidden"
              style={{
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
              }}
            >
              {renderPieChart()}
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

export default PieChartInfographicsTemplate;