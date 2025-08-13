'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Move, ZoomIn, ZoomOut, Crop, SkipForward } from 'lucide-react';
import Moveable from 'react-moveable';

// Debug logging utility
const DEBUG = typeof window !== 'undefined' && ((window as any).__MOVEABLE_DEBUG__ || true);
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
  
  // Crop controls with better initial values
  const [scale, setScale] = useState(1);
  const [imageTransform, setImageTransform] = useState('translate(0px, 0px) scale(1)');
  
  // Refs
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Calculate proper preview dimensions based on actual placeholder
  const getPreviewDimensions = useCallback(() => {
    const { width: targetWidth, height: targetHeight } = placeholderDimensions;
    const validWidth = typeof targetWidth === 'number' && targetWidth > 0 ? targetWidth : 384;
    const validHeight = typeof targetHeight === 'number' && targetHeight > 0 ? targetHeight : 256;
    
    // Maximum preview size for UI
    const maxPreviewWidth = 600;
    const maxPreviewHeight = 400;
    
    // Calculate scale to fit in preview area while maintaining aspect ratio
    const scaleX = maxPreviewWidth / validWidth;
    const scaleY = maxPreviewHeight / validHeight;
    const previewScale = Math.min(scaleX, scaleY, 1); // Don't scale up
    
    const previewWidth = validWidth * previewScale;
    const previewHeight = validHeight * previewScale;
    
    log('ImageCropModal', 'previewDimensionsCalculated', {
      elementId,
      targetWidth,
      targetHeight,
      validWidth,
      validHeight,
      previewScale,
      previewWidth,
      previewHeight
    });
    
    return {
      width: previewWidth,
      height: previewHeight,
      targetWidth: validWidth,
      targetHeight: validHeight,
      scale: previewScale
    };
  }, [placeholderDimensions, elementId]);

  const previewDimensions = getPreviewDimensions();

  log('ImageCropModal', 'render', {
    isOpen,
    elementId,
    hasImageFile: !!imageFile,
    imageLoaded,
    placeholderDimensions,
    previewDimensions,
    scale,
    imageTransform
  });

  // Create portal container
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPortalContainer(document.body);
    }
  }, []);

  // Create local URL from File for preview
  useEffect(() => {
    if (imageFile && isOpen) {
      // Always create a new URL when modal opens with a new file
      if (localImageUrl) {
        URL.revokeObjectURL(localImageUrl);
        log('ImageCropModal', 'revokedLocalUrl_forNewFile', { elementId, oldUrl: localImageUrl });
      }
      
      const url = URL.createObjectURL(imageFile);
      setLocalImageUrl(url);
      
      log('ImageCropModal', 'createdLocalUrl', { 
        elementId, 
        imageFileName: imageFile.name,
        imageFileSize: imageFile.size,
        imageFileType: imageFile.type,
        localUrl: url
      });
    }
  }, [imageFile, isOpen, elementId]);

  // Cleanup blob URL
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
    if (!isOpen) {
      if (localImageUrl) {
        URL.revokeObjectURL(localImageUrl);
        log('ImageCropModal', 'revokedLocalUrl_modalClose', { elementId, url: localImageUrl });
      }
      
      setImageLoaded(false);
      setScale(1);
      setImageTransform('translate(0px, 0px) scale(1)');
      setLocalImageUrl('');
      log('ImageCropModal', 'modalClosed_resetState', { elementId });
    }
  }, [isOpen, elementId]);

  // Handle image load and auto-fit
  const handleImageLoad = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;
    
    const { naturalWidth, naturalHeight } = img;
    if (naturalWidth <= 0 || naturalHeight <= 0) return;

    setImageDimensions({ width: naturalWidth, height: naturalHeight });
    setImageLoaded(true);
    
    // Calculate initial scale to fit image nicely in crop frame
    const { width: frameWidth, height: frameHeight, targetWidth, targetHeight } = previewDimensions;
    
    // Scale to cover the crop area (ensure no empty space)
    const scaleX = targetWidth / naturalWidth;
    const scaleY = targetHeight / naturalHeight;
    const initialScale = Math.max(scaleX, scaleY, 0.1);
    
    // Center the image
    const scaledWidth = naturalWidth * initialScale;
    const scaledHeight = naturalHeight * initialScale;
    const centerX = (targetWidth - scaledWidth) / 2;
    const centerY = (targetHeight - scaledHeight) / 2;
    
    const initialTransform = `translate(${centerX}px, ${centerY}px) scale(${initialScale})`;
    
    setScale(initialScale);
    setImageTransform(initialTransform);
    
    log('ImageCropModal', 'imageLoaded_autoFit', {
      elementId,
      naturalWidth,
      naturalHeight,
      frameWidth,
      frameHeight,
      targetWidth,
      targetHeight,
      initialScale,
      centerX,
      centerY,
      initialTransform
    });
  }, [previewDimensions, elementId]);

  // Handle zoom with proper centering
  const handleZoom = useCallback((delta: number) => {
    const newScale = Math.max(0.1, Math.min(5, scale + delta));
    
    // Extract current translation and scale from transform
    const transformMatch = imageTransform.match(/translate\(([^)]+)\) scale\(([^)]+)\)/);
    if (transformMatch) {
      const [, translate, currentScale] = transformMatch;
      const [x, y] = translate.split(',').map(v => parseFloat(v.replace('px', '')));
      
      // Zoom towards center of crop area
      const { targetWidth, targetHeight } = previewDimensions;
      const centerX = targetWidth / 2;
      const centerY = targetHeight / 2;
      const scaleRatio = newScale / parseFloat(currentScale);
      
      const newX = centerX - (centerX - x) * scaleRatio;
      const newY = centerY - (centerY - y) * scaleRatio;
      
      const newTransform = `translate(${newX}px, ${newY}px) scale(${newScale})`;
      setScale(newScale);
      setImageTransform(newTransform);
      
      log('ImageCropModal', 'zoom', {
        elementId,
        oldScale: parseFloat(currentScale),
        newScale,
        newTransform
      });
    }
  }, [scale, imageTransform, previewDimensions, elementId]);

  // Generate high-quality cropped image
  const generateCroppedImage = useCallback(() => {
    const canvas = cropCanvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) return null;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    const { targetWidth, targetHeight } = previewDimensions;
    
    // Set canvas to target dimensions (full resolution)
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, targetWidth, targetHeight);
    
    // Parse current transform
    const transformMatch = imageTransform.match(/translate\(([^)]+)\) scale\(([^)]+)\)/);
    if (!transformMatch) return null;
    
    const [, translate, scaleStr] = transformMatch;
    const [x, y] = translate.split(',').map(v => parseFloat(v.replace('px', '')));
    const currentScale = parseFloat(scaleStr);
    
    // Calculate the area of the original image that's visible in the crop frame
    const { width: imgWidth, height: imgHeight } = imageDimensions;
    const scaledWidth = imgWidth * currentScale;
    const scaledHeight = imgHeight * currentScale;
    
    // Map crop area back to original image coordinates
    const visibleLeft = Math.max(0, -x);
    const visibleTop = Math.max(0, -y);
    const visibleRight = Math.min(scaledWidth, targetWidth - x);
    const visibleBottom = Math.min(scaledHeight, targetHeight - y);
    
    const visibleWidth = visibleRight - visibleLeft;
    const visibleHeight = visibleBottom - visibleTop;
    
    if (visibleWidth <= 0 || visibleHeight <= 0) return null;
    
    // Convert back to original image coordinates
    const sourceX = visibleLeft / currentScale;
    const sourceY = visibleTop / currentScale;
    const sourceWidth = visibleWidth / currentScale;
    const sourceHeight = visibleHeight / currentScale;
    
    // Calculate destination coordinates
    const destX = Math.max(0, x) + visibleLeft;
    const destY = Math.max(0, y) + visibleTop;
    
    log('ImageCropModal', 'generateCroppedImage', {
      elementId,
      targetSize: { width: targetWidth, height: targetHeight },
      sourceRect: { x: sourceX, y: sourceY, width: sourceWidth, height: sourceHeight },
      destRect: { x: destX, y: destY, width: visibleWidth, height: visibleHeight },
      currentScale,
      transform: imageTransform
    });
    
    // Use high-quality settings
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw the cropped portion at full resolution
    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      destX, destY, visibleWidth, visibleHeight
    );
    
    return canvas.toDataURL('image/png');
  }, [imageLoaded, previewDimensions, imageDimensions, imageTransform, elementId]);

  // Handle crop confirm
  const handleCropConfirm = useCallback(() => {
    const croppedImageData = generateCroppedImage();
    if (!croppedImageData) return;
    
    const { targetWidth, targetHeight } = previewDimensions;
    
    // Parse transform for crop settings
    const transformMatch = imageTransform.match(/translate\(([^)]+)\) scale\(([^)]+)\)/);
    const [, translate, scaleStr] = transformMatch || ['', '0px, 0px', '1'];
    const [x, y] = translate.split(',').map(v => parseFloat(v.replace('px', '')));
    const currentScale = parseFloat(scaleStr);
    
    const cropSettings: CropSettings = {
      x,
      y,
      width: targetWidth,
      height: targetHeight,
      scale: currentScale
    };
    
    log('ImageCropModal', 'cropConfirm', {
      elementId,
      cropSettings,
      hascroppedImageData: !!croppedImageData
    });
    
    onCropConfirm(croppedImageData, cropSettings);
  }, [generateCroppedImage, previewDimensions, imageTransform, onCropConfirm, elementId]);

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
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 p-6 max-h-[95vh] overflow-auto">
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
            <div className="text-sm text-gray-600 mb-4">
              <div className="font-medium text-blue-600 mb-1">
                📐 Crop Preview Area ({previewDimensions.targetWidth}×{previewDimensions.targetHeight}px)
              </div>
              <div className="text-xs text-gray-500">
                The blue border shows exactly what will appear in your slide
              </div>
              {!imageLoaded && localImageUrl && (
                <span className="ml-2 text-blue-600">🔄 Loading image...</span>
              )}
              {!localImageUrl && (
                <span className="ml-2 text-red-600">❌ No image URL available</span>
              )}
            </div>
            
            <div className="flex justify-center">
              <div
                ref={containerRef}
                className="relative border-4 border-blue-500 bg-gray-100 overflow-hidden"
                style={{
                  width: previewDimensions.width,
                  height: previewDimensions.height,
                  boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3), inset 0 0 0 1px rgba(59, 130, 246, 0.2)'
                }}
              >
                {localImageUrl && imageLoaded && (
                  <>
                    <img
                      ref={imageRef}
                      src={localImageUrl}
                      alt="Crop preview"
                      className="absolute pointer-events-none"
                      style={{
                        transform: imageTransform,
                        transformOrigin: '0 0',
                        userSelect: 'none',
                        maxWidth: 'none',
                        maxHeight: 'none'
                      }}
                      onLoad={handleImageLoad}
                      onError={(e) => {
                        log('ImageCropModal', 'imageLoadError', {
                          elementId,
                          src: e.currentTarget.src
                        });
                      }}
                      draggable={false}
                    />
                    
                    {/* React-moveable for smooth interaction */}
                    <Moveable
                      target={imageRef.current}
                      draggable={true}
                      scalable={true}
                      keepRatio={false}
                      throttleDrag={0}
                      throttleScale={0}
                      onDrag={({ target, transform }) => {
                        setImageTransform(transform);
                        log('ImageCropModal', 'moveable_drag', {
                          elementId,
                          transform
                        });
                      }}
                      onScale={({ target, transform, scale }) => {
                        setImageTransform(transform);
                        setScale(scale[0]); // Assuming uniform scaling
                        log('ImageCropModal', 'moveable_scale', {
                          elementId,
                          transform,
                          scale: scale[0]
                        });
                      }}
                      renderDirections={["nw","n","ne","w","e","sw","s","se"]}
                    />
                  </>
                )}
                
                {localImageUrl && !imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <div>Loading image...</div>
                    </div>
                  </div>
                )}
                
                {!localImageUrl && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                    <div className="text-center">
                      <div className="text-lg mb-2">📷</div>
                      <div>No image loaded</div>
                    </div>
                  </div>
                )}
                
                {/* Corner indicators for crop area */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border-2 border-white shadow-lg"></div>
                  <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-blue-600"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-blue-600"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-blue-600"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-blue-600"></div>
                </div>
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
                  onChange={(e) => {
                    const newScale = parseFloat(e.target.value);
                    const transformMatch = imageTransform.match(/translate\(([^)]+)\) scale\(([^)]+)\)/);
                    if (transformMatch) {
                      const [, translate] = transformMatch;
                      const newTransform = `translate(${translate}) scale(${newScale})`;
                      setScale(newScale);
                      setImageTransform(newTransform);
                    }
                  }}
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
            <div className="text-sm text-gray-600 space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-medium text-blue-800">How to crop:</div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Move className="w-4 h-4 text-blue-600" />
                  <span>Drag the image to reposition</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ZoomIn className="w-4 h-4 text-blue-600" />
                  <span>Drag corners to resize</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-600 rounded-sm"></div>
                  <span>Blue border = final crop area</span>
                </div>
              </div>
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
                    <span>Processing...</span>
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
                <span>Use Original</span>
              </button>
            </div>
            
            {/* Preview info */}
            {imageLoaded && (
              <div className="text-xs text-gray-500 space-y-1 p-2 bg-gray-50 rounded">
                <div>Original: {imageDimensions.width}×{imageDimensions.height}</div>
                <div>Target: {previewDimensions.targetWidth}×{previewDimensions.targetHeight}</div>
                <div>Preview: {previewDimensions.width}×{previewDimensions.height}</div>
                <div>Scale: {(scale * 100).toFixed(0)}%</div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden canvases for processing */}
        <canvas ref={cropCanvasRef} className="hidden" />
        <canvas ref={previewCanvasRef} className="hidden" />
      </div>
    </div>
  );

  return createPortal(modalContent, portalContainer);
};

export default ImageCropModal;