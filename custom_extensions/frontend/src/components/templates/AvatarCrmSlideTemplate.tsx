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
    height: '100vh',
    display: 'flex',
    fontFamily: 'Arial, sans-serif',
    overflow: 'hidden'
  };

  // Left Panel - Dark Promotional Section (40% width)
  const leftPanelStyles: React.CSSProperties = {
    width: '40%',
    backgroundColor: '#1a1a1a',
    color: 'white',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    position: 'relative'
  };

  // Right Panel - Light CRM Interface (60% width)
  const rightPanelStyles: React.CSSProperties = {
    width: '60%',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  };

  // Logo Styles
  const logoStyles: React.CSSProperties = {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: '8px',
    fontFamily: 'Georgia, serif'
  };

  const logoSubtextStyles: React.CSSProperties = {
    fontSize: '1rem',
    color: 'white',
    marginBottom: '40px',
    fontWeight: 'normal'
  };

  // Pink Banner Styles
  const bannerStyles: React.CSSProperties = {
    backgroundColor: '#FF1493',
    color: 'white',
    padding: '16px 24px',
    borderRadius: '8px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '32px',
    textAlign: 'center',
    width: '100%',
    maxWidth: '400px'
  };

  // Checklist Styles
  const checklistStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
    maxWidth: '400px'
  };

  const checklistItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1rem',
    color: 'white'
  };

  const checkmarkStyles: React.CSSProperties = {
    color: '#FF1493',
    fontSize: '1.2rem',
    fontWeight: 'bold'
  };

  // CRM Interface Styles
  const crmContainerStyles: React.CSSProperties = {
    flex: '1',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    margin: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  };

  const crmHeaderStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  };

  const crmTitleStyles: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333'
  };

  const crmCloseStyles: React.CSSProperties = {
    fontSize: '1.5rem',
    color: '#666',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  const crmSubtitleStyles: React.CSSProperties = {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '20px'
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

  const clientListStyles: React.CSSProperties = {
    flex: '1'
  };

  const clientItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0'
  };

  const avatarStyles: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    fontWeight: 'bold',
    fontSize: '1.1rem'
  };

  const clientInfoStyles: React.CSSProperties = {
    flex: '1'
  };

  const clientNameStyles: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#333'
  };

  const clientEmailStyles: React.CSSProperties = {
    fontSize: '0.85rem',
    color: '#666'
  };

  // Image Placeholder Styles (50% width of right panel, full height)
  const imagePlaceholderStyles: React.CSSProperties = {
    position: 'absolute',
    right: '0',
    top: '0',
    width: '50%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeft: '1px solid #e0e0e0'
  };

  return (
    <div style={slideStyles}>
      {/* Left Panel - Dark Promotional Section */}
      <div style={leftPanelStyles}>
        {/* Pink Banner */}
        <div style={bannerStyles}>
          {isEditable && editingTitle ? (
            <InlineEditor
              initialValue={title || 'Личное отношение - залог следующих ВИЗИТОВ'}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              multiline={true}
              placeholder="Enter banner text..."
              className="inline-editor-banner"
              style={{
                ...bannerStyles,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block',
                color: 'inherit',
                margin: '0',
                padding: '0'
              }}
            />
          ) : (
            <div 
              onClick={() => {
                if (isEditable) {
                  setEditingTitle(true);
                }
              }}
              className={isEditable ? 'cursor-pointer hover:border hover:border-white hover:border-opacity-50' : ''}
            >
              {title || 'Личное отношение - залог следующих ВИЗИТОВ'}
            </div>
          )}
        </div>
        
        {/* Checklist */}
        <div style={checklistStyles}>
          <div style={checklistItemStyles}>
            <span style={checkmarkStyles}>✓</span>
            {isEditable && editingSubtitle ? (
              <InlineEditor
                initialValue={subtitle || 'Помните детали'}
                onSave={handleSubtitleSave}
                onCancel={handleSubtitleCancel}
                multiline={false}
                placeholder="Enter checklist item..."
                className="inline-editor-checklist"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  overflow: 'hidden',
                  wordWrap: 'break-word',
                  boxSizing: 'border-box',
                  display: 'block',
                  color: 'inherit',
                  margin: '0',
                  padding: '0',
                  fontSize: '1rem'
                }}
              />
            ) : (
              <span 
                onClick={() => {
                  if (isEditable) {
                    setEditingSubtitle(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer hover:border hover:border-white hover:border-opacity-50' : ''}
              >
                {subtitle || 'Помните детали'}
              </span>
            )}
          </div>
          
          <div style={checklistItemStyles}>
            <span style={checkmarkStyles}>✓</span>
            {isEditable && editingContent ? (
              <InlineEditor
                initialValue={content || 'Интересуйтесь'}
                onSave={handleContentSave}
                onCancel={handleContentCancel}
                multiline={false}
                placeholder="Enter checklist item..."
                className="inline-editor-checklist"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  overflow: 'hidden',
                  wordWrap: 'break-word',
                  boxSizing: 'border-box',
                  display: 'block',
                  color: 'inherit',
                  margin: '0',
                  padding: '0',
                  fontSize: '1rem'
                }}
              />
            ) : (
              <span 
                onClick={() => {
                  if (isEditable) {
                    setEditingContent(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer hover:border hover:border-white hover:border-opacity-50' : ''}
              >
                {content || 'Интересуйтесь'}
              </span>
            )}
          </div>
          
          <div style={checklistItemStyles}>
            <span style={checkmarkStyles}>✓</span>
            <span>Сохраняйте тёплый контакт</span>
          </div>
          
          <div style={checklistItemStyles}>
            <span style={checkmarkStyles}>✓</span>
            <span>Клиент это почувствует</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Light CRM Interface */}
      <div style={rightPanelStyles}>
        {/* CRM Interface */}
        <div style={crmContainerStyles}>
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
          <div style={clientListStyles}>
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

        {/* Image Placeholder - 50% width of right panel, full height */}
        <div style={imagePlaceholderStyles}>
          <ClickableImagePlaceholder
            imagePath={avatarPath}
            onImageUploaded={handleAvatarUploaded}
            size="LARGE"
            position="CENTER"
            description="Click to upload image"
            prompt="Professional business or beauty industry image"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
      </div>
    </div>
  );
}; 