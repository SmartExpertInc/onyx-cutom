// custom_extensions/frontend/src/components/templates/CompanyToolsResourcesSlideTemplate.tsx

import React, { useState } from 'react';
import { CompanyToolsResourcesSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import PresentationImageUpload from '../PresentationImageUpload';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export const CompanyToolsResourcesSlideTemplate: React.FC<CompanyToolsResourcesSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Company tools and resources',
  companyName = 'Logo',
  companyLogoPath = '',
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  contentBlocks = [
    {
      title: 'Communication Tools:',
      content: 'Effective communication is key to success in any workplace. At [Company Name], we use a variety of communication tools to keep our team connected and informed. Here are some of the key tools we use.',
      backgroundColor: '#f5f5f5'
    },
    {
      title: 'Project Management:',
      content: 'Tools To help you stay organized and manage projects effectively, we use the following tools: Project management software (Asana, Trello, etc.); Task lists and calendars; Time tracking software.',
      backgroundColor: '#007bff'
    },
    {
      title: 'Learning and Development Resources',
      content: 'We believe in investing in our employees\' growth and development. Here are some of the resources we offer: Online training courses (LinkedIn Learning, Udemy, etc.); In-house training and workshops; Professional development funds.',
      backgroundColor: '#007bff'
    },
    {
      title: 'Project Management',
      content: 'Tools To help you stay organized and manage projects effectively, we use the following tools: Project management software (Asana, Trello, etc.); Task lists and calendars; Time tracking software.',
      backgroundColor: '#f5f5f5'
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
  const [editingContentBlocks, setEditingContentBlocks] = useState<{ index: number; field: 'title' | 'content' } | null>(null);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentCompanyName, setCurrentCompanyName] = useState(companyName);
  const [currentContentBlocks, setCurrentContentBlocks] = useState(contentBlocks);
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
      onUpdate({ ...{ title, companyName, companyLogoPath, profileImagePath, profileImageAlt, contentBlocks, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleCompanyNameSave = (newCompanyName: string) => {
    setCurrentCompanyName(newCompanyName);
    setEditingCompanyName(false);
    if (onUpdate) {
      onUpdate({ ...{ title, companyName, companyLogoPath, profileImagePath, profileImageAlt, contentBlocks, backgroundColor, titleColor, contentColor, accentColor }, companyName: newCompanyName });
    }
  };

  const handleContentBlockSave = (index: number, field: 'title' | 'content', value: string) => {
    const newBlocks = [...currentContentBlocks];
    newBlocks[index] = { ...newBlocks[index], [field]: value };
    setCurrentContentBlocks(newBlocks);
    setEditingContentBlocks(null);
    if (onUpdate) {
      onUpdate({ ...{ title, companyName, companyLogoPath, profileImagePath, profileImageAlt, contentBlocks, backgroundColor, titleColor, contentColor, accentColor }, contentBlocks: newBlocks });
    }
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, companyName, companyLogoPath, profileImagePath, profileImageAlt, contentBlocks, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleCompanyLogoUploaded = (newLogoPath: string) => {
    setCurrentCompanyLogoPath(newLogoPath);
    if (onUpdate) {
      onUpdate({ ...{ title, companyName, companyLogoPath, profileImagePath, profileImageAlt, contentBlocks, backgroundColor, titleColor, contentColor, accentColor }, companyLogoPath: newLogoPath });
    }
  };

  return (
    <div className="company-tools-resources-slide-template inter-theme" style={slideStyles}>
      {/* Header section */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px'
      }}>
        {/* Company logo */}
        <div style={{
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
          fontSize: '36px',
          color: themeTitle,
          lineHeight: '1.1',
          fontWeight: 'bold',
          textAlign: 'center',
          flex: '1'
        }}>
          {isEditable && editingTitle ? (
            <ImprovedInlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={() => setEditingTitle(false)}
              className="title-editor"
              style={{
                fontSize: '36px',
                color: themeTitle,
                lineHeight: '1.1',
                fontWeight: 'bold',
                width: '100%',
                textAlign: 'center'
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

        {/* Profile image */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: themeTitle
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

      {/* Content blocks grid 2x2 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '20px',
        height: 'calc(100% - 120px)'
      }}>
        {currentContentBlocks.map((block, index) => (
          <div
            key={index}
            style={{
              backgroundColor: block.backgroundColor === '#f5f5f5' ? '#f5f5f5' : themeAccent, // Light gray or theme accent
              padding: '25px 30px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}
          >
            {/* Block title */}
            <div style={{
              fontSize: '20px',
              color: block.backgroundColor === '#f5f5f5' ? '#000000' : '#ffffff', // Black on light gray, white on blue
              fontWeight: 'bold'
            }}>
              {isEditable && editingContentBlocks?.index === index && editingContentBlocks?.field === 'title' ? (
                <ImprovedInlineEditor
                  initialValue={block.title}
                  onSave={(value) => handleContentBlockSave(index, 'title', value)}
                  onCancel={() => setEditingContentBlocks(null)}
                  className="block-title-editor"
                  style={{
                    fontSize: '20px',
                    color: block.backgroundColor === '#f5f5f5' ? '#000000' : '#ffffff',
                    fontWeight: 'bold',
                    width: '100%'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingContentBlocks({ index, field: 'title' })}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {block.title}
                </div>
              )}
            </div>

            {/* Block content */}
            <div style={{
              fontSize: '16px',
              color: block.backgroundColor === '#f5f5f5' ? '#000000' : '#ffffff', // Black on light gray, white on blue
              lineHeight: '1.4',
              flex: '1'
            }}>
              {isEditable && editingContentBlocks?.index === index && editingContentBlocks?.field === 'content' ? (
                <ImprovedInlineEditor
                  initialValue={block.content}
                  onSave={(value) => handleContentBlockSave(index, 'content', value)}
                  onCancel={() => setEditingContentBlocks(null)}
                  multiline={true}
                  className="block-content-editor"
                  style={{
                    fontSize: '16px',
                    color: block.backgroundColor === '#f5f5f5' ? '#000000' : '#ffffff',
                    lineHeight: '1.4',
                    width: '100%'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingContentBlocks({ index, field: 'content' })}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {block.content}
                </div>
              )}
            </div>
          </div>
        ))}
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

export default CompanyToolsResourcesSlideTemplate; 