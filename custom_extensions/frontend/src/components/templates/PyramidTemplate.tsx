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
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Georgia, serif',
    minHeight: '600px',
    width: '100%',
    position: 'relative',
    overflow: 'visible'
  };

  const titleStyles: React.CSSProperties = {
    color: '#000000',
    fontSize: '2rem',
    fontFamily: 'Georgia, serif',
    marginBottom: '30px',
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
    height: '450px',
    paddingTop: '20px'
  };

  // Pyramid colors exactly as in photo - 5 distinct levels
  const pyramidColors = [
    '#3D8BFF', // Light blue (level 1 - smallest, top)
    '#00BCD4', // Cyan (level 2)
    '#1E88E5', // Medium blue (level 3)
    '#5E35B1', // Purple (level 4)
    '#1A237E'  // Dark navy blue (level 5 - largest, bottom)
  ];

  // Pyramid level dimensions - 5 clear levels with proper trapezoid shape
  const pyramidLevelStyles = (index: number): React.CSSProperties => {
    const widths = [144, 210, 290, 395, 533]; // 5 levels, increasing
    const heights = [65, 65, 65, 65, 65]; // Same height for each
    const topPositions = [0, 70, 135, 200, 265]; // Stacked perfectly
    
    return {
      position: 'absolute',
      width: `${widths[index]}px`,
      height: `${heights[index]}px`,
      top: `${topPositions[index]}px`,
      left: '50%',
      transform: 'translateX(-50%)',
      background: pyramidColors[index],
      clipPath: 'polygon(20% 0%, 82% 0%, 100% 100%, 0% 100%)', // More straight edges like in photo
      display: 'flex',
      alignItems: 'center',
      borderRadius: '3px',
      justifyContent: 'center',
      zIndex: 5 - index,
      boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
    };
  };

  // Speech bubble
  const speechBubbleStyles: React.CSSProperties = {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const speechBubbleIconStyles: React.CSSProperties = {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#1E88E5'
  };

  // Number styles
  const numberStyles: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif'
  };

  // Text blocks - exactly as in photo: LEFT-RIGHT-LEFT-RIGHT-LEFT
  const textBlockStyles = (index: number): React.CSSProperties => {
    const positions = [
      { top: '25px', left: '7%', textAlign: 'left' as const },     // Level 1 - LEFT
      { top: '90px', right: '7%', textAlign: 'right' as const },   // Level 2 - RIGHT
      { top: '155px', left: '7%', textAlign: 'left' as const },    // Level 3 - LEFT
      { top: '220px', right: '7%', textAlign: 'right' as const },  // Level 4 - RIGHT
      { top: '285px', left: '7%', textAlign: 'left' as const }     // Level 5 - LEFT
    ];
    
    const pos = positions[index];
    return {
      position: 'absolute',
      top: pos.top,
      [pos.textAlign === 'right' ? 'right' : 'left']: pos.textAlign === 'right' ? pos.right : pos.left,
      width: '30%',
      maxWidth: '320px',
      zIndex: 10,
      textAlign: pos.textAlign
    };
  };

  const textHeadingStyles: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Georgia, serif',
    marginBottom: '6px',
    wordWrap: 'break-word'
  };

  const textDescriptionStyles: React.CSSProperties = {
    fontSize: '0.85rem',
    color: '#000000',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.4,
    wordWrap: 'break-word'
  };

  // Triangle arrows - exactly as in photo: LEFT-RIGHT-LEFT-RIGHT-LEFT
  const triangleStyles = (index: number): React.CSSProperties => {
    const positions = [
      { top: '55px', left: '19%' },    // Level 1 - LEFT
      { top: '120px', right: '19%' },  // Level 2 - RIGHT
      { top: '185px', left: '19%' },   // Level 3 - LEFT
      { top: '250px', right: '19%' },  // Level 4 - RIGHT
      { top: '315px', left: '19%' }    // Level 5 - LEFT
    ];
    
    const pos = positions[index];
    return {
      position: 'absolute',
      ...pos,
      width: '0',
      height: '0',
      borderLeft: '7px solid transparent',
      borderRight: '7px solid transparent',
      borderTop: '10px solid #1E88E5',
      zIndex: 10
    };
  };

  // Handlers
  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

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

  // Default 5 steps
  const defaultSteps: PyramidItem[] = [
    { heading: 'Headline', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', number: '150' },
    { heading: 'Headline', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', number: '350' },
    { heading: 'Headline', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', number: '1,250' },
    { heading: 'Headline', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', number: '3,550' },
    { heading: 'Headline', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor', number: '25,000' }
  ];

  const displaySteps = steps.length >= 5 ? steps.slice(0, 5) : defaultSteps;

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
            style={{ ...titleStyles, margin: '0', padding: '0' }}
          />
        ) : (
          <h1 
            style={titleStyles}
            onClick={() => { if (isEditable) setEditingTitle(true); }}
            className={isEditable ? 'cursor-pointer' : ''}
          >
            {title || 'Comparison table template'}
          </h1>
        )}
      </div>

      <div style={mainContentStyles}>
        {/* 5 Pyramid Levels */}
        {displaySteps.map((step, index) => (
          <div key={index} style={pyramidLevelStyles(index)}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={speechBubbleStyles}>
                <div style={speechBubbleIconStyles}></div>
              </div>
              {isEditable && editingItemNumbers.includes(index) ? (
                <InlineEditor
                  initialValue={step.number || ''}
                  onSave={(newNumber) => handleItemNumberSave(index, newNumber)}
                  onCancel={() => handleItemNumberCancel(index)}
                  placeholder="Number..."
                  style={{ ...numberStyles, margin: '0', padding: '0' }}
                />
              ) : (
                <div 
                  style={numberStyles}
                  onClick={() => { if (isEditable) startEditingItemNumber(index); }}
                  className={isEditable ? 'cursor-pointer' : ''}
                >
                  {step.number || '0'}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 5 Text Blocks */}
        {displaySteps.map((step, index) => (
          <div key={`text-${index}`} style={textBlockStyles(index)}>
            {isEditable && editingItemHeadings.includes(index) ? (
              <InlineEditor
                initialValue={step.heading || ''}
                onSave={(newHeading) => handleItemHeadingSave(index, newHeading)}
                onCancel={() => handleItemHeadingCancel(index)}
                multiline={true}
                placeholder="Heading..."
                style={{ ...textHeadingStyles, margin: '0', padding: '0' }}
              />
            ) : (
              <div 
                style={textHeadingStyles}
                onClick={() => { if (isEditable) startEditingItemHeading(index); }}
                className={isEditable ? 'cursor-pointer' : ''}
              >
                {step.heading || 'Headline'}
              </div>
            )}

            {isEditable && editingItemDescriptions.includes(index) ? (
              <InlineEditor
                initialValue={step.description || ''}
                onSave={(newDescription) => handleItemDescriptionSave(index, newDescription)}
                onCancel={() => handleItemDescriptionCancel(index)}
                multiline={true}
                placeholder="Description..."
                style={{ ...textDescriptionStyles, margin: '0', padding: '0' }}
              />
            ) : (
              <div 
                style={textDescriptionStyles}
                onClick={() => { if (isEditable) startEditingItemDescription(index); }}
                className={isEditable ? 'cursor-pointer' : ''}
              >
                {step.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor'}
              </div>
            )}
          </div>
        ))}

        {/* 5 Triangle Arrows */}
        {displaySteps.map((_, index) => (
          <div key={`triangle-${index}`} style={triangleStyles(index)}></div>
        ))}
      </div>
    </div>
  );
};

export default PyramidTemplate;
