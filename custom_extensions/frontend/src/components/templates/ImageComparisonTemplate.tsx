// custom_extensions/frontend/src/components/templates/ImageComparisonTemplate.tsx

import React from 'react';
import { ImageComparisonProps } from '@/types/slideTemplates';

export const ImageComparisonTemplate: React.FC<ImageComparisonProps> = ({
  slideId,
  title,
  leftTitle,
  leftDescription,
  leftImage,
  leftImageAlt = '',
  rightTitle,
  rightDescription,
  rightImage,
  rightImageAlt = '',
  backgroundColor = '#ffffff',
  titleColor = '#1a1a1a',
  subtitleColor = '#2d3748',
  descriptionColor = '#4a5568',
  columnGap = 'medium',
  imageHeight = '200px',
  showImageBorder = true,
  imageBorderColor = '#e2e8f0',
  isEditable = false,
  onUpdate
}) => {
  const getGapSize = (gap: string): string => {
    switch (gap) {
      case 'small': return '20px';
      case 'medium': return '40px';
      case 'large': return '60px';
      default: return '40px';
    }
  };

  const slideStyles: React.CSSProperties = {
    width: '100%',
    minHeight: '600px',
    backgroundColor,
    padding: '60px',
    position: 'relative',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: titleColor,
    textAlign: 'center',
    marginBottom: '50px',
    lineHeight: 1.3,
    maxWidth: '900px',
    margin: '0 auto 50px auto'
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: getGapSize(columnGap),
    maxWidth: '1000px',
    margin: '0 auto'
  };

  const columnStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: subtitleColor,
    marginBottom: '16px',
    lineHeight: 1.4
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: 400,
    color: descriptionColor,
    lineHeight: 1.6,
    marginBottom: '20px'
  };

  const imageContainerStyles: React.CSSProperties = {
    width: '100%',
    height: imageHeight,
    borderRadius: '12px',
    overflow: 'hidden',
    border: showImageBorder ? `2px solid ${imageBorderColor}` : 'none',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7fafc'
  };

  const imageStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  };

  const editOverlayStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    display: isEditable ? 'flex' : 'none',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    zIndex: 10
  };

  const handleClick = () => {
    if (isEditable && onUpdate) {
      onUpdate({ slideId });
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    // Show placeholder
    const container = target.parentElement;
    if (container) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #a0aec0;">
          <div style="font-size: 3rem; margin-bottom: 8px;">🖼️</div>
          <div style="font-size: 0.9rem;">Image not available</div>
        </div>
      `;
    }
  };

  return (
    <div className="image-comparison-template" style={slideStyles} onClick={handleClick}>
      {/* Main Title */}
      <h1 style={titleStyles}>
        {title}
      </h1>

      {/* Two Column Grid */}
      <div style={gridStyles}>
        {/* Left Column */}
        <div style={columnStyles}>
          <h3 style={subtitleStyles}>{leftTitle}</h3>
          <p style={descriptionStyles}>{leftDescription}</p>
          <div style={imageContainerStyles}>
            <img 
              src={leftImage} 
              alt={leftImageAlt || leftTitle}
              style={imageStyles}
              onError={handleImageError}
            />
          </div>
        </div>

        {/* Right Column */}
        <div style={columnStyles}>
          <h3 style={subtitleStyles}>{rightTitle}</h3>
          <p style={descriptionStyles}>{rightDescription}</p>
          <div style={imageContainerStyles}>
            <img 
              src={rightImage} 
              alt={rightImageAlt || rightTitle}
              style={imageStyles}
              onError={handleImageError}
            />
          </div>
        </div>
      </div>

      {/* Edit Overlay */}
      <div style={editOverlayStyles}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#333',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          Натисніть для редагування порівняльного слайду із зображеннями
        </div>
      </div>
    </div>
  );
};

export default ImageComparisonTemplate; 