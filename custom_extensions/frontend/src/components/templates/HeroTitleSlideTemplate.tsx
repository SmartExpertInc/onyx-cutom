// custom_extensions/frontend/src/components/templates/HeroTitleSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { HeroTitleSlideProps } from '@/types/slideTemplates';
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
        display: 'block',
        lineHeight: '1.2'
      }}
    />
  );
}

export const HeroTitleSlideTemplate: React.FC<HeroTitleSlideProps & { 
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  slideId,
  title,
  subtitle,
  showAccent = true,
  accentPosition = 'left',
  backgroundImage,
  textAlign = 'center',
  titleSize = 'xlarge',
  subtitleSize = 'medium',
  onUpdate,
  theme,
  isEditable = false
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, subtitleColor, accentColor } = currentTheme.colors;
  
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
    minHeight: '600px',
    backgroundColor,
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
    padding: '80px',
    position: 'relative',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden'
  };

  const getTitleFontSize = (size: string): string => {
    // Use theme font size as base, but allow size variations
    const baseSize = parseInt(currentTheme.fonts.titleSize);
    switch (size) {
      case 'small': return `${baseSize - 10}px`;
      case 'medium': return `${baseSize - 5}px`;
      case 'large': return `${baseSize}px`;
      case 'xlarge': return `${baseSize + 5}px`;
      default: return currentTheme.fonts.titleSize;
    }
  };

  const getSubtitleFontSize = (size: string): string => {
    // Use theme content font size as base for subtitles
    const baseSize = parseInt(currentTheme.fonts.contentSize);
    switch (size) {
      case 'small': return `${baseSize}px`;
      case 'medium': return `${baseSize + 4}px`;
      case 'large': return `${baseSize + 8}px`;
      default: return `${baseSize + 4}px`;
    }
  };

  const titleStyles: React.CSSProperties = {
    fontSize: getTitleFontSize(titleSize),
    fontFamily: currentTheme.fonts.titleFont,
    fontWeight: 700,
    color: titleColor,
    textAlign: textAlign as any,
    marginBottom: '24px',
    lineHeight: 1.2,
    maxWidth: '900px',
    textShadow: backgroundImage ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none',
    zIndex: 2,
    position: 'relative',
    wordWrap: 'break-word'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: getSubtitleFontSize(subtitleSize),
    fontFamily: currentTheme.fonts.contentFont,
    fontWeight: 400,
    color: subtitleColor,
    textAlign: textAlign as any,
    lineHeight: 1.6,
    maxWidth: '700px',
    textShadow: backgroundImage ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none',
    zIndex: 2,
    position: 'relative',
    wordWrap: 'break-word'
  };

  const getAccentStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      backgroundColor: accentColor,
      zIndex: 1
    };

    switch (accentPosition) {
      case 'left':
        return {
          ...baseStyles,
          left: 0,
          top: 0,
          bottom: 0,
          width: '8px'
        };
      case 'right':
        return {
          ...baseStyles,
          right: 0,
          top: 0,
          bottom: 0,
          width: '8px'
        };
      case 'top':
        return {
          ...baseStyles,
          top: 0,
          left: 0,
          right: 0,
          height: '8px'
        };
      case 'bottom':
        return {
          ...baseStyles,
          bottom: 0,
          left: 0,
          right: 0,
          height: '8px'
        };
      default:
        return baseStyles;
    }
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
    <div className="hero-title-slide-template" style={slideStyles}>
      {/* Accent Element */}
      {showAccent && <div style={getAccentStyles()}></div>}

      {/* Content Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start',
        zIndex: 2,
        position: 'relative',
        width: '100%'
      }}>
        {/* Main Title */}
        {isEditable && editingTitle ? (
          <InlineEditor
            initialValue={title || ''}
            onSave={handleTitleSave}
            onCancel={handleTitleCancel}
            multiline={true}
            placeholder="Enter hero title..."
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
              display: 'block',
              lineHeight: '1.2'
            }}
          />
        ) : (
          <h1 
            style={titleStyles}
            onClick={(e) => {
              if (e.currentTarget.getAttribute('data-just-dragged') === 'true') {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              if (isEditable) {
                setEditingTitle(true);
              }
            }}
            className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
            data-draggable="true"
          >
            {title || 'Click to add hero title'}
          </h1>
        )}

        {/* Subtitle */}
        {isEditable && editingSubtitle ? (
          <InlineEditor
            initialValue={subtitle || ''}
            onSave={handleSubtitleSave}
            onCancel={handleSubtitleCancel}
            multiline={true}
            placeholder="Enter subtitle..."
            className="inline-editor-subtitle"
            style={{
              ...subtitleStyles,
              // Ensure subtitle behaves exactly like div element
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
              lineHeight: '1.6'
            }}
          />
        ) : (
          <div 
            style={subtitleStyles}
            onClick={(e) => {
              if (e.currentTarget.getAttribute('data-just-dragged') === 'true') {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              if (isEditable) {
                setEditingSubtitle(true);
              }
            }}
            className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
            data-draggable="true"
          >
            {subtitle || 'Click to add subtitle'}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroTitleSlideTemplate; 