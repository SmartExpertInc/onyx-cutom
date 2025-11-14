'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ZoomIn, ZoomOut, Check, X, Video, Play, Pause, Scissors } from 'lucide-react';
import Moveable from 'react-moveable';
import TrimVideoModal from '@/app/projects-2-new/view/components/TrimVideoModal';

// Enhanced debug logging utility
const DEBUG = typeof window !== 'undefined' && ((window as any).__MOVEABLE_DEBUG__ || true);
const log = (source: string, event: string, data: any) => {
  if (DEBUG) {
    console.log(`[VideoEditModal] ${source} | ${event}`, { 
      ts: Date.now(), 
      ...data 
    });
  }
};

export interface VideoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoFile: File | null;
  videoPath?: string; // Optional: if video is already uploaded
  placeholderDimensions: { width: number; height: number };
  onConfirmCrop: (processedVideoPath: string, cropSettings?: VideoCropSettings) => void;
  onDoNotCrop: (originalVideoPath: string) => void;
  onCancel: () => void;
  onTrimComplete?: (trimmedVideoPath: string) => void; // Optional callback for trimmed video
}

export interface VideoCropSettings {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  objectFit: 'cover' | 'contain' | 'fill';
}

interface VideoEditState {
  videoUrl: string;
  scale: number;
  transform: string;
  videoDimensions: { width: number; height: number } | null;
  hasChanges: boolean;
  objectFit: 'cover' | 'contain' | 'fill';
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

const VideoEditModal: React.FC<VideoEditModalProps> = ({
  isOpen,
  onClose,
  videoFile,
  videoPath,
  placeholderDimensions,
  onConfirmCrop,
  onDoNotCrop,
  onCancel,
  onTrimComplete,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [showTrimModal, setShowTrimModal] = useState(false);
  const [editState, setEditState] = useState<VideoEditState>({
    videoUrl: '',
    scale: 1,
    transform: 'translate(0px, 0px) scale(1)',
    videoDimensions: null,
    hasChanges: false,
    objectFit: 'cover',
    isPlaying: false,
    currentTime: 0,
    duration: 0
  });

  const editVideoRef = useRef<HTMLVideoElement>(null);

  // Create portal container on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPortalContainer(document.body);
      log('VideoEditModal', 'portalContainerSet', { container: 'document.body' });
    }
  }, []);

  // Initialize video when modal opens
  useEffect(() => {
    if (isOpen) {
      let videoUrl = '';
      
      if (videoFile) {
        videoUrl = URL.createObjectURL(videoFile);
      } else if (videoPath) {
        videoUrl = videoPath;
      }

      if (videoUrl) {
        setEditState({
          videoUrl,
          scale: 1,
          transform: 'translate(0px, 0px) scale(1)',
          videoDimensions: null,
          hasChanges: false,
          objectFit: 'cover',
          isPlaying: false,
          currentTime: 0,
          duration: 0
        });

        log('VideoEditModal', 'modalOpened', {
          hasVideoFile: !!videoFile,
          hasVideoPath: !!videoPath,
          placeholderDimensions,
          videoFileSize: videoFile?.size,
          videoFileName: videoFile?.name
        });
      }
    }
  }, [isOpen, videoFile, videoPath, placeholderDimensions]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen && editState.videoUrl && videoFile) {
      URL.revokeObjectURL(editState.videoUrl);
      setEditState({
        videoUrl: '',
        scale: 1,
        transform: 'translate(0px, 0px) scale(1)',
        videoDimensions: null,
        hasChanges: false,
        objectFit: 'cover',
        isPlaying: false,
        currentTime: 0,
        duration: 0
      });
    }
  }, [isOpen, editState.videoUrl, videoFile]);

  // Handle video metadata load
  const handleVideoLoadedMetadata = useCallback(() => {
    log('VideoEditModal', 'handleVideoLoadedMetadata_start', {
      hasVideo: !!editVideoRef.current,
      placeholderDimensions
    });

    const video = editVideoRef.current;
    if (!video) {
      log('VideoEditModal', 'handleVideoLoadedMetadata_missingVideoRef', {});
      return;
    }

    const { videoWidth, videoHeight, duration } = video;
    
    log('VideoEditModal', 'handleVideoLoadedMetadata_setup', {
      videoSize: { width: videoWidth, height: videoHeight },
      duration,
      placeholderDimensions
    });
    
    // Set video dimensions immediately
    setEditState(prev => ({
      ...prev,
      videoDimensions: { width: videoWidth, height: videoHeight },
      duration
    }));

    // Calculate initial scale based on object-fit mode
    const calculateInitialScale = (fit: 'cover' | 'contain' | 'fill') => {
      if (fit === 'fill') {
        // Stretch to fill exactly
        const scaleX = placeholderDimensions.width / videoWidth;
        const scaleY = placeholderDimensions.height / videoHeight;
        return { scale: Math.max(scaleX, scaleY), centerX: 0, centerY: 0 };
      } else if (fit === 'cover') {
        // Scale to cover (like CSS object-fit: cover)
        const scaleX = placeholderDimensions.width / videoWidth;
        const scaleY = placeholderDimensions.height / videoHeight;
        const scale = Math.max(scaleX, scaleY);
        const scaledWidth = videoWidth * scale;
        const scaledHeight = videoHeight * scale;
        const centerX = (placeholderDimensions.width - scaledWidth) / 2;
        const centerY = (placeholderDimensions.height - scaledHeight) / 2;
        return { scale, centerX, centerY };
      } else {
        // contain mode (fit within bounds)
        const scaleX = placeholderDimensions.width / videoWidth;
        const scaleY = placeholderDimensions.height / videoHeight;
        const scale = Math.min(scaleX, scaleY);
        const scaledWidth = videoWidth * scale;
        const scaledHeight = videoHeight * scale;
        const centerX = (placeholderDimensions.width - scaledWidth) / 2;
        const centerY = (placeholderDimensions.height - scaledHeight) / 2;
        return { scale, centerX, centerY };
      }
    };

    const { scale, centerX, centerY } = calculateInitialScale(editState.objectFit);
    const initialTransform = `translate(${centerX}px, ${centerY}px) scale(${scale})`;
    
    log('VideoEditModal', 'handleVideoLoadedMetadata_initialTransform', {
      initialScale: scale,
      centerX,
      centerY,
      initialTransform,
      objectFit: editState.objectFit,
      scaledDimensions: { 
        width: videoWidth * scale, 
        height: videoHeight * scale 
      }
    });

    // Apply initial transform to the video element
    video.style.transform = initialTransform;
    
    // Update state with initial transform
    setEditState(prev => ({
      ...prev,
      scale,
      transform: initialTransform,
      videoDimensions: { width: videoWidth, height: videoHeight }
    }));

    log('VideoEditModal', 'handleVideoLoadedMetadata_complete', {
      finalTransform: initialTransform,
      finalScale: scale,
      objectFit: editState.objectFit
    });
  }, [placeholderDimensions, editState.objectFit]);

  // Handle object-fit change
  const handleObjectFitChange = useCallback((newObjectFit: 'cover' | 'contain' | 'fill') => {
    log('VideoEditModal', 'handleObjectFitChange', {
      oldObjectFit: editState.objectFit,
      newObjectFit,
      hasVideoDimensions: !!editState.videoDimensions
    });

    if (!editState.videoDimensions || !editVideoRef.current) {
      setEditState(prev => ({ ...prev, objectFit: newObjectFit }));
      return;
    }

    const { width: videoWidth, height: videoHeight } = editState.videoDimensions;
    const video = editVideoRef.current;

    // Recalculate scale and position based on new object-fit
    let scale: number;
    let centerX: number;
    let centerY: number;

    if (newObjectFit === 'fill') {
      const scaleX = placeholderDimensions.width / videoWidth;
      const scaleY = placeholderDimensions.height / videoHeight;
      scale = Math.max(scaleX, scaleY);
      centerX = 0;
      centerY = 0;
    } else if (newObjectFit === 'cover') {
      const scaleX = placeholderDimensions.width / videoWidth;
      const scaleY = placeholderDimensions.height / videoHeight;
      scale = Math.max(scaleX, scaleY);
      const scaledWidth = videoWidth * scale;
      const scaledHeight = videoHeight * scale;
      centerX = (placeholderDimensions.width - scaledWidth) / 2;
      centerY = (placeholderDimensions.height - scaledHeight) / 2;
    } else {
      // contain
      const scaleX = placeholderDimensions.width / videoWidth;
      const scaleY = placeholderDimensions.height / videoHeight;
      scale = Math.min(scaleX, scaleY);
      const scaledWidth = videoWidth * scale;
      const scaledHeight = videoHeight * scale;
      centerX = (placeholderDimensions.width - scaledWidth) / 2;
      centerY = (placeholderDimensions.height - scaledHeight) / 2;
    }

    const newTransform = `translate(${centerX}px, ${centerY}px) scale(${scale})`;
    video.style.transform = newTransform;

    setEditState(prev => ({
      ...prev,
      objectFit: newObjectFit,
      scale,
      transform: newTransform,
      hasChanges: true
    }));
  }, [editState.videoDimensions, editState.objectFit, placeholderDimensions]);

  // Handle zoom
  const handleZoom = useCallback((delta: number) => {
    log('VideoEditModal', 'handleZoom_start', {
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
        
        // Apply transform directly to video
        if (editVideoRef.current) {
          editVideoRef.current.style.transform = newTransform;
        }
        
        log('VideoEditModal', 'handleZoom_applied', {
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

  // Handle video play/pause
  const handlePlayPause = useCallback(() => {
    const video = editVideoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setEditState(prev => ({ ...prev, isPlaying: true }));
    } else {
      video.pause();
      setEditState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    const video = editVideoRef.current;
    if (video) {
      setEditState(prev => ({ ...prev, currentTime: video.currentTime }));
    }
  }, []);

  // Handle "Do Not Crop" - use original video
  const handleDoNotCrop = useCallback(async () => {
    log('VideoEditModal', 'handleDoNotCrop_start', {
      hasVideoFile: !!videoFile,
      hasVideoPath: !!videoPath
    });

    if (!videoPath && !videoFile) {
      log('VideoEditModal', 'handleDoNotCrop_noVideo', {});
      return;
    }

    setIsProcessing(true);

    try {
      // If we have a videoPath, use it directly
      if (videoPath) {
        onDoNotCrop(videoPath);
        log('VideoEditModal', 'handleDoNotCrop_success', {
          videoPath
        });
        setIsProcessing(false);
        return;
      }

      // Otherwise, upload the original file
      if (videoFile) {
        const { uploadPresentationVideo } = await import('../lib/designTemplateApi');
        const result = await uploadPresentationVideo(videoFile);
        
        log('VideoEditModal', 'handleDoNotCrop_uploadResult', {
          success: !!result.file_path,
          filePath: result.file_path
        });

        if (result.file_path) {
          onDoNotCrop(result.file_path);
          
          log('VideoEditModal', 'handleDoNotCrop_success', {
            finalVideoPath: result.file_path
          });
        } else {
          throw new Error('No file path returned from upload');
        }
      }
      
    } catch (error: unknown) {
      log('VideoEditModal', 'handleDoNotCrop_error', {
        error
      });
      console.error('Do Not Crop upload error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [videoFile, videoPath, onDoNotCrop]);

  // Generate and finalize cropped video
  const confirmEdit = useCallback(async () => {
    log('VideoEditModal', 'confirmEdit_start', {
      hasVideoFile: !!videoFile,
      hasVideoPath: !!videoPath,
      hasVideoDimensions: !!editState.videoDimensions,
      transform: editState.transform,
      objectFit: editState.objectFit,
      videoDimensions: editState.videoDimensions,
      placeholderDimensions
    });

    if ((!videoFile && !videoPath) || !editState.videoDimensions) {
      log('VideoEditModal', 'confirmEdit_missingRequirements', {
        hasVideoFile: !!videoFile,
        hasVideoPath: !!videoPath,
        hasVideoDimensions: !!editState.videoDimensions
      });
      return;
    }

    // Validate placeholder dimensions
    if (!placeholderDimensions || placeholderDimensions.width <= 0 || placeholderDimensions.height <= 0) {
      log('VideoEditModal', 'confirmEdit_invalidPlaceholderDimensions', {
        placeholderDimensions
      });
      console.error('Invalid placeholder dimensions:', placeholderDimensions);
      setIsProcessing(false);
      return;
    }

    if (isProcessing) {
      log('VideoEditModal', 'confirmEdit_alreadyProcessing', {});
      return;
    }

    setIsProcessing(true);
    
    try {
      // Parse transform
      const transformMatch = editState.transform.match(/translate\(([^)]+)\) scale\(([^)]+)\)/);
      if (!transformMatch) {
        throw new Error(`Invalid transform format: ${editState.transform}`);
      }
      
      const [, translate, scaleStr] = transformMatch;
      const [x, y] = translate.split(',').map(v => parseFloat(v.replace('px', '')));
      const currentScale = parseFloat(scaleStr);
      
      log('VideoEditModal', 'confirmEdit_transformParsed', {
        translate,
        scaleStr,
        parsedTransform: { x, y, scale: currentScale },
        objectFit: editState.objectFit
      });

      // Prepare crop settings
      const cropSettings: VideoCropSettings = {
        x,
        y,
        width: Math.round(placeholderDimensions.width),
        height: Math.round(placeholderDimensions.height),
        scale: currentScale,
        objectFit: editState.objectFit
      };

      // Determine video source (file or path)
      let videoToProcess: File | string;
      if (videoFile) {
        videoToProcess = videoFile;
      } else if (videoPath) {
        videoToProcess = videoPath;
      } else {
        throw new Error('No video source available');
      }

      // Call backend API to process video
      const { processVideo } = await import('../lib/designTemplateApi');
      const result = await processVideo(videoToProcess, cropSettings);
      
      log('VideoEditModal', 'confirmEdit_processResult', {
        success: !!result.file_path,
        filePath: result.file_path
      });

      if (result.file_path) {
        onConfirmCrop(result.file_path, cropSettings);
        
        log('VideoEditModal', 'confirmEdit_success', {
          finalVideoPath: result.file_path
        });
      } else {
        throw new Error('No file path returned from processing');
      }
      
    } catch (error: unknown) {
      log('VideoEditModal', 'confirmEdit_error', {
        error
      });
      console.error('Error processing video:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [editState, videoFile, videoPath, placeholderDimensions, isProcessing, onConfirmCrop]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    log('VideoEditModal', 'handleCancel', {});
    onCancel();
  }, [onCancel]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleCancel]);

  if (!isOpen || !portalContainer) {
    log('VideoEditModal', 'notRendering', { 
      isOpen, 
      portalContainerExists: !!portalContainer 
    });
    return null;
  }

  log('VideoEditModal', 'renderingModal', { 
    isOpen, 
    isProcessing, 
    hasError: false 
  });

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center backdrop-blur-sm bg-black/20"
      onClick={handleCancel}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '64rem',
          width: '100%',
          margin: '0 1rem',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 100000
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">Edit Video</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 p-6">
          {/* Video Editing Area */}
          <div className="flex justify-center mb-6">
            <div 
              className="relative overflow-hidden border-2 border-blue-500 bg-gray-100 rounded-lg"
              style={{
                width: placeholderDimensions.width,
                height: placeholderDimensions.height
              }}
            >
              {/* Dimensions indicator */}
              <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded z-10">
                {placeholderDimensions.width} × {placeholderDimensions.height}
              </div>
              
              {editState.videoUrl && (
                <>
                  <video
                    ref={editVideoRef}
                    src={editState.videoUrl}
                    className="absolute"
                    data-edit-video="true"
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
                      left: 0,
                      objectFit: editState.objectFit === 'fill' ? 'fill' : 'none'
                    }}
                    onLoadedMetadata={handleVideoLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onPlay={() => setEditState(prev => ({ ...prev, isPlaying: true }))}
                    onPause={() => setEditState(prev => ({ ...prev, isPlaying: false }))}
                    draggable={false}
                    controls={false}
                  />
                  
                  {/* Play/Pause overlay button */}
                  <button
                    onClick={handlePlayPause}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors z-20"
                    style={{ display: editState.isPlaying ? 'none' : 'flex' }}
                  >
                    <div className="bg-white/90 rounded-full p-4">
                      {editState.isPlaying ? (
                        <Pause className="w-8 h-8 text-gray-900" />
                      ) : (
                        <Play className="w-8 h-8 text-gray-900 ml-1" />
                      )}
                    </div>
                  </button>
                  
                  {/* React-moveable for smooth interaction */}
                  {editVideoRef.current && (
                    <Moveable
                      target={editVideoRef.current}
                      draggable={true}
                      scalable={true}
                      keepRatio={false}
                      throttleDrag={0}
                      throttleScale={0}
                      onDragStart={({ target }) => {
                        log('VideoEditModal', 'moveable_onDragStart', {
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
                        log('VideoEditModal', 'moveable_onDrag', {
                          transform,
                          hasChanges: true
                        });
                      }}
                      onScaleStart={({ target }) => {
                        log('VideoEditModal', 'moveable_onScaleStart', {
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
                        log('VideoEditModal', 'moveable_onScale', {
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
          <div className="flex flex-col items-center space-y-4 mb-6">
            {/* Trim Video Button */}
            <button
              onClick={() => {
                log('VideoEditModal', 'openTrimModal', {
                  hasVideoFile: !!videoFile,
                  hasVideoPath: !!videoPath,
                  videoFileName: videoFile?.name,
                  videoPathValue: videoPath,
                  editStateVideoUrl: editState.videoUrl
                });
                setShowTrimModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium"
              disabled={isProcessing}
            >
              <Scissors className="w-4 h-4" />
              <span>Trim Video</span>
            </button>

            {/* Object-fit selector */}
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700">Object Fit:</label>
              <select
                value={editState.objectFit}
                onChange={(e) => handleObjectFitChange(e.target.value as 'cover' | 'contain' | 'fill')}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill</option>
              </select>
            </div>

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
                  if (transformMatch && editVideoRef.current) {
                    const [, translate] = transformMatch;
                    const newTransform = `translate(${translate}) scale(${newScale})`;
                    setEditState(prev => ({ 
                      ...prev, 
                      scale: newScale, 
                      transform: newTransform,
                      hasChanges: true
                    }));
                    // Apply transform directly to video
                    editVideoRef.current.style.transform = newTransform;
                    
                    log('VideoEditModal', 'sliderZoom', {
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
                <Video className="w-4 h-4" />
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
      </div>
    </div>
  );

  return (
    <>
      {createPortal(modalContent, portalContainer)}
      
      {/* Trim Video Modal */}
      <TrimVideoModal
        isOpen={showTrimModal}
        onClose={() => {
          log('VideoEditModal', 'closeTrimModal', {});
          setShowTrimModal(false);
        }}
        videoFile={videoFile}
        videoPath={videoPath || editState.videoUrl || undefined}
        onTrimConfirm={(trimmedVideoPath) => {
          log('VideoEditModal', 'trimComplete', { trimmedVideoPath });
          // Update video path and close trim modal
          // If onTrimComplete callback exists, use it; otherwise update local state
          if (onTrimComplete) {
            onTrimComplete(trimmedVideoPath);
          } else {
            // Update the video URL to the trimmed version
            setEditState(prev => ({
              ...prev,
              videoUrl: trimmedVideoPath,
              hasChanges: true
            }));
          }
          setShowTrimModal(false);
        }}
      />
    </>
  );
};

export default VideoEditModal;

