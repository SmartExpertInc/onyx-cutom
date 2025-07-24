// custom_extensions/frontend/src/components/templates/TwoColumnTemplate.tsx

import React from 'react';
import { TwoColumnProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

export const TwoColumnTemplate: React.FC<TwoColumnProps & { theme?: SlideTheme }> = ({
  title,
  leftTitle,
  leftContent,
  leftImageAlt,
  leftImagePrompt,
  rightTitle,
  rightContent,
  rightImageAlt,
  rightImagePrompt,
  columnRatio,
  theme
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);

  // AI prompt logic (like BigImageLeftTemplate)
  const leftDisplayPrompt = leftImagePrompt || leftImageAlt || "man sitting on a chair";
  const rightDisplayPrompt = rightImagePrompt || rightImageAlt || "man sitting on a chair";

  const placeholderStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: '320px',
    height: '200px',
    backgroundColor: '#e9ecef',
    border: '2px dashed #adb5bd',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    textAlign: 'center',
    color: '#6c757d',
    marginTop: '20px'
  };

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
          fontWeight: '700',
          fontFamily: currentTheme.fonts.titleFont,
          fontSize: currentTheme.fonts.titleSize,
          color: currentTheme.colors.titleColor,
        }}
      >
        {title}
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
            {leftTitle}
          </h2>
          <p
            style={{
              fontFamily: currentTheme.fonts.contentFont,
              fontSize: currentTheme.fonts.contentSize,
              color: currentTheme.colors.contentColor,
              margin: 0,
            }}
          >
            {leftContent}
          </p>
          {/* Left placeholder only */}
          <div style={placeholderStyles}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
              Image Placeholder
            </div>
            <div style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '12px' }}>
              AI Prompt: "{leftDisplayPrompt}"
            </div>
            <div style={{ fontSize: '12px', color: '#868e96' }}>
              320px × 200px
            </div>
          </div>
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
            {rightTitle}
          </h2>
          <p
            style={{
              fontFamily: currentTheme.fonts.contentFont,
              fontSize: currentTheme.fonts.contentSize,
              color: currentTheme.colors.contentColor,
              margin: 0,
            }}
          >
            {rightContent}
          </p>
          {/* Right placeholder only */}
          <div style={placeholderStyles}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
              Image Placeholder
            </div>
            <div style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '12px' }}>
              AI Prompt: "{rightDisplayPrompt}"
            </div>
            <div style={{ fontSize: '12px', color: '#868e96' }}>
              320px × 200px
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoColumnTemplate;