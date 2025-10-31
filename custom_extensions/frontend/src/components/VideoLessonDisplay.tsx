// custom_extensions/frontend/src/components/VideoLessonDisplay.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VideoLessonData } from '@/types/videoLessonTypes';
import { useLanguage } from '@/contexts/LanguageContext';

interface VideoLessonDisplayProps {
  dataToDisplay: VideoLessonData | null;
  isEditing?: boolean;
  onTextChange?: (path: (string | number)[], newValue: string | number | boolean) => void;
  className?: string;
  parentProjectName?: string;
  lessonNumber?: number;
  productId?: string;
  createdAt?: string;
}

const VideoLessonDisplay = ({
  dataToDisplay,
  isEditing,
  onTextChange,
  className = "",
  parentProjectName,
  lessonNumber,
  productId,
  createdAt,
}: VideoLessonDisplayProps): React.JSX.Element | null => {
  const router = useRouter();
  const { t } = useLanguage();
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const handleDraftClick = () => {
    if (productId) {
      router.push(`/custom-projects-ui/projects-2/view/${productId}`);
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

  return (
    <div 
      className="mx-6 mb-[5px] flex gap-4" 
      style={{ 
        height: 'calc(100vh - 85px)'
      }}
    >
      {/* Video lesson section - takes remaining space */}
      <div className="flex-1 flex flex-col gap-6">
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
        <div className="flex items-center justify-between">
          {/* Left: Video Lesson Title */}
          <div>
            <h3 className="text-md font-semibold text-gray-900">
              {parentProjectName || dataToDisplay?.mainPresentationTitle || 'Video Lesson Title'}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-[#878787] text-xs">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1918_78510)">
                  <path d="M10.6 11.8C10.6 10.8452 10.2207 9.92955 9.54559 9.25442C8.87045 8.57929 7.95478 8.2 7 8.2M7 8.2C6.04522 8.2 5.12955 8.57929 4.45442 9.25442C3.77928 9.92955 3.4 10.8452 3.4 11.8M7 8.2C8.32548 8.2 9.4 7.12548 9.4 5.8C9.4 4.47452 8.32548 3.4 7 3.4C5.67452 3.4 4.6 4.47452 4.6 5.8C4.6 7.12548 5.67452 8.2 7 8.2ZM13 7C13 10.3137 10.3137 13 7 13C3.68629 13 1 10.3137 1 7C1 3.68629 3.68629 1 7 1C10.3137 1 13 3.68629 13 7Z" stroke="#878787" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <defs>
                  <clipPath id="clip0_1918_78510">
                    <rect width="14" height="14" fill="white"/>
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
          
          {/* Right: Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDraftClick}
              className="px-4 py-2 rounded-md bg-white text-[#171718] border border-[#171718] hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
              style={{ height: '40px' }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.5 11.9142H12.5M9.5 0.914214C9.76522 0.648997 10.1249 0.5 10.5 0.5C10.6857 0.5 10.8696 0.53658 11.0412 0.607651C11.2128 0.678721 11.3687 0.782892 11.5 0.914214C11.6313 1.04554 11.7355 1.20144 11.8066 1.37302C11.8776 1.5446 11.9142 1.7285 11.9142 1.91421C11.9142 2.09993 11.8776 2.28383 11.8066 2.45541C11.7355 2.62699 11.6313 2.78289 11.5 2.91421L3.16667 11.2475L0.5 11.9142L1.16667 9.24755L9.5 0.914214Z" stroke="#171718" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Draft
            </button>
            <button
              className="px-4 py-2 rounded-md bg-white text-[#0F58F9] border border-[#0F58F9] hover:bg-blue-50 transition-colors flex items-center gap-2 text-sm"
              style={{ height: '40px' }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.29319 7.10401C5.55232 7.45079 5.88293 7.73773 6.26259 7.94537C6.64225 8.153 7.06208 8.27647 7.4936 8.30741C7.92512 8.33834 8.35824 8.27602 8.76358 8.12466C9.16893 7.97331 9.53701 7.73646 9.84287 7.43018L11.6531 5.61814C12.2027 5.04855 12.5068 4.28567 12.4999 3.49382C12.493 2.70197 12.1757 1.9445 11.6163 1.38456C11.057 0.824612 10.3002 0.506995 9.50919 0.500114C8.71813 0.493233 7.95602 0.797639 7.38701 1.34777L6.34915 2.38063M7.70681 5.89599C7.44768 5.54921 7.11707 5.26227 6.73741 5.05463C6.35775 4.847 5.93792 4.72353 5.5064 4.69259C5.07488 4.66166 4.64176 4.72398 4.23642 4.87534C3.83107 5.02669 3.46299 5.26354 3.15713 5.56982L1.34692 7.38186C0.797339 7.95145 0.49324 8.71433 0.500114 9.50618C0.506988 10.298 0.824286 11.0555 1.38367 11.6154C1.94305 12.1754 2.69976 12.493 3.49081 12.4999C4.28187 12.5068 5.04397 12.2024 5.61299 11.6522L6.64482 10.6194" stroke="#0F58F9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Share
            </button>
            <button
              className="px-4 py-2 rounded-md bg-[#0F58F9] text-white hover:bg-[#0d4dd4] transition-colors flex items-center gap-2 text-sm"
              style={{ height: '40px' }}
            >
              <svg width="9" height="11" viewBox="0 0 9 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.1429 7.88542V0.402344M4.1429 7.88542L0.935872 4.67839M4.1429 7.88542L7.34994 4.67839M7.88444 10.0234H0.401367" stroke="white" strokeWidth="0.801758" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Rating section */}
        <div className="flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-3 bg-[#FFFFFF] border border-[#E0E0E0] shadow-lg rounded-md px-3 py-3">
              <span className="text-[#171718] text-xs">{t('modals.play.rateQuality', "How's the video and voice quality?")}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className="transition-colors hover:scale-110"
                    onClick={() => console.log(`Rated ${star} stars`)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                  >
                    <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.23047 1.01367L7.25195 1.06738L8.71582 4.58594C8.83392 4.86975 9.10084 5.06328 9.40723 5.08789L13.2061 5.39258L13.2637 5.39746L13.5059 5.41602L13.3213 5.5752L13.2773 5.61328L10.3838 8.09277C10.1503 8.29282 10.0478 8.60627 10.1191 8.90527L11.0029 12.6113L11.0039 12.6123L11.0166 12.6689L11.0723 12.9043L10.8652 12.7783L10.8154 12.748L7.56348 10.7617C7.30116 10.6017 6.97126 10.6016 6.70898 10.7617L3.45703 12.748L3.40723 12.7783L3.19922 12.9053L3.25586 12.668L3.26953 12.6113L4.15332 8.90527C4.22466 8.60628 4.12291 8.2928 3.88965 8.09277L0.995117 5.61328L0.951172 5.5752L0.765625 5.41602L1.00977 5.39746L1.06738 5.39258L4.86523 5.08789C5.17162 5.06333 5.43849 4.86971 5.55664 4.58594L7.02051 1.06738L7.04297 1.01367L7.13574 0.788086L7.23047 1.01367ZM6.6748 2.07227L5.61914 4.61133C5.49149 4.91824 5.20241 5.12763 4.87109 5.1543L2.12988 5.37402L0.931641 5.4707L1.84473 6.25293L3.93262 8.04199C4.18511 8.2583 4.29589 8.5975 4.21875 8.9209L3.58008 11.5957L3.30176 12.7646L4.32715 12.1387L6.67383 10.7051C6.95758 10.5318 7.31488 10.5318 7.59863 10.7051L9.94531 12.1387L10.9717 12.7646L10.6924 11.5957L10.0547 8.9209C9.97756 8.59758 10.0875 8.25831 10.3398 8.04199L12.4287 6.25293L13.3418 5.4707L12.1436 5.37402L9.40234 5.1543C9.07091 5.12772 8.78198 4.91833 8.6543 4.61133L7.59766 2.07227L7.13672 0.961914L6.6748 2.07227Z" fill="#171718" stroke="#171718"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <span className="text-[#878787] text-xs">{t('modals.play.helpImprove', 'Help us improve ContentBuilder')}</span>
        </div>
      </div>

      {/* Comments section - fixed 400px width */}
      <div className="w-[400px] flex flex-col">
        <div 
          className="flex items-start p-4 rounded-lg bg-[#F9F9F9] border border-[#E0E0E0]"
          style={{ aspectRatio: '16 / 9' }}
        >
          <p className="text-gray-500">Comments area</p>
        </div>
      </div>
    </div>
  );
};

export default VideoLessonDisplay;
