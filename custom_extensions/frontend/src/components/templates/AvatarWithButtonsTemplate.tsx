// custom_extensions/frontend/src/components/templates/AvatarWithButtonsTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { AvatarWithButtonsProps } from '@/types/slideTemplates';
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
        display: 'block',
        lineHeight: '1.2'
      }}
    />
  );
}

export const AvatarWithButtonsTemplate: React.FC<AvatarWithButtonsProps & { 
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  title,
  buttons = [
    { text: 'Внимание', color: '#e91e63' },
    { text: 'Скорость', color: '#e91e63' },
    { text: 'Тепло', color: '#e91e63' },
    { text: 'Забота', color: '#e91e63' }
  ],
  avatarPath,
  avatarAlt,
  backgroundColor = '#1a1a2e',
  titleColor = '#e91e63',
  buttonColor = '#e91e63',
  slideId,
  onUpdate,
  theme,
  isEditable = false
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingButtonIndex, setEditingButtonIndex] = useState<number | null>(null);

  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, buttons, avatarPath, avatarAlt, backgroundColor, titleColor, buttonColor }, title: newTitle });
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setIsEditingTitle(false);
  };

  const handleButtonSave = (newText: string, index: number) => {
    if (onUpdate) {
      const newButtons = [...buttons];
      newButtons[index] = { ...newButtons[index], text: newText };
      onUpdate({ ...{ title, buttons, avatarPath, avatarAlt, backgroundColor, titleColor, buttonColor }, buttons: newButtons });
    }
    setEditingButtonIndex(null);
  };

  const handleButtonCancel = () => {
    setEditingButtonIndex(null);
  };

  const handleAvatarUploaded = (newAvatarPath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, buttons, avatarPath, avatarAlt, backgroundColor, titleColor, buttonColor }, avatarPath: newAvatarPath });
    }
  };

  return (
    <div 
      className="slide-container relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ 
        backgroundColor: backgroundColor,
        minHeight: '100vh'
      }}
    >
      {/* Content container */}
      <div className="relative z-10 w-full h-full flex">
        {/* Left side - Avatar */}
        <div className="w-1/3 h-full flex items-center justify-center px-8">
          {avatarPath ? (
            <div className="relative">
              <img 
                src={avatarPath} 
                alt={avatarAlt || 'Avatar'}
                className="w-48 h-48 object-cover rounded-full"
                style={{ 
                  cursor: isEditable ? 'pointer' : 'default',
                  border: '4px solid white',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}
                onClick={() => isEditable && handleAvatarUploaded('')}
              />
              {isEditable && (
                <div 
                  className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer rounded-full"
                  onClick={() => isEditable && handleAvatarUploaded('')}
                  title="Click to replace avatar"
                >
                  <div className="text-center text-white">
                    <div className="text-xs font-medium">Replace Avatar</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <ClickableImagePlaceholder
              imagePath={avatarPath}
              onImageUploaded={handleAvatarUploaded}
              size="LARGE"
              position="CENTER"
              description="Click to upload avatar"
              prompt="professional headshot with transparent background"
              isEditable={isEditable}
              className="w-48 h-48 rounded-full border-4 border-white shadow-lg"
            />
          )}
        </div>

        {/* Right side - Text and buttons */}
        <div className="w-2/3 h-full flex flex-col justify-center px-12">
          {/* Title */}
          <div className="mb-8">
            {isEditable && isEditingTitle ? (
              <InlineEditor
                initialValue={title}
                onSave={handleTitleSave}
                onCancel={handleTitleCancel}
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: titleColor }}
              />
            ) : (
              <div 
                className="text-3xl md:text-4xl font-bold mb-4 cursor-pointer"
                style={{ color: titleColor }}
                onClick={() => isEditable && setIsEditingTitle(true)}
              >
                {title}
              </div>
            )}
          </div>

          {/* Buttons Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {buttons.map((button, index) => (
              <div key={index} className="relative">
                {isEditable && editingButtonIndex === index ? (
                  <InlineEditor
                    initialValue={button.text}
                    onSave={(newText) => handleButtonSave(newText, index)}
                    onCancel={handleButtonCancel}
                    className="w-full h-16 rounded-lg flex items-center justify-center text-white font-bold text-lg cursor-pointer"
                    style={{ backgroundColor: buttonColor || buttonColor }}
                  />
                ) : (
                  <div 
                    className="w-full h-16 rounded-lg flex items-center justify-center text-white font-bold text-lg cursor-pointer transition-all duration-200 hover:opacity-80"
                    style={{ backgroundColor: buttonColor || buttonColor }}
                    onClick={() => isEditable && setEditingButtonIndex(index)}
                  >
                    {button.text}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom text */}
          <div className="text-white font-bold text-lg">
            ! Каждый элемент важен
          </div>
        </div>
      </div>
    </div>
  );
}; 