// custom_extensions/frontend/src/components/templates/BulletPointsTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { BulletPointsProps } from '@/types/slideTemplates';
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

export const BulletPointsTemplate: React.FC<BulletPointsProps & { 
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  slideId,
  title,
  bullets,
  maxColumns = 2,
  bulletStyle = 'dot',
  isEditable = false,
  onUpdate,
  imagePrompt,
  imageAlt,
  theme
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
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
    padding: '80px',
    position: 'relative',
    fontFamily: currentTheme.fonts.contentFont
  };

  // Placeholder styles (left)
  const placeholderContainerStyles: React.CSSProperties = {
    flex: '0 0 50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0
  };
  const placeholderStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '1 / 1',
    backgroundColor: '#e9ecef',
    border: '2px dashed #adb5bd',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    textAlign: 'center',
    color: '#6c757d',
    margin: '0 auto'
  };

  // Right (bullets) styles
  const bulletsContainerStyles: React.CSSProperties = {
    flex: '1 1 50%',
    fontSize: currentTheme.fonts.contentSize,
    fontFamily: currentTheme.fonts.contentFont,
    color: currentTheme.colors.contentColor,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    paddingLeft: '40px'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    color: currentTheme.colors.titleColor,
    textAlign: 'left',
    marginBottom: '32px',
    wordWrap: 'break-word'
  };

  const bulletItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    fontSize: currentTheme.fonts.contentSize,
    lineHeight: 1.6,
    color: currentTheme.colors.contentColor,
    marginBottom: '16px',
    minWidth: maxColumns === 2 ? '40%' : '100%',
    flex: maxColumns === 2 ? '0 0 45%' : '1 1 100%'
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

  const bulletIconStyles: React.CSSProperties = {
    color: currentTheme.colors.accentColor,
    fontWeight: 600,
    minWidth: '20px',
    fontSize: bulletStyle === 'number' ? '1.1rem' : '1.2rem',
    fontFamily: currentTheme.fonts.titleFont
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

  // AI prompt logic
  const displayPrompt = imagePrompt || imageAlt || 'relevant illustration for the bullet points';

  return (
    <div className="bullet-points-template" style={slideStyles}>
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

      <div style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-evenly' }}>
        {/* Left: Placeholder */}
        <div style={placeholderContainerStyles}>
          <div style={placeholderStyles}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
              Image Placeholder
            </div>
            <div style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '12px' }}>
              AI Prompt: "{displayPrompt}"
            </div>
            <div style={{ fontSize: '12px', color: '#868e96' }}>
              320px × 320px
            </div>
          </div>
        </div>
        {/* Right: Bullets as list */}
        <div style={bulletsContainerStyles}>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            width: '100%'
          }}>
            {bullets?.map((bullet: string, index: number) => (
              <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                <span style={bulletIconStyles}>{getBulletIcon(bulletStyle, index)}</span>
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
                  <span 
                    style={{ 
                      fontFamily: currentTheme.fonts.contentFont, 
                      fontSize: currentTheme.fonts.contentSize, 
                      color: currentTheme.colors.contentColor 
                    }}
                    onClick={() => {
                      if (isEditable) {
                        startEditingBullet(index);
                      }
                    }}
                    className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
                  >
                    {bullet || 'Click to add bullet point'}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BulletPointsTemplate; 