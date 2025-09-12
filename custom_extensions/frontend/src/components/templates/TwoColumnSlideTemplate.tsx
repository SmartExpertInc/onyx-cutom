// custom_extensions/frontend/src/components/templates/TwoColumnSlideTemplate.tsx

import React, { useState } from 'react';
import { TwoColumnSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background:'transparent',
    border:'none',
    outline:'none',
    padding:0,
    margin:0
  });

export const TwoColumnSlideTemplate: React.FC<TwoColumnSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'We expect you to meet or exceed these metrics',
  content = 'We expect you to meet or exceed these metrics, and we will provide you with regular feedback and performance evaluations to help you track your progress and identify areas for improvement. We believe that by embodying these qualities and achieving your performance metrics, you will contribute to the success of our company and your own personal growth and development.',
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  rightImagePath = '',
  rightImageAlt = 'Right side image',
  backgroundColor,
  titleColor,
  contentColor,
  accentColor,
  isEditable = false,
  onUpdate,
  theme,
  voiceoverText
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentContent, setCurrentContent] = useState(content);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '600px',
    backgroundColor: themeBg,
    display: 'flex',
    flexDirection: 'row-reverse',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, content, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleContentSave = (newContent: string) => {
    setCurrentContent(newContent);
    setEditingContent(false);
    if (onUpdate) {
      onUpdate({ ...{ title, content, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor }, content: newContent });
    }
  };

  const handleTitleCancel = () => {
    setCurrentTitle(title);
    setEditingTitle(false);
  };

  const handleContentCancel = () => {
    setCurrentContent(content);
    setEditingContent(false);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, content, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleRightImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, content, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor }, rightImagePath: newImagePath });
    }
  };

  return (
    <div className="two-column-slide-template inter-theme" style={slideStyles}>
      {/* Left section with avatar and text */}
      <div style={inline({
        width: '50%',
        height: '100%',
        backgroundColor: '#EDEDED',
        padding: '60px',
        paddingBottom: '110px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'end',
        justifyContent: 'space-between'
      })}>
        {/* Profile image */}
        <div style={inline({
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          position: 'absolute',
          backgroundColor: '#000',
          top: '40px',
          right: '8px',
          overflow: 'hidden'
        })}>
          <ClickableImagePlaceholder
            imagePath={profileImagePath}
            onImageUploaded={handleProfileImageUploaded}
            size="LARGE"
            position="CENTER"
            description="Profile photo"
            isEditable={isEditable}
            style={inline({
              width: '94%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              overflow: 'hidden',
              position: 'relative',
              bottom: '-15px',
            })}
          />
        </div>

        {/* Title */}

        {/* Content */}
        <div style={inline({
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        })}>

          {/* Content text */}
          <div style={inline({
            fontSize: '13px',
            color: '#7A7A7A',
            lineHeight: '1.6',
            position: 'relative',
            bottom: '-205px',
            textAlign: 'right',
            width: '100%'
          })}>
            {isEditable && editingContent ? (
              <ImprovedInlineEditor
                initialValue={currentContent}
                onSave={handleContentSave}
                onCancel={handleContentCancel}
                multiline={true}
                className="two-column-content-editor"
                style={inline({
                  fontSize: '13px',
                  color: '#7A7A7A',
                  lineHeight: '1.6',
                  width: '100%',
                  textAlign: 'right',
                  minHeight: 'auto'
                })}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingContent(true)}
                style={inline({
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none',
                  fontSize: '13px',
                  color: '#7A7A7A',
                  lineHeight: '1.6',
                  textAlign: 'right',
                  width: '100%'
                })}
              >
                {currentContent}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right section with image */}
      <div style={inline({
        width: '85%',
        height: '100%',
        position: 'relative'
      })}>
        <ClickableImagePlaceholder
          imagePath={rightImagePath}
          onImageUploaded={handleRightImageUploaded}
          size="LARGE"
          position="CENTER"
          description="Right side image"
          isEditable={isEditable}
          style={inline({
            width: '100%',
            height: '100%',
            borderRadius: '0px',
            objectFit: 'contain'
          })}
        />
      </div>
    </div>
  );
};

export default TwoColumnSlideTemplate; 