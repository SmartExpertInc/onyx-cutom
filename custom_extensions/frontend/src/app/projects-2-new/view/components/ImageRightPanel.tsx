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
  isAppearanceEnabled,
  setIsAppearanceEnabled,
  showAppearanceDropdown,
  setShowAppearanceDropdown,
  selectedAppearance,
  setSelectedAppearance,
  appearanceVolume,
  setAppearanceVolume,
  isBackgroundEnabled,
  setIsBackgroundEnabled,
  backgroundColor,
  setMediaPopupPosition,
  setIsMediaPopupOpen,
  setColorPalettePosition,
  setIsColorPaletteOpen,
  isTransitionEnabled,
  setIsTransitionEnabled,
  showTransitionDropdown,
  setShowTransitionDropdown,
  selectedTransition,
  setSelectedTransition,
  activeSettingsPanel,
  setActiveSettingsPanel,
  componentBasedSlideDeck,
  setActiveTransitionIndex,
  shapeColor: _shapeColor,
  onShapeColorChange: _onShapeColorChange,
  strokeColor,
  onStrokeColorChange,
  onColorPaletteContextChange,
  onClose,
  rightPanelRef,
}: ShapeRightPanelProps) {
  const { t } = useLanguage();
  const appearanceDropdownRef = useRef<HTMLDivElement>(null);
  const transitionDropdownRef = useRef<HTMLDivElement>(null);
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

  void _shapeColor;
  void _onShapeColorChange;

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
      
      if (appearanceDropdownRef.current && !appearanceDropdownRef.current.contains(target)) {
        setShowAppearanceDropdown(false);
      }
      if (transitionDropdownRef.current && !transitionDropdownRef.current.contains(target)) {
        setShowTransitionDropdown(false);
      }
      
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
  }, [showAppearanceDropdown, showTransitionDropdown, setShowAppearanceDropdown, setShowTransitionDropdown, setIsColorPaletteOpen]);

  return (
    <>
      {/* Shape Action Buttons */}
      <div ref={colorPickerRef} className="space-y-2 flex-shrink-0 mb-4">
        {/* Stroke button */}
        <button
          className={`w-full px-3 py-2 text-sm rounded-md border transition-colors hover:bg-gray-50 cursor-pointer flex items-center gap-2 ${hasStroke && selectedStrokeColor ? 'justify-between' : 'justify-center'}`}
          style={{ 
            backgroundColor: 'white',
            borderColor: '#E0E0E0',
            color: '#848485'
          }}
          onClick={(e) => {
            if (!hasStroke) {
              // If no stroke, open color palette
              // Position the color palette 8px to the left of the right panel
              if (rightPanelRef?.current) {
                const targetContext = 'stroke';
                
                // If switching context, close first, wait, then open
                if (currentColorContext && currentColorContext !== targetContext) {
                  setIsColorPaletteOpen(false);
                  setTimeout(() => {
                    const panelRect = rightPanelRef.current?.getBoundingClientRect();
                    if (panelRect) {
                      const paletteWidth = 336;
                      const gap = 8;
                      
                      setColorPalettePosition({
                        x: panelRect.left - paletteWidth - gap,
                        y: panelRect.top
                      });
                      if (onColorPaletteContextChange) {
                        onColorPaletteContextChange(targetContext);
                      }
                      setCurrentColorContext(targetContext);
                      setIsColorPaletteOpen(true);
                    }
                  }, 150);
                } else {
                  // Same context or first open
                  const panelRect = rightPanelRef.current.getBoundingClientRect();
                  const paletteWidth = 336;
                  const gap = 8;
                  
                  setColorPalettePosition({
                    x: panelRect.left - paletteWidth - gap,
                    y: panelRect.top
                  });
                  if (onColorPaletteContextChange) {
                    onColorPaletteContextChange(targetContext);
                  }
                  setCurrentColorContext(targetContext);
                  setIsColorPaletteOpen(true);
                }
              }
            }
            // If stroke exists, clicking on the square/text area should also open palette
            // The delete icon has its own click handler below
          }}
        >
          {hasStroke && selectedStrokeColor ? (
            <>
              {/* Show stroke color square and code when stroke is selected */}
              <div 
                className="flex items-center gap-2 flex-1"
                onClick={(e) => {
                  // Open color palette when clicking on stroke color area
                  e.stopPropagation();
                  // Position the color palette 8px to the left of the right panel
                  if (rightPanelRef?.current) {
                    const targetContext = 'stroke';
                    
                    // If switching context, close first, wait, then open
                    if (currentColorContext && currentColorContext !== targetContext) {
                      setIsColorPaletteOpen(false);
                      setTimeout(() => {
                        const panelRect = rightPanelRef.current?.getBoundingClientRect();
                        if (panelRect) {
                          const paletteWidth = 336;
                          const gap = 8;
                          
                          setColorPalettePosition({
                            x: panelRect.left - paletteWidth - gap,
                            y: panelRect.top
                          });
                          if (onColorPaletteContextChange) {
                            onColorPaletteContextChange(targetContext);
                          }
                          setCurrentColorContext(targetContext);
                          setIsColorPaletteOpen(true);
                        }
                      }, 150);
                    } else {
                      // Same context or first open
                      const panelRect = rightPanelRef.current.getBoundingClientRect();
                      const paletteWidth = 336;
                      const gap = 8;
                      
                      setColorPalettePosition({
                        x: panelRect.left - paletteWidth - gap,
                        y: panelRect.top
                      });
                      if (onColorPaletteContextChange) {
                        onColorPaletteContextChange(targetContext);
                      }
                      setCurrentColorContext(targetContext);
                      setIsColorPaletteOpen(true);
                    }
                  }
                }}
              >
                {/* Stroke color square */}
                <div 
                  className="w-5 h-5 rounded border"
                  style={{ 
                    backgroundColor: 'white',
                    borderColor: selectedStrokeColor
                  }}
                />
                {/* Stroke color code */}
                <span style={{ color: '#848485' }}>{selectedStrokeColor}</span>
              </div>
              {/* Delete icon */}
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                onClick={(e) => {
                  e.stopPropagation();
                  // Remove the stroke
                  setSelectedStrokeColor(null);
                  setHasStroke(false);
                  if (onStrokeColorChange) {
                    onStrokeColorChange('');
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <path d="M4 5.8H17M15.5556 5.8V15.6C15.5556 16.3 14.8333 17 14.1111 17H6.88889C6.16667 17 5.44444 16.3 5.44444 15.6V5.8M7.61111 5.8V4.4C7.61111 3.7 8.33333 3 9.05556 3H11.9444C12.6667 3 13.3889 3.7 13.3889 4.4V5.8M9.05556 9.3V13.5M11.9444 9.3V13.5" stroke="#878787" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          ) : (
            <>
              {/* Show "Add Stroke" when no stroke is selected */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="6.5" stroke="#878787"/>
                <path d="M6.99414 4V10" stroke="#878787" strokeLinecap="round"/>
                <path d="M10 6.99609L4 6.99609" stroke="#878787" strokeLinecap="round"/>
              </svg>
              {t('panels.shapeRightPanel.addStroke', 'Add Stroke')}
            </>
          )}
        </button>

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
        {/* Transparency Title */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium" style={{ color: '#171718' }}>{t('panels.shapeRightPanel.transparency', 'Transparency')}</h3>
        </div>

        {/* Transparency Dropdown */}
        <div ref={appearanceDropdownRef} className="relative">
          <button
            onClick={() => setShowAppearanceDropdown(!showAppearanceDropdown)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs border rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
            style={{ borderColor: '#E0E0E0' }}
          >
            <div className="flex items-center gap-2">
              {selectedAppearance === 'Transparent' ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.00033 8.66667C9.84128 8.66667 11.3337 7.17428 11.3337 5.33333C11.3337 3.49238 9.84128 2 8.00033 2C6.15938 2 4.66699 3.49238 4.66699 5.33333C4.66699 7.17428 6.15938 8.66667 8.00033 8.66667ZM8.00033 8.66667C9.41481 8.66667 10.7714 9.22857 11.7716 10.2288C12.7718 11.229 13.3337 12.5855 13.3337 14M8.00033 8.66667C6.58584 8.66667 5.22928 9.22857 4.22909 10.2288C3.2289 11.229 2.66699 12.5855 2.66699 14" stroke="#878787" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_2094_26857)">
                    <path d="M11.9997 13.332C11.9997 12.2712 11.5782 11.2537 10.8281 10.5036C10.078 9.75346 9.06054 9.33203 7.99967 9.33203M7.99967 9.33203C6.93881 9.33203 5.92139 9.75346 5.17125 10.5036C4.4211 11.2537 3.99967 12.2712 3.99967 13.332M7.99967 9.33203C9.47243 9.33203 10.6663 8.13812 10.6663 6.66536C10.6663 5.1926 9.47243 3.9987 7.99967 3.9987C6.52691 3.9987 5.33301 5.1926 5.33301 6.66536C5.33301 8.13812 6.52691 9.33203 7.99967 9.33203ZM14.6663 7.9987C14.6663 11.6806 11.6816 14.6654 7.99967 14.6654C4.31778 14.6654 1.33301 11.6806 1.33301 7.9987C1.33301 4.3168 4.31778 1.33203 7.99967 1.33203C11.6816 1.33203 14.6663 4.3168 14.6663 7.9987Z" stroke="#878787" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_2094_26857">
                      <rect width="16" height="16" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              )}
              <span style={{ color: '#848485' }}>
                {selectedAppearance === 'Transparent' 
                  ? t('panels.shapeRightPanel.transparent', 'Transparent')
                  : t('panels.shapeRightPanel.inCircle', 'In circle')}
              </span>
            </div>
            <svg 
              className={`w-4 h-4 transition-transform ${showAppearanceDropdown ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="#848485" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {showAppearanceDropdown && (
            <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-10 p-0.5" style={{ borderColor: '#E0E0E0' }}>
              {/* Transparent option */}
              <button
                onClick={() => {
                  setSelectedAppearance('Transparent');
                  setShowAppearanceDropdown(false);
                }}
                className="w-full flex items-center justify-between px-2 py-2 text-xs rounded-sm transition-colors cursor-pointer"
                style={{
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E0E0E0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.00033 8.66667C9.84128 8.66667 11.3337 7.17428 11.3337 5.33333C11.3337 3.49238 9.84128 2 8.00033 2C6.15938 2 4.66699 3.49238 4.66699 5.33333C4.66699 7.17428 6.15938 8.66667 8.00033 8.66667ZM8.00033 8.66667C9.41481 8.66667 10.7714 9.22857 11.7716 10.2288C12.7718 11.229 13.3337 12.5855 13.3337 14M8.00033 8.66667C6.58584 8.66667 5.22928 9.22857 4.22909 10.2288C3.2289 11.229 2.66699 12.5855 2.66699 14" stroke="#878787" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ color: '#848485' }}>{t('panels.shapeRightPanel.transparent', 'Transparent')}</span>
                </div>
                {selectedAppearance === 'Transparent' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3346 4L6.0013 11.3333L2.66797 8" stroke="#0F58F9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>

              {/* In circle option */}
              <button
                onClick={() => {
                  setSelectedAppearance('In circle');
                  setShowAppearanceDropdown(false);
                }}
                className="w-full flex items-center justify-between px-2 py-2 text-xs rounded-sm transition-colors cursor-pointer"
                style={{
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E0E0E0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_2094_26857_item)">
                      <path d="M11.9997 13.332C11.9997 12.2712 11.5782 11.2537 10.8281 10.5036C10.078 9.75346 9.06054 9.33203 7.99967 9.33203M7.99967 9.33203C6.93881 9.33203 5.92139 9.75346 5.17125 10.5036C4.4211 11.2537 3.99967 12.2712 3.99967 13.332M7.99967 9.33203C9.47243 9.33203 10.6663 8.13812 10.6663 6.66536C10.6663 5.1926 9.47243 3.9987 7.99967 3.9987C6.52691 3.9987 5.33301 5.1926 5.33301 6.66536C5.33301 8.13812 6.52691 9.33203 7.99967 9.33203ZM14.6663 7.9987C14.6663 11.6806 11.6816 14.6654 7.99967 14.6654C4.31778 14.6654 1.33301 11.6806 1.33301 7.9987C1.33301 4.3168 4.31778 1.33203 7.99967 1.33203C11.6816 1.33203 14.6663 4.3168 14.6663 7.9987Z" stroke="#878787" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_2094_26857_item">
                        <rect width="16" height="16" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                  <span style={{ color: '#848485' }}>{t('panels.shapeRightPanel.inCircle', 'In circle')}</span>
                </div>
                {selectedAppearance === 'In circle' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3346 4L6.0013 11.3333L2.66797 8" stroke="#0F58F9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Alignment Section */}
        <div className="space-y-3 flex-shrink-0">
          {/* Alignment Title */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium" style={{ color: '#171718' }}>{t('panels.shapeRightPanel.alignment', 'Alignment')}</h3>
          </div>

          {/* Alignment Buttons */}
          <div className="flex gap-1 px-1 py-1.5 rounded-md" style={{ backgroundColor: '#F4F4F5' }}>
            {/* Left Alignment */}
            <button
              onClick={() => setSelectedAlignment('left')}
              className="flex-1 p-2 rounded-md transition-all flex items-center justify-center cursor-pointer"
              style={{
                backgroundColor: selectedAlignment === 'left' ? 'white' : 'transparent',
                boxShadow: selectedAlignment === 'left' ? '0px 1px 3px 0px #0000001A, 0px 1px 2px -1px #0000001A' : 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_2114_34432)">
                  <path d="M1.33366 14.6654V1.33203M13.3337 2.66536H5.33366C4.59728 2.66536 4.00033 3.26232 4.00033 3.9987V5.33203C4.00033 6.06841 4.59728 6.66536 5.33366 6.66536H13.3337C14.07 6.66536 14.667 6.06841 14.667 5.33203V3.9987C14.667 3.26232 14.07 2.66536 13.3337 2.66536ZM8.66699 9.33203H5.33366C4.59728 9.33203 4.00033 9.92898 4.00033 10.6654V11.9987C4.00033 12.7351 4.59728 13.332 5.33366 13.332H8.66699C9.40337 13.332 10.0003 12.7351 10.0003 11.9987V10.6654C10.0003 9.92898 9.40337 9.33203 8.66699 9.33203Z" stroke={selectedAlignment === 'left' ? '#171718' : '#878787'} strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <defs>
                  <clipPath id="clip0_2114_34432">
                    <rect width="16" height="16" fill="white" transform="matrix(-1 0 0 1 16 0)"/>
                  </clipPath>
                </defs>
              </svg>
            </button>

            {/* Center Alignment */}
            <button
              onClick={() => setSelectedAlignment('center')}
              className="flex-1 p-2 rounded-md transition-all flex items-center justify-center cursor-pointer"
              style={{
                backgroundColor: selectedAlignment === 'center' ? 'white' : 'transparent',
                boxShadow: selectedAlignment === 'center' ? '0px 1px 3px 0px #0000001A, 0px 1px 2px -1px #0000001A' : 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_2114_34434)">
                  <path d="M7.99967 1.33203V14.6654M5.33301 6.66536H2.66634C2.31272 6.66536 1.97358 6.52489 1.72353 6.27484C1.47348 6.02479 1.33301 5.68565 1.33301 5.33203V3.9987C1.33301 3.26536 1.93301 2.66536 2.66634 2.66536H5.33301M10.6663 6.66536H13.333C13.6866 6.66536 14.0258 6.52489 14.2758 6.27484C14.5259 6.02479 14.6663 5.68565 14.6663 5.33203V3.9987C14.6663 3.64508 14.5259 3.30594 14.2758 3.05589C14.0258 2.80584 13.6866 2.66536 13.333 2.66536H10.6663M5.33301 13.332H4.66634C4.31272 13.332 3.97358 13.1916 3.72353 12.9415C3.47348 12.6915 3.33301 12.3523 3.33301 11.9987V10.6654C3.33301 9.93203 3.93301 9.33203 4.66634 9.33203H5.33301M10.6663 9.33203H11.333C11.6866 9.33203 12.0258 9.47251 12.2758 9.72256C12.5259 9.9726 12.6663 10.3117 12.6663 10.6654V11.9987C12.6663 12.3523 12.5259 12.6915 12.2758 12.9415C12.0258 13.1916 11.6866 13.332 11.333 13.332H10.6663" stroke={selectedAlignment === 'center' ? '#171718' : '#878787'} strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <defs>
                  <clipPath id="clip0_2114_34434">
                    <rect width="16" height="16" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </button>

            {/* Right Alignment */}
            <button
              onClick={() => setSelectedAlignment('right')}
              className="flex-1 p-2 rounded-md transition-all flex items-center justify-center cursor-pointer"
              style={{
                backgroundColor: selectedAlignment === 'right' ? 'white' : 'transparent',
                boxShadow: selectedAlignment === 'right' ? '0px 1px 3px 0px #0000001A, 0px 1px 2px -1px #0000001A' : 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_2114_34436)">
                  <path d="M14.6663 14.6654V1.33203M2.66634 2.66536H10.6663C11.4027 2.66536 11.9997 3.26232 11.9997 3.9987V5.33203C11.9997 6.06841 11.4027 6.66536 10.6663 6.66536H2.66634C1.92996 6.66536 1.33301 6.06841 1.33301 5.33203V3.9987C1.33301 3.26232 1.92996 2.66536 2.66634 2.66536ZM7.33301 9.33203H10.6663C11.4027 9.33203 11.9997 9.92898 11.9997 10.6654V11.9987C11.9997 12.7351 11.4027 13.332 10.6663 13.332H7.33301C6.59663 13.332 5.99967 12.7351 5.99967 11.9987V10.6654C5.99967 9.92898 6.59663 9.33203 7.33301 9.33203Z" stroke={selectedAlignment === 'right' ? '#171718' : '#878787'} strokeLinecap="round" strokeLinejoin="round"/>
                </g>
                <defs>
                  <clipPath id="clip0_2114_34436">
                    <rect width="16" height="16" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </button>
          </div>
        </div>

        {/* Layer Section */}
        <div className="space-y-3 flex-shrink-0">
          {/* Layer Title */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium" style={{ color: '#171718' }}>{t('panels.shapeRightPanel.layer', 'Layer')}</h3>
          </div>

          {/* Layer Buttons */}
          <div className="flex gap-1 px-1 py-1.5 rounded-md" style={{ backgroundColor: '#F4F4F5' }}>
            {/* To Back */}
            <button
              onClick={() => setSelectedLayer('toBack')}
              className="flex-1 flex flex-col items-center gap-1 p-1.5 rounded-md transition-all cursor-pointer"
              style={{
                backgroundColor: selectedLayer === 'toBack' ? 'white' : 'transparent',
                boxShadow: selectedLayer === 'toBack' ? '0px 1px 3px 0px #0000001A, 0px 1px 2px -1px #0000001A' : 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.33301 12.6654L1.33301 7.9987L7.33301 3.33203V12.6654Z" stroke={selectedLayer === 'toBack' ? '#171718' : '#878787'} strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14.6663 12.6654L8.66634 7.9987L14.6663 3.33203V12.6654Z" stroke={selectedLayer === 'toBack' ? '#171718' : '#878787'} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[7px] whitespace-nowrap" style={{ color: selectedLayer === 'toBack' ? '#171718' : '#878787' }}>
                {t('panels.shapeRightPanel.toBack', 'To back')}
              </span>
            </button>

            {/* Backward */}
            <button
              onClick={() => setSelectedLayer('backward')}
              className="flex-1 flex flex-col items-center gap-1 p-1.5 rounded-md transition-all cursor-pointer"
              style={{
                backgroundColor: selectedLayer === 'backward' ? 'white' : 'transparent',
                boxShadow: selectedLayer === 'backward' ? '0px 1px 3px 0px #0000001A, 0px 1px 2px -1px #0000001A' : 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.33301 12.668V3.33464M12.6663 13.3346L5.99967 8.0013L12.6663 2.66797V13.3346Z" stroke={selectedLayer === 'backward' ? '#171718' : '#878787'} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[7px] whitespace-nowrap" style={{ color: selectedLayer === 'backward' ? '#171718' : '#878787' }}>
                {t('panels.shapeRightPanel.backward', 'Backward')}
              </span>
            </button>

            {/* Forward */}
            <button
              onClick={() => setSelectedLayer('forward')}
              className="flex-1 flex flex-col items-center gap-1 p-1.5 rounded-md transition-all cursor-pointer"
              style={{
                backgroundColor: selectedLayer === 'forward' ? 'white' : 'transparent',
                boxShadow: selectedLayer === 'forward' ? '0px 1px 3px 0px #0000001A, 0px 1px 2px -1px #0000001A' : 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.6663 3.33464V12.668M3.33301 2.66797L9.99967 8.0013L3.33301 13.3346V2.66797Z" stroke={selectedLayer === 'forward' ? '#171718' : '#878787'} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[7px] whitespace-nowrap" style={{ color: selectedLayer === 'forward' ? '#171718' : '#878787' }}>
                {t('panels.shapeRightPanel.forward', 'Forward')}
              </span>
            </button>

            {/* To Front */}
            <button
              onClick={() => setSelectedLayer('toFront')}
              className="flex-1 flex flex-col items-center gap-1 p-1.5 rounded-md transition-all cursor-pointer"
              style={{
                backgroundColor: selectedLayer === 'toFront' ? 'white' : 'transparent',
                boxShadow: selectedLayer === 'toFront' ? '0px 1px 3px 0px #0000001A, 0px 1px 2px -1px #0000001A' : 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.66699 12.6654L14.667 7.9987L8.66699 3.33203V12.6654Z" stroke={selectedLayer === 'toFront' ? '#171718' : '#878787'} strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1.33366 12.6654L7.33366 7.9987L1.33366 3.33203V12.6654Z" stroke={selectedLayer === 'toFront' ? '#171718' : '#878787'} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[7px] whitespace-nowrap" style={{ color: selectedLayer === 'toFront' ? '#171718' : '#878787' }}>
                {t('panels.shapeRightPanel.toFront', 'To front')}
              </span>
            </button>
          </div>
        </div>

        {/* Position Section */}
        <div className="space-y-2 flex-shrink-0">
          {/* Position Title */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium" style={{ color: '#171718' }}>{t('panels.shapeRightPanel.position', 'Position')}</h3>
          </div>

          {/* Position Inputs */}
          <div className="flex gap-2">
            {/* X Input */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1" style={{ color: '#171718' }}>
                {t('panels.shapeRightPanel.xPosition', 'X')}
              </label>
              <input
                type="text"
                value={positionX}
                onChange={(e) => setPositionX(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border-none outline-none"
                style={{ 
                  backgroundColor: '#E0E0E0',
                  color: '#171718'
                }}
              />
            </div>

            {/* Y Input */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1" style={{ color: '#171718' }}>
                {t('panels.shapeRightPanel.yPosition', 'Y')}
              </label>
              <input
                type="text"
                value={positionY}
                onChange={(e) => setPositionY(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border-none outline-none"
                style={{ 
                  backgroundColor: '#E0E0E0',
                  color: '#171718'
                }}
              />
            </div>
          </div>

          {/* Rotation Control */}
          <div className="flex gap-2">
            {/* Left column - Rotation Label */}
            <div className="flex-1 flex items-center">
              <span className="text-xs font-medium" style={{ color: '#171718' }}>
                {t('panels.shapeRightPanel.rotation', 'Rotation')}
              </span>
            </div>
            
            {/* Right column - Rotation Button */}
            <div className="flex-1">
              <div className="w-full flex items-center justify-between px-3 py-2 border rounded-md" style={{ borderColor: '#E0E0E0', backgroundColor: 'white' }}>
                {/* Left side - Icon and Input with degree */}
                <div className="flex items-center gap-2.5">
                  {/* Rotation icon */}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.19238 2.74414C9.20734 2.75487 9.21087 2.77607 9.2002 2.79102L2.23242 12.5068L1.66504 13.2979H14.3994C14.4178 13.2979 14.4326 13.3137 14.4326 13.332C14.4324 13.3503 14.4177 13.3652 14.3994 13.3652H1.59961C1.58706 13.3652 1.57595 13.3577 1.57031 13.3467C1.56474 13.3357 1.56522 13.3227 1.57227 13.3125L9.14551 2.75195C9.15616 2.73709 9.17744 2.73365 9.19238 2.74414ZM14.293 11.165C14.3114 11.165 14.3261 11.1798 14.3262 11.1982C14.3262 11.2167 14.3114 11.2314 14.293 11.2314C14.2747 11.2314 14.2598 11.2166 14.2598 11.1982C14.2598 11.1799 14.2747 11.1651 14.293 11.165ZM13.4395 9.03125C13.4578 9.03125 13.4727 9.04705 13.4727 9.06543C13.4724 9.0836 13.4577 9.09863 13.4395 9.09863C13.4213 9.09848 13.4065 9.08358 13.4062 9.06543C13.4062 9.04708 13.4212 9.0314 13.4395 9.03125ZM12.373 6.89844C12.3914 6.89844 12.4062 6.91326 12.4062 6.93164C12.4062 6.95002 12.3914 6.96484 12.373 6.96484C12.3546 6.96483 12.3398 6.95008 12.3398 6.93164C12.3398 6.91321 12.3546 6.89845 12.373 6.89844ZM11.0928 4.76465C11.111 4.76465 11.1257 4.77962 11.126 4.79785C11.126 4.8163 11.1112 4.83203 11.0928 4.83203C11.0746 4.83187 11.0596 4.81617 11.0596 4.79785C11.0598 4.77974 11.0747 4.76481 11.0928 4.76465Z" fill="#09090B" stroke="#09090B"/>
                  </svg>

                  {/* Input for manual entry and degree symbol */}
                  <div className="flex items-center flex-1">
                    <input
                      type="text"
                      value={rotation}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string for editing
                        if (value === '') {
                          setRotation(0);
                          return;
                        }
                        // Parse the value and ensure it's a number
                        const numValue = parseInt(value, 10);
                        if (!isNaN(numValue)) {
                          // Wrap around 0-359 degrees
                          const wrappedValue = ((numValue % 360) + 360) % 360;
                          setRotation(wrappedValue);
                        }
                      }}
                      className="text-sm font-medium border-none outline-none bg-transparent text-right w-full"
                      style={{ color: '#171718' }}
                    />
                    <span className="text-sm font-medium ml-0.5" style={{ color: '#171718' }}>°</span>
                  </div>
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
                      setRotation(prev => (prev + 1) % 360);
                    } else {
                      // Clicked lower half - decrement
                      setRotation(prev => (prev - 1 + 360) % 360);
                    }
                  }}
                  style={{ padding: '2px' }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <mask id="path-1-inside-1_2114_22857_rotation" fill="white">
                      <path fillRule="evenodd" clipRule="evenodd" d="M5.26071 5.79449C5.07325 5.98195 5.07325 6.28586 5.26071 6.47332C5.44817 6.66076 5.75208 6.66076 5.93954 6.47332L8.00012 4.41272L10.0607 6.47332C10.2482 6.66076 10.5521 6.66076 10.7395 6.47332C10.927 6.28586 10.927 5.98195 10.7395 5.79449L8.33954 3.39449C8.24951 3.30448 8.12742 3.25391 8.00012 3.25391C7.87282 3.25391 7.75073 3.30448 7.66071 3.39449L5.26071 5.79449ZM10.7395 10.2067C10.927 10.0192 10.927 9.71528 10.7395 9.52783C10.5521 9.34038 10.2482 9.34038 10.0607 9.52783L8.00012 11.5884L5.93954 9.52783C5.75208 9.34038 5.44817 9.34038 5.26071 9.52783C5.07325 9.71528 5.07325 10.0192 5.26071 10.2067L7.66071 12.6067C7.84817 12.7941 8.15208 12.7941 8.33954 12.6067L10.7395 10.2067Z"/>
                    </mask>
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.26071 5.79449C5.07325 5.98195 5.07325 6.28586 5.26071 6.47332C5.44817 6.66076 5.75208 6.66076 5.93954 6.47332L8.00012 4.41272L10.0607 6.47332C10.2482 6.66076 10.5521 6.66076 10.7395 6.47332C10.927 6.28586 10.927 5.98195 10.7395 5.79449L8.33954 3.39449C8.24951 3.30448 8.12742 3.25391 8.00012 3.25391C7.87282 3.25391 7.75073 3.30448 7.66071 3.39449L5.26071 5.79449ZM10.7395 10.2067C10.927 10.0192 10.927 9.71528 10.7395 9.52783C10.5521 9.34038 10.2482 9.34038 10.0607 9.52783L8.00012 11.5884L5.93954 9.52783C5.75208 9.34038 5.44817 9.34038 5.26071 9.52783C5.07325 9.71528 5.07325 10.0192 5.26071 10.2067L7.66071 12.6067C7.84817 12.7941 8.15208 12.7941 8.33954 12.6067L10.7395 10.2067Z" fill="#878787"/>
                    <path d="M5.26071 5.79449L4.5536 5.08739L5.26071 5.79449ZM5.26071 6.47332L4.5536 7.18043L4.55362 7.18045L5.26071 6.47332ZM5.93954 6.47332L6.64662 7.18045L6.64664 7.18042L5.93954 6.47332ZM8.00012 4.41272L8.70723 3.70562L8.00012 2.99851L7.29301 3.70562L8.00012 4.41272ZM10.0607 6.47332L9.3536 7.18042L9.35362 7.18045L10.0607 6.47332ZM10.7395 6.47332L11.4466 7.18047L11.4467 7.18035L10.7395 6.47332ZM10.7395 5.79449L11.4467 5.08747L11.4467 5.08738L10.7395 5.79449ZM8.33954 3.39449L9.04664 2.68738L9.0466 2.68734L8.33954 3.39449ZM7.66071 3.39449L8.36782 4.1016L7.66071 3.39449ZM10.7395 10.2067L11.4467 10.9138L11.4467 10.9137L10.7395 10.2067ZM10.7395 9.52783L11.4467 8.8208L11.4466 8.82068L10.7395 9.52783ZM10.0607 9.52783L9.35362 8.8207L9.3536 8.82072L10.0607 9.52783ZM8.00012 11.5884L7.29301 12.2955L8.00012 13.0026L8.70723 12.2955L8.00012 11.5884ZM5.93954 9.52783L6.64664 8.82072L6.64662 8.8207L5.93954 9.52783ZM5.26071 9.52783L4.55362 8.8207L4.5536 8.82072L5.26071 9.52783ZM5.26071 10.2067L5.96782 9.49955L5.96782 9.49955L5.26071 10.2067ZM7.66071 12.6067L6.9536 13.3138L6.95368 13.3139L7.66071 12.6067ZM8.33954 12.6067L9.04656 13.3139L9.04664 13.3138L8.33954 12.6067ZM5.26071 5.79449L4.5536 5.08739C3.97562 5.66537 3.97562 6.60245 4.5536 7.18043L5.26071 6.47332L5.96782 5.76621C6.17088 5.96928 6.17088 6.29853 5.96782 6.5016L5.26071 5.79449ZM5.26071 6.47332L4.55362 7.18045C5.1316 7.75839 6.06865 7.75839 6.64662 7.18045L5.93954 6.47332L5.23245 5.76619C5.43551 5.56314 5.76473 5.56314 5.9678 5.76619L5.26071 6.47332ZM5.93954 6.47332L6.64664 7.18042L8.70723 5.11983L8.00012 4.41272L7.29301 3.70562L5.23243 5.76621L5.93954 6.47332ZM8.00012 4.41272L7.29301 5.11983L9.3536 7.18042L10.0607 6.47332L10.7678 5.76621L8.70723 3.70562L8.00012 4.41272ZM10.0607 6.47332L9.35362 7.18045C9.93161 7.7584 10.8686 7.75837 11.4466 7.18047L10.7395 6.47332L10.0325 5.76617C10.2355 5.56316 10.5647 5.56313 10.7678 5.76619L10.0607 6.47332ZM10.7395 6.47332L11.4467 7.18035C12.0246 6.60238 12.0246 5.66543 11.4467 5.08747L10.7395 5.79449L10.0324 6.50152C9.82936 6.29847 9.82936 5.96934 10.0324 5.76629L10.7395 6.47332ZM10.7395 5.79449L11.4467 5.08738L9.04664 2.68738L8.33954 3.39449L7.63243 4.1016L10.0324 6.5016L10.7395 5.79449ZM8.33954 3.39449L9.0466 2.68734C8.76906 2.40984 8.39265 2.25391 8.00012 2.25391V3.25391V4.25391C7.86219 4.25391 7.72995 4.19911 7.63247 4.10164L8.33954 3.39449ZM8.00012 3.25391V2.25391C7.60761 2.25391 7.23116 2.40983 6.9536 2.68739L7.66071 3.39449L8.36782 4.1016C8.27029 4.19913 8.13802 4.25391 8.00012 4.25391V3.25391ZM7.66071 3.39449L6.9536 2.68739L4.5536 5.08739L5.26071 5.79449L5.96782 6.5016L8.36782 4.1016L7.66071 3.39449ZM10.7395 10.2067L11.4467 10.9137C12.0246 10.3357 12.0246 9.39876 11.4467 8.8208L10.7395 9.52783L10.0324 10.2349C9.82936 10.0318 9.82936 9.70268 10.0324 9.49963L10.7395 10.2067ZM10.7395 9.52783L11.4466 8.82068C10.8686 8.24277 9.93161 8.24275 9.35362 8.8207L10.0607 9.52783L10.7678 10.235C10.5647 10.438 10.2355 10.438 10.0325 10.235L10.7395 9.52783ZM10.0607 9.52783L9.3536 8.82072L7.29301 10.8813L8.00012 11.5884L8.70723 12.2955L10.7678 10.2349L10.0607 9.52783ZM8.00012 11.5884L8.70723 10.8813L6.64664 8.82072L5.93954 9.52783L5.23243 10.2349L7.29301 12.2955L8.00012 11.5884ZM5.93954 9.52783L6.64662 8.8207C6.06865 8.24276 5.1316 8.24276 4.55362 8.8207L5.26071 9.52783L5.9678 10.235C5.76473 10.438 5.43551 10.438 5.23245 10.235L5.93954 9.52783ZM5.26071 9.52783L4.5536 8.82072C3.97562 9.3987 3.97562 10.3358 4.5536 10.9138L5.26071 10.2067L5.96782 9.49955C6.17088 9.70261 6.17088 10.0319 5.96782 10.2349L5.26071 9.52783ZM5.26071 10.2067L4.5536 10.9138L6.9536 13.3138L7.66071 12.6067L8.36782 11.8996L5.96782 9.49955L5.26071 10.2067ZM7.66071 12.6067L6.95368 13.3139C7.53164 13.8917 8.4686 13.8917 9.04656 13.3139L8.33954 12.6067L7.63251 11.8995C7.83556 11.6965 8.16469 11.6965 8.36774 11.8995L7.66071 12.6067ZM8.33954 12.6067L9.04664 13.3138L11.4467 10.9138L10.7395 10.2067L10.0324 9.49955L7.63243 11.8996L8.33954 12.6067Z" fill="#878787" mask="url(#path-1-inside-1_2114_22857_rotation)"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
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

