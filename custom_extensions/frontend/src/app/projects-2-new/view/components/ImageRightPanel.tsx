"use client";

import React, { useRef, useEffect, useState } from 'react';
import { ComponentBasedSlideDeck } from '@/types/slideTemplates';
import { useLanguage } from '@/contexts/LanguageContext';

interface ShapeRightPanelProps {
  // Appearance props
  isAppearanceEnabled: boolean;
  setIsAppearanceEnabled: (enabled: boolean) => void;
  showAppearanceDropdown: boolean;
  setShowAppearanceDropdown: (show: boolean) => void;
  selectedAppearance: string;
  setSelectedAppearance: (appearance: string) => void;
  appearanceVolume: number;
  setAppearanceVolume: (volume: number) => void;

  // Background props
  isBackgroundEnabled: boolean;
  setIsBackgroundEnabled: (enabled: boolean) => void;
  backgroundColor: string;
  setMediaPopupPosition: (position: { x: number; y: number }) => void;
  setIsMediaPopupOpen: (open: boolean) => void;
  setColorPalettePosition: (position: { x: number; y: number }) => void;
  setIsColorPaletteOpen: (open: boolean) => void;

  // Transition props
  isTransitionEnabled: boolean;
  setIsTransitionEnabled: (enabled: boolean) => void;
  showTransitionDropdown: boolean;
  setShowTransitionDropdown: (show: boolean) => void;
  selectedTransition: string;
  setSelectedTransition: (transition: string) => void;
  activeSettingsPanel: string | null;
  setActiveSettingsPanel: (panel: string | null) => void;
  componentBasedSlideDeck: ComponentBasedSlideDeck | undefined;
  setActiveTransitionIndex: (index: number | null) => void;
  
  // Shape color props
  shapeColor?: string;
  onShapeColorChange?: (color: string) => void;
  
  // Stroke color props
  strokeColor?: string;
  onStrokeColorChange?: (color: string) => void;
  
  // Color palette context
  onColorPaletteContextChange?: (context: 'shape' | 'stroke') => void;
  
  // Close handler
  onClose: () => void;
  
