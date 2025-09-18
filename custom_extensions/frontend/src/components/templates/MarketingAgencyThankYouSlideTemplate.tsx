// custom_extensions/frontend/src/components/templates/MarketingAgencyThankYouSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { MarketingAgencyThankYouSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import PresentationImageUpload from '../PresentationImageUpload';

export const MarketingAgencyThankYouSlideTemplate: React.FC<MarketingAgencyThankYouSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  headerTitle = 'Introduction to Our\nMarketing Agency',
  logoText = 'Your Logo',
  mainTitle = 'Thank you!',
  bodyText = 'We look forward to helping\nyou achieve remarkable\nresults. Contact us today, and\nlet\'s make success happen!',
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
  const [editingHeaderTitle, setEditingHeaderTitle] = useState(false);
  const [editingLogoText, setEditingLogoText] = useState(false);
  const [editingMainTitle, setEditingMainTitle] = useState(false);
  const [editingBodyText, setEditingBodyText] = useState(false);
  const [editingIntroText, setEditingIntroText] = useState(false);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [editingYourLogoText, setEditingYourLogoText] = useState(false);
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);
  
  const [currentHeaderTitle, setCurrentHeaderTitle] = useState(headerTitle);
  const [currentLogoText, setCurrentLogoText] = useState(logoText);
  const [currentMainTitle, setCurrentMainTitle] = useState(mainTitle);
  const [currentBodyText, setCurrentBodyText] = useState(bodyText);
  const [currentIntroText, setCurrentIntroText] = useState('Introduction to Our Marketing Agency');
  const [currentPageNumber, setCurrentPageNumber] = useState('03');
  const [currentYourLogoText, setCurrentYourLogoText] = useState('Your Logo');
  const [currentCompanyLogoPath, setCurrentCompanyLogoPath] = useState('');

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#E0E7FF', // Light beige background as per screenshot
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
    padding: '40px 60px',
  };

  const handleHeaderTitleSave = (newHeaderTitle: string) => {
    setCurrentHeaderTitle(newHeaderTitle);
    setEditingHeaderTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ headerTitle, logoText, mainTitle, bodyText, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, headerTitle: newHeaderTitle });
    }
  };

  const handleLogoTextSave = (newLogoText: string) => {
    setCurrentLogoText(newLogoText);
    setEditingLogoText(false);
    if (onUpdate) {
      onUpdate({ ...{ headerTitle, logoText, mainTitle, bodyText, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, logoText: newLogoText });
    }
  };

  const handleMainTitleSave = (newMainTitle: string) => {
    setCurrentMainTitle(newMainTitle);
    setEditingMainTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ headerTitle, logoText, mainTitle, bodyText, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, mainTitle: newMainTitle });
    }
  };

  const handleBodyTextSave = (newBodyText: string) => {
    setCurrentBodyText(newBodyText);
    setEditingBodyText(false);
    if (onUpdate) {
      onUpdate({ ...{ headerTitle, logoText, mainTitle, bodyText, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, bodyText: newBodyText });
    }
  };

  const handleIntroTextSave = (newIntroText: string) => {
    setCurrentIntroText(newIntroText);
    setEditingIntroText(false);
    if (onUpdate) {
      onUpdate({ ...{ headerTitle, logoText, mainTitle, bodyText, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, introText: newIntroText });
    }
  };

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    if (onUpdate) {
      onUpdate({ ...{ headerTitle, logoText, mainTitle, bodyText, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, pageNumber: newPageNumber });
    }
  };

  const handleYourLogoTextSave = (newYourLogoText: string) => {
    setCurrentYourLogoText(newYourLogoText);
    setEditingYourLogoText(false);
    if (onUpdate) {
      onUpdate({ ...{ headerTitle, logoText, mainTitle, bodyText, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, yourLogoText: newYourLogoText });
    }
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ headerTitle, logoText, mainTitle, bodyText, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleCompanyLogoUploaded = (newLogoPath: string) => {
    setCurrentCompanyLogoPath(newLogoPath);
    if (onUpdate) {
      onUpdate({ ...{ headerTitle, logoText, mainTitle, bodyText, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, companyLogoPath: newLogoPath });
    }
  };

  return (
    <div className="marketing-agency-thank-you-slide-template" style={slideStyles}>
      {/* Logo in top-right corner */}
      <div style={{
        position: 'absolute',
        top: '30px',
        left: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        {currentCompanyLogoPath ? (
          // Show uploaded logo image
          <ClickableImagePlaceholder
            imagePath={currentCompanyLogoPath}
            onImageUploaded={handleCompanyLogoUploaded}
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
              border: '2px solid #000000',
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '12px',
                height: '2px',
                backgroundColor: '#000000',
                position: 'absolute'
              }} />
              <div style={{
                width: '2px',
                height: '12px',
                backgroundColor: '#000000',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }} />
            </div>
            {isEditable && editingYourLogoText ? (
              <ImprovedInlineEditor
                initialValue={currentYourLogoText}
                onSave={handleYourLogoTextSave}
                onCancel={() => setEditingYourLogoText(false)}
                className="your-logo-text-editor"
                style={{
                  fontSize: '14px',
                  fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
                  color: '#000000',
                  width: '80px',
                  height: 'auto',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none'
                }}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingYourLogoText(true)}
                style={{
                  fontSize: '14px',
                  fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
                  color: '#000000',
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none'
                }}
              >
                {currentYourLogoText}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Introduction Text */}
      <div style={{
        position: 'absolute',
        top: '135px',
        right: '237px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: '1px solid #09090B',
        padding: '7px 16px',
        borderRadius: '20px',
      }}>
        {/* Small blue dot */}
        <div style={{
          width: '8px',
          height: '8px',
          backgroundColor: 'blue',
          borderRadius: '50%'
        }} />
        {/* Introduction text */}
        <div style={{
          fontSize: '16px',
          fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
          color: '#09090B',
          borderRadius: '20px',
        }}>
          {isEditable && editingIntroText ? (
            <ImprovedInlineEditor
              initialValue={currentIntroText}
              onSave={handleIntroTextSave}
              onCancel={() => setEditingIntroText(false)}
              className="intro-text-editor"
              style={{
                fontSize: '16px',
                fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
                color: '#374151',
                width: '100%',
                height: 'auto',
                background: 'transparent',
                border: 'none',
                outline: 'none'
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingIntroText(true)}
              style={{
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              {currentIntroText}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        position: 'absolute',
        top: '120px',
        left: '60px',
        right: '60px',
        bottom: '10px',
        display: 'flex',
        gap: '40px',
      }}>
        {/* Left Section - Orange Background with Profile Image */}
        <div style={{
          width: '480px',
          height: '460px',
          background: 'linear-gradient(90deg, #0F58F9 0%, #1023A1 100%)', // Vibrant orange background as per screenshot
          borderRadius: '20px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <ClickableImagePlaceholder
            imagePath={profileImagePath}
            onImageUploaded={handleProfileImageUploaded}
            size="LARGE"
            position="CENTER"
            description="Profile photo"
            isEditable={isEditable}
            style={{
              position: 'relative',
              bottom: '-20px',
              height: '460px',
              objectFit: 'cover'
            }}
          />
        </div>

        {/* Right Section - Text Content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingTop: '155px',
          paddingLeft: '20px',
        }}>
          {/* Main Title */}
          <div style={{
            fontSize: '48px',
            fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
            color: '#000', // Dark gray color as per screenshot
            marginBottom: '30px',
            lineHeight: '1.1',
          }}>
            {isEditable && editingMainTitle ? (
              <ImprovedInlineEditor
                initialValue={currentMainTitle}
                onSave={handleMainTitleSave}
                onCancel={() => setEditingMainTitle(false)}
                className="main-title-editor"
                style={{
                  fontSize: '48px',
                  fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
                  color: '#000',
                  lineHeight: '1.1',
                  width: '100%',
                  height: 'auto',
                }}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingMainTitle(true)}
                style={{
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none'
                }}
              >
                {currentMainTitle}
              </div>
            )}
          </div>

          {/* Body Text */}
          <div style={{
            fontSize: '23px',
            color: '#09090B', // Dark gray color as per screenshot
            lineHeight: '1.4',
            width: '415px',
          }}>
            {isEditable && editingBodyText ? (
              <ImprovedInlineEditor
                initialValue={currentBodyText}
                onSave={handleBodyTextSave}
                onCancel={() => setEditingBodyText(false)}
                className="body-text-editor"
                multiline={true}
                style={{
                  fontSize: '23px',
                  color: '#09090B',
                  lineHeight: '1.4',
                  width: '100%',
                  height: 'auto',
                }}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingBodyText(true)}
                style={{
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none',
                }}
              >
                {currentBodyText}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page number with line */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Small line */}
        <div style={{
          width: '20px',
          height: '1px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }} />
        {/* Page number */}
        {isEditable && editingPageNumber ? (
          <ImprovedInlineEditor
            initialValue={currentPageNumber}
            onSave={handlePageNumberSave}
            onCancel={() => setEditingPageNumber(false)}
            className="page-number-editor"
            style={{
              color: '#000000',
              fontSize: '17px',
              fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
              width: '30px',
              height: 'auto',
              background: 'transparent',
              border: 'none',
              outline: 'none'
            }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingPageNumber(true)}
            style={{
              color: '#000000',
              fontSize: '17px',
              fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
              cursor: isEditable ? 'pointer' : 'default',
              userSelect: 'none'
            }}
          >
            {currentPageNumber}
          </div>
        )}
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

export default MarketingAgencyThankYouSlideTemplate;