// custom_extensions/frontend/src/components/templates/TitleSlideTemplate.tsx

import React from 'react';
import { TitleSlideProps } from '@/types/slideTemplates';

export const TitleSlideTemplate: React.FC<TitleSlideProps> = ({
  slideId,
  title,
  subtitle,
  author,
  date,
  backgroundColor = '#261c4e',
  titleColor = '#ffffff',
  subtitleColor = '#d9e1ff',
  backgroundImage,
  isEditable = false,
  onUpdate
}) => {
  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: '600px',
    backgroundColor,
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px 80px',
    position: 'relative',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '45px',
    fontFamily: "'Kanit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: 700,
    color: titleColor,
    textAlign: 'center',
    marginBottom: '24px',
    lineHeight: 1.2,
    maxWidth: '900px',
    textShadow: backgroundImage ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '1.5rem',
    fontFamily: "'Martian Mono', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace",
    fontWeight: 400,
    color: subtitleColor,
    textAlign: 'center',
    marginBottom: '40px',
    lineHeight: 1.4,
    maxWidth: '700px',
    textShadow: backgroundImage ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none'
  };

  const metadataStyles: React.CSSProperties = {
    display: 'flex',
    gap: '32px',
    fontSize: '1rem',
    color: subtitleColor,
    textAlign: 'center',
    opacity: 0.8
  };

  const metadataItemStyles: React.CSSProperties = {
    fontWeight: 500
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
    transition: 'all 0.2s ease'
  };

  const handleClick = () => {
    if (isEditable && onUpdate) {
      // This would trigger the prop editor
      onUpdate({ slideId });
    }
  };

  return (
    <div className="title-slide-template" style={slideStyles} onClick={handleClick}>
      {/* Main Title */}
      <h1 style={titleStyles}>
        {title}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <h2 style={subtitleStyles}>
          {subtitle}
        </h2>
      )}

      {/* Metadata */}
      {(author || date) && (
        <div style={metadataStyles}>
          {author && (
            <div style={metadataItemStyles}>
              {author}
            </div>
          )}
          {date && (
            <div style={metadataItemStyles}>
              {date}
            </div>
          )}
        </div>
      )}

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
          Click to edit title slide
        </div>
      </div>
    </div>
  );
};

export default TitleSlideTemplate; 