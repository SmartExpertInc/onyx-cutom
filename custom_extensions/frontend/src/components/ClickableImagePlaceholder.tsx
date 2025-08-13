'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ImageIcon, Replace, ZoomIn, ZoomOut, Check, X } from 'lucide-react';
import PresentationImageUpload from './PresentationImageUpload';
import Moveable from 'react-moveable';

// Debug logging utility
const DEBUG = typeof window !== 'undefined' && ((window as any).__MOVEABLE_DEBUG__ || true);
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
  // New props for integration
  elementId?: string;
  elementRef?: React.RefObject<HTMLDivElement | null>;
  cropMode?: 'cover' | 'contain' | 'fill';
  onCropModeChange?: (mode: 'cover' | 'contain' | 'fill') => void;
  // New prop for slide context
  slideContainerRef?: React.RefObject<HTMLElement | null>;
}

interface ImageEditState {
  isEditing: boolean;
  imageFile: File | null;
  imageUrl: string;
  scale: number;
  transform: string;
  imageDimensions: { width: number; height: number } | null;
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
  onCropModeChange,
  slideContainerRef
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [displayedImage, setDisplayedImage] = useState<string | undefined>(imagePath);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // New in-slide editing state
  const [editState, setEditState] = useState<ImageEditState>({
    isEditing: false,
    imageFile: null,
    imageUrl: '',
    scale: 1,
    transform: 'translate(0px, 0px) scale(1)',
    imageDimensions: null
  });

  const internalRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const editImageRef = useRef<HTMLImageElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Use provided ref or internal ref
  const containerRef = elementRef || internalRef;

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

  // Keep local displayed image in sync with prop
  useEffect(() => {
    if (imagePath) {
      setDisplayedImage(imagePath);
    }
  }, [imagePath]);

  const handleClick = () => {
    if (!isEditable) return;
    if (displayedImage) {
      // If image exists, show replace options
      setShowUploadModal(true);
    } else {
      // If no image, show upload modal
      setShowUploadModal(true);
    }
  };

  // Start in-slide editing when image is uploaded
  const handleImageUploaded = (newImagePath: string, imageFile?: File) => {
    log('ClickableImagePlaceholder', 'handleImageUploaded', {
      elementId,
      newImagePath,
      hasImageFile: !!imageFile,
      imageFileName: imageFile?.name
    });

    setShowUploadModal(false);
    
    if (imageFile) {
      // Start in-slide editing mode
      startInSlideEditing(imageFile, newImagePath);
    } else {
      // Direct upload without editing
      finalizeImageUpload(newImagePath);
    }
  };

  // Start the in-slide editing experience
  const startInSlideEditing = (imageFile: File, serverUrl: string) => {
    log('ClickableImagePlaceholder', 'startInSlideEditing', {
      elementId,
      fileName: imageFile.name,
      serverUrl
    });

    const objectUrl = URL.createObjectURL(imageFile);
    
    setEditState({
      isEditing: true,
      imageFile,
      imageUrl: objectUrl,
      scale: 1,
      transform: 'translate(0px, 0px) scale(1)',
      imageDimensions: null
    });

    // Add overlay to body to prevent interaction with rest of slide
    document.body.style.overflow = 'hidden';
  };

  // Handle image load in edit mode
  const handleEditImageLoad = useCallback(() => {
    const img = editImageRef.current;
    if (!img || !containerRef.current) return;

    const { naturalWidth, naturalHeight } = img;
    const containerRect = containerRef.current.getBoundingClientRect();
    
    setEditState(prev => ({
      ...prev,
      imageDimensions: { width: naturalWidth, height: naturalHeight }
    }));

    // Auto-fit image to fill the placeholder
    const scaleX = containerRect.width / naturalWidth;
    const scaleY = containerRect.height / naturalHeight;
    const initialScale = Math.max(scaleX, scaleY, 0.1); // Cover the placeholder
    
    const scaledWidth = naturalWidth * initialScale;
    const scaledHeight = naturalHeight * initialScale;
    const centerX = (containerRect.width - scaledWidth) / 2;
    const centerY = (containerRect.height - scaledHeight) / 2;
    
    const initialTransform = `translate(${centerX}px, ${centerY}px) scale(${initialScale})`;
    
    setEditState(prev => ({
      ...prev,
      scale: initialScale,
      transform: initialTransform
    }));

    log('ClickableImagePlaceholder', 'editImageAutoFit', {
      elementId,
      naturalWidth,
      naturalHeight,
      containerRect: { width: containerRect.width, height: containerRect.height },
      initialScale,
      centerX,
      centerY
    });
  }, [elementId, containerRef]);