  // Right panel ref for positioning
  rightPanelRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ShapeRightPanel({
  isAppearanceEnabled: _isAppearanceEnabled,
  setIsAppearanceEnabled: _setIsAppearanceEnabled,
  showAppearanceDropdown: _showAppearanceDropdown,
  setShowAppearanceDropdown: _setShowAppearanceDropdown,
  selectedAppearance: _selectedAppearance,
  setSelectedAppearance: _setSelectedAppearance,
  appearanceVolume: _appearanceVolume,
  setAppearanceVolume: _setAppearanceVolume,
  isBackgroundEnabled,
  setIsBackgroundEnabled,
  backgroundColor,
  setMediaPopupPosition,
  setIsMediaPopupOpen,
  setColorPalettePosition,
  setIsColorPaletteOpen,
  isTransitionEnabled: _isTransitionEnabled,
  setIsTransitionEnabled: _setIsTransitionEnabled,
  showTransitionDropdown: _showTransitionDropdown,
  setShowTransitionDropdown: _setShowTransitionDropdown,
  selectedTransition: _selectedTransition,
  setSelectedTransition: _setSelectedTransition,
  activeSettingsPanel: _activeSettingsPanel,
  setActiveSettingsPanel: _setActiveSettingsPanel,
  componentBasedSlideDeck: _componentBasedSlideDeck,
  setActiveTransitionIndex: _setActiveTransitionIndex,
  shapeColor: _shapeColor,
  onShapeColorChange: _onShapeColorChange,
  strokeColor,
  onStrokeColorChange,
  onColorPaletteContextChange,
  onClose,
  rightPanelRef,
}: ShapeRightPanelProps) {
  const { t } = useLanguage();
  const [selectedAlignment, setSelectedAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [selectedLayer, setSelectedLayer] = useState<'toBack' | 'backward' | 'forward' | 'toFront'>('backward');
  const [positionX, setPositionX] = useState<string>('150');
  const [positionY, setPositionY] = useState<string>('150');
  const [selectedStrokeColor, setSelectedStrokeColor] = useState<string | null>(null);
  const [hasStroke, setHasStroke] = useState<boolean>(false);
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [rotation, setRotation] = useState<number>(0);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const [currentColorContext, setCurrentColorContext] = useState<'shape' | 'stroke' | null>(null);
  const [transparencyValue, setTransparencyValue] = useState<string>('100%');

  void _shapeColor;
  void _onShapeColorChange;
  void _isAppearanceEnabled;
  void _setIsAppearanceEnabled;
  void _showAppearanceDropdown;
  void _setShowAppearanceDropdown;
  void _selectedAppearance;
  void _setSelectedAppearance;
  void _appearanceVolume;
  void _setAppearanceVolume;
  void _isTransitionEnabled;
  void _setIsTransitionEnabled;
  void _showTransitionDropdown;
  void _setShowTransitionDropdown;
  void _selectedTransition;
  void _setSelectedTransition;
  void _activeSettingsPanel;
  void _setActiveSettingsPanel;
  void _componentBasedSlideDeck;
  void _setActiveTransitionIndex;

  // Update selectedStrokeColor when strokeColor prop changes
  useEffect(() => {
    if (strokeColor) {
      setSelectedStrokeColor(strokeColor);
      setHasStroke(true);
    } else if (strokeColor === '') {
      // Empty string means stroke was removed
      setSelectedStrokeColor(null);
      setHasStroke(false);
    }
  }, [strokeColor]);

  // Close dropdowns and color palette when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
      // Close color palette when clicking outside
      if (colorPickerRef.current && !colorPickerRef.current.contains(target)) {
        // Check if the click is also outside the ColorPalettePopup component
        const colorPalettePopup = document.querySelector('[data-color-palette-popup]');
        if (!colorPalettePopup || !colorPalettePopup.contains(target)) {
          setIsColorPaletteOpen(false);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsColorPaletteOpen]);

  return (
    <>
      {/* Shape Action Buttons */}
      <div ref={colorPickerRef} className="space-y-2 flex-shrink-0 mb-4">
        {/* Stroke button */}
        {/* Stroke Width Control - Only visible when stroke is selected */}
        {hasStroke && selectedStrokeColor && (
          <div className="flex gap-2">
            {/* Left column - Stroke Label */}
            <div className="flex-1 flex items-center">
              <span className="text-xs font-medium" style={{ color: '#171718' }}>{t('panels.shapeRightPanel.stroke', 'Stroke')}</span>
            </div>
            
            {/* Right column - Stroke Button */}
            <div className="flex-1">
              <div className="w-full flex items-center justify-between px-3 py-2 border rounded-md" style={{ borderColor: '#E0E0E0', backgroundColor: 'white' }}>
              {/* Left side - Icon and Number */}
              <div className="flex items-center gap-2.5">
                {/* Stroke icon */}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_2114_22891)">
                    <path d="M1.3125 4.8125V6.5625H12.6875V4.8125H1.3125ZM13.5625 6.5625C13.5625 7.04575 13.1707 7.4375 12.6875 7.4375H1.3125C0.829251 7.4375 0.4375 7.04575 0.4375 6.5625V4.8125C0.4375 4.32925 0.829251 3.9375 1.3125 3.9375H12.6875C13.1707 3.9375 13.5625 4.32925 13.5625 4.8125V6.5625Z" fill="#171718"/>
                    <path d="M1.3125 9.1875V11.8125H12.6875V9.1875H1.3125ZM13.5625 11.8125C13.5625 12.2957 13.1707 12.6875 12.6875 12.6875H1.3125C0.829251 12.6875 0.4375 12.2957 0.4375 11.8125V9.1875C0.4375 8.70425 0.829251 8.3125 1.3125 8.3125H12.6875C13.1707 8.3125 13.5625 8.70425 13.5625 9.1875V11.8125Z" fill="#171718"/>
                    <path d="M1.3125 1.3125V2.1875H12.6875V1.3125H1.3125ZM13.5625 2.1875C13.5625 2.67075 13.1707 3.0625 12.6875 3.0625H1.3125C0.829251 3.0625 0.4375 2.67075 0.4375 2.1875V1.3125C0.4375 0.829251 0.829251 0.4375 1.3125 0.4375H12.6875C13.1707 0.4375 13.5625 0.829251 13.5625 1.3125V2.1875Z" fill="#171718"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_2114_22891">
                      <rect width="14" height="14" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>

                {/* Number */}
                <span className="text-sm font-medium" style={{ color: '#171718' }}>{strokeWidth}</span>
              </div>

              {/* Right side - Up and Down Chevrons */}
              <div 
                className="cursor-pointer flex flex-col"
                onClick={(e) => {
                  // Detect if user clicked on upper or lower half
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickY = e.clientY - rect.top;
                  const halfHeight = rect.height / 2;
                  
                  if (clickY < halfHeight) {
                    // Clicked upper half - increment
                    setStrokeWidth(prev => Math.min(prev + 1, 20));
                  } else {
                    // Clicked lower half - decrement
                    setStrokeWidth(prev => Math.max(prev - 1, 1));
                  }
                }}
                style={{ padding: '2px' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <mask id="path-1-inside-1_2114_22857" fill="white">
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.26071 5.79449C5.07325 5.98195 5.07325 6.28586 5.26071 6.47332C5.44817 6.66076 5.75208 6.66076 5.93954 6.47332L8.00012 4.41272L10.0607 6.47332C10.2482 6.66076 10.5521 6.66076 10.7395 6.47332C10.927 6.28586 10.927 5.98195 10.7395 5.79449L8.33954 3.39449C8.24951 3.30448 8.12742 3.25391 8.00012 3.25391C7.87282 3.25391 7.75073 3.30448 7.66071 3.39449L5.26071 5.79449ZM10.7395 10.2067C10.927 10.0192 10.927 9.71528 10.7395 9.52783C10.5521 9.34038 10.2482 9.34038 10.0607 9.52783L8.00012 11.5884L5.93954 9.52783C5.75208 9.34038 5.44817 9.34038 5.26071 9.52783C5.07325 9.71528 5.07325 10.0192 5.26071 10.2067L7.66071 12.6067C7.84817 12.7941 8.15208 12.7941 8.33954 12.6067L10.7395 10.2067Z"/>
                  </mask>
                  <path fillRule="evenodd" clipRule="evenodd" d="M5.26071 5.79449C5.07325 5.98195 5.07325 6.28586 5.26071 6.47332C5.44817 6.66076 5.75208 6.66076 5.93954 6.47332L8.00012 4.41272L10.0607 6.47332C10.2482 6.66076 10.5521 6.66076 10.7395 6.47332C10.927 6.28586 10.927 5.98195 10.7395 5.79449L8.33954 3.39449C8.24951 3.30448 8.12742 3.25391 8.00012 3.25391C7.87282 3.25391 7.75073 3.30448 7.66071 3.39449L5.26071 5.79449ZM10.7395 10.2067C10.927 10.0192 10.927 9.71528 10.7395 9.52783C10.5521 9.34038 10.2482 9.34038 10.0607 9.52783L8.00012 11.5884L5.93954 9.52783C5.75208 9.34038 5.44817 9.34038 5.26071 9.52783C5.07325 9.71528 5.07325 10.0192 5.26071 10.2067L7.66071 12.6067C7.84817 12.7941 8.15208 12.7941 8.33954 12.6067L10.7395 10.2067Z" fill="#878787"/>
                  <path d="M5.26071 5.79449L4.5536 5.08739L5.26071 5.79449ZM5.26071 6.47332L4.5536 7.18043L4.55362 7.18045L5.26071 6.47332ZM5.93954 6.47332L6.64662 7.18045L6.64664 7.18042L5.93954 6.47332ZM8.00012 4.41272L8.70723 3.70562L8.00012 2.99851L7.29301 3.70562L8.00012 4.41272ZM10.0607 6.47332L9.3536 7.18042L9.35362 7.18045L10.0607 6.47332ZM10.7395 6.47332L11.4466 7.18047L11.4467 7.18035L10.7395 6.47332ZM10.7395 5.79449L11.4467 5.08747L11.4467 5.08738L10.7395 5.79449ZM8.33954 3.39449L9.04664 2.68738L9.0466 2.68734L8.33954 3.39449ZM7.66071 3.39449L8.36782 4.1016L7.66071 3.39449ZM10.7395 10.2067L11.4467 10.9138L11.4467 10.9137L10.7395 10.2067ZM10.7395 9.52783L11.4467 8.8208L11.4466 8.82068L10.7395 9.52783ZM10.0607 9.52783L9.35362 8.8207L9.3536 8.82072L10.0607 9.52783ZM8.00012 11.5884L7.29301 12.2955L8.00012 13.0026L8.70723 12.2955L8.00012 11.5884ZM5.93954 9.52783L6.64664 8.82072L6.64662 8.8207L5.93954 9.52783ZM5.26071 9.52783L4.55362 8.8207L4.5536 8.82072L5.26071 9.52783ZM5.26071 10.2067L5.96782 9.49955L5.96782 9.49955L5.26071 10.2067ZM7.66071 12.6067L6.9536 13.3138L6.95368 13.3139L7.66071 12.6067ZM8.33954 12.6067L9.04656 13.3139L9.04664 13.3138L8.33954 12.6067ZM5.26071 5.79449L4.5536 5.08739C3.97562 5.66537 3.97562 6.60245 4.5536 7.18043L5.26071 6.47332L5.96782 5.76621C6.17088 5.96928 6.17088 6.29853 5.96782 6.5016L5.26071 5.79449ZM5.26071 6.47332L4.55362 7.18045C5.1316 7.75839 6.06865 7.75839 6.64662 7.18045L5.93954 6.47332L5.23245 5.76619C5.43551 5.56314 5.76473 5.56314 5.9678 5.76619L5.26071 6.47332ZM5.93954 6.47332L6.64664 7.18042L8.70723 5.11983L8.00012 4.41272L7.29301 3.70562L5.23243 5.76621L5.93954 6.47332ZM8.00012 4.41272L7.29301 5.11983L9.3536 7.18042L10.0607 6.47332L10.7678 5.76621L8.70723 3.70562L8.00012 4.41272ZM10.0607 6.47332L9.35362 7.18045C9.93161 7.7584 10.8686 7.75837 11.4466 7.18047L10.7395 6.47332L10.0325 5.76617C10.2355 5.56316 10.5647 5.56313 10.7678 5.76619L10.0607 6.47332ZM10.7395 6.47332L11.4467 7.18035C12.0246 6.60238 12.0246 5.66543 11.4467 5.08747L10.7395 5.79449L10.0324 6.50152C9.82936 6.29847 9.82936 5.96934 10.0324 5.76629L10.7395 6.47332ZM10.7395 5.79449L11.4467 5.08738L9.04664 2.68738L8.33954 3.39449L7.63243 4.1016L10.0324 6.5016L10.7395 5.79449ZM8.33954 3.39449L9.0466 2.68734C8.76906 2.40984 8.39265 2.25391 8.00012 2.25391V3.25391V4.25391C7.86219 4.25391 7.72995 4.19911 7.63247 4.10164L8.33954 3.39449ZM8.00012 3.25391V2.25391C7.60761 2.25391 7.23116 2.40983 6.9536 2.68739L7.66071 3.39449L8.36782 4.1016C8.27029 4.19913 8.13802 4.25391 8.00012 4.25391V3.25391ZM7.66071 3.39449L6.9536 2.68739L4.5536 5.08739L5.26071 5.79449L5.96782 6.5016L8.36782 4.1016L7.66071 3.39449ZM10.7395 10.2067L11.4467 10.9137C12.0246 10.3357 12.0246 9.39876 11.4467 8.8208L10.7395 9.52783L10.0324 10.2349C9.82936 10.0318 9.82936 9.70268 10.0324 9.49963L10.7395 10.2067ZM10.7395 9.52783L11.4466 8.82068C10.8686 8.24277 9.93161 8.24275 9.35362 8.8207L10.0607 9.52783L10.7678 10.235C10.5647 10.438 10.2355 10.438 10.0325 10.235L10.7395 9.52783ZM10.0607 9.52783L9.3536 8.82072L7.29301 10.8813L8.00012 11.5884L8.70723 12.2955L10.7678 10.2349L10.0607 9.52783ZM8.00012 11.5884L8.70723 10.8813L6.64664 8.82072L5.93954 9.52783L5.23243 10.2349L7.29301 12.2955L8.00012 11.5884ZM5.93954 9.52783L6.64662 8.8207C6.06865 8.24276 5.1316 8.24276 4.55362 8.8207L5.26071 9.52783L5.9678 10.235C5.76473 10.438 5.43551 10.438 5.23245 10.235L5.93954 9.52783ZM5.26071 9.52783L4.5536 8.82072C3.97562 9.3987 3.97562 10.3358 4.5536 10.9138L5.26071 10.2067L5.96782 9.49955C6.17088 9.70261 6.17088 10.0319 5.96782 10.2349L5.26071 9.52783ZM5.26071 10.2067L4.5536 10.9138L6.9536 13.3138L7.66071 12.6067L8.36782 11.8996L5.96782 9.49955L5.26071 10.2067ZM7.66071 12.6067L6.95368 13.3139C7.53164 13.8917 8.4686 13.8917 9.04656 13.3139L8.33954 12.6067L7.63251 11.8995C7.83556 11.6965 8.16469 11.6965 8.36774 11.8995L7.66071 12.6067ZM8.33954 12.6067L9.04664 13.3138L11.4467 10.9138L10.7395 10.2067L10.0324 9.49955L7.63243 11.8996L8.33954 12.6067Z" fill="#878787" mask="url(#path-1-inside-1_2114_22857)"/>
                </svg>
              </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Image Title */}
      <div className="flex items-center gap-3 mb-2 flex-shrink-0">
        <div className="w-9 h-9 rounded-sm" style={{ backgroundColor: '#E6E6E6' }}></div>
        <h3 className="text-sm font-medium" style={{ color: '#171718' }}>{t('panels.shapeRightPanel.uploadedImage', 'Uploaded image')}</h3>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.99967 7.33073C7.63148 7.33073 7.33301 7.62921 7.33301 7.9974C7.33301 8.36559 7.63148 8.66406 7.99967 8.66406C8.36786 8.66406 8.66634 8.36559 8.66634 7.9974C8.66634 7.62921 8.36786 7.33073 7.99967 7.33073Z" stroke="#878787" strokeWidth="1.14286" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.33301 7.33073C2.96482 7.33073 2.66634 7.62921 2.66634 7.9974C2.66634 8.36559 2.96482 8.66406 3.33301 8.66406C3.7012 8.66406 3.99967 8.36559 3.99967 7.9974C3.99967 7.62921 3.7012 7.33073 3.33301 7.33073Z" stroke="#878787" strokeWidth="1.14286" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12.6663 7.33073C12.2982 7.33073 11.9997 7.62921 11.9997 7.9974C11.9997 8.36559 12.2982 8.66406 12.6663 8.66406C13.0345 8.66406 13.333 8.36559 13.333 7.9974C13.333 7.62921 13.0345 7.33073 12.6663 7.33073Z" stroke="#878787" strokeWidth="1.14286" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <button
          className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors"
          style={{ borderColor: '#E0E0E0' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.99967 1.33203V10.6654C3.99967 11.019 4.14015 11.3581 4.3902 11.6082C4.64025 11.8582 4.97939 11.9987 5.33301 11.9987H14.6663M11.9997 14.6654V5.33203C11.9997 4.97841 11.8592 4.63927 11.6091 4.38922C11.3591 4.13917 11.02 3.9987 10.6663 3.9987H1.33301" stroke="#171718" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xs" style={{ color: '#171718' }}>{t('panels.shapeRightPanel.crop', 'Crop')}</span>
        </button>
        <button
          className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors"
          style={{ borderColor: '#E0E0E0' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 8C2 6.4087 2.63214 4.88258 3.75736 3.75736C4.88258 2.63214 6.4087 2 8 2C9.67737 2.00631 11.2874 2.66082 12.4933 3.82667L14 5.33333M14 5.33333V2M14 5.33333H10.6667M14 8C14 9.5913 13.3679 11.1174 12.2426 12.2426C11.1174 13.3679 9.5913 14 8 14C6.32263 13.9937 4.71265 13.3392 3.50667 12.1733L2 10.6667M2 10.6667H5.33333M2 10.6667V14" stroke="#171718" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xs" style={{ color: '#171718' }}>{t('panels.shapeRightPanel.replace', 'Replace')}</span>
        </button>
      </div>

      {/* Transparency Section */}
      <div className="space-y-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium" style={{ color: '#171718' }}>{t('panels.shapeRightPanel.transparency', 'Transparency')}</h3>
        </div>
        <div className="flex items-center px-3 py-2 border rounded-md bg-white" style={{ borderColor: '#E0E0E0', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_2114_29818)">
              <path opacity="0.5" fillRule="evenodd" clipRule="evenodd" d="M0 0H3.2V3.2H0V0ZM6.4 3.2H3.2V6.4H0V9.6H3.2V12.8H0V16H3.2V12.8H6.4V16H9.6V12.8H12.8V16H16V12.8H12.8V9.6H16V6.4H12.8V3.2H16V0H12.8V3.2H9.6V0H6.4V3.2ZM6.4 6.4V3.2H9.6V6.4H6.4ZM6.4 9.6H3.2V6.4H6.4V9.6ZM9.6 9.6V6.4H12.8V9.6H9.6ZM9.6 9.6H6.4V12.8H9.6V9.6Z" fill="url(#paint0_linear_2114_29818)"/>
            </g>
            <defs>
              <linearGradient id="paint0_linear_2114_29818" x1="0.269531" y1="10.6673" x2="17.2695" y2="10.6673" gradientUnits="userSpaceOnUse">
                <stop stopColor="#09090B"/>
                <stop offset="1" stopColor="#434343"/>
              </linearGradient>
              <clipPath id="clip0_2114_29818">
                <rect width="16" height="16" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          <input
            type="text"
            value={transparencyValue}
            onChange={(event) => setTransparencyValue(event.target.value)}
            className="flex-1 bg-transparent border-none text-xs focus:outline-none text-left"
            style={{ color: '#878787', textAlign: 'left' }}
          />
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="w-full mt-4 px-3 py-2 text-sm font-medium rounded-md border transition-colors hover:bg-gray-50 cursor-pointer"
        style={{ 
          backgroundColor: 'white',
          borderColor: '#E0E0E0',
          color: '#171718'
        }}
      >
        {t('panels.shapeRightPanel.close', 'Close')}
      </button>
    </>
  );
}

