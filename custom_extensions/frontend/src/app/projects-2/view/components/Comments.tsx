"use client";

import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface CommentsProps {
  // Add props as needed
}

export default function Comments({}: CommentsProps) {
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[300px]">
      <div className="flex items-center gap-2 mb-3">
        <span 
          className="font-semibold text-gray-400"
          style={{
            fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
            fontSize: '12px',
            letterSpacing: '0.05em'
          }}
        >
          COMMENTS
        </span>
      </div>
      
      {/* Top row with search, status dropdown, and icon button */}
      <div className="flex items-center gap-3 mb-4">
        {/* Search bar */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search comments"
            className="w-full pl-10 pr-3 py-2 bg-gray-100 border-0 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
            }}
          />
        </div>

        {/* Status dropdown */}
        <button
          onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
          className="flex items-center gap-1 px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors"
          style={{
            fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
          }}
        >
          <span className="text-gray-700">Status</span>
          <ChevronDown size={14} className="text-gray-500" />
        </button>

        {/* Icon button */}
        <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24"
            className="text-gray-700"
          >
            <path 
              fill="currentColor" 
              d="M4 19q-.425 0-.713-.288T3 18q0-.425.288-.713T4 17h4q.425 0 .713.288T9 18q0 .425-.288.713T8 19H4ZM4 7q-.425 0-.713-.288T3 6q0-.425.288-.713T4 5h8q.425 0 .713.288T13 6q0 .425-.288.713T12 7H4Zm8 14q-.425 0-.713-.288T11 20v-4q0-.425.288-.713T12 15q.425 0 .713.288T13 16v1h7q.425 0 .713.288T21 18q0 .425-.288.713T20 19h-7v1q0 .425-.288.713T12 21Zm-4-6q-.425 0-.713-.288T7 14v-1H4q-.425 0-.713-.288T3 12q0-.425.288-.713T4 11h3v-1q0-.425.288-.713T8 9q.425 0 .713.288T9 10v4q0 .425-.288.713T8 15Zm4-2q-.425 0-.713-.288T11 12q0-.425.288-.713T12 11h8q.425 0 .713.288T21 12q0 .425-.288.713T20 13h-8Zm4-4q-.425 0-.713-.288T15 8V4q0-.425.288-.713T16 3q.425 0 .713.288T17 4v1h3q.425 0 .713.288T21 6q0 .425-.288.713T20 7h-3v1q0 .425-.288.713T16 9Z"
            />
          </svg>
        </button>
      </div>

      {/* Centered content */}
      <div className="flex flex-col items-center justify-center py-12">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="48" 
          height="48" 
          viewBox="0 0 24 24"
          className="text-black mb-3"
        >
          <path 
            fill="currentColor" 
            d="M4 18q-.825 0-1.413-.588T2 16V4q0-.825.588-1.413T4 2h16q.825 0 1.413.588T22 4v15.575q0 .675-.613.938T20.3 20.3L18 18H4Zm0-2h16V4H4v12Zm0 0V4v12Z"
          />
        </svg>
        <div 
          className="text-black text-center"
          style={{
            fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
            fontSize: '14px',
          }}
        >
          Add your first comment
        </div>
      </div>

      {/* Bottom comment input section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4">
        <div className="text-gray-500 text-sm mb-3" style={{
          fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
        }}>
          Comment or type @ to add others
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showOnAllScenes"
              className="w-4 h-4 text-gray-400 bg-gray-100 border-gray-300 rounded focus:ring-gray-200"
            />
            <label
              htmlFor="showOnAllScenes"
              className="text-gray-400 text-sm"
              style={{
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
              }}
            >
              Show on all scenes
            </label>
          </div>
          
          <button className="w-8 h-8 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24"
              className="text-gray-300"
            >
              <path 
                fill="currentColor" 
                d="M4.4 19.425q-.5.2-.95-.088T3 18.5V14l8-2l-8-2V5.5q0-.55.45-.838t.95-.087l15.4 6.5q.625.275.625.925t-.625.925l-15.4 6.5Z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
