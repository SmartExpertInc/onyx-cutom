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
  };

  const pyramidContainerStyles: React.CSSProperties = {
    flex: '0 0 40%',
    position: 'relative',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const itemsContainerStyles: React.CSSProperties = {
    flex: '1 1 60%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '350px',
    gap: '32px'
  };
  
  const itemStyles: React.CSSProperties = {
    paddingBottom: '32px',
    borderBottom: `1px solid rgba(255, 255, 255, 0.2)`,
  };
  
  const lastItemStyles: React.CSSProperties = {
     paddingBottom: '32px',
     borderBottom: 'none',
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

  const PyramidSVG = () => (
    React.createElement('svg', { width: "300", height: "350", viewBox: "0 0 100 115" },
      React.createElement('defs', null,
        React.createElement('linearGradient', { id: "pyramid-gradient-new", x1: "0%", y1: "0%", x2: "0%", y2: "100%" },
          React.createElement('stop', { offset: "0%", style: { stopColor: 'rgba(255, 255, 255, 0.2)' } }),
          React.createElement('stop', { offset: "100%", style: { stopColor: 'rgba(255, 255, 255, 0.05)' } })
        )
      ),
      React.createElement('path', { d: "M 50,0 L 0,115 L 100,115 Z", fill: "url(#pyramid-gradient-new)" }),
      React.createElement('line', { x1: "17", y1: "38.3", x2: "83", y2: "38.3", stroke: "rgba(255,255,255,0.5)", strokeWidth: "0.5" }),
      React.createElement('line', { x1: "33", y1: "76.6", x2: "67", y2: "76.6", stroke: "rgba(255,255,255,0.5)", strokeWidth: "0.5" }),
      React.createElement('text', { x: "50", y: "25", textAnchor: "middle", fill: "#fff", fontSize: "8", fontWeight: "bold" }, "1"),
      React.createElement('text', { x: "50", y: "60", textAnchor: "middle", fill: "#fff", fontSize: "8", fontWeight: "bold" }, "2"),
      React.createElement('text', { x: "50", y: "98", textAnchor: "middle", fill: "#fff", fontSize: "8", fontWeight: "bold" }, "3")
    )
  );

  return (
    <div className="pyramid-template" style={slideStyles}>
      <h1 style={titleStyles}>{title}</h1>
      {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
      <div style={mainContentStyles}>
        <div style={pyramidContainerStyles}>
          <PyramidSVG />
        </div>
        <div style={itemsContainerStyles}>
          {Array.isArray(items) && items.length >= 3 ? (
            items.slice(0, 3).map((item, index) => (
              <div key={index} style={index === 2 ? lastItemStyles : itemStyles}>
                <div style={itemHeadingStyles}>{item.heading || 'Heading'}</div>
                <div style={itemDescriptionStyles}>{item.description || 'Description'}</div>
              </div>
            ))
          ) : (
            <div style={{
              color: '#ff6b6b',
              fontWeight: 600,
              padding: '20px',
              textAlign: 'center'
            }}>
              Error: This slide requires exactly 3 items with "heading" and "description" fields.
              {!Array.isArray(items) && <div>Found: {typeof items}</div>}
              {Array.isArray(items) && <div>Found {items.length} items (need 3)</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PyramidTemplate; 