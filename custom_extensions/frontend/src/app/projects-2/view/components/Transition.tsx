"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import './Transition.css';

export type TransitionType = 
  // Basic
  | 'none' | 'fade' | 'dissolve'
  // Wipes
  | 'wipeleft' | 'wiperight' | 'wipeup' | 'wipedown'
  | 'wipetl' | 'wipetr' | 'wipebl' | 'wipebr'
  // Slides
  | 'slideleft' | 'slideright' | 'slideup' | 'slidedown'
  // Smooth transitions
  | 'smoothleft' | 'smoothright' | 'smoothup' | 'smoothdown'
  // Circle effects
  | 'circlecrop' | 'circleopen' | 'circleclose'
  // Diagonal
  | 'diagtl' | 'diagtr' | 'diagbl' | 'diagbr'
  // Radial & Distance
  | 'radial' | 'distance'
  // Slices
  | 'hlslice' | 'hrslice' | 'vuslice' | 'vdslice'
  // Squeeze & Zoom
  | 'squeezeh' | 'squeezev' | 'zoomin'
  // Blur & Pixelize
  | 'hblur' | 'pixelize'
  // Fade variations
  | 'fadeblack' | 'fadewhite' | 'fadefast' | 'fadeslow';

export type TransitionVariant = 'circle' | 'horizontal-chevrons' | 'vertical-chevrons';

export interface TransitionData {
  type: TransitionType;
  duration: number;
  variant?: TransitionVariant;
  applyToAll?: boolean;
}

type TransitionOption = TransitionType | 'none';
const fadeIcon = ({fillLighter = '#878787', fillDarker = '#4D4D4D'}: {fillLighter?: string, fillDarker?: string}) => (
  <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="13.0908" y="3.26563" width="13.0906" height="13.0906" rx="1.49996" transform="rotate(90 13.0908 3.26563)" fill={fillLighter}/>
  <rect x="18.001" y="7.86749e-07" width="13.0906" height="13.0906" rx="1.49996" transform="rotate(90 18.001 7.86749e-07)" fill={fillDarker}/>
  </svg>
);

