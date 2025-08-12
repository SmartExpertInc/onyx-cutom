'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';
import Moveable from 'react-moveable';
import PresentationImageUpload from './PresentationImageUpload';

// Debug logging utility
const DEBUG = typeof window !== 'undefined' && (window as any).__MOVEABLE_DEBUG__;
const log = (source: string, event: string, data: any) => {
  if (DEBUG) {
    console.log(`[${source}] ${event}`, { ts: Date.now(), ...data });
  }
};

export interface ClickableImagePlaceholderProps {
  imagePath?: string;
  onImageUploaded?: (imagePath: string) => void;
  onSizeTransformChange?: (payload: any) => void;
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';
  position?: 'TOP' | 'CENTER' | 'BACKGROUND';
  description?: string;
  prompt?: string;
  isEditable?: boolean;
  style?: React.CSSProperties;
  className?: string;
  elementId?: string;
  elementRef?: React.RefObject<HTMLDivElement>;
  cropMode?: 'cover' | 'contain' | 'fill';
  onCropModeChange?: (mode: 'cover' | 'contain' | 'fill') => void;
}

const ClickableImagePlaceholder: React.FC<ClickableImagePlaceholderProps> = ({
  imagePath,
  onImageUploaded,
  onSizeTransformChange,
  size = 'LARGE',
  position = 'CENTER',
  description = 'Click to upload image',
  prompt,
  isEditable = false,
  style = {},
  className = '',
  elementId = 'image-placeholder',
  elementRef,
  cropMode = 'contain',
  onCropModeChange
}) => {
  // State management
  const [isHovered, setIsHovered] = useState(false);
  const [shiftPressed, setShiftPressed] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  
  // Refs
  const targetRef = useRef<HTMLDivElement>(null);
  const moveableRef = useRef<Moveable>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  log('ClickableImagePlaceholder', 'render', { 
    elementId, 
    hasImagePath: !!imagePath,
    hasProcessedImage: !!processedImage,
    isEditable,
    cropMode
  });

  // Size configurations
  const sizeConfigs = {
    SMALL: { width: 200, height: 150 },
    MEDIUM: { width: 300, height: 200 },
    LARGE: { width: 400, height: 300 }
  };

  const defaultSize = sizeConfigs[size];

  // Position classes
  const positionClasses = {
    TOP: 'self-start',
    CENTER: 'self-center',
    BACKGROUND: 'absolute inset-0'
  };

  // Track shift key for proportional resizing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setShiftPressed(true);
        log('ClickableImagePlaceholder', 'shiftKeyDown', { elementId });
        // Update moveable keepRatio in real-time
        if (moveableRef.current) {
          moveableRef.current.updateRect();
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setShiftPressed(false);
        log('ClickableImagePlaceholder', 'shiftKeyUp', { elementId });
        if (moveableRef.current) {
          moveableRef.current.updateRect();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [elementId]);

  // Process image when imagePath changes
  useEffect(() => {
    if (imagePath) {
      log('ClickableImagePlaceholder', 'imagePathChanged', { 
        elementId, 
        imagePath: !!imagePath 
      });
      setProcessedImage(imagePath);
    } else {
      setProcessedImage(null);
    }
  }, [imagePath, elementId]);

  // Image processing function
  const processImage = useCallback((imageData: string, shouldCrop: boolean = true) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = targetRef.current?.getBoundingClientRect();
      if (!rect) return;

      canvas.width = rect.width;
      canvas.height = rect.height;
      
      if (shouldCrop) {
        // Crop to fit - maintain aspect ratio, fill entire placeholder
        const scale = Math.max(rect.width / img.width, rect.height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const offsetX = (rect.width - scaledWidth) / 2;
        const offsetY = (rect.height - scaledHeight) / 2;
        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      } else {
        // Stretch to fit exact dimensions
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      }
      
      const processedDataUrl = canvas.toDataURL();
      setProcessedImage(processedDataUrl);
      
      log('ClickableImagePlaceholder', 'imageProcessed', { 
        elementId, 
        shouldCrop,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height
      });
    };
    img.src = imageData;
  }, [elementId]);

  // Handle image upload
  const handleImageUploaded = useCallback((newImagePath: string) => {
    log('ClickableImagePlaceholder', 'handleImageUploaded_start', { 
      elementId, 
      newImagePath: !!newImagePath,
      refExists: !!targetRef.current
    });

    if (onImageUploaded) {
      onImageUploaded(newImagePath);
    }
  }, [elementId, onImageUploaded]);

  // Click handler for image upload
  const handlePlaceholderClick = useCallback((e: React.MouseEvent) => {
    if (!isEditable) return;
    
    log('ClickableImagePlaceholder', 'handleClick', { 
      elementId, 
      isEditable,
      target: e.target,
      isTargetRef: e.target === targetRef.current
    });

    // Only trigger file input if not currently being manipulated by Moveable
    if (e.target === targetRef.current || (e.target as HTMLElement).closest('.image-content')) {
      setShowUploadModal(true);
    }
  }, [elementId, isEditable]);

  // Moveable event handlers
  const handleDrag = useCallback(({ target, left, top }: any) => {
    if (target) {
      target.style.left = `${left}px`;
      target.style.top = `${top}px`;
    }
    
    log('ClickableImagePlaceholder', 'handleDrag', { 
      elementId, 
      left, 
      top 
    });
  }, [elementId]);

  const handleDragEnd = useCallback(({ target }: any) => {
    if (target) {
      const rect = target.getBoundingClientRect();
      const parentRect = target.parentElement?.getBoundingClientRect();
      
      if (parentRect) {
        const position = {
          x: rect.left - parentRect.left,
          y: rect.top - parentRect.top
        };
        
        log('ClickableImagePlaceholder', 'handleDragEnd', { 
          elementId, 
          position 
        });
        
        if (onSizeTransformChange) {
          onSizeTransformChange({
            moveablePositions: {
              [elementId]: position
            }
          });
        }
      }
    }
  }, [elementId, onSizeTransformChange]);

  const handleResize = useCallback(({ target, width, height, left, top }: any) => {
    if (target) {
      target.style.width = `${width}px`;
      target.style.height = `${height}px`;
      target.style.left = `${left}px`;
      target.style.top = `${top}px`;
    }
    
    log('ClickableImagePlaceholder', 'handleResize', { 
      elementId, 
      width, 
      height 
    });
  }, [elementId]);

  const handleResizeEnd = useCallback(({ target }: any) => {
    if (target) {
      const rect = target.getBoundingClientRect();
      const parentRect = target.parentElement?.getBoundingClientRect();
      
      if (parentRect) {
        const size = {
          width: rect.width,
          height: rect.height
        };
        
        const position = {
          x: rect.left - parentRect.left,
          y: rect.top - parentRect.top
        };
        
        log('ClickableImagePlaceholder', 'handleResizeEnd', { 
          elementId, 
          size, 
          position 
        });
        
        if (onSizeTransformChange) {
          onSizeTransformChange({
            moveableSizes: {
              [elementId]: size
            },
            moveablePositions: {
              [elementId]: position
            }
          });
        }
        
        // Reprocess image if it exists to fit new dimensions
        if (imagePath) {
          processImage(imagePath, cropMode === 'cover');
        }
      }
    }
  }, [elementId, onSizeTransformChange, imagePath, processImage, cropMode]);

  // Handle crop mode change
  const handleCropModeChange = useCallback((mode: 'cover' | 'contain' | 'fill') => {
    log('ClickableImagePlaceholder', 'handleCropModeChange', { 
      elementId, 
      oldMode: cropMode, 
      newMode: mode,
      hasImagePath: !!imagePath
    });

    if (onCropModeChange) {
      onCropModeChange(mode);
    }
    
    // Reprocess image if it exists
    if (imagePath) {
      processImage(imagePath, mode === 'cover');
    }
  }, [elementId, cropMode, onCropModeChange, imagePath, processImage]);

  log('ClickableImagePlaceholder', 'renderingImage', { 
    elementId, 
    hasImagePath: !!imagePath,
    hasProcessedImage: !!processedImage,
    refExists: !!targetRef.current,
    cropMode
  });

  return (
    <>
      {/* Main draggable/resizable element */}
      <div
        ref={targetRef}
        data-moveable-element={elementId}
        className={`
          ${positionClasses[position]} 
          relative border-2 border-dashed border-gray-300 
          bg-gradient-to-br from-blue-100 to-purple-100
          shadow-lg cursor-pointer transition-colors
          ${isEditable ? 'hover:border-blue-400 hover:bg-blue-50' : ''}
          ${className}
        `}
        style={{
          ...style,
          width: defaultSize.width,
          height: defaultSize.height,
          minWidth: 120,
          minHeight: 120,
        }}
        onClick={handlePlaceholderClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image content */}
        <div className="image-content w-full h-full relative overflow-hidden pointer-events-none">
          {processedImage ? (
            <img
              src={processedImage}
              alt="Uploaded content"
              className="w-full h-full object-cover"
              draggable={false}
              onLoad={() => {
                log('ClickableImagePlaceholder', 'imgOnLoad', { elementId });
              }}
              onError={() => {
                log('ClickableImagePlaceholder', 'imgOnError', { elementId });
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-4">
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
          )}
        </div>
      </div>

      {/* React Moveable Component - only show when image is uploaded and editable */}
      {isEditable && processedImage && (
        <Moveable
          ref={moveableRef}
          target={targetRef.current}
          draggable={true}
          resizable={true}
          keepRatio={shiftPressed}
          
          // Drag events
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          
          // Resize events
          onResize={handleResize}
          onResizeEnd={handleResizeEnd}
          
          // Visual configuration
          throttleDrag={0}
          throttleResize={0}
          
          // Resize handle configuration
          renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
          
          // Custom styling
          className="moveable-control"
          
          // Only show controls on hover
          hideDefaultLines={!isHovered}
          
          // Edge and handle styling
          edge={false}
          zoom={1}
          origin={false}
        />
      )}

      {/* Upload Modal */}
      <PresentationImageUpload
        isOpen={showUploadModal}
        onClose={() => {
          log('ClickableImagePlaceholder', 'uploadModalClose', { elementId });
          setShowUploadModal(false);
        }}
        onImageUploaded={handleImageUploaded}
        title="Upload Presentation Image"
      />

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Custom CSS for Moveable styling */}
      <style jsx>{`
        .moveable-control .moveable-line {
          background: #3b82f6;
        }
        
        .moveable-control .moveable-control-box {
          border-color: #3b82f6;
        }
        
        .moveable-control .moveable-direction {
          background: #3b82f6;
          border: 2px solid white;
          border-radius: 2px;
          width: 8px;
          height: 8px;
        }
        
        .moveable-control .moveable-direction:hover {
          background: #2563eb;
          transform: scale(1.2);
        }
      `}</style>
    </>
  );
};

export default ClickableImagePlaceholder; 