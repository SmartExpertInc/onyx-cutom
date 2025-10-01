import React, { useState, useRef, useEffect } from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

export interface TimelineStep {
  heading: string;
  description: string;
}

export interface TimelineTemplateProps {
  slideId: string;
  title: string;
  steps: TimelineStep[];
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
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(inputRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
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

  return (
    <div
      ref={inputRef}
      className={`inline-editor ${className}`}
      contentEditable
      suppressContentEditableWarning
      onInput={(e: React.FormEvent<HTMLDivElement>) => setValue(e.currentTarget.textContent || '')}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      style={{
        ...style,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
        width: '100%',
        wordWrap: 'break-word',
        whiteSpace: multiline ? 'pre-wrap' : 'nowrap',
        minHeight: multiline ? '1.6em' : 'auto',
        boxSizing: 'border-box',
        display: 'block'
      }}
    >
      {value}
    </div>
  );
}

export const TimelineTemplate: React.FC<TimelineTemplateProps> = ({
  slideId,
  title,
  steps = [],
  theme,
  onUpdate,
  isEditable = false
}: TimelineTemplateProps) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, contentColor, accentColor } = currentTheme.colors;
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingStepHeadings, setEditingStepHeadings] = useState<number[]>([]);
  const [editingStepDescriptions, setEditingStepDescriptions] = useState<number[]>([]);
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
    minHeight: '600px',
    height: '100%',
    background: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    padding: '50px',
    fontFamily: currentTheme.fonts.contentFont,
    textAlign: 'left',
    overflow: 'hidden',
    position: 'relative'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '2.5rem',
    fontFamily: 'Arial, sans-serif',
    color: '#000000',
    marginBottom: '50px',
    textAlign: 'left',
    wordWrap: 'break-word',
    fontWeight: 'bold'
  };

  const timelineContainerStyles: React.CSSProperties = {
    position: 'absolute',
    top: '150px',
    left: '50px',
    right: '50px',
    bottom: '50px',
    width: 'calc(100% - 100px)',
    height: 'calc(100% - 200px)'
  };

  const timelineLineStyles: React.CSSProperties = {
    position: 'absolute',
    top: '11px',
    left: 'calc(50% + 60px)',
    width: '2px',
    height: '115%',
    background: '#0F58F9'
  };

  // 4 static timeline items with precise positioning
  const timelineItems = [
    { top: '10%', side: 'left' },
    { top: '35%', side: 'right' },
    { top: '60%', side: 'left' },
    { top: '85%', side: 'right' }
  ];

  const circleStyles = (top: string): React.CSSProperties => ({
    position: 'absolute',
    top: top,
    left: 'calc(50% + 60px)',
    transform: 'translate(-50%, -50%)',
    width: '20px',
    height: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    border: '4px solid #0F58F9',
    zIndex: 10
  });

  const textBlockStyles = (top: string, side: string): React.CSSProperties => ({
    position: 'absolute',
    top: top,
    [side === 'left' ? 'left' : 'right']: side === 'left' ? 'calc(50% + 110px)' : 'calc(50% + 110px)',
    width: 'calc(40% - 60px)',
    transform: 'translateY(-50%)',
    textAlign: side === 'left' ? 'left' : 'right'
  });

  const headingStyles: React.CSSProperties = {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Arial, sans-serif',
    marginBottom: '8px',
    wordWrap: 'break-word'
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: '0.9rem',
    color: '#000000',
    fontFamily: 'Arial, sans-serif',
    lineHeight: 1.4,
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

  // Handle step heading editing
  const handleStepHeadingSave = (index: number, newHeading: string) => {
    if (onUpdate && steps) {
      const updatedSteps = [...steps];
      if (!updatedSteps[index]) {
        updatedSteps[index] = { heading: '', description: '' };
      }
      updatedSteps[index] = { ...updatedSteps[index], heading: newHeading };
      onUpdate({ steps: updatedSteps });
    }
    setEditingStepHeadings(editingStepHeadings.filter((i: number) => i !== index));
  };

  const handleStepHeadingCancel = (index: number) => {
    setEditingStepHeadings(editingStepHeadings.filter((i: number) => i !== index));
  };

  // Handle step description editing
  const handleStepDescriptionSave = (index: number, newDescription: string) => {
    if (onUpdate && steps) {
      const updatedSteps = [...steps];
      if (!updatedSteps[index]) {
        updatedSteps[index] = { heading: '', description: '' };
      }
      updatedSteps[index] = { ...updatedSteps[index], description: newDescription };
      onUpdate({ steps: updatedSteps });
    }
    setEditingStepDescriptions(editingStepDescriptions.filter((i: number) => i !== index));
  };

  const handleStepDescriptionCancel = (index: number) => {
    setEditingStepDescriptions(editingStepDescriptions.filter((i: number) => i !== index));
  };

  const startEditingStepHeading = (index: number) => {
    setEditingStepHeadings([...editingStepHeadings, index]);
  };

  const startEditingStepDescription = (index: number) => {
    setEditingStepDescriptions([...editingStepDescriptions, index]);
  };

  // Default steps
  const defaultSteps: TimelineStep[] = [
    { heading: 'Milestone 1', description: 'Description of the first milestone' },
    { heading: 'Milestone 2', description: 'Description of the second milestone' },
    { heading: 'Milestone 3', description: 'Description of the third milestone' },
    { heading: 'Milestone 4', description: 'Description of the fourth milestone' }
  ];

  const displaySteps = steps.length >= 4 ? steps.slice(0, 4) : defaultSteps;

  return (
    <div className="timeline-template" style={slideStyles}>
      {/* Title */}
      <div style={{ display: 'inline-block', position: 'relative', zIndex: 20 }}>
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
              padding: '0'
            }}
          />
        ) : (
          <h1 
            style={titleStyles}
            onClick={() => {
              if (isEditable) {
                setEditingTitle(true);
              }
            }}
            className={isEditable ? 'cursor-pointer' : ''}
          >
            {title || 'Timeline'}
          </h1>
        )}
      </div>

      {/* Timeline Container */}
      <div style={timelineContainerStyles}>
        {/* Vertical Line */}
        <div style={timelineLineStyles}></div>

        {/* Timeline Items */}
        {timelineItems.map((item, index) => (
          <React.Fragment key={index}>
            {/* Circle */}
            <div style={circleStyles(item.top)}></div>

            {/* Text Block */}
            <div style={textBlockStyles(item.top, item.side)}>
              {/* Heading */}
              {isEditable && editingStepHeadings.includes(index) ? (
                <InlineEditor
                  initialValue={displaySteps[index]?.heading || ''}
                  onSave={(newHeading) => handleStepHeadingSave(index, newHeading)}
                  onCancel={() => handleStepHeadingCancel(index)}
                  multiline={false}
                  placeholder="Enter heading..."
                  className="inline-editor-heading"
                  style={{
                    ...headingStyles,
                    margin: '0',
                    padding: '0'
                  }}
                />
              ) : (
                <div 
                  style={headingStyles}
                  onClick={() => {
                    if (isEditable) {
                      startEditingStepHeading(index);
                    }
                  }}
                  className={isEditable ? 'cursor-pointer' : ''}
                >
                  {displaySteps[index]?.heading || `Milestone ${index + 1}`}
                </div>
              )}

              {/* Description */}
              {isEditable && editingStepDescriptions.includes(index) ? (
                <InlineEditor
                  initialValue={displaySteps[index]?.description || ''}
                  onSave={(newDescription) => handleStepDescriptionSave(index, newDescription)}
                  onCancel={() => handleStepDescriptionCancel(index)}
                  multiline={true}
                  placeholder="Enter description..."
                  className="inline-editor-description"
                  style={{
                    ...descriptionStyles,
                    margin: '0',
                    padding: '0'
                  }}
                />
              ) : (
                <div 
                  style={descriptionStyles}
                  onClick={() => {
                    if (isEditable) {
                      startEditingStepDescription(index);
                    }
                  }}
                  className={isEditable ? 'cursor-pointer' : ''}
                >
                  {displaySteps[index]?.description || `Description of milestone ${index + 1}`}
                </div>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TimelineTemplate;
