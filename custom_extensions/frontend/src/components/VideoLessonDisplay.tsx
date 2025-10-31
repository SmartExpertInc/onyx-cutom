// custom_extensions/frontend/src/components/VideoLessonDisplay.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
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
  isAuthorized?: boolean;
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
  isAuthorized = true,
}: VideoLessonDisplayProps): React.JSX.Element | null => {
  const router = useRouter();
  const { t } = useLanguage();
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Assigned to me' | 'New'>('All');
  const [commentText, setCommentText] = useState('');
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  const handleDraftClick = () => {
    if (productId) {
      router.push(`/projects-2/view/${productId}`);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setFilterDropdownOpen(false);
      }
    };

    if (filterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filterDropdownOpen]);

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
      className="py-4 flex gap-4 overflow-hidden bg-[#F2F2F4] min-h-screen" 
      style={{ 
        height: 'calc(100vh - 64px)' // 64px = header height
      }}
    >
      <div className="w-full flex flex-col gap-4">
        {/* Top row: Video and Comments section with same height */}
        <div className="grid grid-cols-12 gap-4">
          {/* Video lesson section - 8 columns */}
          <div 
            className="col-span-8 flex items-center justify-center rounded-lg bg-gray-900 border border-gray-700 shadow-lg"
            style={{ 
              aspectRatio: '16 / 9'
            }}
          >
            <p className="text-gray-400 text-lg">Video lesson area</p>
          </div>

          {/* Comments section - 4 columns */}
          <div className="col-span-4 flex flex-col">
          <div className="flex-1 flex flex-col p-4 rounded-lg bg-[#F9F9F9] border border-[#E0E0E0]">
            {isAuthorized ? (
              <>
                {/* Search bar and Filter button */}
                <div className="flex justify-between mb-4">
                  {/* Search bar */}
                  <div className="w-[270px] relative">
                    <input
                      type="text"
                      placeholder="Search comments"
                      className="w-full pl-8 pr-3 py-2 text-xs text-[#171718] placeholder-[#878787] bg-white border border-[#CCCCCC] rounded-md focus:outline-none focus:border-[#CCCCCC]"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.5 10.5L8.11111 8.11111M9.38889 4.94444C9.38889 7.39904 7.39904 9.38889 4.94444 9.38889C2.48985 9.38889 0.5 7.39904 0.5 4.94444C0.5 2.48985 2.48985 0.5 4.94444 0.5C7.39904 0.5 9.38889 2.48985 9.38889 4.94444Z" stroke="#878787" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>

                  {/* Filter button */}
                  <div className="relative" ref={filterDropdownRef}>
                    <button
                      onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-[#878787] bg-white border border-[#CCCCCC] rounded-md hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.1328 9.0332C11.1811 9.0332 12.0569 9.77787 12.2568 10.7676L12.3438 11.1992L12.2568 11.6309C12.0569 12.6206 11.1812 13.3662 10.1328 13.3662C9.08455 13.3661 8.20964 12.6206 8.00977 11.6309L7.92188 11.1992L8.00977 10.7676C8.20972 9.77798 9.08462 9.03333 10.1328 9.0332ZM10.1328 9.09961C8.97322 9.09975 8.03334 10.0396 8.0332 11.1992C8.0332 12.3589 8.97312 13.2997 10.1328 13.2998C11.2926 13.2998 12.2334 12.359 12.2334 11.1992C12.2333 10.0395 11.2925 9.09961 10.1328 9.09961ZM1.59961 11.166H7.4707L7.80566 11.1992L7.4707 11.2324H1.59961C1.58129 11.2324 1.56641 11.2176 1.56641 11.1992C1.56655 11.181 1.58138 11.1661 1.59961 11.166ZM12.7959 11.166H14.3994C14.4177 11.166 14.4325 11.181 14.4326 11.1992C14.4326 11.2176 14.4178 11.2324 14.3994 11.2324H12.7959L12.46 11.1992L12.7959 11.166ZM5.86621 2.63281C6.91458 2.63281 7.79034 3.37836 7.99023 4.36816L8.07617 4.79883L7.99023 5.23145C7.79027 6.22116 6.91452 6.96582 5.86621 6.96582C4.81796 6.96573 3.94211 6.22113 3.74219 5.23145L3.65527 4.79883L3.74219 4.36816C3.94207 3.37842 4.81792 2.63291 5.86621 2.63281ZM5.86621 2.69922C4.7065 2.69932 3.7666 3.64007 3.7666 4.7998C3.76678 5.95939 4.70661 6.89931 5.86621 6.89941C7.0259 6.89941 7.96662 5.95946 7.9668 4.7998C7.9668 3.64 7.02601 2.69922 5.86621 2.69922ZM1.59961 4.7666H3.2041L3.53906 4.79883L3.2041 4.83301H1.59961C1.58137 4.83294 1.56658 4.81802 1.56641 4.7998C1.56641 4.78144 1.58126 4.76667 1.59961 4.7666ZM8.5293 4.7666H14.3994C14.4178 4.7666 14.4326 4.78142 14.4326 4.7998C14.4324 4.81803 14.4177 4.83301 14.3994 4.83301H8.5293L8.19238 4.79883L8.5293 4.7666Z" fill="#878787" stroke="#878787"/>
                      </svg>
                      <span>{selectedFilter}</span>
                    </button>

                    {/* Dropdown */}
                    {filterDropdownOpen && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-[#E6E6E6] rounded-md shadow-lg z-10">
                        <div className="px-3 py-2 text-xs font-semibold text-[#171718] border-b border-[#E6E6E6]">
                          Filter by
                        </div>
                        <div className="py-1 px-1">
                          {(['All', 'Assigned to me', 'New'] as const).map((option) => (
                            <button
                              key={option}
                              onClick={() => {
                                setSelectedFilter(option);
                                setFilterDropdownOpen(false);
                              }}
                              className={`w-full px-2 py-2 text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                                selectedFilter === option ? 'bg-[#CCDBFC] text-[#0F58F9]' : 'text-[#171718] hover:bg-gray-50'
                              }`}
                              style={selectedFilter === option ? { borderRadius: '4px' } : {}}
                            >
                              <span>{option}</span>
                              {selectedFilter === option && (
                                <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M1 4.5L4.5 8L11 1" stroke="#0F58F9" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Comments list area */}
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.5 31.5033L7.35 22.9533C5.9957 20.2455 5.64918 17.1441 6.37246 14.2041C7.09573 11.2642 8.84161 8.67753 11.2976 6.90711C13.7537 5.13669 16.7596 4.29803 19.7774 4.54121C22.7952 4.7844 25.628 6.09356 27.7689 8.23441C29.9097 10.3753 31.2189 13.2081 31.4621 16.2259C31.7053 19.2437 30.8666 22.2496 29.0962 24.7057C27.3258 27.1617 24.7391 28.9076 21.7992 29.6309C18.8592 30.3541 15.7578 30.0076 13.05 28.6533L4.5 31.5033Z" stroke="#171718" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13.8994 17.5322C13.8993 17.9186 13.5865 18.2322 13.2002 18.2324C12.8137 18.2324 12.5001 17.9187 12.5 17.5322C12.5 17.1456 12.8136 16.832 13.2002 16.832C13.5866 16.8323 13.8994 17.1458 13.8994 17.5322ZM19.2334 17.5322C19.2333 17.9187 18.9197 18.2324 18.5332 18.2324C18.1467 18.2324 17.8331 17.9187 17.833 17.5322C17.833 17.1456 18.1466 16.832 18.5332 16.832C18.9197 16.8321 19.2334 17.1457 19.2334 17.5322ZM24.5664 17.5322C24.5663 17.9187 24.2527 18.2324 23.8662 18.2324C23.4798 18.2323 23.1661 17.9187 23.166 17.5322C23.166 17.1457 23.4797 16.8321 23.8662 16.832C24.2528 16.832 24.5664 17.1456 24.5664 17.5322Z" fill="#171718" stroke="#171718"/>
                  </svg>
                  <p className="text-[#171718] text-base font-medium">Add your first comment</p>
                </div>

                {/* Comment input section */}
                <div className="relative">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Comment or add others with @"
                    className="w-full h-[70px] p-3 pr-20 text-xs text-[#171718] placeholder-[#878787] shadow-xl bg-white border border-[#CCCCCC] rounded-lg resize-none focus:outline-none focus:border-[#CCCCCC]"
                  />
                  <button
                    onClick={() => {
                      if (commentText.trim()) {
                        // Handle send comment
                        console.log('Send comment:', commentText);
                        setCommentText('');
                      }
                    }}
                    disabled={!commentText.trim()}
                    className={`absolute bottom-3.5 right-3 flex items-center gap-1.5 px-2 py-1 text-white rounded-md transition-colors ${
                      commentText.trim() ? 'bg-[#0F58F9] hover:bg-[#0d4dd4] cursor-pointer' : 'bg-[#CCCCCC] cursor-not-allowed'
                    }`}
                  >
                    <span className="text-[10px] tracking-wide">Send</span>
                    <svg width="10" height="10" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_1918_78539)">
                        <path d="M7.33366 0.667969L3.66699 4.33464M7.33366 0.667969L5.00033 7.33464L3.66699 4.33464M7.33366 0.667969L0.666992 3.0013L3.66699 4.33464" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_1918_78539">
                          <rect width="8" height="8" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              /* Unauthorized view - centered SVG with text and button */
              <div className="flex-1 flex flex-col items-center justify-center gap-4 overflow-hidden">
                {/* SVG wrapper with relative positioning */}
                <div className="relative w-[465px] h-[148px]">
                  <svg width="465" height="148" viewBox="0 0 465 148" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-[-20px]">
                    <g clip-path="url(#clip0_1918_79172)">
                    <rect opacity="0.7" x="240.408" y="138.45" width="23.0069" height="22.9934" rx="11.4967" stroke="#878787" stroke-width="0.609959"/>
                    <rect opacity="0.7" x="224.664" y="122.715" width="54.496" height="54.4645" rx="27.2322" stroke="#878787" stroke-width="0.609959"/>
                    <rect opacity="0.7" x="208.919" y="106.981" width="85.9851" height="85.9356" rx="42.9678" stroke="#878787" stroke-width="0.609959"/>
                    <rect opacity="0.7" x="193.175" y="91.2464" width="117.474" height="117.407" rx="58.7034" stroke="#878787" stroke-width="0.609959"/>
                    <rect opacity="0.7" x="177.43" y="75.5081" width="148.963" height="148.878" rx="74.4389" stroke="#878787" stroke-width="0.609959"/>
                    <rect opacity="0.7" x="161.686" y="59.7737" width="180.452" height="180.349" rx="90.1745" stroke="#878787" stroke-width="0.609959"/>
                    <rect opacity="0.7" x="145.942" y="44.0394" width="211.942" height="211.82" rx="105.91" stroke="#878787" stroke-width="0.609959"/>
                    <path d="M244.59 61.47C246.16 59.1 246.99 56.35 246.99 53.49C246.99 45.5 240.49 39 232.5 39C224.51 39 218 45.49 218 53.48C218 61.47 224.5 67.97 232.49 67.97C234.3 67.97 236.07 67.64 237.76 66.98L245.09 68.95C245.18 68.97 245.26 68.98 245.35 68.98C245.61 68.98 245.87 68.88 246.06 68.68C246.31 68.43 246.41 68.06 246.31 67.71L244.58 61.45L244.59 61.47ZM226.42 55.15C225.5 55.15 224.76 54.4 224.76 53.49C224.76 52.58 225.51 51.83 226.42 51.83C227.33 51.83 228.08 52.58 228.08 53.49C228.08 54.4 227.33 55.15 226.42 55.15ZM232.49 55.15C231.57 55.15 230.83 54.4 230.83 53.49C230.83 52.58 231.58 51.83 232.49 51.83C233.4 51.83 234.15 52.58 234.15 53.49C234.15 54.4 233.4 55.15 232.49 55.15ZM238.56 55.15C237.64 55.15 236.9 54.4 236.9 53.49C236.9 52.58 237.65 51.83 238.56 51.83C239.47 51.83 240.22 52.58 240.22 53.49C240.22 54.4 239.47 55.15 238.56 55.15Z" fill="#878787"/>
                    <path d="M216.042 128.472C217.403 126.418 218.122 124.035 218.122 121.557C218.122 114.633 212.489 109 205.565 109C198.641 109 193 114.624 193 121.548C193 128.472 198.633 134.105 205.557 134.105C207.125 134.105 208.659 133.819 210.124 133.247L216.476 134.954C216.554 134.971 216.623 134.98 216.701 134.98C216.926 134.98 217.152 134.893 217.316 134.72C217.533 134.503 217.619 134.183 217.533 133.879L216.034 128.455L216.042 128.472ZM200.297 122.995C199.499 122.995 198.858 122.345 198.858 121.557C198.858 120.768 199.508 120.118 200.297 120.118C201.085 120.118 201.735 120.768 201.735 121.557C201.735 122.345 201.085 122.995 200.297 122.995ZM205.557 122.995C204.759 122.995 204.118 122.345 204.118 121.557C204.118 120.768 204.768 120.118 205.557 120.118C206.345 120.118 206.995 120.768 206.995 121.557C206.995 122.345 206.345 122.995 205.557 122.995ZM210.817 122.995C210.02 122.995 209.378 122.345 209.378 121.557C209.378 120.768 210.028 120.118 210.817 120.118C211.605 120.118 212.255 120.768 212.255 121.557C212.255 122.345 211.605 122.995 210.817 122.995Z" fill="#878787"/>
                    <path d="M281.4 99.47C279.83 97.1 279 94.35 279 91.49C279 83.5 285.5 77 293.49 77C301.48 77 307.99 83.49 307.99 91.48C307.99 99.47 301.49 105.97 293.5 105.97C291.69 105.97 289.92 105.64 288.23 104.98L280.9 106.95C280.81 106.97 280.73 106.98 280.64 106.98C280.38 106.98 280.12 106.88 279.93 106.68C279.68 106.43 279.58 106.06 279.68 105.71L281.41 99.45L281.4 99.47ZM299.57 93.15C300.49 93.15 301.23 92.4 301.23 91.49C301.23 90.58 300.48 89.83 299.57 89.83C298.66 89.83 297.91 90.58 297.91 91.49C297.91 92.4 298.66 93.15 299.57 93.15ZM293.5 93.15C294.42 93.15 295.16 92.4 295.16 91.49C295.16 90.58 294.41 89.83 293.5 89.83C292.59 89.83 291.84 90.58 291.84 91.49C291.84 92.4 292.59 93.15 293.5 93.15ZM287.43 93.15C288.35 93.15 289.09 92.4 289.09 91.49C289.09 90.58 288.34 89.83 287.43 89.83C286.52 89.83 285.77 90.58 285.77 91.49C285.77 92.4 286.52 93.15 287.43 93.15Z" fill="#878787"/>
                    </g>
                    <path opacity="0.7" d="M102 147H402" stroke="#D6DEFC" stroke-linecap="round"/>
                    <defs>
                    <clipPath id="clip0_1918_79172">
                    <rect width="503.826" height="147" fill="white"/>
                    </clipPath>
                    </defs>
                  </svg>
                </div>
                
                {/* Text */}
                <p className="text-center text-[#171718] text-base font-medium leading-tight">
                  Comments are only available for<br />workspace members
                </p>
                
                {/* Sign up button */}
                <button
                  className="flex items-center gap-2 mt-2 px-4 py-2 rounded-md text-white text-sm cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#0F58F9', height: '40px' }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.33301 12.6654C9.33301 11.6045 8.91158 10.5871 8.16143 9.83694C7.41129 9.08679 6.39387 8.66536 5.33301 8.66536M5.33301 8.66536C4.27214 8.66536 3.25473 9.08679 2.50458 9.83694C1.75444 10.5871 1.33301 11.6045 1.33301 12.6654M5.33301 8.66536C6.80577 8.66536 7.99967 7.47146 7.99967 5.9987C7.99967 4.52594 6.80577 3.33203 5.33301 3.33203C3.86025 3.33203 2.66634 4.52594 2.66634 5.9987C2.66634 7.47146 3.86025 8.66536 5.33301 8.66536ZM12.6663 5.33203V9.33203M14.6663 7.33203H10.6663" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Sign up
                </button>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Bottom row: Title + Action Buttons + Rating - 8 columns to match video width */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 flex flex-col gap-6">
            {/* Title and Action Buttons */}
            <div className="flex items-center justify-between flex-shrink-0">
              {/* Left: Video Lesson Title */}
              <div>
                <h3 className="text-md font-semibold text-[#171718]">
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
                  className="px-3 py-2 rounded-md bg-white text-[#171718] border border-[#171718] hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm cursor-pointer"
                  style={{ height: '40px' }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.5 11.9142H12.5M9.5 0.914214C9.76522 0.648997 10.1249 0.5 10.5 0.5C10.6857 0.5 10.8696 0.53658 11.0412 0.607651C11.2128 0.678721 11.3687 0.782892 11.5 0.914214C11.6313 1.04554 11.7355 1.20144 11.8066 1.37302C11.8776 1.5446 11.9142 1.7285 11.9142 1.91421C11.9142 2.09993 11.8776 2.28383 11.8066 2.45541C11.7355 2.62699 11.6313 2.78289 11.5 2.91421L3.16667 11.2475L0.5 11.9142L1.16667 9.24755L9.5 0.914214Z" stroke="#171718" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Draft
                </button>
                <button
                  className="px-3 py-2 rounded-md bg-white text-[#0F58F9] border border-[#0F58F9] hover:bg-blue-50 transition-colors flex items-center gap-2 text-sm cursor-pointer"
                  style={{ height: '40px' }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.29319 7.10401C5.55232 7.45079 5.88293 7.73773 6.26259 7.94537C6.64225 8.153 7.06208 8.27647 7.4936 8.30741C7.92512 8.33834 8.35824 8.27602 8.76358 8.12466C9.16893 7.97331 9.53701 7.73646 9.84287 7.43018L11.6531 5.61814C12.2027 5.04855 12.5068 4.28567 12.4999 3.49382C12.493 2.70197 12.1757 1.9445 11.6163 1.38456C11.057 0.824612 10.3002 0.506995 9.50919 0.500114C8.71813 0.493233 7.95602 0.797639 7.38701 1.34777L6.34915 2.38063M7.70681 5.89599C7.44768 5.54921 7.11707 5.26227 6.73741 5.05463C6.35775 4.847 5.93792 4.72353 5.5064 4.69259C5.07488 4.66166 4.64176 4.72398 4.23642 4.87534C3.83107 5.02669 3.46299 5.26354 3.15713 5.56982L1.34692 7.38186C0.797339 7.95145 0.49324 8.71433 0.500114 9.50618C0.506988 10.298 0.824286 11.0555 1.38367 11.6154C1.94305 12.1754 2.69976 12.493 3.49081 12.4999C4.28187 12.5068 5.04397 12.2024 5.61299 11.6522L6.64482 10.6194" stroke="#0F58F9" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Share
                </button>
                <button
                  className="px-3 py-2 rounded-md bg-[#0F58F9] text-white hover:bg-[#0d4dd4] transition-colors flex items-center gap-2 text-sm cursor-pointer"
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
            <div className="flex flex-col items-center gap-3 flex-shrink-0">
              <div className="inline-flex items-center gap-3 bg-[#FFFFFF] border border-[#E0E0E0] shadow-xl rounded-md px-3 py-3">
                <span className="text-[#171718] text-xs">{t('modals.play.rateQuality', "How's the video and voice quality?")}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className="transition-colors hover:scale-110 cursor-pointer"
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
        </div>
      </div>
    </div>
  );
};

export default VideoLessonDisplay;
