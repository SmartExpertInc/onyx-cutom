'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { ImageIcon, Replace } from 'lucide-react';
import PresentationImageUpload from './PresentationImageUpload';
import Moveable from 'react-moveable';

// Debug logging utility
const DEBUG = typeof window !== 'undefined' && (window as any).__MOVEABLE_DEBUG__;
const log = (source: string, event: string, data: any) => {
  if (DEBUG) {
    console.log(`[${source}] ${event}`, { ts: Date.now(), ...data });
  }
};

export interface ClickableImagePlaceholderProps {
  imagePath?: string;
  onImageUploaded: (imagePath: string) => void;
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';
  position?: 'LEFT' | 'RIGHT' | 'CENTER' | 'BACKGROUND';
  description?: string;
  prompt?: string;
  isEditable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onSizeTransformChange?: (payload: any) => void;
  // New props for MoveableManager integration
  elementId?: string;
  elementRef?: React.RefObject<HTMLDivElement | null>;
  cropMode?: 'cover' | 'contain' | 'fill';
  onCropModeChange?: (mode: 'cover' | 'contain' | 'fill') => void;
}

const ClickableImagePlaceholder: React.FC<ClickableImagePlaceholderProps> = ({
  imagePath,
  onImageUploaded,
  size = 'MEDIUM',
  position = 'CENTER',
  description = 'Click to upload image',
  prompt,
  isEditable = false,
  className = '',
  style = {},
  onSizeTransformChange,
  elementId,
  elementRef,
  cropMode = 'contain',
  onCropModeChange
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCropOptions, setShowCropOptions] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [displayedImage, setDisplayedImage] = useState<string | undefined>(imagePath);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [shiftPressed, setShiftPressed] = useState(false);
  const [positionPx, setPositionPx] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [sizePx, setSizePx] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const internalRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const moveableRef = useRef<Moveable | null>(null);
  
  // Use provided ref or internal ref
  const containerRef = elementRef || internalRef;

  log('ClickableImagePlaceholder', 'render', { 
    elementId, 
    imagePath: !!imagePath, 
    refExists: !!containerRef.current,
    isEditable 
  });

  const sizeClasses = {
    'LARGE': 'h-48 md:h-64',
    'MEDIUM': 'h-32 md:h-40', 
    'SMALL': 'h-24 md:h-32'
  };

  const positionClasses = {
    'LEFT': 'float-left mr-6 mb-4',
    'RIGHT': 'float-right ml-6 mb-4',
    'CENTER': 'mx-auto mb-6',
    'BACKGROUND': 'absolute inset-0 z-0'
  };

  // Derived sizes for default size classes when explicit width/height not provided
  const defaultPixelSize = useMemo(() => {
    switch (size) {
      case 'LARGE': return { w: 512, h: 384 };
      case 'MEDIUM': return { w: 384, h: 256 };
      case 'SMALL': return { w: 256, h: 192 };
      default: return { w: 384, h: 256 };
    }
  }, [size]);

  // Initialize local size from defaults once
  useEffect(() => {
    if (sizePx.width === 0 || sizePx.height === 0) {
      setSizePx({ width: defaultPixelSize.w, height: defaultPixelSize.h });
    }
  }, [defaultPixelSize, sizePx.width, sizePx.height]);

  // Keep local displayed image in sync with prop when it changes
  useEffect(() => {
    if (imagePath) {
      setDisplayedImage(imagePath);
    }
  }, [imagePath]);

  // Track Shift key for proportional resizing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setShiftPressed(true);
        moveableRef.current?.updateRect();
        log('ClickableImagePlaceholder', 'shiftKeyDown', { elementId });
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setShiftPressed(false);
        moveableRef.current?.updateRect();
        log('ClickableImagePlaceholder', 'shiftKeyUp', { elementId });
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [elementId]);

  const handleClick = () => {
    if (!isEditable) return;
    if (isDragging || isResizing) {
      log('ClickableImagePlaceholder', 'clickIgnoredWhileTransforming', { elementId, isDragging, isResizing });
      return;
    }
    log('ClickableImagePlaceholder', 'handleClick', { elementId, isEditable });
    setShowUploadModal(true);
  };

  const handleImageUploaded = (newImagePath: string) => {
    log('ClickableImagePlaceholder', 'handleImageUploaded_start', { 
      elementId, 
      newImagePath: !!newImagePath,
      refExists: !!containerRef.current 
    });

    onImageUploaded(newImagePath);
    setDisplayedImage(newImagePath);
    
    // Load image to get dimensions and calculate optimal size
    const tmp = new window.Image();
    tmp.onload = () => {
      const imgW = tmp.naturalWidth || tmp.width;
      const imgH = tmp.naturalHeight || tmp.height;
      
      log('ClickableImagePlaceholder', 'imageLoaded', { 
        elementId, 
        imgW, 
        imgH, 
        refExists: !!containerRef.current 
      });
      
      if (imgW > 0 && imgH > 0) {
        setImageDimensions({ width: imgW, height: imgH });
        
        // Calculate optimal size based on crop mode
        const containerWidth = defaultPixelSize.w;
        const containerHeight = defaultPixelSize.h;
        const containerRatio = containerWidth / containerHeight;
        const imageRatio = imgW / imgH;
        
        let targetWidth: number;
        let targetHeight: number;
        
        switch (cropMode) {
          case 'cover':
            // Scale to cover container, maintaining aspect ratio
            if (imageRatio > containerRatio) {
              targetHeight = containerHeight;
              targetWidth = containerHeight * imageRatio;
            } else {
              targetWidth = containerWidth;
              targetHeight = containerWidth / imageRatio;
            }
            break;
          case 'fill':
            // Stretch to fit container exactly
            targetWidth = containerWidth;
            targetHeight = containerHeight;
            break;
          case 'contain':
          default:
            // Scale to fit within container, maintaining aspect ratio
            if (imageRatio > containerRatio) {
              targetWidth = containerWidth;
              targetHeight = containerWidth / imageRatio;
            } else {
              targetHeight = containerHeight;
              targetWidth = containerHeight * imageRatio;
            }
            break;
        }
        
        log('ClickableImagePlaceholder', 'sizeCalculation', { 
          elementId, 
          cropMode, 
          targetWidth, 
          targetHeight,
          containerWidth,
          containerHeight,
          imageRatio,
          containerRatio
        });
        
        // Update size via callback
        onSizeTransformChange?.({
          widthPx: Math.round(targetWidth),
          heightPx: Math.round(targetHeight),
          objectFit: cropMode,
          imageScale: 1,
          imageOffset: { x: 0, y: 0 }
        });

        log('ClickableImagePlaceholder', 'handleImageUploaded_complete', { 
          elementId, 
          newImagePath: !!newImagePath,
          refExists: !!containerRef.current,
          targetWidth,
          targetHeight
        });
      }
    };
    tmp.onerror = () => {
      log('ClickableImagePlaceholder', 'imageLoadError', { elementId, newImagePath });
    };
    tmp.src = newImagePath;
  };

  const handleCropModeChange = (newMode: 'cover' | 'contain' | 'fill') => {
    log('ClickableImagePlaceholder', 'handleCropModeChange', { 
      elementId, 
      oldMode: cropMode, 
      newMode,
      hasDimensions: !!imageDimensions 
    });

    onCropModeChange?.(newMode);
    
    // Recalculate size if we have image dimensions
    if (imageDimensions && onSizeTransformChange) {
      const { width: imgW, height: imgH } = imageDimensions;
      const containerWidth = defaultPixelSize.w;
      const containerHeight = defaultPixelSize.h;
      const containerRatio = containerWidth / containerHeight;
      const imageRatio = imgW / imgH;
      
      let targetWidth: number;
      let targetHeight: number;
      
      switch (newMode) {
        case 'cover':
          if (imageRatio > containerRatio) {
            targetHeight = containerHeight;
            targetWidth = containerHeight * imageRatio;
          } else {
            targetWidth = containerWidth;
            targetHeight = containerWidth / imageRatio;
          }
          break;
        case 'fill':
          targetWidth = containerWidth;
          targetHeight = containerHeight;
          break;
        case 'contain':
        default:
          if (imageRatio > containerRatio) {
            targetWidth = containerWidth;
            targetHeight = containerWidth / imageRatio;
          } else {
            targetHeight = containerHeight;
            targetWidth = containerHeight * imageRatio;
          }
          break;
      }
      
      onSizeTransformChange({
        widthPx: Math.round(targetWidth),
        heightPx: Math.round(targetHeight),
        objectFit: newMode,
        imageScale: 1,
        imageOffset: { x: 0, y: 0 }
      });
    }
  };

  // If we have an image, display it with replace overlay and crop controls
  if (displayedImage) {
    log('ClickableImagePlaceholder', 'renderingImage', { 
      elementId, 
      imagePath: !!displayedImage,
      refExists: !!containerRef.current,
      cropMode 
    });

    return (
      <>
        <div
          ref={containerRef}
          data-moveable-element={elementId}
          className={`
            ${positionClasses[position]} 
            rounded-lg overflow-hidden relative ${className}
          `}
          style={{
            ...(style || {}),
            position: 'relative',
            width: sizePx.width || defaultPixelSize.w,
            height: sizePx.height || defaultPixelSize.h,
            left: positionPx.x,
            top: positionPx.y,
            minWidth: 120,
            minHeight: 120,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleClick}
        >
          <div className="w-full h-full relative">
            <img
              ref={imgRef}
              src={displayedImage}
              alt={description}
              className="absolute inset-0"
              style={{
                width: '100%',
                height: '100%',
                 objectFit: cropMode,
                 transform: 'none',
                transformOrigin: 'center center',
                maxWidth: 'none',
                maxHeight: 'none'
              }}
              draggable={false}
              onLoad={() => {
                log('ClickableImagePlaceholder', 'imgOnLoad', { elementId, imagePath: !!displayedImage });
              }}
              onError={() => {
                log('ClickableImagePlaceholder', 'imgOnError', { elementId, imagePath: displayedImage });
              }}
            />
            
            {/* Replace overlay */}
            {isEditable && (
              <div 
                className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer z-10"
                onClick={handleClick}
                title="Click to replace image"
                style={{ pointerEvents: 'auto', zIndex: 10 }}
              >
                <div className="text-center text-white">
                  <Replace className="w-6 h-6 mx-auto mb-1" />
                  <div className="text-xs font-medium">Replace</div>
                </div>
              </div>
            )}
            
            {/* Crop mode controls */}
            {isEditable && (
              <div className="absolute top-2 right-2 z-20">
                <button
                  onClick={() => {
                    log('ClickableImagePlaceholder', 'cropButtonClick', { elementId });
                    setShowCropOptions(!showCropOptions);
                  }}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 px-2 py-1 rounded text-xs font-medium shadow-sm transition-all duration-200"
                  title="Crop options"
                >
                  Crop
                </button>
                
                {showCropOptions && (
                  <div className="absolute top-full right-0 mt-1 bg-white rounded shadow-lg border border-gray-200 p-2 min-w-32">
                    <div className="text-xs font-medium text-gray-700 mb-2">Image Fit:</div>
                    <button
                      onClick={() => handleCropModeChange('contain')}
                      className={`block w-full text-left px-2 py-1 rounded text-xs ${cropMode === 'contain' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      Fit (contain)
                    </button>
                    <button
                      onClick={() => handleCropModeChange('cover')}
                      className={`block w-full text-left px-2 py-1 rounded text-xs ${cropMode === 'cover' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      Fill (cover)
                    </button>
                    <button
                      onClick={() => handleCropModeChange('fill')}
                      className={`block w-full text-left px-2 py-1 rounded text-xs ${cropMode === 'fill' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      Stretch (fill)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Moveable controls for drag/resize */}
        {isEditable && (
          <Moveable
            ref={moveableRef as any}
            target={containerRef.current as any}
            draggable={true}
            resizable={true}
            keepRatio={shiftPressed}
            // Drag
            onDrag={({ target, left, top }) => {
              setIsDragging(true);
              (target as HTMLElement).style.left = `${left}px`;
              (target as HTMLElement).style.top = `${top}px`;
              log('ClickableImagePlaceholder', 'onDrag', { elementId, left, top });
            }}
            onDragEnd={({ target }) => {
              const rect = (target as HTMLElement).getBoundingClientRect();
              const parentRect = (target as HTMLElement).parentElement?.getBoundingClientRect();
              const x = parentRect ? rect.left - parentRect.left : rect.left;
              const y = parentRect ? rect.top - parentRect.top : rect.top;
              setPositionPx({ x, y });
              setIsDragging(false);
              log('ClickableImagePlaceholder', 'onDragEnd', { elementId, x, y });
              // Save only at end
              onSizeTransformChange?.({ position: { x, y } });
            }}
            // Resize
            onResize={({ target, width, height, drag }) => {
              setIsResizing(true);
              const el = target as HTMLElement;
              el.style.width = `${Math.max(50, Math.round(width))}px`;
              el.style.height = `${Math.max(50, Math.round(height))}px`;
              const left = drag?.left ?? el.offsetLeft;
              const top = drag?.top ?? el.offsetTop;
              el.style.left = `${left}px`;
              el.style.top = `${top}px`;
              log('ClickableImagePlaceholder', 'onResize', { elementId, width, height, left, top });
            }}
            onResizeEnd={({ target }) => {
              const el = target as HTMLElement;
              const rect = el.getBoundingClientRect();
              const parentRect = el.parentElement?.getBoundingClientRect();
              const newSize = { width: Math.round(rect.width), height: Math.round(rect.height) };
              const newPos = {
                x: parentRect ? Math.round(rect.left - parentRect.left) : Math.round(rect.left),
                y: parentRect ? Math.round(rect.top - parentRect.top) : Math.round(rect.top)
              };
              setSizePx(newSize);
              setPositionPx(newPos);
              setIsResizing(false);
              log('ClickableImagePlaceholder', 'onResizeEnd', { elementId, ...newSize, ...newPos });
              onSizeTransformChange?.({ widthPx: newSize.width, heightPx: newSize.height, position: newPos });
            }}
            throttleDrag={0}
            throttleResize={0}
            renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
            className="moveable-control"
            hideDefaultLines={!isHovered}
            edge={false}
            zoom={1}
            origin={false}
            minWidth={50}
            minHeight={50}
          />
        )}

        <PresentationImageUpload
          isOpen={showUploadModal}
          onClose={() => {
            log('ClickableImagePlaceholder', 'uploadModalClose', { elementId });
            setShowUploadModal(false);
          }}
          onImageUploaded={handleImageUploaded}
          title="Upload Presentation Image"
        />
      </>
    );
  }

  // Otherwise show placeholder
  log('ClickableImagePlaceholder', 'renderingPlaceholder', { 
    elementId, 
    refExists: !!containerRef.current,
    isEditable 
  });

  return (
    <>
      <div
        ref={containerRef}
        data-moveable-element={elementId}
        className={`
          ${positionClasses[position]} 
          bg-gradient-to-br from-blue-100 to-purple-100 
          border-2 border-dashed border-gray-300 
          rounded-lg flex items-center justify-center 
          text-gray-500 text-sm
          ${position === 'BACKGROUND' ? 'opacity-20' : ''}
          ${isEditable ? 'hover:border-blue-400 hover:bg-blue-50 transition-all duration-200' : ''}
          ${className}
        `}
        style={{
          ...(style || {}),
          position: 'relative',
          width: sizePx.width || defaultPixelSize.w,
          height: sizePx.height || defaultPixelSize.h,
          left: positionPx.x,
          top: positionPx.y,
          minWidth: 120,
          minHeight: 120,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        <div className="text-center p-4" style={{ cursor: isEditable ? 'pointer' : 'default' }}>
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <div className="font-medium">{size} Image</div>
          <div className="text-xs mt-1 opacity-75">{description}</div>
          {prompt && (
            <div className="text-xs mt-1 opacity-60 italic">
              "{prompt}"
            </div>
          )}
          {isEditable && (
            <div className="text-xs mt-2 text-blue-600 font-medium">
              Click to upload
            </div>
          )}
        </div>
      </div>

      {/* Moveable controls for drag/resize when empty */}
      {isEditable && (
        <Moveable
          ref={moveableRef as any}
          target={containerRef.current as any}
          draggable={true}
          resizable={true}
          keepRatio={shiftPressed}
          onDrag={({ target, left, top }) => {
            setIsDragging(true);
            (target as HTMLElement).style.left = `${left}px`;
            (target as HTMLElement).style.top = `${top}px`;
            log('ClickableImagePlaceholder', 'onDrag', { elementId, left, top });
          }}
          onDragEnd={({ target }) => {
            const rect = (target as HTMLElement).getBoundingClientRect();
            const parentRect = (target as HTMLElement).parentElement?.getBoundingClientRect();
            const x = parentRect ? rect.left - parentRect.left : rect.left;
            const y = parentRect ? rect.top - parentRect.top : rect.top;
            setPositionPx({ x, y });
            setIsDragging(false);
            log('ClickableImagePlaceholder', 'onDragEnd', { elementId, x, y });
            onSizeTransformChange?.({ position: { x, y } });
          }}
          onResize={({ target, width, height, drag }) => {
            setIsResizing(true);
            const el = target as HTMLElement;
            el.style.width = `${Math.max(50, Math.round(width))}px`;
            el.style.height = `${Math.max(50, Math.round(height))}px`;
            const left = drag?.left ?? el.offsetLeft;
            const top = drag?.top ?? el.offsetTop;
            el.style.left = `${left}px`;
            el.style.top = `${top}px`;
            log('ClickableImagePlaceholder', 'onResize', { elementId, width, height, left, top });
          }}
          onResizeEnd={({ target }) => {
            const el = target as HTMLElement;
            const rect = el.getBoundingClientRect();
            const parentRect = el.parentElement?.getBoundingClientRect();
            const newSize = { width: Math.round(rect.width), height: Math.round(rect.height) };
            const newPos = {
              x: parentRect ? Math.round(rect.left - parentRect.left) : Math.round(rect.left),
              y: parentRect ? Math.round(rect.top - parentRect.top) : Math.round(rect.top)
            };
            setSizePx(newSize);
            setPositionPx(newPos);
            setIsResizing(false);
            log('ClickableImagePlaceholder', 'onResizeEnd', { elementId, ...newSize, ...newPos });
            onSizeTransformChange?.({ widthPx: newSize.width, heightPx: newSize.height, position: newPos });
          }}
          throttleDrag={0}
          throttleResize={0}
          renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
          className="moveable-control"
          hideDefaultLines={!isHovered}
          edge={false}
          zoom={1}
          origin={false}
          minWidth={50}
          minHeight={50}
        />
      )}

      <PresentationImageUpload
        isOpen={showUploadModal}
        onClose={() => {
          log('ClickableImagePlaceholder', 'uploadModalClose', { elementId });
          setShowUploadModal(false);
        }}
        onImageUploaded={handleImageUploaded}
        title="Upload Presentation Image"
      />
    </>
  );
};

export default ClickableImagePlaceholder; 