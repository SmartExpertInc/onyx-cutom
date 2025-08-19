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
    <div className="h-full bg-white border border-gray-200 relative overflow-hidden w-full">
      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-start justify-start p-8">

        {/* Top Section with Avatar Dropdown and Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4 w-full">
          {/* Avatar Dropdown */}
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setIsAvatarDropdownOpen(!isAvatarDropdownOpen)}
              className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="text-black">
                      <path fill="currentColor" d="M8.5 4a3 3 0 1 0 0 6a3 3 0 0 0 0-6Zm-5 3a5 5 0 1 1 10 0a5 5 0 0 1-10 0Zm17.073-1.352l.497.867a7 7 0 0 1-.002 6.975l-.499.867l-1.733-.997l.498-.867a5 5 0 0 0 .002-4.982l-.498-.867l1.735-.996ZM17.538 7.39l.497.868a3.5 3.5 0 0 1 0 3.487l-.5.867l-1.733-.997l.498-.867a1.499 1.499 0 0 0 0-1.495l-.497-.867l1.735-.996ZM0 19a5 5 0 0 1 5-5h7a5 5 0 0 1 5 5v2h-2v-2a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v2H0v-2Z"/>
                    </svg>
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
              className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-auto"
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
          <p className="text-[#5F5F5F] text-sm leading-loose font-normal">
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

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 px-8">
        {/* AI Button */}
        <div className="relative group">
          <button className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors border-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Zm8.446-7.189L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Zm-1.365 11.852L16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183l.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394l-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"/>
            </svg>
          </button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Use the AI assistant
          </div>
        </div>

        {/* Pause Button */}
        <div className="relative group">
          <button className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors border-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z"/>
            </svg>
          </button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Pause
          </div>
        </div>

        {/* Move Button */}
        <div className="relative group">
          <button className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors border-none">
            <svg width="16" height="10" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" fill="none">
              <circle cx="150" cy="40" r="24" stroke="black" strokeWidth="4"/>
              <line x1="10" y1="20" x2="110" y2="20" stroke="black" strokeWidth="4" strokeLinecap="round"/>
              <line x1="10" y1="40" x2="110" y2="40" stroke="black" strokeWidth="4" strokeLinecap="round"/>
              <line x1="10" y1="60" x2="110" y2="60" stroke="black" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Move
          </div>
        </div>

        {/* Hand Button */}
        <div className="relative group">
          <button className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors border-none">
            <svg width="16" height="10" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" fill="none">
              <circle cx="150" cy="40" r="24" stroke="black" strokeWidth="4"/>
              <line x1="10" y1="20" x2="110" y2="20" stroke="black" strokeWidth="4" strokeLinecap="round"/>
              <line x1="10" y1="40" x2="110" y2="40" stroke="black" strokeWidth="4" strokeLinecap="round"/>
              <line x1="10" y1="60" x2="110" y2="60" stroke="black" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Hand gestures
          </div>
        </div>

        {/* Translate Button */}
        <div className="relative group">
          <button className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors border-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256">
              <path fill="currentColor" d="m239.15 212.42l-56-112a8 8 0 0 0-14.31 0l-21.71 43.43A88 88 0 0 1 100 126.93A103.65 103.65 0 0 0 127.69 64H152a8 8 0 0 0 0-16H96V32a8 8 0 0 0-16 0v16H24a8 8 0 0 0 0 16h87.63A87.76 87.76 0 0 1 88 116.35a87.74 87.74 0 0 1-19-31a8 8 0 1 0-15.08 5.34A103.63 103.63 0 0 0 76 127a87.55 87.55 0 0 1-52 17a8 8 0 0 0 0 16a103.46 103.46 0 0 0 64-22.08a104.18 104.18 0 0 0 51.44 21.31l-26.6 53.19a8 8 0 0 0 14.31 7.16L140.94 192h70.11l13.79 27.58A8 8 0 0 0 232 224a8 8 0 0 0 7.15-11.58ZM148.94 176L176 121.89L203.05 176Z"/>
            </svg>
          </button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Translate
          </div>
        </div>

        {/* Grey Vertical Line */}
        <div className="h-8 w-px bg-gray-300 mx-2"></div>

        {/* Play Button */}
        <div className="relative group">
          <button className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors border-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
              <path fill="currentColor" d="M4.608 3.063C4.345 2.895 4 3.089 4 3.418v9.167c0 .329.345.523.608.356l7.2-4.584a.426.426 0 0 0 0-.711zm.538-.844l7.2 4.583a1.426 1.426 0 0 1 0 2.399l-7.2 4.583C4.21 14.38 3 13.696 3 12.585V3.418C3 2.307 4.21 1.624 5.146 2.22"/>
            </svg>
          </button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Play
          </div>
        </div>
      </div>
    </div>
  );
}