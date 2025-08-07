// custom_extensions/frontend/src/components/templates/AvatarServiceSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { AvatarSlideProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
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

export const AvatarServiceSlideTemplate: React.FC<AvatarSlideProps & {
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  title,
  subtitle,
  content,
  avatarPath,
  avatarAlt,
  slideId,
  onUpdate,
  theme,
  isEditable = false
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, contentColor } = currentTheme.colors;
  
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

  const handleSubtitleSave = (newSubtitle: string) => {
    if (onUpdate) {
      onUpdate({ subtitle: newSubtitle });
    }
    setEditingSubtitle(false);
  };

  const handleSubtitleCancel = () => {
    setEditingSubtitle(false);
  };

  const handleContentSave = (newContent: string) => {
    if (onUpdate) {
      onUpdate({ content: newContent });
    }
    setEditingContent(false);
  };

  const handleContentCancel = () => {
    setEditingContent(false);
  };

  const handleAvatarUploaded = (newAvatarPath: string) => {
    if (onUpdate) {
      onUpdate({ avatarPath: newAvatarPath });
    }
  };

  const darkShapeStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '400px',
    height: '500px',
    backgroundColor: '#1a1a2e',
    borderRadius: '0 0 300px 0',
    zIndex: 1
  };

  const slideStyles: React.CSSProperties = {
    minHeight: '600px',
    backgroundColor: backgroundColor,
    fontFamily: currentTheme.fonts.contentFont,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    position: 'relative',
    overflow: 'hidden'
  };

  const contentContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '1200px',
    gap: '60px',
    position: 'relative',
    zIndex: 2
  };

  const leftContentStyles: React.CSSProperties = {
    flex: '1',
    textAlign: 'left',
    zIndex: 2,
    position: 'relative',
    paddingLeft: '60px'
  };

  const rightContentStyles: React.CSSProperties = {
    flex: '1',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    zIndex: 2,
    position: 'relative',
    height: '100%'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '2.5rem',
    fontFamily: currentTheme.fonts.titleFont,
    color: titleColor,
    marginBottom: '16px',
    lineHeight: '1.2',
    wordWrap: 'break-word',
    fontWeight: 'bold'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '1.5rem',
    fontFamily: currentTheme.fonts.contentFont,
    color: contentColor,
    marginBottom: '16px',
    lineHeight: '1.6',
    wordWrap: 'break-word',
    fontWeight: 'bold'
  };

  const contentStyles: React.CSSProperties = {
    fontSize: '1.2rem',
    fontFamily: currentTheme.fonts.contentFont,
    color: contentColor,
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word'
  };

  const placeholderStyles: React.CSSProperties = {
    width: '623px',
    height: '562px',
    margin: '0 auto',
    position: 'absolute',
    top: '-246px',
    zIndex: 3
  };

  return (
    <div style={slideStyles}>
      {/* Dark shape in top-left corner */}
      <div style={darkShapeStyles}></div>
      
      <div style={contentContainerStyles}>
        {/* Left content */}
        <div style={leftContentStyles}>
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
                padding: '0',
                border: 'none',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block'
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
              {title || 'Клиентский сервис -'}
            </h1>
          )}

          {/* Subtitle */}
          {subtitle && (
            isEditable && editingSubtitle ? (
              <InlineEditor
                initialValue={subtitle}
                onSave={handleSubtitleSave}
                onCancel={handleSubtitleCancel}
                multiline={true}
                placeholder="Enter subtitle..."
                className="inline-editor-subtitle"
                style={{
                  ...subtitleStyles,
                  margin: '0',
                  padding: '0',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  overflow: 'hidden',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block'
                }}
              />
            ) : (
              <h2 
                style={subtitleStyles}
                onClick={() => {
                  if (isEditable) {
                    setEditingSubtitle(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
              >
                {subtitle}
              </h2>
            )
          )}

          {/* Content */}
          {content && (
            isEditable && editingContent ? (
              <InlineEditor
                initialValue={content}
                onSave={handleContentSave}
                onCancel={handleContentCancel}
                multiline={true}
                placeholder="Enter content..."
                className="inline-editor-content"
                style={{
                  ...contentStyles,
                  margin: '0',
                  padding: '0',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  overflow: 'hidden',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block'
                }}
              />
            ) : (
              <p 
                style={contentStyles}
                onClick={() => {
                  if (isEditable) {
                    setEditingContent(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
              >
                {content}
              </p>
            )
          )}
        </div>

        {/* Right content - Avatar */}
        <div style={rightContentStyles}>
          <ClickableImagePlaceholder
            imagePath={avatarPath}
            onImageUploaded={handleAvatarUploaded}
            size="MEDIUM"
            position="CENTER"
            description="Click to upload avatar"
            prompt="Professional headshot with transparent background"
            style={placeholderStyles}
          />
        </div>
      </div>
    </div>
  );
}; 