'use client';

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Image as ImageIcon, Upload, Replace } from 'lucide-react';
import { ImageMode, ImageModeConfig } from '@/types/slideTemplates';
import { useModeAwareResize } from '@/hooks/useModeAwareResize';
import PresentationImageUpload from './PresentationImageUpload';

interface ModeAwareImagePlaceholderProps {
  // Core props
  imagePath?: string;
  onImageUploaded: (imagePath: string) => void;
  description?: string;
  prompt?: string;
  isEditable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  
  // Mode configuration
  mode: ImageMode;
  lockedSide?: 'width' | 'height';
  modeConfig?: ImageModeConfig;
  
  // Size and transform props
  widthPx?: number;
  heightPx?: number;
  objectFit?: 'contain' | 'cover' | 'fill';
  imageScale?: number;
  imageOffset?: { x: number; y: number };
  
  // Callbacks
  onSizeTransformChange?: (payload: {
    widthPx?: number;
    heightPx?: number;
    objectFit?: 'contain' | 'cover' | 'fill';
    imageScale?: number;
    imageOffset?: { x: number; y: number };
  }) => void;
}

/**
 * Mode-aware image placeholder that implements Gamma's two-mode behavior:
 * - full-side: One dimension locked, other resizable via slider
 * - free-proportion: Fully proportional resizing with corner handles
 */
