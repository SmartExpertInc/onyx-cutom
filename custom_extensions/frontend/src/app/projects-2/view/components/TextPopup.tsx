"use client";

import React from 'react';

interface TextPopupProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

export default function TextPopup({ isOpen, onClose, position }: TextPopupProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop to close popup when clicking outside */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Popup */}
      <div 
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px]"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <div className="space-y-0">
          {/* Title */}
          <div className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors">
            <span 
              className="font-normal"
              style={{
                fontSize: '20px',
                lineHeight: '1.2',
                color: '#000000',
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
              }}
            >
              Title
            </span>
          </div>

          {/* Subtitle */}
          <div className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors">
            <span 
              className="font-normal"
              style={{
                fontSize: '16px',
                lineHeight: '1.3',
                color: '#333333',
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
              }}
            >
              Subtitle
            </span>
          </div>

          {/* Body Text */}
          <div className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors">
            <span 
              className="font-normal"
              style={{
                fontSize: '12px',
                lineHeight: '1.4',
                color: '#666666',
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
              }}
            >
              Body text
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
