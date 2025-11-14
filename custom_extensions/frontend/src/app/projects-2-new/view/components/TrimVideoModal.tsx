'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { X, Play, Pause, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Enhanced debug logging utility
const DEBUG = typeof window !== 'undefined' && ((window as any).__TRIM_VIDEO_MODAL_DEBUG__ !== false);
const log = (source: string, event: string, data: any) => {
  if (DEBUG) {
    console.log(`[TrimVideoModal] ${source} | ${event}`, { 
      ts: Date.now(), 
      ...data 
    });
  }
};

interface TrimVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoFile?: File | null;
  videoPath?: string;
  onTrimConfirm?: (trimmedVideoPath: string, trimSettings?: TrimSettings) => void; // Optional: if not provided, just closes modal
  onCancel?: () => void;
  initialTrim?: { start: number; end: number }; // in seconds
}

export interface TrimSettings {
  startTime: number;
  endTime: number;
  duration: number;
}

const MIN_SELECTION_GAP = 0.05; // 5% minimum gap
const HANDLE_OVERLAP_PX = 4;
const MIN_TRIM_DURATION = 0.1; // Minimum 100ms trim duration

export default function TrimVideoModal({ 
  isOpen, 
  onClose, 
  videoFile,
  videoPath,
  onTrimConfirm,
  onCancel,
  initialTrim
}: TrimVideoModalProps) {
  const { t, language } = useLanguage();
  
  // Log props changes
  useEffect(() => {
    log('TrimVideoModal', 'propsChanged', {
      isOpen,
      hasVideoFile: !!videoFile,
      hasVideoPath: !!videoPath,
      videoFileName: videoFile?.name,
      videoPathValue: videoPath,
      videoFileSize: videoFile?.size
    });
  }, [isOpen, videoFile, videoPath]);
  const railRef = useRef<HTMLDivElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [videoLoadState, setVideoLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [selection, setSelection] = useState<{ start: number; end: number }>({
    start: 0,
    end: 1,
  });
  const [activeHandle, setActiveHandle] = useState<'start' | 'end' | null>(null);
  const [railWidth, setRailWidth] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackMode, setPlaybackMode] = useState<'full' | 'trimmed'>('full');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Initialize video when modal opens
  useEffect(() => {
    log('TrimVideoModal', 'initEffect_start', {
      isOpen,
      hasVideoFile: !!videoFile,
      hasVideoPath: !!videoPath,
      videoFileName: videoFile?.name,
      videoPathValue: videoPath,
      initialTrim
    });

    if (isOpen) {
      let url = '';
      
      if (videoFile) {
        url = URL.createObjectURL(videoFile);
        log('TrimVideoModal', 'initEffect_createdBlobUrl', {
          blobUrl: url,
          fileName: videoFile.name,
          fileSize: videoFile.size,
          fileType: videoFile.type
        });
        setVideoUrl(url);
      } else if (videoPath) {
        url = videoPath;
        log('TrimVideoModal', 'initEffect_usingVideoPath', {
          videoPath: url
        });
        setVideoUrl(url);
      } else {
        log('TrimVideoModal', 'initEffect_noVideoSource', {
          warning: 'No videoFile or videoPath provided'
        });
      }
      
      setVideoLoadState('loading');
      log('TrimVideoModal', 'initEffect_setLoadingState', {
        videoUrl: url || 'none'
      });
      
      // Reset selection
      if (initialTrim && duration > 0) {
        const newSelection = {
          start: initialTrim.start / duration,
          end: initialTrim.end / duration,
        };
        log('TrimVideoModal', 'initEffect_setInitialTrim', {
          initialTrim,
          duration,
          selection: newSelection
        });
        setSelection(newSelection);
      } else {
        log('TrimVideoModal', 'initEffect_setDefaultSelection', {
          selection: { start: 0, end: 1 }
        });
        setSelection({ start: 0, end: 1 });
      }
    } else {
      log('TrimVideoModal', 'initEffect_modalClosed', {
        cleaningUp: true
      });
    }
    
    // Cleanup blob URL on unmount
    return () => {
      if (videoUrl && videoFile) {
        log('TrimVideoModal', 'initEffect_cleanup', {
          revokingBlobUrl: videoUrl
        });
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [isOpen, videoFile, videoPath, initialTrim, duration]);

  // Handle video metadata load
  const handleVideoLoadedMetadata = useCallback(() => {
    const video = previewVideoRef.current;
    
    log('TrimVideoModal', 'handleVideoLoadedMetadata_start', {
      hasVideoRef: !!video,
      videoSrc: video?.src,
      videoCurrentSrc: video?.currentSrc,
      videoNetworkState: video?.networkState,
      videoReadyState: video?.readyState
    });
    
    if (!video) {
      log('TrimVideoModal', 'handleVideoLoadedMetadata_noVideoRef', {
        error: 'Video ref is null'
      });
      return;
    }
    
    const videoDuration = video.duration;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    log('TrimVideoModal', 'handleVideoLoadedMetadata_metadata', {
      duration: videoDuration,
      width: videoWidth,
      height: videoHeight,
      isValidDuration: isFinite(videoDuration) && videoDuration > 0
    });
    
    if (!isFinite(videoDuration) || videoDuration <= 0) {
      log('TrimVideoModal', 'handleVideoLoadedMetadata_invalidDuration', {
        duration: videoDuration,
        error: 'Invalid video duration'
      });
      setVideoLoadState('error');
      return;
    }
    
    setDuration(videoDuration);
    setVideoLoadState('loaded');
    
    log('TrimVideoModal', 'handleVideoLoadedMetadata_stateUpdated', {
      duration: videoDuration,
      loadState: 'loaded'
    });
    
    // Set initial trim if provided
    if (initialTrim) {
      const newSelection = {
        start: initialTrim.start / videoDuration,
        end: initialTrim.end / videoDuration,
      };
      log('TrimVideoModal', 'handleVideoLoadedMetadata_setInitialTrim', {
        initialTrim,
        videoDuration,
        selection: newSelection
      });
      setSelection(newSelection);
    } else {
      log('TrimVideoModal', 'handleVideoLoadedMetadata_setDefaultSelection', {
        selection: { start: 0, end: 1 }
      });
      setSelection({ start: 0, end: 1 });
    }
  }, [initialTrim]);

  // Handle video error
  const handleVideoError = useCallback((event?: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = previewVideoRef.current;
    
    log('TrimVideoModal', 'handleVideoError', {
      hasVideoRef: !!video,
      videoSrc: video?.src,
      videoCurrentSrc: video?.currentSrc,
      videoError: video?.error,
      errorCode: video?.error?.code,
      errorMessage: video?.error?.message,
      networkState: video?.networkState,
      readyState: video?.readyState,
      eventType: event?.type
    });
    
    setVideoLoadState('error');
    
    if (video?.error) {
      const errorMessages: Record<number, string> = {
        1: 'MEDIA_ERR_ABORTED - The user aborted the video',
        2: 'MEDIA_ERR_NETWORK - A network error occurred',
        3: 'MEDIA_ERR_DECODE - The video was aborted or corrupted',
        4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - The video format is not supported'
      };
      
      log('TrimVideoModal', 'handleVideoError_details', {
        errorCode: video.error.code,
        errorMessage: errorMessages[video.error.code] || 'Unknown error',
        videoSrc: video.src
      });
    }
  }, []);

  // Update video time
  const handleVideoTimeUpdate = useCallback(() => {
    const video = previewVideoRef.current;
    if (video) {
      const newTime = video.currentTime;
      setCurrentTime(newTime);
      
      // Handle trimmed playback looping
      if (playbackMode === 'trimmed' && duration > 0) {
        const startTime = selection.start * duration;
        const endTime = selection.end * duration;
        
        if (video.currentTime >= endTime) {
          log('TrimVideoModal', 'handleVideoTimeUpdate_loop', {
            currentTime: video.currentTime,
            endTime,
            loopingTo: startTime
          });
          video.currentTime = startTime;
        }
      }
    }
  }, [playbackMode, selection, duration]);

  // Handle video end
  const handleVideoEnded = useCallback(() => {
    if (playbackMode === 'trimmed' && duration > 0) {
      const video = previewVideoRef.current;
      if (video) {
        const startTime = selection.start * duration;
        video.currentTime = startTime;
        video.play();
      }
    } else {
      setIsPlaying(false);
    }
  }, [playbackMode, selection, duration]);

  // Play/Pause handler
  const handlePlayPause = useCallback(() => {
    const video = previewVideoRef.current;
    
    log('TrimVideoModal', 'handlePlayPause_start', {
      hasVideo: !!video,
      isPaused: video?.paused,
      playbackMode,
      duration
    });
    
    if (!video) {
      log('TrimVideoModal', 'handlePlayPause_noVideo', {
        error: 'Video ref is null'
      });
      return;
    }

    if (video.paused) {
      if (playbackMode === 'trimmed' && duration > 0) {
        const startTime = selection.start * duration;
        log('TrimVideoModal', 'handlePlayPause_seekToStart', {
          startTime,
          selection
        });
        video.currentTime = startTime;
      }
      video.play().catch((error) => {
        log('TrimVideoModal', 'handlePlayPause_playError', {
          error: error.message,
          videoSrc: video.src
        });
      });
      setIsPlaying(true);
      log('TrimVideoModal', 'handlePlayPause_playing', {
        playbackMode
      });
    } else {
      video.pause();
      setIsPlaying(false);
      log('TrimVideoModal', 'handlePlayPause_paused', {});
    }
  }, [playbackMode, selection, duration]);

  // Update selection from mouse position
  const updateFromClientX = useCallback((clientX: number, handle: 'start' | 'end') => {
    const rail = railRef.current;
    if (!rail) return;

    const rect = rail.getBoundingClientRect();
    if (rect.width === 0) return;

    const clamp = (value: number) => Math.min(Math.max(value, 0), 1);
    const percent = clamp((clientX - rect.left) / rect.width);

    setSelection((prev) => {
      if (handle === 'start') {
        const nextStart = Math.min(percent, prev.end - MIN_SELECTION_GAP);
        const newStart = clamp(nextStart);
        
        // Scrub video to new start time
        if (previewVideoRef.current && duration > 0) {
          previewVideoRef.current.currentTime = newStart * duration;
        }
        
        return {
          start: newStart,
          end: prev.end,
        };
      }
      const nextEnd = Math.max(percent, prev.start + MIN_SELECTION_GAP);
      const newEnd = clamp(nextEnd);
      
      // Scrub video to new end time
      if (previewVideoRef.current && duration > 0) {
        previewVideoRef.current.currentTime = newEnd * duration;
      }
      
      return {
        start: prev.start,
        end: newEnd,
      };
    });
  }, [duration]);

  // Pointer event handlers
  useEffect(() => {
    if (!activeHandle) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault();
      updateFromClientX(event.clientX, activeHandle);
    };

    const handlePointerUp = () => {
      setActiveHandle(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [activeHandle, updateFromClientX]);

  const handlePointerDown = useCallback(
    (handle: 'start' | 'end') => (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setActiveHandle(handle);
      updateFromClientX(event.clientX, handle);
    },
    [updateFromClientX]
  );

  // Calculate percentages
  const startPercent = selection.start * 100;
  const endPercent = selection.end * 100;
  
  const leftOverlayWidthPercent = useMemo(() => {
    if (!railWidth) {
      return startPercent;
    }
    const widthWithOverlap = selection.start * railWidth + HANDLE_OVERLAP_PX;
    const percent = (widthWithOverlap / railWidth) * 100;
    return Math.min(100, Math.max(0, percent));
  }, [railWidth, selection.start, startPercent]);

  const rightOverlayLeftPercent = useMemo(() => {
    if (!railWidth) {
      return endPercent;
    }
    const leftWithOverlap = selection.end * railWidth - HANDLE_OVERLAP_PX;
    const percent = (leftWithOverlap / railWidth) * 100;
    return Math.max(0, Math.min(100, percent));
  }, [railWidth, selection.end, endPercent]);

  // Update rail width on resize
  useEffect(() => {
    const updateRailWidth = () => {
      if (railRef.current) {
        setRailWidth(railRef.current.offsetWidth);
      }
    };

    updateRailWidth();
    window.addEventListener('resize', updateRailWidth);

    return () => {
      window.removeEventListener('resize', updateRailWidth);
    };
  }, []);

  // Format time helper
  const formatTime = useCallback((seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return '00:00.00';
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins.toString().padStart(2, '0')}:${secs.padStart(5, '0')}`;
  }, []);

  // Calculate trimmed duration
  const trimmedDuration = useMemo(() => {
    if (!duration) return 0;
    return (selection.end - selection.start) * duration;
  }, [selection, duration]);

  // Validate selection
  const isValidSelection = useMemo(() => {
    if (!duration) return false;
    return trimmedDuration >= MIN_TRIM_DURATION;
  }, [trimmedDuration, duration]);

  // Toggle playback mode
  const togglePlaybackMode = useCallback(() => {
    setPlaybackMode(prev => prev === 'full' ? 'trimmed' : 'full');
    const video = previewVideoRef.current;
    if (video && isPlaying) {
      video.pause();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  // Trim confirmation handler
  const handleTrimConfirm = useCallback(async () => {
    log('TrimVideoModal', 'handleTrimConfirm_start', {
      hasVideoUrl: !!videoUrl,
      duration,
      isValidSelection,
      selection,
      hasVideoFile: !!videoFile,
      hasVideoPath: !!videoPath,
      hasOnTrimConfirm: !!onTrimConfirm
    });
    
    if (!videoUrl || !duration || !isValidSelection) {
      log('TrimVideoModal', 'handleTrimConfirm_validationFailed', {
        hasVideoUrl: !!videoUrl,
        duration,
        isValidSelection
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const startTime = selection.start * duration;
      const endTime = selection.end * duration;
      
      log('TrimVideoModal', 'handleTrimConfirm_calculatedTimes', {
        startTime,
        endTime,
        trimDuration: endTime - startTime
      });
      
      // Determine video source
      const videoSource = videoFile || videoPath;
      if (!videoSource) {
        log('TrimVideoModal', 'handleTrimConfirm_noVideoSource', {
          error: 'No video source available'
        });
        throw new Error('No video source available');
      }
      
      log('TrimVideoModal', 'handleTrimConfirm_callingAPI', {
        videoSourceType: videoFile ? 'File' : 'Path',
        videoSource: videoFile ? videoFile.name : videoPath
      });
      
      // Call backend API
      const designTemplateApi = await import('@/lib/designTemplateApi');
      const result = await designTemplateApi.trimVideo(videoSource, startTime, endTime);
      
      log('TrimVideoModal', 'handleTrimConfirm_apiResult', {
        hasFilePath: !!result.file_path,
        filePath: result.file_path
      });
      
      if (result.file_path) {
        // Call parent callback with trimmed video if provided
        if (onTrimConfirm) {
          log('TrimVideoModal', 'handleTrimConfirm_callingCallback', {
            trimmedVideoPath: result.file_path
          });
          onTrimConfirm(result.file_path, {
            startTime,
            endTime,
            duration: endTime - startTime
          });
        } else {
          // If no callback provided, just log and close
          log('TrimVideoModal', 'handleTrimConfirm_noCallback', {
            warning: 'onTrimConfirm callback not provided',
            trimmedVideoPath: result.file_path
          });
        }
        
        // Close modal
        log('TrimVideoModal', 'handleTrimConfirm_success', {
          trimmedVideoPath: result.file_path
        });
        onClose();
      } else {
        log('TrimVideoModal', 'handleTrimConfirm_noFilePath', {
          error: 'No file path returned from trim operation',
          result
        });
        throw new Error('No file path returned from trim operation');
      }
    } catch (error) {
      log('TrimVideoModal', 'handleTrimConfirm_error', {
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined
      });
      console.error('Trim error:', error);
      // TODO: Show error message to user
      alert('Failed to trim video. Please try again.');
    } finally {
      setIsProcessing(false);
      log('TrimVideoModal', 'handleTrimConfirm_finished', {
        isProcessing: false
      });
    }
  }, [videoUrl, duration, isValidSelection, selection, videoFile, videoPath, onTrimConfirm, onClose]);

  // Log video URL changes
  useEffect(() => {
    log('TrimVideoModal', 'videoUrlStateChanged', {
      videoUrl: videoUrl ? (videoUrl.length > 50 ? videoUrl.substring(0, 50) + '...' : videoUrl) : 'none',
      hasVideoUrl: !!videoUrl,
      videoLoadState,
      isOpen
    });
  }, [videoUrl, videoLoadState, isOpen]);

  // Log component render
  useEffect(() => {
    log('TrimVideoModal', 'componentRender', {
      isOpen,
      videoLoadState,
      hasVideoUrl: !!videoUrl,
      videoUrl: videoUrl ? (videoUrl.length > 50 ? videoUrl.substring(0, 50) + '...' : videoUrl) : 'none',
      duration,
      selection,
      isProcessing,
      hasVideoFile: !!videoFile,
      hasVideoPath: !!videoPath
    });
  }, [isOpen, videoLoadState, videoUrl, duration, selection, isProcessing, videoFile, videoPath]);

  if (!isOpen) {
    log('TrimVideoModal', 'notRendering_modalClosed', {});
    return null;
  }
  
  log('TrimVideoModal', 'rendering', {
    videoLoadState,
    hasVideoUrl: !!videoUrl,
    duration,
    selection
  });

  const actionButtonWidth = language === 'en' ? '75px' : '85px';
  const startTimeSeconds = selection.start * duration;
  const endTimeSeconds = selection.end * duration;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      />

      <div
        className="relative flex flex-col w-[90vw] h-[90vh] max-w-[90vw] max-h-[90vh] shadow-xl overflow-y-auto"
        style={{
          borderRadius: '12px',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 shadow-md flex items-center justify-center hover:bg-white transition-colors z-10 cursor-pointer"
          type="button"
          disabled={isProcessing}
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="flex-1 w-full flex flex-col justify-center gap-10 px-10 py-4">
          <div className="w-full max-w-[1100px] mx-auto flex flex-col gap-6">
            {/* Video Preview */}
            <div className="w-full max-w-[900px] mx-auto rounded-lg border border-dashed border-[#B0B0B0] bg-black aspect-video overflow-hidden relative">
              {videoLoadState === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                  <div className="ml-4 text-white text-sm">
                    {videoUrl ? 'Loading video...' : 'No video source'}
                  </div>
                </div>
              )}
              
              {videoLoadState === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                  <div className="text-center">
                    <p className="text-sm">Failed to load video</p>
                    <p className="text-xs text-gray-400 mt-2">Please try again</p>
                    {previewVideoRef.current?.error && (
                      <p className="text-xs text-red-400 mt-1">
                        Error: {previewVideoRef.current.error.code} - {previewVideoRef.current.error.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {!videoUrl && videoLoadState === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                  <div className="text-center">
                    <p className="text-sm">No video source provided</p>
                    <p className="text-xs text-gray-400 mt-2">
                      videoFile: {videoFile ? 'provided' : 'missing'}, 
                      videoPath: {videoPath ? videoPath : 'missing'}
                    </p>
                  </div>
                </div>
              )}
              
              {videoUrl && videoLoadState === 'loaded' && (
                <>
                  <video
                    ref={(ref) => {
                      previewVideoRef.current = ref;
                      log('TrimVideoModal', 'videoRef_set', {
                        hasRef: !!ref,
                        videoSrc: ref?.src,
                        videoCurrentSrc: ref?.currentSrc
                      });
                    }}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    muted
                    playsInline
                    onLoadStart={() => {
                      log('TrimVideoModal', 'video_onLoadStart', {
                        videoSrc: previewVideoRef.current?.src
                      });
                    }}
                    onLoadedData={() => {
                      log('TrimVideoModal', 'video_onLoadedData', {
                        videoSrc: previewVideoRef.current?.src,
                        videoWidth: previewVideoRef.current?.videoWidth,
                        videoHeight: previewVideoRef.current?.videoHeight
                      });
                    }}
                    onLoadedMetadata={handleVideoLoadedMetadata}
                    onCanPlay={() => {
                      log('TrimVideoModal', 'video_onCanPlay', {
                        videoSrc: previewVideoRef.current?.src,
                        readyState: previewVideoRef.current?.readyState
                      });
                    }}
                    onCanPlayThrough={() => {
                      log('TrimVideoModal', 'video_onCanPlayThrough', {
                        videoSrc: previewVideoRef.current?.src
                      });
                    }}
                    onTimeUpdate={handleVideoTimeUpdate}
                    onEnded={handleVideoEnded}
                    onError={handleVideoError}
                    onWaiting={() => {
                      log('TrimVideoModal', 'video_onWaiting', {
                        videoSrc: previewVideoRef.current?.src
                      });
                    }}
                    onStalled={() => {
                      log('TrimVideoModal', 'video_onStalled', {
                        videoSrc: previewVideoRef.current?.src
                      });
                    }}
                    onSuspend={() => {
                      log('TrimVideoModal', 'video_onSuspend', {
                        videoSrc: previewVideoRef.current?.src
                      });
                    }}
                  />
                  
                  {/* Play/Pause overlay */}
                  {!isPlaying && (
                    <button
                      onClick={handlePlayPause}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors z-10"
                    >
                      <div className="bg-white/90 rounded-full p-4">
                        <Play className="w-8 h-8 text-gray-900 ml-1" />
                      </div>
                    </button>
                  )}
                  
                  {/* Time indicator overlay */}
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                  
                  {/* Playback mode indicator */}
                  <div className="absolute top-4 left-4 bg-blue-600/80 text-white px-3 py-1 rounded text-xs">
                    {playbackMode === 'trimmed' ? 'Trimmed Preview' : 'Full Video'}
                  </div>
                </>
              )}
            </div>

            {/* Trim Rail */}
            <div className="relative w-full">
              {/* Time markers */}
              {duration > 0 && (
                <div className="absolute top-0 left-0 right-0 h-4 flex justify-between text-xs text-gray-500 px-1 mb-2">
                  <span>{formatTime(0)}</span>
                  <span>{formatTime(duration / 2)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              )}
              
              <div ref={railRef} className="relative h-[70px] w-full mt-6">
                <div className="absolute inset-0 flex h-full w-full overflow-hidden rounded-[6px] bg-white/40 gap-1">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex-1 h-full rounded-[6px]"
                      style={{
                        backgroundColor: '#878787',
                      }}
                    />
                  ))}
                </div>

                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[6px]">
                  <div
                    className="absolute inset-y-0 bg-white/40"
                    style={{
                      left: 0,
                      width: `${leftOverlayWidthPercent}%`,
                    }}
                  />
                  <div
                    className="absolute inset-y-0 bg-white/40"
                    style={{
                      left: `${rightOverlayLeftPercent}%`,
                      right: 0,
                    }}
                  />
                  
                  {/* Selected region highlight */}
                  <div
                    className="absolute inset-y-0 bg-blue-500/20 border-y-2 border-blue-500"
                    style={{
                      left: `${startPercent}%`,
                      width: `${endPercent - startPercent}%`,
                    }}
                  />
                </div>

                <button
                  type="button"
                  className="absolute top-1/2 z-20 flex h-[70px] w-3 cursor-ew-resize items-center justify-center rounded-l-[6px] bg-[#0F58F9] shadow-sm transition-opacity hover:opacity-90"
                  style={{ left: `${startPercent}%`, transform: 'translateY(-50%)' }}
                  aria-label={t('modals.trimVideo.adjustTrimStart', 'Adjust trim start')}
                  onPointerDown={handlePointerDown('start')}
                  disabled={isProcessing}
                >
                  <span
                    style={{ width: '2px', height: '20px', backgroundColor: '#FFFFFF', borderRadius: '2px' }}
                  />
                </button>

                <button
                  type="button"
                  className="absolute top-1/2 z-20 flex h-[70px] w-3 cursor-ew-resize items-center justify-center rounded-r-[6px] bg-[#0F58F9] shadow-sm transition-opacity hover:opacity-90"
                  style={{ left: `${endPercent}%`, transform: 'translate(-100%, -50%)' }}
                  aria-label={t('modals.trimVideo.adjustTrimEnd', 'Adjust trim end')}
                  onPointerDown={handlePointerDown('end')}
                  disabled={isProcessing}
                >
                  <span
                    style={{ width: '2px', height: '20px', backgroundColor: '#FFFFFF', borderRadius: '2px' }}
                  />
                </button>
              </div>
              
              {/* Playback mode toggle */}
              <div className="mt-4 flex items-center justify-center">
                <button
                  onClick={togglePlaybackMode}
                  className="px-4 py-2 text-xs font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                  disabled={isProcessing}
                >
                  {playbackMode === 'full' ? 'Preview Trimmed' : 'Preview Full'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className="w-full px-10"
          style={{ borderTop: '1px solid #E0E0E0', paddingTop: '20px', paddingBottom: '20px' }}
        >
          <div className="w-full max-w-[1100px] mx-auto flex items-center justify-between">
            <div className="space-y-2">
              <div className="text-sm font-medium" style={{ color: '#171718' }}>
                {t('modals.trimVideo.trimmedLengthLabel', 'Trimmed video length')}
              </div>
              <div className="text-xs" style={{ color: '#878787' }}>
                {formatTime(trimmedDuration)} ({formatTime(startTimeSeconds)} - {formatTime(endTimeSeconds)})
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel || onClose}
                className="px-4 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center justify-center"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#171718',
                  border: '1px solid #171718',
                  width: actionButtonWidth,
                }}
                disabled={isProcessing}
              >
                {t('actions.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleTrimConfirm}
                disabled={!isValidSelection || isProcessing}
                className="px-4 py-2 text-xs font-medium rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#0F58F9',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  width: actionButtonWidth,
                }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.8333 1.16667L3.91333 9.08667M8.14667 8.15333L11.8333 11.8333M3.91333 3.91333L6.5 6.5M4.5 2.5C4.5 3.60457 3.60457 4.5 2.5 4.5C1.39543 4.5 0.5 3.60457 0.5 2.5C0.5 1.39543 1.39543 0.5 2.5 0.5C3.60457 0.5 4.5 1.39543 4.5 2.5ZM4.5 10.5C4.5 11.6046 3.60457 12.5 2.5 12.5C1.39543 12.5 0.5 11.6046 0.5 10.5C0.5 9.39543 1.39543 8.5 2.5 8.5C3.60457 8.5 4.5 9.39543 4.5 10.5Z" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t('modals.trimVideo.confirm', 'Trim')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
