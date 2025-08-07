// custom_extensions/frontend/src/components/templates/AvatarCrmSlideTemplate.tsx

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

export const AvatarCrmSlideTemplate: React.FC<AvatarSlideProps & {
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  title,
  subtitle,
  content,
  avatarPath,
  avatarAlt,
  slideId,
  onUpdate,
  theme,
  isEditable = false
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, contentColor } = currentTheme.colors;
  
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

  const handleSubtitleSave = (newSubtitle: string) => {
    if (onUpdate) {
      onUpdate({ subtitle: newSubtitle });
    }
    setEditingSubtitle(false);
  };

  const handleSubtitleCancel = () => {
    setEditingSubtitle(false);
  };

  const handleContentSave = (newContent: string) => {
    if (onUpdate) {
      onUpdate({ content: newContent });
    }
    setEditingContent(false);
  };

  const handleContentCancel = () => {
    setEditingContent(false);
  };

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '1200px',
    gap: '40px'
  };

  const leftContentStyles: React.CSSProperties = {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '24px',
    position: 'relative',
    height: '100%'
  };

  const rightContentStyles: React.CSSProperties = {
    flex: '1',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '2rem',
    fontFamily: currentTheme.fonts.titleFont,
    color: titleColor,
    marginBottom: '16px',
    lineHeight: '1.2',
    wordWrap: 'break-word',
    fontWeight: 'bold'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '1.2rem',
    fontFamily: currentTheme.fonts.contentFont,
    color: contentColor,
    marginBottom: '16px',
    lineHeight: '1.6',
    wordWrap: 'break-word'
  };

  const contentStyles: React.CSSProperties = {
    fontSize: '1rem',
    fontFamily: currentTheme.fonts.contentFont,
    color: contentColor,
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word'
  };

  const placeholderStyles: React.CSSProperties = {
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    margin: '0 auto',
    position: 'absolute',
    bottom: '-50px',
    left: '20px',
    zIndex: 3
  };

  const crmWindowStyles: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    width: '450px',
    maxWidth: '100%',
    border: '1px solid #e0e0e0'
  };

  const crmHeaderStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '12px'
  };

  const crmTitleStyles: React.CSSProperties = {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#333333'
  };

  const crmCloseStyles: React.CSSProperties = {
    fontSize: '1.8rem',
    color: '#666666',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  const crmSubtitleStyles: React.CSSProperties = {
    fontSize: '1rem',
    color: '#666666',
    marginBottom: '20px',
    lineHeight: '1.4'
  };

  const searchBarStyles: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '1rem',
    backgroundColor: '#f8f9fa'
  };

  const clientItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0'
  };

  const avatarStyles: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#e91e63',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '1.1rem'
  };

  const clientInfoStyles: React.CSSProperties = {
    flex: '1'
  };

  const clientNameStyles: React.CSSProperties = {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#333333'
  };

  const clientEmailStyles: React.CSSProperties = {
    fontSize: '0.9rem',
    color: '#666666'
  };

  return (
    <div style={slideStyles}>
      <div style={contentContainerStyles}>
        {/* Left content - Text and Avatar */}
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
              {title || 'Личное отношение - залог следующих ВИЗИТОВ'}
            </h1>
          )}

          {/* Subtitle */}
          {subtitle && (
            isEditable && editingSubtitle ? (
              <InlineEditor
                initialValue={subtitle}
                onSave={handleSubtitleSave}
                onCancel={handleSubtitleCancel}
                multiline={true}
                placeholder="Enter subtitle..."
                className="inline-editor-subtitle"
                style={{
                  ...subtitleStyles,
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
                style={subtitleStyles}
                onClick={() => {
                  if (isEditable) {
                    setEditingSubtitle(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
              >
                {subtitle}
              </h2>
            )
          )}

          {/* Content */}
          {content && (
            isEditable && editingContent ? (
              <InlineEditor
                initialValue={content}
                onSave={handleContentSave}
                onCancel={handleContentCancel}
                multiline={true}
                placeholder="Enter content..."
                className="inline-editor-content"
                style={{
                  ...contentStyles,
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
                style={contentStyles}
                onClick={() => {
                  if (isEditable) {
                    setEditingContent(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer hover:border hover:border-gray-300 hover:border-opacity-50' : ''}
              >
                {content}
              </p>
            )
          )}

          {/* Avatar */}
          <div style={{ marginTop: '24px' }}>
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
        </div>

        {/* Right content - CRM Interface */}
        <div style={rightContentStyles}>
          <div style={crmWindowStyles}>
            <div style={crmHeaderStyles}>
              <span style={crmTitleStyles}>Clients list</span>
              <span style={crmCloseStyles}>×</span>
            </div>
            <div style={crmSubtitleStyles}>
              View, add, edit and delete your client's detail
            </div>
            <input 
              type="text" 
              placeholder="🔍 Name, email or phone" 
              style={searchBarStyles}
              readOnly
            />
            <div style={clientItemStyles}>
              <div style={avatarStyles}>J</div>
              <div style={clientInfoStyles}>
                <div style={clientNameStyles}>Jane Doe</div>
                <div style={clientEmailStyles}>jane@example.com</div>
              </div>
            </div>
            <div style={clientItemStyles}>
              <div style={avatarStyles}>J</div>
              <div style={clientInfoStyles}>
                <div style={clientNameStyles}>John Doe</div>
                <div style={clientEmailStyles}>john@example.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 