import React from 'react';
import { BulletPointsProps } from '@/types/slideTemplates';
import { SlideTheme, getSafeSlideTheme } from '@/types/slideThemes';
import SimpleInlineEditor from '../SimpleInlineEditor';

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
  onUpdate,
  imagePrompt,
  imageAlt,
  theme
}) => {
  const currentTheme = theme && theme.colors ? theme : getSafeSlideTheme();

  const handleTitleChange = (newTitle: string) => {
    if (onUpdate) { onUpdate({ title: newTitle }); }
  };

  const handleSubtitleChange = (newSubtitle: string) => {
    if (onUpdate) { onUpdate({ subtitle: newSubtitle }); }
  };

  const handleBulletsChange = (newBulletsText: string) => {
    const newBullets = newBulletsText.split('\n').filter(item => item.trim());
    if (onUpdate) { onUpdate({ bullets: newBullets }); }
  };

  const slideStyles: React.CSSProperties = {
    width: '100%',
    minHeight: '600px',
    backgroundColor: currentTheme.colors.backgroundColor,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: '60px',
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
    minWidth: 0,
    paddingRight: '20px'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    color: currentTheme.colors.titleColor,
    textAlign: 'left',
    marginBottom: '24px'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    color: currentTheme.colors.contentColor,
    marginBottom: '28px',
    fontFamily: currentTheme.fonts.contentFont
  };

  const bulletIconStyles: React.CSSProperties = {
    color: currentTheme.colors.accentColor,
    fontWeight: 600,
    minWidth: '20px',
    fontSize: bulletStyle === 'number' ? '1.6rem' : '1.8rem',
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

  const bulletItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '16px',
    fontSize: currentTheme.fonts.contentSize,
    lineHeight: 1.5,
    color: currentTheme.colors.contentColor,
    fontFamily: currentTheme.fonts.contentFont
  };

  const bulletTextStyles: React.CSSProperties = {
    flex: 1,
    minWidth: 0
  };

  const placeholderStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: '320px',
    maxHeight: '240px',
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

  const displayPrompt = imagePrompt || imageAlt || "man sitting on a chair";

  return (
    <div className="bullet-points-right-template" style={slideStyles}>
      <div style={contentRowStyles}>
        <div style={leftColStyles}>
          <h1 style={titleStyles}>
            <SimpleInlineEditor
              value={title || ''}
              onSave={handleTitleChange}
              placeholder="Enter slide title..."
              maxLength={100}
              className="bullet-points-right-title-editable"
            />
          </h1>
          <div style={subtitleStyles}>
            <SimpleInlineEditor
              value={subtitle || ''}
              onSave={handleSubtitleChange}
              placeholder="Enter subtitle..."
              maxLength={200}
              className="bullet-points-right-subtitle-editable"
            />
          </div>
          <div>
            <SimpleInlineEditor
              value={Array.isArray(bullets) ? bullets.join('\n') : ''}
              onSave={handleBulletsChange}
              multiline={true}
              placeholder="Enter bullet points, one per line..."
              maxLength={2000}
              rows={Math.max(6, Array.isArray(bullets) ? bullets.length + 2 : 6)}
              className="bullet-points-right-bullets-editable"
            />
          </div>
          {/* Display bullets */}
          {Array.isArray(bullets) && bullets.length > 0 && (
            <div>
              {bullets.map((bullet, index) => (
                <div key={index} style={bulletItemStyles}>
                  <span style={bulletIconStyles}>{getBulletIcon(bulletStyle, index)}</span>
                  <span style={bulletTextStyles}>{bullet}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={rightColStyles}>
          <div style={placeholderStyles}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🖼️</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>
              Image Placeholder
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
              {displayPrompt}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulletPointsRightTemplate; 