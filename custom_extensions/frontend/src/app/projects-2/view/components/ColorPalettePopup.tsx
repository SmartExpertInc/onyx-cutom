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

  // Update HEX when HSB changes
  useEffect(() => {
    const newHex = hsbToHex(hsb);
    if (newHex !== hex) {
      setHex(newHex);
      onColorChange(newHex);
    }
  }, [hsb, onColorChange, hex]);

  // --- HEX input handler ---
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHex(value);
    // Only update HSB if we have a complete valid HEX code
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setHsb(hexToHsb(value));
      onColorChange(value);
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

        {/* HEX Input */}
        <TextField
          label="HEX Color"
          value={hex}
          onChange={handleHexChange}
          fullWidth
          variant="outlined"
          inputProps={{ maxLength: 7 }}
          sx={{ mt: 2 }}
        />

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
