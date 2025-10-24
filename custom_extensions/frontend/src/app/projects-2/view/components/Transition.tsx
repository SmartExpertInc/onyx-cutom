"use client";

import React, { useState, useEffect } from 'react';

// All available FFmpeg xfade transitions from https://trac.ffmpeg.org/wiki/Xfade
export type TransitionType = 
  // Basic fades
  | 'none' | 'fade' | 'fadeblack' | 'fadewhite' | 'fadegrays'
  // Wipes (directional)
  | 'wipeleft' | 'wiperight' | 'wipeup' | 'wipedown'
  | 'wipetl' | 'wipetr' | 'wipebl' | 'wipebr'
  // Slides (directional)
  | 'slideleft' | 'slideright' | 'slideup' | 'slidedown'
  // Smooth transitions (directional)
  | 'smoothleft' | 'smoothright' | 'smoothup' | 'smoothdown'
  // Circle transitions
  | 'circlecrop' | 'circleclose' | 'circleopen'
  // Rectangle/Shape transitions
  | 'rectcrop'
  // Horizontal/Vertical opens and closes
  | 'horzclose' | 'horzopen' | 'vertclose' | 'vertopen'
  // Diagonal transitions
  | 'diagbl' | 'diagbr' | 'diagtl' | 'diagtr'
  // Slice transitions
  | 'hlslice' | 'hrslice' | 'vuslice' | 'vdslice'
  // Wind transitions
  | 'hlwind' | 'hrwind' | 'vuwind' | 'vdwind'
  // Effects
  | 'dissolve' | 'pixelize' | 'radial' | 'hblur' | 'distance'
  // Squeeze transitions
  | 'squeezeh' | 'squeezev'
  // Cover transitions
  | 'coverleft' | 'coverright' | 'coverup' | 'coverdown'
  // Reveal transitions
  | 'revealleft' | 'revealright' | 'revealup' | 'revealdown'
  // Zoom
  | 'zoomin';

export type TransitionVariant = 'circle' | 'horizontal-chevrons' | 'vertical-chevrons';

export interface TransitionData {
  type: TransitionType;
  duration: number;
  variant?: TransitionVariant;
  applyToAll?: boolean;
}

interface TransitionProps {
  transitionIndex?: number | null;
  currentTransition?: TransitionData | null;
  onTransitionChange?: (transitionData: TransitionData) => void;
}