const ModeAwareImagePlaceholder: React.FC<ModeAwareImagePlaceholderProps> = ({
  imagePath,
  onImageUploaded,
  description = 'Click to upload image',
  prompt = 'relevant illustration',
  isEditable = true,
  className = '',
  style = {},
  mode = 'free-proportion',
  lockedSide = 'width',
  modeConfig,
  widthPx,
  heightPx,
  objectFit = 'cover',
  imageScale = 1,
  imageOffset = { x: 0, y: 0 },
  onSizeTransformChange
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeValue, setResizeValue] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);

  // Default mode configurations
  const defaultConfigs: Record<ImageMode, ImageModeConfig> = {
    'full-side': {
      mode: 'full-side',
      lockedSide: lockedSide,
      defaultSize: {
        width: lockedSide === 'height' ? 400 : undefined,
        height: lockedSide === 'width' ? 270 : undefined
      },
      constraints: {
        minWidth: 200,
        maxWidth: 800,
        minHeight: 150,
        maxHeight: 600
      }
    },
    'free-proportion': {
      mode: 'free-proportion',
      defaultSize: {
        width: 384,
        height: 256
      },
      constraints: {
        minWidth: 120,
        maxWidth: 800,
        minHeight: 120,
        maxHeight: 600
      }
    }
  };

  const config = modeConfig || defaultConfigs[mode];
  const currentLockedSide = config.lockedSide || lockedSide;

  // Calculate current dimensions based on mode
  const currentDimensions = useMemo(() => {
    if (widthPx && heightPx) {
      return { width: widthPx, height: heightPx };
    }

    const defaults = config.defaultSize || {};
    return {
      width: defaults.width || 384,
      height: defaults.height || 256
    };
  }, [widthPx, heightPx, config]);

  // Use the mode-aware resize hook
  const {
    handleSliderResize,
    handleCornerResize,
    handleImageUploadResize,
    getSliderValue,
    canResize,
    getResizeDirection
  } = useModeAwareResize({
    mode,
    lockedSide: currentLockedSide,
    modeConfig: config,
    currentWidth: currentDimensions.width,
    currentHeight: currentDimensions.height,
    onSizeChange: (width, height) => {
      onSizeTransformChange?.({
        widthPx: width,
        heightPx: height,
        objectFit: mode === 'full-side' ? 'cover' : 'contain',
        imageScale: 1,
        imageOffset: { x: 0, y: 0 }
      });
    }
  });

  // Handle image upload with mode-specific sizing
  const handleImageUploaded = useCallback((newImagePath: string) => {
    onImageUploaded(newImagePath);
    
    // Create temporary image to read dimensions
    const tmp = new window.Image();
    tmp.onload = () => {
      const imgW = tmp.naturalWidth || tmp.width;
      const imgH = tmp.naturalHeight || tmp.height;
      
      if (!imgW || !imgH) return;

      // Use the hook's image upload resize logic
      handleImageUploadResize(imgW, imgH, containerRef.current?.offsetWidth, containerRef.current?.offsetHeight);
    };
    tmp.src = newImagePath;
  }, [onImageUploaded, handleImageUploadResize]);

  // Handle slider resize for full-side mode
  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setResizeValue(value);
    setIsResizing(true);

    // Use the hook's slider resize logic
    handleSliderResize(value);
  }, [handleSliderResize]);

  const handleSliderEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Calculate slider value for full-side mode
  useEffect(() => {
    if (mode === 'full-side' && sliderRef.current) {
      const value = getSliderValue();
      setResizeValue(Math.max(0, Math.min(1, value)));
    }
  }, [mode, getSliderValue]);

  const handleClick = () => {
    if (isEditable) {
      setShowUploadModal(true);
    }
  };

  // Render image with mode-specific styling
  const renderImage = () => {
    if (!imagePath) return null;

    const imageStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      objectFit: mode === 'full-side' ? 'cover' : 'contain',
      transform: `translate(${imageOffset.x}px, ${imageOffset.y}px) scale(${imageScale})`,
      transformOrigin: 'center center'
    };

    return (
      <img
        ref={imgRef}
        src={imagePath}
        alt={description}
        style={imageStyle}
        draggable={false}
      />
    );
  };

  // Render resize slider for full-side mode
  const renderResizeSlider = () => {
    if (mode !== 'full-side' || !isEditable) return null;

    const constraints = config.constraints || {};
    const label = currentLockedSide === 'width' ? 'Height' : 'Width';

    return (
      <div className="resize-slider-container">
        <div className="resize-slider">
          <span>{label}:</span>
          <input
            ref={sliderRef}
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={resizeValue}
            onChange={handleSliderChange}
            onPointerUp={handleSliderEnd}
            className="resize-slider-input"
          />
          <span className="resize-slider-value">
            {currentLockedSide === 'width' ? currentDimensions.height : currentDimensions.width}px
          </span>
        </div>
      </div>
    );
  };

  // Render corner resize handles for free-proportion mode
  const renderCornerHandles = () => {
    if (mode !== 'free-proportion' || !isEditable) return null;

    return (
      <>
        <div
          className="resize-handle resize-handle-se"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const startX = e.clientX;
            const startY = e.clientY;

            const handleMove = (moveEvent: PointerEvent) => {
              const deltaX = moveEvent.clientX - startX;
              const deltaY = moveEvent.clientY - startY;
              handleCornerResize(deltaX, deltaY);
            };

            const handleUp = () => {
              document.removeEventListener('pointermove', handleMove);
              document.removeEventListener('pointerup', handleUp);
            };

            document.addEventListener('pointermove', handleMove);
            document.addEventListener('pointerup', handleUp);
          }}
        />
      </>
    );
  };

  // Render placeholder content
  const renderPlaceholder = () => {
    if (imagePath) {
      return (
        <div className="w-full h-full relative">
          {renderImage()}
          {renderResizeSlider()}
          {renderCornerHandles()}
          
          {/* Replace overlay */}
          {isEditable && (
            <div 
              className="replace-overlay"
              onClick={handleClick}
              title="Click to replace image"
            >
              <div className="replace-overlay-content">
                <Replace className="w-6 h-6 mx-auto mb-1" />
                <div className="text-xs font-medium">Replace</div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Empty placeholder
    return (
      <div 
        className="empty-placeholder"
        onClick={handleClick}
      >
        <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <div className="upload-text">Upload Image</div>
        <div className="description">{description}</div>
        {prompt && (
          <div className="prompt">
            "{prompt}"
          </div>
        )}
        {isEditable && (
          <div className="click-hint">
            Click to upload
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`mode-aware-image-placeholder ${imagePath ? 'has-image' : ''} ${isResizing ? 'resizing' : ''} ${className}`}
        data-mode={mode}
        data-locked-side={currentLockedSide}
        style={{
          width: currentDimensions.width,
          height: currentDimensions.height,
          ...style
        }}
      >
        {renderPlaceholder()}
      </div>

      <PresentationImageUpload
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onImageUploaded={handleImageUploaded}
        title="Upload Presentation Image"
      />
    </>
  );
};

export default ModeAwareImagePlaceholder;
