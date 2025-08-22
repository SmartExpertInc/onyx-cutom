// custom_extensions/frontend/src/components/templates/WorkLifeBalanceSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { WorkLifeBalanceSlideProps } from '@/types/slideTemplates';
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

export const WorkLifeBalanceSlideTemplate: React.FC<WorkLifeBalanceSlideProps & {
  theme?: string;
}> = ({
  slideId,
  title = 'Work-life balance',
  content = 'Maintaining a healthy work-life balance allows me to be more present and engaged both at work and in my personal life, resulting in increased productivity and overall satisfaction.',
  imagePath = '',
  imageAlt = 'Work-life balance image',
  logoPath = '',
  logoAlt = 'Company logo',
  backgroundColor,
  titleColor,
  contentColor,
  accentColor,
  isEditable = false,
  onUpdate,
  theme = DEFAULT_SLIDE_THEME,
  voiceoverText
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentContent, setCurrentContent] = useState(content);

  // Get theme colors
  const currentTheme = getSlideTheme(theme);
  const themeColors = currentTheme.colors;

  // Use theme colors if not provided - adapt to site themes
  const slideBackgroundColor = backgroundColor || themeColors.backgroundColor;
  const slideTitleColor = titleColor || themeColors.titleColor;
  const slideContentColor = contentColor || themeColors.contentColor;
  const slideAccentColor = accentColor || themeColors.accentColor;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '596px',
    backgroundColor: slideBackgroundColor,
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, content, imagePath, imageAlt, logoPath, logoAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleContentSave = (newContent: string) => {
    setCurrentContent(newContent);
    setEditingContent(false);
    if (onUpdate) {
      onUpdate({ ...{ title, content, imagePath, imageAlt, logoPath, logoAlt, backgroundColor, titleColor, contentColor, accentColor }, content: newContent });
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

  const handleImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, content, imagePath, imageAlt, logoPath, logoAlt, backgroundColor, titleColor, contentColor, accentColor }, imagePath: newImagePath });
    }
  };

  const handleLogoUploaded = (newLogoPath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, content, imagePath, imageAlt, logoPath, logoAlt, backgroundColor, titleColor, contentColor, accentColor }, logoPath: newLogoPath });
    }
  };

  return (
    <div className="work-life-balance-slide-template" style={slideStyles}>
      {/* Left Content Area */}
      <div style={{
        width: '60%',
        height: '100%',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Logo placeholder */}
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '60px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'white'
        }}>
          {logoPath ? (
            // Show uploaded logo image
            <ClickableImagePlaceholder
              imagePath={logoPath}
              onImageUploaded={handleLogoUploaded}
              size="SMALL"
              position="CENTER"
              description="Company logo"
              isEditable={isEditable}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          ) : (
            // Show default logo design
            <div style={{
              width: '30px',
              height: '30px',
              border: '2px solid white',
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isEditable ? 'pointer' : 'default'
            }}
            onClick={() => isEditable && handleLogoUploaded('')}
            >
              <div style={{
                width: '12px',
                height: '2px',
                backgroundColor: 'white',
                position: 'absolute'
              }} />
              <div style={{
                width: '2px',
                height: '12px',
                backgroundColor: 'white',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }} />
            </div>
          )}
          <span style={{ fontSize: '14px', fontWeight: '300' }}>Your Logo</span>
        </div>

        {/* Title - Centered vertically */}
        <div style={{ 
          position: 'absolute',
          top: '40%',
          left: '60px',
          transform: 'translateY(-50%)',
          marginBottom: '40px'
        }}>
          {isEditable && editingTitle ? (
            <InlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              className="work-life-balance-title-editor"
              style={{
                fontSize: '68px',
                marginTop: '162px',
                color: slideTitleColor,
                lineHeight: '1.1',
                fontFamily: currentTheme.fonts.titleFont
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingTitle(true)}
              style={{
                marginTop: '162px',
                fontSize: '68px',
                color: slideTitleColor,
                lineHeight: '1.1',
                cursor: isEditable ? 'pointer' : 'default',
                fontFamily: currentTheme.fonts.titleFont,
                userSelect: 'none'
              }}
            >
              {currentTitle}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ 
          position: 'absolute',
          top: '55%',
          left: '60px',
          maxWidth: '500px'
        }}>
          {isEditable && editingContent ? (
            <InlineEditor
              initialValue={currentContent}
              onSave={handleContentSave}
              onCancel={handleContentCancel}
              multiline={true}
              className="work-life-balance-content-editor"
              style={{
                width: '607px',
                marginTop: '43px',
                marginLeft: '8px',
                fontSize: '23px',
                color: slideContentColor,
                lineHeight: '1.6',
                fontFamily: currentTheme.fonts.contentFont
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingContent(true)}
              style={{
                marginTop: '43px',
                marginLeft: '8px',
                width: '611px',
                fontSize: '23px',
                color: slideContentColor,
                lineHeight: '1.6',
                cursor: isEditable ? 'pointer' : 'default',
                fontFamily: currentTheme.fonts.contentFont,
                userSelect: 'none'
              }}
            >
              {currentContent}
            </div>
          )}
        </div>
      </div>

      {/* Right Image Area with Arch */}
      <div style={{
        width: '40%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Arch background */}
        <div style={{
          position: 'absolute',
          right: '0',
          top: '10%',
          transform: 'rotate(90deg)',
          width: '105%',
          height: '75%',
          backgroundColor: '#9CAF88', // Light olive green like in original
          borderRadius: '50% 0 0 50%',
          zIndex: 1
        }} />

        {/* Image */}
        <div style={{
          position: 'absolute',
          left: '34px',
          bottom: '-27px',
          zIndex: 2,
          width: '80%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ClickableImagePlaceholder
            imagePath={imagePath}
            onImageUploaded={handleImageUploaded}
            position="CENTER"
            description="Work-life balance image"
            isEditable={isEditable}
            style={{
              height: '474px',
              borderRadius: '10px',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkLifeBalanceSlideTemplate; 