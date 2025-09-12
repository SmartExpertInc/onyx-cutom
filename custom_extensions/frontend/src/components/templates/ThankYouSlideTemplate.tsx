// custom_extensions/frontend/src/components/templates/ThankYouSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ThankYouSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import PresentationImageUpload from '../PresentationImageUpload';

export const ThankYouSlideTemplate: React.FC<ThankYouSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Thank you',
  email = 'hello@gmail.com',
  phone = '+1 (305) 212-4253',
  address = '374 Creekside Road Palmetto',
  postalCode = 'F134221',
  companyName = 'Company name',
  logoNew = '',
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  backgroundColor,
  titleColor,
  textColor,
  accentColor,
  isEditable = false,
  onUpdate,
  theme,
  voiceoverText
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [editingPostalCode, setEditingPostalCode] = useState(false);
  const [editingCompanyName, setEditingCompanyName] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentEmail, setCurrentEmail] = useState(email);
  const [currentPhone, setCurrentPhone] = useState(phone);
  const [currentAddress, setCurrentAddress] = useState(address);
  const [currentPostalCode, setCurrentPostalCode] = useState(postalCode);
  const [currentCompanyName, setCurrentCompanyName] = useState(companyName);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, subtitleColor: themeSubtitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  // Helper function for inline editor styling
  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    padding: 0,
    margin: 0
  });

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#252525',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    boxSizing: 'border-box'
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{title, email, phone, address, postalCode, companyName, logoNew, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor}, title: newTitle });
    }
  };

  const handleEmailSave = (newEmail: string) => {
    setCurrentEmail(newEmail);
    setEditingEmail(false);
    if (onUpdate) {
      onUpdate({ ...{title, email, phone, address, postalCode, companyName, logoNew, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor}, email: newEmail });
    }
  };

  const handlePhoneSave = (newPhone: string) => {
    setCurrentPhone(newPhone);
    setEditingPhone(false);
    if (onUpdate) {
      onUpdate({ ...{title, email, phone, address, postalCode, companyName, logoNew, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor}, phone: newPhone });
    }
  };

  const handleAddressSave = (newAddress: string) => {
    setCurrentAddress(newAddress);
    setEditingAddress(false);
    if (onUpdate) {
      onUpdate({ ...{title, email, phone, address, postalCode, companyName, logoNew, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor}, address: newAddress });
    }
  };

  const handlePostalCodeSave = (newPostalCode: string) => {
    setCurrentPostalCode(newPostalCode);
    setEditingPostalCode(false);
    if (onUpdate) {
      onUpdate({ ...{title, email, phone, address, postalCode, companyName, logoNew, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor}, postalCode: newPostalCode });
    }
  };

  const handleCompanyNameSave = (newCompanyName: string) => {
    setCurrentCompanyName(newCompanyName);
    setEditingCompanyName(false);
    if (onUpdate) {
      onUpdate({ ...{title, email, phone, address, postalCode, companyName, logoNew, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor}, companyName: newCompanyName });
    }
  };

  const handleTitleCancel = () => {
    setCurrentTitle(title);
    setEditingTitle(false);
  };

  const handleEmailCancel = () => {
    setCurrentEmail(email);
    setEditingEmail(false);
  };

  const handlePhoneCancel = () => {
    setCurrentPhone(phone);
    setEditingPhone(false);
  };

  const handleAddressCancel = () => {
    setCurrentAddress(address);
    setEditingAddress(false);
  };

  const handlePostalCodeCancel = () => {
    setCurrentPostalCode(postalCode);
    setEditingPostalCode(false);
  };

  const handleCompanyNameCancel = () => {
    setCurrentCompanyName(companyName);
    setEditingCompanyName(false);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{title, email, phone, address, postalCode, companyName, logoNew, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor}, profileImagePath: newImagePath });
    }
  };

  const handleLogoNewUploaded = (newLogoPath: string) => {
    if (onUpdate) {
      onUpdate({ ...{title, email, phone, address, postalCode, companyName, logoNew, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor}, logoNew: newLogoPath });
    }
  };

  return (
    <div className="thank-you-slide-template inter-theme" style={slideStyles}>
      {/* Main Title - Top left */}
      <div style={{
        position: 'absolute',
        top: '315px',
        left: '80px'
      }}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={currentTitle}
            onSave={handleTitleSave}
            onCancel={handleTitleCancel}
            className="thank-you-title-editor"
            style={{inline({

              fontSize: '80px',
              color: themeTitle,
              lineHeight: '1.1',
              fontFamily: currentTheme.fonts.titleFont,
              width: '100%',
              height: 'auto',
              minHeight: '60px',
              position: 'relative'
            
})}}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingTitle(true)}
            style={{
              fontSize: '80px',
              color: themeTitle,
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

      {/* Horizontal separator line */}
      <div style={{
        position: 'absolute',
        top: '425px',
        left: '80px',
        right: '80px',
        height: '2px',
        backgroundColor: `#5B5B5B`
      }} />

      {/* Content area */}
      <div style={{
        position: 'absolute',
        top: '450px',
        left: '85px',
        right: '80px'
      }}>
        {/* Left side - Contact and Address */}
        <div style={{
          display: 'flex',
          gap: '80px'
        }}>
          {/* Contacts */}
          <div>
            <div style={{
              fontSize: '12px',
              color: '#848484',
              marginBottom: '10px',
              fontWeight: '300'
            }}>
              Contacts
            </div>
            
            <div style={{ marginBottom: '15px', position: 'relative' }}>
              {isEditable && editingEmail ? (
                <ImprovedInlineEditor
                  initialValue={currentEmail}
                  onSave={handleEmailSave}
                  onCancel={handleEmailCancel}
                  className="thank-you-email-editor"
                  style={{inline({

                    fontSize: '22px',
                    color: '#C0C0C0',
                    fontFamily: currentTheme.fonts.contentFont,
                    width: '100%',
                    height: 'auto'
                  
})}}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingEmail(true)}
                  style={{
                    fontSize: '22px',
                    color: '#C0C0C0',
                    cursor: isEditable ? 'pointer' : 'default',
                    fontFamily: currentTheme.fonts.contentFont,
                    userSelect: 'none',
                    position: 'relative'
                  }}
                >
                  {currentEmail}
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              {isEditable && editingPhone ? (
                <ImprovedInlineEditor
                  initialValue={currentPhone}
                  onSave={handlePhoneSave}
                  onCancel={handlePhoneCancel}
                  className="thank-you-phone-editor"
                  style={{inline({

                    fontSize: '22px',
                    color: '#C0C0C0',
                    fontFamily: currentTheme.fonts.contentFont,
                    width: '100%',
                    height: 'auto'
                  
})}}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingPhone(true)}
                  style={{
                    fontSize: '22px',
                    color: '#C0C0C0',
                    cursor: isEditable ? 'pointer' : 'default',
                    fontFamily: currentTheme.fonts.contentFont,
                    userSelect: 'none',
                    position: 'relative'
                  }}
                >
                  {currentPhone}
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <div style={{
              fontSize: '12px',
              color: '#848484',
              marginBottom: '10px',
              fontWeight: '300'
            }}>
              Our address
            </div>
            
            <div style={{ marginBottom: '15px', position: 'relative' }}>
              {isEditable && editingAddress ? (
                <ImprovedInlineEditor
                  initialValue={currentAddress}
                  onSave={handleAddressSave}
                  onCancel={handleAddressCancel}
                  className="thank-you-address-editor"
                  style={{inline({

                    fontSize: '22px',
                    color: '#C0C0C0',
                    fontFamily: currentTheme.fonts.contentFont,
                    width: '100%',
                    height: 'auto'
                  
})}}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingAddress(true)}
                  style={{
                    fontSize: '22px',
                    color: '#C0C0C0',
                    cursor: isEditable ? 'pointer' : 'default',
                    fontFamily: currentTheme.fonts.contentFont,
                    userSelect: 'none',
                    position: 'relative'
                  }}
                >
                  {currentAddress}
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              {isEditable && editingPostalCode ? (
                <ImprovedInlineEditor
                  initialValue={currentPostalCode}
                  onSave={handlePostalCodeSave}
                  onCancel={handlePostalCodeCancel}
                  className="thank-you-postal-code-editor"
                  style={{inline({

                    fontSize: '22px',
                    color: '#C0C0C0',
                    fontFamily: currentTheme.fonts.contentFont,
                    width: '100%',
                    height: 'auto'
                  
})}}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingPostalCode(true)}
                  style={{
                    fontSize: '22px',
                    color: '#C0C0C0',
                    cursor: isEditable ? 'pointer' : 'default',
                    fontFamily: currentTheme.fonts.contentFont,
                    userSelect: 'none',
                    position: 'relative'
                  }}
                >
                  {currentPostalCode}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Image - Top right */}
      <div style={{
        width: '210px',
        marginTop: '0',
        height: '210px',
        borderRadius: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: '80px',
        right: '60px',
        zIndex: 10
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
            overflow: 'hidden'
          }}
        />
      </div>

      {/* Bottom horizontal separator line */}
      <div style={{
        position: 'absolute',
        bottom: '76px',
        left: '80px',
        right: '80px',
        height: '3px',
        backgroundColor: '#5B5B5B'
      }} />

      {/* Company name */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '7%',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
{logoNew ? (
          // Show uploaded logo image
          <ClickableImagePlaceholder
            imagePath={logoNew}
            onImageUploaded={handleLogoNewUploaded}
            size="SMALL"
            position="CENTER"
            description="Company logo"
            isEditable={isEditable}
            style={{
              height: '24px',
              width: '24px',
              objectFit: 'contain'
            }}
          />
        ) : (
          // Show default logo image
          <div 
            onClick={() => isEditable && setShowUploadModal(true)}
            style={{
              width: '24px',
              height: '24px',
              cursor: isEditable ? 'pointer' : 'default',
              position: 'relative'
            }}
          >
            <img
              src="/custom-projects-ui/logoNew.png"
              alt="Company Logo"
              style={{
                width: '24px',
                height: '24px',
                objectFit: 'contain'
              }}
            />
          </div>
        )}
        <div style={{ position: 'relative' }}>
          {isEditable && editingCompanyName ? (
            <ImprovedInlineEditor
              initialValue={currentCompanyName}
              onSave={handleCompanyNameSave}
              onCancel={handleCompanyNameCancel}
              className="thank-you-company-name-editor"
              style={{inline({

                fontSize: '11px',
                color: '#848484',
                fontFamily: currentTheme.fonts.contentFont,
                width: '100%',
                height: 'auto'
              
})}}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingCompanyName(true)}
              style={{
                fontSize: '11px',
                color: '#848484',
                cursor: isEditable ? 'pointer' : 'default',
                fontFamily: currentTheme.fonts.contentFont,
                userSelect: 'none',
                position: 'relative'
              }}
            >
              {currentCompanyName}
            </div>
          )}
        </div>
      </div>

      {/* Logo Upload Modal */}
      {showUploadModal && (
        <PresentationImageUpload
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onImageUploaded={(newLogoPath: string) => {
            handleLogoNewUploaded(newLogoPath);
            setShowUploadModal(false);
          }}
          title="Upload Company Logo"
        />
      )}
    </div>
  );
};

export default ThankYouSlideTemplate; 