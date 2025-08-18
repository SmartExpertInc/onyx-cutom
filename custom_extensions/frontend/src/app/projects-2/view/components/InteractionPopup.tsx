"use client";

import React from 'react';

interface InteractionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

export default function InteractionPopup({ isOpen, onClose, position }: InteractionPopupProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Popup */}
      <div 
        className="fixed bg-white border border-gray-200 rounded-lg shadow-lg p-6 z-50"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '500px'
        }}
      >
        {/* Content */}
        <div className="flex gap-8 justify-center">
          {/* Multiple Choice Option */}
          <div className="flex flex-col items-center cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors">
            <div className="mb-4">
              <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <style>
                  {`.light { fill: #e6e6e6; }
                   .dark { fill: url(#grad); }
                   .check {
                     stroke: white;
                     stroke-width: 3;
                     fill: none;
                     stroke-linecap: round;
                     stroke-linejoin: round;
                   }`}
                </style>

                {/* Gradient for dark block */}
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#111"/>
                    <stop offset="100%" stopColor="#555"/>
                  </linearGradient>
                </defs>

                {/* Top block */}
                <rect x="30" y="30" width="140" height="40" rx="12" ry="12" className="light"/>

                {/* Middle dark block */}
                <rect x="30" y="85" width="140" height="40" rx="12" ry="12" className="dark"/>

                {/* Bottom block */}
                <rect x="30" y="140" width="140" height="40" rx="12" ry="12" className="light"/>

                {/* Smaller Checkmark */}
                <path d="M85 103 L95 113 L115 93" className="check"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900">Multiple choice</span>
          </div>

          {/* Branching Option */}
          <div className="flex flex-col items-center cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors">
            <div className="mb-4">
              <svg width="400" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <style>
                  {`.node {
                     fill: url(#grad2);
                     rx: 12; ry: 12;
                   }
                   .line {
                     fill: none;
                     stroke: #333;
                     stroke-width: 4;
                   }`}
                </style>

                {/* Gradient */}
                <defs>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#111"/>
                    <stop offset="100%" stopColor="#999"/>
                  </linearGradient>
                </defs>

                {/* Left block */}
                <rect x="40" y="70" width="100" height="40" rx="12" ry="12" fill="url(#grad2)" />

                {/* Top right block */}
                <rect x="250" y="40" width="100" height="40" rx="12" ry="12" fill="#ddd" />

                {/* Bottom right block */}
                <rect x="250" y="120" width="100" height="40" rx="12" ry="12" fill="url(#grad2)" />

                {/* Curved connectors */}
                <path d="M140 90 C180 90 200 60 250 60" className="line" stroke="#ccc"/>
                <path d="M140 90 C180 90 200 140 250 140" className="line" stroke="#333"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900">Branching</span>
          </div>
        </div>
      </div>
    </>
  );
}
