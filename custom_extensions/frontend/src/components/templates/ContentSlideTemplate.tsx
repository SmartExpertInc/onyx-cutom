// custom_extensions/frontend/src/components/templates/ContentSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ContentSlideProps } from '@/types/slideTemplates';
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
          lineHeight: '1.3'
        }}
    />
  );
}

export const ContentSlideTemplate: React.FC<ContentSlideProps & { 
  theme?: string | SlideTheme;
  onUpdate?: (props: any) => void;
  onAutoSave?: () => void;
}> = ({
  slideId,
  title,
  content,
  alignment = 'left',
  backgroundImage,
  isEditable = false,
  onUpdate,
  theme,
  onAutoSave
}) => {
  // Use theme colors instead of props - ensure we always have a valid theme
  const effectiveTheme = typeof theme === 'string' && theme.trim() !== '' ? theme : DEFAULT_SLIDE_THEME;
  const currentTheme = typeof theme === 'string' ? getSlideTheme(effectiveTheme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor, titleColor, contentColor } = currentTheme.colors;
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
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
    background: backgroundColor,
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
    padding: '80px',
    position: 'relative',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    color: titleColor,
    textAlign: alignment,
    marginBottom: '40px',
    lineHeight: 1.3,
    maxWidth: '900px',
    textShadow: backgroundImage ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none',
    wordWrap: 'break-word'
  };

  const contentStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    fontFamily: currentTheme.fonts.contentFont,
    color: contentColor,
    textAlign: alignment,
    lineHeight: 1.6,
    maxWidth: '800px',
    wordWrap: 'break-word',
    textShadow: backgroundImage ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none'
    };

  const editOverlayStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    display: isEditable ? 'flex' : 'none',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  // Handle title editing
  const handleTitleSave = (newTitle: string) => {
    console.log('🔍 ContentSlideTemplate: Saving title:', newTitle);
    console.log('🔍 ContentSlideTemplate: Current slide props before update:', { title, content });
    
    if (onUpdate) {
      console.log('🔍 ContentSlideTemplate: Calling onUpdate with new title');
      onUpdate({ title: newTitle });
      
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      // Note: Auto-save is now handled by the parent component via onUpdate
      // No need to call onAutoSave here as it would cause duplicate requests
      console.log('🔍 ContentSlideTemplate: Title update completed, auto-save handled by parent');
    } else {
      console.warn('🔍 ContentSlideTemplate: onUpdate is not available');
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  // Handle content editing
  const handleContentSave = (newContent: string) => {
    console.log('🔍 ContentSlideTemplate: Saving content:', newContent.substring(0, 50) + '...');
    if (onUpdate) {
      onUpdate({ content: newContent });
      
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      // Note: Auto-save is now handled by the parent component via onUpdate
      // No need to call onAutoSave here as it would cause duplicate requests
      console.log('🔍 ContentSlideTemplate: Content update completed, auto-save handled by parent');
    }
    setEditingContent(false);
  };

  const handleContentCancel = () => {
    setEditingContent(false);
  };

  // Handle immediate save on blur
  const handleInputBlur = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    if (onAutoSave) {
      console.log('Auto-save triggered on blur');
      onAutoSave();
    }
  };

  // Parse content as simple HTML or markdown-like formatting
  const parseContent = (text: string) => {
    // Simple parsing for basic formatting (this could be expanded)
    const lines = text.split('\n');
    return lines.map((line, index) => {
      if (line.trim() === '') {
        return <br key={index} />;
      }
      
      // Handle bold text **text**
      let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Handle italic text *text*
      processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      return (
        <p 
          key={index} 
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      );
    });
  };

  // Debug logging
  console.log('ContentSlideTemplate render:', {
    isEditable,
    editingTitle,
    editingContent,
    title,
    content: content?.substring(0, 50) + '...'
  });

  return (
    <div className="content-slide-template" style={slideStyles}>
      {/* Title - wrapped */}
      <div data-draggable="true" style={{ display: 'inline-block' }}>
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
              display: 'block',
              lineHeight: '1.3'
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
              
              console.log('Title clicked, isEditable:', isEditable);
              if (isEditable) {
                setEditingTitle(true);
              }
            }}
            className={isEditable ? 'cursor-pointer border border-transparent hover-border-gray-300 hover-border-opacity-50' : ''}
          >
            {title || 'Click to add title'}
          </h1>
        )}
      </div>

      {/* Content - wrapped */}
      <div data-draggable="true" style={{ display: 'inline-block', width: '100%' }}>
        {isEditable && editingContent ? (
          <InlineEditor
            initialValue={content || ''}
            onSave={handleContentSave}
            onCancel={handleContentCancel}
            multiline={true}
            placeholder="Enter slide content..."
            className="inline-editor-content"
            style={{
              ...contentStyles,
              // Ensure content behaves exactly like div element
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
            style={contentStyles}
            onClick={(e) => {
              const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
              if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              
              console.log('Content clicked, isEditable:', isEditable);
              if (isEditable) {
                setEditingContent(true);
              }
            }}
            className={isEditable ? 'cursor-pointer border border-transparent hover-border-gray-300 hover-border-opacity-50' : ''}
          >
            {content ? parseContent(content) : <p>Click to add content...</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentSlideTemplate; 