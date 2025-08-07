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

export const AvatarWithChecklistTemplate: React.FC<AvatarWithChecklistProps & { 
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
  backgroundColor = '#ffffff',
  titleColor = '#e91e63',
  itemColor = '#000000',
  slideId,
  onUpdate,
  theme,
  isEditable = false
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, items, avatarPath, avatarAlt, backgroundColor, titleColor, itemColor }, title: newTitle });
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setIsEditingTitle(false);
  };

  const handleItemSave = (newText: string, index: number) => {
    if (onUpdate) {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], text: newText };
      onUpdate({ ...{ title, items, avatarPath, avatarAlt, backgroundColor, titleColor, itemColor }, items: newItems });
    }
    setEditingItemIndex(null);
  };

  const handleItemCancel = () => {
    setEditingItemIndex(null);
  };

  const handleAvatarUploaded = (newAvatarPath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, items, avatarPath, avatarAlt, backgroundColor, titleColor, itemColor }, avatarPath: newAvatarPath });
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
      {/* Background accent shapes */}
      <div className="absolute top-0 left-0 w-1/3 h-1/2 bg-gray-800 rounded-br-full"></div>
      <div className="absolute top-0 left-0 w-1/2 h-1/3 bg-pink-500 rounded-br-full"></div>
      
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
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
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

        {/* Right side - Text and checklist */}
        <div className="w-2/3 h-full flex flex-col justify-center px-12">
          {/* Title with question mark */}
          <div className="mb-8 flex items-center">
            <span className="text-4xl mr-3" style={{ color: titleColor }}>?</span>
            {isEditable && isEditingTitle ? (
              <InlineEditor
                initialValue={title}
                onSave={handleTitleSave}
                onCancel={handleTitleCancel}
                className="text-3xl md:text-4xl font-bold"
                style={{ color: titleColor }}
              />
            ) : (
              <div 
                className="text-3xl md:text-4xl font-bold cursor-pointer"
                style={{ color: titleColor }}
                onClick={() => isEditable && setIsEditingTitle(true)}
              >
                {title}
              </div>
            )}
          </div>

          {/* Checklist */}
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                <span 
                  className="text-2xl font-bold mt-1"
                  style={{ color: titleColor }}
                >
                  {item.isPositive ? '✓' : '✗'}
                </span>
                <div className="flex-1">
                  {isEditable && editingItemIndex === index ? (
                    <InlineEditor
                      initialValue={item.text}
                      onSave={(newText) => handleItemSave(newText, index)}
                      onCancel={handleItemCancel}
                      className="text-lg md:text-xl"
                      style={{ color: itemColor }}
                    />
                  ) : (
                    <div 
                      className="text-lg md:text-xl cursor-pointer"
                      style={{ color: itemColor }}
                      onClick={() => isEditable && setEditingItemIndex(index)}
                    >
                      {item.text}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 