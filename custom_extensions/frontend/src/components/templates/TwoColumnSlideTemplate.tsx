// custom_extensions/frontend/src/components/templates/TwoColumnSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { TwoColumnSlideProps } from '@/types/slideTemplates';
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

export const TwoColumnSlideTemplate: React.FC<TwoColumnSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'We expect you to meet or exceed these metrics',
  content = 'We expect you to meet or exceed these metrics, and we will provide you with regular feedback and performance evaluations to help you track your progress and identify areas for improvement. We believe that by embodying these qualities and achieving your performance metrics, you will contribute to the success of our company and your own personal growth and development.',
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  rightImagePath = '',
  rightImageAlt = 'Right side image',
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
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentContent, setCurrentContent] = useState(content);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '596px',
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
      onUpdate({ ...{ title, content, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleContentSave = (newContent: string) => {
    setCurrentContent(newContent);
    setEditingContent(false);
    if (onUpdate) {
      onUpdate({ ...{ title, content, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor }, content: newContent });
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

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, content, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleRightImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, content, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor }, rightImagePath: newImagePath });
    }
  };

  return (
    <div className="two-column-slide-template" style={slideStyles}>
      {/* Left section with avatar and text */}
      <div style={{
        width: '50%',
        height: '100%',
        backgroundColor: '#f5f5f5',
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {/* Profile image */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          overflow: 'hidden',
          marginBottom: '40px'
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

        {/* Content */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          {/* Title */}
          <div style={{
            fontSize: '32px',
            color: themeTitle,
            fontWeight: 'bold',
            marginBottom: '30px',
            lineHeight: '1.2'
          }}>
            {isEditable && editingTitle ? (
              <InlineEditor
                initialValue={currentTitle}
                onSave={handleTitleSave}
                onCancel={handleTitleCancel}
                multiline={true}
                className="two-column-title-editor"
                style={{
                  fontSize: '32px',
                  color: themeTitle,
                  fontWeight: 'bold',
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

          {/* Content text */}
          <div style={{
            fontSize: '18px',
            color: themeContent,
            lineHeight: '1.6'
          }}>
            {isEditable && editingContent ? (
              <InlineEditor
                initialValue={currentContent}
                onSave={handleContentSave}
                onCancel={handleContentCancel}
                multiline={true}
                className="two-column-content-editor"
                style={{
                  fontSize: '18px',
                  color: themeContent,
                  lineHeight: '1.6'
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
                {currentContent}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right section with image */}
      <div style={{
        width: '50%',
        height: '100%',
        position: 'relative'
      }}>
        <ClickableImagePlaceholder
          imagePath={rightImagePath}
          onImageUploaded={handleRightImageUploaded}
          size="LARGE"
          position="CENTER"
          description="Right side image"
          isEditable={isEditable}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>
    </div>
  );
};

export default TwoColumnSlideTemplate; 