// custom_extensions/frontend/src/components/templates/CompanyToolsResourcesSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { CompanyToolsResourcesSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import PresentationImageUpload from '../PresentationImageUpload';

export const CompanyToolsResourcesSlideTemplate: React.FC<CompanyToolsResourcesSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Company tools and resources',
  sections = [
    {
      title: 'Communication Tools:',
      content: 'Effective communication is key to success in any workplace. At [Company Name], we use a variety of communication tools to keep our team connected and informed. Here are some of the key tools we use.',
      backgroundColor: '#CCCCCC', // Light gray
      textColor: '#404040' // Dark gray
    },
    {
      title: 'Project Management:',
      content: 'Tools To help you stay organized and manage projects effectively, we use the following tools: Project management software (Asana, Trello, etc.); Task lists and calendars; Time tracking software.',
      backgroundColor: '#4231EA', // Blue
      textColor: '#ABA5EB' // White
    },
    {
      title: 'Learning and Development Resources',
      content: 'We believe in investing in our employees\' growth and development. Here are some of the resources we offer: Online training courses (LinkedIn Learning, Udemy, etc.); In-house training and workshops; Professional development funds.',
      backgroundColor: '#4231EA', // Blue
      textColor: '#ABA5EB' // White
    },
    {
      title: 'Project Management',
      content: 'Tools To help you stay organized and manage projects effectively, we use the following tools: Project management software (Asana, Trello, etc.); Task lists and calendars; Time tracking software.',
      backgroundColor: '#CCCCCC', // Light gray
      textColor: '#404040' // Dark gray
    }
  ],
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
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSections, setEditingSections] = useState<{ index: number; field: 'title' | 'content' } | null>(null);
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);
  
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentSections, setCurrentSections] = useState(sections);
  const [currentCompanyLogoPath, setCurrentCompanyLogoPath] = useState('');

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#F0F2F7', // Light grey background for content area
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, sections, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleSectionSave = (index: number, field: 'title' | 'content', newValue: string) => {
    const newSections = [...currentSections];
    newSections[index] = { ...newSections[index], [field]: newValue };
    setCurrentSections(newSections);
    setEditingSections(null);
    if (onUpdate) {
      onUpdate({ ...{ title, sections, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, sections: newSections });
    }
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, sections, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleCompanyLogoUploaded = (newLogoPath: string) => {
    setCurrentCompanyLogoPath(newLogoPath);
    if (onUpdate) {
      onUpdate({ ...{ title, sections, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, companyLogoPath: newLogoPath });
    }
  };

  return (
    <>
      <style>{`
        .company-tools-resources-slide-template *:not(.title-element) {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .company-tools-resources-slide-template .title-element {
          font-family: "Lora", serif !important;
          font-weight: 600 !important;
        }
      `}</style>
      <div className="company-tools-resources-slide-template inter-theme" style={slideStyles}>
      {/* Blue Header Section */}
      <div style={{
        position: 'absolute',
        left: '0',
        right: '0',
        top: '0',
        height: '30%',
        background: 'linear-gradient(to bottom, #0F58F9, #1023A1)',
        border: 'none'
      }} />

      {/* Logo Placeholder */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '60px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 10
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
            gap: '8px',
            cursor: isEditable ? 'pointer' : 'default'
          }}
          onClick={() => isEditable && setShowLogoUploadModal(true)}
          >
            <div style={{
              width: '20px',
              height: '20px',
              border: '1px solid #FFFFFF',
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '8px',
                height: '2px',
                backgroundColor: '#FFFFFF',
                position: 'absolute'
              }} />
              <div style={{
                width: '2px',
                height: '8px',
                backgroundColor: '#FFFFFF',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: '400', color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>Your Logo</div>
          </div>
        )}
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        left: '60px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '48px',
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: 'Lora, serif',
        zIndex: 5,
        maxWidth: '60%'
      }}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={currentTitle}
            onSave={handleTitleSave}
            onCancel={() => setEditingTitle(false)}
            className="title-element"
            style={{
              fontSize: '48px',
              fontWeight: '600',
              color: '#FFFFFF',
              lineHeight: '1.1',
              width: '100%',
              height: 'auto',
              fontFamily: 'Lora, serif'
            }}
          />
        ) : (
          <div
            className="title-element"
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

      {/* Profile Image */}
      <div style={{
        position: 'absolute',
        top: '40px',
        right: '60px',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: '#3B8BE9',
        zIndex: 10,
        border: '3px solid #FFFFFF'
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

      {/* Content Sections Grid */}
      <div style={{
        position: 'absolute',
        left: '0',
        right: '0',
        top: '30%',
        bottom: '0',
        background: '#F0F2F7',
        padding: '60px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '20px'
      }}>
        {currentSections.map((section, index) => (
          <div key={index} style={{
            backgroundColor: '#FFFFFF',
            padding: '30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Section Title */}
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#333333',
              lineHeight: '1.2',
              fontFamily: 'Lora, serif'
            }}>
              {isEditable && editingSections?.index === index && editingSections?.field === 'title' ? (
                <ImprovedInlineEditor
                  initialValue={section.title}
                  onSave={(value) => handleSectionSave(index, 'title', value)}
                  onCancel={() => setEditingSections(null)}
                  className="section-title-editor"
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#333333',
                    lineHeight: '1.2',
                    width: '100%',
                    height: 'auto',
                    fontFamily: 'Lora, serif'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingSections({ index, field: 'title' })}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {section.title}
                </div>
              )}
            </div>

            {/* Section Content */}
            <div style={{
              fontSize: '16px',
              color: '#555555',
              lineHeight: '1.4',
              flex: 1,
              fontFamily: 'Inter, sans-serif'
            }}>
              {isEditable && editingSections?.index === index && editingSections?.field === 'content' ? (
                <ImprovedInlineEditor
                  initialValue={section.content}
                  onSave={(value) => handleSectionSave(index, 'content', value)}
                  onCancel={() => setEditingSections(null)}
                  className="section-content-editor"
                  multiline={true}
                  style={{
                    fontSize: '16px',
                    color: '#555555',
                    lineHeight: '1.4',
                    width: '100%',
                    height: 'auto',
                    fontFamily: 'Inter, sans-serif'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingSections({ index, field: 'content' })}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {section.content}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer with page number */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '60px',
        fontSize: '14px',
        color: '#A2A19D',
        fontFamily: 'Inter, sans-serif'
      }}>
        18
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
    </>
  );
};

export default CompanyToolsResourcesSlideTemplate;