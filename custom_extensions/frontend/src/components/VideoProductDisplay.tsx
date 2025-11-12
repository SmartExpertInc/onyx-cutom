// custom_extensions/frontend/src/components/VideoProductDisplay.tsx
"use client";

import React, { useState } from 'react';
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
  const { t } = useLanguage();
  
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

  // Format date as "28th Oct, 25"
  const formatDate = (timestamp: string | Date | undefined) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
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

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <div className="relative w-full overflow-hidden rounded-lg shadow-2xl border border-gray-800" style={{ aspectRatio: '16 / 9' }}>
        <div className="absolute inset-0">
          <div className="absolute top-4 left-4 z-10">
            <div className="px-3 py-1 rounded-full bg-[#CCDBFC] text-[#0F58F9] text-xs font-semibold uppercase tracking-widest">
              {t('videoProductDisplay.generatedVideo', 'Generated Video')}
            </div>
          </div>

          {(dataToDisplay as any)?.videoUrl ? (
            <video
              className="absolute inset-0 w-full h-full object-contain bg-black"
              controls
              controlsList="nodownload"
              poster={(dataToDisplay as any)?.thumbnailUrl}
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
    </div>
  );
};

export default VideoProductDisplay;