"use client";

import React, { useState } from 'react';
import { ImageBlock } from '@/types/textPresentation';
import { Settings, ChevronDown, Edit3, ZoomIn, Move, Palette } from 'lucide-react';

interface ImageBasicActionsProps {
  imageBlock: ImageBlock;
  onImageChange: (updatedBlock: ImageBlock) => void;
  onOpenAdvancedSettings: () => void;
}

const ImageBasicActions: React.FC<ImageBasicActionsProps> = ({
  imageBlock,
  onImageChange,
  onOpenAdvancedSettings
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const updateImageProperty = (property: keyof ImageBlock, value: any) => {
    const updatedBlock = { ...imageBlock, [property]: value };
    onImageChange(updatedBlock);
  };

  const quickSizePresets = [
    { name: 'Small', width: 200, height: 'auto' },
    { name: 'Medium', width: 400, height: 'auto' },
    { name: 'Large', width: 600, height: 'auto' },
    { name: 'Extra Large', width: 800, height: 'auto' }
  ];

  const alignmentOptions = [
    { value: 'left', icon: '⬅️', label: 'Left' },
    { value: 'center', icon: '⬆️', label: 'Center' },
    { value: 'right', icon: '➡️', label: 'Right' }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-md transition-colors"
      >
        <Settings className="w-4 h-4" />
        Actions
        <ChevronDown className={`w-3 h-3 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Basic Actions Dropdown */}
      {showMenu && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="py-1">
            {/* Quick Size Actions */}
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Quick Size</div>
              <div className="grid grid-cols-2 gap-1">
                {quickSizePresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      updateImageProperty('width', preset.width);
                      updateImageProperty('height', preset.height);
                      setShowMenu(false);
                    }}
                    className="w-full px-2 py-1 text-left text-xs hover:bg-blue-50 rounded flex items-center justify-between"
                  >
                    <span>{preset.name}</span>
                    <span className="text-gray-500">{preset.width}px</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Alignment Actions */}
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Alignment</div>
              <div className="flex gap-1">
                {alignmentOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      updateImageProperty('alignment', option.value);
                      setShowMenu(false);
                    }}
                    className="flex-1 px-2 py-1 text-xs hover:bg-blue-50 rounded text-center"
                  >
                    {option.icon} {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Border Radius Actions */}
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Corner Style</div>
              <div className="space-y-1">
                {[
                  { value: '0px', label: 'Sharp Corners' },
                  { value: '4px', label: 'Slightly Rounded' },
                  { value: '8px', label: 'Rounded' },
                  { value: '16px', label: 'Very Rounded' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      updateImageProperty('borderRadius', option.value);
                      setShowMenu(false);
                    }}
                    className="w-full px-2 py-1 text-left text-xs hover:bg-blue-50 rounded"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="px-3 py-2">
              <button
                onClick={() => {
                  onOpenAdvancedSettings();
                  setShowMenu(false);
                }}
                className="w-full px-2 py-2 text-left text-sm hover:bg-blue-50 rounded flex items-center gap-2 font-medium text-blue-600"
              >
                <Edit3 className="w-4 h-4" />
                Open Advanced Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageBasicActions;
