import React, { useState, useRef, useEffect } from 'react';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';

export interface ChallengesSolutionsTemplateProps {
  title?: string;
  subtitle?: string;
  theme?: SlideTheme;
  isEditable?: boolean;
  onUpdate?: (data: Partial<ChallengesSolutionsTemplateProps>) => void;
}

const ChallengesSolutionsTemplate: React.FC<ChallengesSolutionsTemplateProps> = ({
  title = 'Challenges & Solution',
  subtitle = 'Type The Subtitle Of Your Great Here',
  theme,
  isEditable = false,
  onUpdate
}) => {
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const autoSaveTimeoutRef = useRef<number | null>(null);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const slideStyles: React.CSSProperties = {
    background: '#ffffff',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Georgia, serif',
    minHeight: '600px',
    width: '100%',
    position: 'relative',
    overflow: 'hidden'
  };

  const titleStyles: React.CSSProperties = {
    color: '#000000',
    fontSize: '2.5rem',
    fontFamily: 'Georgia, serif',
    marginBottom: '10px',
    textAlign: 'left',
    wordWrap: 'break-word',
    fontWeight: 'bold'
  };

  const subtitleStyles: React.CSSProperties = {
    color: '#000000',
    fontSize: '1.1rem',
    fontFamily: 'Arial, sans-serif',
    marginBottom: '40px',
    textAlign: 'left',
    wordWrap: 'break-word',
    fontWeight: 'normal'
  };

  const mainContentStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    position: 'relative',
    height: '400px'
  };

  const imageStyles: React.CSSProperties = {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain'
  };

  // Handlers
  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleSubtitleSave = (newSubtitle: string) => {
    if (onUpdate) {
      onUpdate({ subtitle: newSubtitle });
    }
    setEditingSubtitle(false);
  };

  const startEditingTitle = () => {
    if (isEditable) {
      setEditingTitle(true);
    }
  };

  const startEditingSubtitle = () => {
    if (isEditable) {
      setEditingSubtitle(true);
    }
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

  const handleSubtitleCancel = () => {
    setEditingSubtitle(false);
  };

  // Inline Editor Component
  const InlineEditor: React.FC<{
    initialValue: string;
    onSave: (value: string) => void;
    onCancel: () => void;
    style?: React.CSSProperties;
    placeholder?: string;
  }> = ({ initialValue, onSave, onCancel, style, placeholder }) => {
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
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

    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        style={style}
        placeholder={placeholder}
      />
    );
  };

  return (
    <div style={slideStyles}>
      {/* Title */}
      {editingTitle ? (
        <InlineEditor
          initialValue={title}
          onSave={handleTitleSave}
          onCancel={handleTitleCancel}
          style={titleStyles}
          placeholder="Enter title..."
        />
      ) : (
        <h1 
          style={titleStyles}
          onClick={startEditingTitle}
          className={isEditable ? 'cursor-pointer' : ''}
        >
          {title}
        </h1>
      )}

      {/* Subtitle */}
      {editingSubtitle ? (
        <InlineEditor
          initialValue={subtitle}
          onSave={handleSubtitleSave}
          onCancel={handleSubtitleCancel}
          style={subtitleStyles}
          placeholder="Enter subtitle..."
        />
      ) : (
        <h2 
          style={subtitleStyles}
          onClick={startEditingSubtitle}
          className={isEditable ? 'cursor-pointer' : ''}
        >
          {subtitle}
        </h2>
      )}

      <div style={mainContentStyles}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/group_img.png" 
          alt="Group" 
          style={imageStyles}
          onError={(e) => {
            console.error('Image failed to load:', e);
          }}
        />
      </div>
    </div>
  );
};

export default ChallengesSolutionsTemplate;