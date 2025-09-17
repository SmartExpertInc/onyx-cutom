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
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [editingYourLogoText, setEditingYourLogoText] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentTags, setCurrentTags] = useState(tags);
  const [currentPageNumber, setCurrentPageNumber] = useState('06');
  const [currentYourLogoText, setCurrentYourLogoText] = useState('Your Logo');
  const [currentCompanyLogoPath, setCurrentCompanyLogoPath] = useState(companyLogoPath);
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#E0E7FF', // Light grey background as per screenshot
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    padding: '40px 60px',
  };

  // Tags block styles
  const tagsBlockStyles: React.CSSProperties = {
    backgroundColor: '#E0E7FF', // Darker grey for tags block
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

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    if (onUpdate) {
      onUpdate({ ...{ title, tags, profileImagePath, profileImageAlt, companyName, backgroundColor, titleColor, contentColor, accentColor }, pageNumber: newPageNumber });
    }
  };

  const handleYourLogoTextSave = (newYourLogoText: string) => {
    setCurrentYourLogoText(newYourLogoText);
    setEditingYourLogoText(false);
    if (onUpdate) {
      onUpdate({ ...{ title, tags, profileImagePath, profileImageAlt, companyName, backgroundColor, titleColor, contentColor, accentColor }, yourLogoText: newYourLogoText });
    }
  };

  return (
    <div className="benefits-tags-slide-template" style={slideStyles}>
      {/* Logo in top-left corner */}
      <div style={{
        position: 'absolute',
        top: '30px',
        left: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
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
            gap: '10px',
            cursor: isEditable ? 'pointer' : 'default'
          }}
          onClick={() => isEditable && setShowLogoUploadModal(true)}
          >
            <div style={{
              width: '30px',
              height: '30px',
              border: '2px solid #000000',
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '12px',
                height: '2px',
                backgroundColor: '#000000',
                position: 'absolute'
              }} />
              <div style={{
                width: '2px',
                height: '12px',
                backgroundColor: '#000000',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }} />
            </div>
            {isEditable && editingYourLogoText ? (
              <ImprovedInlineEditor
                initialValue={currentYourLogoText}
                onSave={handleYourLogoTextSave}
                onCancel={() => setEditingYourLogoText(false)}
                className="your-logo-text-editor"
                style={{
                  fontSize: '14px',
                  fontWeight: '400',
                  color: '#000000',
                  width: '80px',
                  height: 'auto',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none'
                }}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingYourLogoText(true)}
                style={{
                  fontSize: '14px',
                  fontWeight: '400',
                  color: '#000000',
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none'
                }}
              >
                {currentYourLogoText}
              </div>
            )}
          </div>
        )}
      </div>

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
          top: '100px',
          backgroundColor: 'linear-gradient(90deg, #0F58F9 0%, #1023A1 100%)', // Orange background as per screenshot
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
          color: '#09090B', // Dark grey color as per screenshot
          lineHeight: '1.1',
          position: 'absolute',
          top: '100px',
          left: '300px',
        }}>
          {isEditable && editingTitle ? (
            <ImprovedInlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              className="benefits-tags-title-editor"
              style={{
                fontSize: '44px',
                color: '#626262',
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
          {/* First row - 3 tags */}
          <div style={{
            display: 'flex',
            gap: '20px'
          }}>
            {currentTags.slice(0, 3).map((tag: TagType, index: number) => (
              <div
                key={index}
                style={{
                  padding: '12px 20px',
                  border: tag.isHighlighted ? 'none' : `1px solid #09090B`, // Dark grey border for non-highlighted
                  borderRadius: '40px',
                  fontSize: '34px',
                  color: tag.isHighlighted ? '#FFFFFF' : '#09090B', // White for highlighted, dark grey for others
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
                      color: tag.isHighlighted ? '#FFFFFF' : '#727272',
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

          {/* Second row - 2 tags */}
          <div style={{
            display: 'flex',
            gap: '20px'
          }}>
            {currentTags.slice(3, 5).map((tag: TagType, index: number) => (
              <div
                key={index + 3}
                style={{
                  padding: '12px 20px',
                  border: tag.isHighlighted ? 'none' : `1px solid #09090B`, // Dark grey border for non-highlighted
                  borderRadius: '40px',
                  fontSize: '34px',
                  color: tag.isHighlighted ? '#FFFFFF' : '#09090B', // White for highlighted, dark grey for others
                  fontWeight: '500',
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  width: index === 0 ? '150px' : index === 1 ? '165px' : '180px'
                }}
                onClick={() => isEditable && setEditingTags(index + 3)}
              >
                {isEditable && editingTags === index + 3 ? (
                  <ImprovedInlineEditor
                    initialValue={tag.text}
                    onSave={(value) => handleTagSave(index + 3, value)}
                    onCancel={handleTagCancel}
                    className="tag-editor"
                    style={{
                      fontSize: '34px',
                      color: tag.isHighlighted ? '#FFFFFF' : '#727272',
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

      {/* Page number with line */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Small line */}
        <div style={{
          width: '20px',
          height: '1px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }} />
        {/* Page number */}
        {isEditable && editingPageNumber ? (
          <ImprovedInlineEditor
            initialValue={currentPageNumber}
            onSave={handlePageNumberSave}
            onCancel={() => setEditingPageNumber(false)}
            className="page-number-editor"
            style={{
              color: '#000000',
              fontSize: '17px',
              fontWeight: '300',
              width: '30px',
              height: 'auto',
              background: 'transparent',
              border: 'none',
              outline: 'none'
            }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingPageNumber(true)}
            style={{
              color: '#000000',
              fontSize: '17px',
              fontWeight: '300',
              cursor: isEditable ? 'pointer' : 'default',
              userSelect: 'none'
            }}
          >
            {currentPageNumber}
          </div>
        )}
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