import React from 'react';
import { BigImageLeftProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

export interface BigImageTopProps extends BigImageLeftProps {
  // Можна додати додаткові пропси, якщо потрібно
}

export const BigImageTopTemplate: React.FC<BigImageTopProps & { theme?: SlideTheme }> = ({
  title,
  subtitle,
  imageUrl,
  imageAlt,
  imagePrompt,
  imageSize = 'large',
  slideId,
  isEditable = false,
  onUpdate,
  theme
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, contentColor } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    minHeight: '600px',
    backgroundColor: backgroundColor,
    fontFamily: currentTheme.fonts.contentFont,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    overflow: 'hidden'
  };

  const getImageDimensions = () => {
    switch (imageSize) {
      case 'small': return { width: '300px', height: '200px' };
      case 'medium': return { width: '400px', height: '300px' };
      case 'large': 
      default: return { width: '100%', maxWidth: '700px', height: '350px' };
    }
  };

  const imageDimensions = getImageDimensions();

  const imageContainerStyles: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: backgroundColor,
    minHeight: imageDimensions.height,
    minWidth: 0,
    marginBottom: '32px'
  };

  const placeholderStyles: React.CSSProperties = {
    width: imageDimensions.width,
    height: imageDimensions.height,
    backgroundColor: '#e9ecef',
    border: '2px dashed #adb5bd',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    textAlign: 'center',
    color: '#6c757d'
  };

  const contentContainerStyles: React.CSSProperties = {
    width: '100%',
    padding: '0 40px 40px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    minWidth: 0,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    color: titleColor,
    marginBottom: '24px',
    lineHeight: '1.2'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    fontFamily: currentTheme.fonts.contentFont,
    color: contentColor,
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap'
  };

  const handleUpdate = (field: string, value: string) => {
    if (onUpdate) {
      onUpdate({ [field]: value });
    }
  };

  // Use imagePrompt if provided, otherwise fallback to imageAlt or default
  const displayPrompt = imagePrompt || imageAlt || "man sitting on a chair";

  return (
    <div style={slideStyles}>
      {/* Top - Image */}
      <div style={imageContainerStyles}>
        {(
          <div style={placeholderStyles}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🖼️</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
              Image Placeholder
            </div>
            <div style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '12px' }}>
              AI Prompt: "{displayPrompt}"
            </div>
            <div style={{ fontSize: '12px', color: '#868e96' }}>
              {imageDimensions.width} × {imageDimensions.height}
            </div>
          </div>
        )}
      </div>

      {/* Bottom - Content */}
      <div style={contentContainerStyles}>
        {isEditable ? (
          <>
            <input
              type="text"
              value={title}
              onChange={(e) => handleUpdate('title', e.target.value)}
              style={{
                ...titleStyles,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%'
              }}
              placeholder="Enter slide title..."
            />
            <textarea
              value={subtitle}
              onChange={(e) => handleUpdate('subtitle', e.target.value)}
              style={{
                ...subtitleStyles,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                resize: 'none',
                minHeight: '120px',
                width: '100%'
              }}
              placeholder="Enter slide content..."
            />
          </>
        ) : (
          <>
            <h2 style={titleStyles}>{title}</h2>
            <div style={subtitleStyles}>{subtitle}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default BigImageTopTemplate; 