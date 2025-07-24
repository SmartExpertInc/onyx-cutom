// custom_extensions/frontend/src/components/templates/ComparisonSlideTemplate.tsx

import React from 'react';
import { ComparisonSlideProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

export const ComparisonSlideTemplate: React.FC<ComparisonSlideProps & { theme?: SlideTheme }> = ({
  title,
  beforeTitle,
  beforeContent,
  afterTitle,
  afterContent,
  theme
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);

  return (
    <div
      style={{
        padding: '40px',
        minHeight: '600px',
        backgroundColor: currentTheme.colors.backgroundColor,
        fontFamily: currentTheme.fonts.contentFont,
      }}
    >
      <h1
        style={{
          textAlign: 'center',
          marginBottom: '40px',
          fontFamily: currentTheme.fonts.titleFont,
          fontSize: currentTheme.fonts.titleSize,
          color: currentTheme.colors.titleColor,
        }}
      >
        {title}
      </h1>
      <div style={{ display: 'flex', gap: '40px' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h2
            style={{
              color: currentTheme.colors.accentColor,
              fontFamily: currentTheme.fonts.titleFont,
              fontSize: '1.2rem',
              marginBottom: '12px',
            }}
          >
            {beforeTitle}
          </h2>
          <p
            style={{
              color: currentTheme.colors.contentColor,
              fontFamily: currentTheme.fonts.contentFont,
              fontSize: currentTheme.fonts.contentSize,
              margin: 0,
            }}
          >
            {beforeContent}
          </p>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h2
            style={{
              color: currentTheme.colors.accentColor,
              fontFamily: currentTheme.fonts.titleFont,
              fontSize: '1.2rem',
              marginBottom: '12px',
            }}
          >
            {afterTitle}
          </h2>
          <p
            style={{
              color: currentTheme.colors.contentColor,
              fontFamily: currentTheme.fonts.contentFont,
              fontSize: currentTheme.fonts.contentSize,
              margin: 0,
            }}
          >
            {afterContent}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSlideTemplate; 