import React, { useState, useRef, useEffect } from 'react';
import { SixIdeasListTemplateProps } from '@/types/slideTemplates';
import { getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
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
  const effectiveTheme = typeof theme === 'string' && theme.trim() !== '' ? theme : DEFAULT_SLIDE_THEME;
  const currentTheme = getSlideTheme(effectiveTheme);
  const tColor = titleColor || currentTheme.colors.titleColor;
  const txtColor = textColor || currentTheme.colors.contentColor;
  const bgColor = backgroundColor || currentTheme.colors.backgroundColor;

  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingIdeas, setEditingIdeas] = useState<{ [key: number]: { number: boolean; text: boolean } }>({});

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
    setEditingIdeas(prev => ({ 
      ...prev, 
      [index]: { ...prev[index], [field]: false } 
    }));
  };

  const handleIdeaCancel = (index: number, field: 'number' | 'text') => {
    setEditingIdeas(prev => ({ 
      ...prev, 
      [index]: { ...prev[index], [field]: false } 
    }));
  };

  const handleIdeaEdit = (index: number, field: 'number' | 'text') => {
    if (!isEditable) return;
    setEditingIdeas(prev => ({ 
      ...prev, 
      [index]: { ...prev[index], [field]: true } 
    }));
  };

  const handleImageUpload = (newImageUrl: string) => {
    if (onUpdate) {
      onUpdate({ imageUrl: newImageUrl });
    }
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
        padding: '30px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
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
          gap: '30px'
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
                marginBottom: '10px',
                width: '100%'
              }}>
                {isEditable && editingIdeas[index]?.number ? (
                  <InlineEditor
                    initialValue={idea.number}
                    onSave={(value) => handleIdeaSave(index, 'number', value)}
                    onCancel={() => handleIdeaCancel(index, 'number')}
                    multiline={false}
                    placeholder="01"
                    style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      color: tColor,
                      marginRight: '12px',
                      fontFamily: currentTheme.fonts.titleFont,
                      width: 'auto',
                      minWidth: '40px'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      color: tColor,
                      marginRight: '12px',
                      fontFamily: currentTheme.fonts.titleFont,
                      cursor: isEditable ? 'pointer' : 'default'
                    }}
                    onClick={() => handleIdeaEdit(index, 'number')}
                    className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                  >
                    {idea.number || (isEditable ? '01' : '')}
                  </div>
                )}
                <div style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: tColor
                }} />
              </div>
              
              {/* Text */}
              {isEditable && editingIdeas[index]?.text ? (
                <InlineEditor
                  initialValue={idea.text}
                  onSave={(value) => handleIdeaSave(index, 'text', value)}
                  onCancel={() => handleIdeaCancel(index, 'text')}
                  multiline={true}
                  placeholder="Click to add text"
                  style={{
                    fontSize: currentTheme.fonts.contentSize,
                    color: txtColor,
                    lineHeight: '1.4',
                    fontFamily: currentTheme.fonts.contentFont,
                    width: '100%'
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: currentTheme.fonts.contentSize,
                    color: txtColor,
                    lineHeight: '1.4',
                    fontFamily: currentTheme.fonts.contentFont,
                    cursor: isEditable ? 'pointer' : 'default',
                    minHeight: '1.4em'
                  }}
                  onClick={() => handleIdeaEdit(index, 'text')}
                  className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
                >
                  {idea.text || (isEditable ? 'Click to add text' : '')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section - Image */}
      <div style={{
        flex: '1 1 auto',
        width: '100%',
        height: '500px',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <ClickableImagePlaceholder
          imagePath={imageUrl}
          onImageUploaded={handleImageUpload}
          size="LARGE"
          position="CENTER"
          description="Click to upload image"
          prompt={imagePrompt || imageAlt || 'relevant illustration for the ideas'}
          isEditable={isEditable}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '8px'
          }}
        />
      </div>
    </div>
  );
};

export default SixIdeasListTemplate; 