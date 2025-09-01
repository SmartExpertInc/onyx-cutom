// custom_extensions/frontend/src/components/templates/ResourcesSlideTemplate.tsx

import React, { useState } from 'react';
import { ResourcesSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import PresentationImageUpload from '../PresentationImageUpload';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export const ResourcesSlideTemplate: React.FC<ResourcesSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Resources',
  companyName = 'Your Logo',
  companyLogoPath = '',
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  resources = [
    'Resource 1: [Website/Book Title] - [Link/Author Name]',
    'Resource 2: [Website/Book Title] - [Link/Author Name]',
    'Resource 3: [Website/Book Title] - [Link/Author Name]'
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
  const [editingResources, setEditingResources] = useState<number | null>(null);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentCompanyName, setCurrentCompanyName] = useState(companyName);
  const [currentResources, setCurrentResources] = useState(resources);
  const [currentCompanyLogoPath, setCurrentCompanyLogoPath] = useState(companyLogoPath);
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '650px',
    backgroundColor: '#556B2F', // Dark olive background
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    padding: '40px 60px',
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, companyName, companyLogoPath, profileImagePath, profileImageAlt, resources, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleCompanyNameSave = (newCompanyName: string) => {
    setCurrentCompanyName(newCompanyName);
    setEditingCompanyName(false);
    if (onUpdate) {
      onUpdate({ ...{ title, companyName, companyLogoPath, profileImagePath, profileImageAlt, resources, backgroundColor, titleColor, contentColor, accentColor }, companyName: newCompanyName });
    }
  };

  const handleResourceSave = (index: number, newResource: string) => {
    const newResources = [...currentResources];
    newResources[index] = newResource;
    setCurrentResources(newResources);
    setEditingResources(null);
    if (onUpdate) {
      onUpdate({ ...{ title, companyName, companyLogoPath, profileImagePath, profileImageAlt, resources, backgroundColor, titleColor, contentColor, accentColor }, resources: newResources });
    }
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, companyName, companyLogoPath, profileImagePath, profileImageAlt, resources, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleCompanyLogoUploaded = (newLogoPath: string) => {
    setCurrentCompanyLogoPath(newLogoPath);
    if (onUpdate) {
      onUpdate({ ...{ title, companyName, companyLogoPath, profileImagePath, profileImageAlt, resources, backgroundColor, titleColor, contentColor, accentColor }, companyLogoPath: newLogoPath });
    }
  };

  return (
    <div className="resources-slide-template" style={slideStyles}>
      {/* Header section with logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '60px'
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          border: `2px solid #C0C0C0`,
          borderRadius: '50%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '12px',
            height: '2px',
            backgroundColor: '#C0C0C0',
            position: 'absolute'
          }} />
          <div style={{
            width: '2px',
            height: '12px',
            backgroundColor: '#C0C0C0',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }} />
        </div>
        <div style={{
          fontSize: '14px',
          color: '#C0C0C0',
          fontWeight: '300'
        }}>
          {isEditable && editingCompanyName ? (
            <ImprovedInlineEditor
              initialValue={currentCompanyName}
              onSave={handleCompanyNameSave}
              onCancel={() => setEditingCompanyName(false)}
              className="company-name-editor"
              style={{
                fontSize: '14px',
                color: '#C0C0C0',
                fontWeight: '300'
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

      {/* Main title */}
      <div style={{
        fontSize: '72px',
        color: '#C0C0C0',
        lineHeight: '1.1',
        fontWeight: 'bold',
        marginBottom: '80px',
        marginLeft: '40px'
      }}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={currentTitle}
            onSave={handleTitleSave}
            onCancel={() => setEditingTitle(false)}
            className="title-editor"
            style={{
              fontSize: '72px',
              color: '#C0C0C0',
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

      {/* Resources list */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '25px',
        maxWidth: '600px',
        marginLeft: '40px'
      }}>
        {currentResources.map((resource, index) => (
          <div
            key={index}
            style={{
              backgroundColor: '#6B8E23', // Slightly lighter olive
              padding: '20px 25px',
              borderRadius: '8px',
              fontSize: '18px',
              color: '#C0C0C0',
              lineHeight: '1.4'
            }}
          >
            {isEditable && editingResources === index ? (
              <ImprovedInlineEditor
                initialValue={resource}
                onSave={(value) => handleResourceSave(index, value)}
                onCancel={() => setEditingResources(null)}
                multiline={true}
                className="resource-editor"
                style={{
                  fontSize: '18px',
                  color: '#C0C0C0',
                  lineHeight: '1.4',
                  width: '100%'
                }}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingResources(index)}
                style={{
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none'
                }}
              >
                {resource}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Profile image */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        right: '60px',
        width: '140px',
        height: '140px',
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: '#6B8E23'
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
            objectFit: 'cover'
          }}
        />
      </div>
    </div>
  );
};

export default ResourcesSlideTemplate; 