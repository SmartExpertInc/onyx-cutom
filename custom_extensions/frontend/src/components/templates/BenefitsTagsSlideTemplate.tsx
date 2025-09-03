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

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '650px',
    backgroundColor: '#F5F5F5', // Light grey background as per screenshot
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'end',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    padding: '60px 80px',
    border: '2px solid #FFFFFF', // White border as per screenshot
  };

  // Tags block styles
  const tagsBlockStyles: React.CSSProperties = {
    position: 'absolute',
    top: '200px', // Below the profile image and title
    left: '80px',
    right: '80px',
    bottom: '80px', // Leave space for logo at bottom
    backgroundColor: '#E0E0E0', // Darker grey for tags block
    borderRadius: '12px',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
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
      {/* Top section with title and profile image */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '60px'
      }}>
        {/* Title */}
        <div style={{
          fontSize: '49px',
          color: '#4A4A4A', // Dark grey color as per screenshot
          lineHeight: '1.1',
          marginTop: '40px',
          marginLeft: '-332%'
        }}>
          {isEditable && editingTitle ? (
            <ImprovedInlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              className="benefits-tags-title-editor"
              style={{
                fontSize: '49px',
                color: '#4A4A4A',
                lineHeight: '1.1',
                width: '100%',
                height: 'auto',
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

        {/* Profile image with orange background */}
        <div style={{
          width: '155px',
          height: '155px',
          borderRadius: '50%',
          overflow: 'hidden',
          position: 'absolute',
          left: '60px',
          backgroundColor: '#FF6B35', // Orange background as per screenshot
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

      {/* Tags Block */}
      <div style={tagsBlockStyles}>
        {/* Tags section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          maxWidth: '645px',
          position: 'relative',
          left: '-23%'
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
                backgroundColor: tag.isHighlighted ? '#FF6B35' : '#E0E0E0', // Orange for highlighted, darker grey for others (matching block)
                border: tag.isHighlighted ? 'none' : `1px solid #4A4A4A`, // Dark grey border for non-highlighted
                borderRadius: '8px',
                fontSize: '34px',
                color: tag.isHighlighted ? '#FFFFFF' : '#4A4A4A', // White for highlighted, dark grey for others
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
                  style={{
                    fontSize: '34px',
                    color: tag.isHighlighted ? '#FFFFFF' : '#4A4A4A',
                    fontWeight: '500',
                    width: '100%',
                    height: 'auto',
                    textAlign: 'center'
                  }}
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
                backgroundColor: tag.isHighlighted ? '#FF6B35' : '#E0E0E0', // Orange for highlighted, darker grey for others (matching block)
                border: tag.isHighlighted ? 'none' : `1px solid #4A4A4A`, // Dark grey border for non-highlighted
                borderRadius: '8px',
                fontSize: '34px',
                color: tag.isHighlighted ? '#FFFFFF' : '#4A4A4A', // White for highlighted, dark grey for others
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
                  style={{
                    fontSize: '34px',
                    color: tag.isHighlighted ? '#FFFFFF' : '#4A4A4A',
                    fontWeight: '500',
                    width: '100%',
                    height: 'auto',
                    textAlign: 'center'
                  }}
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
                backgroundColor: tag.isHighlighted ? '#FF6B35' : '#E0E0E0', // Orange for highlighted, darker grey for others (matching block)
                border: tag.isHighlighted ? 'none' : `1px solid #4A4A4A`, // Dark grey border for non-highlighted
                borderRadius: '8px',
                fontSize: '34px',
                color: tag.isHighlighted ? '#FFFFFF' : '#4A4A4A', // White for highlighted, dark grey for others
                fontWeight: '500',
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none',
                display: 'flex',
                justifyContent: 'center',
                width: '354px'
              }}
              onClick={() => isEditable && setEditingTags(index + 5)}
            >
              {isEditable && editingTags === index + 5 ? (
                <ImprovedInlineEditor
                  initialValue={tag.text}
                  onSave={(value) => handleTagSave(index + 5, value)}
                  onCancel={handleTagCancel}
                  className="tag-editor"
                  style={{
                    fontSize: '30px',
                    color: tag.isHighlighted ? '#FFFFFF' : '#4A4A4A',
                    fontWeight: '500',
                    width: '100%',
                    height: 'auto',
                    textAlign: 'center'
                  }}
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
        bottom: '25px',
        left: '80px',
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