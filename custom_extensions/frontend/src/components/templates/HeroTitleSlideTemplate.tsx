// custom_extensions/frontend/src/components/templates/HeroTitleSlideTemplate.tsx

import React from 'react';
import { HeroTitleSlideProps } from '@/types/slideTemplates';

export const HeroTitleSlideTemplate: React.FC<HeroTitleSlideProps> = ({
  slideId,
  title,
  subtitle,
  showAccent = true,
  accentColor = '#3b82f6',
  accentPosition = 'left',
  backgroundColor = '#ffffff',
  titleColor = '#1a1a1a',
  subtitleColor = '#6b7280',
  backgroundImage,
  textAlign = 'center',
  titleSize = 'xlarge',
  subtitleSize = 'medium',
  isEditable = false,
  onUpdate
}) => {
  const slideStyles: React.CSSProperties = {
    width: '100%',
    minHeight: '600px',
    backgroundColor,
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
    padding: '80px',
    position: 'relative',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden'
  };

  const getTitleFontSize = (size: string): string => {
    switch (size) {
      case 'small': return '2rem';
      case 'medium': return '2.5rem';
      case 'large': return '3rem';
      case 'xlarge': return '3.5rem';
      default: return '3.5rem';
    }
  };

  const getSubtitleFontSize = (size: string): string => {
    switch (size) {
      case 'small': return '1rem';
      case 'medium': return '1.25rem';
      case 'large': return '1.5rem';
      default: return '1.25rem';
    }
  };

  const titleStyles: React.CSSProperties = {
    fontSize: getTitleFontSize(titleSize),
    fontWeight: 700,
    color: titleColor,
    textAlign: textAlign as any,
    marginBottom: '24px',
    lineHeight: 1.2,
    maxWidth: '900px',
    textShadow: backgroundImage ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none',
    zIndex: 2,
    position: 'relative'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: getSubtitleFontSize(subtitleSize),
    fontWeight: 400,
    color: subtitleColor,
    textAlign: textAlign as any,
    lineHeight: 1.6,
    maxWidth: '700px',
    textShadow: backgroundImage ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none',
    zIndex: 2,
    position: 'relative'
  };

  const getAccentStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      backgroundColor: accentColor,
      zIndex: 1
    };

    switch (accentPosition) {
      case 'left':
        return {
          ...baseStyles,
          left: 0,
          top: 0,
          bottom: 0,
          width: '8px'
        };
      case 'right':
        return {
          ...baseStyles,
          right: 0,
          top: 0,
          bottom: 0,
          width: '8px'
        };
      case 'top':
        return {
          ...baseStyles,
          top: 0,
          left: 0,
          right: 0,
          height: '8px'
        };
      case 'bottom':
        return {
          ...baseStyles,
          bottom: 0,
          left: 0,
          right: 0,
          height: '8px'
        };
      default:
        return baseStyles;
    }
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

  return (
    <div className="hero-title-slide-template" style={slideStyles} onClick={handleClick}>
      {/* Accent Element */}
      {showAccent && <div style={getAccentStyles()}></div>}

      {/* Content Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
        zIndex: 2,
        position: 'relative',
        width: '100%'
      }}>
        {/* Main Title */}
        <h1 style={titleStyles}>
          {title}
        </h1>

        {/* Subtitle */}
        <div style={subtitleStyles}>
          {subtitle}
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
          Натисніть для редагування hero-слайду
        </div>
      </div>
    </div>
  );
};

export default HeroTitleSlideTemplate; 