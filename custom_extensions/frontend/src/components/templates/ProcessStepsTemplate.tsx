// custom_extensions/frontend/src/components/templates/ProcessStepsTemplate.tsx

import React, { useState } from 'react';
import { ProcessStepsProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background:'transparent',
    border:'none',
    outline:'none',
    padding:0,
    margin:0
  });

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
      style={inline({
        padding: '40px',
        minHeight: '600px',
        backgroundColor: currentTheme.colors.backgroundColor,
        fontFamily: currentTheme.fonts.contentFont,
      })}
    >
      {/* Title */}
      {props.isEditable && editingTitle ? (
        <ImprovedInlineEditor
          initialValue={props.title || ''}
          onSave={handleTitleSave}
          onCancel={handleTitleCancel}
          multiline={true}
          placeholder="Enter slide title..."
          className="inline-editor-title"
          style={inline({
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
          })}
        />
      ) : (
        <h1 
          style={titleStyles}
          onClick={() => {
            if (props.isEditable) {
              setEditingTitle(true);
            }
          }}
          className={props.isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
        >
          {props.title || 'Click to add title'}
        </h1>
      )}

      <div
        style={inline({
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'start',
          gap: '32px',
        })}
      >
        {props.steps?.map((step: any, index: number) => {
          // Підтримка масиву рядків (як генерує AI)
          const stepDescription = typeof step === 'string' ? step : step.description;
          return (
            <div
              key={index}
              style={inline({
                textAlign: 'center',
                maxWidth: '220px',
                background: 'rgba(0,0,0,0.08)',
                borderRadius: '12px',
                padding: '24px 16px',
              })}
            >
              <div
                style={inline({
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: currentTheme.colors.accentColor,
                  marginBottom: '10px',
                  fontFamily: currentTheme.fonts.titleFont,
                })}
              >
                {index + 1}
              </div>
              
              {/* Step Description */}
              {props.isEditable && editingSteps.includes(index) ? (
                <ImprovedInlineEditor
                  initialValue={stepDescription || ''}
                  onSave={(newStep) => handleStepSave(index, newStep)}
                  onCancel={() => handleStepCancel(index)}
                  multiline={true}
                  placeholder="Enter step description..."
                  className="inline-editor-step"
                  style={inline({
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
                  })}
                />
              ) : (
                <p 
                  style={stepDescriptionStyles}
                  onClick={() => {
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