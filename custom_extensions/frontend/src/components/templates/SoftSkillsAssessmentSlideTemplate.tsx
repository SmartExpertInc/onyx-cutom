// custom_extensions/frontend/src/components/templates/SoftSkillsAssessmentSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { SoftSkillsAssessmentSlideProps } from '@/types/slideTemplates';
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
  isEditable = false,
  onUpdate,
  theme,
  voiceoverText
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingTips, setEditingTips] = useState<number | null>(null);
  const [editingAdditionalTips, setEditingAdditionalTips] = useState<number | null>(null);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentTips, setCurrentTips] = useState(tips);
  const [currentAdditionalTips, setCurrentAdditionalTips] = useState([
    "Additional tip 1",
    "Additional tip 2"
  ]);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '600px',
    backgroundColor: themeBg,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    padding: '60px 80px',
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
    <div className="soft-skills-assessment-slide-template" style={slideStyles}>
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
          color: themeTitle,
          lineHeight: '1.2',
          maxWidth: '76%'
        }}>
          {isEditable && editingTitle ? (
            <InlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={true}
              className="soft-skills-title-editor"
              style={{
                fontSize: '61px',
                fontWeight: 'bold',
                color: themeTitle,
                lineHeight: '1.2'
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

        {/* Profile image */}
        <div style={{
          width: '145px',
          height: '145px',
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

      {/* Tips section */}
      <div style={{
        display: 'flex',
        gap: '30px',
        marginTop: '-17px'
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
              padding: '30px',
              backgroundColor: tip.isHighlighted ? themeAccent : themeTitle,
              minHeight: '310px',
              display: 'flex',
              paddingLeft: '10px',
              zIndex: '2',
            }}>
              <div style={{
                fontSize: '29px',
                fontWeight: '500',
                color: themeBg,
                lineHeight: '1.4',
                textAlign: 'center'
              }}>
                {isEditable && editingTips === index ? (
                  <InlineEditor
                    initialValue={tip.text}
                    onSave={(value) => handleTipSave(index, value)}
                    onCancel={handleTipCancel}
                    multiline={true}
                    className="tip-editor"
                    style={{
                      fontSize: '29px',
                      fontWeight: '500',
                      color: themeBg,
                      lineHeight: '1.4',
                      textAlign: 'center',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none'
                    }}
                  />
                ) : (
                  <div
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

            {/* Additional block that extends out */}
            <div style={{
              padding: '20px',
              backgroundColor: themeAccent,
              minHeight: '80px',
              height: '304px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              top: '-303px',
              zIndex: '1',
              marginTop: '-10px', // Makes it overlap slightly
              marginLeft: '16px', // Makes it extend out to the right
              marginRight: '-11px' // Makes it extend out to the right
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: '400',
                color: themeBg,
                lineHeight: '1.3',
                textAlign: 'center'
              }}>
                {isEditable && editingAdditionalTips === index ? (
                  <InlineEditor
                    initialValue={currentAdditionalTips[index]}
                    onSave={(value) => handleAdditionalTipSave(index, value)}
                    onCancel={handleAdditionalTipCancel}
                    multiline={true}
                    className="additional-tip-editor"
                    style={{
                      fontSize: '18px',
                      fontWeight: '400',
                      color: themeBg,
                      lineHeight: '1.3',
                      textAlign: 'center',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none'
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingAdditionalTips(index)}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                  >
                    {currentAdditionalTips[index]}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SoftSkillsAssessmentSlideTemplate; 