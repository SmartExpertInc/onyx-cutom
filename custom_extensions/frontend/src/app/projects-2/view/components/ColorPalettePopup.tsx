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

type ColorFormat = 'HEX' | 'RGBA' | 'HSLA';

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
        className="absolute top-1/2 w-3.5 h-3.5 bg-white border-2 border-gray-500 rounded-full shadow-md cursor-pointer z-10"
        style={{
          left: `${getPercentage()}%`,
          transform: 'translate(-50%, -50%)'
        }}
      />
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
  // Initialize once to avoid flickering
  const [hsb, setHsb] = useState<HSB>(() => hexToHsb(selectedColor));
  const [hex, setHex] = useState(selectedColor);
  const [rgba, setRgba] = useState<RGBA>(() => hexToRgba(selectedColor));
  const [hsla, setHsla] = useState<HSLA>(() => hexToHsla(selectedColor));
  const [colorFormat, setColorFormat] = useState<ColorFormat>('HEX');
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [opacity, setOpacity] = useState(1); // 0-1 range for opacity
  const [isDragging, setIsDragging] = useState(false);
  const [justSetByUser, setJustSetByUser] = useState(false);
  
  const sbRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = React.useState<{ x: number; y: number } | null>(position || null);

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
            newX = viewportWidth - rect.width - 10; // 10px margin
          }
          
          // Check if popup goes beyond bottom edge
          if (position.y + rect.height > viewportHeight) {
            newY = position.y - rect.height; // Show above the click point
          }
          
          // Ensure popup doesn't go beyond left edge
          if (newX < 10) {
            newX = 10;
          }
          
          // Ensure popup doesn't go beyond top edge
          if (newY < 10) {
            newY = 10;
          }
          
          setAdjustedPosition({ x: newX, y: newY });
        }
      }, 0);
      
      return () => clearTimeout(timer);
    } else {
      setAdjustedPosition(null);
    }
  }, [isOpen, position]);

  // --- HEX ↔ HSB conversion ---
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

  // HEX to RGBA conversion
  function hexToRgba(hex: string): RGBA {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b, a: 1 };
  }

  // RGBA to HEX conversion
  function rgbaToHex({ r, g, b, a }: RGBA): string {
    const rHex = Math.round(r).toString(16).padStart(2, '0');
    const gHex = Math.round(g).toString(16).padStart(2, '0');
    const bHex = Math.round(b).toString(16).padStart(2, '0');
    return `#${rHex}${gHex}${bHex}`;
  }

  // HEX to HSLA conversion
  function hexToHsla(hex: string): HSLA {
    const { h, s, b } = hexToHsb(hex);
    // Convert brightness to lightness
    const l = b * 0.5; // Simplified conversion
    return { h, s, l, a: 1 };
  }

  // HSLA to HEX conversion
  function hslaToHex({ h, s, l, a }: HSLA): string {
    // Convert lightness back to brightness for HSB
    const b = l * 2; // Simplified conversion
    return hsbToHex({ h, s, b });
  }

  // Update all color formats when HSB changes (from slider/square)
  useEffect(() => {
    if (!isUserTyping && !isDragging && !justSetByUser) {
      const newHex = hsbToHex(hsb);
      if (newHex !== hex) {
        setHex(newHex);
        setRgba(hexToRgba(newHex));
        setHsla(hexToHsla(newHex));
        onColorChange(newHex);
      }
    }
    // Reset the flag after the effect runs
    if (justSetByUser) {
      setJustSetByUser(false);
    }
  }, [hsb, onColorChange, hex, isUserTyping, isDragging, justSetByUser]);

  // --- Input handlers ---
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const value = e.target.value;
    setIsUserTyping(true);
    setHex(value);
  };

  const handleHexKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsUserTyping(false);
      setJustSetByUser(true); // Flag that hex was just set by user
      const value = e.currentTarget.value;
      // Only update other formats if we have a complete valid HEX code
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        const newHsb = hexToHsb(value);
        setHsb(newHsb); // Update HSB to reflect in square and slider
        setHex(value);
        const newRgba = { ...hexToRgba(value), a: opacity };
        const newHsla = { ...hexToHsla(value), a: opacity };
        setRgba(newRgba);
        setHsla(newHsla);
        // Pass the color with current opacity to the parent component
        const colorWithOpacity = `rgba(${Math.round(newRgba.r)}, ${Math.round(newRgba.g)}, ${Math.round(newRgba.b)}, ${newRgba.a})`;
        onColorChange(colorWithOpacity);
      }
    }
  };

  const handleHexBlur = () => {
    setIsUserTyping(false);
    setJustSetByUser(true); // Flag that hex was just set by user
    // Update other formats if we have a complete valid HEX code
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      const newHsb = hexToHsb(hex);
      setHsb(newHsb); // Update HSB to reflect in square and slider
      const newRgba = { ...hexToRgba(hex), a: opacity };
      const newHsla = { ...hexToHsla(hex), a: opacity };
      setRgba(newRgba);
      setHsla(newHsla);
      // Pass the color with current opacity to the parent component
      const colorWithOpacity = `rgba(${Math.round(newRgba.r)}, ${Math.round(newRgba.g)}, ${Math.round(newRgba.b)}, ${newRgba.a})`;
      onColorChange(colorWithOpacity);
    }
  };

  const handleRgbaChange = (field: keyof RGBA) => (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setIsUserTyping(true);
      const newRgba = { ...rgba, [field]: value };
      setRgba(newRgba);
    }
  };

  const handleRgbaKeyDown = (field: keyof RGBA) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsUserTyping(false);
      const value = parseFloat(e.currentTarget.value);
      if (!isNaN(value)) {
        const newRgba = { ...rgba, [field]: value };
        setRgba(newRgba);
        const newHex = rgbaToHex(newRgba);
        const newHsb = hexToHsb(newHex);
        setHsb(newHsb); // Update HSB to reflect in square and slider
        setHex(newHex);
        setHsla(hexToHsla(newHex));
        setOpacity(newRgba.a); // Update opacity slider
        onColorChange(newHex);
      }
    }
  };

  const handleHslaChange = (field: keyof HSLA) => (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setIsUserTyping(true);
      const newHsla = { ...hsla, [field]: value };
      setHsla(newHsla);
    }
  };

  const handleHslaKeyDown = (field: keyof HSLA) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsUserTyping(false);
      const value = parseFloat(e.currentTarget.value);
      if (!isNaN(value)) {
        const newHsla = { ...hsla, [field]: value };
        setHsla(newHsla);
        const newHex = hslaToHex(newHsla);
        const newHsb = hexToHsb(newHex);
        setHsb(newHsb); // Update HSB to reflect in square and slider
        setHex(newHex);
        setRgba(hexToRgba(newHex));
        setOpacity(newHsla.a); // Update opacity slider
        onColorChange(newHex);
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
    ].slice(0, 5); // Keep only 5 colors
    
    onRecentColorChange(updatedRecentColors);
    
    // Pass the most recent color (first in the array) to parent as selected color
    const selectedColor = updatedRecentColors[0];
    if (selectedColor) {
      // Convert to RGBA format with current opacity for the parent
      const rgbaColor = hexToRgba(selectedColor);
      const colorWithOpacity = `rgba(${Math.round(rgbaColor.r)}, ${Math.round(rgbaColor.g)}, ${Math.round(rgbaColor.b)}, ${opacity})`;
      onColorChange(colorWithOpacity);
    }
  };

  // Handle recent color click
  const handleRecentColorClick = (color: string) => {
    setHex(color);
    setHsb(hexToHsb(color));
    const newRgba = { ...hexToRgba(color), a: opacity };
    const newHsla = { ...hexToHsla(color), a: opacity };
    setRgba(newRgba);
    setHsla(newHsla);
    // Pass the color with current opacity to the parent component
    const colorWithOpacity = `rgba(${Math.round(newRgba.r)}, ${Math.round(newRgba.g)}, ${Math.round(newRgba.b)}, ${newRgba.a})`;
    onColorChange(colorWithOpacity);
  };

  // --- Hue slider ---
  const handleHueChange = (value: number) => {
    // Set dragging state on first change
    if (!isDragging) {
      setIsDragging(true);
    }
    
    const newHsb = { ...hsb, h: value };
    setHsb(newHsb);
    const newHex = hsbToHex(newHsb);
    setHex(newHex);
    const newRgba = { ...hexToRgba(newHex), a: opacity };
    const newHsla = { ...hexToHsla(newHex), a: opacity };
    setRgba(newRgba);
    setHsla(newHsla);
    // Don't call onColorChange during dragging - only when dragging ends
  };

  const handleHueChangeCommitted = (value: number) => {
    // This is called when the user finishes dragging the hue slider
    setIsDragging(false);
    // Pass the color with current opacity to the parent component when dragging ends
    const colorWithOpacity = `rgba(${Math.round(rgba.r)}, ${Math.round(rgba.g)}, ${Math.round(rgba.b)}, ${rgba.a})`;
    onColorChange(colorWithOpacity);
  };

  // --- Opacity slider ---
  const handleOpacityChange = (value: number) => {
    // Set dragging state on first change
    if (!isDragging) {
      setIsDragging(true);
    }
    
    const newOpacity = value;
    setOpacity(newOpacity);
    // Update RGBA and HSLA with new opacity
    const newRgba = { ...rgba, a: newOpacity };
    const newHsla = { ...hsla, a: newOpacity };
    setRgba(newRgba);
    setHsla(newHsla);
    // Don't call onColorChange during dragging - only when dragging ends
  };

  const handleOpacityChangeCommitted = (value: number) => {
    // This is called when the user finishes dragging the opacity slider
    setIsDragging(false);
    // Pass the color with current opacity to the parent component when dragging ends
    const colorWithOpacity = `rgba(${Math.round(rgba.r)}, ${Math.round(rgba.g)}, ${Math.round(rgba.b)}, ${rgba.a})`;
    onColorChange(colorWithOpacity);
  };

  // --- Saturation/Brightness square ---
  const handleSBUpdate = useCallback((clientX: number, clientY: number) => {
    if (!sbRef.current) return;
    const rect = sbRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const newHsb = {
      ...hsb,
      s: Math.round(x * 100),
      b: Math.round((1 - y) * 100)
    };
    setHsb(newHsb);
    const newHex = hsbToHex(newHsb);
    setHex(newHex);
    const newRgba = { ...hexToRgba(newHex), a: opacity };
    const newHsla = { ...hexToHsla(newHex), a: opacity };
    setRgba(newRgba);
    setHsla(newHsla);
    // Don't call onColorChange during dragging - only when dragging ends
  }, [hsb, opacity]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start dragging if clicking on the saturation square
    if (sbRef.current && sbRef.current.contains(e.target as Node)) {
      isDraggingRef.current = true;
      setIsDragging(true);
      handleSBUpdate(e.clientX, e.clientY);
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // Only update if we're actually dragging
    if (isDraggingRef.current) {
      handleSBUpdate(e.clientX, e.clientY);
    }
  }, [handleSBUpdate]);

  const handleMouseUp = () => { 
    // Only process if we were actually dragging
    if (isDraggingRef.current) {
      isDraggingRef.current = false; 
      setIsDragging(false);
      // Pass the color with current opacity to the parent component when dragging ends
      const colorWithOpacity = `rgba(${Math.round(rgba.r)}, ${Math.round(rgba.g)}, ${Math.round(rgba.b)}, ${rgba.a})`;
      onColorChange(colorWithOpacity);
      // Add the current color to recent colors when dragging the saturation/brightness square ends
      addToRecentColors(hex);
    }
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  if (!isOpen || !adjustedPosition) return null;

  return (
    <>
      {/* Custom backdrop */}
      <div 
        className="fixed inset-0 z-[9998] bg-transparent pointer-events-auto"
        onClick={onClose}
      />
      
      {/* Color picker popup */}
      <div
        ref={popupRef}
        className="fixed z-[9999] bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-[260px]"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hue Slider */}
        <div className="relative z-[10001] py-1">
          <CustomSlider
            value={hsb.h}
            min={0}
            max={360}
            onChange={handleHueChange}
            onChangeCommitted={handleHueChangeCommitted}
            background="linear-gradient(to right, hsl(0,100%,60%), hsl(30,100%,60%), hsl(60,100%,60%), hsl(90,100%,60%), hsl(120,100%,60%), hsl(150,100%,60%), hsl(180,100%,60%), hsl(210,100%,60%), hsl(240,100%,60%), hsl(270,100%,60%), hsl(300,100%,60%), hsl(330,100%,60%), hsl(360,100%,60%))"
          />
        </div>

        {/* Opacity Slider */}
        <div className="relative z-[10001] mt-0.5 py-1">
          <CustomSlider
            value={opacity}
            min={0}
            max={1}
            step={0.01}
            onChange={handleOpacityChange}
            onChangeCommitted={handleOpacityChangeCommitted}
            background="linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.5), rgba(0,0,0,1))"
          />
          <div className="text-gray-500 text-xs mt-0.5 mb-3 block text-center">
            Opacity: {Math.round(opacity * 100)}%
          </div>
        </div>

        {/* Custom Saturation/Brightness Square */}
        <div
          ref={sbRef}
          onMouseDown={(e) => {
            handleMouseDown(e);
            e.currentTarget.style.border = '1px solid #666';
            e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.2)';
          }}
          className="w-full h-32 rounded-lg cursor-crosshair relative z-[10001] overflow-hidden transition-shadow duration-200"
          style={{
            background: `linear-gradient(to top, #000, transparent),
                         linear-gradient(to right, #fff, hsl(${hsb.h}, 100%, 50%))`
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
            className="absolute w-3 h-3 rounded-full border-2 border-black bg-transparent pointer-events-none z-[10002] transition-all duration-100 ease-out"
            style={{
              left: `${hsb.s}%`,
              top: `${100 - hsb.b}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
          
          {/* Current color preview at cursor position */}
          <div
            className="absolute w-2 h-2 rounded-full pointer-events-none z-[10003] border border-white/80"
            style={{
              backgroundColor: hex,
              left: `${hsb.s}%`,
              top: `${100 - hsb.b}%`,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.3)'
            }}
          />
        </div>

        {/* Color Format Toggle Buttons */}
        <div className="mt-4 p-1 bg-gray-200 rounded-3xl flex gap-1 relative z-[10001]">
          {(['HEX', 'RGBA', 'HSLA'] as ColorFormat[]).map((format) => (
            <button
              key={format}
              onClick={() => setColorFormat(format)}
              className={`flex-1 px-3 py-1.5 border-none rounded-full text-xs cursor-pointer transition-all duration-200 relative z-[10002] ${
                colorFormat === format 
                  ? 'bg-white text-black font-bold shadow-sm' 
                  : 'bg-transparent text-gray-500 font-normal'
              }`}
            >
              {format}
            </button>
          ))}
        </div>

        {/* Conditional Input Fields */}
        <div className="mt-4 min-h-[56px] relative z-[10002]">
          {colorFormat === 'HEX' && (
            <div>
              <div className="relative w-[224px]">
                <input
                  type="text"
                  value={hex}
                  onChange={handleHexChange}
                  onKeyDown={handleHexKeyDown}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ccc';
                    e.target.style.boxShadow = 'none';
                    handleHexBlur();
                  }}
                  onClick={handleInputClick}
                  maxLength={7}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded text-sm bg-white text-gray-800 outline-none transition-all duration-200 box-border relative z-[10003]"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#000';
                    e.target.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.1)';
                  }}
                />
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500 z-[10004] pointer-events-none">
                  HEX Color
                </label>
              </div>
              <div className="text-gray-500 text-xs mt-1 block">
                Press Enter to apply
              </div>
            </div>
          )}

          {colorFormat === 'RGBA' && (
            <div>
              <div className="flex gap-2 w-full">
                {[
                  { label: 'R', value: Math.round(rgba.r), field: 'r' as keyof RGBA, min: 0, max: 255, step: 1 },
                  { label: 'G', value: Math.round(rgba.g), field: 'g' as keyof RGBA, min: 0, max: 255, step: 1 },
                  { label: 'B', value: Math.round(rgba.b), field: 'b' as keyof RGBA, min: 0, max: 255, step: 1 },
                  { label: 'A', value: rgba.a, field: 'a' as keyof RGBA, min: 0, max: 1, step: 0.1 }
                ].map(({ label, value, field, min, max, step }) => (
                  <div key={label} className="relative w-[50px]">
                    <input
                      type="text"
                      value={value}
                      onChange={handleRgbaChange(field)}
                      onKeyDown={handleRgbaKeyDown(field)}
                      onClick={handleInputClick}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded text-sm bg-white text-gray-800 outline-none transition-all duration-200 box-border relative z-[10004] appearance-none"
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
                          const newRgba = { ...rgba, [field]: value };
                          const newHex = rgbaToHex(newRgba);
                          const newHsb = hexToHsb(newHex);
                          setHsb(newHsb); // Update HSB to reflect in square and slider
                          setHex(newHex);
                          setRgba(newRgba);
                          setHsla(hexToHsla(newHex));
                          setOpacity(newRgba.a); // Update opacity slider
                          onColorChange(newHex);
                        }
                      }}
                    />
                    <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500 z-[10005] pointer-events-none">
                      {label}
                    </label>
                  </div>
                ))}
              </div>
              <div className="text-gray-500 text-xs mt-1 block">
                Press Enter in any field to apply
              </div>
            </div>
          )}

          {colorFormat === 'HSLA' && (
            <div>
              <div className="flex gap-2 w-full">
                {[
                  { label: 'H', value: Math.round(hsla.h), field: 'h' as keyof HSLA, min: 0, max: 360, step: 1 },
                  { label: 'S', value: Math.round(hsla.s), field: 's' as keyof HSLA, min: 0, max: 100, step: 1 },
                  { label: 'L', value: Math.round(hsla.l), field: 'l' as keyof HSLA, min: 0, max: 100, step: 1 },
                  { label: 'A', value: hsla.a, field: 'a' as keyof HSLA, min: 0, max: 1, step: 0.1 }
                ].map(({ label, value, field, min, max, step }) => (
                  <div key={label} className="relative w-[50px]">
                    <input
                      type="text"
                      value={value}
                      onChange={handleHslaChange(field)}
                      onKeyDown={handleHslaKeyDown(field)}
                      onClick={handleInputClick}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded text-sm bg-white text-gray-800 outline-none transition-all duration-200 box-border relative z-[10004] appearance-none"
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
                          const newHsla = { ...hsla, [field]: value };
                          const newHex = hslaToHex(newHsla);
                          const newHsb = hexToHsb(newHex);
                          setHsb(newHsb); // Update HSB to reflect in square and slider
                          setHex(newHex);
                          setHsla(newHsla);
                          setRgba(hexToRgba(newHex));
                          setOpacity(newHsla.a); // Update opacity slider
                          onColorChange(newHex);
                        }
                      }}
                    />
                    <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500 z-[10005] pointer-events-none">
                      {label}
                    </label>
                  </div>
                ))}
              </div>
              <div className="text-gray-500 text-xs mt-1 block">
                Press Enter in any field to apply
              </div>
            </div>
          )}
        </div>

        {/* Color Preview */}
        <div className="mt-4 w-10 h-10 border border-gray-300 rounded-lg relative z-[10001]"
          style={{
            background: `linear-gradient(45deg, #ccc 25%, transparent 25%), 
                         linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                         linear-gradient(45deg, transparent 75%, #ccc 75%), 
                         linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
            backgroundSize: '10px 10px',
            backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px'
          }}>
          <div className="w-full h-full rounded-lg"
            style={{
              backgroundColor: hex,
              opacity: opacity
            }} />
        </div>

        {/* Recent Colors */}
        {onRecentColorChange && (
          <div className="mt-4 relative z-[10001]">
            <div className="text-gray-500 mb-2 block text-xs">
              Recent Colors
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 5 }, (_, index) => {
                const color = recentColors[index];
                return (
                  <div
                    key={index}
                    onClick={() => color && handleRecentColorClick(color)}
                    className={`w-6 h-6 border border-gray-300 rounded bg-gray-100 transition-all duration-200 relative z-[10002] ${
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
        )}
      </div>
    </>
  );
};

export default ColorPalettePopup;