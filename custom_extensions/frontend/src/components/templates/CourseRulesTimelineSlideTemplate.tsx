// custom_extensions/frontend/src/components/templates/CourseRulesTimelineSlideTemplate.tsx

import React, { useState, useEffect } from 'react';
import { CourseRulesTimelineSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import PresentationImageUpload from '../PresentationImageUpload';
import YourLogo from '../YourLogo';

export const CourseRulesTimelineSlideTemplate: React.FC<CourseRulesTimelineSlideProps & { theme?: SlideTheme | string; isEditable?: boolean; onUpdate?: (props: any) => void; }> = (props: CourseRulesTimelineSlideProps & { theme?: SlideTheme | string; isEditable?: boolean; onUpdate?: (props: any) => void; }) => {
  const {
    slideId,
    steps: stepsProp,
    profileImagePath = '',
    profileImageAlt = 'Profile image',
    companyLogoPath = '',
    companyLogoAlt = 'Company logo',
    logoText = 'Your Logo',
    logoPath = '',
    backgroundColor,
    textColor,
    isEditable = false,
    onUpdate,
    theme,
  } = props as CourseRulesTimelineSlideProps & { theme?: SlideTheme | string; isEditable?: boolean; onUpdate?: (props: any) => void; companyLogoPath?: string; companyLogoAlt?: string; logoText?: string; logoPath?: string; };
  const steps = stepsProp ?? [
    { number: '1', text: 'Rules of the course' },
    { number: '2', text: 'Prerequisite courses' },
    { number: '3', text: 'Course expectations' },
  ];
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editingStep, setEditingStep] = useState<{ index: number; field: 'number' | 'text' } | null>(null);
  const [currentSteps, setCurrentSteps] = useState(steps);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState('34');


  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#E0E7FF',
    position: 'relative',
    overflow: 'visible',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const actorStyles: React.CSSProperties = {
    position: 'absolute',
    left: '0px',
    bottom: '0px',
    height: '100%',
    width: '50%',
    background: 'linear-gradient(to bottom, #0F58F9, #1023A1)',
  };

  const lineStyles: React.CSSProperties = {
    position: 'absolute',
    left: '56%',
    top: '135px',
    bottom: '-50px',
    width: '3px',
    backgroundColor: '#0F58F9',
  };

  const stepNumStyles: React.CSSProperties = {
    width: '50px',
    height: '50px',
    borderRadius: '2px',
    backgroundColor: '#0F58F9',
    color: '#FFFFFF',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '33px',
  };

  const stepTextStyles: React.CSSProperties = {
    color: 'black',
    fontSize: '35px',
    fontWeight: 600,
    lineHeight: '1.05',
  };

  const stepContainerStyles = (index: number): React.CSSProperties => ({
    position: 'absolute',
    left: '61%',
    top: index === 0 ? '140px' : index === 1 ? '240px' : '340px',
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
  });

  const circlePositionStyles = (index: number): React.CSSProperties => ({
    position: 'absolute',
    left: 'calc(50% + 44px)', // center the 110px circle on the vertical line
    top: index === 0 ? '135px' : index === 1 ? '235px' : '335px',
  });

  const pageNumberStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: '24px',
    right: '22px',
    color: '#5F616D',
    fontSize: '15px',
    fontWeight: 400
  };


  return (
    <>
      <style>{`
        .course-rules-timeline-slide .step-text {
          font-family: "Lora", serif !important;
          font-weight: 600 !important;
          color: black !important;
        }
        .course-rules-timeline-slide .step-number {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
      `}</style>
      <div className="course-rules-timeline-slide inter-theme" style={slideStyles}>
      {/* Logo */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '25px',
        zIndex: 10
      }}>
        <YourLogo
          logoPath={logoPath}
          onLogoUploaded={(p) => onUpdate && onUpdate({ logoPath: p })}
          isEditable={isEditable}
          color="black"
          text={logoText}
        />
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

      {/* Squares centered on the line */}
      {currentSteps.slice(0, 3).map((s: { number: string; text: string }, i: number) => {
        return (
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
              style={{ ...stepNumStyles, width: stepNumStyles.width, height: stepNumStyles.height, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
          ) : (
            <div className="step-number" style={stepNumStyles} onClick={() => isEditable && setEditingStep({ index: i, field: 'number' })}>{s.number}</div>
          )}
        </div>
        );
      })}

      {/* Step texts on the right */}
      {currentSteps.slice(0, 3).map((s: { number: string; text: string }, i: number) => {
        return (
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
              className="timeline-step-text-editor step-text"
              style={{ ...stepTextStyles }}
            />
          ) : (
            <div className="step-text" style={stepTextStyles} onClick={() => isEditable && setEditingStep({ index: i, field: 'text' })}>{s.text}</div>
          )}
        </div>
        );
      })}

      {/* Bottom-right page number */}
      <div style={pageNumberStyles}>
        {isEditable && editingPageNumber ? (
          <ImprovedInlineEditor
            initialValue={currentPageNumber}
            onSave={(v) => {
              setCurrentPageNumber(v);
              setEditingPageNumber(false);
              onUpdate && onUpdate({ pageNumber: v });
            }}
            onCancel={() => setEditingPageNumber(false)}
            style={{ ...pageNumberStyles, position: 'relative', background: 'transparent', border: 'none', outline: 'none', padding: 0, margin: 0 }}
          />
        ) : (
          <div onClick={() => isEditable && setEditingPageNumber(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>
            {currentPageNumber}
          </div>
        )}
      </div>

      </div>
    </>
  );
};

export default CourseRulesTimelineSlideTemplate;

