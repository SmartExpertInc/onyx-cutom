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
  title,
  leftTitle,
  leftContent,
  leftImageAlt,
  leftImagePrompt,
  leftImagePath,
  leftWidthPx,
  leftHeightPx,
  leftImageScale,
  leftImageOffset,
  rightTitle,
  rightContent,
  rightImageAlt,
  rightImagePrompt,
  rightImagePath,
  rightWidthPx,
  rightHeightPx,
  rightImageScale,
  rightImageOffset,
  leftObjectFit,
  rightObjectFit,
  columnRatio,
  theme,
  onUpdate,
  isEditable = false
}) => {
  // Use theme colors instead of props
  const effectiveTheme = typeof theme === 'string' && theme.trim() !== '' ? theme : DEFAULT_SLIDE_THEME;
  const currentTheme = getSlideTheme(effectiveTheme);
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingLeftTitle, setEditingLeftTitle] = useState(false);
  const [editingLeftContent, setEditingLeftContent] = useState(false);
  const [editingRightTitle, setEditingRightTitle] = useState(false);
  const [editingRightContent, setEditingRightContent] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  
  // Refs for draggable elements (following Big Image Left pattern)
  const leftTitleRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const rightTitleRef = useRef<HTMLDivElement>(null);
  const rightContentRef = useRef<HTMLDivElement>(null);
  
  // Generate slideId for element positioning (following Big Image Left pattern)
  const slideId = `two-column-${Date.now()}`;
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Handle title editing
  const handleTitleSave = (newTitle: string) => {
    if (onUpdate) {
      onUpdate({ title: newTitle });
    }
    setEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
  };

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

  // Handle left placeholder size and transform changes
  const handleLeftSizeTransformChange = (payload: any) => {
    if (onUpdate) {
      const updateData: any = {};
      
      if (payload.imagePosition) {
        updateData.leftImageOffset = payload.imagePosition;
      }
      
      if (payload.imageSize) {
        updateData.leftWidthPx = payload.imageSize.width;
        updateData.leftHeightPx = payload.imageSize.height;
      }
      
      // ✅ NEW: Handle objectFit property from ClickableImagePlaceholder
      if (payload.objectFit) {
        updateData.leftObjectFit = payload.objectFit;
        console.log('TwoColumnTemplate: left objectFit update', { 
          objectFit: payload.objectFit 
        });
      }
      
      onUpdate(updateData);
    }
  };

  // Handle right placeholder size and transform changes
  const handleRightSizeTransformChange = (payload: any) => {
    if (onUpdate) {
      const updateData: any = {};
      
      if (payload.imagePosition) {
        updateData.rightImageOffset = payload.imagePosition;
      }
      
      if (payload.imageSize) {
        updateData.rightWidthPx = payload.imageSize.width;
        updateData.rightHeightPx = payload.imageSize.height;
      }
      
      // ✅ NEW: Handle objectFit property from ClickableImagePlaceholder
      if (payload.objectFit) {
        updateData.rightObjectFit = payload.objectFit;
        console.log('TwoColumnTemplate: right objectFit update', { 
          objectFit: payload.objectFit 
        });
      }
      
      onUpdate(updateData);
    }
  };

  // AI prompt logic
  const leftDisplayPrompt = leftImagePrompt || leftImageAlt || 'relevant illustration for the left column';
  const rightDisplayPrompt = rightImagePrompt || rightImageAlt || 'relevant illustration for the right column';

  const leftPlaceholderStyles: React.CSSProperties = {
    // Only apply default dimensions if no saved size exists
    ...(leftWidthPx && leftHeightPx ? {} : { width: '100%', maxWidth: '400px', maxHeight: '280px' }),
    margin: '0',
    marginBottom: '24px'
  };

  const rightPlaceholderStyles: React.CSSProperties = {
    // Only apply default dimensions if no saved size exists
    ...(rightWidthPx && rightHeightPx ? {} : { width: '100%', maxWidth: '400px', maxHeight: '280px' }),
    margin: '0',
    marginBottom: '24px'
  };

  const titleStyles: React.CSSProperties = {
    textAlign: 'left',
    marginBottom: '40px',
    fontWeight: '700',
    fontFamily: currentTheme.fonts.titleFont,
    fontSize: currentTheme.fonts.titleSize,
    color: currentTheme.colors.titleColor,
    wordWrap: 'break-word'
  };

  const columnTitleStyles: React.CSSProperties = {
    fontFamily: currentTheme.fonts.titleFont,
    fontSize: '27px',
    color: currentTheme.colors.titleColor,
    margin: '16px 0 16px 0',
    alignSelf: 'flex-start',
    wordWrap: 'break-word'
  };

  const columnContentStyles: React.CSSProperties = {
    fontFamily: currentTheme.fonts.contentFont,
    fontSize: currentTheme.fonts.contentSize,
    color: currentTheme.colors.contentColor,
    margin: 0,
    alignSelf: 'flex-start',
    lineHeight: 1.6,
    overflowWrap: 'anywhere'
  };

  return (
    <div
      ref={slideContainerRef}
      style={{
        padding: '40px',
        minHeight: '600px',
        background: currentTheme.colors.backgroundColor,
        fontFamily: currentTheme.fonts.contentFont,
      }}
    >
      {/* Main Title */}
      <div data-draggable="true" style={{ display: 'inline-block' }}>
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
              // Ensure title behaves exactly like h1 element
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
                setEditingTitle(true);
              }
            }}
            className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
          >
            {title || 'Click to add title'}
          </h1>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '40px',
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Left Clickable Image Placeholder */}
            <ClickableImagePlaceholder
              imagePath={leftImagePath}
              onImageUploaded={handleLeftImageUploaded}
              size="XLARGE"
              position="CENTER"
              description="Click to upload image"
              prompt={leftDisplayPrompt}
              isEditable={isEditable}
              style={leftPlaceholderStyles}
              onSizeTransformChange={handleLeftSizeTransformChange}
              elementId="left-image"
              cropMode={leftObjectFit || 'contain'}
              slideContainerRef={slideContainerRef}
              savedImagePosition={leftImageOffset}
              savedImageSize={leftWidthPx && leftHeightPx ? { width: leftWidthPx, height: leftHeightPx } : undefined}
            />
          {/* Left Mini title */}
          <div 
            ref={leftTitleRef}
            data-moveable-element={`${slideId}-leftTitle`}
            data-draggable="true" 
            style={{ display: 'inline-block' }}
          >
            {isEditable && editingLeftTitle ? (
              <InlineEditor
                initialValue={leftTitle || ''}
                onSave={handleLeftTitleSave}
                onCancel={handleLeftTitleCancel}
                multiline={true}
                placeholder="Enter left column title..."
                className="inline-editor-left-title"
                style={{
                  ...columnTitleStyles,
                  // Ensure title behaves exactly like h2 element
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
                style={columnTitleStyles}
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
                {leftTitle || 'Click to add left title'}
              </h2>
            )}
          </div>
          {/* Left Main text */}
          <div 
            ref={leftContentRef}
            data-moveable-element={`${slideId}-leftContent`}
            data-draggable="true" 
            style={{ display: 'inline-block' }}
          >
            {isEditable && editingLeftContent ? (
              <InlineEditor
                initialValue={leftContent || ''}
                onSave={handleLeftContentSave}
                onCancel={handleLeftContentCancel}
                multiline={true}
                placeholder="Enter left column content..."
                className="inline-editor-left-content"
                style={{
                  ...columnContentStyles,
                  // Ensure content behaves exactly like p element
                  margin: '0',
                  padding: '0',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  overflow: 'hidden',
                  overflowWrap: 'anywhere',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block'
                }}
              />
            ) : (
              <p 
                style={columnContentStyles}
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
                {leftContent || 'Click to add left content'}
              </p>
            )}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column'}}>
          {/* Right Clickable Image Placeholder */}
            <ClickableImagePlaceholder
              imagePath={rightImagePath}
              onImageUploaded={handleRightImageUploaded}
              size="XLARGE"
              position="CENTER"
              description="Click to upload image"
              prompt={rightDisplayPrompt}
              isEditable={isEditable}
              style={rightPlaceholderStyles}
              onSizeTransformChange={handleRightSizeTransformChange}
              elementId="right-image"
              cropMode={rightObjectFit || 'contain'}
              slideContainerRef={slideContainerRef}
              savedImagePosition={rightImageOffset}
              savedImageSize={rightWidthPx && rightHeightPx ? { width: rightWidthPx, height: rightHeightPx } : undefined}
            />
          {/* Right Mini title */}
          <div 
            ref={rightTitleRef}
            data-moveable-element={`${slideId}-rightTitle`}
            data-draggable="true" 
            style={{ display: 'inline-block' }}
          >
            {isEditable && editingRightTitle ? (
              <InlineEditor
                initialValue={rightTitle || ''}
                onSave={handleRightTitleSave}
                onCancel={handleRightTitleCancel}
                multiline={true}
                placeholder="Enter right column title..."
                className="inline-editor-right-title"
                style={{
                  ...columnTitleStyles,
                  // Ensure title behaves exactly like h2 element
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
                style={columnTitleStyles}
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
                {rightTitle || 'Click to add right title'}
              </h2>
            )}
          </div>
          {/* Right Main text */}
          <div 
            ref={rightContentRef}
            data-moveable-element={`${slideId}-rightContent`}
            data-draggable="true" 
            style={{ display: 'inline-block' }}
          >
            {isEditable && editingRightContent ? (
              <InlineEditor
                initialValue={rightContent || ''}
                onSave={handleRightContentSave}
                onCancel={handleRightContentCancel}
                multiline={true}
                placeholder="Enter right column content..."
                className="inline-editor-right-content"
                style={{
                  ...columnContentStyles,
                  // Ensure content behaves exactly like p element
                  margin: '0',
                  padding: '0',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  overflow: 'hidden',
                  overflowWrap: 'anywhere',
                  whiteSpace: 'pre-wrap',
                  boxSizing: 'border-box',
                  display: 'block'
                }}
              />
            ) : (
              <p 
                style={columnContentStyles}
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
                className={isEditable ? 'cursor-pointer border border-transparent hover-border-opacity-50' : ''}
              >
                {rightContent || 'Click to add right content'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoColumnTemplate;