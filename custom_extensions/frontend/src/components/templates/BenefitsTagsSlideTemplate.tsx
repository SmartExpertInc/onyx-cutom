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

  // Responsive scaling that preserves original proportions
  const originalHeight = 600;
  const minHeight = 400;
  
  // Calculate scale factor based on available space
  // Use a more flexible approach that allows growth on larger screens
  const getScaleFactor = () => {
    // Try to get the container height from the parent element
    if (typeof window !== 'undefined') {
      const container = document.querySelector('.bg-white.rounded-md.shadow-lg');
      if (container) {
        const containerHeight = container.clientHeight;
        const containerWidth = container.clientWidth;
        
        // Calculate scale based on available space
        const heightScale = containerHeight / originalHeight;
        const widthScale = containerWidth / (originalHeight * 16 / 9); // Assuming 16:9 aspect ratio
        
        // Use the smaller scale to maintain proportions
        const calculatedScale = Math.min(heightScale, widthScale);
        
        // Ensure minimum scale of 0.67 (400px) and allow growth up to 1.5x
        return Math.max(Math.min(calculatedScale, 1.5), 0.67);
      }
    }
    
    // Fallback: use viewport-based calculation
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    
    const heightScale = (viewportHeight * 0.8) / originalHeight; // 80% of viewport
    const widthScale = (viewportWidth * 0.8) / (originalHeight * 16 / 9);
    
    const calculatedScale = Math.min(heightScale, widthScale);
    return Math.max(Math.min(calculatedScale, 1.5), 0.67);
  };

  const scaleFactor = getScaleFactor();

  // Scale all dimensions proportionally
  const scale = (value: number) => Math.max(value * scaleFactor, value * 0.5);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    minHeight: `${minHeight}px`,
    height: `${Math.max(600 * scaleFactor, minHeight)}px`,
    backgroundColor: themeBg,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'end',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    padding: `${scale(60)}px ${scale(80)}px`,
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
        marginBottom: `${scale(60)}px`
      }}>
        {/* Title */}
        <div style={{
          fontSize: `${scale(48)}px`,
          fontWeight: 'bold',
          color: themeTitle,
          lineHeight: '1.1',
          marginTop: `${scale(40)}px`,
          marginLeft: `-${scale(332)}%`
        }}>
          {isEditable && editingTitle ? (
            <InlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              className="benefits-tags-title-editor"
              style={{
                fontSize: `${scale(48)}px`,
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
          width: `${scale(155)}px`,
          height: `${scale(155)}px`,
          borderRadius: '50%',
          overflow: 'hidden',
          position: 'absolute',
          left: `${scale(60)}px`,
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
        gap: `${scale(20)}px`,
        maxWidth: `${scale(600)}px`,
        position: 'relative',
        marginTop: `${scale(40)}px`,
        left: `-${scale(17)}%`
      }}>
        {/* First row */}
        <div style={{
          display: 'flex',
          gap: `${scale(20)}px`
        }}>
          {currentTags.slice(0, 2).map((tag, index) => (
            <div
              key={index}
              style={{
                padding: `${scale(12)}px ${scale(20)}px`,
                backgroundColor: tag.isHighlighted ? themeAccent : themeBg,
                border: tag.isHighlighted ? 'none' : `${scale(1)}px solid ${themeContent}`,
                borderRadius: `${scale(8)}px`,
                fontSize: `${scale(34)}px`,
                color: tag.isHighlighted ? themeBg : themeContent,
                fontWeight: '500',
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none',
                display: 'flex',
                justifyContent: 'center',
                width: index === 0 ? `${scale(370)}px` : `${scale(180)}px`
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
                    fontSize: `${scale(34)}px`,
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
          gap: `${scale(20)}px`
        }}>
          {currentTags.slice(2, 5).map((tag, index) => (
            <div
              key={index + 2}
              style={{
                padding: `${scale(12)}px ${scale(20)}px`,
                backgroundColor: tag.isHighlighted ? themeAccent : themeBg,
                border: tag.isHighlighted ? 'none' : `${scale(1)}px solid ${themeContent}`,
                borderRadius: `${scale(8)}px`,
                fontSize: `${scale(34)}px`,
                color: tag.isHighlighted ? themeBg : themeContent,
                fontWeight: '500',
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none',
                display: 'flex',
                justifyContent: 'center',
                width: index === 0 ? `${scale(200)}px` : index === 1 ? `${scale(180)}px` : `${scale(180)}px`
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
                    fontSize: `${scale(34)}px`,
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
          gap: `${scale(20)}px`,
        }}>
          {currentTags.slice(5).map((tag, index) => (
            <div
              key={index + 5}
              style={{
                padding: `${scale(12)}px ${scale(20)}px`,
                backgroundColor: tag.isHighlighted ? themeAccent : themeBg,
                border: tag.isHighlighted ? 'none' : `${scale(1)}px solid ${themeContent}`,
                borderRadius: `${scale(8)}px`,
                fontSize: `${scale(30)}px`,
                color: tag.isHighlighted ? themeBg : themeContent,
                fontWeight: '500',
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none',
                display: 'flex',
                justifyContent: 'center',
                width: `${scale(380)}px`
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
                    fontSize: `${scale(34)}px`,
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
        bottom: `${scale(25)}px`,
        left: `${scale(80)}px`,
        display: 'flex',
        alignItems: 'center',
        gap: `${scale(10)}px`
      }}>
        <div style={{
          fontSize: `${scale(14)}px`,
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
                height: `${scale(30)}px`,
                maxWidth: `${scale(120)}px`,
                objectFit: 'contain'
              }}
            />
          ) : (
            // Show default logo design with clickable area
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: `${scale(10)}px`,
              cursor: isEditable ? 'pointer' : 'default'
            }}
            onClick={() => isEditable && setShowLogoUploadModal(true)}
            >
              <div style={{
                width: `${scale(30)}px`,
                height: `${scale(30)}px`,
                border: `${scale(2)}px solid ${themeContent}`,
                borderRadius: '50%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: `${scale(12)}px`,
                  height: `${scale(2)}px`,
                  backgroundColor: themeContent,
                  position: 'absolute'
                }} />
                <div style={{
                  width: `${scale(2)}px`,
                  height: `${scale(12)}px`,
                  backgroundColor: themeContent,
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }} />
              </div>
              <span style={{ fontSize: `${scale(14)}px`, fontWeight: '300', color: themeContent }}>Company logo</span>
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