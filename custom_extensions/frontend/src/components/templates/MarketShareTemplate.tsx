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

export const MarketShareTemplate: React.FC<MarketShareTemplateProps & {
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
  getPlaceholderGenerationState?: (elementId: string) => { isGenerating: boolean; hasImage: boolean; error?: string };
}> = ({
  slideId,
  title = 'The new os solution',
  subtitle = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium ?',
  chartData = [
    { label: '2019', percentage: 48, color: '#4A70E8' },
    { label: '2020', percentage: 61, color: '#FF8C00' },
    { label: '2021', percentage: 83, color: '#32CD32' },
    { label: '2022', percentage: 74, color: '#8A2BE2' }
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
  const [editingPercentage, setEditingPercentage] = useState<number | null>(null);

  // Refs for MoveableManager integration
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);

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

  const handlePercentageSave = (index: number, newValue: string) => {
    if (onUpdate) {
      const newChartData = [...chartData];
      newChartData[index] = { ...newChartData[index], percentage: parseFloat(newValue) || 0 };
      onUpdate({ chartData: newChartData });
    }
    setEditingPercentage(null);
  };

  const handlePercentageCancel = () => {
    setEditingPercentage(null);
  };

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
    minHeight: '600px',
    background: currentTheme.colors.backgroundColor,
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    fontFamily: currentTheme.fonts.contentFont,
    overflow: 'hidden'
  };

  // Left section with title, subtitle and numbered list (blue background)
  const leftSectionStyles: React.CSSProperties = {
    width: '45%',
    height: '600px',
    position: 'absolute',
    left: '0',
    top: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    background: currentTheme.colors.eventListGradient || currentTheme.colors.backgroundColor,
    padding: '60px 40px',
    zIndex: 2
  };

  // Right section with bar chart (white background)
  const rightSectionStyles: React.CSSProperties = {
    width: '55%',
    height: '600px',
    position: 'absolute',
    right: '0',
    top: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: currentTheme.colors.rightSectionBackgroundColor || '#ffffff',
    padding: '40px',
    zIndex: 1
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '3rem',
    fontFamily: currentTheme.fonts.titleFont,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: '20px',
    wordWrap: 'break-word',
    lineHeight: '1.1'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '1.1rem',
    color: '#ffffff',
    marginBottom: '40px',
    fontFamily: currentTheme.fonts.contentFont,
    wordWrap: 'break-word',
    lineHeight: '1.4'
  };

  const listItemStyles: React.CSSProperties = {
    fontSize: '1.1rem',
    color: '#ffffff',
    marginBottom: '20px',
    fontFamily: currentTheme.fonts.contentFont,
    wordWrap: 'break-word',
    lineHeight: '1.4',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  };

  const squareStyles = (color: string): React.CSSProperties => ({
    width: '24px',
    height: '24px',
    backgroundColor: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: '2px'
  });

  const squareTextStyles: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
    fontFamily: currentTheme.fonts.titleFont,
    lineHeight: '1'
  };

  // Chart styles
  const chartContainerStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: '400px',
    height: '300px',
    position: 'relative',
    display: 'flex',
    alignItems: 'end',
    justifyContent: 'space-between',
    padding: '20px'
  };

  const barStyles = (height: number, color: string): React.CSSProperties => ({
    width: '60px',
    height: `${height * 2.5}px`,
    background: `linear-gradient(to top, ${color}dd, ${color})`,
    borderRadius: '4px 4px 0 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  });

  const barTextStyles: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    fontFamily: currentTheme.fonts.titleFont
  };

  const yearLabelStyles: React.CSSProperties = {
    fontSize: '14px',
    color: currentTheme.colors.contentColor,
    fontFamily: currentTheme.fonts.contentFont,
    textAlign: 'center',
    marginTop: '10px'
  };

  const gridLineStyles: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '1px',
    backgroundColor: '#e0e0e0',
    opacity: 0.5
  };

  const yAxisLabelStyles: React.CSSProperties = {
    position: 'absolute',
    left: '-40px',
    fontSize: '12px',
    color: currentTheme.colors.contentColor,
    fontFamily: currentTheme.fonts.contentFont
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
            <InlineEditor
              initialValue={title}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={true}
              placeholder="Enter slide title..."
              className="inline-editor-title"
              style={{
                ...titleStyles,
                padding: '0',
                border: 'none',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block'
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
            >
              {title}
            </h1>
          )}
        </div>

        {/* Subtitle */}
        <div 
          ref={subtitleRef}
          data-moveable-element={`${slideId}-subtitle`}
          data-draggable="true"
        >
          {isEditable && editingSubtitle ? (
            <InlineEditor
              initialValue={subtitle}
              onSave={handleSubtitleSave}
              onCancel={handleSubtitleCancel}
              multiline={true}
              placeholder="Enter subtitle..."
              className="inline-editor-subtitle"
              style={{
                ...subtitleStyles,
                padding: '0',
                border: 'none',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block'
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
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Numbered list */}
        <div style={{ width: '100%' }}>
          {chartData.map((item, index) => (
            <div key={index} style={listItemStyles}>
              <div style={squareStyles(item.color)}>
                <span style={squareTextStyles}>
                  {index + 1}
                </span>
              </div>
              {isEditable && editingListItem === index ? (
                <InlineEditor
                  initialValue={item.description || 'Lorem ipsum dolor sit amet'}
                  onSave={(value) => handleListItemSave(index, value)}
                  onCancel={handleListItemCancel}
                  multiline={false}
                  placeholder="Enter list item..."
                  className="inline-editor-list-item"
                  style={{
                    padding: '0',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    overflow: 'hidden',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    boxSizing: 'border-box',
                    display: 'block',
                    flex: 1,
                    color: '#ffffff',
                    fontSize: '1.1rem',
                    fontFamily: currentTheme.fonts.contentFont
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
                >
                  {item.description || 'Lorem ipsum dolor sit amet'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right section with bar chart */}
      <div style={rightSectionStyles}>
        {/* Bar Chart */}
        <div 
          ref={chartRef}
          data-moveable-element={`${slideId}-chart`}
          data-draggable="true"
          style={chartContainerStyles}
        >
          {/* Y-axis grid lines and labels */}
          {[0, 20, 40, 60, 80, 100].map((value) => (
            <div key={value} style={{
              ...gridLineStyles,
              top: `${100 - value}%`
            }} />
          ))}
          
          {[0, 20, 40, 60, 80, 100].map((value) => (
            <div key={value} style={{
              ...yAxisLabelStyles,
              top: `${100 - value}%`
            }}>
              {value}
            </div>
          ))}

          {/* Chart bars */}
          {chartData.map((item, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Bar */}
              <div style={barStyles(item.percentage, item.color)}>
                <span style={barTextStyles}>
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              
              {/* Year label */}
              <div>
                {isEditable && editingYear === index ? (
                  <InlineEditor
                    initialValue={item.label}
                    onSave={(value) => handleYearSave(index, value)}
                    onCancel={handleYearCancel}
                    multiline={false}
                    placeholder="Enter year..."
                    className="inline-editor-year"
                    style={{
                      ...yearLabelStyles,
                      padding: '0',
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                      overflow: 'hidden',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      boxSizing: 'border-box',
                      display: 'block',
                      width: '60px',
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
                  >
                    {item.label}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketShareTemplate;