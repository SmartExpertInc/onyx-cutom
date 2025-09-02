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
     backgroundColor: themeAccent, // Dark olive background like other slides
     display: 'flex',
     position: 'relative',
     overflow: 'hidden',
     fontFamily: currentTheme.fonts.titleFont,
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
    <div className="resources-slide-template opensans-semibold-theme" style={slideStyles}>
      {/* Header section with logo */}
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
              border: `2px solid ${themeBg}`,
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '8px',
                height: '2px',
                backgroundColor: themeBg,
                position: 'absolute'
              }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '300', color: themeBg }}>{currentCompanyName}</span>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div style={{
        display: 'flex',
        height: '100%',
        position: 'relative'
      }}>
        {/* Left section - Title and resources */}
        <div style={{
          flex: '2',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 50px'
        }}>
          {/* Title at bottom left */}
          <div style={{
            fontSize: '48px',
            color: themeBg, // Light gray text on dark background
            lineHeight: '1.1',
            fontWeight: 'bold',
            marginTop: 'auto'
          }}>
            {isEditable && editingTitle ? (
              <ImprovedInlineEditor
                initialValue={currentTitle}
                onSave={handleTitleSave}
                onCancel={() => setEditingTitle(false)}
                className="title-editor"
                style={{
                  fontSize: '48px',
                  color: themeBg,
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

          {/* Resources list in center */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            marginTop: '40px'
          }}>
            {currentResources.map((resource, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: themeContent, // Light panels on dark background
                  padding: '25px 30px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  color: themeBg, // Light gray text on light panels
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
                      color: themeBg,
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
        </div>

        {/* Right section - Profile image */}
        <div style={{
          flex: '1',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px'
        }}>
          <ClickableImagePlaceholder
            imagePath={profileImagePath}
            onImageUploaded={handleProfileImageUploaded}
            size="LARGE"
            position="CENTER"
            description="Profile photo"
            isEditable={isEditable}
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        </div>
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

export default ResourcesSlideTemplate; 