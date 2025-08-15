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
  const [editingColor, setEditingColor] = useState<{index: number, position: {x: number, y: number}} | null>(null);
  const [editingPieChart, setEditingPieChart] = useState<{index: number, position: {x: number, y: number}} | null>(null);

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

  const startEditingColor = (index: number, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    setEditingColor({ index, position });
  };

  const startEditingPieChart = (segmentIndex: number, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    setEditingPieChart({ index: segmentIndex, position });
  };

  const handlePieChartSave = (segmentIndex: number, newPercentage: number) => {
    setEditingPieChart(null);
    
    const newSegments = [...chartData.segments];
    const newMonthlyData = [...monthlyData];
    
    // Update the specific segment
    newSegments[segmentIndex] = {
      ...newSegments[segmentIndex],
      percentage: newPercentage
    };
    
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

  const handlePieChartCancel = () => {
    setEditingPieChart(null);
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
                    <div className="absolute -top-1 -right-1 bg-white text-gray-900 text-xs font-bold px-2 py-1 rounded-full shadow-md border border-gray-200">
                      {editingPercentage === index && isEditable ? (
                        <InlineEditor
                          initialValue={item.percentage.replace('%', '')}
                          onSave={(value) => handlePercentageSave(index, value)}
                          onCancel={() => handlePercentageCancel(index)}
                          style={{
                            color: '#1f2937',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            minWidth: '30px',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none'
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
                </div>
                
                {/* Description */}
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
              className="relative w-[320px] h-[320px] rounded-full shadow-2xl"
              style={{
                background: createConicGradient(),
                boxShadow: '0 12px 32px rgba(0,0,0,0.15)'
              }}
            >
              {/* Clickable segments overlay */}
              {isEditable && chartData.segments.map((segment, index) => {
                const totalPercentage = chartData.segments.reduce((sum, s) => sum + s.percentage, 0);
                let cumulativePercentage = 0;
                
                // Calculate start and end angles for this segment
                for (let i = 0; i < index; i++) {
                  cumulativePercentage += chartData.segments[i].percentage;
                }
                
                const startAngle = (cumulativePercentage / totalPercentage) * 360;
                const endAngle = ((cumulativePercentage + segment.percentage) / totalPercentage) * 360;
                
                // Create clip path for this segment
                const clipPath = `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(startAngle * Math.PI / 180)}% ${50 + 50 * Math.sin(startAngle * Math.PI / 180)}%, ${50 + 50 * Math.cos(endAngle * Math.PI / 180)}% ${50 + 50 * Math.sin(endAngle * Math.PI / 180)}%)`;
                
                return (
                  <div
                    key={index}
                    className="absolute inset-0 cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      clipPath: clipPath,
                      WebkitClipPath: clipPath
                    }}
                    onClick={(e) => startEditingPieChart(index, e)}
                    title={`Кликните для редактирования сегмента "${segment.label}"`}
                  />
                );
              })}
              
              {/* Inner circle - much smaller */}
              <div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40px] h-[40px] rounded-full pointer-events-none"
                style={{
                  backgroundColor: themeBg
                }}
              />
            </div>
                            {isEditable && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Кликните на сегмент или поле для редактирования процентов
                  </p>
                )}
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
                      onClick={() => isEditable && startEditingColor(actualIndex)}
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
                      <div className="absolute -top-1 -right-1 bg-white text-gray-900 text-xs font-bold px-2 py-1 rounded-full shadow-md border border-gray-200">
                        {editingPercentage === actualIndex && isEditable ? (
                          <InlineEditor
                            initialValue={item.percentage.replace('%', '')}
                            onSave={(value) => handlePercentageSave(actualIndex, value)}
                            onCancel={() => handlePercentageCancel(actualIndex)}
                            style={{
                              color: '#1f2937',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              textAlign: 'center',
                              minWidth: '30px',
                              background: 'transparent',
                              border: 'none',
                              outline: 'none'
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
                  </div>
                  
                  {/* Description */}
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
      
      {/* Color picker modal for editing colors - контекстный */}
      {editingColor !== null && isEditable && (
        <div className="fixed inset-0 z-50">
          <div 
            className="bg-white rounded-lg p-6 max-w-sm w-full shadow-2xl border border-gray-200 absolute"
            style={{ 
              left: `${editingColor.position.x}px`, 
              top: `${editingColor.position.y}px`,
              transform: 'translate(-50%, -50%)',
              zIndex: 51
            }}
          >
            <h3 className="text-lg font-bold mb-4">Выберите цвет для сегмента</h3>
            <div className="grid grid-cols-6 gap-2 mb-4">
              {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#67E8F9', '#0891B2', '#F97316', '#FB923C', '#FBBF24', '#34D399', '#059669', '#047857', '#F87171', '#DC2626', '#B91C1C', '#A855F7', '#7C3AED', '#6D28D9', '#F472B6', '#DB2777', '#BE185D', '#6366F1', '#8B5CF6', '#A855F7', '#7C3AED'].map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSave(editingColor.index, color)}
                  title={color}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
                onClick={() => handleColorCancel(editingColor.index)}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pie Chart Editor Modal - контекстный */}
      {editingPieChart !== null && isEditable && (
        <div className="fixed inset-0 z-50">
          <div 
            className="bg-white rounded-lg p-6 max-w-sm w-full shadow-2xl border border-gray-200 absolute"
            style={{ 
              left: `${editingPieChart.position.x}px`, 
              top: `${editingPieChart.position.y}px`,
              transform: 'translate(-50%, -50%)',
              zIndex: 51
            }}
          >
            <h3 className="text-lg font-bold mb-4 text-gray-900">Редактирование сегмента</h3>
            <p className="text-sm text-gray-700 mb-4">Измените процент для выбранного сегмента.</p>
            
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: chartData.segments[editingPieChart.index].color }}
              />
              <span className="flex-1 text-sm font-medium text-gray-900">{chartData.segments[editingPieChart.index].label}</span>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm font-medium text-gray-900">Процент:</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                value={chartData.segments[editingPieChart.index].percentage}
                onChange={(e) => {
                  const newValue = parseFloat(e.target.value) || 0;
                  const newSegments = [...chartData.segments];
                  newSegments[editingPieChart.index] = { ...newSegments[editingPieChart.index], percentage: newValue };
                  
                  // Update the chart data immediately for preview
                  const newData = { 
                    title, 
                    chartData: { segments: newSegments }, 
                    monthlyData,
                    descriptionText
                  };
                  if (onUpdate) {
                    onUpdate(newData);
                  }
                }}
              />
              <span className="text-sm text-gray-700">%</span>
            </div>
            
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                onClick={() => handlePieChartSave(editingPieChart.index, chartData.segments[editingPieChart.index].percentage)}
              >
                Сохранить
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition-colors"
                onClick={handlePieChartCancel}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to sum array
function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

export default PieChartInfographicsTemplate;