// custom_extensions/frontend/src/components/VideoProductDisplay.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VideoLessonData } from '@/types/videoLessonTypes';
import { useLanguage } from '@/contexts/LanguageContext';

interface VideoProductDisplayProps {
  dataToDisplay: VideoLessonData | null;
  isEditing?: boolean;
  onTextChange?: (path: (string | number)[], newValue: string | number | boolean) => void;
  className?: string;
  parentProjectName?: string;
  lessonNumber?: number;
  productId?: string;
  createdAt?: string;
  isAuthorized?: boolean;
}

const VideoProductDisplay = ({
  dataToDisplay,
  isEditing,
  onTextChange,
  className = "",
  parentProjectName,
  lessonNumber,
  productId,
  createdAt,
  isAuthorized = true,
}: VideoProductDisplayProps): React.JSX.Element | null => {
  const router = useRouter();
  const { t } = useLanguage();
  
  // Video playback state
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

  // 🔍 ENHANCED DEBUG: Detailed data structure analysis
  console.log('🎬 [VIDEO_PRODUCT_DISPLAY] Received data:', dataToDisplay);
  console.log('🎬 [VIDEO_PRODUCT_DISPLAY] Data type:', typeof dataToDisplay);
  console.log('🎬 [VIDEO_PRODUCT_DISPLAY] Data keys:', dataToDisplay ? Object.keys(dataToDisplay) : 'null');
  console.log('🎬 [VIDEO_PRODUCT_DISPLAY] Full data structure:', JSON.stringify(dataToDisplay, null, 2));
  console.log('🎬 [VIDEO_PRODUCT_DISPLAY] Video URL:', (dataToDisplay as any)?.videoUrl);
  console.log('🎬 [VIDEO_PRODUCT_DISPLAY] Thumbnail URL:', (dataToDisplay as any)?.thumbnailUrl);
  console.log('🎬 [VIDEO_PRODUCT_DISPLAY] Video Job ID:', (dataToDisplay as any)?.videoJobId);
  
  // Test the full video URL
  const fullVideoUrl = (dataToDisplay as any)?.videoUrl?.startsWith('http') 
    ? (dataToDisplay as any)?.videoUrl 
    : `${CUSTOM_BACKEND_URL}${(dataToDisplay as any)?.videoUrl}`;
  console.log('🎬 [VIDEO_PRODUCT_DISPLAY] Full Video URL:', fullVideoUrl);
  
  // 🔍 CRITICAL DEBUG: Check for nested data structure
  if (dataToDisplay && typeof dataToDisplay === 'object') {
    console.log('🎬 [VIDEO_PRODUCT_DISPLAY] Checking for nested video data...');
    console.log('🎬 [VIDEO_PRODUCT_DISPLAY] Has videoUrl property:', 'videoUrl' in dataToDisplay);
    console.log('🎬 [VIDEO_PRODUCT_DISPLAY] Has thumbnailUrl property:', 'thumbnailUrl' in dataToDisplay);
    console.log('🎬 [VIDEO_PRODUCT_DISPLAY] Has videoJobId property:', 'videoJobId' in dataToDisplay);
    
     // Check if data might be nested in another property
     Object.keys(dataToDisplay).forEach(key => {
       const value = (dataToDisplay as any)[key];
       if (value && typeof value === 'object') {
         console.log(`🎬 [VIDEO_PRODUCT_DISPLAY] Nested object in '${key}':`, value);
         if (value.videoUrl || value.thumbnailUrl || value.videoJobId) {
           console.log(`🎬 [VIDEO_PRODUCT_DISPLAY] ⚠️ FOUND VIDEO DATA IN NESTED OBJECT '${key}'!`, {
             videoUrl: value.videoUrl,
             thumbnailUrl: value.thumbnailUrl,
             videoJobId: value.videoJobId
           });
         }
       }
     });
  }

  const handleDraftClick = () => {
    if (productId) {
      router.push(`/projects-2/view/${productId}`);
    }
  };

  // Retry function for failed video loads
  const retryVideoLoad = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setVideoError(null);
      console.log(`🎬 [VIDEO_PLAYER] Retrying video load (attempt ${retryCount + 1}/3)`);
    } else {
      setVideoError('Video failed to load after multiple attempts. Please refresh the page.');
    }
  };

  // Download/Export video function
  const handleDownload = async () => {
    try {
      // Check if videoUrl exists
      const videoUrl = (dataToDisplay as any)?.videoUrl;
      if (!videoUrl) {
        throw new Error('Video URL is not available');
      }
      
      // Construct full URL for video download
      const fullVideoUrl = videoUrl.startsWith('http') 
        ? videoUrl 
        : `${CUSTOM_BACKEND_URL}${videoUrl}`;
      
      const response = await fetch(fullVideoUrl, {
        method: 'GET',
        headers: {
          'Accept': 'video/mp4',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video_product_${productId || 'download'}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };


  // Format date as "28th Oct, 25"
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear().toString().slice(-2);
      
      // Add ordinal suffix
      const suffix = (day: number) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };
      
      return `${day}${suffix(day)} ${month}, ${year}`;
    } catch {
      return '';
    }
  };

  const hasValidVideoUrl = (dataToDisplay as any)?.videoUrl && (dataToDisplay as any)?.videoUrl.startsWith('http');

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <div className="relative w-full overflow-hidden rounded-xl shadow-2xl border border-gray-800" style={{ aspectRatio: '16 / 9' }}>
        <div className="absolute inset-0">
          <div className="absolute top-4 left-4 z-10">
            <div className="px-3 py-1 rounded-full bg-[#CCDBFC] text-[#0F58F9] text-xs font-semibold uppercase tracking-widest">
              {t('videoProductDisplay.generatedVideo', 'Generated Video')}
            </div>
          </div>

          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1 rounded-md bg-[#0F58F9] text-white text-xs font-semibold uppercase tracking-wider hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {t('videoProductDisplay.export', 'Export')}
            </button>
            <button
              onClick={() => setIsVideoPlaying((prev) => !prev)}
              className="px-3 py-1 rounded-md bg-white text-[#0F58F9] text-xs font-semibold uppercase tracking-wider border border-[#0F58F9] hover:bg-[#F0F4FF] transition-colors cursor-pointer"
            >
              {isVideoPlaying ? t('videoProductDisplay.pause', 'Pause') : t('videoProductDisplay.play', 'Play')}
            </button>
          </div>

          {hasValidVideoUrl ? (
            <video
              className="absolute inset-0 w-full h-full object-contain bg-black"
              controls
              controlsList="nodownload"
              poster={(dataToDisplay as any)?.thumbnailUrl}
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
              onError={(e) => {
                console.error('🎬 [VIDEO_PLAYER] Video error:', e);
                console.error('🎬 [VIDEO_PLAYER] Video error details:', {
                  error: e.nativeEvent,
                  target: e.target,
                  videoUrl: (dataToDisplay as any)?.videoUrl,
                  fullUrl: (dataToDisplay as any)?.videoUrl.startsWith('http')
                    ? (dataToDisplay as any)?.videoUrl
                    : `${CUSTOM_BACKEND_URL}${(dataToDisplay as any)?.videoUrl}`
                });
                setVideoError('Failed to load video. Please check the video file.');
              }}
              onAbort={() => {
                console.log('🎬 [VIDEO_PLAYER] Video loading aborted');
                setVideoError('Video loading was interrupted');
              }}
              onStalled={() => {
                console.log('🎬 [VIDEO_PLAYER] Video loading stalled');
                setVideoError('Video loading stalled. Please try again.');
              }}
              onLoadStart={() => console.log('🎬 [VIDEO_PLAYER] Video loading started')}
              onLoadedMetadata={() => console.log('🎬 [VIDEO_PLAYER] Video metadata loaded')}
            >
              <source
                src={
                  (dataToDisplay as any)?.videoUrl.startsWith('http')
                    ? (dataToDisplay as any)?.videoUrl
                    : `${CUSTOM_BACKEND_URL}${(dataToDisplay as any)?.videoUrl}`
                }
                type="video/mp4"
                onError={(e) => {
                  console.error('🎬 [VIDEO_PLAYER] MP4 source error:', e);
                  setVideoError('MP4 video source failed to load');
                }}
              />
              <source
                src={
                  (dataToDisplay as any)?.videoUrl.startsWith('http')
                    ? (dataToDisplay as any)?.videoUrl
                    : `${CUSTOM_BACKEND_URL}${(dataToDisplay as any)?.videoUrl}`
                }
                type="video/webm"
                onError={(e) => {
                  console.error('🎬 [VIDEO_PLAYER] WebM source error:', e);
                }}
              />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 border border-gray-700 shadow-lg">
              <span className="text-gray-400 text-lg">No video available</span>
            </div>
          )}

          {videoError && (
            <div className="absolute inset-0 bg-red-900 bg-opacity-75 flex items-center justify-center">
              <div className="text-white text-center">
                <p className="text-lg font-semibold">Video Error</p>
                <p className="text-sm">{videoError}</p>
                <div className="mt-4 space-x-2">
                  {retryCount < 3 && (
                    <button
                      onClick={retryVideoLoad}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                    >
                      Retry ({retryCount}/3)
                    </button>
                  )}
                  <button
                    onClick={() => setVideoError(null)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-md font-semibold text-[#171718]">
              {parentProjectName || dataToDisplay?.mainPresentationTitle || 'Video Product'}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-[#878787] text-xs">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1918_78510)">
                  <path d="M10.6 11.8C10.6 10.8452 10.2207 9.92955 9.54559 9.25442C8.87045 8.57929 7.95478 8.2 7 8.2M7 8.2C6.04522 8.2 5.12955 8.57929 4.45442 9.25442C3.77928 9.92955 3.4 10.8452 3.4 11.8M7 8.2C8.32548 8.2 9.4 7.12548 9.4 5.8C9.4 4.47452 8.32548 3.4 7 3.4C5.67452 3.4 4.6 4.47452 4.6 5.8C4.6 7.12548 5.67452 8.2 7 8.2ZM13 7C13 10.3137 10.3137 13 7 13C3.68629 13 1 10.3137 1 7C1 3.68629 3.68629 1 7 1C10.3137 1 13 3.68629 13 7Z" stroke="#878787" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <defs>
                  <clipPath id="clip0_1918_78510">
                    <rect width="14" height="14" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <span>username@app.contentbuilder.ai</span>
              {createdAt && (
                <>
                  <span>•</span>
                  <span>{formatDate(createdAt)}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleDraftClick}
              className="px-3 py-2 rounded-md bg-white text-[#171718] border border-[#171718] hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm cursor-pointer"
              style={{ height: '40px' }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.5 11.9142H12.5M9.5 0.914214C9.76522 0.648997 10.1249 0.5 10.5 0.5C10.6857 0.5 10.8696 0.53658 11.0412 0.607651C11.2128 0.678721 11.3687 0.782892 11.5 0.914214C11.6313 1.04554 11.7355 1.20144 11.8066 1.37302C11.8776 1.5446 11.9142 1.7285 11.9142 1.91421C11.9142 2.09993 11.8776 2.28383 11.8066 2.45541C11.7355 2.62699 11.6313 2.78289 11.5 2.91421L3.16667 11.2475L0.5 11.9142L1.16667 9.24755L9.5 0.914214Z" stroke="#171718" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Draft
            </button>
            <button
              className="px-3 py-2 rounded-md bg-white text-[#0F58F9] border border-[#0F58F9] hover:bg-blue-50 transition-colors flex items-center gap-2 text-sm cursor-pointer"
              style={{ height: '40px' }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.29319 7.10401C5.55232 7.45079 5.88293 7.73773 6.26259 7.94537C6.64225 8.153 7.06208 8.27647 7.4936 8.30741C7.92512 8.33834 8.35824 8.27602 8.76358 8.12466C9.16893 7.97331 9.53701 7.73646 9.84287 7.43018L11.6531 5.61814C12.2027 5.04855 12.5068 4.28567 12.4999 3.49382C12.493 2.70197 12.1757 1.9445 11.6163 1.38456C11.057 0.824612 10.3002 0.506995 9.50919 0.500114C8.71813 0.493233 7.95602 0.797639 7.38701 1.34777L6.34915 2.38063M7.70681 5.89599C7.44768 5.54921 7.11707 5.26227 6.73741 5.05463C6.35775 4.847 5.93792 4.72353 5.5064 4.69259C5.07488 4.66166 4.64176 4.72398 4.23642 4.87534C3.83107 5.02669 3.46299 5.26354 3.15713 5.56982L1.34692 7.38186C0.797339 7.95145 0.49324 8.71433 0.500114 9.50618C0.506988 10.298 0.824286 11.0555 1.38367 11.6154C1.94305 12.1754 2.69976 12.493 3.49081 12.4999C4.28187 12.5068 5.04397 12.2024 5.61299 11.6522L6.64482 10.6194" stroke="#0F58F9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Share
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-2 rounded-md bg-[#0F58F9] text-white hover:bg-[#0d4dd4] transition-colors flex items-center gap-2 text-sm cursor-pointer"
              style={{ height: '40px' }}
            >
              <svg width="9" height="11" viewBox="0 0 9 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.1429 7.88542V0.402344M4.1429 7.88542L0.935872 4.67839M4.1429 7.88542L7.34994 4.67839M7.88444 10.0234H0.401367" stroke="white" strokeWidth="0.801758" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoProductDisplay;