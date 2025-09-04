// custom_extensions/frontend/src/components/templates/OralHealthConditionsSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { OralHealthConditionsSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export const OralHealthConditionsSlideTemplate: React.FC<OralHealthConditionsSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Why is oral are linked to oral health?',
  description = 'Research shows that gingivitis and periodontitis can contribute to certain health conditions, including:',
  conditions = [
    { number: '01', condition: 'Cardiovascular disease' },
    { number: '02', condition: 'Stroke' },
    { number: '03', condition: 'Endocarditis' },
    { number: '04', condition: 'Pneumonia' },
    { number: '05', condition: 'Pregnancy complications' },
    { number: '06', condition: 'Diabetes' }
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
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingConditions, setEditingConditions] = useState<{ index: number; field: 'number' | 'condition' } | null>(null);
  
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);
  const [currentConditions, setCurrentConditions] = useState(conditions);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#FFFFFF', // White background as per screenshot
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
      onUpdate({ ...{ title, description, conditions, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleDescriptionSave = (newDescription: string) => {
    setCurrentDescription(newDescription);
    setEditingDescription(false);
    if (onUpdate) {
      onUpdate({ ...{ title, description, conditions, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, description: newDescription });
    }
  };

  const handleConditionSave = (index: number, field: 'number' | 'condition', newValue: string) => {
    const newConditions = [...currentConditions];
    newConditions[index] = { ...newConditions[index], [field]: newValue };
    setCurrentConditions(newConditions);
    setEditingConditions(null);
    if (onUpdate) {
      onUpdate({ ...{ title, description, conditions, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, conditions: newConditions });
    }
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, description, conditions, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  return (
    <div className="oral-health-conditions-slide-template inter-theme" style={slideStyles}>
      {/* Left Section - Text Content */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '60px',
        width: '60%',
        height: 'calc(100% - 80px)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Title */}
        <div style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#4A4A4A', // Dark gray/black color as per screenshot
          marginBottom: '20px',
          lineHeight: '1.1',
        }}>
          {isEditable && editingTitle ? (
            <ImprovedInlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={() => setEditingTitle(false)}
              className="oral-health-title-editor"
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

        {/* Description */}
        <div style={{
          fontSize: '18px',
          color: '#4A4A4A', // Dark gray/black color as per screenshot
          marginBottom: '30px',
          lineHeight: '1.4',
        }}>
          {isEditable && editingDescription ? (
            <ImprovedInlineEditor
              initialValue={currentDescription}
              onSave={handleDescriptionSave}
              onCancel={() => setEditingDescription(false)}
              className="oral-health-description-editor"
              multiline={true}
              style={{
                fontSize: '18px',
                color: '#4A4A4A',
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

        {/* Conditions List */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
          flex: 1,
        }}>
          {currentConditions.map((condition, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}>
              {/* Number */}
              <div style={{
                fontSize: '18px',
                color: '#888888', // Lighter gray color for numbers as per screenshot
                fontWeight: '500',
                minWidth: '30px',
                lineHeight: '1.3',
              }}>
                {isEditable && editingConditions?.index === index && editingConditions?.field === 'number' ? (
                  <ImprovedInlineEditor
                    initialValue={condition.number}
                    onSave={(value) => handleConditionSave(index, 'number', value)}
                    onCancel={() => setEditingConditions(null)}
                    className="condition-number-editor"
                    style={{
                      fontSize: '18px',
                      color: '#888888',
                      fontWeight: '500',
                      width: '100%',
                      height: 'auto',
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingConditions({ index, field: 'number' })}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                  >
                    {condition.number}
                  </div>
                )}
              </div>

              {/* Condition */}
              <div style={{
                fontSize: '18px',
                color: '#4A4A4A', // Dark gray/black color as per screenshot
                lineHeight: '1.3',
                flex: 1,
              }}>
                {isEditable && editingConditions?.index === index && editingConditions?.field === 'condition' ? (
                  <ImprovedInlineEditor
                    initialValue={condition.condition}
                    onSave={(value) => handleConditionSave(index, 'condition', value)}
                    onCancel={() => setEditingConditions(null)}
                    className="condition-text-editor"
                    style={{
                      fontSize: '18px',
                      color: '#4A4A4A',
                      lineHeight: '1.3',
                      width: '100%',
                      height: 'auto',
                    }}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingConditions({ index, field: 'condition' })}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                  >
                    {condition.condition}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Section - Blue Background with Profile Image */}
      <div style={{
        position: 'absolute',
        top: '0',
        right: '0',
        width: '40%',
        height: '100%',
        backgroundColor: '#1E40AF', // Vibrant blue background as per screenshot
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        {/* Geometric Overlays */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '60px',
          height: '40px',
          border: '1px solid #FFFFFF',
          borderRight: 'none',
          borderBottom: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '40px',
          border: '1px solid #FFFFFF',
          borderLeft: 'none',
          borderTop: 'none',
        }} />

        {/* Profile Image */}
        <div style={{
          width: '300px',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <ClickableImagePlaceholder
            imagePath={profileImagePath}
            onImageUploaded={handleProfileImageUploaded}
            size="LARGE"
            position="CENTER"
            description="Medical professional photo"
            isEditable={isEditable}
            style={{
              width: '250px',
              height: '350px',
              borderRadius: '8px',
              objectFit: 'cover'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default OralHealthConditionsSlideTemplate;