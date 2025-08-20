"use client";

import React, { useState } from 'react';
import { Search, Play, Volume2 } from 'lucide-react';

export default function Music() {
  const [activeButton, setActiveButton] = useState<'stock' | 'upload'>('stock');
  const [selectedMusic, setSelectedMusic] = useState<string | null>('no-music');
  const [isBackgroundMusicEnabled, setIsBackgroundMusicEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const selectBtnClass = "opacity-0 group-hover:opacity-100 px-3 py-1 text-sm rounded-full border border-gray-300 bg-white text-black hover:bg-gray-50 transition-all cursor-pointer";

  // Track information mapping
  const trackInfo = {
    'corporate': { name: 'Corporate', duration: '2:46' },
    'happy': { name: 'Happy', duration: '3:12' },
    'vibe-vacation': { name: 'Vibe Vacation', duration: '2:58' },
    'inspiring': { name: 'Inspiring', duration: '3:30' },
    'long-journey': { name: 'Long Journey', duration: '4:15' },
    'outside-the-lines': { name: 'Outside The Lines', duration: '2:55' },
    'motivation': { name: 'Motivation', duration: '3:45' },
    'relaxing': { name: 'Relaxing', duration: '4:20' }
  };

  // Function to render the selected track view
  const renderSelectedTrackView = () => {
    const track = trackInfo[selectedMusic as keyof typeof trackInfo];
    if (!track) return null;

    return (
      <div className="h-full flex flex-col">
        <div className="w-full border border-gray-300 rounded">
          {/* Top part - Light grey background */}
          <div className="bg-gray-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Play button */}
              <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center bg-white cursor-pointer">
                <Play size={18} className="text-gray-600 ml-0.5" />
              </div>
              
              {/* Track info */}
              <div className="flex flex-col">
                <span className="text-gray-700 text-sm font-medium">{track.name}</span>
                <span className="text-gray-500 text-xs">{track.duration}</span>
              </div>
            </div>
            
            {/* Change button */}
            <button 
              className="px-3 py-1 text-sm rounded-full border border-gray-300 bg-white text-black hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setShowSettings(false)}
            >
              Change
            </button>
          </div>

          {/* Bottom part - White background */}
          <div className="bg-white p-4 flex-1">
            {/* Settings container */}
            <div className="bg-gray-50 p-4 rounded-lg">
              {/* Set as background music row */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-gray-700 text-sm">Set as background music everywhere</span>
                {/* Switch/Slider */}
                <div 
                  className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${
                    isBackgroundMusicEnabled ? 'bg-black' : 'bg-gray-300'
                  }`}
                  onClick={() => setIsBackgroundMusicEnabled(!isBackgroundMusicEnabled)}
                >
                  <div 
                    className={`w-4 h-4 rounded-full shadow-sm transition-transform ${
                      isBackgroundMusicEnabled ? 'bg-white translate-x-6' : 'bg-white'
                    }`}
                  ></div>
                </div>
              </div>

              {/* Volume control row */}
              <div className="flex items-center justify-between">
                <span className="text-gray-700 text-sm">Volume</span>
                <div className="flex items-center gap-2">
                  <Volume2 size={16} className="text-gray-600 flex-shrink-0" />
                  {/* Volume range slider */}
                  <div className="relative w-32 flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="50"
                      className="w-full h-0.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
                      onChange={(e) => {
                        const value = e.target.value;
                        const percentage = value + '%';
                        e.target.style.background = `linear-gradient(to right, #000000 0%, #000000 ${percentage}, #e5e7eb ${percentage}, #e5e7eb 100%)`;
                      }}
                      style={{
                        background: `linear-gradient(to right, #000000 0%, #000000 50%, #e5e7eb 50%, #e5e7eb 100%)`
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
      {/* Grey div with two buttons at the top - only show when no track is selected */}
      {(!selectedMusic || selectedMusic === 'no-music') && (
        <div className="bg-gray-200 rounded-lg px-1 py-1 flex gap-1 mt-4 mb-4">
          <button
            onClick={() => setActiveButton('stock')}
            className={`flex-1 py-1 text-sm rounded transition-colors ${
              activeButton === 'stock' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-300'
            }`}
          >
            Stock
          </button>
          <button
            onClick={() => setActiveButton('upload')}
            className={`flex-1 py-1 text-sm rounded transition-colors ${
              activeButton === 'upload' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-300'
            }`}
          >
            Upload
          </button>
        </div>
      )}

      {/* Content based on active button */}
      {activeButton === 'stock' ? (
        // Show selected track view if a track is selected (not 'no-music') and showSettings is true
        selectedMusic && selectedMusic !== 'no-music' && showSettings ? (
          renderSelectedTrackView()
        ) : (
          <div className="h-full overflow-y-auto">
            {/* Search bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={16} />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-1.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-black hover:border-black transition-colors text-sm"
              />
            </div>

            {/* No music content - now selectable */}
            <div 
              className={`group flex items-center justify-between py-4 px-5 rounded-lg transition-all mb-1 ${
                selectedMusic === 'no-music'
                  ? 'bg-white border border-black cursor-pointer'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => selectedMusic === 'no-music' && setSelectedMusic('no-music')}
            >
              <div className="flex items-center gap-3">
                {/* No icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" className="text-gray-500">
                  <g fill="currentColor" fillRule="evenodd" clipRule="evenodd">
                    <path d="M10 3.5a6.5 6.5 0 1 0 0 13a6.5 6.5 0 0 0 0-13ZM2.5 10a7.5 7.5 0 1 1 15 0a7.5 7.5 0 0 1-15 0Z"/>
                    <path d="M15.304 4.697a.5.5 0 0 1 0 .707l-9.9 9.9a.5.5 0 1 1-.707-.707l9.9-9.9a.5.5 0 0 1 .707 0Z"/>
                  </g>
                </svg>
                <span className="text-gray-700 text-sm">No music</span>
              </div>
              
              {/* Always reserve space for the right side content */}
              <div className="w-16 flex justify-end">
                {selectedMusic === 'no-music' ? (
                  <span className="text-gray-400 text-sm">Default</span>
                ) : (
                  <button 
                    className={selectBtnClass}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMusic('no-music');
                      setShowSettings(true);
                    }}
                  >
                    Select
                  </button>
                )}
              </div>
            </div>

            {/* Music item - Corporate */}
            <div 
              className={`group flex items-center justify-between py-4 px-5 rounded-lg transition-all mb-1 ${
                selectedMusic === 'corporate'
                  ? 'bg-white border border-black cursor-pointer hover:bg-gray-100'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => selectedMusic === 'corporate' && setSelectedMusic(selectedMusic === 'corporate' ? null : 'corporate')}
            >
              <div className="flex items-center gap-3">
                {/* Play triangle icon with grey borders */}
                <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                  <Play size={18} className="text-gray-600 ml-0.5" />
                </div>
                <span className="text-gray-700 text-sm">Corporate</span>
              </div>
              
              {/* Show Edit button when selected, Select button when not selected */}
              {selectedMusic === 'corporate' ? (
                                  <button 
                    className="hidden group-hover:block px-3 py-1 text-sm rounded-full bg-white text-black hover:bg-gray-50 transition-colors cursor-pointer"
                                      onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMusic('corporate');
                    setShowSettings(true);
                  }}
                  >
                    Edit
                  </button>
              ) : (
                <button 
                  className={selectBtnClass}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMusic('corporate');
                    setShowSettings(true);
                  }}
                >
                  Select
                </button>
              )}
            </div>

            {/* Music item - Happy */}
            <div 
              className={`group flex items-center justify-between py-4 px-5 rounded-lg transition-all mb-1 ${
                selectedMusic === 'happy'
                  ? 'bg-white border border-black cursor-pointer hover:bg-gray-100'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => selectedMusic === 'happy' && setSelectedMusic(selectedMusic === 'happy' ? null : 'happy')}
            >
              <div className="flex items-center gap-3">
                {/* Play triangle icon with grey borders */}
                <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                  <Play size={18} className="text-gray-600 ml-0.5" />
                </div>
                <span className="text-gray-700 text-sm">Happy</span>
              </div>
              
              {/* Show Edit button when selected, Select button when not selected */}
              {selectedMusic === 'happy' ? (
                <button 
                  className="hidden group-hover:block px-3 py-1 text-sm rounded-full bg-white text-black hover:bg-gray-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMusic('happy');
                    setShowSettings(true);
                  }}
                >
                  Edit
                </button>
              ) : (
                <button 
                  className={selectBtnClass}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMusic('happy');
                    setShowSettings(true);
                  }}
                >
                  Select
                </button>
              )}
            </div>

            {/* Music item - Vibe Vacation */}
            <div 
              className={`group flex items-center justify-between py-4 px-5 rounded-lg transition-all mb-1 ${
                selectedMusic === 'vibe-vacation'
                  ? 'bg-white border border-black cursor-pointer hover:bg-gray-100'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => selectedMusic === 'vibe-vacation' && setSelectedMusic(selectedMusic === 'vibe-vacation' ? null : 'vibe-vacation')}
            >
              <div className="flex items-center gap-3">
                {/* Play triangle icon with grey borders */}
                <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                  <Play size={18} className="text-gray-600 ml-0.5" />
                </div>
                <span className="text-gray-700 text-sm">Vibe Vacation</span>
              </div>
              
              {/* Show Edit button when selected, Select button when not selected */}
              {selectedMusic === 'vibe-vacation' ? (
                <button 
                  className="hidden group-hover:block px-3 py-1 text-sm rounded-full bg-white text-black hover:bg-gray-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMusic('vibe-vacation');
                    setShowSettings(true);
                  }}
                >
                  Edit
                </button>
              ) : (
                <button 
                  className={selectBtnClass}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMusic('vibe-vacation');
                    setShowSettings(true);
                  }}
                >
                  Select
                </button>
              )}
            </div>

            {/* Music item - Inspiring */}
            <div 
              className={`group flex items-center justify-between py-4 px-5 rounded-lg transition-all mb-1 ${
                selectedMusic === 'inspiring'
                  ? 'bg-white border border-black cursor-pointer hover:bg-gray-100'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => selectedMusic === 'inspiring' && setSelectedMusic(selectedMusic === 'inspiring' ? null : 'inspiring')}
            >
              <div className="flex items-center gap-3">
                {/* Play triangle icon with grey borders */}
                <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                  <Play size={18} className="text-gray-600 ml-0.5" />
                </div>
                <span className="text-gray-700 text-sm">Inspiring</span>
              </div>
              
              {/* Show Edit button when selected, Select button when not selected */}
              {selectedMusic === 'inspiring' ? (
                <button 
                  className="hidden group-hover:block px-3 py-1 text-sm rounded-full bg-white text-black hover:bg-gray-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMusic('inspiring');
                    setShowSettings(true);
                  }}
                >
                  Edit
                </button>
              ) : (
                <button 
                  className={selectBtnClass}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMusic('inspiring');
                    setShowSettings(true);
                  }}
                >
                  Select
                </button>
              )}
            </div>

            {/* Music item - Long Journey */}
            <div 
              className={`group flex items-center justify-between py-4 px-5 rounded-lg transition-all mb-1 ${
                selectedMusic === 'long-journey'
                  ? 'bg-white border border-black cursor-pointer hover:bg-gray-100'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => selectedMusic === 'long-journey' && setSelectedMusic(selectedMusic === 'long-journey' ? null : 'long-journey')}
            >
              <div className="flex items-center gap-3">
                {/* Play triangle icon with grey borders */}
                <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                  <Play size={18} className="text-gray-600 ml-0.5" />
                </div>
                <span className="text-gray-700 text-sm">Long Journey</span>
              </div>
              
              {/* Show Edit button when selected, Select button when not selected */}
              {selectedMusic === 'long-journey' ? (
                <button 
                  className="hidden group-hover:block px-3 py-1 text-sm rounded-full bg-white text-black hover:bg-gray-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMusic('long-journey');
                    setShowSettings(true);
                  }}
                >
                  Edit
                </button>
              ) : (
                <button 
                  className={selectBtnClass}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMusic('long-journey');
                    setShowSettings(true);
                  }}
                >
                  Select
                </button>
              )}
            </div>

            {/* Music item - Outside The Lines */}
            <div 
              className={`group flex items-center justify-between py-4 px-5 rounded-lg transition-all mb-1 ${
                selectedMusic === 'outside-the-lines'
                  ? 'bg-white border border-black cursor-pointer hover:bg-gray-100'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => selectedMusic === 'outside-the-lines' && setSelectedMusic(selectedMusic === 'outside-the-lines' ? null : 'outside-the-lines')}
            >
              <div className="flex items-center gap-3">
                {/* Play triangle icon with grey borders */}
                <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                  <Play size={18} className="text-gray-600 ml-0.5" />
                </div>
                <span className="text-gray-700 text-sm">Outside The Lines</span>
              </div>
              
              {/* Show Edit button when selected, Select button when not selected */}
              {selectedMusic === 'outside-the-lines' ? (
                <button 
                  className="hidden group-hover:block px-3 py-1 text-sm rounded-full bg-white text-black hover:bg-gray-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMusic('outside-the-lines');
                    setShowSettings(true);
                  }}
                >
                  Edit
                </button>
              ) : (
                <button 
                  className={selectBtnClass}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMusic('outside-the-lines');
                    setShowSettings(true);
                  }}
                >
                  Select
                </button>
              )}
            </div>

            {/* Music item - Motivation */}
            <div 
              className={`group flex items-center justify-between py-4 px-5 rounded-lg transition-all mb-1 ${
                selectedMusic === 'motivation'
                  ? 'bg-white border border-black cursor-pointer hover:bg-gray-100'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => selectedMusic === 'motivation' && setSelectedMusic(selectedMusic === 'motivation' ? null : 'motivation')}
            >
              <div className="flex items-center gap-3">
                {/* Play triangle icon with grey borders */}
                <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                  <Play size={18} className="text-gray-600 ml-0.5" />
                </div>
                <span className="text-gray-700 text-sm">Motivation</span>
              </div>
              
              {/* Show Edit button when selected, Select button when not selected */}
              {selectedMusic === 'motivation' ? (
                <button 
                  className="hidden group-hover:block px-3 py-1 text-sm rounded-full bg-white text-black hover:bg-gray-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMusic('motivation');
                    setShowSettings(true);
                  }}
                >
                  Edit
                </button>
              ) : (
                <button 
                  className={selectBtnClass}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMusic('motivation');
                    setShowSettings(true);
                  }}
                >
                  Select
                </button>
              )}
            </div>

            {/* Music item - Relaxing */}
            <div 
              className={`group flex items-center justify-between py-4 px-5 rounded-lg transition-all mb-1 ${
                selectedMusic === 'relaxing'
                  ? 'bg-white border border-black cursor-pointer hover:bg-gray-100'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => selectedMusic === 'relaxing' && setSelectedMusic(selectedMusic === 'relaxing' ? null : 'relaxing')}
            >
              <div className="flex items-center gap-3">
                {/* Play triangle icon with grey borders */}
                <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                  <Play size={18} className="text-gray-600 ml-0.5" />
                </div>
                <span className="text-gray-700 text-sm">Relaxing</span>
              </div>
              
              {/* Show Edit button when selected, Select button when not selected */}
              {selectedMusic === 'relaxing' ? (
                <button 
                  className="hidden group-hover:block px-3 py-1 text-sm rounded-full bg-white text-black hover:bg-gray-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMusic('relaxing');
                    setShowSettings(true);
                  }}
                >
                  Edit
                </button>
              ) : (
                <button 
                  className={selectBtnClass}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMusic('relaxing');
                    setShowSettings(true);
                  }}
                >
                  Select
                </button>
              )}
            </div>
          </div>
        )
      ) : (
        <div>
          {/* Upload container */}
          <div className="bg-gray-100 border border-dashed border-gray-400 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors" style={{ minHeight: '200px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="text-gray-500 mb-4">
              <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" color="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v8m0-8c-.7 0-2.008 1.994-2.5 2.5M12 8c.7 0 2.008 1.994 2.5 2.5"/>
              </g>
            </svg>
            <p className="text-gray-600 text-center text-sm">
              Drag and drop your document here or click to upload
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
