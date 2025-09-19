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

// New component for unified bullet points editing (adapted for bullet-points-right)
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

  // Initialize refs array and set proper heights
  useEffect(() => {
    const editLines = editValue.split('\n');
    textareaRefs.current = textareaRefs.current.slice(0, editLines.length);
    
    // Set proper heights for all textareas after a brief delay to ensure DOM is ready
    if (isEditing) {
      setTimeout(() => {
        textareaRefs.current.forEach((textarea, index) => {
          if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
          }
        });
      }, 10);
    }
  }, [editValue, isEditing]);

  // Set initial heights when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        textareaRefs.current.forEach((textarea) => {
          if (textarea) {
            textarea.style.height = 'auto';
            // Calculate proper height for wrapped text
            const computedStyle = window.getComputedStyle(textarea);
            const lineHeight = parseInt(computedStyle.lineHeight) || 20;
            const padding = parseInt(computedStyle.paddingTop) + parseInt(computedStyle.paddingBottom);
            const border = parseInt(computedStyle.borderTopWidth) + parseInt(computedStyle.borderBottomWidth);
            
            // Set a minimum height and ensure all wrapped content is visible
            const minHeight = lineHeight + padding + border;
            const contentHeight = textarea.scrollHeight;
            textarea.style.height = Math.max(minHeight, contentHeight + 4) + 'px';
          }
        });
      }, 50);
    }
  }, [isEditing]);

  const bulletIconStyles: React.CSSProperties = {
    color: theme.colors.accentColor,
    fontWeight: 600,
    minWidth: '20px',
    fontSize: bulletStyle === 'number' ? '1.6rem' : '1.8rem',
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
          position: 'relative',
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box'
        }}
      >
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
                minHeight: '1.6em',
                width: '100%'
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
                <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
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
                      } else if (e.key === 'Backspace') {
                        const target = e.target as HTMLTextAreaElement;
                        const cursorPosition = target.selectionStart;
                        
                        if (cursorPosition === 0 && index > 0) {
                          // Backspace at the beginning of a line - merge with previous
                          e.preventDefault();
                          const newLines = [...editLines];
                          const currentText = newLines[index];
                          const previousText = newLines[index - 1];
                          
                          // Merge current text with previous line
                          newLines[index - 1] = previousText + currentText;
                          newLines.splice(index, 1);
                          setEditValue(newLines.join('\n'));
                          
                          // Focus the previous line and position cursor at the end
                          setFocusedIndex(index - 1);
                          setTimeout(() => {
                            const prevTextarea = textareaRefs.current[index - 1];
                            if (prevTextarea) {
                              prevTextarea.focus();
                              prevTextarea.setSelectionRange(prevTextarea.value.length, prevTextarea.value.length);
                            }
                          }, 10);
                        } else if (line === '' && editLines.length > 1) {
                          // Backspace on empty line - remove the line
                          e.preventDefault();
                          const newLines = editLines.filter((_, i) => i !== index);
                          setEditValue(newLines.join('\n'));
                          
                          // Focus the previous line and position cursor at the end
                          setFocusedIndex(Math.max(0, index - 1));
                          setTimeout(() => {
                            const prevTextarea = textareaRefs.current[Math.max(0, index - 1)];
                            if (prevTextarea) {
                              prevTextarea.focus();
                              prevTextarea.setSelectionRange(prevTextarea.value.length, prevTextarea.value.length);
                            }
                          }, 10);
                        }
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
                      // Auto-resize this specific textarea with better wrapping support
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      // Add a small buffer to ensure all wrapped text is visible
                      target.style.height = (target.scrollHeight + 2) + 'px';
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
      className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
      style={{ padding: '4px', borderRadius: '4px', width: '100%', minWidth: 0, boxSizing: 'border-box' }}
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
            marginBottom: '16px',
            width: '100%'
          }}>
            <span style={bulletIconStyles}>
              {getBulletIcon(bulletStyle, index)}
            </span>
            <span style={{ ...bulletTextStyles, flex: 1, minWidth: 0 }}>
              {bullet || 'Click to add bullet point'}
            </span>
          </li>
        ))}
        {bullets.length === 0 && isEditable && (
          <li style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '12px', 
            marginBottom: '16px',
            width: '100%'
          }}>
            <span style={bulletIconStyles}>•</span>
            <span style={{ ...bulletTextStyles, color: '#9ca3af', fontStyle: 'italic', flex: 1, minWidth: 0 }}>
              Click to add bullet points...
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}

