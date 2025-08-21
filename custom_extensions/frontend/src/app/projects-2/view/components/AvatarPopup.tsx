"use client";

import React, { useRef, useEffect, useState } from 'react';

interface AvatarPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  displayMode?: 'modal' | 'popup';
  className?: string;
  position?: { x: number; y: number };
}

export default function AvatarPopup({ 
  isOpen, 
  onClose, 
  title = "Choose Avatar", 
  displayMode = 'popup',
  className = '',
  position
}: AvatarPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Handle click outside for popup mode
  useEffect(() => {
    if (!isOpen || displayMode !== 'popup') return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, displayMode, onClose]);

  if (!isOpen) return null;

  const [activeButton, setActiveButton] = useState<string>('button1');
  const [selectedItems, setSelectedItems] = useState<{[key: string]: boolean}>({});

  const handleCheckboxChange = (itemKey: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  const content = (
    <div className="flex h-full">
      {/* Left sidebar */}
      <div className="w-64 bg-white px-6 py-4 flex flex-col">
        {/* Three buttons at the top */}
        <div className="mb-4">
          <div className="flex items-center justify-between bg-white border border-gray-300 rounded-lg p-1">
            <button 
              onClick={() => setActiveButton('button1')}
              className={`px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                activeButton === 'button1' 
                  ? 'bg-gray-200 text-black' 
                  : 'bg-white text-gray-600'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveButton('button2')}
              className={`px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                activeButton === 'button2' 
                  ? 'bg-gray-200 text-black' 
                  : 'bg-white text-gray-600'
              }`}
            >
              Custom
            </button>
            <button 
              onClick={() => setActiveButton('button3')}
              className={`px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                activeButton === 'button3' 
                  ? 'bg-gray-200 text-black' 
                  : 'bg-white text-gray-600'
              }`}
            >
              Stock
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto pb-4">
          {/* Sex */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 mb-2">Sex</h4>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer pl-2">
                <input
                  type="checkbox"
                  checked={selectedItems['male'] || false}
                  onChange={() => handleCheckboxChange('male')}
                  className="mr-2 border-gray-400 text-black focus:ring-0"
                />
                <span className="text-sm text-black">Male</span>
              </label>
              <label className="flex items-center cursor-pointer pl-2">
                <input
                  type="checkbox"
                  checked={selectedItems['female'] || false}
                  onChange={() => handleCheckboxChange('female')}
                  className="mr-2 border-gray-400 text-black focus:ring-0"
                />
                <span className="text-sm text-black">Female</span>
              </label>
            </div>
          </div>

          {/* Feature */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 mb-2">Feature</h4>
            <div className="space-y-2">
              {['NEO avatar', 'Hand gesture', 'Emotions', 'Side view', 'Logo addition'].map((feature) => (
                <label key={feature} className="flex items-center cursor-pointer pl-2">
                  <input
                    type="checkbox"
                    checked={selectedItems[feature.toLowerCase().replace(/\s+/g, '_')] || false}
                    onChange={() => handleCheckboxChange(feature.toLowerCase().replace(/\s+/g, '_'))}
                    className="mr-2 border-gray-400 text-black focus:ring-0"
                  />
                  <span className="text-sm text-black">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Age */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 mb-2">Age</h4>
            <div className="space-y-2">
              {['Young', 'Middle-aged', 'Senior'].map((age) => (
                <label key={age} className="flex items-center cursor-pointer pl-2">
                  <input
                    type="checkbox"
                    checked={selectedItems[age.toLowerCase().replace(/\s+/g, '_')] || false}
                    onChange={() => handleCheckboxChange(age.toLowerCase().replace(/\s+/g, '_'))}
                    className="mr-2 border-gray-400 text-black focus:ring-0"
                  />
                  <span className="text-sm text-black">{age}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ethnicity */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 mb-2">Ethnicity</h4>
            <div className="space-y-2">
              {['Caucasian', 'Black / African American', 'East Asian', 'Hispanic / Latino', 'South Asian'].map((ethnicity) => (
                <label key={ethnicity} className="flex items-center cursor-pointer pl-2">
                  <input
                    type="checkbox"
                    checked={selectedItems[ethnicity.toLowerCase().replace(/[\/\s]+/g, '_')] || false}
                    onChange={() => handleCheckboxChange(ethnicity.toLowerCase().replace(/[\/\s]+/g, '_'))}
                    className="mr-2 border-gray-400 text-black focus:ring-0"
                  />
                  <span className="text-sm text-black">{ethnicity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Scenario */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 mb-2">Scenario</h4>
            <div className="space-y-2">
              {['Office', 'Healthcare', 'Factory', 'Education', 'Construction', 'Heavy machinery', 'Retail & hospitality', 'Government', 'Customer support', 'Storage facility', 'Other'].map((scenario) => (
                <label key={scenario} className="flex items-center cursor-pointer pl-2">
                  <input
                    type="checkbox"
                    checked={selectedItems[scenario.toLowerCase().replace(/[&\s]+/g, '_')] || false}
                    onChange={() => handleCheckboxChange(scenario.toLowerCase().replace(/[&\s]+/g, '_'))}
                    className="mr-2 border-gray-400 text-black focus:ring-0"
                  />
                  <span className="text-sm text-black">{scenario}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Avatar type */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 mb-2">Avatar type</h4>
            <div className="space-y-2">
              {['Studio avatar', 'Instant avatar', 'Scenario avatar'].map((avatarType) => (
                <label key={avatarType} className="flex items-center cursor-pointer pl-2">
                  <input
                    type="checkbox"
                    checked={selectedItems[avatarType.toLowerCase().replace(/\s+/g, '_')] || false}
                    onChange={() => handleCheckboxChange(avatarType.toLowerCase().replace(/\s+/g, '_'))}
                    className="mr-2 border-gray-400 text-black focus:ring-0"
                  />
                  <span className="text-sm text-black">{avatarType}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer - appears when items are checked */}
        {Object.values(selectedItems).some(Boolean) && (
          <div className="mt-4 pt-4 border-t border-gray-200 rounded-bl-lg -mx-6">
            <button 
              onClick={() => setSelectedItems({})}
              className="flex items-center justify-center gap-2 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-sm font-medium"
              style={{ width: 'fit-content' }}
            >
              <span className="text-base">×</span>
              <span>Reset filter ({Object.values(selectedItems).filter(Boolean).length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Vertical divider */}
      <div className="w-px bg-gray-200"></div>

      {/* Right main area */}
      <div className="flex-1 flex flex-col p-4">
        {/* Search bar and create button - fixed at top */}
        <div className="flex items-center gap-4 mb-6 flex-shrink-0">
          {/* Search bar */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {/* Black magnifying glass icon */}
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-black focus:ring-0"
            />
          </div>
          
          {/* Create button */}
          <button className="px-4 py-2 text-blue-600 rounded-lg hover:bg-blue-500 hover:bg-opacity-10 transition-colors font-medium" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            + Create
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto pb-4">
          {/* Avatar rectangles grid */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'Sarah Johnson' },
              { name: 'Michael Chen' },
              { name: 'Emma Rodriguez' },
              { name: 'David Thompson' },
              { name: 'Lisa Park' },
              { name: 'James Wilson' },
              { name: 'Maria Garcia' },
              { name: 'Robert Kim' },
              { name: 'Jennifer Lee' }
            ].map((avatar, index) => (
              <div key={index} className="flex flex-col items-center">
                {/* Avatar rectangle */}
                <div className="w-full h-32 bg-gray-200 rounded-lg mb-2"></div>
                {/* Name */}
                <span className="text-sm text-black font-medium">{avatar.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Modal display mode
  if (displayMode === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Light background overlay */}
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
          onClick={onClose}
        ></div>
        
        {/* Modal content */}
        <div 
          className={`relative bg-white shadow-xl max-w-4xl w-full mx-4 z-10 h-[420px] overflow-hidden ${className}`}
          style={{ borderRadius: '12px' }}
        >
          {/* Main content area with sidebar */}
          {content}
        </div>
      </div>
    );
  }

  // Popup display mode
  if (displayMode === 'popup') {
    return (
      <div 
        ref={popupRef}
        className={`fixed z-50 bg-white shadow-xl border border-gray-200 overflow-hidden ${className}`} 
        style={{ 
          borderRadius: '12px',
          left: position?.x || 0,
          top: position?.y || 0,
          width: '800px',
          height: '420px'
        }}
      >
        {/* Main content area with sidebar */}
        {content}
      </div>
    );
  }

  return null;
}
