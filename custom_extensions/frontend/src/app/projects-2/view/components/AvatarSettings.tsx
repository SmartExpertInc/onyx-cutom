import React, { useState } from 'react';
import AvatarPopup from './AvatarPopup';

export default function AvatarSettings() {
  const [isAvatarPopupOpen, setIsAvatarPopupOpen] = useState(false);
  const [appearanceMode, setAppearanceMode] = useState<'shoulder' | 'full-body' | 'bubble'>('shoulder');
  return (
    <div className="h-full bg-white rounded-lg border border-gray-200">
      {/* Header with grey background */}
      <div className="bg-gray-100 px-4 py-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Avatar placeholder circle */}
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
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
      <div className="p-4">
        <div className="space-y-4">
          {/* View */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">View</span>
            <div className="relative">
              <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <span className="text-gray-500">Select view...</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
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
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
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
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
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
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
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
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Send avatar to front
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </button>
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
  );
}
