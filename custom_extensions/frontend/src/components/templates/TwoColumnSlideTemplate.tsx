// custom_extensions/frontend/src/components/templates/TwoColumnSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { TwoColumnSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import YourLogo from '../YourLogo';

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
  voiceoverText,
  logoPath = '',
  pageNumber = '05'
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentContent, setCurrentContent] = useState(content);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);

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
      onUpdate({ ...{ title, content, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor, logoPath, pageNumber }, title: newTitle });
    }
  };

  const handleContentSave = (newContent: string) => {
    setCurrentContent(newContent);
    setEditingContent(false);
    if (onUpdate) {
      onUpdate({ ...{ title, content, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor, logoPath, pageNumber }, content: newContent });
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
      onUpdate({ ...{ title, content, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor, logoPath, pageNumber }, profileImagePath: newImagePath });
    }
  };

  const handleRightImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, content, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor, logoPath, pageNumber }, rightImagePath: newImagePath });
    }
  };

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    if (onUpdate) {
      onUpdate({ ...{ title, content, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor, logoPath, pageNumber }, pageNumber: newPageNumber });
    }
  };

  const handlePageNumberCancel = () => {
    setCurrentPageNumber(pageNumber);
    setEditingPageNumber(false);
  };

  const handleLogoUploaded = (newLogoPath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, content, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor, logoPath, pageNumber }, logoPath: newLogoPath });
    }
  };

  return (
    <div className="two-column-slide-template inter-theme" style={slideStyles}>
      {/* Logo in top-left corner */}
      <div style={{
        position: 'absolute',
        top: '30px',
        left: '30px',
        zIndex: 20
      }}>
        <YourLogo
          logoPath={logoPath}
          onLogoUploaded={handleLogoUploaded}
          isEditable={isEditable}
          color="#000000"
          text="Your Logo"
        />
      </div>

      {/* Left section with avatar and text */}
      <div style={{
        width: '50%',
        height: '100%',
        backgroundColor: '#E0E7FF',
        padding: '60px',
        paddingBottom: '110px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'end',
        justifyContent: 'space-between'
      }}>
        {/* Profile image */}
        <div style={{
          width: '135px',
          height: '135px',
          borderRadius: '50%',
          position: 'absolute',
          backgroundColor: '#ffffff',
          top: '40px',
          right: '40px',
          overflow: 'hidden'
        }}>
          <ClickableImagePlaceholder
            imagePath={profileImagePath}
            onImageUploaded={handleProfileImageUploaded}
            size="LARGE"
            position="CENTER"
            description="Profile photo"
            isEditable={isEditable}
            style={{
              width: '88%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              overflow: 'hidden',
              position: 'relative',
              bottom: '-15px',
            }}
          />
        </div>

        {/* Title */}


        {/* Content */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>

          {/* Content text */}
          <div style={{
            fontSize: '15px',
            color: '#09090B',
            lineHeight: '1.6',
            position: 'relative',
            bottom: '-185px',
            width: '100%'
          }}>
            {isEditable && editingContent ? (
              <ImprovedInlineEditor
                initialValue={currentContent}
                onSave={handleContentSave}
                onCancel={handleContentCancel}
                multiline={true}
                className="two-column-content-editor"
                style={{
                  fontSize: '15px',
                  color: '#09090B',
                  lineHeight: '1.6',
                  width: '100%',
                  minHeight: 'auto'
                }}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingContent(true)}
                style={{
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none',
                  fontSize: '15px',
                  color: '#09090B',
                  lineHeight: '1.6',
                  width: '100%'
                }}
              >
                {currentContent}
              </div>
            )}
          </div>
        </div>

        {/* Page number with line */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '0px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 20
        }}>
          {/* Small line */}
          <div style={{
            width: '20px',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)'
          }} />
          {/* Page number */}
          {isEditable && editingPageNumber ? (
            <ImprovedInlineEditor
              initialValue={currentPageNumber}
              onSave={handlePageNumberSave}
              onCancel={handlePageNumberCancel}
              className="page-number-editor"
              style={{
                color: '#ffffff',
                fontSize: '17px',
                fontWeight: '300',
                width: '30px',
                height: 'auto'
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingPageNumber(true)}
              style={{
                color: '#ffffff',
                fontSize: '17px',
                fontWeight: '300',
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              {currentPageNumber}
            </div>
          )}
        </div>
      </div>

      {/* Right section with image */}
      <div style={{
        width: '50%',
        height: '100%',
        position: 'relative'
      }}>
        <ClickableImagePlaceholder
          imagePath={rightImagePath}
          onImageUploaded={handleRightImageUploaded}
          size="LARGE"
          position="CENTER"
          description="Right side image"
          isEditable={isEditable}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '0px',
            objectFit: 'contain'
          }}
        />
      </div>
    </div>
  );
};

export default TwoColumnSlideTemplate; 