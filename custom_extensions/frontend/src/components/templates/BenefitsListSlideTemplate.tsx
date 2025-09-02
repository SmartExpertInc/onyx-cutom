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
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentSubtitle, setCurrentSubtitle] = useState(subtitle);
  const [currentDescription, setCurrentDescription] = useState(description);
  const [currentBenefits, setCurrentBenefits] = useState(benefits);
  const [currentCompanyName, setCurrentCompanyName] = useState(companyName);

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
      {/* Top section with green background */}
      <div style={{
        flex: '0 0 427px', // Фиксированная высота для верхней секции
        backgroundColor: '#68AB7F',
        position: 'relative',
        padding: '40px 60px',
        paddingTop: '56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {/* Header and title section */}
        <div>
          {/* Subtitle */}
          <div style={{
            fontSize: '12px',
            color: '#3a6549',
            marginBottom: '25px',
            fontWeight: '300',
            minHeight: '20px',
            maxHeight: '20px',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden'
          }}>
            {isEditable && editingSubtitle ? (
              <InlineEditor
                initialValue={currentSubtitle}
                onSave={handleSubtitleSave}
                onCancel={handleSubtitleCancel}
                className="benefits-subtitle-editor"
                style={{
                  fontSize: '12px',
                  color: '#3a6549',
                  fontWeight: '300',
                  width: '100%',
                  height: '100%',
                  minHeight: '20px',
                  maxHeight: '20px'
                }}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingSubtitle(true)}
                style={{
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#3a6549',
                  fontWeight: '300',
                  minHeight: '20px',
                  maxHeight: '20px',
                  overflow: 'hidden'
                }}
              >
                {currentSubtitle}
              </div>
            )}
          </div>

          {/* Main title */}
          <div style={{
            fontSize: '65px',
            color: '#2A3E30',
            marginBottom: '20px',
            lineHeight: '1.1',
            minHeight: '65px',
            maxHeight: '65px',
            display: 'flex',
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
                  fontSize: '65px',
                  color: '#2A3E30',
                  lineHeight: '1.1',
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
                  fontSize: '65px',
                  color: '#2A3E30',
                  lineHeight: '1.1',
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
            color: '#2F553A',
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
                  color: '#2F553A',
                  lineHeight: '1.4',
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
                  color: '#2F553A',
                  lineHeight: '1.4',
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

        {/* Navigation circles */}
        <div style={{
          display: 'flex',
          gap: '15px',
          marginTop: '20px'
        }}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                border: `2px solid ${i + 1 === currentStep ? '#fff' : themeBg}`,
                backgroundColor: i + 1 === currentStep ? "#fff" : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#264A32',
                fontSize: '25px',
                fontWeight: ''
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
        backgroundColor: '#ffffff',
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
              <span style={{ fontSize: '18px' }}>→</span>
              {isEditable && editingBenefits === index ? (
                <InlineEditor
                  initialValue={benefit}
                  onSave={(value) => handleBenefitSave(index, value)}
                  onCancel={handleBenefitCancel}
                  className="benefit-editor"
                  style={{
                    fontSize: '20px',
                    color: '#5E5E5E',
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
                    color: '#5E5E5E'
                  }}
                >
                  {benefit}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Horizontal line separator */}
        <hr style={{
          border: 'none',
          height: '1px',
          backgroundColor: '#252525',
          opacity: 0.3,
          margin: '20px 0',
          marginTop: '55px'
        }} />

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginTop: '-5px',
          marginBottom: '20px'
        }}>
{benefitsListIcon ? (
            // Show uploaded logo image
            <ClickableImagePlaceholder
              imagePath={benefitsListIcon}
              onImageUploaded={handleBenefitsListIconUploaded}
              size="SMALL"
              position="CENTER"
              description="Benefits List Icon"
              isEditable={isEditable}
              style={{
                height: '24px',
                width: '24px',
                objectFit: 'contain'
              }}
            />
          ) : (
            // Show default logo image
            <div 
              onClick={() => isEditable && setShowUploadModal(true)}
              style={{
                width: '24px',
                height: '24px',
                cursor: isEditable ? 'pointer' : 'default',
                position: 'relative'
              }}
            >
              <img
                src="/custom-projects-ui/benefitsListIcon.png"
                alt="Benefits List Icon"
                style={{
                  width: '24px',
                  height: '24px',
                  objectFit: 'contain'
                }}
              />
            </div>
          )}
          <div style={{
            fontSize: '12px',
            color: themeContent,
            fontWeight: '300'
          }}>
            {isEditable && editingCompanyName ? (
              <InlineEditor
                initialValue={currentCompanyName}
                onSave={handleCompanyNameSave}
                onCancel={handleCompanyNameCancel}
                className="company-name-editor"
                style={{
                  fontSize: '12px',
                  color: '#8c8c8c',
                  fontWeight: '300'
                }}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingCompanyName(true)}
                style={{
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none',
                  fontSize: '12px',
                  color: '#8c8c8c',
                  fontWeight: '300'
                }}
              >
                {currentCompanyName}
              </div>
            )}
          </div>
        </div>
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
    </div>
  );
};

export default BenefitsListSlideTemplate; 