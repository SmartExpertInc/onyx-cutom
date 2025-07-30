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

// New component for unified bullet points editing
interface UnifiedBulletEditorProps {
  bullets: string[];
  bulletStyle: string;
  onUpdate: (bullets: string[]) => void;
  theme: SlideTheme;
  isEditable: boolean;
}

function UnifiedBulletEditor({ 
  bullets, 
  bulletStyle, 
  onUpdate, 
  theme, 
  isEditable 
}: UnifiedBulletEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  // Convert bullets array to text for editing
  const bulletsToText = (bullets: string[]): string => {
    return bullets.join('\n');
  };

  // Convert text back to bullets array
  const textToBullets = (text: string): string[] => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line !== 'Click to add bullet point' && line !== 'Click to add bullet points...');
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

  const startEditing = () => {
    if (!isEditable) return;
    setEditValue(bulletsToText(bullets));
    setIsEditing(true);
    setFocusedIndex(0);
  };

  const handleSave = () => {
    const newBullets = textToBullets(editValue);
    onUpdate(newBullets);
    setIsEditing(false);
    setFocusedIndex(0);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFocusedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  // Focus management
  useEffect(() => {
    if (isEditing && textareaRefs.current[focusedIndex]) {
      textareaRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isEditing]);

  // Initialize refs array
  useEffect(() => {
    const editLines = editValue.split('\n');
    textareaRefs.current = textareaRefs.current.slice(0, editLines.length);
  }, [editValue]);

  const bulletIconStyles: React.CSSProperties = {
    color: theme.colors.accentColor,
    fontWeight: 600,
    minWidth: '20px',
    fontSize: bulletStyle === 'number' ? '1.1rem' : '1.2rem',
    fontFamily: theme.fonts.titleFont
  };

  const bulletTextStyles: React.CSSProperties = {
    fontFamily: theme.fonts.contentFont,
    fontSize: theme.fonts.contentSize,
    color: theme.colors.contentColor,
    lineHeight: '1.6'
  };

  if (isEditing) {
    // WYSIWYG editing mode with visible bullet icons
    const editLines = editValue.split('\n');
    const currentBullets = textToBullets(editValue);
    
    return (
      <div 
        style={{ 
          padding: '4px', 
          borderRadius: '4px',
          border: '1px solid #3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          position: 'relative'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '8px',
          backgroundColor: '#3b82f6',
          color: 'white',
          fontSize: '10px',
          padding: '2px 6px',
          borderRadius: '4px',
          fontWeight: '500'
        }}>
          Editing
        </div>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          width: '100%'
        }}>
          {editLines.map((line: string, index: number) => {
            const trimmedLine = line.trim();
            const isEmpty = trimmedLine.length === 0;
            const isPlaceholder = trimmedLine === 'Click to add bullet point' || trimmedLine === 'Click to add bullet points...';
            
            // Only show bullet icon for non-empty lines that aren't placeholders
            const shouldShowBullet = !isEmpty && !isPlaceholder;
            
            return (
              <li key={index} style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '12px', 
                marginBottom: '16px',
                minHeight: '1.6em'
              }}>
                {shouldShowBullet && (
                  <span style={bulletIconStyles}>
                    {getBulletIcon(bulletStyle, currentBullets.indexOf(trimmedLine))}
                  </span>
                )}
                {!shouldShowBullet && (
                  <span style={{ ...bulletIconStyles, opacity: 0.3 }}>
                    {getBulletIcon(bulletStyle, index)}
                  </span>
                )}
                <div style={{ flex: 1, position: 'relative' }}>
                  <textarea
                    ref={(el) => {
                      textareaRefs.current[index] = el;
                    }}
                    value={line}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      const newLines = [...editLines];
                      newLines[index] = e.target.value;
                      setEditValue(newLines.join('\n'));
                    }}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        // Insert a new line at the current position
                        const newLines = [...editLines];
                        newLines.splice(index + 1, 0, '');
                        setEditValue(newLines.join('\n'));
                        
                        // Focus the new line
                        setFocusedIndex(index + 1);
                      } else if (e.key === 'Backspace' && line === '' && editLines.length > 1) {
                        e.preventDefault();
                        // Remove empty line
                        const newLines = editLines.filter((_, i) => i !== index);
                        setEditValue(newLines.join('\n'));
                        
                        // Focus the previous line
                        setFocusedIndex(Math.max(0, index - 1));
                      } else if (e.key === 'ArrowUp' && index > 0) {
                        e.preventDefault();
                        setFocusedIndex(index - 1);
                      } else if (e.key === 'ArrowDown' && index < editLines.length - 1) {
                        e.preventDefault();
                        setFocusedIndex(index + 1);
                      } else if (e.key === 'Escape') {
                        e.preventDefault();
                        handleCancel();
                      } else if (e.key === 'Tab') {
                        e.preventDefault();
                        handleSave();
                      }
                    }}
                    onFocus={() => {
                      setFocusedIndex(index);
                    }}
                    onBlur={() => {
                      // Only save on blur if we're not switching to another textarea
                      setTimeout(() => {
                        const activeElement = document.activeElement;
                        const isStillInEditMode = activeElement?.classList.contains('bullet-edit-textarea');
                        if (!isStillInEditMode) {
                          handleSave();
                        }
                      }, 100);
                    }}
                    placeholder={index === 0 ? "Enter bullet points... Press Enter for new line" : ""}
                    className="bullet-edit-textarea"
                    style={{
                      ...bulletTextStyles,
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
                      padding: '0',
                      margin: '0',
                      height: 'auto'
                    }}
                    rows={1}
                    onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                      // Auto-resize this specific textarea
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = target.scrollHeight + 'px';
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div 
      onClick={startEditing}
      className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
      style={{ padding: '4px', borderRadius: '4px' }}
    >
      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        width: '100%'
      }}>
        {bullets.map((bullet: string, index: number) => (
          <li key={index} style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '12px', 
            marginBottom: '16px' 
          }}>
            <span style={bulletIconStyles}>
              {getBulletIcon(bulletStyle, index)}
            </span>
            <span style={bulletTextStyles}>
              {bullet || 'Click to add bullet point'}
            </span>
          </li>
        ))}
        {bullets.length === 0 && isEditable && (
          <li style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '12px', 
            marginBottom: '16px' 
          }}>
            <span style={bulletIconStyles}>•</span>
            <span style={{ ...bulletTextStyles, color: '#9ca3af', fontStyle: 'italic' }}>
              Click to add bullet points...
            </span>
          </li>
        )}
      </ul>
    </div>
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
  
  // Inline editing state for title only
  const [editingTitle, setEditingTitle] = useState(false);
  
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

  // Handle bullet points update
  const handleBulletsUpdate = (newBullets: string[]) => {
    if (onUpdate) {
      onUpdate({ bullets: newBullets });
    }
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
        {/* Right: Unified bullet points editor */}
        <div style={bulletsContainerStyles}>
          <UnifiedBulletEditor
            bullets={bullets || []}
            bulletStyle={bulletStyle}
            onUpdate={handleBulletsUpdate}
            theme={currentTheme}
            isEditable={isEditable}
          />
        </div>
      </div>
    </div>
  );
};

export default BulletPointsTemplate; 