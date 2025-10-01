import React, { useState, useRef, useEffect } from 'react';
import { BulletPointsProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

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

// Component for unified bullet points editing
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

  const bulletsToText = (bullets: string[]): string => {
    return bullets.join('\n');
  };

  const textToBullets = (text: string): string[] => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line !== 'Click to add bullet point' && line !== 'Click to add bullet points...');
  };

  const getBulletIcon = (style: string, index: number) => {
    return '▶';
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

  useEffect(() => {
    if (isEditing && textareaRefs.current[focusedIndex]) {
      textareaRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isEditing]);

  useEffect(() => {
    const editLines = editValue.split('\n');
    textareaRefs.current = textareaRefs.current.slice(0, editLines.length);
    
    if (isEditing) {
      setTimeout(() => {
        textareaRefs.current.forEach((textarea) => {
          if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
          }
        });
      }, 10);
    }
  }, [editValue, isEditing]);

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        textareaRefs.current.forEach((textarea) => {
          if (textarea) {
            textarea.style.height = 'auto';
            const computedStyle = window.getComputedStyle(textarea);
            const lineHeight = parseInt(computedStyle.lineHeight) || 20;
            const padding = parseInt(computedStyle.paddingTop) + parseInt(computedStyle.paddingBottom);
            const border = parseInt(computedStyle.borderTopWidth) + parseInt(computedStyle.borderBottomWidth);
            const minHeight = lineHeight + padding + border;
            const contentHeight = textarea.scrollHeight;
            textarea.style.height = Math.max(minHeight, contentHeight + 4) + 'px';
          }
        });
      }, 50);
    }
  }, [isEditing]);

  const bulletIconStyles: React.CSSProperties = {
    color: '#ffffff',
    fontWeight: 'bold',
    minWidth: '14px',
    minHeight: '14px',
    width: '14px',
    height: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontFamily: 'sans-serif',
    flexShrink: 0
  };

  const bulletTextStyles: React.CSSProperties = {
    fontFamily: 'sans-serif',
    fontSize: '1.2rem',
    marginTop: '-5px',
    opacity: '0.8',
    color: '#ffffff',
    lineHeight: '1.6'
  };

  if (isEditing) {
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
            const shouldShowBullet = !isEmpty && !isPlaceholder;
            
            return (
              <li key={index} style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '12px', 
                marginBottom: '30px',
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
                        const newLines = [...editLines];
                        newLines.splice(index + 1, 0, '');
                        setEditValue(newLines.join('\n'));
                        setFocusedIndex(index + 1);
                      } else if (e.key === 'Backspace') {
                        const target = e.target as HTMLTextAreaElement;
                        const cursorPosition = target.selectionStart;
                        
                        if (cursorPosition === 0 && index > 0) {
                          e.preventDefault();
                          const newLines = [...editLines];
                          const currentText = newLines[index];
                          const previousText = newLines[index - 1];
                          newLines[index - 1] = previousText + currentText;
                          newLines.splice(index, 1);
                          setEditValue(newLines.join('\n'));
                          setFocusedIndex(index - 1);
                          setTimeout(() => {
                            const prevTextarea = textareaRefs.current[index - 1];
                            if (prevTextarea) {
                              prevTextarea.focus();
                              prevTextarea.setSelectionRange(prevTextarea.value.length, prevTextarea.value.length);
                            }
                          }, 10);
                        } else if (line === '' && editLines.length > 1) {
                          e.preventDefault();
                          const newLines = editLines.filter((_, i) => i !== index);
                          setEditValue(newLines.join('\n'));
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
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
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
      style={{ padding: '4px', borderRadius: '4px', width: '77%', minWidth: 0, boxSizing: 'border-box' }}
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
            marginBottom: '35px',
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
            marginBottom: '35px',
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

export const BulletPointsTemplate: React.FC<BulletPointsProps & { 
  subtitle?: string;
  theme?: SlideTheme;
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
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const imageRef = useRef<HTMLDivElement>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const slideContainerRef = useRef<HTMLDivElement>(null);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    minHeight: '600px',
    background: '#ffffff',
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
    fontFamily: currentTheme.fonts.contentFont,
    overflow: 'hidden'
  };

  // LEFT side with IMAGE (white background)
  const leftSectionStyles: React.CSSProperties = {
    width: '100%',
    height: '600px',
    position: 'absolute',
    left: '0',
    top: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    zIndex: 1
  };

  // RIGHT side with TITLE and BULLETS (dark blue background with diagonal cut)
  const rightSectionStyles: React.CSSProperties = {
    width: '65%',
    height: '600px',
    position: 'absolute',
    right: '0',
    top: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
    padding: '35px',
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 15% 100%)', // Mirrored diagonal cut - bottom left corner
    zIndex: 2
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '3.5rem',
    fontFamily: 'serif',
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: '40px',
    wordWrap: 'break-word',
    lineHeight: '1.1'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '1.2rem',
    color: currentTheme.colors.subtitleColor,
    marginBottom: '32px',
    fontFamily: currentTheme.fonts.contentFont,
    wordWrap: 'break-word',
    lineHeight: '1.4'
  };

  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  const handleSubtitleSave = (newSubtitle: string) => {
    if (onUpdate) {
      onUpdate({ subtitle: newSubtitle });
    }
    setEditingSubtitle(false);
  };

  const handleSubtitleCancel = () => {
    setEditingSubtitle(false);
  };

  const handleBulletsUpdate = (newBullets: string[]) => {
    if (onUpdate) {
      onUpdate({ bullets: newBullets });
    }
  };

  const handleImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ imagePath: newImagePath });
    }
  };

  const handleSizeTransformChange = (payload: any) => {
    if (onUpdate) {
      const updateData: any = {};
      
      if (payload.imagePosition) {
        updateData.imageOffset = payload.imagePosition;
      }
      
      if (payload.imageSize) {
        updateData.widthPx = payload.imageSize.width;
        updateData.heightPx = payload.imageSize.height;
      }
      
      if (payload.objectFit) {
        updateData.objectFit = payload.objectFit;
      }
      
      onUpdate(updateData);
    }
  };

  const displayPrompt = imagePrompt || imageAlt || 'relevant illustration for the bullet points';

  const placeholderStyles: React.CSSProperties = {
    ...(widthPx && heightPx ? {} : { width: '100%', height: '100%', aspectRatio: '1/1' }),
    margin: '0 auto',
    position: 'relative',
    zIndex: 1
  };

  return (
    <div ref={slideContainerRef} className="bullet-points-template" style={slideStyles}>
      {/* LEFT section with IMAGE */}
      <div style={leftSectionStyles}>
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
          cropMode={objectFit || 'cover'}
          slideContainerRef={slideContainerRef}
          savedImagePosition={imageOffset}
          savedImageSize={widthPx && heightPx ? { width: widthPx, height: heightPx } : undefined}
          templateId="bullet-points"
          aiGeneratedPrompt={imagePrompt}
          isGenerating={getPlaceholderGenerationState ? getPlaceholderGenerationState(`${slideId}-image`).isGenerating : false}
          onGenerationStarted={getPlaceholderGenerationState ? () => {} : undefined}
        />
      </div>

      {/* RIGHT section with TITLE and BULLETS */}
      <div style={rightSectionStyles}>
        {/* Title */}
        <div data-draggable="true">
          {isEditable && editingTitle ? (
            <InlineEditor
              initialValue={title || 'Problem'}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={true}
              placeholder="Enter slide title..."
              className="inline-editor-title"
              style={{
                ...titleStyles,
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
            >
              {title || 'Problem'}
            </h1>
          )}
        </div>

        {/* Bullets */}
        <div data-draggable="true">
          <UnifiedBulletEditor
            bullets={bullets || []}
            bulletStyle="arrow"
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
