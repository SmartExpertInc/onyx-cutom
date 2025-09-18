// custom_extensions/frontend/src/components/templates/ProofStatisticsSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ProofStatisticsSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export const ProofStatisticsSlideTemplate: React.FC<ProofStatisticsSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  tagText = 'By the Numbers',
  title = 'The Proof Is in the Pudding',
  description = 'We know that numbers speak louder than words, so here are some key stats that demonstrate the power of [Product Name]:',
  statistics = [
    { value: 'XX%', description: 'Percentage increase in productivity' },
    { value: 'XX%', description: 'Decrease in customer complaints' },
    { value: 'XX%', description: 'Percentage increase in revenue' },
    { value: 'XM', description: 'Percentage increase in revenue' },
    { value: 'XX%', description: 'Percentage increase in revenue' },
    { value: 'XM', description: 'Percentage increase in revenue' }
  ],
  conclusionText = 'With these impressive results, it\'s clear that [Product Name] is the real deal, Don\'t miss out on the opportunity to take your business to the next level- try [Product Name] today.',
  bulletPoints = [
    'With these impressive results, it\'s clear that',
    'With these impressive results, it\'s clear that',
    'With these impressive results, it\'s clear that'
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

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#1A1A1A', // Dark background as per screenshot
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
    padding: '40px 60px',
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

  return (
    <div className="proof-statistics-slide-template inter-theme" style={slideStyles}>
      {/* Tag */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '60px',
        backgroundColor: '#282828', // Slightly lighter dark gray
        padding: '8px 16px',
        fontSize: '14px',
        color: '#A1A1A1',
      }}>
        {isEditable && editingTagText ? (
          <ImprovedInlineEditor
            initialValue={currentTagText}
            onSave={handleTagTextSave}
            onCancel={() => setEditingTagText(false)}
            className="tag-text-editor"
            style={{
              fontSize: '14px',
              color: '#FFFFFF',
              width: '100%',
              height: 'auto',
            }}
          />
        ) : (
          <div
            onClick={() => isEditable && setEditingTagText(true)}
            style={{
              cursor: isEditable ? 'pointer' : 'default',
              userSelect: 'none'
            }}
          >
            {currentTagText}
          </div>
        )}
      </div>

      {/* Title */}
      <div style={{
        position: 'absolute',
        top: '95px',
        left: '60px',
        fontSize: '38px',
        fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
        color: '#DFDFDF',
        lineHeight: '1.1',
        maxWidth: '600px',
      }}>
        {isEditable && editingTitle ? (
          <ImprovedInlineEditor
            initialValue={currentTitle}
            onSave={handleTitleSave}
            onCancel={() => setEditingTitle(false)}
            className="proof-title-editor"
            style={{
              fontSize: '38px',
              fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
              color: '#DFDFDF',
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

      {/* Description */}
      <div style={{
        position: 'absolute',
        top: '155px',
        left: '60px',
        fontSize: '13px',
        color: '#929292',
        lineHeight: '1.4',
        maxWidth: '454px',
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
              color: '#FFFFFF',
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
        top: '240px',
        left: '60px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: '30px',
        width: '600px',
        backgroundColor: '#292929',
        padding: '44px',
        borderRadius: '2px',
        paddingTop: '25px',
        paddingBottom: '35px',
      }}>
        {currentStatistics.map((stat, index) => (
          <div key={index} style={{
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Statistic Value */}
            <div style={{
              fontSize: '32px',
              fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
              color: '#E1E1E1',
              marginBottom: '12px',
            }}>
              {isEditable && editingStatistics?.index === index && editingStatistics?.field === 'value' ? (
                <ImprovedInlineEditor
                  initialValue={stat.value}
                  onSave={(value) => handleStatisticSave(index, 'value', value)}
                  onCancel={() => setEditingStatistics(null)}
                  className="statistic-value-editor"
                  style={{
                    fontSize: '32px',
                    fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
                    color: '#E1E1E1',
                    width: '100%',
                    height: 'auto',
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingStatistics({ index, field: 'value' })}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {stat.value}
                </div>
              )}
            </div>

            {/* Statistic Description */}
            <div style={{
              fontSize: '14px',
              color: '#989898',
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
                    color: '#989898',
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
        top: '240px',
        right: '60px',
        width: '400px',
      }}>
        {/* Conclusion Text */}
        <div style={{
          fontSize: '14px',
          color: '#939393',
          lineHeight: '1.4',
          marginBottom: '20px',
        }}>
          {isEditable && editingConclusionText ? (
            <ImprovedInlineEditor
              initialValue={currentConclusionText}
              onSave={handleConclusionTextSave}
              onCancel={() => setEditingConclusionText(false)}
              className="conclusion-text-editor"
              multiline={true}
              style={{
                fontSize: '14px',
                color: '#939393',
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
          gap: '8px',
        }}>
          {currentBulletPoints.map((bulletPoint, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}>
              <div style={{
                width: '19px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: '#8C51F6', // Purple circle
                marginTop: '6px',
                flexShrink: 0,
              }} />
              <div style={{
                fontSize: '16px',
                color: '#8E8E8E',
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
                      fontSize: '16px',
                      color: '#8E8E8E',
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
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        backgroundColor: '#292929',
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
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            position: 'relative',
            bottom: '-15px',
            objectFit: 'cover'
          }}
        />
      </div>
    </div>
  );
};

export default ProofStatisticsSlideTemplate;