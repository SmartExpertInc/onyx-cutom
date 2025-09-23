// custom_extensions/frontend/src/components/templates/ProcessStepsTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ProcessStepsProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

interface StepItem {
  title: string;
  description: string;
  icon?: string;
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
          textAlign: 'left'
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

export const ProcessStepsTemplate: React.FC<ProcessStepsProps & { 
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = (props) => {
  const currentTheme = props.theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [editingSteps, setEditingSteps] = useState<number[]>([]);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs for draggable elements
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  
  // Generate slideId for element positioning
  const slideId = `process-steps-${Date.now()}`;
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // HARDCODED 5 STEPS - гарантированно 5 блоков
  const defaultSteps = [
    {
      title: 'PROBLEM',
      description: 'Identify a problem and form a thesis statement.'
    },
    {
      title: 'READ',
      description: 'Review literature related to your topic.'
    },
    {
      title: 'HYPOTHESIZE',
      description: 'Come up with an educated guess based on your research.'
    },
    {
      title: 'RESEARCH',
      description: 'Read resources to support your hypothesis.'
    },
    {
      title: 'CONCLUSION',
      description: 'Interpret the results and write your conclusion.'
    }
  ];

  // Use props.steps if available, otherwise use defaultSteps
  const steps = props.steps && props.steps.length > 0 ? props.steps : defaultSteps;

  // Define colors for each step (matching the photo exactly)
  const stepColors = [
    '#002D91', // Deep blue for PROBLEM
    '#3B82F6', // Medium blue for READ  
    '#06B6D4', // Teal for HYPOTHESIZE
    '#60A5FA', // Lighter sky blue for RESEARCH (lighter than READ)
    '#1E3A8A'  // Deep blue for CONCLUSION
  ];

  const slideStyles: React.CSSProperties = {
    minHeight: '600px',
    background: '#ffffff', // White background as in photo
    fontFamily: currentTheme.fonts.contentFont,
    display: 'flex',
    padding: '50px',
    alignItems: 'flex-start'
  };

  const leftColumnStyles: React.CSSProperties = {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  };

  const rightColumnStyles: React.CSSProperties = {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
    maxWidth: '500px'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '3.8rem',
    fontFamily: 'serif', // Serif font as in photo
    color: '#000000', // Black color as in photo
    fontWeight: 'bold',
    lineHeight: '0.85',
    marginBottom: '16px',
    textAlign: 'left',
    letterSpacing: '-0.04em'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '1.3rem',
    fontFamily: 'sans-serif', // Sans-serif font as in photo
    color: '#000000', // Black color as in photo
    fontWeight: 'normal',
    textAlign: 'left',
    opacity: 0.9,
    letterSpacing: '0.01em'
  };

  const stepContainerStyles = (color: string): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '32px 36px',
    borderRadius: '12px',
    minHeight: '110px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    background: color, // Solid color instead of gradient as in photo
    width: '60%' // Each block takes 60% of slide width
  });

