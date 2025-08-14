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
        boxSizing: 'border-box',
        display: 'block'
      }}
    />
  );
}

export const PieChartInfographicsTemplate: React.FC<PieChartInfographicsTemplateProps> = ({
  slideId,
  title = 'Круговая диаграмма',
  chartData = {
    segments: [
      { label: 'Сегмент 1', percentage: 16.67, color: '#3B82F6', description: 'Первый сегмент диаграммы' },
      { label: 'Сегмент 2', percentage: 16.67, color: '#10B981', description: 'Второй сегмент диаграммы' },
      { label: 'Сегмент 3', percentage: 16.67, color: '#F59E0B', description: 'Третий сегмент диаграммы' },
      { label: 'Сегмент 4', percentage: 16.67, color: '#EF4444', description: 'Четвертый сегмент диаграммы' },
      { label: 'Сегмент 5', percentage: 16.67, color: '#8B5CF6', description: 'Пятый сегмент диаграммы' },
      { label: 'Сегмент 6', percentage: 16.67, color: '#EC4899', description: 'Шестой сегмент диаграммы' }
    ]
  },
  monthlyData = [
    { month: 'Сегмент 1', description: 'Описание первого сегмента диаграммы', color: '#3B82F6', percentage: '16.7%' },
    { month: 'Сегмент 2', description: 'Описание второго сегмента диаграммы', color: '#10B981', percentage: '16.7%' },
    { month: 'Сегмент 3', description: 'Описание третьего сегмента диаграммы', color: '#F59E0B', percentage: '16.7%' },
    { month: 'Сегмент 4', description: 'Описание четвертого сегмента диаграммы', color: '#EF4444', percentage: '16.7%' },
    { month: 'Сегмент 5', description: 'Описание пятого сегмента диаграммы', color: '#8B5CF6', percentage: '16.7%' },
    { month: 'Сегмент 6', description: 'Описание шестого сегмента диаграммы', color: '#EC4899', percentage: '16.7%' }
  ],
  descriptionText = 'Нажмите на элементы для редактирования данных диаграммы',
  theme,
  onUpdate,
  isEditable = false
}: PieChartInfographicsTemplateProps) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent } = currentTheme.colors;
  
  // State for inline editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSegment, setEditingSegment] = useState<number | null>(null);
  const [editingSegmentDesc, setEditingSegmentDesc] = useState<number | null>(null);
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

  const handleSegmentSave = (segmentIndex: number, newValue: string) => {
    setEditingSegment(null);
    const newMonthlyData = [...monthlyData];
    newMonthlyData[segmentIndex] = { ...newMonthlyData[segmentIndex], month: newValue };
    const newData = { title, chartData, monthlyData: newMonthlyData, descriptionText };
    scheduleAutoSave(newData);
  };

  const handleSegmentCancel = (segmentIndex: number) => {
    setEditingSegment(null);
  };

  const handleSegmentDescSave = (segmentIndex: number, newValue: string) => {
    setEditingSegmentDesc(null);
    const newMonthlyData = [...monthlyData];
    newMonthlyData[segmentIndex] = { ...newMonthlyData[segmentIndex], description: newValue };
    const newData = { title, chartData, monthlyData: newMonthlyData, descriptionText };
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
      percentage: newPercentage,
      label: `Сегмент ${segmentIndex + 1}`
    };
    
    const newMonthlyData = [...monthlyData];
    newMonthlyData[segmentIndex] = {
      ...newMonthlyData[segmentIndex],
      percentage: `${newPercentage.toFixed(1)}%`
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

  const startEditingPercentage = (index: number) => {
    setEditingPercentage(index);
  };

  // Create conic gradient for pie chart
  const createConicGradient = () => {
    const totalPercentage = chartData.segments.reduce((sum, segment) => sum + segment.percentage, 0);
    let cumulativePercentage = 0;
    
    const gradientStops = chartData.segments.map((segment, index) => {
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
          
          {/* Left Column - Segments 1-3 */}
          <div className="flex flex-col gap-8">
            {monthlyData.slice(0, 3).map((item, index) => (
              <div key={index} className="flex flex-col gap-3 max-w-xs">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div 
                    className="px-4 py-2 rounded-lg font-bold text-white text-center text-lg flex-1"
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
                  </div>
                  <div className="text-lg font-bold" style={{ color: themeContent }}>
                    {editingPercentage === index && isEditable ? (
                      <InlineEditor
                        initialValue={item.percentage.replace('%', '')}
                        onSave={(value) => handlePercentageSave(index, value)}
                        onCancel={() => handlePercentageCancel(index)}
                        style={{
                          color: themeContent,
                          fontSize: '1.125rem',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          minWidth: '60px'
                        }}
                      />
                    ) : (
                      <span 
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => isEditable && startEditingPercentage(index)}
                      >
                        {item.percentage}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-base leading-relaxed ml-7">
                  {editingSegmentDesc === index && isEditable ? (
                    <InlineEditor
                      initialValue={item.description}
                      onSave={(value) => handleSegmentDescSave(index, value)}
                      onCancel={() => handleSegmentDescCancel(index)}
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
                      onClick={() => isEditable && startEditingSegmentDesc(index)}
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
              className="relative w-[320px] h-[320px] rounded-full border-4 border-white shadow-2xl"
              style={{
                background: createConicGradient(),
                borderColor: '#ffffff',
                boxShadow: '0 12px 32px rgba(0,0,0,0.15)'
              }}
            >
              {/* Inner circle */}
              <div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80px] h-[80px] rounded-full border-3"
                style={{
                  backgroundColor: themeBg,
                  borderColor: '#e5e7eb',
                  borderWidth: '3px'
                }}
              />
            </div>
          </div>

          {/* Right Column - Segments 4-6 */}
          <div className="flex flex-col gap-8">
            {monthlyData.slice(3, 6).map((item, index) => {
              const actualIndex = index + 3;
              return (
                <div key={actualIndex} className="flex flex-col gap-3 max-w-xs">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div 
                      className="px-4 py-2 rounded-lg font-bold text-white text-center text-lg flex-1"
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
                    </div>
                    <div className="text-lg font-bold" style={{ color: themeContent }}>
                      {editingPercentage === actualIndex && isEditable ? (
                        <InlineEditor
                          initialValue={item.percentage.replace('%', '')}
                          onSave={(value) => handlePercentageSave(actualIndex, value)}
                          onCancel={() => handlePercentageCancel(actualIndex)}
                          style={{
                            color: themeContent,
                            fontSize: '1.125rem',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            minWidth: '60px'
                          }}
                        />
                      ) : (
                        <span 
                          className="cursor-pointer hover:opacity-80"
                          onClick={() => isEditable && startEditingPercentage(actualIndex)}
                        >
                          {item.percentage}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-base leading-relaxed ml-7">
                    {editingSegmentDesc === actualIndex && isEditable ? (
                      <InlineEditor
                        initialValue={item.description}
                        onSave={(value) => handleSegmentDescSave(actualIndex, value)}
                        onCancel={() => handleSegmentDescCancel(actualIndex)}
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
                        onClick={() => isEditable && startEditingSegmentDesc(actualIndex)}
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