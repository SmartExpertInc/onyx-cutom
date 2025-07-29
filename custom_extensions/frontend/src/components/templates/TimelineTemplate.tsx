import React from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import SimpleInlineEditor from '../SimpleInlineEditor';

export interface TimelineStep {
  heading: string;
  description: string;
}

export interface TimelineTemplateProps {
  slideId: string;
  title: string;
  steps: TimelineStep[];
  theme?: SlideTheme;
  onUpdate?: (updates: Record<string, unknown>) => void;
}

export const TimelineTemplate: React.FC<TimelineTemplateProps> = ({
  slideId,
  title,
  steps = [],
  theme,
  onUpdate
}: TimelineTemplateProps) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, contentColor, accentColor } = currentTheme.colors;

  const handleTitleChange = (newTitle: string) => {
    if (onUpdate) { onUpdate({ title: newTitle }); }
  };

  const handleStepChange = (index: number, field: keyof TimelineStep, value: string) => {
    if (!onUpdate || !Array.isArray(steps)) return;
    
    const newSteps = [...steps];
    if (!newSteps[index]) {
      newSteps[index] = { heading: '', description: '' };
    }
    newSteps[index] = { ...newSteps[index], [field]: value };
    onUpdate({ steps: newSteps });
  };

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
      gap: '8px',
      maxWidth: '200px',
  };

  const headingStyles: React.CSSProperties = {
      fontSize: '1rem',
      fontWeight: 600,
      color: contentColor,
      fontFamily: currentTheme.fonts.titleFont,
      margin: 0,
  };

  const descriptionStyles: React.CSSProperties = {
      fontSize: currentTheme.fonts.contentSize,
      color: contentColor,
      fontFamily: currentTheme.fonts.contentFont,
      margin: 0,
      textAlign: 'center',
      lineHeight: 1.4,
  };

  return (
    <div className="timeline-template" style={slideStyles}>
      <h1 style={titleStyles}>
        <SimpleInlineEditor
          value={title || ''}
          onSave={handleTitleChange}
          placeholder="Enter slide title..."
          maxLength={100}
          className="timeline-title-editable"
        />
      </h1>
      <div style={timelineContainerStyles}>
        <div style={timelineLineStyles} />
        {Array.isArray(steps) && steps.slice(0, 4).map((step, index) => {
          const isTop = index % 2 === 0;
          return (
            <div key={index} style={stepWrapperStyles}>
              <div style={milestoneContentStyles(isTop)}>
                <div style={numberSquareStyles}>{index + 1}</div>
                <div style={verticalLineStyles} />
                <div style={textBlockStyles}>
                  <div style={headingStyles}>
                    <SimpleInlineEditor
                      value={step.heading || ''}
                      onSave={(value) => handleStepChange(index, 'heading', value)}
                      placeholder={`Step ${index + 1} heading`}
                      maxLength={50}
                      className="timeline-heading-editable"
                    />
                  </div>
                  <div style={descriptionStyles}>
                    <SimpleInlineEditor
                      value={step.description || ''}
                      onSave={(value) => handleStepChange(index, 'description', value)}
                      multiline={true}
                      placeholder={`Step ${index + 1} description`}
                      maxLength={150}
                      rows={3}
                      className="timeline-description-editable"
                    />
                  </div>
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