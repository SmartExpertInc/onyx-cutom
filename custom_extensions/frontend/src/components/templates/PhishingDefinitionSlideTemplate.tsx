// custom_extensions/frontend/src/components/templates/PhishingDefinitionSlideTemplate.tsx

import React, { useState } from 'react';
import { PhishingDefinitionSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export const PhishingDefinitionSlideTemplate: React.FC<PhishingDefinitionSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'What is phishing?',
  definitions = [
    "Using data to access a victim's account and withdrawing money or making an online transaction, e.g. buying a product or service.",
    "Using data to open fake bank accounts or credit cards in the name of the victim and using them to cash out illegal checks, etc.",
    "Using the victim's computer systems to install viruses and worms and disseminating phishing emails further to their contacts.",
    "Using data from some systems to gain access to high value organizational data such as banking information, employee credentials, social security numbers, etc."
  ],
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  rightImagePath = '',
  rightImageAlt = 'Right side image',
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
  const [editingDefinitions, setEditingDefinitions] = useState<number | null>(null);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDefinitions, setCurrentDefinitions] = useState(definitions);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: themeBg,
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, definitions, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleDefinitionSave = (index: number, newDefinition: string) => {
    const newDefinitions = [...currentDefinitions];
    newDefinitions[index] = newDefinition;
    setCurrentDefinitions(newDefinitions);
    setEditingDefinitions(null);
    if (onUpdate) {
      onUpdate({ ...{ title, definitions, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor }, definitions: newDefinitions });
    }
  };

  const handleTitleCancel = () => {
    setCurrentTitle(title);
    setEditingTitle(false);
  };

  const handleDefinitionCancel = () => {
    setCurrentDefinitions(definitions);
    setEditingDefinitions(null);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, definitions, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleRightImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, definitions, profileImagePath, profileImageAlt, rightImagePath, rightImageAlt, backgroundColor, titleColor, contentColor, accentColor }, rightImagePath: newImagePath });
    }
  };

  return (
    <div className="phishing-definition-slide-template inter-theme" style={slideStyles}>
      {/* Left section with text */}
      <div style={{
        width: '50%',
        height: '100%',
        backgroundColor: '#ffffff',
        padding: '60px',
        paddingTop: '40px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Title */}
        <div style={{
          fontSize: '56px',
          color: '#212222',
          marginBottom: '15px',
          lineHeight: '1.2'
        }}>
          {isEditable && editingTitle ? (
            <ImprovedInlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={true}
              className="phishing-title-editor"
              style={{
                fontSize: '56px',
                color: '#212222',
                lineHeight: '1.2'
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

        {/* Definitions */}
        <div style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {currentDefinitions.map((definition, index) => (
            <div
              key={index}
              style={{
                fontSize: '11px',
                color: '#545555',
                lineHeight: '1.5'
              }}
            >
              {isEditable && editingDefinitions === index ? (
                <ImprovedInlineEditor
                  initialValue={definition}
                  onSave={(value) => handleDefinitionSave(index, value)}
                  onCancel={handleDefinitionCancel}
                  multiline={true}
                  className="definition-editor"
                  style={{
                    fontSize: '11px',
                    color: '#545555',
                    lineHeight: '1.5'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingDefinitions(index)}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {definition}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Profile image at bottom left */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '60px',
          width: '130px',
          height: '130px',
          borderRadius: '50%',
          overflow: 'hidden'
        }}>
          <ClickableImagePlaceholder
            imagePath={profileImagePath}
            onImageUploaded={handleProfileImageUploaded}
            size="MEDIUM"
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

      {/* Right section with image */}
      <div style={{
        width: '50%',
        height: '100%',
        position: 'relative'
      }}>
        <ClickableImagePlaceholder
          imagePath={rightImagePath}
          onImageUploaded={handleRightImageUploaded}
          size="LARGE"
          position="CENTER"
          description="Right side image"
          isEditable={isEditable}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '0px',
            objectFit: 'cover'
          }}
        />
      </div>
    </div>
  );
};

export default PhishingDefinitionSlideTemplate; 