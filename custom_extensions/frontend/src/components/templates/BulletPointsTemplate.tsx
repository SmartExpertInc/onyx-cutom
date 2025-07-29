// custom_extensions/frontend/src/components/templates/BulletPointsTemplate.tsx

import React from 'react';
import { BulletPointsProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import SimpleInlineEditor from '../SimpleInlineEditor';

export const BulletPointsTemplate: React.FC<BulletPointsProps & { theme?: SlideTheme }> = ({
  slideId,
  title,
  bullets = [],
  maxColumns = 2,
  bulletStyle = 'dot',
  onUpdate,
  theme
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, contentColor } = currentTheme.colors;

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
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    fontWeight: 700,
    color: titleColor,
    textAlign: 'center',
    marginBottom: '60px',
    lineHeight: 1.3,
    maxWidth: '900px'
  };

  const bulletsContainerStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${maxColumns}, 1fr)`,
    gap: '40px',
    width: '100%',
    maxWidth: '1200px'
  };

  const bulletItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '16px'
  };

  const bulletSymbolStyles: React.CSSProperties = {
    fontSize: '1.2rem',
    color: contentColor,
    fontWeight: 600,
    flexShrink: 0,
    marginTop: '2px'
  };

  const bulletTextStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    fontFamily: currentTheme.fonts.contentFont,
    color: contentColor,
    lineHeight: 1.6,
    flex: 1
  };

  const getBulletSymbol = (index: number): string => {
    switch (bulletStyle) {
      case 'number':
        return `${index + 1}.`;
      case 'dash':
        return '—';
      case 'arrow':
        return '→';
      case 'check':
        return '✓';
      case 'star':
        return '★';
      default:
        return '•';
    }
  };

  const handleTitleChange = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
  };

  const handleBulletsChange = (newBulletsText: string) => {
    const newBullets = newBulletsText.split('\n').filter(item => item.trim());
    if (onUpdate) {
      onUpdate({ bullets: newBullets });
    }
  };

  return (
    <div className="bullet-points-template" style={slideStyles}>
      {/* Title */}
      <h1 style={titleStyles}>
        <SimpleInlineEditor
          value={title || ''}
          onSave={handleTitleChange}
          placeholder="Enter slide title..."
          maxLength={100}
          className="slide-title-editable"
        />
      </h1>

      {/* Bullets */}
      <div style={bulletsContainerStyles}>
        <SimpleInlineEditor
          value={bullets.join('\n')}
          onSave={handleBulletsChange}
          multiline={true}
          placeholder="Enter bullet points, one per line..."
          maxLength={2000}
          rows={Math.max(6, bullets.length + 2)}
          className="bullets-editable"
        />
      </div>

      {/* Display bullets */}
      <div style={bulletsContainerStyles}>
        {bullets.map((bullet, index) => (
          <div key={index} style={bulletItemStyles}>
            <span style={bulletSymbolStyles}>
              {getBulletSymbol(index)}
            </span>
            <span style={bulletTextStyles}>
              {bullet}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BulletPointsTemplate; 