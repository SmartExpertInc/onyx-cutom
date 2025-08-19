"use client";

import React, { useRef, useEffect } from 'react';

interface AiPopupProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

export default function AiPopup({ isOpen, onClose, position }: AiPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Background overlay */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* AI Popup */}
      <div 
        ref={popupRef}
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-96"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -100%)', // Center horizontally, position above the trigger
        }}
      >
        <div className="p-4">
          {/* Row 1: Header */}
          <div className="flex items-start gap-2 mb-3">
            <div className="flex-shrink-0 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48" className="text-gray-500">
                <defs>
                  <path id="arcticonsAiChat0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M16.63 29.522v4.224l-2.836 1.638a4.378 4.378 0 0 1-5.981-1.608l-.34-.589a4.369 4.369 0 0 1 1.608-5.971l2.896-1.668l3.535 2.047a2.227 2.227 0 0 1 1.118 1.927Zm6.252-14.699l-3.595-2.077V9.55a4.373 4.373 0 0 1 4.373-4.374h.69a4.37 4.37 0 0 1 4.363 4.374v3.196l-3.595 2.077c-.689.4-1.547.4-2.237 0ZM33.347 24l-3.915 2.257c-.449.26-.719.729-.719 1.238v4.724l-3.994-2.307h-.01c-.44-.26-.979-.26-1.418 0l-.01-.01l-3.994 2.307v-4.714c0-.51-.27-.978-.72-1.238L14.654 24l3.915-2.257c.45-.26.719-.729.719-1.238V15.79l3.994 2.307l.01-.01c.44.26.979.26 1.418 0l.01.01l3.994-2.307v4.714c0 .51.27.979.72 1.238L33.346 24Zm7.17 9.197l-.34.6a4.378 4.378 0 0 1-5.971 1.587l-2.836-1.638v-4.224c0-.799.43-1.528 1.118-1.927l3.535-2.047l2.896 1.668a4.375 4.375 0 0 1 1.598 5.981Z"/>
                </defs>
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M31.37 9.33v1.888l-2.657 1.528V9.55a4.37 4.37 0 0 0-4.364-4.374h-.689a4.373 4.373 0 0 0-4.373 4.374v10.955c0 .51-.27.979-.72 1.238L14.654 24l-2.676-1.548l3.535-2.037a2.244 2.244 0 0 0 1.118-1.937V9.34a6.844 6.844 0 0 1 6.84-6.84h1.07a6.827 6.827 0 0 1 6.83 6.83Zm-2.657 22.888v3.036l-3.595-2.077a2.288 2.288 0 0 0-2.236 0l-3.595 2.077l-2.657 1.528l-1.657.959a6.838 6.838 0 0 1-9.337-2.497l-.27-.47l-.27-.458a6.83 6.83 0 0 1 2.507-9.337l1.697-.98l2.677 1.549l-2.896 1.668a4.369 4.369 0 0 0-1.608 5.971l.34.59a4.378 4.378 0 0 0 5.981 1.607l2.836-1.638l2.657-1.538l3.994-2.306l.01.01c.44-.26.979-.26 1.418 0h.01l3.994 2.307Z"/>
                <use href="#arcticonsAiChat0" strokeLinecap="round" strokeLinejoin="round"/>
                <use href="#arcticonsAiChat0" strokeLinecap="round" strokeLinejoin="round"/>
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M19.287 27.495v4.714l-2.657 1.537v-4.224c0-.799-.43-1.528-1.118-1.927l-3.535-2.047L9.3 24l-1.698-.979a6.83 6.83 0 0 1-2.506-9.336l.27-.46l.269-.47a6.838 6.838 0 0 1 9.337-2.496l1.657.959v3.036l-2.836-1.638a4.378 4.378 0 0 0-5.981 1.608l-.34.589a4.369 4.369 0 0 0 1.608 5.971l2.896 1.668L14.653 24l3.915 2.257c.45.26.719.729.719 1.238Z"/>
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m15.512 20.415l-3.535 2.037l-2.896-1.668a4.369 4.369 0 0 1-1.608-5.971l.34-.59a4.378 4.378 0 0 1 5.981-1.607l2.836 1.638v4.224c0 .799-.43 1.537-1.118 1.937Zm20.511 5.133l-3.535 2.047a2.227 2.227 0 0 0-1.118 1.927v9.147a6.827 6.827 0 0 1-6.83 6.831h-1.07a6.844 6.844 0 0 1-6.84-6.84v-1.878l2.657-1.528v3.196a4.373 4.373 0 0 0 4.374 4.374h.689a4.37 4.37 0 0 0 4.363-4.374V27.495c0-.51.27-.978.72-1.238L33.346 24l2.676 1.548Z"/>
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m25.118 33.177l3.595 2.077v3.196a4.37 4.37 0 0 1-4.364 4.374h-.689a4.373 4.373 0 0 1-4.373-4.374v-3.196l3.595-2.077a2.288 2.288 0 0 1 2.237 0Zm15.279-10.156L38.7 24l-2.677-1.548l2.896-1.668a4.375 4.375 0 0 0 1.598-5.981l-.34-.59a4.372 4.372 0 0 0-5.971-1.597l-2.836 1.638l-2.657 1.538l-3.994 2.306l-.01-.01c-.44.26-.979.26-1.418 0l-.01.01l-3.994-2.306v-3.046l3.595 2.077c.689.4 1.548.4 2.237 0l3.595-2.077l2.656-1.528l1.658-.959a6.838 6.838 0 0 1 9.337 2.497l.27.47l.269.459a6.83 6.83 0 0 1-2.507 9.337Z"/>
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M29.432 21.743L33.347 24l-3.915 2.257c-.449.26-.719.729-.719 1.238v4.724l-3.994-2.307h-.01c-.44-.26-.979-.26-1.418 0l-.01-.01l-3.994 2.307v-4.714c0-.51-.27-.978-.72-1.238L14.654 24l3.915-2.257c.45-.26.719-.729.719-1.238V15.79l3.994 2.307l.01-.01c.44.26.979.26 1.418 0l.01.01l3.994-2.307v4.714c0 .51.27.979.72 1.238Zm9.488-.958l-2.897 1.667l-3.535-2.037a2.244 2.244 0 0 1-1.118-1.937v-4.224l2.836-1.638a4.372 4.372 0 0 1 5.971 1.598l.34.589a4.375 4.375 0 0 1-1.598 5.982Zm-22.29-6.531v4.224c0 .799-.43 1.537-1.118 1.937l-3.535 2.037l-2.896-1.668a4.369 4.369 0 0 1-1.608-5.971l.34-.59a4.378 4.378 0 0 1 5.981-1.607l2.836 1.638Zm12.083 21v3.196a4.37 4.37 0 0 1-4.364 4.374h-.689a4.373 4.373 0 0 1-4.373-4.374v-3.196l3.595-2.077a2.288 2.288 0 0 1 2.237 0l3.595 2.077Z"/>
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m42.904 34.316l-.27.459l-.27.47a6.838 6.838 0 0 1-9.337 2.496l-1.657-.959v-3.036l2.836 1.638a4.378 4.378 0 0 0 5.971-1.588l.34-.599a4.375 4.375 0 0 0-1.598-5.981l-2.896-1.668L33.347 24l-3.915-2.257a1.426 1.426 0 0 1-.719-1.238V15.79l2.657-1.537v4.224c0 .799.43 1.537 1.118 1.937l3.535 2.037L38.7 24l1.698.979a6.83 6.83 0 0 1 2.506 9.336Z"/>
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m33.347 24l-3.915 2.257c-.449.26-.719.729-.719 1.238v4.724l-3.994-2.307h-.01c-.44-.26-.979-.26-1.418 0l-.01-.01l-3.994 2.307v-4.714c0-.51-.27-.978-.72-1.238L14.654 24l3.915-2.257c.45-.26.719-.729.719-1.238V15.79l3.994 2.307l.01-.01c.44.26.979.26 1.418 0l.01.01l3.994-2.307v4.714c0 .51.27.979.72 1.238L33.346 24Zm5.573-3.215l-2.897 1.667l-3.535-2.037a2.244 2.244 0 0 1-1.118-1.937v-4.224l2.836-1.638a4.372 4.372 0 0 1 5.971 1.598l.34.589a4.375 4.375 0 0 1-1.598 5.982Z"/>
                <circle cx="24" cy="24" r=".75" fill="currentColor"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Ask me anything, or choose an option below"
              className="flex-1 text-sm text-gray-900 placeholder-gray-500 bg-transparent border-none outline-none focus:outline-none"
              autoFocus
            />
          </div>
          
          {/* First horizontal line */}
          <div className="border-t border-gray-300 -mx-4 mb-3"></div>
          
          {/* Row 2: Correct grammar */}
          <button className="w-full text-left text-sm text-black py-2 hover:bg-gray-50 rounded">
            Correct grammar
          </button>
          
          {/* Row 3: Soften tone */}
          <button className="w-full text-left text-sm text-black py-2 hover:bg-gray-50 rounded">
            Soften tone
          </button>
          
          {/* Row 4: Strengthen tone */}
          <button className="w-full text-left text-sm text-black py-2 hover:bg-gray-50 rounded">
            Strengthen tone
          </button>
          
          {/* Row 5: Brainstorm ideas */}
          <button className="w-full text-left text-sm text-black py-2 hover:bg-gray-50 rounded">
            Brainstorm ideas
          </button>
          
          {/* Second horizontal line */}
          <div className="border-t border-gray-300 -mx-4 my-3"></div>
          
          {/* FAQ row */}
          <button className="w-full flex items-center gap-2 text-left text-sm text-gray-500 py-2 hover:bg-gray-50 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
              <g fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 14h1v9h1m12-7a13 13 0 1 1-26 0a13 13 0 0 1 26 0Z"/>
                <path fill="currentColor" d="M17 9.5a1 1 0 1 1-2 0a1 1 0 0 1 2 0Z"/>
              </g>
            </svg>
            AI Assistant FAQ
          </button>
        </div>
      </div>
    </>
  );
}
