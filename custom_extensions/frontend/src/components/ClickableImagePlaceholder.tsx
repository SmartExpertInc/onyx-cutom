'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ImageIcon, Replace } from 'lucide-react';
import PresentationImageUpload from './PresentationImageUpload';
import Moveable from 'react-moveable';

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

  // Derived sizes for default size classes when explicit width/height not provided
  const defaultPixelSize = useMemo(() => {
    switch (size) {
      case 'LARGE': return { w: 512, h: 384 };
      case 'MEDIUM': return { w: 384, h: 256 };
      case 'SMALL': return { w: 256, h: 192 };
      default: return { w: 384, h: 256 };
    }
  }, [size]);

  // Keep local displayed image in sync with prop when it changes
  useEffect(() => {
    if (imagePath) {
      setDisplayedImage(imagePath);
    }
  }, [imagePath]);

  const handleClick = () => {
    if (!isEditable) return;
    setShowUploadModal(true);
  };

  const handleImageUploaded = (newImagePath: string) => {
    onImageUploaded(newImagePath);
    setDisplayedImage(newImagePath);
    
    // Load image to get dimensions
    const tmp = new window.Image();
    tmp.onload = () => {
      const imgW = tmp.naturalWidth || tmp.width;
      const imgH = tmp.naturalHeight || tmp.height;
      
      if (imgW > 0 && imgH > 0) {
        setImageDimensions({ width: imgW, height: imgH });
        
        // Notify parent of image load with default size
        onSizeTransformChange?.({
          widthPx: defaultPixelSize.w,
          heightPx: defaultPixelSize.h,
          objectFit: cropMode,
          imageScale: 1,
          imageOffset: { x: 0, y: 0 }
        });
      }
    };
    tmp.src = newImagePath;
  };

  const handleCropModeChange = (newMode: 'cover' | 'contain' | 'fill') => {
    onCropModeChange?.(newMode);
    
    // Just notify the parent component about the crop mode change
    onSizeTransformChange?.({
      objectFit: newMode,
    });
  };

  // If we have an image, display it with replace overlay and crop controls
  if (displayedImage) {
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
            width: defaultPixelSize.w,
            height: defaultPixelSize.h,
            maxWidth: "auto",
            maxHeight: "auto",
            minWidth: "auto",
            minHeight: "auto",
          }}
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
                maxWidth: 'none',
                maxHeight: 'none'
              }}
              draggable={false}
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
                  onClick={(e) => {
                    e.stopPropagation();
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCropModeChange('contain');
                        setShowCropOptions(false);
                      }}
                      className={`block w-full text-left px-2 py-1 rounded text-xs ${cropMode === 'contain' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      Fit (contain)
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCropModeChange('cover');
                        setShowCropOptions(false);
                      }}
                      className={`block w-full text-left px-2 py-1 rounded text-xs ${cropMode === 'cover' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      Fill (cover)
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCropModeChange('fill');
                        setShowCropOptions(false);
                      }}
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

        {/* Official react-moveable implementation for image */}
        {isEditable && containerRef.current && (
          <Moveable
            target={containerRef.current}
            draggable={true}
            throttleDrag={1}
            edgeDraggable={false}
            startDragRotate={0}
            throttleDragRotate={0}
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
          title="Upload Presentation Image"
        />
      </>
    );
  }

  // Otherwise show placeholder
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
          width: defaultPixelSize.w,
          height: defaultPixelSize.h,
          maxWidth: "auto",
          maxHeight: "auto",
          minWidth: "auto",
          minHeight: "auto",
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

      {/* Official react-moveable implementation for placeholder */}
      {isEditable && containerRef.current && (
        <Moveable
          target={containerRef.current}
          draggable={true}
          throttleDrag={1}
          edgeDraggable={false}
          startDragRotate={0}
          throttleDragRotate={0}
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
        title="Upload Presentation Image"
      />
    </>
  );
};

export default ClickableImagePlaceholder; 