// custom_extensions/frontend/src/components/templates/BenefitsTagsSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { BenefitsTagsSlideProps } from '@/types/slideTemplates';
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

export const BenefitsTagsSlideTemplate: React.FC<BenefitsTagsSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Benefits',
  tags = [
    { text: 'Better decisions', isHighlighted: false },
    { text: 'Insight', isHighlighted: false },
    { text: 'Growth', isHighlighted: false },
    { text: 'Progress', isHighlighted: false },
    { text: 'Creativity', isHighlighted: false },
    { text: 'Innovative solutions', isHighlighted: true }
  ],
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  companyName = 'Company Logo',
  companyLogoPath = '',
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
  const [editingTags, setEditingTags] = useState<number | null>(null);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentTags, setCurrentTags] = useState(tags);
  const [currentCompanyLogoPath, setCurrentCompanyLogoPath] = useState(companyLogoPath);
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '600px',
    background: themeBg,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'end',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    padding: '60px 80px',
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, tags, profileImagePath, profileImageAlt, companyName, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleTagSave = (index: number, newTag: string) => {
    const newTags = [...currentTags];
    newTags[index] = { ...newTags[index], text: newTag };
    setCurrentTags(newTags);
    setEditingTags(null);
    if (onUpdate) {
      onUpdate({ ...{ title, tags, profileImagePath, profileImageAlt, companyName, backgroundColor, titleColor, contentColor, accentColor }, tags: newTags });
    }
  };

  const handleTitleCancel = () => {
    setCurrentTitle(title);
    setEditingTitle(false);
  };

  const handleTagCancel = () => {
    setCurrentTags(tags);
    setEditingTags(null);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, tags, profileImagePath, profileImageAlt, companyName, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleCompanyLogoUploaded = (newLogoPath: string) => {
    setCurrentCompanyLogoPath(newLogoPath);
    if (onUpdate) {
      onUpdate({ ...{ title, tags, profileImagePath, profileImageAlt, companyName, backgroundColor, titleColor, contentColor, accentColor }, companyLogoPath: newLogoPath });
    }
  };

  return (
    <div className="benefits-tags-slide-template" style={slideStyles}>
      {/* Top section with title and profile image */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '60px'
      }}>
        {/* Title */}
        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: themeTitle,
          lineHeight: '1.1',
          marginTop: '40px',
          marginLeft: '-332%'
        }}>
          {isEditable && editingTitle ? (
            <InlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              className="benefits-tags-title-editor"
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
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

        {/* Profile image */}
        <div style={{
          width: '155px',
          height: '155px',
          borderRadius: '50%',
          overflow: 'hidden',
          position: 'absolute',
          left: '60px',
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

      {/* Tags section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '600px',
        position: 'relative',
        marginTop: '40px',
        left: '-17%'
      }}>
        {/* First row */}
        <div style={{
          display: 'flex',
          gap: '20px'
        }}>
          {currentTags.slice(0, 2).map((tag, index) => (
            <div
              key={index}
              style={{
                padding: '12px 20px',
                  background: tag.isHighlighted ? themeAccent : themeBg,
                border: tag.isHighlighted ? 'none' : `1px solid ${themeContent}`,
                borderRadius: '8px',
                fontSize: '34px',
                color: tag.isHighlighted ? themeBg : themeContent,
                fontWeight: '500',
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none',
                display: 'flex',
                justifyContent: 'center',
                width: index === 0 ? '370px' : '180px'
              }}
              onClick={() => isEditable && setEditingTags(index)}
            >
              {isEditable && editingTags === index ? (
                <InlineEditor
                  initialValue={tag.text}
                  onSave={(value) => handleTagSave(index, value)}
                  onCancel={handleTagCancel}
                  className="tag-editor"
                  style={{
                    fontSize: '34px',
                    color: tag.isHighlighted ? themeBg : themeContent,
                    fontWeight: '500',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none'
                  }}
                />
              ) : (
                tag.text
              )}
            </div>
          ))}
        </div>

        {/* Second row */}
        <div style={{
          display: 'flex',
          gap: '20px'
        }}>
          {currentTags.slice(2, 5).map((tag, index) => (
            <div
              key={index + 2}
              style={{
                padding: '12px 20px',
                  background: tag.isHighlighted ? themeAccent : themeBg,
                border: tag.isHighlighted ? 'none' : `1px solid ${themeContent}`,
                borderRadius: '8px',
                fontSize: '34px',
                color: tag.isHighlighted ? themeBg : themeContent,
                fontWeight: '500',
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none',
                display: 'flex',
                justifyContent: 'center',
                width: index === 0 ? '200px' : index === 1 ? '180px' : '180px'
              }}
              onClick={() => isEditable && setEditingTags(index + 2)}
            >
              {isEditable && editingTags === index + 2 ? (
                <InlineEditor
                  initialValue={tag.text}
                  onSave={(value) => handleTagSave(index + 2, value)}
                  onCancel={handleTagCancel}
                  className="tag-editor"
                  style={{
                    fontSize: '34px',
                    color: tag.isHighlighted ? themeBg : themeContent,
                    fontWeight: '500',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none'
                  }}
                />
              ) : (
                tag.text
              )}
            </div>
          ))}
        </div>

        {/* Third row (single tag) */}
        <div style={{
          display: 'flex',
          gap: '20px',
        }}>
          {currentTags.slice(5).map((tag, index) => (
            <div
              key={index + 5}
              style={{
                padding: '12px 20px',
                  background: tag.isHighlighted ? themeAccent : themeBg,
                border: tag.isHighlighted ? 'none' : `1px solid ${themeContent}`,
                borderRadius: '8px',
                fontSize: '30px',
                color: tag.isHighlighted ? themeBg : themeContent,
                fontWeight: '500',
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none',
                display: 'flex',
                justifyContent: 'center',
                width: '380px'
              }}
              onClick={() => isEditable && setEditingTags(index + 5)}
            >
              {isEditable && editingTags === index + 5 ? (
                <InlineEditor
                  initialValue={tag.text}
                  onSave={(value) => handleTagSave(index + 5, value)}
                  onCancel={handleTagCancel}
                  className="tag-editor"
                  style={{
                    fontSize: '34px',
                    color: tag.isHighlighted ? themeBg : themeContent,
                    fontWeight: '500',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none'
                  }}
                />
              ) : (
                tag.text
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '25px',
        left: '80px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '300',
          color: themeContent
        }}>
          {currentCompanyLogoPath ? (
            // Show uploaded logo image
            <ClickableImagePlaceholder
              imagePath={currentCompanyLogoPath}
              onImageUploaded={handleCompanyLogoUploaded}
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
                border: `2px solid ${themeContent}`,
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
              <span style={{ fontSize: '14px', fontWeight: '300', color: themeContent }}>Company logo</span>
            </div>
          )}
        </div>
      </div>

      {/* Logo Upload Modal */}
      {showLogoUploadModal && (
        <PresentationImageUpload
          isOpen={showLogoUploadModal}
          onClose={() => setShowLogoUploadModal(false)}
          onImageUploaded={(newLogoPath) => {
            handleCompanyLogoUploaded(newLogoPath);
            setShowLogoUploadModal(false);
          }}
          title="Upload Company Logo"
        />
      )}
    </div>
  );
};

export default BenefitsTagsSlideTemplate; 