"use client";

import React, { useState } from 'react';
import { Search, Globe, Cake, Radio, Briefcase, ChevronDown, ChevronRight } from 'lucide-react';

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

  if (!isOpen) return null;

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
        className="relative bg-white shadow-xl w-[900px] max-w-[95vw] max-h-[90vh] overflow-hidden z-10"
        style={{ borderRadius: '12px' }}
      >
        
        {/* Row 1: Title */}
        <div className="p-6 pb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Pick a voice</h2>
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
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Row 3: Dropdown Buttons */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-4 gap-3">
            {/* Accent Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAccentDropdownOpen(!accentDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Accent</span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {/* Placeholder for accent dropdown popup */}
              {accentDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                  <div className="text-sm text-gray-500">Accent options coming soon...</div>
                </div>
              )}
            </div>

            {/* Age Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAgeDropdownOpen(!ageDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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

        {/* Row 5: Main Area Layout Headers */}
        <div className="px-6 py-4 flex justify-between">
          {/* Left Zone */}
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">358 voices found</h3>
          </div>
          
          {/* Right Zone */}
          <div className="w-80">
            <h3 className="text-lg font-medium text-gray-900">Voice details</h3>
          </div>
        </div>

        {/* Row 6: Create Custom Voice Row */}
        <div className="mx-6 mb-4">
          <div className="bg-blue-500 bg-opacity-20 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-opacity-30 transition-colors">
            <div className="flex items-center gap-3">
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

        {/* Main Content Area (Left and Right Panels) - Placeholder */}
        <div className="px-6 pb-6 flex gap-6 min-h-[300px]">
          {/* Left Panel - Voice List */}
          <div className="flex-1 bg-gray-50 rounded-lg p-4">
            <div className="text-gray-500 text-center">Voice list content will go here...</div>
          </div>
          
          {/* Right Panel - Voice Details */}
          <div className="w-80 bg-gray-50 rounded-lg p-4">
            <div className="text-gray-500 text-center">Voice details content will go here...</div>
          </div>
        </div>
      </div>
    </div>
  );
}