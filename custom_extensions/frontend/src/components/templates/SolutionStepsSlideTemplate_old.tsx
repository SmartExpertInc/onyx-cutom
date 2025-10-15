// custom_extensions/frontend/src/components/templates/SolutionStepsSlideTemplate.tsx

import React, { useState } from 'react';
import { SolutionStepsSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import PresentationImageUpload from '../PresentationImageUpload';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export const SolutionStepsSlideTemplate_old: React.FC<SolutionStepsSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId: _slideId,
  subtitle = 'The Solution',
  title = 'Step-by-step Guide',
  steps = [
    { title: 'Step 1', description: 'Know the Regulations' },
    { title: 'Step 2', description: 'Conduct Risk Assessments' },
    { title: 'Step 3', description: 'Provide Training and Education' }
  ],
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  pageNumber = '23',
  logoNew = '',
  backgroundColor,
  titleColor,
  contentColor,
  accentColor,
  isEditable = false,
  onUpdate,
  theme,
  voiceoverText: _voiceoverText
}) => {
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSteps, setEditingSteps] = useState<{ index: number; field: 'title' | 'description' } | null>(null);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);
  
  const [currentSubtitle, setCurrentSubtitle] = useState(subtitle);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentSteps, setCurrentSteps] = useState(steps);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: _themeBg, titleColor: _themeTitle, contentColor: _themeContent, accentColor: _themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#E0E7FF',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    padding: '40px 60px',
  };

  // save subtitle
  const handleSubtitleSave = (newSubtitle: string) => {
    setCurrentSubtitle(newSubtitle);
    setEditingSubtitle(false);
  if (onUpdate) {
      onUpdate({ ...{ subtitle, title, steps, profileImagePath, profileImageAlt, pageNumber, backgroundColor, titleColor, contentColor, accentColor }, subtitle: newSubtitle });
    }
  };

  // save main title
  const handleTitleSave = (newMainTitle: string) => {
    setCurrentTitle(newMainTitle);
    setEditingTitle(false);
  if (onUpdate) {
      onUpdate({ ...{ subtitle, title, steps, profileImagePath, profileImageAlt, pageNumber, backgroundColor, titleColor, contentColor, accentColor }, title: newMainTitle });
    }
  };

  const handleStepSave = (index: number, field: 'title' | 'description', newValue: string) => {
    const newSteps = [...currentSteps];
    newSteps[index] = { ...newSteps[index], [field]: newValue };
    setCurrentSteps(newSteps);
    setEditingSteps(null);
  if (onUpdate) {
      onUpdate({ ...{ subtitle, title, steps, profileImagePath, profileImageAlt, pageNumber, backgroundColor, titleColor, contentColor, accentColor }, steps: newSteps });
    }
  };

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    if (onUpdate) {
      onUpdate({ ...{ subtitle, title, steps, profileImagePath, profileImageAlt, pageNumber, backgroundColor, titleColor, contentColor, accentColor }, pageNumber: newPageNumber });
    }
  };

  const handlePageNumberCancel = () => {
    setCurrentPageNumber(pageNumber);
    setEditingPageNumber(false);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ subtitle, title, steps, profileImagePath, profileImageAlt, pageNumber, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleLogoNewUploaded = (newLogoPath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ subtitle, title, steps, profileImagePath, profileImageAlt, pageNumber, backgroundColor, titleColor, contentColor, accentColor }, logoNew: newLogoPath });
    }
  };

  const positions: string[] = ['17%', '43%', '71%'];
  const textPositions: string[] = ['26%', '52%', '80%'];

  return (
    <div className="solution-steps-slide-template inter-theme" style={slideStyles}>
      <style>{`
        .solution-steps-slide-template *:not(.title-element) {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .solution-steps-slide-template .title-element {
          font-family: "Lora", serif !important;
          font-weight: 600 !important;
        }
        .solution-steps-slide-template .step-title {
          font-weight: 600 !important;
        }
      `}</style>
      {/* Subtitle chip (previous title) */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '60px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '9px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Circle indicator */}
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#0F58F9'
          }} />

          {/* Subtitle text (editable) */}
          {isEditable && editingSubtitle ? (
            <ImprovedInlineEditor
              initialValue={currentSubtitle}
              onSave={handleSubtitleSave}
              onCancel={() => setEditingSubtitle(false)}
              className="solution-subtitle-editor"
              style={{
                fontSize: '20px',
                color: '#09090BCC',
                fontWeight: '400',
                background: 'transparent',
                border: 'none',
                outline: 'none',
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingSubtitle(true)}
              style={{
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none',
                fontSize: '20px',
                color: '#09090BCC',
                fontWeight: '400'
              }}
            >
              {currentSubtitle}
            </div>
          )}
        </div>
      </div>

      {/* Main title (from buttonText), 56px, no container/bg */}
      <div style={{
        position: 'absolute',
        top: '120px',
        left: '60px',
        right: '60px',
        fontSize: '56px',
        color: '#09090B',
        lineHeight: '1.1',
        minHeight: '75px',
        maxHeight: '75px',
        display: 'flex',
        alignItems: 'center',
        // overflow: 'hidden',
        fontFamily: "'Lora', serif"
      }}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={currentTitle}
            onSave={handleTitleSave}
            onCancel={() => setEditingTitle(false)}
            className="solution-main-title-editor title-element"
            style={{
              fontSize: '56px',
              color: '#09090B',
              lineHeight: '1.1',
              width: '100%',
              height: '100%',
              minHeight: '75px',
              maxHeight: '75px',
              fontFamily: "'Lora', serif"
            }}
          />
        ) : (
          <div
            className="title-element"
            onClick={() => isEditable && setEditingTitle(true)}
            style={{
              cursor: isEditable ? 'pointer' : 'default',
              userSelect: 'none',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              fontSize: '56px',
              color: '#09090B',
              lineHeight: '1.1',
              // overflow: 'hidden',
              fontFamily: "'Lora', serif"
            }}
          >
            {currentTitle}
          </div>
        )}
      </div>

      {/* Profile Image */}
      <div style={{
        position: 'absolute',
        top: '40px',
        right: '60px',
        width: '170px',
        height: '170px',
        borderRadius: '50%',
        backgroundColor: '#0F58F9',
        overflow: 'hidden',
      }}>
        <ClickableImagePlaceholder
          imagePath={profileImagePath}
          onImageUploaded={handleProfileImageUploaded}
          size="LARGE"
          position="CENTER"
          description="Profile photo"
          isEditable={isEditable}
          style={{
            width: '110%',
            height: '110%',
            borderRadius: '50%',
            position: 'relative',
            bottom: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Timeline and Steps */}
      <div style={{
        position: 'absolute',
        top: '405px',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Timeline Line */}
        <div style={{
          width: '100%',
          height: '3px',
          backgroundColor: '#0F58F9',
          position: 'relative',
          marginBottom: '40px',
        }}>
          {/* Step Circles */}
          {currentSteps.map((step, index) => (
            <div key={index} style={{
              position: 'absolute',
              top: '50%',
              left: positions[index],
              transform: 'translate(-50%, -50%)',
              width: '27px',
              height: '27px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '5px solid #0F58F9',
              zIndex: 1,
            }} />
          ))}
        </div>

        {/* Step Titles and Descriptions */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '150px',
        }}>
          {currentSteps.map((step, index) => (
            <div key={index} style={{
              position: 'absolute',
              left: textPositions[index],
              top: '0',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              width: '220px',
            }}>
              {/* Step Title */}
              <div className="step-title" style={{
                fontSize: '28px',
                fontWeight: 600,
                color: '#09090B',
                marginBottom: '15px',
              }}>
                {isEditable && editingSteps?.index === index && editingSteps?.field === 'title' ? (
                  <ImprovedInlineEditor
                    initialValue={step.title}
                    onSave={(value) => handleStepSave(index, 'title', value)}
                    onCancel={() => setEditingSteps(null)}
                    className="step-title-editor step-title"
                    style={{
                      fontSize: '28px',
                      fontWeight: 600,
                      color: '#09090B',
                      width: '100%',
                      height: 'auto',
                    }}
                  />
                ) : (
                  <div
                    className="step-title"
                    onClick={() => isEditable && setEditingSteps({ index, field: 'title' })}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                  >
                    {step.title}
                  </div>
                )}
              </div>

              {/* Step Description */}
              <div style={{
                fontSize: '20px',
                color: 'rgba(9, 9, 11, 0.7)',
                lineHeight: '1.3',
                maxWidth: '160px',
              }}>
                {isEditable && editingSteps?.index === index && editingSteps?.field === 'description' ? (
                  <ImprovedInlineEditor
                    initialValue={step.description}
                    onSave={(value) => handleStepSave(index, 'description', value)}
                    onCancel={() => setEditingSteps(null)}
                    multiline={true}
                    className="step-description-editor"
                    style={{
                      fontSize: '20px',
                      color: 'rgba(9, 9, 11, 0.7)',
                      width: '100%',
                      height: 'auto',
                      lineHeight: '1.3',
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingSteps({ index, field: 'description' })}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                  >
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logo in bottom-right corner */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        right: '30px'
      }}>
        {logoNew ? (
          <ClickableImagePlaceholder
            imagePath={logoNew}
            onImageUploaded={handleLogoNewUploaded}
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
          <div 
            onClick={() => isEditable && setShowLogoUploadModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: isEditable ? 'pointer' : 'default'
            }}
          >
            <div style={{
              width: '30px',
              height: '30px',
              border: '2px solid #09090B',
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '12px', height: '2px', backgroundColor: '#09090B', position: 'absolute' }} />
              <div style={{ width: '2px', height: '12px', backgroundColor: '#09090B', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 400, color: '#09090B', fontFamily: currentTheme.fonts.contentFont }}>Your Logo</span>
          </div>
        )}
      </div>

      {/* Page number with line */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '0px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Small line */}
        <div style={{
          width: '20px',
          height: '1px',
          backgroundColor: 'rgba(9, 9, 11, 0.6)'
        }} />
        {/* Page number */}
        {isEditable && editingPageNumber ? (
          <ImprovedInlineEditor
            initialValue={currentPageNumber}
            onSave={handlePageNumberSave}
            onCancel={handlePageNumberCancel}
            className="page-number-editor"
            style={{
              color: '#09090B99',
              fontSize: '18px',
              fontWeight: '300',
              fontFamily: currentTheme.fonts.contentFont,
              width: '30px',
              height: 'auto'
            }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingPageNumber(true)}
            style={{
              color: '#09090B99',
              fontSize: '18px',
              fontWeight: '300',
              fontFamily: currentTheme.fonts.contentFont,
              cursor: isEditable ? 'pointer' : 'default',
              userSelect: 'none'
            }}
          >
            {currentPageNumber}
          </div>
        )}
      </div>

      {/* Logo Upload Modal */}
      {showLogoUploadModal && (
        <PresentationImageUpload
          isOpen={showLogoUploadModal}
          onClose={() => setShowLogoUploadModal(false)}
          onImageUploaded={(newLogoPath: string) => {
            handleLogoNewUploaded(newLogoPath);
            setShowLogoUploadModal(false);
          }}
          title="Upload Company Logo"
        />
      )}
    </div>
  );
};

export default SolutionStepsSlideTemplate_old;