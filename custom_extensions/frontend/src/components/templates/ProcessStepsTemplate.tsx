// custom_extensions/frontend/src/components/templates/ProcessStepsTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ProcessStepsProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import { WysiwygEditor } from '@/components/editors/WysiwygEditor';

interface StepItem {
  title: string;
  description: string;
  icon?: string;
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
  const [editingStepTitle, setEditingStepTitle] = useState<number | null>(null);
  const [editingStepDescription, setEditingStepDescription] = useState<number | null>(null);
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

  // Define colors for each step (new colors as requested)
  const stepColors = [
    '#0F58F9', // Blue for PROBLEM
    '#2A7CFF', // Light blue for READ  
    '#09ACD8', // Cyan for HYPOTHESIZE
    '#1B94E8', // Sky blue for RESEARCH
    '#01298A'  // Dark blue for CONCLUSION
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
    flex: '1.8', // Увеличиваем flex для большей ширины
    display: 'flex',
    flexDirection: 'column',
    gap: '7px'
    // Убираем maxWidth чтобы колонка могла быть шире
  };

  const titleStyles: React.CSSProperties = {
    width: '230px',
    fontSize: '3rem',
    fontFamily: 'serif', // Serif font as in photo
    color: '#000000', // Black color as in photo
    fontWeight: 'bold',
    lineHeight: '0.85',
    marginBottom: '20px',
    textAlign: 'left',
    letterSpacing: '-0.04em'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '1.4rem',
    fontFamily: 'sans-serif', // Sans-serif font as in photo
    color: '#09090B', // Black color as in photo
    fontWeight: 'normal',
    textAlign: 'left',
    opacity: 0.9,
    letterSpacing: '0.01em'
  };

  const stepContainerStyles = (color: string): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '25px 36px',
    borderRadius: '2px',
    minHeight: '110px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    background: color, // Solid color instead of gradient as in photo
    width: '100%' // Each block takes full width of right column
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
    border: `3px solid ${color}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'absolute',
    left: '-21px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  });

  const stepNumberInnerStyles = (color: string): React.CSSProperties => ({
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color, // Цвет текста такой же как цвет блока
    fontSize: '18px',
    fontWeight: 'bold'
  });

  const stepContentStyles: React.CSSProperties = {
    width: '80%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: '25px',
    gap: '6px',
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
    fontFamily: 'sans-serif',
    width: '210px',
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

  // Handle step title editing
  const handleStepTitleSave = (index: number, newValue: string) => {
    if (props.onUpdate) {
      const updatedSteps = [...steps];
      if (typeof updatedSteps[index] === 'string') {
        updatedSteps[index] = {
          title: newValue,
          description: updatedSteps[index] as string
        };
      } else {
        updatedSteps[index] = {
          ...updatedSteps[index],
          title: newValue
        };
      }
      props.onUpdate({ steps: updatedSteps });
    }
    setEditingStepTitle(null);
  };

  const handleStepTitleCancel = () => {
    setEditingStepTitle(null);
  };

  // Handle step description editing
  const handleStepDescriptionSave = (index: number, newValue: string) => {
    if (props.onUpdate) {
      const updatedSteps = [...steps];
      if (typeof updatedSteps[index] === 'string') {
        updatedSteps[index] = {
          title: `Step ${index + 1}`,
          description: newValue
        };
      } else {
        updatedSteps[index] = {
          ...updatedSteps[index],
          description: newValue
        };
      }
      props.onUpdate({ steps: updatedSteps });
    }
    setEditingStepDescription(null);
  };

  const handleStepDescriptionCancel = () => {
    setEditingStepDescription(null);
  };

  const startEditingStepTitle = (index: number) => {
    setEditingStepTitle(index);
  };

  const startEditingStepDescription = (index: number) => {
    setEditingStepDescription(index);
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
            <WysiwygEditor
              initialValue={props.title || 'The Stages of Research'}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              placeholder="Enter title..."
              className="inline-editor-title"
              style={{
                ...titleStyles,
                padding: '8px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block',
                lineHeight: '0.85'
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
              dangerouslySetInnerHTML={{ __html: props.title || 'The Stages of Research' }}
            />
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
            <WysiwygEditor
              initialValue={(props as any).subtitle || 'Miss Jones Science Class'}
              onSave={handleSubtitleSave}
              onCancel={handleSubtitleCancel}
              placeholder="Enter subtitle..."
              className="inline-editor-subtitle"
              style={{
                ...subtitleStyles,
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
              dangerouslySetInnerHTML={{ __html: (props as any).subtitle || 'Miss Jones Science Class' }}
            />
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
                {props.isEditable && editingStepTitle === index ? (
                  <WysiwygEditor
                    initialValue={stepTitle}
                    onSave={(newValue) => handleStepTitleSave(index, newValue)}
                    onCancel={handleStepTitleCancel}
                    placeholder="Enter step title..."
                    className="inline-editor-step-title"
                    style={{
                      ...stepTitleStyles,
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
                        startEditingStepTitle(index);
                      }
                    }}
                    className={props.isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                    dangerouslySetInnerHTML={{ __html: stepTitle }}
                  />
                )}

                {/* Step Description */}
                {props.isEditable && editingStepDescription === index ? (
                  <WysiwygEditor
                    initialValue={stepDescription}
                    onSave={(newValue) => handleStepDescriptionSave(index, newValue)}
                    onCancel={handleStepDescriptionCancel}
                    placeholder="Enter step description..."
                    className="inline-editor-step-description"
                    style={{
                      ...stepDescriptionStyles,
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
                        startEditingStepDescription(index);
                      }
                    }}
                    className={props.isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                    dangerouslySetInnerHTML={{ __html: stepDescription }}
                  />
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