'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ImageIcon, Replace } from 'lucide-react';
import PresentationImageUpload from './PresentationImageUpload';
import Moveable from 'react-moveable';
import ImageEditModal from './ImageEditModal';

// Enhanced debug logging utility
const DEBUG = typeof window !== 'undefined' && ((window as any).__MOVEABLE_DEBUG__ || true);
const log = (source: string, event: string, data: any) => {
  if (DEBUG) {
    console.log(`[ImageEdit] ${source} | ${event}`, { 
      ts: Date.now(), 
      ...data 
    });
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
  // Saved position and size for persistence
  savedImagePosition?: { x: number; y: number };
  savedImageSize?: { width: number; height: number };
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
  slideContainerRef,
  savedImagePosition,
  savedImageSize
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [displayedImage, setDisplayedImage] = useState<string | undefined>(imagePath);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  
  // Modal state
  const [showImageEditModal, setShowImageEditModal] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  
  // Hover state for Moveable anchors visibility
  const [isHovered, setIsHovered] = useState(false);
  
  // Drag state to prevent hover changes during active dragging
  const [isDragging, setIsDragging] = useState(false);

  const internalRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
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

  // Apply saved position and size when component mounts or saved values change
  useEffect(() => {
    if (containerRef.current && (savedImagePosition || savedImageSize)) {
      const element = containerRef.current;
      
      log('ClickableImagePlaceholder', 'applySavedState_start', {
        elementId,
        hasSavedPosition: !!savedImagePosition,
        hasSavedSize: !!savedImageSize,
        savedPosition: savedImagePosition,
        savedSize: savedImageSize
      });
      
      // Apply saved position
      if (savedImagePosition && (savedImagePosition.x !== 0 || savedImagePosition.y !== 0)) {
        element.style.transform = `translate(${savedImagePosition.x}px, ${savedImagePosition.y}px)`;
        log('ClickableImagePlaceholder', 'applySavedPosition', {
          elementId,
          position: savedImagePosition,
          appliedTransform: element.style.transform
        });
      }
      
      // Apply saved size
      if (savedImageSize && savedImageSize.width && savedImageSize.height) {
        element.style.width = `${savedImageSize.width}px`;
        element.style.height = `${savedImageSize.height}px`;
        log('ClickableImagePlaceholder', 'applySavedSize', {
          elementId,
          size: savedImageSize,
          appliedWidth: element.style.width,
          appliedHeight: element.style.height
        });
      }
      
      log('ClickableImagePlaceholder', 'applySavedState_complete', {
        elementId,
        finalWidth: element.style.width,
        finalHeight: element.style.height,
        finalTransform: element.style.transform
      });
    }
  }, [containerRef, savedImagePosition, savedImageSize, elementId]);

  // Ensure Moveable is properly initialized for placeholders with images after reload
  useEffect(() => {
    if (isEditable && displayedImage && containerRef.current) {
      // Force a small delay to ensure DOM is ready, then trigger hover state
      const timer = setTimeout(() => {
        log('ClickableImagePlaceholder', 'initializeMoveableForImage', { elementId });
        // Don't auto-hover, let user hover naturally
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isEditable, displayedImage, containerRef, elementId]);

  // Safety cleanup: reset drag state on unmount or when editable state changes
  useEffect(() => {
    return () => {
      if (isDragging) {
        setIsDragging(false);
        log('ClickableImagePlaceholder', 'cleanup_resetDrag', { elementId });
      }
    };
  }, [isDragging, elementId]);



  const handleClick = () => {
    if (!isEditable) return;
    if (displayedImage) {
      // If image exists, show upload modal for replacement
      setShowUploadModal(true);
    } else {
      // If no image, show upload modal
      setShowUploadModal(true);
    }
  };

  // Hover handlers for Moveable anchors visibility
  const handleMouseEnter = () => {
    if (isEditable && !isDragging) {
      setIsHovered(true);
      log('ClickableImagePlaceholder', 'mouseEnter', { 
        elementId, 
        hasImage: !!displayedImage,
        isHovered: true,
        isDragging
      });
    }
  };

  const handleMouseLeave = () => {
    if (isEditable && !isDragging) {
      setIsHovered(false);
      log('ClickableImagePlaceholder', 'mouseLeave', { 
        elementId, 
        hasImage: !!displayedImage,
        isHovered: false,
        isDragging
      });
    }
  };

  // Handle image upload and open edit modal
  const handleImageUploaded = (newImagePath: string, imageFile?: File) => {
    log('ClickableImagePlaceholder', 'handleImageUploaded', {
      elementId,
      hasImageFile: !!imageFile,
      newImagePath: !!newImagePath
    });

    if (imageFile) {
      // Store the file and open the edit modal
      setPendingImageFile(imageFile);
      setShowImageEditModal(true);
    } else {
      // Direct upload without file (fallback)
      onImageUploaded(newImagePath);
      setDisplayedImage(newImagePath);
    }
  };

  // Get placeholder dimensions for the modal
  const getPlaceholderDimensions = useCallback(() => {
    if (!containerRef.current) {
      // Fallback dimensions based on size prop
      const fallbackDimensions = {
        'LARGE': { width: 400, height: 300 },
        'MEDIUM': { width: 300, height: 200 },
        'SMALL': { width: 200, height: 150 }
      };
      return fallbackDimensions[size];
    }

    const rect = containerRef.current.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }, [containerRef, size]);

  // Handle modal confirm crop
  const handleConfirmCrop = useCallback((croppedImagePath: string) => {
    log('ClickableImagePlaceholder', 'handleConfirmCrop', {
      elementId,
      croppedImagePath: !!croppedImagePath
    });

    onImageUploaded(croppedImagePath);
    setDisplayedImage(croppedImagePath);
    setShowImageEditModal(false);
    setPendingImageFile(null);
  }, [onImageUploaded, elementId]);

  // Handle modal do not crop
  const handleDoNotCrop = useCallback((originalImagePath: string) => {
    log('ClickableImagePlaceholder', 'handleDoNotCrop', {
      elementId,
      originalImagePath: !!originalImagePath
    });

    onImageUploaded(originalImagePath);
    setDisplayedImage(originalImagePath);
    setShowImageEditModal(false);
    setPendingImageFile(null);
  }, [onImageUploaded, elementId]);

  // Handle modal cancel
  const handleModalCancel = useCallback(() => {
    log('ClickableImagePlaceholder', 'handleModalCancel', { elementId });

    setShowImageEditModal(false);
    setPendingImageFile(null);
  }, [elementId]);

  // Finalize image upload
  const finalizeImageUpload = useCallback(async (imagePath: string) => {
    log('ClickableImagePlaceholder', 'finalizeImageUpload', {
      elementId,
      imagePath: !!imagePath
    });

    onImageUploaded(imagePath);
    setDisplayedImage(imagePath);
    
    // Load image to get dimensions
    const tmp = new window.Image();
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
  }, [onImageUploaded, onSizeTransformChange, cropMode, elementId]);

  // Regular image display
  if (displayedImage) {
    return (
      <>
        <div 
          ref={containerRef}
          data-moveable-element={elementId}
          className={`
            ${positionClasses[position]} 
            relative overflow-hidden rounded-lg transition-all duration-200
            ${isEditable ? 'group cursor-pointer hover:ring-2 hover:ring-blue-400' : ''}
            ${isEditable && (isHovered || isDragging) ? 'ring-2 ring-blue-400 ring-opacity-50 shadow-lg' : ''}
            ${className}
          `}
          style={{
            ...(style || {}),
          }}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
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
        {isEditable && containerRef.current && (isHovered || isDragging) && (
          <Moveable
            target={containerRef.current}
            draggable={true}
            throttleDrag={1}
            edgeDraggable={false}
            onDragStart={e => {
              setIsDragging(true);
              log('ClickableImagePlaceholder', 'dragStart', { 
                elementId, 
                hasImage: !!displayedImage,
                isDragging: true 
              });
            }}
            onDrag={e => {
              e.target.style.transform = e.transform;
              
              // Extract position from transform
              const transformMatch = e.transform.match(/translate\(([^)]+)\)/);
              if (transformMatch) {
                const [, translate] = transformMatch;
                const [x, y] = translate.split(',').map(v => parseFloat(v.replace('px', '')));
                
                // Call onSizeTransformChange with position update
                onSizeTransformChange?.({
                  imagePosition: { x, y },
                  elementId: elementId
                });
              }
            }}
            resizable={true}
            keepRatio={false}
            throttleResize={1}
            renderDirections={["nw","n","ne","w","e","sw","s","se"]}
            onResize={e => {
              e.target.style.width = `${e.width}px`;
              e.target.style.height = `${e.height}px`;
              e.target.style.transform = e.drag.transform;
              
              // Extract position and size
              const transformMatch = e.drag.transform.match(/translate\(([^)]+)\)/);
              const x = transformMatch ? parseFloat(transformMatch[1].split(',')[0].replace('px', '')) : 0;
              const y = transformMatch ? parseFloat(transformMatch[1].split(',')[1].replace('px', '')) : 0;
              
              log('ClickableImagePlaceholder', 'onResize', {
                elementId,
                width: e.width,
                height: e.height,
                position: { x, y },
                appliedWidth: e.target.style.width,
                appliedHeight: e.target.style.height
              });
              
              // Call onSizeTransformChange with both position and size
              onSizeTransformChange?.({
                imagePosition: { x, y },
                imageSize: { width: e.width, height: e.height },
                elementId: elementId
              });
            }}
            onDragEnd={e => {
              // Final position update after drag ends
              const transformMatch = e.target.style.transform.match(/translate\(([^)]+)\)/);
              if (transformMatch) {
                const [, translate] = transformMatch;
                const [x, y] = translate.split(',').map((v: string) => parseFloat(v.replace('px', '')));
                
                onSizeTransformChange?.({
                  imagePosition: { x, y },
                  elementId: elementId,
                  final: true
                });
              }
              
              // Reset drag state
              setIsDragging(false);
              log('ClickableImagePlaceholder', 'dragEnd', { 
                elementId, 
                hasImage: !!displayedImage,
                isDragging: false 
              });
            }}
            onResizeEnd={e => {
              // Final size update after resize ends
              const transformMatch = e.target.style.transform.match(/translate\(([^)]+)\)/);
              const x = transformMatch ? parseFloat(transformMatch[1].split(',')[0].replace('px', '')) : 0;
              const y = transformMatch ? parseFloat(transformMatch[1].split(',')[1].replace('px', '')) : 0;
              
              // Get numeric width and height from the resize event
              const width = parseFloat(e.target.style.width.replace('px', ''));
              const height = parseFloat(e.target.style.height.replace('px', ''));
              
              log('ClickableImagePlaceholder', 'onResizeEnd', {
                elementId,
                width,
                height,
                position: { x, y },
                finalWidth: e.target.style.width,
                finalHeight: e.target.style.height,
                isFinal: true
              });
              
              onSizeTransformChange?.({
                imagePosition: { x, y },
                imageSize: { width, height },
                elementId: elementId,
                final: true
              });
            }}
          />
        )}

        <PresentationImageUpload
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onImageUploaded={handleImageUploaded}
          title="Replace Image"
        />

        {/* Image Edit Modal */}
        <ImageEditModal
          isOpen={showImageEditModal}
          onClose={() => setShowImageEditModal(false)}
          imageFile={pendingImageFile}
          placeholderDimensions={getPlaceholderDimensions()}
          onConfirmCrop={handleConfirmCrop}
          onDoNotCrop={handleDoNotCrop}
          onCancel={handleModalCancel}
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
          text-gray-500 text-sm transition-all duration-200
          ${position === 'BACKGROUND' ? 'opacity-20' : ''}
          ${isEditable ? 'hover:border-blue-400 hover:bg-blue-50' : ''}
          ${isEditable && (isHovered || isDragging) ? 'border-blue-400 bg-blue-50 shadow-lg' : ''}
          ${className}
        `}
        style={{
          ...(style || {}),
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
      {isEditable && containerRef.current && (isHovered || isDragging) && (
        <Moveable
          target={containerRef.current}
          draggable={true}
          throttleDrag={1}
          edgeDraggable={false}
          onDragStart={e => {
            setIsDragging(true);
            log('ClickableImagePlaceholder', 'dragStart', { 
              elementId, 
              hasImage: !!displayedImage,
              isDragging: true 
            });
          }}
          onDrag={e => {
            e.target.style.transform = e.transform;
            
            // Extract position from transform
            const transformMatch = e.transform.match(/translate\(([^)]+)\)/);
            if (transformMatch) {
              const [, translate] = transformMatch;
              const [x, y] = translate.split(',').map(v => parseFloat(v.replace('px', '')));
              
              // Call onSizeTransformChange with position update
              onSizeTransformChange?.({
                imagePosition: { x, y },
                elementId: elementId
              });
            }
          }}
          resizable={true}
          keepRatio={false}
          throttleResize={1}
          renderDirections={["nw","n","ne","w","e","sw","s","se"]}
          onResize={e => {
            e.target.style.width = `${e.width}px`;
            e.target.style.height = `${e.height}px`;
            e.target.style.transform = e.drag.transform;
            
            // Extract position and size
            const transformMatch = e.drag.transform.match(/translate\(([^)]+)\)/);
            const x = transformMatch ? parseFloat(transformMatch[1].split(',')[0].replace('px', '')) : 0;
            const y = transformMatch ? parseFloat(transformMatch[1].split(',')[1].replace('px', '')) : 0;
            
            // Call onSizeTransformChange with both position and size
            onSizeTransformChange?.({
              imagePosition: { x, y },
              imageSize: { width: e.width, height: e.height },
              elementId: elementId
            });
          }}
          onDragEnd={e => {
            // Final position update after drag ends
            const transformMatch = e.target.style.transform.match(/translate\(([^)]+)\)/);
            if (transformMatch) {
              const [, translate] = transformMatch;
              const [x, y] = translate.split(',').map((v: string) => parseFloat(v.replace('px', '')));
              
              onSizeTransformChange?.({
                imagePosition: { x, y },
                elementId: elementId,
                final: true
              });
            }
            
            // Reset drag state
            setIsDragging(false);
            log('ClickableImagePlaceholder', 'dragEnd', { 
              elementId, 
              hasImage: !!displayedImage,
              isDragging: false 
            });
          }}
          onResizeEnd={e => {
            // Final size update after resize ends
            const transformMatch = e.target.style.transform.match(/translate\(([^)]+)\)/);
            const x = transformMatch ? parseFloat(transformMatch[1].split(',')[0].replace('px', '')) : 0;
            const y = transformMatch ? parseFloat(transformMatch[1].split(',')[1].replace('px', '')) : 0;
            
            // Get numeric width and height from the resize event
            const width = parseFloat(e.target.style.width.replace('px', ''));
            const height = parseFloat(e.target.style.height.replace('px', ''));
            
            onSizeTransformChange?.({
              imagePosition: { x, y },
              imageSize: { width, height },
              elementId: elementId,
              final: true
            });
          }}
        />
      )}

      <PresentationImageUpload
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onImageUploaded={handleImageUploaded}
        title="Upload Image"
      />

      {/* Image Edit Modal */}
      <ImageEditModal
        isOpen={showImageEditModal}
        onClose={() => setShowImageEditModal(false)}
        imageFile={pendingImageFile}
        placeholderDimensions={getPlaceholderDimensions()}
        onConfirmCrop={handleConfirmCrop}
        onDoNotCrop={handleDoNotCrop}
        onCancel={handleModalCancel}
      />
    </>
  );
};

export default ClickableImagePlaceholder; 