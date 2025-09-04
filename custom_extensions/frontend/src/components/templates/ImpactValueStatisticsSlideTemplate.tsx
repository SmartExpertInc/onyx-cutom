// custom_extensions/frontend/src/components/templates/ImpactValueStatisticsSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ImpactValueStatisticsSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import PresentationImageUpload from '../PresentationImageUpload';

export const ImpactValueStatisticsSlideTemplate: React.FC<ImpactValueStatisticsSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Impact Value',
  subtitle = 'Statistics for effective critical thinking and problem-solving skills',
  statistics = [
    { percentage: '20%', description: 'Reduction in operational costs and inefficiencies.', backgroundColor: '#E0E0E0' },
    { percentage: '35%', description: 'Increase in innovation and problem-solving capabilities.', backgroundColor: '#F0D0C8' },
    { percentage: '50%', description: 'Likelihood of being promoted to leadership positions.', backgroundColor: '#E8A090' }
  ],
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  logoText = 'Your Logo',
  sourceText = 'Source',
  sourceLink = 'Source link',
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
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [editingStatistics, setEditingStatistics] = useState<{ index: number; field: 'percentage' | 'description' } | null>(null);
  const [editingLogoText, setEditingLogoText] = useState(false);
  const [editingSourceText, setEditingSourceText] = useState(false);
  const [editingSourceLink, setEditingSourceLink] = useState(false);
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);
  
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentSubtitle, setCurrentSubtitle] = useState(subtitle);
  const [currentStatistics, setCurrentStatistics] = useState(statistics);
  const [currentLogoText, setCurrentLogoText] = useState(logoText);
  const [currentSourceText, setCurrentSourceText] = useState(sourceText);
  const [currentSourceLink, setCurrentSourceLink] = useState(sourceLink);
  const [currentCompanyLogoPath, setCurrentCompanyLogoPath] = useState('');

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#F5F5F5', // Light gray background as per screenshot
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
      onUpdate({ ...{ title, subtitle, statistics, profileImagePath, profileImageAlt, logoText, sourceText, sourceLink, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleSubtitleSave = (newSubtitle: string) => {
    setCurrentSubtitle(newSubtitle);
    setEditingSubtitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, statistics, profileImagePath, profileImageAlt, logoText, sourceText, sourceLink, backgroundColor, titleColor, contentColor, accentColor }, subtitle: newSubtitle });
    }
  };

  const handleStatisticSave = (index: number, field: 'percentage' | 'description', newValue: string) => {
    const newStatistics = [...currentStatistics];
    newStatistics[index] = { ...newStatistics[index], [field]: newValue };
    setCurrentStatistics(newStatistics);
    setEditingStatistics(null);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, statistics, profileImagePath, profileImageAlt, logoText, sourceText, sourceLink, backgroundColor, titleColor, contentColor, accentColor }, statistics: newStatistics });
    }
  };

  const handleLogoTextSave = (newLogoText: string) => {
    setCurrentLogoText(newLogoText);
    setEditingLogoText(false);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, statistics, profileImagePath, profileImageAlt, logoText, sourceText, sourceLink, backgroundColor, titleColor, contentColor, accentColor }, logoText: newLogoText });
    }
  };

  const handleSourceTextSave = (newSourceText: string) => {
    setCurrentSourceText(newSourceText);
    setEditingSourceText(false);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, statistics, profileImagePath, profileImageAlt, logoText, sourceText, sourceLink, backgroundColor, titleColor, contentColor, accentColor }, sourceText: newSourceText });
    }
  };

  const handleSourceLinkSave = (newSourceLink: string) => {
    setCurrentSourceLink(newSourceLink);
    setEditingSourceLink(false);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, statistics, profileImagePath, profileImageAlt, logoText, sourceText, sourceLink, backgroundColor, titleColor, contentColor, accentColor }, sourceLink: newSourceLink });
    }
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, statistics, profileImagePath, profileImageAlt, logoText, sourceText, sourceLink, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleCompanyLogoUploaded = (newLogoPath: string) => {
    setCurrentCompanyLogoPath(newLogoPath);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, statistics, profileImagePath, profileImageAlt, logoText, sourceText, sourceLink, backgroundColor, titleColor, contentColor, accentColor }, companyLogoPath: newLogoPath });
    }
  };

  return (
    <div className="impact-value-statistics-slide-template inter-theme" style={slideStyles}>
      {/* Main Content Container - Gray Block */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '60px',
        right: '60px',
        bottom: '120px',
        backgroundColor: '#F5F5F5', // Light gray background
        borderRadius: '12px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
      }}>
        {/* Header Section */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '30px',
        }}>
          {/* Profile Image */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: '#E8A090', // Coral/orange background as per screenshot
            flexShrink: 0,
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

          {/* Title and Subtitle */}
          <div style={{
            flex: 1,
          }}>
            {/* Title */}
            <div style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#4A4A4A', // Dark gray color as per screenshot
              marginBottom: '8px',
              lineHeight: '1.1',
            }}>
              {isEditable && editingTitle ? (
                <ImprovedInlineEditor
                  initialValue={currentTitle}
                  onSave={handleTitleSave}
                  onCancel={() => setEditingTitle(false)}
                  className="impact-title-editor"
                  style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
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

            {/* Subtitle */}
            <div style={{
              fontSize: '16px',
              color: '#4A4A4A', // Dark gray color as per screenshot
              lineHeight: '1.3',
            }}>
              {isEditable && editingSubtitle ? (
                <ImprovedInlineEditor
                  initialValue={currentSubtitle}
                  onSave={handleSubtitleSave}
                  onCancel={() => setEditingSubtitle(false)}
                  className="impact-subtitle-editor"
                  style={{
                    fontSize: '16px',
                    color: '#4A4A4A',
                    lineHeight: '1.3',
                    width: '100%',
                    height: 'auto',
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingSubtitle(true)}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {currentSubtitle}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Boxes */}
        <div style={{
          display: 'flex',
          gap: '30px',
          justifyContent: 'center',
          flex: 1,
        }}>
          {currentStatistics.map((stat, index) => (
            <div key={index} style={{
              width: '300px',
              backgroundColor: stat.backgroundColor,
              borderRadius: '12px',
              padding: '40px 30px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              {/* Percentage */}
              <div style={{
                fontSize: '64px',
                fontWeight: 'bold',
                color: '#4A4A4A', // Dark gray color as per screenshot
                marginBottom: '16px',
                lineHeight: '1',
              }}>
                {isEditable && editingStatistics?.index === index && editingStatistics?.field === 'percentage' ? (
                  <ImprovedInlineEditor
                    initialValue={stat.percentage}
                    onSave={(value) => handleStatisticSave(index, 'percentage', value)}
                    onCancel={() => setEditingStatistics(null)}
                    className="statistic-percentage-editor"
                    style={{
                      fontSize: '64px',
                      fontWeight: 'bold',
                      color: '#4A4A4A',
                      lineHeight: '1',
                      width: '100%',
                      height: 'auto',
                      textAlign: 'center',
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingStatistics({ index, field: 'percentage' })}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                  >
                    {stat.percentage}
                  </div>
                )}
              </div>

              {/* Description */}
              <div style={{
                fontSize: '16px',
                color: '#4A4A4A', // Dark gray color as per screenshot
                lineHeight: '1.3',
              }}>
                {isEditable && editingStatistics?.index === index && editingStatistics?.field === 'description' ? (
                  <ImprovedInlineEditor
                    initialValue={stat.description}
                    onSave={(value) => handleStatisticSave(index, 'description', value)}
                    onCancel={() => setEditingStatistics(null)}
                    className="statistic-description-editor"
                    multiline={true}
                    style={{
                      fontSize: '16px',
                      color: '#4A4A4A',
                      lineHeight: '1.3',
                      width: '100%',
                      height: 'auto',
                      textAlign: 'center',
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
      </div>

      {/* Footer - Under the gray block */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '60px',
        right: '60px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '80px',
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
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
                border: '2px solid #4A4A4A',
                borderRadius: '50%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '12px',
                  height: '2px',
                  backgroundColor: '#4A4A4A',
                  position: 'absolute'
                }} />
                <div style={{
                  width: '2px',
                  height: '12px',
                  backgroundColor: '#4A4A4A',
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

        {/* Source Information */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '4px',
        }}>
          <div style={{
            fontSize: '12px',
            color: '#4A4A4A', // Dark gray color as per screenshot
          }}>
            {isEditable && editingSourceText ? (
              <ImprovedInlineEditor
                initialValue={currentSourceText}
                onSave={handleSourceTextSave}
                onCancel={() => setEditingSourceText(false)}
                className="source-text-editor"
                style={{
                  fontSize: '12px',
                  color: '#4A4A4A',
                  width: '100%',
                  height: 'auto',
                }}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingSourceText(true)}
                style={{
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none'
                }}
              >
                {currentSourceText}
              </div>
            )}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#4A4A4A', // Dark gray color as per screenshot
          }}>
            {isEditable && editingSourceLink ? (
              <ImprovedInlineEditor
                initialValue={currentSourceLink}
                onSave={handleSourceLinkSave}
                onCancel={() => setEditingSourceLink(false)}
                className="source-link-editor"
                style={{
                  fontSize: '12px',
                  color: '#4A4A4A',
                  width: '100%',
                  height: 'auto',
                }}
              />
            ) : (
              <div
                onClick={() => isEditable && setEditingSourceLink(true)}
                style={{
                  cursor: isEditable ? 'pointer' : 'default',
                  userSelect: 'none'
                }}
              >
                {currentSourceLink}
              </div>
            )}
          </div>
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

export default ImpactValueStatisticsSlideTemplate;