export default function Transition({ transitionIndex, currentTransition, onTransitionChange }: TransitionProps) {
  const [selectedTransition, setSelectedTransition] = useState<TransitionType>(
    currentTransition?.type || 'none'
  );
  const [showSettings, setShowSettings] = useState(currentTransition?.type !== 'none' && currentTransition?.type !== undefined);
  const [isApplyBetweenAllScenes, setIsApplyBetweenAllScenes] = useState(currentTransition?.applyToAll || false);
  const [duration, setDuration] = useState(currentTransition?.duration || 1.0);
  const [variant, setVariant] = useState<TransitionVariant>(currentTransition?.variant || 'circle');

  // Sync with external changes
  useEffect(() => {
    if (currentTransition) {
      setSelectedTransition(currentTransition.type);
      setDuration(currentTransition.duration);
      setVariant(currentTransition.variant || 'circle');
      setIsApplyBetweenAllScenes(currentTransition.applyToAll || false);
      setShowSettings(currentTransition.type !== 'none');
    }
  }, [currentTransition]);
  // Handle transition selection
  const handleTransitionSelect = (transitionType: TransitionType) => {
    setSelectedTransition(transitionType);
    if (transitionType !== 'none') {
      setShowSettings(true);
    }
    
    // Immediately save the transition
    const transitionData: TransitionData = {
      type: transitionType,
      duration,
      variant,
      applyToAll: isApplyBetweenAllScenes
    };
    onTransitionChange?.(transitionData);
  };

  // Handle duration change
  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    const transitionData: TransitionData = {
      type: selectedTransition,
      duration: newDuration,
      variant,
      applyToAll: isApplyBetweenAllScenes
    };
    onTransitionChange?.(transitionData);
  };

  // Handle variant change
  const handleVariantChange = (newVariant: TransitionVariant) => {
    setVariant(newVariant);
    const transitionData: TransitionData = {
      type: selectedTransition,
      duration,
      variant: newVariant,
      applyToAll: isApplyBetweenAllScenes
    };
    onTransitionChange?.(transitionData);
  };

  // Handle apply to all change
  const handleApplyToAllChange = (applyAll: boolean) => {
    setIsApplyBetweenAllScenes(applyAll);
    const transitionData: TransitionData = {
      type: selectedTransition,
      duration,
      variant,
      applyToAll: applyAll
    };
    onTransitionChange?.(transitionData);
  };

  // Function to render the selected transition settings view
  const renderSelectedTransitionView = () => {
    if (!selectedTransition || selectedTransition === 'none') return null;

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
                <span className="text-gray-700 text-sm font-medium capitalize">{selectedTransition}</span>
                {transitionIndex !== null && transitionIndex !== undefined && (
                  <span className="text-gray-500 text-xs">Between slides {transitionIndex + 1} and {transitionIndex + 2}</span>
                )}
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
                  onClick={() => handleApplyToAllChange(!isApplyBetweenAllScenes)}
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
                      value={duration}
                      className="w-full h-0.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        handleDurationChange(value);
                        const percentage = ((value - 0.5) / 2.5) * 100 + '%';
                        e.target.style.background = `linear-gradient(to right, #000000 0%, #000000 ${percentage}, #e5e7eb ${percentage}, #e5e7eb 100%)`;
                      }}
                      style={{
                        background: `linear-gradient(to right, #000000 0%, #000000 ${((duration - 0.5) / 2.5) * 100}%, #e5e7eb ${((duration - 0.5) / 2.5) * 100}%, #e5e7eb 100%)`
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
                  <button 
                    className={`w-8 h-8 border rounded-lg flex items-center justify-center transition-colors ${
                      variant === 'circle' ? 'border-black bg-gray-100' : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => handleVariantChange('circle')}
                  >
                    <div className="w-3 h-3 rounded-full bg-white border border-black"></div>
                  </button>
                  
                  {/* Horizontal chevrons button */}
                  <button 
                    className={`w-8 h-8 border rounded-lg flex items-center justify-center transition-colors ${
                      variant === 'horizontal-chevrons' ? 'border-black bg-gray-100' : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => handleVariantChange('horizontal-chevrons')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" className="text-gray-600">
                      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m16 18l-6-6l6-6"/>
                      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8 18l6-6l-6-6"/>
                    </svg>
                  </button>
                  
                  {/* Vertical chevrons button */}
                  <button 
                    className={`w-8 h-8 border rounded-lg flex items-center justify-center transition-colors ${
                      variant === 'vertical-chevrons' ? 'border-black bg-gray-100' : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => handleVariantChange('vertical-chevrons')}
                  >
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
      {/* Header with transition info */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700">
          {transitionIndex !== null && transitionIndex !== undefined
            ? `Transition ${transitionIndex + 1} (between slides ${transitionIndex + 1} and ${transitionIndex + 2})`
            : 'Slide Transition'}
        </h3>
      </div>

      {/* Show selected transition view if a transition is selected and showSettings is true */}
      {selectedTransition && selectedTransition !== 'none' && showSettings ? (
        renderSelectedTransitionView()
      ) : (
        <>
          {/* Pill-shaped button with SVG and "No transition" text */}
          <button 
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-full py-3 px-4 transition-colors duration-200"
            onClick={() => handleTransitionSelect('none')}
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
                d="m16.1 12.8l-1.4-1.45L17.75 9L12 4.55l-2.35 1.8l-1.4-1.45l2.525-1.95q.275-.2.588-.312T12 2.525q.325 0 .638.113t.587.312l6.75 5.25q.2.15.3.363t.1.437q0 .225-.1.438t-.3.362l-3.875 3Zm2.875 2.85l-1.45-1.45l1.225-.925q.275-.2.613-.2t.612.2q.4.3.4.787t-.4.788l-1 .8Zm.125 5.75l-3.3-3.3l-2.575 2q-.275.2-.587.313t-.638.112q-.325 0-.638-.112t-.587-.313l-6.75-5.25q-.4-.3-.388-.787t.413-.788q.275-.2.6-.2t.6.2L12 18.5l2.35-1.825l-1.425-1.425q-.225.125-.438.175t-.487.05q-.325 0-.625-.1t-.6-.325L4 9.775q-.2-.15-.288-.35T3.625 9q0-.225.075-.438t.275-.362l1.05-.825l-2.95-2.95q-.3-.3-.3-.7t.3-.7q.3-.3.713-.3t.712.3L20.5 20q.275.275.275.7t-.275.7q-.275.275-.7.275t-.7-.275ZM12.2 8.875Z"
              />
            </svg>
            <span className="text-gray-700 font-medium">No transition</span>
          </button>

          {/* Transition options - scrollable container */}
          <div className="mt-4 max-h-[500px] overflow-y-auto pr-2">
            {/* Popular/Basic Fades */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Fades</h4>
              <div className="grid grid-cols-3 gap-2">
                {['fade', 'fadeblack', 'fadewhite', 'fadegrays', 'dissolve'].map((type) => (
                  <div 
                    key={type}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleTransitionSelect(type as TransitionType)}
                  >
                    <div className="w-20 h-20 bg-gray-200 rounded-lg mb-2 hover:bg-gray-300 transition-colors"></div>
                    <span className="text-xs text-gray-700 text-center capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Wipes */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Wipes</h4>
              <div className="grid grid-cols-4 gap-2">
                {['wipeleft', 'wiperight', 'wipeup', 'wipedown', 'wipetl', 'wipetr', 'wipebl', 'wipebr'].map((type) => (
                  <div 
                    key={type}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleTransitionSelect(type as TransitionType)}
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mb-1 hover:bg-gray-300 transition-colors"></div>
                    <span className="text-xs text-gray-700 text-center">{type.replace('wipe', '')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Slides */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Slides</h4>
              <div className="grid grid-cols-4 gap-2">
                {['slideleft', 'slideright', 'slideup', 'slidedown'].map((type) => (
                  <div 
                    key={type}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleTransitionSelect(type as TransitionType)}
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mb-1 hover:bg-gray-300 transition-colors"></div>
                    <span className="text-xs text-gray-700 text-center">{type.replace('slide', '')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Smooth */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Smooth</h4>
              <div className="grid grid-cols-4 gap-2">
                {['smoothleft', 'smoothright', 'smoothup', 'smoothdown'].map((type) => (
                  <div 
                    key={type}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleTransitionSelect(type as TransitionType)}
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mb-1 hover:bg-gray-300 transition-colors"></div>
                    <span className="text-xs text-gray-700 text-center">{type.replace('smooth', '')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Circle & Shape */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Circle & Shape</h4>
              <div className="grid grid-cols-4 gap-2">
                {['circlecrop', 'circleclose', 'circleopen', 'rectcrop'].map((type) => (
                  <div 
                    key={type}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleTransitionSelect(type as TransitionType)}
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mb-1 hover:bg-gray-300 transition-colors"></div>
                    <span className="text-xs text-gray-700 text-center">{type.replace(/circle|rect/, '')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Open & Close */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Open & Close</h4>
              <div className="grid grid-cols-4 gap-2">
                {['horzclose', 'horzopen', 'vertclose', 'vertopen'].map((type) => (
                  <div 
                    key={type}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleTransitionSelect(type as TransitionType)}
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mb-1 hover:bg-gray-300 transition-colors"></div>
                    <span className="text-xs text-gray-700 text-center">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagonal */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Diagonal</h4>
              <div className="grid grid-cols-4 gap-2">
                {['diagbl', 'diagbr', 'diagtl', 'diagtr'].map((type) => (
                  <div 
                    key={type}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleTransitionSelect(type as TransitionType)}
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mb-1 hover:bg-gray-300 transition-colors"></div>
                    <span className="text-xs text-gray-700 text-center">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Slices */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Slices</h4>
              <div className="grid grid-cols-4 gap-2">
                {['hlslice', 'hrslice', 'vuslice', 'vdslice'].map((type) => (
                  <div 
                    key={type}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleTransitionSelect(type as TransitionType)}
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mb-1 hover:bg-gray-300 transition-colors"></div>
                    <span className="text-xs text-gray-700 text-center">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Wind */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Wind</h4>
              <div className="grid grid-cols-4 gap-2">
                {['hlwind', 'hrwind', 'vuwind', 'vdwind'].map((type) => (
                  <div 
                    key={type}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleTransitionSelect(type as TransitionType)}
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mb-1 hover:bg-gray-300 transition-colors"></div>
                    <span className="text-xs text-gray-700 text-center">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Squeeze */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Squeeze</h4>
              <div className="grid grid-cols-4 gap-2">
                {['squeezeh', 'squeezev'].map((type) => (
                  <div 
                    key={type}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleTransitionSelect(type as TransitionType)}
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mb-1 hover:bg-gray-300 transition-colors"></div>
                    <span className="text-xs text-gray-700 text-center">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cover */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Cover</h4>
              <div className="grid grid-cols-4 gap-2">
                {['coverleft', 'coverright', 'coverup', 'coverdown'].map((type) => (
                  <div 
                    key={type}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleTransitionSelect(type as TransitionType)}
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mb-1 hover:bg-gray-300 transition-colors"></div>
                    <span className="text-xs text-gray-700 text-center">{type.replace('cover', '')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reveal */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Reveal</h4>
              <div className="grid grid-cols-4 gap-2">
                {['revealleft', 'revealright', 'revealup', 'revealdown'].map((type) => (
                  <div 
                    key={type}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleTransitionSelect(type as TransitionType)}
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mb-1 hover:bg-gray-300 transition-colors"></div>
                    <span className="text-xs text-gray-700 text-center">{type.replace('reveal', '')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Effects */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Effects</h4>
              <div className="grid grid-cols-4 gap-2">
                {['pixelize', 'radial', 'hblur', 'distance', 'zoomin'].map((type) => (
                  <div 
                    key={type}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleTransitionSelect(type as TransitionType)}
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mb-1 hover:bg-gray-300 transition-colors"></div>
                    <span className="text-xs text-gray-700 text-center">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
