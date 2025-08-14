"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

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
        ref={buttonRef}
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-1 px-2 py-1 bg-white/90 hover:bg-white text-gray-700 text-xs rounded-md transition-colors shadow-sm border border-gray-200"
      >
        <Settings className="w-3 h-3" />
        <ChevronDown className={`w-3 h-3 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Basic Actions Dropdown */}
      {showMenu && (
        <div 
          ref={dropdownRef}
          className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          style={{
            transform: 'translateY(0)',
            maxHeight: 'calc(100vh - 100px)'
          }}
        >
          <div className="py-1">
            {/* Quick Size Actions */}
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Quick Size</div>
              <div className="grid grid-cols-2 gap-1">
                {quickSizePresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      console.log(`Applying size preset: ${preset.name}, width: ${preset.width}`);
                      const updatedBlock = {
                        ...imageBlock,
                        width: preset.width,
                        height: preset.height
                      };
                      onImageChange(updatedBlock);
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
