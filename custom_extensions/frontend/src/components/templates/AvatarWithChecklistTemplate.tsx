// custom_extensions/frontend/src/components/templates/AvatarWithChecklistTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { AvatarWithChecklistProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
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
          lineHeight: '1.6',
          overflowWrap: 'anywhere'
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
        // Only override browser defaults, preserve all passed styles
        background: 'transparent',
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
        width: '100%',
        wordWrap: 'break-word',
        boxSizing: 'border-box',
        display: 'block'
      }}
    />
  );
}

export const AvatarWithChecklistTemplate: React.FC<AvatarWithChecklistProps & {
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  title,
  items = [
    { text: 'Улыбка и приветствие', isPositive: true },
    { text: 'Внимание к деталям', isPositive: true },
    { text: 'Профессиональный подход', isPositive: true },
    { text: 'Игнорирование клиента', isPositive: false },
    { text: 'Холодное отношение', isPositive: false },
    { text: 'Небрежность в работе', isPositive: false }
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
  const [editingItems, setEditingItems] = useState<number[]>([]);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

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

  // Handle item text editing
  const handleItemSave = (index: number, newText: string) => {
    if (onUpdate) {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], text: newText };
      onUpdate({ items: newItems });
    }
    setEditingItems(editingItems.filter(i => i !== index));
  };

  const handleItemCancel = (index: number) => {
    setEditingItems(editingItems.filter(i => i !== index));
  };

  // Handle avatar upload
  const handleAvatarUploaded = (newAvatarPath: string) => {
    if (onUpdate) {
      onUpdate({ avatarPath: newAvatarPath });
    }
  };

  const slideStyles: React.CSSProperties = {
    minHeight: '600px',
    backgroundColor: backgroundColor,
    fontFamily: currentTheme.fonts.contentFont,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  };

  const contentContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '900px',
    gap: '32px'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    color: titleColor,
    marginBottom: '32px',
    lineHeight: '1.2',
    wordWrap: 'break-word'
  };

  const itemsContainerStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    width: '100%',
    maxWidth: '700px'
  };

  const itemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: currentTheme.fonts.contentSize,
    fontFamily: currentTheme.fonts.contentFont,
    color: contentColor,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    wordWrap: 'break-word'
  };

  const avatarContainerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '32px'
  };

  const placeholderStyles: React.CSSProperties = {
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    margin: '0 auto'
  };

  return (
    <div style={slideStyles}>
      <div style={contentContainerStyles}>
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

        {/* Avatar */}
        <div style={avatarContainerStyles}>
          <ClickableImagePlaceholder
            imagePath={avatarPath}
            onImageUploaded={handleAvatarUploaded}
            size="MEDIUM"
            position="CENTER"
            description="Click to upload avatar"
            prompt="Professional headshot with transparent background"
            style={placeholderStyles}
          />
        </div>

        {/* Checklist Items */}
        <div style={itemsContainerStyles}>
          {items.map((item, index) => (
            <div key={index} style={itemStyles}>
              <span style={{ fontSize: '20px' }}>
                {item.isPositive ? '✅' : '❌'}
              </span>
              {isEditable && editingItems.includes(index) ? (
                <InlineEditor
                  initialValue={item.text}
                  onSave={(newText) => handleItemSave(index, newText)}
                  onCancel={() => handleItemCancel(index)}
                  placeholder="Enter item text..."
                  className="inline-editor-item"
                  style={{
                    flex: 1,
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
                    background: 'transparent',
                    color: contentColor,
                    fontSize: currentTheme.fonts.contentSize,
                    fontFamily: currentTheme.fonts.contentFont
                  }}
                />
              ) : (
                <span
                  style={{ flex: 1 }}
                  onClick={() => {
                    if (isEditable) {
                      setEditingItems([...editingItems, index]);
                    }
                  }}
                  className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
                >
                  {item.text}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 