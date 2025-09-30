// custom_extensions/frontend/src/components/templates/HeroTitleSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { HeroTitleSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';

interface FormattingToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  isBoldActive: boolean;
  isItalicActive: boolean;
  style?: React.CSSProperties;
}

function FormattingToolbar({ onBold, onItalic, isBoldActive, isItalicActive, style }: FormattingToolbarProps) {
  return (
    <div 
      className="formatting-toolbar"
      style={{
        position: 'absolute',
        top: '-45px',
        left: '0',
        display: 'flex',
        gap: '4px',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '4px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        ...style
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onBold();
        }}
        style={{
          width: '32px',
          height: '32px',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          backgroundColor: isBoldActive ? '#3b82f6' : 'white',
          color: isBoldActive ? 'white' : '#374151',
          fontWeight: 'bold',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!isBoldActive) {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }
        }}
        onMouseLeave={(e) => {
          if (!isBoldActive) {
            e.currentTarget.style.backgroundColor = 'white';
          }
        }}
        title="Bold (Ctrl+B)"
      >
        B
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onItalic();
        }}
        style={{
          width: '32px',
          height: '32px',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          backgroundColor: isItalicActive ? '#3b82f6' : 'white',
          color: isItalicActive ? 'white' : '#374151',
          fontStyle: 'italic',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (!isItalicActive) {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }
        }}
        onMouseLeave={(e) => {
          if (!isItalicActive) {
            e.currentTarget.style.backgroundColor = 'white';
          }
        }}
        title="Italic (Ctrl+I)"
      >
        I
      </button>
    </div>
  );
}

interface RichTextEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

function RichTextEditor({ 
  initialValue, 
  onSave, 
  onCancel, 
  multiline = false, 
  placeholder = "",
  className = "",
  style = {}
}: RichTextEditorProps) {
  // Convert HTML to plain text for editing, but preserve formatting info
  const htmlToPlainText = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // Helper function to remove fontWeight and fontStyle from base styles
  // This prevents conflicts with our dynamic formatting
  const getCleanStyles = (baseStyles: React.CSSProperties): React.CSSProperties => {
    const { fontWeight, fontStyle, ...cleanStyles } = baseStyles;
    return cleanStyles;
  };

  const [value, setValue] = useState(htmlToPlainText(initialValue));
  const [formattedValue, setFormattedValue] = useState(initialValue);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const applyFormatting = () => {
    let formatted = value;
    if (isBoldActive && isItalicActive) {
      formatted = `<strong><em>${value}</em></strong>`;
    } else if (isBoldActive) {
      formatted = `<strong>${value}</strong>`;
    } else if (isItalicActive) {
      formatted = `<em>${value}</em>`;
    }
    setFormattedValue(formatted);
    return formatted;
  };

  const handleBold = () => {
    setIsBoldActive(!isBoldActive);
  };

  const handleItalic = () => {
    setIsItalicActive(!isItalicActive);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      const finalValue = applyFormatting();
      onSave(finalValue);
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      const finalValue = applyFormatting();
      onSave(finalValue);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'b' && e.ctrlKey) {
      e.preventDefault();
      handleBold();
    } else if (e.key === 'i' && e.ctrlKey) {
      e.preventDefault();
      handleItalic();
    }
  };

  const handleBlur = () => {
    const finalValue = applyFormatting();
    onSave(finalValue);
  };

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [value, multiline]);

  // Apply formatting as user types
  useEffect(() => {
    applyFormatting();
  }, [isBoldActive, isItalicActive, value]);

  if (multiline) {
    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <FormattingToolbar
          onBold={handleBold}
          onItalic={handleItalic}
          isBoldActive={isBoldActive}
          isItalicActive={isItalicActive}
        />
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          className={`inline-editor-textarea ${className}`}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          style={{
            ...getCleanStyles(style),
            // Only override browser defaults, preserve all passed styles (except fontWeight/fontStyle)
            background: 'transparent',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            outline: 'none',
            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)',
            resize: 'none',
            overflow: 'hidden',
            width: '100%',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            minHeight: '1.6em',
            boxSizing: 'border-box',
            display: 'block',
            padding: '8px',
            // Dynamic formatting controlled by state - this is the key fix!
            fontWeight: isBoldActive ? 'bold' : 'normal',
            fontStyle: isItalicActive ? 'italic' : 'normal'
          }}
          rows={1}
        />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <FormattingToolbar
        onBold={handleBold}
        onItalic={handleItalic}
        isBoldActive={isBoldActive}
        isItalicActive={isItalicActive}
      />
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
          ...getCleanStyles(style),
          // Only override browser defaults, preserve all passed styles (except fontWeight/fontStyle)
          background: 'transparent',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          outline: 'none',
          boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)',
          width: '100%',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          boxSizing: 'border-box',
          display: 'block',
          lineHeight: '1.2',
          padding: '8px',
          // Dynamic formatting controlled by state - this is the key fix!
          fontWeight: isBoldActive ? 'bold' : 'normal',
          fontStyle: isItalicActive ? 'italic' : 'normal'
        }}
      />
    </div>
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

  // Helper function to render HTML content safely
  const renderHtmlContent = (content: string): React.ReactNode => {
    if (!content) return null;
    
    // Simple HTML rendering for basic formatting (bold and italic only)
    const htmlContent = content
      .replace(/<strong>/g, '<b>')
      .replace(/<\/strong>/g, '</b>')
      .replace(/<em>/g, '<i>')
      .replace(/<\/em>/g, '</i>');
    
    return <span dangerouslySetInnerHTML={{ __html: htmlContent }} />;
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
        {/* Main Title - wrapped */}
        <div data-draggable="true" style={{ 
          display: 'block', 
          width: '100%',
          textAlign: textAlign as any,
          position: 'relative'
        }}>
          {isEditable && editingTitle ? (
            <RichTextEditor
              initialValue={title || ''}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={true}
              placeholder="Enter hero title..."
              className="inline-editor-title"
              style={{
                ...titleStyles,
                // Ensure title behaves exactly like h1 element
                padding: '8px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
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
              className={isEditable ? 'cursor-pointer border border-transparent hover-border-gray-300 hover-border-opacity-50' : ''}
            >
              {title ? renderHtmlContent(title) : 'Click to add hero title'}
            </h1>
          )}
        </div>

        {/* Subtitle - wrapped */}
        <div data-draggable="true" style={{ 
          display: 'block', 
          width: '100%',
          textAlign: textAlign as any,
          position: 'relative'
        }}>
          {isEditable && editingSubtitle ? (
            <RichTextEditor
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
                padding: '8px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
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
              className={isEditable ? 'cursor-pointer border border-transparent hover-border-gray-300 hover-border-opacity-50' : ''}
            >
              {subtitle ? renderHtmlContent(subtitle) : 'Click to add subtitle'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroTitleSlideTemplate; 