"use client";

import React, { useState } from 'react';

interface TransitionProps {
  // No props needed for side panel component
}

export default function Transition({}: TransitionProps) {
  const [selectedTransition, setSelectedTransition] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isApplyBetweenAllScenes, setIsApplyBetweenAllScenes] = useState(false);
  const [duration, setDuration] = useState(1.0);
  // Function to render the selected transition settings view
  const renderSelectedTransitionView = () => {
    if (!selectedTransition) return null;

    return (
      <div className="h-full flex flex-col">
        <div className="w-full border border-gray-300 rounded-md">
          {/* Top part - Light grey background */}
          <div className="bg-gray-100 p-4 flex items-center justify-between rounded-t-md">
            <div className="flex items-center gap-3">
              {/* Transition square */}
              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
              </div>
              
              {/* Transition name */}
              <div className="flex flex-col">
                <span className="text-gray-700 text-sm font-medium">{selectedTransition}</span>
              </div>
            </div>
            
            {/* Change button */}
            <button 
              className="px-3 py-1 text-xs rounded-full border border-gray-300 bg-white text-black hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setShowSettings(false)}
            >
              Change
            </button>
          </div>

          {/* Bottom part - White background */}
          <div className="bg-white p-4 flex-1 rounded-b-md">
            {/* Settings container */}
            <div className="p-4 rounded-lg">
              {/* Apply between all scenes row */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-gray-700 text-sm">Apply between all scenes</span>
                {/* Switch/Slider */}
                <div 
                  className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${
                    isApplyBetweenAllScenes ? 'bg-black' : 'bg-gray-300'
                  }`}
                  onClick={() => setIsApplyBetweenAllScenes(!isApplyBetweenAllScenes)}
                >
                  <div 
                    className={`w-4 h-4 rounded-full shadow-sm transition-transform ${
                      isApplyBetweenAllScenes ? 'bg-white translate-x-6' : 'bg-white'
                    }`}
                  ></div>
                </div>
              </div>

              {/* Duration row */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-gray-700 text-sm">Duration (sec)</span>
                <div className="flex items-center gap-2">
                  {/* Duration range slider */}
                  <div className="relative w-32 flex items-center">
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      defaultValue="1.0"
                      className="w-full h-0.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
                      onChange={(e) => {
                        const value = e.target.value;
                        setDuration(parseFloat(value));
                        const percentage = ((parseFloat(value) - 0.5) / 2.5) * 100 + '%';
                        e.target.style.background = `linear-gradient(to right, #000000 0%, #000000 ${percentage}, #e5e7eb ${percentage}, #e5e7eb 100%)`;
                      }}
                      style={{
                        background: `linear-gradient(to right, #000000 0%, #000000 40%, #e5e7eb 40%, #e5e7eb 100%)`
                      }}
                    />
                    <style jsx>{`
                      input[type="range"]::-webkit-slider-thumb {
                        appearance: none;
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                        background: #000000;
                        cursor: pointer;
                        border: none;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                      }
                      
                      input[type="range"]::-moz-range-thumb {
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                        background: #000000;
                        cursor: pointer;
                        border: none;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                      }
                      
                      input[type="range"]::-webkit-slider-track {
                        appearance: none;
                        background: transparent;
                      }
                      
                      input[type="range"]::-moz-range-track {
                        background: transparent;
                        border: none;
                      }
                    `}</style>
                  </div>
                  <span className="text-gray-600 text-sm w-8 text-right">{duration.toFixed(1)}</span>
                </div>
              </div>

              {/* Variant row */}
              <div className="flex items-center justify-between">
                <span className="text-gray-700 text-sm">Variant</span>
                <div className="flex gap-2">
                  {/* Circle button */}
                  <button className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center bg-white hover:bg-gray-50">
                    <div className="w-3 h-3 rounded-full bg-white border border-black"></div>
                  </button>
                  
                  {/* Horizontal chevrons button */}
                  <button className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center bg-white hover:bg-gray-50">
                    <svg width="16" height="16" viewBox="0 0 24 24" className="text-gray-600">
                      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m16 18l-6-6l6-6"/>
                      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8 18l6-6l-6-6"/>
                    </svg>
                  </button>
                  
                  {/* Vertical chevrons button */}
                  <button className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center bg-white hover:bg-gray-50">
                    <svg width="16" height="16" viewBox="0 0 24 24" className="text-gray-600">
                      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m18 16l-6-6l-6 6"/>
                      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m18 8l-6 6l-6-6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-white relative overflow-hidden w-full">
      {/* Show selected transition view if a transition is selected and showSettings is true */}
      {selectedTransition && showSettings ? (
        renderSelectedTransitionView()
      ) : (
        <>
          {/* Pill-shaped button with SVG and "No transition" text */}
          <button className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-full py-3 px-4 transition-colors duration-200">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24"
              className="text-gray-700"
            >
              <path 
                fill="currentColor" 
                d="m16.1 12.8l-1.4-1.45L17.75 9L12 4.55l-2.35 1.8l-1.4-1.45l2.525-1.95q.275-.2.588-.312T12 2.525q.325 0 .638.113t.587.312l6.75 5.25q.2.15.3.363t.1.437q0 .225-.1.438t-.3.362l-3.875 3Zm2.875 2.85l-1.45-1.45l1.225-.925q.275-.2.613-.2t.612.2q.4.3.4.787t-.4.788l-1 .8Zm.125 5.75l-3.3-3.3l-2.575 2q-.275.2-.587.313t-.638.112q-.325 0-.638-.112t-.587-.313l-6.75-5.25q-.4-.3-.388-.787t.413-.788q.275-.2.6-.2t.6.2L12 18.5l2.35-1.825l-1.425-1.425q-.225.125-.438.175t-.487.05q-.325 0-.625-.1t-.6-.325L4 9.775q-.2-.15-.288-.35T3.625 9q0-.225.075-.438t.275-.362l1.05-.825l-2.95-2.95q-.3-.3-.3-.7t.3-.7q.3-.3.713-.3t.712.3L20.5 20q.275.275.275.7t-.275.7q-.275.275-.7.275t-.7-.275ZM12.2 8.875Z"
              />
            </svg>
            <span className="text-gray-700 font-medium">No transition</span>
          </button>

          {/* Transition options grid */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {/* Fade */}
            <div 
              className="flex flex-col items-center cursor-pointer"
              onClick={() => {
                setSelectedTransition('Fade');
                setShowSettings(true);
              }}
            >
              <div className="w-20 h-20 bg-gray-200 rounded-lg mb-2 hover:bg-gray-300 transition-colors"></div>
              <span className="text-sm text-gray-700 text-center">Fade</span>
            </div>

            {/* Close */}
            <div 
              className="flex flex-col items-center cursor-pointer"
              onClick={() => {
                setSelectedTransition('Close');
                setShowSettings(true);
              }}
            >
              <div className="w-20 h-20 bg-gray-200 rounded-lg mb-2 hover:bg-gray-300 transition-colors"></div>
              <span className="text-sm text-gray-700 text-center">Close</span>
            </div>

            {/* Crop */}
            <div 
              className="flex flex-col items-center cursor-pointer"
              onClick={() => {
                setSelectedTransition('Crop');
                setShowSettings(true);
              }}
            >
              <div className="w-20 h-20 bg-gray-200 rounded-lg mb-2 hover:bg-gray-300 transition-colors"></div>
              <span className="text-sm text-gray-700 text-center">Crop</span>
            </div>

            {/* Blur */}
            <div 
              className="flex flex-col items-center cursor-pointer"
              onClick={() => {
                setSelectedTransition('Blur');
                setShowSettings(true);
              }}
            >
              <div className="w-20 h-20 bg-gray-200 rounded-lg mb-2 hover:bg-gray-300 transition-colors"></div>
              <span className="text-sm text-gray-700 text-center">Blur</span>
            </div>

            {/* Open */}
            <div 
              className="flex flex-col items-center cursor-pointer"
              onClick={() => {
                setSelectedTransition('Open');
                setShowSettings(true);
              }}
            >
              <div className="w-20 h-20 bg-gray-200 rounded-lg mb-2 hover:bg-gray-300 transition-colors"></div>
              <span className="text-sm text-gray-700 text-center">Open</span>
            </div>

            {/* Slide */}
            <div 
              className="flex flex-col items-center cursor-pointer"
              onClick={() => {
                setSelectedTransition('Slide');
                setShowSettings(true);
              }}
            >
              <div className="w-20 h-20 bg-gray-200 rounded-lg mb-2 hover:bg-gray-300 transition-colors"></div>
              <span className="text-sm text-gray-700 text-center">Slide</span>
            </div>

            {/* Wipe */}
            <div 
              className="flex flex-col items-center cursor-pointer"
              onClick={() => {
                setSelectedTransition('Wipe');
                setShowSettings(true);
              }}
            >
              <div className="w-20 h-20 bg-gray-200 rounded-lg mb-2 hover:bg-gray-300 transition-colors"></div>
              <span className="text-sm text-gray-700 text-center">Wipe</span>
            </div>

            {/* Smooth wipe */}
            <div 
              className="flex flex-col items-center cursor-pointer"
              onClick={() => {
                setSelectedTransition('Smooth wipe');
                setShowSettings(true);
              }}
            >
              <div className="w-20 h-20 bg-gray-200 rounded-lg mb-2 hover:bg-gray-300 transition-colors"></div>
              <span className="text-sm text-gray-700 text-center">Smooth wipe</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
