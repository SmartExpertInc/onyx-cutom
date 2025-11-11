// custom_extensions/frontend/src/components/templates/PsychologicalSafetySlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { PsychologicalSafetySlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import YourLogo from '../YourLogo';
import { useAvatarDisplay } from '../AvatarDisplayManager';

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

type PsychologicalSafetySlideTemplateProps = PsychologicalSafetySlideProps & {
  theme?: SlideTheme | string;
  onUpdate?: (props: Partial<PsychologicalSafetySlideProps>) => void;
};

export const PsychologicalSafetySlideTemplate: React.FC<PsychologicalSafetySlideTemplateProps> = ({
  slideId,
  title = 'Fostering Psychological Safety',
  content = 'Studies indicate that teams with a high level of psychological safety have a 21% higher chance of delivering high-quality results.',
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  backgroundColor,
  titleColor,
  contentColor,
  accentColor,
  logoPath = '',
  logoText = 'Your Logo',
  pageNumber = '01',
  isEditable = false,
  onUpdate,
  theme,
  voiceoverText
}: PsychologicalSafetySlideTemplateProps) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentContent, setCurrentContent] = useState(content);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber || '01');

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const { defaultAvatar } = useAvatarDisplay();
  const defaultAvatarUrl = defaultAvatar?.selectedVariant?.canvas || '';
  const defaultAvatarAlt = defaultAvatar ? `${defaultAvatar.avatar.name} - ${defaultAvatar.selectedVariant.name}` : 'Profile image';

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    background: '#E0E7FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({
        ...{ title, content, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor, logoPath, logoText, pageNumber },
        title: newTitle
      });
    }
  };

  const handleContentSave = (newContent: string) => {
    setCurrentContent(newContent);
    setEditingContent(false);
    if (onUpdate) {
      onUpdate({
        ...{ title, content, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor, logoPath, logoText, pageNumber },
        content: newContent
      });
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
      onUpdate({
        ...{ title, content, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor, logoPath, logoText, pageNumber },
        profileImagePath: newImagePath
      });
    }
  };

  const handlePageNumberSave = (value: string) => {
    setCurrentPageNumber(value);
    setEditingPageNumber(false);
    onUpdate && onUpdate({
      ...{ title, content, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor, logoPath, logoText, pageNumber },
      pageNumber: value
    });
  };

  const handlePageNumberCancel = () => {
    setCurrentPageNumber(pageNumber || '01');
    setEditingPageNumber(false);
  };

  useEffect(() => {
    setCurrentPageNumber(pageNumber || '01');
  }, [pageNumber]);

  return (
    <div className="psychological-safety-slide-template" style={slideStyles}>
      {/* Logo */}
      <YourLogo
        logoPath={logoPath}
        onLogoUploaded={(p: string) => onUpdate && onUpdate({
          ...{ title, content, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor, logoText, pageNumber },
          logoPath: p
        })}
        isEditable={isEditable}
        color="#09090B"
        text={logoText || 'Your Logo'}
        fontSize="17px"
        style={{ position: 'absolute', top: '40px', left: '40px' }}
      />

      {/* Main Card */}
      <div style={{
        width: '755px',
        height: '395px',
        backgroundColor: '#ffffff',
        borderRadius: '30px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        position: 'relative',
        boxShadow: '0 12px 30px rgba(0,0,0,0.08)'
      }}>
                 {/* Profile Image - Top Left */}
         <div style={{
           position: 'absolute',
           top: '20px',
           left: '40px',
         width: '135px',
         height: '135px',
           backgroundColor: '#E0E7FF',
           overflow: 'hidden',
           borderRadius: '50%',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center'
         }}>
        <ClickableImagePlaceholder
          imagePath={profileImagePath || defaultAvatarUrl}
          onImageUploaded={handleProfileImageUploaded}
          size="MEDIUM"
          position="CENTER"
          description={defaultAvatarAlt}
          isEditable={isEditable}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
         </div>

        {/* Title */}
        <div style={{
          fontSize: '30px',
          color: '#09090B',
          fontWeight: 'bold',
          lineHeight: '1.2',
          marginTop: '145px',
        }}>
          {isEditable && editingTitle ? (
            <InlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={true}
              className="psychological-safety-title-editor"
              style={{
                fontSize: '36px',
                color: '#09090B',
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

        {/* Content */}
        <div style={{
          fontSize: '18px',
          color: '#09090B',
          lineHeight: '1.5',
          marginTop: '75px'
        }}>
          {isEditable && editingContent ? (
            <InlineEditor
              initialValue={currentContent}
              onSave={handleContentSave}
              onCancel={handleContentCancel}
              multiline={true}
              className="psychological-safety-content-editor"
              style={{
                fontSize: '18px',
                color: '#09090B',
                lineHeight: '1.5'
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

      {/* Page number */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '0px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#09090B',
          fontSize: '16px',
          fontWeight: 500
        }}
      >
        {isEditable && editingPageNumber ? (
          <InlineEditor
            initialValue={currentPageNumber}
            onSave={handlePageNumberSave}
            onCancel={handlePageNumberCancel}
            className="psychological-safety-page-number-editor"
            style={{
              minWidth: '32px',
              color: '#09090B'
            }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingPageNumber(true)}
            style={{ cursor: isEditable ? 'pointer' : 'default', userSelect: 'none' }}
          >
            {currentPageNumber}
          </div>
        )}
        <div style={{ width: '20px', height: '1px', backgroundColor: '#09090B' }} />
      </div>
    </div>
  );
};

export default PsychologicalSafetySlideTemplate; 