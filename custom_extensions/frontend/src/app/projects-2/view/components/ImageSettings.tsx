import React, { useState } from 'react';
import { Trash2, Image as ImageIcon } from 'lucide-react';

export default function ImageSettings() {
  const [activeTab, setActiveTab] = useState<'format' | 'animate' | 'filters'>('format');
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="h-full bg-white rounded-lg border border-gray-200">
      {/* Header with grey background */}
      <div className="bg-gray-100 px-4 py-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Image preview square */}
          <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center border border-gray-300">
            <ImageIcon className="w-5 h-5 text-gray-500" />
          </div>
          {/* Image text */}
          <span className="text-sm font-medium text-gray-700">Image</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Replace image button */}
          <button className="bg-white text-gray-600 hover:text-gray-800 px-3 py-1 rounded-full text-sm font-medium border border-gray-300 hover:border-gray-400 transition-colors">
            Replace image
          </button>
          
          {/* Trashcan button */}
          <button className="bg-white text-gray-600 hover:text-red-600 px-3 py-1 rounded-full text-sm font-medium border border-gray-300 hover:border-red-300 transition-colors">
            <Trash2 className="w-4 h-4" />
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
            {/* Text */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Text</span>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                clickable
              </button>
            </div>

            {/* Reset size */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Reset size</span>
              <button className="w-8 h-8 rounded-md border border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
                  <path fill="currentColor" d="M18 28A12 12 0 1 0 6 16v6.2l-3.6-3.6L1 20l6 6l6-6l-1.4-1.4L8 22.2V16a10 10 0 1 1 10 10Z"/>
                </svg>
              </button>
            </div>

            {/* Crop */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Crop</span>
              <button className="w-8 h-8 rounded-md border border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21.25 17.653H9.347a3 3 0 0 1-3-3V2.75M2.75 6.347h3.597m11.306 11.306v3.597M8.917 6.347h5.736a3 3 0 0 1 3 3v5.736"/>
                </svg>
              </button>
            </div>

            {/* Order */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Order</span>
              <div className="flex space-x-2">
                <button className="w-8 h-8 rounded-md border border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors group relative" title="Bring to front">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Bring to front
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
                <button className="w-8 h-8 rounded-md border border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors group relative" title="Send to back">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Send to back
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
                <button className="w-8 h-8 rounded-md border border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors group relative" title="Bring forward">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Bring forward
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
                <button className="w-8 h-8 rounded-md border border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors group relative" title="Send backward">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Send backward
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'animate' && (
          <div className="space-y-4">
            {/* Animation type */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Animation type</span>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span>None</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <span>{option}</span>
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
            <div className="grid grid-cols-3 gap-3">
              {/* No filter - white square with stop icon */}
              <button className="w-16 h-16 bg-white border-2 border-gray-300 rounded-md flex flex-col items-center justify-center hover:border-gray-400 transition-colors">
                <svg className="w-6 h-6 text-gray-600 mb-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h12v12H6z"/>
                </svg>
                <span className="text-xs text-gray-600">No filter</span>
              </button>
              
              {/* Random filter squares */}
              {['Vintage', 'Sepia', 'Black & White', 'Blur', 'Sharpen', 'Contrast', 'Brightness', 'Saturation'].map((filterName) => (
                <button key={filterName} className="w-16 h-16 bg-gray-200 rounded-md flex flex-col items-center justify-center hover:bg-gray-300 transition-colors">
                  <span className="text-xs text-gray-600">{filterName}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