  // Handle zoom in edit mode
  const handleZoom = useCallback((delta: number) => {
    setEditState(prev => {
      const newScale = Math.max(0.1, Math.min(5, prev.scale + delta));
      
      // Extract current translation from transform
      const transformMatch = prev.transform.match(/translate\(([^)]+)\) scale\(([^)]+)\)/);
      if (transformMatch && containerRef.current) {
        const [, translate] = transformMatch;
        const [x, y] = translate.split(',').map(v => parseFloat(v.replace('px', '')));
        
        // Zoom towards center of placeholder
        const containerRect = containerRef.current.getBoundingClientRect();
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;
        const scaleRatio = newScale / prev.scale;
        
        const newX = centerX - (centerX - x) * scaleRatio;
        const newY = centerY - (centerY - y) * scaleRatio;
        
        const newTransform = `translate(${newX}px, ${newY}px) scale(${newScale})`;
        
        return {
          ...prev,
          scale: newScale,
          transform: newTransform
        };
      }
      
      return prev;
    });
  }, [containerRef]);

  // Cancel editing mode
  const cancelEdit = useCallback(() => {
    if (editState.imageUrl) {
      URL.revokeObjectURL(editState.imageUrl);
    }
    
    setEditState({
      isEditing: false,
      imageFile: null,
      imageUrl: '',
      scale: 1,
      transform: 'translate(0px, 0px) scale(1)',
      imageDimensions: null
    });

    // Restore body scroll
    document.body.style.overflow = '';
  }, [editState.imageUrl]);

  // Finalize image upload
  const finalizeImageUpload = useCallback(async (imagePath: string) => {
    onImageUploaded(imagePath);
    setDisplayedImage(imagePath);
    
    // Load image to get dimensions
    const tmp = new Image();
    tmp.onload = () => {
      const imgW = tmp.naturalWidth || tmp.width;
      const imgH = tmp.naturalHeight || tmp.height;
      
      if (imgW > 0 && imgH > 0) {
        setImageDimensions({ width: imgW, height: imgH });
        
        onSizeTransformChange?.({
          objectFit: cropMode,
          imageScale: 1,
          imageOffset: { x: 0, y: 0 }
        });
      }
    };
    tmp.src = imagePath;
  }, [onImageUploaded, onSizeTransformChange, cropMode]);

  // Generate and finalize cropped image
  const confirmEdit = useCallback(async () => {
    if (!editState.imageFile || !editState.imageDimensions || !containerRef.current) {
      console.error('Missing required data for confirmation:', {
        hasImageFile: !!editState.imageFile,
        hasImageDimensions: !!editState.imageDimensions,
        hasContainerRef: !!containerRef.current
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const canvas = cropCanvasRef.current;
      if (!canvas) throw new Error('Canvas not available');

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Set canvas to placeholder dimensions for high quality
      canvas.width = containerRect.width;
      canvas.height = containerRect.height;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Parse transform - handle both translate(x, y) scale(z) and matrix formats
      let x = 0, y = 0, currentScale = 1;
      
      if (editState.transform.includes('translate')) {
        const transformMatch = editState.transform.match(/translate\(([^)]+)\) scale\(([^)]+)\)/);
        if (transformMatch) {
          const [, translate, scaleStr] = transformMatch;
          [x, y] = translate.split(',').map(v => parseFloat(v.replace('px', '')));
          currentScale = parseFloat(scaleStr);
        }
      } else if (editState.transform.includes('matrix')) {
        // Handle matrix transform format
        const matrixMatch = editState.transform.match(/matrix\(([^)]+)\)/);
        if (matrixMatch) {
          const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()));
          currentScale = values[0]; // scaleX
          x = values[4]; // translateX
          y = values[5]; // translateY
        }
      }
      
      // Load image for drawing
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        try {
          const { width: imgWidth, height: imgHeight } = editState.imageDimensions!;
          const scaledWidth = imgWidth * currentScale;
          const scaledHeight = imgHeight * currentScale;
          
          // Calculate what's visible in the placeholder
          const visibleLeft = Math.max(0, -x);
          const visibleTop = Math.max(0, -y);
          const visibleRight = Math.min(scaledWidth, containerRect.width - x);
          const visibleBottom = Math.min(scaledHeight, containerRect.height - y);
          
          const visibleWidth = visibleRight - visibleLeft;
          const visibleHeight = visibleBottom - visibleTop;
          
          if (visibleWidth > 0 && visibleHeight > 0) {
            // Map back to original image coordinates
            const sourceX = visibleLeft / currentScale;
            const sourceY = visibleTop / currentScale;
            const sourceWidth = visibleWidth / currentScale;
            const sourceHeight = visibleHeight / currentScale;
            
            // Draw to canvas
            const destX = Math.max(0, x) + visibleLeft;
            const destY = Math.max(0, y) + visibleTop;
            
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            ctx.drawImage(
              img,
              sourceX, sourceY, sourceWidth, sourceHeight,
              destX, destY, visibleWidth, visibleHeight
            );
          }
          
          // Convert to blob and upload
          canvas.toBlob(async (blob) => {
            if (!blob) {
              throw new Error('Failed to create blob from canvas');
            }
            
            const croppedFile = new File([blob], 'cropped-image.png', { type: 'image/png' });
            
            // Upload the cropped file
            const { uploadPresentationImage } = await import('../lib/designTemplateApi');
            const result = await uploadPresentationImage(croppedFile);
            
            if (result.file_path) {
              await finalizeImageUpload(result.file_path);
              cancelEdit();
            } else {
              throw new Error('Upload failed - no file path returned');
            }
            
            setIsProcessing(false);
          }, 'image/png', 1.0);
          
        } catch (error) {
          console.error('Error in image processing:', error);
          setIsProcessing(false);
        }
      };
      
      img.onerror = (error) => {
        console.error('Error loading image for processing:', error);
        setIsProcessing(false);
      };
      
      img.src = editState.imageUrl;
      
    } catch (error) {
      console.error('Error in confirmEdit:', error);
      setIsProcessing(false);
    }
  }, [editState, containerRef, finalizeImageUpload, cancelEdit]);

  // If we're in editing mode, render the overlay
  if (editState.isEditing) {
    return (
      <>
        {/* Dark overlay covering only the slide */}
        {slideContainerRef?.current && (
          <div 
            className="absolute inset-0 z-[99998] bg-black bg-opacity-75 flex items-center justify-center"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99998
            }}
          >
            <div className="text-white text-center">
              <h3 className="text-xl font-semibold mb-4">Position Your Image</h3>
              <p className="text-sm opacity-75">Drag and scale the image to fit perfectly in your placeholder</p>
            </div>
          </div>
        )}

        {/* Image editing container - positioned over the actual placeholder */}
        <div
          className="relative overflow-hidden"
          style={{
            ...style,
            zIndex: 99999,
            position: 'relative'
          }}
        >
          {editState.imageUrl && (
            <>
              <img
                ref={editImageRef}
                src={editState.imageUrl}
                alt="Editing"
                className="absolute"
                style={{
                  transform: editState.transform,
                  transformOrigin: '0 0',
                  userSelect: 'none',
                  maxWidth: 'none',
                  maxHeight: 'none',
                  pointerEvents: 'auto',
                  cursor: 'move'
                }}
                onLoad={handleEditImageLoad}
                draggable={false}
              />
              
              {/* React-moveable for smooth interaction */}
              {editState.imageDimensions && (
                <Moveable
                  target={editImageRef.current}
                  draggable={true}
                  scalable={true}
                  keepRatio={false}
                  throttleDrag={0}
                  throttleScale={0}
                  onDrag={({ transform }) => {
                    log('Moveable', 'onDrag', { transform });
                    setEditState(prev => ({ ...prev, transform }));
                  }}
                  onScale={({ transform, scale }) => {
                    log('Moveable', 'onScale', { transform, scale });
                    setEditState(prev => ({ 
                      ...prev, 
                      transform,
                      scale: scale[0]
                    }));
                  }}
                  onDragStart={({ target }) => {
                    log('Moveable', 'onDragStart', { target });
                  }}
                  onScaleStart={({ target }) => {
                    log('Moveable', 'onScaleStart', { target });
                  }}
                  renderDirections={["nw","n","ne","w","e","sw","s","se"]}
                  snappable={false}
                  isDisplaySnapDigit={false}
                  snapDist={0}
                  snapThreshold={0}
                />
              )}
            </>
          )}
          
          {/* Placeholder border to show crop area */}
          <div className="absolute inset-0 border-4 border-blue-500 pointer-events-none">
            <div className="absolute inset-0 border-2 border-white shadow-lg"></div>
            {/* Corner indicators */}
            <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-blue-600"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-blue-600"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-blue-600"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-blue-600"></div>
          </div>
        </div>

        {/* Floating controls positioned relative to slide */}
        <div 
          className="absolute z-[99999] bg-white rounded-lg shadow-xl p-4 flex items-center space-x-4"
          style={{
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          {/* Zoom controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleZoom(-0.1)}
              className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
              disabled={editState.scale <= 0.1}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={editState.scale}
              onChange={(e) => {
                const newScale = parseFloat(e.target.value);
                const transformMatch = editState.transform.match(/translate\(([^)]+)\) scale\(([^)]+)\)/);
                if (transformMatch) {
                  const [, translate] = transformMatch;
                  const newTransform = `translate(${translate}) scale(${newScale})`;
                  setEditState(prev => ({ ...prev, scale: newScale, transform: newTransform }));
                }
              }}
              className="w-32"
            />
            <button
              onClick={() => handleZoom(0.1)}
              className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
              disabled={editState.scale >= 5}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="text-sm text-gray-600">
            {(editState.scale * 100).toFixed(0)}%
          </div>

          <div className="border-l border-gray-300 h-8"></div>

          {/* Action buttons */}
          <button
            onClick={cancelEdit}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          
          <button
            onClick={() => {
              console.log('Confirm button clicked, editState:', editState);
              confirmEdit();
            }}
            disabled={isProcessing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Confirm</span>
              </>
            )}
          </button>
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={cropCanvasRef} className="hidden" />
      </>
    );
  }

  // Regular image display
  if (displayedImage) {
    return (
      <>
        <div
          ref={containerRef}
          data-moveable-element={elementId}
          className={`
            ${positionClasses[position]}
            relative overflow-hidden rounded-lg
            ${isEditable ? 'group cursor-pointer hover:ring-2 hover:ring-blue-400' : ''}
            ${className}
          `}
          style={{
            ...(style || {}),
          }}
          onClick={handleClick}
        >
          <img
            ref={imgRef}
            src={displayedImage}
            alt="Uploaded content"
            className="w-full h-full object-cover"
            style={{
              objectFit: cropMode
            }}
          />
          
          {/* Replace overlay on hover */}
          {isEditable && (
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-white text-center">
                <Replace className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Replace Image</div>
              </div>
            </div>
          )}
        </div>

        {/* React-moveable for the image container */}
        {isEditable && containerRef.current && (
          <Moveable
            target={containerRef.current}
            draggable={true}
            throttleDrag={1}
            edgeDraggable={false}
            onDrag={e => {
              e.target.style.transform = e.transform;
            }}
            resizable={true}
            keepRatio={false}
            throttleResize={1}
            renderDirections={["nw","n","ne","w","e","sw","s","se"]}
            onResize={e => {
              e.target.style.width = `${e.width}px`;
              e.target.style.height = `${e.height}px`;
              e.target.style.transform = e.drag.transform;
            }}
          />
        )}

        <PresentationImageUpload
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onImageUploaded={handleImageUploaded}
          title="Replace Image"
        />
      </>
    );
  }

  // Placeholder when no image
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
        }}
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

      {/* React-moveable for placeholder */}
      {isEditable && containerRef.current && (
        <Moveable
          target={containerRef.current}
          draggable={true}
          throttleDrag={1}
          edgeDraggable={false}
          onDrag={e => {
            e.target.style.transform = e.transform;
          }}
          resizable={true}
          keepRatio={false}
          throttleResize={1}
          renderDirections={["nw","n","ne","w","e","sw","s","se"]}
          onResize={e => {
            e.target.style.width = `${e.width}px`;
            e.target.style.height = `${e.height}px`;
            e.target.style.transform = e.drag.transform;
          }}
        />
      )}

      <PresentationImageUpload
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onImageUploaded={handleImageUploaded}
        title="Upload Image"
      />
    </>
  );
};

export default ClickableImagePlaceholder;