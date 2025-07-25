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
    alignItems: 'center',
    flexGrow: 1,
    position: 'relative',
  };

  const pyramidContainerStyles: React.CSSProperties = {
    flex: '0 0 45%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '400px',
    gap: '16px',
  };

  const itemsContainerStyles: React.CSSProperties = {
    flex: '1 1 55%',
    position: 'relative',
    height: '400px',
  };

  const itemWrapperStyles = (level: number): React.CSSProperties => {
    const topPositions = ['16.7%', '50%', '83.3%'];
    return {
      position: 'absolute',
      width: '100%',
      top: topPositions[level],
      transform: 'translateY(-50%)',
    };
  };

  const separatorLineStyles = (level: number): React.CSSProperties => {
    const topPositions = ['33.3%', '66.6%'];
    return {
      position: 'absolute',
      left: 0,
      right: 0,
      top: topPositions[level],
      height: '1px',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    };
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
  };

  // SVG segments as separate components
  const TopTriangle = () => (
    React.createElement('svg', { width: '200', height: '70', viewBox: '0 0 200 70' },
      React.createElement('polygon', { points: '100,0 33.33,70 166.67,70', fill: 'rgba(255,255,255,0.10)' }),
      React.createElement('text', { x: '100', y: '40', textAnchor: 'middle', fill: '#fff', fontSize: '18', fontWeight: 'bold' }, '1')
    )
  );
  const MiddleTrapezoid = () => (
    React.createElement('svg', { width: '200', height: '70', viewBox: '0 0 200 70' },
      React.createElement('polygon', { points: '33.33,0 0,70 200,70 166.67,0', fill: 'rgba(255,255,255,0.10)' }),
      React.createElement('text', { x: '100', y: '45', textAnchor: 'middle', fill: '#fff', fontSize: '18', fontWeight: 'bold' }, '2')
    )
  );
  const BottomTrapezoid = () => (
    React.createElement('svg', { width: '200', height: '70', viewBox: '0 0 200 70' },
      React.createElement('polygon', { points: '0,0 200,0 166.67,70 33.33,70', fill: 'rgba(255,255,255,0.10)' }),
      React.createElement('text', { x: '100', y: '50', textAnchor: 'middle', fill: '#fff', fontSize: '18', fontWeight: 'bold' }, '3')
    )
  );

  return (
    <div className="pyramid-template" style={slideStyles}>
      <h1 style={titleStyles}>{title}</h1>
      {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
      <div style={mainContentStyles}>
        <div style={pyramidContainerStyles}>
          <TopTriangle />
          <MiddleTrapezoid />
          <BottomTrapezoid />
        </div>
        <div style={itemsContainerStyles}>
          {Array.isArray(items) && items.slice(0, 3).map((item, index) => (
            <div key={index} style={itemWrapperStyles(index)}>
              <div style={itemHeadingStyles}>{item.heading || 'Heading'}</div>
              <div style={itemDescriptionStyles}>{item.description || 'Description'}</div>
            </div>
          ))}
          <div style={separatorLineStyles(0)}></div>
          <div style={separatorLineStyles(1)}></div>
        </div>
      </div>
    </div>
  );
};

export default PyramidTemplate; 