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

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  // Responsive scaling that preserves original proportions
  const originalHeight = 600;
  const minHeight = 400;
  
  // Calculate scale factor based on available space
  // Use a more flexible approach that allows growth on larger screens
  const getScaleFactor = () => {
    // Try to get the container height from the parent element
    if (typeof window !== 'undefined') {
      const container = document.querySelector('.bg-white.rounded-md.shadow-lg');
      if (container) {
        const containerHeight = container.clientHeight;
        const containerWidth = container.clientWidth;
        
        // Calculate scale based on available space
        const heightScale = containerHeight / originalHeight;
        const widthScale = containerWidth / (originalHeight * 16 / 9); // Assuming 16:9 aspect ratio
        
        // Use the smaller scale to maintain proportions
        const calculatedScale = Math.min(heightScale, widthScale);
        
        // Ensure minimum scale of 0.67 (400px) and allow growth up to 1.5x
        return Math.max(Math.min(calculatedScale, 1.5), 0.67);
      }
    }
    
    // Fallback: use viewport-based calculation
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    
    const heightScale = (viewportHeight * 0.8) / originalHeight; // 80% of viewport
    const widthScale = (viewportWidth * 0.8) / (originalHeight * 16 / 9);
    
    const calculatedScale = Math.min(heightScale, widthScale);
    return Math.max(Math.min(calculatedScale, 1.5), 0.67);
  };

  const scaleFactor = getScaleFactor();

  // Scale all dimensions proportionally
  const scale = (value: number) => Math.max(value * scaleFactor, value * 0.5);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    minHeight: `${minHeight}px`,
    height: `${Math.max(600 * scaleFactor, minHeight)}px`,
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
      onUpdate({ ...{ title, subtitle, description, benefits, profileImagePath, profileImageAlt, currentStep, totalSteps, companyName, backgroundColor, titleColor, contentColor, accentColor }, companyName: newCompanyName });
    }
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

  return (
    <div className="benefits-list-slide-template" style={slideStyles}>
      {/* Top section with green background */}
      <div style={{
        flex: `0 0 ${scale(396)}px`, // Preserve 66% proportion of original height
        backgroundColor: themeAccent,
        position: 'relative',
        padding: `${scale(40)}px ${scale(60)}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {/* Header and title section */}
        <div>
          {/* Subtitle */}
          <div style={{
            fontSize: `${scale(14)}px`,
            color: themeBg,
            marginBottom: `${scale(10)}px`,
            fontWeight: '300',
            minHeight: `${scale(20)}px`,
            maxHeight: `${scale(20)}px`,
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
                  fontSize: `${scale(25)}px`,
                  color: themeBg,
                  fontWeight: '300',
                  width: '100%',
                  height: '100%',
                  minHeight: `${scale(20)}px`,
                  maxHeight: `${scale(20)}px`
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
                  alignItems: 'center'
                }}
              >
                {currentSubtitle}
              </div>
            )}
          </div>

          {/* Main title */}
          <div style={{
            fontSize: `${scale(55)}px`,
            color: themeBg,
            marginBottom: `${scale(20)}px`,
            lineHeight: '1.1',
            minHeight: `${scale(65)}px`,
            maxHeight: `${scale(65)}px`,
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
                  fontSize: `${scale(55)}px`,
                  color: themeBg,
                  lineHeight: '1.1',
                  width: '100%',
                  height: '100%',
                  minHeight: `${scale(65)}px`,
                  maxHeight: `${scale(65)}px`
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
                  alignItems: 'center'
                }}
              >
                {currentTitle}
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{
            fontSize: `${scale(22)}px`,
            color: themeBg,
            lineHeight: '1.4',
            maxWidth: `${scale(530)}px`,
            minHeight: `${scale(30)}px`,
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
                  fontSize: `${scale(18)}px`,
                  color: themeBg,
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
                  fontSize: `${scale(22)}px`
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
          gap: `${scale(15)}px`,
          marginTop: `${scale(20)}px`
        }}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              style={{
                width: `${scale(45)}px`,
                height: `${scale(45)}px`,
                borderRadius: '50%',
                border: `${scale(2)}px solid ${themeBg}`,
                backgroundColor: i + 1 === currentStep ? themeBg : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: i + 1 === currentStep ? themeAccent : themeBg,
                fontSize: `${scale(25)}px`,
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
          top: `${scale(40)}px`,
          right: `${scale(60)}px`,
          width: `${scale(180)}px`,
          height: `${scale(180)}px`,
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
        backgroundColor: themeBg,
        padding: `${scale(13)}px ${scale(60)}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {/* Benefits list - preserve original 3-column grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr', // Preserve original 3-column layout
          gap: `${scale(20)}px`,
          maxWidth: `${scale(1000)}px`,
          marginTop: `${scale(20)}px`
        }}>
          {currentBenefits.map((benefit, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: `${scale(10)}px`,
                fontSize: `${scale(18)}px`,
                color: themeContent
              }}
            >
              <span style={{ fontSize: `${scale(18)}px` }}>→</span>
              {isEditable && editingBenefits === index ? (
                <InlineEditor
                  initialValue={benefit}
                  onSave={(value) => handleBenefitSave(index, value)}
                  onCancel={handleBenefitCancel}
                  className="benefit-editor"
                  style={{
                    fontSize: `${scale(16)}px`,
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

        {/* Horizontal line separator */}
        <hr style={{
          border: 'none',
          height: `${scale(1)}px`,
          backgroundColor: themeContent,
          opacity: 0.3,
          margin: `${scale(20)}px 0`,
          marginTop: `${scale(30)}px`
        }} />

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: `${scale(10)}px`,
          marginTop: 'auto',
          marginBottom: `${scale(20)}px`
        }}>
          <div style={{
            width: `${scale(16)}px`,
            height: `${scale(16)}px`,
            backgroundColor: themeAccent,
            transform: 'rotate(45deg)'
          }} />
          <div style={{
            fontSize: `${scale(12)}px`,
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
                  fontSize: `${scale(12)}px`,
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
    </div>
  );
};

export default BenefitsListSlideTemplate; 