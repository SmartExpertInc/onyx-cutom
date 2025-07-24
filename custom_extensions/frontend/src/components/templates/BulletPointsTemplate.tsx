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

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: '600px',
    backgroundColor: currentTheme.colors.backgroundColor,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '80px',
    position: 'relative',
    fontFamily: currentTheme.fonts.contentFont
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    fontWeight: 700,
    color: currentTheme.colors.titleColor,
    textAlign: 'left',
    marginBottom: '32px'
  };

  const bulletsContainerStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    fontFamily: currentTheme.fonts.contentFont,
    color: currentTheme.colors.contentColor,
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '24px',
    flexWrap: 'wrap',
  };

  const bulletItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    fontSize: currentTheme.fonts.contentSize,
    lineHeight: 1.6,
    color: currentTheme.colors.contentColor,
    marginBottom: '16px',
    minWidth: maxColumns === 2 ? '40%' : '100%',
    flex: maxColumns === 2 ? '0 0 45%' : '1 1 100%'
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
    color: currentTheme.colors.accentColor,
    fontWeight: 600,
    minWidth: '20px',
    fontSize: bulletStyle === 'number' ? '1.1rem' : '1.2rem',
    fontFamily: currentTheme.fonts.titleFont
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
            <span
              style={{
                fontFamily: currentTheme.fonts.contentFont,
                fontSize: currentTheme.fonts.contentSize,
                color: currentTheme.colors.contentColor,
              }}
            >
              {bullet}
            </span>
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