'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, Slider, Typography, Box, TextField } from "@mui/material";

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

// Common styles
const commonTextFieldStyles = {
  zIndex: 10004,
  position: 'relative' as const,
  '& .MuiInputBase-root': {
    zIndex: 10005,
    position: 'relative' as const,
  },
  '& .MuiInputBase-input': {
    zIndex: 10006,
    position: 'relative' as const,
    pointerEvents: 'auto' as const,
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#000',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#000',
  }
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
  const [opacity, setOpacity] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const sbRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // --- Color conversion utilities ---
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
    const l = b * 0.5;
    return { h, s, l, a: 1 };
  }

  function hslaToHex({ h, s, l, a }: HSLA): string {
    const b = l * 2;
    return hsbToHex({ h, s, b });
  }

  // Centralized color update function
  const updateAllColorFormats = useCallback((newHex: string, newOpacity: number = opacity, shouldNotifyParent: boolean = true) => {
    setHex(newHex);
    setHsb(hexToHsb(newHex));
    setRgba({ ...hexToRgba(newHex), a: newOpacity });
    setHsla({ ...hexToHsla(newHex), a: newOpacity });
    setOpacity(newOpacity);
    
    if (shouldNotifyParent) {
      const rgbaColor = hexToRgba(newHex);
      const colorWithOpacity = `rgba(${Math.round(rgbaColor.r)}, ${Math.round(rgbaColor.g)}, ${Math.round(rgbaColor.b)}, ${newOpacity})`;
      onColorChange(colorWithOpacity);
    }
  }, [opacity, onColorChange]);

  // Update all color formats when HSB changes
  useEffect(() => {
    if (!isUserTyping && !isDragging) {
      const newHex = hsbToHex(hsb);
      if (newHex !== hex) {
        updateAllColorFormats(newHex);
      }
    }
  }, [hsb, hex, isUserTyping, isDragging, updateAllColorFormats]);

  // Update component when selectedColor prop changes
  useEffect(() => {
    if (selectedColor !== hex) {
      updateAllColorFormats(selectedColor, opacity, false); // Don't notify parent when prop changes
    }
  }, [selectedColor, updateAllColorFormats, opacity]);

  // --- Input handlers ---
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setIsUserTyping(true);
    setHex(e.target.value);
  };

  const handleHexKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsUserTyping(false);
      const value = e.currentTarget.value;
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        updateAllColorFormats(value);
      }
    }
  };

  const handleHexBlur = () => {
    setIsUserTyping(false);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      updateAllColorFormats(hex);
    }
  };

  // Generic input field handler
  const createInputHandler = (
    format: 'RGBA' | 'HSLA',
    field: keyof RGBA | keyof HSLA,
    converter: (value: any) => string
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      const value = parseFloat(e.target.value);
      if (!isNaN(value)) {
        setIsUserTyping(true);
        if (format === 'RGBA') {
          setRgba(prev => ({ ...prev, [field]: value }));
        } else {
          setHsla(prev => ({ ...prev, [field]: value }));
        }
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setIsUserTyping(false);
        const value = parseFloat(e.currentTarget.value);
        if (!isNaN(value)) {
          const newColor = converter({ ...(format === 'RGBA' ? rgba : hsla), [field]: value });
          updateAllColorFormats(newColor);
        }
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsUserTyping(false);
      const value = parseFloat(e.target.value);
      if (!isNaN(value)) {
        const newColor = converter({ ...(format === 'RGBA' ? rgba : hsla), [field]: value });
        updateAllColorFormats(newColor);
      }
    };

    return { handleChange, handleKeyDown, handleBlur };
  };

  // Add color to recent colors
  const addToRecentColors = useCallback((color: string) => {
    if (!onRecentColorChange || !color || color.length < 3) return;
    
    const updatedRecentColors = [
      color,
      ...recentColors.filter(c => c !== color)
    ].slice(0, 5);
    
    onRecentColorChange(updatedRecentColors);
  }, [onRecentColorChange, recentColors]);

  // Handle recent color click
  const handleRecentColorClick = (color: string) => {
    updateAllColorFormats(color);
    addToRecentColors(color);
  };

  // --- Hue slider ---
  const handleHueChange = (e: Event, value: number | number[]) => {
    if (!isDragging) setIsDragging(true);
    
    const newHsb = { ...hsb, h: value as number };
    setHsb(newHsb);
    const newHex = hsbToHex(newHsb);
    updateAllColorFormats(newHex, opacity, false); // Don't notify parent during dragging
  };

  const handleHueChangeCommitted = () => {
    setIsDragging(false);
    // Notify parent when dragging stops
    const rgbaColor = hexToRgba(hex);
    const colorWithOpacity = `rgba(${Math.round(rgbaColor.r)}, ${Math.round(rgbaColor.g)}, ${Math.round(rgbaColor.b)}, ${opacity})`;
    onColorChange(colorWithOpacity);
    addToRecentColors(hex);
  };

  // --- Opacity slider ---
  const handleOpacityChange = (e: Event, value: number | number[]) => {
    if (!isDragging) setIsDragging(true);
    
    const newOpacity = value as number;
    updateAllColorFormats(hex, newOpacity, false); // Don't notify parent during dragging
  };

  const handleOpacityChangeCommitted = () => {
    setIsDragging(false);
    // Notify parent when dragging stops
    const rgbaColor = hexToRgba(hex);
    const colorWithOpacity = `rgba(${Math.round(rgbaColor.r)}, ${Math.round(rgbaColor.g)}, ${Math.round(rgbaColor.b)}, ${opacity})`;
    onColorChange(colorWithOpacity);
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
    updateAllColorFormats(newHex, opacity, false); // Don't notify parent during dragging
  }, [hsb, updateAllColorFormats, opacity]);

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
    // Notify parent when dragging stops
    const rgbaColor = hexToRgba(hex);
    const colorWithOpacity = `rgba(${Math.round(rgbaColor.r)}, ${Math.round(rgbaColor.g)}, ${Math.round(rgbaColor.b)}, ${opacity})`;
    onColorChange(colorWithOpacity);
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

  // Reusable input field component
  const ColorInputField = ({ 
    label, 
    value, 
    onChange, 
    onKeyDown, 
    onBlur, 
    inputProps, 
    flex = 1 
  }: {
    label: string;
    value: number | string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    flex?: number;
  }) => (
    <TextField
      label={label}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      onClick={(e) => e.stopPropagation()}
      slotProps={{
        input: inputProps as any
      }}
      sx={{ ...commonTextFieldStyles, flex }}
      variant="outlined"
    />
  );

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
        <Box sx={{ position: 'relative', zIndex: 10001, py: 0.5 }}>
          <Slider
            value={hsb.h}
            min={0}
            max={360}
            onChange={handleHueChange}
            onChangeCommitted={handleHueChangeCommitted}
            sx={{
              height: 6,
              position: 'relative',
              "& .MuiSlider-rail": {
                background: `linear-gradient(to right,
                  hsl(0,100%,60%), hsl(30,100%,60%), hsl(60,100%,60%), hsl(90,100%,60%),
                  hsl(120,100%,60%), hsl(150,100%,60%), hsl(180,100%,60%), hsl(210,100%,60%),
                  hsl(240,100%,60%), hsl(270,100%,60%), hsl(300,100%,60%), hsl(330,100%,60%),
                  hsl(360,100%,60%))`,
                height: 6,
                borderRadius: 4,
                opacity: 1
              },
              "& .MuiSlider-track": {
                background: 'transparent',
                height: 6,
                borderRadius: 4,
                opacity: 1
              },
              "& .MuiSlider-thumb": {
                width: 14, 
                height: 14, 
                backgroundColor: "#fff", 
                border: "2px solid #888",
                borderRadius: '50%',
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }
            }}
          />
        </Box>

        {/* Opacity Slider */}
        <Box sx={{ position: 'relative', zIndex: 10001, mt: 0.25, py: 0.5 }}>
          <Slider
            value={opacity}
            min={0}
            max={1}
            step={0.01}
            onChange={handleOpacityChange}
            onChangeCommitted={handleOpacityChangeCommitted}
            sx={{
              height: 6,
              position: 'relative',
              "& .MuiSlider-rail": {
                background: `linear-gradient(to right, 
                  rgba(0,0,0,0), rgba(0,0,0,0.5), rgba(0,0,0,1))`,
                height: 6,
                borderRadius: 4,
                opacity: 1
              },
              "& .MuiSlider-track": {
                background: 'transparent',
                height: 6,
                borderRadius: 4,
                opacity: 1
              },
              "& .MuiSlider-thumb": {
                width: 14, 
                height: 14, 
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
            mb: 1.5,
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
                slotProps={{
                  input: {
                    maxLength: 7
                  } as any
                }}
                onClick={(e) => e.stopPropagation()}
                sx={{
                  ...commonTextFieldStyles,
                  '& .MuiInputBase-root': {
                    ...commonTextFieldStyles['& .MuiInputBase-root'],
                    zIndex: 10004,
                  },
                  '& .MuiInputBase-input': {
                    ...commonTextFieldStyles['& .MuiInputBase-input'],
                    zIndex: 10005,
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
                {(['r', 'g', 'b', 'a'] as const).map((field) => {
                  const handlers = createInputHandler('RGBA', field, rgbaToHex);
                  return (
                    <ColorInputField
                      key={field}
                      label={field.toUpperCase()}
                      value={field === 'a' ? rgba[field] : Math.round(rgba[field])}
                      onChange={handlers.handleChange}
                      onKeyDown={handlers.handleKeyDown}
                      onBlur={handlers.handleBlur}
                      inputProps={{ 
                        min: 0, 
                        max: field === 'a' ? 1 : 255,
                        step: field === 'a' ? 0.1 : 1
                      }}
                    />
                  );
                })}
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block', fontSize: '11px' }}>
                Press Enter in any field to apply
              </Typography>
            </Box>
          )}

          {colorFormat === 'HSLA' && (
            <Box>
              <Box sx={{ display: 'flex', gap: 1, zIndex: 10003, position: 'relative' }}>
                {(['h', 's', 'l', 'a'] as const).map((field) => {
                  const handlers = createInputHandler('HSLA', field, hslaToHex);
                  return (
                    <ColorInputField
                      key={field}
                      label={field.toUpperCase()}
                      value={field === 'a' ? hsla[field] : Math.round(hsla[field])}
                      onChange={handlers.handleChange}
                      onKeyDown={handlers.handleKeyDown}
                      onBlur={handlers.handleBlur}
                      inputProps={{ 
                        min: 0, 
                        max: field === 'h' ? 360 : 100,
                        step: field === 'a' ? 0.1 : 1
                      }}
                    />
                  );
                })}
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
