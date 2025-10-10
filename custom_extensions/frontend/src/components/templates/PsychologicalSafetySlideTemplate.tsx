// custom_extensions/frontend/src/components/templates/PsychologicalSafetySlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { PsychologicalSafetySlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
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
        background: 'transparent',
        border: 'none',
        outline: 'none',
        boxShadow: 'none',
        width: '100%',
        boxSizing: 'border-box',
        display: 'block',
      }}
    />
  );
}

export const PsychologicalSafetySlideTemplate: React.FC<PsychologicalSafetySlideProps & {
  theme?: SlideTheme | string;
}> = ({
  slideId,
  title = 'Fostering Psychological Safety',
  content = 'Studies indicate that teams with a high level of psychological safety have a 21% higher chance of delivering high-quality results.',
  profileImagePath = '',
  profileImageAlt = 'Profile image',
  backgroundColor,
  titleColor,
  contentColor,
  accentColor,
  isEditable = false,
  onUpdate,
  theme,
  voiceoverText
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingContent, setEditingContent] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentContent, setCurrentContent] = useState(content);

  // Use theme colors instead of props
  const currentTheme = typeof theme === 'string' ? getSlideTheme(theme) : (theme || getSlideTheme(DEFAULT_SLIDE_THEME));
  const { backgroundColor: themeBg, titleColor: themeTitle, contentColor: themeContent, accentColor: themeAccent } = currentTheme.colors;

  const slideStyles: React.CSSProperties = {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: '#3F3395',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: currentTheme.fonts.titleFont,
  };

  const handleTitleSave = (newTitle: string) => {
    setCurrentTitle(newTitle);
    setEditingTitle(false);
    if (onUpdate) {
      onUpdate({ ...{ title, content, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, title: newTitle });
    }
  };

  const handleContentSave = (newContent: string) => {
    setCurrentContent(newContent);
    setEditingContent(false);
    if (onUpdate) {
      onUpdate({ ...{ title, content, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, content: newContent });
    }
  };

  const handleTitleCancel = () => {
    setCurrentTitle(title);
    setEditingTitle(false);
  };

  const handleContentCancel = () => {
    setCurrentContent(content);
    setEditingContent(false);
  };

  const handleProfileImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ ...{ title, content, profileImagePath, profileImageAlt, backgroundColor, titleColor, contentColor, accentColor }, profileImagePath: newImagePath });
    }
  };

  return (
    <div className="psychological-safety-slide-template inter-theme" style={slideStyles}>
      {/* Main Card */}
      <div style={{
        width: '600px',
        height: '336px',
        backgroundColor: '#6955F3',
        borderRadius: '30px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative'
      }}>
                 {/* Profile Image - Top Left */}
         <div style={{
           position: 'absolute',
           top: '40px',
           left: '40px',
           width: '80px',
           height: '80px',
           borderRadius: '50%',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center'
         }}>
           <ClickableImagePlaceholder
             imagePath={profileImagePath}
             onImageUploaded={handleProfileImageUploaded}
             size="MEDIUM"
             position="CENTER"
             description="Profile"
             isEditable={isEditable}
             style={{
               width: '100%',
               height: '100%',
               borderRadius: '50%',
               objectFit: 'cover',
               overflow: 'hidden'
             }}
           />
         </div>

        {/* Title */}
        <div style={{
          fontSize: '30px',
          color: '#FFFFFF',
          fontWeight: 'bold',
          lineHeight: '1.2',
          marginTop: '106px',
        }}>
          {isEditable && editingTitle ? (
            <InlineEditor
              initialValue={currentTitle}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={true}
              className="psychological-safety-title-editor"
              style={{
                fontSize: '30px',
                color: '#FFFFFF',
                fontWeight: 'bold',
                lineHeight: '1.2'
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingTitle(true)}
              style={{
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              {currentTitle}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{
          fontSize: '18px',
          color: '#A496F3',
          lineHeight: '1.5',
          marginBottom: '5px'
        }}>
          {isEditable && editingContent ? (
            <InlineEditor
              initialValue={currentContent}
              onSave={handleContentSave}
              onCancel={handleContentCancel}
              multiline={true}
              className="psychological-safety-content-editor"
              style={{
                fontSize: '18px',
                color: '#A496F3',
                lineHeight: '1.5'
              }}
            />
          ) : (
            <div
              onClick={() => isEditable && setEditingContent(true)}
              style={{
                cursor: isEditable ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              {currentContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PsychologicalSafetySlideTemplate; 