import React, { useState, useEffect, useRef } from 'react';
import AvatarPopup from './AvatarPopup';
import AdvancedSettings from './AdvancedSettings';

export default function AvatarSettings() {
  const [isAvatarPopupOpen, setIsAvatarPopupOpen] = useState(false);
  const [appearanceMode, setAppearanceMode] = useState<'shoulder' | 'full-body' | 'bubble'>('shoulder');
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const viewDropdownRef = useRef<HTMLDivElement>(null);

  // Advanced settings states
  const [rotation, setRotation] = useState(0);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (viewDropdownRef.current && !viewDropdownRef.current.contains(event.target as Node)) {
        setShowViewDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
      {/* Header with grey background */}
      <div className="bg-gray-100 px-4 py-3 rounded-t-lg flex items-center justify-between h-16">
        <div className="flex items-center space-x-3">
          {/* Avatar placeholder circle */}
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          {/* Avatar name */}
          <span className="text-sm font-medium text-gray-700">Name of avatar</span>
        </div>
        
        {/* Change button */}
        <button 
          onClick={() => setIsAvatarPopupOpen(true)}
          className="bg-white text-gray-600 hover:text-gray-800 px-3 py-1 rounded-full text-sm font-medium border border-gray-300 hover:border-gray-400 transition-colors"
        >
          Change
        </button>
      </div>
      
      {/* Apply to all scenes button */}
      <div className="px-4 py-3 border-b border-gray-200">
        <button className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-full transition-colors border border-gray-300 hover:border-gray-400">
          Apply to all scenes
        </button>
      </div>
      
      {/* Appearance section */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="mb-3">
          <span className="text-sm font-medium text-gray-700">Appearance</span>
        </div>
        <div className="bg-gray-100 rounded-full p-1 flex">
          <button 
            onClick={() => setAppearanceMode('shoulder')}
            className={`flex-1 font-medium py-2 px-4 rounded-full transition-colors ${
              appearanceMode === 'shoulder' 
                ? 'bg-white text-gray-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-700'
            }`}
          >
            Shoulder
          </button>
          <button 
            onClick={() => setAppearanceMode('full-body')}
            className={`flex-1 font-medium py-2 px-4 rounded-full transition-colors ${
              appearanceMode === 'full-body' 
                ? 'bg-white text-gray-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-700'
            }`}
          >
            Full body
          </button>
          <button 
            onClick={() => setAppearanceMode('bubble')}
            className={`flex-1 font-medium py-2 px-4 rounded-full transition-colors ${
              appearanceMode === 'bubble' 
                ? 'bg-white text-gray-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-700'
            }`}
          >
            Bubble
          </button>
        </div>
      </div>
      
      {/* Content area */}
      <div className="p-4 overflow-y-auto flex-1">
        <div className="space-y-4">
          {/* View */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">View</span>
            <div className="relative" ref={viewDropdownRef}>
              <button 
                onClick={() => setShowViewDropdown(!showViewDropdown)}
                className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <span className="text-gray-700">Select view...</span>
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showViewDropdown && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  {['Front View', 'Side View', 'Back View'].map((view) => (
                    <button
                      key={view}
                      onClick={() => {
                        setShowViewDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center"
                    >
                      <span className="text-gray-700">{view}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Position */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Position</span>
            <div className="flex space-x-2">
              <button
                className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition-colors group relative"
                title="Align left"
              >
                <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Align left
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </button>
              <button
                className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition-colors group relative"
                title="Align center"
              >
                <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm0 4a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H5a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Align center
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </button>
              <button
                className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition-colors group relative"
                title="Align right"
              >
                <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Align right
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </button>
            </div>
          </div>

          {/* Order */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Order</span>
            <div className="flex space-x-2">
              <button
                className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition-colors group relative"
                title="Send avatar to back"
              >
                  <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fill="currentColor" d="M2 4.5A2.5 2.5 0 0 1 4.5 2h6A2.5 2.5 0 0 1 13 4.5V6H9.5A3.5 3.5 0 0 0 6 9.5V13H4.5A2.5 2.5 0 0 1 2 10.5v-6ZM9.5 7A2.5 2.5 0 0 0 7 9.5v6A2.5 2.5 0 0 0 9.5 18h6a2.5 2.5 0 0 0 2.5-2.5v-6A2.5 2.5 0 0 0 15.5 7h-6ZM8 9.5A1.5 1.5 0 0 1 9.5 8h6A1.5 1.5 0 0 1 17 9.5v6a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 8 15.5v-6Z"/>
                  </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Send avatar to back
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </button>
              <button
                className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition-colors group relative"
                title="Send avatar backward"
              >
                  <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fill="currentColor" d="M4.5 2A2.5 2.5 0 0 0 2 4.5v6A2.5 2.5 0 0 0 4.5 13H6v-1.707L5.293 12H4.5c-.232 0-.45-.053-.647-.146L6 9.707V9.5c0-.571.137-1.11.38-1.586l-3.234 3.233A1.495 1.495 0 0 1 3 10.5v-.94L9.56 3h.94c.232 0 .45.052.647.146L7.914 6.38A3.485 3.485 0 0 1 9.5 6h.207l2.147-2.147c.094.196.146.415.146.647v.793L11.293 6H13V4.5A2.5 2.5 0 0 0 10.5 2h-6ZM3 4.5A1.5 1.5 0 0 1 4.5 3h.647L3 5.147V4.5Zm0 2.06L6.56 3h1.587L3 8.147V6.56ZM7 9.5A2.5 2.5 0 0 1 9.5 7h6A2.5 2.5 0 0 1 18 9.5v6a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 7 15.5v-6ZM9.5 8A1.5 1.5 0 0 0 8 9.5v6A1.5 1.5 0 0 0 9.5 17h6a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 15.5 8h-6Z"/>
                  </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Send avatar backward
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </button>
              <button
                className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition-colors group relative"
                title="Bring avatar forward"
              >
                  <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fill="currentColor" d="M7 14v1.5A2.5 2.5 0 0 0 9.5 18h6a2.5 2.5 0 0 0 2.5-2.5v-6A2.5 2.5 0 0 0 15.5 7H14v1h1.5A1.5 1.5 0 0 1 17 9.5v6a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 8 15.5V14H7ZM2 4.5A2.5 2.5 0 0 1 4.5 2h6A2.5 2.5 0 0 1 13 4.5v6a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 2 10.5v-6ZM4.5 3A1.5 1.5 0 0 0 3 4.5v.647L5.147 3H4.5Zm2.06 0L3 6.56v1.587L8.147 3H6.56ZM3 10.5c0 .232.052.45.146.647l8-8A1.495 1.495 0 0 0 10.5 3h-.94L3 9.56v.94ZM4.5 12h.793L12 5.293V4.5c0-.232-.053-.45-.146-.647l-8 8c.195.095.414.147.646.147Zm5.207 0h.793a1.5 1.5 0 0 0 1.5-1.5v-.793L9.707 12Zm-1.414 0L12 8.293V6.707L6.707 12h1.586Z"/>
                  </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Bring avatar forward
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </button>
              <button
                className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition-colors group relative"
                title="Send avatar to front"
              >
                  <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fill="currentColor" d="M7 14v1.5A2.5 2.5 0 0 0 9.5 18h6a2.5 2.5 0 0 0 2.5-2.5v-6A2.5 2.5 0 0 0 15.5 7H14v1h1.5A1.5 1.5 0 0 1 17 9.5v6a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 8 15.5V14H7ZM2 4.5A2.5 2.5 0 0 1 4.5 2h6A2.5 2.5 0 0 1 13 4.5v6a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 2 10.5v-6Z"/>
                  </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Send avatar to front
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </button>
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <div className={`flex items-center justify-center py-2 ${!showAdvancedSettings ? '-mb-4 mb-[2px]' : ''}`}>
            <button
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span className="text-xs text-gray-500">
                {showAdvancedSettings ? 'Collapse advanced settings' : 'Show advanced settings'}
              </span>
              <svg 
                className={`w-4 h-4 text-gray-700 transition-transform ${showAdvancedSettings ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Advanced Settings Content */}
          <div className={`transition-all duration-300 ease-in-out ${
            showAdvancedSettings ? 'max-h-48' : 'max-h-0'
          } overflow-hidden`}>
            <div className={`transition-all duration-300 ease-in-out ${
              showAdvancedSettings ? 'pt-4 pb-2' : 'pt-0 pb-0'
            }`}>
              <div className={`transition-all duration-300 ${showAdvancedSettings ? 'opacity-100' : 'opacity-0'}`}>
                <AdvancedSettings
                  rotation={rotation}
                  onRotationChange={setRotation}
                  positionX={positionX}
                  onPositionXChange={setPositionX}
                  positionY={positionY}
                  onPositionYChange={setPositionY}
                  width={width}
                  onWidthChange={setWidth}
                  height={height}
                  onHeightChange={setHeight}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Avatar Popup */}
      <AvatarPopup
        isOpen={isAvatarPopupOpen}
        onClose={() => setIsAvatarPopupOpen(false)}
        displayMode="modal"
        title="Choose Avatar"
      />
    </div>
    </>
  );
}
