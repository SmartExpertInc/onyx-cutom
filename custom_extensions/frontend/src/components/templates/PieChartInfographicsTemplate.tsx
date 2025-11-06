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
        boxSizing: 'border-box'
      }}
    />
  );
}

export const PieChartInfographicsTemplate: React.FC<PieChartInfographicsTemplateProps> = ({
  slideId,
  title = 'Pie chart',
  chartData = {
    segments: [
      { label: 'Headline', percentage: 16.67, color: '#ED8E8C', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor' },
      { label: 'Headline', percentage: 16.67, color: '#FFBF55', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor' },
      { label: 'Headline', percentage: 16.67, color: '#993EFB', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor' },
      { label: 'Headline', percentage: 16.67, color: '#0F58F9', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor' },
      { label: 'Headline', percentage: 16.67, color: '#DC6D17', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor' },
      { label: 'Headline', percentage: 16.67, color: '#0F4C97', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor' }
    ]
  },
  monthlyData = [
    { month: 'Headline', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', color: '#ED8E8C', percentage: '16.67%' },
    { month: 'Headline', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', color: '#FFBF55', percentage: '16.67%' },
    { month: 'Headline', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', color: '#993EFB', percentage: '16.67%' },
    { month: 'Headline', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', color: '#0F58F9', percentage: '16.67%' },
    { month: 'Headline', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', color: '#DC6D17', percentage: '16.67%' },
    { month: 'Headline', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', color: '#0F4C97', percentage: '16.67%' }
  ],
  descriptionText = 'Editable infographic',
  theme,
  onUpdate,
  isEditable = false
}: PieChartInfographicsTemplateProps) => {
  const currentTheme = getSlideTheme('dark-purple');
  const { contentColor: themeContent } = currentTheme.colors;
  const themeBg = '#ffffff'; // Белый фон для dark-purple темы
  const themeTitle = '#000000'; // Черный цвет заголовка
  
  // State for inline editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSegment, setEditingSegment] = useState<number | null>(null);
  const [editingSegmentDesc, setEditingSegmentDesc] = useState<number | null>(null);
  const [editingDescText, setEditingDescText] = useState(false);
  const [editingPercentage, setEditingPercentage] = useState<number | null>(null);
  const [editingColor, setEditingColor] = useState<{index: number, position: {x: number, y: number}} | null>(null);

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

  const handleSegmentSave = (segmentIndex: number, newValue: string) => {
    setEditingSegment(null);
    const newMonthlyData = [...monthlyData];
    newMonthlyData[segmentIndex] = { ...newMonthlyData[segmentIndex], month: newValue };
    
    const newSegments = [...chartData.segments];
    newSegments[segmentIndex] = { ...newSegments[segmentIndex], label: newValue };
    
    const newData = { 
      title, 
      chartData: { segments: newSegments }, 
      monthlyData: newMonthlyData, 
      descriptionText 
    };
    scheduleAutoSave(newData);
  };

  const handleSegmentCancel = (segmentIndex: number) => {
    setEditingSegment(null);
  };

  const handleSegmentDescSave = (segmentIndex: number, newValue: string) => {
    setEditingSegmentDesc(null);
    const newMonthlyData = [...monthlyData];
    newMonthlyData[segmentIndex] = { ...newMonthlyData[segmentIndex], description: newValue };
    
    const newSegments = [...chartData.segments];
    newSegments[segmentIndex] = { ...newSegments[segmentIndex], description: newValue };
    
    const newData = { 
      title, 
      chartData: { segments: newSegments }, 
      monthlyData: newMonthlyData, 
      descriptionText 
    };
    scheduleAutoSave(newData);
  };

  const handleSegmentDescCancel = (segmentIndex: number) => {
    setEditingSegmentDesc(null);
  };

  const handlePercentageSave = (segmentIndex: number, newValue: string) => {
    setEditingPercentage(null);
    const newPercentage = parseFloat(newValue) || 0;
    
    const newSegments = [...chartData.segments];
    newSegments[segmentIndex] = {
      ...newSegments[segmentIndex],
      percentage: newPercentage
    };
    
    const newMonthlyData = [...monthlyData];
    newMonthlyData[segmentIndex] = {
      ...newMonthlyData[segmentIndex],
      percentage: `${newPercentage.toFixed(2)}%`
    };
    
    const newData = { 
      title, 
      chartData: { segments: newSegments }, 
      monthlyData: newMonthlyData,
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

  const startEditingSegment = (index: number) => {
    setEditingSegment(index);
  };

  const startEditingSegmentDesc = (index: number) => {
    setEditingSegmentDesc(index);
  };

  const startEditingColor = (index: number, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    setEditingColor({ index, position });
  };

  const handleColorSave = (segmentIndex: number, newColor: string) => {
    setEditingColor(null);
    
    const newSegments = [...chartData.segments];
    newSegments[segmentIndex] = {
      ...newSegments[segmentIndex],
      color: newColor
    };
    
    const newMonthlyData = [...monthlyData];
    newMonthlyData[segmentIndex] = {
      ...newMonthlyData[segmentIndex],
      color: newColor
    };
    
    const newData = { 
      title, 
      chartData: { segments: newSegments }, 
      monthlyData: newMonthlyData,
      descriptionText
    };
    scheduleAutoSave(newData);
  };

  const handleColorCancel = (segmentIndex: number) => {
    setEditingColor(null);
  };

  // Create conic gradient for pie chart
  const generatePieChartGradient = () => {
    const totalPercentage = chartData.segments.reduce((sum, segment) => sum + segment.percentage, 0);
    let cumulativePercentage = 0;
    
    const gradientStops = chartData.segments.map((segment) => {
      const startAngle = (cumulativePercentage / (totalPercentage || 1)) * 360;
      const endAngle = ((cumulativePercentage + segment.percentage) / (totalPercentage || 1)) * 360;
      cumulativePercentage += segment.percentage;
      
      return `${segment.color} ${startAngle}deg ${endAngle}deg`;
    });
    
    return `conic-gradient(${gradientStops.join(', ')})`;
  };

  // Handle clicking on a pie chart segment
  const handleSegmentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditable) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const clickX = event.clientX - rect.left - centerX;
    const clickY = event.clientY - rect.top - centerY;
    
    // Check if click is outside center circle (radius 64px = w-32/2)
    const distanceFromCenter = Math.sqrt(clickX * clickX + clickY * clickY);
    if (distanceFromCenter < 64) return; // Don't trigger on center circle
    
    // Calculate angle from click position
    let angle = Math.atan2(clickY, clickX) * (180 / Math.PI);
    angle = (angle + 90 + 360) % 360; // Normalize to 0-360, starting from top
    
    // Find which segment was clicked
    const totalPercentage = chartData.segments.reduce((sum, segment) => sum + segment.percentage, 0);
    let cumulativePercentage = 0;
    
    for (let i = 0; i < chartData.segments.length; i++) {
      const startAngle = (cumulativePercentage / (totalPercentage || 1)) * 360;
      const endAngle = ((cumulativePercentage + chartData.segments[i].percentage) / (totalPercentage || 1)) * 360;
      
      if (angle >= startAngle && angle < endAngle) {
        setEditingPercentage(i);
        break;
      }
      
      cumulativePercentage += chartData.segments[i].percentage;
    }
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
        <div className="flex items-center justify-center gap-16">
          
          {/* Left Column - Segments 1-3 */}
          <div className="flex flex-col gap-8">
            {monthlyData.slice(0, 3).map((item, index) => (
              <div key={index} className="flex flex-col gap-2 max-w-xs">
                {/* Headline */}
                <div 
                  className="font-bold text-lg cursor-pointer hover:opacity-80"
                  style={{ color: item.color }}
                >
                  {editingSegment === index && isEditable ? (
                    <InlineEditor
                      initialValue={item.month}
                      onSave={(value) => handleSegmentSave(index, value)}
                      onCancel={() => handleSegmentCancel(index)}
                      style={{
                        color: item.color,
                        fontWeight: 'bold',
                        fontSize: '1.125rem'
                      }}
                    />
                  ) : (
                    <span 
                      onClick={() => isEditable && startEditingSegment(index)}
                    >
                      {item.month}
                    </span>
                  )}
                </div>
                
                {/* Description */}
                <div className="text-gray-600 text-sm leading-relaxed">
                  {editingSegmentDesc === index && isEditable ? (
                    <InlineEditor
                      initialValue={item.description}
                      onSave={(value) => handleSegmentDescSave(index, value)}
                      onCancel={() => handleSegmentDescCancel(index)}
                      multiline={true}
                      style={{
                        color: '#6B7280',
                        fontSize: '0.875rem',
                        lineHeight: '1.6',
                        width: '100%',
                        minHeight: '60px'
                      }}
                    />
                  ) : (
                    <div 
                      className="cursor-pointer hover:opacity-80"
                      onClick={() => isEditable && startEditingSegmentDesc(index)}
                    >
                      {item.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pie Chart Container */}
          <div className="relative flex-shrink-0">
            <div 
              className="pie-chart-container relative rounded-full cursor-pointer"
              style={{ 
                width: '400px', 
                height: '400px',
                background: generatePieChartGradient()
              }}
              onClick={handleSegmentClick}
            >
              {/* Center Circle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">Total</div>
                    <div className="text-lg text-gray-600">amount</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Percentage Editor Modal */}
            {editingPercentage !== null && isEditable && (
              <div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-2xl border border-gray-200 z-50"
                style={{ minWidth: '300px' }}
              >
                <h3 className="text-lg font-bold mb-4">Edit Segment</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    defaultValue={chartData.segments[editingPercentage].percentage}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value;
                        handlePercentageSave(editingPercentage, value);
                      } else if (e.key === 'Escape') {
                        handlePercentageCancel(editingPercentage);
                      }
                    }}
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      const input = e.currentTarget.parentElement?.parentElement?.querySelector('input');
                      if (input) {
                        handlePercentageSave(editingPercentage, input.value);
                      }
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition-colors"
                    onClick={() => handlePercentageCancel(editingPercentage)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Segments 4-6 */}
          <div className="flex flex-col gap-8">
            {monthlyData.slice(3, 6).map((item, index) => {
              const actualIndex = index + 3;
              return (
                <div key={actualIndex} className="flex flex-col gap-2 max-w-xs">
                  {/* Headline */}
                  <div 
                    className="font-bold text-lg cursor-pointer hover:opacity-80"
                    style={{ color: item.color }}
                  >
                    {editingSegment === actualIndex && isEditable ? (
                      <InlineEditor
                        initialValue={item.month}
                        onSave={(value) => handleSegmentSave(actualIndex, value)}
                        onCancel={() => handleSegmentCancel(actualIndex)}
                        style={{
                          color: item.color,
                          fontWeight: 'bold',
                          fontSize: '1.125rem'
                        }}
                      />
                    ) : (
                      <span 
                        onClick={() => isEditable && startEditingSegment(actualIndex)}
                      >
                        {item.month}
                      </span>
                    )}
                  </div>
                  
                  {/* Description */}
                  <div className="text-gray-600 text-sm leading-relaxed">
                    {editingSegmentDesc === actualIndex && isEditable ? (
                      <InlineEditor
                        initialValue={item.description}
                        onSave={(value) => handleSegmentDescSave(actualIndex, value)}
                        onCancel={() => handleSegmentDescCancel(actualIndex)}
                        multiline={true}
                        style={{
                          color: '#6B7280',
                          fontSize: '0.875rem',
                          lineHeight: '1.6',
                          width: '100%',
                          minHeight: '60px'
                        }}
                      />
                    ) : (
                      <div 
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => isEditable && startEditingSegmentDesc(actualIndex)}
                      >
                        {item.description}
                      </div>
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
