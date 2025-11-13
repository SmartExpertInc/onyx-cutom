// custom_extensions/frontend/src/components/templates/MarketShareTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import { MarketShareTemplateProps } from '@/types/slideTemplates';
import { WysiwygEditor } from '@/components/editors/WysiwygEditor';

export const MarketShareTemplate: React.FC<MarketShareTemplateProps & {
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
  getPlaceholderGenerationState?: (elementId: string) => { isGenerating: boolean; hasImage: boolean; error?: string };
}> = ({
  slideId,
  title = 'The new os solution',
  subtitle = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium ?',
  chartData = [
    { label: '2019', percentage: 48, color: '#4A70E8', gradientStart: '#87CEEB', gradientEnd: '#4682B4' },
    { label: '2020', percentage: 61, color: '#FF8C00', gradientStart: '#FFA07A', gradientEnd: '#FF8C00' },
    { label: '2021', percentage: 83, color: '#32CD32', gradientStart: '#90EE90', gradientEnd: '#3CB371' },
    { label: '2022', percentage: 74, color: '#8A2BE2', gradientStart: '#DDA0DD', gradientEnd: '#9370DB' }
  ],
  bottomText = '',
  theme,
  onUpdate,
  isEditable = false,
  imagePrompt,
  imageAlt,
  imagePath,
  widthPx,
  heightPx,
  imageScale,
  imageOffset,
  objectFit,
  getPlaceholderGenerationState
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);

  // State for inline editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [editingListItem, setEditingListItem] = useState<number | null>(null);
  const [editingYear, setEditingYear] = useState<number | null>(null);
  const [editingHeight, setEditingHeight] = useState<number | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [dragStartY, setDragStartY] = useState<number>(0);
  const [dragStartHeight, setDragStartHeight] = useState<number>(0);
  const [dragCurrentHeight, setDragCurrentHeight] = useState<number | null>(null);
  
  // Use refs to avoid closure issues in event handlers
  const dragStateRef = useRef<{
    isDragging: number | null;
    dragStartY: number;
    dragStartHeight: number;
    dragCurrentHeight: number | null;
  }>({
    isDragging: null,
    dragStartY: 0,
    dragStartHeight: 0,
    dragCurrentHeight: null
  });
  
  // Update ref when state changes
  useEffect(() => {
    dragStateRef.current = {
      isDragging,
      dragStartY,
      dragStartHeight,
      dragCurrentHeight
    };
  }, [isDragging, dragStartY, dragStartHeight, dragCurrentHeight]);

  // Refs for MoveableManager integration
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const barsContainerRef = useRef<HTMLDivElement>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  
  // State for actual bars container height (for accurate bar rendering)
  const [barsContainerHeight, setBarsContainerHeight] = useState<number | null>(null);
  
  // Measure bars container height on mount and resize
  useEffect(() => {
    const measureBarsContainer = () => {
      if (barsContainerRef.current) {
        const height = barsContainerRef.current.getBoundingClientRect().height;
        setBarsContainerHeight(height);
      }
    };
    
    measureBarsContainer();
    
    // Re-measure on window resize
    window.addEventListener('resize', measureBarsContainer);
    return () => window.removeEventListener('resize', measureBarsContainer);
  }, []);

  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  const handleSubtitleSave = (newSubtitle: string) => {
    if (onUpdate) {
      onUpdate({ subtitle: newSubtitle });
    }
    setEditingSubtitle(false);
  };

  const handleSubtitleCancel = () => {
    setEditingSubtitle(false);
  };

  const handleListItemSave = (index: number, newText: string) => {
    if (onUpdate) {
      const newChartData = [...chartData];
      newChartData[index] = { ...newChartData[index], description: newText };
      onUpdate({ chartData: newChartData });
    }
    setEditingListItem(null);
  };

  const handleListItemCancel = () => {
    setEditingListItem(null);
  };

  const handleYearSave = (index: number, newYear: string) => {
    if (onUpdate) {
      const newChartData = [...chartData];
      newChartData[index] = { ...newChartData[index], label: newYear };
      onUpdate({ chartData: newChartData });
    }
    setEditingYear(null);
  };

  const handleYearCancel = () => {
    setEditingYear(null);
  };

  const handleHeightSave = (index: number, newHeight: string) => {
    const height = Math.min(100, Math.max(0, parseInt(newHeight) || 0));
    if (onUpdate) {
      const newChartData = [...chartData];
      newChartData[index] = { ...newChartData[index], percentage: height };
      onUpdate({ chartData: newChartData });
    }
    setEditingHeight(null);
  };

  const handleHeightCancel = () => {
    setEditingHeight(null);
  };

  // Function to add new column
  const addColumn = () => {
    if (onUpdate) {
      const colors = ['#4A70E8', '#FF8C00', '#32CD32', '#8A2BE2', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
      const gradients = [
        { start: '#87CEEB', end: '#4682B4' },
        { start: '#FFA07A', end: '#FF8C00' },
        { start: '#90EE90', end: '#3CB371' },
        { start: '#DDA0DD', end: '#9370DB' },
        { start: '#FFB6C1', end: '#FF69B4' },
        { start: '#AFEEEE', end: '#20B2AA' },
        { start: '#87CEEB', end: '#4682B4' },
        { start: '#98FB98', end: '#90EE90' },
        { start: '#F0E68C', end: '#DAA520' },
        { start: '#DDA0DD', end: '#BA55D3' }
      ];
      
      const newIndex = chartData.length;
      const colorIndex = newIndex % colors.length;
      const gradientIndex = newIndex % gradients.length;
      
      const newColumn = {
        label: `${2023 + newIndex}`,
        percentage: 50,
        color: colors[colorIndex],
        gradientStart: gradients[gradientIndex].start,
        gradientEnd: gradients[gradientIndex].end,
        description: 'Lorem ipsum dolor sit amet'
      };
      
      onUpdate({ chartData: [...chartData, newColumn] });
    }
  };

  // Function to remove column
  const removeColumn = (index: number) => {
    if (onUpdate && chartData.length > 1) {
      const newChartData = chartData.filter((_, i) => i !== index);
      onUpdate({ chartData: newChartData });
    }
  };

  // Drag resize functions
  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent DragEnhancer from handling this event
    // Use native event for stopImmediatePropagation
    if (e.nativeEvent) {
      e.nativeEvent.stopImmediatePropagation();
    }
    
    const initialHeight = chartData[index].percentage;
    setIsDragging(index);
    setDragStartY(e.clientY);
    setDragStartHeight(initialHeight);
    setDragCurrentHeight(initialHeight);
    
    // Update ref immediately
    dragStateRef.current = {
      isDragging: index,
      dragStartY: e.clientY,
      dragStartHeight: initialHeight,
      dragCurrentHeight: initialHeight
    };
  };

  // Add event listeners for drag
  useEffect(() => {
    if (isDragging === null) return;
    
    // Get the actual bars container height for accurate calculations
    const getChartHeight = () => {
      // Use the bars container ref for accurate measurement
      if (barsContainerRef.current) {
        const container = barsContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        // The bars container now matches the grid lines container (top: 0, bottom: 30px)
        // This gives us the full usable height for bars
        return Math.max(containerRect.height, 300); // Minimum 300px for safety
      }
      // Fallback: try chart container minus bottom padding only (top is now included)
      if (chartRef.current) {
        const container = chartRef.current;
        const containerRect = container.getBoundingClientRect();
        // Bars container starts at top: 0, so only subtract bottom padding (30px)
        const usableHeight = containerRect.height - 30;
        return Math.max(usableHeight, 300);
      }
      // Final fallback
      return 400;
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      e.stopPropagation(); // Prevent DragEnhancer from handling this event
      
      const state = dragStateRef.current;
      if (state.isDragging === null) return;
      
      const chartHeight = getChartHeight();
      const deltaY = state.dragStartY - e.clientY; // Inverted because Y increases downward
      // Calculate percentage change: deltaY pixels / chartHeight pixels * 100%
      const deltaPercentage = (deltaY / chartHeight) * 100;
      const newHeight = Math.min(100, Math.max(0, state.dragStartHeight + deltaPercentage));
      
      // Update both state and ref for visual feedback during drag
      setDragCurrentHeight(newHeight);
      dragStateRef.current.dragCurrentHeight = newHeight;
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.stopPropagation(); // Prevent DragEnhancer from handling this event
      
      const state = dragStateRef.current;
      if (state.isDragging !== null && state.dragCurrentHeight !== null && onUpdate) {
        // Only call onUpdate once when drag ends with the final height
        const finalHeight = state.dragCurrentHeight;
        const newChartData = [...chartData];
        newChartData[state.isDragging] = { 
          ...newChartData[state.isDragging], 
          percentage: finalHeight 
        };
        onUpdate({ chartData: newChartData });
      }
      
      setIsDragging(null);
      setDragStartY(0);
      setDragStartHeight(0);
      setDragCurrentHeight(null);
      
      // Reset ref
      dragStateRef.current = {
        isDragging: null,
        dragStartY: 0,
        dragStartHeight: 0,
        dragCurrentHeight: null
      };
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, chartData, onUpdate]);

  // Handle image upload
  const handleImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ imagePath: newImagePath });
    }
  };

  // Handle size and transform changes for the placeholder
  const handleSizeTransformChange = (payload: any) => {
    if (onUpdate) {
      const updateData: any = {};
      
      if (payload.imagePosition) {
        updateData.imageOffset = payload.imagePosition;
      }
      
      if (payload.imageSize) {
        updateData.widthPx = payload.imageSize.width;
        updateData.heightPx = payload.imageSize.height;
      }
      
      if (payload.objectFit) {
        updateData.objectFit = payload.objectFit;
      }
      
      onUpdate(updateData);
    }
  };

  // AI prompt logic
  const displayPrompt = imagePrompt || imageAlt || 'bar chart illustration for market share data';

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '600px',
    background: currentTheme.colors.backgroundColor,
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    fontFamily: currentTheme.fonts.contentFont,
    overflow: 'hidden'
  };

  // Left section with title, subtitle and numbered list (theme gradient background) - 40% width
  const leftSectionStyles: React.CSSProperties = {
    width: '40%',
    height: '100%',
    position: 'absolute',
    left: '0',
    top: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    background: currentTheme.colors.marketShareGradient || currentTheme.colors.backgroundColor, // Use MarketShare gradient or fallback
    padding: '35px',
    zIndex: 2
  };

  // Right section with bar chart (white background) - 60% width
  const rightSectionStyles: React.CSSProperties = {
    width: '60%',
    height: '100%',
    position: 'absolute',
    right: '0',
    top: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    padding: '40px',
    zIndex: 1
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '2.4rem', // Large title as in photo
    fontFamily: 'Georgia, serif', // Serif font as in photo
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: '20px',
    wordWrap: 'break-word',
    lineHeight: '1.1'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '1rem', // Subtitle size as in photo
    color: '#ffffff',
    marginBottom: '50px',
    fontFamily: 'Arial, sans-serif', // Sans-serif as in photo
    wordWrap: 'break-word',
    lineHeight: '1.4',
    opacity: 0.8
  };

  const listItemStyles: React.CSSProperties = {
    fontSize: '1rem', // List item size as in photo
    color: '#ffffff',
    marginBottom: '25px',
    fontFamily: 'Arial, sans-serif',
    wordWrap: 'break-word',
    lineHeight: '1.4',
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  };

  const squareStyles = (color: string): React.CSSProperties => ({
    width: '28px',
    height: '28px',
    backgroundColor: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: '2px'
  });

  const squareTextStyles: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1'
  };

  // Chart styles - exact match to photo with perfect alignment
  const chartContainerStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: '700px',
    height: '100%', // Use full height of right section
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: '20px',
    paddingLeft: '80px',
    paddingRight: '40px',
    paddingBottom: '30px',
    paddingTop: '50px',
    boxSizing: 'border-box' // Include padding in height calculation
  };

  // Calculate bar height as percentage of available container height
  // The bars container has height: calc(100% - 80px) which accounts for padding
  // For initial render, we'll use a reasonable estimate, but drag will use actual measurements
  const getBarHeightPx = (percentage: number, containerHeight?: number): number => {
    // If we have the actual container height, use it
    if (containerHeight) {
      return (percentage / 100) * containerHeight;
    }
    // For initial render, estimate based on right section height
    // Right section: 60% of 600px = 360px, minus 80px padding = 280px usable
    // But to allow full 100% range, we'll use a larger base for initial render
    const estimatedUsableHeight = 400; // This will be corrected by actual measurements during drag
    return (percentage / 100) * estimatedUsableHeight;
  };

  const barStyles = (height: number, gradientStart: string, gradientEnd: string, containerHeight?: number): React.CSSProperties => ({
    width: '90px',
    height: `${getBarHeightPx(height, containerHeight)}px`, // Use dynamic height calculation
    background: `linear-gradient(to bottom, ${gradientStart}, ${gradientEnd})`,
    borderRadius: '8px 8px 0 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  });

  const barTextStyles: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 'bold',
    fontFamily: 'Arial, sans-serif'
  };

  const yearLabelStyles: React.CSSProperties = {
    fontSize: '16px',
    color: currentTheme.colors.contentColor || '#09090B',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    marginTop: '15px'
  };

  const gridLineStyles: React.CSSProperties = {
    position: 'absolute',
    left: '0',
    right: '0',
    height: '1px',
    backgroundColor: '#E0E0E0',
    opacity: 0.8,
    zIndex: 0
  };

  const yAxisLabelStyles: React.CSSProperties = {
    position: 'absolute',
    left: '10px',
    fontSize: '14px',
    color: '#999999',
    fontFamily: 'Arial, sans-serif',
    fontWeight: '500',
    transform: 'translateY(-50%)'
  };

  return (
    <div ref={slideContainerRef} className="market-share-template" style={slideStyles}>
      {/* Left section with title, subtitle and numbered list (blue background) */}
      <div style={leftSectionStyles}>
        {/* Title */}
        <div 
          ref={titleRef}
          data-moveable-element={`${slideId}-title`}
          data-draggable="true"
        >
          {isEditable && editingTitle ? (
            <WysiwygEditor
              initialValue={title}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              placeholder="Enter slide title..."
              className="inline-editor-title"
              style={{
                ...titleStyles,
                padding: '8px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block',
                lineHeight: '1.1'
              }}
            />
          ) : (
            <h1 
              style={titleStyles}
              onClick={(e) => {
                if (e.currentTarget.getAttribute('data-just-dragged') === 'true') {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                if (isEditable) {
                  setEditingTitle(true);
                }
              }}
              className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
              dangerouslySetInnerHTML={{ __html: title }}
            />
          )}
        </div>

        {/* Subtitle */}
        <div 
          ref={subtitleRef}
          data-moveable-element={`${slideId}-subtitle`}
          data-draggable="true"
        >
          {isEditable && editingSubtitle ? (
            <WysiwygEditor
              initialValue={subtitle}
              onSave={handleSubtitleSave}
              onCancel={handleSubtitleCancel}
              placeholder="Enter subtitle..."
              className="inline-editor-subtitle"
              style={{
                ...subtitleStyles,
                padding: '8px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block',
                lineHeight: '1.4'
              }}
            />
          ) : (
            <div 
              style={subtitleStyles}
              onClick={(e) => {
                if (e.currentTarget.getAttribute('data-just-dragged') === 'true') {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                if (isEditable) {
                  setEditingSubtitle(true);
                }
              }}
              className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
              dangerouslySetInnerHTML={{ __html: subtitle }}
            />
          )}
        </div>

        {/* Numbered list */}
        <div data-draggable="true" style={{ width: '100%' }}>
          {chartData.map((item, index) => (
            <div key={index} style={listItemStyles}>
              <div style={squareStyles(item.color)}>
                <span style={squareTextStyles}>
                  {index + 1}
                </span>
              </div>
              {isEditable && editingListItem === index ? (
                <WysiwygEditor
                  initialValue={item.description || 'Lorem ipsum dolor sit amet'}
                  onSave={(value) => handleListItemSave(index, value)}
                  onCancel={handleListItemCancel}
                  placeholder="Enter list item..."
                  className="inline-editor-list-item"
                  style={{
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    boxSizing: 'border-box',
                    display: 'block',
                    lineHeight: '1.4',
                    flex: 1,
                    color: '#ffffff',
                    fontSize: '1.3rem',
                    fontFamily: 'Arial, sans-serif'
                  }}
                />
              ) : (
                <span
                  style={{ flex: 1 }}
                  onClick={(e) => {
                    if (e.currentTarget.getAttribute('data-just-dragged') === 'true') {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    if (isEditable) {
                      setEditingListItem(index);
                    }
                  }}
                  className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                  dangerouslySetInnerHTML={{ __html: item.description || 'Lorem ipsum dolor sit amet' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right section with bar chart */}
      <div style={rightSectionStyles}>
        {/* Add Column Button */}
        {isEditable && (
          <button
            onClick={addColumn}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: currentTheme.colors.accentColor || '#4A70E8',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = currentTheme.colors.accentColor || '#3A5BC7';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = currentTheme.colors.accentColor || '#4A70E8';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title="Add new column"
          >
            +
          </button>
        )}

        {/* Bar Chart */}
        <div 
          ref={chartRef}
          data-moveable-element={`${slideId}-chart`}
          data-draggable="true"
          style={{
            ...chartContainerStyles,
            position: 'relative'
          }}
        >
          {/* Grid lines container */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '80px',
            right: '0',
            bottom: '30px',
            pointerEvents: 'none'
          }}>
            {/* Y-axis labels and grid lines */}
            {[100, 80, 60, 40, 20, 0].map((value) => {
              const topPosition = value === 0 ? 100 : ((100 - value) / 100) * 100;
              return (
                <div key={value} style={{
                  position: 'absolute',
                  top: `${topPosition}%`,
                  left: '0',
                  right: '0',
                  height: '1px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {/* Y-axis label */}
                  <div style={{
                    position: 'absolute',
                    left: '-50px',
                    fontSize: '14px',
                    color: currentTheme.colors.contentColor || '#09090B',
                    fontFamily: 'Arial, sans-serif',
                    fontWeight: '500',
                    transform: value === 0 ? 'translateY(50%)' : 'translateY(-50%)'
                  }}>
                    {value}
                  </div>
                  {/* Grid line - hide for 0 */}
                  {value !== 0 && (
                    <div style={{
                      width: '100%',
                      height: '1px',
                      backgroundColor: '#E0E0E0',
                      opacity: 0.6
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Chart bars */}
          <div 
            ref={barsContainerRef}
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-evenly',
              gap: '20px',
              position: 'absolute',
              top: '0', // Match grid lines container
              left: '80px', // Match grid lines container
              right: '0', // Match grid lines container
              bottom: '30px', // Match grid lines container
              height: 'auto', // Will be calculated by absolute positioning
              width: 'auto', // Will be calculated by absolute positioning
              zIndex: 1
            }}
          >
            {chartData.map((item, index) => (
              <div 
                key={index} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                  position: 'relative'
                }}
                onMouseEnter={() => setHoveredColumn(index)}
                onMouseLeave={() => setHoveredColumn(null)}
              >

                {/* Bar with height editing and drag resize */}
                <div 
                  data-no-drag="true"
                  style={{
                    ...barStyles(
                      isDragging === index && dragCurrentHeight !== null ? dragCurrentHeight : item.percentage, 
                      item.gradientStart || item.color, 
                      item.gradientEnd || item.color,
                      barsContainerHeight || undefined
                    ),
                    cursor: isEditable ? (isDragging === index ? 'grabbing' : 'grab') : 'default',
                    userSelect: 'none'
                  }}
                  onMouseDown={(e) => {
                    if (isEditable) {
                      handleMouseDown(e, index);
                    }
                  }}
                  onClick={(e) => {
                    if (e.currentTarget.getAttribute('data-just-dragged') === 'true') {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                  }}
                  className={isEditable ? 'cursor-pointer' : ''}
                >
                  <span style={barTextStyles}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  
                  {/* Delete button - appears on hover at the top of the bar */}
                  {isEditable && hoveredColumn === index && chartData.length > 1 && (
                    <button
                      onClick={() => removeColumn(index)}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: currentTheme.colors.accentColor || '#ff4444',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        zIndex: 10,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                      title="Remove column"
                    >
                      ×
                    </button>
                  )}
                </div>
                
                {/* Year label */}
                <div style={{ 
                  position: 'absolute', 
                  bottom: '-30px',
                  width: '90px',
                  textAlign: 'center'
                }}>
                  {isEditable && editingYear === index ? (
                    <WysiwygEditor
                      initialValue={item.label}
                      onSave={(value) => handleYearSave(index, value)}
                      onCancel={handleYearCancel}
                      placeholder="Enter year..."
                      className="inline-editor-year"
                      style={{
                        ...yearLabelStyles,
                        padding: '8px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                        boxSizing: 'border-box',
                        display: 'block',
                        lineHeight: '1.2',
                        width: '90px',
                        textAlign: 'center'
                      }}
                    />
                  ) : (
                    <div
                      style={yearLabelStyles}
                      onClick={(e) => {
                        if (e.currentTarget.getAttribute('data-just-dragged') === 'true') {
                          e.preventDefault();
                          e.stopPropagation();
                          return;
                        }
                        if (isEditable) {
                          setEditingYear(index);
                        }
                      }}
                      className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                      dangerouslySetInnerHTML={{ __html: item.label }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketShareTemplate;