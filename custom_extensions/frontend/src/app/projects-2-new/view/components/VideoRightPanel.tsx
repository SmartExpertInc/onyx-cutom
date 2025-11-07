"use client";

import React, { useRef, useEffect, useState } from 'react';
import { ComponentBasedSlideDeck } from '@/types/slideTemplates';
import { useLanguage } from '@/contexts/LanguageContext';

interface VideoRightPanelProps {
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
  
  // Media context
  mediaType?: 'image' | 'icon' | 'video';

  // Close handler
  onClose: () => void;
  
  // Right panel ref for positioning
  rightPanelRef?: React.RefObject<HTMLDivElement | null>;
}

export default function VideoRightPanel({
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
  mediaType = 'image',
  onClose,
  rightPanelRef,
}: VideoRightPanelProps) {
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
  type DurationOption = 'Freeze' | 'Loop' | 'Adjust' | 'Hide';
  const durationOptions: DurationOption[] = ['Freeze', 'Loop', 'Adjust', 'Hide'];
  const [selectedDurationOption, setSelectedDurationOption] = useState<DurationOption>('Loop');
  const [hoveredDurationOption, setHoveredDurationOption] = useState<DurationOption | null>(null);
  const [isDurationMenuOpen, setIsDurationMenuOpen] = useState<boolean>(false);
  const [isImageMenuOpen, setIsImageMenuOpen] = useState<boolean>(false);
  const imageMenuRef = useRef<HTMLDivElement>(null);
  const durationMenuRef = useRef<HTMLDivElement>(null);

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

      if (durationMenuRef.current && !durationMenuRef.current.contains(target)) {
        setIsDurationMenuOpen(false);
        setHoveredDurationOption(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsColorPaletteOpen, setIsDurationMenuOpen, setHoveredDurationOption]);

  const isIcon = mediaType === 'icon';
  const isVideo = mediaType === 'video';
  const uploadedAssetLabel = isIcon
    ? t('panels.imageRightPanel.uploadedIcon', 'Uploaded icon')
    : isVideo
      ? t('panels.videoRightPanel.uploadedVideo', 'Uploaded video')
      : t('panels.shapeRightPanel.uploadedImage', 'Uploaded image');
  const removeAssetLabel = isIcon
    ? t('panels.imageRightPanel.removeIcon', 'Remove icon')
    : isVideo
      ? t('panels.videoRightPanel.removeVideo', 'Remove video')
      : t('panels.imageRightPanel.removeImage', 'Remove image');

  return (
    <>
      {/* Uploaded Image Title */}
      <div className="relative flex items-center gap-3 mb-2 flex-shrink-0">
        <div className="w-9 h-9 rounded-sm" style={{ backgroundColor: '#E6E6E6' }}></div>
        <h3 className="text-sm font-medium" style={{ color: '#171718' }}>{uploadedAssetLabel}</h3>
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
            className="absolute right-0 w-40 rounded border bg-white shadow-sm space-y-2"
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
                <span>{removeAssetLabel}</span>
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
      <div className="space-y-1 mb-4 flex-shrink-0">
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

      {/* Duration Section */}
      <div className="space-y-1 mb-4 flex-shrink-0" ref={durationMenuRef}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium" style={{ color: '#171718' }}>{t('panels.videoRightPanel.duration', 'Duration')}</h3>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setIsDurationMenuOpen((prev) => {
                if (prev) {
                  setHoveredDurationOption(null);
                }
                return !prev;
              })
            }
            className="w-full flex items-center justify-between gap-2 px-3 py-2 border rounded-md bg-white"
            style={{ borderColor: '#E0E0E0' }}
          >
            <span className="text-xs" style={{ color: '#878787' }}>{selectedDurationOption}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.33301 6.0026L7.99967 10.6693L12.6663 6.0026" stroke="#878787" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {isDurationMenuOpen && (
            <div
              className="absolute left-0 right-0 mt-2 rounded border bg-white shadow-sm p-1 z-10"
              style={{ borderColor: '#E0E0E0' }}
            >
              {durationOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSelectedDurationOption(option);
                    setIsDurationMenuOpen(false);
                    setHoveredDurationOption(null);
                  }}
                  className="flex w-full items-center justify-between rounded px-2 py-1"
                  style={{
                    color: '#878787',
                    backgroundColor: hoveredDurationOption === option ? '#E0E0E0' : 'transparent',
                  }}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setHoveredDurationOption(option)}
                  onMouseLeave={() => setHoveredDurationOption(null)}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ visibility: option === selectedDurationOption ? 'visible' : 'hidden' }}
                    >
                      <path d="M3.5 8.3335L6.16667 11.0002L12.5 4.66683" stroke="#878787" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-xs">{option}</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_2114_32588)">
                      <path d="M7.99967 10.6654V7.9987M7.99967 5.33203H8.00634M14.6663 7.9987C14.6663 11.6806 11.6816 14.6654 7.99967 14.6654C4.31778 14.6654 1.33301 11.6806 1.33301 7.9987C1.33301 4.3168 4.31778 1.33203 7.99967 1.33203C11.6816 1.33203 14.6663 4.3168 14.6663 7.9987Z" stroke="#878787" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_2114_32588">
                        <rect width="16" height="16" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alignment Section */}
      <div className="space-y-1 mb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium" style={{ color: '#171718' }}>{t('panels.shapeRightPanel.alignment', 'Alignment')}</h3>
        </div>
        <div className="flex gap-1 px-1 py-1.5 rounded-md" style={{ backgroundColor: '#F4F4F5' }}>
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
      <div className="space-y-1 mb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium" style={{ color: '#171718' }}>{t('panels.shapeRightPanel.layer', 'Layer')}</h3>
        </div>
        <div className="flex gap-1 px-1 py-1.5 rounded-md" style={{ backgroundColor: '#F4F4F5' }}>
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
      <div className="space-y-1 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium" style={{ color: '#171718' }}>{t('panels.shapeRightPanel.position', 'Position')}</h3>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1" style={{ color: '#171718' }}>
              {t('panels.shapeRightPanel.xPosition', 'X')}
            </label>
            <input
              type="text"
              value={positionX}
              onChange={(e) => setPositionX(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border-none outline-none"
              style={{ backgroundColor: '#E0E0E0', color: '#171718' }}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1" style={{ color: '#171718' }}>
              {t('panels.shapeRightPanel.yPosition', 'Y')}
            </label>
            <input
              type="text"
              value={positionY}
              onChange={(e) => setPositionY(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border-none outline-none"
              style={{ backgroundColor: '#E0E0E0', color: '#171718' }}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <div className="flex-1 flex items-center">
            <span className="text-xs font-medium" style={{ color: '#171718' }}>
              {t('panels.shapeRightPanel.rotation', 'Rotation')}
            </span>
          </div>
          <div className="flex-1">
            <div className="w-full flex items-center justify-between px-3 py-2 border rounded-md" style={{ borderColor: '#E0E0E0', backgroundColor: 'white' }}>
              <div className="flex items-center gap-2.5 flex-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.19238 2.74414C9.20734 2.75487 9.21087 2.77607 9.2002 2.79102L2.23242 12.5068L1.66504 13.2979H14.3994C14.4178 13.2979 14.4326 13.3137 14.4326 13.332C14.4324 13.3503 14.4177 13.3652 14.3994 13.3652H1.59961C1.58706 13.3652 1.57595 13.3577 1.57031 13.3467C1.56474 13.3357 1.56522 13.3227 1.57227 13.3125L9.14551 2.75195C9.15616 2.73709 9.17744 2.73365 9.19238 2.74414ZM14.293 11.165C14.3114 11.165 14.3261 11.1798 14.3262 11.1982C14.3262 11.2167 14.3114 11.2314 14.293 11.2314C14.2747 11.2314 14.2598 11.2166 14.2598 11.1982C14.2598 11.1799 14.2747 11.1651 14.293 11.165ZM13.4395 9.03125C13.4578 9.03125 13.4727 9.04705 13.4727 9.06543C13.4724 9.0836 13.4577 9.09863 13.4395 9.09863C13.4213 9.09848 13.4065 9.08358 13.4062 9.06543C13.4062 9.04708 13.4212 9.0314 13.4395 9.03125ZM12.373 6.89844C12.3914 6.89844 12.4062 6.91326 12.4062 6.93164C12.4062 6.95002 12.3914 6.96484 12.373 6.96484C12.3546 6.96483 12.3398 6.95008 12.3398 6.93164C12.3398 6.91321 12.3546 6.89845 12.373 6.89844ZM11.0928 4.76465C11.111 4.76465 11.1257 4.77962 11.126 4.79785C11.126 4.8163 11.1112 4.83203 11.0928 4.83203C11.0746 4.83187 11.0596 4.81617 11.0596 4.79785C11.0598 4.77974 11.0747 4.76481 11.0928 4.76465Z" fill="#09090B" stroke="#09090B"/>
                </svg>
                <div className="flex items-center flex-1">
                  <input
                    type="text"
                    value={rotation}
                    onChange={(e) => {
                      const value = parseInt(e.target.value, 10);
                      if (!isNaN(value)) {
                        setRotation(value);
                      } else {
                        setRotation(0);
                      }
                    }}
                    className="text-sm font-medium border-none outline-none bg-transparent text-right w-full"
                    style={{ color: '#171718' }}
                  />
                  <span className="text-sm font-medium ml-0.5" style={{ color: '#171718' }}>°</span>
                </div>
              </div>
              <div
                className="cursor-pointer flex flex-col"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickY = e.clientY - rect.top;
                  const halfHeight = rect.height / 2;
                  if (clickY < halfHeight) {
                    setRotation((prev) => Math.min(prev + 1, 360));
                  } else {
                    setRotation((prev) => Math.max(prev - 1, -360));
                  }
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <mask id="path-1-inside-1_2114_22857" fill="white">
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.26071 5.79449C5.07325 5.98195 5.07325 6.28586 5.26071 6.47332C5.44817 6.66076 5.75208 6.66076 5.93954 6.47332L8.00012 4.41272L10.0607 6.47332C10.2482 6.66076 10.5521 6.66076 10.7395 6.47332C10.927 6.28586 10.927 5.98195 10.7395 5.79449L8.33954 3.39449C8.24951 3.30448 8.12742 3.25391 8.00012 3.25391C7.87282 3.25391 7.75073 3.30448 7.66071 3.39449L5.26071 5.79449ZM10.7395 10.2067C10.927 10.0192 10.927 9.71528 10.7395 9.52783C10.5521 9.34038 10.2482 9.34038 10.0607 9.52783L8.00012 11.5884L5.93954 9.52783C5.75208 9.34038 5.44817 9.34038 5.26071 9.52783C5.07325 9.71528 5.07325 10.0192 5.26071 10.2067L7.66071 12.6067C7.84817 12.7941 8.15208 12.7941 8.33954 12.6067L10.7395 10.2067Z"/>
                  </mask>
                  <path fillRule="evenodd" clipRule="evenodd" d="M5.26071 5.79449C5.07325 5.98195 5.07325 6.28586 5.26071 6.47332C5.44817 6.66076 5.75208 6.66076 5.93954 6.47332L8.00012 4.41272L10.0607 6.47332C10.2482 6.66076 10.5521 6.66076 10.7395 6.47332C10.927 6.28586 10.927 5.98195 10.7395 5.79449L8.33954 3.39449C8.24951 3.30448 8.12742 3.25391 8.00012 3.25391C7.87282 3.25391 7.75073 3.30448 7.66071 3.39449L5.26071 5.79449ZM10.7395 10.2067C10.927 10.0192 10.927 9.71528 10.7395 9.52783C10.5521 9.34038 10.2482 9.34038 10.0607 9.52783L8.00012 11.5884L5.93954 9.52783C5.75208 9.34038 5.44817 9.34038 5.26071 9.52783C5.07325 9.71528 5.07325 10.0192 5.26071 10.2067L7.66071 12.6067C7.84817 12.7941 8.15208 12.7941 8.33954 12.6067L10.7395 10.2067Z" fill="#878787"/>
                  <path d="M5.26071 5.79449L4.5536 5.08739L5.26071 5.79449ZM5.26071 6.47332L4.5536 7.18043L4.55362 7.18045L5.26071 6.47332ZM5.93954 6.47332L6.64662 7.18045L6.64664 7.18042L5.93954 6.47332ZM8.00012 4.41272L8.70723 3.70562L8.00012 2.99851L7.29301 3.70562L8.00012 4.41272ZM10.0607 6.47332L9.3536 7.18042L9.35362 7.18045L10.0607 6.47332ZM10.7395 6.47332L11.4466 7.18047L11.4467 7.18035L10.7395 6.47332ZM10.7395 5.79449L11.4467 5.08747L11.4467 5.08738L10.7395 5.79449ZM8.33954 3.39449L9.04664 2.68738L9.0466 2.68734L8.33954 3.39449ZM7.66071 3.39449L8.36782 4.1016L7.66071 3.39449ZM10.7395 10.2067L11.4467 10.9138L11.4467 10.9137L10.7395 10.2067Z" fill="#878787" mask="url(#path-1-inside-1_2114_22857)"/>
                </svg>
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


