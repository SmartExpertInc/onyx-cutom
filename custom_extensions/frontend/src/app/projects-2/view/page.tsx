"use client";

import React, { useState } from 'react';
import VideoEditorHeader from './components/VideoEditorHeader';
import Toolbar from './components/Toolbar';
import Script from './components/Script';
import Background from './components/Background';
import Music from './components/Music';
import Transition from './components/Transition';
import Comments from './components/Comments';
import Media from './components/Media';
import TextPopup from './components/TextPopup';

export default function Projects2ViewPage() {
  const [activeComponent, setActiveComponent] = useState<string>('script');
  const [isMediaPopupOpen, setIsMediaPopupOpen] = useState<boolean>(false);
  const [isTextPopupOpen, setIsTextPopupOpen] = useState<boolean>(false);
  const [textPopupPosition, setTextPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleActiveToolChange = (toolId: string) => {
    if (toolId === 'media') {
      setIsMediaPopupOpen(true);
    } else {
      setActiveComponent(toolId);
      setIsMediaPopupOpen(false);
    }
    // Close text popup when switching tools
    setIsTextPopupOpen(false);
  };

  const handleTextButtonClick = (position: { x: number; y: number }) => {
    setTextPopupPosition(position);
    setIsTextPopupOpen(true);
    // Close media popup if open
    setIsMediaPopupOpen(false);
  };

  const renderSidebarComponent = () => {
    switch (activeComponent) {
      case 'script':
        return <Script />;
      case 'background':
        return <Background />;
      case 'music':
        return <Music />;
      case 'transition':
        return <Transition />;
      case 'comments':
        return <Comments />;
      default:
        return <Script />;
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col p-2 relative">
      {/* Header */}
      <VideoEditorHeader />

      {/* Toolbar */}
      <div className="-mt-1">
        <Toolbar 
          onActiveToolChange={handleActiveToolChange} 
          onTextButtonClick={handleTextButtonClick}
        />
      </div>
      
      {/* Main Content Area - Horizontal layout under toolbar */}
      {/* Calculate available height: 100vh - header (68px) - toolbar (72px) = calc(100vh - 140px) */}
      <div className="flex gap-4 overflow-hidden mt-[5px]" style={{ height: 'calc(100vh - 145px)' }}>
        {/* Sidebar - 30% width, full height of available space */}
        <div className="w-[30%] h-full">
          {renderSidebarComponent()}
        </div>

        {/* Main Container - 70% width, full height of available space */}
        <div className="w-[70%] h-full flex flex-col gap-2">
          {/* Top Container - Takes 70% of main container height */}
          <div className="bg-gray-200 rounded-md overflow-auto" style={{ height: '80%' }}>
          </div>

          {/* Bottom Container - Takes 30% of main container height */}
          <div className="bg-white rounded-md overflow-auto p-4" style={{ height: 'calc(20% + 10px)' }}>
            <div className="flex items-center gap-4">
              {/* Play Button with Time */}
              <div className="relative flex items-center justify-center h-16">
                <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                  <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
                </button>
                <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-sm text-gray-600">00:00</span>
              </div>

              {/* Scene 1 Rectangle */}
              <div className="relative">
                <div className="w-24 h-16 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-500 rounded"></div>
                </div>
                <div className="absolute top-full left-0 mt-2 flex items-center gap-2">
                  <span className="text-sm font-medium">Scene 1</span>
                  <svg 
                    className="w-4 h-4 text-gray-600 hover:text-gray-800 cursor-pointer" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
                    />
                  </svg>
                </div>
              </div>

              {/* Add Scene Rectangle */}
              <div className="w-24 h-16 bg-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors">
                <svg 
                  className="w-8 h-8 text-gray-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Popup */}
      <Media 
        isOpen={isMediaPopupOpen} 
        onClose={() => setIsMediaPopupOpen(false)} 
        title="Media Library"
        displayMode="popup"
        className="top-[150px] left-2 w-[800px] h-[400px]"
      />

      {/* Text Popup */}
      <TextPopup 
        isOpen={isTextPopupOpen} 
        onClose={() => setIsTextPopupOpen(false)} 
        position={textPopupPosition}
      />
    </div>
  );
}
