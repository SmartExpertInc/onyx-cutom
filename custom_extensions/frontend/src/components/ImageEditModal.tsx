'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Check, X, Image } from 'lucide-react';
import Moveable from 'react-moveable';

// Enhanced debug logging utility
const DEBUG = typeof window !== 'undefined' && ((window as any).__MOVEABLE_DEBUG__ || true);
const log = (source: string, event: string, data: any) => {
  if (DEBUG) {
    console.log(`[ImageEditModal] ${source} | ${event}`, { 
      ts: Date.now(), 
      ...data 
    });
  }
};

export interface ImageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  placeholderDimensions: { width: number; height: number };
  onConfirmCrop: (croppedImagePath: string) => void;
  onDoNotCrop: (originalImagePath: string) => void;
  onCancel: () => void;
}

interface ImageEditState {
  imageUrl: string;
  scale: number;
  transform: string;
  imageDimensions: { width: number; height: number } | null;
  hasChanges: boolean;
}

const ImageEditModal: React.FC<ImageEditModalProps> = ({
  isOpen,
  onClose,
  imageFile,
  placeholderDimensions,
  onConfirmCrop,
  onDoNotCrop,
  onCancel,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [editState, setEditState] = useState<ImageEditState>({
    imageUrl: '',
    scale: 1,
    transform: 'translate(0px, 0px) scale(1)',
    imageDimensions: null,
    hasChanges: false
  });

  const editImageRef = useRef<HTMLImageElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Initialize image when modal opens
  useEffect(() => {
    if (isOpen && imageFile) {
      const imageUrl = URL.createObjectURL(imageFile);
      setEditState({
        imageUrl,
        scale: 1,
        transform: 'translate(0px, 0px) scale(1)',
        imageDimensions: null,
        hasChanges: false
      });

      log('ImageEditModal', 'modalOpened', {
        hasImageFile: !!imageFile,
        placeholderDimensions
      });
    }
  }, [isOpen, imageFile, placeholderDimensions]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen && editState.imageUrl) {
      URL.revokeObjectURL(editState.imageUrl);
      setEditState({
        imageUrl: '',
        scale: 1,
        transform: 'translate(0px, 0px) scale(1)',
        imageDimensions: null,
        hasChanges: false
      });
    }
  }, [isOpen, editState.imageUrl]);

  // Handle image load in edit mode
  const handleEditImageLoad = useCallback(() => {
    log('ImageEditModal', 'handleEditImageLoad_start', {
      hasImg: !!editImageRef.current,
      placeholderDimensions
    });

    const img = editImageRef.current;
    if (!img) {
      log('ImageEditModal', 'handleEditImageLoad_missingImgRef', {});
      return;
    }

    const { naturalWidth, naturalHeight } = img;
    
    log('ImageEditModal', 'handleEditImageLoad_setup', {
      naturalSize: { width: naturalWidth, height: naturalHeight },
      placeholderDimensions
    });
    
    // Set image dimensions immediately
    setEditState(prev => ({
      ...prev,
      imageDimensions: { width: naturalWidth, height: naturalHeight }
    }));

    // Auto-fit image to fill the placeholder
    const scaleX = placeholderDimensions.width / naturalWidth;
    const scaleY = placeholderDimensions.height / naturalHeight;
    const initialScale = Math.max(scaleX, scaleY, 0.1); // Cover the placeholder
    
    const scaledWidth = naturalWidth * initialScale;
    const scaledHeight = naturalHeight * initialScale;
    const centerX = (placeholderDimensions.width - scaledWidth) / 2;
    const centerY = (placeholderDimensions.height - scaledHeight) / 2;
    
    const initialTransform = `translate(${centerX}px, ${centerY}px) scale(${initialScale})`;
    
    log('ImageEditModal', 'handleEditImageLoad_initialTransform', {
      initialScale,
      centerX,
      centerY,
      initialTransform
    });

    // Apply initial transform to the image element
    img.style.transform = initialTransform;
    
    // Update state with initial transform
    setEditState(prev => ({
      ...prev,
      scale: initialScale,
      transform: initialTransform,
      imageDimensions: { width: naturalWidth, height: naturalHeight }
    }));

    log('ImageEditModal', 'handleEditImageLoad_complete', {
      finalTransform: initialTransform,
      finalScale: initialScale
    });
  }, [placeholderDimensions]);

  // Handle zoom in edit mode
  const handleZoom = useCallback((delta: number) => {
    log('ImageEditModal', 'handleZoom_start', {
      delta,
      currentScale: editState.scale
    });

    setEditState(prev => {
      const newScale = Math.max(0.1, Math.min(5, prev.scale + delta));
      
      // Extract current translation from transform
      const transformMatch = prev.transform.match(/translate\(([^)]+)\) scale\(([^)]+)\)/);
      if (transformMatch) {
        const [, translate] = transformMatch;
        const [x, y] = translate.split(',').map(v => parseFloat(v.replace('px', '')));
        
        // Zoom towards center of placeholder
        const centerX = placeholderDimensions.width / 2;
        const centerY = placeholderDimensions.height / 2;
        const scaleRatio = newScale / prev.scale;
        
        const newX = centerX - (centerX - x) * scaleRatio;
        const newY = centerY - (centerY - y) * scaleRatio;
        
        const newTransform = `translate(${newX}px, ${newY}px) scale(${newScale})`;
        
        // Apply transform directly to image
        if (editImageRef.current) {
          editImageRef.current.style.transform = newTransform;
        }
        
        log('ImageEditModal', 'handleZoom_applied', {
          newScale,
          newTransform,
          hasChanges: true
        });
        
        return {
          ...prev,
          scale: newScale,
          transform: newTransform,
          hasChanges: true
        };
      }
      
      return prev;
    });
  }, [editState.scale, editState.transform, placeholderDimensions]);

  // Handle "Do Not Crop" - upload original image without transforms
  const handleDoNotCrop = useCallback(async () => {
    log('ImageEditModal', 'handleDoNotCrop_start', {
      hasImageFile: !!imageFile
    });

    if (!imageFile) {
      log('ImageEditModal', 'handleDoNotCrop_noImageFile', {});
      return;
    }

    setIsProcessing(true);

    try {
      // Upload the original file without any cropping or transforms
      const { uploadPresentationImage } = await import('../lib/designTemplateApi');
      const result = await uploadPresentationImage(imageFile);
      
      log('ImageEditModal', 'handleDoNotCrop_uploadResult', {
        success: !!result.file_path,
        filePath: result.file_path
      });

      if (result.file_path) {
        onDoNotCrop(result.file_path);
        
        log('ImageEditModal', 'handleDoNotCrop_success', {
          finalImagePath: result.file_path
        });
      } else {
        throw new Error('No file path returned from upload');
      }
      
    } catch (error: unknown) {
      log('ImageEditModal', 'handleDoNotCrop_error', {
        error
      });
      console.error('Do Not Crop upload error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [imageFile, onDoNotCrop]);

  // Generate and finalize cropped image
  const confirmEdit = useCallback(async () => {
    log('ImageEditModal', 'confirmEdit_start', {
      hasImageFile: !!imageFile,
      hasImageDimensions: !!editState.imageDimensions,
      transform: editState.transform,
      imageDimensions: editState.imageDimensions
    });

    if (!imageFile || !editState.imageDimensions) {
      log('ImageEditModal', 'confirmEdit_missingRequirements', {
        hasImageFile: !!imageFile,
        hasImageDimensions: !!editState.imageDimensions
      });
      return;
    }

    if (isProcessing) {
      log('ImageEditModal', 'confirmEdit_alreadyProcessing', {});
      return;
    }

    setIsProcessing(true);
    
    try {
      const canvas = cropCanvasRef.current;
      if (!canvas) throw new Error('Canvas not available');

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');
      
      // Set canvas to placeholder dimensions for high quality
      canvas.width = placeholderDimensions.width;
      canvas.height = placeholderDimensions.height;
      
      log('ImageEditModal', 'confirmEdit_canvasSetup', {
        canvasSize: { width: canvas.width, height: canvas.height },
        placeholderDimensions
      });
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Parse transform
      const transformMatch = editState.transform.match(/translate\(([^)]+)\) scale\(([^)]+)\)/);
      if (!transformMatch) {
        throw new Error(`Invalid transform format: ${editState.transform}`);
      }
      
      const [, translate, scaleStr] = transformMatch;
      const [x, y] = translate.split(',').map(v => parseFloat(v.replace('px', '')));
      const currentScale = parseFloat(scaleStr);
      
      log('ImageEditModal', 'confirmEdit_transformParsed', {
        translate,
        scaleStr,
        parsedTransform: { x, y, scale: currentScale }
      });
      
      // Create image for drawing
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        log('ImageEditModal', 'confirmEdit_imageLoaded', {
          imageSize: { width: img.width, height: img.height },
          transform: { x, y, scale: currentScale }
        });
        
        // Use high-quality settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Fill background with transparent
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate the area of the image that's visible in the crop frame
        const { width: imgWidth, height: imgHeight } = editState.imageDimensions!;
        const scaledWidth = imgWidth * currentScale;
        const scaledHeight = imgHeight * currentScale;
        
        // Draw the scaled image at the current position
        ctx.drawImage(
          img,
          x, y, scaledWidth, scaledHeight
        );
        
        log('ImageEditModal', 'confirmEdit_imageDrawn', {
          drawParams: { x, y, width: scaledWidth, height: scaledHeight }
        });
        
        // Convert to blob and upload
        canvas.toBlob(async (blob) => {
          if (!blob) {
            log('ImageEditModal', 'confirmEdit_noBlobCreated', {});
            setIsProcessing(false);
            return;
          }
          
          log('ImageEditModal', 'confirmEdit_blobCreated', {
            blobSize: blob.size
          });
          
          try {
            const croppedFile = new File([blob], 'cropped-image.png', { type: 'image/png' });
            
            // Upload the cropped file
            const { uploadPresentationImage } = await import('../lib/designTemplateApi');
            const result = await uploadPresentationImage(croppedFile);
            
            log('ImageEditModal', 'confirmEdit_uploadResult', {
              success: !!result.file_path,
              filePath: result.file_path
            });
            
            if (result.file_path) {
              onConfirmCrop(result.file_path);
              
              log('ImageEditModal', 'confirmEdit_success', {
                finalImagePath: result.file_path
              });
            } else {
              throw new Error('No file path returned from upload');
            }
            
          } catch (uploadError) {
            log('ImageEditModal', 'confirmEdit_uploadError', {
              error: uploadError
            });
            console.error('Upload error:', uploadError);
          } finally {
            setIsProcessing(false);
          }
        }, 'image/png');
      };
      
      img.onerror = (error: Event | string) => {
        log('ImageEditModal', 'confirmEdit_imageLoadError', {
          error
        });
        console.error('Image load error:', error);
        setIsProcessing(false);
      };
      
      img.src = editState.imageUrl;
      
    } catch (error: unknown) {
      log('ImageEditModal', 'confirmEdit_error', {
        error
      });
      console.error('Error processing cropped image:', error);
      setIsProcessing(false);
    }
  }, [editState, imageFile, placeholderDimensions, isProcessing, onConfirmCrop]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    log('ImageEditModal', 'handleCancel', {});
    onCancel();
  }, [onCancel]);

  // Close modal on escape key and handle scroll behavior
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Remove body overflow restriction to allow scrolling
      // document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // document.body.style.overflow = '';
    };
  }, [isOpen, handleCancel]);

  // Calculate optimal modal position with scroll-aware positioning
  const getModalPosition = useCallback(() => {
    if (typeof window === 'undefined') return { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    
    // Use fixed positioning relative to viewport, not document
    return {
      position: 'fixed' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };
  }, []);

  if (!isOpen) return null;

  const modalPosition = getModalPosition();

  return (
    <div 
      className="fixed inset-0 z-[99999] backdrop-blur-sm bg-black/20 flex items-center justify-center p-4"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200"
        style={{ 
          minHeight: '600px',
          ...modalPosition
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">Edit Image</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 p-6">
          {/* Image Editing Area */}
          <div className="flex justify-center mb-6">
            <div 
              className="relative overflow-hidden border-2 border-blue-500 bg-gray-100 rounded-lg"
                      style={{
          width: placeholderDimensions.width,
          height: placeholderDimensions.height,
          maxWidth: '100%',
          maxHeight: '60vh'
        }}
            >
              {editState.imageUrl && (
                <>
                  <img
                    ref={editImageRef}
                    src={editState.imageUrl}
                    alt="Editing"
                    className="absolute"
                    data-edit-image="true"
                    style={{
                      transform: editState.transform,
                      transformOrigin: '0 0',
                      userSelect: 'none',
                      maxWidth: 'none',
                      maxHeight: 'none',
                      willChange: 'transform',
                      touchAction: 'none',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }}
                    onLoad={handleEditImageLoad}
                    draggable={false}
                  />
                  
                  {/* React-moveable for smooth interaction */}
                  {editImageRef.current && (
                    <Moveable
                      target={editImageRef.current}
                      draggable={true}
                      scalable={true}
                      keepRatio={false}
                      throttleDrag={0}
                      throttleScale={0}
                      onDragStart={({ target }) => {
                        log('ImageEditModal', 'moveable_onDragStart', {
                          target: target.tagName,
                          currentTransform: target.style.transform
                        });
                      }}
                      onDrag={({ target, transform }) => {
                        target.style.transform = transform;
                        setEditState(prev => ({ 
                          ...prev, 
                          transform,
                          hasChanges: true
                        }));
                        log('ImageEditModal', 'moveable_onDrag', {
                          transform,
                          hasChanges: true
                        });
                      }}
                      onScaleStart={({ target }) => {
                        log('ImageEditModal', 'moveable_onScaleStart', {
                          target: target.tagName,
                          currentTransform: target.style.transform
                        });
                      }}
                      onScale={({ target, transform, scale }) => {
                        target.style.transform = transform;
                        setEditState(prev => ({ 
                          ...prev, 
                          transform,
                          scale: scale[0],
                          hasChanges: true
                        }));
                        log('ImageEditModal', 'moveable_onScale', {
                          transform,
                          scale: scale[0],
                          hasChanges: true
                        });
                      }}
                      renderDirections={["nw","n","ne","w","e","sw","s","se"]}
                    />
                  )}
                </>
              )}
              
              {/* Corner indicators */}
              <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-blue-600"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-blue-600"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-blue-600"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-blue-600"></div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-3 mb-6">
            {/* Zoom controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleZoom(-0.1)}
                className="p-1.5 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={editState.scale <= 0.1}
              >
                <ZoomOut className="w-3.5 h-3.5" />
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
                  if (transformMatch && editImageRef.current) {
                    const [, translate] = transformMatch;
                    const newTransform = `translate(${translate}) scale(${newScale})`;
                    setEditState(prev => ({ 
                      ...prev, 
                      scale: newScale, 
                      transform: newTransform,
                      hasChanges: true
                    }));
                    // Apply transform directly to image
                    editImageRef.current.style.transform = newTransform;
                    
                    log('ImageEditModal', 'sliderZoom', {
                      newScale,
                      newTransform,
                      hasChanges: true
                    });
                  }
                }}
                className="w-24"
              />
              <button
                onClick={() => handleZoom(0.1)}
                className="p-1.5 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={editState.scale >= 5}
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-sm text-gray-600 font-medium">
              {(editState.scale * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-center space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleCancel}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-sm"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          
          <button
            onClick={handleDoNotCrop}
            disabled={isProcessing}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Image className="w-4 h-4" />
                <span>Do Not Crop</span>
              </>
            )}
          </button>
          
          <button
            onClick={confirmEdit}
            disabled={isProcessing}
            className="flex items-center space-x-2 px-6 py-2 text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Confirm Crop</span>
              </>
            )}
          </button>
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={cropCanvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ImageEditModal;
