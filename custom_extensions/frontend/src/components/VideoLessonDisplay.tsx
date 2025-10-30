// custom_extensions/frontend/src/components/VideoLessonDisplay.tsx
"use client";

import React from 'react';
import { VideoLessonData } from '@/types/videoLessonTypes';

interface VideoLessonDisplayProps {
  dataToDisplay: VideoLessonData | null;
  isEditing?: boolean;
  onTextChange?: (path: (string | number)[], newValue: string | number | boolean) => void;
  className?: string;
  parentProjectName?: string;
  lessonNumber?: number;
}

const VideoLessonDisplay = ({
  dataToDisplay,
  isEditing,
  onTextChange,
  className = "",
  parentProjectName,
  lessonNumber,
}: VideoLessonDisplayProps): React.JSX.Element | null => {
  return (
    <div 
      className="flex gap-4 mt-[5px] mx-auto mb-[5px]" 
      style={{ 
        height: 'calc(100vh - 85px)',
        maxWidth: '1376px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 92.67px)',
        gap: '24px'
      }}
    >
      {/* Main Content Area - Horizontal layout */}
      {/* Calculate available height: 100vh - ProductViewHeader (64px) - padding */}
      {/* Grid container for 1440px viewport: 12 columns × 92.67px, 24px gutters */}
      {/* Parent has 32px padding on each side (64px total), leaving 1376px for grid */}
      
      {/* Left section - 7 columns */}
      <div style={{ gridColumn: 'span 7' }}>
        <p className="text-gray-500">Video lesson area</p>
      </div>

      {/* Right section - 5 columns */}
      <div style={{ gridColumn: 'span 5' }}>
        <p className="text-gray-500">Comments area</p>
      </div>
    </div>
  );
};

export default VideoLessonDisplay;
