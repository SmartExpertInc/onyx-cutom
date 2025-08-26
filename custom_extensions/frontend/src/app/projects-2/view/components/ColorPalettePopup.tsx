'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, Slider, Typography, Box, TextField } from "@mui/material";

interface ColorPalettePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onColorChange: (color: string) => void;
  initialColor?: string;
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

const ColorPalettePopup: React.FC<ColorPalettePopupProps> = ({
  isOpen,
  onClose,
  onColorChange,
  initialColor = "#ff0000",
  position,
  recentColors = [],
  onRecentColorChange,
}) => {
  // Initialize once to avoid flickering
  const [hsb, setHsb] = useState<HSB>(() => hexToHsb(initialColor));
  const [hex, setHex] = useState(initialColor);
  const [rgba, setRgba] = useState<RGBA>(() => hexToRgba(initialColor));
  const [hsla, setHsla] = useState<HSLA>(() => hexToHsla(initialColor));
  const [colorFormat, setColorFormat] = useState<ColorFormat>('HEX');
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [opacity, setOpacity] = useState(1); // 0-1 range for opacity
  const [isDragging, setIsDragging] = useState(false);

  const sbRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

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
    if (!isUserTyping && !isDragging) {
      const newHex = hsbToHex(hsb);
      if (newHex !== hex) {
        setHex(newHex);
        setRgba(hexToRgba(newHex));
        setHsla(hexToHsla(newHex));
        onColorChange(newHex);
      }
    }
  }, [hsb, onColorChange, hex, isUserTyping, isDragging]);

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
    addToRecentColors(color); // Add to recent colors when explicitly selecting
  };

  // --- Hue slider ---
  const handleHueChange = (e: Event, value: number | number[]) => {
    // Set dragging state on first change
    if (!isDragging) {
      setIsDragging(true);
    }
    
    const newHsb = { ...hsb, h: value as number };
    setHsb(newHsb);
    const newHex = hsbToHex(newHsb);
    setHex(newHex);
    const newRgba = { ...hexToRgba(newHex), a: opacity };
    const newHsla = { ...hexToHsla(newHex), a: opacity };
    setRgba(newRgba);
    setHsla(newHsla);
    // Pass the color with current opacity to the parent component
    const colorWithOpacity = `rgba(${Math.round(newRgba.r)}, ${Math.round(newRgba.g)}, ${Math.round(newRgba.b)}, ${newRgba.a})`;
    onColorChange(colorWithOpacity);
  };

  const handleHueChangeCommitted = (e: Event | React.SyntheticEvent, value: number | number[]) => {
    // This is called when the user finishes dragging the hue slider
    setIsDragging(false);
    addToRecentColors(hex);
  };

  // --- Opacity slider ---
  const handleOpacityChange = (e: Event, value: number | number[]) => {
    // Set dragging state on first change
    if (!isDragging) {
      setIsDragging(true);
    }
    
    const newOpacity = value as number;
    setOpacity(newOpacity);
    // Update RGBA and HSLA with new opacity
    const newRgba = { ...rgba, a: newOpacity };
    const newHsla = { ...hsla, a: newOpacity };
    setRgba(newRgba);
    setHsla(newHsla);
    // Pass the color with opacity to the parent component
    // Use RGBA format since it supports opacity
    const colorWithOpacity = `rgba(${Math.round(newRgba.r)}, ${Math.round(newRgba.g)}, ${Math.round(newRgba.b)}, ${newRgba.a})`;
    onColorChange(colorWithOpacity);
  };

  const handleOpacityChangeCommitted = (e: Event | React.SyntheticEvent, value: number | number[]) => {
    // This is called when the user finishes dragging the opacity slider
    setIsDragging(false);
    addToRecentColors(hex);
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
    // Pass the color with current opacity to the parent component
    const colorWithOpacity = `rgba(${Math.round(newRgba.r)}, ${Math.round(newRgba.g)}, ${Math.round(newRgba.b)}, ${newRgba.a})`;
    onColorChange(colorWithOpacity);
  }, [hsb, opacity, onColorChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    handleSBUpdate(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDraggingRef.current) handleSBUpdate(e.clientX, e.clientY);
  }, [handleSBUpdate]);

  const handleMouseUp = () => { 
    isDraggingRef.current = false; 
    setIsDragging(false);
    // Add the current color to recent colors when dragging the saturation/brightness square ends
    addToRecentColors(hex);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove]);

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      hideBackdrop={true}
      disablePortal={false}
      slotProps={{
        paper: {
          sx: {
            ...(position ? {
              position: 'absolute',
              left: position.x,
              top: position.y,
              margin: 0,
            } : {}),
            borderRadius: 3,
            zIndex: 9999,
            '& .MuiDialogContent-root': {
              zIndex: 10000,
              position: 'relative',
            },
            '& .MuiTextField-root': {
              zIndex: 10001,
              position: 'relative',
            },
            '& .MuiInputBase-root': {
              zIndex: 10002,
              position: 'relative',
            },
            '& .MuiInputBase-input': {
              zIndex: 10003,
              position: 'relative',
              pointerEvents: 'auto',
            }
          }
        }
      }}
    >
      {/* Custom backdrop that doesn't interfere with input fields */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9998,
            backgroundColor: 'transparent',
            pointerEvents: 'none'
          }}
          onClick={onClose}
        />
      )}
      <DialogContent sx={{ zIndex: 10000, position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        {/* Hue Slider */}
        <Box sx={{ position: 'relative', zIndex: 10001 }}>
          <Slider
            value={hsb.h}
            min={0}
            max={360}
            onChange={handleHueChange}
            onChangeCommitted={handleHueChangeCommitted}
            sx={{
              height: 8,
              position: 'relative',
              "& .MuiSlider-rail": {
                background: `linear-gradient(to right,
                  hsl(0,100%,60%), hsl(30,100%,60%), hsl(60,100%,60%), hsl(90,100%,60%),
                  hsl(120,100%,60%), hsl(150,100%,60%), hsl(180,100%,60%), hsl(210,100%,60%),
                  hsl(240,100%,60%), hsl(270,100%,60%), hsl(300,100%,60%), hsl(330,100%,60%),
                  hsl(360,100%,60%))`,
                height: 8,
                borderRadius: 6,
                opacity: 1
              },
              "& .MuiSlider-track": {
                background: 'transparent',
                height: 8,
                borderRadius: 6,
                opacity: 1
              },
              "& .MuiSlider-thumb": {
                width: 16, 
                height: 16, 
                backgroundColor: "#fff", 
                border: "2px solid #888",
                borderRadius: '50%',
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }
            }}
          />
        </Box>

        {/* Opacity Slider */}
        <Box sx={{ position: 'relative', zIndex: 10001, mt: 0.5 }}>
          <Slider
            value={opacity}
            min={0}
            max={1}
            step={0.01}
            onChange={handleOpacityChange}
            onChangeCommitted={handleOpacityChangeCommitted}
            sx={{
              height: 8,
              position: 'relative',
              "& .MuiSlider-rail": {
                background: `linear-gradient(to right, 
                  rgba(0,0,0,0), rgba(0,0,0,0.5), rgba(0,0,0,1))`,
                height: 8,
                borderRadius: 6,
                opacity: 1
              },
              "& .MuiSlider-track": {
                background: 'transparent',
                height: 8,
                borderRadius: 6,
                opacity: 1
              },
              "& .MuiSlider-thumb": {
                width: 16, 
                height: 16, 
                backgroundColor: "#fff", 
                border: "2px solid #888",
                borderRadius: '50%',
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }
            }}
          />
          <Typography variant="caption" sx={{ 
            color: 'text.secondary', 
            fontSize: '11px', 
            mt: 0.25, 
            mb: 1,
            display: 'block',
            textAlign: 'center'
          }}>
            Opacity: {Math.round(opacity * 100)}%
          </Typography>
        </Box>

        {/* Saturation/Brightness Square */}
        <Box
          ref={sbRef}
          onMouseDown={handleMouseDown}
          sx={{
            width: '100%',
            height: 128,
            border: '1px solid #ccc',
            borderRadius: 2,
            cursor: 'crosshair',
            position: 'relative',
            zIndex: 10001,
            background: `linear-gradient(to top, #000, transparent),
                         linear-gradient(to right, #fff, hsl(${hsb.h}, 100%, 50%))`
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: 12,
              height: 12,
              borderRadius: '50%',
              border: '2px solid #000',
              backgroundColor: '#fff',
              left: `${hsb.s}%`,
              top: `${100 - hsb.b}%`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}
          />
        </Box>

        {/* Color Format Toggle Buttons */}
        <Box sx={{ 
          mt: 2, 
          p: 0.5, 
          bgcolor: 'grey.200', 
          borderRadius: '24px',
          display: 'flex',
          gap: 0.5,
          zIndex: 10001,
          position: 'relative'
        }}>
          {(['HEX', 'RGBA', 'HSLA'] as ColorFormat[]).map((format) => (
            <button
              key={format}
              onClick={() => setColorFormat(format)}
              style={{
                flex: 1,
                padding: '6px 12px',
                border: 'none',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: colorFormat === format ? 'bold' : 'normal',
                backgroundColor: colorFormat === format ? '#fff' : 'transparent',
                color: colorFormat === format ? '#000' : '#666',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: colorFormat === format ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                zIndex: 10002,
                position: 'relative'
              }}
            >
              {format}
            </button>
          ))}
        </Box>

        {/* Conditional Input Fields */}
        <Box sx={{ mt: 2, minHeight: 56, zIndex: 10002, position: 'relative' }}>
          {colorFormat === 'HEX' && (
            <Box>
              <TextField
                label="HEX Color"
                value={hex}
                onChange={handleHexChange}
                onKeyDown={handleHexKeyDown}
                onBlur={handleHexBlur}
                fullWidth
                variant="outlined"
                inputProps={{ maxLength: 7 }}
                onClick={handleInputClick}
                sx={{
                  zIndex: 10003,
                  position: 'relative',
                  '& .MuiInputBase-root': {
                    zIndex: 10004,
                    position: 'relative',
                  },
                  '& .MuiInputBase-input': {
                    zIndex: 10005,
                    position: 'relative',
                    pointerEvents: 'auto',
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#000',
                  }
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block', fontSize: '11px' }}>
                Press Enter to apply
              </Typography>
            </Box>
          )}

          {colorFormat === 'RGBA' && (
            <Box>
              <Box sx={{ display: 'flex', gap: 1, zIndex: 10003, position: 'relative' }}>
                <TextField
                  label="R"
                  type="number"
                  value={Math.round(rgba.r)}
                  onChange={handleRgbaChange('r')}
                  onKeyDown={handleRgbaKeyDown('r')}
                  onBlur={(e) => {
                    setIsUserTyping(false);
                    // Update HSB when RGBA changes
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                      const newRgba = { ...rgba, r: value };
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
                  inputProps={{ min: 0, max: 255 }}
                  onClick={handleInputClick}
                  sx={{ 
                    flex: 1,
                    zIndex: 10004,
                    position: 'relative',
                    '& .MuiInputBase-root': {
                      zIndex: 10005,
                      position: 'relative',
                    },
                    '& .MuiInputBase-input': {
                      zIndex: 10006,
                      position: 'relative',
                      pointerEvents: 'auto',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#000',
                    }
                  }}
                  variant="outlined"
                />
                <TextField
                  label="G"
                  type="number"
                  value={Math.round(rgba.g)}
                  onChange={handleRgbaChange('g')}
                  onKeyDown={handleRgbaKeyDown('g')}
                  onBlur={(e) => {
                    setIsUserTyping(false);
                    // Update HSB when RGBA changes
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                      const newRgba = { ...rgba, g: value };
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
                  inputProps={{ min: 0, max: 255 }}
                  onClick={handleInputClick}
                  sx={{ 
                    flex: 1,
                    zIndex: 10004,
                    position: 'relative',
                    '& .MuiInputBase-root': {
                      zIndex: 10005,
                      position: 'relative',
                    },
                    '& .MuiInputBase-input': {
                      zIndex: 10006,
                      position: 'relative',
                      pointerEvents: 'auto',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#000',
                    }
                  }}
                  variant="outlined"
                />
                <TextField
                  label="B"
                  type="number"
                  value={Math.round(rgba.b)}
                  onChange={handleRgbaChange('b')}
                  onKeyDown={handleRgbaKeyDown('b')}
                  onBlur={(e) => {
                    setIsUserTyping(false);
                    // Update HSB when RGBA changes
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                      const newRgba = { ...rgba, b: value };
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
                  inputProps={{ min: 0, max: 255 }}
                  onClick={handleInputClick}
                  sx={{ 
                    flex: 1,
                    zIndex: 10004,
                    position: 'relative',
                    '& .MuiInputBase-root': {
                      zIndex: 10005,
                      position: 'relative',
                    },
                    '& .MuiInputBase-input': {
                      zIndex: 10006,
                      position: 'relative',
                      pointerEvents: 'auto',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#000',
                    }
                  }}
                  variant="outlined"
                />
                <TextField
                  label="A"
                  type="number"
                  value={rgba.a}
                  onChange={handleRgbaChange('a')}
                  onKeyDown={handleRgbaKeyDown('a')}
                  onBlur={(e) => {
                    setIsUserTyping(false);
                    // Update HSB when RGBA changes
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                      const newRgba = { ...rgba, a: value };
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
                  inputProps={{ min: 0, max: 1, step: 0.1 }}
                  onClick={handleInputClick}
                  sx={{ 
                    flex: 1,
                    zIndex: 10004,
                    position: 'relative',
                    '& .MuiInputBase-root': {
                      zIndex: 10005,
                      position: 'relative',
                    },
                    '& .MuiInputBase-input': {
                      zIndex: 10006,
                      position: 'relative',
                      pointerEvents: 'auto',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#000',
                    }
                  }}
                  variant="outlined"
                />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block', fontSize: '11px' }}>
                Press Enter in any field to apply
              </Typography>
            </Box>
          )}

          {colorFormat === 'HSLA' && (
            <Box>
              <Box sx={{ display: 'flex', gap: 1, zIndex: 10003, position: 'relative' }}>
                <TextField
                  label="H"
                  type="number"
                  value={Math.round(hsla.h)}
                  onChange={handleHslaChange('h')}
                  onKeyDown={handleHslaKeyDown('h')}
                  onBlur={(e) => {
                    setIsUserTyping(false);
                    // Update HSB when HSLA changes
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                      const newHsla = { ...hsla, h: value };
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
                  inputProps={{ min: 0, max: 360 }}
                  onClick={handleInputClick}
                  sx={{ 
                    flex: 1,
                    zIndex: 10004,
                    position: 'relative',
                    '& .MuiInputBase-root': {
                      zIndex: 10005,
                      position: 'relative',
                    },
                    '& .MuiInputBase-input': {
                      zIndex: 10006,
                      position: 'relative',
                      pointerEvents: 'auto',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#000',
                    }
                  }}
                  variant="outlined"
                />
                <TextField
                  label="S"
                  type="number"
                  value={Math.round(hsla.s)}
                  onChange={handleHslaChange('s')}
                  onKeyDown={handleHslaKeyDown('s')}
                  onBlur={(e) => {
                    setIsUserTyping(false);
                    // Update HSB when HSLA changes
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                      const newHsla = { ...hsla, s: value };
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
                  inputProps={{ min: 0, max: 100 }}
                  onClick={handleInputClick}
                  sx={{ 
                    flex: 1,
                    zIndex: 10004,
                    position: 'relative',
                    '& .MuiInputBase-root': {
                      zIndex: 10005,
                      position: 'relative',
                    },
                    '& .MuiInputBase-input': {
                      zIndex: 10006,
                      position: 'relative',
                      pointerEvents: 'auto',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#000',
                    }
                  }}
                  variant="outlined"
                />
                <TextField
                  label="L"
                  type="number"
                  value={Math.round(hsla.l)}
                  onChange={handleHslaChange('l')}
                  onKeyDown={handleHslaKeyDown('l')}
                  onBlur={(e) => {
                    setIsUserTyping(false);
                    // Update HSB when HSLA changes
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                      const newHsla = { ...hsla, l: value };
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
                  inputProps={{ min: 0, max: 100 }}
                  onClick={handleInputClick}
                  sx={{ 
                    flex: 1,
                    zIndex: 10004,
                    position: 'relative',
                    '& .MuiInputBase-root': {
                      zIndex: 10005,
                      position: 'relative',
                    },
                    '& .MuiInputBase-input': {
                      zIndex: 10006,
                      position: 'relative',
                      pointerEvents: 'auto',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#000',
                    }
                  }}
                  variant="outlined"
                />
                <TextField
                  label="A"
                  type="number"
                  value={hsla.a}
                  onChange={handleHslaChange('a')}
                  onKeyDown={handleHslaKeyDown('a')}
                  onBlur={(e) => {
                    setIsUserTyping(false);
                    // Update HSB when HSLA changes
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                      const newHsla = { ...hsla, a: value };
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
                  inputProps={{ min: 0, max: 1, step: 0.1 }}
                  onClick={handleInputClick}
                  sx={{ 
                    flex: 1,
                    zIndex: 10004,
                    position: 'relative',
                    '& .MuiInputBase-root': {
                      zIndex: 10005,
                      position: 'relative',
                    },
                    '& .MuiInputBase-input': {
                      zIndex: 10006,
                      position: 'relative',
                      pointerEvents: 'auto',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#000',
                    }
                  }}
                  variant="outlined"
                />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block', fontSize: '11px' }}>
                Press Enter in any field to apply
              </Typography>
            </Box>
          )}
        </Box>

        {/* Color Preview */}
        <Box sx={{
          mt: 2, width: 40, height: 40, border: '1px solid #ccc',
          borderRadius: 2, 
          background: `linear-gradient(45deg, #ccc 25%, transparent 25%), 
                       linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                       linear-gradient(45deg, transparent 75%, #ccc 75%), 
                       linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
          backgroundSize: '10px 10px',
          backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
          position: 'relative',
          zIndex: 10001
        }}>
          <Box sx={{
            width: '100%',
            height: '100%',
            backgroundColor: hex,
            opacity: opacity,
            borderRadius: 2,
          }} />
        </Box>

        {/* Recent Colors */}
        {onRecentColorChange && (
          <Box sx={{ mt: 2, zIndex: 10001, position: 'relative' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
              Recent Colors
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {Array.from({ length: 5 }, (_, index) => {
                const color = recentColors[index];
                return (
                  <Box
                    key={index}
                    onClick={() => color && handleRecentColorClick(color)}
                    sx={{
                      width: 24,
                      height: 24,
                      border: '1px solid #ccc',
                      borderRadius: 1,
                      backgroundColor: color || '#f0f0f0',
                      cursor: color ? 'pointer' : 'default',
                      opacity: color ? 1 : 0.3,
                      '&:hover': {
                        border: color ? '2px solid #666' : '1px solid #ccc',
                        transform: color ? 'scale(1.1)' : 'none',
                      },
                      transition: 'all 0.2s',
                      position: 'relative',
                      zIndex: 10002
                    }}
                    title={color || 'No recent color'}
                  >
                    {!color && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: 2,
                          height: 2,
                          backgroundColor: '#ccc',
                          borderRadius: '50%'
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ColorPalettePopup;
