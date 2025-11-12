"use client";

import React, { useState, useEffect, useRef } from 'react';
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

const VARIANT_OPTIONS: Array<{ value: TransitionVariant; label: string; icon: string; helper?: string }> = [
  { value: 'horizontal-chevrons', label: 'Left', icon: '←' },
  { value: 'vertical-chevrons', label: 'Up', icon: '↑' },
  { value: 'circle', label: 'Circle', icon: '◯' }
];

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
  const [isVariantMenuOpen, setIsVariantMenuOpen] = useState(false);
  const variantDropdownRef = useRef<HTMLDivElement>(null);

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
    setIsVariantMenuOpen(false);
    
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
    setIsVariantMenuOpen(false);
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

  useEffect(() => {
    if (!isVariantMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (variantDropdownRef.current && !variantDropdownRef.current.contains(event.target as Node)) {
        setIsVariantMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVariantMenuOpen]);

  // Function to render the selected transition settings view
  const renderSelectedTransitionView = () => {
    if (!selectedTransition || selectedTransition === 'none') return null;

    return (
      <div className="h-full flex flex-col">
        <div className="w-full">
          {/* Top part - Light grey background */}
          {/* <div className="bg-gray-100 p-4 flex items-center justify-between rounded-t-md">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
              </div>
              <div className="flex flex-col">
                <span className="text-gray-700 text-xs font-medium capitalize">{selectedTransition}</span>
                {transitionIndex !== null && transitionIndex !== undefined && (
                  <span className="text-gray-500 text-xs">Between slides {transitionIndex + 1} and {transitionIndex + 2}</span>
                )}
              </div>
            </div>
          </div> */}

          {/* Bottom part - White background */}
          <div className="bg-white flex-1">
            {/* Settings container */}
             <div className="py-4 flex flex-col gap-6">
              <div>
                <span className="text-[#171718] font-semibold text-sm uppercase tracking-wide">Modify</span>
              </div>
              {/* Apply between all scenes row */}
              <div className="flex items-center justify-between">
                <span className="text-[#171718] font-medium text-sm">Apply between all scenes</span>
                {/* Switch/Slider */}
                <div 
                  className={`w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${
                    isApplyBetweenAllScenes ? 'bg-blue-600' : 'bg-gray-300'
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
              <div className="flex flex-col gap-2">
                <span className="text-[#171718] font-medium text-sm">Duration</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-xl shadow-sm bg-white min-w-[160px]">
                    <span role="img" aria-label="timer" className="text-gray-600">⏱</span>
                    <input
                      type="number"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      value={duration}
                      onChange={(e) => {
                        const parsed = parseFloat(e.target.value);
                        if (Number.isNaN(parsed)) {
                          return;
                        }
                        const clamped = Math.max(0.5, Math.min(3, parsed));
                        handleDurationChange(parseFloat(clamped.toFixed(1)));
                      }}
                      onBlur={(e) => {
                        const parsed = parseFloat(e.target.value);
                        if (Number.isNaN(parsed)) {
                          handleDurationChange(duration);
                          return;
                        }
                        const clamped = Math.max(0.5, Math.min(3, parsed));
                        handleDurationChange(parseFloat(clamped.toFixed(1)));
                      }}
                      className="w-12 border-none focus:outline-none text-sm text-[#171718] bg-transparent"
                    />
                    <span className="text-gray-500 text-sm">s</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={duration}
                    className="transition-range w-full h-1 rounded-full appearance-none cursor-pointer bg-gray-200"
                    onChange={(e) => handleDurationChange(parseFloat(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, #0F58F9 0%, #0F58F9 ${((duration - 0.5) / 2.5) * 100}%, #E5E7EB ${((duration - 0.5) / 2.5) * 100}%, #E5E7EB 100%)`
                    }}
                  />
                </div>
              </div>

              {/* Variant row */}
              <div className="flex flex-col gap-2">
                <span className="text-[#171718] font-medium text-sm">Variant</span>
                <div className="relative w-full max-w-[220px]" ref={variantDropdownRef}>
                  <button
                    className="w-full flex items-center justify-between px-4 py-2.5 border border-[#E5E7EB] rounded-xl bg-white shadow-sm text-sm text-[#171718] hover:border-[#0F58F9] transition-colors"
                    onClick={() => setIsVariantMenuOpen((prev) => !prev)}
                    type="button"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg leading-none">
                        {VARIANT_OPTIONS.find((option) => option.value === variant)?.icon}
                      </span>
                      {VARIANT_OPTIONS.find((option) => option.value === variant)?.label ?? 'Select variant'}
                    </span>
                    <span className={`text-xs transition-transform ${isVariantMenuOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {isVariantMenuOpen && (
                    <div className="absolute left-0 right-0 mt-2 rounded-xl border border-[#E5E7EB] bg-white shadow-lg z-20 overflow-hidden">
                      {VARIANT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                            variant === option.value ? 'bg-[#EFF4FF] text-[#0F58F9]' : 'text-[#171718] hover:bg-gray-50'
                          }`}
                          onClick={() => handleVariantChange(option.value)}
                        >
                          <span className="text-lg leading-none">{option.icon}</span>
                          <span>{option.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
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
    <div className="h-full bg-white relative overflow-y-auto overflow-hidden w-full transition-scroll">
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
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('fade') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('fade', isTransitionActive('fade'))}
                    <span className="text-xs text-gray-700 text-center">Fade</span>
                  </div>
                  
                </div>

                {/* Dissolve */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('dissolve')}
                  onMouseEnter={() => setHoveredTransition('dissolve')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('dissolve') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('dissolve', isTransitionActive('dissolve'))}
                    <span className="text-xs text-gray-700 text-center">Dissolve</span>
                  </div>
                  
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
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('wipeleft') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('wipeleft', isTransitionActive('wipeleft'))}
                    <span className="text-sm text-gray-700 text-center">Wipe Left</span>
                  </div>
                  
                </div>

                {/* Wipe Right */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('wiperight')}
                  onMouseEnter={() => setHoveredTransition('wiperight')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('wiperight') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('wiperight', isTransitionActive('wiperight'))}
                    <span className="text-sm text-gray-700 text-center">Wipe Right</span>
                  </div>
                  
                </div>

                {/* Wipe Up */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('wipeup')}
                  onMouseEnter={() => setHoveredTransition('wipeup')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('wipeup') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('wipeup', isTransitionActive('wipeup'))}
                    <span className="text-sm text-gray-700 text-center">Wipe Up</span>
                  </div>
                  
                </div>

                {/* Wipe Down */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('wipedown')}
                  onMouseEnter={() => setHoveredTransition('wipedown')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('wipedown') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('wipedown', isTransitionActive('wipedown'))}
                    <span className="text-sm text-gray-700 text-center">Wipe Down</span>
                  </div>
                  
                </div>

                {/* Wipe Top-Left */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('wipetl')}
                  onMouseEnter={() => setHoveredTransition('wipetl')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('wipetl') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('wipetl', isTransitionActive('wipetl'))}
                    <span className="text-sm text-gray-700 text-center">Wipe TL</span>
                  </div>
                 
                </div>

                {/* Wipe Top-Right */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('wipetr')}
                  onMouseEnter={() => setHoveredTransition('wipetr')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('wipetr') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('wipetr', isTransitionActive('wipetr'))}
                    <span className="text-sm text-gray-700 text-center">Wipe TR</span>
                  </div>
                  
                </div>

                {/* Wipe Bottom-Left */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('wipebl')}
                  onMouseEnter={() => setHoveredTransition('wipebl')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('wipebl') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('wipebl', isTransitionActive('wipebl'))}
                    <span className="text-sm text-gray-700 text-center">Wipe BL</span>
                  </div>
                  
                </div>

                {/* Wipe Bottom-Right */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('wipebr')}
                  onMouseEnter={() => setHoveredTransition('wipebr')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('wipebr') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('wipebr', isTransitionActive('wipebr'))}
                    <span className="text-sm text-gray-700 text-center">Wipe BR</span>
                  </div>
                  
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
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('slideleft') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('slideleft', isTransitionActive('slideleft'))}
                    <span className="text-sm text-gray-700 text-center">Slide Left</span>
                  </div>
                  
                </div>

                {/* Slide Right */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('slideright')}
                  onMouseEnter={() => setHoveredTransition('slideright')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('slideright') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('slideright', isTransitionActive('slideright'))}
                    <span className="text-sm text-gray-700 text-center">Slide Right</span>
                  </div>
                  
                </div>

                {/* Slide Up */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('slideup')}
                  onMouseEnter={() => setHoveredTransition('slideup')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('slideup') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('slideup', isTransitionActive('slideup'))}
                    <span className="text-sm text-gray-700 text-center">Slide Up</span>
                  </div>
                 
                </div>

                {/* Slide Down */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('slidedown')}
                  onMouseEnter={() => setHoveredTransition('slidedown')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('slidedown') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('slidedown', isTransitionActive('slidedown'))}
                    <span className="text-sm text-gray-700 text-center">Slide Down</span>
                  </div>
                  
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
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('smoothleft') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('smoothleft', isTransitionActive('smoothleft'))}
                    <span className="text-sm text-gray-700 text-center">Smooth Left</span>
                  </div>
                  
                </div>

                {/* Smooth Right */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('smoothright')}
                  onMouseEnter={() => setHoveredTransition('smoothright')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('smoothright') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('smoothright', isTransitionActive('smoothright'))}
                    <span className="text-sm text-gray-700 text-center">Smooth Right</span>
                  </div>
                  
                </div>

                {/* Smooth Up */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('smoothup')}
                  onMouseEnter={() => setHoveredTransition('smoothup')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('smoothup') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('smoothup', isTransitionActive('smoothup'))}
                    <span className="text-sm text-gray-700 text-center">Smooth Up</span>
                  </div>
                  
                </div>

                {/* Smooth Down */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('smoothdown')}
                  onMouseEnter={() => setHoveredTransition('smoothdown')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('smoothdown') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('smoothdown', isTransitionActive('smoothdown'))}
                    <span className="text-sm text-gray-700 text-center">Smooth Down</span>
                  </div>
                  
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
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('circlecrop') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('circlecrop', isTransitionActive('circlecrop'))}
                    <span className="text-sm text-gray-700 text-center">Circle Crop</span>
                  </div>
                  
                </div>

                {/* Circle Open */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('circleopen')}
                  onMouseEnter={() => setHoveredTransition('circleopen')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('circleopen') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('circleopen', isTransitionActive('circleopen'))}
                    <span className="text-sm text-gray-700 text-center">Circle Open</span>
                  </div>
                  
                </div>

                {/* Circle Close */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('circleclose')}
                  onMouseEnter={() => setHoveredTransition('circleclose')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('circleclose') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('circleclose', isTransitionActive('circleclose'))}
                    <span className="text-sm text-gray-700 text-center">Circle Close</span>
                  </div>
                  
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
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('diagtl') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('diagtl', isTransitionActive('diagtl'))}
                    <span className="text-sm text-gray-700 text-center">Diag TL</span>
                  </div>
                  
                </div>

                {/* Diagonal Top-Right */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('diagtr')}
                  onMouseEnter={() => setHoveredTransition('diagtr')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('diagtr') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('diagtr', isTransitionActive('diagtr'))}
                    <span className="text-sm text-gray-700 text-center">Diag TR</span>
                  </div>
                  
                </div>

                {/* Diagonal Bottom-Left */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('diagbl')}
                  onMouseEnter={() => setHoveredTransition('diagbl')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('diagbl') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('diagbl', isTransitionActive('diagbl'))}
                    <span className="text-sm text-gray-700 text-center">Diag BL</span>
                  </div>
                  
                </div>

                {/* Diagonal Bottom-Right */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('diagbr')}
                  onMouseEnter={() => setHoveredTransition('diagbr')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('diagbr') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('diagbr', isTransitionActive('diagbr'))}
                    <span className="text-xs text-gray-700 text-center">Diag BR</span>
                  </div>
                  
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
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('radial') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('radial', isTransitionActive('radial'))}
                    <span className="text-sm text-gray-700 text-center">Radial</span>
                  </div>
                  
                </div>

                {/* Distance */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('distance')}
                  onMouseEnter={() => setHoveredTransition('distance')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('distance') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('distance', isTransitionActive('distance'))}
                    <span className="text-xs text-gray-700 text-center">Distance</span>
                  </div>
                  
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
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('hlslice') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('hlslice', isTransitionActive('hlslice'))}
                    <span className="text-sm text-gray-700 text-center">H-Left Slice</span>
                  </div>
                  
                </div>

                {/* Horizontal Right Slice */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('hrslice')}
                  onMouseEnter={() => setHoveredTransition('hrslice')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('hrslice') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('hrslice', isTransitionActive('hrslice'))}
                    <span className="text-sm text-gray-700 text-center">H-Right Slice</span>
                  </div>
                  
                </div>

                {/* Vertical Up Slice */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('vuslice')}
                  onMouseEnter={() => setHoveredTransition('vuslice')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('vuslice') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('vuslice', isTransitionActive('vuslice'))}
                    <span className="text-sm text-gray-700 text-center">V-Up Slice</span>
                  </div>
                  
                </div>

                {/* Vertical Down Slice */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('vdslice')}
                  onMouseEnter={() => setHoveredTransition('vdslice')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('vdslice') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('vdslice', isTransitionActive('vdslice'))}
                    <span className="text-xs text-gray-700 text-center">V-Down Slice</span>
                  </div>
                  
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
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('squeezeh') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('squeezeh', isTransitionActive('squeezeh'))}
                    <span className="text-sm text-gray-700 text-center">Squeeze H</span>
                  </div>
                  
                </div>

                {/* Squeeze Vertical */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('squeezev')}
                  onMouseEnter={() => setHoveredTransition('squeezev')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('squeezev') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('squeezev', isTransitionActive('squeezev'))}
                    <span className="text-sm text-gray-700 text-center">Squeeze V</span>
                  </div>
                  
                </div>

                {/* Zoom In */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('zoomin')}
                  onMouseEnter={() => setHoveredTransition('zoomin')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('zoomin') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('zoomin', isTransitionActive('zoomin'))}
                    <span className="text-xs text-gray-700 text-center">Zoom In</span>
                  </div>
                  
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
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('hblur') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('hblur', isTransitionActive('hblur'))}
                    <span className="text-sm text-gray-700 text-center">H-Blur</span>
                  </div>
                  
                </div>

                {/* Pixelize */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('pixelize')}
                  onMouseEnter={() => setHoveredTransition('pixelize')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('pixelize') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('pixelize', isTransitionActive('pixelize'))}
                    <span className="text-xs text-gray-700 text-center">Pixelize</span>
                  </div>
                  
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
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('fadeblack') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('fadeblack', isTransitionActive('fadeblack'))}
                    <span className="text-sm text-gray-700 text-center">Fade Black</span>
                  </div>
                  
                </div>

                {/* Fade White */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('fadewhite')}
                  onMouseEnter={() => setHoveredTransition('fadewhite')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('fadewhite') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('fadewhite', isTransitionActive('fadewhite'))}
                    <span className="text-sm text-gray-700 text-center">Fade White</span>
                  </div>
                  
                </div>

                {/* Fade Fast */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('fadefast')}
                  onMouseEnter={() => setHoveredTransition('fadefast')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('fadefast') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('fadefast', isTransitionActive('fadefast'))}
                    <span className="text-sm text-gray-700 text-center">Fade Fast</span>
                  </div>
                  
                </div>

                {/* Fade Slow */}
                <div 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleTransitionSelect('fadeslow')}
                  onMouseEnter={() => setHoveredTransition('fadeslow')}
                  onMouseLeave={() => setHoveredTransition(null)}
                >
                  <div className={`w-14 h-14 flex flex-col bg-white border rounded-lg mb-2 hover:bg-white transition-colors items-center justify-center ${isTransitionActive('fadeslow') ? 'border-[#0F58F9]' : 'border-[#E0E0E0]'}`}>
                    {getTransitionIcon('fadeslow', isTransitionActive('fadeslow'))}
                    <span className="text-xs text-gray-700 text-center">Fade Slow</span>
                  </div>
                  
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
