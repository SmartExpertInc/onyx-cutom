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
  logoPath = '',
  logoAlt = 'Your Logo',
  backgroundColor,
  titleColor,
  contentColor,
  accentColor,
  isEditable = false,
  onUpdate,
  theme,
  voiceoverText,
  pageNumber = '30'
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingButtons, setEditingButtons] = useState<{ index: number } | null>(null);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentButtons, setCurrentButtons] = useState(buttons);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#FFFFFF',
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
      onUpdate({ profileImagePath: newImagePath });
    }
  };

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    if (onUpdate) {
      onUpdate({ pageNumber: newPageNumber });
    }
  };

  const handlePageNumberCancel = () => {
    setEditingPageNumber(false);
  };

  return (
    <div className="table-of-contents-slide-template inter-theme" style={slideStyles}>
      <style>{`
        .table-of-contents-slide-template *:not(.title-element) {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .table-of-contents-slide-template .title-element {
          font-family: "Lora", serif !important;
          font-weight: 500 !important;
        }
      `}</style>
      {/* Logo */}
      <div style={{ position: 'absolute', top: '20px', left: '30px' }}>
        {logoPath ? (
          <ClickableImagePlaceholder
            imagePath={logoPath}
            onImageUploaded={(p: string) => onUpdate && onUpdate({ logoPath: p })}
            size="SMALL"
            position="CENTER"
            description="Your Logo"
            isEditable={isEditable}
            style={{ height: '30px', maxWidth: '120px', objectFit: 'contain' }}
          />
        ) : (
          <div
            onClick={() => isEditable && setShowLogoUpload(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: isEditable ? 'pointer' : 'default'
            }}
          >
            <div style={{
              width: '30px',
              height: '30px',
              border: '2px solid #09090B',
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '12px', height: '2px', backgroundColor: '#09090B', position: 'absolute' }} />
              <div style={{ width: '2px', height: '12px', backgroundColor: '#09090B', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 400, color: '#09090B', fontFamily: currentTheme.fonts.contentFont }}>Your Logo</span>
          </div>
        )}
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: '160px',
        left: '60px',
        fontSize: '58px',
        fontWeight: 'bold',
        color: '#1C1B1A', // Black text as per screenshot
        lineHeight: '1.1',
      }}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={currentTitle}
            onSave={handleTitleSave}
            onCancel={() => setEditingTitle(false)}
            className="toc-title-editor title-element"
            style={{
              fontSize: '58px',
              fontWeight: 'bold',
              color: '#1C1B1A',
              lineHeight: '1.1',
              width: '100%',
              height: 'auto',
            }}
          />
        ) : (
          <div
            className="title-element"
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
        width: '530px',
        display: 'grid',
        gridTemplateColumns: '250px 250px',
        gap: '30px',
      }}>
        {currentButtons.map((button, index) => (
          <div key={index} style={{
            backgroundColor: '#0F58F9', // Blue
            borderRadius: '4px',
            padding: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isEditable ? 'pointer' : 'default',
          }}>
            {isEditable && editingButtons?.index === index ? (
              <ImprovedInlineEditor
                initialValue={button.text}
                onSave={(value) => handleButtonSave(index, value)}
                onCancel={() => setEditingButtons(null)}
                className="toc-button-editor"
                style={{
                  fontSize: '25px',
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
                  fontSize: '25px',
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

      {/* Profile Image Container */}
      <div style={{
        position: 'absolute',
        top: '90px',
        right: '60px',
        width: '445px',
        height: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #0F58F9 0%, #1023A1 100%)',
        overflow: 'hidden',
        borderRadius: '8px',
      }}>
        {/* Profile Image! */}
        <div style={{
          position: 'absolute',
          bottom: '-25px',
          zIndex: 2,
          height: '100%',
        }}>
          <ClickableImagePlaceholder
            imagePath={profileImagePath}
            onImageUploaded={handleProfileImageUploaded}
            size="LARGE"
            position="CENTER"
            description="Profile photo"
            isEditable={isEditable}
            fit="contain"
            style={{
              height: '100%',
            }}
          />
        </div>
      </div>

      {/* Page number with line */}
      <div style={{
        position: 'absolute',
        bottom: '15px',
        left: '0px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Small line */}
        <div style={{
          width: '20px',
          height: '1px',
          backgroundColor: 'rgba(9, 9, 11, 0.6)'
        }} />
        {/* Page number */}
        {isEditable && editingPageNumber ? (
          <ImprovedInlineEditor
            initialValue={currentPageNumber}
            onSave={handlePageNumberSave}
            onCancel={handlePageNumberCancel}
            className="page-number-editor"
            style={{
              color: 'rgba(9, 9, 11, 0.6)',
              fontSize: '17px',
              fontWeight: '300',
              fontFamily: currentTheme.fonts.contentFont,
              width: '30px',
              height: 'auto'
            }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingPageNumber(true)}
            style={{
              color: 'rgba(9, 9, 11, 0.6)',
              fontSize: '17px',
              fontWeight: '300',
              fontFamily: currentTheme.fonts.contentFont,
              cursor: isEditable ? 'pointer' : 'default',
              userSelect: 'none'
            }}
          >
            {currentPageNumber}
          </div>
        )}
      </div>

      {showLogoUpload && (
        <PresentationImageUpload
          isOpen={showLogoUpload}
          onClose={() => setShowLogoUpload(false)}
          onImageUploaded={(p: string) => { onUpdate && onUpdate({ logoPath: p }); setShowLogoUpload(false); }}
          title="Upload Company Logo"
        />
      )}
    </div>
  );
};

export default TableOfContentsSlideTemplate;