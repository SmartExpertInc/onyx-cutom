// custom_extensions/frontend/src/components/templates/CompanyToolsResourcesSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { CompanyToolsResourcesSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import PresentationImageUpload from '../PresentationImageUpload';
import YourLogo from '../YourLogo';

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
  companyLogoPath = '',
  logoText = 'Your Logo',
  logoPath = '',
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
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentSections, setCurrentSections] = useState(sections);
  const [currentPageNumber, setCurrentPageNumber] = useState('18');

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
        .company-tools-resources-slide-template .section-title {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-weight: 600 !important;
        }
        .company-tools-resources-slide-template .section-title * {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
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
        height: '40%',
        background: '#0F58F9',
        border: 'none'
      }} />

      {/* Logo */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '25px',
        zIndex: 10
      }}>
        <YourLogo
          logoPath={logoPath}
          onLogoUploaded={(p) => onUpdate && onUpdate({ logoPath: p })}
          isEditable={isEditable}
          color="#FFFFFF"
          text={logoText}
        />
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        left: '60px',
        top: '17%',
        transform: 'translateY(-50%)',
        fontSize: '55px',
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: 'Lora, serif',
        zIndex: 5,
        maxWidth: '70%'
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
        backgroundColor: '#FFFFFF',
        zIndex: 10,
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
        top: '35%',
        bottom: '0',
        background: '#F0F2F7',
        padding: '0px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '0px'
      }}>
        {currentSections.map((section, index) => (
          <div key={index} style={{
            backgroundColor: (index === 0 || index === 3) ? '#E0E7FF' : '#FFFFFF',
            padding: '30px 120px 30px 50px',
            display: 'flex',
            flexDirection: 'column',
            fontWeight: '600',
            gap: '16px',
          }}>
            {/* Section Title */}
            <div className="section-title" style={{
              fontSize: '19px',
              fontWeight: '600',
              color: 'black',
              lineHeight: '1.2',
              fontFamily: 'Lora, serif'
            }}>
              {isEditable && editingSections?.index === index && editingSections?.field === 'title' ? (
                <ImprovedInlineEditor
                  initialValue={section.title}
                  onSave={(value) => handleSectionSave(index, 'title', value)}
                  onCancel={() => setEditingSections(null)}
                  className="section-title-editor section-title"
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
                    userSelect: 'none',
                    fontWeight: '600',
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
        bottom: '24px',
        left: '22px',
        fontSize: '15px',
        color: '#555555',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400
      }}>
        {isEditable && editingPageNumber ? (
          <ImprovedInlineEditor
            initialValue={currentPageNumber}
            onSave={(v) => {
              setCurrentPageNumber(v);
              setEditingPageNumber(false);
              onUpdate && onUpdate({ pageNumber: v });
            }}
            onCancel={() => setEditingPageNumber(false)}
            style={{ position: 'relative', background: 'transparent', border: 'none', outline: 'none', padding: 0, margin: 0, color: '#555555', fontSize: '15px', fontWeight: 400 }}
          />
        ) : (
          <div onClick={() => isEditable && setEditingPageNumber(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }}>
            {currentPageNumber}
          </div>
        )}
      </div>

    </div>
    </>
  );
};

export default CompanyToolsResourcesSlideTemplate;