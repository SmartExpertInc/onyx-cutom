// custom_extensions/frontend/src/components/templates/MarketingAgencyThankYouSlideTemplate.tsx

import React, { useState } from 'react';
import { MarketingAgencyThankYouSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import PresentationImageUpload from '../PresentationImageUpload';

  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background:'transparent',
    border:'none',
    outline:'none',
    padding:0,
    margin:0
  });

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
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);
  
  const [currentHeaderTitle, setCurrentHeaderTitle] = useState(headerTitle);
  const [currentLogoText, setCurrentLogoText] = useState(logoText);
  const [currentMainTitle, setCurrentMainTitle] = useState(mainTitle);
  const [currentBodyText, setCurrentBodyText] = useState(bodyText);
  const [currentCompanyLogoPath, setCurrentCompanyLogoPath] = useState('');

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#F8F7EE', // Light beige background as per screenshot
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
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
    <div className="marketing-agency-thank-you-slide-template inter-theme" style={slideStyles}>
      {/* Header Section */}
      <div style={inline({
        position: 'absolute',
        top: '40px',
        left: '60px',
        right: '60px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      })}>
        {/* Header Title */}
        <div style={inline({
          fontSize: '24px',
          fontWeight: '500',
          color: '#4C5953', // Dark gray color as per screenshot
          lineHeight: '1.2',
          maxWidth: '400px',
        })}>
          {isEditable && editingHeaderTitle ? (
            <ImprovedInlineEditor
              initialValue={currentHeaderTitle}
              onSave={handleHeaderTitleSave}
              onCancel={() => setEditingHeaderTitle(false)}
              className="header-title-editor"
              multiline={true}
              style={inline({
                fontSize: '24px',
                fontWeight: '500',
                color: '#4A4A4A',
                lineHeight: '1.2',
                width: '100%',
                height: 'auto',
              })}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingHeaderTitle(true)}
              style={inline({
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none',
                whiteSpace: 'pre-line'
              })}
            >
              {currentHeaderTitle}
            </div>
          )}
        </div>

        {/* Logo Placeholder */}
        <div style={inline({
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        })}>
          {currentCompanyLogoPath ? (
            // Show uploaded logo image
            <ClickableImagePlaceholder
              imagePath={currentCompanyLogoPath}
              onImageUploaded={handleCompanyLogoUploaded}
              size="SMALL"
              position="CENTER"
              description="Company logo"
              isEditable={isEditable}
              style={inline({
                height: '30px',
                maxWidth: '120px',
                objectFit: 'contain'
              })}
            />
          ) : (
            // Show default logo design with clickable area
            <div style={inline({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: isEditable ? 'pointer' : 'default'
            })}
            onClick={() => isEditable && setShowLogoUploadModal(true)}
            >
              <div style={inline({
                width: '30px',
                height: '30px',
                border: '2px solid #888888',
                borderRadius: '50%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              })}>
                <div style={inline({
                  width: '12px',
                  height: '2px',
                  backgroundColor: '#888888',
                  position: 'absolute'
                })} />
                <div style={inline({
                  width: '2px',
                  height: '12px',
                  backgroundColor: '#888888',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                })} />
              </div>
              <div style={inline({ fontSize: '14px', fontWeight: '300', color: '#888888' })}>Your Logo</div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={inline({
        position: 'absolute',
        top: '120px',
        left: '60px',
        right: '60px',
        bottom: '40px',
        display: 'flex',
        gap: '40px',
      })}>
        {/* Left Section - Orange Background with Profile Image */}
        <div style={inline({
          width: '480px',
          backgroundColor: '#EC672C', // Vibrant orange background as per screenshot
          borderRadius: '20px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        })}>
          <ClickableImagePlaceholder
            imagePath={profileImagePath}
            onImageUploaded={handleProfileImageUploaded}
            size="LARGE"
            position="CENTER"
            description="Profile photo"
            isEditable={isEditable}
            style={inline({
              position: 'relative',
              bottom: '-38px',
              width: '464px',
              height: '453px',
              objectFit: 'cover'
            })}
          />
        </div>

        {/* Right Section - Text Content */}
        <div style={inline({
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingTop: '155px',
          paddingLeft: '20px',
        })}>
          {/* Main Title */}
          <div style={inline({
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#3A4B49', // Dark gray color as per screenshot
            marginBottom: '30px',
            lineHeight: '1.1',
          })}>
            {isEditable && editingMainTitle ? (
              <ImprovedInlineEditor
                initialValue={currentMainTitle}
                onSave={handleMainTitleSave}
                onCancel={() => setEditingMainTitle(false)}
                className="main-title-editor"
                style={inline({
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#3A4B49',
                  lineHeight: '1.1',
                  width: '100%',
                  height: 'auto',
                })}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingMainTitle(true)}
                style={inline({
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none'
                })}
              >
                {currentMainTitle}
              </div>
            )}
          </div>

          {/* Body Text */}
          <div style={inline({
            fontSize: '30px',
            color: '#455450', // Dark gray color as per screenshot
            lineHeight: '1.4',
            maxWidth: '500px',
          })}>
            {isEditable && editingBodyText ? (
              <ImprovedInlineEditor
                initialValue={currentBodyText}
                onSave={handleBodyTextSave}
                onCancel={() => setEditingBodyText(false)}
                className="body-text-editor"
                multiline={true}
                style={inline({
                  fontSize: '30px',
                  color: '#455450',
                  lineHeight: '1.4',
                  width: '100%',
                  height: 'auto',
                })}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingBodyText(true)}
                style={inline({
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none',
                  whiteSpace: 'pre-line'
                })}
              >
                {currentBodyText}
              </div>
            )}
          </div>
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

export default MarketingAgencyThankYouSlideTemplate;