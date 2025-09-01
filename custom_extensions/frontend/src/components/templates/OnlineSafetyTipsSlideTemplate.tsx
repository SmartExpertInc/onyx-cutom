// custom_extensions/frontend/src/components/templates/OnlineSafetyTipsSlideTemplate.tsx

import React, { useState } from 'react';
import { OnlineSafetyTipsSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import PresentationImageUpload from '../PresentationImageUpload';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export const OnlineSafetyTipsSlideTemplate: React.FC<OnlineSafetyTipsSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = '4 tips to stay safe online',
  companyName = 'Logo',
  companyLogoPath = '',
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  tips = [
    {
      number: '1',
      title: 'Know the scams',
      description: 'Read articles and blogs, follow the news, and share this so you can learn about different kinds of scams and what you can do to avoid them.'
    },
    {
      number: '2',
      title: 'Don\'t click',
      description: 'These phishing emails have links that lead to websites that can lure you into giving personal information or download malware to your computer'
    },
    {
      number: '3',
      title: 'Shop safely',
      description: 'Don\'t shop on a site unless it has the "https". Also, protect yourself and use a credit card instead of a debit card while shopping online'
    },
    {
      number: '4',
      title: 'Passwords',
      description: 'Do away with the "Fitguy1982" password and use an extremely uncrackable one like 9&4yiw2pyqx# Phrases are good too.'
    }
  ],
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
  const [editingCompanyName, setEditingCompanyName] = useState(false);
  const [editingTips, setEditingTips] = useState<{ index: number; field: 'title' | 'description' } | null>(null);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentCompanyName, setCurrentCompanyName] = useState(companyName);
  const [currentTips, setCurrentTips] = useState(tips);
  const [currentCompanyLogoPath, setCurrentCompanyLogoPath] = useState(companyLogoPath);
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '650px',
    backgroundColor: themeBg, // Light background like other slides
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, companyName, companyLogoPath, profileImagePath, profileImageAlt, tips, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleCompanyNameSave = (newCompanyName: string) => {
    setCurrentCompanyName(newCompanyName);
    setEditingCompanyName(false);
    if (onUpdate) {
      onUpdate({ ...{ title, companyName, companyLogoPath, profileImagePath, profileImageAlt, tips, backgroundColor, titleColor, contentColor, accentColor }, companyName: newCompanyName });
    }
  };

  const handleTipSave = (index: number, field: 'title' | 'description', value: string) => {
    const newTips = [...currentTips];
    newTips[index] = { ...newTips[index], [field]: value };
    setCurrentTips(newTips);
    setEditingTips(null);
    if (onUpdate) {
      onUpdate({ ...{ title, companyName, companyLogoPath, profileImagePath, profileImageAlt, tips, backgroundColor, titleColor, contentColor, accentColor }, tips: newTips });
    }
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, companyName, companyLogoPath, profileImagePath, profileImageAlt, tips, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleCompanyLogoUploaded = (newLogoPath: string) => {
    setCurrentCompanyLogoPath(newLogoPath);
    if (onUpdate) {
      onUpdate({ ...{ title, companyName, companyLogoPath, profileImagePath, profileImageAlt, tips, backgroundColor, titleColor, contentColor, accentColor }, companyLogoPath: newLogoPath });
    }
  };

  return (
    <div className="online-safety-tips-slide-template" style={slideStyles}>
      {/* Left section - Tips content */}
      <div style={{
        flex: '2',
        backgroundColor: '#ffffff', // White background like screenshot
        padding: '60px 50px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Company logo */}
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '50px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
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
                width: '20px',
                height: '20px',
                border: `2px solid ${themeContent}`,
                borderRadius: '50%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '8px',
                  height: '2px',
                  backgroundColor: themeContent,
                  position: 'absolute'
                }} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: '300', color: themeContent }}>{currentCompanyName}</span>
            </div>
          )}
        </div>

        {/* Main title */}
        <div style={{
          fontSize: '48px',
          color: '#000000', // Black text on white background like screenshot
          lineHeight: '1.1',
          fontWeight: 'bold',
          marginBottom: '50px',
          marginTop: '40px'
        }}>
          {isEditable && editingTitle ? (
            <ImprovedInlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={() => setEditingTitle(false)}
              className="title-editor"
              style={{
                fontSize: '48px',
                color: '#000000',
                lineHeight: '1.1',
                fontWeight: 'bold',
                width: '100%'
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

        {/* Tips list */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '30px'
        }}>
          {currentTips.map((tip, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: '20px',
                alignItems: 'flex-start'
              }}
            >
              {/* Tip number */}
              <div style={{
                fontSize: '32px',
                color: '#8B5A96', // Purple color like screenshot
                fontWeight: 'bold',
                minWidth: '40px'
              }}>
                {tip.number}
              </div>

              {/* Tip content */}
              <div style={{
                flex: '1'
              }}>
                {/* Tip title */}
                <div style={{
                  fontSize: '24px',
                  color: '#000000', // Black text on white background like screenshot
                  fontWeight: 'bold',
                  marginBottom: '10px'
                }}>
                  {isEditable && editingTips?.index === index && editingTips?.field === 'title' ? (
                    <ImprovedInlineEditor
                      initialValue={tip.title}
                      onSave={(value) => handleTipSave(index, 'title', value)}
                      onCancel={() => setEditingTips(null)}
                      className="tip-title-editor"
                      style={{
                        fontSize: '24px',
                        color: '#000000',
                        fontWeight: 'bold',
                        width: '100%'
                      }}
                    />
                  ) : (
                    <div
                      onClick={() => isEditable && setEditingTips({ index, field: 'title' })}
                      style={{
                        cursor: isEditable ? 'pointer' : 'default',
                        userSelect: 'none'
                      }}
                    >
                      {tip.title}
                    </div>
                  )}
                </div>

                {/* Tip description */}
                <div style={{
                  fontSize: '18px',
                  color: '#666666', // Gray color like screenshot
                  lineHeight: '1.4'
                }}>
                  {isEditable && editingTips?.index === index && editingTips?.field === 'description' ? (
                    <ImprovedInlineEditor
                      initialValue={tip.description}
                      onSave={(value) => handleTipSave(index, 'description', value)}
                      onCancel={() => setEditingTips(null)}
                      multiline={true}
                      className="tip-description-editor"
                      style={{
                        fontSize: '18px',
                        color: '#666666',
                        lineHeight: '1.4',
                        width: '100%'
                      }}
                    />
                  ) : (
                    <div
                      onClick={() => isEditable && setEditingTips({ index, field: 'description' })}
                      style={{
                        cursor: isEditable ? 'pointer' : 'default',
                        userSelect: 'none'
                      }}
                    >
                      {tip.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right section - Profile image with dark background */}
      <div style={{
        flex: '1',
        backgroundColor: '#000000', // Black background like screenshot
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <ClickableImagePlaceholder
          imagePath={profileImagePath}
          onImageUploaded={handleProfileImageUploaded}
          size="LARGE"
          position="CENTER"
          description="Profile photo"
          isEditable={isEditable}
          style={{
            width: '280px',
            height: '350px',
            borderRadius: '8px',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Logo Upload Modal */}
      {showLogoUploadModal && (
        <PresentationImageUpload
          isOpen={showLogoUploadModal}
          onClose={() => setShowLogoUploadModal(false)}
          onImageUploaded={(newLogoPath) => {
            handleCompanyLogoUploaded(newLogoPath);
            setShowLogoUploadModal(false);
          }}
          title="Upload Company Logo"
        />
      )}
    </div>
  );
};

export default OnlineSafetyTipsSlideTemplate; 