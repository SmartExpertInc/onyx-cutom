// custom_extensions/frontend/src/components/templates/AvatarStepsSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { AvatarWithStepsProps } from '@/types/slideTemplates';
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

export const AvatarStepsSlideTemplate: React.FC<AvatarWithStepsProps & {
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  title,
  steps = [
    'Приветствие',
    'Консультация',
    'Комфорт во время',
    'Финальные рекомендации',
    'Прощание и отзыв'
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

  const handleStepSave = (index: number, newText: string) => {
    if (onUpdate) {
      const newSteps = [...steps];
      newSteps[index] = newText;
      onUpdate({ steps: newSteps });
    }
    // setEditingSteps(editingSteps.filter(i => i !== index)); // This line was removed from the new_code, so it's removed here.
  };

  const handleStepCancel = (index: number) => {
    // setEditingSteps(editingSteps.filter(i => i !== index)); // This line was removed from the new_code, so it's removed here.
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

  const contentContainerStyles: React.CSSProperties = {,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '1200px',
    gap: '40px',

  const leftContentStyles: React.CSSProperties = {,
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '32px',

  const rightContentStyles: React.CSSProperties = {,
    flex: '1',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    position: 'relative',
    height: '100%',

  const titleStyles: React.CSSProperties = {,
    fontSize: '2.8rem',
    fontFamily: 'Lora-Bold, serif',
    color: backgroundColor === '#ffffff' ? '#000000' : titleColor,
    marginBottom: '40px',
    lineHeight: '1.2',
    wordWrap: 'break-word',

  const stepsContainerStyles: React.CSSProperties = {,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    width: '100%',
    maxWidth: '500px',

  const stepBoxStyles: React.CSSProperties = {,
    padding: '20px 32px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '1.3rem',
    fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
    color: '#000000',
    backgroundColor: titleColor,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    wordWrap: 'break-word',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '400px',

  const arrowStyles: React.CSSProperties = {,
    fontSize: '2rem',
    color: '#ffffff',
    textAlign: 'center',
    margin: '8px 0',
    fontFamily: 'Lora-Bold, serif', fontWeight: 'normal',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',

  const placeholderStyles: React.CSSProperties = {,
    width: '744px',
    height: '714px',
    margin: '0 auto',
    position: 'absolute',
    top: '-246px',
    zIndex: 3,

  return (
    <div style={slideStyles}>
      <div style={contentContainerStyles}>
        {/* Left content - Title and Steps */}
        <div style={leftContentStyles}>
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
                padding: '8px 12px',
                border: 'none',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '4px',
                color: '#ffffff'
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
              {title || 'Каждый шаг - это часть сервиса'}
            </h1>
          )}

          {/* Steps */}
          <div style={stepsContainerStyles}>
            {steps.map((step, index) => (
              <div key={index}>
                {/* The editing logic for steps was removed from the new_code, so this block is simplified */}
                <button
                  style={stepBoxStyles}
                  onClick={() => {
                    if (isEditable) {
                      // setEditingSteps([...editingSteps, index]); // This line was removed from the new_code, so it's removed here.
                    }
                  }}
                  className={isEditable ? 'hover:opacity-80' : ''}
                >
                  {step}
                </button>
                {index < steps.length - 1 && (
                  <div style={arrowStyles}>↓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right content - Avatar */}
        <div style={rightContentStyles}>
          <AvatarImageDisplay
            size="MEDIUM"
            position="CENTER"
            style={placeholderStyles}
          />
        </div>
      </div>
    </div>
  );
}; 