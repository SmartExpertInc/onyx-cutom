// custom_extensions/frontend/src/components/templates/ResourcesSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { TitleSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';

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

export const ResourcesSlideTemplate: React.FC<TitleSlideProps & { 
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  slideId,
  title,
  subtitle,
  author,
  date,
  backgroundImage,
  onUpdate,
  theme,
  isEditable = false
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, subtitleColor } = currentTheme.colors;

  // Inline editing state
  const [editingLogo, setEditingLogo] = useState(false);
  const [editingResource1, setEditingResource1] = useState(false);
  const [editingResource2, setEditingResource2] = useState(false);
  const [editingResource3, setEditingResource3] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: '600px',
    backgroundColor: '#6B7280',
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    position: 'relative',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const logoStyles: React.CSSProperties = {
    position: 'absolute',
    top: '40px',
    left: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '18px',
    color: '#ffffff',
    fontWeight: '500'
  };

  const logoIconStyles: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '24px',
    color: '#6B7280'
  };

  const resourcesContainerStyles: React.CSSProperties = {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '32px',
    padding: '80px 40px'
  };

  const resourceBlockStyles: React.CSSProperties = {
    backgroundColor: '#9CA3AF',
    borderRadius: '16px',
    padding: '32px 24px',
    width: '100%',
    maxWidth: '600px',
    textAlign: 'left'
  };

  const resourceTextStyles: React.CSSProperties = {
    fontSize: '18px',
    fontFamily: 'Inter, sans-serif',
    color: '#ffffff',
    lineHeight: 1.6,
    margin: '0'
  };

  const titleStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: '40px',
    left: '40px',
    fontSize: '64px',
    fontFamily: 'Inter, sans-serif',
    color: '#ffffff',
    fontWeight: '700',
    lineHeight: 1.2
  };

  const avatarStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: '40px',
    right: '40px',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: '#9CA3AF',
    objectFit: 'cover'
  };

  // Default content based on the image
  const defaultLogo = "Your Logo";
  const defaultResource1 = "Resource 1: [Website/Book Title] - [Link/Author Name]";
  const defaultResource2 = "Resource 2: [Website/Book Title] - [Link/Author Name]";
  const defaultResource3 = "Resource 3: [Website/Book Title] - [Link/Author Name]";
  const defaultTitle = "Resources";

  const handleUpdate = (field: string, value: string) => {
    if (onUpdate) {
      onUpdate({ [field]: value });
    }
  };

  return (
    <div style={slideStyles}>
      {/* Logo */}
      <div style={logoStyles}>
        {isEditable ? (
          editingLogo ? (
            <InlineEditor
              initialValue={defaultLogo}
              onSave={(value) => {
                handleUpdate('logo', value);
                setEditingLogo(false);
              }}
              onCancel={() => setEditingLogo(false)}
              style={{ ...logoStyles, cursor: 'pointer' }}
            />
          ) : (
            <div onClick={() => setEditingLogo(true)} style={{ ...logoStyles, cursor: 'pointer' }}>
              <div style={logoIconStyles}>+</div>
              {defaultLogo}
            </div>
          )
        ) : (
          <div style={logoStyles}>
            <div style={logoIconStyles}>+</div>
            {defaultLogo}
          </div>
        )}
      </div>

      {/* Resources */}
      <div style={resourcesContainerStyles}>
        {/* Resource 1 */}
        <div style={resourceBlockStyles}>
          {isEditable ? (
            editingResource1 ? (
              <InlineEditor
                initialValue={defaultResource1}
                onSave={(value) => {
                  handleUpdate('resource1', value);
                  setEditingResource1(false);
                }}
                onCancel={() => setEditingResource1(false)}
                style={resourceTextStyles}
              />
            ) : (
              <div onClick={() => setEditingResource1(true)} style={{ ...resourceTextStyles, cursor: 'pointer' }}>
                {defaultResource1}
              </div>
            )
          ) : (
            <div style={resourceTextStyles}>
              {defaultResource1}
            </div>
          )}
        </div>

        {/* Resource 2 */}
        <div style={resourceBlockStyles}>
          {isEditable ? (
            editingResource2 ? (
              <InlineEditor
                initialValue={defaultResource2}
                onSave={(value) => {
                  handleUpdate('resource2', value);
                  setEditingResource2(false);
                }}
                onCancel={() => setEditingResource2(false)}
                style={resourceTextStyles}
              />
            ) : (
              <div onClick={() => setEditingResource2(true)} style={{ ...resourceTextStyles, cursor: 'pointer' }}>
                {defaultResource2}
              </div>
            )
          ) : (
            <div style={resourceTextStyles}>
              {defaultResource2}
            </div>
          )}
        </div>

        {/* Resource 3 */}
        <div style={resourceBlockStyles}>
          {isEditable ? (
            editingResource3 ? (
              <InlineEditor
                initialValue={defaultResource3}
                onSave={(value) => {
                  handleUpdate('resource3', value);
                  setEditingResource3(false);
                }}
                onCancel={() => setEditingResource3(false)}
                style={resourceTextStyles}
              />
            ) : (
              <div onClick={() => setEditingResource3(true)} style={{ ...resourceTextStyles, cursor: 'pointer' }}>
                {defaultResource3}
              </div>
            )
          ) : (
            <div style={resourceTextStyles}>
              {defaultResource3}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <div style={titleStyles}>
        {isEditable ? (
          editingTitle ? (
            <InlineEditor
              initialValue={title || defaultTitle}
              onSave={(value) => {
                handleUpdate('title', value);
                setEditingTitle(false);
              }}
              onCancel={() => setEditingTitle(false)}
              style={titleStyles}
            />
          ) : (
            <div onClick={() => setEditingTitle(true)} style={{ cursor: 'pointer' }}>
              {title || defaultTitle}
            </div>
          )
        ) : (
          title || defaultTitle
        )}
      </div>

      {/* Avatar */}
      <img
        src="/api/placeholder/120/120/9CA3AF/FFFFFF?text=Avatar"
        alt="Profile"
        style={avatarStyles}
      />
    </div>
  );
}; 