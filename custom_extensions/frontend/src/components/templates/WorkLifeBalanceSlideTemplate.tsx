// custom_extensions/frontend/src/components/templates/WorkLifeBalanceSlideTemplate.tsx

import React, { useState } from 'react';
import { WorkLifeBalanceSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import PresentationImageUpload from '../PresentationImageUpload';

export const WorkLifeBalanceSlideTemplate: React.FC<WorkLifeBalanceSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Work-life balance',
  content = 'Maintaining a healthy work-life balance allows me to be more present and engaged both at work and in my personal life, resulting in increased productivity and overall satisfaction.',
  imagePath = '',
  imageAlt = 'Work-life balance image',
  logoPath = '',
  logoAlt = 'Company logo',
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
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#4D4828',
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, content, imagePath, imageAlt, logoPath, logoAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleContentSave = (newContent: string) => {
    setCurrentContent(newContent);
    setEditingContent(false);
    if (onUpdate) {
      onUpdate({ ...{ title, content, imagePath, imageAlt, logoPath, logoAlt, backgroundColor, titleColor, contentColor, accentColor }, content: newContent });
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

  const handleImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, content, imagePath, imageAlt, logoPath, logoAlt, backgroundColor, titleColor, contentColor, accentColor }, imagePath: newImagePath });
    }
  };

  const handleLogoUploaded = (newLogoPath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, content, imagePath, imageAlt, logoPath, logoAlt, backgroundColor, titleColor, contentColor, accentColor }, logoPath: newLogoPath });
    }
  };

  return (
    <div className="work-life-balance-slide-template inter-theme" style={slideStyles}>
      {/* Left Content Area */}
      <div style={{
        width: '60%',
        height: '100%',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Logo placeholder */}
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '60px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: themeTitle
        }}>
          {logoPath ? (
            // Show uploaded logo image
            <ClickableImagePlaceholder
              imagePath={logoPath}
              onImageUploaded={handleLogoUploaded}
              size="SMALL"
              position="CENTER"
              description="Company logo"
              isEditable={isEditable}
              style={{
                height: '30px',
                maxWidth: '120px',
                objectFit: 'contain'
              }}
            />
          ) : (
            // Show default logo design with clickable area
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: isEditable ? 'pointer' : 'default'
            }}
            onClick={() => isEditable && setShowLogoUploadModal(true)}
            >
              <div style={{
                width: '30px',
                height: '30px',
                border: `2px solid ${themeContent}`,
                borderRadius: '50%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '12px',
                  height: '2px',
                  backgroundColor: themeContent,
                  position: 'absolute'
                }} />
                <div style={{
                  width: '2px',
                  height: '12px',
                  backgroundColor: themeContent,
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '300', color: themeContent }}>Your Logo</span>
            </div>
          )}
        </div>

        {/* Title - Centered vertically */}
        <div style={{ 
          position: 'absolute',
          top: '40%',
          left: '60px',
          transform: 'translateY(-50%)',
          marginBottom: '40px'
        }}>
          {isEditable && editingTitle ? (
            <ImprovedInlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              className="work-life-balance-title-editor"
              style={{
                marginTop: '162px',
                fontSize: '58px',
                color: '#E3DEBE',
                lineHeight: '1.1',
                fontFamily: currentTheme.fonts.titleFont,
                position: 'relative'
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingTitle(true)}
              style={{
                marginTop: '162px',
                fontSize: '58px',
                color: '#E3DEBE',
                lineHeight: '1.1',
                cursor: isEditable ? 'pointer' : 'default',
                fontFamily: currentTheme.fonts.titleFont,
                userSelect: 'none',
                position: 'relative'
              }}
            >
              {currentTitle}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ 
          position: 'absolute',
          top: '55%',
          left: '60px',
        }}>
          {isEditable && editingContent ? (
            <ImprovedInlineEditor
              initialValue={currentContent}
              onSave={handleContentSave}
              onCancel={handleContentCancel}
              multiline={true}
              className="work-life-balance-content-editor"
              style={{
                marginTop: '31px',
                marginLeft: '6px',
                width: '558px',
                fontSize: '27px',
                color: '#D6D2B2',
                lineHeight: '1.6',
                fontFamily: currentTheme.fonts.contentFont,
                position: 'relative'
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingContent(true)}
              style={{
                marginTop: '31px',
                marginLeft: '6px',
                width: '558px',
                fontSize: '27px',
                color: '#D6D2B2',
                lineHeight: '1.6',
                cursor: isEditable ? 'pointer' : 'default',
                fontFamily: currentTheme.fonts.contentFont,
                userSelect: 'none',
                position: 'relative'
              }}
            >
              {currentContent}
            </div>
          )}
        </div>
      </div>

      {/* Right Image Area with Arch */}
      <div style={{
        width: '40%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Arch background */}
        <div style={{
          position: 'absolute',
          right: '-18px',
          top: '11%',
          transform: 'rotate(90deg)',
          width: '125%',
          height: '77%',
          backgroundColor: '#9E9E58',
          borderRadius: '50% 0 0 50%',
          zIndex: 1
        }} />

        {/* Image */}
        <div style={{
          position: 'absolute',
          left: '0px',
          bottom: '-27px',
          zIndex: 2,
          width: '80%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ClickableImagePlaceholder
            imagePath={imagePath}
            onImageUploaded={handleImageUploaded}
            position="CENTER"
            description="Work-life balance image"
            isEditable={isEditable}
            style={{
              height: '565px',
              borderRadius: '10px',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>

      {/* Logo Upload Modal */}
      {showLogoUploadModal && (
        <PresentationImageUpload
          isOpen={showLogoUploadModal}
          onClose={() => setShowLogoUploadModal(false)}
          onImageUploaded={(newLogoPath) => {
            handleLogoUploaded(newLogoPath);
            setShowLogoUploadModal(false);
          }}
          title="Upload Company Logo"
        />
      )}
    </div>
  );
};

export default WorkLifeBalanceSlideTemplate; 