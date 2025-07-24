// custom_extensions/frontend/src/components/templates/BigImageLeftTemplate.tsx

import React from 'react';
import { BigImageLeftProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

export const BigImageLeftTemplate: React.FC<BigImageLeftProps & { theme?: SlideTheme }> = ({
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
    alignItems: 'stretch',
    overflow: 'hidden'
  };

  const imageContainerStyles: React.CSSProperties = {
    flex: '1 1 50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: backgroundColor // <-- тепер як у всього слайду
  };

  const getImageDimensions = () => {
    switch (imageSize) {
      case 'small': return { width: '300px', height: '200px' };
      case 'medium': return { width: '400px', height: '300px' };
      case 'large': 
      default: return { width: '100%', maxWidth: '500px', height: '350px' };
    }
  };

  const imageDimensions = getImageDimensions();

  const imageStyles: React.CSSProperties = {
    ...imageDimensions,
    objectFit: 'cover',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  };

  const placeholderStyles: React.CSSProperties = {
    // ...imageDimensions,
    width: '100%',
    height: '100%',
    backgroundColor: '#e9ecef',
    border: '2px dashed #adb5bd',
    // borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    textAlign: 'center',
    color: '#6c757d'
  };

  const contentContainerStyles: React.CSSProperties = {
    flex: '1 1 50%',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    fontWeight: '700',
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
      {/* Left side - Image */}
      <div style={imageContainerStyles}>
        {imageUrl && imageUrl !== 'https://via.placeholder.com/600x400?text=Your+Image' ? (
          <img 
            src={imageUrl} 
            alt={imageAlt || title}
            style={imageStyles}
          />
        ) : (
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

      {/* Right side - Content */}
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
                minHeight: '200px',
                width: '100%'
              }}
              placeholder="Enter slide subtitle..."
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

export default BigImageLeftTemplate; 