const wipeIcon = ({fillLighter = '#878787', fillDarker = '#4D4D4D'}: {fillLighter?: string, fillDarker?: string}) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="18" y="7.86808e-07" width="18" height="18" rx="2" transform="rotate(90 18 7.86808e-07)" fill={fillLighter}/>
  <path d="M16 6.99385e-07C17.1046 7.47667e-07 18 0.895431 18 2L18 16C18 17.1046 17.1046 18 16 18L12 18L12 5.24539e-07L16 6.99385e-07Z" fill={fillDarker}/>
  <path d="M14.1543 9.94872C14.1065 9.97622 14.0452 9.96026 14.0176 9.91258C13.99 9.86475 14.0069 9.80348 14.0547 9.77587L15.9043 8.70751L14.0547 7.64012C14.0069 7.61257 13.9902 7.5512 14.0176 7.5034C14.0451 7.45566 14.1065 7.4389 14.1543 7.46629L16.3047 8.70751L14.1543 9.94872Z" fill="white"/>
  </svg>
);
const slideIcon = ({fillLighter = '#878787', fillDarker = '#4D4D4D'}: {fillLighter?: string, fillDarker?: string}) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="18.001" y="7.86808e-07" width="18" height="18" rx="2" transform="rotate(90 18.001 7.86808e-07)" fill={fillLighter}/>
  <path d="M2.00195 18C0.897385 18 0.00195403 17.1046 0.00195417 16L0.00195601 2C0.00195615 0.89543 0.897387 9.04229e-07 2.00196 1.04908e-06L9.00196 1.96701e-06L9.00195 18L2.00195 18Z" fill={fillDarker}/>
  <path d="M5.78646 7.86803C5.85508 7.82852 5.94317 7.85144 5.98287 7.91993C6.02254 7.98864 5.99827 8.07667 5.92956 8.11634L3.27246 9.65112L5.92956 11.1845C5.99814 11.2241 6.02222 11.3122 5.98287 11.3809C5.94328 11.4495 5.85512 11.4736 5.78646 11.4342L2.69727 9.65112L5.78646 7.86803Z" fill="white"/>
  </svg>
);
const smoothIcon = ({fillLighter = '#878787', fillDarker = '#4D4D4D'}: {fillLighter?: string, fillDarker?: string}) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="18" y="7.86808e-07" width="18" height="18" rx="2" transform="rotate(90 18 7.86808e-07)" fill={fillLighter}/>
  <path d="M16 6.99385e-07C17.1046 7.47667e-07 18 0.895431 18 2L18 16C18 17.1046 17.1046 18 16 18L12 18L12 5.24539e-07L16 6.99385e-07Z" fill={fillDarker}/>
  <path d="M14.1543 9.94872C14.1065 9.97622 14.0452 9.96026 14.0176 9.91258C13.99 9.86475 14.0069 9.80348 14.0547 9.77587L15.9043 8.70751L14.0547 7.64012C14.0069 7.61257 13.9902 7.5512 14.0176 7.5034C14.0451 7.45566 14.1065 7.4389 14.1543 7.46629L16.3047 8.70751L14.1543 9.94872Z" fill="white"/>
  <defs>
  <linearGradient id="paint0_linear_4414_33223" x1="18" y1="9.45313" x2="11.5" y2="9.45313" gradientUnits="userSpaceOnUse">
  <stop stop-color="#4D4D4D"/>
  <stop offset="1" stop-color="#B3B3B3" stop-opacity="0"/>
  </linearGradient>
  </defs>
  </svg>
);
const circleIcon = ({fillLighter = '#878787', fillDarker = '#4D4D4D'}: {fillLighter?: string, fillDarker?: string}) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M10 19C14.9706 19 19 14.9706 19 10C19 5.02944 14.9706 1 10 1C5.02944 1 1 5.02944 1 10C1 14.9706 5.02944 19 10 19Z" fill={fillLighter}/>
  <path d="M10 15C12.7614 15 15 12.7614 15 10C15 7.23858 12.7614 5 10 5C7.23858 5 5 7.23858 5 10C5 12.7614 7.23858 15 10 15Z" fill={fillDarker}/>
  <defs>
  <radialGradient id="paint0_radial_4414_33229" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(10 10) rotate(90) scale(5)">
  <stop stop-color="#171718"/>
  <stop offset="1" stop-color={fillLighter} stop-opacity="0.3"/>
  </radialGradient>
  </defs>
  </svg>
);
const diagonalIcon = ({fillLighter = '#878787', fillDarker = '#4D4D4D'}: {fillLighter?: string, fillDarker?: string}) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g clip-path="url(#clip0_4414_33238)">
  <rect x="18" y="7.86808e-07" width="18" height="18" rx="2" transform="rotate(90 18 7.86808e-07)" fill={fillLighter}/>
  <path d="M7.86806e-07 2C7.86806e-07 0.895431 0.895431 7.86808e-07 2 7.86808e-07H18L7.86806e-07 18V2Z" fill={fillDarker}/>
  </g>
  <defs>
  <clipPath id="clip0_4414_33238">
  <rect x="18" y="7.86808e-07" width="18" height="18" rx="2" transform="rotate(90 18 7.86808e-07)" fill="white"/>
  </clipPath>
  </defs>
  </svg>
);
const radialIcon = ({fillLighter = '#878787', fillDarker = '#4D4D4D'}: {fillLighter?: string, fillDarker?: string}) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M17.5 1H2.5C1.67157 1 1 1.67157 1 2.5V17.5C1 18.3284 1.67157 19 2.5 19H17.5C18.3284 19 19 18.3284 19 17.5V2.5C19 1.67157 18.3284 1 17.5 1Z" fill={fillLighter}/>
  <defs>
  <radialGradient id="paint0_radial_4414_33243" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(10 10) scale(9)">
  <stop stop-color="#171718"/>
  <stop offset="1" stop-color="#E0E0E0"/>
  </radialGradient>
  </defs>
  </svg>
);
const slicesIcon = ({fillLighter = '#878787', fillDarker = '#4D4D4D'}: {fillLighter?: string, fillDarker?: string}) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="18" height="18" rx="2" fill={fillLighter}/>
  <path d="M18.0039 16C18.0039 17.1046 17.1085 18 16.0039 18L2.00391 18C0.899336 18 0.00390633 17.1046 0.00390642 16L0.00390704 9L18.0039 9L18.0039 16Z" fill={fillDarker}/>
  </svg>
);
const transformIcon = ({fillLighter = '#878787', fillDarker = '#4D4D4D'}: {fillLighter?: string, fillDarker?: string}) => (
  <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M9.1502 0H6.3502C5.577 0 4.9502 0.626801 4.9502 1.4V15.4C4.9502 16.1732 5.577 16.8 6.3502 16.8H9.1502C9.92339 16.8 10.5502 16.1732 10.5502 15.4V1.4C10.5502 0.626801 9.92339 0 9.1502 0Z" fill={fillDarker}/>
  <path d="M0.75 8.39844H3.55M11.95 8.39844H14.75" stroke={fillLighter} stroke-width="1.5" stroke-linecap="round"/>
  </svg>
);
const effectsIcon = ({fillLighter = '#878787', fillDarker = '#4D4D4D'}: {fillLighter?: string, fillDarker?: string}) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 0H0V4H4V0Z" fill={fillDarker}/>
  <path d="M8 0H4V4H8V0Z" fill="#A5A5A5"/>
  <path d="M12 0H8V4H12V0Z" fill={fillDarker}/>
  <path d="M16 0H12V4H16V0Z" fill={fillLighter}/>
  <path d="M4 4H0V8H4V4Z" fill="#A5A5A5"/>
  <path d="M8 4H4V8H8V4Z" fill={fillDarker}/>
  <path d="M12 4H8V8H12V4Z" fill={fillLighter}/>
  <path d="M16 4H12V8H16V4Z" fill={fillDarker}/>
  <path d="M4 8H0V12H4V8Z" fill={fillDarker}/>
  <path d="M8 8H4V12H8V8Z" fill={fillLighter}/>
  <path d="M12 8H8V12H12V8Z" fill="#A5A5A5"/>
  <path d="M16 8H12V12H16V8Z" fill={fillLighter}/>
  <path d="M4 12H0V16H4V12Z" fill={fillLighter}/>
  <path d="M8 12H4V16H8V12Z" fill={fillDarker}/>
  <path d="M12 12H8V16H12V12Z" fill={fillLighter}/>
  <path d="M16 12H12V16H16V12Z" fill="#A5A5A5"/>
  </svg>
);

