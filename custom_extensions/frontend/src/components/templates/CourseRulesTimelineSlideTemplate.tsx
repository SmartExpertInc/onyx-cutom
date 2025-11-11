// custom_extensions/frontend/src/components/templates/CourseRulesTimelineSlideTemplate.tsx

import React, { useState, useEffect } from 'react';
import { CourseRulesTimelineSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import YourLogo from '../YourLogo';

export const CourseRulesTimelineSlideTemplate: React.FC<CourseRulesTimelineSlideProps & { theme?: SlideTheme | string; }> = (props: CourseRulesTimelineSlideProps & { theme?: SlideTheme | string; }) => {
  const {
    slideId,
    steps: stepsProp,
    profileImagePath = '',
    profileImageAlt = 'Profile image',
    logoText = 'Your Logo',
    logoPath = '',
    backgroundColor,
    textColor,
    isEditable = false,
    onUpdate,
    pageNumber = '34',
    theme,
  } = props;
  const stepOne = { number: '1', text: 'Rules of the course' };
  const stepTwo = { number: '2', text: 'Prerequisite courses' };
  const stepThree = { number: '3', text: 'Course expectations' };

  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editingStep, setEditingStep] = useState<{ index: number; field: 'number' | 'text' } | null>(null);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber || '34');
  const [currentSteps, setCurrentSteps] = useState(() => (
    stepsProp && stepsProp.length ? stepsProp.map((step) => ({ ...step })) : [stepOne, stepTwo, stepThree]
  ));
  const [currentLogoText, setCurrentLogoText] = useState(logoText || 'Your Logo');
  const [currentLogoPath, setCurrentLogoPath] = useState(logoPath || '');

  useEffect(() => {
    const nextSteps = stepsProp && stepsProp.length ? stepsProp : [stepOne, stepTwo, stepThree];
    setCurrentSteps(nextSteps.map((step) => ({ ...step })));
  }, [stepsProp]);

  useEffect(() => {
    setCurrentPageNumber(pageNumber || '34');
  }, [pageNumber]);

  useEffect(() => {
    setCurrentLogoText(logoText || 'Your Logo');
  }, [logoText]);

  useEffect(() => {
    setCurrentLogoPath(logoPath || '');
  }, [logoPath]);


  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: backgroundColor || '#E0E7FF',
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
    top: '155px',
    bottom: '0px',
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
    color: textColor || 'black',
    fontSize: '35px',
    fontWeight: 600,
    lineHeight: '1.05',
  };

  const stepContainerStyles = (index: number): React.CSSProperties => ({
    position: 'absolute',
    left: '61%',
    top: index === 0 ? '160px' : index === 1 ? '300px' : '440px',
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
  });

  const circlePositionStyles = (index: number): React.CSSProperties => ({
    position: 'absolute',
    left: 'calc(50% + 45px)', // center the 110px circle on the vertical line
    top: index === 0 ? '155px' : index === 1 ? '295px' : '435px',
  });

  const pageNumberStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: '24px',
    right: '0px',
    color: '#5F616D',
    fontSize: '15px',
    fontWeight: 600
  };


  return (
    <>
      <style>{`
        .course-rules-timeline-slide .step-text {
          font-family: "Lora", serif !important;
          font-weight: 600 !important;
          color: black !important;
        }
        .course-rules-timeline-slide .step-number * {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .course-rules-timeline-slide-logo,
        .course-rules-timeline-slide-logo *,
        .course-rules-timeline-slide-page-number,
        .course-rules-timeline-slide-page-number * {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-weight: 500 !important;
        }
      `}</style>
      <div className="course-rules-timeline-slide inter-theme" style={slideStyles}>
      {/* Logo */}
      <div className="course-rules-timeline-slide-logo" style={{
        position: 'absolute',
        top: '20px',
        right: '25px',
        zIndex: 10
      }}>
        <YourLogo
          logoPath={currentLogoPath}
          onLogoUploaded={(p) => {
            setCurrentLogoPath(p);
            onUpdate && onUpdate({ logoPath: p });
          }}
          isEditable={isEditable}
          color="black"
          text={currentLogoText}
          onTextChange={(text) => {
            const next = text || '';
            setCurrentLogoText(next);
            onUpdate && onUpdate({ logoText: next });
          }}
          style={{ fontFamily: 'Inter, sans-serif !important', fontSize: '15px' }}
        />
      </div>

      {/* Actor */}
      <div style={actorStyles}>
        <ClickableImagePlaceholder
          imagePath={profileImagePath}
          onImageUploaded={(p: string) => {
            onUpdate && onUpdate({ profileImagePath: p });
          }}
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

      {/* Render the three steps */}
      {currentSteps.map((step, i) => (
        <div key={i}>
          {/* Step number square - positioned directly on the vertical line */}
          <div style={circlePositionStyles(i)}>
            {isEditable && editingStep && editingStep.index === i && editingStep.field === 'number' ? (
              <ImprovedInlineEditor
                initialValue={step.number}
                onSave={(val) => {
                  setEditingStep(null);
                  const updatedSteps = currentSteps.map((s, idx) => idx === i ? { ...s, number: val } : s);
                  setCurrentSteps(updatedSteps);
                  onUpdate && onUpdate({ steps: updatedSteps });
                }}
                onCancel={() => setEditingStep(null)}
                className="timeline-step-number-editor"
                style={{ ...stepNumStyles, width: stepNumStyles.width, height: stepNumStyles.height, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
            ) : (
              <div className="step-number" style={stepNumStyles} onClick={() => isEditable && setEditingStep({ index: i, field: 'number' })}>{step.number}</div>
            )}
          </div>

          {/* Step text - positioned to the right of the line */}
          <div style={stepContainerStyles(i)}>
            {isEditable && editingStep && editingStep.index === i && editingStep.field === 'text' ? (
              <ImprovedInlineEditor
                initialValue={step.text}
                onSave={(val) => {
                  setEditingStep(null);
                  const updatedSteps = currentSteps.map((s, idx) => idx === i ? { ...s, text: val } : s);
                  setCurrentSteps(updatedSteps);
                  onUpdate && onUpdate({ steps: updatedSteps });
                }}
                onCancel={() => setEditingStep(null)}
                className="timeline-step-text-editor step-text"
                style={{ ...stepTextStyles }}
              />
            ) : (
              <div className="step-text" style={stepTextStyles} onClick={() => isEditable && setEditingStep({ index: i, field: 'text' })}>{step.text}</div>
            )}
          </div>
        </div>
      ))}


      {/* Bottom-right page number */}
      <div className="course-rules-timeline-slide-page-number" style={{...pageNumberStyles, display: 'flex', alignItems: 'center', gap: '8px'}}>
        {isEditable && editingPageNumber ? (
          <ImprovedInlineEditor
            initialValue={currentPageNumber}
            onSave={(v) => {
              setCurrentPageNumber(v);
              setEditingPageNumber(false);
              onUpdate && onUpdate({ pageNumber: v });
            }}
            onCancel={() => setEditingPageNumber(false)}
            style={{ position: 'relative', background: 'transparent', border: 'none', outline: 'none', padding: 0, margin: 0, color: '#5F616D', fontSize: '16px', fontWeight: 600 }}
          />
        ) : (
          <div onClick={() => isEditable && setEditingPageNumber(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>
            {currentPageNumber}
          </div>
        )}
        <div style={{
          width: '15px',
          height: '1px',
          backgroundColor: '#5F616D'
        }}></div>
      </div>

      </div>
    </>
  );
};

export default CourseRulesTimelineSlideTemplate;

