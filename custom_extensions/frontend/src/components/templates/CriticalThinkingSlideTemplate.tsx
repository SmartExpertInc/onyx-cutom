// custom_extensions/frontend/src/components/templates/CriticalThinkingSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { CriticalThinkingSlideProps } from '@/types/slideTemplates';
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

export const CriticalThinkingSlideTemplate: React.FC<CriticalThinkingSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Critical Thinking\nand Problem Solving',
  content = 'Critical thinking and problem solving are essential skills that empower individuals to analyze information, make informed decisions, and overcome challenges.',
  highlightedPhrases = ['analyze information,', 'make informed decisions,', 'overcome challenges.'],
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  companyLogoPath = '',
  companyLogoAlt = 'Company logo',
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
  const [editingContent, setEditingContent] = useState(false);
  const [editingHighlightedPhrases, setEditingHighlightedPhrases] = useState<number | null>(null);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentContent, setCurrentContent] = useState(content);
  const [currentHighlightedPhrases, setCurrentHighlightedPhrases] = useState(highlightedPhrases);

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
    padding: '40px 60px',
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, content, highlightedPhrases, profileImagePath, profileImageAlt, companyLogoPath, companyLogoAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleContentSave = (newContent: string) => {
    setCurrentContent(newContent);
    setEditingContent(false);
    if (onUpdate) {
      onUpdate({ ...{ title, content, highlightedPhrases, profileImagePath, profileImageAlt, companyLogoPath, companyLogoAlt, backgroundColor, titleColor, contentColor, accentColor }, content: newContent });
    }
  };

  const handleHighlightedPhraseSave = (index: number, newPhrase: string) => {
    const newPhrases = [...currentHighlightedPhrases];
    newPhrases[index] = newPhrase;
    setCurrentHighlightedPhrases(newPhrases);
    setEditingHighlightedPhrases(null);
    if (onUpdate) {
      onUpdate({ ...{ title, content, highlightedPhrases, profileImagePath, profileImageAlt, companyLogoPath, companyLogoAlt, backgroundColor, titleColor, contentColor, accentColor }, highlightedPhrases: newPhrases });
    }
  };

  const handleTitleCancel = () => {
    setCurrentTitle(title);
    setEditingTitle(false);
  };

  const handleContentCancel = () => {
    setCurrentContent(content);
    setEditingContent(false);
  };

  const handleHighlightedPhraseCancel = () => {
    setCurrentHighlightedPhrases(highlightedPhrases);
    setEditingHighlightedPhrases(null);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, content, highlightedPhrases, profileImagePath, profileImageAlt, companyLogoPath, companyLogoAlt, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleCompanyLogoUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, content, highlightedPhrases, profileImagePath, profileImageAlt, companyLogoPath, companyLogoAlt, backgroundColor, titleColor, contentColor, accentColor }, companyLogoPath: newImagePath });
    }
  };

  // Function to render content with highlighted phrases
  const renderContentWithHighlights = () => {
    let contentText = currentContent;
    let result = [];
    let lastIndex = 0;

    currentHighlightedPhrases.forEach((phrase, index) => {
      const phraseIndex = contentText.indexOf(phrase, lastIndex);
      if (phraseIndex !== -1) {
        // Add text before the phrase
        if (phraseIndex > lastIndex) {
          result.push(
            <span key={`text-${index}`}>
              {contentText.substring(lastIndex, phraseIndex)}
            </span>
          );
        }
        
        // Add highlighted phrase
        result.push(
          <span
            key={`highlight-${index}`}
            style={{
              backgroundColor: themeAccent,
              opacity: 0.3,
              padding: '2px 4px',
              borderRadius: '3px'
            }}
          >
            {isEditable && editingHighlightedPhrases === index ? (
              <InlineEditor
                initialValue={phrase}
                onSave={(value) => handleHighlightedPhraseSave(index, value)}
                onCancel={handleHighlightedPhraseCancel}
                className="highlighted-phrase-editor"
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: themeContent
                }}
              />
            ) : (
              <span
                onClick={() => isEditable && setEditingHighlightedPhrases(index)}
                style={{
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none'
                }}
              >
                {phrase}
              </span>
            )}
          </span>
        );
        
        lastIndex = phraseIndex + phrase.length;
      }
    });

    // Add remaining text
    if (lastIndex < contentText.length) {
      result.push(
        <span key="text-end">
          {contentText.substring(lastIndex)}
        </span>
      );
    }

    return result;
  };

  return (
    <div className="critical-thinking-slide-template" style={slideStyles}>
      {/* Profile Image - Top Left */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '60px',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: themeAccent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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

      {/* Main Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
        marginLeft: '200px',
        marginRight: '100px'
      }}>
        {/* Title */}
        <div style={{
          fontSize: '48px',
          color: themeTitle,
          fontWeight: 'bold',
          lineHeight: '1.2',
          marginBottom: '40px',
          whiteSpace: 'pre-line'
        }}>
          {isEditable && editingTitle ? (
            <InlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={true}
              className="critical-thinking-title-editor"
              style={{
                fontSize: '48px',
                color: themeTitle,
                fontWeight: 'bold',
                lineHeight: '1.2',
                whiteSpace: 'pre-line'
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

        {/* Content */}
        <div style={{
          fontSize: '24px',
          color: themeContent,
          lineHeight: '1.5',
          maxWidth: '600px'
        }}>
          {isEditable && editingContent ? (
            <InlineEditor
              initialValue={currentContent}
              onSave={handleContentSave}
              onCancel={handleContentCancel}
              multiline={true}
              className="critical-thinking-content-editor"
              style={{
                fontSize: '24px',
                color: themeContent,
                lineHeight: '1.5',
                maxWidth: '600px'
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingContent(true)}
              style={{
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              {renderContentWithHighlights()}
            </div>
          )}
        </div>
      </div>

      {/* Company Logo - Bottom Left */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '60px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: themeContent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: themeBg,
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          +
        </div>
        <div style={{
          fontSize: '14px',
          color: themeContent,
          fontWeight: '300'
        }}>
          Your Logo
        </div>
        {companyLogoPath && (
          <div style={{
            width: '60px',
            height: '30px',
            marginLeft: '10px'
          }}>
            <ClickableImagePlaceholder
              imagePath={companyLogoPath}
              onImageUploaded={handleCompanyLogoUploaded}
              size="SMALL"
              position="CENTER"
              description="Company logo"
              isEditable={isEditable}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CriticalThinkingSlideTemplate; 