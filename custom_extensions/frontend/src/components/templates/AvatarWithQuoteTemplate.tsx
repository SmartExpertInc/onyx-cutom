// custom_extensions/frontend/src/components/templates/AvatarWithQuoteTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { AvatarWithQuoteProps } from '@/types/slideTemplates';
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

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [value, multiline]);

  // Set initial height for textarea to match content
  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      // Set initial height based on content
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
          // Only override browser defaults, preserve all passed styles
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
          overflowWrap: 'anywhere'
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
        // Only override browser defaults, preserve all passed styles
        background: 'transparent',
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
        width: '100%',
        wordWrap: 'break-word',
        boxSizing: 'border-box',
        display: 'block'
      }}
    />
  );
}

export const AvatarWithQuoteTemplate: React.FC<AvatarWithQuoteProps & {
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  title,
  quote,
  author,
  avatarPath,
  avatarAlt,
  slideId,
  onUpdate,
  theme,
  isEditable = false
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, contentColor } = currentTheme.colors;
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingQuote, setEditingQuote] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Handle title editing
  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  // Handle quote editing
  const handleQuoteSave = (newQuote: string) => {
    if (onUpdate) {
      onUpdate({ quote: newQuote });
    }
    setEditingQuote(false);
  };

  const handleQuoteCancel = () => {
    setEditingQuote(false);
  };

  // Handle author editing
  const handleAuthorSave = (newAuthor: string) => {
    if (onUpdate) {
      onUpdate({ author: newAuthor });
    }
    setEditingAuthor(false);
  };

  const handleAuthorCancel = () => {
    setEditingAuthor(false);
  };

  // Handle avatar upload
  const handleAvatarUploaded = (newAvatarPath: string) => {
    if (onUpdate) {
      onUpdate({ avatarPath: newAvatarPath });
    }
  };

  const slideStyles: React.CSSProperties = {
    minHeight: '600px',
    backgroundColor: backgroundColor,
    fontFamily: currentTheme.fonts.contentFont,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  };

  const contentContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '900px',
    gap: '32px'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    color: titleColor,
    marginBottom: '32px',
    lineHeight: '1.2',
    wordWrap: 'break-word'
  };

  const quoteContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    maxWidth: '700px'
  };

  const quoteStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    fontFamily: currentTheme.fonts.contentFont,
    color: contentColor,
    fontStyle: 'italic',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    padding: '24px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative'
  };

  const quoteMarkStyles: React.CSSProperties = {
    position: 'absolute',
    top: '-10px',
    left: '20px',
    fontSize: '48px',
    color: titleColor,
    fontFamily: 'serif'
  };

  const authorStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    fontFamily: currentTheme.fonts.contentFont,
    color: titleColor,
    fontWeight: 'bold',
    marginTop: '16px'
  };

  const avatarContainerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '32px'
  };

  const placeholderStyles: React.CSSProperties = {
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    margin: '0 auto'
  };

  return (
    <div style={slideStyles}>
      <div style={contentContainerStyles}>
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
            {title || 'Click to add title'}
          </h1>
        )}

        {/* Avatar */}
        <div style={avatarContainerStyles}>
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

        {/* Quote */}
        <div style={quoteContainerStyles}>
          <div style={quoteStyles}>
            <span style={quoteMarkStyles}>"</span>
            {isEditable && editingQuote ? (
              <InlineEditor
                initialValue={quote || ''}
                onSave={handleQuoteSave}
                onCancel={handleQuoteCancel}
                multiline={true}
                placeholder="Enter quote..."
                className="inline-editor-quote"
                style={{
                  margin: '0',
                  padding: '0',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  overflow: 'hidden',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block',
                  background: 'transparent',
                  color: contentColor,
                  fontSize: currentTheme.fonts.contentSize,
                  fontFamily: currentTheme.fonts.contentFont,
                  fontStyle: 'italic',
                  lineHeight: '1.6'
                }}
              />
            ) : (
              <span
                onClick={() => {
                  if (isEditable) {
                    setEditingQuote(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
              >
                {quote || 'Click to add quote'}
              </span>
            )}
          </div>

          {/* Author */}
          {author && (
            isEditable && editingAuthor ? (
              <InlineEditor
                initialValue={author}
                onSave={handleAuthorSave}
                onCancel={handleAuthorCancel}
                placeholder="Enter author name..."
                className="inline-editor-author"
                style={{
                  ...authorStyles,
                  margin: '0',
                  padding: '0',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  overflow: 'hidden',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block',
                  background: 'transparent'
                }}
              />
            ) : (
              <span
                style={authorStyles}
                onClick={() => {
                  if (isEditable) {
                    setEditingAuthor(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
              >
                — {author}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}; 