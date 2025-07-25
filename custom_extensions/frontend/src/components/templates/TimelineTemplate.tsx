import React from 'react';
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
}

export const TimelineTemplate: React.FC<TimelineTemplateProps> = ({
  slideId,
  title,
  steps = [],
  theme
}: TimelineTemplateProps) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, contentColor, accentColor } = currentTheme.colors;

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
    marginBottom: 'auto',
    textAlign: 'left',
  };

  const timelineContainerStyles: React.CSSProperties = {
    width: '90%',
    margin: '0 auto',
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };
  
  const timelineLineStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: '2px',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    transform: 'translateY(-50%)',
  };

  const stepStyles = (index: number): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: `${100 / (steps.length || 1)}%`,
    zIndex: 1,
  });

  const textBlockStyles = (index: number): React.CSSProperties => {
    const isTop = index % 2 !== 0; // 1, 3 on top
    return {
      order: isTop ? 1 : 3,
      marginBottom: isTop ? '20px' : '0',
      marginTop: isTop ? '0' : '20px',
      color: contentColor,
      width: '100%',
      padding: '0 10px',
    };
  };

  const connectorContainerStyles: React.CSSProperties = {
    order: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const connectorLineStyles: React.CSSProperties = {
    width: '2px',
    height: '25px',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  };

  const numberCircleStyles: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: titleColor,
    fontSize: '1.2rem',
    fontWeight: 'bold',
  };

  const headingStyles: React.CSSProperties = {
    fontSize: '1.3rem',
    fontWeight: 600,
    fontFamily: currentTheme.fonts.titleFont,
    color: titleColor,
    marginBottom: '8px',
  };
  
  const descriptionStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    lineHeight: 1.5,
  };

  return (
    <div className="timeline-template" style={slideStyles}>
      <h1 style={titleStyles}>{title}</h1>
      <div style={timelineContainerStyles}>
        <div style={timelineLineStyles}></div>
        {steps.slice(0, 4).map((step: TimelineStep, index: number) => (
          <div key={index} style={stepStyles(index)}>
            <div style={textBlockStyles(index)}>
              {React.createElement('h4', { style: headingStyles }, step.heading)}
              {React.createElement('p', { style: descriptionStyles }, step.description)}
            </div>
            <div style={connectorContainerStyles}>
              <div style={connectorLineStyles}></div>
              <div style={numberCircleStyles}>{index + 1}</div>
              <div style={connectorLineStyles}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineTemplate; 