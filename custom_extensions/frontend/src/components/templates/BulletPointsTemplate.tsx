// custom_extensions/frontend/src/components/templates/BulletPointsTemplate.tsx

import React from 'react';
import { BulletPointsProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';

export const BulletPointsTemplate: React.FC<BulletPointsProps & { theme?: SlideTheme }> = ({
  slideId,
  title,
  bullets = [],
  maxColumns = 2,
  bulletStyle = 'dot',
  onUpdate,
  theme,
  // Inline editing props
  renderEditableText,
  renderEditableArray
}) => {
  // Use theme colors instead of props
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
    alignItems: 'flex-start',
    padding: '80px',
    position: 'relative',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    fontWeight: 700,
    color: titleColor,
    marginBottom: '40px',
    lineHeight: 1.3,
    maxWidth: '900px'
  };

  const contentStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    fontFamily: currentTheme.fonts.contentFont,
    fontWeight: 400,
    color: contentColor,
    lineHeight: 1.6,
    maxWidth: '100%',
    flex: 1
  };

  // Bullet style mapping
  const bulletSymbols = {
    dot: '•',
    arrow: '→',
    check: '✓',
    star: '★'
  };

  const getBulletSymbol = (index: number): string => {
    if (bulletStyle === 'number') {
      return `${index + 1}.`;
    }
    return bulletSymbols[bulletStyle as keyof typeof bulletSymbols] || '•';
  };

  // Calculate grid layout
  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${maxColumns}, 1fr)`,
    gap: '20px',
    width: '100%'
  };

  const bulletItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '16px',
    gap: '12px'
  };

  const bulletSymbolStyles: React.CSSProperties = {
    fontSize: '18px',
    color: contentColor,
    fontWeight: 'bold',
    flexShrink: 0,
    marginTop: '2px'
  };

  const bulletTextStyles: React.CSSProperties = {
    fontSize: 'inherit',
    color: 'inherit',
    lineHeight: 'inherit'
  };

  return (
    <div className="bullet-points-template" style={slideStyles}>
      {/* Title */}
      <h1 style={titleStyles}>
        {renderEditableText ? 
          renderEditableText(['title'], title || '', {
            className: 'slide-title-editable',
            placeholder: 'Enter slide title...',
            maxLength: 100
          }) : 
          title
        }
      </h1>

      {/* Bullet Points */}
      <div style={contentStyles}>
        {renderEditableArray ? (
          // Inline editing mode
          renderEditableArray(['bullets'], bullets, {
            placeholder: 'Enter bullet points, one per line...',
            className: 'bullet-points-editable',
            maxLength: 2000
          })
        ) : (
          // Display mode
          <div style={gridStyles}>
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
        )}
      </div>

      {/* Empty state */}
      {(!bullets || bullets.length === 0) && !renderEditableArray && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px',
          color: '#666',
          fontSize: '16px',
          fontStyle: 'italic'
        }}>
          No bullet points added yet
        </div>
      )}
    </div>
  );
};

export default BulletPointsTemplate; 