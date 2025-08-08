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
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
    backgroundColor: backgroundColor,
    display: 'flex',
    flexDirection: 'column',
    padding: '64px',
    fontFamily: currentTheme.fonts.contentFont,
    alignItems: 'stretch',
    textAlign: 'center',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    color: titleColor,
    marginBottom: '80px',
    textAlign: 'left',
    wordWrap: 'break-word'
  };

  const timelineContainerStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '350px',
    display: 'flex',
  };

  const timelineLineStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '5%',
    width: '90%',
    height: '2px',
    background: 'rgba(255,255,255,0.25)',
  };

  const stepWrapperStyles: React.CSSProperties = {
    position: 'relative',
    width: '25%',
    height: '100%',
  };
  
  const milestoneContentStyles = (isTop: boolean): React.CSSProperties => ({
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    ...(isTop 
        ? {bottom: 'calc(50% - 20px)'} 
        : { top: 'calc(50% - 20px)' }
    ),
  });

  const numberSquareStyles: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '3px',
    background: accentColor,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
  };

  const verticalLineStyles: React.CSSProperties = {
      width: '2px',
      height: '20px',
      background: 'rgba(255,255,255,0.25)',
  };

  const textBlockStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: '8px',
  };

  const headingStyles: React.CSSProperties = {
    fontSize: '1.2rem',
    color: titleColor,
    fontFamily: currentTheme.fonts.titleFont,
    wordWrap: 'break-word'
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    color: contentColor,
    fontFamily: currentTheme.fonts.contentFont,
    lineHeight: 1.5,
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
    setEditingStepHeadings(editingStepHeadings.filter(i => i !== index));
  };

  const handleStepHeadingCancel = (index: number) => {
    setEditingStepHeadings(editingStepHeadings.filter(i => i !== index));
  };

  // Handle step description editing
  const handleStepDescriptionSave = (index: number, newDescription: string) => {
    if (onUpdate && steps) {
      const updatedSteps = [...steps];
      updatedSteps[index] = { ...updatedSteps[index], description: newDescription };
      onUpdate({ steps: updatedSteps });
    }
    setEditingStepDescriptions(editingStepDescriptions.filter(i => i !== index));
  };

  const handleStepDescriptionCancel = (index: number) => {
    setEditingStepDescriptions(editingStepDescriptions.filter(i => i !== index));
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

      <div style={timelineContainerStyles}>
        <div style={timelineLineStyles}></div>
        {steps.slice(0, 4).map((step: TimelineStep, index: number) => {
          const isTop = index % 2 !== 0; // 1, 3 on top
          
          return (
            <div key={index} style={stepWrapperStyles} data-draggable="true">
              <div style={milestoneContentStyles(isTop)}>
                <div style={{...textBlockStyles, order: isTop ? 1 : 3}}>
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
                      style={headingStyles}
                      onClick={() => {
                        if (isEditable) {
                          startEditingStepHeading(index);
                        }
                      }}
                      className={isEditable ? 'cursor-pointer border border-transparent hover-border-gray-300 hover-border-opacity-50' : ''}
                    >
                      {step.heading || 'Click to add heading'}
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
                      style={descriptionStyles}
                      onClick={() => {
                        if (isEditable) {
                          startEditingStepDescription(index);
                        }
                      }}
                      className={isEditable ? 'cursor-pointer border border-transparent hover-border-gray-300 hover-border-opacity-50' : ''}
                    >
                      {step.description || 'Click to add description'}
                    </div>
                  )}
                </div>
                <div style={{...verticalLineStyles, order: 2}} />
                <div style={{...numberSquareStyles, order: isTop ? 3 : 1}}>
                  {index + 1}
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