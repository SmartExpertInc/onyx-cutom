import React, { useState, useRef, useEffect } from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import { MessageCircle } from 'lucide-react';
import { WysiwygEditor } from '@/components/editors/WysiwygEditor';

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
    background: currentTheme.colors.pyramidBackgroundColor || '#ffffff',
    padding: '40px 40px 0px 40px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Georgia, serif',
    minHeight: '600px',
    width: '100%',
    position: 'relative',
    overflow: 'hidden'
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
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexGrow: 1,
    position: 'relative',
    top: '87px',
  };

  // Pyramid colors exactly as requested - 5 distinct levels
  const pyramidColors = [
    '#2A7CFF', // Level 1 - smallest, top
    '#09ACD8', // Level 2
    '#1B94E8', // Level 3
    '#3A11C3', // Level 4
    '#01298A'  // Level 5 - largest, bottom
  ];

  // Pyramid level dimensions - 5 clear levels with unique clipPath for each
  const pyramidLevelStyles = (index: number): React.CSSProperties => {
    const widths = [144, 228, 311, 401, 493]; // 5 levels, increasing
    const heights = [75, 75, 75, 75, 75]; // Same height for each
    const topPositions = [0, 80, 160, 240, 320]; // Stacked perfectly
    const clipPaths = [
      'polygon(24% 0%, 78% 0%, 100% 100%, 0% 100%)', // Level 1
      'polygon(18% 0%, 83% 0%, 100% 100%, 0% 100%)', // Level 2
      'polygon(13% 0%, 87% 0%, 100% 100%, 0% 100%)', // Level 3
      'polygon(11% 0%, 89% 0%, 100% 100%, 0% 100%)', // Level 4
      'polygon(9% 0%, 91% 0%, 100% 100%, 0% 100%)'   // Level 5
    ];
    
    return {
      position: 'absolute',
      width: `${widths[index]}px`,
      height: `${heights[index]}px`,
      top: `${topPositions[index]}px`,
      left: '50%',
      transform: 'translateX(-50%)',
      background: pyramidColors[index],
      clipPath: clipPaths[index],
      display: 'flex',
      alignItems: 'center',
      borderRadius: '5px',
      justifyContent: 'center',
      zIndex: 5 - index,
      boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
    };
  };

  const MessageIcon = () => (
    <MessageCircle size={22} color="#ffffff" style={{ marginRight: '8px' }} />
  );

  // Number styles
  const numberStyles: React.CSSProperties = {
    fontSize: '19px',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif'
  };

  // Text blocks - exactly as in photo: LEFT-RIGHT-LEFT-RIGHT-LEFT
  const textBlockStyles = (index: number): React.CSSProperties => {
    const positions = [
      { top: '-19px', left: '13%', textAlign: 'right' as const },     // Level 1 - LEFT (top segment)
      { top: '55px', right: '10%', textAlign: 'left' as const },   // Level 2 - RIGHT (second segment)
      { top: '124px', left: '7%', textAlign: 'right' as const },    // Level 3 - LEFT (third segment)
      { top: '218px', right: '2%', textAlign: 'left' as const },  // Level 4 - RIGHT (fourth segment)
      { top: '285px', left: '0%', textAlign: 'right' as const }     // Level 5 - LEFT (bottom segment)
    ];

    const pos = positions[index];
    return {
      position: 'absolute',
      top: pos.top,
      left: pos.left ? pos.left : 'auto',
      right: pos.right ? pos.right : 'auto',
      width: '35%',
      maxWidth: '250px',
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
    marginTop: '15px',
    color: '#000000',
    fontFamily: 'Georgia, serif',
    lineHeight: 1.4,
    wordWrap: 'break-word'
  };

  // Triangle arrows - exactly as in photo: LEFT-RIGHT-LEFT-RIGHT-LEFT
  const triangleStyles = (index: number): React.CSSProperties => {
    const positions = [
      { top: '21px', left: '42%' },    // Level 1 - LEFT (pointing to top segment)
      { top: '98px', right: '39%' },  // Level 2 - RIGHT (pointing to second segment)
      { top: '168px', left: '36%' },   // Level 3 - LEFT (pointing to third segment)
      { top: '265px', right: '31%' },  // Level 4 - RIGHT (pointing to fourth segment)
      { top: '340px', left: '27%' }    // Level 5 - LEFT (pointing to bottom segment)
    ];
    
    const pos = positions[index];
    return {
      position: 'absolute',
      ...pos,
      width: '0',
      height: '0',
      borderLeft: '8px solid transparent',
      borderRight: '8px solid transparent',
      borderTop: `12px solid ${pyramidColors[index]}`,
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

  // Filter out null/undefined values to prevent errors
  const validSteps = (steps || []).filter((step): step is PyramidItem => step !== null && step !== undefined);
  const displaySteps = validSteps.length >= 5 ? validSteps.slice(0, 5) : defaultSteps;

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
            className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
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
              <MessageIcon />
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
            {/* Heading */}
            <div data-draggable="true" style={{ display: 'inline-block' }}>
              {isEditable && editingItemHeadings.includes(index) ? (
                <WysiwygEditor
                  initialValue={step.heading || ''}
                  onSave={(newHeading) => handleItemHeadingSave(index, newHeading)}
                  onCancel={() => handleItemHeadingCancel(index)}
                  placeholder="Enter heading..."
                  className="inline-editor-heading"
                  style={{
                    ...textHeadingStyles,
                    margin: '0',
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
                <div 
                  style={textHeadingStyles}
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
                  className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
                  dangerouslySetInnerHTML={{ __html: step.heading || 'Headline' }}
                />
              )}
            </div>

            {/* Description */}
            <div data-draggable="true" style={{ display: 'inline-block', marginTop: '15px' }}>
              {isEditable && editingItemDescriptions.includes(index) ? (
                <WysiwygEditor
                  initialValue={step.description || ''}
                  onSave={(newDescription) => handleItemDescriptionSave(index, newDescription)}
                  onCancel={() => handleItemDescriptionCancel(index)}
                  placeholder="Enter description..."
                  className="inline-editor-description"
                  style={{
                    ...textDescriptionStyles,
                    margin: '0',
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
                  style={textDescriptionStyles}
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
                  className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
                  dangerouslySetInnerHTML={{ __html: step.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor' }}
                />
              )}
            </div>
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
