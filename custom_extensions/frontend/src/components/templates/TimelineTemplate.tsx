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
      textAlign: 'center',
      gap: '8px',
  };

  const headingStyles: React.CSSProperties = {
    fontSize: '1.2rem',
    color: titleColor,
    fontFamily: currentTheme.fonts.titleFont,
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    color: contentColor,
    fontFamily: currentTheme.fonts.contentFont,
    lineHeight: 1.5,
  };

  return (
    <div className="timeline-template" style={slideStyles}>
      <h1 style={titleStyles}>{title}</h1>
      <div style={timelineContainerStyles}>
        <div style={timelineLineStyles}></div>
        {steps.slice(0, 4).map((step: TimelineStep, index: number) => {
          const isTop = index % 2 !== 0; // 1, 3 on top
          
          return (
            <div key={index} style={stepWrapperStyles}>
              <div style={milestoneContentStyles(isTop)}>
                <div style={{...textBlockStyles, order: isTop ? 1 : 3}}>
                  <div style={headingStyles}>{step.heading}</div>
                  <div style={descriptionStyles}>{step.description}</div>
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