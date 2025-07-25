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
    marginBottom: '48px',
    textAlign: 'center',
  };

  const timelineContainerStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '320px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginTop: '32px',
  };

  const timelineLineStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '5%',
    width: '90%',
    height: '4px',
    background: 'rgba(255,255,255,0.18)',
    zIndex: 1,
    transform: 'translateY(-50%)',
    borderRadius: '2px',
    pointerEvents: 'none',
  };

  const stepWrapperStyles: React.CSSProperties = {
    position: 'relative',
    width: '25%',
    height: '320px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  };

  const absCircleStyles: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: accentColor,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '1.5rem',
    border: `2px solid ${accentColor}`,
    boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
    zIndex: 3,
  };

  const absVertLineStyles = (isTop: boolean): React.CSSProperties => ({
    position: 'absolute',
    left: '50%',
    width: '2px',
    height: '48px',
    background: 'rgba(255,255,255,0.18)',
    zIndex: 2,
    top: isTop ? undefined : '50%',
    bottom: isTop ? '50%' : undefined,
    transform: 'translateX(-50%)',
  });

  const textBlockStyles = (isTop: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: isTop ? '0' : '0',
    marginTop: isTop ? '0' : '0',
    minWidth: '180px',
    maxWidth: '220px',
    zIndex: 4,
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    top: isTop ? '0' : undefined,
    bottom: isTop ? undefined : '0',
  });

  const headingStyles: React.CSSProperties = {
    fontSize: '1.2rem',
    color: titleColor,
    fontWeight: 600,
    marginBottom: '8px',
    fontFamily: currentTheme.fonts.titleFont,
    textAlign: 'center',
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    color: contentColor,
    fontFamily: currentTheme.fonts.contentFont,
    lineHeight: 1.5,
    textAlign: 'center',
  };

  return (
    <div className="timeline-template" style={slideStyles}>
      <h1 style={titleStyles}>{title}</h1>
      <div style={timelineContainerStyles}>
        <div style={timelineLineStyles}></div>
        {steps.slice(0, 4).map((step: TimelineStep, index: number) => {
          const isTop = index % 2 === 0; // 0,2 - top; 1,3 - bottom
          return (
            <div key={index} style={stepWrapperStyles}>
              {/* Верхній текстовий блок (для парних) */}
              {isTop && (
                <div style={textBlockStyles(true)}>
                  <div style={headingStyles}>{step.heading}</div>
                  <div style={descriptionStyles}>{step.description}</div>
                </div>
              )}
              {/* Вертикальна лінія */}
              <div style={absVertLineStyles(isTop)}></div>
              {/* Коло з числом */}
              <div style={absCircleStyles}>{index + 1}</div>
              {/* Вертикальна лінія вниз (для нижніх) */}
              <div style={absVertLineStyles(!isTop)}></div>
              {/* Нижній текстовий блок (для непарних) */}
              {!isTop && (
                <div style={textBlockStyles(false)}>
                  <div style={headingStyles}>{step.heading}</div>
                  <div style={descriptionStyles}>{step.description}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineTemplate; 