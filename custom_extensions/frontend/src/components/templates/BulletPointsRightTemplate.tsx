import React, { useState, useRef, useEffect } from 'react';
import { BulletPointsProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

export interface BulletPointsRightProps extends BulletPointsProps {
  subtitle?: string;
  theme?: SlideTheme;
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

export const BulletPointsRightTemplate: React.FC<BulletPointsRightProps & { 
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  slideId,
  title,
  subtitle = '',
  bullets,
  maxColumns = 1,
  bulletStyle = 'dot',
  onUpdate,
  imagePrompt,
  imageAlt,
  theme,
  isEditable = false,
  imagePath
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [editingBullets, setEditingBullets] = useState<number[]>([]);
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
    backgroundColor: currentTheme.colors.backgroundColor,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: '60px',
    position: 'relative',
    fontFamily: currentTheme.fonts.contentFont
  };

  const contentRowStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '48px'
  };

  const leftColStyles: React.CSSProperties = {
    flex: '1 1 60%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    minWidth: 0
  };

  const rightColStyles: React.CSSProperties = {
    flex: '0 0 40%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    paddingRight: '20px'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    color: currentTheme.colors.titleColor,
    textAlign: 'left',
    marginBottom: '24px',
    wordWrap: 'break-word'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    color: currentTheme.colors.contentColor,
    marginBottom: '28px',
    fontFamily: currentTheme.fonts.contentFont,
    wordWrap: 'break-word'
  };

  const bulletIconStyles: React.CSSProperties = {
    color: currentTheme.colors.accentColor,
    fontWeight: 600,
    minWidth: '20px',
    fontSize: bulletStyle === 'number' ? '1.6rem' : '1.8rem',
    fontFamily: currentTheme.fonts.titleFont
  };

  const getBulletIcon = (style: string, index: number) => {
    switch (style) {
      case 'dot':
        return '•';
      case 'arrow':
        return '→';
      case 'check':
        return '✓';
      case 'star':
        return '★';
      case 'number':
        return `${index + 1}.`;
      default:
        return '•';
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

  // Handle bullet editing
  const handleBulletSave = (index: number, newBullet: string) => {
    if (onUpdate && bullets) {
      const updatedBullets = [...bullets];
      updatedBullets[index] = newBullet;
      onUpdate({ bullets: updatedBullets });
    }
    setEditingBullets(editingBullets.filter(i => i !== index));
  };

  const handleBulletCancel = (index: number) => {
    setEditingBullets(editingBullets.filter(i => i !== index));
  };

  const startEditingBullet = (index: number) => {
    setEditingBullets([...editingBullets, index]);
  };

  // Handle image upload
  const handleImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ imagePath: newImagePath });
    }
  };

  // AI prompt logic
  const displayPrompt = imagePrompt || imageAlt || 'relevant illustration for the bullet points';

  const placeholderStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    margin: '0 auto'
    
  };

  return (
    <div className="bullet-points-right-template" style={slideStyles}>
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

      <div style={contentRowStyles}>
        {/* Left: Subtitle + Bullets */}
        <div style={leftColStyles}>
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
                  display: 'block'
                }}
              />
            ) : (
              <div 
                style={subtitleStyles}
                onClick={() => {
                  if (isEditable) {
                    setEditingSubtitle(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
              >
                {subtitle}
              </div>
            )
          )}

          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}>
            {bullets?.map((bullet: string, index: number) => {
              const colonIdx = bullet.indexOf(':');
              let before = bullet;
              let after = '';
              if (colonIdx !== -1) {
                before = bullet.slice(0, colonIdx + 1);
                after = bullet.slice(colonIdx + 1);
              }
              return (
                <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                  {React.createElement('span', { style: bulletIconStyles }, getBulletIcon(bulletStyle, index))}
                  {isEditable && editingBullets.includes(index) ? (
                    <InlineEditor
                      initialValue={bullet || ''}
                      onSave={(newBullet) => handleBulletSave(index, newBullet)}
                      onCancel={() => handleBulletCancel(index)}
                      multiline={true}
                      placeholder="Enter bullet point..."
                      className="inline-editor-bullet"
                      style={{
                        fontFamily: currentTheme.fonts.contentFont,
                        fontSize: currentTheme.fonts.contentSize,
                        color: currentTheme.colors.contentColor,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        boxShadow: 'none',
                        resize: 'none',
                        overflow: 'hidden',
                        width: '100%',
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                        boxSizing: 'border-box',
                        display: 'block',
                        lineHeight: '1.6',
                        margin: '0',
                        padding: '0'
                      }}
                    />
                  ) : (
                    React.createElement(
                      'span',
                      { 
                        style: { 
                          fontFamily: currentTheme.fonts.contentFont, 
                          fontSize: currentTheme.fonts.contentSize, 
                          color: currentTheme.colors.contentColor, 
                          paddingTop: '10px' 
                        },
                        onClick: () => {
                          if (isEditable) {
                            startEditingBullet(index);
                          }
                        },
                        className: isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''
                      },
                      colonIdx !== -1
                        ? [React.createElement('strong', { key: 'b' }, before), after]
                        : bullet || 'Click to add bullet point'
                    )
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        {/* Right: Clickable Image Placeholder */}
        <div style={rightColStyles}>
          <ClickableImagePlaceholder
            imagePath={imagePath}
            onImageUploaded={handleImageUploaded}
            size="LARGE"
            position="CENTER"
            description="Click to upload image"
            prompt={displayPrompt}
            isEditable={isEditable}
            style={placeholderStyles}
          />
        </div>
      </div>
    </div>
  );
};

export default BulletPointsRightTemplate; 