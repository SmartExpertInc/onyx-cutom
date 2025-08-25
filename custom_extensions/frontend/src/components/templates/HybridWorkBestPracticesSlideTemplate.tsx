// custom_extensions/frontend/src/components/templates/HybridWorkBestPracticesSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { HybridWorkBestPracticesSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

interface InlineEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

function InlineEditor({ 
  initialValue, 
  onSave, 
  onCancel, 
  multiline = false, 
  placeholder = "",
  className = "",
  style = {}
}: InlineEditorProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      onSave(value);
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      onSave(value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    onSave(value);
  };

  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [value, multiline]);

  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [multiline]);

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        className={`inline-editor-textarea ${className}`}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={{
          ...style,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          resize: 'none',
          overflow: 'hidden',
          width: '100%',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          minHeight: '1.6em',
          boxSizing: 'border-box',
          display: 'block',
        }}
        rows={1}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      className={`inline-editor-input ${className}`}
      type="text"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      style={{
        ...style,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
        width: '100%',
        boxSizing: 'border-box',
        display: 'block',
      }}
    />
  );
}

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

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '596px',
    backgroundColor: themeBg,
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
    <div className="hybrid-work-best-practices-slide-template" style={slideStyles}>
      {/* Main content with two columns */}
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: themeBg,
        display: 'flex',
        padding: '40px 60px',
        paddingRight: '0px'
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
              color: themeContent,
              marginBottom: '20px',
              fontWeight: '300'
            }}>
              {isEditable && editingTitle ? (
                <InlineEditor
                  initialValue={currentTitle}
                  onSave={handleTitleSave}
                  onCancel={handleTitleCancel}
                  className="hybrid-title-editor"
                  style={{
                    fontSize: '14px',
                    color: themeContent,
                    fontWeight: '300'
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
              color: themeTitle,
              lineHeight: '1.3',
              marginBottom: '40px'
            }}>
              {isEditable && editingMainStatement ? (
                <InlineEditor
                  initialValue={currentMainStatement}
                  onSave={handleMainStatementSave}
                  onCancel={handleMainStatementCancel}
                  multiline={true}
                  className="hybrid-main-statement-editor"
                  style={{
                    fontSize: '24px',
                    maxWidth: '335px',
                    color: themeTitle,
                    lineHeight: '1.3'
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
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            overflow: 'hidden',
            alignSelf: 'flex-start',
            position: 'absolute',
            bottom: '15px',
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
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {/* Practices section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            marginBottom: '30px'
          }}>
            {currentPractices.map((practice, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px',
                  alignItems: 'flex-start'
                }}
              >
                {/* Number */}
                <div style={{
                  width: '30px',
                  height: '30px',
                  backgroundColor: themeTitle,
                  color: themeBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
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
                    color: themeTitle,
                    marginBottom: '8px',
                    lineHeight: '1.2'
                  }}>
                    {isEditable && editingPractices?.index === index && editingPractices?.field === 'title' ? (
                      <InlineEditor
                        initialValue={practice.title}
                        onSave={(value) => handlePracticeSave(index, 'title', value)}
                        onCancel={handlePracticeCancel}
                        className="practice-title-editor"
                        style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: themeTitle,
                          lineHeight: '1.2'
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
                    color: themeContent,
                    lineHeight: '1.4'
                  }}>
                    {isEditable && editingPractices?.index === index && editingPractices?.field === 'description' ? (
                      <InlineEditor
                        initialValue={practice.description}
                        onSave={(value) => handlePracticeSave(index, 'description', value)}
                        onCancel={handlePracticeCancel}
                        multiline={true}
                        className="practice-description-editor"
                        style={{
                          fontSize: '14px',
                          color: themeContent,
                          lineHeight: '1.4'
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
            height: '400px',
            borderRadius: '10px',
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
                borderRadius: '10px',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HybridWorkBestPracticesSlideTemplate; 