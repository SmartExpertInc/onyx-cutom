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
        className="relative bg-white shadow-xl w-[1000px] max-w-[95vw] flex flex-col z-10"
        style={{ borderRadius: '12px' }}
      >
        {/* Header */}
        <div className="p-6 pb-3">
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Main content area */}
          <div className="flex gap-6 mb-6">
            {/* Left div with grey background - 70% width */}
            <div className="flex-1 bg-gray-100 rounded-lg min-h-[350px] flex items-center justify-center">
              <span className="text-gray-500">Video preview area</span>
            </div>
            
            {/* Right div with content */}
            <div className="w-[300px] flex-shrink-0">
              {/* Grey badges */}
              <div className="flex gap-2 mb-3">
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">Draft</span>
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">2 scenes</span>
              </div>
              
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">Create your first AI video</h3>
              
              {/* Buttons */}
              <div className="flex gap-3 mb-4">
                <button className="bg-black text-white px-3 py-2 rounded-xl hover:bg-gray-800 transition-colors font-medium text-sm whitespace-nowrap">
                  Generate video
                </button>
                <button className="bg-white text-black border border-gray-300 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2 text-sm whitespace-nowrap">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M7 17q-2.075 0-3.538-1.463T2 12q0-2.075 1.463-3.538T7 7h3q.425 0 .713.288T11 8q0 .425-.288.713T10 9H7q-1.25 0-2.125.875T4 12q0 1.25.875 2.125T7 15h3q.425 0 .713.288T11 16q0 .425-.288.713T10 17H7Zm2-4q-.425 0-.713-.288T8 12q0-.425.288-.713T9 11h6q.425 0 .713.288T16 12q0 .425-.288.713T15 13H9Zm5 4q-.425 0-.713-.288T13 16q0-.425.288-.713T14 15h3q1.25 0 2.125-.875T20 12q0-1.25-.875-2.125T17 9h-3q-.425 0-.713-.288T13 8q0-.425.288-.713T14 7h3q2.075 0 3.538 1.463T22 12q0 2.075-1.463 3.538T17 17h-3Z"/>
                  </svg>
                  Copy draft link
                </button>
              </div>
              
              {/* Blue info box */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
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
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mx-auto">
            <span className="text-gray-700 font-medium text-sm">How's the video and voice quality?</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className="transition-colors hover:scale-110"
                  onClick={() => console.log(`Rated ${star} stars`)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="text-gray-300 hover:text-black transition-colors">
                    <path fill="currentColor" d="m8.85 17.825l3.15-1.9l3.15 1.925l-.825-3.6l2.775-2.4l-3.65-.325l-1.45-3.4l-1.45 3.375l-3.65.325l2.775 2.425l-.825 3.575Zm3.15.45l-4.15 2.5q-.275.175-.575.15t-.525-.2q-.225-.175-.35-.438t-.05-.587l1.1-4.725L3.775 11.8q-.25-.225-.312-.513t.037-.562q.1-.275.3-.45t.55-.225l4.85-.425l1.875-4.45q.125-.3.388-.45t.537-.15q.275 0 .537.15t.388.45l1.875 4.45l4.85.425q.35.05.55.225t.3.45q.1.275.038.563t-.313.512l-3.675 3.175l1.1 4.725q.075.325-.05.588t-.35.437q-.225.175-.525.2t-.575-.15l-4.15-2.5Zm0-5.025Z"/>
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
