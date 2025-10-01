import React, { useState, useRef, useEffect } from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

export interface PyramidItem {
  heading: string;
  description: string;
  number: string;
}

export interface PyramidTemplateProps {
  slideId: string;
  title: string;
  steps: PyramidItem[];
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
  steps = [],
  theme,
  onUpdate,
  isEditable = false
}: PyramidTemplateProps) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, contentColor, accentColor } = currentTheme.colors;
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingItemHeadings, setEditingItemHeadings] = useState<number[]>([]);
  const [editingItemDescriptions, setEditingItemDescriptions] = useState<number[]>([]);
  const [editingItemNumbers, setEditingItemNumbers] = useState<number[]>([]);
  const autoSaveTimeoutRef = useRef<number | null>(null);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const slideStyles: React.CSSProperties = {
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', // Subtle gradient background
    padding: '50px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Georgia, serif', // Serif font as in photo
    minHeight: '600px',
    width: '100%',
    position: 'relative',
    overflow: 'hidden'
  };

  const titleStyles: React.CSSProperties = {
    color: '#000000', // Black title as in photo
    fontSize: '2.5rem',
    fontFamily: 'Georgia, serif',
    marginBottom: '40px',
    textAlign: 'left',
    wordWrap: 'break-word',
    fontWeight: 'bold'
  };

  const mainContentStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    position: 'relative',
    height: '500px'
  };

  // Pyramid level colors exactly as in photo
  const pyramidColors = [
    '#3388FF', // Bright blue (top)
    '#00BFFF', // Cyan/teal blue (second)
    '#007BFF', // Standard blue (third)
    '#6A0DAD', // Purple blue (fourth)
    '#191970'  // Deep indigo (bottom)
  ];

  // Pyramid level dimensions and positions exactly as in photo
  const pyramidLevelStyles = (index: number): React.CSSProperties => {
    const widths = [140, 200, 260, 320, 400]; // Increasing widths
    const heights = [70, 70, 70, 70, 70]; // Same height for all levels
    const topPositions = [0, 70, 140, 210, 280]; // Stacked positions
    
    return {
      position: 'absolute',
      width: `${widths[index]}px`,
      height: `${heights[index]}px`,
      top: `${topPositions[index]}px`,
      left: '50%',
      transform: 'translateX(-50%)',
      background: pyramidColors[index],
      clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)', // Trapezoid shape
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end', // Right-align content
      paddingRight: '20px', // Add padding for speech bubble and number
      zIndex: 5 - index // Higher levels have higher z-index
    };
  };

  // Speech bubble styles
  const speechBubbleStyles: React.CSSProperties = {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const speechBubbleIconStyles: React.CSSProperties = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#3388FF',
    position: 'relative'
  };

  // Number styles
  const numberStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif'
  };

  // Text block positioning exactly as in photo
  const textBlockStyles = (index: number): React.CSSProperties => {
    const positions = [
      { top: '10px', right: '15%' },   // Level 0 - top right
      { top: '80px', left: '15%' },    // Level 1 - top left
      { top: '150px', right: '15%' },  // Level 2 - middle right
      { top: '220px', left: '15%' },   // Level 3 - middle left
      { top: '290px', left: '15%' }    // Level 4 - bottom left
    ];
    
    const pos = positions[index];
    return {
      position: 'absolute',
      ...pos,
      width: '25%',
      maxWidth: '280px',
      zIndex: 10
    };
  };

  const textHeadingStyles: React.CSSProperties = {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Georgia, serif',
    marginBottom: '8px',
    wordWrap: 'break-word'
  };

  const textDescriptionStyles: React.CSSProperties = {
    fontSize: '0.85rem',
    color: '#000000',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.4,
    wordWrap: 'break-word'
  };

  // Triangle arrow styles exactly as in photo
  const triangleStyles = (index: number): React.CSSProperties => {
    const positions = [
      { top: '45px', right: '25%' },   // Level 0 - top right
      { top: '115px', left: '25%' },   // Level 1 - top left
      { top: '185px', right: '25%' },  // Level 2 - middle right
      { top: '255px', left: '25%' },   // Level 3 - middle left
      { top: '325px', left: '25%' }    // Level 4 - bottom left
    ];
    
    const pos = positions[index];
    return {
      position: 'absolute',
      ...pos,
      width: '0',
      height: '0',
      borderLeft: '8px solid transparent',
      borderRight: '8px solid transparent',
      borderTop: '12px solid #0F58F9', // Blue triangle
      zIndex: 10
    };
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

  // Handle item heading editing
  const handleItemHeadingSave = (index: number, newHeading: string) => {
    if (onUpdate && steps) {
      const updatedSteps = [...steps];
      updatedSteps[index] = { ...updatedSteps[index], heading: newHeading };
      onUpdate({ steps: updatedSteps });
    }
    setEditingItemHeadings(editingItemHeadings.filter((i: number) => i !== index));
  };

  const handleItemHeadingCancel = (index: number) => {
    setEditingItemHeadings(editingItemHeadings.filter((i: number) => i !== index));
  };

  // Handle item description editing
  const handleItemDescriptionSave = (index: number, newDescription: string) => {
    if (onUpdate && steps) {
      const updatedSteps = [...steps];
      updatedSteps[index] = { ...updatedSteps[index], description: newDescription };
      onUpdate({ steps: updatedSteps });
    }
    setEditingItemDescriptions(editingItemDescriptions.filter((i: number) => i !== index));
  };

  const handleItemDescriptionCancel = (index: number) => {
    setEditingItemDescriptions(editingItemDescriptions.filter((i: number) => i !== index));
  };

  // Handle item number editing
  const handleItemNumberSave = (index: number, newNumber: string) => {
    if (onUpdate && steps) {
      const updatedSteps = [...steps];
      updatedSteps[index] = { ...updatedSteps[index], number: newNumber };
      onUpdate({ steps: updatedSteps });
    }
    setEditingItemNumbers(editingItemNumbers.filter((i: number) => i !== index));
  };

  const handleItemNumberCancel = (index: number) => {
    setEditingItemNumbers(editingItemNumbers.filter((i: number) => i !== index));
  };

  const startEditingItemHeading = (index: number) => {
    setEditingItemHeadings([...editingItemHeadings, index]);
  };

  const startEditingItemDescription = (index: number) => {
    setEditingItemDescriptions([...editingItemDescriptions, index]);
  };

  const startEditingItemNumber = (index: number) => {
    setEditingItemNumbers([...editingItemNumbers, index]);
  };

  // Default steps exactly as in photo
  const defaultSteps: PyramidItem[] = [
    { heading: 'Headline', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', number: '150' },
    { heading: 'Headline', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', number: '350' },
    { heading: 'Headline', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', number: '1,250' },
    { heading: 'Headline', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', number: '3,550' },
    { heading: 'Headline', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', number: '25,000' }
  ];

  const displaySteps = steps.length > 0 ? steps : defaultSteps;

  return (
    <div className="pyramid-template" style={slideStyles}>
      {/* Title */}
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
            onClick={(e: React.MouseEvent<HTMLHeadingElement>) => {
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
            {title || 'Comparison table template'}
          </h1>
        )}
      </div>

      <div style={mainContentStyles}>
        {/* Pyramid Levels */}
        {displaySteps.slice(0, 5).map((step, index) => (
          <div key={index} style={pyramidLevelStyles(index)} data-draggable="true">
            {/* Speech Bubble + Number */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={speechBubbleStyles}>
                <div style={speechBubbleIconStyles}></div>
              </div>
              {isEditable && editingItemNumbers.includes(index) ? (
                <InlineEditor
                  initialValue={step.number || ''}
                  onSave={(newNumber) => handleItemNumberSave(index, newNumber)}
                  onCancel={() => handleItemNumberCancel(index)}
                  placeholder="Enter number..."
                  className="inline-editor-number"
                  style={{
                    ...numberStyles,
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
                  style={numberStyles}
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                    const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                    if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    if (isEditable) {
                      startEditingItemNumber(index);
                    }
                  }}
                  className={isEditable ? 'cursor-pointer border border-transparent hover-border-gray-300 hover-border-opacity-50' : ''}
                >
                  {step.number || '0'}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Text Blocks */}
        {displaySteps.slice(0, 5).map((step, index) => (
          <div key={`text-${index}`} style={textBlockStyles(index)} data-draggable="true">
            {/* Heading */}
            {isEditable && editingItemHeadings.includes(index) ? (
              <InlineEditor
                initialValue={step.heading || ''}
                onSave={(newHeading) => handleItemHeadingSave(index, newHeading)}
                onCancel={() => handleItemHeadingCancel(index)}
                multiline={true}
                placeholder="Enter heading..."
                className="inline-editor-heading"
                style={{
                  ...textHeadingStyles,
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
                style={textHeadingStyles}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
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
                {step.heading || 'Headline'}
              </div>
            )}

            {/* Description */}
            {isEditable && editingItemDescriptions.includes(index) ? (
              <InlineEditor
                initialValue={step.description || ''}
                onSave={(newDescription) => handleItemDescriptionSave(index, newDescription)}
                onCancel={() => handleItemDescriptionCancel(index)}
                multiline={true}
                placeholder="Enter description..."
                className="inline-editor-description"
                style={{
                  ...textDescriptionStyles,
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
                style={textDescriptionStyles}
                onClick={(e: React.MouseEvent<HTMLDivElement>) => {
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
                {step.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'}
              </div>
            )}
          </div>
        ))}

        {/* Triangle Arrows */}
        {displaySteps.slice(0, 5).map((_, index) => (
          <div key={`triangle-${index}`} style={triangleStyles(index)} data-draggable="true"></div>
        ))}
      </div>
    </div>
  );
};

export default PyramidTemplate;
export default PyramidTemplate;