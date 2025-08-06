import React, { useState, useRef, useEffect } from 'react';
import { SixIdeasListTemplateProps } from '@/types/slideTemplates';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
//here
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
        width: '100%'
      }}
    />
  );
}

const SixIdeasListTemplate: React.FC<SixIdeasListTemplateProps> = ({
  title = 'SIX DIFFERENT IDEAS',
  ideas = [
    { number: '01', text: 'Mercury is the smallest planet in the Solar System' },
    { number: '02', text: 'Venus is the second planet from the Sun' },
    { number: '03', text: 'Despite being red, Mars is actually a cold place' },
    { number: '04', text: 'Jupiter is the biggest planet in the Solar System' },
    { number: '05', text: 'Saturn is composed of hydrogen and helium' },
    { number: '06', text: 'Neptune is the farthest planet from the Sun' }
  ],
  imageUrl,
  imageAlt,
  imagePrompt,
  imagePath,
  titleColor,
  textColor,
  backgroundColor,
  slideId,
  theme,
  isEditable = false,
  onUpdate
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const tColor = titleColor || currentTheme.colors.titleColor;
  const txtColor = textColor || currentTheme.colors.contentColor;
  const bgColor = backgroundColor || currentTheme.colors.backgroundColor;

  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingIdeas, setEditingIdeas] = useState<{ [key: number]: boolean }>({});

  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  const handleIdeaSave = (index: number, field: 'number' | 'text', value: string) => {
    if (onUpdate) {
      const updatedIdeas = [...ideas];
      updatedIdeas[index] = { ...updatedIdeas[index], [field]: value };
      onUpdate({ ideas: updatedIdeas });
    }
    setEditingIdeas(prev => ({ ...prev, [index]: false }));
  };

  const handleIdeaCancel = (index: number) => {
    setEditingIdeas(prev => ({ ...prev, [index]: false }));
  };

  const handleIdeaEdit = (index: number) => {
    if (!isEditable) return;
    setEditingIdeas(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div
      style={{
        background: bgColor,
        minHeight: 600,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: currentTheme.fonts.contentFont,
        position: 'relative',
        padding: '40px',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Section - Text Content */}
      <div style={{ 
        flex: '0 0 auto',
        backgroundColor: bgColor,
        padding: '40px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: `1px solid ${txtColor}`,
        opacity: 0.1
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          {isEditable && editingTitle ? (
            <InlineEditor
              initialValue={title}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={false}
              placeholder="Enter title..."
              style={{
                fontWeight: 700,
                fontSize: currentTheme.fonts.titleSize,
                color: tColor,
                textAlign: 'center',
                width: '100%',
                fontFamily: currentTheme.fonts.titleFont
              }}
            />
          ) : (
            <div
              style={{
                fontWeight: 700,
                fontSize: currentTheme.fonts.titleSize,
                color: tColor,
                textAlign: 'center',
                cursor: isEditable ? 'pointer' : 'default',
                fontFamily: currentTheme.fonts.titleFont
              }}
              onClick={() => isEditable && setEditingTitle(true)}
              className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
            >
              {title || (isEditable ? 'Click to add title' : '')}
            </div>
          )}
        </div>

        {/* Ideas Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '40px'
        }}>
          {ideas.map((idea, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}>
              {/* Number and Line */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
                width: '100%'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: tColor,
                  marginRight: '12px',
                  fontFamily: currentTheme.fonts.titleFont
                }}>
                  {idea.number}
                </div>
                <div style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: tColor
                }} />
              </div>
              
              {/* Text */}
              <div style={{
                fontSize: currentTheme.fonts.contentSize,
                color: txtColor,
                lineHeight: '1.4',
                fontFamily: currentTheme.fonts.contentFont
              }}>
                {idea.text || (isEditable ? 'Click to add text' : '')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section - Image */}
      <div style={{
        flex: '1 1 auto',
        width: '100%',
        height: '300px',
        backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '8px',
        backgroundColor: imageUrl ? 'transparent' : '#e9ecef',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6c757d',
        fontSize: '16px',
        border: imageUrl ? 'none' : '2px dashed #adb5bd'
      }}>
        {!imageUrl && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🖼️</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>Image Placeholder</div>
            <div style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '12px' }}>
              AI Prompt: "{imagePrompt || imageAlt || 'relevant illustration for the ideas'}"
            </div>
            <div style={{ fontSize: '12px', color: '#868e96' }}>Click to upload image</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SixIdeasListTemplate; 