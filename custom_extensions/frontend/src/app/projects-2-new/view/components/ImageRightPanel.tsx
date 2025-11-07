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
  const [isImageMenuOpen, setIsImageMenuOpen] = useState<boolean>(false);
  const imageMenuRef = useRef<HTMLDivElement>(null);

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

      if (imageMenuRef.current && !imageMenuRef.current.contains(target)) {
        setIsImageMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsColorPaletteOpen]);

  return (
    <>
      {/* Uploaded Image Title */}
      <div className="relative flex items-center gap-3 mb-2 flex-shrink-0">
        <div className="w-9 h-9 rounded-sm" style={{ backgroundColor: '#E6E6E6' }}></div>
        <h3 className="text-sm font-medium" style={{ color: '#171718' }}>{t('panels.shapeRightPanel.uploadedImage', 'Uploaded image')}</h3>
        <div ref={imageMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsImageMenuOpen((prev) => !prev)}
            className="flex items-center justify-center rounded"
            style={{ width: '16px', height: '16px', backgroundColor: isImageMenuOpen ? '#E0E0E0' : 'transparent' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.99967 7.33073C7.63148 7.33073 7.33301 7.62921 7.33301 7.9974C7.33301 8.36559 7.63148 8.66406 7.99967 8.66406C8.36786 8.66406 8.66634 8.36559 8.66634 7.9974C8.66634 7.62921 8.36786 7.33073 7.99967 7.33073Z" stroke="#878787" strokeWidth="1.14286" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.33301 7.33073C2.96482 7.33073 2.66634 7.62921 2.66634 7.9974C2.66634 8.36559 2.96482 8.66406 3.33301 8.66406C3.7012 8.66406 3.99967 8.36559 3.99967 7.9974C3.99967 7.62921 3.7012 7.33073 3.33301 7.33073Z" stroke="#878787" strokeWidth="1.14286" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12.6663 7.33073C12.2982 7.33073 11.9997 7.62921 11.9997 7.9974C11.9997 8.36559 12.2982 8.66406 12.6663 8.66406C13.0345 8.66406 13.333 8.36559 13.333 7.9974C13.333 7.62921 13.0345 7.33073 12.6663 7.33073Z" stroke="#878787" strokeWidth="1.14286" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {isImageMenuOpen && (
            <div
              className="absolute right-0 w-40 rounded border bg-white shadow-sm"
              style={{ borderColor: '#A5A5A5', top: 'calc(100% + 8px)' }}
            >
              <button
                type="button"
                onClick={() => setIsImageMenuOpen(false)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-gray-50"
                style={{ color: '#878787' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 8C2 9.18669 2.35189 10.3467 3.01118 11.3334C3.67047 12.3201 4.60754 13.0892 5.7039 13.5433C6.80026 13.9974 8.00666 14.1162 9.17054 13.8847C10.3344 13.6532 11.4035 13.0818 12.2426 12.2426C13.0818 11.4035 13.6532 10.3344 13.8847 9.17054C14.1162 8.00666 13.9974 6.80026 13.5433 5.7039C13.0892 4.60754 12.3201 3.67047 11.3334 3.01118C10.3467 2.35189 9.18669 2 8 2C6.32263 2.00631 4.71265 2.66082 3.50667 3.82667L2 5.33333M2 5.33333V2M2 5.33333H5.33333" stroke="#878787" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{t('panels.imageRightPanel.resetOriginalSize', 'Reset original size')}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsImageMenuOpen(false)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-gray-50"
                style={{ color: '#878787' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.2002 4.67399H13.4402M12.3024 4.67399V12.6384C12.3024 13.2073 11.7335 13.7762 11.1646 13.7762H5.47575C4.90686 13.7762 4.33797 13.2073 4.33797 12.6384V4.67399M6.04464 4.67399V3.53622C6.04464 2.96733 6.61353 2.39844 7.18242 2.39844H9.45797C10.0269 2.39844 10.5958 2.96733 10.5958 3.53622V4.67399M7.18242 7.51844V10.9318M9.45797 7.51844V10.9318" stroke="#878787" strokeWidth="0.800098" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{t('panels.imageRightPanel.removeImage', 'Remove image')}</span>
              </button>
            </div>
          )}
        </div>
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

