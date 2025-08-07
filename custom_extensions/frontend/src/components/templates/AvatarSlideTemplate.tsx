// custom_extensions/frontend/src/components/templates/AvatarSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { AvatarSlideProps } from '@/types/slideTemplates';
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

export const AvatarSlideTemplate: React.FC<AvatarSlideProps & { 
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  title,
  subtitle,
  content,
  avatarPath,
  avatarAlt,
  backgroundColor = '#ffffff',
  titleColor = '#e91e63',
  subtitleColor = '#000000',
  contentColor = '#e91e63',
  slideId,
  onUpdate,
  theme,
  isEditable = false
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);

  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, content, avatarPath, avatarAlt, backgroundColor, titleColor, subtitleColor, contentColor }, title: newTitle });
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setIsEditingTitle(false);
  };

  const handleSubtitleSave = (newSubtitle: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, content, avatarPath, avatarAlt, backgroundColor, titleColor, subtitleColor, contentColor }, subtitle: newSubtitle });
    }
    setIsEditingSubtitle(false);
  };

  const handleSubtitleCancel = () => {
    setIsEditingSubtitle(false);
  };

  const handleContentSave = (newContent: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, content, avatarPath, avatarAlt, backgroundColor, titleColor, subtitleColor, contentColor }, content: newContent });
    }
    setIsEditingContent(false);
  };

  const handleContentCancel = () => {
    setIsEditingContent(false);
  };

  const handleAvatarUploaded = (newAvatarPath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, subtitle, content, avatarPath, avatarAlt, backgroundColor, titleColor, subtitleColor, contentColor }, avatarPath: newAvatarPath });
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
        {/* Left side - Text content */}
        <div className="w-1/2 h-full flex flex-col justify-center px-12">
          {/* Title */}
          <div className="mb-6">
            {isEditable && isEditingTitle ? (
              <InlineEditor
                initialValue={title}
                onSave={handleTitleSave}
                onCancel={handleTitleCancel}
                className="text-4xl md:text-5xl font-bold mb-2"
                style={{ color: titleColor }}
              />
            ) : (
              <div 
                className="text-4xl md:text-5xl font-bold mb-2 cursor-pointer"
                style={{ color: titleColor }}
                onClick={() => isEditable && setIsEditingTitle(true)}
              >
                {title}
              </div>
            )}
            
            {subtitle && (
              isEditable && isEditingSubtitle ? (
                <InlineEditor
                  initialValue={subtitle}
                  onSave={handleSubtitleSave}
                  onCancel={handleSubtitleCancel}
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: subtitleColor }}
                />
              ) : (
                <div 
                  className="text-2xl md:text-3xl font-bold cursor-pointer"
                  style={{ color: subtitleColor }}
                  onClick={() => isEditable && setIsEditingSubtitle(true)}
                >
                  {subtitle}
                </div>
              )
            )}
          </div>

          {/* Content */}
          {content && (
            <div className="mb-6">
              {isEditable && isEditingContent ? (
                <InlineEditor
                  initialValue={content}
                  onSave={handleContentSave}
                  onCancel={handleContentCancel}
                  multiline={true}
                  className="text-lg md:text-xl"
                  style={{ color: contentColor }}
                />
              ) : (
                <div 
                  className="text-lg md:text-xl cursor-pointer"
                  style={{ color: contentColor }}
                  onClick={() => isEditable && setIsEditingContent(true)}
                >
                  {content}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side - Avatar */}
        <div className="w-1/2 h-full flex items-center justify-center px-8">
          {avatarPath ? (
            <div className="relative">
              <img 
                src={avatarPath} 
                alt={avatarAlt || 'Avatar'}
                className="w-64 h-64 object-cover rounded-full"
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
              className="w-64 h-64 rounded-full border-4 border-white shadow-lg"
            />
          )}
        </div>
      </div>
    </div>
  );
}; 