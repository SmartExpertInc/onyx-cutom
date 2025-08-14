"use client";

import React, { useState } from 'react';
import { ImageBlock } from '@/types/textPresentation';
import { Settings, ZoomIn, ZoomOut, ChevronDown, Edit3 } from 'lucide-react';

interface BasicImageActionsProps {
  imageBlock: ImageBlock;
  onImageChange: (updatedBlock: ImageBlock) => void;
  onOpenAdvancedSettings: () => void;
}

const BasicImageActions: React.FC<BasicImageActionsProps> = ({
  imageBlock,
  onImageChange,
  onOpenAdvancedSettings
}) => {
  const [showActions, setShowActions] = useState(false);

  const updateImageProperty = (property: keyof ImageBlock, value: any) => {
    const updatedBlock = { ...imageBlock, [property]: value };
    onImageChange(updatedBlock);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowActions(!showActions)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md transition-colors"
      >
        <Settings className="w-4 h-4" />
        Actions
        <ChevronDown className={`w-3 h-3 transition-transform ${showActions ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Basic Actions Dropdown Menu */}
      {showActions && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="py-1">
            {/* Size Actions */}
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Size</div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    updateImageProperty('width', 200);
                    updateImageProperty('height', 'auto');
                    setShowActions(false);
                  }}
                  className="w-full px-2 py-1 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <ZoomOut className="w-4 h-4" />
                  Make Smaller
                </button>
                <button
                  onClick={() => {
                    updateImageProperty('width', 600);
                    updateImageProperty('height', 'auto');
                    setShowActions(false);
                  }}
                  className="w-full px-2 py-1 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <ZoomIn className="w-4 h-4" />
                  Make Larger
                </button>
              </div>
            </div>

            {/* Alignment Actions */}
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Alignment</div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    updateImageProperty('alignment', 'left');
                    setShowActions(false);
                  }}
                  className="w-full px-2 py-1 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  ⬅️ Align Left
                </button>
                <button
                  onClick={() => {
                    updateImageProperty('alignment', 'center');
                    setShowActions(false);
                  }}
                  className="w-full px-2 py-1 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  ⬆️ Align Center
                </button>
                <button
                  onClick={() => {
                    updateImageProperty('alignment', 'right');
                    setShowActions(false);
                  }}
                  className="w-full px-2 py-1 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  ➡️ Align Right
                </button>
              </div>
            </div>

            {/* Style Actions */}
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Style</div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    updateImageProperty('borderRadius', '0px');
                    setShowActions(false);
                  }}
                  className="w-full px-2 py-1 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  🔲 Sharp Corners
                </button>
                <button
                  onClick={() => {
                    updateImageProperty('borderRadius', '8px');
                    setShowActions(false);
                  }}
                  className="w-full px-2 py-1 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  🔲 Rounded Corners
                </button>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="px-3 py-2">
              <button
                onClick={() => {
                  setShowActions(false);
                  onOpenAdvancedSettings();
                }}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-blue-600 font-medium"
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

export default BasicImageActions;

