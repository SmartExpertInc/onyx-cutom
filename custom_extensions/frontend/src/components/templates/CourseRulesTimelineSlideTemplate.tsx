// custom_extensions/frontend/src/components/templates/CourseRulesTimelineSlideTemplate.tsx

import React, { useState } from 'react';
import { CourseRulesTimelineSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export const CourseRulesTimelineSlideTemplate: React.FC<CourseRulesTimelineSlideProps & { theme?: SlideTheme | string; isEditable?: boolean; onUpdate?: (props: any) => void; }> = (props: CourseRulesTimelineSlideProps & { theme?: SlideTheme | string; isEditable?: boolean; onUpdate?: (props: any) => void; }) => {
  const {
    slideId,
    steps: stepsProp,
    profileImagePath = '',
    profileImageAlt = 'Profile image',
    backgroundColor,
    textColor,
    isEditable = false,
    onUpdate,
    theme,
  } = props as CourseRulesTimelineSlideProps & { theme?: SlideTheme | string; isEditable?: boolean; onUpdate?: (props: any) => void; };
  const steps = stepsProp ?? [
    { number: '01', text: 'Rules of the course' },
    { number: '02', text: 'Prerequisite courses' },
  ];
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editingStep, setEditingStep] = useState<{ index: number; field: 'number' | 'text' } | null>(null);
  const [currentSteps, setCurrentSteps] = useState(steps);

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
    left: '70px',
    bottom: '0px',
    width: '400px',
    height: '640px',
  };

  const lineStyles: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '80px',
    bottom: '80px',
    width: '2px',
    backgroundColor: '#171717',
  };

  const stepNumStyles: React.CSSProperties = {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    backgroundColor: '#171717',
    color: '#FFFFFF',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '42px',
  };

  const stepTextStyles: React.CSSProperties = {
    color: '#FFFFFF',
    fontSize: '39px',
    fontWeight: 700,
    lineHeight: '1.05',
  };

  const stepContainerStyles = (index: number): React.CSSProperties => ({
    position: 'absolute',
    left: '55%',
    top: index === 0 ? '150px' : '480px',
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
  });

  const circlePositionStyles = (index: number): React.CSSProperties => ({
    position: 'absolute',
    left: 'calc(50% - 55px)', // center the 110px circle on the vertical line
    top: index === 0 ? '120px' : '450px',
  });

  const leftAccentLine: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '60px',
    width: '2px',
    backgroundColor: 'rgba(255,255,255,0.25)'
  };

  const starStyles: React.CSSProperties = {
    position: 'absolute',
    top: '34px',
    left: '26px',
    width: '14px',
    height: '14px'
  };

  const pageNumberStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: '24px',
    left: '24px',
    color: '#E6E6F3',
    fontSize: '16px',
    fontWeight: 400
  };

  return (
    <div className="course-rules-timeline-slide inter-theme" style={slideStyles}>
      {/* Left accent line */}
      <div style={leftAccentLine} />

      {/* Small star icon top-left (built with divs) */}
      <div style={starStyles}>
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: '12px', height: '2px', backgroundColor: '#FFFFFF', transform: 'translate(-50%, -50%)' }} />
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: '2px', height: '12px', backgroundColor: '#FFFFFF', transform: 'translate(-50%, -50%)' }} />
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: '12px', height: '2px', backgroundColor: '#FFFFFF', transform: 'translate(-50%, -50%) rotate(45deg)' }} />
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: '12px', height: '2px', backgroundColor: '#FFFFFF', transform: 'translate(-50%, -50%) rotate(-45deg)' }} />
      </div>

      {/* Actor */}
      <div style={actorStyles}>
        <ClickableImagePlaceholder
          imagePath={profileImagePath}
          onImageUploaded={(p: string) => onUpdate && onUpdate({ profileImagePath: p })}
          size="LARGE"
          position="CENTER"
          description="Actor"
          isEditable={isEditable}
          style={{ width: '100%', height: '100%' }}
          fit="contain"
        />
      </div>

      {/* Vertical line */}
      <div style={lineStyles} />

      {/* Circles centered on the line */}
      {currentSteps.slice(0, 2).map((s: { number: string; text: string }, i: number) => (
        <div key={`circle-${i}`} style={circlePositionStyles(i)}>
          {isEditable && editingStep && editingStep.index === i && editingStep.field === 'number' ? (
            <ImprovedInlineEditor
              initialValue={s.number}
              onSave={(val) => {
                const updated = [...currentSteps];
                updated[i] = { ...updated[i], number: val };
                setCurrentSteps(updated);
                setEditingStep(null);
                onUpdate && onUpdate({ steps: updated });
              }}
              onCancel={() => setEditingStep(null)}
              className="timeline-step-number-editor"
              style={{ ...stepNumStyles, width: stepNumStyles.width, height: stepNumStyles.height, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
          ) : (
            <div style={stepNumStyles} onClick={() => isEditable && setEditingStep({ index: i, field: 'number' })}>{s.number}</div>
          )}
        </div>
      ))}

      {/* Step texts on the right */}
      {currentSteps.slice(0, 2).map((s: { number: string; text: string }, i: number) => (
        <div key={`text-${i}`} style={stepContainerStyles(i)}>
          {isEditable && editingStep && editingStep.index === i && editingStep.field === 'text' ? (
            <ImprovedInlineEditor
              initialValue={s.text}
              onSave={(val) => {
                const updated = [...currentSteps];
                updated[i] = { ...updated[i], text: val };
                setCurrentSteps(updated);
                setEditingStep(null);
                onUpdate && onUpdate({ steps: updated });
              }}
              onCancel={() => setEditingStep(null)}
              className="timeline-step-text-editor"
              style={{ ...stepTextStyles }}
            />
          ) : (
            <div style={stepTextStyles} onClick={() => isEditable && setEditingStep({ index: i, field: 'text' })}>{s.text}</div>
          )}
        </div>
      ))}

      {/* Bottom-left page number */}
      <div style={pageNumberStyles}>07</div>
    </div>
  );
};

export default CourseRulesTimelineSlideTemplate;

