"use client";

import React, { useRef, useEffect, useState } from 'react';
import { ComponentBasedSlideDeck } from '@/types/slideTemplates';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();
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
    if (onBrandColorChange) {
      onBrandColorChange(index, color);
    } else {
      setInternalBrandColors((prev) => {
        const next = [...prev];
        next[index] = color;
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

  return (
    <>
      <div className="flex items-center justify-between flex-shrink-0 pb-1.5">
        <h3 className="text-md font-semibold" style={{ color: '#171718' }}>
          Brand Kit
        </h3>
        <button
          type="button"
          className="p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Brand kit info"
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
      <div className="flex items-center gap-2 text-xs pb-1.5" style={{ color: '#878787' }}>
        <span>Logos</span>
        <span>•</span>
        <span>Colors</span>
        <span>•</span>
        <span>Fonts</span>
      </div>
      <div className="pb-1.5">
        <h3 className="text-sm font-medium pb-1.5" style={{ color: '#171718' }}>
          Colors
        </h3>
        <p className="text-xs" style={{ color: '#878787' }}>
          Up to 5 brand colors.
        </p>
      </div>
      <div ref={brandColorButtonsRef} className="space-y-2 pb-2">
        {brandColors.map((color, index) => (
          <button
            key={index}
            type="button"
            className={`w-full flex items-center justify-between px-3 py-2 text-sm border rounded-md hover:bg-gray-50 transition-colors cursor-pointer ${
              draggedColorIndex === index ? 'opacity-60' : ''
            }`}
            style={{ borderColor: '#E0E0E0', backgroundColor: '#FFFFFF', color: '#848485' }}
            onClick={() => openColorPaletteForBrandColor(index)}
            aria-label={`Brand color slot ${index + 1}`}
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
      <div className="mb-2 p-1 rounded-lg flex gap-1" style={{ backgroundColor: '#F4F4F5' }}>
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
    </>
  );
}


