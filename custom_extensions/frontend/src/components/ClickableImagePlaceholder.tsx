'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';
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
  position?: 'TOP' | 'CENTER' | 'BOTTOM' | 'BACKGROUND';
  description?: string;
  prompt?: string;
  isEditable?: boolean;
  style?: React.CSSProperties;
  className?: string;
  // Moveable integration props
  elementId?: string;
  elementRef?: React.RefObject<HTMLDivElement>;
  cropMode?: 'cover' | 'contain' | 'fill';
  onCropModeChange?: (mode: 'cover' | 'contain' | 'fill') => void;
}

const ClickableImagePlaceholder: React.FC<ClickableImagePlaceholderProps> = ({
  imagePath,
  onImageUploaded,
  onSizeTransformChange,
  size: sizeProp = 'LARGE',
  position: positionProp = 'CENTER',
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
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [elementPosition, setElementPosition] = useState({ x: 0, y: 0 });
  const [elementSize, setElementSize] = useState({ width: 300, height: 200 });
  const [shiftPressed, setShiftPressed] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCropOptions, setShowCropOptions] = useState(false);
  
  // Refs for performance
  const containerRef = useRef<HTMLDivElement>(null);
  const dragDataRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });
  const resizeDataRef = useRef<{ 
    startX: number; 
    startY: number; 
    startWidth: number; 
    startHeight: number; 
    handle: string | null; 
    aspectRatio: number; 
    startPosX: number; 
    startPosY: number; 
  }>({ 
    startX: 0, 
    startY: 0, 
    startWidth: 0, 
    startHeight: 0, 
    handle: null, 
    aspectRatio: 1, 
    startPosX: 0, 
    startPosY: 0 
  });

  // Size configurations
  const sizeConfigs = {
    SMALL: { width: 200, height: 150 },
    MEDIUM: { width: 300, height: 200 },
    LARGE: { width: 400, height: 300 }
  };

  // Initialize size based on prop
  useEffect(() => {
    const config = sizeConfigs[sizeProp];
    setElementSize(config);
  }, [sizeProp]);

  // Track shift key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setShiftPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setShiftPressed(false);
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle image upload
  const handleImageUploaded = useCallback((newImagePath: string) => {
    log('ClickableImagePlaceholder', 'handleImageUploaded_start', { 
      elementId, 
      newImagePath: !!newImagePath, 
      refExists: !!containerRef.current 
    });

    if (onImageUploaded) {
      onImageUploaded(newImagePath);
    }
  }, [elementId, onImageUploaded]);

  // Handle crop mode change
  const handleCropModeChange = useCallback((mode: 'cover' | 'contain' | 'fill') => {
    log('ClickableImagePlaceholder', 'handleCropModeChange', { 
      elementId, 
      oldMode: cropMode, 
      newMode: mode,
      hasDimensions: !!(elementSize.width && elementSize.height)
    });

    if (onCropModeChange) {
      onCropModeChange(mode);
    }
  }, [elementId, cropMode, onCropModeChange, elementSize]);

  // Click handler for upload
  const handlePlaceholderClick = useCallback((e: React.MouseEvent) => {
    if (isDragging || isResizing || (e.target as HTMLElement).classList.contains('resize-handle')) {
      return;
    }
    
    log('ClickableImagePlaceholder', 'handleClick', { elementId, isEditable });
    
    if (isEditable) {
      setShowUploadModal(true);
    }
  }, [isDragging, isResizing, isEditable, elementId]);

  // Optimized drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isEditable || (e.target as HTMLElement).classList.contains('resize-handle')) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    dragDataRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: elementPosition.x,
      startPosY: elementPosition.y
    };
  }, [isEditable, elementPosition]);

  // Optimized resize handlers
  const handleResizeMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
    if (!isEditable) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    
    resizeDataRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: elementSize.width,
      startHeight: elementSize.height,
      startPosX: elementPosition.x,
      startPosY: elementPosition.y,
      handle: handle as string,
      aspectRatio: elementSize.width / elementSize.height
    };
  }, [isEditable, elementSize, elementPosition]);

  // Optimized mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragDataRef.current.startX;
      const deltaY = e.clientY - dragDataRef.current.startY;
      
      const newX = dragDataRef.current.startPosX + deltaX;
      const newY = dragDataRef.current.startPosY + deltaY;
      
      // Direct DOM update for smooth dragging
      if (containerRef.current) {
        containerRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
      }
      
    } else if (isResizing) {
      const deltaX = e.clientX - resizeDataRef.current.startX;
      const deltaY = e.clientY - resizeDataRef.current.startY;
      const { handle, startWidth, startHeight, aspectRatio, startPosX, startPosY } = resizeDataRef.current;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startPosX;
      let newY = startPosY;
      
      // Calculate new dimensions based on handle
      if (handle) {
        switch (handle) {
          case 'se':
            newWidth = Math.max(50, startWidth + deltaX);
            newHeight = Math.max(50, startHeight + deltaY);
            break;
          case 'sw':
            newWidth = Math.max(50, startWidth - deltaX);
            newHeight = Math.max(50, startHeight + deltaY);
            newX = startPosX + (startWidth - newWidth);
            break;
          case 'ne':
            newWidth = Math.max(50, startWidth + deltaX);
            newHeight = Math.max(50, startHeight - deltaY);
            newY = startPosY + (startHeight - newHeight);
            break;
          case 'nw':
            newWidth = Math.max(50, startWidth - deltaX);
            newHeight = Math.max(50, startHeight - deltaY);
            newX = startPosX + (startWidth - newWidth);
            newY = startPosY + (startHeight - newHeight);
            break;
          case 'e':
            newWidth = Math.max(50, startWidth + deltaX);
            break;
          case 'w':
            newWidth = Math.max(50, startWidth - deltaX);
            newX = startPosX + (startWidth - newWidth);
            break;
          case 'n':
            newHeight = Math.max(50, startHeight - deltaY);
            newY = startPosY + (startHeight - newHeight);
            break;
          case 's':
            newHeight = Math.max(50, startHeight + deltaY);
            break;
        }
        
        // Maintain aspect ratio if shift is pressed
        if (shiftPressed) {
          if (handle.includes('e') || handle.includes('w')) {
            newHeight = newWidth / aspectRatio;
          } else if (handle.includes('n') || handle.includes('s')) {
            newWidth = newHeight * aspectRatio;
          } else {
            // Corner handles
            const widthChange = newWidth / startWidth;
            const heightChange = newHeight / startHeight;
            
            if (Math.abs(widthChange - 1) > Math.abs(heightChange - 1)) {
              newHeight = newWidth / aspectRatio;
            } else {
              newWidth = newHeight * aspectRatio;
            }
          }
          
          // Recalculate position for aspect ratio constraints
          if (handle.includes('w')) {
            newX = startPosX + (startWidth - newWidth);
          }
          if (handle.includes('n')) {
            newY = startPosY + (startHeight - newHeight);
          }
        }
      }
      
      // Direct DOM update for smooth resizing
      if (containerRef.current) {
        containerRef.current.style.width = `${newWidth}px`;
        containerRef.current.style.height = `${newHeight}px`;
        containerRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
      }
    }
  }, [isDragging, isResizing, shiftPressed]);

  // Mouse up handler - sync DOM state back to React state and notify parent
  const handleMouseUp = useCallback(() => {
    if (isDragging || isResizing) {
      const rect = containerRef.current?.getBoundingClientRect();
      const parentRect = containerRef.current?.parentElement?.getBoundingClientRect();
      
      if (rect && parentRect) {
        const newPosition = {
          x: rect.left - parentRect.left,
          y: rect.top - parentRect.top
        };
        
        const newSize = {
          width: rect.width,
          height: rect.height
        };
        
        setElementPosition(newPosition);
        setElementSize(newSize);
        
        // Notify parent component
        if (onSizeTransformChange) {
          onSizeTransformChange({
            widthPx: newSize.width,
            heightPx: newSize.height,
            position: newPosition
          });
        }
      }
      
      setIsDragging(false);
      setIsResizing(false);
    }
  }, [isDragging, isResizing, onSizeTransformChange]);

  // Global event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Resize handles configuration
  const handles = [
    { id: 'nw', className: 'top-0 left-0 cursor-nw-resize -translate-x-1/2 -translate-y-1/2' },
    { id: 'n', className: 'top-0 left-1/2 cursor-n-resize -translate-x-1/2 -translate-y-1/2' },
    { id: 'ne', className: 'top-0 right-0 cursor-ne-resize translate-x-1/2 -translate-y-1/2' },
    { id: 'e', className: 'top-1/2 right-0 cursor-e-resize translate-x-1/2 -translate-y-1/2' },
    { id: 'se', className: 'bottom-0 right-0 cursor-se-resize translate-x-1/2 translate-y-1/2' },
    { id: 's', className: 'bottom-0 left-1/2 cursor-s-resize -translate-x-1/2 translate-y-1/2' },
    { id: 'sw', className: 'bottom-0 left-0 cursor-sw-resize -translate-x-1/2 translate-y-1/2' },
    { id: 'w', className: 'top-1/2 left-0 cursor-w-resize -translate-x-1/2 -translate-y-1/2' },
  ];

  // Position classes for different positions
  const positionClasses = {
    TOP: 'self-start',
    CENTER: 'self-center',
    BOTTOM: 'self-end',
    BACKGROUND: 'absolute inset-0'
  };

  // Default pixel sizes
  const defaultPixelSize = {
    SMALL: { w: 200, h: 150 },
    MEDIUM: { w: 300, h: 200 },
    LARGE: { w: 400, h: 300 }
  };

  // If image is uploaded, show the image
  if (imagePath) {
    log('ClickableImagePlaceholder', 'renderingImage', { 
      elementId, 
      imagePath: !!imagePath, 
      refExists: !!containerRef.current,
      cropMode 
    });

    return (
      <>
        <div
          ref={containerRef}
          data-moveable-element={elementId}
          className={`
            ${positionClasses[positionProp]} 
            relative border-2 border-dashed border-gray-300 
            rounded-lg overflow-hidden
            ${isEditable ? 'hover:border-blue-400 transition-all duration-200' : ''}
            ${isDragging ? 'cursor-grabbing shadow-xl border-blue-500' : 'cursor-grab'}
            ${className}
          `}
          style={{
            ...(style || {}),
            width: elementSize.width,
            height: elementSize.height,
            transform: `translate(${elementPosition.x}px, ${elementPosition.y}px)`,
            position: 'relative'
          }}
          onMouseDown={handleMouseDown}
          onClick={handlePlaceholderClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image content */}
          <div className="w-full h-full relative overflow-hidden pointer-events-none">
            <img
              src={imagePath}
              alt="Uploaded content"
              className="w-full h-full"
              style={{ objectFit: cropMode }}
              draggable={false}
              onLoad={() => {
                log('ClickableImagePlaceholder', 'imgOnLoad', { elementId });
              }}
              onError={() => {
                log('ClickableImagePlaceholder', 'imgOnError', { elementId });
              }}
            />
          </div>

          {/* Crop mode indicator and controls */}
          {isEditable && (
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCropOptions(!showCropOptions);
                }}
                className="bg-white bg-opacity-80 hover:bg-opacity-100 text-xs px-2 py-1 rounded shadow-sm transition-all"
              >
                {cropMode}
              </button>
            </div>
          )}

          {/* Resize handles */}
          {isHovered && isEditable && !isDragging && (
            <>
              {handles.map((handle) => (
                <div
                  key={handle.id}
                  className={`resize-handle absolute w-3 h-3 bg-blue-500 border border-white rounded-sm hover:bg-blue-600 hover:scale-110 transition-all ${handle.className}`}
                  onMouseDown={(e) => handleResizeMouseDown(e, handle.id)}
                />
              ))}
            </>
          )}

          {/* Crop options dropdown */}
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
          ${positionClasses[positionProp]} 
          bg-gradient-to-br from-blue-100 to-purple-100 
          border-2 border-dashed border-gray-300 
          rounded-lg flex items-center justify-center 
          text-gray-500 text-sm
          ${positionProp === 'BACKGROUND' ? 'opacity-20' : ''}
          ${isEditable ? 'hover:border-blue-400 hover:bg-blue-50 transition-all duration-200' : ''}
          ${className}
        `}
        style={{
          ...(style || {}),
          width: defaultPixelSize[sizeProp].w,
          height: defaultPixelSize[sizeProp].h,
          minWidth: 120,
          minHeight: 120,
          transform: `translate(${elementPosition.x}px, ${elementPosition.y}px)`,
          position: 'relative'
        }}
        onClick={handlePlaceholderClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="text-center p-4" style={{ cursor: isEditable ? 'pointer' : 'default' }}>
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <div className="font-medium">{sizeProp} Image</div>
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

        {/* Resize handles for placeholder */}
        {isHovered && isEditable && (
          <>
            {handles.map((handle) => (
              <div
                key={handle.id}
                className={`resize-handle absolute w-3 h-3 bg-blue-500 border border-white rounded-sm hover:bg-blue-600 hover:scale-110 transition-all ${handle.className}`}
                onMouseDown={(e) => handleResizeMouseDown(e, handle.id)}
              />
            ))}
          </>
        )}
      </div>

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