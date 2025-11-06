'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";

interface ColorPalettePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onColorChange: (color: string) => void;
  selectedColor?: string;
  position?: { x: number; y: number };
  recentColors?: string[];
  onRecentColorChange?: (colors: string[]) => void;
}

interface HSB {
  h: number; // 0-360
  s: number; // 0-100
  b: number; // 0-100
}

interface RGBA {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a: number; // 0-1
}

interface HSLA {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
  a: number; // 0-1
}

type ColorFormat = 'HEX' | 'RGB' | 'HSL' | 'HSB';

// Color conversion utility functions
function hexToHsb(hex: string): HSB {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  if (diff !== 0) {
    if (max === r) h = ((g - b) / diff) % 6;
    else if (max === g) h = (b - r) / diff + 2;
    else h = (r - g) / diff + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : Math.round((diff / max) * 100);
  const brightness = Math.round(max * 100);

  return { h, s, b: brightness };
}

function hsbToHex({ h, s, b }: HSB): string {
  const sDec = s / 100;
  const bDec = b / 100;

  const c = bDec * sDec;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = bDec - c;

  let r = 0, g = 0, bl = 0;
  if (h >= 0 && h < 60) { r = c; g = x; }
  else if (h >= 60 && h < 120) { r = x; g = c; }
  else if (h >= 120 && h < 180) { g = c; bl = x; }
  else if (h >= 180 && h < 240) { g = x; bl = c; }
  else if (h >= 240 && h < 300) { r = x; bl = c; }
  else { r = c; bl = x; }

  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  const bHex = Math.round((bl + m) * 255).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

function hexToRgba(hex: string): RGBA {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b, a: 1 };
}

function rgbaToHex({ r, g, b, a }: RGBA): string {
  const rHex = Math.round(r).toString(16).padStart(2, '0');
  const gHex = Math.round(g).toString(16).padStart(2, '0');
  const bHex = Math.round(b).toString(16).padStart(2, '0');
  return `#${rHex}${gHex}${bHex}`;
}

function hexToHsla(hex: string): HSLA {
  const { h, s, b } = hexToHsb(hex);
  // Convert brightness to lightness
  const l = b * 0.5; // Simplified conversion
  return { h, s, l, a: 1 };
}

function hslaToHex({ h, s, l, a }: HSLA): string {
  // Convert lightness back to brightness for HSB
  const b = l * 2; // Simplified conversion
  return hsbToHex({ h, s, b });
}

// Consolidated color state interface
interface ColorState {
  hsb: HSB;
  hex: string;
  rgba: RGBA;
  hsla: HSLA;
  opacity: number;
}

// Color utility functions
const colorUtils = {
  hexToHsb,
  hsbToHex,
  hexToRgba,
  rgbaToHex,
  hexToHsla,
  hslaToHex,
  
  // New utility to update all formats from HSB
  updateFromHsb: (hsb: HSB, opacity: number): ColorState => {
    const hex = hsbToHex(hsb);
    const rgba = { ...hexToRgba(hex), a: opacity };
    const hsla = { ...hexToHsla(hex), a: opacity };
    return { hsb, hex, rgba, hsla, opacity };
  },
  
  // New utility to update all formats from HEX
  updateFromHex: (hex: string, opacity: number): ColorState => {
    const hsb = hexToHsb(hex);
    const rgba = { ...hexToRgba(hex), a: opacity };
    const hsla = { ...hexToHsla(hex), a: opacity };
    return { hsb, hex, rgba, hsla, opacity };
  },
  
  // New utility to update all formats from RGBA
  updateFromRgba: (rgba: RGBA): ColorState => {
    const hex = rgbaToHex(rgba);
    const hsb = hexToHsb(hex);
    const hsla = { ...hexToHsla(hex), a: rgba.a };
    return { hsb, hex, rgba, hsla, opacity: rgba.a };
  },
  
  // New utility to update all formats from HSLA
  updateFromHsla: (hsla: HSLA): ColorState => {
    const hex = hslaToHex(hsla);
    const hsb = hexToHsb(hex);
    const rgba = { ...hexToRgba(hex), a: hsla.a };
    return { hsb, hex, rgba, hsla, opacity: hsla.a };
  }
};

// Custom Slider Component
interface CustomSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  onChangeCommitted: (value: number) => void;
  background?: string;
  height?: number;
  width?: string;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  onChangeCommitted,
  background,
  height = 6,
  width = '100%'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPercentage = () => {
    return ((value - min) / (max - min)) * 100;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    handleMouseMove(e);
  };

  const handleMouseMove = (e: MouseEvent | React.MouseEvent) => {
    if (!isDragging && !('clientX' in e)) return;
    
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const newValue = min + (percentage / 100) * (max - min);
      const steppedValue = Math.round(newValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));
      
      onChange(clampedValue);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onChangeCommitted(value);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, value]);

  return (
    <div
      ref={sliderRef}
      className="relative cursor-pointer overflow-hidden"
      style={{
        width: width,
        height: height,
        borderRadius: height / 2,
        background: background || '#e0e0e0'
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Track */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius: height / 2,
          background: background || '#e0e0e0'
        }}
      />
      
      {/* Thumb */}
      <div
        className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-md cursor-pointer z-20"
        style={{
          left: `${getPercentage()}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
    </div>
  );
};

// Vertical Slider Component
interface VerticalSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  onChangeCommitted: (value: number) => void;
  background?: string;
  width?: number;
  height?: number;
  thumbColor?: string;
}

const VerticalSlider: React.FC<VerticalSliderProps> = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  onChangeCommitted,
  background,
  width = 14,
  height = 100,
  thumbColor
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPercentage = () => {
    return ((value - min) / (max - min)) * 100;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    handleMouseMove(e);
  };

  const handleMouseMove = (e: MouseEvent | React.MouseEvent) => {
    if (!isDragging && !('clientY' in e)) return;
    
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const percentage = Math.max(0, Math.min(100, (y / rect.height) * 100));
      const newValue = min + (percentage / 100) * (max - min);
      const steppedValue = Math.round(newValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));
      
      onChange(clampedValue);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onChangeCommitted(value);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, value]);

  return (
    <div
      ref={sliderRef}
      className="relative cursor-pointer overflow-hidden"
      style={{
        width: width,
        height: height,
        borderRadius: width / 2,
        background: background || '#e0e0e0'
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Track */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius: width / 2,
          background: background || '#e0e0e0'
        }}
      />
      
      {/* Thumb */}
      <div
        className="absolute pointer-events-none z-20"
        style={{
          top: `${getPercentage()}%`,
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Outer white border ring */}
        <div className="w-[14px] h-[14px] rounded-full border-[4px] border-white bg-transparent" />
        {/* Inner colored dot */}
        {thumbColor && (
          <div
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: thumbColor,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
      </div>
    </div>
  );
};

const ColorPalettePopup: React.FC<ColorPalettePopupProps> = ({
  isOpen,
  onClose,
  onColorChange,
  selectedColor = "#ff0000",
  position,
  recentColors = [],
  onRecentColorChange,
}) => {
  // Single consolidated color state
  const [colorState, setColorState] = useState<ColorState>(() => 
    colorUtils.updateFromHex(selectedColor, 1)
  );
  
  const [colorFormat, setColorFormat] = useState<ColorFormat>('HEX');
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [justSetByUser, setJustSetByUser] = useState(false);
  
  const sbRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = React.useState<{ x: number; y: number } | null>(position || null);

  // Simplified update functions
  const updateColorFromHsb = useCallback((newHsb: HSB) => {
    setColorState(prev => colorUtils.updateFromHsb(newHsb, prev.opacity));
  }, []);

  const updateColorFromHex = useCallback((newHex: string) => {
    setColorState(prev => colorUtils.updateFromHex(newHex, prev.opacity));
  }, []);

  const updateColorFromRgba = useCallback((newRgba: RGBA) => {
    setColorState(colorUtils.updateFromRgba(newRgba));
  }, []);

  const updateColorFromHsla = useCallback((newHsla: HSLA) => {
    setColorState(colorUtils.updateFromHsla(newHsla));
  }, []);

  const updateOpacity = useCallback((newOpacity: number) => {
    setColorState(prev => ({
      ...prev,
      opacity: newOpacity,
      rgba: { ...prev.rgba, a: newOpacity },
      hsla: { ...prev.hsla, a: newOpacity }
    }));
  }, []);

  // Viewport positioning logic (same as OptionPopup)
  useEffect(() => {
    if (isOpen && position) {
      // Set initial position immediately
      setAdjustedPosition(position);
      
      // Then refine position after popup is rendered
      const timer = setTimeout(() => {
        if (popupRef.current) {
          const popup = popupRef.current;
          const rect = popup.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          let newX = position.x;
          let newY = position.y;
          
          // Check if popup goes beyond right edge
          if (position.x + rect.width > viewportWidth) {
            newX = viewportWidth - rect.width - 4; // 4px margin
          }
          
          // Check if popup goes beyond bottom edge
          if (position.y + rect.height > viewportHeight) {
            newY = position.y - rect.height; // Show above the click point
          }
          
          // Ensure popup doesn't go beyond left edge
          if (newX < 4) {
            newX = 4;
          }
          
          // Ensure popup doesn't go beyond top edge
          if (newY < 4) {
            newY = 4;
          }
          
          setAdjustedPosition({ x: newX, y: newY });
        }
      }, 0);
      
      return () => clearTimeout(timer);
    } else {
      setAdjustedPosition(null);
    }
  }, [isOpen, position]);

  // Update all color formats when HSB changes (from slider/square)
  useEffect(() => {
    if (!isUserTyping && !isDragging && !justSetByUser) {
      const newHex = hsbToHex(colorState.hsb);
      if (newHex !== colorState.hex) {
        updateColorFromHex(newHex);
        onColorChange(newHex);
      }
    }
    // Reset the flag after the effect runs
    if (justSetByUser) {
      setJustSetByUser(false);
    }
  }, [colorState.hsb, onColorChange, colorState.hex, isUserTyping, isDragging, justSetByUser, updateColorFromHex]);

  // --- Input handlers ---
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const value = e.target.value;
    setIsUserTyping(true);
    setColorState(prev => ({ ...prev, hex: value }));
  };

  const handleHexKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsUserTyping(false);
      setJustSetByUser(true); // Flag that hex was just set by user
      const value = e.currentTarget.value;
      // Only update other formats if we have a complete valid HEX code
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        updateColorFromHex(value);
        onColorChange(value);
        // Add the new color to recent colors
        addToRecentColors(value);
      }
    }
  };

  const handleHexBlur = () => {
    setIsUserTyping(false);
    setJustSetByUser(true); // Flag that hex was just set by user
    // Update other formats if we have a complete valid HEX code
    if (/^#[0-9A-Fa-f]{6}$/.test(colorState.hex)) {
      updateColorFromHex(colorState.hex);
      onColorChange(colorState.hex);
      // Add the new color to recent colors
      addToRecentColors(colorState.hex);
    }
  };

  const handleRgbaChange = (field: keyof RGBA) => (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const inputValue = e.target.value;
    
    // For alpha field, allow decimal input
    if (field === 'a') {
      // Allow empty string, numbers, and decimal points
      if (inputValue === '' || /^[0-9]*\.?[0-9]*$/.test(inputValue)) {
        setIsUserTyping(true);
        const value = parseFloat(inputValue);
        const newRgba = { ...colorState.rgba, [field]: isNaN(value) ? 0 : value };
        setColorState(prev => ({ ...prev, rgba: newRgba }));
      }
    } else {
      // For RGB fields, only allow integers
      const value = parseFloat(inputValue);
      if (!isNaN(value)) {
        setIsUserTyping(true);
        const newRgba = { ...colorState.rgba, [field]: value };
        setColorState(prev => ({ ...prev, rgba: newRgba }));
      }
    }
  };

  const handleRgbaKeyDown = (field: keyof RGBA) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsUserTyping(false);
      const value = parseFloat(e.currentTarget.value);
      if (!isNaN(value)) {
        const newRgba = { ...colorState.rgba, [field]: value };
        updateColorFromRgba(newRgba);
        onColorChange(colorState.hex);
        // Add the new color to recent colors
        addToRecentColors(colorState.hex);
      }
    }
  };

  const handleHslaChange = (field: keyof HSLA) => (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const inputValue = e.target.value;
    
    // For alpha field, allow decimal input
    if (field === 'a') {
      // Allow empty string, numbers, and decimal points
      if (inputValue === '' || /^[0-9]*\.?[0-9]*$/.test(inputValue)) {
        setIsUserTyping(true);
        const value = parseFloat(inputValue);
        const newHsla = { ...colorState.hsla, [field]: isNaN(value) ? 0 : value };
        setColorState(prev => ({ ...prev, hsla: newHsla }));
      }
    } else {
      // For HSL fields, only allow integers
      const value = parseFloat(inputValue);
      if (!isNaN(value)) {
        setIsUserTyping(true);
        const newHsla = { ...colorState.hsla, [field]: value };
        setColorState(prev => ({ ...prev, hsla: newHsla }));
      }
    }
  };

  const handleHslaKeyDown = (field: keyof HSLA) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsUserTyping(false);
      const value = parseFloat(e.currentTarget.value);
      if (!isNaN(value)) {
        const newHsla = { ...colorState.hsla, [field]: value };
        updateColorFromHsla(newHsla);
        onColorChange(colorState.hex);
        // Add the new color to recent colors
        addToRecentColors(colorState.hex);
      }
    }
  };

  // Handle input field clicks to ensure they're accessible
  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Add color to recent colors
  const addToRecentColors = (color: string) => {
    if (!onRecentColorChange) return;
    
    // Validate that we have a valid color
    if (!color || color.length < 3) return;
    
    const updatedRecentColors = [
      color,
      ...recentColors.filter(c => c !== color) // Remove if already exists
    ].slice(0, 9); // Keep only 9 colors
    
    onRecentColorChange(updatedRecentColors);
  };

  // Handle recent color click
  const handleRecentColorClick = (color: string) => {
    updateColorFromHex(color);
    onColorChange(color);
  };

  // --- Hue slider ---
  const handleHueChange = (value: number) => {
    // Set dragging state on first change
    if (!isDragging) {
      setIsDragging(true);
    }
    
    const newHsb = { ...colorState.hsb, h: value };
    updateColorFromHsb(newHsb);
    // Don't call onColorChange during dragging - only when dragging ends
  };

  const handleHueChangeCommitted = (value: number) => {
    // This is called when the user finishes dragging the hue slider
    setIsDragging(false);
    // Pass the color with current opacity to the parent component when dragging ends
    onColorChange(colorState.hex);
  };

  // --- Opacity slider ---
  const handleOpacityChange = (value: number) => {
    // Set dragging state on first change
    if (!isDragging) {
      setIsDragging(true);
    }
    
    updateOpacity(value);
    // Don't call onColorChange during dragging - only when dragging ends
  };

  const handleOpacityChangeCommitted = (value: number) => {
    // This is called when the user finishes dragging the opacity slider
    setIsDragging(false);
    // Pass the color with current opacity to the parent component when dragging ends
    onColorChange(colorState.hex);
  };

  // --- Saturation/Brightness square ---
  const handleSBUpdate = useCallback((clientX: number, clientY: number) => {
    if (!sbRef.current) return;
    const rect = sbRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const newHsb = {
      ...colorState.hsb,
      s: Math.round(x * 100),
      b: Math.round((1 - y) * 100)
    };
    updateColorFromHsb(newHsb);
    // Don't call onColorChange during dragging - only when dragging ends
  }, [colorState.hsb, updateColorFromHsb]);

  const handleMouseDown = (e: React.MouseEvent) => {
    console.log('🎨 SATURATION SQUARE MOUSEDOWN');
    // Only start dragging if clicking on the saturation square
    if (sbRef.current && sbRef.current.contains(e.target as Node)) {
      e.stopPropagation();
      e.preventDefault();
      isDraggingRef.current = true;
      setIsDragging(true);
      handleSBUpdate(e.clientX, e.clientY);
      console.log('🎨 SATURATION SQUARE DRAG STARTED');
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Only update if we're actually dragging
    if (isDraggingRef.current) {
      handleSBUpdate(e.clientX, e.clientY);
    }
  }, [handleSBUpdate]);

  const handleMouseUp = useCallback((e?: MouseEvent) => { 
    // Only process if we were actually dragging
    if (isDraggingRef.current) {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      isDraggingRef.current = false; 
      setIsDragging(false);
      // Pass the color with current opacity to the parent component when dragging ends
      console.log('🎨 MOUSE UP - CALLING ONCOLORCHANGE WITH:', colorState.hex);
      onColorChange(colorState.hex);
      // Add the current color to recent colors when dragging the saturation/brightness square ends
      addToRecentColors(colorState.hex);
    }
  }, [colorState.hex, onColorChange, addToRecentColors]);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp, true); // Use capture phase
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp, true);
    };
  }, [handleMouseMove, handleMouseUp]);

  if (!isOpen || !adjustedPosition) return null;

  return (
    <>      
      {/* Color picker popup */}
      <div
        ref={popupRef}
        data-color-palette-popup
        className="fixed z-[9999] bg-white rounded-xl shadow-lg border border-gray-200 w-[336px] overflow-hidden"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
          height: '512px'
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault(); // Prevent focus loss from editor
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#E0E0E0' }}>
          <span className="text-md font-medium text-gray-800">Color Picker</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className="w-5 h-5 rounded-full bg-white flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
            style={{
              backdropFilter: 'blur(12.857142448425293px)',
              boxShadow: '0px 6.43px 6.43px 0px #0000001A, 0px 2.57px 2.57px 0px #0000000D, 0px 0.64px 0px 0px #0000000D'
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_2114_29206)">
                <path d="M1.2002 8.39922L8.4002 1.19922" stroke="#878787" strokeWidth="0.964286" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1.2002 1.19922L8.4002 8.39922" stroke="#878787" strokeWidth="0.964286" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs>
                <clipPath id="clip0_2114_29206">
                  <rect width="9.6" height="9.6" fill="white"/>
                </clipPath>
              </defs>
            </svg>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="px-4 py-4">
        {/* Saturation/Brightness Square with Vertical Sliders */}
        <div className="flex gap-3 mb-4" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault(); // Prevent focus loss from editor
        }}>
          {/* Saturation/Brightness Square */}
          <div
            ref={sbRef}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault(); // Prevent focus loss from editor
              handleMouseDown(e);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-[240px] h-[240px] rounded-lg cursor-crosshair relative z-[10001] overflow-hidden transition-shadow duration-200 flex-shrink-0"
            style={{
              background: `linear-gradient(to top, #000, transparent),
                           linear-gradient(to right, #fff, hsl(${colorState.hsb.h}, 100%, 50%))`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              // Stop dragging if mouse leaves the square
              if (isDraggingRef.current) {
                isDraggingRef.current = false;
                setIsDragging(false);
              }
            }}
          >
            {/* Custom cursor indicator */}
            <div
              className="absolute w-[14px] h-[14px] rounded-full border-[4px] border-white bg-transparent pointer-events-none z-[10002] transition-all duration-100 ease-out"
              style={{
                left: `${colorState.hsb.s}%`,
                top: `${100 - colorState.hsb.b}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
            
            {/* Current color preview at cursor position */}
            <div
              className="absolute w-2 h-2 rounded-full pointer-events-none z-[10003]"
              style={{
                backgroundColor: colorState.hex,
                left: `${colorState.hsb.s}%`,
                top: `${100 - colorState.hsb.b}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
        </div>

          {/* Hue Slider - Vertical */}
            <div className="relative z-[10001]">
            <VerticalSlider
              value={colorState.hsb.h}
              min={0}
              max={360}
              onChange={handleHueChange}
              onChangeCommitted={handleHueChangeCommitted}
              background="linear-gradient(to bottom, hsl(0,100%,60%), hsl(30,100%,60%), hsl(60,100%,60%), hsl(90,100%,60%), hsl(120,100%,60%), hsl(150,100%,60%), hsl(180,100%,60%), hsl(210,100%,60%), hsl(240,100%,60%), hsl(270,100%,60%), hsl(300,100%,60%), hsl(330,100%,60%), hsl(360,100%,60%))"
              width={16}
              height={240}
              thumbColor={`hsl(${colorState.hsb.h}, 100%, 50%)`}
            />
            </div>

          {/* Opacity Slider - Vertical */}
            <div className="relative z-[10001]">
              <div className="relative">
                {/* Squared background for opacity slider */}
                <div 
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: `linear-gradient(45deg, #ccc 25%, transparent 25%), 
                                 linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                                 linear-gradient(45deg, transparent 75%, #ccc 75%), 
                                 linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                    backgroundSize: '12px 12px',
                    backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px'
                  }}
                />
              <VerticalSlider
                  value={colorState.opacity}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={handleOpacityChange}
                  onChangeCommitted={handleOpacityChangeCommitted}
                background={`linear-gradient(to bottom, ${colorState.hex}00, ${colorState.hex}80, ${colorState.hex})`}
                width={16}
                height={240}
                thumbColor={`rgba(${Math.round(colorState.rgba.r)}, ${Math.round(colorState.rgba.g)}, ${Math.round(colorState.rgba.b)}, ${colorState.opacity})`}
              />
            </div>
          </div>
        </div>

        {/* Color Format Toggle Buttons */}
        <div className="mt-4 p-1 rounded-lg flex gap-1 relative z-[10001]" style={{ backgroundColor: '#E0E0E0' }} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault(); // Prevent focus loss from editor
        }}>
          {(['HEX', 'RGB', 'HSL', 'HSB'] as ColorFormat[]).map((format) => (
            <button
              key={format}
              onClick={(e) => {
                e.stopPropagation();
                setColorFormat(format);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault(); // Prevent focus loss from editor
              }}
              className={`flex-1 px-3 py-1.5 border-none text-xs cursor-pointer transition-all duration-200 relative z-[10002] ${
                colorFormat === format 
                  ? 'bg-white font-normal shadow-sm rounded-md' 
                  : 'bg-transparent font-normal rounded-md'
              }`}
              style={{ color: colorFormat === format ? '#171718' : '#878787' }}
            >
              {format}
            </button>
          ))}
        </div>

        {/* Color Code and Opacity Display */}
        <div className="mt-4 flex items-center" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
          {/* SVG Icon */}
          <div className="flex-shrink-0 mr-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 22.0018L3 21.0018M3 21.0018H6L15 12.0018M3 21.0018V18.0018L12 9.00179M15 6.00179L18.4 2.60179C18.7978 2.20396 19.3374 1.98047 19.9 1.98047C20.4626 1.98047 21.0022 2.20396 21.4 2.60179C21.7978 2.99961 22.0213 3.53918 22.0213 4.10179C22.0213 4.6644 21.7978 5.20396 21.4 5.60179L18 9.00179L18.4 9.40179C18.597 9.59877 18.7532 9.83262 18.8598 10.09C18.9665 10.3474 19.0213 10.6232 19.0213 10.9018C19.0213 11.1804 18.9665 11.4562 18.8598 11.7136C18.7532 11.971 18.597 12.2048 18.4 12.4018C18.203 12.5988 17.9692 12.755 17.7118 12.8616C17.4544 12.9682 17.1786 13.0231 16.9 13.0231C16.6214 13.0231 16.3456 12.9682 16.0882 12.8616C15.8308 12.755 15.597 12.5988 15.4 12.4018L11.6 8.60179C11.403 8.40481 11.2468 8.17095 11.1402 7.91358C11.0335 7.65621 10.9787 7.38036 10.9787 7.10179C10.9787 6.82321 11.0335 6.54737 11.1402 6.28999C11.2468 6.03262 11.403 5.79877 11.6 5.60179C11.797 5.40481 12.0308 5.24855 12.2882 5.14194C12.5456 5.03534 12.8214 4.98047 13.1 4.98047C13.3786 4.98047 13.6544 5.03534 13.9118 5.14194C14.1692 5.24855 14.403 5.40481 14.6 5.60179L15 6.00179Z" stroke="#171718" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Code Display */}
          <div className="flex-1 rounded-lg px-3 py-2 flex items-center mr-2.5" style={{ backgroundColor: '#E0E0E0' }}>
            {colorFormat === 'HEX' && (
              <span className="text-sm font-mono">
                <span style={{ color: '#969298' }}># </span>
                <span style={{ color: '#171718' }}>{colorState.hex.slice(1)}</span>
              </span>
            )}
            {colorFormat === 'RGB' && (
              <span className="text-sm font-mono" style={{ color: '#171718' }}>
                rgb({Math.round(colorState.rgba.r)}, {Math.round(colorState.rgba.g)}, {Math.round(colorState.rgba.b)})
              </span>
            )}
            {colorFormat === 'HSL' && (
              <span className="text-sm font-mono" style={{ color: '#171718' }}>
                hsl({Math.round(colorState.hsla.h)}, {Math.round(colorState.hsla.s)}%, {Math.round(colorState.hsla.l)}%)
              </span>
            )}
            {colorFormat === 'HSB' && (
              <span className="text-sm font-mono" style={{ color: '#171718' }}>
                hsb({Math.round(colorState.hsb.h)}, {Math.round(colorState.hsb.s)}%, {Math.round(colorState.hsb.b)}%)
              </span>
            )}
          </div>

          {/* Opacity Display */}
          <div className="rounded-lg px-3 py-2 flex items-center justify-center w-[68px]" style={{ backgroundColor: '#E0E0E0' }}>
            <span className="text-sm font-mono">
              <span style={{ color: '#171718' }}>{Math.round(colorState.opacity * 100)}</span>
              <span style={{ color: '#969298' }}> %</span>
            </span>
          </div>
        </div>

        {/* Conditional Input Fields - OLD VERSION (Commented out) */}
        {/* <div className="mt-4 min-h-[56px] relative z-[10002]" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => {
          e.stopPropagation();
          // Note: NOT preventing default here to allow input fields to receive focus
        }}>
          {colorFormat === 'HEX' && (
            <div>
              <div className="relative w-[234px]">
                <input
                  type="text"
                  value={colorState.hex}
                  onChange={handleHexChange}
                  onKeyDown={handleHexKeyDown}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ccc';
                    e.target.style.boxShadow = 'none';
                    handleHexBlur();
                  }}
                  onClick={handleInputClick}
                  maxLength={7}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 outline-none transition-all duration-200 box-border relative z-[10003] text-center"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#000';
                    e.target.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.1)';
                  }}
                />
                <label className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-white px-1 text-[10px] text-gray-500 z-[10004] pointer-events-none">
                  HEX Color
                </label>
              </div>
              <div className="text-gray-500 text-[10px] mt-1 block text-center">
                Press Enter to apply
              </div>
            </div>
          )}

          {colorFormat === 'RGB' && (
            <div>
              <div className="flex gap-2 w-full">
                {[
                  { label: 'R', value: Math.round(colorState.rgba.r), field: 'r' as keyof RGBA, min: 0, max: 255, step: 1 },
                  { label: 'G', value: Math.round(colorState.rgba.g), field: 'g' as keyof RGBA, min: 0, max: 255, step: 1 },
                  { label: 'B', value: Math.round(colorState.rgba.b), field: 'b' as keyof RGBA, min: 0, max: 255, step: 1 }
                ].map(({ label, value, field, min, max, step }) => (
                  <div key={label} className="relative w-[70px]">
                    <input
                      type="text"
                      value={value}
                      onChange={handleRgbaChange(field)}
                      onKeyDown={handleRgbaKeyDown(field)}
                      onClick={handleInputClick}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 outline-none transition-all duration-200 box-border relative z-[10004] appearance-none text-center"
                      style={{
                        // Remove spinner buttons (up/down arrows)
                        WebkitAppearance: 'none',
                        MozAppearance: 'textfield'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#000';
                        e.target.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#ccc';
                        e.target.style.boxShadow = 'none';
                        setIsUserTyping(false);
                        // Update HSB when RGBA changes
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          const newRgba = { ...colorState.rgba, [field]: value };
                          updateColorFromRgba(newRgba);
                          onColorChange(colorState.hex);
                          // Add the new color to recent colors
                          addToRecentColors(colorState.hex);
                        }
                      }}
                    />
                    <label className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-white px-1 text-[10px] text-gray-500 z-[10005] pointer-events-none">
                      {label}
                    </label>
                  </div>
                ))}
              </div>
              <div className="text-gray-500 text-xs mt-1 block text-center">
                Press Enter in any field to apply
              </div>
            </div>
          )}

          {colorFormat === 'HSL' && (
            <div>
              <div className="flex gap-2 w-full">
                {[
                  { label: 'H', value: Math.round(colorState.hsla.h), field: 'h' as keyof HSLA, min: 0, max: 360, step: 1 },
                  { label: 'S', value: Math.round(colorState.hsla.s), field: 's' as keyof HSLA, min: 0, max: 100, step: 1 },
                  { label: 'L', value: Math.round(colorState.hsla.l), field: 'l' as keyof HSLA, min: 0, max: 100, step: 1 }
                ].map(({ label, value, field, min, max, step }) => (
                  <div key={label} className="relative w-[70px]">
                    <input
                      type="text"
                      value={value}
                      onChange={handleHslaChange(field)}
                      onKeyDown={handleHslaKeyDown(field)}
                      onClick={handleInputClick}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 outline-none transition-all duration-200 box-border relative z-[10004] appearance-none text-center"
                      style={{
                        // Remove spinner buttons (up/down arrows)
                        WebkitAppearance: 'none',
                        MozAppearance: 'textfield'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#000';
                        e.target.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#ccc';
                        e.target.style.boxShadow = 'none';
                        setIsUserTyping(false);
                        // Update HSB when HSLA changes
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          const newHsla = { ...colorState.hsla, [field]: value };
                          updateColorFromHsla(newHsla);
                          onColorChange(colorState.hex);
                          // Add the new color to recent colors
                          addToRecentColors(colorState.hex);
                        }
                      }}
                    />
                    <label className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-white px-1 text-[10px] text-gray-500 z-[10005] pointer-events-none">
                      {label}
                    </label>
                  </div>
                ))}
              </div>
              <div className="text-gray-500 text-xs mt-1 block text-center">
                Press Enter in any field to apply
              </div>
            </div>
          )}
        </div> */}
        </div>
        {/* End Main Content Area */}

        {/* Footer - Last Used Colors */}
        <div className="px-4 pt-4 pb-4 border-t relative z-[10001]" style={{ borderColor: '#E0E0E0' }} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault(); // Prevent focus loss from editor
          }}>
          <div className="text-[#171718] mb-3 block text-xs font-medium">
            Last Used
            </div>
          <div className="flex gap-1.5 flex-wrap">
            {Array.from({ length: 9 }, (_, index) => {
                const color = recentColors[index];
                return (
                  <div
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      color && handleRecentColorClick(color);
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault(); // Prevent focus loss from editor
                    }}
                  className={`w-7 h-7 border border-[#E0E0E0] rounded-md bg-gray-100 transition-all duration-200 relative z-[10002] ${
                      color ? 'cursor-pointer opacity-100' : 'cursor-default opacity-30'
                    }`}
                    style={{
                      backgroundColor: color || '#f0f0f0'
                    }}
                    onMouseEnter={(e) => {
                      if (color) {
                        e.currentTarget.style.border = '2px solid #666';
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = '1px solid #ccc';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title={color || 'No recent color'}
                  >
                    {!color && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-0.5 bg-gray-400 rounded-full" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
      </div>
    </>
  );
};

export default ColorPalettePopup;