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
    backgroundColor: '#473CA4',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Lora-Bold, serif',
  };

  const actorStyles: React.CSSProperties = {
    position: 'absolute',
    left: '140px',
    bottom: '0px',
    height: '600px',
  };

  const lineStyles: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '193px',
    bottom: '80px',
    width: '3px',
    height: '100%',
    backgroundColor: '#232428',
  };

  const stepNumStyles: React.CSSProperties = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#232428',
    color: '#D3D4D8',
    fontFamily: 'Lora-Bold, serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '33px',
  };

  const stepTextStyles: React.CSSProperties = {
    color: '#E0DFEC',
    fontSize: '46px',
    fontFamily: 'Lora-Bold, serif',
    lineHeight: '1.05',
  };

  const stepContainerStyles = (index: number): React.CSSProperties => ({
    position: 'absolute',
    left: '55%',
    top: index === 0 ? '137px' : '467px',
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
  });

  const circlePositionStyles = (index: number): React.CSSProperties => ({
    position: 'absolute',
    left: 'calc(50% - 38px)', // center the 110px circle on the vertical line
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
    left: '15px',
    width: '30px',
  };

  const pageNumberStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: '24px',
    left: '22px',
    color: '#E6E6F3',
    fontSize: '13px',
    fontFamily: 'Lora-Bold, serif'
  };

  return (
    <div className="course-rules-timeline-slide inter-theme" style={slideStyles}>
      {/* Left accent line */}
      <div style={leftAccentLine} />

      {/* Small star icon top-left */}
      <img
        alt="star"
        style={starStyles}
        src={"data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#FFFFFF" d="M12 2l1.8 4.6L18 8.4l-4.2 1.8L12 15l-1.8-4.8L6 8.4l4.2-1.8L12 2z"/></svg>')}
      />

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

