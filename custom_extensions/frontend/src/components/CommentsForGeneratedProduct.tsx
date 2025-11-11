// custom_extensions/frontend/src/components/CommentsForGeneratedVideo.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';

interface CommentsForGeneratedProductProps {
  isAuthorized?: boolean;
}

const CommentsForGeneratedProduct = ({
  isAuthorized = true,
}: CommentsForGeneratedProductProps): React.JSX.Element => {
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Assigned to me' | 'New'>('All');
  const [commentText, setCommentText] = useState('');
  const filterDropdownRef = useRef<HTMLDivElement>(null);

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

  return (
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
            className="flex items-center gap-1.5 mt-2 px-4 py-2 rounded-md text-white text-sm cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#0F58F9', height: '40px' }}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.33301 12.6654C9.33301 11.6045 8.91158 10.5871 8.16143 9.83694C7.41129 9.08679 6.39387 8.66536 5.33301 8.66536M5.33301 8.66536C4.27214 8.66536 3.25473 9.08679 2.50458 9.83694C1.75444 10.5871 1.33301 11.6045 1.33301 12.6654M5.33301 8.66536C6.80577 8.66536 7.99967 7.47146 7.99967 5.9987C7.99967 4.52594 6.80577 3.33203 5.33301 3.33203C3.86025 3.33203 2.66634 4.52594 2.66634 5.9987C2.66634 7.47146 3.86025 8.66536 5.33301 8.66536ZM12.6663 5.33203V9.33203M14.6663 7.33203H10.6663" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign up
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentsForGeneratedProduct;