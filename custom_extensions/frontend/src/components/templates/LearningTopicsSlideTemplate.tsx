// custom_extensions/frontend/src/components/templates/LearningTopicsSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { LearningTopicsSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import PresentationImageUpload from '../PresentationImageUpload';

export const LearningTopicsSlideTemplate: React.FC<LearningTopicsSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'You will learn about:',
  subtitle = 'Employment',
  topics = [
    'Payroll',
    'Taxes',
    'Benefits',
    'Hiring'
  ],
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  companyName = 'Company name',
  logoNew = '',
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
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [editingTopics, setEditingTopics] = useState<number | null>(null);
  const [editingCompanyName, setEditingCompanyName] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentSubtitle, setCurrentSubtitle] = useState(subtitle);
  const [currentTopics, setCurrentTopics] = useState(topics);
  const [currentCompanyName, setCurrentCompanyName] = useState(companyName);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {,
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: themeBg,
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, topics, profileImagePath, profileImageAlt, companyName, logoNew, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleSubtitleSave = (newSubtitle: string) => {
    setCurrentSubtitle(newSubtitle);
    setEditingSubtitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, topics, profileImagePath, profileImageAlt, companyName, logoNew, backgroundColor, titleColor, contentColor, accentColor }, subtitle: newSubtitle });
    }
  };

  const handleTopicSave = (index: number, newTopic: string) => {
    const newTopics = [...currentTopics];
    newTopics[index] = newTopic;
    setCurrentTopics(newTopics);
    setEditingTopics(null);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, topics, profileImagePath, profileImageAlt, companyName, logoNew, backgroundColor, titleColor, contentColor, accentColor }, topics: newTopics });
    }
  };

  const handleCompanyNameSave = (newCompanyName: string) => {
    setCurrentCompanyName(newCompanyName);
    setEditingCompanyName(false);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, topics, profileImagePath, profileImageAlt, companyName, logoNew, backgroundColor, titleColor, contentColor, accentColor }, companyName: newCompanyName });
    }
  };

  const handleTitleCancel = () => {
    setCurrentTitle(title);
    setEditingTitle(false);
  };

  const handleSubtitleCancel = () => {
    setCurrentSubtitle(subtitle);
    setEditingSubtitle(false);
  };

  const handleTopicCancel = () => {
    setCurrentTopics(topics);
    setEditingTopics(null);
  };

  const handleCompanyNameCancel = () => {
    setCurrentCompanyName(companyName);
    setEditingCompanyName(false);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, topics, profileImagePath, profileImageAlt, companyName, logoNew, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleBenefitsListIconUploaded = (newIconPath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, topics, profileImagePath, profileImageAlt, companyName, logoNew, backgroundColor, titleColor, contentColor, accentColor }, logoNew: newIconPath });
    }
  };

  const handleLogoNewUploaded = (newLogoPath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, topics, profileImagePath, profileImageAlt, companyName, logoNew, backgroundColor, titleColor, contentColor, accentColor }, logoNew: newLogoPath });
    }
  };

  return (
    <div className="learning-topics-slide-template inter-theme" style={slideStyles}>
      {/* Left section */}
      <div style={{
        width: '50%',
        height: '100%',
        backgroundColor: '#FFFFFF',
        padding: '40px 60px',
        paddingTop: '56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {/* Header and title section */}
        <div>
          {/* Subtitle */}
          <div style={{
            fontSize: '14px',
            color: '#818181',
            marginBottom: '20px',
            fontFamily: 'Lora-Bold, serif', fontWeight: 'normal'
          }}>
            {isEditable && editingSubtitle ? (
              <ImprovedInlineEditor
                initialValue={currentSubtitle}
                onSave={handleSubtitleSave}
                onCancel={handleSubtitleCancel}
                className="learning-subtitle-editor"
                style={{
                  fontSize: '14px',
                  color: '#818181',
                  fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
                  width: '100%',
                  height: 'auto'
                }}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingSubtitle(true)}
                style={{
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none'
                }}
              >
                {currentSubtitle}
              </div>
            )}
          </div>

          {/* Main title */}
          <div style={{
            maxWidth: '350px',
            fontSize: '58px',
            color: '#414141',
            lineHeight: '1.1',
            marginBottom: '60px'
          }}>
            {isEditable && editingTitle ? (
              <ImprovedInlineEditor
                initialValue={currentTitle}
                onSave={handleTitleSave}
                onCancel={handleTitleCancel}
                multiline={true}
                className="learning-title-editor"
                style={{
                  maxWidth: '350px',
                  fontSize: '58px',
                  color: '#414141',
                  lineHeight: '1.1',
                  width: '100%',
                  height: 'auto',
                  minHeight: '60px'
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

          {/* Topics list */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '13px'
          }}>
            {currentTopics.map((topic, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column-reverse',
                  gap: '13px'
                }}
              >
                <div style={{
                  width: '100%',
                  height: '2px',
                  backgroundColor: themeContent,
                  opacity: 0.3
                }} />
                <div style={{
                  fontSize: '30px',
                  color: '#515151',
                  minWidth: '120px'
                }}>
                  {isEditable && editingTopics === index ? (
                    <ImprovedInlineEditor
                      initialValue={topic}
                      onSave={(value) => handleTopicSave(index, value)}
                      onCancel={handleTopicCancel}
                      className="topic-editor"
                      style={{
                        fontSize: '30px',
                        color: '#515151',
                        width: '100%',
                        height: 'auto',
                        minWidth: '120px'
                      }}
                    />
                  ) : (
                    <div
                      onClick={() => isEditable && setEditingTopics(index)}
                      style={{
                        cursor: isEditable ? 'pointer' : 'default',
                        userSelect: 'none'
                      }}
                    >
                      {topic}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginTop: '36px'
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
                height: '24px',
                width: '24px',
                objectFit: 'contain'
              }}
            />
          ) : (
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
                src="/custom-projects-ui/benefitsListIcon.png"
                alt="Company Logo"
                style={{
                  width: '24px',
                  height: '24px',
                  objectFit: 'contain'
                }}
              />
            </div>
          )}
          <div style={{
            fontSize: '14px',
            color: '#858585',
            fontFamily: 'Lora-Bold, serif', fontWeight: 'normal'
          }}>
            {isEditable && editingCompanyName ? (
              <ImprovedInlineEditor
                initialValue={currentCompanyName}
                onSave={handleCompanyNameSave}
                onCancel={handleCompanyNameCancel}
                className="company-name-editor"
                style={{
                  fontSize: '14px',
                  color: '#858585',
                  fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
                  width: '100%',
                  height: 'auto'
                }}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingCompanyName(true)}
                style={{
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none'
                }}
              >
                {currentCompanyName}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right section with profile image */}
      <div style={{
        width: '50%',
        height: '100%',
        backgroundColor: '#B593EA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <div style={{
          width: '550px',
          height: '570px',
          position: 'absolute',
          bottom: '-3px'}}>
          <ClickableImagePlaceholder
            imagePath={profileImagePath}
            onImageUploaded={handleProfileImageUploaded}
            size="LARGE"
            position="CENTER"
            description="Profile photo"
            isEditable={isEditable}
            style={{
              width: '100%',
              height: '100%'}}
          />
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

export default LearningTopicsSlideTemplate; 