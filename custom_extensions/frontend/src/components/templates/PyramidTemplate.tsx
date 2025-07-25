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
    gap: '48px',
  };

  const pyramidContainerStyles: React.CSSProperties = {
    flex: '0 0 45%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0px', // Remove gap between pyramid segments
    justifyContent: 'center',
  };

  const itemsContainerStyles: React.CSSProperties = {
    flex: '1 1 55%',
    position: 'relative', // Add this for absolute positioning
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
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
      }
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

  const PyramidSVG1 = () => {
    const pyramidFill = "rgba(255, 255, 255, 0.1)";
    const textFill = "rgba(255, 255, 255, 0.9)";

    return React.createElement('svg', {  height: "60", width: "170", viewBox: "50 0 100 60" },
      // Segment 1 (Top Triangle)
      React.createElement('path', { d: "M 100,0 L 66.67,60 L 133.33,60 Z", fill: pyramidFill, stroke: "rgba(255,255,255,0.3)", strokeWidth: "0.5" }),
      React.createElement('text', { x: "100", y: "35", textAnchor: "middle", fill: textFill, fontSize: "12", fontWeight: "bold" }, "1"),
    );
  };

  const PyramidSVG2 = () => {
    const pyramidFill = "rgba(255, 255, 255, 0.1)";
    const textFill = "rgba(255, 255, 255, 0.9)";

    return React.createElement('svg', { width: "341", height: "60", viewBox: "10 60 180 60" },
      // Segment 2 (Middle Trapezoid)
      React.createElement('path', { d: "M 66.67,60 L 33.33,120 L 166.67,120 L 133.33,60 Z", fill: pyramidFill, stroke: "rgba(255,255,255,0.3)", strokeWidth: "0.5" }),
      React.createElement('text', { x: "100", y: "95", textAnchor: "middle", fill: textFill, fontSize: "12", fontWeight: "bold" }, "2"),
    );
  };

  const PyramidSVG3 = () => {
    const pyramidFill = "rgba(255, 255, 255, 0.1)";
    const textFill = "rgba(255, 255, 255, 0.9)";

    return React.createElement('svg', { width: "512", height: "60", viewBox: "-50 120 300 60" },
      // Segment 3 (Bottom Trapezoid)
      React.createElement('path', { d: "M 33.33,120 L 0,180 L 200,180 L 166.67,120 Z", fill: pyramidFill, stroke: "rgba(255,255,255,0.3)", strokeWidth: "0.5" }),
      React.createElement('text', { x: "100", y: "155", textAnchor: "middle", fill: textFill, fontSize: "12", fontWeight: "bold" }, "3")
    );
  };
      

  return (
    <div className="pyramid-template" style={slideStyles}>
      <h1 style={titleStyles}>{title}</h1>
      {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
      <div style={mainContentStyles}>
        <div style={pyramidContainerStyles}>
          <PyramidSVG1 />
          <PyramidSVG2 />
          <PyramidSVG3 />
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