export const BulletPointsRightTemplate: React.FC<BulletPointsRightProps & { 
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
  getPlaceholderGenerationState?: (elementId: string) => { isGenerating: boolean; hasImage: boolean; error?: string };
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
  imagePath,
  widthPx,
  heightPx,
  imageScale,
  imageOffset,
  objectFit,
  getPlaceholderGenerationState
}) => {
  // Use theme colors instead of props
  const effectiveTheme = typeof theme === 'string' && theme.trim() !== '' ? theme : DEFAULT_SLIDE_THEME;
  const currentTheme = getSlideTheme(effectiveTheme);
  
  // Add image ref for proper sizing
  const imageRef = useRef<HTMLDivElement>(null);
  
  // Inline editing state for title and subtitle only
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const slideContainerRef = useRef<HTMLDivElement>(null);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    minHeight: '600px',
        background: currentTheme.colors.backgroundColor,
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
    wordWrap: 'break-word',
    lineHeight: '1.2'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    color: currentTheme.colors.contentColor,
    marginBottom: '28px',
    fontFamily: currentTheme.fonts.contentFont,
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

  // Handle bullet points update
  const handleBulletsUpdate = (newBullets: string[]) => {
    if (onUpdate) {
      onUpdate({ bullets: newBullets });
    }
  };

  // Handle image upload
  const handleImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ imagePath: newImagePath });
    }
  };

  // Handle size and transform changes for the placeholder
  const handleSizeTransformChange = (payload: any) => {
    if (onUpdate) {
      // Convert the payload to the expected format for the backend
      const updateData: any = {};
      
      if (payload.imagePosition) {
        updateData.imageOffset = payload.imagePosition;
      }
      
      if (payload.imageSize) {
        updateData.widthPx = payload.imageSize.width;
        updateData.heightPx = payload.imageSize.height;
      }
      
      // ✅ NEW: Handle objectFit property from ClickableImagePlaceholder
      if (payload.objectFit) {
        updateData.objectFit = payload.objectFit;
        console.log('BulletPointsRightTemplate: objectFit update', { 
          slideId, 
          objectFit: payload.objectFit 
        });
      }
      
      onUpdate(updateData);
    }
  };

  // AI prompt logic
  const displayPrompt = imagePrompt || imageAlt || 'relevant illustration for the bullet points';

  const placeholderStyles: React.CSSProperties = {
    // Only apply default dimensions if no saved size exists
    ...(widthPx && heightPx ? {} : { width: '100%', height: '100%', aspectRatio: '1/1' }),
    margin: '0 auto'
  };

  return (
    <div ref={slideContainerRef} className="bullet-points-right-template" style={slideStyles}>
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
          {title || 'Click to add title'}
        </h1>
      )}

      <div style={contentRowStyles}>
        {/* Left: Subtitle + Bullets */}
        <div style={leftColStyles}>
          {/* Subtitle */}
          
          <div data-draggable="true">
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
                >
                  {subtitle || 'Click to add subtitle'}
                </div>
              )
            )}
          </div>

          {/* Unified bullet points editor */}
          <div data-draggable="true">
            <UnifiedBulletEditor
              bullets={bullets || []}
              bulletStyle={bulletStyle}
              onUpdate={handleBulletsUpdate}
              theme={currentTheme}
              isEditable={isEditable}
            />
          </div>
        </div>
        {/* Right: Clickable Image Placeholder */}
        <div style={rightColStyles} >
            <ClickableImagePlaceholder
              imagePath={imagePath}
              onImageUploaded={handleImageUploaded}
              size="LARGE"
              position="CENTER"
              description="Click to upload image"
              prompt={displayPrompt}
              isEditable={isEditable}
              style={placeholderStyles}
              onSizeTransformChange={handleSizeTransformChange}
              elementId={`${slideId}-image`}
              elementRef={imageRef}
              cropMode={objectFit || 'contain'}
              slideContainerRef={slideContainerRef}
              savedImagePosition={imageOffset}
              savedImageSize={widthPx && heightPx ? { width: widthPx, height: heightPx } : undefined}
              templateId="bullet-points-right"
              aiGeneratedPrompt={imagePrompt}
              isGenerating={getPlaceholderGenerationState ? getPlaceholderGenerationState(`${slideId}-image`).isGenerating : false}
              onGenerationStarted={getPlaceholderGenerationState ? () => {} : undefined}
            />
        </div>
      </div>
    </div>
  );
};

export default BulletPointsRightTemplate; 