const defaultIconProps = { fillLighter: '#E4E4E4', fillDarker: '#4D4D4D' };
const hoverIconProps = { fillLighter: '#CCDBFC', fillDarker: '#0F58F9' };

const getTransitionIcon = (transitionType: TransitionType, isHovered = false): React.ReactNode => {
  const iconProps = isHovered ? hoverIconProps : defaultIconProps;
  switch (transitionType) {
    case 'fade':
    case 'dissolve':
    case 'fadeblack':
    case 'fadewhite':
    case 'fadefast':
    case 'fadeslow':
      return fadeIcon(iconProps);
    case 'wipeleft':
    case 'wiperight':
    case 'wipeup':
    case 'wipedown':
    case 'wipetl':
    case 'wipetr':
    case 'wipebl':
    case 'wipebr':
      return wipeIcon(iconProps);
    case 'slideleft':
    case 'slideright':
    case 'slideup':
    case 'slidedown':
      return slideIcon(iconProps);
    case 'smoothleft':
    case 'smoothright':
    case 'smoothup':
    case 'smoothdown':
      return smoothIcon(iconProps);
    case 'circlecrop':
    case 'circleopen':
    case 'circleclose':
      return circleIcon(iconProps);
    case 'diagtl':
    case 'diagtr':
    case 'diagbl':
    case 'diagbr':
      return diagonalIcon(iconProps);
    case 'radial':
    case 'distance':
      return radialIcon(iconProps);
    case 'hlslice':
    case 'hrslice':
    case 'vuslice':
    case 'vdslice':
      return slicesIcon(iconProps);
    case 'squeezeh':
    case 'squeezev':
    case 'zoomin':
      return transformIcon(iconProps);
    case 'hblur':
    case 'pixelize':
      return effectsIcon(iconProps);
    default:
      return null;
  }
};

