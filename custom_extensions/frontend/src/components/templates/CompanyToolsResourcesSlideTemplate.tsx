// custom_extensions/frontend/src/components/templates/CompanyToolsResourcesSlideTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { TitleSlideProps } from '@/types/slideTemplates';
import { SlideTheme, DEFAULT_SLIDE_THEME, getSlideTheme } from '@/types/slideThemes';
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

export const CompanyToolsResourcesSlideTemplate: React.FC<TitleSlideProps & { 
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
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingLogo, setEditingLogo] = useState(false);
  const [editingCommTitle, setEditingCommTitle] = useState(false);
  const [editingCommText, setEditingCommText] = useState(false);
  const [editingProjTitle, setEditingProjTitle] = useState(false);
  const [editingProjText, setEditingProjText] = useState(false);
  const [editingLearnTitle, setEditingLearnTitle] = useState(false);
  const [editingLearnText, setEditingLearnText] = useState(false);
  const [editingProj2Title, setEditingProj2Title] = useState(false);
  const [editingProj2Text, setEditingProj2Text] = useState(false);
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
    backgroundColor: '#ffffff',
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

  const headerStyles: React.CSSProperties = {
    backgroundColor: '#F3F4F6',
    padding: '40px 80px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const logoStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '18px',
    color: '#000000',
    fontWeight: '500'
  };

  const logoIconStyles: React.CSSProperties = {
    fontSize: '24px',
    color: '#6B7280'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '48px',
    fontFamily: 'Inter, sans-serif',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 1.2,
    maxWidth: '100%',
    fontWeight: '700',
    flex: '1'
  };

  const avatarStyles: React.CSSProperties = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#000000',
    objectFit: 'cover'
  };

  const contentStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    flex: '1'
  };

  const contentBlockStyles: React.CSSProperties = {
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  };

  const lightGrayBlockStyles: React.CSSProperties = {
    ...contentBlockStyles,
    backgroundColor: '#F3F4F6'
  };

  const blueBlockStyles: React.CSSProperties = {
    ...contentBlockStyles,
    backgroundColor: '#3B82F6'
  };

  const blockTitleStyles: React.CSSProperties = {
    fontSize: '28px',
    fontFamily: 'Inter, sans-serif',
    color: '#000000',
    fontWeight: '600',
    lineHeight: 1.3
  };

  const blueBlockTitleStyles: React.CSSProperties = {
    ...blockTitleStyles,
    color: '#ffffff'
  };

  const blockTextStyles: React.CSSProperties = {
    fontSize: '16px',
    fontFamily: 'Inter, sans-serif',
    color: '#374151',
    lineHeight: 1.6
  };

  const blueBlockTextStyles: React.CSSProperties = {
    ...blockTextStyles,
    color: '#ffffff'
  };

  // Default content based on the image
  const defaultTitle = "Company tools and resources";
  const defaultLogo = "Logo";
  const defaultCommTitle = "Communication Tools:";
  const defaultCommText = "Effective communication is key to success in any workplace. At [Company Name], we use a variety of communication tools to keep our team connected and informed. Here are some of the key tools we use.";
  const defaultProjTitle = "Project Management:";
  const defaultProjText = "Tools To help you stay organized and manage projects effectively, we use the following tools: Project management software (Asana, Trello, etc.); Task lists and calendars; Time tracking software.";
  const defaultLearnTitle = "Learning and Development Resources";
  const defaultLearnText = "We believe in investing in our employees' growth and development. Here are some of the resources we offer: Online training courses (LinkedIn Learning, Udemy, etc.); In-house training and workshops; Professional development funds.";
  const defaultProj2Title = "Project Management";
  const defaultProj2Text = "Tools To help you stay organized and manage projects effectively, we use thefollowingtools:Projectmanagementsoftware(Asana, Trello,etc.); Task lists and calendars; Time tracking software.";

  const handleUpdate = (field: string, value: string) => {
    if (onUpdate) {
      onUpdate({ [field]: value });
    }
  };

  return (
    <div style={slideStyles}>
      {/* Header */}
      <div style={headerStyles}>
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
                <span style={logoIconStyles}>*</span>
                {defaultLogo}
              </div>
            )
          ) : (
            <div style={logoStyles}>
              <span style={logoIconStyles}>*</span>
              {defaultLogo}
            </div>
          )}
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
        <AvatarImageDisplay
          size="SMALL"
          position="CENTER"
          style={avatarStyles}
        />
      </div>

      {/* Content Grid */}
      <div style={contentStyles}>
        {/* Communication Tools - Light Gray */}
        <div style={lightGrayBlockStyles}>
          <div style={blockTitleStyles}>
            {isEditable ? (
              editingCommTitle ? (
                <InlineEditor
                  initialValue={defaultCommTitle}
                  onSave={(value) => {
                    handleUpdate('commTitle', value);
                    setEditingCommTitle(false);
                  }}
                  onCancel={() => setEditingCommTitle(false)}
                  style={blockTitleStyles}
                />
              ) : (
                <div onClick={() => setEditingCommTitle(true)} style={{ cursor: 'pointer' }}>
                  {defaultCommTitle}
                </div>
              )
            ) : (
              defaultCommTitle
            )}
          </div>
          <div style={blockTextStyles}>
            {isEditable ? (
              editingCommText ? (
                <InlineEditor
                  initialValue={defaultCommText}
                  onSave={(value) => {
                    handleUpdate('commText', value);
                    setEditingCommText(false);
                  }}
                  onCancel={() => setEditingCommText(false)}
                  multiline={true}
                  style={blockTextStyles}
                />
              ) : (
                <div onClick={() => setEditingCommText(true)} style={{ cursor: 'pointer' }}>
                  {defaultCommText}
                </div>
              )
            ) : (
              defaultCommText
            )}
          </div>
        </div>

        {/* Project Management - Blue */}
        <div style={blueBlockStyles}>
          <div style={blueBlockTitleStyles}>
            {isEditable ? (
              editingProjTitle ? (
                <InlineEditor
                  initialValue={defaultProjTitle}
                  onSave={(value) => {
                    handleUpdate('projTitle', value);
                    setEditingProjTitle(false);
                  }}
                  onCancel={() => setEditingProjTitle(false)}
                  style={blueBlockTitleStyles}
                />
              ) : (
                <div onClick={() => setEditingProjTitle(true)} style={{ cursor: 'pointer' }}>
                  {defaultProjTitle}
                </div>
              )
            ) : (
              defaultProjTitle
            )}
          </div>
          <div style={blueBlockTextStyles}>
            {isEditable ? (
              editingProjText ? (
                <InlineEditor
                  initialValue={defaultProjText}
                  onSave={(value) => {
                    handleUpdate('projText', value);
                    setEditingProjText(false);
                  }}
                  onCancel={() => setEditingProjText(false)}
                  multiline={true}
                  style={blueBlockTextStyles}
                />
              ) : (
                <div onClick={() => setEditingProjText(true)} style={{ cursor: 'pointer' }}>
                  {defaultProjText}
                </div>
              )
            ) : (
              defaultProjText
            )}
          </div>
        </div>

        {/* Learning Resources - Blue */}
        <div style={blueBlockStyles}>
          <div style={blueBlockTitleStyles}>
            {isEditable ? (
              editingLearnTitle ? (
                <InlineEditor
                  initialValue={defaultLearnTitle}
                  onSave={(value) => {
                    handleUpdate('learnTitle', value);
                    setEditingLearnTitle(false);
                  }}
                  onCancel={() => setEditingLearnTitle(false)}
                  style={blueBlockTitleStyles}
                />
              ) : (
                <div onClick={() => setEditingLearnTitle(true)} style={{ cursor: 'pointer' }}>
                  {defaultLearnTitle}
                </div>
              )
            ) : (
              defaultLearnTitle
            )}
          </div>
          <div style={blueBlockTextStyles}>
            {isEditable ? (
              editingLearnText ? (
                <InlineEditor
                  initialValue={defaultLearnText}
                  onSave={(value) => {
                    handleUpdate('learnText', value);
                    setEditingLearnText(false);
                  }}
                  onCancel={() => setEditingLearnText(false)}
                  multiline={true}
                  style={blueBlockTextStyles}
                />
              ) : (
                <div onClick={() => setEditingLearnText(true)} style={{ cursor: 'pointer' }}>
                  {defaultLearnText}
                </div>
              )
            ) : (
              defaultLearnText
            )}
          </div>
        </div>

        {/* Project Management 2 - Light Gray */}
        <div style={lightGrayBlockStyles}>
          <div style={blockTitleStyles}>
            {isEditable ? (
              editingProj2Title ? (
                <InlineEditor
                  initialValue={defaultProj2Title}
                  onSave={(value) => {
                    handleUpdate('proj2Title', value);
                    setEditingProj2Title(false);
                  }}
                  onCancel={() => setEditingProj2Title(false)}
                  style={blockTitleStyles}
                />
              ) : (
                <div onClick={() => setEditingProj2Title(true)} style={{ cursor: 'pointer' }}>
                  {defaultProj2Title}
                </div>
              )
            ) : (
              defaultProj2Title
            )}
          </div>
          <div style={blockTextStyles}>
            {isEditable ? (
              editingProj2Text ? (
                <InlineEditor
                  initialValue={defaultProj2Text}
                  onSave={(value) => {
                    handleUpdate('proj2Text', value);
                    setEditingProj2Text(false);
                  }}
                  onCancel={() => setEditingProj2Text(false)}
                  multiline={true}
                  style={blockTextStyles}
                />
              ) : (
                <div onClick={() => setEditingProj2Text(true)} style={{ cursor: 'pointer' }}>
                  {defaultProj2Text}
                </div>
              )
            ) : (
              defaultProj2Text
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 