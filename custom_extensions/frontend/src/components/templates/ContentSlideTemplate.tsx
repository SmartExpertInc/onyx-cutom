// custom_extensions/frontend/src/components/templates/ContentSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ContentSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import { WysiwygEditor } from '@/components/editors/WysiwygEditor';

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
  const { backgroundColor, titleColor, subtitleColor } = currentTheme.colors;
  
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
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(135deg, #0F58F9 0%, #1023A1 100%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
    padding: '40px',
    position: 'relative',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '3.5rem',
    fontFamily: currentTheme.fonts.titleFont,
    color: titleColor,
    textAlign: alignment,
    marginBottom: '24px',
    lineHeight: 1.2,
    maxWidth: '900px',
    textShadow: backgroundImage ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none',
    wordWrap: 'break-word',
    fontWeight: 'bold'
  };

  const contentStyles: React.CSSProperties = {
    fontSize: '1.2rem',
    fontFamily: currentTheme.fonts.contentFont,
    color: subtitleColor,
    textAlign: alignment,
    lineHeight: 1.4,
    maxWidth: '800px',
    wordWrap: 'break-word',
    textShadow: backgroundImage ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none',
    opacity: 0.9
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
          <WysiwygEditor
            initialValue={title || ''}
            onSave={handleTitleSave}
            onCancel={handleTitleCancel}
            placeholder="Enter slide title..."
            className="inline-editor-title"
            style={{
              ...titleStyles,
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
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
              
              console.log('Title clicked, isEditable:', isEditable);
              if (isEditable) {
                setEditingTitle(true);
              }
            }}
            className={isEditable ? 'cursor-pointer border border-transparent hover-border-gray-300 hover-border-opacity-50' : ''}
            dangerouslySetInnerHTML={{ __html: title || 'Click to add title' }}
          />
        )}
      </div>

      {/* Content - wrapped */}
      <div data-draggable="true" style={{ display: 'inline-block', width: '100%' }}>
        {isEditable && editingContent ? (
          <WysiwygEditor
            initialValue={content || ''}
            onSave={handleContentSave}
            onCancel={handleContentCancel}
            placeholder="Enter slide content..."
            className="inline-editor-content"
            style={{
              ...contentStyles,
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
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
            dangerouslySetInnerHTML={{ __html: content || 'Click to add content...' }}
          />
        )}
      </div>
    </div>
  );
};

export default ContentSlideTemplate; 