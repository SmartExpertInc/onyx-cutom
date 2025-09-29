// custom_extensions/frontend/src/components/templates/HeroTitleSlideTemplate.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
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

interface FormattingToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  isBoldActive: boolean;
  isItalicActive: boolean;
  position: { top: number; left: number };
  visible: boolean;
}

// Formatting Toolbar Component
function FormattingToolbar({ 
  onBold, 
  onItalic, 
  isBoldActive, 
  isItalicActive, 
  position, 
  visible 
}: FormattingToolbarProps) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: position.top - 50,
        left: position.left,
        backgroundColor: '#333',
        borderRadius: '6px',
        padding: '6px',
        display: 'flex',
        gap: '4px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        border: '1px solid #555'
      }}
    >
      <button
        type="button"
        onClick={onBold}
        style={{
          backgroundColor: isBoldActive ? '#4a90e2' : 'transparent',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '6px 10px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          minWidth: '30px',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          if (!isBoldActive) {
            e.currentTarget.style.backgroundColor = '#555';
          }
        }}
        onMouseLeave={(e) => {
          if (!isBoldActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        B
      </button>
      <button
        type="button"
        onClick={onItalic}
        style={{
          backgroundColor: isItalicActive ? '#4a90e2' : 'transparent',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '6px 10px',
          fontSize: '14px',
          fontStyle: 'italic',
          cursor: 'pointer',
          minWidth: '30px',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          if (!isItalicActive) {
            e.currentTarget.style.backgroundColor = '#555';
          }
        }}
        onMouseLeave={(e) => {
          if (!isItalicActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        I
      </button>
    </div>
  );
}

// Rich Text Editor with Formatting Support
function InlineEditor({ 
  initialValue, 
  onSave, 
  onCancel, 
  multiline = false, 
  placeholder = "",
  className = "",
  style = {}
}: InlineEditorProps) {
  const [htmlContent, setHtmlContent] = useState(() => {
    // Convert plain text to HTML if needed
    if (initialValue && !initialValue.includes('<')) {
      return initialValue.replace(/\n/g, '<br>');
    }
    return initialValue || '';
  });
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  
  const editableRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editableRef.current) {
      editableRef.current.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(editableRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, []);

  // Update formatting button states based on current selection
  const updateFormattingStates = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setIsBoldActive(document.queryCommandState('bold'));
      setIsItalicActive(document.queryCommandState('italic'));
    }
  }, []);

  // Handle selection change to show/hide toolbar
  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      
      if (containerRect) {
        setToolbarPosition({
          top: rect.top - containerRect.top,
          left: rect.left - containerRect.left + (rect.width / 2) - 35
        });
        setShowToolbar(true);
        updateFormattingStates();
      }
    } else {
      setShowToolbar(false);
    }
  }, [updateFormattingStates]);

  // Handle text selection
  const handleMouseUp = useCallback(() => {
    setTimeout(handleSelectionChange, 10);
  }, [handleSelectionChange]);

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
      return;
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      e.preventDefault();
      handleSave();
      return;
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
      return;
    }
    
    setTimeout(handleSelectionChange, 10);
    updateFormattingStates();
  }, [handleSelectionChange, updateFormattingStates, multiline, onCancel]);

  const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setHtmlContent(target.innerHTML);
  }, []);

  const handleBold = useCallback(() => {
    document.execCommand('bold', false, undefined);
    setIsBoldActive(document.queryCommandState('bold'));
    editableRef.current?.focus();
    if (editableRef.current) {
      setHtmlContent(editableRef.current.innerHTML);
    }
  }, []);

  const handleItalic = useCallback(() => {
    document.execCommand('italic', false, undefined);
    setIsItalicActive(document.queryCommandState('italic'));
    editableRef.current?.focus();
    if (editableRef.current) {
      setHtmlContent(editableRef.current.innerHTML);
    }
  }, []);

  const handleSave = useCallback(() => {
    if (editableRef.current) {
      // Get the HTML content and clean it up
      let content = editableRef.current.innerHTML;
      
      // Convert <div><br></div> to proper line breaks
      content = content.replace(/<div><br><\/div>/g, '\n');
      content = content.replace(/<div>/g, '\n').replace(/<\/div>/g, '');
      content = content.replace(/^<br>/, ''); // Remove leading <br>
      
      onSave(content);
    }
  }, [onSave]);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Don't save if clicking on toolbar
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && relatedTarget.closest('.formatting-toolbar')) {
      return;
    }
    setTimeout(() => {
      setShowToolbar(false);
      handleSave();
    }, 100);
  }, [handleSave]);

  // Handle paste to clean up formatting
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div
        ref={editableRef}
        className={`inline-editor-rich-text ${className}`}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={handleKeyUp}
        onMouseUp={handleMouseUp}
        onBlur={handleBlur}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
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
          minHeight: multiline ? '1.6em' : 'auto',
          boxSizing: 'border-box',
          display: 'block',
          lineHeight: multiline ? '1.6' : '1.2'
        }}
        data-placeholder={placeholder}
      />
      
      <FormattingToolbar
        onBold={handleBold}
        onItalic={handleItalic}
        isBoldActive={isBoldActive}
        isItalicActive={isItalicActive}
        position={toolbarPosition}
        visible={showToolbar}
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
          textAlign: textAlign as any
        }}>
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
              dangerouslySetInnerHTML={{ 
                __html: title || 'Click to add hero title' 
              }}
            />
          )}
        </div>

        {/* Subtitle - wrapped */}
        <div data-draggable="true" style={{ 
          display: 'block', 
          width: '100%',
          textAlign: textAlign as any
        }}>
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
              dangerouslySetInnerHTML={{ 
                __html: subtitle || 'Click to add subtitle' 
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroTitleSlideTemplate; 