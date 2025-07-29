import React from 'react';
import { BigImageLeftProps } from '@/types/slideTemplates';
import { SlideTheme, getSafeSlideTheme } from '@/types/slideThemes';
import SimpleInlineEditor from '../SimpleInlineEditor';

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
  onUpdate,
  theme
}) => {
  const currentTheme = theme || getSafeSlideTheme();
  const { backgroundColor, titleColor, contentColor } = currentTheme.colors;

  const handleTitleChange = (newTitle: string) => {
    if (onUpdate) { onUpdate({ title: newTitle }); }
  };

  const handleSubtitleChange = (newSubtitle: string) => {
    if (onUpdate) { onUpdate({ subtitle: newSubtitle }); }
  };

  const slideStyles: React.CSSProperties = {
    minHeight: '600px',
    backgroundColor: backgroundColor,
    fontFamily: currentTheme.fonts.contentFont,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    overflow: 'hidden',
    justifyContent: 'space-between',
    paddingBottom: '50px'
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
    minWidth: 0,
    marginBottom: '32px'
  };

  const placeholderStyles: React.CSSProperties = {
    width: '100%',
    height: '240px',
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
    padding: '60px 60px 60px 60px',
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

  // Use imagePrompt if provided, otherwise fallback to imageAlt or default
  const displayPrompt = imagePrompt || imageAlt || "man sitting on a chair";

  return (
    <div style={slideStyles}>
      {/* Top - Image */}
      <div style={imageContainerStyles}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt || displayPrompt}
            style={{
              ...imageDimensions,
              objectFit: 'cover',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          />
        ) : (
          <div style={placeholderStyles}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🖼️</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>
              Image Placeholder
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
              {displayPrompt}
            </div>
          </div>
        )}
      </div>

      {/* Bottom - Content */}
      <div style={contentContainerStyles}>
        <h1 style={titleStyles}>
          <SimpleInlineEditor
            value={title || ''}
            onSave={handleTitleChange}
            placeholder="Enter slide title..."
            maxLength={100}
            className="big-image-top-title-editable"
          />
        </h1>
        <div style={subtitleStyles}>
          <SimpleInlineEditor
            value={subtitle || ''}
            onSave={handleSubtitleChange}
            multiline={true}
            placeholder="Enter slide content..."
            maxLength={1000}
            rows={8}
            className="big-image-top-subtitle-editable"
          />
        </div>
      </div>
    </div>
  );
};

export default BigImageTopTemplate; 