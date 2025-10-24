"use client";

import React, { useState, useEffect } from 'react';

// All official FFmpeg xfade transitions from https://trac.ffmpeg.org/wiki/Xfade
export type TransitionType = 
  | 'none'
  // Basic fades
  | 'fade' | 'fadeblack' | 'fadewhite' | 'fadegrays'
  // Wipes
  | 'wipeleft' | 'wiperight' | 'wipeup' | 'wipedown'
  | 'wipetl' | 'wipetr' | 'wipebl' | 'wipebr'
  // Slides
  | 'slideleft' | 'slideright' | 'slideup' | 'slidedown'
  // Smooth
  | 'smoothleft' | 'smoothright' | 'smoothup' | 'smoothdown'
  // Circle
  | 'circlecrop' | 'circleclose' | 'circleopen'
  // Rectangle
  | 'rectcrop'
  // Horizontal/Vertical
  | 'horzclose' | 'horzopen' | 'vertclose' | 'vertopen'
  // Diagonal
  | 'diagbl' | 'diagbr' | 'diagtl' | 'diagtr'
  // Slices
  | 'hlslice' | 'hrslice' | 'vuslice' | 'vdslice'
  // Effects
  | 'dissolve' | 'pixelize' | 'radial' | 'hblur' | 'distance'
  // Squeeze
  | 'squeezev' | 'squeezeh'
  // Zoom
  | 'zoomin'
  // Wind
  | 'hlwind' | 'hrwind' | 'vuwind' | 'vdwind'
  // Cover
  | 'coverleft' | 'coverright' | 'coverup' | 'coverdown'
  // Reveal
  | 'revealleft' | 'revealright' | 'revealup' | 'revealdown';

export type TransitionVariant = 'default';

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
  const [variant, setVariant] = useState<TransitionVariant>(currentTransition?.variant || 'default');

  // Sync with external changes
  useEffect(() => {
    if (currentTransition) {
      setSelectedTransition(currentTransition.type);
      setDuration(currentTransition.duration);
      setVariant(currentTransition.variant || 'default');
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
              <div className="flex items-center justify-between">
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

          {/* Transition options grid - All FFmpeg xfade transitions */}
          <div className="mt-4 max-h-[500px] overflow-y-auto pr-2">
            {/* Helper function to render transition button */}
            {(() => {
              const TransitionButton = ({ type, label }: { type: TransitionType; label: string }) => (
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect(type)}
                >
                  <div className="w-20 h-20 bg-gray-200 rounded-lg mb-1 hover:bg-gray-300 transition-colors flex items-center justify-center">
                    <span className="text-xs text-gray-500">{label.substring(0, 4)}</span>
                  </div>
                  <span className="text-xs text-gray-700 text-center">{label}</span>
                </div>
              );

              return (
                <>
                  {/* Basic Fades */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Fades</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <TransitionButton type="fade" label="Fade" />
                      <TransitionButton type="fadeblack" label="Fade Black" />
                      <TransitionButton type="fadewhite" label="Fade White" />
                      <TransitionButton type="fadegrays" label="Fade Grays" />
                    </div>
                  </div>

                  {/* Wipes */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Wipes</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <TransitionButton type="wipeleft" label="Wipe Left" />
                      <TransitionButton type="wiperight" label="Wipe Right" />
                      <TransitionButton type="wipeup" label="Wipe Up" />
                      <TransitionButton type="wipedown" label="Wipe Down" />
                      <TransitionButton type="wipetl" label="Wipe Top-L" />
                      <TransitionButton type="wipetr" label="Wipe Top-R" />
                      <TransitionButton type="wipebl" label="Wipe Bot-L" />
                      <TransitionButton type="wipebr" label="Wipe Bot-R" />
                    </div>
                  </div>

                  {/* Slides */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Slides</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <TransitionButton type="slideleft" label="Slide Left" />
                      <TransitionButton type="slideright" label="Slide Right" />
                      <TransitionButton type="slideup" label="Slide Up" />
                      <TransitionButton type="slidedown" label="Slide Down" />
                    </div>
                  </div>

                  {/* Smooth */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Smooth</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <TransitionButton type="smoothleft" label="Smooth Left" />
                      <TransitionButton type="smoothright" label="Smooth Right" />
                      <TransitionButton type="smoothup" label="Smooth Up" />
                      <TransitionButton type="smoothdown" label="Smooth Down" />
                    </div>
                  </div>

                  {/* Circle & Shapes */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Circle & Shapes</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <TransitionButton type="circlecrop" label="Circle Crop" />
                      <TransitionButton type="circleclose" label="Circle Close" />
                      <TransitionButton type="circleopen" label="Circle Open" />
                      <TransitionButton type="rectcrop" label="Rect Crop" />
                    </div>
                  </div>

                  {/* Horizontal/Vertical */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Horizontal/Vertical</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <TransitionButton type="horzclose" label="Horz Close" />
                      <TransitionButton type="horzopen" label="Horz Open" />
                      <TransitionButton type="vertclose" label="Vert Close" />
                      <TransitionButton type="vertopen" label="Vert Open" />
                    </div>
                  </div>

                  {/* Diagonal */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Diagonal</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <TransitionButton type="diagbl" label="Diag Bot-L" />
                      <TransitionButton type="diagbr" label="Diag Bot-R" />
                      <TransitionButton type="diagtl" label="Diag Top-L" />
                      <TransitionButton type="diagtr" label="Diag Top-R" />
                    </div>
                  </div>

                  {/* Slices */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Slices</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <TransitionButton type="hlslice" label="H-Left Slice" />
                      <TransitionButton type="hrslice" label="H-Right Slice" />
                      <TransitionButton type="vuslice" label="V-Up Slice" />
                      <TransitionButton type="vdslice" label="V-Down Slice" />
                    </div>
                  </div>

                  {/* Effects */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Effects</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <TransitionButton type="dissolve" label="Dissolve" />
                      <TransitionButton type="pixelize" label="Pixelize" />
                      <TransitionButton type="radial" label="Radial" />
                      <TransitionButton type="hblur" label="H-Blur" />
                      <TransitionButton type="distance" label="Distance" />
                    </div>
                  </div>

                  {/* Squeeze & Zoom */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Squeeze & Zoom</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <TransitionButton type="squeezev" label="Squeeze V" />
                      <TransitionButton type="squeezeh" label="Squeeze H" />
                      <TransitionButton type="zoomin" label="Zoom In" />
                    </div>
                  </div>

                  {/* Wind */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Wind</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <TransitionButton type="hlwind" label="H-Left Wind" />
                      <TransitionButton type="hrwind" label="H-Right Wind" />
                      <TransitionButton type="vuwind" label="V-Up Wind" />
                      <TransitionButton type="vdwind" label="V-Down Wind" />
                    </div>
                  </div>

                  {/* Cover */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Cover</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <TransitionButton type="coverleft" label="Cover Left" />
                      <TransitionButton type="coverright" label="Cover Right" />
                      <TransitionButton type="coverup" label="Cover Up" />
                      <TransitionButton type="coverdown" label="Cover Down" />
                    </div>
                  </div>

                  {/* Reveal */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Reveal</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <TransitionButton type="revealleft" label="Reveal Left" />
                      <TransitionButton type="revealright" label="Reveal Right" />
                      <TransitionButton type="revealup" label="Reveal Up" />
                      <TransitionButton type="revealdown" label="Reveal Down" />
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}
