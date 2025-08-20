'use client';

import { useState, useEffect } from 'react';

interface GenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export default function GenerateModal({ isOpen, onClose, title }: GenerateModalProps) {
  const [videoTitle, setVideoTitle] = useState(title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSubtitleDropdownOpen, setIsSubtitleDropdownOpen] = useState(false);
  const [selectedSubtitleOption, setSelectedSubtitleOption] = useState('Select subtitle option');
  const [isResolutionDropdownOpen, setIsResolutionDropdownOpen] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState('1080p HD');
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSubtitleDropdownOpen) {
        const dropdownElement = document.querySelector('[data-subtitle-dropdown]');
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setIsSubtitleDropdownOpen(false);
        }
      }
      if (isResolutionDropdownOpen) {
        const dropdownElement = document.querySelector('[data-resolution-dropdown]');
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setIsResolutionDropdownOpen(false);
        }
      }
    };

    if (isSubtitleDropdownOpen || isResolutionDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSubtitleDropdownOpen, isResolutionDropdownOpen]);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div className="relative bg-white shadow-xl w-[500px] max-w-[95vw] flex flex-col z-10" style={{ borderRadius: '12px' }}>
        {/* Header */}
        <div className="p-6 pb-3">
          <div className="flex justify-center items-center">
            <h2 className="text-lg font-semibold">Generate video</h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Title input */}
          <div className="mb-2">
            <label className="block text-xs text-gray-500 mb-2">Title</label>
            <input
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onFocus={() => setIsEditingTitle(true)}
              className="w-full text-sm bg-transparent border-none outline-none focus:ring-0 px-0 py-1"
              placeholder="Enter video title"
            />
          </div>
          
          {/* Horizontal line */}
          <div className="border-t-2 border-gray-300 mb-6"></div>
          
          {/* Subtitles */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-700">Subtitles</span>
            <div className="relative" data-subtitle-dropdown>
              <button 
                onClick={() => setIsSubtitleDropdownOpen(!isSubtitleDropdownOpen)}
                className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5 border border-gray-300 rounded-md flex items-center gap-2"
              >
                {selectedSubtitleOption}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 15l5-5 5 5" />
                </svg>
              </button>
              
              {/* Dropdown popup */}
              {isSubtitleDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 w-80">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setSelectedSubtitleOption('Optional subtitles (SRT/VTT)');
                        setIsSubtitleDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="text-sm text-black font-medium">Optional subtitles (SRT/VTT)</div>
                      <div className="text-sm text-gray-500">Can be turned on by viewers on demand</div>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSubtitleOption('Burnt-in subtitles');
                        setIsSubtitleDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="text-sm text-black font-medium">Burnt-in subtitles</div>
                      <div className="text-sm text-gray-500">Burnt into the video, can't be disabled</div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Resolution */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-700">Resolution</span>
            <div className="relative" data-resolution-dropdown>
              <button 
                onClick={() => setIsResolutionDropdownOpen(!isResolutionDropdownOpen)}
                className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5 border border-gray-300 rounded-md flex items-center gap-2"
              >
                {selectedResolution}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 15l5-5 5 5" />
                </svg>
              </button>
              
              {/* Dropdown popup */}
              {isResolutionDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 w-48">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setSelectedResolution('720p');
                        setIsResolutionDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span className="text-sm text-black">720p</span>
                      {selectedResolution === '720p' && (
                        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedResolution('1080p HD');
                        setIsResolutionDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <span className="text-sm text-black">1080p HD</span>
                      {selectedResolution === '1080p HD' && (
                        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedResolution('1440p HD');
                        setIsResolutionDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-black">1440p HD</span>
                        <svg className="w-4 h-4 text-purple-700" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z"/>
                        </svg>
                      </div>
                      {selectedResolution === '1440p HD' && (
                        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedResolution('2160p 4K');
                        setIsResolutionDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-black">2160p 4K</span>
                        <svg className="w-4 h-4 text-purple-700" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z"/>
                        </svg>
                      </div>
                      {selectedResolution === '2160p 4K' && (
                        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Location */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-gray-700">Location</span>
            <button className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5 border border-gray-300 rounded-md flex items-center gap-2">
              Library
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 15l5-5 5 5" />
              </svg>
            </button>
          </div>
          
          {/* Summary section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Summary</h3>
            
            {/* Generation time */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">Generation time</span>
              <span className="text-sm text-gray-900">approx. 8 minutes</span>
            </div>
            
            {/* Video size */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-gray-500">Video size (per video)</span>
              <span className="text-sm text-gray-900">~ 20MB</span>
            </div>
            
            {/* Generation with API */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Generation with API</span>
              <button className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5 border border-gray-300 rounded-md flex items-center gap-1">
                <span>&lt;/&gt;</span>
                Export to API
              </button>
            </div>
          </div>
          
          {/* Bottom buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-white text-black border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button className="flex-1 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors font-medium text-sm">
              Start generation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
