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
  voiceoverText,
  pageNumber = '03'
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [editingPostalCode, setEditingPostalCode] = useState(false);
  const [editingCompanyName, setEditingCompanyName] = useState(false);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentEmail, setCurrentEmail] = useState(email);
  const [currentPhone, setCurrentPhone] = useState(phone);
  const [currentAddress, setCurrentAddress] = useState(address);
  const [currentPostalCode, setCurrentPostalCode] = useState(postalCode);
  const [currentCompanyName, setCurrentCompanyName] = useState(companyName);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, subtitleColor: themeSubtitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    background: 'linear-gradient(90deg, #0F58F9 0%, #1023A1 100%)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Lora-Bold, serif',
    boxSizing: 'border-box'
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, email, phone, address, postalCode, companyName, logoNew, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor }, title: newTitle });
    }
  };

  const handleEmailSave = (newEmail: string) => {
    setCurrentEmail(newEmail);
    setEditingEmail(false);
    if (onUpdate) {
      onUpdate({ ...{ title, email, phone, address, postalCode, companyName, logoNew, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor }, email: newEmail });
    }
  };

  const handlePhoneSave = (newPhone: string) => {
    setCurrentPhone(newPhone);
    setEditingPhone(false);
    if (onUpdate) {
      onUpdate({ ...{ title, email, phone, address, postalCode, companyName, logoNew, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor }, phone: newPhone });
    }
  };

  const handleAddressSave = (newAddress: string) => {
    setCurrentAddress(newAddress);
    setEditingAddress(false);
    if (onUpdate) {
      onUpdate({ ...{ title, email, phone, address, postalCode, companyName, logoNew, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor }, address: newAddress });
    }
  };

  const handlePostalCodeSave = (newPostalCode: string) => {
    setCurrentPostalCode(newPostalCode);
    setEditingPostalCode(false);
    if (onUpdate) {
      onUpdate({ ...{ title, email, phone, address, postalCode, companyName, logoNew, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor }, postalCode: newPostalCode });
    }
  };

  const handleCompanyNameSave = (newCompanyName: string) => {
    setCurrentCompanyName(newCompanyName);
    setEditingCompanyName(false);
    if (onUpdate) {
      onUpdate({ ...{ title, email, phone, address, postalCode, companyName, logoNew, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor }, companyName: newCompanyName });
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
      onUpdate({ ...{ title, email, phone, address, postalCode, companyName, logoNew, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleLogoNewUploaded = (newLogoPath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, email, phone, address, postalCode, companyName, logoNew, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor, pageNumber }, logoNew: newLogoPath });
    }
  };

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    if (onUpdate) {
      onUpdate({ ...{ title, email, phone, address, postalCode, companyName, logoNew, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor, pageNumber }, pageNumber: newPageNumber });
    }
  };

  const handlePageNumberCancel = () => {
    setCurrentPageNumber(pageNumber);
    setEditingPageNumber(false);
  };

  return (
    <div className="thank-you-slide-template inter-theme" style={slideStyles}>
      {/* Logo in top-left corner */}
      <div style={{
        position: 'absolute',
        top: '30px',
        left: '30px'
      }}>
        {logoNew ? (
          <ClickableImagePlaceholder
            imagePath={logoNew}
            onImageUploaded={handleLogoNewUploaded}
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
          <div 
            onClick={() => isEditable && setShowUploadModal(true)}
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
              border: '2px solid #ffffff',
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '12px', height: '2px', backgroundColor: '#ffffff', position: 'absolute' }} />
              <div style={{ width: '2px', height: '12px', backgroundColor: '#ffffff', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <span style={{ fontSize: '14px', fontFamily: 'Lora-Bold, serif', color: '#ffffff' }}>Your Logo</span>
          </div>
        )}
      </div>

      {/* Main Title - Top left */}
      <div style={{
        position: 'absolute',
        top: '235px',
        left: '80px'
      }}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={currentTitle}
            onSave={handleTitleSave}
            onCancel={handleTitleCancel}
            className="thank-you-title-editor"
            style={{
              fontSize: '80px',
              color: themeTitle,
              lineHeight: '1.1',
              fontFamily: 'Lora-Bold, serif', // Lora-Bold for titles
              width: '100%',
              height: 'auto',
              minHeight: '60px',
              position: 'relative'
            }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingTitle(true)}
            style={{
              fontSize: '80px',
              color: themeTitle,
              lineHeight: '1.1',
              cursor: isEditable ? 'pointer' : 'default',
              fontFamily: 'Lora-Bold, serif', // Lora-Bold for titles
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
        top: '365px',
        left: '80px',
        right: '80px',
        height: '2px',
        backgroundColor: `rgb(165 165 165)`
      }} />

      {/* Content area */}
      <div style={{
        position: 'absolute',
        top: '400px',
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
              fontSize: '14px',
              color: 'rgb(219 219 219)',
              marginBottom: '10px',
              fontFamily: 'Lora-Bold, serif'
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
                  style={{
                    fontSize: '22px',
                    color: '#ffffff',
                    fontFamily: 'Lora, serif',
                    width: '100%',
                    height: 'auto'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingEmail(true)}
                  style={{
                    fontSize: '22px',
                    color: '#ffffff',
                    cursor: isEditable ? 'pointer' : 'default',
                    fontFamily: 'Lora, serif',
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
                  style={{
                    fontSize: '22px',
                    color: '#ffffff',
                    fontFamily: 'Lora, serif',
                    width: '100%',
                    height: 'auto'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingPhone(true)}
                  style={{
                    fontSize: '22px',
                    color: '#ffffff',
                    cursor: isEditable ? 'pointer' : 'default',
                    fontFamily: 'Lora, serif',
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
              fontSize: '14px',
              color: 'rgb(219 219 219)',
              marginBottom: '10px',
              fontFamily: 'Lora-Bold, serif'
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
                  style={{
                    fontSize: '22px',
                    color: '#ffffff',
                    fontFamily: 'Lora, serif',
                    width: '100%',
                    height: 'auto'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingAddress(true)}
                  style={{
                    fontSize: '22px',
                    color: '#ffffff',
                    cursor: isEditable ? 'pointer' : 'default',
                    fontFamily: 'Lora, serif',
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
                  style={{
                    fontSize: '22px',
                    color: '#ffffff',
                    fontFamily: 'Lora, serif',
                    width: '100%',
                    height: 'auto'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingPostalCode(true)}
                  style={{
                    fontSize: '22px',
                    color: '#ffffff',
                    cursor: isEditable ? 'pointer' : 'default',
                    fontFamily: 'Lora, serif',
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
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: '80px',
        right: '60px',
        zIndex: 10,
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
            width: '90%',
            height: '100%',
            position: 'absolute',
            bottom: '-30px',
            borderRadius: '50%',
            overflow: 'hidden'
          }}
        />
      </div>

      {/* Bottom horizontal separator line */}
      <div style={{
        position: 'absolute',
        bottom: '115px',
        left: '80px',
        right: '80px',
        height: '2px',
        backgroundColor: 'rgb(165 165 165)'
      }} />

      {/* Page number with line */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '0px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
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
              fontFamily: 'Lora-Bold, serif',
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
              fontFamily: 'Lora-Bold, serif',
              cursor: isEditable ? 'pointer' : 'default',
              userSelect: 'none'
            }}
          >
            {currentPageNumber}
          </div>
        )}
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