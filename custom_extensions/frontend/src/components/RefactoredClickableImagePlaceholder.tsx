'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { ImageIcon, Replace } from 'lucide-react';
import PresentationImageUpload from './PresentationImageUpload';
import { SimplePlaceholder } from './SimplePlaceholder';

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
  // New props for positioning
  elementId?: string;
  elementRef?: React.RefObject<HTMLDivElement | null>;
  cropMode?: 'cover' | 'contain' | 'fill';
  onCropModeChange?: (mode: 'cover' | 'contain' | 'fill') => void;
}

const RefactoredClickableImagePlaceholder: React.FC<ClickableImagePlaceholderProps> = ({
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
  elementId = 'default-image-placeholder',
  elementRef,
  cropMode = 'contain',
  onCropModeChange
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCropOptions, setShowCropOptions] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [displayedImage, setDisplayedImage] = useState<string | undefined>(imagePath);
  const [isHovered, setIsHovered] = useState(false);
  const [positionPx, setPositionPx] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [sizePx, setSizePx] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const internalRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Use provided ref or internal ref
  const containerRef = elementRef || internalRef;

  log('RefactoredClickableImagePlaceholder', 'render', { 
    elementId, 
    imagePath: !!imagePath, 
    isEditable,
    position: positionPx,
    size: sizePx
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

  const handleImageUploaded = useCallback((newImagePath: string) => {
    log('RefactoredClickableImagePlaceholder', 'imageUploaded', { elementId, newImagePath });
    setDisplayedImage(newImagePath);
    onImageUploaded(newImagePath);
    setShowUploadModal(false);
  }, [onImageUploaded, elementId]);

  const handleCropModeChange = useCallback((mode: 'cover' | 'contain' | 'fill') => {
    log('RefactoredClickableImagePlaceholder', 'cropModeChange', { elementId, mode });
    onCropModeChange?.(mode);
    setShowCropOptions(false);
  }, [onCropModeChange, elementId]);

  // Handle position changes from SimplePlaceholder
  const handlePositionChange = useCallback((id: string, position: { x: number; y: number }) => {
    log('RefactoredClickableImagePlaceholder', 'positionChange', { elementId: id, position });
    setPositionPx(position);
    onSizeTransformChange?.({ position });
  }, [onSizeTransformChange]);

  // Handle size changes from SimplePlaceholder  
  const handleSizeChange = useCallback((id: string, size: { width: number; height: number }) => {
    log('RefactoredClickableImagePlaceholder', 'sizeChange', { elementId: id, size });
    setSizePx(size);
    onSizeTransformChange?.({ widthPx: size.width, heightPx: size.height });
  }, [onSizeTransformChange]);

  const handleClick = useCallback(() => {
    if (isEditable && !displayedImage) {
      log('RefactoredClickableImagePlaceholder', 'placeholderClick', { elementId });
      setShowUploadModal(true);
    }
  }, [isEditable, displayedImage, elementId]);

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditable && displayedImage) {
      log('RefactoredClickableImagePlaceholder', 'imageClick', { elementId });
      setShowUploadModal(true);
    }
  }, [isEditable, displayedImage, elementId]);

  // If image is loaded, render image content
  if (displayedImage) {
    return (
      <>
        <SimplePlaceholder
          elementId={elementId}
          isEditable={isEditable}
          onPositionChange={handlePositionChange}
          onSizeChange={handleSizeChange}
          initialPosition={positionPx}
          initialSize={sizePx}
          minWidth={50}
          minHeight={50}
          keepRatio={false}
          style={style}
          className={className}
        >
          <div
            ref={containerRef}
            className={`relative overflow-hidden rounded-lg ${className}`}
            style={{
              width: '100%',
              height: '100%',
              cursor: isEditable ? 'pointer' : 'default',
              ...style
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleImageClick}
          >
            {/* Image */}
            <img
              ref={imgRef}
              src={displayedImage}
              alt={description}
              className="w-full h-full object-cover"
              style={{
                objectFit: cropMode,
                width: '100%',
                height: '100%'
              }}
              onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                log('RefactoredClickableImagePlaceholder', 'imageLoad', { 
                  elementId, 
                  naturalWidth: img.naturalWidth, 
                  naturalHeight: img.naturalHeight 
                });
              }}
            />

            {/* Replace button overlay */}
            {isEditable && isHovered && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-all duration-200">
                <div className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 px-3 py-2 rounded-md flex items-center gap-2 text-sm font-medium shadow-sm transition-all duration-200">
                  <Replace size={14} />
                  Replace
                </div>
              </div>
            )}
            
            {/* Crop mode controls */}
            {isEditable && (
              <div className="absolute top-2 right-2 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    log('RefactoredClickableImagePlaceholder', 'cropButtonClick', { elementId });
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
        </SimplePlaceholder>

        <PresentationImageUpload
          isOpen={showUploadModal}
          onClose={() => {
            log('RefactoredClickableImagePlaceholder', 'uploadModalClose', { elementId });
            setShowUploadModal(false);
          }}
          onImageUploaded={handleImageUploaded}
          title="Upload Presentation Image"
        />
      </>
    );
  }

  // Otherwise show placeholder
  log('RefactoredClickableImagePlaceholder', 'renderingPlaceholder', { 
    elementId, 
    isEditable 
  });

  return (
    <>
      <SimplePlaceholder
        elementId={elementId}
        isEditable={isEditable}
        onPositionChange={handlePositionChange}
        onSizeChange={handleSizeChange}
        initialPosition={positionPx}
        initialSize={sizePx}
        minWidth={50}
        minHeight={50}
        keepRatio={false}
        style={style}
        className={className}
      >
        <div
          ref={containerRef}
          className={`
            ${positionClasses[position]} 
            bg-gradient-to-br from-blue-100 to-purple-100 
            border-2 border-dashed border-gray-300 
            rounded-lg flex items-center justify-center 
            text-gray-500 text-sm
            ${position === 'BACKGROUND' ? 'opacity-20' : ''}
            ${isEditable ? 'hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer' : ''}
            ${className}
          `}
          style={{
            width: '100%',
            height: '100%',
            minHeight: '100px',
            ...style
          }}
          onClick={handleClick}
        >
          <div className="text-center p-4">
            <ImageIcon size={32} className="mx-auto mb-2 text-gray-400" />
            <div className="font-medium mb-1">{description}</div>
            {prompt && (
              <div className="text-xs text-gray-400 italic">{prompt}</div>
            )}
          </div>
        </div>
      </SimplePlaceholder>

      <PresentationImageUpload
        isOpen={showUploadModal}
        onClose={() => {
          log('RefactoredClickableImagePlaceholder', 'uploadModalClose', { elementId });
          setShowUploadModal(false);
        }}
        onImageUploaded={handleImageUploaded}
        title="Upload Presentation Image"
      />
    </>
  );
};

export default RefactoredClickableImagePlaceholder;
