// custom_extensions/frontend/src/components/templates/BenefitsListSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { BenefitsListSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

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
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentSubtitle, setCurrentSubtitle] = useState(subtitle);
  const [currentDescription, setCurrentDescription] = useState(description);
  const [currentBenefits, setCurrentBenefits] = useState(benefits);
  const [currentCompanyName, setCurrentCompanyName] = useState(companyName);
  const [teamImagePath, setTeamImagePath] = useState('');

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '596px',
    backgroundColor: themeBg,
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
      onUpdate({ ...{ title, subtitle, description, benefits, profileImagePath, profileImageAlt, currentStep, totalSteps, companyName, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleSubtitleSave = (newSubtitle: string) => {
    setCurrentSubtitle(newSubtitle);
    setEditingSubtitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, description, benefits, profileImagePath, profileImageAlt, currentStep, totalSteps, companyName, backgroundColor, titleColor, contentColor, accentColor }, subtitle: newSubtitle });
    }
  };

  const handleDescriptionSave = (newDescription: string) => {
    setCurrentDescription(newDescription);
    setEditingDescription(false);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, description, benefits, profileImagePath, profileImageAlt, currentStep, totalSteps, companyName, backgroundColor, titleColor, contentColor, accentColor }, description: newDescription });
    }
  };

  const handleBenefitSave = (index: number, newBenefit: string) => {
    const newBenefits = [...currentBenefits];
    newBenefits[index] = newBenefit;
    setCurrentBenefits(newBenefits);
    setEditingBenefits(null);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, description, benefits, profileImagePath, profileImageAlt, currentStep, totalSteps, companyName, backgroundColor, titleColor, contentColor, accentColor }, benefits: newBenefits });
    }
  };

  const handleCompanyNameSave = (newCompanyName: string) => {
    setCurrentCompanyName(newCompanyName);
    setEditingCompanyName(false);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, description, benefits, profileImagePath, profileImageAlt, currentStep, totalSteps, companyName, backgroundColor, titleColor, contentColor, accentColor }, companyName: newCompanyName });
    }
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

  const handleBenefitCancel = () => {
    setCurrentBenefits(benefits);
    setEditingBenefits(null);
  };

  const handleCompanyNameCancel = () => {
    setCurrentCompanyName(companyName);
    setEditingCompanyName(false);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, description, benefits, profileImagePath, profileImageAlt, currentStep, totalSteps, companyName, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleTeamImageUploaded = (newImagePath: string) => {
    setTeamImagePath(newImagePath);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, description, benefits, profileImagePath, profileImageAlt, currentStep, totalSteps, companyName, backgroundColor, titleColor, contentColor, accentColor }, teamImagePath: newImagePath });
    }
  };

  return (
    <div className="benefits-list-slide-template" style={slideStyles}>
      {/* Main content with two columns */}
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: themeBg,
        display: 'flex',
        padding: '40px 60px'
      }}>
        {/* Left column */}
        <div style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingRight: '40px'
        }}>
          {/* Top content */}
          <div>
            {/* Subtitle */}
            <div style={{
              fontSize: '14px',
              color: themeContent,
              marginBottom: '10px',
              fontWeight: '300'
            }}>
              {isEditable && editingSubtitle ? (
                <InlineEditor
                  initialValue={currentSubtitle}
                  onSave={handleSubtitleSave}
                  onCancel={handleSubtitleCancel}
                  className="benefits-subtitle-editor"
                  style={{
                    fontSize: '14px',
                    color: themeContent,
                    fontWeight: '300'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingSubtitle(true)}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {currentSubtitle}
                </div>
              )}
            </div>

            {/* Main title */}
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: themeTitle,
              marginBottom: '20px',
              lineHeight: '1.1'
            }}>
              {isEditable && editingTitle ? (
                <InlineEditor
                  initialValue={currentTitle}
                  onSave={handleTitleSave}
                  onCancel={handleTitleCancel}
                  className="benefits-title-editor"
                  style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: themeTitle,
                    lineHeight: '1.1'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingTitle(true)}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {currentTitle}
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{
              fontSize: '18px',
              color: themeContent,
              lineHeight: '1.4',
              maxWidth: '400px'
            }}>
              {isEditable && editingDescription ? (
                <InlineEditor
                  initialValue={currentDescription}
                  onSave={handleDescriptionSave}
                  onCancel={handleDescriptionCancel}
                  multiline={true}
                  className="benefits-description-editor"
                  style={{
                    fontSize: '18px',
                    color: themeContent,
                    lineHeight: '1.4'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingDescription(true)}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {currentDescription}
                </div>
              )}
            </div>
          </div>

          {/* Profile image at bottom */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: themeAccent,
            alignSelf: 'flex-start'
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

        {/* Right column */}
        <div style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {/* Benefits list */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            marginBottom: '30px'
          }}>
            {currentBenefits.slice(0, 4).map((benefit, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '16px',
                  color: themeContent
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
                      fontSize: '16px',
                      color: themeContent,
                      flex: '1'
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingBenefits(index)}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none',
                      flex: '1'
                    }}
                  >
                    {benefit}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Team image at bottom */}
          <div style={{
            width: '100%',
            height: '200px',
            borderRadius: '10px',
            overflow: 'hidden',
            backgroundColor: themeAccent
          }}>
            <ClickableImagePlaceholder
              imagePath={teamImagePath || ''}
              onImageUploaded={handleTeamImageUploaded}
              size="LARGE"
              position="CENTER"
              description="Team meeting"
              isEditable={isEditable}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '10px',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '60px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '16px',
          height: '16px',
          backgroundColor: themeAccent,
          transform: 'rotate(45deg)'
        }} />
        <div style={{
          fontSize: '14px',
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
                fontSize: '14px',
                color: themeContent,
                fontWeight: '300'
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingCompanyName(true)}
              style={{
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              {currentCompanyName}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BenefitsListSlideTemplate; 