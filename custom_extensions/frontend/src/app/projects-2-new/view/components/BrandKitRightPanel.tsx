"use client";

import React, { useRef, useEffect, useState } from 'react';
import { ComponentBasedSlideDeck } from '@/types/slideTemplates';
import { useLanguage } from '@/contexts/LanguageContext';
import { UpgradePlanBlock } from './UpgradePlanBlock';

type BrandColorValue = string | null;

interface BrandKitRightPanelProps {
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

  // Brand color props (optional)
  brandColors?: BrandColorValue[];
  onBrandColorChange?: (index: number, color: string) => void;
  onBrandColorRemove?: (index: number) => void;
  onColorPaletteContextChange?: (context: string) => void;
  onBrandColorsReorder?: (colors: BrandColorValue[]) => void;
}

export default function BrandKitRightPanel({
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
  brandColors: controlledBrandColors,
  onBrandColorChange,
  onBrandColorRemove,
  onColorPaletteContextChange,
  onBrandColorsReorder,
}: BrandKitRightPanelProps) {
  const { t, language } = useLanguage();
  const transitionDropdownRef = useRef<HTMLDivElement>(null);
  const brandColorButtonsRef = useRef<HTMLDivElement>(null);
  const defaultBrandColors: BrandColorValue[] = ['#9E00FF', '#0F58F9', '#EF4444', '#DED2E5', '#09090B'];
  const [internalBrandColors, setInternalBrandColors] = useState<BrandColorValue[]>(defaultBrandColors);
  const brandColors = controlledBrandColors ?? internalBrandColors;
  const [activeBrandColorIndex, setActiveBrandColorIndex] = useState<number | null>(null);
  const [activeColorToggle, setActiveColorToggle] = useState<'brand' | 'custom'>('brand');
  const reopenTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [draggedColorIndex, setDraggedColorIndex] = useState<number | null>(null);
  const colorToggleOptions = [
    { id: 'brand' as const, label: t('rightPanel.brandKit.thisSlide', 'This slide') },
    { id: 'custom' as const, label: t('rightPanel.brandKit.allSlides', 'All slides') },
  ];

  const normalizeHexColor = (value: string) => {
    if (typeof value !== 'string') {
      return value;
    }
    const hexMatch = /^#([0-9a-fA-F]{3,8})$/;
    if (!hexMatch.test(value)) {
      return value;
    }
    const [, hex] = hexMatch.exec(value) ?? [];
    return `#${hex?.toUpperCase() ?? ''}`;
  };

  const applyBrandColorsUpdate = (nextColors: BrandColorValue[]) => {
    if (!controlledBrandColors) {
      setInternalBrandColors(nextColors);
    }
    if (onBrandColorsReorder) {
      onBrandColorsReorder(nextColors);
    }
  };

  useEffect(() => {
    return () => {
      if (reopenTimeoutRef.current) {
        clearTimeout(reopenTimeoutRef.current);
        reopenTimeoutRef.current = null;
      }
    };
  }, []);

  const handleBrandColorUpdate = (index: number, color: string) => {
    const normalizedColor = normalizeHexColor(color);
    if (onBrandColorChange) {
      onBrandColorChange(index, normalizedColor);
    } else {
      setInternalBrandColors((prev) => {
        const next = [...prev];
        next[index] = normalizedColor;
        return next;
      });
    }
  };

  const handleBrandColorRemove = (index: number) => {
    if (onBrandColorRemove) {
      onBrandColorRemove(index);
    } else {
      setInternalBrandColors((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
    }
  };

  const openColorPaletteForBrandColor = (index: number) => {
    setActiveBrandColorIndex(index);

    if (rightPanelRef?.current) {
      const panelRect = rightPanelRef.current.getBoundingClientRect();
      const paletteWidth = 336; // Actual width of color palette
      const gap = 8;

      setColorPalettePosition({
        x: panelRect.left - paletteWidth - gap,
        y: panelRect.top,
      });

      if (onColorPaletteContextChange) {
        onColorPaletteContextChange(`brand-${index}`);
      }

      if (reopenTimeoutRef.current) {
        clearTimeout(reopenTimeoutRef.current);
      }

      setIsColorPaletteOpen(false);

      reopenTimeoutRef.current = setTimeout(() => {
        setIsColorPaletteOpen(true);
      }, 150);
    }
  };

  const handleColorDragStart = (index: number) => {
    setDraggedColorIndex(index);
  };

  const handleColorDragOver = (event: React.DragEvent<HTMLButtonElement>, index: number) => {
    if (draggedColorIndex === null || draggedColorIndex === index) return;
    event.preventDefault();
  };

  const handleColorDrop = (event: React.DragEvent<HTMLButtonElement>, targetIndex: number) => {
    event.preventDefault();
    if (draggedColorIndex === null || draggedColorIndex === targetIndex) {
      setDraggedColorIndex(null);
      return;
    }

    const reordered = [...brandColors];
    const [movedColor] = reordered.splice(draggedColorIndex, 1);
    reordered.splice(targetIndex, 0, movedColor ?? null);

    applyBrandColorsUpdate(reordered);
    setActiveBrandColorIndex(targetIndex);
    setDraggedColorIndex(null);
  };

  const handleColorDragEnd = () => {
    setDraggedColorIndex(null);
  };

  useEffect(() => {
    if (activeBrandColorIndex === null) return;

    const handleBrandColorSelected = (event: CustomEvent) => {
      const { context, color } = event.detail || {};
      if (typeof context === 'string' && context === `brand-${activeBrandColorIndex}` && typeof color === 'string') {
        handleBrandColorUpdate(activeBrandColorIndex, color);
      }
    };

    window.addEventListener('brand-color-selected', handleBrandColorSelected as EventListener);

    return () => {
      window.removeEventListener('brand-color-selected', handleBrandColorSelected as EventListener);
    };
  }, [activeBrandColorIndex]);

  // Close dropdowns and color palette when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (transitionDropdownRef.current && !transitionDropdownRef.current.contains(target)) {
        setShowTransitionDropdown(false);
      }

      const isInsideBrandColorButtons = brandColorButtonsRef.current?.contains(target);

      if (!isInsideBrandColorButtons) {
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
  }, [showTransitionDropdown, setShowTransitionDropdown, setIsColorPaletteOpen]);

  const transitionOptions = [
    { value: 'None', label: t('rightPanel.transitions.none', 'None') },
    { value: 'Fade', label: t('rightPanel.transitions.fade', 'Fade') },
    { value: 'Close', label: t('rightPanel.transitions.close', 'Close') },
    { value: 'Crop', label: t('rightPanel.transitions.crop', 'Crop') },
    { value: 'Blur', label: t('rightPanel.transitions.blur', 'Blur') },
    { value: 'Open', label: t('rightPanel.transitions.open', 'Open') },
    { value: 'Slide', label: t('rightPanel.transitions.slide', 'Slide') },
    { value: 'Wipe', label: t('rightPanel.transitions.wipe', 'Wipe') },
    { value: 'Smooth wipe', label: t('rightPanel.transitions.smoothWipe', 'Smooth wipe') },
  ];

  const selectedTransitionLabel =
    transitionOptions.find((option) => option.value === selectedTransition)?.label ?? selectedTransition;

  return (
    <>
      <div className="flex items-center justify-between flex-shrink-0 pb-1.5">
        <h3 className="text-md font-medium" style={{ color: '#171718' }}>
          {t('rightPanel.brandKit.title', 'Brand Kit')}
        </h3>
        <button
          type="button"
          className="p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label={t('rightPanel.brandKit.infoAriaLabel', 'Brand kit info')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#brandKitInfoClip)">
              <path d="M7.99967 10.6654V7.9987M7.99967 5.33203H8.00634M14.6663 7.9987C14.6663 11.6806 11.6816 14.6654 7.99967 14.6654C4.31778 14.6654 1.33301 11.6806 1.33301 7.9987C1.33301 4.3168 4.31778 1.33203 7.99967 1.33203C11.6816 1.33203 14.6663 4.3168 14.6663 7.9987Z" stroke="#878787" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            <defs>
              <clipPath id="brandKitInfoClip">
                <rect width="16" height="16" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-2 text-xs pb-2.5" style={{ color: '#878787' }}>
        <span>{t('rightPanel.brandKit.logos', 'Logos')}</span>
        <span>•</span>
        <span>{t('rightPanel.brandKit.colors', 'Colors')}</span>
        <span>•</span>
        <span>{t('rightPanel.brandKit.fonts', 'Fonts')}</span>
      </div>
      <div className="pb-1.5">
        <h3 className="text-sm font-medium pb-1.5" style={{ color: '#171718' }}>
          {t('rightPanel.brandKit.colors', 'Colors')}
        </h3>
        <p className="text-xs" style={{ color: '#878787' }}>
          {t('rightPanel.brandKit.colorsLimit', 'Up to 5 brand colors.')}
        </p>
      </div>
      <div ref={brandColorButtonsRef} className="space-y-2 pb-2">
        {brandColors.map((color, index) => (
          <button
            key={index}
            type="button"
            className={`w-full flex items-center justify-between px-2 py-2 text-sm border rounded-md hover:bg-gray-50 transition-colors cursor-pointer ${
              draggedColorIndex === index ? 'opacity-60' : ''
            }`}
            style={{ borderColor: '#E0E0E0', backgroundColor: '#FFFFFF', color: '#848485' }}
            onClick={() => openColorPaletteForBrandColor(index)}
            aria-label={`${t('rightPanel.brandKit.colorSlot', 'Brand color slot')} ${index + 1}`}
            draggable
            onDragStart={() => handleColorDragStart(index)}
            onDragOver={(event) => handleColorDragOver(event, index)}
            onDrop={(event) => handleColorDrop(event, index)}
            onDragEnd={handleColorDragEnd}
          >
            <div className="flex items-center gap-2">
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="1" cy="1" r="1" fill="#A5A5A5" />
                <circle cx="1" cy="5.5" r="1" fill="#A5A5A5" />
                <circle cx="1" cy="10.5" r="1" fill="#A5A5A5" />
                <circle cx="6" cy="1" r="1" fill="#A5A5A5" />
                <circle cx="6" cy="5.5" r="1" fill="#A5A5A5" />
                <circle cx="6" cy="10.5" r="1" fill="#A5A5A5" />
                <rect
                  x="0"
                  y="0"
                  width="7"
                  height="12"
                  fill="transparent"
                  onMouseDown={(event) => {
                    event.stopPropagation();
                    const target = event.currentTarget as SVGRectElement;
                    target.style.cursor = 'grabbing';
                    target.parentElement?.setAttribute('draggable', 'true');
                    handleColorDragStart(index);
                  }}
                  onMouseUp={(event) => {
                    event.stopPropagation();
                    const target = event.currentTarget as SVGRectElement;
                    target.style.cursor = 'grab';
                    target.parentElement?.setAttribute('draggable', 'false');
                  }}
                  onMouseLeave={(event) => {
                    const target = event.currentTarget as SVGRectElement;
                    target.style.cursor = 'grab';
                    target.parentElement?.setAttribute('draggable', 'false');
                  }}
                  style={{ cursor: 'grab' }}
                />
              </svg>
              <div
                className="w-5 h-5 rounded border flex items-center justify-center cursor-pointer"
                style={{
                  borderColor: '#D4D4D8',
                  backgroundColor: color ?? '#FFFFFF',
                  backgroundImage: !color
                    ? 'linear-gradient(45deg, #F3F4F6 25%, transparent 25%, transparent 75%, #F3F4F6 75%, #F3F4F6), linear-gradient(45deg, #F3F4F6 25%, transparent 25%, transparent 75%, #F3F4F6 75%, #F3F4F6)'
                    : undefined,
                  backgroundSize: !color ? '6px 6px' : undefined,
                  backgroundPosition: !color ? '0 0, 3px 3px' : undefined,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  openColorPaletteForBrandColor(index);
                }}
              />
              <span className="cursor-pointer" onClick={(e) => {
                e.stopPropagation();
                openColorPaletteForBrandColor(index);
              }}>
                {color ?? t('rightPanel.brandKit.addColor', 'Add color')}
              </span>
            </div>
            {color ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                data-brand-color-delete
                onClick={(e) => {
                  e.stopPropagation();
                  handleBrandColorRemove(index);
                }}
                style={{ cursor: 'pointer' }}
              >
                <path d="M4 5.8H17M15.5556 5.8V15.6C15.5556 16.3 14.8333 17 14.1111 17H6.88889C6.16667 17 5.44444 16.3 5.44444 15.6V5.8M7.61111 5.8V4.4C7.61111 3.7 8.33333 3 9.05556 3H11.9444C12.6667 3 13.3889 3.7 13.3889 4.4V5.8M9.05556 9.3V13.5M11.9444 9.3V13.5" stroke="#878787" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 3.33331V12.6666M12.6667 7.99998H3.33337" stroke="#878787" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ))}
      </div>
      <div className="mb-5 p-1 rounded-lg flex gap-1" style={{ backgroundColor: '#F4F4F5' }}>
        {colorToggleOptions.map((option) => {
          const isActive = activeColorToggle === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setActiveColorToggle(option.id)}
              className="flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer"
              style={{
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? '#171718' : '#878787',
                boxShadow: isActive ? '0px 1px 3px 0px #0000001A, 0px 1px 2px -1px #0000001A' : 'none',
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Scene Transition Section */}
      <div className="space-y-3 flex-shrink-0 mb-5">
          {/* Scene Transition Title and Toggle */}
          <div className="flex items-center justify-between">
            <h3 
              className="text-sm font-medium cursor-pointer" 
              style={{
                color: '#171718',
                fontSize: ['uk', 'ru'].includes(language) ? '12px' : undefined,
              }}
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
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer"
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
              className="w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
              style={{ borderColor: '#E0E0E0' }}
            >
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.9388 8.09891C11.0849 8.2452 11.085 8.48237 10.9388 8.62862L6.36642 13.201C6.22016 13.3471 5.98296 13.3471 5.83671 13.201L1.26437 8.62862C1.11812 8.48237 1.11818 8.2452 1.26437 8.09891L5.83671 3.52657C5.98298 3.3803 6.22014 3.3803 6.36642 3.52657L10.9388 8.09891ZM2.05893 8.36377L6.10156 12.4064L10.1442 8.36377L6.10156 4.32113L2.05893 8.36377Z" fill="#848485"/>
                  <path d="M8.27148 3.79297L12.7662 8.28768L8.27148 12.7824" stroke="#848485" strokeWidth="0.749119" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10.5195 3.79297L15.0142 8.28768L10.5195 12.7824" stroke="#848485" strokeWidth="0.749119" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ color: '#848485' }}>{selectedTransitionLabel}</span>
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
                {transitionOptions.map((transition) => (
                  <button
                    key={transition.value}
                    onClick={() => {
                      setSelectedTransition(transition.value);
                      setShowTransitionDropdown(false);
                    }}
                    className="w-full flex items-center justify-between px-2 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
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

      <div className="mb-5">
        <div className="flex items-center justify-between pb-1.5" style={{ height: '24px' }}>
          <h3 className="text-md font-medium" style={{ color: '#171718' }}>
            {t('rightPanel.brandKit.logos', 'Logos')}
          </h3>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.9988 6.98862C22.9986 6.98342 22.9983 6.97831 22.9977 6.97306C22.9861 6.74861 22.8953 6.53752 22.7387 6.37635C22.7372 6.37489 22.7357 6.37343 22.7343 6.37197L19.2978 2.96009C19.2955 2.95777 19.293 2.95579 19.2906 2.95356C19.2863 2.94947 19.2819 2.94544 19.2772 2.94153C19.2726 2.93762 19.2678 2.93392 19.263 2.93027C19.2602 2.92808 19.2576 2.92576 19.2547 2.92365C19.2531 2.92253 19.2515 2.92168 19.2499 2.9206C19.2448 2.91712 19.2397 2.91394 19.2345 2.91081C19.2297 2.90784 19.2249 2.90483 19.22 2.90217C19.2154 2.89963 19.2107 2.8974 19.206 2.89508C19.2003 2.89224 19.1945 2.88945 19.1887 2.88696C19.1847 2.88524 19.1805 2.88378 19.1764 2.88223C19.1698 2.87974 19.1632 2.87725 19.1566 2.87514C19.1528 2.87398 19.1489 2.87308 19.1451 2.87201C19.138 2.87007 19.131 2.86818 19.1239 2.86668C19.1199 2.86586 19.1159 2.8653 19.1118 2.86462C19.1048 2.86341 19.0979 2.86225 19.0908 2.86152C19.0863 2.86105 19.0818 2.86084 19.0773 2.86054C19.0707 2.86006 19.0641 2.85959 19.0575 2.85955C19.0562 2.85955 19.0548 2.85938 19.0535 2.85938H12.0003C11.9997 2.85938 11.9991 2.85938 11.9985 2.85938H4.94719C4.9459 2.85938 4.94461 2.85955 4.94332 2.85955C4.93654 2.85963 4.92966 2.86011 4.92287 2.86058C4.91858 2.86092 4.91424 2.86105 4.90998 2.86148C4.90276 2.86225 4.89563 2.86346 4.88846 2.86466C4.88463 2.8653 4.88068 2.86586 4.8769 2.86664C4.86968 2.8681 4.86251 2.87007 4.85533 2.87205C4.85163 2.87308 4.8479 2.87394 4.8442 2.8751C4.83746 2.87721 4.8308 2.87974 4.82409 2.88228C4.82006 2.88382 4.81602 2.88524 4.81202 2.88692C4.80609 2.88941 4.80033 2.89229 4.79449 2.89517C4.78985 2.89744 4.78525 2.89963 4.7807 2.90217C4.77571 2.90496 4.77082 2.90797 4.76583 2.91102C4.76076 2.91411 4.75569 2.91725 4.75079 2.92064C4.74916 2.92176 4.74744 2.92262 4.74585 2.92378C4.74284 2.92589 4.74022 2.92834 4.7373 2.93053C4.73258 2.93409 4.72798 2.9377 4.72342 2.94153C4.7187 2.94552 4.71427 2.9496 4.70976 2.95377C4.70744 2.95596 4.70495 2.9579 4.70271 2.96009L1.26621 6.37201C1.26479 6.37343 1.26329 6.37494 1.26187 6.3764C1.10522 6.53761 1.0143 6.74874 1.00279 6.97324C1.00227 6.97861 1.00197 6.98393 1.00167 6.98922C1.00158 6.99244 1.00107 6.99566 1.00098 6.99889C1.00094 7.00138 1.00115 7.00383 1.00111 7.00632C1.00111 7.01173 1.0012 7.01715 1.00145 7.02252C1.00193 7.23348 1.07359 7.43821 1.20619 7.60209L11.2783 20.7875C11.2808 20.7907 11.2833 20.7939 11.2859 20.7971C11.4617 21.0112 11.7213 21.1342 11.9983 21.1348H11.9984C11.9989 21.1348 11.9995 21.1349 12.0001 21.1349H12.0002H12.0004C12.001 21.1349 12.0015 21.1348 12.0021 21.1348H12.0022C12.2792 21.1342 12.5388 21.0112 12.7146 20.7971C12.7172 20.7939 12.7197 20.7907 12.7222 20.7875L17.7162 14.2496C17.8326 14.0973 17.8034 13.8797 17.6512 13.7633C17.4988 13.647 17.2811 13.6762 17.1649 13.8284L12.6434 19.7477L15.6656 8.66072L22.0155 7.4786L17.8339 12.9526C17.7176 13.1049 17.7468 13.3226 17.899 13.4389C18.0513 13.5553 18.2691 13.5261 18.3853 13.3738L22.7942 7.60222C22.9269 7.43834 22.9986 7.2334 22.999 7.02226C22.9993 7.01698 22.9994 7.01161 22.9994 7.00623C22.9994 7.00383 22.9996 7.00151 22.9996 6.9991V6.99906V6.99893C22.9995 6.99545 22.999 6.99206 22.9988 6.98862ZM12.0034 3.83122L14.8153 7.9978H9.25324L12.0034 3.83122ZM11.3557 3.55323L8.59771 7.7315L5.62042 3.55323H11.3557ZM4.90169 3.74031L7.82888 7.84832L1.86971 6.75054L4.90169 3.74031ZM1.98374 7.47706L8.33123 8.64642L11.3572 19.7478L1.98374 7.47706ZM12.0003 19.4688L9.06277 8.69166H14.9382L12.0003 19.4688ZM15.4389 7.68149L12.653 3.55319H18.3802L15.4389 7.68149ZM16.1617 7.86263L19.0989 3.74031L22.1316 6.75123L16.1617 7.86263Z" fill="#D60AFF"/>
          </svg>
        </div>

        <UpgradePlanBlock />
      </div>

      <div>
        <div className="flex items-center justify-between pb-1.5" style={{ height: '24px' }}>
          <h3 className="text-md font-medium" style={{ color: '#171718' }}>
            {t('rightPanel.brandKit.fonts', 'Fonts')}
          </h3>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.9988 6.98862C22.9986 6.98342 22.9983 6.97831 22.9977 6.97306C22.9861 6.74861 22.8953 6.53752 22.7387 6.37635C22.7372 6.37489 22.7357 6.37343 22.7343 6.37197L19.2978 2.96009C19.2955 2.95777 19.293 2.95579 19.2906 2.95356C19.2863 2.94947 19.2819 2.94544 19.2772 2.94153C19.2726 2.93762 19.2678 2.93392 19.263 2.93027C19.2602 2.92808 19.2576 2.92576 19.2547 2.92365C19.2531 2.92253 19.2515 2.92168 19.2499 2.9206C19.2448 2.91712 19.2397 2.91394 19.2345 2.91081C19.2297 2.90784 19.2249 2.90483 19.22 2.90217C19.2154 2.89963 19.2107 2.8974 19.206 2.89508C19.2003 2.89224 19.1945 2.88945 19.1887 2.88696C19.1847 2.88524 19.1805 2.88378 19.1764 2.88223C19.1698 2.87974 19.1632 2.87725 19.1566 2.87514C19.1528 2.87398 19.1489 2.87308 19.1451 2.87201C19.138 2.87007 19.131 2.86818 19.1239 2.86668C19.1199 2.86586 19.1159 2.8653 19.1118 2.86462C19.1048 2.86341 19.0979 2.86225 19.0908 2.86152C19.0863 2.86105 19.0818 2.86084 19.0773 2.86054C19.0707 2.86006 19.0641 2.85959 19.0575 2.85955C19.0562 2.85955 19.0548 2.85938 19.0535 2.85938H12.0003C11.9997 2.85938 11.9991 2.85938 11.9985 2.85938H4.94719C4.9459 2.85938 4.94461 2.85955 4.94332 2.85955C4.93654 2.85963 4.92966 2.86011 4.92287 2.86058C4.91858 2.86092 4.91424 2.86105 4.90998 2.86148C4.90276 2.86225 4.89563 2.86346 4.88846 2.86466C4.88463 2.8653 4.88068 2.86586 4.8769 2.86664C4.86968 2.8681 4.86251 2.87007 4.85533 2.87205C4.85163 2.87308 4.8479 2.87394 4.8442 2.8751C4.83746 2.87721 4.8308 2.87974 4.82409 2.88228C4.82006 2.88382 4.81602 2.88524 4.81202 2.88692C4.80609 2.88941 4.80033 2.89229 4.79449 2.89517C4.78985 2.89744 4.78525 2.89963 4.7807 2.90217C4.77571 2.90496 4.77082 2.90797 4.76583 2.91102C4.76076 2.91411 4.75569 2.91725 4.75079 2.92064C4.74916 2.92176 4.74744 2.92262 4.74585 2.92378C4.74284 2.92589 4.74022 2.92834 4.7373 2.93053C4.73258 2.93409 4.72798 2.9377 4.72342 2.94153C4.7187 2.94552 4.71427 2.9496 4.70976 2.95377C4.70744 2.95596 4.70495 2.9579 4.70271 2.96009L1.26621 6.37201C1.26479 6.37343 1.26329 6.37494 1.26187 6.3764C1.10522 6.53761 1.0143 6.74874 1.00279 6.97324C1.00227 6.97861 1.00197 6.98393 1.00167 6.98922C1.00158 6.99244 1.00107 6.99566 1.00098 6.99889C1.00094 7.00138 1.00115 7.00383 1.00111 7.00632C1.00111 7.01173 1.0012 7.01715 1.00145 7.02252C1.00193 7.23348 1.07359 7.43821 1.20619 7.60209L11.2783 20.7875C11.2808 20.7907 11.2833 20.7939 11.2859 20.7971C11.4617 21.0112 11.7213 21.1342 11.9983 21.1348H11.9984C11.9989 21.1348 11.9995 21.1349 12.0001 21.1349H12.0002H12.0004C12.001 21.1349 12.0015 21.1348 12.0021 21.1348H12.0022C12.2792 21.1342 12.5388 21.0112 12.7146 20.7971C12.7172 20.7939 12.7197 20.7907 12.7222 20.7875L17.7162 14.2496C17.8326 14.0973 17.8034 13.8797 17.6512 13.7633C17.4988 13.647 17.2811 13.6762 17.1649 13.8284L12.6434 19.7477L15.6656 8.66072L22.0155 7.4786L17.8339 12.9526C17.7176 13.1049 17.7468 13.3226 17.899 13.4389C18.0513 13.5553 18.2691 13.5261 18.3853 13.3738L22.7942 7.60222C22.9269 7.43834 22.9986 7.2334 22.999 7.02226C22.9993 7.01698 22.9994 7.01161 22.9994 7.00623C22.9994 7.00383 22.9996 7.00151 22.9996 6.9991V6.99906V6.99893C22.9995 6.99545 22.999 6.99206 22.9988 6.98862ZM12.0034 3.83122L14.8153 7.9978H9.25324L12.0034 3.83122ZM11.3557 3.55323L8.59771 7.7315L5.62042 3.55323H11.3557ZM4.90169 3.74031L7.82888 7.84832L1.86971 6.75054L4.90169 3.74031ZM1.98374 7.47706L8.33123 8.64642L11.3572 19.7478L1.98374 7.47706ZM12.0003 19.4688L9.06277 8.69166H14.9382L12.0003 19.4688ZM15.4389 7.68149L12.653 3.55319H18.3802L15.4389 7.68149ZM16.1617 7.86263L19.0989 3.74031L22.1316 6.75123L16.1617 7.86263Z" fill="#D60AFF"/>
          </svg>
        </div>

        <UpgradePlanBlock />
      </div>
    </>
  );
}


