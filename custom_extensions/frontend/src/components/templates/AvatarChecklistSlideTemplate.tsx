// custom_extensions/frontend/src/components/templates/AvatarChecklistSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { AvatarWithChecklistProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import AvatarImageDisplay from '../AvatarImageDisplay';

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

  useEffect(() => {
    if (multiline && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [value, multiline]);

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
          lineHeight: '1.6',
          overflowWrap: 'anywhere',
          color: 'inherit'
        }}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      className={`inline-editor-input ${className}`}
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
          boxSizing: 'border-box',
          display: 'block',
          color: 'inherit'
        }}
    />
  );
}

export const AvatarChecklistSlideTemplate: React.FC<AvatarWithChecklistProps & {
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  title,
  items = [
    { text: '«Позвольте я помогу»', isPositive: true },
    { text: '«С удовольствием уточню»', isPositive: true },
    { text: '«Спасибо, что обратили внимание»', isPositive: true },
    { text: 'Исключаем холодные фразы и неуверенность', isPositive: false }
  ],
  avatarPath,
  avatarAlt,
  slideId,
  onUpdate,
  theme,
  isEditable = false
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, contentColor } = currentTheme.colors;
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [editingChecklistItems, setEditingChecklistItems] = useState<number[]>([]);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  const handleItemSave = (index: number, newText: string) => {
    if (onUpdate) {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], text: newText };
      onUpdate({ items: newItems });
    }
    setEditingChecklistItems(editingChecklistItems.filter(i => i !== index));
  };

  const handleItemCancel = (index: number) => {
    setEditingChecklistItems(editingChecklistItems.filter(i => i !== index));
  };

  const handleAvatarUploaded = (newAvatarPath: string) => {
    if (onUpdate) {
      onUpdate({ avatarPath: newAvatarPath });
    }
  };

  const slideStyles: React.CSSProperties = {
    minHeight: '600px',
    backgroundColor: backgroundColor,
    fontFamily: 'Lora, serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    position: 'relative',
    overflow: 'hidden'
  };

  const contentContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '1200px',
    gap: '40px',
    position: 'relative',
    zIndex: 2
  };

  const leftContentStyles: React.CSSProperties = {
    flex: '1',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    zIndex: 2,
    position: 'relative',
    height: '100%'
  };

  const rightContentStyles: React.CSSProperties = {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '24px',
    zIndex: 2,
    position: 'relative'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '2.2rem',
    fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
    color: titleColor,
    marginBottom: '32px',
    lineHeight: '1.2',
    wordWrap: 'break-word',
    fontFamily: 'Lora-Bold, serif', fontWeight: 'normal'
  };

  const checklistContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%'
  };

  const checklistItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    fontSize: '1.2rem',
    fontFamily: 'Lora, serif',
    color: contentColor,
    lineHeight: '1.4',
    padding: '8px 0'
  };

  const iconStyles: React.CSSProperties = {
    fontSize: '1.4rem',
    fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
    color: titleColor,
    minWidth: '24px'
  };

  const placeholderStyles: React.CSSProperties = {
    width: '623px',
    height: '562px',
    margin: '0 auto',
    position: 'absolute',
    top: '-246px',
    zIndex: 3
  };

  const pinkShapeStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '500px',
    height: '400px',
    backgroundColor: titleColor,
    borderRadius: '0 0 250px 0',
    zIndex: 1
  };

  const darkShapeStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '350px',
    height: '250px',
    backgroundColor: '#1a1a2e',
    borderRadius: '0 0 200px 0',
    zIndex: 1
  };

  return (
    <div style={slideStyles}>
      {/* Pink shape in top-left corner */}
      <div style={pinkShapeStyles}></div>
      {/* Dark shape overlapping */}
      <div style={darkShapeStyles}></div>
      
      <div style={contentContainerStyles}>
        {/* Left content - Avatar */}
        <div style={leftContentStyles}>
          <AvatarImageDisplay
            size="MEDIUM"
            position="CENTER"
            style={placeholderStyles}
          />
        </div>

        {/* Right content - Title and Checklist */}
        <div style={rightContentStyles}>
          {/* Title with question mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ ...iconStyles, fontSize: '2rem' }}>?</span>
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
                  margin: '0',
                  padding: '8px 12px',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  overflow: 'hidden',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px'
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
                {title || 'Как звучать профессионально'}
              </h1>
            )}
          </div>

          {/* Checklist */}
          <div style={checklistContainerStyles}>
            {items.map((item, index) => (
              <div key={index} style={checklistItemStyles}>
                <span style={{ ...iconStyles, color: item.isPositive ? titleColor : '#ff4444' }}>
                  {item.isPositive ? '✓' : '✗'}
                </span>
                {isEditable && editingChecklistItems.includes(index) ? (
                  <InlineEditor
                    initialValue={item.text}
                    onSave={(newText) => handleItemSave(index, newText)}
                    onCancel={() => handleItemCancel(index)}
                    placeholder="Enter checklist item..."
                    className="inline-editor-checklist-item"
                    style={{
                      ...checklistItemStyles,
                      margin: '0',
                      padding: '8px 12px',
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                      overflow: 'hidden',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      boxSizing: 'border-box',
                      display: 'block',
                      flex: '1',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px'
                    }}
                  />
                ) : (
                  <span
                    onClick={() => {
                      if (isEditable) {
                        setEditingChecklistItems([...editingChecklistItems, index]);
                      }
                    }}
                    className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
                    style={{ flex: '1' }}
                  >
                    {item.text}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 