// custom_extensions/frontend/src/components/templates/ThankYouSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ThankYouSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

interface InlineEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

function InlineEditor({ 
  initialValue, 
  onSave, 
  onCancel, 
  multiline = false, 
  placeholder = "",
  className = "",
  style = {}
}: InlineEditorProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      onSave(value);
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      onSave(value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    onSave(value);
  };

  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [value, multiline]);

  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [multiline]);

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        className={`inline-editor-textarea ${className}`}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={{
          ...style,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          resize: 'none',
          overflow: 'hidden',
          width: '100%',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          minHeight: '1.6em',
          boxSizing: 'border-box',
          display: 'block',
        }}
        rows={1}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      className={`inline-editor-input ${className}`}
      type="text"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      style={{
        ...style,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
        width: '100%',
        boxSizing: 'border-box',
        display: 'block',
      }}
    />
  );
}

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
  
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentEmail, setCurrentEmail] = useState(email);
  const [currentPhone, setCurrentPhone] = useState(phone);
  const [currentAddress, setCurrentAddress] = useState(address);
  const [currentPostalCode, setCurrentPostalCode] = useState(postalCode);
  const [currentCompanyName, setCurrentCompanyName] = useState(companyName);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, subtitleColor: themeSubtitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '600px',
    backgroundColor: themeBg,
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
      onUpdate({ ...{ title, email, phone, address, postalCode, companyName, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor }, title: newTitle });
    }
  };

  const handleEmailSave = (newEmail: string) => {
    setCurrentEmail(newEmail);
    setEditingEmail(false);
    if (onUpdate) {
      onUpdate({ ...{ title, email, phone, address, postalCode, companyName, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor }, email: newEmail });
    }
  };

  const handlePhoneSave = (newPhone: string) => {
    setCurrentPhone(newPhone);
    setEditingPhone(false);
    if (onUpdate) {
      onUpdate({ ...{ title, email, phone, address, postalCode, companyName, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor }, phone: newPhone });
    }
  };

  const handleAddressSave = (newAddress: string) => {
    setCurrentAddress(newAddress);
    setEditingAddress(false);
    if (onUpdate) {
      onUpdate({ ...{ title, email, phone, address, postalCode, companyName, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor }, address: newAddress });
    }
  };

  const handlePostalCodeSave = (newPostalCode: string) => {
    setCurrentPostalCode(newPostalCode);
    setEditingPostalCode(false);
    if (onUpdate) {
      onUpdate({ ...{ title, email, phone, address, postalCode, companyName, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor }, postalCode: newPostalCode });
    }
  };

  const handleCompanyNameSave = (newCompanyName: string) => {
    setCurrentCompanyName(newCompanyName);
    setEditingCompanyName(false);
    if (onUpdate) {
      onUpdate({ ...{ title, email, phone, address, postalCode, companyName, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor }, companyName: newCompanyName });
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
      onUpdate({ ...{ title, email, phone, address, postalCode, companyName, profileImagePath, profileImageAlt, backgroundColor, titleColor, textColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  return (
    <div className="thank-you-slide-template" style={slideStyles}>
      {/* Main Title - Top left */}
      <div style={{
        position: 'absolute',
        top: '250px',
        left: '80px'
      }}>
        {isEditable && editingTitle ? (
          <InlineEditor
            initialValue={currentTitle}
            onSave={handleTitleSave}
            onCancel={handleTitleCancel}
            className="thank-you-title-editor"
            style={{
              fontSize: '74px',
              color: themeTitle,
              lineHeight: '1.1',
              fontFamily: currentTheme.fonts.titleFont,
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              margin: '0',
              padding: '0'
            }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingTitle(true)}
            style={{
              fontSize: '80px',
              fontWeight: 'bold',
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
        top: '352px',
        left: '80px',
        right: '80px',
        height: '1px',
        backgroundColor: themeAccent
      }} />

      {/* Content area */}
      <div style={{
        position: 'absolute',
        top: '373px',
        left: '80px',
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
              color: themeSubtitle,
              marginBottom: '10px',
              fontWeight: '300'
            }}>
              Contacts
            </div>
            
            <div style={{ marginBottom: '15px', position: 'relative' }}>
              {isEditable && editingEmail ? (
                <InlineEditor
                  initialValue={currentEmail}
                  onSave={handleEmailSave}
                  onCancel={handleEmailCancel}
                  className="thank-you-email-editor"
                  style={{
                    fontSize: '18px',
                    color: themeContent,
                    fontFamily: currentTheme.fonts.contentFont,
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    margin: '0',
                    padding: '0'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingEmail(true)}
                  style={{
                    fontSize: '18px',
                    color: themeContent,
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
                <InlineEditor
                  initialValue={currentPhone}
                  onSave={handlePhoneSave}
                  onCancel={handlePhoneCancel}
                  className="thank-you-phone-editor"
                  style={{
                    fontSize: '18px',
                    color: themeContent,
                    fontFamily: currentTheme.fonts.contentFont,
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    margin: '0',
                    padding: '0'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingPhone(true)}
                  style={{
                    fontSize: '18px',
                    color: themeContent,
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
              fontSize: '14px',
              color: themeSubtitle,
              marginBottom: '10px',
              fontWeight: '300'
            }}>
              Our address
            </div>
            
            <div style={{ marginBottom: '15px', position: 'relative' }}>
              {isEditable && editingAddress ? (
                <InlineEditor
                  initialValue={currentAddress}
                  onSave={handleAddressSave}
                  onCancel={handleAddressCancel}
                  className="thank-you-address-editor"
                  style={{
                    fontSize: '22px',
                    color: themeContent,
                    fontFamily: currentTheme.fonts.contentFont,
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    margin: '0',
                    padding: '0'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingAddress(true)}
                  style={{
                    fontSize: '22px',
                    color: themeContent,
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
                <InlineEditor
                  initialValue={currentPostalCode}
                  onSave={handlePostalCodeSave}
                  onCancel={handlePostalCodeCancel}
                  className="thank-you-postal-code-editor"
                  style={{
                    fontSize: '22px',
                    color: themeContent,
                    fontFamily: currentTheme.fonts.contentFont,
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    margin: '0',
                    padding: '0'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingPostalCode(true)}
                  style={{
                    fontSize: '22px',
                    color: themeContent,
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
        width: '220px',
        marginTop: '-37px',
        height: '220px',
        borderRadius: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'absolute',
        top: '80px',
        right: '80px',
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
        bottom: '100px',
        left: '80px',
        right: '80px',
        height: '1px',
        backgroundColor: themeAccent
      }} />

      {/* Company name */}
      <div style={{
        position: 'absolute',
        bottom: '55px',
        left: '7%',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '16px',
          height: '16px',
          backgroundColor: themeAccent,
          transform: 'rotate(45deg)'
        }} />
        <div style={{ position: 'relative' }}>
          {isEditable && editingCompanyName ? (
            <InlineEditor
              initialValue={currentCompanyName}
              onSave={handleCompanyNameSave}
              onCancel={handleCompanyNameCancel}
              className="thank-you-company-name-editor"
              style={{
                fontSize: '14px',
                color: themeSubtitle,
                fontFamily: currentTheme.fonts.contentFont,
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                margin: '0',
                padding: '0'
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingCompanyName(true)}
              style={{
                fontSize: '14px',
                color: themeSubtitle,
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
    </div>
  );
};

export default ThankYouSlideTemplate; 