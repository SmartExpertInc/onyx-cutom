// custom_extensions/frontend/src/components/templates/TitleSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { TitleSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import { WysiwygEditor } from '@/components/editors/WysiwygEditor';

export const TitleSlideTemplate: React.FC<TitleSlideProps & { 
  theme?: string | SlideTheme;
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
  // Use theme colors instead of props - ensure we always have a valid theme
  const effectiveTheme = typeof theme === 'string' && theme.trim() !== '' ? theme : DEFAULT_SLIDE_THEME;
  const currentTheme = typeof theme === 'string' ? getSlideTheme(effectiveTheme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor, titleColor, subtitleColor } = currentTheme.colors;




  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  
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
    border: `2px solid ${titleColor}`,
    borderRadius: '50%',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const logoTextStyles: React.CSSProperties = {
    fontSize: '17px',
    fontWeight: '300',
    color: titleColor
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '3rem',
    fontFamily: currentTheme.fonts.titleFont,
    color: titleColor,
    textAlign: 'center',
    marginTop: '130px',
    marginBottom: '24px',
    lineHeight: 1.2,
    maxWidth: '900px',
    textShadow: backgroundImage ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none',
    wordWrap: 'break-word',
    fontWeight: 'bold'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '1.2rem',
    fontFamily: currentTheme.fonts.contentFont,
    color: subtitleColor,
    textAlign: 'center',
    marginBottom: '40px',
    lineHeight: 1.4,
    maxWidth: '700px',
    textShadow: backgroundImage ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none',
    wordWrap: 'break-word',
    opacity: 0.9
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
      {/* Logo at the top */}
      <div 
        ref={logoRef}
        data-moveable-element={`${slideId}-logo`}
        data-draggable="true" 
        style={logoStyles}
      >
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

      {/* Main Title - wrapped */}
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
              if (isEditable) {
                setEditingTitle(true);
              }
            }}
            className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
            dangerouslySetInnerHTML={{ __html: title || 'Your title here' }}
          />
        )}
      </div>

      {/* Subtitle */}
      <div data-draggable="true" style={{ display: 'inline-block' }}>
        {isEditable && editingSubtitle ? (
          <WysiwygEditor
            initialValue={subtitle || 'Add a short description.'}
            onSave={handleSubtitleSave}
            onCancel={handleSubtitleCancel}
            placeholder="Enter subtitle..."
            className="inline-editor-subtitle"
            style={{
              ...subtitleStyles,
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              boxSizing: 'border-box',
              display: 'block',
              lineHeight: '1.4'
            }}
          />
        ) : (
          <h2 
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
            className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
            dangerouslySetInnerHTML={{ __html: subtitle || 'Add a short description.' }}
          />
        )}
      </div>

      {/* Metadata */}
      {(author || date) && (
        <div style={metadataStyles} data-draggable="true">
          {author && (
            isEditable && editingAuthor ? (
              <WysiwygEditor
                initialValue={author || ''}
                onSave={handleAuthorSave}
                onCancel={handleAuthorCancel}
                placeholder="Enter author name..."
                className="inline-editor-author"
                style={{
                  ...metadataItemStyles,
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block',
                  lineHeight: '1.4'
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
                dangerouslySetInnerHTML={{ __html: author }}
              />
            )
          )}
          {date && (
            isEditable && editingDate ? (
              <WysiwygEditor
                initialValue={date || ''}
                onSave={handleDateSave}
                onCancel={handleDateCancel}
                placeholder="Enter date..."
                className="inline-editor-date"
                style={{
                  ...metadataItemStyles,
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block',
                  lineHeight: '1.4'
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
                dangerouslySetInnerHTML={{ __html: date }}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default TitleSlideTemplate; 