"use client";

import React, { useState } from 'react';
import { Search, ChevronDown, X, RotateCcw, Check } from 'lucide-react';

interface CommentsProps {
  // Add props as needed
}

export default function Comments({}: CommentsProps) {
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [filterSelections, setFilterSelections] = useState<Record<string, string[]>>({
    comments: [],
    involved: [],
    people: [],
    assigned: [],
    tagged: [],
    groupedBy: []
  });

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleFilterToggle = (section: string, value: string) => {
    setFilterSelections(prev => ({
      ...prev,
      [section]: prev[section].includes(value)
        ? prev[section].filter(v => v !== value)
        : [...prev[section], value]
    }));
  };

  const handleReset = () => {
    setSelectedStatuses([]);
    setFilterSelections({
      comments: [],
      involved: [],
      people: [],
      assigned: [],
      tagged: [],
      groupedBy: []
    });
  };

  const handleApply = () => {
    // No action for now
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[300px] relative overflow-hidden h-full flex flex-col">
      {/* Top row with search, status dropdown, and icon button */}
      <div className="flex items-center gap-3 mb-4">
        {/* Search bar */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search comments"
            className="w-full pl-10 pr-3 py-2 bg-gray-100 border-0 rounded-xl text-sm focus:outline-none"
            style={{
              fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
            }}
          />
        </div>

        {/* Status dropdown */}
        <div className="relative">
          <button
            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
            className="flex items-center gap-1 px-3 py-2 text-base hover:bg-gray-100 rounded-md transition-colors"
            style={{
              fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
            }}
          >
            <span className="text-gray-700">Status</span>
            <ChevronDown size={14} className="text-gray-500" />
          </button>

          {/* Status dropdown popup */}
          {statusDropdownOpen && (
            <div className="absolute top-full -left-8 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-[160px] z-50">
              {/* Open status row */}
              <div className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded cursor-pointer">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-gray-700 text-sm"
                    style={{
                      fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                    }}
                  >
                    Open
                  </span>
                  <span 
                    className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs"
                    style={{
                      fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                    }}
                  >
                    0
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes('open')}
                  onChange={() => handleStatusToggle('open')}
                  className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-gray-200"
                />
              </div>

              {/* Resolved status row */}
              <div className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded cursor-pointer">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-gray-700 text-sm"
                    style={{
                      fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                    }}
                  >
                    Resolved
                  </span>
                  <span 
                    className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs"
                    style={{
                      fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                    }}
                  >
                    0
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes('resolved')}
                  onChange={() => handleStatusToggle('resolved')}
                  className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-gray-200"
                />
              </div>
            </div>
          )}
        </div>

        {/* Filter icon button */}
        <button 
          onClick={() => setFilterPanelOpen(!filterPanelOpen)}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
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

      {/* Filter panel - slides down from top */}
      <div 
        className={`absolute top-0 left-0 right-0 bg-white border-b border-gray-200 transition-transform duration-300 ease-in-out ${
          filterPanelOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ zIndex: 60 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <span 
            className="text-gray-700"
            style={{
              fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
              fontSize: '16px',
            }}
          >
            Filters
          </span>
          <button 
            onClick={() => setFilterPanelOpen(false)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={18} className="text-black" />
          </button>
        </div>

        {/* Filter content */}
        <div className="p-4 max-h-80 overflow-y-auto">
          {/* Comments section */}
          <div className="mb-6">
            <div className="text-base font-medium text-gray-700 mb-3" style={{
              fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
            }}>
              Comments
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filterSelections.comments.includes('all')}
                  onChange={() => handleFilterToggle('comments', 'all')}
                  className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-gray-200"
                />
                <span className="text-sm text-gray-700">All</span>
              </div>
              <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">0</span>
            </div>
          </div>

          {/* Involved section */}
          <div className="mb-6">
            <div className="text-base font-medium text-gray-700 mb-3" style={{
              fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
            }}>
              Involved
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filterSelections.involved.includes('all')}
                    onChange={() => handleFilterToggle('involved', 'all')}
                    className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-gray-200"
                  />
                  <span className="text-sm text-gray-700">All</span>
                </div>
                <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">0</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filterSelections.involved.includes('me')}
                    onChange={() => handleFilterToggle('involved', 'me')}
                    className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-gray-200"
                  />
                  <span className="text-sm text-gray-700">Me</span>
                </div>
                <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">0</span>
              </div>
            </div>
          </div>

          {/* People section */}
          <div className="mb-6">
            <div className="text-base font-medium text-gray-700 mb-3" style={{
              fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
            }}>
              People
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filterSelections.people.includes('all')}
                    onChange={() => handleFilterToggle('people', 'all')}
                    className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-gray-200"
                  />
                  <span className="text-sm text-gray-700">All</span>
                </div>
                <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">0</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filterSelections.people.includes('me')}
                    onChange={() => handleFilterToggle('people', 'me')}
                    className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-gray-200"
                  />
                  <span className="text-sm text-gray-700">Me</span>
                </div>
                <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">0</span>
              </div>
            </div>
          </div>

          {/* Assigned section */}
          <div className="mb-6">
            <div className="text-base font-medium text-gray-700 mb-3" style={{
              fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
            }}>
              Assigned
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filterSelections.assigned.includes('all')}
                    onChange={() => handleFilterToggle('assigned', 'all')}
                    className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-gray-200"
                  />
                  <span className="text-sm text-gray-700">All</span>
                </div>
                <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">0</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filterSelections.assigned.includes('me')}
                    onChange={() => handleFilterToggle('assigned', 'me')}
                    className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-gray-200"
                  />
                  <span className="text-sm text-gray-700">Me</span>
                </div>
                <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">0</span>
              </div>
            </div>
          </div>

          {/* Tagged section */}
          <div className="mb-6">
            <div className="text-base font-medium text-gray-700 mb-3" style={{
              fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
            }}>
              Tagged
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filterSelections.tagged.includes('all')}
                    onChange={() => handleFilterToggle('tagged', 'all')}
                    className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-gray-200"
                  />
                  <span className="text-sm text-gray-700">All</span>
                </div>
                <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">0</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filterSelections.tagged.includes('me')}
                    onChange={() => handleFilterToggle('tagged', 'me')}
                    className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-gray-200"
                  />
                  <span className="text-sm text-gray-700">Me</span>
                </div>
                <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">0</span>
              </div>
            </div>
          </div>

          {/* Grouped By section */}
          <div className="mb-6">
            <div className="text-base font-medium text-gray-700 mb-3" style={{
              fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
            }}>
              Grouped By
            </div>
            <div className="space-y-2">
              {['Assigned', 'Involved', 'Comments', 'People', 'Tagged'].map((option) => (
                <div key={option} className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    checked={filterSelections.groupedBy.includes(option.toLowerCase())}
                    onChange={() => handleFilterToggle('groupedBy', option.toLowerCase())}
                    className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-gray-200"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with buttons */}
        <div className="border-t border-gray-200 p-4 flex gap-3 rounded-b-lg">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-black rounded-full hover:bg-gray-200 transition-colors flex-1 justify-center"
            style={{
              fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
              fontSize: '14px',
            }}
          >
            <RotateCcw size={16} />
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex-1 justify-center"
            style={{
              fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
              fontSize: '14px',
            }}
          >
            <Check size={16} />
            Apply
          </button>
        </div>
      </div>

      {/* Centered content */}
      <div className="flex flex-col items-center justify-center py-12 flex-1">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="36" 
          height="36" 
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mt-4">
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
              className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-gray-200"
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
          
          <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
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
