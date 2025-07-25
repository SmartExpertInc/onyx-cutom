import React from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

export interface PyramidItem {
  heading: string;
  description: string;
}

export interface PyramidTemplateProps {
  slideId: string;
  title: string;
  subtitle: string;
  items: PyramidItem[];
  theme?: SlideTheme;
}

export const PyramidTemplate: React.FC<PyramidTemplateProps> = ({
  slideId,
  title,
  subtitle,
  items = [],
  theme,
}: PyramidTemplateProps) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, contentColor } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    backgroundColor,
    padding: '64px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: currentTheme.fonts.contentFont,
    minHeight: '600px',
    width: '100%',
  };

  const titleStyles: React.CSSProperties = {
    color: titleColor,
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    marginBottom: '16px',
    textAlign: 'left',
  };

  const subtitleStyles: React.CSSProperties = {
    color: contentColor,
    fontSize: currentTheme.fonts.contentSize,
    fontFamily: currentTheme.fonts.contentFont,
    marginBottom: '48px',
    maxWidth: '80%',
    lineHeight: 1.6,
    textAlign: 'left',
  };

  const mainContentStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'stretch',
    flexGrow: 1,
    gap: '48px',
  };

  const pyramidContainerStyles: React.CSSProperties = {
    flex: '0 0 45%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '4px',
  };

  const itemsContainerStyles: React.CSSProperties = {
    flex: '1 1 55%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '4px',
  };

  // Стилі для сегментів піраміди
  const pyramidSegmentStyles = (level: number): React.CSSProperties => {
    const widths = ['120px', '180px', '240px'];
    const heights = ['80px', '80px', '80px'];
    
    return {
      width: widths[level],
      height: heights[level],
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      clipPath: level === 0 
        ? 'polygon(50% 0%, 0% 100%, 100% 100%)' // Трикутник
        : 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)', // Трапеція
      position: 'relative',
    };
  };

  const pyramidNumberStyles: React.CSSProperties = {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '1.8rem',
    fontWeight: 'bold',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const textBlockStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '80px',
    paddingBottom: '4px',
  };

  const separatorStyles: React.CSSProperties = {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    margin: '0',
  };

  const itemHeadingStyles: React.CSSProperties = {
    color: titleColor,
    fontSize: '1.5rem',
    fontFamily: currentTheme.fonts.titleFont,
    marginBottom: '8px',
  };

  const itemDescriptionStyles: React.CSSProperties = {
    color: contentColor,
    fontSize: currentTheme.fonts.contentSize,
    lineHeight: 1.4,
  };

  return (
    <div className="pyramid-template" style={slideStyles}>
      <h1 style={titleStyles}>{title}</h1>
      {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
      <div style={mainContentStyles}>
        <div style={pyramidContainerStyles}>
          {[0, 1, 2].map((level) => (
            <div key={level} style={pyramidSegmentStyles(level)}>
              {React.createElement('span', { style: pyramidNumberStyles }, level + 1)}
            </div>
          ))}
        </div>
        <div style={itemsContainerStyles}>
          {Array.isArray(items) && items.slice(0, 3).map((item, index) => (
            <React.Fragment key={index}>
              <div style={textBlockStyles}>
                <div style={itemHeadingStyles}>{item.heading || 'Heading'}</div>
                <div style={itemDescriptionStyles}>{item.description || 'Description'}</div>
              </div>
              {index < 2 && <div style={separatorStyles}></div>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PyramidTemplate; 
export default PyramidTemplate; 