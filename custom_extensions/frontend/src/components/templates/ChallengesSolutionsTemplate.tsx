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
        {/* Group Icon */}
        <svg width="200" height="200" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="3" fill="#1976D2"/>
          <circle cx="6" cy="16" r="2" fill="#1976D2"/>
          <circle cx="18" cy="16" r="2" fill="#1976D2"/>
          <path d="M12 11C9.5 11 7.5 12.5 7 14.5C7.5 15.5 8.5 16 9.5 16H14.5C15.5 16 16.5 15.5 17 14.5C16.5 12.5 14.5 11 12 11Z" fill="#1976D2"/>
          <path d="M6 16C6 13.5 7.5 11.5 9.5 11C8.5 10.5 7.5 10 6 10C4.5 10 3.5 10.5 2.5 11C4.5 11.5 6 13.5 6 16Z" fill="#1976D2"/>
          <path d="M18 16C18 13.5 19.5 11.5 21.5 11C20.5 10.5 19.5 10 18 10C16.5 10 15.5 10.5 14.5 11C16.5 11.5 18 13.5 18 16Z" fill="#1976D2"/>
        </svg>
      </div>
    </div>
  );
};

export default ChallengesSolutionsTemplate;