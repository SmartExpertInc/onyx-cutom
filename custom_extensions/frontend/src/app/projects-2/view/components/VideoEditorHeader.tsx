'use client';

import { useState, useRef, useEffect } from 'react';

export default function VideoEditorHeader() {
  const [isResizePopupOpen, setIsResizePopupOpen] = useState(false);
  const resizeButtonRef = useRef<HTMLButtonElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resizeButtonRef.current && !resizeButtonRef.current.contains(event.target as Node)) {
        setIsResizePopupOpen(false);
      }
    };

    if (isResizePopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isResizePopupOpen]);

  const handleResizeClick = () => {
    setIsResizePopupOpen(!isResizePopupOpen);
  };

  const resizeOptions = [
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4">
          <rect x="2" y="5" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      text: "16:9 Desktop video, Youtube"
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4">
          <rect x="5" y="2" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      text: "9:16 Instagram story"
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4">
          <rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
      text: "1:1 Square, instagram post"
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-4 h-4">
          <rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" fill="none"/>
        </svg>
      ),
      text: "Custom set a custom size"
    }
  ];

  return (
    <header className="w-full bg-white h-[68px] flex items-center px-6">
      <div className="flex items-center justify-between w-full">
        {/* Left section - Logo and tools */}
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/9b71665e2dee95dc0f540b8501037f291f63ef3c?width=96"
              alt="Logo"
              className="w-12 h-6"
            />
          </div>

          {/* Tool icons - hidden on mobile, visible on tablet+ */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <button className="p-1 hover:bg-gray-100 rounded transition-colors flex items-center justify-center">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/60296c8d8172d9ab8392adf60a696e5288c8807d?width=40"
                alt="Tool"
                className="w-3 h-3"
              />
            </button>

            <button className="p-1 hover:bg-gray-100 rounded transition-colors flex items-center justify-center">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/2b3f3c7afc27ca26f9322d487e50a8435d666ff4?width=40"
                alt="Tool"
                className="w-3 h-3"
              />
            </button>

            <div className="w-0.5 h-[18px] bg-gray-300"></div>

            <button className="p-1 hover:bg-gray-100 rounded transition-colors flex items-center justify-center">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/22e7f5026e7be941193d1729124a7ba85fb26df7?width=46"
                alt="Tool"
                className="w-3 h-3"
              />
            </button>

            <div className="w-0.5 h-[18px] bg-gray-300"></div>

            {/* Resize tool - hidden on smaller screens */}
            <div className="hidden lg:flex items-center relative">
              <button
                ref={resizeButtonRef}
                onClick={handleResizeClick}
                className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/8574a9b72f54dd9d3d4b47f6ff7ae4fd1526bd0a?width=44"
                  alt="Resize"
                  className="w-3 h-3"
                />
                <span className="text-editor-resize-text text-xs font-normal">Resize</span>
              </button>

              {/* Resize popup */}
              {isResizePopupOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-64 py-2">
                  {resizeOptions.map((option, index) => (
                    <button
                      key={index}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors text-left"
                      onClick={() => {
                        // Handle resize option selection here
                        setIsResizePopupOpen(false);
                      }}
                    >
                      <div className="text-gray-600">
                        {option.icon}
                      </div>
                      <span className="text-sm text-gray-700">{option.text}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden lg:block w-0.5 h-[18px] bg-gray-300"></div>

            {/* Grid tool - hidden on smaller screens */}
            <div className="hidden lg:flex items-center gap-2">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/2d90825e49d8a04eeafdd5bea6924bcd90f97ef3?width=44"
                alt="Grid"
                className="w-3 h-3"
              />
              <span className="text-editor-icon-text text-xs font-normal">Grid</span>
            </div>

            <div className="hidden lg:block w-0.5 h-[20px] bg-gray-300"></div>

            {/* Upgrade button */}
            <button
              className="bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-[7px] px-3 py-1.5 gap-2 lg:gap-3 flex items-center h-8"
            >
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/e6fe4a219f32df67b6826887f30a0297ba8af2db?width=40"
                alt="Crown"
                className="w-3 h-3"
              />
              <span className="text-xs font-normal">Upgrade</span>
            </button>
          </div>
        </div>

        {/* Center section - Create video text (hidden on mobile) */}
        <div className="hidden lg:flex flex-1 justify-center">
          <div className="flex items-center gap-3">
            <span className="text-editor-gray-text text-xs font-medium whitespace-nowrap">Create your first AI video</span>
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/0dfa92304b25765dd8a203dc550f8d5fac95163b?width=42"
              alt="AI"
              className="w-3 h-3"
            />
          </div>
        </div>

        {/* Right section - Share and Generate buttons */}
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="flex items-center gap-3 lg:gap-4">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/3ff68570baf0004ced57daf86b108cb061230776?width=32"
              alt="Profile"
              className="w-3 h-3"
            />

            <div className="w-0.5 h-[18px] bg-gray-300"></div>

            {/* Share button */}
            <button
              className="bg-editor-light-bg border-editor-border text-editor-medium-text hover:bg-gray-50 rounded-[7px] px-3 py-1.5 border flex items-center h-8"
            >
              <span className="text-xs font-normal">Share</span>
            </button>

            {/* Generate button */}
            <button
              className="bg-black text-white hover:bg-gray-800 rounded-[7px] px-3 py-1.5 flex items-center h-8 border"
            >
              <span className="text-xs font-normal">Generate</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}