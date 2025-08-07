// custom_extensions/frontend/src/components/templates/TitleSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { TitleSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';

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
        // Only override browser defaults, preserve all passed styles
        background: 'transparent',
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
        width: '100%',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        boxSizing: 'border-box',
        display: 'block'
      }}
    />
  );
}

export const TitleSlideTemplate: React.FC<TitleSlideProps & { 
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  slideId,
  title,
  subtitle,
  author,
  date,
  backgroundImage,
  onUpdate,
  theme,
  isEditable = false
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, subtitleColor } = currentTheme.colors;
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: '600px',
    backgroundColor,
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px 80px',
    position: 'relative',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    color: titleColor,
    textAlign: 'center',
    marginBottom: '24px',
    lineHeight: 1.2,
    maxWidth: '900px',
    textShadow: backgroundImage ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none',
    wordWrap: 'break-word'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: `${parseInt(currentTheme.fonts.contentSize) + 8}px`,
    fontFamily: currentTheme.fonts.contentFont,
    color: subtitleColor,
    textAlign: 'center',
    marginBottom: '40px',
    lineHeight: 1.4,
    maxWidth: '700px',
    textShadow: backgroundImage ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none',
    wordWrap: 'break-word'
  };

  const metadataStyles: React.CSSProperties = {
    display: 'flex',
    gap: '32px',
    fontSize: '1rem',
    color: subtitleColor,
    textAlign: 'center',
    opacity: 0.8
  };

  const metadataItemStyles: React.CSSProperties = {
  };

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

  // Handle subtitle editing
  const handleSubtitleSave = (newSubtitle: string) => {
    if (onUpdate) {
      onUpdate({ subtitle: newSubtitle });
    }
    setEditingSubtitle(false);
  };

  const handleSubtitleCancel = () => {
    setEditingSubtitle(false);
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

  // Handle date editing
  const handleDateSave = (newDate: string) => {
    if (onUpdate) {
      onUpdate({ date: newDate });
    }
    setEditingDate(false);
  };

  const handleDateCancel = () => {
    setEditingDate(false);
  };

  return (
    <div className="title-slide-template" style={slideStyles}>
      {/* Main Title */}
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
            // Ensure title behaves exactly like h1 element
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
          onClick={(e) => {
            // Prevent click if element was just dragged
            if (e.currentTarget.getAttribute('data-just-dragged') === 'true') {
              e.preventDefault();
              e.stopPropagation();
              console.log('🚫 Click prevented - element was just dragged');
              return;
            }
            
            // Additional check: prevent if element has saved position data (recently dragged)
            const savedX = e.currentTarget.getAttribute('data-saved-x');
            const savedY = e.currentTarget.getAttribute('data-saved-y');
            if (savedX && savedY && (parseInt(savedX) !== 0 || parseInt(savedY) !== 0)) {
              // Check if this is a recent drag (within last 1 second)
              const dragTime = e.currentTarget.getAttribute('data-drag-time');
              if (dragTime && (Date.now() - parseInt(dragTime)) < 1000) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚫 Click prevented - element was recently dragged');
                return;
              }
            }
            
            if (isEditable) {
              setEditingTitle(true);
            }
          }}
          className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
          data-draggable="true"
        >
          {title || 'Click to add title'}
        </h1>
      )}

      {/* Subtitle */}
      {subtitle && (
        isEditable && editingSubtitle ? (
          <InlineEditor
            initialValue={subtitle || ''}
            onSave={handleSubtitleSave}
            onCancel={handleSubtitleCancel}
            multiline={true}
            placeholder="Enter subtitle..."
            className="inline-editor-subtitle"
            style={{
              ...subtitleStyles,
              // Ensure subtitle behaves exactly like h2 element
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
            onClick={(e) => {
              // Prevent click if element was just dragged
              if (e.currentTarget.getAttribute('data-just-dragged') === 'true') {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              
              if (isEditable) {
                setEditingSubtitle(true);
              }
            }}
            className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
            data-draggable="true"
          >
            {subtitle}
          </h2>
        )
      )}

      {/* Metadata */}
      {(author || date) && (
        <div style={metadataStyles} data-draggable="true">
          {author && (
            isEditable && editingAuthor ? (
              <InlineEditor
                initialValue={author || ''}
                onSave={handleAuthorSave}
                onCancel={handleAuthorCancel}
                multiline={false}
                placeholder="Enter author name..."
                className="inline-editor-author"
                style={{
                  ...metadataItemStyles,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  width: '100%',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block'
                }}
              />
            ) : (
              <div 
                style={metadataItemStyles}
                onClick={() => {
                  if (isEditable) {
                    setEditingAuthor(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
              >
                {author}
              </div>
            )
          )}
          {date && (
            isEditable && editingDate ? (
              <InlineEditor
                initialValue={date || ''}
                onSave={handleDateSave}
                onCancel={handleDateCancel}
                multiline={false}
                placeholder="Enter date..."
                className="inline-editor-date"
                style={{
                  ...metadataItemStyles,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  width: '100%',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block'
                }}
              />
            ) : (
              <div 
                style={metadataItemStyles}
                onClick={() => {
                  if (isEditable) {
                    setEditingDate(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
              >
                {date}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default TitleSlideTemplate; 