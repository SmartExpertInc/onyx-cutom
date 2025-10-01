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

  // Auto-resize div to fit content
  useEffect(() => {
    if (multiline && inputRef.current) {
      const div = inputRef.current as HTMLDivElement;
      div.style.height = 'auto';
      div.style.height = div.scrollHeight + 'px';
    }
  }, [value, multiline]);

  // Set initial height for div to match content
  useEffect(() => {
    if (multiline && inputRef.current) {
      const div = inputRef.current as HTMLDivElement;
      // Set initial height based on content
      div.style.height = 'auto';
      div.style.height = div.scrollHeight + 'px';
    }
  }, [multiline]);

  if (multiline) {
    return (
      <div
        ref={inputRef as React.RefObject<HTMLDivElement>}
        className={`inline-editor-textarea ${className}`}
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
      >
        {value}
      </div>
    );
  }

  return (
    <div
      ref={inputRef as React.RefObject<HTMLDivElement>}
      className={`inline-editor-input ${className}`}
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
        whiteSpace: 'pre-wrap',
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
  
  // Refs for draggable elements (following Big Image Left pattern)
  const titleRef = useRef<HTMLDivElement>(null);
  
  // Use existing slideId for element positioning (following Big Image Left pattern)
  
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
    background: '#ffffff', // White background as in photo
    display: 'flex',
    flexDirection: 'column',
    padding: '50px',
    fontFamily: currentTheme.fonts.contentFont,
    alignItems: 'stretch',
    textAlign: 'left', // Left aligned as in photo
    overflow: 'hidden',
    position: 'relative' // Add relative positioning for absolute children
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '2.5rem', // Large title as in photo
    fontFamily: 'Arial, sans-serif', // Sans-serif as in photo
    color: '#000000', // Black title as in photo
    marginBottom: '50px',
    textAlign: 'left',
    wordWrap: 'break-word',
    fontWeight: 'bold'
  };

  const timelineContainerStyles: React.CSSProperties = {
    position: 'absolute', // Fixed positioning to prevent layout shifts
    top: '120px', // Position from top of slide
    left: '0',
    right: '0',
    bottom: '0',
    width: '100%',
    height: 'calc(100% - 120px)', // Take remaining space after title
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: '20px'
  };

  const timelineLineStyles: React.CSSProperties = {
    position: 'absolute',
    top: '13.5px',
    left: 'calc(50% + 60px)', // Line moved 60px to the right
    transform: 'translateX(-50%)',
    width: '2px',
    height: '99%',
    background: '#0F58F9', // Blue line as in photo
  };

  const stepWrapperStyles = (index: number): React.CSSProperties => ({
    position: 'absolute',
    top: `${index * 120 + 20}px`, // Increased vertical spacing between steps
    left: '0',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });
  
  const milestoneContentStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center'
  };

  const circleStyles: React.CSSProperties = {
    width: '20px',
    height: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    background: '#ffffff',
    border: '4px solid #0F58F9', // Blue circle as in photo
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0px', // No number inside circle
    flexShrink: 0,
    position: 'absolute',
    left: 'calc(50% + 60px)', // Position circle on the moved line
    transform: 'translateX(-50%)',
    zIndex: 10
  };

  const textBlockStyles = (index: number): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    position: 'absolute',
    left: index % 2 === 0 ? 'calc(50% + 60px + 50px)' : 'calc(50% + 60px - 180px)', // Left texts moved 80px from line (was 50px)
    width: '35%',
    transform: 'translateY(20%)'
  });

  const headingStyles: React.CSSProperties = {
    fontSize: '1.1rem',
    color: '#000000', // Black text as in photo
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    wordWrap: 'break-word'
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: '0.95rem',
    color: '#000000', // Black text as in photo
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

  return (
    <div className="timeline-template" style={slideStyles}>
      {/* Title - wrapped */}
      <div 
        ref={titleRef}
        data-moveable-element={`${slideId}-title`}
        data-draggable="true" 
        style={{ display: 'inline-block' }}
      >
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
            {title || 'Click to add title'}
          </h1>
        )}
      </div>

      <div style={timelineContainerStyles}>
        <div style={timelineLineStyles}></div>
        {steps.slice(0, 4).map((step: TimelineStep, index: number) => {
          return (
            <div 
              key={index} 
              data-moveable-element={`${slideId}-step-${index}`}
              data-draggable="true"
              style={stepWrapperStyles(index)}
            >
              <div style={milestoneContentStyles}>
                {/* Circle marker - positioned on the blue line */}
                <div style={circleStyles}></div>
                
                {/* Text content - positioned on sides */}
                <div style={textBlockStyles(index)}>
                  {/* Step Heading */}
                  {isEditable && editingStepHeadings.includes(index) ? (
                    <InlineEditor
                      initialValue={step.heading || ''}
                      onSave={(newHeading) => handleStepHeadingSave(index, newHeading)}
                      onCancel={() => handleStepHeadingCancel(index)}
                      multiline={true}
                      placeholder="Enter step heading..."
                      className="inline-editor-step-heading"
                      style={{
                        ...headingStyles,
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
                      style={headingStyles}
                      onClick={() => {
                        if (isEditable) {
                          startEditingStepHeading(index);
                        }
                      }}
                      className={isEditable ? 'cursor-pointer border border-transparent hover-border-gray-300 hover-border-opacity-50' : ''}
                    >
                      {step.heading || `Step ${index + 1}`}
                    </div>
                  )}

                  {/* Step Description */}
                  {isEditable && editingStepDescriptions.includes(index) ? (
                    <InlineEditor
                      initialValue={step.description || ''}
                      onSave={(newDescription) => handleStepDescriptionSave(index, newDescription)}
                      onCancel={() => handleStepDescriptionCancel(index)}
                      multiline={true}
                      placeholder="Enter step description..."
                      className="inline-editor-step-description"
                      style={{
                        ...descriptionStyles,
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
                      style={descriptionStyles}
                      onClick={() => {
                        if (isEditable) {
                          startEditingStepDescription(index);
                        }
                      }}
                      className={isEditable ? 'cursor-pointer border border-transparent hover-border-gray-300 hover-border-opacity-50' : ''}
                    >
                      {step.description || 'Add step description'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineTemplate; 