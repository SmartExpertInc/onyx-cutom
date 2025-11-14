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
    if (isOpen) {
      let url = '';
      
      if (videoFile) {
        url = URL.createObjectURL(videoFile);
        setVideoUrl(url);
      } else if (videoPath) {
        url = videoPath;
        setVideoUrl(url);
      }
      
      setVideoLoadState('loading');
      
      // Reset selection
      if (initialTrim && duration > 0) {
        setSelection({
          start: initialTrim.start / duration,
          end: initialTrim.end / duration,
        });
      } else {
        setSelection({ start: 0, end: 1 });
      }
    }
    
    // Cleanup blob URL on unmount
    return () => {
      if (videoUrl && videoFile) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [isOpen, videoFile, videoPath, initialTrim, duration]);

  // Handle video metadata load
  const handleVideoLoadedMetadata = useCallback(() => {
    const video = previewVideoRef.current;
    if (!video) return;
    
    const videoDuration = video.duration;
    setDuration(videoDuration);
    setVideoLoadState('loaded');
    
    // Set initial trim if provided
    if (initialTrim) {
      setSelection({
        start: initialTrim.start / videoDuration,
        end: initialTrim.end / videoDuration,
      });
    } else {
      setSelection({ start: 0, end: 1 });
    }
  }, [initialTrim]);

  // Handle video error
  const handleVideoError = useCallback(() => {
    setVideoLoadState('error');
    console.error('Failed to load video');
  }, []);

  // Update video time
  const handleVideoTimeUpdate = useCallback(() => {
    const video = previewVideoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      
      // Handle trimmed playback looping
      if (playbackMode === 'trimmed' && duration > 0) {
        const startTime = selection.start * duration;
        const endTime = selection.end * duration;
        
        if (video.currentTime >= endTime) {
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
    if (!video) return;

    if (video.paused) {
      if (playbackMode === 'trimmed' && duration > 0) {
        const startTime = selection.start * duration;
        video.currentTime = startTime;
      }
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
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
    if (!videoUrl || !duration || !isValidSelection) return;
    
    setIsProcessing(true);
    
    try {
      const startTime = selection.start * duration;
      const endTime = selection.end * duration;
      
      // Determine video source
      const videoSource = videoFile || videoPath;
      if (!videoSource) {
        throw new Error('No video source available');
      }
      
      // Call backend API
      const designTemplateApi = await import('@/lib/designTemplateApi');
      const result = await designTemplateApi.trimVideo(videoSource, startTime, endTime);
      
      if (result.file_path) {
        // Call parent callback with trimmed video if provided
        if (onTrimConfirm) {
          onTrimConfirm(result.file_path, {
            startTime,
            endTime,
            duration: endTime - startTime
          });
        } else {
          // If no callback provided, just log and close
          console.warn('TrimVideoModal: onTrimConfirm callback not provided. Trimmed video path:', result.file_path);
        }
        
        // Close modal
        onClose();
      } else {
        throw new Error('No file path returned from trim operation');
      }
    } catch (error) {
      console.error('Trim error:', error);
      // TODO: Show error message to user
      alert('Failed to trim video. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [videoUrl, duration, isValidSelection, selection, videoFile, videoPath, onTrimConfirm, onClose]);

  if (!isOpen) {
    return null;
  }

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
                </div>
              )}
              
              {videoLoadState === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                  <div className="text-center">
                    <p className="text-sm">Failed to load video</p>
                    <p className="text-xs text-gray-400 mt-2">Please try again</p>
                  </div>
                </div>
              )}
              
              {videoUrl && videoLoadState === 'loaded' && (
                <>
                  <video
                    ref={previewVideoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    muted
                    playsInline
                    onLoadedMetadata={handleVideoLoadedMetadata}
                    onTimeUpdate={handleVideoTimeUpdate}
                    onEnded={handleVideoEnded}
                    onError={handleVideoError}
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
