// custom_extensions/frontend/src/components/templates/BulletPointsTemplate.tsx

import React from 'react';
import { BulletPointsProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';

export const BulletPointsTemplate: React.FC<BulletPointsProps & { theme?: SlideTheme }> = ({
  slideId,
  title,
  bullets,
  maxColumns = 2,
  bulletStyle = 'dot',
  isEditable = false,
  onUpdate,
  theme
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, contentColor } = currentTheme.colors;
  const bulletColor = contentColor;
  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: '600px',
    backgroundColor,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '80px',
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
    maxWidth: '900px'
  };

  const bulletsContainerStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: '1000px',
    display: 'grid',
    gridTemplateColumns: `repeat(${maxColumns}, 1fr)`,
    gap: '24px',
    alignItems: 'start'
  };

  const bulletItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    fontSize: '1.2rem',
    lineHeight: 1.6,
    color: bulletColor,
    marginBottom: '16px'
  };

  const getBulletIcon = (style: string, index: number) => {
    switch (style) {
      case 'dot':
        return '•';
      case 'arrow':
        return '→';
      case 'check':
        return '✓';
      case 'star':
        return '★';
      case 'number':
        return `${index + 1}.`;
      default:
        return '•';
    }
  };

  const bulletIconStyles: React.CSSProperties = {
    color: titleColor,
    fontWeight: 600,
    minWidth: '20px',
    fontSize: bulletStyle === 'number' ? '1.1rem' : '1.2rem'
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
      onUpdate({ slideId });
    }
  };

  return (
    <div className="bullet-points-template" style={slideStyles} onClick={handleClick}>
      {/* Title */}
      <h1 style={titleStyles}>
        {title}
      </h1>

      {/* Bullet Points */}
      <div style={bulletsContainerStyles}>
        {bullets.map((bullet, index) => (
          <div key={index} style={bulletItemStyles}>
            <span style={bulletIconStyles}>
              {getBulletIcon(bulletStyle, index)}
            </span>
            <span>{bullet}</span>
          </div>
        ))}
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
          Click to edit bullet points
        </div>
      </div>
    </div>
  );
};

export default BulletPointsTemplate; 