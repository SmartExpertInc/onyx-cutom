// custom_extensions/frontend/src/components/templates/DeiStandardsMethodsSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { DeiStandardsMethodsSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export const DeiStandardsMethodsSlideTemplate: React.FC<DeiStandardsMethodsSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Methods to Meet DEI Standards',
  methods = [
    {
      title: 'Diverse Recruitment:',
      bulletPoints: [
        'Source candidates from underrepresented groups.',
        'Use blind screening processes to focus on skills and qualifications.'
      ]
    },
    {
      title: 'Mentorship and Sponsorship Programs:',
      bulletPoints: [
        'Mentor and sponsor diverse talent.',
        'Create opportunities for growth & advancement.'
      ]
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
  const [editingMethodTitles, setEditingMethodTitles] = useState<number | null>(null);
  const [editingBulletPoints, setEditingBulletPoints] = useState<{ methodIndex: number; bulletIndex: number } | null>(null);
  
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentMethods, setCurrentMethods] = useState(methods);

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
      onUpdate({ ...{ title, methods, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleMethodTitleSave = (methodIndex: number, newTitle: string) => {
    const newMethods = [...currentMethods];
    newMethods[methodIndex] = { ...newMethods[methodIndex], title: newTitle };
    setCurrentMethods(newMethods);
    setEditingMethodTitles(null);
    if (onUpdate) {
      onUpdate({ ...{ title, methods, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, methods: newMethods });
    }
  };

  const handleBulletPointSave = (methodIndex: number, bulletIndex: number, newValue: string) => {
    const newMethods = [...currentMethods];
    newMethods[methodIndex].bulletPoints[bulletIndex] = newValue;
    setCurrentMethods(newMethods);
    setEditingBulletPoints(null);
    if (onUpdate) {
      onUpdate({ ...{ title, methods, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, methods: newMethods });
    }
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, methods, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  return (
    <div className="dei-standards-methods-slide-template inter-theme" style={slideStyles}>
      {/* Header Section */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        height: '120px',
        backgroundColor: '#10B981', // Bright green background as per screenshot
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 60px',
      }}>
        {/* Title */}
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#FFFFFF', // White text as per screenshot
          lineHeight: '1.1',
        }}>
          {isEditable && editingTitle ? (
            <ImprovedInlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={() => setEditingTitle(false)}
              className="dei-title-editor"
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#FFFFFF',
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

        {/* Profile Image */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: '#8B5CF6', // Light blue/lavender background as per screenshot
          border: '2px solid #000000', // Black border as per screenshot
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

      {/* Main Content Section */}
      <div style={{
        position: 'absolute',
        top: '120px',
        left: '60px',
        right: '60px',
        bottom: '40px',
        backgroundColor: '#FFFFFF', // White background as per screenshot
        borderRadius: '12px',
        padding: '40px',
        border: '1px solid #000000', // Black border as per screenshot
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
      }}>
        {currentMethods.map((method, methodIndex) => (
          <div key={methodIndex} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {/* Method Title */}
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#4A4A4A', // Dark gray/black color as per screenshot
              marginBottom: '8px',
            }}>
              {isEditable && editingMethodTitles === methodIndex ? (
                <ImprovedInlineEditor
                  initialValue={method.title}
                  onSave={(value) => handleMethodTitleSave(methodIndex, value)}
                  onCancel={() => setEditingMethodTitles(null)}
                  className="method-title-editor"
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#4A4A4A',
                    width: '100%',
                    height: 'auto',
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingMethodTitles(methodIndex)}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {method.title}
                </div>
              )}
            </div>

            {/* Bullet Points */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginLeft: '20px',
            }}>
              {method.bulletPoints.map((bulletPoint, bulletIndex) => (
                <div key={bulletIndex} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#4A4A4A', // Dark gray/black color as per screenshot
                    marginTop: '8px',
                    flexShrink: 0,
                  }} />
                  <div style={{
                    fontSize: '16px',
                    color: '#4A4A4A', // Dark gray/black color as per screenshot
                    lineHeight: '1.4',
                    flex: 1,
                  }}>
                    {isEditable && editingBulletPoints?.methodIndex === methodIndex && editingBulletPoints?.bulletIndex === bulletIndex ? (
                      <ImprovedInlineEditor
                        initialValue={bulletPoint}
                        onSave={(value) => handleBulletPointSave(methodIndex, bulletIndex, value)}
                        onCancel={() => setEditingBulletPoints(null)}
                        className="bullet-point-editor"
                        style={{
                          fontSize: '16px',
                          color: '#4A4A4A',
                          lineHeight: '1.4',
                          width: '100%',
                          height: 'auto',
                        }}
                      />
                    ) : (
                      <div
                        onClick={() => isEditable && setEditingBulletPoints({ methodIndex, bulletIndex })}
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
        ))}
      </div>
    </div>
  );
};

export default DeiStandardsMethodsSlideTemplate;