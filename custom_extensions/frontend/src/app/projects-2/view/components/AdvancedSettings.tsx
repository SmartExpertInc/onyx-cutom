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
            className="w-20 px-2 py-1 pr-6 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="0"
          />
          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 pointer-events-none">°</span>
        </div>
      </div>

      {/* Layout */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Layout</span>
          <div className="flex space-x-4 text-xs text-gray-500">
            <span>X</span>
            <span>Y</span>
            <span>Width</span>
            <span>Height</span>
          </div>
        </div>
        
        {/* X and Y position */}
        <div className="flex space-x-2">
          <div className="flex-1">
            <input
              type="number"
              value={positionX}
              onChange={(e) => handleNumberInput(e.target.value, onPositionXChange)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="0"
            />
          </div>
          <div className="flex-1">
            <input
              type="number"
              value={positionY}
              onChange={(e) => handleNumberInput(e.target.value, onPositionYChange)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        {/* Width and Height */}
        <div className="flex space-x-2">
          <div className="flex-1">
            <input
              type="number"
              value={width}
              onChange={(e) => handleNumberInput(e.target.value, onWidthChange)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="100"
            />
          </div>
          <div className="flex-1">
            <input
              type="number"
              value={height}
              onChange={(e) => handleNumberInput(e.target.value, onHeightChange)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
