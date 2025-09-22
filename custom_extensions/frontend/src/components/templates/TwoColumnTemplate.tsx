// custom_extensions/frontend/src/components/templates/TwoColumnTemplate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { TwoColumnProps } from '@/types/slideTemplates';
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
          lineHeight: '1.6'
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

export const TwoColumnTemplate: React.FC<TwoColumnProps & { 
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  leftTitle,
  leftContent,
  leftImagePath,
  leftImageAlt,
  rightTitle,
  rightContent,
  rightImagePath,
  rightImageAlt,
  theme,
  onUpdate,
  isEditable = false
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  
  // Inline editing state
  const [editingLeftTitle, setEditingLeftTitle] = useState(false);
  const [editingLeftContent, setEditingLeftContent] = useState(false);
  const [editingRightTitle, setEditingRightTitle] = useState(false);
  const [editingRightContent, setEditingRightContent] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Handle left title editing
  const handleLeftTitleSave = (newLeftTitle: string) => {
    if (onUpdate) {
      onUpdate({ leftTitle: newLeftTitle });
    }
    setEditingLeftTitle(false);
  };

  const handleLeftTitleCancel = () => {
    setEditingLeftTitle(false);
  };

  // Handle left content editing
  const handleLeftContentSave = (newLeftContent: string) => {
    if (onUpdate) {
      onUpdate({ leftContent: newLeftContent });
    }
    setEditingLeftContent(false);
  };

  const handleLeftContentCancel = () => {
    setEditingLeftContent(false);
  };

  // Handle right title editing
  const handleRightTitleSave = (newRightTitle: string) => {
    if (onUpdate) {
      onUpdate({ rightTitle: newRightTitle });
    }
    setEditingRightTitle(false);
  };

  const handleRightTitleCancel = () => {
    setEditingRightTitle(false);
  };

  // Handle right content editing
  const handleRightContentSave = (newRightContent: string) => {
    if (onUpdate) {
      onUpdate({ rightContent: newRightContent });
    }
    setEditingRightContent(false);
  };

  const handleRightContentCancel = () => {
    setEditingRightContent(false);
  };

  // Handle left image upload
  const handleLeftImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ leftImagePath: newImagePath });
    }
  };

  // Handle right image upload
  const handleRightImageUploaded = (newImagePath: string) => {
    if (onUpdate) {
      onUpdate({ rightImagePath: newImagePath });
    }
  };

  const slideStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: '600px',
    background: currentTheme.colors.backgroundColor,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '60px 40px',
    position: 'relative',
    fontFamily: currentTheme.fonts.contentFont
  };

  const columnsContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: '0px',
    width: '100%',
    maxWidth: '1200px',
    height: '100%',
    position: 'relative'
  };

  const columnStyles: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '40px 30px',
    borderRadius: '8px'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '2.9rem',
    fontFamily: currentTheme.fonts.titleFont,
    color: currentTheme.colors.titleColor,
    textAlign: 'center',
    marginBottom: '20px',
    lineHeight: 1.2,
    maxWidth: '340px',
    wordWrap: 'break-word',
    fontWeight: 'bold',
    position: 'relative',
    left: '50%',
    transform: 'translateX(-50%)'
  };

  const subtitleStyles: React.CSSProperties = {
    width: '325px',
    fontSize: '1.4rem',
    fontFamily: currentTheme.fonts.contentFont,
    color: currentTheme.colors.subtitleColor,
    textAlign: 'center',
    marginBottom: '40px',
    marginTop: '10px',
    lineHeight: 1.4,
    maxWidth: '500px',
    wordWrap: 'break-word',
    opacity: 0.9,
    position: 'relative',
    left: '50%',
    transform: 'translateX(-50%)'
  };

  const imageContainerStyles: React.CSSProperties = {
    width: '100%',
    height: '290px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '8px',
    marginTop: '35px'
  };

  const imageStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '4px'
  };

  const dividerLineStyles: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '0',
    bottom: '0',
    width: '1px',
    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0),      /* верх — прозрачный */ rgba(255, 255, 255, 0.9) 50%,/* центр — ярко-белый */ rgba(255, 255, 255, 0)', // Полупрозрачная белая линия
    transform: 'translateX(-50%)',
    zIndex: 1
  };

  return (
    <div
      ref={slideContainerRef}
      style={slideStyles}
    >
      <div style={columnsContainerStyles}>
        {/* Divider Line */}
        <div style={dividerLineStyles}></div>
        
        {/* Left Column */}
        <div style={columnStyles}>
          {/* Left Title */}
          <div data-draggable="true" style={{ display: 'inline-block', width: '100%' }}>
            {isEditable && editingLeftTitle ? (
              <InlineEditor
                initialValue={leftTitle || 'Assess risks for the organization.'}
                onSave={handleLeftTitleSave}
                onCancel={handleLeftTitleCancel}
                multiline={true}
                placeholder="Enter left title..."
                className="inline-editor-left-title"
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
                onClick={(e) => {
                  const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                  if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  if (isEditable) {
                    setEditingLeftTitle(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
              >
                {leftTitle || 'Assess risks for the organization.'}
              </h1>
            )}
          </div>

          {/* Left Subtitle */}
          <div data-draggable="true" style={{ display: 'inline-block', width: '100%' }}>
            {isEditable && editingLeftContent ? (
              <InlineEditor
                initialValue={leftContent || 'Present with Canva like a professional using presenter mode.'}
                onSave={handleLeftContentSave}
                onCancel={handleLeftContentCancel}
                multiline={true}
                placeholder="Enter left subtitle..."
                className="inline-editor-left-content"
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
              <p 
                style={subtitleStyles}
                onClick={(e) => {
                  const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                  if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  if (isEditable) {
                    setEditingLeftContent(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
              >
                {leftContent || 'Present with Canva like a professional using presenter mode.'}
              </p>
            )}
          </div>

          {/* Left Image */}
          <div style={imageContainerStyles}>
            <ClickableImagePlaceholder
              imagePath={leftImagePath}
              onImageUploaded={handleLeftImageUploaded}
              size="LARGE"
              position="CENTER"
              description="Click to upload image"
              prompt="relevant illustration for the left column"
              isEditable={isEditable}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '4px'
              }}
              elementId="left-image"
              cropMode="cover"
              slideContainerRef={slideContainerRef}
            />
          </div>
        </div>

        {/* Right Column */}
        <div style={columnStyles}>
          {/* Right Title */}
          <div data-draggable="true" style={{ display: 'inline-block', width: '100%' }}>
            {isEditable && editingRightTitle ? (
              <InlineEditor
                initialValue={rightTitle || 'Assess risks for the organization.'}
                onSave={handleRightTitleSave}
                onCancel={handleRightTitleCancel}
                multiline={true}
                placeholder="Enter right title..."
                className="inline-editor-right-title"
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
                onClick={(e) => {
                  const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                  if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  if (isEditable) {
                    setEditingRightTitle(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
              >
                {rightTitle || 'Assess risks for the organization.'}
              </h1>
            )}
          </div>

          {/* Right Subtitle */}
          <div data-draggable="true" style={{ display: 'inline-block', width: '100%' }}>
            {isEditable && editingRightContent ? (
              <InlineEditor
                initialValue={rightContent || 'Present with Canva like a professional using presenter mode.'}
                onSave={handleRightContentSave}
                onCancel={handleRightContentCancel}
                multiline={true}
                placeholder="Enter right subtitle..."
                className="inline-editor-right-content"
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
              <p 
                style={subtitleStyles}
                onClick={(e) => {
                  const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                  if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  if (isEditable) {
                    setEditingRightContent(true);
                  }
                }}
                className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
              >
                {rightContent || 'Present with Canva like a professional using presenter mode.'}
              </p>
            )}
          </div>

          {/* Right Image */}
          <div style={imageContainerStyles}>
            <ClickableImagePlaceholder
              imagePath={rightImagePath}
              onImageUploaded={handleRightImageUploaded}
              size="LARGE"
              position="CENTER"
              description="Click to upload image"
              prompt="relevant illustration for the right column"
              isEditable={isEditable}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '4px'
              }}
              elementId="right-image"
              cropMode="cover"
              slideContainerRef={slideContainerRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoColumnTemplate;