// custom_extensions/frontend/src/components/templates/TwoColumnTemplate.tsx

import React from 'react';
import { TwoColumnProps } from '@/types/slideTemplates';
import { SlideTheme, getSafeSlideTheme } from '@/types/slideThemes';
import SimpleInlineEditor from '../SimpleInlineEditor';

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
  theme,
  onUpdate
}) => {
  const currentTheme = theme || getSafeSlideTheme();

  const handleTitleChange = (newTitle: string) => {
    if (onUpdate) { onUpdate({ title: newTitle }); }
  };

  const handleLeftTitleChange = (newLeftTitle: string) => {
    if (onUpdate) { onUpdate({ leftTitle: newLeftTitle }); }
  };

  const handleLeftContentChange = (newLeftContent: string) => {
    if (onUpdate) { onUpdate({ leftContent: newLeftContent }); }
  };

  const handleRightTitleChange = (newRightTitle: string) => {
    if (onUpdate) { onUpdate({ rightTitle: newRightTitle }); }
  };

  const handleRightContentChange = (newRightContent: string) => {
    if (onUpdate) { onUpdate({ rightContent: newRightContent }); }
  };

  // AI prompt logic (like BigImageLeftTemplate)
  const leftDisplayPrompt = leftImagePrompt || leftImageAlt || "man sitting on a chair";
  const rightDisplayPrompt = rightImagePrompt || rightImageAlt || "man sitting on a chair";

  const placeholderStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: '320px',
    maxHeight: '200px',
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
    marginBottom: '24px'
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
          textAlign: 'left',
          marginBottom: '40px',
          fontWeight: '700',
          fontFamily: currentTheme.fonts.titleFont,
          fontSize: currentTheme.fonts.titleSize,
          color: currentTheme.colors.titleColor,
        }}
      >
        <SimpleInlineEditor
          value={title || ''}
          onSave={handleTitleChange}
          placeholder="Enter slide title..."
          maxLength={100}
          className="two-column-title-editable"
        />
      </h1>
      <div
        style={{
          display: 'flex',
          gap: '40px',
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Placeholder first */}
          <div style={placeholderStyles}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
              Image Placeholder
            </div>
            <div style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '12px' }}>
              AI Prompt: "{leftDisplayPrompt}"
            </div>
            <div style={{ fontSize: '12px', color: '#868e96' }}>
              320px × 320px
            </div>
          </div>
          {/* Mini title */}
          <h2
            style={{
              fontFamily: currentTheme.fonts.titleFont,
              fontSize: '27px',
              color: currentTheme.colors.titleColor,
              margin: '16px 0 16px 0',
              alignSelf: 'flex-start'
            }}
          >
            <SimpleInlineEditor
              value={leftTitle || ''}
              onSave={handleLeftTitleChange}
              placeholder="Enter left column title..."
              maxLength={80}
              className="two-column-left-title-editable"
            />
          </h2>
          {/* Main text */}
          <div
            style={{
              fontFamily: currentTheme.fonts.contentFont,
              fontSize: currentTheme.fonts.contentSize,
              color: currentTheme.colors.contentColor,
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}
          >
            <SimpleInlineEditor
              value={leftContent || ''}
              onSave={handleLeftContentChange}
              multiline={true}
              placeholder="Enter left column content..."
              maxLength={500}
              rows={6}
              className="two-column-left-content-editable"
            />
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Placeholder first */}
          <div style={placeholderStyles}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
              Image Placeholder
            </div>
            <div style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '12px' }}>
              AI Prompt: "{rightDisplayPrompt}"
            </div>
            <div style={{ fontSize: '12px', color: '#868e96' }}>
              320px × 320px
            </div>
          </div>
          {/* Mini title */}
          <h2
            style={{
              fontFamily: currentTheme.fonts.titleFont,
              fontSize: '27px',
              color: currentTheme.colors.titleColor,
              margin: '16px 0 16px 0',
              alignSelf: 'flex-start'
            }}
          >
            <SimpleInlineEditor
              value={rightTitle || ''}
              onSave={handleRightTitleChange}
              placeholder="Enter right column title..."
              maxLength={80}
              className="two-column-right-title-editable"
            />
          </h2>
          {/* Main text */}
          <div
            style={{
              fontFamily: currentTheme.fonts.contentFont,
              fontSize: currentTheme.fonts.contentSize,
              color: currentTheme.colors.contentColor,
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}
          >
            <SimpleInlineEditor
              value={rightContent || ''}
              onSave={handleRightContentChange}
              multiline={true}
              placeholder="Enter right column content..."
              maxLength={500}
              rows={6}
              className="two-column-right-content-editable"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoColumnTemplate;