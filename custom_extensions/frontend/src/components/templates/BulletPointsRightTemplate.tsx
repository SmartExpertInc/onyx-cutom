import React from 'react';
import { BulletPointsProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';

export interface BulletPointsRightProps extends BulletPointsProps {
  subtitle?: string;
  theme?: SlideTheme;
}

export const BulletPointsRightTemplate: React.FC<BulletPointsRightProps> = ({
  slideId,
  title,
  subtitle = '',
  bullets,
  maxColumns = 1,
  bulletStyle = 'dot',
  isEditable = false,
  onUpdate,
  imagePrompt,
  imageAlt,
  theme
}) => {
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

  const contentRowStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '48px'
  };

  const leftColStyles: React.CSSProperties = {
    flex: '1 1 60%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    minWidth: 0
  };

  const rightColStyles: React.CSSProperties = {
    flex: '0 0 40%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    color: currentTheme.colors.titleColor,
    textAlign: 'left',
    marginBottom: '24px'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '1.3rem',
    fontWeight: 500,
    color: currentTheme.colors.contentColor,
    marginBottom: '28px',
    fontFamily: currentTheme.fonts.contentFont
  };

  const bulletIconStyles: React.CSSProperties = {
    color: currentTheme.colors.accentColor,
    fontWeight: 600,
    minWidth: '20px',
    fontSize: bulletStyle === 'number' ? '1.1rem' : '1.2rem',
    fontFamily: currentTheme.fonts.titleFont
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

  const displayPrompt = imagePrompt || imageAlt || 'relevant illustration for the bullet points';

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

  return (
    <div className="bullet-points-right-template" style={slideStyles}>
      <h1 style={titleStyles}>{title}</h1>
      <div style={contentRowStyles}>
        {/* Left: Subtitle + Bullets */}
        <div style={leftColStyles}>
          {subtitle && <div style={subtitleStyles}>{subtitle}</div>}
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}>
            {bullets.map((bullet: string, index: number) => (
              <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                {React.createElement('span', { style: bulletIconStyles }, getBulletIcon(bulletStyle, index))}
                {React.createElement('span', { style: { fontFamily: currentTheme.fonts.contentFont, fontSize: currentTheme.fonts.contentSize, color: currentTheme.colors.contentColor } }, bullet)}
              </li>
            ))}
          </ul>
        </div>
        {/* Right: Placeholder */}
        <div style={rightColStyles}>
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
      </div>
    </div>
  );
};

export default BulletPointsRightTemplate; 