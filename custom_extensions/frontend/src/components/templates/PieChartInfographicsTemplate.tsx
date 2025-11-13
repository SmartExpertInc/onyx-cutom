import React, { useState, useRef, useEffect } from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import { PieChartInfographicsTemplateProps } from '@/types/slideTemplates';
import { WysiwygEditor } from '@/components/editors/WysiwygEditor';

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
          <div data-draggable="true" style={{ display: 'inline-block' }}>
            {editingTitle && isEditable ? (
              <WysiwygEditor
                initialValue={title}
                onSave={handleTitleSave}
                onCancel={handleTitleCancel}
                placeholder="Enter title..."
                className="inline-editor-title"
                style={{
                  color: themeTitle,
                  fontSize: '3.5rem',
                  fontWeight: 'bold',
                  lineHeight: '1.2',
                  textAlign: 'center',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block'
                }}
              />
            ) : (
              <h1 
                className="text-6xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
                style={{ color: themeTitle }}
                onClick={(e) => {
                  const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                  if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  if (isEditable) {
                    startEditingTitle();
                  }
                }}
              >
                {title}
              </h1>
            )}
          </div>
          <div data-draggable="true" style={{ display: 'inline-block', marginTop: '1rem' }}>
            {editingDescText && isEditable ? (
              <WysiwygEditor
                initialValue={descriptionText}
                onSave={handleDescTextSave}
                onCancel={handleDescTextCancel}
                placeholder="Enter description..."
                className="inline-editor-description"
                style={{
                  color: themeContent,
                  fontSize: '1.125rem',
                  lineHeight: '1.6',
                  opacity: 0.7,
                  textAlign: 'center',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block'
                }}
              />
            ) : (
              <p 
                className="text-lg mt-4 opacity-70 cursor-pointer hover:opacity-80"
                style={{ color: themeContent }}
                onClick={(e) => {
                  const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                  if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  if (isEditable) {
                    startEditingDescText();
                  }
                }}
                dangerouslySetInnerHTML={{ __html: descriptionText }}
              />
            )}
          </div>
        </div>

        {/* Main Layout Container */}
        <div className="flex items-center justify-center gap-16">
          
          {/* Left Column - Segments 1-3 */}
          <div className="flex flex-col gap-8">
            {monthlyData.slice(0, 3).map((item, index) => (
              <div key={index} className="flex flex-col gap-2 max-w-xs">
                {/* Headline */}
                <div data-draggable="true" style={{ display: 'inline-block' }}>
                  <div 
                    className="font-bold text-lg cursor-pointer hover:opacity-80"
                    style={{ color: item.color }}
                  >
                    {editingSegment === index && isEditable ? (
                      <WysiwygEditor
                        initialValue={item.month}
                        onSave={(value) => handleSegmentSave(index, value)}
                        onCancel={() => handleSegmentCancel(index)}
                        placeholder="Enter headline..."
                        className="inline-editor-segment-headline"
                        style={{
                          color: item.color,
                          fontWeight: 'bold',
                          fontSize: '1.125rem',
                          padding: '8px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          wordWrap: 'break-word',
                          whiteSpace: 'pre-wrap',
                          boxSizing: 'border-box',
                          display: 'block',
                          lineHeight: '1.2'
                        }}
                      />
                    ) : (
                      <span 
                        onClick={(e) => {
                          const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                          if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                          }
                          if (isEditable) {
                            startEditingSegment(index);
                          }
                        }}
                        dangerouslySetInnerHTML={{ __html: item.month }}
                      />
                    )}
                  </div>
                </div>
                
                {/* Description */}
                <div data-draggable="true" style={{ display: 'inline-block', marginTop: '8px' }}>
                  <div className="text-gray-600 text-sm leading-relaxed">
                    {editingSegmentDesc === index && isEditable ? (
                      <WysiwygEditor
                        initialValue={item.description}
                        onSave={(value) => handleSegmentDescSave(index, value)}
                        onCancel={() => handleSegmentDescCancel(index)}
                        placeholder="Enter description..."
                        className="inline-editor-segment-description"
                        style={{
                          color: '#6B7280',
                          fontSize: '0.875rem',
                          lineHeight: '1.6',
                          width: '100%',
                          minHeight: '60px',
                          padding: '8px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          wordWrap: 'break-word',
                          whiteSpace: 'pre-wrap',
                          boxSizing: 'border-box',
                          display: 'block'
                        }}
                      />
                    ) : (
                      <div 
                        className="cursor-pointer hover:opacity-80"
                        onClick={(e) => {
                          const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                          if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                          }
                          if (isEditable) {
                            startEditingSegmentDesc(index);
                          }
                        }}
                        dangerouslySetInnerHTML={{ __html: item.description }}
                      />
                    )}
                  </div>
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
                  <div data-draggable="true" style={{ display: 'inline-block' }}>
                    <div 
                      className="font-bold text-lg cursor-pointer hover:opacity-80"
                      style={{ color: item.color }}
                    >
                      {editingSegment === actualIndex && isEditable ? (
                        <WysiwygEditor
                          initialValue={item.month}
                          onSave={(value) => handleSegmentSave(actualIndex, value)}
                          onCancel={() => handleSegmentCancel(actualIndex)}
                          placeholder="Enter headline..."
                          className="inline-editor-segment-headline"
                          style={{
                            color: item.color,
                            fontWeight: 'bold',
                            fontSize: '1.125rem',
                            padding: '8px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            wordWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                            boxSizing: 'border-box',
                            display: 'block',
                            lineHeight: '1.2'
                          }}
                        />
                      ) : (
                        <span 
                          onClick={(e) => {
                            const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                            if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                              e.preventDefault();
                              e.stopPropagation();
                              return;
                            }
                            if (isEditable) {
                              startEditingSegment(actualIndex);
                            }
                          }}
                          dangerouslySetInnerHTML={{ __html: item.month }}
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div data-draggable="true" style={{ display: 'inline-block', marginTop: '8px' }}>
                    <div className="text-gray-600 text-sm leading-relaxed">
                      {editingSegmentDesc === actualIndex && isEditable ? (
                        <WysiwygEditor
                          initialValue={item.description}
                          onSave={(value) => handleSegmentDescSave(actualIndex, value)}
                          onCancel={() => handleSegmentDescCancel(actualIndex)}
                          placeholder="Enter description..."
                          className="inline-editor-segment-description"
                          style={{
                            color: '#6B7280',
                            fontSize: '0.875rem',
                            lineHeight: '1.6',
                            width: '100%',
                            minHeight: '60px',
                            padding: '8px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            wordWrap: 'break-word',
                            whiteSpace: 'pre-wrap',
                            boxSizing: 'border-box',
                            display: 'block'
                          }}
                        />
                      ) : (
                        <div 
                          className="cursor-pointer hover:opacity-80"
                          onClick={(e) => {
                            const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                            if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                              e.preventDefault();
                              e.stopPropagation();
                              return;
                            }
                            if (isEditable) {
                              startEditingSegmentDesc(actualIndex);
                            }
                          }}
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      )}
                    </div>
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
