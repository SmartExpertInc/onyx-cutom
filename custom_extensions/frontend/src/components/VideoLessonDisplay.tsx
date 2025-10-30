// custom_extensions/frontend/src/components/VideoLessonDisplay.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { VideoLessonData } from '@/types/videoLessonTypes';

interface VideoLessonDisplayProps {
  dataToDisplay: VideoLessonData | null;
  isEditing?: boolean;
  onTextChange?: (path: (string | number)[], newValue: string | number | boolean) => void;
  className?: string;
  parentProjectName?: string;
  lessonNumber?: number;
  productId?: string;
}

const VideoLessonDisplay = ({
  dataToDisplay,
  isEditing,
  onTextChange,
  className = "",
  parentProjectName,
  lessonNumber,
  productId,
}: VideoLessonDisplayProps): React.JSX.Element | null => {
  const router = useRouter();

  const handleDraftClick = () => {
    if (productId) {
      router.push(`/custom-projects-ui/projects-2/view/${productId}`);
    }
  };

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
        <div 
          className="flex items-center justify-center rounded-lg bg-gray-900 border border-gray-700 shadow-lg"
          style={{ 
            aspectRatio: '16 / 9',
            width: '100%'
          }}
        >
          <p className="text-gray-400 text-lg">Video lesson area</p>
        </div>
        
        {/* Title and Action Buttons */}
        <div className="flex items-center justify-between mt-4">
          {/* Left: Video Lesson Title */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {dataToDisplay?.title || 'Video Lesson Title'}
            </h2>
          </div>
          
          {/* Right: Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDraftClick}
              className="px-4 py-2 rounded-md bg-white text-[#171718] border border-[#171718] hover:bg-gray-50 transition-colors flex items-center gap-2"
              style={{ height: '40px' }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.5 11.9142H12.5M9.5 0.914214C9.76522 0.648997 10.1249 0.5 10.5 0.5C10.6857 0.5 10.8696 0.53658 11.0412 0.607651C11.2128 0.678721 11.3687 0.782892 11.5 0.914214C11.6313 1.04554 11.7355 1.20144 11.8066 1.37302C11.8776 1.5446 11.9142 1.7285 11.9142 1.91421C11.9142 2.09993 11.8776 2.28383 11.8066 2.45541C11.7355 2.62699 11.6313 2.78289 11.5 2.91421L3.16667 11.2475L0.5 11.9142L1.16667 9.24755L9.5 0.914214Z" stroke="#171718" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Draft
            </button>
            <button
              className="px-4 py-2 rounded-md bg-white text-[#0F58F9] border border-[#0F58F9] hover:bg-blue-50 transition-colors flex items-center gap-2"
              style={{ height: '40px' }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.29319 7.10401C5.55232 7.45079 5.88293 7.73773 6.26259 7.94537C6.64225 8.153 7.06208 8.27647 7.4936 8.30741C7.92512 8.33834 8.35824 8.27602 8.76358 8.12466C9.16893 7.97331 9.53701 7.73646 9.84287 7.43018L11.6531 5.61814C12.2027 5.04855 12.5068 4.28567 12.4999 3.49382C12.493 2.70197 12.1757 1.9445 11.6163 1.38456C11.057 0.824612 10.3002 0.506995 9.50919 0.500114C8.71813 0.493233 7.95602 0.797639 7.38701 1.34777L6.34915 2.38063M7.70681 5.89599C7.44768 5.54921 7.11707 5.26227 6.73741 5.05463C6.35775 4.847 5.93792 4.72353 5.5064 4.69259C5.07488 4.66166 4.64176 4.72398 4.23642 4.87534C3.83107 5.02669 3.46299 5.26354 3.15713 5.56982L1.34692 7.38186C0.797339 7.95145 0.49324 8.71433 0.500114 9.50618C0.506988 10.298 0.824286 11.0555 1.38367 11.6154C1.94305 12.1754 2.69976 12.493 3.49081 12.4999C4.28187 12.5068 5.04397 12.2024 5.61299 11.6522L6.64482 10.6194" stroke="#0F58F9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Share
            </button>
            <button
              className="px-4 py-2 rounded-md bg-[#0F58F9] text-white hover:bg-[#0d4dd4] transition-colors flex items-center gap-2"
              style={{ height: '40px' }}
            >
              <svg width="9" height="11" viewBox="0 0 9 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.1429 7.88542V0.402344M4.1429 7.88542L0.935872 4.67839M4.1429 7.88542L7.34994 4.67839M7.88444 10.0234H0.401367" stroke="white" strokeWidth="0.801758" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Right section - 5 columns */}
      <div style={{ gridColumn: 'span 5' }}>
        <div 
          className="flex items-start p-4 rounded-lg bg-[#F9F9F9] border border-[#E0E0E0]"
          style={{ 
            height: '100%',
            width: '100%'
          }}
        >
          <p className="text-gray-500">Comments area</p>
        </div>
      </div>
    </div>
  );
};

export default VideoLessonDisplay;
