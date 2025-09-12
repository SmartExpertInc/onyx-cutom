// custom_extensions/frontend/src/components/templates/CompanyToolsResourcesSlideTemplate.tsx

import React, { useState } from 'react';
import { CompanyToolsResourcesSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import PresentationImageUpload from '../PresentationImageUpload';

  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background:'transparent',
    border:'none',
    outline:'none',
    padding:0,
    margin:0
  });

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
    backgroundColor: '#EDEDED', // Light gray background as per screenshot
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
    <div className="company-tools-resources-slide-template inter-theme" style={slideStyles}>
      {/* Logo Placeholder */}
      <div style={inline({
        position: 'absolute',
        top: '40px',
        left: '40px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      })}>
        {currentCompanyLogoPath ? (
          // Show uploaded logo image
          <ClickableImagePlaceholder
            imagePath={currentCompanyLogoPath}
            onImageUploaded={handleCompanyLogoUploaded}
            size="SMALL"
            position="CENTER"
            description="Company logo"
            isEditable={isEditable}
            style={inline({
              height: '30px',
              maxWidth: '120px',
              objectFit: 'contain'
            })}
          />
        ) : (
          // Show default logo design with clickable area
          <div style={inline({
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: isEditable ? 'pointer' : 'default'
          })}
          onClick={() => isEditable && setShowLogoUploadModal(true)}
          >
            <div style={inline({
              width: '20px',
              height: '20px',
              border: '2px solid #374151',
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            })}>
              <div style={inline({
                width: '8px',
                height: '2px',
                backgroundColor: '#374151',
                position: 'absolute'
              })} />
              <div style={inline({
                width: '2px',
                height: '8px',
                backgroundColor: '#374151',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              })} />
            </div>
            <div style={inline({ fontSize: '14px', fontWeight: '300', color: '#374151' })}>Your Logo</div>
          </div>
        )}
      </div>

      {/* Title */}
      <div style={inline({
        position: 'absolute',
        top: '100px',
        left: '5%',
        fontSize: '56px',
        fontWeight: 'bold',
        color: '#2A2A2A', // Dark gray text as per screenshot
        lineHeight: '1.1',
        textAlign: 'center',
      })}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={currentTitle}
            onSave={handleTitleSave}
            onCancel={() => setEditingTitle(false)}
            className="company-title-editor"
            style={inline({
              fontSize: '56px',
              fontWeight: 'bold',
              color: '#2A2A2A',
              lineHeight: '1.1',
              width: '100%',
              height: 'auto',
              textAlign: 'center',
            })}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingTitle(true)}
            style={inline({
              cursor: isEditable ? 'pointer' : 'default',
              userSelect: 'none'
            })}
          >
            {currentTitle}
          </div>
        )}
      </div>

      {/* Profile Image */}
      <div style={inline({
        position: 'absolute',
        top: '40px',
        right: '40px',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: '#000000', // Black background as per screenshot
      })}>
        <ClickableImagePlaceholder
          imagePath={profileImagePath}
          onImageUploaded={handleProfileImageUploaded}
          size="LARGE"
          position="CENTER"
          description="Profile photo"
          isEditable={isEditable}
          style={inline({
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover'
          })}
        />
      </div>

      {/* Content Sections Grid */}
      <div style={inline({
        position: 'absolute',
        top: '203px',
        left: '40px',
        right: '40px',
        bottom: '40px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
      })}>
        {currentSections.map((section, index) => (
          <div key={index} style={inline({
            backgroundColor: index === 0 || index === 3 ? '#CCCCCC' : '#4231EA',
            padding: '33px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          })}>
            {/* Section Title */}
            <div style={inline({
              fontSize: '16px',
              fontWeight: 'bold',
              color: index === 0 || index === 3 ? '#404040' : '#ABA5EB',
              lineHeight: '1.2',
            })}>
              {isEditable && editingSections?.index === index && editingSections?.field === 'title' ? (
                <ImprovedInlineEditor
                  initialValue={section.title}
                  onSave={(value) => handleSectionSave(index, 'title', value)}
                  onCancel={() => setEditingSections(null)}
                  className="section-title-editor"
                  style={inline({
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: index === 0 || index === 3 ? '#404040' : '#ABA5EB',
                    lineHeight: '1.2',
                    width: '100%',
                    height: 'auto',
                  })}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingSections({ index, field: 'title' })}
                  style={inline({
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  })}
                >
                  {section.title}
                </div>
              )}
            </div>

            {/* Section Content */}
            <div style={inline({
              fontSize: '14px',
              color: index === 0 || index === 3 ? '#666666' : '#A69FF2',
              lineHeight: '1.4',
              flex: 1,
            })}>
              {isEditable && editingSections?.index === index && editingSections?.field === 'content' ? (
                <ImprovedInlineEditor
                  initialValue={section.content}
                  onSave={(value) => handleSectionSave(index, 'content', value)}
                  onCancel={() => setEditingSections(null)}
                  className="section-content-editor"
                  multiline={true}
                  style={inline({
                    fontSize: '14px',
                    color: index === 0 || index === 3 ? '#666666' : '#A69FF2',
                    lineHeight: '1.4',
                    width: '100%',
                    height: 'auto',
                  })}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingSections({ index, field: 'content' })}
                  style={inline({
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  })}
                >
                  {section.content}
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
          onImageUploaded={(newLogoPath: string) => {
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