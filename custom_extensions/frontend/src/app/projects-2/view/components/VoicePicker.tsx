"use client";

import React, { useState } from 'react';
import { Search, Globe, Cake, Radio, Briefcase, ChevronDown, ChevronRight, Flag, Volume2, Check } from 'lucide-react';

interface VoicePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVoice?: (voice: any) => void;
}

export default function VoicePicker({ isOpen, onClose, onSelectVoice }: VoicePickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [accentDropdownOpen, setAccentDropdownOpen] = useState(false);
  const [ageDropdownOpen, setAgeDropdownOpen] = useState(false);
  const [toneDropdownOpen, setToneDropdownOpen] = useState(false);
  const [scenarioDropdownOpen, setScenarioDropdownOpen] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [stability, setStability] = useState(50);
  const [applyTo, setApplyTo] = useState<'block' | 'scene' | 'all'>('block');
  const [selectedAccents, setSelectedAccents] = useState<string[]>([]);

  // Accent options with country flags
  const accentOptions = [
    { id: 'american', flag: '🇺🇸', text: 'American English' },
    { id: 'british', flag: '🇬🇧', text: 'British English' },
    { id: 'australian', flag: '🇦🇺', text: 'Australian English' },
    { id: 'indian', flag: '🇮🇳', text: 'English (India)' },
    { id: 'south-african', flag: '🇿🇦', text: 'English (South Africa)' }
  ];

  const toggleAccent = (accentId: string) => {
    setSelectedAccents(prev => 
      prev.includes(accentId) 
        ? prev.filter(id => id !== accentId)
        : [...prev, accentId]
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Custom CSS for range sliders */}
      <style jsx>{`
        .range-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #000000;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .range-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #000000;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .range-slider::-webkit-slider-track {
          appearance: none;
          background: transparent;
        }
        
        .range-slider::-moz-range-track {
          background: transparent;
          border: none;
        }
      `}</style>
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Light background overlay */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div 
        className="relative bg-white shadow-xl w-[900px] max-w-[95vw] max-h-[90vh] flex flex-col z-10"
        style={{ borderRadius: '12px' }}
      >
        
        {/* Row 1: Title */}
        <div className="p-6 pb-4">
          <h2 className="text-lg text-gray-900">Pick a voice</h2>
        </div>

        {/* Row 2: Search Bar */}
        <div className="px-6 pb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Row 3: Dropdown Buttons */}
        <div className="px-6 pb-4">
          <div className="flex gap-3">
            {/* Accent Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAccentDropdownOpen(!accentDropdownOpen)}
                className="flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-[120px]"
              >
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Accent</span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {/* Accent dropdown popup */}
              {accentDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                  {accentOptions.map((accent) => (
                    <div
                      key={accent.id}
                      onClick={() => toggleAccent(accent.id)}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      {/* Custom checkbox */}
                      <div className={`
                        w-4 h-4 rounded border flex items-center justify-center transition-colors
                        ${selectedAccents.includes(accent.id) 
                          ? 'bg-black border-black' 
                          : 'bg-white border-gray-300'
                        }
                      `}>
                        {selectedAccents.includes(accent.id) && (
                          <Check size={10} className="text-white" />
                        )}
                      </div>
                      
                      {/* Country flag */}
                      <span className="text-lg">{accent.flag}</span>
                      
                      {/* Text */}
                      <span className="text-sm text-gray-700">{accent.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Age Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAgeDropdownOpen(!ageDropdownOpen)}
                className="flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-[120px]"
              >
                <div className="flex items-center gap-2">
                  <Cake size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Age</span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {/* Placeholder for age dropdown popup */}
              {ageDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                  <div className="text-sm text-gray-500">Age options coming soon...</div>
                </div>
              )}
            </div>

            {/* Tone Dropdown */}
            <div className="relative">
              <button
                onClick={() => setToneDropdownOpen(!toneDropdownOpen)}
                className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-[120px]"
              >
                <div className="flex items-center gap-2">
                  <Radio size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Tone</span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {/* Placeholder for tone dropdown popup */}
              {toneDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                  <div className="text-sm text-gray-500">Tone options coming soon...</div>
                </div>
              )}
            </div>

            {/* Scenario Dropdown */}
            <div className="relative">
              <button
                onClick={() => setScenarioDropdownOpen(!scenarioDropdownOpen)}
                className="flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-[120px]"
              >
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Scenario</span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {/* Placeholder for scenario dropdown popup */}
              {scenarioDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                  <div className="text-sm text-gray-500">Scenario options coming soon...</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 4: Horizontal Line */}
        <div className="px-6">
          <hr className="border-gray-200" />
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto">
          {/* Row 5: Main Area Layout Headers */}
          <div className="px-6 py-4 flex justify-between">
            {/* Left Zone */}
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">358 voices found</h3>
            </div>
            
            {/* Right Zone */}
            <div className="w-80">
              <h3 className="text-sm font-medium text-gray-900">Voice details</h3>
            </div>
          </div>

          {/* Main Content Area (Left and Right Panels) - Placeholder */}
          <div className="px-6 pb-6 flex gap-6 min-h-[300px]">
          {/* Left Panel - Voice List */}
          <div className="flex-1 bg-gray-50 bg-opacity-20 rounded-lg p-4">
            {/* Create Custom Voice Row */}
            <div className="mb-4">
              <div className="bg-blue-500 bg-opacity-20 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-opacity-30 transition-colors">
                <div className="flex items-center gap-3">
                  {/* Left chevron */}
                  <ChevronRight size={20} className="text-blue-500" />
                  
                  {/* White circle with radio wave icon */}
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <Radio size={20} className="text-blue-500" />
                  </div>
                  
                  {/* Text and badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-medium">Create a custom voice</span>
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                      NEW
                    </span>
                  </div>
                </div>
                
                {/* Right chevron */}
                <ChevronRight size={20} className="text-blue-500" />
              </div>
            </div>
            
            <div className="text-gray-500 text-center">Voice list content will go here...</div>
          </div>
          
          {/* Right Panel - Voice Details */}
          <div className="w-80 bg-gray-50 border border-gray-200 rounded-lg p-4">
            {/* Row 1: Maya title */}
            <div className="mb-3">
              <h3 className="text-xl text-gray-900">Maya</h3>
            </div>
            
            {/* Row 2: USA flag + American English */}
            <div className="flex items-center gap-2 mb-4">
              <Flag size={16} className="text-blue-600" />
              <span className="text-sm text-gray-700">American English</span>
            </div>
            
            {/* Row 3: Badges */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {['Adult', 'Confident', 'Educational', 'Friendly', 'Professional', 'Customer Service', 'E-Learning'].map((badge) => (
                  <span
                    key={badge}
                    className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Row 4: Horizontal line */}
            <div className="mb-4">
              <hr className="border-gray-300" />
            </div>
            
            {/* Row 5: Advanced settings */}
            <div className="mb-4">
              <h4 className="text-sm text-gray-900">Advanced settings</h4>
            </div>
            
            {/* Row 6: Speed */}
            <div className="mb-4">
              <label className="text-sm text-gray-700 mb-2 block">Speed</label>
              <input
                type="range"
                min="0"
                max="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer range-slider"
                style={{
                  background: `linear-gradient(to right, #000000 0%, #000000 ${speed}%, #e5e7eb ${speed}%, #e5e7eb 100%)`
                }}
              />
            </div>
            
            {/* Row 7: Stability */}
            <div className="mb-6">
              <label className="text-sm text-gray-700 mb-2 block">Stability</label>
              <input
                type="range"
                min="0"
                max="100"
                value={stability}
                onChange={(e) => setStability(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer range-slider"
                style={{
                  background: `linear-gradient(to right, #000000 0%, #000000 ${stability}%, #e5e7eb ${stability}%, #e5e7eb 100%)`
                }}
              />
            </div>
            
            {/* Row 8: Play Sample button */}
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Volume2 size={16} className="text-gray-700" />
              <span className="text-sm font-medium text-gray-700">Play Sample</span>
            </button>
          </div>
        </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          {/* Left side - Apply new voice to */}
          <div className="flex-1">
            <div className="mb-2">
              <span className="text-sm text-gray-700">Apply new voice to</span>
            </div>
            <div className="bg-gray-200 rounded-lg p-1 inline-flex">
              <button
                onClick={() => setApplyTo('block')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  applyTo === 'block' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                This block only
              </button>
              <button
                onClick={() => setApplyTo('scene')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  applyTo === 'scene' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                This scene only
              </button>
              <button
                onClick={() => setApplyTo('all')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  applyTo === 'all' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                All scenes
              </button>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Handle apply voice logic here
                onClose();
              }}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Apply voice
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}