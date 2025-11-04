"use client";

import React, { useRef, useEffect, useState } from 'react';
import { ComponentBasedSlideDeck } from '@/types/slideTemplates';
import { useLanguage } from '@/contexts/LanguageContext';

interface AvatarRightPanelProps {
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
  
  // Close handler
  onClose: () => void;
}

export default function AvatarRightPanel({
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
  onClose,
}: AvatarRightPanelProps) {
  const { t } = useLanguage();
  const musicDropdownRef = useRef<HTMLDivElement>(null);
  const transitionDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedAlignment, setSelectedAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [selectedLayer, setSelectedLayer] = useState<'toBack' | 'backward' | 'forward' | 'toFront'>('backward');
  const [positionX, setPositionX] = useState<string>('150');
  const [positionY, setPositionY] = useState<string>('150');

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (musicDropdownRef.current && !musicDropdownRef.current.contains(event.target as Node)) {
        setShowMusicDropdown(false);
      }
      if (transitionDropdownRef.current && !transitionDropdownRef.current.contains(event.target as Node)) {
        setShowTransitionDropdown(false);
      }
    }

    if (showMusicDropdown || showTransitionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMusicDropdown, showTransitionDropdown, setShowMusicDropdown, setShowTransitionDropdown]);

  return (
    <>
      {/* Avatar Action Buttons */}
      <div className="space-y-2 flex-shrink-0 mb-4">
        {/* Add to all slides button */}
        <button
          className="w-full px-3 py-2 text-sm font-medium text-white rounded-md transition-colors"
          style={{ backgroundColor: '#0F58F9' }}
          onClick={() => {
            // TODO: Implement add to all slides functionality
            console.log('Add to all slides clicked');
          }}
        >
          {t('avatarRightPanel.addToAllSlides', 'Add to all slides')}
        </button>

        {/* Replace avatar button */}
        <button
          className="w-full px-3 py-2 text-sm font-medium rounded-md border transition-colors hover:bg-gray-50"
          style={{ 
            backgroundColor: 'white',
            borderColor: '#E0E0E0',
            color: '#848485'
          }}
          onClick={() => {
            // TODO: Implement replace avatar functionality
            console.log('Replace avatar clicked');
          }}
        >
          {t('avatarRightPanel.replaceAvatar', 'Replace avatar')}
        </button>
      </div>

      {/* Appearance Section */}
      <div className="space-y-3 flex-shrink-0">
        {/* Appearance Title */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium" style={{ color: '#171718' }}>{t('avatarRightPanel.appearance', 'Appearance')}</h3>
        </div>

        {/* Appearance Dropdown */}
        <div ref={musicDropdownRef} className="relative">
          <button
            onClick={() => setShowMusicDropdown(!showMusicDropdown)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md hover:bg-gray-50 transition-colors"
            style={{ borderColor: '#E0E0E0' }}
          >
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.00033 8.66667C9.84128 8.66667 11.3337 7.17428 11.3337 5.33333C11.3337 3.49238 9.84128 2 8.00033 2C6.15938 2 4.66699 3.49238 4.66699 5.33333C4.66699 7.17428 6.15938 8.66667 8.00033 8.66667ZM8.00033 8.66667C9.41481 8.66667 10.7714 9.22857 11.7716 10.2288C12.7718 11.229 13.3337 12.5855 13.3337 14M8.00033 8.66667C6.58584 8.66667 5.22928 9.22857 4.22909 10.2288C3.2289 11.229 2.66699 12.5855 2.66699 14" stroke="#878787" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ color: '#848485' }}>{t('avatarRightPanel.transparent', 'Transparent')}</span>
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
          {showMusicDropdown && (
            <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-10" style={{ borderColor: '#E0E0E0' }}>
              <button
                onClick={() => {
                  setShowMusicDropdown(false);
                }}
                className="w-full flex items-center justify-between px-2 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.00033 8.66667C9.84128 8.66667 11.3337 7.17428 11.3337 5.33333C11.3337 3.49238 9.84128 2 8.00033 2C6.15938 2 4.66699 3.49238 4.66699 5.33333C4.66699 7.17428 6.15938 8.66667 8.00033 8.66667ZM8.00033 8.66667C9.41481 8.66667 10.7714 9.22857 11.7716 10.2288C12.7718 11.229 13.3337 12.5855 13.3337 14M8.00033 8.66667C6.58584 8.66667 5.22928 9.22857 4.22909 10.2288C3.2289 11.229 2.66699 12.5855 2.66699 14" stroke="#878787" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ color: '#848485' }}>{t('avatarRightPanel.transparent', 'Transparent')}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.3346 4L6.0013 11.3333L2.66797 8" stroke="#0F58F9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Alignment Section */}
        <div className="space-y-3 flex-shrink-0">
          {/* Alignment Title */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium" style={{ color: '#171718' }}>{t('avatarRightPanel.alignment', 'Alignment')}</h3>
          </div>

          {/* Alignment Buttons */}
          <div className="flex gap-1 px-1 py-1.5 rounded-md" style={{ backgroundColor: '#F4F4F5' }}>
            {/* Left Alignment */}
            <button
              onClick={() => setSelectedAlignment('left')}
              className="flex-1 p-2 rounded-md transition-all flex items-center justify-center"
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
              className="flex-1 p-2 rounded-md transition-all flex items-center justify-center"
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
              className="flex-1 p-2 rounded-md transition-all flex items-center justify-center"
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
            <h3 className="text-sm font-medium" style={{ color: '#171718' }}>{t('avatarRightPanel.layer', 'Layer')}</h3>
          </div>

          {/* Layer Buttons */}
          <div className="flex gap-1 px-1 py-1.5 rounded-md" style={{ backgroundColor: '#F4F4F5' }}>
            {/* To Back */}
            <button
              onClick={() => setSelectedLayer('toBack')}
              className="flex-1 flex flex-col items-center gap-1 p-1.5 rounded-md transition-all"
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
                {t('avatarRightPanel.toBack', 'To back')}
              </span>
            </button>

            {/* Backward */}
            <button
              onClick={() => setSelectedLayer('backward')}
              className="flex-1 flex flex-col items-center gap-1 p-1.5 rounded-md transition-all"
              style={{
                backgroundColor: selectedLayer === 'backward' ? 'white' : 'transparent',
                boxShadow: selectedLayer === 'backward' ? '0px 1px 3px 0px #0000001A, 0px 1px 2px -1px #0000001A' : 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.33301 12.668V3.33464M12.6663 13.3346L5.99967 8.0013L12.6663 2.66797V13.3346Z" stroke={selectedLayer === 'backward' ? '#171718' : '#878787'} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[7px] whitespace-nowrap" style={{ color: selectedLayer === 'backward' ? '#171718' : '#878787' }}>
                {t('avatarRightPanel.backward', 'Backward')}
              </span>
            </button>

            {/* Forward */}
            <button
              onClick={() => setSelectedLayer('forward')}
              className="flex-1 flex flex-col items-center gap-1 p-1.5 rounded-md transition-all"
              style={{
                backgroundColor: selectedLayer === 'forward' ? 'white' : 'transparent',
                boxShadow: selectedLayer === 'forward' ? '0px 1px 3px 0px #0000001A, 0px 1px 2px -1px #0000001A' : 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.6663 3.33464V12.668M3.33301 2.66797L9.99967 8.0013L3.33301 13.3346V2.66797Z" stroke={selectedLayer === 'forward' ? '#171718' : '#878787'} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[7px] whitespace-nowrap" style={{ color: selectedLayer === 'forward' ? '#171718' : '#878787' }}>
                {t('avatarRightPanel.forward', 'Forward')}
              </span>
            </button>

            {/* To Front */}
            <button
              onClick={() => setSelectedLayer('toFront')}
              className="flex-1 flex flex-col items-center gap-1 p-1.5 rounded-md transition-all"
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
                {t('avatarRightPanel.toFront', 'To front')}
              </span>
            </button>
          </div>
        </div>

        {/* Position Section */}
        <div className="space-y-2 flex-shrink-0">
          {/* Position Title */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium" style={{ color: '#171718' }}>{t('avatarRightPanel.position', 'Position')}</h3>
          </div>

          {/* Position Inputs */}
          <div className="flex gap-2">
            {/* X Input */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1" style={{ color: '#171718' }}>
                {t('avatarRightPanel.xPosition', 'X')}
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
                {t('avatarRightPanel.yPosition', 'Y')}
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
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="w-full mt-4 px-3 py-2 text-sm font-medium rounded-md border transition-colors hover:bg-gray-50"
        style={{ 
          backgroundColor: 'white',
          borderColor: '#E0E0E0',
          color: '#171718'
        }}
      >
        {t('avatarRightPanel.close', 'Close')}
      </button>
    </>
  );
}

