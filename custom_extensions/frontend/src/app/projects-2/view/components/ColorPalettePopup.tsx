'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";

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

// ✅ Memoized SB handle (prevents re-creation on each render)
const SBHandle: React.FC<{ s: number; b: number }> = React.memo(({ s, b }) => (
  <div
    className="absolute w-3 h-3 bg-white border-2 border-gray-800 rounded-full pointer-events-none will-change-transform"
    style={{
      left: `${s}%`,
      top: `${100 - b}%`,
      transform: "translate(-50%, -50%)",
    }}
  />
));

const ColorPalettePopup: React.FC<ColorPalettePopupProps> = ({
  isOpen,
  onClose,
  onColorChange,
  initialColor = "#ff0000",
  position = { x: 0, y: 0 },
}) => {
  const [hsb, setHsb] = useState<HSB>({ h: 0, s: 100, b: 100 });
  const [hex, setHex] = useState(initialColor);
  const [isDragging, setIsDragging] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const sbRef = useRef<HTMLDivElement>(null);

  // --- HEX ↔ HSB conversion helpers ---
  const hexToHsb = (hex: string): HSB => {
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
  };

  const hsbToHex = (hsb: HSB): string => {
    const { h, s, b } = hsb;
    const sDecimal = s / 100;
    const bDecimal = b / 100;

    const c = bDecimal * sDecimal;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = bDecimal - c;

    let r = 0,
      g = 0,
      blue = 0;

    if (h >= 0 && h < 60) {
      r = c;
      g = x;
    } else if (h >= 60 && h < 120) {
      r = x;
      g = c;
    } else if (h >= 120 && h < 180) {
      g = c;
      blue = x;
    } else if (h >= 180 && h < 240) {
      g = x;
      blue = c;
    } else if (h >= 240 && h < 300) {
      r = x;
      blue = c;
    } else {
      r = c;
      blue = x;
    }

    const rHex = Math.round((r + m) * 255)
      .toString(16)
      .padStart(2, "0");
    const gHex = Math.round((g + m) * 255)
      .toString(16)
      .padStart(2, "0");
    const bHex = Math.round((blue + m) * 255)
      .toString(16)
      .padStart(2, "0");

    return `#${rHex}${gHex}${bHex}`;
  };

  // --- Init ---
  useEffect(() => {
    if (initialColor) {
      const hsbColor = hexToHsb(initialColor);
      setHsb(hsbColor);
      setHex(initialColor);
    }
  }, [initialColor]);

  useEffect(() => {
    const newHex = hsbToHex(hsb);
    setHex(newHex);
    onColorChange(newHex);
  }, [hsb, onColorChange]);

  // --- HEX input handler ---
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
      setHex(value);
      const hsbColor = hexToHsb(value);
      setHsb(hsbColor);
    } else {
      setHex(value);
    }
  };

  // --- Hue slider ---
  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHue = parseInt(e.target.value);
    setHsb((prev) => ({ ...prev, h: newHue }));
  };

  // --- SB square ---
  const handleSBClick = useCallback((e: React.MouseEvent) => {
    if (!sbRef.current) return;
    const rect = sbRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setHsb((prev) => ({
      ...prev,
      s: Math.round(x * 100),
      b: Math.round((1 - y) * 100),
    }));
  }, []);

  const handleSBMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleSBClick(e);
  };

  const handleSBMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && sbRef.current) {
        const rect = sbRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        setHsb((prev) => ({
          ...prev,
          s: Math.round(x * 100),
          b: Math.round((1 - y) * 100),
        }));
      }
    },
    [isDragging]
  );

  const handleSBMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleSBMouseMove);
      document.addEventListener("mouseup", handleSBMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleSBMouseMove);
        document.removeEventListener("mouseup", handleSBMouseUp);
      };
    }
  }, [isDragging, handleSBMouseMove]);

  // --- Close on outside click ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hueGradient = `linear-gradient(to right, 
    hsl(0, 100%, 50%), 
    hsl(60, 100%, 50%), 
    hsl(120, 100%, 50%), 
    hsl(180, 100%, 50%), 
    hsl(240, 100%, 50%), 
    hsl(300, 100%, 50%), 
    hsl(360, 100%, 50%)
  )`;

  const sbGradient = `linear-gradient(to top, #000, transparent), 
    linear-gradient(to right, #fff, hsl(${hsb.h}, 100%, 50%))`;

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[280px]"
      style={{ left: position.x, top: position.y }}
    >
      {/* Hue Slider */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Hue</label>
        <div className="relative">
          <input
            type="range"
            min="0"
            max="360"
            value={hsb.h}
            onChange={handleHueChange}
            className="w-full h-8 appearance-none bg-transparent cursor-pointer"
            style={{
              background: hueGradient,
              borderRadius: "4px",
            }}
          />
          {/* ✅ fixed: no conflicting transforms */}
          <div
            className="absolute top-1/2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full pointer-events-none will-change-transform"
            style={{
              left: `${(hsb.h / 360) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      </div>

      {/* Saturation/Brightness Square */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Saturation & Brightness
        </label>
        <div
          ref={sbRef}
          className="relative w-full h-32 rounded-lg cursor-crosshair border border-gray-300"
          style={{ background: sbGradient }}
          onMouseDown={handleSBMouseDown}
        >
          <SBHandle s={hsb.s} b={hsb.b} />
        </div>
      </div>

      {/* HEX Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          HEX Color
        </label>
        <input
          type="text"
          value={hex}
          onChange={handleHexChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="#000000"
          maxLength={7}
        />
      </div>

      {/* Color Preview */}
      <div className="mt-4 flex items-center space-x-3">
        <div
          className="w-8 h-8 rounded border border-gray-300"
          style={{ backgroundColor: hex }}
        />
        <span className="text-sm text-gray-600">{hex.toUpperCase()}</span>
      </div>
    </div>
  );
};

export default ColorPalettePopup;
