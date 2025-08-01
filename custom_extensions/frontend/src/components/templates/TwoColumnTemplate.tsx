// custom_extensions/frontend/src/components/templates/TwoColumnTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { TwoColumnProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

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

export const TwoColumnTemplate: React.FC<TwoColumnProps & { 
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  title,
  leftTitle,
  leftContent,
  leftImageAlt,
  leftImagePrompt,
  rightTitle,
  rightContent,
  rightImageAlt,
  rightImagePrompt,
  columnRatio,
  theme,
  onUpdate,
  isEditable = false
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingLeftTitle, setEditingLeftTitle] = useState(false);
  const [editingLeftContent, setEditingLeftContent] = useState(false);
  const [editingRightTitle, setEditingRightTitle] = useState(false);
  const [editingRightContent, setEditingRightContent] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // AI prompt logic (like BigImageLeftTemplate)
  const leftDisplayPrompt = leftImagePrompt || leftImageAlt || "man sitting on a chair";
  const rightDisplayPrompt = rightImagePrompt || rightImageAlt || "man sitting on a chair";

  const placeholderStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: '320px',
    maxHeight: '200px',
    // aspectRatio: '1 / 1',
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
    // margin: '0 auto 24px auto'
    marginBottom: '24px'
  };

  const titleStyles: React.CSSProperties = {
    textAlign: 'left',
    marginBottom: '40px',
    fontWeight: '700',
    fontFamily: currentTheme.fonts.titleFont,
    fontSize: currentTheme.fonts.titleSize,
    color: currentTheme.colors.titleColor,
    wordWrap: 'break-word'
  };

  const columnTitleStyles: React.CSSProperties = {
    fontFamily: currentTheme.fonts.titleFont,
    fontSize: '27px',
    color: currentTheme.colors.titleColor,
    margin: '16px 0 16px 0',
    alignSelf: 'flex-start',
    wordWrap: 'break-word'
  };

  const columnContentStyles: React.CSSProperties = {
    fontFamily: currentTheme.fonts.contentFont,
    fontSize: currentTheme.fonts.contentSize,
    color: currentTheme.colors.contentColor,
    margin: 0,
    alignSelf: 'flex-start',
    lineHeight: 1.6,
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

  // Handle left title editing
  const handleLeftTitleSave = (newLeftTitle: string) => {
    if (onUpdate) {
      onUpdate({ leftTitle: newLeftTitle });
    }
    setEditingLeftTitle(false);
  };

  const handleLeftTitleCancel = () => {
    setEditingLeftTitle(false);
  };

  // Handle left content editing
  const handleLeftContentSave = (newLeftContent: string) => {
    if (onUpdate) {
      onUpdate({ leftContent: newLeftContent });
    }
    setEditingLeftContent(false);
  };

  const handleLeftContentCancel = () => {
    setEditingLeftContent(false);
  };

  // Handle right title editing
  const handleRightTitleSave = (newRightTitle: string) => {
    if (onUpdate) {
      onUpdate({ rightTitle: newRightTitle });
    }
    setEditingRightTitle(false);
  };

  const handleRightTitleCancel = () => {
    setEditingRightTitle(false);
  };

  // Handle right content editing
  const handleRightContentSave = (newRightContent: string) => {
    if (onUpdate) {
      onUpdate({ rightContent: newRightContent });
    }
    setEditingRightContent(false);
  };

  const handleRightContentCancel = () => {
    setEditingRightContent(false);
  };

  return (
    <div
      style={{
        padding: '40px',
        minHeight: '600px',
        backgroundColor: currentTheme.colors.backgroundColor,
        fontFamily: currentTheme.fonts.contentFont,
      }}
    >
      {/* Main Title */}
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

      <div
        style={{
          display: 'flex',
          gap: '40px',
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Placeholder first */}
          <div style={placeholderStyles}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
              Image Placeholder
            </div>
            <div style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '12px' }}>
              AI Prompt: "{leftDisplayPrompt}"
            </div>
            <div style={{ fontSize: '12px', color: '#868e96' }}>
              320px × 320px
            </div>
          </div>
          {/* Left Mini title */}
          {isEditable && editingLeftTitle ? (
            <InlineEditor
              initialValue={leftTitle || ''}
              onSave={handleLeftTitleSave}
              onCancel={handleLeftTitleCancel}
              multiline={true}
              placeholder="Enter left column title..."
              className="inline-editor-left-title"
              style={{
                ...columnTitleStyles,
                // Ensure title behaves exactly like h2 element
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
            <h2 
              style={columnTitleStyles}
              onClick={() => {
                if (isEditable) {
                  setEditingLeftTitle(true);
                }
              }}
              className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
            >
              {leftTitle || 'Click to add left title'}
            </h2>
          )}
          {/* Left Main text */}
          {isEditable && editingLeftContent ? (
            <InlineEditor
              initialValue={leftContent || ''}
              onSave={handleLeftContentSave}
              onCancel={handleLeftContentCancel}
              multiline={true}
              placeholder="Enter left column content..."
              className="inline-editor-left-content"
              style={{
                ...columnContentStyles,
                // Ensure content behaves exactly like p element
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
            <p 
              style={columnContentStyles}
              onClick={() => {
                if (isEditable) {
                  setEditingLeftContent(true);
                }
              }}
              className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
            >
              {leftContent || 'Click to add left content'}
            </p>
          )}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column'}}>
          {/* Placeholder first */}
          <div style={placeholderStyles}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
              Image Placeholder
            </div>
            <div style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '12px' }}>
              AI Prompt: "{rightDisplayPrompt}"
            </div>
            <div style={{ fontSize: '12px', color: '#868e96' }}>
              320px × 320px
            </div>
          </div>
          {/* Right Mini title */}
          {isEditable && editingRightTitle ? (
            <InlineEditor
              initialValue={rightTitle || ''}
              onSave={handleRightTitleSave}
              onCancel={handleRightTitleCancel}
              multiline={true}
              placeholder="Enter right column title..."
              className="inline-editor-right-title"
              style={{
                ...columnTitleStyles,
                // Ensure title behaves exactly like h2 element
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
            <h2 
              style={columnTitleStyles}
              onClick={() => {
                if (isEditable) {
                  setEditingRightTitle(true);
                }
              }}
              className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
            >
              {rightTitle || 'Click to add right title'}
            </h2>
          )}
          {/* Right Main text */}
          {isEditable && editingRightContent ? (
            <InlineEditor
              initialValue={rightContent || ''}
              onSave={handleRightContentSave}
              onCancel={handleRightContentCancel}
              multiline={true}
              placeholder="Enter right column content..."
              className="inline-editor-right-content"
              style={{
                ...columnContentStyles,
                // Ensure content behaves exactly like p element
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
            <p 
              style={columnContentStyles}
              onClick={() => {
                if (isEditable) {
                  setEditingRightContent(true);
                }
              }}
              className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
            >
              {rightContent || 'Click to add right content'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoColumnTemplate;