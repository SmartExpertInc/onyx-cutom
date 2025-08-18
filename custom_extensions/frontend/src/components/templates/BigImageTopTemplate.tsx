import React, { useState, useRef, useEffect } from 'react';
import { BigImageLeftProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';

// Debug logging utility
const DEBUG = typeof window !== 'undefined' && (window as any).__MOVEABLE_DEBUG__;
const log = (source: string, event: string, data: any) => {
  if (DEBUG) {
    console.log(`[${source}] ${event}`, { ts: Date.now(), ...data });
  }
};

export interface BigImageTopProps extends BigImageLeftProps {
  // Можна додати додаткові пропси, якщо потрібно
}

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

export const BigImageTopTemplate: React.FC<BigImageTopProps & { 
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
}> = ({
  title,
  subtitle,
  imageUrl,
  imageAlt,
  imagePrompt,
  imageSize = 'large',
  slideId,  
  onUpdate,
  theme,
  isEditable = false,
  imagePath,
  widthPx,
  heightPx,
  imageScale,
  imageOffset,
  objectFit
}) => {
  // Use theme colors instead of props
  const currentTheme = theme || getSlideTheme(DEFAULT_SLIDE_THEME);
  const { backgroundColor, titleColor, contentColor } = currentTheme.colors;
  
  // Inline editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs for MoveableManager integration
  const imageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  
  log('BigImageTopTemplate', 'render', { 
    slideId, 
    isEditable, 
    hasImagePath: !!imagePath,
    imageRefExists: !!imageRef.current,
    titleRefExists: !!titleRef.current,
    subtitleRefExists: !!subtitleRef.current
  });
  
  // Simple refs for elements (no complex MoveableManager needed)
  // The ClickableImagePlaceholder now handles its own drag/resize with official react-moveable patterns
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const slideStyles: React.CSSProperties = {
    minHeight: '600px',
    backgroundColor: backgroundColor,
    fontFamily: currentTheme.fonts.contentFont,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    paddingBottom: '50px',
    position: 'relative'
  };

  const getImageDimensions = () => {
    switch (imageSize) {
      case 'small': return { width: '300px', height: '200px' };
      case 'medium': return { width: '400px', height: '300px' };
      case 'large': 
      default: return { width: '100%', maxWidth: '700px', height: '350px' };
    }
  };

  const imageDimensions = getImageDimensions();

  const imageContainerStyles: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: backgroundColor,
    minWidth: 0,
    marginBottom: '32px'
  };

  const placeholderStyles: React.CSSProperties = {
    // Only apply default dimensions if no saved size exists
    ...(widthPx && heightPx ? {} : { width: '100%', height: '240px' }),
    margin: '0 auto'
  };

  const contentContainerStyles: React.CSSProperties = {
    width: '100%',
    padding: '60px 60px 60px 60px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    minWidth: 0,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.titleSize,
    fontFamily: currentTheme.fonts.titleFont,
    color: titleColor,
    marginBottom: '24px',
    lineHeight: '1.2',
    wordWrap: 'break-word'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: currentTheme.fonts.contentSize,
    fontFamily: currentTheme.fonts.contentFont,
    color: contentColor,
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word'
  };

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

  // Handle subtitle editing
  const handleSubtitleSave = (newSubtitle: string) => {
    if (onUpdate) {
      onUpdate({ subtitle: newSubtitle });
    }
    setEditingSubtitle(false);
  };

  const handleSubtitleCancel = () => {
    setEditingSubtitle(false);
  };

  // Handle image upload
  const handleImageUploaded = (newImagePath: string) => {
    log('BigImageTopTemplate', 'handleImageUploaded', { 
      slideId, 
      newImagePath: !!newImagePath,
      imageRefExists: !!imageRef.current
    });

    if (onUpdate) {
      onUpdate({ imagePath: newImagePath });
    }
  };

  const handleSizeTransformChange = (payload: any) => {
    log('BigImageTopTemplate', 'handleSizeTransformChange', { 
      slideId, 
      payload,
      imageRefExists: !!imageRef.current
    });

    if (onUpdate) {
      // Convert the payload to the expected format for the backend
      const updateData: any = {};
      
      if (payload.imagePosition) {
        updateData.imageOffset = payload.imagePosition;
      }
      
      if (payload.imageSize) {
        updateData.widthPx = payload.imageSize.width;
        updateData.heightPx = payload.imageSize.height;
      }
      
      // ✅ NEW: Handle objectFit property from ClickableImagePlaceholder
      if (payload.objectFit) {
        updateData.objectFit = payload.objectFit;
        log('BigImageTopTemplate', 'objectFit_update', { 
          slideId, 
          objectFit: payload.objectFit 
        });
      }
      
      onUpdate(updateData);
    }
  };

  // Handle crop mode change
  const handleCropModeChange = (mode: 'cover' | 'contain' | 'fill') => {
    log('BigImageTopTemplate', 'handleCropModeChange', { 
      slideId, 
      mode,
      imageRefExists: !!imageRef.current
    });
    // Crop mode is now handled directly by ClickableImagePlaceholder
  };

  // Use imagePrompt if provided, otherwise fallback to imageAlt or default
  const displayPrompt = imagePrompt || imageAlt || "man sitting on a chair";

  log('BigImageTopTemplate', 'rendering', { 
    slideId, 
    isEditable,
    hasImagePath: !!imagePath
  });

  return (
    <div ref={slideContainerRef} style={slideStyles}>
      
      {/* Top - Clickable Image Placeholder */}
      <div style={imageContainerStyles}>
        <ClickableImagePlaceholder
          imagePath={imagePath}
          onImageUploaded={handleImageUploaded}
          size="LARGE"
          position="CENTER"
          description="Click to upload image"
          prompt={displayPrompt}
          isEditable={isEditable}
          style={placeholderStyles}
          onSizeTransformChange={handleSizeTransformChange}
          elementId={`${slideId}-image`}
          elementRef={imageRef}
          cropMode={objectFit || 'contain'}
          onCropModeChange={handleCropModeChange}
          slideContainerRef={slideContainerRef}
          savedImagePosition={imageOffset}
          savedImageSize={widthPx && heightPx ? { width: widthPx, height: heightPx } : undefined}
        />
      </div>

      {/* Bottom - Content */}
      <div style={contentContainerStyles}>
        {/* Title - wrapped */}
        <div 
          ref={titleRef}
          data-moveable-element={`${slideId}-title`}
          data-draggable="true" 
          data-instance-id={`${slideId}-title-${Math.random().toString(36).substr(2, 9)}`}
          data-debug-slide={slideId}
          data-debug-element={`${slideId}-title`}
          className={`
            relative
            ${isEditable ? 'cursor-pointer' : ''}
          `}
          style={{ 
            display: 'inline-block',
            position: 'relative',
            transformOrigin: 'center center',
            zIndex: 1
          }}
        >
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

        {/* Subtitle - wrapped */}
        <div 
          ref={subtitleRef}
          data-moveable-element={`${slideId}-subtitle`}
          data-draggable="true" 
          data-instance-id={`${slideId}-subtitle-${Math.random().toString(36).substr(2, 9)}`}
          data-debug-slide={slideId}
          data-debug-element={`${slideId}-subtitle`}
          className={`
            relative
            ${isEditable ? 'cursor-pointer' : ''}
          `}
          style={{ 
            display: 'inline-block',
            position: 'relative',
            transformOrigin: 'center center',
            zIndex: 1
          }}
        >
          {isEditable && editingSubtitle ? (
            <InlineEditor
              initialValue={subtitle || ''}
              onSave={handleSubtitleSave}
              onCancel={handleSubtitleCancel}
              multiline={true}
              placeholder="Enter slide content..."
              className="inline-editor-subtitle"
              style={{
                ...subtitleStyles,
                // Ensure subtitle behaves exactly like div element
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
            <div 
              style={subtitleStyles}
              onClick={(e) => {
                const wrapper = (e.currentTarget as HTMLElement).closest('[data-draggable="true"]') as HTMLElement | null;
                if (wrapper && wrapper.getAttribute('data-just-dragged') === 'true') {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                if (isEditable) {
                  setEditingSubtitle(true);
                }
              }}
              className={isEditable ? 'cursor-pointer border border-transparent hover:border-gray-300 hover:border-opacity-50' : ''}
            >
              {subtitle || 'Click to add content'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BigImageTopTemplate; 