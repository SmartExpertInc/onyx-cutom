import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Image as ImageIcon, Check, X } from 'lucide-react';
import Media from './Media';
import AdvancedSettings from './AdvancedSettings';

export default function ImageSettings() {
  const [activeTab, setActiveTab] = useState<'format' | 'animate' | 'filters'>('format');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCropMode, setIsCropMode] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
  const animationDropdownRef = useRef<HTMLDivElement>(null);

  // Advanced settings states
  const [rotation, setRotation] = useState(0);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (animationDropdownRef.current && !animationDropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200">
      {/* Header with grey background */}
      <div className="bg-gray-100 px-4 py-3 rounded-t-lg flex items-center justify-between h-16">
        <div className="flex items-center space-x-3">
          {/* Image preview square */}
          <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center border border-gray-300">
            <ImageIcon className="w-5 h-5 text-gray-700" />
          </div>
          {/* Image text */}
          <span className="text-sm font-medium text-gray-700">Image</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Replace image button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-gray-600 hover:text-gray-800 px-3 py-1 rounded-full text-sm font-medium border border-gray-300 hover:border-gray-400 transition-colors"
          >
            Replace image
          </button>
          
          {/* Trashcan button */}
          <button className="bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-50 w-8 h-8 rounded-full flex items-center justify-center border border-gray-300 hover:border-gray-400 transition-colors group relative" title="Remove media">
            <Trash2 className="w-4 h-4 text-gray-700" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Remove media
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          </button>
        </div>
      </div>
      
      {/* Tab buttons */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('format')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
            activeTab === 'format'
              ? 'text-black border-b-2 border-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Format
        </button>
        <button
          onClick={() => setActiveTab('animate')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
            activeTab === 'animate'
              ? 'text-black border-b-2 border-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Animate
        </button>
        <button
          onClick={() => setActiveTab('filters')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-all ${
            activeTab === 'filters'
              ? 'text-black border-b-2 border-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Filters
        </button>
      </div>
      
      {/* Content area */}
      <div className="p-4">
        {activeTab === 'format' && (
          <div className="space-y-4">
            {/* Reset size */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Reset size</span>
              <button className="w-8 h-8 rounded-md border border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32" className="text-gray-700">
                  <path fill="currentColor" d="M18 28A12 12 0 1 0 6 16v6.2l-3.6-3.6L1 20l6 6l6-6l-1.4-1.4L8 22.2V16a10 10 0 1 1 10 10Z"/>
                </svg>
              </button>
            </div>

            {/* Crop */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Crop</span>
              {!isCropMode ? (
                <button 
                  onClick={() => setIsCropMode(true)}
                  className="w-8 h-8 rounded-md border border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="text-gray-700">
                    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21.25 17.653H9.347a3 3 0 0 1-3-3V2.75M2.75 6.347h3.597m11.306 11.306v3.597M8.917 6.347h5.736a3 3 0 0 1 3 3v5.736"/>
                  </svg>
                </button>
              ) : (
                <div className="flex space-x-1">
                  <button 
                    onClick={() => setIsCropMode(false)}
                    className="w-8 h-8 rounded-md border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors"
                    title="Confirm crop"
                  >
                    <Check className="w-4 h-4 text-gray-700" />
                  </button>
                  <button 
                    onClick={() => setIsCropMode(false)}
                    className="w-8 h-8 rounded-md border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center transition-colors"
                    title="Cancel crop"
                  >
                    <X className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              )}
            </div>

            {/* Order */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Order</span>
              <div className="flex space-x-2">
                <button
                  className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition-colors group relative"
                  title="Send media to back"
                >
                  <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fill="currentColor" d="M2 4.5A2.5 2.5 0 0 1 4.5 2h6A2.5 2.5 0 0 1 13 4.5V6H9.5A3.5 3.5 0 0 0 6 9.5V13H4.5A2.5 2.5 0 0 1 2 10.5v-6ZM9.5 7A2.5 2.5 0 0 0 7 9.5v6A2.5 2.5 0 0 0 9.5 18h6a2.5 2.5 0 0 0 2.5-2.5v-6A2.5 2.5 0 0 0 15.5 7h-6ZM8 9.5A1.5 1.5 0 0 1 9.5 8h6A1.5 1.5 0 0 1 17 9.5v6a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 8 15.5v-6Z"/>
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Send media to back
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
                <button
                  className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition-colors group relative"
                  title="Send media backwards"
                >
                  <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fill="currentColor" d="M4.5 2A2.5 2.5 0 0 0 2 4.5v6A2.5 2.5 0 0 0 4.5 13H6v-1.707L5.293 12H4.5c-.232 0-.45-.053-.647-.146L6 9.707V9.5c0-.571.137-1.11.38-1.586l-3.234 3.233A1.495 1.495 0 0 1 3 10.5v-.94L9.56 3h.94c.232 0 .45.052.647.146L7.914 6.38A3.485 3.485 0 0 1 9.5 6h.207l2.147-2.147c.094.196.146.415.146.647v.793L11.293 6H13V4.5A2.5 2.5 0 0 0 10.5 2h-6ZM3 4.5A1.5 1.5 0 0 1 4.5 3h.647L3 5.147V4.5Zm0 2.06L6.56 3h1.587L3 8.147V6.56ZM7 9.5A2.5 2.5 0 0 1 9.5 7h6A2.5 2.5 0 0 1 18 9.5v6a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 7 15.5v-6ZM9.5 8A1.5 1.5 0 0 0 8 9.5v6A1.5 1.5 0 0 0 9.5 17h6a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 15.5 8h-6Z"/>
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Send media backwards
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
                <button
                  className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition-colors group relative"
                  title="Send media forwards"
                >
                  <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fill="currentColor" d="M7 14v1.5A2.5 2.5 0 0 0 9.5 18h6a2.5 2.5 0 0 0 2.5-2.5v-6A2.5 2.5 0 0 0 15.5 7H14v1h1.5A1.5 1.5 0 0 1 17 9.5v6a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 8 15.5V14H7ZM2 4.5A2.5 2.5 0 0 1 4.5 2h6A2.5 2.5 0 0 1 13 4.5v6a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 2 10.5v-6ZM4.5 3A1.5 1.5 0 0 0 3 4.5v.647L5.147 3H4.5Zm2.06 0L3 6.56v1.587L8.147 3H6.56ZM3 10.5c0 .232.052.45.146.647l8-8A1.495 1.495 0 0 0 10.5 3h-.94L3 9.56v.94ZM4.5 12h.793L12 5.293V4.5c0-.232-.053-.45-.146-.647l-8 8c.195.095.414.147.646.147Zm5.207 0h.793a1.5 1.5 0 0 0 1.5-1.5v-.793L9.707 12Zm-1.414 0L12 8.293V6.707L6.707 12h1.586Z"/>
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Send media forwards
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
                <button
                  className="w-8 h-8 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition-colors group relative"
                  title="Send media to front"
                >
                  <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fill="currentColor" d="M7 14v1.5A2.5 2.5 0 0 0 9.5 18h6a2.5 2.5 0 0 0 2.5-2.5v-6A2.5 2.5 0 0 0 15.5 7H14v1h1.5A1.5 1.5 0 0 1 17 9.5v6a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 8 15.5V14H7ZM2 4.5A2.5 2.5 0 0 1 4.5 2h6A2.5 2.5 0 0 1 13 4.5v6a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 2 10.5v-6Z"/>
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Send media to front
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
              </div>
            </div>

            {/* Advanced Settings Toggle */}
            <div className={`flex flex-col items-center justify-center py-2 ${!showAdvancedSettings ? '-mb-4 mb-[2px]' : ''}`}>
              <button
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="flex flex-col items-center space-y-1 text-gray-600 hover:text-gray-800 transition-colors"
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
              showAdvancedSettings ? 'h-48' : 'h-0'
            } overflow-hidden`}>
              <div className={`px-4 transition-all duration-300 ease-in-out ${
                showAdvancedSettings ? 'pt-4 pb-4' : 'pt-0 pb-0'
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
        )}

        {activeTab === 'animate' && (
          <div className="space-y-4">
            {/* Animation type */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Animation type</span>
              <div className="relative" ref={animationDropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <span className="text-gray-700">None</span>
                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    {['None', 'Fade', 'Slide', 'Grow'].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setShowDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 flex items-center"
                      >
                        {option === 'None' ? (
                          <svg className="w-4 h-4 text-black mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <div className="w-4 h-4 mr-2"></div>
                        )}
                        <span className="text-gray-700">{option}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'filters' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 w-full">
              {/* No filter - white square with stop icon */}
              <div className="flex flex-col items-center">
                <button className="w-full aspect-[4/3] bg-white border-2 border-gray-300 rounded-md flex items-center justify-center hover:border-gray-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" className="text-gray-500">
                    <path fill="currentColor" d="M10 0C4.478 0 0 4.478 0 10s4.478 10 10 10s10-4.478 10-10S15.522 0 10 0Zm0 18.304A8.305 8.305 0 0 1 3.56 4.759l11.681 11.68A8.266 8.266 0 0 1 10 18.305Zm6.44-3.063L4.759 3.561a8.305 8.305 0 0 1 11.68 11.68Z"/>
                  </svg>
                </button>
                <span className="text-xs text-gray-600 mt-2">No filter</span>
              </div>
              
              {/* Random filter squares */}
              {['Vintage', 'Sepia', 'Black & White', 'Blur', 'Sharpen', 'Contrast', 'Brightness', 'Saturation'].map((filterName) => (
                <div key={filterName} className="flex flex-col items-center">
                  <button className="w-full aspect-[4/3] bg-gray-200 rounded-md flex items-center justify-center hover:bg-gray-300 transition-colors">
                  </button>
                  <span className="text-xs text-gray-600 mt-2">{filterName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Media component for modal selection */}
      <Media 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Choose Media"
        displayMode="modal"
      />
    </div>
    <div className="h-[5px]"></div>
    </>
  );
}
