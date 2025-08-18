// custom_extensions/frontend/src/components/templates/ProcessStepsTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ProcessStepsProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

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
          textAlign: 'center'
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
  const [editingSteps, setEditingSteps] = useState<number[]>([]);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs for draggable elements (following Big Image Left pattern)
  const titleRef = useRef<HTMLDivElement>(null);
  
  // Generate slideId for element positioning (following Big Image Left pattern)
  const slideId = `process-steps-${Date.now()}`;
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const titleStyles: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '40px',
    fontFamily: currentTheme.fonts.titleFont,
    fontSize: currentTheme.fonts.titleSize,
    color: currentTheme.colors.titleColor,
    wordWrap: 'break-word'
  };

  const stepDescriptionStyles: React.CSSProperties = {
    fontFamily: currentTheme.fonts.contentFont,
    fontSize: currentTheme.fonts.contentSize,
    color: currentTheme.colors.contentColor,
    margin: 0,
    wordWrap: 'break-word'
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

  // Handle step editing
  const handleStepSave = (index: number, newStep: string) => {
    if (props.onUpdate && props.steps) {
      const updatedSteps = [...props.steps];
      // Always maintain the object structure with title, description, and optional icon
      if (typeof updatedSteps[index] === 'string') {
        // Convert string to object format
        updatedSteps[index] = {
          title: `Step ${index + 1}`,
          description: newStep
        };
      } else {
        // Update existing object, preserving title and icon if they exist
        updatedSteps[index] = {
          ...updatedSteps[index],
          description: newStep
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
    <div
      style={{
        padding: '40px',
        minHeight: '600px',
        backgroundColor: currentTheme.colors.backgroundColor,
        fontFamily: currentTheme.fonts.contentFont,
      }}
    >
      {/* Title - wrapped */}
      <div 
        ref={titleRef}
        data-moveable-element={`${slideId}-title`}
        data-draggable="true" 
        style={{ display: 'inline-block', width: '100%' }}
      >
        {props.isEditable && editingTitle ? (
          <InlineEditor
            initialValue={props.title || ''}
            onSave={handleTitleSave}
            onCancel={handleTitleCancel}
            multiline={true}
            placeholder="Enter slide title..."
            className="inline-editor-title"
            style={{
              ...titleStyles,
              // Ensure title behaves exactly like h1 element
              margin: '0 auto 40px auto',
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
            {props.title || 'Click to add title'}
          </h1>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'start',
          gap: '32px',
        }}
      >
        {props.steps?.map((step: any, index: number) => {
          // Підтримка масиву рядків (як генерує AI)
          const stepDescription = typeof step === 'string' ? step : step.description;
          return (
            <div
              key={index}
              data-moveable-element={`${slideId}-step-${index}`}
              data-draggable="true"
              style={{
                textAlign: 'center',
                maxWidth: '220px',
                background: 'rgba(0,0,0,0.08)',
                borderRadius: '12px',
                padding: '24px 16px',
              }}
            >
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: currentTheme.colors.accentColor,
                  marginBottom: '10px',
                  fontFamily: currentTheme.fonts.titleFont,
                }}
              >
                {index + 1}
              </div>
              
              {/* Step Description */}
              {props.isEditable && editingSteps.includes(index) ? (
                <InlineEditor
                  initialValue={stepDescription || ''}
                  onSave={(newStep) => handleStepSave(index, newStep)}
                  onCancel={() => handleStepCancel(index)}
                  multiline={true}
                  placeholder="Enter step description..."
                  className="inline-editor-step"
                  style={{
                    ...stepDescriptionStyles,
                    // Ensure description behaves exactly like p element
                    margin: '0',
                    padding: '0',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    overflow: 'hidden',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    boxSizing: 'border-box',
                    display: 'block',
                    textAlign: 'center'
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
                  {stepDescription || 'Click to add step description'}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessStepsTemplate; 