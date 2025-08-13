'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ImageIcon, Replace } from 'lucide-react';
import PresentationImageUpload from './PresentationImageUpload';
import ImageCropModal, { CropSettings } from './ImageCropModal';
import Moveable from 'react-moveable';

// Debug logging utility
const DEBUG = typeof window !== 'undefined' && ((window as any).__MOVEABLE_DEBUG__ || true); // Enable debug by default for troubleshooting
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
  const [showCropModal, setShowCropModal] = useState(false);
  const [showCropOptions, setShowCropOptions] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [displayedImage, setDisplayedImage] = useState<string | undefined>(imagePath);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImageUrl, setPendingImageUrl] = useState<string>('');
  const [cropSettings, setCropSettings] = useState<CropSettings | null>(null);
  const [isCropping, setIsCropping] = useState(false);
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

  const handleImageUploaded = (newImagePath: string, imageFile?: File) => {
    log('ClickableImagePlaceholder', 'handleImageUploaded', {
      elementId,
      newImagePath,
      hasImageFile: !!imageFile,
      imageFileName: imageFile?.name,
      imageFileSize: imageFile?.size,
      imageFileType: imageFile?.type
    });

    // If we have a file, show crop modal first
    if (imageFile) {
      log('ClickableImagePlaceholder', 'showingCropModal', {
        elementId,
        imageFileName: imageFile.name,
        serverPath: newImagePath
      });

      setPendingImageFile(imageFile);
      setPendingImageUrl(newImagePath); // Keep server URL for later use
      setShowUploadModal(false);
      setShowCropModal(true);
      return;
    }

    // Otherwise proceed with direct upload (existing behavior)
    log('ClickableImagePlaceholder', 'directUpload', {
      elementId,
      imagePath: newImagePath
    });

    onImageUploaded(newImagePath);
    setDisplayedImage(newImagePath);
    
    // Load image to get dimensions
    const tmp = new window.Image();
    tmp.onload = () => {
      const imgW = tmp.naturalWidth || tmp.width;
      const imgH = tmp.naturalHeight || tmp.height;
      
      log('ClickableImagePlaceholder', 'imageLoaded', {
        elementId,
        width: imgW,
        height: imgH,
        isValid: imgW > 0 && imgH > 0
      });
      
      if (imgW > 0 && imgH > 0) {
        setImageDimensions({ width: imgW, height: imgH });
        
        // Notify parent of image load
        onSizeTransformChange?.({
          objectFit: cropMode,
          imageScale: 1,
          imageOffset: { x: 0, y: 0 }
        });
      }
    };
    tmp.src = newImagePath;
  };

  // Handle crop modal actions
  const handleCropConfirm = async (croppedImageData: string, settings: CropSettings) => {
    log('ClickableImagePlaceholder', 'handleCropConfirm_start', {
      elementId,
      settings,
      hasCroppedData: !!croppedImageData,
      croppedDataLength: croppedImageData?.length
    });

    setIsCropping(true);
    setCropSettings(settings);
    
    try {
      // Convert base64 to blob and upload it
      log('ClickableImagePlaceholder', 'convertingBase64ToBlob', { elementId });
      const response = await fetch(croppedImageData);
      const blob = await response.blob();
      
      log('ClickableImagePlaceholder', 'blobCreated', {
        elementId,
        blobSize: blob.size,
        blobType: blob.type
      });
      
      // Create a file from the blob
      const croppedFile = new File([blob], 'cropped-image.png', { type: 'image/png' });
      
      log('ClickableImagePlaceholder', 'fileCreated', {
        elementId,
        fileName: croppedFile.name,
        fileSize: croppedFile.size,
        fileType: croppedFile.type
      });
      
      // Upload the cropped file
      log('ClickableImagePlaceholder', 'uploadingCroppedFile', { elementId });
      const { uploadPresentationImage } = await import('../lib/designTemplateApi');
      const result = await uploadPresentationImage(croppedFile);
      
      log('ClickableImagePlaceholder', 'uploadSuccess', {
        elementId,
        result,
        filePath: result.file_path
      });
      
      // Use the uploaded file path
      onImageUploaded(result.file_path);
      setDisplayedImage(result.file_path);
      setShowCropModal(false);
      setPendingImageFile(null);
      setPendingImageUrl('');
      
      // Notify parent with crop settings
      onSizeTransformChange?.({
        objectFit: 'fill', // Cropped images should fill the placeholder
        imageScale: settings.scale,
        imageOffset: { x: settings.x, y: settings.y },
        isCropped: true
      });

      log('ClickableImagePlaceholder', 'handleCropConfirm_success', { elementId });
    } catch (error) {
      log('ClickableImagePlaceholder', 'handleCropConfirm_error', {
        elementId,
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined
      });
      console.error('Failed to upload cropped image:', error);
      // Fallback to original image
      handleSkipCrop(pendingImageUrl);
    } finally {
      setIsCropping(false);
    }
  };

  const handleSkipCrop = (originalImageData: string) => {
    log('ClickableImagePlaceholder', 'handleSkipCrop', {
      elementId,
      originalImageData,
      hasData: !!originalImageData
    });

    onImageUploaded(originalImageData);
    setDisplayedImage(originalImageData);
    setShowCropModal(false);
    setPendingImageFile(null);
    setPendingImageUrl('');
    
    // Use contain mode for uncropped images
    onSizeTransformChange?.({
      objectFit: cropMode || 'contain',
      imageScale: 1,
      imageOffset: { x: 0, y: 0 },
      isCropped: false
    });

    log('ClickableImagePlaceholder', 'handleSkipCrop_success', { elementId });
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setPendingImageFile(null);
    setPendingImageUrl('');
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

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={showCropModal}
        onClose={handleCropCancel}
        imageFile={pendingImageFile}
        imageUrl={pendingImageUrl}
        placeholderDimensions={{
          width: typeof style?.width === 'string' ? parseInt(style.width.replace('px', '')) || 384 : (style?.width as number) || 384,
          height: typeof style?.height === 'string' ? parseInt(style.height.replace('px', '')) || 384 : (style?.height as number) || 256
        }}
        onCropConfirm={handleCropConfirm}
        onSkipCrop={handleSkipCrop}
        elementId={elementId}
        isCropping={isCropping}
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

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={showCropModal}
        onClose={handleCropCancel}
        imageFile={pendingImageFile}
        imageUrl={pendingImageUrl}
        placeholderDimensions={{
          width: typeof style?.width === 'string' ? parseInt(style.width.replace('px', '')) || 384 : (style?.width as number) || 384,
          height: typeof style?.height === 'string' ? parseInt(style.height.replace('px', '')) || 384 : (style?.height as number) || 256
        }}
        onCropConfirm={handleCropConfirm}
        onSkipCrop={handleSkipCrop}
        elementId={elementId}
        isCropping={isCropping}
      />
    </>
  );
};

export default ClickableImagePlaceholder; 