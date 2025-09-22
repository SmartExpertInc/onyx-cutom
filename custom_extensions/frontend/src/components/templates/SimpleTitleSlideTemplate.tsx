import React, { useState, useRef, useEffect } from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

export interface SimpleTitleSlideProps {
  slideId: string;
  title: string;
  subtitle?: string;
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}

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
          lineHeight: '1.6'
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

export const SimpleTitleSlideTemplate: React.FC<SimpleTitleSlideProps> = ({
  slideId,
  title,
  subtitle,
  theme,
  onUpdate,
  isEditable = false
}: SimpleTitleSlideProps) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, subtitleColor } = currentTheme.colors;
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
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
    background: backgroundColor, // Используем градиентный фон из темы
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px 80px',
    position: 'relative',
    fontFamily: currentTheme.fonts.contentFont
  };

  const logoStyles: React.CSSProperties = {
    position: 'absolute',
    top: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: isEditable ? 'pointer' : 'default'
  };

  const logoIconStyles: React.CSSProperties = {
    width: '30px',
    height: '30px',
    border: `2px solid ${titleColor}`, // Белый цвет для границы
    borderRadius: '50%',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const logoTextStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '300',
    color: titleColor // Белый цвет для текста
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '3rem',
    fontFamily: currentTheme.fonts.titleFont,
    color: titleColor, // Белый цвет для заголовка
    textAlign: 'center',
    marginBottom: '24px',
    lineHeight: 1.2,
    maxWidth: '900px',
    wordWrap: 'break-word',
    fontWeight: 'bold'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '1.2rem',
    fontFamily: currentTheme.fonts.contentFont,
    color: subtitleColor, // Белый цвет для подзаголовка
    textAlign: 'center',
    lineHeight: 1.4,
    maxWidth: '700px',
    wordWrap: 'break-word',
    opacity: 0.9
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

  return (
    <div className="simple-title-slide-template" style={slideStyles}>
      {/* Logo at the top */}
      <div style={logoStyles}>
        <div style={logoIconStyles}>
          <div style={{
            width: '12px',
            height: '2px',
            backgroundColor: titleColor,
            position: 'absolute'
          }} />
          <div style={{
            width: '2px',
            height: '12px',
            backgroundColor: titleColor,
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }} />
        </div>
        <span style={logoTextStyles}>Your Logo</span>
      </div>

      {/* Main Title - Centered */}
      <div 
        data-moveable-element={`${slideId}-title`}
        data-draggable="true" 
        style={{ display: 'inline-block', width: '100%' }}
      >
        {isEditable && editingTitle ? (
          <InlineEditor
            initialValue={title || 'Your title here'}
            onSave={handleTitleSave}
            onCancel={handleTitleCancel}
            multiline={true}
            placeholder="Enter slide title..."
            className="inline-editor-title"
            style={{
              ...titleStyles,
              // Ensure title behaves exactly like h1 element
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
            onClick={(e) => {
              const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
              if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              if (isEditable) {
                setEditingTitle(true);
              }
            }}
            className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
          >
            {title || 'Your title here'}
          </h1>
        )}
      </div>

      {/* Subtitle */}
      <div 
        data-moveable-element={`${slideId}-subtitle`}
        data-draggable="true" 
        style={{ display: 'inline-block', width: '100%' }}
      >
        {isEditable && editingSubtitle ? (
          <InlineEditor
            initialValue={subtitle || 'Add a short description.'}
            onSave={handleSubtitleSave}
            onCancel={handleSubtitleCancel}
            multiline={true}
            placeholder="Enter subtitle..."
            className="inline-editor-subtitle"
            style={{
              ...subtitleStyles,
              // Ensure subtitle behaves exactly like p element
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
            style={subtitleStyles}
            onClick={(e) => {
              const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
              if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              if (isEditable) {
                setEditingSubtitle(true);
              }
            }}
            className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
          >
            {subtitle || 'Add a short description.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default SimpleTitleSlideTemplate;