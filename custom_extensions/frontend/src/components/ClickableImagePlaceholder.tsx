"use client";

import React, { useMemo, useRef, useState } from 'react';
import { Image as ImageIcon, Upload, Replace } from 'lucide-react';
import PresentationImageUpload from './PresentationImageUpload';
import ResizablePlaceholder from './ResizablePlaceholder';

interface ClickableImagePlaceholderProps {
  imagePath?: string;
  onImageUploaded: (imagePath: string) => void;
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';
  position?: 'LEFT' | 'RIGHT' | 'CENTER' | 'BACKGROUND';
  description?: string;
  prompt?: string;
  isEditable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  // New optional sizing/transform props
  widthPx?: number;
  heightPx?: number;
  objectFit?: 'contain' | 'cover' | 'fill';
  imageScale?: number; // 1.0 = natural fit
  imageOffset?: { x: number; y: number };
  // NEW: Layout mode for Gamma-style full-side behavior
  layoutMode?: 'free' | 'full-width' | 'full-height' | 'fixed-left';
  onSizeTransformChange?: (payload: {
    widthPx?: number;
    heightPx?: number;
    objectFit?: 'contain' | 'cover' | 'fill';
    imageScale?: number;
    imageOffset?: { x: number; y: number };
  }) => void;
}

const ClickableImagePlaceholder: React.FC<ClickableImagePlaceholderProps> = ({
  imagePath,
  onImageUploaded,
  size = 'MEDIUM',
  position = 'CENTER',
  description = 'Click to upload image',
  prompt = 'relevant illustration',
  isEditable = true,
  className = '',
  style = {},
  widthPx,
  heightPx,
  objectFit,
  imageScale,
  imageOffset,
  layoutMode = 'free',
  onSizeTransformChange
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  // Always contain
  const objectFitMode: 'contain' = 'contain';
  const imgWrapperRef = useRef<HTMLDivElement>(null);

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

  const handleClick = () => {
    if (isEditable) {
      setShowUploadModal(true);
    }
  };

  const handleImageUploaded = (newImagePath: string) => {
    onImageUploaded(newImagePath);
    // After upload: adjust placeholder based on layout mode
    const tmp = new window.Image();
    tmp.onload = () => {
      const imgW = tmp.naturalWidth || tmp.width;
      const imgH = tmp.naturalHeight || tmp.height;
      const wrapperEl = imgWrapperRef.current?.parentElement as HTMLElement | null;
      const rect = wrapperEl?.getBoundingClientRect();
      if (!imgW || !imgH || !rect) return;

      let targetW: number;
      let targetH: number;
      let effectiveObjectFit: 'contain' | 'cover' | 'fill';

      switch (layoutMode) {
        case 'full-width':
          // Full-width mode: lock to container width, allow height adjustment
          targetW = rect.width || defaultPixelSize.w;
          // Calculate height to maintain image aspect ratio
          targetH = Math.round((targetW / imgW) * imgH);
          effectiveObjectFit = 'cover'; // Fill width completely, crop height
          break;
        
        case 'full-height':
          // Full-height mode: lock to container height, allow width adjustment
          targetH = rect.height || defaultPixelSize.h;
          // Calculate width to maintain image aspect ratio
          targetW = Math.round((targetH / imgH) * imgW);
          effectiveObjectFit = 'cover'; // Fill height completely, crop width
          break;
        
        case 'fixed-left':
          // Fixed-left mode: lock to container height, width is adjustable from right edge
          targetH = rect.height || defaultPixelSize.h;
          // Calculate width to maintain image aspect ratio
          targetW = Math.round((targetH / imgH) * imgW);
          effectiveObjectFit = 'cover'; // Fill height completely, crop width
          break;
        
        case 'free':
        default:
          // Free mode: maintain aspect ratio, fit within container
          const scale = Math.min((rect.width || imgW) / imgW, (rect.height || imgH) / imgH) || 1;
          targetW = Math.max(1, Math.round(imgW * scale));
          targetH = Math.max(1, Math.round(imgH * scale));
          effectiveObjectFit = 'contain';
          break;
      }

      onSizeTransformChange?.({ 
        widthPx: targetW, 
        heightPx: targetH, 
        objectFit: effectiveObjectFit, 
        imageScale: 1, 
        imageOffset: { x: 0, y: 0 } 
      });
    };
    tmp.src = newImagePath;
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

  const handleResize = (s: { widthPx: number; heightPx: number }) => {
    onSizeTransformChange?.({ widthPx: s.widthPx, heightPx: s.heightPx });
  };

  const handleResizeCommit = (s: { widthPx: number; heightPx: number }) => {
    onSizeTransformChange?.({ widthPx: s.widthPx, heightPx: s.heightPx });
  };

  // Panning disabled in contain mode

  // If we have an image, display it with replace overlay and image controls
  if (imagePath) {
    return (
      <>
        <ResizablePlaceholder
          isEditable={isEditable}
          className={`
            ${positionClasses[position]} 
            rounded-lg overflow-hidden relative ${className}
          `}
          style={{
            ...(style || {}),
            // Let component control size via widthPx/heightPx props
          }}
          // Use provided sizes or fall back to default sizes based on size prop
          widthPx={widthPx || defaultPixelSize.w}
          heightPx={heightPx || defaultPixelSize.h}
          minWidthPx={120}
          minHeightPx={120}
          layoutMode={layoutMode}
          onResize={handleResize}
          onResizeCommit={handleResizeCommit}
          ariaLabel="Resizable image placeholder"
        >
          <div ref={imgWrapperRef} className="w-full h-full relative">
            <img
              src={imagePath}
              alt={description}
              className="absolute inset-0"
              style={{
                width: '100%',
                height: '100%',
                objectFit: objectFit || 'contain',
                transform: 'none',
                transformOrigin: 'center center',
                maxWidth: 'none',
                maxHeight: 'none'
              }}
              draggable={false}
              
            />
            {/* No fit toggle; always contain */}
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
          </div>
        </ResizablePlaceholder>

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
      <ResizablePlaceholder
        isEditable={isEditable}
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
        style={style}
        // Provide default sizes based on size prop to prevent tiny placeholders
        widthPx={widthPx || defaultPixelSize.w}
        heightPx={heightPx || defaultPixelSize.h}
        minWidthPx={120}
        minHeightPx={120}
        layoutMode={layoutMode}
        onResize={(s) => onSizeTransformChange?.(s)}
        onResizeCommit={(s) => onSizeTransformChange?.(s)}
        ariaLabel="Resizable image placeholder"
      >
        <div className="text-center p-4" onClick={handleClick} style={{ cursor: isEditable ? 'pointer' : 'default' }}>
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
      </ResizablePlaceholder>

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