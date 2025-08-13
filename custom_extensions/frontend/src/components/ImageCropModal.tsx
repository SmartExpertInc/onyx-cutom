'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Move, ZoomIn, ZoomOut, Crop, SkipForward } from 'lucide-react';

// Debug logging utility
const DEBUG = typeof window !== 'undefined' && ((window as any).__MOVEABLE_DEBUG__ || true); // Enable debug by default for troubleshooting
const log = (source: string, event: string, data: any) => {
  if (DEBUG) {
    console.log(`[${source}] ${event}`, { ts: Date.now(), ...data });
  }
};

export interface CropSettings {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

export interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  imageUrl: string;
  placeholderDimensions: { width: number; height: number };
  onCropConfirm: (croppedImageData: string, cropSettings: CropSettings) => void;
  onSkipCrop: (originalImageData: string) => void;
  elementId?: string;
  isCropping?: boolean;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  imageFile,
  imageUrl,
  placeholderDimensions,
  onCropConfirm,
  onSkipCrop,
  elementId,
  isCropping = false
}) => {
  // Modal state
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [localImageUrl, setLocalImageUrl] = useState<string>('');
  
  // Crop controls
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, startX: 0, startY: 0 });
  
  // Refs
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  
  log('ImageCropModal', 'render', {
    isOpen,
    elementId,
    hasImageFile: !!imageFile,
    imageFileName: imageFile?.name,
    imageFileSize: imageFile?.size,
    imageLoaded,
    placeholderDimensions,
    scale,
    position,
    hasLocalUrl: !!localImageUrl,
    localUrlLength: localImageUrl?.length,
    imageDimensions
  });

  // Create portal container
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPortalContainer(document.body);
    }
  }, []);

  // Create local URL from File for preview
  useEffect(() => {
    log('ImageCropModal', 'createLocalUrl_effect', {
      elementId,
      isOpen,
      hasImageFile: !!imageFile,
      imageFileName: imageFile?.name,
      imageFileSize: imageFile?.size,
      imageFileType: imageFile?.type,
      currentLocalUrl: localImageUrl
    });

    if (imageFile && isOpen && !localImageUrl) {
      const url = URL.createObjectURL(imageFile);
      setLocalImageUrl(url);
      
      log('ImageCropModal', 'createdLocalUrl', { 
        elementId, 
        hasImageFile: !!imageFile,
        imageFileName: imageFile.name,
        imageFileSize: imageFile.size,
        localUrl: url,
        urlLength: url.length
      });
    } else {
      log('ImageCropModal', 'createLocalUrl_skipped', {
        elementId,
        reason: !imageFile ? 'no_imageFile' : (!isOpen ? 'modal_not_open' : 'url_already_exists'),
        isOpen,
        hasImageFile: !!imageFile,
        hasLocalUrl: !!localImageUrl
      });
    }
  }, [imageFile, isOpen, elementId, localImageUrl]);

  // Separate cleanup effect that only runs when the component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (localImageUrl) {
        URL.revokeObjectURL(localImageUrl);
        log('ImageCropModal', 'revokedLocalUrl_cleanup', { elementId, url: localImageUrl });
      }
    };
  }, [localImageUrl, elementId]);

  // Reset state when modal opens/closes
  useEffect(() => {
    log('ImageCropModal', 'modalStateChange', {
      elementId,
      isOpen,
      currentImageLoaded: imageLoaded,
      currentScale: scale,
      currentPosition: position,
      currentLocalUrl: localImageUrl
    });

    if (!isOpen) {
      // Clean up blob URL before resetting
      if (localImageUrl) {
        URL.revokeObjectURL(localImageUrl);
        log('ImageCropModal', 'revokedLocalUrl_modalClose', { elementId, url: localImageUrl });
      }
      
      setImageLoaded(false);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
      setLocalImageUrl('');
      log('ImageCropModal', 'modalClosed_resetState', { elementId });
    } else {
      log('ImageCropModal', 'modalOpened', {
        elementId,
        hasImageFile: !!imageFile,
        hasLocalUrl: !!localImageUrl,
        placeholderDimensions
      });
    }
  }, [isOpen, elementId]);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    log('ImageCropModal', 'handleImageLoad_start', {
      elementId,
      hasImageRef: !!imageRef.current,
      imageSrc: imageRef.current?.src,
      imageComplete: imageRef.current?.complete,
      imageNaturalWidth: imageRef.current?.naturalWidth,
      imageNaturalHeight: imageRef.current?.naturalHeight
    });

    const img = imageRef.current;
    if (!img) {
      log('ImageCropModal', 'handleImageLoad_noImageRef', { elementId });
      return;
    }
    
    const { naturalWidth, naturalHeight } = img;
    log('ImageCropModal', 'handleImageLoad_dimensions', {
      elementId,
      naturalWidth,
      naturalHeight,
      isValid: naturalWidth > 0 && naturalHeight > 0
    });

    if (naturalWidth <= 0 || naturalHeight <= 0) {
      log('ImageCropModal', 'handleImageLoad_invalidDimensions', {
        elementId,
        naturalWidth,
        naturalHeight
      });
      return;
    }

    setImageDimensions({ width: naturalWidth, height: naturalHeight });
    setImageLoaded(true);
    
    // Calculate initial scale to fit image in crop frame
    const { width: frameWidth, height: frameHeight } = placeholderDimensions;
    
    // Ensure we have valid numeric dimensions
    const validFrameWidth = typeof frameWidth === 'number' && frameWidth > 0 ? frameWidth : 384;
    const validFrameHeight = typeof frameHeight === 'number' && frameHeight > 0 ? frameHeight : 256;
    
    const scaleX = validFrameWidth / naturalWidth;
    const scaleY = validFrameHeight / naturalHeight;
    const initialScale = Math.max(scaleX, scaleY, 0.1); // Ensure minimum scale
    
    log('ImageCropModal', 'handleImageLoad_scaleCalculation', {
      elementId,
      frameWidth,
      frameHeight,
      validFrameWidth,
      validFrameHeight,
      naturalWidth,
      naturalHeight,
      scaleX,
      scaleY,
      initialScale,
      isScaleValid: !isNaN(initialScale) && isFinite(initialScale)
    });

    if (isNaN(initialScale) || !isFinite(initialScale)) {
      log('ImageCropModal', 'handleImageLoad_invalidScale', {
        elementId,
        initialScale,
        scaleX,
        scaleY,
        frameWidth,
        frameHeight,
        naturalWidth,
        naturalHeight
      });
      return;
    }
    
    setScale(initialScale);
    
    // Center the image
    const scaledWidth = naturalWidth * initialScale;
    const scaledHeight = naturalHeight * initialScale;
    const centerX = (validFrameWidth - scaledWidth) / 2;
    const centerY = (validFrameHeight - scaledHeight) / 2;
    
    log('ImageCropModal', 'handleImageLoad_positionCalculation', {
      elementId,
      scaledWidth,
      scaledHeight,
      centerX,
      centerY,
      isCenterXValid: !isNaN(centerX) && isFinite(centerX),
      isCenterYValid: !isNaN(centerY) && isFinite(centerY)
    });

    setPosition({ x: centerX, y: centerY });
    
    log('ImageCropModal', 'imageLoaded_success', {
      elementId,
      naturalWidth,
      naturalHeight,
      frameWidth,
      frameHeight,
      initialScale,
      centerX,
      centerY,
      scaledWidth,
      scaledHeight
    });
  }, [placeholderDimensions, elementId]);

  // Handle zoom
  const handleZoom = useCallback((delta: number) => {
    const newScale = Math.max(0.1, Math.min(5, scale + delta));
    const { width: frameWidth, height: frameHeight } = placeholderDimensions;
    const validFrameWidth = typeof frameWidth === 'number' && frameWidth > 0 ? frameWidth : 384;
    const validFrameHeight = typeof frameHeight === 'number' && frameHeight > 0 ? frameHeight : 256;
    
    // Adjust position to zoom from center
    const centerX = validFrameWidth / 2;
    const centerY = validFrameHeight / 2;
    const scaleRatio = newScale / scale;
    
    const newX = centerX - (centerX - position.x) * scaleRatio;
    const newY = centerY - (centerY - position.y) * scaleRatio;
    
    setScale(newScale);
    setPosition({ x: newX, y: newY });
    
    log('ImageCropModal', 'zoom', {
      elementId,
      oldScale: scale,
      newScale,
      newPosition: { x: newX, y: newY },
      validFrameWidth,
      validFrameHeight
    });
  }, [scale, position, placeholderDimensions, elementId]);

  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      startX: position.x,
      startY: position.y
    });
    
    log('ImageCropModal', 'dragStart', {
      elementId,
      startPosition: position,
      mousePosition: { x: e.clientX, y: e.clientY }
    });
  }, [position, elementId]);

  // Handle drag move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    const newX = dragStart.startX + deltaX;
    const newY = dragStart.startY + deltaY;
    
    // Apply constraints to keep image within bounds
    const { width: frameWidth, height: frameHeight } = placeholderDimensions;
    const validFrameWidth = typeof frameWidth === 'number' && frameWidth > 0 ? frameWidth : 384;
    const validFrameHeight = typeof frameHeight === 'number' && frameHeight > 0 ? frameHeight : 256;
    
    const { width: imgWidth, height: imgHeight } = imageDimensions;
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;
    
    const minX = validFrameWidth - scaledWidth;
    const maxX = 0;
    const minY = validFrameHeight - scaledHeight;
    const maxY = 0;
    
    const constrainedX = Math.max(minX, Math.min(maxX, newX));
    const constrainedY = Math.max(minY, Math.min(maxY, newY));
    
    setPosition({ x: constrainedX, y: constrainedY });
  }, [isDragging, dragStart, scale, imageDimensions, placeholderDimensions]);

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    log('ImageCropModal', 'dragEnd', {
      elementId,
      finalPosition: position
    });
  }, [isDragging, position, elementId]);

  // Global mouse events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Generate cropped image
  const generateCroppedImage = useCallback(() => {
    log('ImageCropModal', 'generateCroppedImage_start', {
      elementId,
      hasCanvas: !!cropCanvasRef.current,
      hasImage: !!imageRef.current,
      imageLoaded,
      currentScale: scale,
      currentPosition: position,
      imageDimensions,
      placeholderDimensions
    });

    const canvas = cropCanvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) {
      log('ImageCropModal', 'generateCroppedImage_missingRequirements', {
        elementId,
        hasCanvas: !!canvas,
        hasImage: !!img,
        imageLoaded
      });
      return null;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      log('ImageCropModal', 'generateCroppedImage_noContext', { elementId });
      return null;
    }
    
    const { width: frameWidth, height: frameHeight } = placeholderDimensions;
    
    // Ensure we have valid numeric dimensions
    const validFrameWidth = typeof frameWidth === 'number' && frameWidth > 0 ? frameWidth : 384;
    const validFrameHeight = typeof frameHeight === 'number' && frameHeight > 0 ? frameHeight : 256;
    
    // Set canvas size to placeholder dimensions
    canvas.width = validFrameWidth;
    canvas.height = validFrameHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, validFrameWidth, validFrameHeight);
    
    // Calculate source rectangle (visible area of image)
    const { width: imgWidth, height: imgHeight } = imageDimensions;
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;
    
    log('ImageCropModal', 'generateCroppedImage_calculations', {
      elementId,
      imgWidth,
      imgHeight,
      scale,
      scaledWidth,
      scaledHeight,
      frameWidth,
      frameHeight,
      validFrameWidth,
      validFrameHeight,
      position
    });
    
    // Calculate which part of the image is visible in the crop frame
    const visibleLeft = Math.max(0, -position.x);
    const visibleTop = Math.max(0, -position.y);
    const visibleRight = Math.min(scaledWidth, validFrameWidth - position.x);
    const visibleBottom = Math.min(scaledHeight, validFrameHeight - position.y);
    
    const visibleWidth = visibleRight - visibleLeft;
    const visibleHeight = visibleBottom - visibleTop;
    
    log('ImageCropModal', 'generateCroppedImage_visibleArea', {
      elementId,
      visibleLeft,
      visibleTop,
      visibleRight,
      visibleBottom,
      visibleWidth,
      visibleHeight,
      isValid: visibleWidth > 0 && visibleHeight > 0
    });
    
    if (visibleWidth <= 0 || visibleHeight <= 0) {
      log('ImageCropModal', 'generateCroppedImage_invalidVisibleArea', {
        elementId,
        visibleWidth,
        visibleHeight
      });
      return null;
    }
    
    // Convert back to original image coordinates
    const sourceX = visibleLeft / scale;
    const sourceY = visibleTop / scale;
    const sourceWidth = visibleWidth / scale;
    const sourceHeight = visibleHeight / scale;
    
    // Calculate destination coordinates
    const destX = Math.max(0, position.x) + visibleLeft;
    const destY = Math.max(0, position.y) + visibleTop;
    
    log('ImageCropModal', 'generateCroppedImage_drawParams', {
      elementId,
      sourceRect: { x: sourceX, y: sourceY, width: sourceWidth, height: sourceHeight },
      destRect: { x: destX, y: destY, width: visibleWidth, height: visibleHeight }
    });
    
    // Draw the cropped portion
    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      destX, destY, visibleWidth, visibleHeight
    );
    
    const croppedImageData = canvas.toDataURL('image/png');
    
    log('ImageCropModal', 'generateCroppedImage_success', {
      elementId,
      frameSize: { width: frameWidth, height: frameHeight },
      validFrameSize: { width: validFrameWidth, height: validFrameHeight },
      sourceRect: { x: sourceX, y: sourceY, width: sourceWidth, height: sourceHeight },
      destRect: { x: destX, y: destY, width: visibleWidth, height: visibleHeight },
      scale,
      position,
      croppedDataLength: croppedImageData.length,
      croppedDataPrefix: croppedImageData.substring(0, 50) + '...'
    });
    
    return croppedImageData;
  }, [imageLoaded, placeholderDimensions, imageDimensions, scale, position, elementId]);

  // Handle crop confirm
  const handleCropConfirm = useCallback(() => {
    log('ImageCropModal', 'handleCropConfirm_start', {
      elementId,
      currentScale: scale,
      currentPosition: position,
      imageLoaded,
      hasImageRef: !!imageRef.current,
      hasCanvasRef: !!cropCanvasRef.current
    });

    const croppedImageData = generateCroppedImage();
    if (!croppedImageData) {
      log('ImageCropModal', 'handleCropConfirm_noCroppedData', { elementId });
      return;
    }
    
    const validFrameWidth = typeof placeholderDimensions.width === 'number' && placeholderDimensions.width > 0 ? placeholderDimensions.width : 384;
    const validFrameHeight = typeof placeholderDimensions.height === 'number' && placeholderDimensions.height > 0 ? placeholderDimensions.height : 256;
    
    const cropSettings: CropSettings = {
      x: position.x,
      y: position.y,
      width: validFrameWidth,
      height: validFrameHeight,
      scale
    };
    
    log('ImageCropModal', 'cropConfirm_success', {
      elementId,
      cropSettings,
      hascroppedImageData: !!croppedImageData,
      croppedDataLength: croppedImageData.length,
      croppedDataPrefix: croppedImageData.substring(0, 50) + '...'
    });
    
    onCropConfirm(croppedImageData, cropSettings);
  }, [generateCroppedImage, position, placeholderDimensions, scale, onCropConfirm, elementId, imageLoaded]);

  // Handle skip crop
  const handleSkipCrop = useCallback(() => {
    log('ImageCropModal', 'skipCrop', { elementId });
    onSkipCrop(imageUrl);
  }, [imageUrl, onSkipCrop, elementId]);

  if (!isOpen || !portalContainer) {
    return null;
  }

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center backdrop-blur-sm bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 p-6 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Crop Image</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Crop area */}
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-2">
              Preview crop area ({
                typeof placeholderDimensions.width === 'number' && placeholderDimensions.width > 0 ? placeholderDimensions.width : 384
              }×{
                typeof placeholderDimensions.height === 'number' && placeholderDimensions.height > 0 ? placeholderDimensions.height : 256
              }px)
              {!imageLoaded && localImageUrl && (
                <span className="ml-2 text-blue-600">Loading image...</span>
              )}
              {!localImageUrl && (
                <span className="ml-2 text-red-600">No image URL available</span>
              )}
            </div>
            
            <div
              ref={containerRef}
              className="relative border-2 border-gray-300 bg-gray-100 overflow-hidden cursor-move"
              style={{
                width: typeof placeholderDimensions.width === 'number' && placeholderDimensions.width > 0 ? placeholderDimensions.width : 384,
                height: typeof placeholderDimensions.height === 'number' && placeholderDimensions.height > 0 ? placeholderDimensions.height : 256,
                maxWidth: '100%',
                maxHeight: '400px'
              }}
              onMouseDown={handleMouseDown}
            >
              {localImageUrl && (
                <>
                  {log('ImageCropModal', 'renderingImage', {
                    elementId,
                    localImageUrl,
                    position,
                    scale,
                    isScaleValid: !isNaN(scale) && isFinite(scale)
                  })}
                  <img
                    ref={imageRef}
                    src={localImageUrl}
                    alt="Crop preview"
                    className="absolute pointer-events-none"
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                      transformOrigin: '0 0',
                      userSelect: 'none'
                    }}
                    onLoad={handleImageLoad}
                    draggable={false}
                  />
                </>
              )}
              
              {/* Crop frame overlay */}
              <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none">
                <div className="absolute inset-0 bg-blue-500 bg-opacity-10"></div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="w-full lg:w-64 space-y-4">
            {/* Zoom controls */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zoom: {(scale * 100).toFixed(0)}%
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleZoom(-0.1)}
                  className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
                  disabled={scale <= 0.1}
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={() => handleZoom(0.1)}
                  className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
                  disabled={scale >= 5}
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center space-x-2">
                <Move className="w-4 h-4" />
                <span>Click and drag to reposition</span>
              </div>
              <div>• Use zoom controls to resize</div>
              <div>• Blue area shows final crop</div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <button
                onClick={handleCropConfirm}
                disabled={!imageLoaded || isCropping}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCropping ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Crop className="w-4 h-4" />
                    <span>Crop Image</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleSkipCrop}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                <SkipForward className="w-4 h-4" />
                <span>Use Original (Stretch)</span>
              </button>
            </div>
            
            {/* Preview info */}
            {imageLoaded && (
              <div className="text-xs text-gray-500 space-y-1">
                <div>Original: {imageDimensions.width}×{imageDimensions.height}</div>
                <div>Target: {
                  typeof placeholderDimensions.width === 'number' && placeholderDimensions.width > 0 ? placeholderDimensions.width : 384
                }×{
                  typeof placeholderDimensions.height === 'number' && placeholderDimensions.height > 0 ? placeholderDimensions.height : 256
                }</div>
                <div>Scale: {(scale * 100).toFixed(0)}%</div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden canvas for cropping */}
        <canvas ref={cropCanvasRef} className="hidden" />
      </div>
    </div>
  );

  return createPortal(modalContent, portalContainer);
};

export default ImageCropModal;
