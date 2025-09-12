// custom_extensions/frontend/src/components/templates/HybridWorkBestPracticesSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { HybridWorkBestPracticesSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import ImprovedInlineEditor from '../ImprovedInlineEditor';

export const HybridWorkBestPracticesSlideTemplate: React.FC<HybridWorkBestPracticesSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'HYBRID WORK BEST PRACTICES',
  subtitle = '',
  mainStatement = 'To adopt a hybrid work model, you need the right people, processes, and technology.',
  practices = [
    {
      number: 1,
      title: 'Communicate with your employees',
      description: 'When you roll out hybrid work, your decisions will affect everyone in your workforce.'
    },
    {
      number: 2,
      title: 'Work with HR and IT',
      description: 'Working cross-functionally is important when adopting hybrid work to ensure your workplace technology is seamless.'
    },
    {
      number: 3,
      title: 'Create the right work environment',
      description: 'Hybrid work means the office must be a place where employees want to work, so creating a dynamic workplace is important.'
    },
    {
      number: 4,
      title: 'Delight and connect remote',
      description: 'Finding ways to connect and delight everyone is an important part of keeping employee happiness and engagement high.'
    }
  ],
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  teamImagePath = '',
  teamImageAlt = 'Team meeting',
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
  const [editingMainStatement, setEditingMainStatement] = useState(false);
  const [editingPractices, setEditingPractices] = useState<{ index: number; field: 'title' | 'description' } | null>(null);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentMainStatement, setCurrentMainStatement] = useState(mainStatement);
  const [currentPractices, setCurrentPractices] = useState(practices);

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
    backgroundColor: '#F9F8F4',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    padding: '40px 60px',
    paddingLeft: '0px',
    paddingBottom: '0px'
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{title, subtitle, mainStatement, practices, profileImagePath, profileImageAlt, teamImagePath, teamImageAlt, backgroundColor, titleColor, contentColor, accentColor}, title: newTitle });
    }
  };

  const handleMainStatementSave = (newStatement: string) => {
    setCurrentMainStatement(newStatement);
    setEditingMainStatement(false);
    if (onUpdate) {
      onUpdate({ ...{title, subtitle, mainStatement, practices, profileImagePath, profileImageAlt, teamImagePath, teamImageAlt, backgroundColor, titleColor, contentColor, accentColor}, mainStatement: newStatement });
    }
  };

  const handlePracticeSave = (index: number, field: 'title' | 'description', value: string) => {
    const newPractices = [...currentPractices];
    newPractices[index] = { ...newPractices[index], [field]: value };
    setCurrentPractices(newPractices);
    setEditingPractices(null);
    if (onUpdate) {
      onUpdate({ ...{title, subtitle, mainStatement, practices, profileImagePath, profileImageAlt, teamImagePath, teamImageAlt, backgroundColor, titleColor, contentColor, accentColor}, practices: newPractices });
    }
  };

  const handleTitleCancel = () => {
    setCurrentTitle(title);
    setEditingTitle(false);
  };

  const handleMainStatementCancel = () => {
    setCurrentMainStatement(mainStatement);
    setEditingMainStatement(false);
  };

  const handlePracticeCancel = () => {
    setCurrentPractices(practices);
    setEditingPractices(null);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{title, subtitle, mainStatement, practices, profileImagePath, profileImageAlt, teamImagePath, teamImageAlt, backgroundColor, titleColor, contentColor, accentColor}, profileImagePath: newImagePath });
    }
  };

  const handleTeamImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{title, subtitle, mainStatement, practices, profileImagePath, profileImageAlt, teamImagePath, teamImageAlt, backgroundColor, titleColor, contentColor, accentColor}, teamImagePath: newImagePath });
    }
  };

  return (
    <div className="hybrid-work-best-practices-slide-template inter-theme" style={slideStyles}>
      {/* Main content with two columns */}
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#F9F8F4',
        display: 'flex',
        padding: '40px 60px',
        paddingRight: '0px',
        paddingBottom: '0px'
      }}>
        {/* Left column */}
        <div style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingRight: '40px'
        }}>
          {/* Top content */}
          <div>
            {/* Header */}
            <div style={{
              fontSize: '14px',
              color: '#A2A19D',
              marginBottom: '20px',
              fontWeight: '300'
            }}>
              {isEditable && editingTitle ? (
                <ImprovedInlineEditor
                  initialValue={currentTitle}
                  onSave={handleTitleSave}
                  onCancel={handleTitleCancel}
                  className="hybrid-title-editor"
                  style={{
                    fontSize: '14px',
                    color: themeContent,
                    fontWeight: '300',
                    width: '100%',
                    height: 'auto'
                  
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

            {/* Main statement */}
            <div style={{
              fontSize: '24px',
              maxWidth: '335px',
              color: '#5B5A57',
              lineHeight: '1.3',
              marginBottom: '40px'
            }}>
              {isEditable && editingMainStatement ? (
                <ImprovedInlineEditor
                  initialValue={currentMainStatement}
                  onSave={handleMainStatementSave}
                  onCancel={handleMainStatementCancel}
                  multiline={true}
                  className="hybrid-main-statement-editor"
                  style={{
                    fontSize: '24px',
                    maxWidth: '335px',
                    color: themeTitle,
                    lineHeight: '1.3',
                    width: '100%',
                    height: 'auto'
                  
}}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingMainStatement(true)}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {currentMainStatement}
                </div>
              )}
            </div>
          </div>

          {/* Profile image at bottom */}
          <div style={{
            width: '165px',
            height: '165px',
            borderRadius: '50%',
            overflow: 'hidden',
            alignSelf: 'flex-start',
            position: 'absolute',
            bottom: '25px',
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

        {/* Right column */}
        <div style={{
          width: '71%',
          height: '370px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {/* Practices section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            marginBottom: '10px'
          }}>
            {currentPractices.map((practice: { number: number; title: string; description: string }, index: number) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px',
                  alignItems: 'flex-start',
                  marginBottom: '30px'
                }}
              >
                {/* Number */}
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#2A2828',
                  color: (index === 1 || index === 2) ? '#B7B7B7' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {practice.number}
                </div>

                {/* Content */}
                <div style={{
                  flex: '1'
                }}>
                  {/* Title */}
                  <div style={{
                    fontSize: '13px',
                    color: '#6F6E6A',
                    marginBottom: '8px',
                    lineHeight: '1.2'
                  }}>
                    {isEditable && editingPractices?.index === index && editingPractices?.field === 'title' ? (
                      <ImprovedInlineEditor
                        initialValue={practice.title}
                        onSave={(value) => handlePracticeSave(index, 'title', value)}
                        onCancel={handlePracticeCancel}
                        className="practice-title-editor"
                        style={{
                          fontSize: '13px',
                          color: '#6F6E6A',
                          lineHeight: '1.2',
                          width: '100%',
                          height: 'auto'
                        }}
                      />
                    ) : (
                      <div
                        onClick={() => isEditable && setEditingPractices({ index, field: 'title' })}
                        style={{
                          cursor: isEditable ? 'pointer' : 'default',
                          userSelect: 'none'
                        }}
                      >
                        {practice.title}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div style={{
                    fontSize: '11px',
                    color: '#AEADA9',
                    maxWidth: '230px',
                    lineHeight: '1.4'
                  }}>
                    {isEditable && editingPractices?.index === index && editingPractices?.field === 'description' ? (
                      <ImprovedInlineEditor
                        initialValue={practice.description}
                        onSave={(value) => handlePracticeSave(index, 'description', value)}
                        onCancel={handlePracticeCancel}
                        multiline={true}
                        className="practice-description-editor"
                        style={{
                          fontSize: '11px',
                          color: '#AEADA9',
                          lineHeight: '1.4',
                          width: '100%',
                          height: 'auto',
                          minHeight: '40px'
                        }}
                      />
                    ) : (
                      <div
                        onClick={() => isEditable && setEditingPractices({ index, field: 'description' })}
                        style={{
                          cursor: isEditable ? 'pointer' : 'default',
                          userSelect: 'none'
                        }}
                      >
                        {practice.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Team image at bottom */}
          <div style={{
            width: '100%',
            height: '90%',
          }}>
            <ClickableImagePlaceholder
              imagePath={teamImagePath}
              onImageUploaded={handleTeamImageUploaded}
              size="LARGE"
              position="CENTER"
              description="Team meeting"
              isEditable={isEditable}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '0px',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HybridWorkBestPracticesSlideTemplate; 