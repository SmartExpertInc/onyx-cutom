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
  imagePrompt,
  imageAlt,
  theme
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    minHeight: '600px',
    backgroundColor: currentTheme.colors.backgroundColor,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: '80px',
    position: 'relative',
    fontFamily: currentTheme.fonts.contentFont
  };

  // Placeholder styles (left)
  const placeholderContainerStyles: React.CSSProperties = {
    flex: '0 0 50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0
  };
  const placeholderStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '1 / 1',
    backgroundColor: '#e9ecef',
    border: '2px dashed #adb5bd',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    textAlign: 'center',
    color: '#6c757d',
    margin: '0 auto'
  };

  // Right (bullets) styles
  const bulletsContainerStyles: React.CSSProperties = {
    flex: '1 1 50%',
    fontSize: currentTheme.fonts.contentSize,
    fontFamily: currentTheme.fonts.contentFont,
    color: currentTheme.colors.contentColor,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    paddingLeft: '40px'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    color: currentTheme.colors.titleColor,
    textAlign: 'left',
    marginBottom: '32px'
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

  // AI prompt logic
  const displayPrompt = imagePrompt || imageAlt || 'relevant illustration for the bullet points';

  return (
    <div className="bullet-points-template" style={slideStyles}>
      <h1 style={titleStyles}>{title}</h1>
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-evenly' }}>
        {/* Left: Placeholder */}
        <div style={placeholderContainerStyles}>
          <div style={placeholderStyles}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
              Image Placeholder
            </div>
            <div style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '12px' }}>
              AI Prompt: "{displayPrompt}"
            </div>
            <div style={{ fontSize: '12px', color: '#868e96' }}>
              320px × 320px
            </div>
          </div>
        </div>
        {/* Right: Bullets as list */}
        <div style={bulletsContainerStyles}>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}>
            {bullets.map((bullet: string, index: number) => (
              <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                <span style={bulletIconStyles}>{getBulletIcon(bulletStyle, index)}</span>
                <span style={{ fontFamily: currentTheme.fonts.contentFont, fontSize: currentTheme.fonts.contentSize, color: currentTheme.colors.contentColor }}>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BulletPointsTemplate; 