// custom_extensions/frontend/src/components/templates/PsychologicalSafetySlideTemplate.tsx

import React, { useState } from 'react';
import { PsychologicalSafetySlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

  const inline = (style: React.CSSProperties): React.CSSProperties => ({
    ...style,
    background:'transparent',
    border:'none',
    outline:'none',
    padding:0,
    margin:0
  });

export const PsychologicalSafetySlideTemplate: React.FC<PsychologicalSafetySlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Fostering Psychological Safety',
  content = 'Studies indicate that teams with a high level of psychological safety have a 21% higher chance of delivering high-quality results.',
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
  const [editingContent, setEditingContent] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentContent, setCurrentContent] = useState(content);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#3F3395',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, content, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleContentSave = (newContent: string) => {
    setCurrentContent(newContent);
    setEditingContent(false);
    if (onUpdate) {
      onUpdate({ ...{ title, content, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, content: newContent });
    }
  };

  const handleTitleCancel = () => {
    setCurrentTitle(title);
    setEditingTitle(false);
  };

  const handleContentCancel = () => {
    setCurrentContent(content);
    setEditingContent(false);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, content, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  return (
    <div className="psychological-safety-slide-template inter-theme" style={slideStyles}>
      {/* Main Card */}
      <div style={inline({
        width: '600px',
        height: '336px',
        backgroundColor: '#6955F3',
        borderRadius: '30px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative'
      })}>
                 {/* Profile Image - Top Left */}
         <div style={inline({
           position: 'absolute',
           top: '40px',
           left: '40px',
           width: '80px',
           height: '80px',
           borderRadius: '50%',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center'
         })}>
           <ClickableImagePlaceholder
             imagePath={profileImagePath}
             onImageUploaded={handleProfileImageUploaded}
             size="MEDIUM"
             position="CENTER"
             description="Profile"
             isEditable={isEditable}
             style={inline({
               width: '100%',
               height: '100%',
               borderRadius: '50%',
               objectFit: 'cover',
               overflow: 'hidden'
             })}
           />
         </div>

        {/* Title */}
        <div style={inline({
          fontSize: '30px',
          color: '#FFFFFF',
          fontWeight: 'bold',
          lineHeight: '1.2',
          marginTop: '106px',
        })}>
          {isEditable && editingTitle ? (
            <ImprovedInlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={true}
              className="psychological-safety-title-editor"
              style={inline({
                fontSize: '30px',
                color: '#FFFFFF',
                fontWeight: 'bold',
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

        {/* Content */}
        <div style={inline({
          fontSize: '18px',
          color: '#A496F3',
          lineHeight: '1.5',
          marginBottom: '5px'
        })}>
          {isEditable && editingContent ? (
            <ImprovedInlineEditor
              initialValue={currentContent}
              onSave={handleContentSave}
              onCancel={handleContentCancel}
              multiline={true}
              className="psychological-safety-content-editor"
              style={inline({
                fontSize: '18px',
                color: '#A496F3',
                lineHeight: '1.5'
              })}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingContent(true)}
              style={inline({
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none'
              })}
            >
              {currentContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PsychologicalSafetySlideTemplate; 