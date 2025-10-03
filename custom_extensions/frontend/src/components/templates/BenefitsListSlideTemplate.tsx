// custom_extensions/frontend/src/components/templates/BenefitsListSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { BenefitsListSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import PresentationImageUpload from '../PresentationImageUpload';

interface InlineEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

function InlineEditor({ 
  initialValue, 
  onSave, 
  onCancel, 
  multiline = false, 
  placeholder = "",
  className = "",
  style = {}
}: InlineEditorProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      onSave(value);
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      onSave(value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    onSave(value);
  };

  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [value, multiline]);

  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [multiline]);

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        className={`inline-editor-textarea ${className}`}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={{
          ...style,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          resize: 'none',
          overflow: 'hidden',
          width: '100%',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          minHeight: '1.6em',
          boxSizing: 'border-box',
          display: 'block',
        }}
        rows={1}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      className={`inline-editor-input ${className}`}
      type="text"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      style={{
        ...style,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
        width: '100%',
        boxSizing: 'border-box',
        display: 'block',
      }}
    />
  );
}

export const BenefitsListSlideTemplate: React.FC<BenefitsListSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Benefits',
  subtitle = 'Employment',
  description = 'Here is a list of benefits that you can offer to your employees to maintain small business compliance:',
  benefits = [
    "Workers' compensation",
    "Unemployment insurance",
    "Disability insurance",
    "Health insurance",
    "COBRA benefits",
    "Leave of absence"
  ],
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  currentStep = 3,
  totalSteps = 4,
  companyName = 'Company name',
  benefitsListIcon = '',
  pageNumber = '15',
  logoNew = '',
  backgroundColor,
  titleColor,
  contentColor,
  accentColor,
  isEditable = false,
  onUpdate,
  theme,
  voiceoverText
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingBenefits, setEditingBenefits] = useState<number | null>(null);
  const [editingCompanyName, setEditingCompanyName] = useState(false);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentSubtitle, setCurrentSubtitle] = useState(subtitle);
  const [currentDescription, setCurrentDescription] = useState(description);
  const [currentBenefits, setCurrentBenefits] = useState(benefits);
  const [currentCompanyName, setCurrentCompanyName] = useState(companyName);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, description, benefits, profileImagePath, profileImageAlt, currentStep, totalSteps, companyName, benefitsListIcon, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleSubtitleSave = (newSubtitle: string) => {
    setCurrentSubtitle(newSubtitle);
    setEditingSubtitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, description, benefits, profileImagePath, profileImageAlt, currentStep, totalSteps, companyName, benefitsListIcon, backgroundColor, titleColor, contentColor, accentColor }, subtitle: newSubtitle });
    }
  };

  const handleDescriptionSave = (newDescription: string) => {
    setCurrentDescription(newDescription);
    setEditingDescription(false);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, description, benefits, profileImagePath, profileImageAlt, currentStep, totalSteps, companyName, benefitsListIcon, backgroundColor, titleColor, contentColor, accentColor }, description: newDescription });
    }
  };

  const handleBenefitSave = (index: number, newBenefit: string) => {
    const newBenefits = [...currentBenefits];
    newBenefits[index] = newBenefit;
    setCurrentBenefits(newBenefits);
    setEditingBenefits(null);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, description, benefits, profileImagePath, profileImageAlt, currentStep, totalSteps, companyName, benefitsListIcon, backgroundColor, titleColor, contentColor, accentColor }, benefits: newBenefits });
    }
  };

  const handleBenefitCancel = () => {
    setCurrentBenefits(benefits);
    setEditingBenefits(null);
  };

  const handleTitleCancel = () => {
    setCurrentTitle(title);
    setEditingTitle(false);
  };

  const handleSubtitleCancel = () => {
    setCurrentSubtitle(subtitle);
    setEditingSubtitle(false);
  };

  const handleDescriptionCancel = () => {
    setCurrentDescription(description);
    setEditingDescription(false);
  };

  const handleCompanyNameSave = (newCompanyName: string) => {
    setCurrentCompanyName(newCompanyName);
    setEditingCompanyName(false);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, description, benefits, profileImagePath, profileImageAlt, currentStep, totalSteps, companyName, benefitsListIcon, backgroundColor, titleColor, contentColor, accentColor }, companyName: newCompanyName });
    }
  };

  const handleCompanyNameCancel = () => {
    setCurrentCompanyName(companyName);
    setEditingCompanyName(false);
  };

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, description, benefits, profileImagePath, profileImageAlt, currentStep, totalSteps, companyName, benefitsListIcon, backgroundColor, titleColor, contentColor, accentColor }, pageNumber: newPageNumber });
    }
  };

  const handlePageNumberCancel = () => {
    setCurrentPageNumber(pageNumber);
    setEditingPageNumber(false);
  };

  const handleLogoNewUploaded = (newLogoPath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, description, benefits, profileImagePath, profileImageAlt, currentStep, totalSteps, companyName, benefitsListIcon, backgroundColor, titleColor, contentColor, accentColor }, logoNew: newLogoPath });
    }
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, description, benefits, profileImagePath, profileImageAlt, currentStep, totalSteps, companyName, benefitsListIcon, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleBenefitsListIconUploaded = (newIconPath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, description, benefits, profileImagePath, profileImageAlt, currentStep, totalSteps, companyName, benefitsListIcon, backgroundColor, titleColor, contentColor, accentColor }, benefitsListIcon: newIconPath });
    }
  };

  return (
    <div className="benefits-list-slide-template inter-theme" style={slideStyles}>
      {/* Top section with blue gradient background */}
      <div style={{
        flex: '0 0 427px', // Фиксированная высота для верхней секции
        background: 'linear-gradient(90deg, #0F58F9 0%, #1023A1 100%)', 
        position: 'relative',
        padding: '40px 60px',
        paddingTop: '48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {/* Header and title section */}
        <div>
          {/* Subtitle */}
          <div style={{
            marginBottom: '25px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '8px 18px',
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
              
              {/* Subtitle text */}
              {isEditable && editingSubtitle ? (
                <InlineEditor
                  initialValue={currentSubtitle}
                  onSave={handleSubtitleSave}
                  onCancel={handleSubtitleCancel}
                  className="benefits-subtitle-editor"
                  style={{
                    fontSize: '20px',
                    color: '#09090BCC',
                    fontWeight: '400',
                    fontFamily: currentTheme.fonts.contentFont,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingSubtitle(true)}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none',
                    fontSize: '12px',
                    color: '#09090BCC',
                    fontWeight: '300',
                    fontFamily: currentTheme.fonts.contentFont
                  }}
                >
                  {currentSubtitle}
                </div>
              )}
            </div>
          </div>

          {/* Main title */}
          <div style={{
            fontSize: '48px',
            color: '#FFFFFF',
            marginBottom: '10px',
            lineHeight: '1.1',
            minHeight: '65px',
            maxHeight: '65px',
            display: 'flex',
            fontFamily: "'Lora', serif",
            alignItems: 'center',
            overflow: 'hidden'
          }}>
            {isEditable && editingTitle ? (
              <InlineEditor
                initialValue={currentTitle}
                onSave={handleTitleSave}
                onCancel={handleTitleCancel}
                className="benefits-title-editor"
                style={{
                  fontSize: '48px',
                  color: '#FFFFFF',
                  lineHeight: '1.1',
                  fontFamily: "'Lora', serif",
                  width: '100%',
                  height: '100%',
                  minHeight: '65px',
                  maxHeight: '65px'
                }}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingTitle(true)}
                style={{
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '48px',
                  color: '#FFFFFF',
                  lineHeight: '1.1',
                  fontFamily: "'Lora', serif",
                  minHeight: '65px',
                  maxHeight: '65px',
                  overflow: 'hidden'
                }}
              >
                {currentTitle}
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{
            fontSize: '26px',
            color: '#FFFFFF',
            lineHeight: '1.4',
            maxWidth: '643px',
            minHeight: '30px',
            display: 'flex',
            alignItems: 'flex-start'
          }}>
            {isEditable && editingDescription ? (
              <InlineEditor
                initialValue={currentDescription}
                onSave={handleDescriptionSave}
                onCancel={handleDescriptionCancel}
                multiline={true}
                className="benefits-description-editor"
                style={{
                  fontSize: '26px',
                  color: '#FFFFFF',
                  lineHeight: '1.4',
                  fontFamily: currentTheme.fonts.contentFont,
                  fontWeight: '300',
                  width: '100%'
                }}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingDescription(true)}
                style={{
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none',
                  fontSize: '28px',
                  color: '#FFFFFF',
                  lineHeight: '1.4',
                  fontFamily: currentTheme.fonts.contentFont,
                  fontWeight: '300',
                  maxWidth: '643px',
                  minHeight: '30px',
                  width: '100%'
                }}
              >
                {currentDescription}
              </div>
            )}
          </div>
        </div>

        {/* Navigation squares */}
        <div style={{
          display: 'flex',
          gap: '55px',
          marginTop: '20px'
        }}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              style={{
                width: '55px',
                height: '55px',
                borderRadius: '2px',
                border: `2px solid #ffffff`,
                backgroundColor: i + 1 === currentStep ? "#ffffff" : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: i + 1 === currentStep ? '#0F58F9' : '#ffffff',
                fontSize: '32px',
                fontWeight: '',
                fontFamily: currentTheme.fonts.contentFont
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Profile image */}
        <div style={{
          position: 'absolute',
          top: '60px',
          right: '60px',
          width: '190px',
          height: '190px',
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
        }}>
          <ClickableImagePlaceholder
            imagePath={profileImagePath}
            onImageUploaded={handleProfileImageUploaded}
            size="LARGE"
            position="CENTER"
            description="Profile photo"
            isEditable={isEditable}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        </div>
      </div>

      {/* Bottom section with white background */}
      <div style={{
        flex: '1',
        backgroundColor: '#E0E7FF',
        padding: '13px 60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {/* Benefits list */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '20px',
          maxWidth: '1000px',
          marginTop: '20px'
        }}>
          {currentBenefits.map((benefit: string, index: number) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '20px',
                color: '#5E5E5E'
              }}
            >
              <svg width="7" height="8" viewBox="0 0 7 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2.73354C6.66667 3.11844 6.66667 4.08069 6 4.46559L1.5 7.06367C0.833334 7.44857 -3.3649e-08 6.96745 0 6.19765L2.2713e-07 1.00149C2.60779e-07 0.231693 0.833333 -0.249434 1.5 0.135466L6 2.73354Z" fill="#0F58F9"/>
              </svg>
              {isEditable && editingBenefits === index ? (
                <InlineEditor
                  initialValue={benefit}
                  onSave={(value) => handleBenefitSave(index, value)}
                  onCancel={handleBenefitCancel}
                  className="benefit-editor"
                  style={{
                    fontSize: '20px',
                    color: '#5E5E5E',
                    fontFamily: currentTheme.fonts.contentFont,
                    flex: '1'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingBenefits(index)}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none',
                    flex: '1',
                    fontSize: '20px',
                    color: '#5E5E5E',
                    fontFamily: currentTheme.fonts.contentFont
                  }}
                >
                  {benefit}
                </div>
              )}
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
            <span style={{ fontSize: '14px', fontWeight: 300, color: '#09090B', fontFamily: currentTheme.fonts.contentFont }}>Your Logo</span>
          </div>
        )}
      </div>

      {/* Page number with line */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
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
          <InlineEditor
            initialValue={currentPageNumber}
            onSave={handlePageNumberSave}
            onCancel={handlePageNumberCancel}
            className="page-number-editor"
            style={{
              color: '#09090B99',
              fontSize: '17px',
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
              fontSize: '17px',
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
      {showUploadModal && (
        <PresentationImageUpload
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onImageUploaded={(newIconPath: string) => {
            handleBenefitsListIconUploaded(newIconPath);
            setShowUploadModal(false);
          }}
          title="Upload Benefits List Icon"
        />
      )}

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

export default BenefitsListSlideTemplate; 