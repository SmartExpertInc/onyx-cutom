import React, { useState, useRef, useEffect } from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import { WysiwygEditor } from '@/components/editors/WysiwygEditor';

export interface TimelineStep {
  heading: string;
  description: string;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

export interface TimelineTemplateProps {
  slideId: string;
  title: string;
  steps?: TimelineStep[];
  events?: TimelineEvent[];
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}

export const TimelineTemplate: React.FC<TimelineTemplateProps> = ({
  slideId,
  title,
  steps = [],
  events = [],
  theme,
  onUpdate,
  isEditable = false
}: TimelineTemplateProps) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, contentColor, accentColor } = currentTheme.colors;
  
  // Convert events to steps format for backwards compatibility
  const normalizedSteps: TimelineStep[] = events.length > 0 
    ? events.map(event => ({
        heading: event.date || event.title,
        description: event.description
      }))
    : steps;
  
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
    { top: '9%', side: 'left', topCircle: '5%' },
    { top: '35%', side: 'right', topCircle: '31%' },
    { top: '60%', side: 'left', topCircle: '56%' },
    { top: '85%', side: 'right', topCircle: '81%' }
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
    [side === 'left' ? 'left' : 'right']: side === 'left' ? 'calc(50% + 110px)' : 'calc(50% + 0px)',
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
    if (onUpdate) {
      if (events.length > 0) {
        const updatedEvents = [...events];
        if (!updatedEvents[index]) {
          updatedEvents[index] = { date: '', title: '', description: '' };
        }
        updatedEvents[index] = { ...updatedEvents[index], date: newHeading };
        onUpdate({ events: updatedEvents });
      } else {
        const updatedSteps = [...normalizedSteps];
        if (!updatedSteps[index]) {
          updatedSteps[index] = { heading: '', description: '' };
        }
        updatedSteps[index] = { ...updatedSteps[index], heading: newHeading };
        onUpdate({ steps: updatedSteps });
      }
    }
    setEditingStepHeadings(editingStepHeadings.filter((i: number) => i !== index));
  };

  const handleStepHeadingCancel = (index: number) => {
    setEditingStepHeadings(editingStepHeadings.filter((i: number) => i !== index));
  };

  // Handle step description editing
  const handleStepDescriptionSave = (index: number, newDescription: string) => {
    if (onUpdate) {
      if (events.length > 0) {
        const updatedEvents = [...events];
        if (!updatedEvents[index]) {
          updatedEvents[index] = { date: '', title: '', description: '' };
        }
        updatedEvents[index] = { ...updatedEvents[index], description: newDescription };
        onUpdate({ events: updatedEvents });
      } else {
        const updatedSteps = [...normalizedSteps];
        if (!updatedSteps[index]) {
          updatedSteps[index] = { heading: '', description: '' };
        }
        updatedSteps[index] = { ...updatedSteps[index], description: newDescription };
        onUpdate({ steps: updatedSteps });
      }
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

  const displaySteps = normalizedSteps.length >= 4 ? normalizedSteps.slice(0, 4) : defaultSteps;

  return (
    <div className="timeline-template" style={slideStyles}>
      {/* Title */}
      <div style={{ display: 'inline-block', position: 'relative', zIndex: 20 }}>
        {isEditable && editingTitle ? (
          <WysiwygEditor
            initialValue={title || ''}
            onSave={handleTitleSave}
            onCancel={handleTitleCancel}
            placeholder="Enter slide title..."
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
              lineHeight: '1.2'
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
            dangerouslySetInnerHTML={{ __html: title || 'Timeline' }}
          />
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
            <div style={circleStyles(item.topCircle)}></div>

            {/* Text Block */}
            <div style={textBlockStyles(item.top, item.side)}>
              {/* Heading */}
              {isEditable && editingStepHeadings.includes(index) ? (
                <WysiwygEditor
                  initialValue={displaySteps[index]?.heading || ''}
                  onSave={(newHeading) => handleStepHeadingSave(index, newHeading)}
                  onCancel={() => handleStepHeadingCancel(index)}
                  placeholder="Enter heading..."
                  className="inline-editor-heading"
                  style={{
                    ...headingStyles,
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
                  style={headingStyles}
                  onClick={() => {
                    if (isEditable) {
                      startEditingStepHeading(index);
                    }
                  }}
                  className={isEditable ? 'cursor-pointer' : ''}
                  dangerouslySetInnerHTML={{ __html: displaySteps[index]?.heading || `Milestone ${index + 1}` }}
                />
              )}

              {/* Description */}
              {isEditable && editingStepDescriptions.includes(index) ? (
                <WysiwygEditor
                  initialValue={displaySteps[index]?.description || ''}
                  onSave={(newDescription) => handleStepDescriptionSave(index, newDescription)}
                  onCancel={() => handleStepDescriptionCancel(index)}
                  placeholder="Enter description..."
                  className="inline-editor-description"
                  style={{
                    ...descriptionStyles,
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
                  style={descriptionStyles}
                  onClick={() => {
                    if (isEditable) {
                      startEditingStepDescription(index);
                    }
                  }}
                  className={isEditable ? 'cursor-pointer' : ''}
                  dangerouslySetInnerHTML={{ __html: displaySteps[index]?.description || `Description of milestone ${index + 1}` }}
                />
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default TimelineTemplate;
