import React from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

export interface BigNumberItem {
  value: string;
  label: string;
  description: string;
}

export interface BigNumbersTemplateProps {
  slideId: string;
  title: string;
  items: BigNumberItem[];
  theme?: SlideTheme;
}

export const BigNumbersTemplate: React.FC<BigNumbersTemplateProps> = ({
  slideId,
  title,
  items,
  theme
}: BigNumbersTemplateProps) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, contentColor } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    minHeight: '600px',
    backgroundColor: backgroundColor,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '64px',
    fontFamily: currentTheme.fonts.contentFont,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    color: titleColor,
    textAlign: 'center',
    marginBottom: '56px',
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '32px',
    width: '100%',
    maxWidth: '1100px',
    margin: '0 auto',
  };

  const itemStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '0 16px',
  };

  const valueStyles: React.CSSProperties = {
    fontSize: '4.5rem',
    fontWeight: 700,
    color: titleColor,
    marginBottom: '16px',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '1.4rem',
    fontWeight: 600,
    color: titleColor,
    marginBottom: '10px',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    color: contentColor,
    fontFamily: currentTheme.fonts.contentFont,
    lineHeight: 1.5,
  };

  return (
    <div className="big-numbers-template" style={slideStyles}>
      <h1 style={titleStyles}>{title}</h1>
      <div style={gridStyles}>
        {(items as BigNumberItem[]).slice(0, 3).map((item: BigNumberItem, idx: number) => (
          <div key={idx} style={itemStyles}>
            <div style={valueStyles}>{item.value}</div>
            <div style={labelStyles}>{item.label}</div>
            <div style={descriptionStyles}>{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BigNumbersTemplate; 