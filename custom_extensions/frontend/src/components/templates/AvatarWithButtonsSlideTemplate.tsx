// custom_extensions/frontend/src/components/templates/AvatarWithButtonsSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { AvatarWithButtonsProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import AvatarImageDisplay from '../AvatarImageDisplay';

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
          lineHeight: '1.6',
          overflowWrap: 'anywhere',
          color: 'inherit'
        }}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      className={`inline-editor-input ${className}`}
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
          wordWrap: 'break-word',
          boxSizing: 'border-box',
          display: 'block',
          color: 'inherit'
        }}
    />
  );
}

export const AvatarWithButtonsSlideTemplate: React.FC<AvatarWithButtonsProps & {
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  title,
  buttons = [
    { text: 'Внимание', color: '#e91e63' },
    { text: 'Скорость', color: '#e91e63' },
    { text: 'Тепло', color: '#e91e63' },
    { text: 'Забота', color: '#e91e63' }
  ],
  avatarPath,
  avatarAlt,
  slideId,
  onUpdate,
  theme,
  isEditable = false
}) => {
  // Use theme colors instead of props
  const effectiveTheme = typeof theme === 'string' && theme.trim() !== '' ? theme : DEFAULT_SLIDE_THEME;
  const currentTheme = getSlideTheme(effectiveTheme);
  const { backgroundColor, titleColor, contentColor } = currentTheme.colors;
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  const handleButtonSave = (index: number, newText: string) => {
    if (onUpdate) {
      const newButtons = [...buttons];
      newButtons[index] = { ...newButtons[index], text: newText };
      onUpdate({ buttons: newButtons });
    }
    // setEditingButtons(editingButtons.filter(i => i !== index)); // This line was removed from the new_code, so it's removed here.
  };

  const handleButtonCancel = (index: number) => {
    // setEditingButtons(editingButtons.filter(i => i !== index)); // This line was removed from the new_code, so it's removed here.
  };

  const handleAvatarUploaded = (newAvatarPath: string) => {
    if (onUpdate) {
      onUpdate({ avatarPath: newAvatarPath });
    }
  };

  const slideStyles: React.CSSProperties = {
    minHeight: '600px',
    background: backgroundColor,
    fontFamily: currentTheme.fonts.contentFont,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  };

  const contentContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '1200px',
    gap: '40px'
  };

  const placeholderStyles: React.CSSProperties = {
    width: '623px',
    height: '562px',
    margin: '0 auto',
    position: 'absolute',
    top: '-263px',
    zIndex: 3
  };

  const leftContentStyles: React.CSSProperties = {
    flex: '1',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    position: 'relative',
    height: '100%'
  };

  const rightContentStyles: React.CSSProperties = {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '32px'
  };

  const buttonStyles: React.CSSProperties = {
    padding: '20px 0px',
    width: '175px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '1.3rem',
    fontFamily: currentTheme.fonts.contentFont,
    color: '#000000',
    backgroundColor: titleColor, // Changed from safeTitleColor
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    wordWrap: 'break-word',
    fontWeight: 'bold',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const buttonsContainerStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    width: '100%',
    maxWidth: '500px'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '2.8rem',
    fontFamily: currentTheme.fonts.titleFont,
    color: backgroundColor === '#ffffff' ? '#000000' : titleColor,
    marginBottom: '40px',
    lineHeight: '1.2',
    wordWrap: 'break-word',
    fontWeight: 'bold',
    textAlign: 'center'
  };

  return (
    <div style={slideStyles}>
      <div style={contentContainerStyles}>
        {/* Left content - Avatar */}
        <div style={leftContentStyles}>
          <AvatarImageDisplay
            size="MEDIUM"
            position="CENTER"
            style={placeholderStyles}
          />
        </div>

        {/* Right content - Title and Buttons */}
        <div style={rightContentStyles}>
          {/* Title */}
          {isEditable && editingTitle ? (
            <InlineEditor
              initialValue={title || ''}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={true}
              placeholder="Enter slide title..."
              className="inline-editor-title"
              style={{
                ...titleStyles,
                margin: '0',
                padding: '8px 12px',
                border: 'none',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '4px',
                color: '#ffffff'
              }}
            />
          ) : (
            <h1 
              style={titleStyles}
              onClick={() => {
                if (isEditable) {
                  setEditingTitle(true);
                }
              }}
              className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
            >
              {title || 'Продуманный сервис ощущается сразу'}
            </h1>
          )}

          {/* Buttons Grid */}
          <div style={buttonsContainerStyles}>
            {buttons.map((button, index) => (
              <div key={index}>
                {/* The editing logic for buttons was removed from the new_code, so this block is simplified. */}
                {/* The original code had a more complex editing state management for buttons. */}
                {/* For now, we'll just render the button as a non-editable one. */}
                <button
                  style={buttonStyles}
                  onClick={() => {
                    if (isEditable) {
                      // setEditingButtons([...editingButtons, index]); // This line was removed from the new_code, so it's removed here.
                    }
                  }}
                  className={isEditable ? 'hover:opacity-80' : ''}
                >
                  {button.text}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 