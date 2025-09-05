// custom_extensions/frontend/src/components/templates/CourseRulesTimelineSlideTemplate.tsx

import React from 'react';
import { CourseRulesTimelineSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export const CourseRulesTimelineSlideTemplate: React.FC<CourseRulesTimelineSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  steps = [
    { number: '01', text: 'Rules of the course' },
    { number: '02', text: 'Prerequisite courses' },
  ],
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  backgroundColor,
  textColor,
  isEditable = false,
  onUpdate,
  theme,
}) => {
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#4D3EC1',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const actorStyles: React.CSSProperties = {
    position: 'absolute',
    left: '72px',
    bottom: '36px',
    width: '400px',
    height: '520px',
  };

  const lineStyles: React.CSSProperties = {
    position: 'absolute',
    left: '52%',
    top: '120px',
    bottom: '120px',
    width: '2px',
    backgroundColor: '#171717',
  };

  const stepNumStyles: React.CSSProperties = {
    width: '68px',
    height: '68px',
    borderRadius: '50%',
    backgroundColor: '#171717',
    color: '#FFFFFF',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
  };

  const stepTextStyles: React.CSSProperties = {
    color: '#FFFFFF',
    fontSize: '56px',
    fontWeight: 700,
  };

  const stepContainerStyles = (index: number): React.CSSProperties => ({
    position: 'absolute',
    left: '56%',
    top: index === 0 ? '150px' : '360px',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  });

  return (
    <div className="course-rules-timeline-slide inter-theme" style={slideStyles}>
      {/* Actor */}
      <div style={actorStyles}>
        <ClickableImagePlaceholder
          imagePath={profileImagePath}
          onImageUploaded={(p: string) => onUpdate && onUpdate({ profileImagePath: p })}
          size="LARGE"
          position="CENTER"
          description="Actor"
          isEditable={isEditable}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      {/* Vertical line */}
      <div style={lineStyles} />

      {/* Steps */}
      {steps.slice(0, 2).map((s, i) => (
        <div key={i} style={stepContainerStyles(i)}>
          <div style={stepNumStyles}>{s.number}</div>
          <div style={stepTextStyles}>{s.text}</div>
        </div>
      ))}
    </div>
  );
};

export default CourseRulesTimelineSlideTemplate;

