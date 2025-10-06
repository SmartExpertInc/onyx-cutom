// custom_extensions/frontend/src/components/templates/CourseRulesTimelineSlideTemplate.tsx

import React, { useState, useEffect } from 'react';
import { CourseRulesTimelineSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import PresentationImageUpload from '../PresentationImageUpload';

export const CourseRulesTimelineSlideTemplate: React.FC<CourseRulesTimelineSlideProps & { theme?: SlideTheme | string; isEditable?: boolean; onUpdate?: (props: any) => void; }> = (props: CourseRulesTimelineSlideProps & { theme?: SlideTheme | string; isEditable?: boolean; onUpdate?: (props: any) => void; }) => {
  const {
    slideId,
    steps: stepsProp,
    profileImagePath = '',
    profileImageAlt = 'Profile image',
    companyLogoPath = '',
    companyLogoAlt = 'Company logo',
    backgroundColor,
    textColor,
    isEditable = false,
    onUpdate,
    theme,
  } = props as CourseRulesTimelineSlideProps & { theme?: SlideTheme | string; isEditable?: boolean; onUpdate?: (props: any) => void; companyLogoPath?: string; companyLogoAlt?: string; };
  const steps = stepsProp ?? [
    { number: '01', text: 'Rules of the course' },
    { number: '02', text: 'Prerequisite courses' },
  ];
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));

  const [editingStep, setEditingStep] = useState<{ index: number; field: 'number' | 'text' } | null>(null);
  const [currentSteps, setCurrentSteps] = useState(steps);
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);
  const [currentCompanyLogoPath, setCurrentCompanyLogoPath] = useState(companyLogoPath);

  // Sync logo state with prop changes
  useEffect(() => {
    setCurrentCompanyLogoPath(companyLogoPath);
  }, [companyLogoPath]);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#E0E7FF',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const actorStyles: React.CSSProperties = {
    position: 'absolute',
    left: '140px',
    bottom: '0px',
    height: '600px',
    width: '400px',
    background: 'linear-gradient(to bottom, #0F58F9, #1023A1)',
    borderRadius: '20px',
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
    fontSize: '46px',
    fontWeight: 700,
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
    fontWeight: 400
  };

  const handleCompanyLogoUploaded = (newLogoPath: string) => {
    setCurrentCompanyLogoPath(newLogoPath);
    if (onUpdate) {
      onUpdate({ companyLogoPath: newLogoPath });
    }
  };

  return (
    <>
      <style>{`
        .course-rules-timeline-slide .step-text {
          font-family: "Lora", serif !important;
          font-weight: 700 !important;
          color: black !important;
        }
      `}</style>
      <div className="course-rules-timeline-slide inter-theme" style={slideStyles}>
      {/* Logo Placeholder */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '25px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 10
      }}>
        {currentCompanyLogoPath ? (
          // Show uploaded logo image
          <ClickableImagePlaceholder
            imagePath={currentCompanyLogoPath}
            onImageUploaded={handleCompanyLogoUploaded}
            size="SMALL"
            position="CENTER"
            description="Company logo"
            isEditable={isEditable}
            style={{
              height: '30px',
              maxWidth: '120px',
              objectFit: 'contain'
            }}
          />
        ) : (
          // Show default logo design with clickable area
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: isEditable ? 'pointer' : 'default'
          }}
          onClick={() => isEditable && setShowLogoUploadModal(true)}
          >
            <div style={{
              width: '20px',
              height: '20px',
              border: '1px solid #333333',
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '8px',
                height: '2px',
                backgroundColor: '#333333',
                position: 'absolute'
              }} />
              <div style={{
                width: '2px',
                height: '8px',
                backgroundColor: '#333333',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: '400', color: '#333333', fontFamily: 'Inter, sans-serif' }}>Your Logo</div>
          </div>
        )}
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
              className="timeline-step-text-editor step-text"
              style={{ ...stepTextStyles }}
            />
          ) : (
            <div className="step-text" style={stepTextStyles} onClick={() => isEditable && setEditingStep({ index: i, field: 'text' })}>{s.text}</div>
          )}
        </div>
      ))}

      {/* Bottom-left page number */}
      <div style={pageNumberStyles}>34</div>

      {/* Logo Upload Modal */}
      {showLogoUploadModal && (
        <PresentationImageUpload
          isOpen={showLogoUploadModal}
          onClose={() => setShowLogoUploadModal(false)}
          onImageUploaded={(newLogoPath: string) => {
            handleCompanyLogoUploaded(newLogoPath);
            setShowLogoUploadModal(false);
          }}
          title="Upload Company Logo"
        />
      )}
      </div>
    </>
  );
};

export default CourseRulesTimelineSlideTemplate;

