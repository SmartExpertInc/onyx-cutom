import React from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

export interface FourBoxGridProps {
  slideId: string;
  title: string;
  boxes: Array<{
    heading: string;
    text: string;
  }>;
  theme?: SlideTheme;
}

export const FourBoxGridTemplate: React.FC<FourBoxGridProps> = ({
  slideId,
  title,
  boxes,
  theme
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    minHeight: '600px',
    backgroundColor: currentTheme.colors.backgroundColor,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: '64px',
    fontFamily: currentTheme.fonts.contentFont
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    color: currentTheme.colors.titleColor,
    textAlign: 'left',
    marginBottom: '40px'
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '24px',
    width: '100%',
    flex: 1
  };

  const boxStyles: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '20px',
    color: currentTheme.colors.contentColor,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    boxShadow: '0 1px 0 0 #393963',
    border: '1px solid #393963',
    minHeight: '160px'
  };

  const headingStyles: React.CSSProperties = {
    fontSize: '1.5rem',
    color: currentTheme.colors.contentColor,
    marginBottom: '12px',
    fontFamily: currentTheme.fonts.titleFont
  };

  const textStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    color: currentTheme.colors.contentColor,
    fontFamily: currentTheme.fonts.contentFont
  };

  return (
    <div className="four-box-grid-template" style={slideStyles}>
      <h1 style={titleStyles}>{title}</h1>
      <div style={gridStyles}>
        {Array.isArray(boxes) && boxes.length >= 4 ? (
          boxes.slice(0, 4).map((box: any, idx: number) => (
            <div key={idx} style={boxStyles}>
              <div style={headingStyles}>{box.heading || 'Heading'}</div>
              <div style={textStyles}>{box.text || 'Description'}</div>
            </div>
          ))
        ) : (
          <div style={{ 
            color: '#ff6b6b', 
            fontWeight: 600, 
            padding: '20px', 
            textAlign: 'center',
            gridColumn: '1 / -1'
          }}>
            Error: This slide requires exactly 4 boxes with "heading" and "text" fields.
            {!Array.isArray(boxes) && <div>Found: {typeof boxes}</div>}
            {Array.isArray(boxes) && <div>Found {boxes.length} boxes (need 4)</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default FourBoxGridTemplate; 