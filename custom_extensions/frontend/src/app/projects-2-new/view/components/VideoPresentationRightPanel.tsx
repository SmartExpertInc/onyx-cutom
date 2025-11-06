"use client";

import React, { useRef, useEffect } from 'react';
import { ComponentBasedSlideDeck } from '@/types/slideTemplates';
import { useLanguage } from '@/contexts/LanguageContext';

interface VideoPresentationRightPanelProps {
  // Music props
  isMusicEnabled: boolean;
  setIsMusicEnabled: (enabled: boolean) => void;
  showMusicDropdown: boolean;
  setShowMusicDropdown: (show: boolean) => void;
  selectedMusic: string;
  setSelectedMusic: (music: string) => void;
  musicVolume: number;
  setMusicVolume: (volume: number) => void;

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
  
  // Right panel ref for positioning
  rightPanelRef?: React.RefObject<HTMLDivElement | null>;
}

export default function VideoPresentationRightPanel({
  isMusicEnabled,
  setIsMusicEnabled,
  showMusicDropdown,
  setShowMusicDropdown,
  selectedMusic,
  setSelectedMusic,
  musicVolume,
  setMusicVolume,
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
  rightPanelRef,
}: VideoPresentationRightPanelProps) {
  const { t } = useLanguage();
  const musicDropdownRef = useRef<HTMLDivElement>(null);
  const transitionDropdownRef = useRef<HTMLDivElement>(null);
  const colorButtonRef = useRef<HTMLDivElement>(null);

  // Close dropdowns and color palette when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
      if (musicDropdownRef.current && !musicDropdownRef.current.contains(target)) {
        setShowMusicDropdown(false);
      }
      if (transitionDropdownRef.current && !transitionDropdownRef.current.contains(target)) {
        setShowTransitionDropdown(false);
      }
      
      // Close color palette when clicking outside
      if (colorButtonRef.current && !colorButtonRef.current.contains(target)) {
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
  }, [showMusicDropdown, showTransitionDropdown, setShowMusicDropdown, setShowTransitionDropdown, setIsColorPaletteOpen]);

  return (
    <>
      {/* Music Section */}
      <div className="space-y-3 flex-shrink-0">
        {/* Music Title and Toggle */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium" style={{ color: '#171718' }}>{t('rightPanel.music', 'Music')}</h3>
          <button
            onClick={() => setIsMusicEnabled(!isMusicEnabled)}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
            style={{ backgroundColor: isMusicEnabled ? '#0F58F9' : '#E0E0E0' }}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                isMusicEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Music Dropdown */}
        <div ref={musicDropdownRef} className={`relative ${!isMusicEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <button
            onClick={() => setShowMusicDropdown(!showMusicDropdown)}
            disabled={!isMusicEnabled}
            className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#E0E0E0' }}
          >
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.00033 11.9987C8.00033 13.4715 6.80642 14.6654 5.33366 14.6654C3.8609 14.6654 2.66699 13.4715 2.66699 11.9987C2.66699 10.5259 3.8609 9.33203 5.33366 9.33203C6.80642 9.33203 8.00033 10.5259 8.00033 11.9987ZM8.00033 11.9987V1.33203L12.667 3.9987" stroke="#848485" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ color: '#848485' }}>{selectedMusic}</span>
            </div>
            <svg 
              className={`w-4 h-4 transition-transform ${showMusicDropdown ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="#848485" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {showMusicDropdown && isMusicEnabled && (
            <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-10" style={{ borderColor: '#E0E0E0' }}>
              <button
                onClick={() => {
                  setSelectedMusic('East London');
                  setShowMusicDropdown(false);
                }}
                className="w-full flex items-center justify-between px-2 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.00033 11.9987C8.00033 13.4715 6.80642 14.6654 5.33366 14.6654C3.8609 14.6654 2.66699 13.4715 2.66699 11.9987C2.66699 10.5259 3.8609 9.33203 5.33366 9.33203C6.80642 9.33203 8.00033 10.5259 8.00033 11.9987ZM8.00033 11.9987V1.33203L12.667 3.9987" stroke="#848485" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ color: '#848485' }}>East London</span>
                </div>
                {selectedMusic === 'East London' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3346 4L6.0013 11.3333L2.66797 8" stroke="#0F58F9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Volume Section */}
        <div className={`space-y-2 ${!isMusicEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* Volume Label and Percentage */}
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: '#848485' }}>{t('rightPanel.volume', 'Volume')}</span>
            <span className="text-xs" style={{ color: '#848485' }}>{musicVolume}%</span>
          </div>

          {/* Volume Slider */}
          <div className="relative w-full flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={musicVolume}
              disabled={!isMusicEnabled}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setMusicVolume(value);
                const percentage = value + '%';
                e.target.style.background = `linear-gradient(to right, #1058F9 0%, #1058F9 ${percentage}, #18181B33 ${percentage}, #18181B33 100%)`;
              }}
              className="w-full h-0.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
              title={`${t('rightPanel.volume', 'Volume')}: ${musicVolume}%`}
              style={{
                background: `linear-gradient(to right, #1058F9 0%, #1058F9 ${musicVolume}%, #18181B33 ${musicVolume}%, #18181B33 100%)`
              }}
            />
            <style jsx>{`
              input[type="range"]::-webkit-slider-thumb {
                appearance: none;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: white;
                cursor: pointer;
                border: 1px solid #18181B80;
              }

              input[type="range"]::-moz-range-thumb {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: white;
                cursor: pointer;
                border: 1px solid #18181B80;
              }

              input[type="range"]:focus {
                outline: none;
              }

              input[type="range"]:focus::-webkit-slider-thumb {
                box-shadow: 0 0 0 2px rgba(16, 88, 249, 0.2);
              }

              input[type="range"]:focus::-moz-range-thumb {
                box-shadow: 0 0 0 2px rgba(16, 88, 249, 0.2);
              }
            `}</style>
          </div>
        </div>

        {/* Background Section */}
        <div className="space-y-3 flex-shrink-0">
          {/* Background Title and Toggle */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium" style={{ color: '#171718' }}>{t('rightPanel.background', 'Background')}</h3>
            <button
              onClick={() => setIsBackgroundEnabled(!isBackgroundEnabled)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
              style={{ backgroundColor: isBackgroundEnabled ? '#0F58F9' : '#E0E0E0' }}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  isBackgroundEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Background Buttons */}
          <div ref={colorButtonRef} className={`space-y-2 ${!isBackgroundEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Image Button */}
            <button
              onClick={(e) => {
                const button = e.currentTarget;
                const rect = button.getBoundingClientRect();
                const modalWidth = 800;
                const modalHeight = 400;
                const gap = 10;
                
                // Calculate position to the left of the button
                let x = rect.left - modalWidth - gap;
                let y = rect.top;
                
                // Check if modal would go off the left edge
                if (x < 0) {
                  x = gap;
                }
                
                // Check if modal would go off the right edge
                if (x + modalWidth > window.innerWidth) {
                  x = window.innerWidth - modalWidth - gap;
                }
                
                // Check if modal would go off the bottom edge
                if (y + modalHeight > window.innerHeight) {
                  y = window.innerHeight - modalHeight - gap;
                }
                
                // Check if modal would go off the top edge
                if (y < 0) {
                  y = gap;
                }
                
                setMediaPopupPosition({ x, y });
                setIsMediaPopupOpen(true);
              }}
              disabled={!isBackgroundEnabled}
              className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md hover:bg-gray-50 transition-colors"
              style={{ borderColor: '#E0E0E0' }}
            >
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 10L11.9427 7.94267C11.6926 7.69271 11.3536 7.55229 11 7.55229C10.6464 7.55229 10.3074 7.69271 10.0573 7.94267L4 14M3.33333 2H12.6667C13.403 2 14 2.59695 14 3.33333V12.6667C14 13.403 13.403 14 12.6667 14H3.33333C2.59695 14 2 13.403 2 12.6667V3.33333C2 2.59695 2.59695 2 3.33333 2ZM7.33333 6C7.33333 6.73638 6.73638 7.33333 6 7.33333C5.26362 7.33333 4.66667 6.73638 4.66667 6C4.66667 5.26362 5.26362 4.66667 6 4.66667C6.73638 4.66667 7.33333 5.26362 7.33333 6Z" stroke="#848485" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ color: '#848485' }}>{t('rightPanel.none', 'None')}</span>
              </div>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 3V17M3 10H17" stroke="#848485" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Color Button */}
            <button
              onClick={(e) => {
                // Position the color palette 8px to the left of the right panel
                if (rightPanelRef?.current) {
                  const panelRect = rightPanelRef.current.getBoundingClientRect();
                  const paletteWidth = 336; // Actual width of color palette
                  const gap = 8;
                  
                  setColorPalettePosition({
                    x: panelRect.left - paletteWidth - gap,
                    y: panelRect.top
                  });
                  setIsColorPaletteOpen(true);
                }
              }}
              disabled={!isBackgroundEnabled}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm border rounded-md hover:bg-gray-50 transition-colors"
              style={{ borderColor: '#E0E0E0' }}
            >
              <div 
                className="w-4 h-4 rounded border"
                style={{ 
                  backgroundColor: backgroundColor,
                  borderColor: '#848485'
                }}
              />
              <span style={{ color: '#848485' }}>{backgroundColor.replace('#', '')}</span>
            </button>
          </div>
        </div>

        {/* Scene Transition Section */}
        <div className="space-y-3 flex-shrink-0">
          {/* Scene Transition Title and Toggle */}
          <div className="flex items-center justify-between">
            <h3 
              className="text-sm font-medium cursor-pointer" 
              style={{ color: '#171718' }}
              onClick={() => {
                // Set the first transition as active (between slide 0 and 1)
                if (componentBasedSlideDeck && componentBasedSlideDeck.slides.length > 1) {
                  setActiveTransitionIndex(0);
                  setActiveSettingsPanel('transition');
                }
              }}
              title={t('rightPanel.clickToEditTransitions', 'Click to edit transitions')}
            >
              {t('rightPanel.sceneTransition', 'Scene transition')}
            </h3>
            <button
              onClick={() => setIsTransitionEnabled(!isTransitionEnabled)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
              style={{ backgroundColor: isTransitionEnabled ? '#0F58F9' : '#E0E0E0' }}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  isTransitionEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Transition Dropdown */}
          <div ref={transitionDropdownRef} className={`relative ${!isTransitionEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <button
              onClick={() => setShowTransitionDropdown(!showTransitionDropdown)}
              disabled={!isTransitionEnabled}
              className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md hover:bg-gray-50 transition-colors"
              style={{ borderColor: '#E0E0E0' }}
            >
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.9388 8.09891C11.0849 8.2452 11.085 8.48237 10.9388 8.62862L6.36642 13.201C6.22016 13.3471 5.98296 13.3471 5.83671 13.201L1.26437 8.62862C1.11812 8.48237 1.11818 8.2452 1.26437 8.09891L5.83671 3.52657C5.98298 3.3803 6.22014 3.3803 6.36642 3.52657L10.9388 8.09891ZM2.05893 8.36377L6.10156 12.4064L10.1442 8.36377L6.10156 4.32113L2.05893 8.36377Z" fill="#848485"/>
                  <path d="M8.27148 3.79297L12.7662 8.28768L8.27148 12.7824" stroke="#848485" strokeWidth="0.749119" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10.5195 3.79297L15.0142 8.28768L10.5195 12.7824" stroke="#848485" strokeWidth="0.749119" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ color: '#848485' }}>{selectedTransition}</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-transform ${showTransitionDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="#848485" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {showTransitionDropdown && isTransitionEnabled && (
              <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-10 max-h-64 overflow-y-auto" style={{ borderColor: '#E0E0E0' }}>
                {[
                  { value: 'None', label: t('rightPanel.transitions.none', 'None') },
                  { value: 'Fade', label: t('rightPanel.transitions.fade', 'Fade') },
                  { value: 'Close', label: t('rightPanel.transitions.close', 'Close') },
                  { value: 'Crop', label: t('rightPanel.transitions.crop', 'Crop') },
                  { value: 'Blur', label: t('rightPanel.transitions.blur', 'Blur') },
                  { value: 'Open', label: t('rightPanel.transitions.open', 'Open') },
                  { value: 'Slide', label: t('rightPanel.transitions.slide', 'Slide') },
                  { value: 'Wipe', label: t('rightPanel.transitions.wipe', 'Wipe') },
                  { value: 'Smooth wipe', label: t('rightPanel.transitions.smoothWipe', 'Smooth wipe') }
                ].map((transition) => (
                  <button
                    key={transition.value}
                    onClick={() => {
                      setSelectedTransition(transition.value);
                      setShowTransitionDropdown(false);
                    }}
                    className="w-full flex items-center justify-between px-2 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.9388 8.09891C11.0849 8.2452 11.085 8.48237 10.9388 8.62862L6.36642 13.201C6.22016 13.3471 5.98296 13.3471 5.83671 13.201L1.26437 8.62862C1.11812 8.48237 1.11818 8.2452 1.26437 8.09891L5.83671 3.52657C5.98298 3.3803 6.22014 3.3803 6.36642 3.52657L10.9388 8.09891ZM2.05893 8.36377L6.10156 12.4064L10.1442 8.36377L6.10156 4.32113L2.05893 8.36377Z" fill="#848485"/>
                        <path d="M8.27148 3.79297L12.7662 8.28768L8.27148 12.7824" stroke="#848485" strokeWidth="0.749119" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10.5195 3.79297L15.0142 8.28768L10.5195 12.7824" stroke="#848485" strokeWidth="0.749119" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{ color: '#848485' }}>{transition.label}</span>
                    </div>
                    {selectedTransition === transition.value && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.3346 4L6.0013 11.3333L2.66797 8" stroke="#0F58F9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

