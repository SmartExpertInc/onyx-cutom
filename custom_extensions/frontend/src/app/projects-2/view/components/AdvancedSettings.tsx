import React, { useState } from 'react';

interface AdvancedSettingsProps {
  rotation?: number;
  onRotationChange?: (value: number) => void;
  positionX?: number;
  onPositionXChange?: (value: number) => void;
  positionY?: number;
  onPositionYChange?: (value: number) => void;
  width?: number;
  onWidthChange?: (value: number) => void;
  height?: number;
  onHeightChange?: (value: number) => void;
}

export default function AdvancedSettings({
  rotation = 0,
  onRotationChange,
  positionX = 0,
  onPositionXChange,
  positionY = 0,
  onPositionYChange,
  width = 100,
  onWidthChange,
  height = 100,
  onHeightChange
}: AdvancedSettingsProps) {
  const handleNumberInput = (value: string, onChange?: (value: number) => void) => {
    const numValue = parseFloat(value) || 0;
    onChange?.(numValue);
  };

  return (
    <div className="space-y-4">
      {/* Rotation */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Rotation</span>
        <div className="relative">
          <input
            type="number"
            value={rotation}
            onChange={(e) => handleNumberInput(e.target.value, onRotationChange)}
            className="w-20 px-2 py-1 pr-6 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-700"
            placeholder="0"
          />
          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 pointer-events-none">°</span>
        </div>
      </div>

      {/* Layout */}
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-gray-700">Layout</span>
        <div className="flex flex-col space-y-4">
          {/* X and Y row */}
          <div className="flex space-x-3">
            {/* X input with label as border */}
            <div className="relative">
              <label className="absolute -top-2 left-2 px-1 text-[10px] text-gray-500 bg-white">X</label>
              <input
                type="number"
                value={positionX}
                onChange={(e) => handleNumberInput(e.target.value, onPositionXChange)}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-700"
                placeholder="0"
              />
            </div>
            
            {/* Y input with label as border */}
            <div className="relative">
              <label className="absolute -top-2 left-2 px-1 text-[10px] text-gray-500 bg-white">Y</label>
              <input
                type="number"
                value={positionY}
                onChange={(e) => handleNumberInput(e.target.value, onPositionYChange)}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-700"
                placeholder="0"
              />
            </div>
          </div>
          
          {/* Width and Height row */}
          <div className="flex space-x-3">
            {/* Width input with label as border */}
            <div className="relative">
              <label className="absolute -top-2 left-2 px-1 text-[10px] text-gray-500 bg-white">Width</label>
              <input
                type="number"
                value={width}
                onChange={(e) => handleNumberInput(e.target.value, onWidthChange)}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-700"
                placeholder="100"
              />
            </div>
            
            {/* Height input with label as border */}
            <div className="relative">
              <label className="absolute -top-2 left-2 px-1 text-[10px] text-gray-500 bg-white">Height</label>
              <input
                type="number"
                value={height}
                onChange={(e) => handleNumberInput(e.target.value, onHeightChange)}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-700"
                placeholder="100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
