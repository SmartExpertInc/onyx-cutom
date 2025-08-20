'use client';

import { useState } from 'react';

interface GenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export default function GenerateModal({ isOpen, onClose, title }: GenerateModalProps) {
  const [videoTitle, setVideoTitle] = useState(title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
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
      <div className="relative bg-white shadow-xl w-[600px] max-w-[95vw] flex flex-col z-10" style={{ borderRadius: '12px' }}>
        {/* Header */}
        <div className="p-6 pb-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Generate video</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Title input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
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
          <div className="border-t border-gray-200 mb-6"></div>
          
          {/* Subtitles */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-700">Subtitles</span>
            <button className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5 border border-gray-300 rounded-md">
              Select subtitle option
            </button>
          </div>
          
          {/* Resolution */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-700">Resolution</span>
            <button className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5 border border-gray-300 rounded-md">
              1080p HD
            </button>
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
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Summary</h3>
            
            {/* Generation time */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Generation time</span>
              <span className="text-sm text-gray-900">approx. 8 minutes</span>
            </div>
            
            {/* Video size */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">Video size (per video)</span>
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
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="bg-white text-black border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium text-sm">
              Start generation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
