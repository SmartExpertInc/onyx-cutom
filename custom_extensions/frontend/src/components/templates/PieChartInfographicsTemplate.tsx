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
  title = 'Revenue Distribution Analysis',
  chartData = {
    segments: [
      { label: 'Cloud Services', percentage: 35, color: '#3B82F6', description: 'Our cloud services continue to drive significant revenue with strong market demand and customer satisfaction.' },
      { label: 'Mobile Applications', percentage: 28, color: '#10B981', description: 'Mobile app development showing consistent growth and expanding market penetration.' },
      { label: 'Data Analytics', percentage: 22, color: '#F59E0B', description: 'Data analytics services contributing substantial recurring revenue streams.' },
      { label: 'AI Solutions', percentage: 15, color: '#EF4444', description: 'AI and machine learning solutions providing additional revenue diversification.' },
      { label: 'Security Tools', percentage: 12, color: '#8B5CF6', description: 'Cybersecurity tools and services addressing critical market needs.' },
      { label: 'Integration Services', percentage: 8, color: '#EC4899', description: 'System integration and consulting services rounding out our portfolio.' }
    ]
  },
  monthlyData = [
    { month: 'Cloud Services', description: 'Our cloud services continue to drive significant revenue with strong market demand and customer satisfaction.', color: '#3B82F6', percentage: '35%' },
    { month: 'Mobile Applications', description: 'Mobile app development showing consistent growth and expanding market penetration.', color: '#10B981', percentage: '28%' },
    { month: 'Data Analytics', description: 'Data analytics services contributing substantial recurring revenue streams.', color: '#F59E0B', percentage: '22%' },
    { month: 'AI Solutions', description: 'AI and machine learning solutions providing additional revenue diversification.', color: '#EF4444', percentage: '15%' },
    { month: 'Security Tools', description: 'Cybersecurity tools and services addressing critical market needs.', color: '#8B5CF6', percentage: '12%' },
    { month: 'Integration Services', description: 'System integration and consulting services rounding out our portfolio.', color: '#EC4899', percentage: '8%' }
  ],
  descriptionText = 'Click on elements to edit chart data and customize the visualization',
  theme,
  onUpdate,
  isEditable = false
}: PieChartInfographicsTemplateProps) => {
  const currentTheme = getSlideTheme('dark-purple');
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent } = currentTheme.colors;
  
  // State for inline editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSegment, setEditingSegment] = useState<number | null>(null);
  const [editingSegmentDesc, setEditingSegmentDesc] = useState<number | null>(null);
  const [editingDescText, setEditingDescText] = useState(false);
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
              <div key={index} className="flex flex-col gap-3 max-w-xs">
                <div className="flex items-center gap-3">
                  {/* Color indicator - clickable for editing */}
                  <div 
                    className="w-4 h-4 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: item.color }}
                    onClick={(e) => isEditable && startEditingColor(index, e)}
                    title="Click to change color"
                  />
                  
                  {/* Segment name with percentage */}
                  <div 
                    className="px-4 py-2 rounded-lg font-bold text-white text-center text-lg flex-1 relative"
                    style={{ backgroundColor: item.color }}
                  >
                    {editingSegment === index && isEditable ? (
                      <InlineEditor
                        initialValue={item.month}
                        onSave={(value) => handleSegmentSave(index, value)}
                        onCancel={() => handleSegmentCancel(index)}
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
                        onClick={() => isEditable && startEditingSegment(index)}
                      >
                        {item.month}
                      </span>
                    )}
                    
                    {/* Percentage badge on segment name */}
                    <div 
                      className="absolute -top-2 -right-2 bg-white text-gray-800 text-xs font-bold px-2 py-1 rounded-full shadow-lg border-2"
                      style={{ borderColor: item.color }}
                    >
                      {item.percentage}
                    </div>
                  </div>
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
              className="pie-chart-container relative rounded-full"
              style={{ 
                width: '400px', 
                height: '400px',
                background: generatePieChartGradient()
              }}
            >
              {/* Center Circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">Total</div>
                    <div className="text-lg text-gray-600">amount</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Segments 4-6 */}
          <div className="flex flex-col gap-8">
            {monthlyData.slice(3, 6).map((item, index) => {
              const actualIndex = index + 3;
              return (
                <div key={actualIndex} className="flex flex-col gap-3 max-w-xs">
                  <div className="flex items-center gap-3">
                    {/* Color indicator - clickable for editing */}
                    <div 
                      className="w-4 h-4 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: item.color }}
                      onClick={(e) => isEditable && startEditingColor(actualIndex, e)}
                      title="Click to change color"
                    />
                    
                    {/* Segment name with percentage */}
                    <div 
                      className="px-4 py-2 rounded-lg font-bold text-white text-center text-lg flex-1 relative"
                      style={{ backgroundColor: item.color }}
                    >
                      {editingSegment === actualIndex && isEditable ? (
                        <InlineEditor
                          initialValue={item.month}
                          onSave={(value) => handleSegmentSave(actualIndex, value)}
                          onCancel={() => handleSegmentCancel(actualIndex)}
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
                          onClick={() => isEditable && startEditingSegment(actualIndex)}
                        >
                          {item.month}
                        </span>
                      )}
                      
                      {/* Percentage badge on segment name */}
                      <div 
                        className="absolute -top-2 -right-2 bg-white text-gray-800 text-xs font-bold px-2 py-1 rounded-full shadow-lg border-2"
                        style={{ borderColor: item.color }}
                      >
                        {item.percentage}
                      </div>
                    </div>
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
