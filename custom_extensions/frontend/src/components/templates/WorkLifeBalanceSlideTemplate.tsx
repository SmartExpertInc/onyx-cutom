// custom_extensions/frontend/src/components/templates/WorkLifeBalanceSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { WorkLifeBalanceSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import PresentationImageUpload from '../PresentationImageUpload';

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
  theme?: SlideTheme | string;
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
  theme,
  voiceoverText,
  pageNumber = '02'
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentContent, setCurrentContent] = useState(content);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    background: 'linear-gradient(90deg, #0F58F9 0%, #1023A1 100%)',
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, content, imagePath, imageAlt, logoPath, logoAlt, backgroundColor, titleColor, contentColor, accentColor, pageNumber }, title: newTitle });
    }
  };

  const handleContentSave = (newContent: string) => {
    setCurrentContent(newContent);
    setEditingContent(false);
    if (onUpdate) {
      onUpdate({ ...{ title, content, imagePath, imageAlt, logoPath, logoAlt, backgroundColor, titleColor, contentColor, accentColor, pageNumber }, content: newContent });
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
      onUpdate({ ...{ title, content, imagePath, imageAlt, logoPath, logoAlt, backgroundColor, titleColor, contentColor, accentColor, pageNumber }, imagePath: newImagePath });
    }
  };

  const handleLogoUploaded = (newLogoPath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, content, imagePath, imageAlt, logoPath, logoAlt, backgroundColor, titleColor, contentColor, accentColor, pageNumber }, logoPath: newLogoPath });
    }
  };

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    if (onUpdate) {
      onUpdate({ ...{ title, content, imagePath, imageAlt, logoPath, logoAlt, backgroundColor, titleColor, contentColor, accentColor, pageNumber }, pageNumber: newPageNumber });
    }
  };

  const handlePageNumberCancel = () => {
    setCurrentPageNumber(pageNumber);
    setEditingPageNumber(false);
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
        {/* Logo placeholder - MATCHES HTML: top: 40px, left: 40px, gap: 16px */}
        <div style={{
          position: 'absolute',
          top: '2.08%',
          left: '2.08%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.83%',
          color: '#ffffff'
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
                height: '30px',
                maxWidth: '120px',
                objectFit: 'contain'
              }}
            />
          ) : (
            // Show default logo design with clickable area
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: isEditable ? 'pointer' : 'default'
            }}
            onClick={() => isEditable && setShowLogoUploadModal(true)}
            >
              <div style={{
                width: '30px',
                height: '30px',
                border: `2px solid #ffffff`,
                borderRadius: '50%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '12px',
                  height: '2px',
                  backgroundColor: themeContent,
                  position: 'absolute'
                }} />
                <div style={{
                  width: '2px',
                  height: '12px',
                  backgroundColor: themeContent,
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '300', color: '#ffffff' }}>Your Logo</span>
            </div>
          )}
        </div>

        {/* Title - MATCHES HTML: top: 22%, left: 96px, marginTop: 259px, fontSize: 93px */}
        <div style={{ 
          position: 'absolute',
          top: '22%',
          left: '5%',
          transform: 'translateY(-50%)'
        }}>
          {isEditable && editingTitle ? (
            <InlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              className="work-life-balance-title-editor"
              style={{
                marginTop: '24%',
                fontSize: '4.84vw',
                color: '#ffffff',
                lineHeight: '1.1',
                fontFamily: currentTheme.fonts.titleFont,
                position: 'relative'
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingTitle(true)}
              style={{
                marginTop: '24%',
                fontSize: '4.84vw',
                color: '#ffffff',
                lineHeight: '1.1',
                cursor: isEditable ? 'pointer' : 'default',
                fontFamily: currentTheme.fonts.titleFont,
                userSelect: 'none',
                position: 'relative'
              }}
            >
              {currentTitle}
            </div>
          )}
        </div>

        {/* Content - MATCHES HTML: top: 39%, left: 96px, marginTop: 50px, marginLeft: 10px, width: 800px, fontSize: 37px */}
        <div style={{ 
          position: 'absolute',
          top: '39%',
          left: '5%'
        }}>
          {isEditable && editingContent ? (
            <InlineEditor
              initialValue={currentContent}
              onSave={handleContentSave}
              onCancel={handleContentCancel}
              multiline={true}
              className="work-life-balance-content-editor"
              style={{
                marginTop: '4.6%',
                marginLeft: '0.5%',
                width: '41.67%',
                fontSize: '1.93vw',
                color: '#ffffff',
                lineHeight: '1.6',
                fontFamily: currentTheme.fonts.contentFont,
                position: 'relative'
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingContent(true)}
              style={{
                marginTop: '4.6%',
                marginLeft: '0.5%',
                width: '41.67%',
                fontSize: '1.93vw',
                color: '#ffffff',
                lineHeight: '1.6',
                cursor: isEditable ? 'pointer' : 'default',
                fontFamily: currentTheme.fonts.contentFont,
                userSelect: 'none',
                position: 'relative'
              }}
            >
              {currentContent}
            </div>
          )}
        </div>

        {/* Page number with line - MATCHES HTML: bottom: 48px, gap: 13px, line: 32px × 2px */}
        <div style={{
          position: 'absolute',
          bottom: '2.5%',
          left: '0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.68%'
        }}>
          {/* Small line */}
          <div style={{
            width: '1.67%',
            height: '0.19%',
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
                fontSize: '1.4vw',
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
                fontSize: '1.4vw',
                fontWeight: '300',
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              {currentPageNumber}
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
          right: '0px',
          bottom: '0',
          transform: 'rotate(90deg)',
          width: '116%',
          height: '74%',
          backgroundColor: '#ffffff',
          borderRadius: '50% 0 0 50%',
          zIndex: 1
        }} />

        {/* Image - MATCHES HTML: left: -67px, bottom: -43px, height: 904px, borderRadius: 16px */}
        <div style={{
          position: 'absolute',
          left: '-3.49%',
          bottom: '-3.98%',
          zIndex: 2,
          width: '100%',
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
              height: '83.7%',
              borderRadius: '0.83%',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>

      {/* Logo Upload Modal */}
      {showLogoUploadModal && (
        <PresentationImageUpload
          isOpen={showLogoUploadModal}
          onClose={() => setShowLogoUploadModal(false)}
          onImageUploaded={(newLogoPath) => {
            handleLogoUploaded(newLogoPath);
            setShowLogoUploadModal(false);
          }}
          title="Upload Company Logo"
        />
      )}
    </div>
  );
};

export default WorkLifeBalanceSlideTemplate; 