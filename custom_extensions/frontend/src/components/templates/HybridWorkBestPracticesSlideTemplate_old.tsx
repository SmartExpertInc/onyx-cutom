// custom_extensions/frontend/src/components/templates/HybridWorkBestPracticesSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { HybridWorkBestPracticesSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import AvatarImageDisplay from '../AvatarImageDisplay';
import { ControlledWysiwygEditor, ControlledWysiwygEditorRef } from '../editors/ControlledWysiwygEditor';
import YourLogo from '../YourLogo';

export const HybridWorkBestPracticesSlideTemplate_old: React.FC<HybridWorkBestPracticesSlideProps & {
  theme?: SlideTheme | string;
  onEditorActive?: (editor: any, field: string, computedStyles?: any) => void;
}> = ({
  slideId,
  title = 'Hybrid work best practices',
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
  logoPath = '',
  logoText = 'Your Logo',
  isEditable = false,
  onUpdate,
  theme,
  voiceoverText,
  onEditorActive
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingMainStatement, setEditingMainStatement] = useState(false);
  const [editingPractices, setEditingPractices] = useState<{ index: number; field: 'title' | 'description' } | null>(null);
  const [editingPageNumber, setEditingPageNumber] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentMainStatement, setCurrentMainStatement] = useState(mainStatement);
  const [currentPractices, setCurrentPractices] = useState(practices);
  const [currentPageNumber, setCurrentPageNumber] = useState('11');

  // Editor refs
  const titleEditorRef = useRef<ControlledWysiwygEditorRef>(null);
  const mainStatementEditorRef = useRef<ControlledWysiwygEditorRef>(null);
  const practiceTitleEditorRefs = useRef<(ControlledWysiwygEditorRef | null)[]>([]);
  const practiceDescriptionEditorRefs = useRef<(ControlledWysiwygEditorRef | null)[]>([]);
  const pageNumberEditorRef = useRef<ControlledWysiwygEditorRef>(null);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: backgroundColor || '#E0E7FF',
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
      onUpdate({ ...{ title, subtitle, mainStatement, practices, profileImagePath, profileImageAlt, teamImagePath, teamImageAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleMainStatementSave = (newStatement: string) => {
    setCurrentMainStatement(newStatement);
    setEditingMainStatement(false);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, mainStatement, practices, profileImagePath, profileImageAlt, teamImagePath, teamImageAlt, backgroundColor, titleColor, contentColor, accentColor }, mainStatement: newStatement });
    }
  };

  const handlePracticeSave = (index: number, field: 'title' | 'description', value: string) => {
    const newPractices = [...currentPractices];
    newPractices[index] = { ...newPractices[index], [field]: value };
    setCurrentPractices(newPractices);
    setEditingPractices(null);
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, mainStatement, practices, profileImagePath, profileImageAlt, teamImagePath, teamImageAlt, backgroundColor, titleColor, contentColor, accentColor }, practices: newPractices });
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
      onUpdate({ ...{ title, subtitle, mainStatement, practices, profileImagePath, profileImageAlt, teamImagePath, teamImageAlt, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  const handleTeamImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, mainStatement, practices, profileImagePath, profileImageAlt, teamImagePath, teamImageAlt, backgroundColor, titleColor, contentColor, accentColor }, teamImagePath: newImagePath });
    }
  };

  return (
    <>
      <style>{`
        .hybrid-work-best-practices-slide-template *:not(.title-element) {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        .hybrid-work-best-practices-slide-template .title-element {
          font-family: "Lora", serif !important;
          font-weight: 600 !important;
        }
        .hybrid-work-best-practices-slide-template .hybrid-title-editor,
        .hybrid-work-best-practices-slide-template .hybrid-title-editor * {
          text-transform: none !important;
          font-weight: 600 !important;
        }
        .practice-title-editor, .hybrid-title-editor {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-weight: 500 !important;
        }
        .hybrid-work-best-practices-slide-template .logo-text {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          font-weight: 600 !important;
        }
      `}</style>
      <div className="hybrid-work-best-practices-slide-template inter-theme" style={slideStyles}>
      {/* Header with page number and logo */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '35px',
        right: '60px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10
      }}>    
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          color: 'black',
          fontFamily: 'Inter, sans-serif'
        }}>
          <YourLogo
            logoPath={logoPath}
            onLogoUploaded={(p) => onUpdate && onUpdate({ logoPath: p })}
            isEditable={isEditable}
            color="#000000"
            text={logoText}
          />
        </div>
      </div>

      {/* Main content with two columns */}
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#E0E7FF',
        display: 'flex',
        padding: '40px 60px',
        paddingRight: '0px',
        paddingBottom: '0px',
        paddingTop: '40px'
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
            {/* Tag */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '30px'
            }}>
              <div style={{
                padding: '8px 18px',
                display: 'flex',
                gap: '10px',
                border: '2px solid black',
                borderRadius: '50px',
                fontSize: '18px',
                color: '#333333',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600'
              }}>
                <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                marginTop: '10px',
                backgroundColor: '#3B8BE9'
              }}></div>
                {isEditable && editingTitle ? (
                  <ControlledWysiwygEditor
                    ref={titleEditorRef}
                    initialValue={currentTitle}
                    onSave={(value) => {
                      handleTitleSave(value);
                      setEditingTitle(false);
                    }}
                    onCancel={handleTitleCancel}
                    className="hybrid-title-editor"
                    style={{
                      fontSize: '16px',
                      color: '#34353C',
                      fontWeight: '600',
                      width: '100%',
                      height: 'auto'
                    }}
                    onEditorReady={(editor, computedStyles) => {
                      if (onEditorActive) {
                        onEditorActive(editor, 'title', computedStyles);
                      }
                    }}
                  />
                ) : (
                  <div
                    className="hybrid-title-editor"
                    onClick={() => isEditable && setEditingTitle(true)}
                    style={{
                      cursor: isEditable ? 'pointer' : 'default',
                      userSelect: 'none',
                      textTransform: 'none',
                      fontWeight: '600'
                    }}
                    dangerouslySetInnerHTML={{ __html: currentTitle }}
                  />
                )}
              </div>
            </div>

            {/* Main statement */}
            <div style={{
              fontSize: '35px',
              maxWidth: '400px',
              color: 'black',
              lineHeight: '1.2',
              marginBottom: '40px',
              fontFamily: 'Lora, serif',
              fontWeight: '600'
            }}>
              {isEditable && editingMainStatement ? (
                <ControlledWysiwygEditor
                  ref={mainStatementEditorRef}
                  initialValue={currentMainStatement}
                  onSave={(value) => {
                    handleMainStatementSave(value);
                    setEditingMainStatement(false);
                  }}
                  onCancel={handleMainStatementCancel}
                  className="title-element"
                  style={{
                    fontSize: '35px',
                    maxWidth: '400px',
                    color: 'black',
                    lineHeight: '1.2',
                    width: '100%',
                    height: 'auto',
                    fontFamily: 'Lora, serif',
                    fontWeight: '600'
                  }}
                  onEditorReady={(editor, computedStyles) => {
                    if (onEditorActive) {
                      onEditorActive(editor, 'main-statement', computedStyles);
                    }
                  }}
                />
              ) : (
                <div
                  className="title-element"
                  onClick={() => isEditable && setEditingMainStatement(true)}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                  dangerouslySetInnerHTML={{ __html: currentMainStatement }}
                />
              )}
            </div>
          </div>

          {/* Profile image at bottom */}
          <div style={{
            width: '170px',
            height: '170px',
            borderRadius: '50%',
            overflow: 'hidden',
            alignSelf: 'flex-start',
            position: 'absolute',
            bottom: '60px',
            backgroundColor: '#FFFFFF'
          }}>
            <AvatarImageDisplay
              size="MEDIUM"
              position="CENTER"
              style={{
                width: '88%',
                height: '135%',
                borderRadius: '50%',
                position: 'relative',
                bottom: '0px',
                objectFit: 'cover'
              }}
            />
          </div>
        </div>

        {/* Right column */}
        <div style={{
          width: '55%',
          height: '370px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {/* Practices section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            marginBottom: '10px',
            gap: '10px 30px',
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
                  width: '24px',
                  height: '24px',
                  backgroundColor: '#0F58F9',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  flexShrink: 0,
                  borderRadius: '2px'
                }}>
                  {practice.number}
                </div>

                {/* Content */}
                <div style={{
                  flex: '1'
                }}>
                  {/* Title */}
                  <div style={{
                    fontSize: '15px',
                    color: 'black',
                    marginBottom: '8px',
                    lineHeight: '1.3',
                    fontWeight: '500',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    {isEditable && editingPractices?.index === index && editingPractices?.field === 'title' ? (
                      <ControlledWysiwygEditor
                        ref={(el) => {
                          if (el) practiceTitleEditorRefs.current[index] = el;
                        }}
                        initialValue={practice.title}
                        onSave={(value) => {
                          handlePracticeSave(index, 'title', value);
                          setEditingPractices(null);
                        }}
                        onCancel={handlePracticeCancel}
                        className="practice-title-editor"
                        style={{
                          fontSize: '15px',
                          color: 'black',
                          lineHeight: '1.3',
                          fontWeight: '500',
                          fontFamily: 'Inter, sans-serif',
                          width: '100%',
                          height: 'auto'
                        }}
                        onEditorReady={(editor, computedStyles) => {
                          if (onEditorActive) {
                            onEditorActive(editor, `practice-${index}-title`, computedStyles);
                          }
                        }}
                      />
                    ) : (
                      <div
                        className="practice-title-editor"
                        onClick={() => isEditable && setEditingPractices({ index, field: 'title' })}
                        style={{
                          cursor: isEditable ? 'pointer' : 'default',
                          userSelect: 'none'
                        }}
                        dangerouslySetInnerHTML={{ __html: practice.title }}
                      />
                    )}
                  </div>

                  {/* Description */}
                  <div style={{
                    fontSize: '14px',
                    color: '#555555',
                    maxWidth: '280px',
                    lineHeight: '1.4',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    {isEditable && editingPractices?.index === index && editingPractices?.field === 'description' ? (
                      <ControlledWysiwygEditor
                        ref={(el) => {
                          if (el) practiceDescriptionEditorRefs.current[index] = el;
                        }}
                        initialValue={practice.description}
                        onSave={(value) => {
                          handlePracticeSave(index, 'description', value);
                          setEditingPractices(null);
                        }}
                        onCancel={handlePracticeCancel}
                        className="practice-description-editor"
                        style={{
                          fontSize: '14px',
                          color: '#555555',
                          lineHeight: '1.4',
                          fontFamily: 'Inter, sans-serif',
                          width: '100%',
                          height: 'auto',
                          minHeight: '40px'
                        }}
                        onEditorReady={(editor, computedStyles) => {
                          if (onEditorActive) {
                            onEditorActive(editor, `practice-${index}-description`, computedStyles);
                          }
                        }}
                      />
                    ) : (
                      <div
                        onClick={() => isEditable && setEditingPractices({ index, field: 'description' })}
                        style={{
                          cursor: isEditable ? 'pointer' : 'default',
                          userSelect: 'none'
                        }}
                        dangerouslySetInnerHTML={{ __html: practice.description }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Team image at bottom */}
          <div style={{
            width: '100%',
            height: '46%',
            borderRadius: '6px',
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
                borderRadius: '6px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer with page number */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '0px',
        fontSize: '16px',
        color: '#5F616D',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '15px',
          height: '1px',
          backgroundColor: '#5F616D'
        }}></div>
        {isEditable && editingPageNumber ? (
          <ControlledWysiwygEditor
            ref={pageNumberEditorRef}
            initialValue={currentPageNumber}
            onSave={(v) => {
              setCurrentPageNumber(v);
              setEditingPageNumber(false);
              onUpdate && onUpdate({ pageNumber: v });
            }}
            onCancel={() => setEditingPageNumber(false)}
            style={{ position: 'relative', background: 'transparent', border: 'none', outline: 'none', padding: 0, margin: 0, color: '#5F616D', fontSize: '16px', fontWeight: 600 }}
            onEditorReady={(editor, computedStyles) => {
              if (onEditorActive) {
                onEditorActive(editor, 'page-number', computedStyles);
              }
            }}
          />
        ) : (
          <div onClick={() => isEditable && setEditingPageNumber(true)} style={{ cursor: isEditable ? 'pointer' : 'default' }} dangerouslySetInnerHTML={{ __html: currentPageNumber }} />
        )}
      </div>

    </div>
    </>
  );
};

export default HybridWorkBestPracticesSlideTemplate_old; 