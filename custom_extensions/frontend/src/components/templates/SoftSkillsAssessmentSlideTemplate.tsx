// custom_extensions/frontend/src/components/templates/SoftSkillsAssessmentSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { SoftSkillsAssessmentSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';

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

export const SoftSkillsAssessmentSlideTemplate: React.FC<SoftSkillsAssessmentSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'How do you assess soft skills in candidates?',
  tips = [
    { text: "Know what you're looking for in potential hires beforehand.", isHighlighted: false },
    { text: "Ask behavioral questions to learn how they've used soft skills in previous jobs", isHighlighted: false }
  ],
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  backgroundColor,
  titleColor,
  contentColor,
  accentColor,
  logoPath = '',
  logoText = 'Your Logo',
  isEditable = false,
  onUpdate,
  theme,
  voiceoverText
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingTips, setEditingTips] = useState<number | null>(null);
  const [editingAdditionalTips, setEditingAdditionalTips] = useState<number | null>(null);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentTips, setCurrentTips] = useState(tips);
  const [currentAdditionalTips, setCurrentAdditionalTips] = useState([
    "Additional tip 1",
    "Additional tip 2"
  ]);
  const [currentPageNumber, setCurrentPageNumber] = useState('27');

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    padding: '40px 60px 40px 60px',
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, tips, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleTipSave = (index: number, newTip: string) => {
    const newTips = [...currentTips];
    newTips[index] = { ...newTips[index], text: newTip };
    setCurrentTips(newTips);
    setEditingTips(null);
    if (onUpdate) {
      onUpdate({ ...{ title, tips, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, tips: newTips });
    }
  };

  const handleTitleCancel = () => {
    setCurrentTitle(title);
    setEditingTitle(false);
  };

  const handleTipCancel = () => {
    setCurrentTips(tips);
    setEditingTips(null);
  };

  const handleAdditionalTipSave = (index: number, newTip: string) => {
    const newAdditionalTips = [...currentAdditionalTips];
    newAdditionalTips[index] = newTip;
    setCurrentAdditionalTips(newAdditionalTips);
    setEditingAdditionalTips(null);
    if (onUpdate) {
      onUpdate({ ...{ title, tips, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, additionalTips: newAdditionalTips });
    }
  };

  const handleAdditionalTipCancel = () => {
    setCurrentAdditionalTips([
      "Additional tip 1",
      "Additional tip 2"
    ]);
    setEditingAdditionalTips(null);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, tips, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  return (
    <>
      <style>{`
        .soft-skills-assessment-slide-template *:not(.title-element):not(.card-text) {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .soft-skills-assessment-slide-template .title-element {
          font-family: "Lora", serif !important;
          font-weight: 600 !important;
        }
        .soft-skills-assessment-slide-template .card-text {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-weight: 600 !important;
        }
        .soft-skills-assessment-slide-template .logo-text {
        font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-weight: 500 !important;
        }
      `}</style>
      <div className="soft-skills-assessment-slide-template inter-theme" style={slideStyles}>
      {/* Top section with title and profile image */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '60px'
      }}>
        {/* Title */}
        <div style={{
          fontSize: '61px',
          color: '#000000',
          lineHeight: '1.2',
          maxWidth: '70%',
          fontWeight: 900,
          fontFamily: 'serif'
        }}>
          {isEditable && editingTitle ? (
            <InlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={true}
              className="title-element"
              style={{
                fontSize: '61px',
                color: '#000000',
                lineHeight: '1.2',
                fontWeight: 900,
                fontFamily: 'serif'
              }}
            />
          ) : (
            <div
              className="title-element"
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

        {/* Profile image */}
        <div style={{
          width: '170px',
          height: '170px',
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: '#0F58F9'
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

      {/* Tips section */}
      <div style={{
        display: 'flex',
        gap: '30px',
        marginTop: '-35px'
      }}>
        {currentTips.map((tip, index) => (
          <div
            key={index}
            style={{
              flex: '1',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            {/* Main tip block */}
            <div style={{
              padding: '20px 90px 30px 32px',
              backgroundColor: index === 0 ? '#E0E7FF' : index === 1 ? '#0F58F9' : 'transparent',
              minHeight: '360px',
              display: 'flex',
              zIndex: '2',
              borderRadius: '4px',
            }}>
              <div style={{
                fontSize: '36px',
                fontWeight: '700',
                color: index === 0 ? '#000000' : '#FFFFFF',
                lineHeight: '1.4',
                fontFamily: 'Inter, sans-serif'
              }}>
                {isEditable && editingTips === index ? (
                  <InlineEditor
                    initialValue={tip.text}
                    onSave={(value) => handleTipSave(index, value)}
                    onCancel={handleTipCancel}
                    multiline={true}
                    className="card-text"
                    style={{
                      fontSize: '33px',
                      maxWidth: '386px',
                      fontWeight: '700',
                      color: index === 0 ? '#000000' : '#FFFFFF',
                      lineHeight: '1.4',
                      fontFamily: 'Inter, sans-serif',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none'
                    }}
                  />
                ) : (
                  <div
                    className="card-text"
                    onClick={() => isEditable && setEditingTips(index)}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                  >
                    {tip.text}
                  </div>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Footer separator and elements */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        height: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 80px',
        backgroundColor: '#FFFFFF'
      }}>
        {/* Page number */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '0px',
          fontSize: '16px',
          color: 'rgba(0, 0, 0, 0.6)',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '15px',
            height: '1px',
            backgroundColor: '#5F616D'
          }}></div>
          {isEditable && editingPageNumber ? (
            <InlineEditor
              initialValue={currentPageNumber}
              onSave={(v) => {
                setCurrentPageNumber(v);
                setEditingPageNumber(false);
                onUpdate && onUpdate({ pageNumber: v });
              }}
              onCancel={() => setEditingPageNumber(false)}
              style={{ position: 'relative', background: 'transparent', border: 'none', outline: 'none', padding: 0, margin: 0, color: 'rgba(0, 0, 0, 0.6)', fontSize: '16px', fontWeight: 600 }}
            />
          ) : (
            <div onClick={() => isEditable && setEditingPageNumber(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>
              {currentPageNumber}
            </div>
          )}
        </div>
        
        {/* Logo placeholder */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          right: '22px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          color: 'black',
          fontFamily: 'Inter, sans-serif'
        }}>
          <YourLogo
            logoPath={logoPath}
            onLogoUploaded={(p) => onUpdate && onUpdate({ logoPath: p })}
            isEditable={isEditable}
            color="#000000"
            text={logoText}
          />
        </div>
      </div>

    </div>
    </>
  );
};

export default SoftSkillsAssessmentSlideTemplate; 