// custom_extensions/frontend/src/components/templates/BenefitsTagsSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { BenefitsTagsSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import PresentationImageUpload from '../PresentationImageUpload';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

type TagType = { text: string; isHighlighted?: boolean };

export const BenefitsTagsSlideTemplate: React.FC<BenefitsTagsSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Benefits',
  tags = [
    { text: 'Better decisions', isHighlighted: false },
    { text: 'Insight', isHighlighted: false },
    { text: 'Growth', isHighlighted: false },
    { text: 'Progress', isHighlighted: false },
    { text: 'Creativity', isHighlighted: false },
    { text: 'Innovative solutions', isHighlighted: true }
  ],
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  companyName = 'Company Logo',
  companyLogoPath = '',
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
  const [editingTags, setEditingTags] = useState<number | null>(null);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentTags, setCurrentTags] = useState(tags);
  const [currentCompanyLogoPath, setCurrentCompanyLogoPath] = useState(companyLogoPath);
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  // Helper function for inline editor styling
  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    padding: 0,
    margin: 0
  });

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#ffffff', // Light grey background as per screenshot
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    padding: '40px 60px',
    border: '2px solid #FFFFFF', // White border as per screenshot
  };

  // Tags block styles
  const tagsBlockStyles: React.CSSProperties = {
    position: 'absolute',
    top: '15px', // From the top of the slide
    left: '15px',
    right: '15px',
    bottom: '80px', // Leave space for logo at bottom
    backgroundColor: '#EDEDED', // Darker grey for tags block
    borderRadius: '12px',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, tags, profileImagePath, profileImageAlt, companyName, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleTagSave = (index: number, newTag: string) => {
    const newTags = [...currentTags];
    newTags[index] = { ...newTags[index], text: newTag };
    setCurrentTags(newTags);
    setEditingTags(null);
    if (onUpdate) {
      onUpdate({ ...{ title, tags, profileImagePath, profileImageAlt, companyName, backgroundColor, titleColor, contentColor, accentColor }, tags: newTags });
    }
  };

  const handleTitleCancel = () => {
    setCurrentTitle(title);
    setEditingTitle(false);
  };

  const handleTagCancel = () => {
    setCurrentTags(tags);
    setEditingTags(null);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, tags, profileImagePath, profileImageAlt, companyName, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleCompanyLogoUploaded = (newLogoPath: string) => {
    setCurrentCompanyLogoPath(newLogoPath);
    if (onUpdate) {
      onUpdate({ ...{ title, tags, profileImagePath, profileImageAlt, companyName, backgroundColor, titleColor, contentColor, accentColor }, companyLogoPath: newLogoPath });
    }
  };

  return (
    <div className="benefits-tags-slide-template inter-theme" style={slideStyles}>


      {/* Tags Block - contains everything except logo */}
      <div style={tagsBlockStyles}>
        {/* Profile image with orange background */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          overflow: 'hidden',
          position: 'absolute',
          left: '75px',
          top: '25px',
          backgroundColor: '#E36957', // Orange background as per screenshot
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

        {/* Title */}
        <div style={{
          fontSize: '44px',
          color: '#626262', // Dark grey color as per screenshot
          lineHeight: '1.1',
          position: 'absolute',
          top: '60px',
          left: '300px',
        }}>
          {isEditable && editingTitle ? (
            <ImprovedInlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              className="benefits-tags-title-editor"
              style={inline({
                fontSize: '44px',
                color: '#626262',
                lineHeight: '1.1',
                width: '100%',
                height: 'auto',
              })}
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

        {/* Tags section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          width: '100%',
          position: 'absolute',
          top: '205px',
          left: '300px',
        }}>
          {/* First row */}
          <div style={{
            display: 'flex',
            gap: '20px'
          }}>
            {currentTags.slice(0, 2).map((tag: TagType, index: number) => (
              <div
                key={index}
                style={{
                  padding: '12px 20px',
                  border: tag.isHighlighted ? 'none' : `1px solid #4A4A4A`, // Dark grey border for non-highlighted
                  borderRadius: '8px',
                  fontSize: '34px',
                  color: tag.isHighlighted ? '#FFFFFF' : '#727272', // White for highlighted, dark grey for others
                  fontWeight: '500',
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  width: index === 0 ? '334px' : '180px'
                }}
                onClick={() => isEditable && setEditingTags(index)}
              >
                {isEditable && editingTags === index ? (
                  <ImprovedInlineEditor
                    initialValue={tag.text}
                    onSave={(value) => handleTagSave(index, value)}
                    onCancel={handleTagCancel}
                    className="tag-editor"
                    style={inline({
                      fontSize: '34px',
                      color: tag.isHighlighted ? '#FFFFFF' : '#727272',
                      fontWeight: '500',
                      width: '100%',
                      height: 'auto',
                      textAlign: 'center'
                    })}
                  />
                ) : (
                  tag.text
                )}
              </div>
            ))}
          </div>

          {/* Second row */}
          <div style={{
            display: 'flex',
            gap: '20px'
          }}>
            {currentTags.slice(2, 5).map((tag: TagType, index: number) => (
              <div
                key={index + 2}
                style={{
                  padding: '12px 20px',
                  border: tag.isHighlighted ? 'none' : `1px solid #4A4A4A`, // Dark grey border for non-highlighted
                  borderRadius: '8px',
                  fontSize: '34px',
                  color: tag.isHighlighted ? '#FFFFFF' : '#727272', // White for highlighted, dark grey for others
                  fontWeight: '500',
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  width: index === 0 ? '150px' : index === 1 ? '165px' : '180px'
                }}
                onClick={() => isEditable && setEditingTags(index + 2)}
              >
                {isEditable && editingTags === index + 2 ? (
                  <ImprovedInlineEditor
                    initialValue={tag.text}
                    onSave={(value) => handleTagSave(index + 2, value)}
                    onCancel={handleTagCancel}
                    className="tag-editor"
                    style={inline({
                      fontSize: '34px',
                      color: tag.isHighlighted ? '#FFFFFF' : '#727272',
                      fontWeight: '500',
                      width: '100%',
                      height: 'auto',
                      textAlign: 'center'
                    })}
                  />
                ) : (
                  tag.text
                )}
              </div>
            ))}
          </div>

          {/* Third row (single tag) */}
          <div style={{
            display: 'flex',
            gap: '20px',
          }}>
            {currentTags.slice(5).map((tag: TagType, index: number) => (
              <div
                key={index + 5}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#E16B53', // Orange for highlighted, darker grey for others (matching block)
                  border: tag.isHighlighted ? 'none' : `1px solid #E16B53`, // Dark grey border for non-highlighted
                  borderRadius: '8px',
                  fontSize: '34px',
                  color: '#F6DED6', // White for highlighted, dark grey for others
                  fontWeight: '500',
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  width: '370px'
                }}
                onClick={() => isEditable && setEditingTags(index + 5)}
              >
                {isEditable && editingTags === index + 5 ? (
                  <ImprovedInlineEditor
                    initialValue={tag.text}
                    onSave={(value) => handleTagSave(index + 5, value)}
                    onCancel={handleTagCancel}
                    className="tag-editor"
                    style={inline({
                      fontSize: '30px',
                      color: tag.isHighlighted ? '#FFFFFF' : '#4A4A4A',
                      fontWeight: '500',
                      width: '100%',
                      height: 'auto',
                      textAlign: 'center'
                    })}
                  />
                ) : (
                  tag.text
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer - below tags block */}
      <div style={{
        position: 'absolute',
        bottom: '15px',
        left: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '300',
          color: '#4A4A4A' // Dark grey color as per screenshot
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
                width: '30px',
                height: '30px',
                border: `2px solid #4A4A4A`, // Dark grey border as per screenshot
                borderRadius: '50%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '12px',
                  height: '2px',
                  backgroundColor: '#4A4A4A', // Dark grey color as per screenshot
                  position: 'absolute'
                }} />
                <div style={{
                  width: '2px',
                  height: '12px',
                  backgroundColor: '#4A4A4A', // Dark grey color as per screenshot
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }} />
              </div>
              <div style={{ fontSize: '14px', fontWeight: '300', color: '#4A4A4A' }}>Your Logo</div>
            </div>
          )}
        </div>
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

export default BenefitsTagsSlideTemplate; 