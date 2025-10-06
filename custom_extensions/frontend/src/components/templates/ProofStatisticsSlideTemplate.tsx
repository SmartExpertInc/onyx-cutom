// custom_extensions/frontend/src/components/templates/ProofStatisticsSlideTemplate.tsx

import React, { useState } from 'react';
import { ProofStatisticsSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import PresentationImageUpload from '../PresentationImageUpload';

export const ProofStatisticsSlideTemplate: React.FC<ProofStatisticsSlideProps & {
  theme?: SlideTheme | string;
  pageNumber?: string;
  logoNew?: string;
}> = ({
  slideId: _slideId,
  tagText = 'Presentation',
  title = 'The Proof Is in the Pudding',
  description = 'We know that numbers speak louder than words, so here are some key stats that demonstrate the power of [Product Name]:',
  statistics = [
    { value: 'XX%', description: 'Percentage increase in productivity' },
    { value: 'XX%', description: 'Percentage increase in productivity' },
    { value: 'XX%', description: 'Percentage increase in productivity' },
    { value: 'XX%', description: 'Percentage increase in productivity' },
    { value: 'XX%', description: 'Percentage increase in productivity' },
    { value: 'XX%', description: 'Percentage increase in productivity' }
  ],
  conclusionText = 'With these impressive results, it\'s clear that [Product Name] is the real deal, Don\'t miss out on the opportunity to take your business to the next level- try [Product Name] today.',
  bulletPoints = [
    'With these impressive results, it\'s clear that',
    'With these impressive results, it\'s clear that',
    'With these impressive results, it\'s clear that'
  ],
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  pageNumber = '03',
  logoNew = '',
  backgroundColor,
  titleColor,
  contentColor,
  accentColor,
  isEditable = false,
  onUpdate,
  theme,
  voiceoverText: _voiceoverText
}) => {
  const [editingTagText, setEditingTagText] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingStatistics, setEditingStatistics] = useState<{ index: number; field: 'value' | 'description' } | null>(null);
  const [editingConclusionText, setEditingConclusionText] = useState(false);
  const [editingBulletPoints, setEditingBulletPoints] = useState<number | null>(null);
  
  const [currentTagText, setCurrentTagText] = useState(tagText);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);
  const [currentStatistics, setCurrentStatistics] = useState(statistics);
  const [currentConclusionText, setCurrentConclusionText] = useState(conclusionText);
  const [currentBulletPoints, setCurrentBulletPoints] = useState(bulletPoints);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);
  const [currentPageNumber, setCurrentPageNumber] = useState(pageNumber);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: _themeBg, titleColor: _themeTitle, contentColor: _themeContent, accentColor: _themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#FFFFFF', // White background
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    padding: '30px 60px',
  };

  const handleTagTextSave = (newTagText: string) => {
    setCurrentTagText(newTagText);
    setEditingTagText(false);
    if (onUpdate) {
      onUpdate({ ...{ tagText, title, description, statistics, conclusionText, bulletPoints, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, tagText: newTagText });
    }
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ tagText, title, description, statistics, conclusionText, bulletPoints, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleDescriptionSave = (newDescription: string) => {
    setCurrentDescription(newDescription);
    setEditingDescription(false);
    if (onUpdate) {
      onUpdate({ ...{ tagText, title, description, statistics, conclusionText, bulletPoints, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, description: newDescription });
    }
  };

  const handleStatisticSave = (index: number, field: 'value' | 'description', newValue: string) => {
    const newStatistics = [...currentStatistics];
    newStatistics[index] = { ...newStatistics[index], [field]: newValue };
    setCurrentStatistics(newStatistics);
    setEditingStatistics(null);
    if (onUpdate) {
      onUpdate({ ...{ tagText, title, description, statistics, conclusionText, bulletPoints, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, statistics: newStatistics });
    }
  };

  const handleConclusionTextSave = (newConclusionText: string) => {
    setCurrentConclusionText(newConclusionText);
    setEditingConclusionText(false);
    if (onUpdate) {
      onUpdate({ ...{ tagText, title, description, statistics, conclusionText, bulletPoints, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, conclusionText: newConclusionText });
    }
  };

  const handleBulletPointSave = (index: number, newValue: string) => {
    const newBulletPoints = [...currentBulletPoints];
    newBulletPoints[index] = newValue;
    setCurrentBulletPoints(newBulletPoints);
    setEditingBulletPoints(null);
    if (onUpdate) {
      onUpdate({ ...{ tagText, title, description, statistics, conclusionText, bulletPoints, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, bulletPoints: newBulletPoints });
    }
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ tagText, title, description, statistics, conclusionText, bulletPoints, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handlePageNumberSave = (newPageNumber: string) => {
    setCurrentPageNumber(newPageNumber);
    setEditingPageNumber(false);
    if (onUpdate) {
      onUpdate({ ...{ tagText, title, description, statistics, conclusionText, bulletPoints, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, pageNumber: newPageNumber });
    }
  };

  const handlePageNumberCancel = () => {
    setCurrentPageNumber(pageNumber);
    setEditingPageNumber(false);
  };

  const handleLogoNewUploaded = (newLogoPath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ tagText, title, description, statistics, conclusionText, bulletPoints, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, logoNew: newLogoPath });
    }
  };

  return (
    <div className="proof-statistics-slide-template inter-theme" style={slideStyles}>
      <style>{`
        .proof-statistics-slide-template *:not(.title-element) {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .proof-statistics-slide-template .title-element {
          font-family: "Lora", serif !important;
          font-weight: 500 !important;
        }
      `}</style>
      {/* Tag */}
      <div style={{
        position: 'absolute',
        top: '30px',
        left: '60px',
        marginBottom: '25px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '8px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '1px solid #09090B'
        }}>
          {/* Circle indicator */}
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#0F58F9'
          }} />
          
          {/* Tag text */}
          {isEditable && editingTagText ? (
            <ImprovedInlineEditor
              initialValue={currentTagText}
              onSave={handleTagTextSave}
              onCancel={() => setEditingTagText(false)}
              className="tag-text-editor"
              style={{
                fontSize: '18px',
                color: '#09090BCC',
                fontWeight: '400',
                fontFamily: currentTheme.fonts.contentFont,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                width: '100%',
                height: 'auto',
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingTagText(true)}
              style={{
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none',
                fontSize: '18px',
                color: '#09090BCC',
                fontWeight: '400',
                fontFamily: currentTheme.fonts.contentFont
              }}
            >
              {currentTagText}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: '100px',
        left: '60px',
        fontSize: '48px',
        fontWeight: 'bold',
        color: '#09090B',
        lineHeight: '1.1',
        maxWidth: '900px',
        fontFamily: "'Lora', serif",
      }}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={currentTitle}
            onSave={handleTitleSave}
            onCancel={() => setEditingTitle(false)}
            className="proof-title-editor title-element"
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#09090B',
              lineHeight: '1.1',
              width: '100%',
              height: 'auto',
              fontFamily: "'Lora', serif",
            }}
          />
        ) : (
          <div
            className="title-element"
            onClick={() => isEditable && setEditingTitle(true)}
            style={{
              cursor: isEditable ? 'pointer' : 'default',
              userSelect: 'none',
              // Force Lora on the element that renders text to override global Inter rule
              fontFamily: "'Lora', serif"
            }}
          >
            {currentTitle}
          </div>
        )}
      </div>

      {/* Description */}
      <div style={{
        position: 'absolute',
        top: '172px',
        left: '60px',
        fontSize: '16px',
        color: 'rgba(9, 9, 11, 0.7)',
        lineHeight: '1.4',
        maxWidth: '480px',
      }}>
        {isEditable && editingDescription ? (
          <ImprovedInlineEditor
            initialValue={currentDescription}
            onSave={handleDescriptionSave}
            onCancel={() => setEditingDescription(false)}
            className="proof-description-editor"
            multiline={true}
            style={{
              fontSize: '16px',
              color: 'rgba(9, 9, 11, 0.7)',
              lineHeight: '1.4',
              width: '100%',
              height: 'auto',
            }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingDescription(true)}
            style={{
              cursor: isEditable ? 'pointer' : 'default',
              userSelect: 'none'
            }}
          >
            {currentDescription}
          </div>
        )}
      </div>

      {/* Statistics Grid */}
      <div style={{
        position: 'absolute',
        top: '255px',
        left: '60px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: '35px',
        width: '600px',
        backgroundColor: '#F3F5FF',
        padding: '44px',
        borderRadius: '6px',
        boxShadow: '0px 13.92px 13.92px -4.64px #2A334608',
        paddingTop: '25px',
        paddingBottom: '35px',
      }}>
        {currentStatistics.map((stat, index) => (
          <div key={index} style={{
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Statistic Value */}
            <div className="title-element" style={{
              fontSize: '28px',
              fontWeight: 'semibold',
              color: '#09090B',
              marginBottom: '6px',
              fontFamily: "'Lora', serif",
            }}>
              {isEditable && editingStatistics?.index === index && editingStatistics?.field === 'value' ? (
                <ImprovedInlineEditor
                  initialValue={stat.value}
                  onSave={(value) => handleStatisticSave(index, 'value', value)}
                  onCancel={() => setEditingStatistics(null)}
                  className="statistic-value-editor title-element"
                  style={{
                    fontSize: '32px',
                    fontWeight: 'semibold',
                    color: '#09090B',
                    width: '100%',
                    height: 'auto',
                    fontFamily: "'Lora', serif",
                  }}
                />
              ) : (
                <div
                  className="title-element"
                  onClick={() => isEditable && setEditingStatistics({ index, field: 'value' })}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none',
                    fontFamily: "'Lora', serif"
                  }}
                >
                  {stat.value}
                </div>
              )}
            </div>

            {/* Statistic Description */}
            <div style={{
              fontSize: '14px',
              color: 'rgba(9, 9, 11, 0.7)',
              lineHeight: '1.3',
            }}>
              {isEditable && editingStatistics?.index === index && editingStatistics?.field === 'description' ? (
                <ImprovedInlineEditor
                  initialValue={stat.description}
                  onSave={(value) => handleStatisticSave(index, 'description', value)}
                  onCancel={() => setEditingStatistics(null)}
                  className="statistic-description-editor"
                  style={{
                    fontSize: '14px',
                    color: 'rgba(9, 9, 11, 0.7)',
                    lineHeight: '1.3',
                    width: '100%',
                    height: 'auto',
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingStatistics({ index, field: 'description' })}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {stat.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Right Section - Conclusion and Bullet Points */}
      <div style={{
        position: 'absolute',
        top: '255px',
        right: '60px',
        width: '400px',
      }}>
        {/* Conclusion Text */}
        <div style={{
          fontSize: '18px',
          color: 'rgba(9, 9, 11, 0.7)',
          lineHeight: '1.4',
          marginBottom: '40px',
        }}>
          {isEditable && editingConclusionText ? (
            <ImprovedInlineEditor
              initialValue={currentConclusionText}
              onSave={handleConclusionTextSave}
              onCancel={() => setEditingConclusionText(false)}
              className="conclusion-text-editor"
              multiline={true}
              style={{
                fontSize: '18px',
                color: 'rgba(9, 9, 11, 0.7)',
                lineHeight: '1.4',
                width: '100%',
                height: 'auto',
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingConclusionText(true)}
              style={{
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              {currentConclusionText}
            </div>
          )}
        </div>

        {/* Bullet Points */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
        }}>
          {currentBulletPoints.map((bulletPoint, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                marginTop: '8px',
                flexShrink: 0,
              }}>
                <svg width="8" height="10" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.53846 2.27823C6.15385 2.59901 6.15385 3.40099 5.53846 3.72177L1.38462 5.8871C0.769231 6.20789 -3.10607e-08 5.8069 0 5.16532L2.09658e-07 0.834678C2.40719e-07 0.193101 0.769231 -0.207887 1.38462 0.112902L5.53846 2.27823Z" fill="#0F58F9"/>
                </svg>
              </div>
              <div style={{
                fontSize: '18px',
                color: 'rgba(9, 9, 11, 0.7)',
                lineHeight: '1.4',
                flex: 1,
              }}>
                {isEditable && editingBulletPoints === index ? (
                  <ImprovedInlineEditor
                    initialValue={bulletPoint}
                    onSave={(value) => handleBulletPointSave(index, value)}
                    onCancel={() => setEditingBulletPoints(null)}
                    className="bullet-point-editor"
                    style={{
                      fontSize: '18px',
                      color: 'rgba(9, 9, 11, 0.7)',
                      lineHeight: '1.4',
                      width: '100%',
                      height: 'auto',
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingBulletPoints(index)}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                  >
                    {bulletPoint}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Image */}
      <div style={{
        position: 'absolute',
        top: '40px',
        right: '60px',
        width: '170px',
        height: '170px',
        borderRadius: '50%',
        backgroundColor: '#0F58F9',
        overflow: 'hidden',
      }}>
        <ClickableImagePlaceholder
          imagePath={profileImagePath}
          onImageUploaded={handleProfileImageUploaded}
          size="LARGE"
          position="CENTER"
          description="Profile photo"
          isEditable={isEditable}
          style={{
            width: '110%',
            height: '110%',
            borderRadius: '50%',
            position: 'relative',
            bottom: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Logo in bottom-right corner */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        right: '30px'
      }}>
        {logoNew ? (
          <ClickableImagePlaceholder
            imagePath={logoNew}
            onImageUploaded={handleLogoNewUploaded}
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
          <div 
            onClick={() => isEditable && setShowLogoUploadModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: isEditable ? 'pointer' : 'default'
            }}
          >
            <div style={{
              width: '30px',
              height: '30px',
              border: '2px solid #09090B',
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '12px', height: '2px', backgroundColor: '#09090B', position: 'absolute' }} />
              <div style={{ width: '2px', height: '12px', backgroundColor: '#09090B', position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 400, color: '#09090B', fontFamily: currentTheme.fonts.contentFont }}>Your Logo</span>
          </div>
        )}
      </div>

      {/* Page number with line */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '0px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Small line */}
        <div style={{
          width: '20px',
          height: '1px',
          backgroundColor: 'rgba(9, 9, 11, 0.6)'
        }} />
        {/* Page number */}
        {isEditable && editingPageNumber ? (
          <ImprovedInlineEditor
            initialValue={currentPageNumber}
            onSave={handlePageNumberSave}
            onCancel={handlePageNumberCancel}
            className="page-number-editor"
            style={{
              color: '#09090B99',
              fontSize: '17px',
              fontWeight: '300',
              fontFamily: currentTheme.fonts.contentFont,
              width: '30px',
              height: 'auto'
            }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingPageNumber(true)}
            style={{
              color: '#09090B99',
              fontSize: '17px',
              fontWeight: '300',
              fontFamily: currentTheme.fonts.contentFont,
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
            handleLogoNewUploaded(newLogoPath);
            setShowLogoUploadModal(false);
          }}
          title="Upload Company Logo"
        />
      )}
    </div>
  );
};

export default ProofStatisticsSlideTemplate;