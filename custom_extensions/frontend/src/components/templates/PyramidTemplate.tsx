import React, { useState, useRef, useEffect } from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

export interface PyramidItem {
  heading: string;
  description: string;
}

export interface PyramidTemplateProps {
  slideId: string;
  title: string;
  subtitle: string;
  steps: PyramidItem[];  // Changed from 'items' to 'steps'
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
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
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        boxSizing: 'border-box',
        display: 'block'
      }}
    />
  );
}

export const PyramidTemplate: React.FC<PyramidTemplateProps> = ({
  slideId,
  title,
  subtitle,
  steps = [],  // Changed from 'items' to 'steps'
  theme,
  onUpdate,
  isEditable = false
}: PyramidTemplateProps) => {
  const effectiveTheme = typeof theme === 'string' && theme.trim() !== '' ? theme : DEFAULT_SLIDE_THEME;
  const currentTheme = getSlideTheme(effectiveTheme);
  const { backgroundColor, titleColor, contentColor, accentColor } = currentTheme.colors;
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [editingItemHeadings, setEditingItemHeadings] = useState<number[]>([]);
  const [editingItemDescriptions, setEditingItemDescriptions] = useState<number[]>([]);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const slideStyles: React.CSSProperties = {
    backgroundColor,
    padding: '64px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: currentTheme.fonts.contentFont,
    minHeight: '600px',
    width: '100%',
  };

  const titleStyles: React.CSSProperties = {
    color: titleColor,
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    marginBottom: '16px',
    textAlign: 'left',
    wordWrap: 'break-word'
  };

  const subtitleStyles: React.CSSProperties = {
    color: contentColor,
    fontSize: currentTheme.fonts.contentSize,
    fontFamily: currentTheme.fonts.contentFont,
    marginBottom: '48px',
    maxWidth: '80%',
    lineHeight: 1.6,
    textAlign: 'left',
    wordWrap: 'break-word'
  };

  const mainContentStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    gap: '48px',
  };

  const pyramidContainerStyles: React.CSSProperties = {
    flex: '0 0 45%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px', // Remove gap between pyramid segments
    justifyContent: 'center',
  };

  const itemsContainerStyles: React.CSSProperties = {
    flex: '1 1 55%',
    position: 'relative', // Add this for absolute positioning
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '400px',
  };

  const itemWrapperStyles = (level: number): React.CSSProperties => {
    const topPositions = ['16.7%', '50%', '83.3%'];
    const leftOffsets = ['-250px', '-190px', '-120px'];
    return {
      position: 'absolute',
      width: '100%',
      top: topPositions[level],
      left: leftOffsets[level],
      transform: 'translateY(-50%)',
    };
  };
  
  const separatorLineStyles = (level: number): React.CSSProperties => {
      const topPositions = ['33.3%', '66.6%'];
      const leftOffsets = ['-250px', '-190px'];
      return {
          position: 'absolute',
          left: leftOffsets[level],
          right: 0,
          top: topPositions[level],
          height: '1px',
          backgroundColor: `${contentColor}40`, // Use theme color with 40% opacity
      }
  };

  const itemHeadingStyles: React.CSSProperties = {
    color: titleColor,
    fontSize: '1.5rem',
    fontFamily: currentTheme.fonts.titleFont,
    marginBottom: '8px',
    wordWrap: 'break-word'
  };

  const itemDescriptionStyles: React.CSSProperties = {
    color: contentColor,
    fontSize: currentTheme.fonts.contentSize,
    wordWrap: 'break-word'
  };

  // Handle title editing
  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  // Handle subtitle editing
  const handleSubtitleSave = (newSubtitle: string) => {
    if (onUpdate) {
      onUpdate({ subtitle: newSubtitle });
    }
    setEditingSubtitle(false);
  };

  const handleSubtitleCancel = () => {
    setEditingSubtitle(false);
  };

  // Handle item heading editing
  const handleItemHeadingSave = (index: number, newHeading: string) => {
    if (onUpdate && steps) {
      const updatedSteps = [...steps];
      updatedSteps[index] = { ...updatedSteps[index], heading: newHeading };
      onUpdate({ steps: updatedSteps });
    }
    setEditingItemHeadings(editingItemHeadings.filter(i => i !== index));
  };

  const handleItemHeadingCancel = (index: number) => {
    setEditingItemHeadings(editingItemHeadings.filter(i => i !== index));
  };

  // Handle item description editing
  const handleItemDescriptionSave = (index: number, newDescription: string) => {
    if (onUpdate && steps) {
      const updatedSteps = [...steps];
      updatedSteps[index] = { ...updatedSteps[index], description: newDescription };
      onUpdate({ steps: updatedSteps });
    }
    setEditingItemDescriptions(editingItemDescriptions.filter(i => i !== index));
  };

  const handleItemDescriptionCancel = (index: number) => {
    setEditingItemDescriptions(editingItemDescriptions.filter(i => i !== index));
  };

  const startEditingItemHeading = (index: number) => {
    setEditingItemHeadings([...editingItemHeadings, index]);
  };

  const startEditingItemDescription = (index: number) => {
    setEditingItemDescriptions([...editingItemDescriptions, index]);
  };

  // Helper function to create semi-transparent version of a color
  const getSemiTransparentColor = (color: string, opacity: number = 0.1): string => {
    // Convert hex to rgba if needed
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    // If it's already rgba, extract and modify
    if (color.startsWith('rgba')) {
      const match = color.match(/rgba?\(([^)]+)\)/);
      if (match) {
        const parts = match[1].split(',').map(p => p.trim());
        const r = parts[0];
        const g = parts[1];
        const b = parts[2];
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
    }
    // Handle rgb format (e.g., "rgb(0, 102, 79)")
    if (color.startsWith('rgb(')) {
      const match = color.match(/rgb\(([^)]+)\)/);
      if (match) {
        const parts = match[1].split(',').map(p => p.trim());
        const r = parts[0];
        const g = parts[1];
        const b = parts[2];
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
    }
    // Fallback to original color
    return color;
  };

  const PyramidSVG1 = () => {
    const pyramidFill = getSemiTransparentColor(accentColor, 0.2);
    const textFill = titleColor;

    return React.createElement('svg', { width: "560", height: "120", viewBox: "66 0 68 60" },
      // Segment 1 (Top Triangle)
      React.createElement('path', { d: "M 100,0 L 66.67,60 L 133.33,60 Z", fill: pyramidFill, stroke: accentColor, strokeWidth: "0.5" }),
      React.createElement('text', { x: "100", y: "35", textAnchor: "middle", fill: textFill, fontSize: "12", fontWeight: "bold" }, "1"),
    );
  };

  const PyramidSVG2 = () => {
    const pyramidFill = getSemiTransparentColor(accentColor, 0.15);
    const textFill = titleColor;

    return React.createElement('svg', { width: "560", height: "120", viewBox: "33 60 134 60" },
      // Segment 2 (Middle Trapezoid)
      React.createElement('path', { d: "M 66.67,60 L 33.33,120 L 166.67,120 L 133.33,60 Z", fill: pyramidFill, stroke: accentColor, strokeWidth: "0.5" }),
      React.createElement('text', { x: "100", y: "95", textAnchor: "middle", fill: textFill, fontSize: "12", fontWeight: "bold" }, "2"),
    );
  };

  const PyramidSVG3 = () => {
    const pyramidFill = getSemiTransparentColor(accentColor, 0.1);
    const textFill = titleColor;

    return React.createElement('svg', { width: "560", height: "120", viewBox: "0 120 200 60" },
      // Segment 3 (Bottom Trapezoid)
      React.createElement('path', { d: "M 33.33,120 L 0,180 L 200,180 L 166.67,120 Z", fill: pyramidFill, stroke: accentColor, strokeWidth: "0.5" }),
      React.createElement('text', { x: "100", y: "155", textAnchor: "middle", fill: textFill, fontSize: "12", fontWeight: "bold" }, "3")
    );
  };
      

  return (
    <div className="pyramid-template" style={slideStyles}>
      {/* Title - wrapped */}
      <div data-draggable="true" style={{ display: 'inline-block' }}>
        {isEditable && editingTitle ? (
          <InlineEditor
            initialValue={title || ''}
            onSave={handleTitleSave}
            onCancel={handleTitleCancel}
            multiline={true}
            placeholder="Enter slide title..."
            className="inline-editor-title"
            style={{
              ...titleStyles,
              // Ensure title behaves exactly like h1 element
              margin: '0',
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
              const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
              if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              if (isEditable) {
                setEditingTitle(true);
              }
            }}
            className={isEditable ? 'cursor-pointer border border-transparent hover-border-gray-300 hover-border-opacity-50' : ''}
          >
            {title || 'Click to add title'}
          </h1>
        )}
      </div>

      {/* Subtitle - wrapped */}
      {subtitle && (
        <div data-draggable="true" style={{ display: 'inline-block', width: '100%' }}>
          {isEditable && editingSubtitle ? (
            <InlineEditor
              initialValue={subtitle || ''}
              onSave={handleSubtitleSave}
              onCancel={handleSubtitleCancel}
              multiline={true}
              placeholder="Enter subtitle..."
              className="inline-editor-subtitle"
              style={{
                ...subtitleStyles,
                // Ensure subtitle behaves exactly like p element
                margin: '0',
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
            <p 
              style={subtitleStyles}
              onClick={(e) => {
                const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                if (isEditable) {
                  setEditingSubtitle(true);
                }
              }}
              className={isEditable ? 'cursor-pointer border border-transparent hover-border-gray-300 hover-border-opacity-50' : ''}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div style={mainContentStyles}>
        <div style={pyramidContainerStyles} data-draggable="true">
          <PyramidSVG1 />
          <PyramidSVG2 />
          <PyramidSVG3 />
        </div>
        <div style={itemsContainerStyles} >
          {Array.isArray(steps) && steps.slice(0, 3).map((item, index: number) => (
            <div key={index} style={itemWrapperStyles(index)}>
              {/* Item Heading */}
              <div data-draggable="true" style={{ width: '100%' }}>
                {isEditable && editingItemHeadings.includes(index) ? (
                  <InlineEditor
                    initialValue={item.heading || ''}
                    onSave={(newHeading) => handleItemHeadingSave(index, newHeading)}
                    onCancel={() => handleItemHeadingCancel(index)}
                    multiline={true}
                    placeholder="Enter heading..."
                    className="inline-editor-item-heading"
                    style={{
                      ...itemHeadingStyles,
                      // Ensure heading behaves exactly like div element
                      margin: '0',
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
                    style={itemHeadingStyles}
                    onClick={(e) => {
                      const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                      if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      if (isEditable) {
                        startEditingItemHeading(index);
                      }
                    }}
                    className={isEditable ? 'cursor-pointer border border-transparent hover-border-gray-300 hover-border-opacity-50' : ''}
                  >
                    {item.heading || 'Click to add heading'}
                  </div>
                )}
              </div>

              {/* Item Description */}
              <div data-draggable="true" style={{ width: '100%' }}>
                {isEditable && editingItemDescriptions.includes(index) ? (
                  <InlineEditor
                    initialValue={item.description || ''}
                    onSave={(newDescription) => handleItemDescriptionSave(index, newDescription)}
                    onCancel={() => handleItemDescriptionCancel(index)}
                    multiline={true}
                    placeholder="Enter description..."
                    className="inline-editor-item-description"
                    style={{
                      ...itemDescriptionStyles,
                      // Ensure description behaves exactly like div element
                      margin: '0',
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
                    style={itemDescriptionStyles}
                    onClick={(e) => {
                      const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                      if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      if (isEditable) {
                        startEditingItemDescription(index);
                      }
                    }}
                      className={isEditable ? 'cursor-pointer border border-transparent hover-border-gray-300 hover-border-opacity-50' : ''}
                  >
                    {item.description || 'Click to add description'}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div data-draggable="true" style={separatorLineStyles(0)}></div>
          <div data-draggable="true" style={separatorLineStyles(1)}></div>
        </div>
      </div>
    </div>
  );
};

export default PyramidTemplate;