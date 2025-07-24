// custom_extensions/frontend/src/components/templates/TwoColumnTemplate.tsx

import React from 'react';
import { TwoColumnProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

export const TwoColumnTemplate: React.FC<TwoColumnProps & { theme?: SlideTheme }> = (props) => {
  const currentTheme = props.theme || getSlideTheme(DEFAULT_SLIDE_THEME);

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
        {props.title}
      </h1>
      <div
        style={{
          display: 'flex',
          gap: '40px',
        }}
      >
        <div style={{ flex: 1 }}>
          <h2
            style={{
              fontFamily: currentTheme.fonts.titleFont,
              fontSize: '1.3rem',
              color: currentTheme.colors.titleColor,
              marginBottom: '12px',
            }}
          >
            {props.leftTitle}
          </h2>
          <p
            style={{
              fontFamily: currentTheme.fonts.contentFont,
              fontSize: currentTheme.fonts.contentSize,
              color: currentTheme.colors.contentColor,
              margin: 0,
            }}
          >
            {props.leftContent}
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <h2
            style={{
              fontFamily: currentTheme.fonts.titleFont,
              fontSize: '1.3rem',
              color: currentTheme.colors.titleColor,
              marginBottom: '12px',
            }}
          >
            {props.rightTitle}
          </h2>
          <p
            style={{
              fontFamily: currentTheme.fonts.contentFont,
              fontSize: currentTheme.fonts.contentSize,
              color: currentTheme.colors.contentColor,
              margin: 0,
            }}
          >
            {props.rightContent}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwoColumnTemplate; 