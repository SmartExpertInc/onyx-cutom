'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Move, ZoomIn, ZoomOut, Crop, SkipForward } from 'lucide-react';

// Debug logging utility
const DEBUG = typeof window !== 'undefined' && (window as any).__MOVEABLE_DEBUG__;
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
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  imageFile,
  imageUrl,
  placeholderDimensions,
  onCropConfirm,
  onSkipCrop,
  elementId
}) => {
  // Modal state
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  
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
    imageLoaded,
    placeholderDimensions,
    scale,
    position
  });

  // Create portal container
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPortalContainer(document.body);
    }
  }, []);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setImageLoaded(false);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
      log('ImageCropModal', 'modalClosed_resetState', { elementId });
    }
  }, [isOpen, elementId]);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;
    
    const { naturalWidth, naturalHeight } = img;
    setImageDimensions({ width: naturalWidth, height: naturalHeight });
    setImageLoaded(true);
    
    // Calculate initial scale to fit image in crop frame
    const { width: frameWidth, height: frameHeight } = placeholderDimensions;
    const scaleX = frameWidth / naturalWidth;
    const scaleY = frameHeight / naturalHeight;
    const initialScale = Math.max(scaleX, scaleY, 0.1); // Ensure minimum scale
    
    setScale(initialScale);
    
    // Center the image
    const scaledWidth = naturalWidth * initialScale;
    const scaledHeight = naturalHeight * initialScale;
    const centerX = (frameWidth - scaledWidth) / 2;
    const centerY = (frameHeight - scaledHeight) / 2;
    setPosition({ x: centerX, y: centerY });
    
    log('ImageCropModal', 'imageLoaded', {
      elementId,
      naturalWidth,
      naturalHeight,
      frameWidth,
      frameHeight,
      initialScale,
      centerX,
      centerY
    });
  }, [placeholderDimensions, elementId]);

  // Handle zoom
  const handleZoom = useCallback((delta: number) => {
    const newScale = Math.max(0.1, Math.min(5, scale + delta));
    const { width: frameWidth, height: frameHeight } = placeholderDimensions;
    
    // Adjust position to zoom from center
    const centerX = frameWidth / 2;
    const centerY = frameHeight / 2;
    const scaleRatio = newScale / scale;
    
    const newX = centerX - (centerX - position.x) * scaleRatio;
    const newY = centerY - (centerY - position.y) * scaleRatio;
    
    setScale(newScale);
    setPosition({ x: newX, y: newY });
    
    log('ImageCropModal', 'zoom', {
      elementId,
      oldScale: scale,
      newScale,
      newPosition: { x: newX, y: newY }
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
    const { width: imgWidth, height: imgHeight } = imageDimensions;
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;
    
    const minX = frameWidth - scaledWidth;
    const maxX = 0;
    const minY = frameHeight - scaledHeight;
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
    const canvas = cropCanvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) return null;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    const { width: frameWidth, height: frameHeight } = placeholderDimensions;
    
    // Set canvas size to placeholder dimensions
    canvas.width = frameWidth;
    canvas.height = frameHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, frameWidth, frameHeight);
    
    // Calculate source rectangle (visible area of image)
    const { width: imgWidth, height: imgHeight } = imageDimensions;
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;
    
    // Calculate which part of the image is visible in the crop frame
    const visibleLeft = Math.max(0, -position.x);
    const visibleTop = Math.max(0, -position.y);
    const visibleRight = Math.min(scaledWidth, frameWidth - position.x);
    const visibleBottom = Math.min(scaledHeight, frameHeight - position.y);
    
    const visibleWidth = visibleRight - visibleLeft;
    const visibleHeight = visibleBottom - visibleTop;
    
    if (visibleWidth <= 0 || visibleHeight <= 0) return null;
    
    // Convert back to original image coordinates
    const sourceX = visibleLeft / scale;
    const sourceY = visibleTop / scale;
    const sourceWidth = visibleWidth / scale;
    const sourceHeight = visibleHeight / scale;
    
    // Calculate destination coordinates
    const destX = Math.max(0, position.x) + visibleLeft;
    const destY = Math.max(0, position.y) + visibleTop;
    
    // Draw the cropped portion
    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      destX, destY, visibleWidth, visibleHeight
    );
    
    const croppedImageData = canvas.toDataURL('image/png');
    
    log('ImageCropModal', 'generateCroppedImage', {
      elementId,
      frameSize: { width: frameWidth, height: frameHeight },
      sourceRect: { x: sourceX, y: sourceY, width: sourceWidth, height: sourceHeight },
      destRect: { x: destX, y: destY, width: visibleWidth, height: visibleHeight },
      scale,
      position
    });
    
    return croppedImageData;
  }, [imageLoaded, placeholderDimensions, imageDimensions, scale, position, elementId]);

  // Handle crop confirm
  const handleCropConfirm = useCallback(() => {
    const croppedImageData = generateCroppedImage();
    if (!croppedImageData) return;
    
    const cropSettings: CropSettings = {
      x: position.x,
      y: position.y,
      width: placeholderDimensions.width,
      height: placeholderDimensions.height,
      scale
    };
    
    log('ImageCropModal', 'cropConfirm', {
      elementId,
      cropSettings,
      hascroppedImageData: !!croppedImageData
    });
    
    onCropConfirm(croppedImageData, cropSettings);
  }, [generateCroppedImage, position, placeholderDimensions, scale, onCropConfirm, elementId]);

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
              Preview crop area ({placeholderDimensions.width}×{placeholderDimensions.height}px)
            </div>
            
            <div
              ref={containerRef}
              className="relative border-2 border-gray-300 bg-gray-100 overflow-hidden cursor-move"
              style={{
                width: placeholderDimensions.width,
                height: placeholderDimensions.height,
                maxWidth: '100%',
                maxHeight: '400px'
              }}
              onMouseDown={handleMouseDown}
            >
              {imageUrl && (
                <img
                  ref={imageRef}
                  src={imageUrl}
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
                disabled={!imageLoaded}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Crop className="w-4 h-4" />
                <span>Crop Image</span>
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
                <div>Target: {placeholderDimensions.width}×{placeholderDimensions.height}</div>
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
