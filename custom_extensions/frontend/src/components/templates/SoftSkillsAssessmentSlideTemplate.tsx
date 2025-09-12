// custom_extensions/frontend/src/components/templates/SoftSkillsAssessmentSlideTemplate.tsx

import React, { useState } from 'react';
import { SoftSkillsAssessmentSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ImprovedInlineEditor from '../ImprovedInlineEditor';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background:'transparent',
    border:'none',
    outline:'none',
    padding:0,
    margin:0
  });

export const SoftSkillsAssessmentSlideTemplate: React.FC<SoftSkillsAssessmentSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'How do you assess soft skills in candidates?',
  tips = [
    { text: "Know what you're looking for in potential hires beforehand.", isHighlighted: false },
    { text: "Ask behavioral questions to learn how they've used soft skills in previous jobs", isHighlighted: false }
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
  const [editingTips, setEditingTips] = useState<number | null>(null);
  const [editingAdditionalTips, setEditingAdditionalTips] = useState<number | null>(null);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentTips, setCurrentTips] = useState(tips);
  const [currentAdditionalTips, setCurrentAdditionalTips] = useState([
    "Additional tip 1",
    "Additional tip 2"
  ]);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#ffff',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    padding: '60px 80px',
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, tips, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleTipSave = (index: number, newTip: string) => {
    const newTips = [...currentTips];
    newTips[index] = { ...newTips[index], text: newTip };
    setCurrentTips(newTips);
    setEditingTips(null);
    if (onUpdate) {
      onUpdate({ ...{ title, tips, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, tips: newTips });
    }
  };

  const handleTitleCancel = () => {
    setCurrentTitle(title);
    setEditingTitle(false);
  };

  const handleTipCancel = () => {
    setCurrentTips(tips);
    setEditingTips(null);
  };

  const handleAdditionalTipSave = (index: number, newTip: string) => {
    const newAdditionalTips = [...currentAdditionalTips];
    newAdditionalTips[index] = newTip;
    setCurrentAdditionalTips(newAdditionalTips);
    setEditingAdditionalTips(null);
    if (onUpdate) {
      onUpdate({ ...{ title, tips, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, additionalTips: newAdditionalTips });
    }
  };

  const handleAdditionalTipCancel = () => {
    setCurrentAdditionalTips([
      "Additional tip 1",
      "Additional tip 2"
    ]);
    setEditingAdditionalTips(null);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, tips, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  return (
    <div className="soft-skills-assessment-slide-template inter-theme" style={slideStyles}>
      {/* Top section with title and profile image */}
      <div style={inline({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '60px'
      })}>
        {/* Title */}
        <div style={inline({
          fontSize: '61px',
          color: '#3D3D3D',
          lineHeight: '1.2',
          maxWidth: '76%'
        })}>
          {isEditable && editingTitle ? (
            <ImprovedInlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={true}
              className="soft-skills-title-editor"
              style={inline({
                fontSize: '61px',
                color: '#3D3D3D',
                lineHeight: '1.2'
              })}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingTitle(true)}
              style={inline({
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none'
              })}
            >
              {currentTitle}
            </div>
          )}
        </div>

        {/* Profile image */}
        <div style={inline({
          width: '145px',
          height: '145px',
          borderRadius: '50%',
          overflow: 'hidden',
        })}>
          <ClickableImagePlaceholder
            imagePath={profileImagePath}
            onImageUploaded={handleProfileImageUploaded}
            size="LARGE"
            position="CENTER"
            description="Profile photo"
            isEditable={isEditable}
            style={inline({
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover'
            })}
          />
        </div>
      </div>

      {/* Tips section */}
      <div style={inline({
        display: 'flex',
        gap: '30px',
        marginTop: '-17px'
      })}>
        {currentTips.map((tip, index) => (
          <div
            key={index}
            style={inline({
              flex: '1',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            })}
          >
            {/* Main tip block */}
            <div style={inline({
              padding: '30px',
              backgroundColor: index === 0 ? '#916AF6' : index === 1 ? '#212121' : 'transparent',
              minHeight: '310px',
              display: 'flex',
              paddingLeft: '32px',
              paddingTop: '40px',
              zIndex: '2',
            })}>
              <div style={inline({
                fontSize: '32px',
                fontWeight: '500',
                color: '#EBDEF8',
                lineHeight: '1.4',
              })}>
                {isEditable && editingTips === index ? (
                  <ImprovedInlineEditor
                    initialValue={tip.text}
                    onSave={(value) => handleTipSave(index, value)}
                    onCancel={handleTipCancel}
                    multiline={true}
                    className="tip-editor"
                    style={inline({
                      fontSize: '32px',
                      maxWidth: '386px',
                      fontWeight: '500',
                      color: '#EBDEF8',
                      lineHeight: '1.4',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none'
                    })}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingTips(index)}
                    style={inline({
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none'
                    })}
                  >
                    {tip.text}
                  </div>
                )}
              </div>
            </div>

            {/* Additional block that extends out */}
            <div style={inline({
              padding: '20px',
              backgroundColor: index === 0 ? '#212121' : index === 1 ? '#916AF6' : 'transparent',
              minHeight: '80px',
              height: '304px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              top: '-303px',
              zIndex: '1',
              marginTop: '-10px', // Makes it overlap slightly
              marginLeft: '16px', // Makes it extend out to the right
              marginRight: '-11px' // Makes it extend out to the right
            })}>
              <div style={inline({
                fontSize: '18px',
                fontWeight: '400',
                color: themeBg,
                lineHeight: '1.3',
                textAlign: 'center'
              })}>
                {isEditable && editingAdditionalTips === index ? (
                  <ImprovedInlineEditor
                    initialValue={currentAdditionalTips[index]}
                    onSave={(value) => handleAdditionalTipSave(index, value)}
                    onCancel={handleAdditionalTipCancel}
                    multiline={true}
                    className="additional-tip-editor"
                    style={inline({
                      fontSize: '18px',
                      fontWeight: '400',
                      color: themeBg,
                      lineHeight: '1.3',
                      textAlign: 'center',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none'
                    })}
                  />
                ) : (
                  <div
                    onClick={() => isEditable && setEditingAdditionalTips(index)}
                    style={inline({
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none'
                    })}
                  >
                    {currentAdditionalTips[index]}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SoftSkillsAssessmentSlideTemplate; 