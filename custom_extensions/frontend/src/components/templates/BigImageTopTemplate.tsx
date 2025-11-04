import React, { useState, useRef, useEffect } from 'react';
import { BigImageLeftProps } from '@/types/slideTemplates';
import { SlideTheme, getSlideTheme, DEFAULT_SLIDE_THEME } from '@/types/slideThemes';
import ClickableImagePlaceholder from '../ClickableImagePlaceholder';
import { WysiwygEditor } from '@/components/editors/WysiwygEditor';

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

export const BigImageTopTemplate: React.FC<BigImageTopProps & { 
  theme?: SlideTheme;
  onUpdate?: (props: any) => void;
  isEditable?: boolean;
  getPlaceholderGenerationState?: (elementId: string) => { isGenerating: boolean; hasImage: boolean; error?: string };
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
  objectFit,
  getPlaceholderGenerationState
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
    height: '600px', // Фиксированная высота
    background: '#ffffff', // Белый фон как на фото
    fontFamily: currentTheme.fonts.contentFont,
    display: 'flex',
    flexDirection: 'column', // Вертикальный макет
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: '0',
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
    width: '100%', // Полная ширина
    height: '50%', // Точная высота 50% от 600px
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    minWidth: 0,
    marginBottom: '0',
    flexShrink: 0 // Предотвращаем сжатие
  };

  const placeholderStyles: React.CSSProperties = {
    // FIXED: Always maintain full width consistency between display and saved dimensions
    width: '100%',
    // Only apply default height if no saved height exists, but keep full width
    ...(heightPx ? { height: `${heightPx}px` } : { height: '100%' }),
    margin: '0',
    borderRadius: '0' // Убираем скругления для полной ширины
  };

  const contentContainerStyles: React.CSSProperties = {
    width: '100%', // Полная ширина
    height: '50%', // Точная высота 50% от 600px
    padding: '40px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    minWidth: 0,
    flexShrink: 0, // Предотвращаем сжатие
    overflow: 'hidden' // Скрываем переполнение
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '3rem', // Крупный шрифт как на фото
    fontFamily: currentTheme.fonts.titleFont,
    color: '#000000', // Черный цвет как на фото
    marginBottom: '24px',
    lineHeight: '1.2',
    wordWrap: 'break-word',
    fontWeight: 'bold',
    textAlign: 'left'
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: '1.1rem', // Чуть больше для читаемости
    fontFamily: currentTheme.fonts.contentFont,
    color: '#333333', // Темно-серый цвет как на фото
    lineHeight: '1.6',
    width: '75%',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    textAlign: 'left'
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
          templateId="big-image-top"
          aiGeneratedPrompt={imagePrompt}
          isGenerating={getPlaceholderGenerationState ? getPlaceholderGenerationState(`${slideId}-image`).isGenerating : false}
          onGenerationStarted={getPlaceholderGenerationState ? () => {} : undefined}
        />
      </div>

      {/* Bottom - Content */}
      <div style={contentContainerStyles}>
        {/* Title - wrapped */}
        <div 
          ref={titleRef}
          data-moveable-element={`${slideId}-title`}
          data-draggable="true" 
          style={{ display: 'inline-block' }}
        >
          {isEditable && editingTitle ? (
            <WysiwygEditor
              initialValue={title || ''}
              onSave={handleTitleSave}
              onCancel={handleTitleCancel}
              placeholder="Enter slide title..."
              className="inline-editor-title"
              style={{
                ...titleStyles,
                padding: '8px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block',
                lineHeight: '1.2'
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
              dangerouslySetInnerHTML={{ __html: title || 'Click to add title' }}
            />
          )}
        </div>

        {/* Subtitle - wrapped */}
        <div 
          ref={subtitleRef}
          data-moveable-element={`${slideId}-subtitle`}
          data-draggable="true" 
          style={{ display: 'inline-block' }}
        >
          {isEditable && editingSubtitle ? (
            <WysiwygEditor
              initialValue={subtitle || ''}
              onSave={handleSubtitleSave}
              onCancel={handleSubtitleCancel}
              placeholder="Enter slide content..."
              className="inline-editor-subtitle"
              style={{
                ...subtitleStyles,
                padding: '8px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                boxSizing: 'border-box',
                display: 'block',
                lineHeight: '1.6'
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
              dangerouslySetInnerHTML={{ __html: subtitle || 'Click to add content' }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BigImageTopTemplate; 