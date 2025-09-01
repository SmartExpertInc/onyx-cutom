// custom_extensions/frontend/src/components/templates/TableOfContentsSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { TitleSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
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
        display: 'block'
      }}
    />
  );
}

export const TableOfContentsSlideTemplate: React.FC<TitleSlideProps & { 
  theme?: SlideTheme;
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
  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, subtitleColor } = currentTheme.colors;

  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingItem1, setEditingItem1] = useState(false);
  const [editingItem2, setEditingItem2] = useState(false);
  const [editingItem3, setEditingItem3] = useState(false);
  const [editingItem4, setEditingItem4] = useState(false);
  const [editingItem5, setEditingItem5] = useState(false);
  const [editingItem6, setEditingItem6] = useState(false);
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
    backgroundColor: '#FEF3C7',
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    flexDirection: 'row',
    padding: '0',
    position: 'relative',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const leftColumnStyles: React.CSSProperties = {
    flex: '1',
    padding: '60px 80px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  };

  const rightColumnStyles: React.CSSProperties = {
    flex: '1',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '48px',
    fontFamily: 'Inter, sans-serif',
    color: '#000000',
    textAlign: 'left',
    marginBottom: '40px',
    lineHeight: 1.2,
    maxWidth: '100%',
    fontWeight: '700'
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr 1fr',
    gap: '24px',
    width: '100%'
  };

  const itemStyles: React.CSSProperties = {
    backgroundColor: '#86EFAC',
    borderRadius: '16px',
    padding: '32px 24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '120px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const itemTextStyles: React.CSSProperties = {
    fontSize: '24px',
    fontFamily: 'Inter, sans-serif',
    color: '#000000',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 1.3
  };

  const avatarStyles: React.CSSProperties = {
    width: '300px',
    height: '400px',
    objectFit: 'cover',
    borderRadius: '16px',
    backgroundColor: '#BFDBFE'
  };

  // Default content based on the image
  const defaultTitle = "Table of Contents";
  const defaultItems = [
    "The Problem",
    "Benefits", 
    "Best Practices",
    "Methods",
    "Achieving Success",
    "The Future"
  ];

  const handleUpdate = (field: string, value: string) => {
    if (onUpdate) {
      onUpdate({ [field]: value });
    }
  };

  return (
    <div style={slideStyles}>
      {/* Left Column - Content */}
      <div style={leftColumnStyles}>
        {/* Title */}
        <div style={titleStyles}>
          {isEditable ? (
            editingTitle ? (
              <InlineEditor
                initialValue={title || defaultTitle}
                onSave={(value) => {
                  handleUpdate('title', value);
                  setEditingTitle(false);
                }}
                onCancel={() => setEditingTitle(false)}
                style={titleStyles}
              />
            ) : (
              <div onClick={() => setEditingTitle(true)} style={{ cursor: 'pointer' }}>
                {title || defaultTitle}
              </div>
            )
          ) : (
            title || defaultTitle
          )}
        </div>

        {/* Grid of Items */}
        <div style={gridStyles}>
          {defaultItems.map((item, index) => (
            <div key={index} style={itemStyles}>
                              {isEditable ? (
                  (() => {
                    let editingState = false;
                    let setEditingState: React.Dispatch<React.SetStateAction<boolean>> = () => {};
                    
                    switch(index) {
                      case 0: editingState = editingItem1; setEditingState = setEditingItem1; break;
                      case 1: editingState = editingItem2; setEditingState = setEditingItem2; break;
                      case 2: editingState = editingItem3; setEditingState = setEditingItem3; break;
                      case 3: editingState = editingItem4; setEditingState = setEditingItem4; break;
                      case 4: editingState = editingItem5; setEditingState = setEditingItem5; break;
                      case 5: editingState = editingItem6; setEditingState = setEditingItem6; break;
                    }
                    
                    return editingState ? (
                      <InlineEditor
                        initialValue={item}
                        onSave={(value) => {
                          handleUpdate(`item${index + 1}`, value);
                          setEditingState(false);
                        }}
                        onCancel={() => setEditingState(false)}
                        style={itemTextStyles}
                      />
                    ) : (
                      <div onClick={() => setEditingState(true)} style={itemTextStyles}>
                        {item}
                      </div>
                    );
                  })()
                ) : (
                <div style={itemTextStyles}>
                  {item}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Column - Avatar */}
      <div style={rightColumnStyles}>
        <AvatarImageDisplay
          size="LARGE"
          position="CENTER"
          style={avatarStyles}
        />
      </div>
    </div>
  );
}; 