// custom_extensions/frontend/src/components/templates/CourseOverviewSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { CourseOverviewSlideProps } from '@/types/slideTemplates';
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

export const CourseOverviewSlideTemplate: React.FC<CourseOverviewSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Course',
  subtitle = 'Overview',
  imagePath = '',
  imageAlt = 'Course overview image',
  backgroundColor,
  titleColor,
  subtitleColor,
  accentColor,
  isEditable = false,
  onUpdate,
  theme,
  voiceoverText
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentSubtitle, setCurrentSubtitle] = useState(subtitle);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, subtitleColor: themeSubtitle, accentColor: themeAccent } = currentTheme.colors;

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
      onUpdate({ ...{ title, subtitle, imagePath, imageAlt, backgroundColor, titleColor, subtitleColor, accentColor }, title: newTitle });
    }
  };

  const handleSubtitleSave = (newSubtitle: string) => {
    setCurrentSubtitle(newSubtitle);
    setEditingSubtitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, imagePath, imageAlt, backgroundColor, titleColor, subtitleColor, accentColor }, subtitle: newSubtitle });
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

  const handleImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, imagePath, imageAlt, backgroundColor, titleColor, subtitleColor, accentColor }, imagePath: newImagePath });
    }
  };

  return (
    <div className="course-overview-slide-template" style={slideStyles}>
      {/* Left Panel - Theme-based with rounded corners */}
      <div style={{
        width: '45%',
        height: '100%',
        backgroundColor: themeAccent,
        position: 'relative',
        borderTopRightRadius: '50px',
        borderBottomRightRadius: '50px',
        boxSizing: 'border-box'
      }}>
        {/* Star icon in top left */}
        <div style={{
          position: 'absolute',
          top: '30px',
          left: '30px',
          width: '20px',
          height: '20px',
          color: themeBg,
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
          ✦
        </div>

        {/* Vertical line on left edge */}
        <div style={{
          position: 'absolute',
          left: '0',
          top: '0',
          width: '2px',
          height: '100%',
          backgroundColor: themeBg
        }} />

        {/* Page number */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '30px',
          color: themeBg,
          fontSize: '14px',
          fontWeight: '300'
        }}>
          01
        </div>

        {/* Title and Subtitle - Centered vertically */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50px',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {isEditable && editingTitle ? (
            <InlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              className="course-overview-title-editor"
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: themeBg,
                lineHeight: '1.1',
                fontFamily: currentTheme.fonts.titleFont
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingTitle(true)}
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: themeBg,
                lineHeight: '1.1',
                cursor: isEditable ? 'pointer' : 'default',
                fontFamily: currentTheme.fonts.titleFont,
                userSelect: 'none'
              }}
            >
              {currentTitle}
            </div>
          )}

          {isEditable && editingSubtitle ? (
            <InlineEditor
              initialValue={currentSubtitle}
              onSave={handleSubtitleSave}
              onCancel={handleSubtitleCancel}
              className="course-overview-subtitle-editor"
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: themeBg,
                lineHeight: '1.1',
                fontFamily: currentTheme.fonts.titleFont
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingSubtitle(true)}
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: themeBg,
                lineHeight: '1.1',
                cursor: isEditable ? 'pointer' : 'default',
                fontFamily: currentTheme.fonts.titleFont,
                userSelect: 'none'
              }}
            >
              {currentSubtitle}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Theme background with image */}
      <div style={{
        width: '55%',
        height: '100%',
        backgroundColor: themeBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <ClickableImagePlaceholder
          imagePath={imagePath}
          onImageUploaded={handleImageUploaded}
          size="LARGE"
          position="CENTER"
          description="Course overview image"
          isEditable={isEditable}
          style={{
            position: 'absolute',
            bottom: '-27px',
            height: '530px',
            borderRadius: '10px'
          }}
        />
      </div>
    </div>
  );
};

export default CourseOverviewSlideTemplate; 