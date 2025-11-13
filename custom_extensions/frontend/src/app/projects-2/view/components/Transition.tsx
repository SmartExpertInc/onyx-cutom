"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import './Transition.css';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

const VARIANT_OPTIONS: Array<{ value: TransitionVariant; label: string; icon: React.ReactNode; helper?: string }> = [
  {
    value: 'horizontal-chevrons',
    label: 'Left',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.99967 5.33594L1.33301 8.0026M1.33301 8.0026L3.99967 10.6693M1.33301 8.0026H14.6663" stroke="#878787" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    value: 'vertical-chevrons',
    label: 'Up',
    icon: (
      <svg width="7" height="15" viewBox="0 0 7 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.83301 3.16667L3.16634 0.5M3.16634 0.5L0.499674 3.16667M3.16634 0.5L3.16634 13.8333" stroke="#878787" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    value: 'circle',
    label: 'Circle',
    icon: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
];

export const getTransitionIcon = (transitionType: TransitionType, isHovered = false): React.ReactNode => {
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
  onBack?: () => void;
}

export default function Transition({ transitionIndex, currentTransition, onTransitionChange, onBack }: TransitionProps) {
  const { t } = useLanguage();
  const [selectedTransition, setSelectedTransition] = useState<TransitionType>(
    currentTransition?.type || 'none'
  );
  const [isApplyBetweenAllScenes, setIsApplyBetweenAllScenes] = useState(currentTransition?.applyToAll || false);
  const [duration, setDuration] = useState(currentTransition?.duration || 1.0);
  const [variant, setVariant] = useState<TransitionVariant>(currentTransition?.variant || 'circle');
  const [hoveredTransition, setHoveredTransition] = useState<TransitionType | 'none' | null>(null);
  const [isVariantMenuOpen, setIsVariantMenuOpen] = useState(false);

  const isTransitionActive = (type: TransitionOption) =>
    hoveredTransition === type || selectedTransition === type;

  // Sync with external changes
  useEffect(() => {
    if (currentTransition) {
      setSelectedTransition(currentTransition.type);
      setDuration(currentTransition.duration);
      setVariant(currentTransition.variant || 'circle');
      setIsApplyBetweenAllScenes(currentTransition.applyToAll || false);
    } else {
      setSelectedTransition('none');
      setDuration(1.0);
      setVariant('circle');
      setIsApplyBetweenAllScenes(false);
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
              {/* Apply between all scenes row */}
              <div className="flex items-center justify-between">
                <span className="text-[#171718] font-medium text-sm">Apply between all scenes</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isApplyBetweenAllScenes}
                  aria-label="Apply between all scenes switch"
                  className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#0F58F9] ${
                    isApplyBetweenAllScenes ? 'bg-[#0F58F9]' : 'bg-gray-300'
                  }`}
                  onClick={() => handleApplyToAllChange(!isApplyBetweenAllScenes)}
                >
                  <span
                    className={`w-4 h-4 rounded-full shadow-sm bg-white transition-transform ${
                      isApplyBetweenAllScenes ? 'translate-x-4' : ''
                    }`}
                  />
                </button>
              </div>
              <div>
                <span className="text-[#171718] font-semibold text-sm tracking-wide">Modify</span>
              </div>

              {/* Duration row */}
              <div className="flex flex-row items-center gap-2">
                <span className="text-[#171718] text-xs">Duration</span>
                <div className="flex items-center gap-3 w-full max-w-[220px]">
                  <div className="flex items-center gap-2 px-3 py-1 border border-[#E5E7EB] rounded-md shadow-sm bg-white flex-1">
                    <span role="img" aria-label="timer" className="text-gray-600"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.39941 0.5H9.59961C9.61793 0.500049 9.63274 0.514885 9.63281 0.533203C9.63281 0.551581 9.61797 0.566356 9.59961 0.566406H8.0332V2.72363L8.49414 2.75879C9.57974 2.84267 10.5883 3.20079 11.4512 3.76367L11.8506 4.02441L12.1299 3.63672L12.1484 3.61523L13.2148 2.54883C13.28 2.48372 13.3861 2.48372 13.4512 2.54883C13.5159 2.6138 13.5158 2.71914 13.4512 2.78418H13.4502L12.4111 3.82422L12.0527 4.18262L12.415 4.53613C13.5944 5.68578 14.3261 7.29016 14.3262 9.06641C14.3262 12.5604 11.4939 15.3933 8 15.3936C4.50587 15.3936 1.67285 12.5605 1.67285 9.06641C1.67297 5.73895 4.24235 3.0109 7.50488 2.75879L7.96582 2.72363V0.566406H6.39941C6.38105 0.56635 6.36621 0.551582 6.36621 0.533203C6.36628 0.514883 6.38109 0.500056 6.39941 0.5ZM8 2.80664C4.54277 2.80664 1.73939 5.60921 1.73926 9.06641C1.73926 12.5237 4.54269 15.3271 8 15.3271C11.4571 15.3269 14.2598 12.5235 14.2598 9.06641C14.2596 5.60937 11.457 2.8069 8 2.80664ZM7.5 9.27344L7.64551 9.41992L10.5889 12.3633C9.87568 12.9244 8.97769 13.2597 8 13.2598C5.68408 13.2598 3.80664 11.3823 3.80664 9.06641C3.80676 6.91964 5.41966 5.15028 7.5 4.90332V9.27344Z" fill="#4D4D4D" stroke="#4D4D4D"/>
                      </svg>
                      </span>
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
                  {/* <input
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
                  /> */}
                </div>
              </div>

              {/* Variant row */}
              <div className="flex flex-row items-center gap-2">
                <span className="text-[#171718] text-xs">Variant</span>
                <DropdownMenu open={isVariantMenuOpen} onOpenChange={setIsVariantMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center justify-between px-4 py-1 border border-[#E5E7EB] rounded-md bg-white shadow-sm text-sm text-[#171718] hover:border-[#0F58F9] transition-colors w-full max-w-[120px]"
                      type="button"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-md leading-none">
                          {VARIANT_OPTIONS.find((option) => option.value === variant)?.icon}
                        </span>
                        {VARIANT_OPTIONS.find((option) => option.value === variant)?.label ?? 'Select variant'}
                      </span>
                      <span className={`text-xs transition-transform ${isVariantMenuOpen ? 'rotate-180' : ''}`}>
                        <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.7969 0.62207C12.9576 0.45958 13.2159 0.459411 13.377 0.62207C13.5408 0.787762 13.5408 1.05892 13.377 1.22461L7.29004 7.37793C7.21211 7.45668 7.10775 7.5 7 7.5C6.89223 7.49999 6.78784 7.45667 6.70996 7.37793L0.623047 1.22461C0.459166 1.05893 0.459166 0.787752 0.623047 0.62207C0.783931 0.459457 1.04225 0.459439 1.20312 0.62207L6.64453 6.12305L7 6.48242L7.35547 6.12305L12.7969 0.62207Z" fill="#4D4D4D" stroke="#4D4D4D"/>
                        </svg>
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    sideOffset={8}
                    className="w-[160px] rounded-md border border-[#A5A5A5] bg-white shadow-lg overflow-hidden p-0"
                  >
                    {VARIANT_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onSelect={(event) => {
                          event.preventDefault();
                          handleVariantChange(option.value);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors focus:bg-[#EFF4FF] focus:text-[#0F58F9] ${
                          variant === option.value ? 'bg-[#EFF4FF] text-[#878787]' : 'text-[#171718] hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-lg leading-none">{option.icon}</span>
                        <span>{option.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onBack?.()}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors text-[#878787]"
          aria-label="Back"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.16667 9.83333L0.5 5.16667M0.5 5.16667L5.16667 0.5M0.5 5.16667H9.83333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h3 className="text-[16px] font-semibold text-[#171718]">Scene Transition</h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 transition-scroll">
        {/* Transition options grid */}
        <div className="mt-4 space-y-6">
            {/* Basic Transitions */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Basic</h4>
              <div className="grid grid-cols-3 gap-2">
              <button 
                className={`w-14 h-14 flex flex-col items-center justify-center gap-2 bg-[#F4F4F5] border rounded-lg py-3 px-4 transition-colors duration-200 hover:bg-gray-50 ${isTransitionActive('none') ? 'border-[#0F58F9]' : 'border-gray-300'}`}
                onClick={() => handleTransitionSelect('none')}
                onMouseEnter={() => setHoveredTransition('none')}
                onMouseLeave={() => setHoveredTransition(null)}
              >
                <svg width="17" height="17" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                    <span className="text-[10px] text-gray-700 text-center">Wipe Left</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Wipe Right</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Wipe Up</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Wipe Down</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Wipe TL</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Wipe TR</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Wipe BL</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Wipe BR</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Slide Left</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Slide Right</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Slide Up</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Slide Down</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Smooth Left</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Smooth Right</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Smooth Up</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Smooth Down</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Circle Crop</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Circle Open</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Circle Close</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Diag TL</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Diag TR</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Diag BL</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Diag BR</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Radial</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Distance</span>
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
                    <span className="text-[10px] text-gray-700 text-center">H-Left Slice</span>
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
                    <span className="text-[10px] text-gray-700 text-center">H-Right Slice</span>
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
                    <span className="text-[10px] text-gray-700 text-center">V-Up Slice</span>
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
                    <span className="text-[10px] text-gray-700 text-center">V-Down Slice</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Squeeze H</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Squeeze V</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Zoom In</span>
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
                    <span className="text-[10px] text-gray-700 text-center">H-Blur</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Pixelize</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Fade Black</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Fade White</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Fade Fast</span>
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
                    <span className="text-[10px] text-gray-700 text-center">Fade Slow</span>
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
