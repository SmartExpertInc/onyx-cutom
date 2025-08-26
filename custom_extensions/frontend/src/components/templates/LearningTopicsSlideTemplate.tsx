// custom_extensions/frontend/src/components/templates/LearningTopicsSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { LearningTopicsSlideProps } from '@/types/slideTemplates';
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

export const LearningTopicsSlideTemplate: React.FC<LearningTopicsSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'You will learn about:',
  subtitle = 'Employment',
  topics = [
    'Payroll',
    'Taxes',
    'Benefits',
    'Hiring'
  ],
  profileImagePath = '',
  profileImageAlt = 'Profile image',
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
  const [editingTopics, setEditingTopics] = useState<number | null>(null);
  const [editingCompanyName, setEditingCompanyName] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentSubtitle, setCurrentSubtitle] = useState(subtitle);
  const [currentTopics, setCurrentTopics] = useState(topics);
  const [currentCompanyName, setCurrentCompanyName] = useState(companyName);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '562.5px',
    backgroundColor: themeBg,
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, topics, profileImagePath, profileImageAlt, companyName, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleSubtitleSave = (newSubtitle: string) => {
    setCurrentSubtitle(newSubtitle);
    setEditingSubtitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, topics, profileImagePath, profileImageAlt, companyName, backgroundColor, titleColor, contentColor, accentColor }, subtitle: newSubtitle });
    }
  };

  const handleTopicSave = (index: number, newTopic: string) => {
    const newTopics = [...currentTopics];
    newTopics[index] = newTopic;
    setCurrentTopics(newTopics);
    setEditingTopics(null);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, topics, profileImagePath, profileImageAlt, companyName, backgroundColor, titleColor, contentColor, accentColor }, topics: newTopics });
    }
  };

  const handleCompanyNameSave = (newCompanyName: string) => {
    setCurrentCompanyName(newCompanyName);
    setEditingCompanyName(false);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, topics, profileImagePath, profileImageAlt, companyName, backgroundColor, titleColor, contentColor, accentColor }, companyName: newCompanyName });
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

  const handleTopicCancel = () => {
    setCurrentTopics(topics);
    setEditingTopics(null);
  };

  const handleCompanyNameCancel = () => {
    setCurrentCompanyName(companyName);
    setEditingCompanyName(false);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, topics, profileImagePath, profileImageAlt, companyName, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  return (
    <div className="learning-topics-slide-template" style={slideStyles}>
      {/* Left section */}
      <div style={{
        width: '50%',
        height: '100%',
        backgroundColor: themeBg,
        padding: '40px 60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {/* Header and title section */}
        <div>
          {/* Subtitle */}
          <div style={{
            fontSize: '14px',
            color: themeContent,
            marginBottom: '20px',
            fontWeight: '300'
          }}>
            {isEditable && editingSubtitle ? (
              <InlineEditor
                initialValue={currentSubtitle}
                onSave={handleSubtitleSave}
                onCancel={handleSubtitleCancel}
                className="learning-subtitle-editor"
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
            maxWidth: '275px',
            fontSize: '48px',
            color: themeTitle,
            lineHeight: '1.1',
            marginBottom: '60px'
          }}>
            {isEditable && editingTitle ? (
              <InlineEditor
                initialValue={currentTitle}
                onSave={handleTitleSave}
                onCancel={handleTitleCancel}
                className="learning-title-editor"
                style={{
                  maxWidth: '275px',
                  fontSize: '48px',
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

          {/* Topics list */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '30px'
          }}>
            {currentTopics.map((topic, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column-reverse',
                  gap: '10px'
                }}
              >
                <div style={{
                  width: '100%',
                  height: '2px',
                  backgroundColor: themeContent,
                  opacity: 0.3
                }} />
                <div style={{
                  fontSize: '24px',
                  color: themeTitle,
                  minWidth: '120px'
                }}>
                  {isEditable && editingTopics === index ? (
                    <InlineEditor
                      initialValue={topic}
                      onSave={(value) => handleTopicSave(index, value)}
                      onCancel={handleTopicCancel}
                      className="topic-editor"
                      style={{
                        fontSize: '24px',
                        color: themeTitle
                      }}
                    />
                  ) : (
                    <div
                      onClick={() => isEditable && setEditingTopics(index)}
                      style={{
                        cursor: isEditable ? 'pointer' : 'default',
                        userSelect: 'none'
                      }}
                    >
                      {topic}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginTop: '36px'
        }}>
          <div style={{
            width: '10px',
            height: '10px',
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
                  fontSize: '10px',
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

      {/* Right section with profile image */}
      <div style={{
        width: '50%',
        height: '100%',
        backgroundColor: themeAccent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <div style={{
          width: '382px',
          height: '543px',
          position: 'absolute',
          bottom: '-3px',
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
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LearningTopicsSlideTemplate; 