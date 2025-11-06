// custom_extensions/frontend/src/components/templates/CourseOverviewSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { CourseOverviewSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import AvatarImageDisplay from '../AvatarImageDisplay';
import YourLogo from '../YourLogo';
import { ControlledWysiwygEditor, ControlledWysiwygEditorRef } from '@/components/editors/ControlledWysiwygEditor';

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

export const CourseOverviewSlideTemplate_old: React.FC<CourseOverviewSlideProps & {
  theme?: SlideTheme | string;
  onEditorActive?: (editor: any, field: string, computedStyles?: any) => void;
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
  voiceoverText,
  logoPath = '',
  pageNumber = '01',
  onEditorActive
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);
  
  // Editor refs
  const titleEditorRef = useRef<ControlledWysiwygEditorRef>(null);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, subtitleColor: themeSubtitle, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: backgroundColor || '#ffffff',
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };



  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    onEditorActive?.(null as any, 'title');
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, imagePath, imageAlt, backgroundColor, titleColor, subtitleColor, accentColor, logoPath, pageNumber }, title: newTitle });
    }
  };

  const handleTitleCancel = () => {
    setCurrentTitle(title);
    setEditingTitle(false);
    onEditorActive?.(null as any, 'title');
  };

  const handleImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, imagePath, imageAlt, backgroundColor, titleColor, subtitleColor, accentColor, logoPath, pageNumber }, imagePath: newImagePath });
    }
  };

  const handleLogoUploaded = (newLogoPath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, imagePath, imageAlt, backgroundColor, titleColor, subtitleColor, accentColor, logoPath, pageNumber }, logoPath: newLogoPath });
    }
  };

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, imagePath, imageAlt, backgroundColor, titleColor, subtitleColor, accentColor, logoPath, pageNumber }, pageNumber: newPageNumber });
    }
  };

  const handlePageNumberCancel = () => {
    setCurrentPageNumber(pageNumber);
    setEditingPageNumber(false);
  };

  return (
    <div className="course-overview-slide-template inter-theme" style={slideStyles}>
      {/* Left Panel - Theme-based with rounded corners */}
      <div style={{
        width: '45%',
        height: '100%',
        background: 'linear-gradient(90deg, #0F58F9 0%, #1023A1 100%)',
        position: 'relative',
        boxSizing: 'border-box'
      }}>

        {/* Logo in top-left corner - MATCHES HTML */}
        <div style={{
          position: 'absolute',
          top: '48px',
          left: '48px'
        }}>
          <YourLogo
            logoPath={logoPath}
            onLogoUploaded={handleLogoUploaded}
            isEditable={isEditable}
            color="#ffffff"
            text="Your Logo"
            fontSize="28px"
            style={{
              maxHeight: '64px',
              maxWidth: '192px',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Page number with line - MATCHES HTML */}
        <div style={{
          position: 'absolute',
          bottom: '48px',
          left: '0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Small line */}
          <div style={{
            width: '20px',
            height: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)'
          }} />
          {/* Page number */}
          {isEditable && editingPageNumber ? (
            <InlineEditor
              initialValue={currentPageNumber}
              onSave={handlePageNumberSave}
              onCancel={handlePageNumberCancel}
              className="page-number-editor"
              style={{
                color: '#ffffff',
                fontSize: '24px',
                fontWeight: '300',
                width: 'auto',
                height: 'auto'
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingPageNumber(true)}
              style={{
                color: '#ffffff',
                fontSize: '24px',
                fontWeight: '300',
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              {currentPageNumber}
            </div>
          )}
        </div>

        {/* Title - Centered vertically - MATCHES HTML */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '48px',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {isEditable && editingTitle ? (
            <ControlledWysiwygEditor
              ref={titleEditorRef}
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              placeholder="Enter title..."
              className="course-overview-title-editor"
              style={{
                fontSize: '64px',
                color: 'white',
                lineHeight: '1.1',
                fontFamily: currentTheme.fonts.titleFont,
                position: 'relative',
                padding: '8px 12px',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }}
              onEditorReady={(editor, computedStyles) => onEditorActive?.(editor, 'title', computedStyles)}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingTitle(true)}
              style={{
                fontSize: '64px',
                color: 'white',
                lineHeight: '1.1',
                cursor: isEditable ? 'pointer' : 'default',
                fontFamily: currentTheme.fonts.titleFont,
                userSelect: 'none',
                position: 'relative'
              }}
              className={isEditable ? 'cursor-pointer hover:opacity-80' : ''}
              dangerouslySetInnerHTML={{ __html: currentTitle }}
            />
          )}
        </div>
      </div>

      {/* Right Panel - Theme background with avatar */}
      <div style={{
        width: '55%',
        height: '100%',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <AvatarImageDisplay
          size="LARGE"
          position="CENTER"
          style={{
            position: 'absolute',
            bottom: '-2.24%',
            height: '91%',
            width: 'auto',
            borderRadius: '0.83%'
          }}
        />
      </div>
    </div>
  );
};

export default CourseOverviewSlideTemplate_old; 