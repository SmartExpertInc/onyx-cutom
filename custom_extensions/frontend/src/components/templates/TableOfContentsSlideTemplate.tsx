// custom_extensions/frontend/src/components/templates/TableOfContentsSlideTemplate.tsx

import React, { useState } from 'react';
import { TableOfContentsSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import PresentationImageUpload from '../PresentationImageUpload';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export const TableOfContentsSlideTemplate: React.FC<TableOfContentsSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Table of Contents',
  companyName = 'Logo',
  companyLogoPath = '',
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  navigationButtons = [
    'The Problem',
    'Benefits',
    'Best Practices',
    'Methods',
    'Achieving Success',
    'The Future'
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
  const [editingButtons, setEditingButtons] = useState<number | null>(null);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentCompanyName, setCurrentCompanyName] = useState(companyName);
  const [currentButtons, setCurrentButtons] = useState(navigationButtons);
  const [currentCompanyLogoPath, setCurrentCompanyLogoPath] = useState(companyLogoPath);
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '650px',
    backgroundColor: '#f8f8f8', // Light off-white background
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    padding: '40px 60px',
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, companyName, companyLogoPath, profileImagePath, profileImageAlt, navigationButtons, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleCompanyNameSave = (newCompanyName: string) => {
    setCurrentCompanyName(newCompanyName);
    setEditingCompanyName(false);
    if (onUpdate) {
      onUpdate({ ...{ title, companyName, companyLogoPath, profileImagePath, profileImageAlt, navigationButtons, backgroundColor, titleColor, contentColor, accentColor }, companyName: newCompanyName });
    }
  };

  const handleButtonSave = (index: number, newButton: string) => {
    const newButtons = [...currentButtons];
    newButtons[index] = newButton;
    setCurrentButtons(newButtons);
    setEditingButtons(null);
    if (onUpdate) {
      onUpdate({ ...{ title, companyName, companyLogoPath, profileImagePath, profileImageAlt, navigationButtons, backgroundColor, titleColor, contentColor, accentColor }, navigationButtons: newButtons });
    }
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, companyName, companyLogoPath, profileImagePath, profileImageAlt, navigationButtons, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleCompanyLogoUploaded = (newLogoPath: string) => {
    setCurrentCompanyLogoPath(newLogoPath);
    if (onUpdate) {
      onUpdate({ ...{ title, companyName, companyLogoPath, profileImagePath, profileImageAlt, navigationButtons, backgroundColor, titleColor, contentColor, accentColor }, companyLogoPath: newLogoPath });
    }
  };

  return (
    <div className="table-of-contents-slide-template" style={slideStyles}>
             {/* Left section - Navigation buttons */}
       <div style={{
         flex: '2',
         display: 'flex',
         flexDirection: 'column',
         gap: '20px'
       }}>
         {/* Company logo */}
         <div style={{
           display: 'flex',
           alignItems: 'center',
           gap: '10px',
           marginBottom: '20px'
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
         {/* Title */}
        <div style={{
          fontSize: '36px',
          color: themeTitle,
          lineHeight: '1.1',
          fontWeight: 'bold',
          marginBottom: '40px'
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

        {/* Navigation buttons grid 2x3 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr 1fr',
          gap: '20px',
          maxWidth: '500px'
        }}>
          {currentButtons.map((button, index) => (
            <div
              key={index}
                             style={{
                 backgroundColor: themeAccent, // Use theme accent color
                 padding: '20px 25px',
                 borderRadius: '12px',
                 fontSize: '20px',
                 color: themeBg, // Use theme background color for contrast
                 fontWeight: '500',
                 textAlign: 'center',
                 cursor: isEditable ? 'pointer' : 'default',
                 userSelect: 'none',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 minHeight: '60px'
               }}
              onClick={() => isEditable && setEditingButtons(index)}
            >
              {isEditable && editingButtons === index ? (
                <ImprovedInlineEditor
                  initialValue={button}
                  onSave={(value) => handleButtonSave(index, value)}
                  onCancel={() => setEditingButtons(null)}
                  className="button-editor"
                  style={{
                    fontSize: '20px',
                    color: '#333333',
                    fontWeight: '500',
                    textAlign: 'center',
                    width: '100%'
                  }}
                />
              ) : (
                button
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right section - Profile image with blue background */}
      <div style={{
        flex: '1',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: '40px'
      }}>
        <div style={{
          width: '300px',
          height: '400px',
          backgroundColor: themeContent, // Use theme content color
          border: `2px solid ${themeTitle}`,
          borderRadius: '8px',
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
              height: '380px',
              borderRadius: '6px',
              objectFit: 'cover'
            }}
          />
        </div>
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
   );
 };

export default TableOfContentsSlideTemplate; 