interface TransitionProps {
  transitionIndex?: number | null;
  currentTransition?: TransitionData | null;
  onTransitionChange?: (transitionData: TransitionData) => void;
}

export default function Transition({ transitionIndex, currentTransition, onTransitionChange }: TransitionProps) {
  const { t } = useLanguage();
  const [selectedTransition, setSelectedTransition] = useState<TransitionType>(
    currentTransition?.type || 'none'
  );
  const [isApplyBetweenAllScenes, setIsApplyBetweenAllScenes] = useState(currentTransition?.applyToAll || false);
  const [duration, setDuration] = useState(currentTransition?.duration || 1.0);
  const [variant, setVariant] = useState<TransitionVariant>(currentTransition?.variant || 'circle');
  const [hoveredTransition, setHoveredTransition] = useState<TransitionType | 'none' | null>(null);

  const isTransitionActive = (type: TransitionOption) =>
    hoveredTransition === type || selectedTransition === type;

  // Sync with external changes
  useEffect(() => {
    if (currentTransition) {
      setSelectedTransition(currentTransition.type);
      setDuration(currentTransition.duration);
      setVariant(currentTransition.variant || 'circle');
      setIsApplyBetweenAllScenes(currentTransition.applyToAll || false);
    }
  }, [currentTransition]);
  // Handle transition selection
  const handleTransitionSelect = (transitionType: TransitionType) => {
    setSelectedTransition(transitionType);
    
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
                <span className="text-gray-700 text-xs font-medium capitalize">{selectedTransition}</span>
                {transitionIndex !== null && transitionIndex !== undefined && (
                  <span className="text-gray-500 text-xs">Between slides {transitionIndex + 1} and {transitionIndex + 2}</span>
                )}
              </div>
            </div>
          </div>

          {/* Bottom part - White background */}
          <div className="bg-white p-4 flex-1 rounded-b-md">
            {/* Settings container */}
            <div className="p-4 rounded-lg">
              {/* Apply between all scenes row */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-gray-700 text-xs">Apply between all scenes</span>
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
                <span className="text-gray-700 text-xs">Duration (sec)</span>
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
                  <span className="text-gray-600 text-xs w-8 text-right">{duration.toFixed(1)}</span>
                </div>
              </div>

              {/* Variant row */}
              <div className="flex items-center justify-between">
                <span className="text-gray-700 text-xs">Variant</span>
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

  const selectedSettings = renderSelectedTransitionView();

  return (
    <>
    <div className="h-full bg-white relative overflow-y-auto overflow-hidden w-full">
      {/* Header with transition info */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700">
          {transitionIndex !== null && transitionIndex !== undefined
            ? `Transition ${transitionIndex + 1} (between slides ${transitionIndex + 1} and ${transitionIndex + 2})`
            : 'Slide Transition'}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 transition-scroll">
        {/* Transition options grid */}
        <div className="mt-4 space-y-6">
            {/* Basic Transitions */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Basic</h4>
              <div className="grid grid-cols-3 gap-2">
              <button 
                className={`w-14 h-14 flex items-center justify-center gap-2 bg-[#F4F4F5] border rounded-lg py-3 px-4 transition-colors duration-200 hover:bg-gray-50 ${isTransitionActive('none') ? 'border-[#0F58F9]' : 'border-gray-300'}`}
                onClick={() => handleTransitionSelect('none')}
                onMouseEnter={() => setHoveredTransition('none')}
                onMouseLeave={() => setHoveredTransition(null)}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.75 0.75L12.75 12.75M12.75 0.75L0.75 12.75" stroke={isTransitionActive('none') ? '#0F58F9' : '#878787'} stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <span className="text-gray-700 text-xs font-medium">None</span>
              </button>
                {/* Fade */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('fade')}
                  onMouseEnter={() => setHoveredTransition('fade')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('fade') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('fade', isTransitionActive('fade'))}
                  </div>
                  <span className="text-xs text-gray-700 text-center">Fade</span>
                </div>

                {/* Dissolve */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('dissolve')}
                  onMouseEnter={() => setHoveredTransition('dissolve')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('dissolve') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('dissolve', isTransitionActive('dissolve'))}
                  </div>
                  <span className="text-xs text-gray-700 text-center">Dissolve</span>
                </div>
              </div>
            </div>

            {/* Wipe Transitions */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Wipes</h4>
              <div className="grid grid-cols-3 gap-2">
                {/* Wipe Left */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('wipeleft')}
                  onMouseEnter={() => setHoveredTransition('wipeleft')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('wipeleft') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('wipeleft', isTransitionActive('wipeleft'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Wipe Left</span>
                </div>

                {/* Wipe Right */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('wiperight')}
                  onMouseEnter={() => setHoveredTransition('wiperight')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('wiperight') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('wiperight', isTransitionActive('wiperight'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Wipe Right</span>
                </div>

                {/* Wipe Up */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('wipeup')}
                  onMouseEnter={() => setHoveredTransition('wipeup')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('wipeup') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('wipeup', isTransitionActive('wipeup'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Wipe Up</span>
                </div>

                {/* Wipe Down */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('wipedown')}
                  onMouseEnter={() => setHoveredTransition('wipedown')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('wipedown') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('wipedown', isTransitionActive('wipedown'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Wipe Down</span>
                </div>

                {/* Wipe Top-Left */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('wipetl')}
                  onMouseEnter={() => setHoveredTransition('wipetl')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('wipetl') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('wipetl', isTransitionActive('wipetl'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Wipe TL</span>
                </div>

                {/* Wipe Top-Right */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('wipetr')}
                  onMouseEnter={() => setHoveredTransition('wipetr')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('wipetr') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('wipetr', isTransitionActive('wipetr'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Wipe TR</span>
                </div>

                {/* Wipe Bottom-Left */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('wipebl')}
                  onMouseEnter={() => setHoveredTransition('wipebl')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('wipebl') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('wipebl', isTransitionActive('wipebl'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Wipe BL</span>
                </div>

                {/* Wipe Bottom-Right */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('wipebr')}
                  onMouseEnter={() => setHoveredTransition('wipebr')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('wipebr') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('wipebr', isTransitionActive('wipebr'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Wipe BR</span>
                </div>
              </div>
            </div>

            {/* Slide Transitions */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Slides</h4>
              <div className="grid grid-cols-3 gap-2">
                {/* Slide Left */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('slideleft')}
                  onMouseEnter={() => setHoveredTransition('slideleft')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('slideleft') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('slideleft', isTransitionActive('slideleft'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Slide Left</span>
                </div>

                {/* Slide Right */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('slideright')}
                  onMouseEnter={() => setHoveredTransition('slideright')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('slideright') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('slideright', isTransitionActive('slideright'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Slide Right</span>
                </div>

                {/* Slide Up */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('slideup')}
                  onMouseEnter={() => setHoveredTransition('slideup')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('slideup') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('slideup', isTransitionActive('slideup'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Slide Up</span>
                </div>

                {/* Slide Down */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('slidedown')}
                  onMouseEnter={() => setHoveredTransition('slidedown')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('slidedown') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('slidedown', isTransitionActive('slidedown'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Slide Down</span>
                </div>
              </div>
            </div>

            {/* Smooth Transitions */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Smooth</h4>
              <div className="grid grid-cols-3 gap-2">
                {/* Smooth Left */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('smoothleft')}
                  onMouseEnter={() => setHoveredTransition('smoothleft')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('smoothleft') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('smoothleft', isTransitionActive('smoothleft'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Smooth Left</span>
                </div>

                {/* Smooth Right */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('smoothright')}
                  onMouseEnter={() => setHoveredTransition('smoothright')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('smoothright') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('smoothright', isTransitionActive('smoothright'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Smooth Right</span>
                </div>

                {/* Smooth Up */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('smoothup')}
                  onMouseEnter={() => setHoveredTransition('smoothup')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('smoothup') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('smoothup', isTransitionActive('smoothup'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Smooth Up</span>
                </div>

                {/* Smooth Down */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('smoothdown')}
                  onMouseEnter={() => setHoveredTransition('smoothdown')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('smoothdown') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('smoothdown', isTransitionActive('smoothdown'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Smooth Down</span>
                </div>
              </div>
            </div>

            {/* Circle Effects */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Circle Effects</h4>
              <div className="grid grid-cols-3 gap-2">
                {/* Circle Crop */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('circlecrop')}
                  onMouseEnter={() => setHoveredTransition('circlecrop')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('circlecrop') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('circlecrop', isTransitionActive('circlecrop'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Circle Crop</span>
                </div>

                {/* Circle Open */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('circleopen')}
                  onMouseEnter={() => setHoveredTransition('circleopen')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('circleopen') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('circleopen', isTransitionActive('circleopen'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Circle Open</span>
                </div>

                {/* Circle Close */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('circleclose')}
                  onMouseEnter={() => setHoveredTransition('circleclose')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('circleclose') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('circleclose', isTransitionActive('circleclose'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Circle Close</span>
                </div>
              </div>
            </div>

            {/* Diagonal Transitions */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Diagonal</h4>
              <div className="grid grid-cols-3 gap-2">
                {/* Diagonal Top-Left */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('diagtl')}
                  onMouseEnter={() => setHoveredTransition('diagtl')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('diagtl') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('diagtl', isTransitionActive('diagtl'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Diag TL</span>
                </div>

                {/* Diagonal Top-Right */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('diagtr')}
                  onMouseEnter={() => setHoveredTransition('diagtr')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('diagtr') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('diagtr', isTransitionActive('diagtr'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Diag TR</span>
                </div>

                {/* Diagonal Bottom-Left */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('diagbl')}
                  onMouseEnter={() => setHoveredTransition('diagbl')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('diagbl') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('diagbl', isTransitionActive('diagbl'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Diag BL</span>
                </div>

                {/* Diagonal Bottom-Right */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('diagbr')}
                  onMouseEnter={() => setHoveredTransition('diagbr')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('diagbr') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('diagbr', isTransitionActive('diagbr'))}
                  </div>
                  <span className="text-xs text-gray-700 text-center">Diag BR</span>
                </div>
              </div>
            </div>

            {/* Radial & Distance */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Radial</h4>
              <div className="grid grid-cols-3 gap-2">
                {/* Radial */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('radial')}
                  onMouseEnter={() => setHoveredTransition('radial')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('radial') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('radial', isTransitionActive('radial'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Radial</span>
                </div>

                {/* Distance */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('distance')}
                  onMouseEnter={() => setHoveredTransition('distance')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('distance') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('distance', isTransitionActive('distance'))}
                  </div>
                  <span className="text-xs text-gray-700 text-center">Distance</span>
                </div>
              </div>
            </div>

            {/* Slice Effects */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Slices</h4>
              <div className="grid grid-cols-3 gap-2">
                {/* Horizontal Left Slice */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('hlslice')}
                  onMouseEnter={() => setHoveredTransition('hlslice')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('hlslice') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('hlslice', isTransitionActive('hlslice'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">H-Left Slice</span>
                </div>

                {/* Horizontal Right Slice */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('hrslice')}
                  onMouseEnter={() => setHoveredTransition('hrslice')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('hrslice') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('hrslice', isTransitionActive('hrslice'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">H-Right Slice</span>
                </div>

                {/* Vertical Up Slice */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('vuslice')}
                  onMouseEnter={() => setHoveredTransition('vuslice')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('vuslice') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('vuslice', isTransitionActive('vuslice'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">V-Up Slice</span>
                </div>

                {/* Vertical Down Slice */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('vdslice')}
                  onMouseEnter={() => setHoveredTransition('vdslice')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('vdslice') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('vdslice', isTransitionActive('vdslice'))}
                  </div>
                  <span className="text-xs text-gray-700 text-center">V-Down Slice</span>
                </div>
              </div>
            </div>

            {/* Squeeze & Zoom */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Transform</h4>
              <div className="grid grid-cols-3 gap-2">
                {/* Squeeze Horizontal */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('squeezeh')}
                  onMouseEnter={() => setHoveredTransition('squeezeh')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('squeezeh') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('squeezeh', isTransitionActive('squeezeh'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Squeeze H</span>
                </div>

                {/* Squeeze Vertical */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('squeezev')}
                  onMouseEnter={() => setHoveredTransition('squeezev')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('squeezev') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('squeezev', isTransitionActive('squeezev'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Squeeze V</span>
                </div>

                {/* Zoom In */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('zoomin')}
                  onMouseEnter={() => setHoveredTransition('zoomin')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('zoomin') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('zoomin', isTransitionActive('zoomin'))}
                  </div>
                  <span className="text-xs text-gray-700 text-center">Zoom In</span>
                </div>
              </div>
            </div>

            {/* Blur & Pixelize */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Effects</h4>
              <div className="grid grid-cols-3 gap-2">
                {/* Horizontal Blur */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('hblur')}
                  onMouseEnter={() => setHoveredTransition('hblur')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('hblur') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('hblur', isTransitionActive('hblur'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">H-Blur</span>
                </div>

                {/* Pixelize */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('pixelize')}
                  onMouseEnter={() => setHoveredTransition('pixelize')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('pixelize') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('pixelize', isTransitionActive('pixelize'))}
                  </div>
                  <span className="text-xs text-gray-700 text-center">Pixelize</span>
                </div>
              </div>
            </div>

            {/* Fade Variations */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Fade Variations</h4>
              <div className="grid grid-cols-3 gap-2">
                {/* Fade Black */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('fadeblack')}
                  onMouseEnter={() => setHoveredTransition('fadeblack')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('fadeblack') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('fadeblack', isTransitionActive('fadeblack'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Fade Black</span>
                </div>

                {/* Fade White */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('fadewhite')}
                  onMouseEnter={() => setHoveredTransition('fadewhite')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('fadewhite') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('fadewhite', isTransitionActive('fadewhite'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Fade White</span>
                </div>

                {/* Fade Fast */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('fadefast')}
                  onMouseEnter={() => setHoveredTransition('fadefast')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('fadefast') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('fadefast', isTransitionActive('fadefast'))}
                  </div>
                  <span className="text-sm text-gray-700 text-center">Fade Fast</span>
                </div>

                {/* Fade Slow */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('fadeslow')}
                  onMouseEnter={() => setHoveredTransition('fadeslow')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 bg-white border rounded-lg mb-2 hover:bg-white transition-colors flex items-center justify-center ${isTransitionActive('fadeslow') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('fadeslow', isTransitionActive('fadeslow'))}
                  </div>
                  <span className="text-xs text-gray-700 text-center">Fade Slow</span>
                </div>
              </div>
            </div>
          </div>
        {selectedSettings && (
          <div className="mt-6">
            {selectedSettings}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
