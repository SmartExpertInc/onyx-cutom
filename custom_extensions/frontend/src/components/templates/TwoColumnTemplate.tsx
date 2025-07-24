// custom_extensions/frontend/src/components/templates/TwoColumnTemplate.tsx

import React from 'react';
import { TwoColumnProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

export const TwoColumnTemplate: React.FC<TwoColumnProps & { theme?: SlideTheme }> = (props) => {
  const currentTheme = props.theme || getSlideTheme(DEFAULT_SLIDE_THEME);

  // Use the same logic as BigImageLeftTemplate for prompts
  const leftDisplayPrompt = props.leftImagePrompt || props.leftImageAlt || "man sitting on a chair";
  const rightDisplayPrompt = props.rightImagePrompt || props.rightImageAlt || "man sitting on a chair";

  const imageStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: '320px',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginTop: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  };

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
    marginTop: '20px',
    padding: '20px',
    textAlign: 'center',
    color: '#6c757d'
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
          {/* Left image */}
          {props.leftImageUrl && props.leftImageUrl !== 'https://via.placeholder.com/600x400?text=Your+Image' ? (
            <img
              src={props.leftImageUrl}
              alt={props.leftImageAlt || props.leftTitle}
              style={imageStyles}
            />
          ) : (
            <div style={placeholderStyles}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🖼️</div>
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
          )}
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
          {/* Right image */}
          {props.rightImageUrl && props.rightImageUrl !== 'https://via.placeholder.com/600x400?text=Your+Image' ? (
            <img
              src={props.rightImageUrl}
              alt={props.rightImageAlt || props.rightTitle}
              style={imageStyles}
            />
          ) : (
            <div style={placeholderStyles}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🖼️</div>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoColumnTemplate;