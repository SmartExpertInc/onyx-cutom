"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, Cake, Briefcase, ChevronDown, ChevronRight, Flag, Volume2, Check, RotateCcw } from 'lucide-react';

// Custom Radio Wave Icon
const RadioWaveIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 256 256"
    className={className}
  >
    <path 
      fill="currentColor" 
      d="M56 96v64a8 8 0 0 1-16 0V96a8 8 0 0 1 16 0Zm32-72a8 8 0 0 0-8 8v192a8 8 0 0 0 16 0V32a8 8 0 0 0-8-8Zm40 32a8 8 0 0 0-8 8v128a8 8 0 0 0 16 0V64a8 8 0 0 0-8-8Zm40 32a8 8 0 0 0-8 8v64a8 8 0 0 0 16 0V96a8 8 0 0 0-8-8Zm40-16a8 8 0 0 0-8 8v96a8 8 0 0 0 16 0V80a8 8 0 0 0-8-8Z"
    />
  </svg>
);

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
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [selectedTones, setSelectedTones] = useState<string[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  
  const accentRef = useRef<HTMLDivElement>(null);
  const ageRef = useRef<HTMLDivElement>(null);
  const toneRef = useRef<HTMLDivElement>(null);
  const scenarioRef = useRef<HTMLDivElement>(null);

  // Accent options with country flags
  const accentOptions = [
    { id: 'american', flag: '🇺🇸', text: 'American English' },
    { id: 'british', flag: '🇬🇧', text: 'British English' },
    { id: 'australian', flag: '🇦🇺', text: 'Australian English' },
    { id: 'indian', flag: '🇮🇳', text: 'English (India)' },
    { id: 'south-african', flag: '🇿🇦', text: 'English (South Africa)' }
  ];

  // Age options
  const ageOptions = [
    { id: 'adult', text: 'Adult' },
    { id: 'middle-aged', text: 'Middle-Aged' },
    { id: 'senior', text: 'Senior' },
    { id: 'young', text: 'Young' },
    { id: 'young-adult', text: 'Young Adult' }
  ];

  // Tone options
  const toneOptions = [
    { id: 'anxious', text: 'Anxious' },
    { id: 'calm', text: 'Calm' },
    { id: 'cheerful', text: 'Cheerful' },
    { id: 'cloned-voice', text: 'Cloned Voice' },
    { id: 'confident', text: 'Confident' },
    { id: 'conversational', text: 'Conversational' },
    { id: 'deep', text: 'Deep' },
    { id: 'delightful', text: 'Delightful' },
    { id: 'determined', text: 'Determined' },
    { id: 'educational', text: 'Educational' },
    { id: 'engaging', text: 'Engaging' },
    { id: 'fast', text: 'Fast' },
    { id: 'friendly', text: 'Friendly' },
    { id: 'gentle', text: 'Gentle' }
  ];

  // Scenario options
  const scenarioOptions = [
    { id: 'ad', text: 'Ad' },
    { id: 'any', text: 'Any' },
    { id: 'assistant', text: 'Assistant' },
    { id: 'chat', text: 'Chat' },
    { id: 'conversational', text: 'Conversational' },
    { id: 'customer-service', text: 'Customer Service' },
    { id: 'documentary', text: 'Documentary' },
    { id: 'e-learning', text: 'E-Learning' },
    { id: 'explainer', text: 'Explainer' },
    { id: 'how-to', text: 'How-to' }
  ];

  const toggleAccent = (accentId: string) => {
    setSelectedAccents(prev => 
      prev.includes(accentId) 
        ? prev.filter(id => id !== accentId)
        : [...prev, accentId]
    );
  };

  const toggleAge = (ageId: string) => {
    setSelectedAges(prev => 
      prev.includes(ageId) 
        ? prev.filter(id => id !== ageId)
        : [...prev, ageId]
    );
  };

  const toggleTone = (toneId: string) => {
    setSelectedTones(prev => 
      prev.includes(toneId) 
        ? prev.filter(id => id !== toneId)
        : [...prev, toneId]
    );
  };

  const toggleScenario = (scenarioId: string) => {
    setSelectedScenarios(prev => 
      prev.includes(scenarioId) 
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId]
    );
  };

  // Reset functions
  const resetAccents = () => setSelectedAccents([]);
  const resetAges = () => setSelectedAges([]);
  const resetTones = () => setSelectedTones([]);
  const resetScenarios = () => setSelectedScenarios([]);
  
  // Reset all selections
  const resetAllSelections = () => {
    resetAccents();
    resetAges();
    resetTones();
    resetScenarios();
  };
  
  // Check if any selections exist
  const hasAnySelections = selectedAccents.length > 0 || selectedAges.length > 0 || selectedTones.length > 0 || selectedScenarios.length > 0;

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accentRef.current && !accentRef.current.contains(event.target as Node)) {
        setAccentDropdownOpen(false);
      }
      if (ageRef.current && !ageRef.current.contains(event.target as Node)) {
        setAgeDropdownOpen(false);
      }
      if (toneRef.current && !toneRef.current.contains(event.target as Node)) {
        setToneDropdownOpen(false);
      }
      if (scenarioRef.current && !scenarioRef.current.contains(event.target as Node)) {
        setScenarioDropdownOpen(false);
      }
    };

    if (accentDropdownOpen || ageDropdownOpen || toneDropdownOpen || scenarioDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [accentDropdownOpen, ageDropdownOpen, toneDropdownOpen, scenarioDropdownOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Custom CSS for range sliders */}
      <style jsx>{`
        .range-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #000000;
          cursor: pointer;
          border: none;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        
        .range-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #000000;
          cursor: pointer;
          border: none;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
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
        className="relative bg-white shadow-xl w-[1000px] max-w-[96vw] max-h-[92vh] flex flex-col z-10"
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
          <div className="flex gap-3 items-center justify-between">
            <div className="flex gap-3">
            {/* Accent Dropdown */}
            <div className="relative" ref={accentRef}>
              <button
                onClick={() => setAccentDropdownOpen(!accentDropdownOpen)}
                className={`flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg transition-colors min-w-[120px] ${
                  accentDropdownOpen 
                    ? 'bg-gray-100' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Accent</span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {/* Accent dropdown popup */}
              {accentDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                  {accentOptions.map((accent) => (
                    <div
                      key={accent.id}
                      onClick={() => toggleAccent(accent.id)}
                      className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
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
            <div className="relative" ref={ageRef}>
              <button
                onClick={() => setAgeDropdownOpen(!ageDropdownOpen)}
                className={`flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg transition-colors min-w-[120px] ${
                  ageDropdownOpen 
                    ? 'bg-gray-100' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Cake size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Age</span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {/* Age dropdown popup */}
              {ageDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                  {ageOptions.map((age) => (
                    <div
                      key={age.id}
                      onClick={() => toggleAge(age.id)}
                      className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      {/* Custom checkbox */}
                      <div className={`
                        w-4 h-4 rounded border flex items-center justify-center transition-colors
                        ${selectedAges.includes(age.id) 
                          ? 'bg-black border-black' 
                          : 'bg-white border-gray-300'
                        }
                      `}>
                        {selectedAges.includes(age.id) && (
                          <Check size={10} className="text-white" />
                        )}
                      </div>
                      
                      {/* Text */}
                      <span className="text-sm text-gray-700">{age.text}</span>
                    </div>
                  ))}
                  

                </div>
              )}
            </div>

            {/* Tone Dropdown */}
            <div className="relative" ref={toneRef}>
              <button
                onClick={() => setToneDropdownOpen(!toneDropdownOpen)}
                className={`flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg transition-colors min-w-[120px] ${
                  toneDropdownOpen 
                    ? 'bg-gray-100' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <RadioWaveIcon size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Tone</span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {/* Tone dropdown popup */}
              {toneDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2 max-h-60 overflow-y-auto">
                  {toneOptions.map((tone) => (
                    <div
                      key={tone.id}
                      onClick={() => toggleTone(tone.id)}
                      className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      {/* Custom checkbox */}
                      <div className={`
                        w-4 h-4 rounded border flex items-center justify-center transition-colors
                        ${selectedTones.includes(tone.id) 
                          ? 'bg-black border-black' 
                          : 'bg-white border-gray-300'
                        }
                      `}>
                        {selectedTones.includes(tone.id) && (
                          <Check size={10} className="text-white" />
                        )}
                      </div>
                      
                      {/* Text */}
                      <span className="text-sm text-gray-700">{tone.text}</span>
                    </div>
                  ))}
                  

                </div>
              )}
            </div>

            {/* Scenario Dropdown */}
            <div className="relative" ref={scenarioRef}>
              <button
                onClick={() => setScenarioDropdownOpen(!scenarioDropdownOpen)}
                className={`flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg transition-colors min-w-[120px] ${
                  scenarioDropdownOpen 
                    ? 'bg-gray-100' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Scenario</span>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {/* Scenario dropdown popup */}
              {scenarioDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                  {scenarioOptions.map((scenario) => (
                    <div
                      key={scenario.id}
                      onClick={() => toggleScenario(scenario.id)}
                      className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      {/* Custom checkbox */}
                      <div className={`
                        w-4 h-4 rounded border flex items-center justify-center transition-colors
                        ${selectedScenarios.includes(scenario.id) 
                          ? 'bg-black border-black' 
                          : 'bg-white border-gray-300'
                        }
                      `}>
                        {selectedScenarios.includes(scenario.id) && (
                          <Check size={10} className="text-white" />
                        )}
                      </div>
                      
                      {/* Text */}
                      <span className="text-sm text-gray-700">{scenario.text}</span>
                    </div>
                  ))}
                  

                </div>
              )}
            </div>
            </div>
            
            {/* Reset Button */}
            {hasAnySelections && (
              <button
                onClick={resetAllSelections}
                className="flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-[120px]"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Reset all</span>
                </div>
              </button>
            )}
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
          <div className="flex-1">
            {/* Create Custom Voice Row */}
            <div className="mb-4">
              <div 
                className="rounded-lg p-4 flex items-center justify-between cursor-pointer"
                style={{ 
                  backgroundColor: 'rgba(59, 130, 246, 0.2)' 
                }}
              >
                <div className="flex items-center gap-3">
                  {/* White circle with radio wave icon */}
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-blue-500">
                    <RadioWaveIcon size={20} className="text-blue-500" />
                  </div>
                  
                  {/* Text and badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-medium">Create a custom voice</span>
                    <span className="px-2 py-1 bg-blue-600 text-blue-200 text-xs font-medium rounded-full">
                      NEW
                    </span>
                  </div>
                </div>
                
                {/* Right chevron */}
                <ChevronRight size={20} className="text-blue-500" />
              </div>
            </div>

            {/* Voice Item Row - Ana rus */}
            <div className="mb-4 group">
              <div className="rounded-lg p-4 flex items-center justify-between cursor-pointer border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  {/* Radio wave icon / Play button */}
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-300">
                    <Radio size={16} className="text-gray-600 group-hover:hidden" />
                    <div className="hidden group-hover:flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full">
                      <div className="w-0 h-0 border-l-[6px] border-l-gray-600 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5"></div>
                    </div>
                  </div>
                  
                  {/* Text and badges */}
                  <div className="flex flex-col gap-2">
                    <span className="text-gray-900 font-medium">Ana rus</span>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                        32 languages
                      </span>
                      <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full flex items-center gap-1">
                        <span>🎤</span>
                        <span>Cloned voice</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons - visible on hover */}
                <div className="hidden group-hover:flex items-center gap-2">
                  <button className="p-2 rounded hover:bg-gray-200 transition-colors">
                    <div className="flex flex-col gap-1">
                      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    </div>
                  </button>
                  <button className="p-2 rounded hover:bg-gray-200 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
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
                className="w-full h-0.5 bg-gray-200 rounded-full appearance-none cursor-pointer range-slider"
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
                className="w-full h-0.5 bg-gray-200 rounded-full appearance-none cursor-pointer range-slider"
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
                className={`px-4 py-1.5 text-xs rounded transition-colors ${
                  applyTo === 'block' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                This block only
              </button>
              <button
                onClick={() => setApplyTo('scene')}
                className={`px-4 py-1.5 text-xs rounded transition-colors ${
                  applyTo === 'scene' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                This scene only
              </button>
              <button
                onClick={() => setApplyTo('all')}
                className={`px-4 py-1.5 text-xs rounded transition-colors ${
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
              className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Handle apply voice logic here
                onClose();
              }}
              className="px-4 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
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