'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogTitle, DialogContent, Slider, Typography, Box, TextField } from "@mui/material";

interface ColorPalettePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onColorChange: (color: string) => void;
  initialColor?: string;
  position?: { x: number; y: number };
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
}) => {
  // Initialize once to avoid flickering
  const [hsb, setHsb] = useState<HSB>(() => hexToHsb(initialColor));
  const [hex, setHex] = useState(initialColor);
  const [rgba, setRgba] = useState<RGBA>(() => hexToRgba(initialColor));
  const [hsla, setHsla] = useState<HSLA>(() => hexToHsla(initialColor));
  const [colorFormat, setColorFormat] = useState<ColorFormat>('HEX');

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

  // Update all color formats when HSB changes
  useEffect(() => {
    const newHex = hsbToHex(hsb);
    if (newHex !== hex) {
      setHex(newHex);
      setRgba(hexToRgba(newHex));
      setHsla(hexToHsla(newHex));
      onColorChange(newHex);
    }
  }, [hsb, onColorChange, hex]);

  // --- Input handlers ---
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHex(value);
    // Only update other formats if we have a complete valid HEX code
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setHsb(hexToHsb(value));
      setRgba(hexToRgba(value));
      setHsla(hexToHsla(value));
      onColorChange(value);
    }
  };

  const handleRgbaChange = (field: keyof RGBA) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      const newRgba = { ...rgba, [field]: value };
      setRgba(newRgba);
      const newHex = rgbaToHex(newRgba);
      setHex(newHex);
      setHsb(hexToHsb(newHex));
      setHsla(hexToHsla(newHex));
      onColorChange(newHex);
    }
  };

  const handleHslaChange = (field: keyof HSLA) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      const newHsla = { ...hsla, [field]: value };
      setHsla(newHsla);
      const newHex = hslaToHex(newHsla);
      setHex(newHex);
      setHsb(hexToHsb(newHex));
      setRgba(hexToRgba(newHex));
      onColorChange(newHex);
    }
  };

  // --- Hue slider ---
  const handleHueChange = (e: Event, value: number | number[]) => {
    setHsb(prev => ({ ...prev, h: value as number }));
  };

  // --- Saturation/Brightness square ---
  const handleSBUpdate = useCallback((clientX: number, clientY: number) => {
    if (!sbRef.current) return;
    const rect = sbRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    setHsb(prev => ({
      ...prev,
      s: Math.round(x * 100),
      b: Math.round((1 - y) * 100)
    }));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    handleSBUpdate(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDraggingRef.current) handleSBUpdate(e.clientX, e.clientY);
  }, [handleSBUpdate]);

  const handleMouseUp = () => { isDraggingRef.current = false; };

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
      slotProps={{
        paper: {
          sx: position ? {
            position: 'absolute',
            left: position.x,
            top: position.y,
            margin: 0,
          } : {}
        }
      }}
    >
      <DialogContent>
        {/* Hue Slider */}
        <Slider
          value={hsb.h}
          min={0}
          max={360}
          onChange={handleHueChange}
          sx={{
            height: 8,
            "& .MuiSlider-track": {
              background: `linear-gradient(to right,
                hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%),
                hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%),
                hsl(360,100%,50%))`
            },
            "& .MuiSlider-thumb": {
              width: 16, height: 16, backgroundColor: "#fff", border: "2px solid #888"
            }
          }}
        />

        {/* Saturation/Brightness Square */}
        <Box
          ref={sbRef}
          onMouseDown={handleMouseDown}
          sx={{
            width: '100%',
            height: 128,
            border: '1px solid #ccc',
            borderRadius: 1,
            cursor: 'crosshair',
            position: 'relative',
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
          p: 1, 
          bgcolor: 'grey.200', 
          borderRadius: 1,
          display: 'flex',
          gap: 0.5
        }}>
          {(['HEX', 'RGBA', 'HSLA'] as ColorFormat[]).map((format) => (
            <button
              key={format}
              onClick={() => setColorFormat(format)}
              style={{
                flex: 1,
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: colorFormat === format ? 'bold' : 'normal',
                backgroundColor: colorFormat === format ? '#fff' : 'transparent',
                color: colorFormat === format ? '#000' : '#666',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {format}
            </button>
          ))}
        </Box>

        {/* Conditional Input Fields */}
        {colorFormat === 'HEX' && (
          <TextField
            label="HEX Color"
            value={hex}
            onChange={handleHexChange}
            fullWidth
            variant="outlined"
            inputProps={{ maxLength: 7 }}
            sx={{ mt: 2 }}
          />
        )}

        {colorFormat === 'RGBA' && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <TextField
              label="R"
              type="number"
              value={Math.round(rgba.r)}
              onChange={handleRgbaChange('r')}
              inputProps={{ min: 0, max: 255 }}
              sx={{ flex: 1 }}
              variant="outlined"
            />
            <TextField
              label="G"
              type="number"
              value={Math.round(rgba.g)}
              onChange={handleRgbaChange('g')}
              inputProps={{ min: 0, max: 255 }}
              sx={{ flex: 1 }}
              variant="outlined"
            />
            <TextField
              label="B"
              type="number"
              value={Math.round(rgba.b)}
              onChange={handleRgbaChange('b')}
              inputProps={{ min: 0, max: 255 }}
              sx={{ flex: 1 }}
              variant="outlined"
            />
            <TextField
              label="A"
              type="number"
              value={rgba.a}
              onChange={handleRgbaChange('a')}
              inputProps={{ min: 0, max: 1, step: 0.1 }}
              sx={{ flex: 1 }}
              variant="outlined"
            />
          </Box>
        )}

        {colorFormat === 'HSLA' && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <TextField
              label="H"
              type="number"
              value={Math.round(hsla.h)}
              onChange={handleHslaChange('h')}
              inputProps={{ min: 0, max: 360 }}
              sx={{ flex: 1 }}
              variant="outlined"
            />
            <TextField
              label="S"
              type="number"
              value={Math.round(hsla.s)}
              onChange={handleHslaChange('s')}
              inputProps={{ min: 0, max: 100 }}
              sx={{ flex: 1 }}
              variant="outlined"
            />
            <TextField
              label="L"
              type="number"
              value={Math.round(hsla.l)}
              onChange={handleHslaChange('l')}
              inputProps={{ min: 0, max: 100 }}
              sx={{ flex: 1 }}
              variant="outlined"
            />
            <TextField
              label="A"
              type="number"
              value={hsla.a}
              onChange={handleHslaChange('a')}
              inputProps={{ min: 0, max: 1, step: 0.1 }}
              sx={{ flex: 1 }}
              variant="outlined"
            />
          </Box>
        )}

        {/* Color Preview */}
        <Box sx={{
          mt: 2, width: 40, height: 40, border: '1px solid #ccc',
          borderRadius: 1, backgroundColor: hex
        }} />
      </DialogContent>
    </Dialog>
  );
};

export default ColorPalettePopup;
