'use client';

import { useState } from 'react';

interface PlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlayModal({ isOpen, onClose }: PlayModalProps) {
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
      <div 
        className="relative bg-white shadow-xl w-[1200px] max-w-[95vw] flex flex-col z-10"
        style={{ borderRadius: '12px' }}
      >
        {/* Header */}
        <div className="p-6 pb-3">
          <h2 className="text-lg text-gray-900 font-medium">Play Modal</h2>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Main content area */}
          <div className="flex gap-6 mb-6">
            {/* Left div with grey background - 70% width */}
            <div className="flex-1 bg-gray-100 rounded-lg min-h-[400px] flex items-center justify-center">
              <span className="text-gray-500">Video preview area</span>
            </div>
            
            {/* Right div with content */}
            <div className="w-[300px] flex-shrink-0">
              {/* Grey badges */}
              <div className="flex gap-2 mb-3">
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">Draft</span>
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">2 scenes</span>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Create your first AI video</h3>
              
              {/* Buttons */}
              <div className="flex flex-col gap-3 mb-4">
                <button className="bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium">
                  Generate video
                </button>
                <button className="bg-white text-black border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M7 17q-2.075 0-3.538-1.463T2 12q0-2.075 1.463-3.538T7 7h3q.425 0 .713.288T11 8q0 .425-.288.713T10 9H7q-1.25 0-2.125.875T4 12q0 1.25.875 2.125T7 15h3q.425 0 .713.288T11 16q0 .425-.288.713T10 17H7Zm2-4q-.425 0-.713-.288T8 12q0-.425.288-.713T9 11h6q.425 0 .713.288T16 12q0 .425-.288.713T15 13H9Zm5 4q-.425 0-.713-.288T13 16q0-.425.288-.713T14 15h3q1.25 0 2.125-.875T20 12q0-1.25-.875-2.125T17 9h-3q-.425 0-.713-.288T13 8q0-.425.288-.713T14 7h3q2.075 0 3.538 1.463T22 12q0 2.075-1.463 3.538T17 17h-3Z"/>
                  </svg>
                  Copy draft link
                </button>
              </div>
              
              {/* Blue info box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium">i</span>
                  </div>
                  <p className="text-blue-800 text-sm">
                    The preview has no lip movements. You need to generate the video to make it visible.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Rating section */}
          <div className="flex items-center justify-center gap-3">
            <span className="text-gray-700 font-medium">How's the video and voice quality?</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className="text-white hover:text-black transition-colors"
                  onClick={() => console.log(`Rated ${star} stars`)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
