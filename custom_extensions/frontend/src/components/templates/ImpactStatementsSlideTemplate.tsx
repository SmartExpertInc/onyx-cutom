// custom_extensions/frontend/src/components/templates/ImpactStatementsSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ImpactStatementsSlideProps } from '@/types/slideTemplates';
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

export const ImpactStatementsSlideTemplate: React.FC<ImpactStatementsSlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Here are some impact value statements backed by numbers:',
  statements = [
    { number: '50%', description: 'decrease in turnover rates.' },
    { number: '$2.8B', description: 'the cost of harassment to businesses in the United States annually.' },
    { number: '40%', description: 'increase in employee morale and engagement' }
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
  const [editingStatements, setEditingStatements] = useState<number | null>(null);
  const [editingNumbers, setEditingNumbers] = useState<number | null>(null);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentStatements, setCurrentStatements] = useState(statements);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '600px',
    backgroundColor: themeBg,
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
    padding: '60px 80px',
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, statements, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleStatementSave = (index: number, newDescription: string) => {
    const newStatements = [...currentStatements];
    newStatements[index] = { ...newStatements[index], description: newDescription };
    setCurrentStatements(newStatements);
    setEditingStatements(null);
    if (onUpdate) {
      onUpdate({ ...{ title, statements, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, statements: newStatements });
    }
  };

  const handleNumberSave = (index: number, newNumber: string) => {
    const newStatements = [...currentStatements];
    newStatements[index] = { ...newStatements[index], number: newNumber };
    setCurrentStatements(newStatements);
    setEditingNumbers(null);
    if (onUpdate) {
      onUpdate({ ...{ title, statements, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, statements: newStatements });
    }
  };

  const handleTitleCancel = () => {
    setCurrentTitle(title);
    setEditingTitle(false);
  };

  const handleStatementCancel = () => {
    setCurrentStatements(statements);
    setEditingStatements(null);
  };

  const handleNumberCancel = () => {
    setCurrentStatements(statements);
    setEditingNumbers(null);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, statements, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  return (
    <div className="impact-statements-slide-template" style={slideStyles}>
      {/* Left section with title and profile image */}
      <div style={{
        width: '50%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {/* Title */}
        <div style={{
          fontSize: '32px',
          color: themeTitle,
          fontWeight: 'bold',
          lineHeight: '1.2',
          marginBottom: '40px'
        }}>
          {isEditable && editingTitle ? (
            <InlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={true}
              className="impact-title-editor"
              style={{
                fontSize: '32px',
                color: themeTitle,
                fontWeight: 'bold',
                lineHeight: '1.2'
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

        {/* Profile image in orange container */}
        <div style={{
          width: '300px',
          height: '200px',
          backgroundColor: themeAccent,
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
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
              objectFit: 'cover'
            }}
          />
        </div>
      </div>

      {/* Right section with impact statements */}
      <div style={{
        width: '50%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '20px'
      }}>
        {currentStatements.map((statement, index) => (
          <div
            key={index}
            style={{
              backgroundColor: themeAccent,
              borderRadius: '10px',
              padding: '30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              minHeight: index === 1 ? '120px' : '80px'
            }}
          >
            {/* Number */}
            <div style={{
              fontSize: '48px',
              color: themeBg,
              fontWeight: 'bold'
            }}>
              {isEditable && editingNumbers === index ? (
                <InlineEditor
                  initialValue={statement.number}
                  onSave={(value) => handleNumberSave(index, value)}
                  onCancel={handleNumberCancel}
                  className="number-editor"
                  style={{
                    fontSize: '48px',
                    color: themeBg,
                    fontWeight: 'bold'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingNumbers(index)}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {statement.number}
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{
              fontSize: '16px',
              color: themeBg,
              lineHeight: '1.4'
            }}>
              {isEditable && editingStatements === index ? (
                <InlineEditor
                  initialValue={statement.description}
                  onSave={(value) => handleStatementSave(index, value)}
                  onCancel={handleStatementCancel}
                  multiline={true}
                  className="statement-editor"
                  style={{
                    fontSize: '16px',
                    color: themeBg,
                    lineHeight: '1.4'
                  }}
                />
              ) : (
                <div
                  onClick={() => isEditable && setEditingStatements(index)}
                  style={{
                    cursor: isEditable ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                >
                  {statement.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImpactStatementsSlideTemplate; 