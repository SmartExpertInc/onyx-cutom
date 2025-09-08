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

  if (!dataToDisplay) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">No video data available</span>
      </div>
    );
  }

  const handleDownload = async () => {
    try {
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
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video
              className="w-full h-full object-contain"
              controls
              preload="metadata"
              poster={dataToDisplay.thumbnailUrl ? 
                (dataToDisplay.thumbnailUrl.startsWith('http') 
                  ? dataToDisplay.thumbnailUrl 
                  : `${CUSTOM_BACKEND_URL}${dataToDisplay.thumbnailUrl}`) 
                : undefined}
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
            >
              <source src={
                dataToDisplay.videoUrl.startsWith('http') 
                  ? dataToDisplay.videoUrl 
                  : `${CUSTOM_BACKEND_URL}${dataToDisplay.videoUrl}`
              } type="video/mp4" />
              Your browser does not support the video tag.
            </video>
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
