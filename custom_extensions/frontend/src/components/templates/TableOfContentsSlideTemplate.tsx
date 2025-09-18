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
    backgroundColor: '#FAF9F4', // Light off-white background as per screenshot
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
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
        fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
        color: '#1C1B1A', // Black text as per screenshot
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
              fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
              color: '#1C1B1A',
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
        top: '270px',
        left: '60px',
        width: '430px',
        display: 'grid',
        gridTemplateColumns: '215px 215px',
        gridTemplateRows: 'repeat(3, 70px)',
        gap: '40px',
      }}>
        {currentButtons.map((button, index) => (
          <div key={index} style={{
            backgroundColor: '#6CDC77', // Vibrant green color as per screenshot
            borderRadius: '15px',
            border: '1px solid gray',
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
                  fontSize: '17px',
                  fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
                  color: '#245D27',
                  width: '100%',
                  height: 'auto',
                  textAlign: 'center',
                }}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingButtons({ index })}
                style={{
                  fontSize: '17px',
                  fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
                  color: '#245D27', // White text as per screenshot
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
        width: '545px',
        height: '440px',
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
          height: '290px',
          backgroundColor: '#A7B3DD', // Light blue background as per screenshot
          borderRadius: '12px',
          border: '1px solid #000000',
          zIndex: 1,
        }} />
        
        {/* Profile Image! */}
        <div style={{
          position: 'absolute',
          bottom: '-24px',
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
              width: '536px',
              height: '551px',
              objectFit: 'cover',
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