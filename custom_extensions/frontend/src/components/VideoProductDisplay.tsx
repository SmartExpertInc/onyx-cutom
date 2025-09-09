'use client';

import React, { useState } from 'react';

const CUSTOM_BACKEND_URL = process.env.NEXT_PUBLIC_CUSTOM_BACKEND_URL || '/api/custom-projects-backend';

interface VideoProductData {
  videoJobId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  generatedAt: string;
  sourceSlides?: any[];
  component_name: string;
}

interface VideoProductDisplayProps {
  dataToDisplay: VideoProductData | null;
  isEditing?: boolean;
  onTextChange?: (path: string[], value: any) => void;
  parentProjectName?: string;
}

export default function VideoProductDisplay({
  dataToDisplay,
  isEditing = false,
  onTextChange,
  parentProjectName
}: VideoProductDisplayProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

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

  // 🔍 ENHANCED DEBUG: Detailed data structure analysis
  console.log('🎬 [VIDEO_PRODUCT_DISPLAY] Received data:', dataToDisplay);
  console.log('🎬 [VIDEO_PRODUCT_DISPLAY] Data type:', typeof dataToDisplay);
  console.log('🎬 [VIDEO_PRODUCT_DISPLAY] Data keys:', dataToDisplay ? Object.keys(dataToDisplay) : 'null');
  console.log('🎬 [VIDEO_PRODUCT_DISPLAY] Full data structure:', JSON.stringify(dataToDisplay, null, 2));
  console.log('🎬 [VIDEO_PRODUCT_DISPLAY] Video URL:', dataToDisplay?.videoUrl);
  console.log('🎬 [VIDEO_PRODUCT_DISPLAY] Thumbnail URL:', dataToDisplay?.thumbnailUrl);
  console.log('🎬 [VIDEO_PRODUCT_DISPLAY] Video Job ID:', dataToDisplay?.videoJobId);
  
  // Test the full video URL
  const fullVideoUrl = dataToDisplay?.videoUrl?.startsWith('http') 
    ? dataToDisplay.videoUrl 
    : `${CUSTOM_BACKEND_URL}${dataToDisplay?.videoUrl}`;
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

  if (!dataToDisplay) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">No video data available</span>
      </div>
    );
  }

  const handleDownload = async () => {
    try {
      // Check if videoUrl exists
      if (!dataToDisplay.videoUrl) {
        throw new Error('Video URL is not available');
      }
      
      // Construct full URL for video download
      const fullVideoUrl = dataToDisplay.videoUrl.startsWith('http') 
        ? dataToDisplay.videoUrl 
        : `${CUSTOM_BACKEND_URL}${dataToDisplay.videoUrl}`;
      
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
      a.download = `video_${dataToDisplay.videoJobId}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              Generated Video
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                Generated: {new Date(dataToDisplay.generatedAt).toLocaleDateString()}
              </span>
              <button
                onClick={handleDownload}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download MP4
              </button>
            </div>
          </div>
        </div>

        {/* Video Content */}
        <div className="p-6">
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            {dataToDisplay.videoUrl ? (
              <video
                key={`${dataToDisplay.videoUrl}-${retryCount}`}
                className="w-full h-full object-contain"
                controls
                preload="metadata"
                playsInline
                crossOrigin="anonymous"
                poster={dataToDisplay.thumbnailUrl ? 
                  (dataToDisplay.thumbnailUrl.startsWith('http') 
                    ? dataToDisplay.thumbnailUrl 
                    : `${CUSTOM_BACKEND_URL}${dataToDisplay.thumbnailUrl}`) 
                  : undefined}
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                onLoadedData={() => console.log('🎬 [VIDEO_PLAYER] Video data loaded successfully')}
                onCanPlay={() => console.log('🎬 [VIDEO_PLAYER] Video can start playing')}
                onError={(e) => {
                  console.error('🎬 [VIDEO_PLAYER] Video error:', e);
                  console.error('🎬 [VIDEO_PLAYER] Video error details:', {
                    error: e.nativeEvent,
                    target: e.target,
                    videoUrl: dataToDisplay.videoUrl,
                    fullUrl: dataToDisplay.videoUrl.startsWith('http') 
                      ? dataToDisplay.videoUrl 
                      : `${CUSTOM_BACKEND_URL}${dataToDisplay.videoUrl}`
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
                    dataToDisplay.videoUrl.startsWith('http') 
                      ? dataToDisplay.videoUrl 
                      : `${CUSTOM_BACKEND_URL}${dataToDisplay.videoUrl}`
                  } 
                  type="video/mp4" 
                  onError={(e) => {
                    console.error('🎬 [VIDEO_PLAYER] MP4 source error:', e);
                    setVideoError('MP4 video source failed to load');
                  }}
                />
                <source 
                  src={
                    dataToDisplay.videoUrl.startsWith('http') 
                      ? dataToDisplay.videoUrl 
                      : `${CUSTOM_BACKEND_URL}${dataToDisplay.videoUrl}`
                  } 
                  type="video/webm" 
                  onError={(e) => {
                    console.error('🎬 [VIDEO_PLAYER] WebM source error:', e);
                  }}
                />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white">Video URL not available</span>
              </div>
            )}
            
            {/* Error Display */}
            {videoError && (
              <div className="absolute inset-0 bg-red-900 bg-opacity-75 flex items-center justify-center">
                <div className="text-white text-center">
                  <p className="text-lg font-semibold">Video Error</p>
                  <p className="text-sm">{videoError}</p>
                  <div className="mt-4 space-x-2">
                    {retryCount < 3 && (
                      <button 
                        onClick={retryVideoLoad}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Retry ({retryCount}/3)
                      </button>
                    )}
                    <button 
                      onClick={() => setVideoError(null)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Source Information */}
        {dataToDisplay.sourceSlides && dataToDisplay.sourceSlides.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Source Slides</h3>
            <div className="text-sm text-gray-600">
              This video was generated from {dataToDisplay.sourceSlides.length} slide(s)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
