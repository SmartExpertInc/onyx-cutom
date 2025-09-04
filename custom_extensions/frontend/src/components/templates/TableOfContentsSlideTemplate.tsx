// custom_extensions/frontend/src/components/templates/TableOfContentsSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { TableOfContentsSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import PresentationImageUpload from '../PresentationImageUpload';

export const TableOfContentsSlideTemplate: React.FC<TableOfContentsSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Table of Contents',
  buttons = [
    { text: 'The Problem', link: '' },
    { text: 'Benefits', link: '' },
    { text: 'Best Practices', link: '' },
    { text: 'Methods', link: '' },
    { text: 'Achieving Success', link: '' },
    { text: 'The Future', link: '' }
  ],
  profileImagePath = '',
  profileImageAlt = 'Profile image',
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
  const [editingButtons, setEditingButtons] = useState<{ index: number } | null>(null);
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);
  
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentButtons, setCurrentButtons] = useState(buttons);
  const [currentCompanyLogoPath, setCurrentCompanyLogoPath] = useState('');

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#F8F8F8', // Light off-white background as per screenshot
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, buttons, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleButtonSave = (index: number, newText: string) => {
    const newButtons = [...currentButtons];
    newButtons[index] = { ...newButtons[index], text: newText };
    setCurrentButtons(newButtons);
    setEditingButtons(null);
    if (onUpdate) {
      onUpdate({ ...{ title, buttons, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, buttons: newButtons });
    }
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, buttons, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleCompanyLogoUploaded = (newLogoPath: string) => {
    setCurrentCompanyLogoPath(newLogoPath);
    if (onUpdate) {
      onUpdate({ ...{ title, buttons, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, companyLogoPath: newLogoPath });
    }
  };

  return (
    <div className="table-of-contents-slide-template inter-theme" style={slideStyles}>
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: '60px',
        left: '60px',
        fontSize: '48px',
        fontWeight: 'bold',
        color: '#000000', // Black text as per screenshot
        lineHeight: '1.1',
      }}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={currentTitle}
            onSave={handleTitleSave}
            onCancel={() => setEditingTitle(false)}
            className="toc-title-editor"
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#000000',
              lineHeight: '1.1',
              width: '100%',
              height: 'auto',
            }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingTitle(true)}
            style={{
              cursor: isEditable ? 'pointer' : 'default',
              userSelect: 'none'
            }}
          >
            {currentTitle}
          </div>
        )}
      </div>

      {/* Buttons Grid */}
      <div style={{
        position: 'absolute',
        top: '180px',
        left: '60px',
        width: '400px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: '20px',
      }}>
        {currentButtons.map((button, index) => (
          <div key={index} style={{
            backgroundColor: '#10B981', // Vibrant green color as per screenshot
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isEditable ? 'pointer' : 'default',
            minHeight: '60px',
          }}>
            {isEditable && editingButtons?.index === index ? (
              <ImprovedInlineEditor
                initialValue={button.text}
                onSave={(value) => handleButtonSave(index, value)}
                onCancel={() => setEditingButtons(null)}
                className="toc-button-editor"
                style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  color: '#FFFFFF',
                  width: '100%',
                  height: 'auto',
                  textAlign: 'center',
                }}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingButtons({ index })}
                style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  color: '#FFFFFF', // White text as per screenshot
                  textAlign: 'center',
                  userSelect: 'none'
                }}
              >
                {button.text}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Profile Image */}
      <div style={{
        position: 'absolute',
        top: '120px',
        right: '60px',
        width: '300px',
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Blue Background Rectangle */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '250px',
          backgroundColor: '#ADD8E6', // Light blue background as per screenshot
          borderRadius: '12px',
          zIndex: 1,
        }} />
        
        {/* Profile Image */}
        <div style={{
          position: 'relative',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: '#E5E7EB',
          zIndex: 2,
        }}>
          <ClickableImagePlaceholder
            imagePath={profileImagePath}
            onImageUploaded={handleProfileImageUploaded}
            size="LARGE"
            position="CENTER"
            description="Profile photo"
            isEditable={isEditable}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        </div>
      </div>

      {/* Logo Upload Modal */}
      {showLogoUploadModal && (
        <PresentationImageUpload
          isOpen={showLogoUploadModal}
          onClose={() => setShowLogoUploadModal(false)}
          onImageUploaded={(newLogoPath: string) => {
            handleCompanyLogoUploaded(newLogoPath);
            setShowLogoUploadModal(false);
          }}
          title="Upload Company Logo"
        />
      )}
    </div>
  );
};

export default TableOfContentsSlideTemplate;