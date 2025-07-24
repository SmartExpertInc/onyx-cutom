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
          {props.leftImageUrl ? (
            <img
              src={props.leftImageUrl}
              alt={props.leftImageAlt || props.leftTitle}
              style={{
                width: '100%',
                maxWidth: '320px',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginTop: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              maxWidth: '320px',
              height: '200px',
              backgroundColor: '#e9ecef',
              border: '2px dashed #adb5bd',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '20px',
              color: '#6c757d',
              flexDirection: 'column',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
              <div>Image Placeholder</div>
              <div style={{ fontStyle: 'italic', fontSize: '12px', marginTop: '4px' }}>
                AI Prompt: "{props.leftImagePrompt || props.leftImageAlt || props.leftTitle}"
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
          {props.rightImageUrl ? (
            <img
              src={props.rightImageUrl}
              alt={props.rightImageAlt || props.rightTitle}
              style={{
                width: '100%',
                maxWidth: '320px',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginTop: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              maxWidth: '320px',
              height: '200px',
              backgroundColor: '#e9ecef',
              border: '2px dashed #adb5bd',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '20px',
              color: '#6c757d',
              flexDirection: 'column',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
              <div>Image Placeholder</div>
              <div style={{ fontStyle: 'italic', fontSize: '12px', marginTop: '4px' }}>
                AI Prompt: "{props.rightImagePrompt || props.rightImageAlt || props.rightTitle}"
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoColumnTemplate; 