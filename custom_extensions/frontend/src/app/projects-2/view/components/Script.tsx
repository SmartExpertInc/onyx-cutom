"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, MessageSquare, UserMinus, UserPlus } from 'lucide-react';
import VoicePicker from './VoicePicker';

export default function Script() {
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAvatarDropdownOpen(false);
      }
    };

    if (isAvatarDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAvatarDropdownOpen]);
  return (
    <div className="h-full bg-white border border-gray-400 rounded-md relative overflow-hidden w-full">
      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-start justify-start p-4">

        {/* Top Section with Avatar Dropdown and Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-4 w-full">
          {/* Avatar Dropdown */}
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <User size={20} className="text-black" />
              <ChevronDown size={16} className="text-black" />
            </button>

            {/* Avatar Dropdown Popup */}
            {isAvatarDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  {/* Row 1: Header */}
                  <div className="px-2 py-1">
                    <span className="text-xs text-gray-500">Avatars</span>
                  </div>
                  
                  {/* Row 2: Lisa - Office 4 */}
                  <button className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded text-left">
                    <User size={16} className="text-black" />
                    <span className="text-sm text-black">Lisa - Office 4</span>
                  </button>
                  
                  {/* Row 3: Narration only */}
                  <button className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded text-left">
                    <MessageSquare size={16} className="text-black" />
                    <span className="text-sm text-black">Narration only</span>
                  </button>
                  
                  {/* Row 4: Horizontal line */}
                  <div className="my-1">
                    <hr className="border-gray-300" />
                  </div>
                  
                  {/* Row 5: Remove avatar */}
                  <button className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded text-left">
                    <UserMinus size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-500">Remove avatar</span>
                  </button>
                  
                  {/* Row 6: Add new avatar */}
                  <button className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded text-left">
                    <UserPlus size={16} className="text-black" />
                    <span className="text-sm text-black">Add new avatar</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Language/User Selector Button */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setIsLanguageModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto min-w-[140px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" className="text-black">
                <path fill="currentColor" d="M56 96v64a8 8 0 0 1-16 0V96a8 8 0 0 1 16 0Zm32-72a8 8 0 0 0-8 8v192a8 8 0 0 0 16 0V32a8 8 0 0 0-8-8Zm40 32a8 8 0 0 0-8 8v128a8 8 0 0 0 16 0V64a8 8 0 0 0-8-8Zm40 32a8 8 0 0 0-8 8v64a8 8 0 0 0 16 0V96a8 8 0 0 0-8-8Zm40-16a8 8 0 0 0-8 8v96a8 8 0 0 0 16 0V80a8 8 0 0 0-8-8Z"/>
              </svg>
              <span className="text-sm font-medium text-black">US - Leesa</span>
            </button>
          </div>
        </div>

        {/* Main Content Text */}
        <div className="w-full max-w-[615px] lg:max-w-[650px]">
          <p className="text-[#5F5F5F] text-sm leading-relaxed font-normal">
            Create dynamic, powerful and informative videos with an
            avatar as your host. Instantly translate your video into over
            eighty languages, use engaging media to grab your
            audiences attention, or even simulate conversations between
            multiple avatars. All with an intuitive interface that anyone
            can use!
          </p>
        </div>
      </div>

      {/* Voice Picker Modal */}
      <VoicePicker
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        onSelectVoice={(voice) => {
          console.log('Selected voice:', voice);
          // Handle voice selection here
        }}
      />
    </div>
  );
}