  // Helper function to adjust color brightness
  const adjustColor = (color: string, amount: number): string => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * amount);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  const stepNumberStyles = (color: string): React.CSSProperties => ({
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: 'white',
    border: `4px solid ${color}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  });

  const stepNumberInnerStyles = (color: string): React.CSSProperties => ({
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold'
  });

  const stepContentStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1
  };

  const stepTitleStyles: React.CSSProperties = {
    fontSize: '1.6rem',
    fontWeight: 'bold',
    color: 'white',
    margin: 0,
    fontFamily: 'sans-serif',
    letterSpacing: '0.02em'
  };

  const stepDescriptionStyles: React.CSSProperties = {
    fontSize: '1.1rem',
    color: 'white',
    margin: 0,
    opacity: 0.95,
    lineHeight: '1.4',
    fontFamily: 'sans-serif'
  };

  // Handle title editing
  const handleTitleSave = (newTitle: string) => {
    if (props.onUpdate) {
      props.onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  // Handle subtitle editing
  const handleSubtitleSave = (newSubtitle: string) => {
    if (props.onUpdate) {
      props.onUpdate({ subtitle: newSubtitle });
    }
    setEditingSubtitle(false);
  };

  const handleSubtitleCancel = () => {
    setEditingSubtitle(false);
  };

  // Handle step editing
  const handleStepSave = (index: number, field: 'title' | 'description', newValue: string) => {
    if (props.onUpdate) {
      const updatedSteps = [...steps];
      if (typeof updatedSteps[index] === 'string') {
        // Convert string to object format
        updatedSteps[index] = {
          title: field === 'title' ? newValue : `Step ${index + 1}`,
          description: field === 'description' ? newValue : updatedSteps[index] as string
        };
      } else {
        // Update existing object
        updatedSteps[index] = {
          ...updatedSteps[index],
          [field]: newValue
        };
      }
      props.onUpdate({ steps: updatedSteps });
    }
    setEditingSteps(editingSteps.filter((i: number) => i !== index));
  };

  const handleStepCancel = (index: number) => {
    setEditingSteps(editingSteps.filter((i: number) => i !== index));
  };

  const startEditingStep = (index: number) => {
    setEditingSteps([...editingSteps, index]);
  };

  return (
    <div style={slideStyles}>
      {/* Left Column - Title and Subtitle */}
      <div style={leftColumnStyles}>
        {/* Title */}
        <div 
          ref={titleRef}
          data-moveable-element={`${slideId}-title`}
          data-draggable="true" 
          style={{ display: 'inline-block', width: '100%' }}
        >
          {props.isEditable && editingTitle ? (
            <InlineEditor
              initialValue={props.title || 'The Stages of Research'}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={true}
              placeholder="Enter title..."
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
              onClick={(e) => {
                const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                if (props.isEditable) {
                  setEditingTitle(true);
                }
              }}
              className={props.isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
            >
              {props.title || 'The Stages of Research'}
            </h1>
          )}
        </div>

        {/* Subtitle */}
        <div 
          ref={subtitleRef}
          data-moveable-element={`${slideId}-subtitle`}
          data-draggable="true" 
          style={{ display: 'inline-block', width: '100%' }}
        >
          {props.isEditable && editingSubtitle ? (
            <InlineEditor
              initialValue={(props as any).subtitle || 'Miss Jones Science Class'}
              onSave={handleSubtitleSave}
              onCancel={handleSubtitleCancel}
              multiline={false}
              placeholder="Enter subtitle..."
              className="inline-editor-subtitle"
              style={{
                ...subtitleStyles,
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
                if (props.isEditable) {
                  setEditingSubtitle(true);
                }
              }}
              className={props.isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
            >
              {(props as any).subtitle || 'Miss Jones Science Class'}
            </p>
          )}
        </div>
      </div>

      {/* Right Column - Process Steps - GUARANTEED 5 BLOCKS */}
      <div style={rightColumnStyles}>
        {steps.map((step: StepItem, index: number) => {
          const stepTitle = typeof step === 'string' ? `Step ${index + 1}` : step.title;
          const stepDescription = typeof step === 'string' ? step : step.description;
          const stepColor = stepColors[index] || stepColors[0];
          
          return (
            <div
              key={index}
              data-moveable-element={`${slideId}-step-${index}`}
              data-draggable="true"
              style={stepContainerStyles(stepColor)}
            >
              {/* Step Number Circle */}
              <div style={stepNumberStyles(stepColor)}>
                <div style={stepNumberInnerStyles(stepColor)}>
                  {index + 1}
                </div>
              </div>

              {/* Step Content */}
              <div style={stepContentStyles}>
                {/* Step Title */}
                {props.isEditable && editingSteps.includes(index) ? (
                  <InlineEditor
                    initialValue={stepTitle}
                    onSave={(newValue) => handleStepSave(index, 'title', newValue)}
                    onCancel={() => handleStepCancel(index)}
                    multiline={false}
                    placeholder="Enter step title..."
                    className="inline-editor-step-title"
                    style={{
                      ...stepTitleStyles,
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
                  <h3 
                    style={stepTitleStyles}
                    onClick={(e) => {
                      const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                      if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      if (props.isEditable) {
                        startEditingStep(index);
                      }
                    }}
                    className={props.isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                  >
                    {stepTitle}
                  </h3>
                )}

                {/* Step Description */}
                {props.isEditable && editingSteps.includes(index) ? (
                  <InlineEditor
                    initialValue={stepDescription}
                    onSave={(newValue) => handleStepSave(index, 'description', newValue)}
                    onCancel={() => handleStepCancel(index)}
                    multiline={true}
                    placeholder="Enter step description..."
                    className="inline-editor-step-description"
                    style={{
                      ...stepDescriptionStyles,
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
                    style={stepDescriptionStyles}
                    onClick={(e) => {
                      const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                      if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      if (props.isEditable) {
                        startEditingStep(index);
                      }
                    }}
                    className={props.isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                  >
                    {stepDescription}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessStepsTemplate;