"use client";

import React, { useState } from 'react';
import { Search, Play } from 'lucide-react';

export default function Music() {
  const [activeButton, setActiveButton] = useState<'stock' | 'upload'>('stock');
  const [selectedMusic, setSelectedMusic] = useState<string | null>('no-music');

  const selectBtnClass = "hidden group-hover:block px-3 py-1 text-sm rounded-full border border-gray-300 bg-white text-black hover:bg-gray-50 transition-colors";

  return (
    <div className="h-full bg-white relative overflow-hidden w-full">
      {/* Grey div with two buttons at the top */}
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

      {/* Content based on active button */}
      {activeButton === 'stock' ? (
        <div>
          {/* Search bar */}
          <div className="relative mb-4 px-4">
            <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-black" size={16} />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-1.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-black transition-colors"
            />
          </div>

          {/* No music content - now selectable */}
          <div 
            className={`group flex items-center justify-between py-4 px-5 rounded-lg cursor-pointer transition-all mb-4 ${
              selectedMusic === 'no-music'
                ? 'bg-white border border-black'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
            onClick={() => setSelectedMusic('no-music')}
          >
            <div className="flex items-center gap-3">
              {/* No icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" className="text-gray-500">
                <g fill="currentColor" fillRule="evenodd" clipRule="evenodd">
                  <path d="M10 3.5a6.5 6.5 0 1 0 0 13a6.5 6.5 0 0 0 0-13ZM2.5 10a7.5 7.5 0 1 1 15 0a7.5 7.5 0 0 1-15 0Z"/>
                  <path d="M15.304 4.697a.5.5 0 0 1 0 .707l-9.9 9.9a.5.5 0 1 1-.707-.707l9.9-9.9a.5.5 0 0 1 .707 0Z"/>
                </g>
              </svg>
              <span className="text-gray-700">No music</span>
            </div>
            
            {/* Show Select button when not selected, Default text when selected */}
            {selectedMusic === 'no-music' ? (
              <span className="text-gray-400 text-sm">Default</span>
            ) : (
              <button 
                className={selectBtnClass}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMusic('no-music');
                }}
              >
                Select
              </button>
            )}
          </div>

          {/* Music item - Corporate */}
          <div 
            className={`group flex items-center justify-between py-4 px-5 rounded-lg cursor-pointer transition-all ${
              selectedMusic === 'corporate'
                ? 'bg-white border border-black'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setSelectedMusic(selectedMusic === 'corporate' ? null : 'corporate')}
          >
            <div className="flex items-center gap-3">
              {/* Play triangle icon with grey borders */}
              <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                <Play size={18} className="text-gray-600 ml-0.5" />
              </div>
              <span className="text-gray-700">Corporate</span>
            </div>
            
            {/* Select button - only visible on hover when not selected */}
            {selectedMusic !== 'corporate' && (
              <button 
                className={selectBtnClass}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMusic('corporate');
                }}
              >
                Select
              </button>
            )}
          </div>

          {/* Music item - Happy */}
          <div 
            className={`group flex items-center justify-between py-4 px-5 rounded-lg cursor-pointer transition-all ${
              selectedMusic === 'happy'
                ? 'bg-white border border-black'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setSelectedMusic(selectedMusic === 'happy' ? null : 'happy')}
          >
            <div className="flex items-center gap-3">
              {/* Play triangle icon with grey borders */}
              <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                <Play size={18} className="text-gray-600 ml-0.5" />
              </div>
              <span className="text-gray-700">Happy</span>
            </div>
            
            {/* Select button - only visible on hover when not selected */}
            {selectedMusic !== 'happy' && (
              <button 
                className={selectBtnClass}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMusic('happy');
                }}
              >
                Select
              </button>
            )}
          </div>

          {/* Music item - Vibe Vacation */}
          <div 
            className={`group flex items-center justify-between py-4 px-5 rounded-lg cursor-pointer transition-all ${
              selectedMusic === 'vibe-vacation'
                ? 'bg-white border border-black'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setSelectedMusic(selectedMusic === 'vibe-vacation' ? null : 'vibe-vacation')}
          >
            <div className="flex items-center gap-3">
              {/* Play triangle icon with grey borders */}
              <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                <Play size={18} className="text-gray-600 ml-0.5" />
              </div>
              <span className="text-gray-700">Vibe Vacation</span>
            </div>
            
            {/* Select button - only visible on hover when not selected */}
            {selectedMusic !== 'vibe-vacation' && (
              <button 
                className={selectBtnClass}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMusic('vibe-vacation');
                }}
              >
                Select
              </button>
            )}
          </div>

          {/* Music item - Inspiring */}
          <div 
            className={`group flex items-center justify-between py-4 px-5 rounded-lg cursor-pointer transition-all ${
              selectedMusic === 'inspiring'
                ? 'bg-white border border-black'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setSelectedMusic(selectedMusic === 'inspiring' ? null : 'inspiring')}
          >
            <div className="flex items-center gap-3">
              {/* Play triangle icon with grey borders */}
              <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                <Play size={18} className="text-gray-600 ml-0.5" />
              </div>
              <span className="text-gray-700">Inspiring</span>
              </div>
            
            {/* Select button - only visible on hover when not selected */}
            {selectedMusic !== 'inspiring' && (
              <button 
                className={selectBtnClass}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMusic('inspiring');
                }}
              >
                Select
              </button>
            )}
          </div>

          {/* Music item - Long Journey */}
          <div 
            className={`group flex items-center justify-between py-4 px-5 rounded-lg cursor-pointer transition-all ${
              selectedMusic === 'long-journey'
                ? 'bg-white border border-black'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => setSelectedMusic(selectedMusic === 'long-journey' ? null : 'long-journey')}
          >
            <div className="flex items-center gap-3">
              {/* Play triangle icon with grey borders */}
              <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center">
                <Play size={18} className="text-gray-600 ml-0.5" />
              </div>
              <span className="text-gray-700">Long Journey</span>
            </div>
            
            {/* Select button - only visible on hover when not selected */}
            {selectedMusic !== 'long-journey' && (
              <button 
                className={selectBtnClass}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMusic('long-journey');
                }}
              >
                Select
              </button>
            )}
          </div>
        </div>
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
