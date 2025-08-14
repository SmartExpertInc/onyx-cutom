"use client";

import React, { useState } from 'react';
import { ImageBlock } from '@/types/textPresentation';

interface WordStyleImageEditorProps {
  imageBlock: ImageBlock;
  onImageChange: (updates: Partial<ImageBlock>) => void;
  isEditing?: boolean;
}

const WordStyleImageEditor: React.FC<WordStyleImageEditorProps> = ({
  imageBlock,
  onImageChange,
  isEditing = true
}) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const handleImageClick = (event: React.MouseEvent) => {
    if (isEditing) {
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      setToolbarPosition({ 
        x: rect.left, 
        y: rect.bottom + 10 
      });
      setShowToolbar(true);
      setShowContextMenu(false);
    }
  };

  const handleImageRightClick = (event: React.MouseEvent) => {
    if (isEditing) {
      event.preventDefault();
      setContextMenuPosition({ 
        x: event.clientX, 
        y: event.clientY 
      });
      setShowContextMenu(true);
      setShowToolbar(false);
    }
  };

  const handleClickOutside = () => {
    setShowToolbar(false);
    setShowContextMenu(false);
  };

  React.useEffect(() => {
    if (showToolbar || showContextMenu) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
      
      return () => {
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('contextmenu', handleClickOutside);
      };
    }
  }, [showToolbar, showContextMenu]);

  return (
    <div className="relative inline-block group">
      <img
        src={imageBlock.src}
        alt={imageBlock.alt || 'Image'}
        className={`h-auto shadow-sm ${isEditing ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : ''}`}
        style={{
          width: imageBlock.width ? `${imageBlock.width}px` : '300px',
          height: imageBlock.height ? `${imageBlock.height}px` : 'auto',
          borderRadius: imageBlock.borderRadius || '8px',
          maxWidth: imageBlock.maxWidth || '100%'
        }}
        onClick={handleImageClick}
        onContextMenu={handleImageRightClick}
      />
      
      {/* Selection indicator */}
      {isEditing && (
        <div className="absolute inset-0 border-2 border-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      )}

      {/* Word-style Toolbar */}
      {showToolbar && (
        <div 
          className="fixed z-[9999] bg-white border border-gray-300 rounded-lg shadow-lg"
          style={{ 
            left: toolbarPosition.x, 
            top: toolbarPosition.y,
            minWidth: '300px'
          }}
        >
          <div className="bg-gray-100 px-3 py-2 border-b border-gray-300 rounded-t-lg flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Image Tools</span>
            <button onClick={() => setShowToolbar(false)} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          <div className="p-3 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Size</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const currentWidth = typeof imageBlock.width === 'number' ? imageBlock.width : 300;
                    onImageChange({ width: Math.max(50, currentWidth - 25) });
                  }}
                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Smaller
                </button>
                <button
                  onClick={() => {
                    const currentWidth = typeof imageBlock.width === 'number' ? imageBlock.width : 300;
                    onImageChange({ width: Math.min(800, currentWidth + 25) });
                  }}
                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Larger
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Alignment</label>
              <div className="flex gap-1">
                <button
                  onClick={() => onImageChange({ alignment: 'left' })}
                  className={`px-2 py-1 text-xs rounded border ${
                    imageBlock.alignment === 'left' 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Left
                </button>
                <button
                  onClick={() => onImageChange({ alignment: 'center' })}
                  className={`px-2 py-1 text-xs rounded border ${
                    imageBlock.alignment === 'center' 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Center
                </button>
                <button
                  onClick={() => onImageChange({ alignment: 'right' })}
                  className={`px-2 py-1 text-xs rounded border ${
                    imageBlock.alignment === 'right' 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Right
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Word-style Context Menu */}
      {showContextMenu && (
        <div 
          className="fixed z-[9999] bg-white border border-gray-300 rounded-lg shadow-lg min-w-[200px]"
          style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
        >
          <div className="py-1">
            <button
              onClick={() => {
                onImageChange({ width: Math.max(50, (imageBlock.width || 300) - 25) });
                setShowContextMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              Make Smaller
            </button>
            <button
              onClick={() => {
                onImageChange({ width: Math.min(800, (imageBlock.width || 300) + 25) });
                setShowContextMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              Make Larger
            </button>
            <hr className="my-1" />
            <button
              onClick={() => {
                onImageChange({ alignment: 'left' });
                setShowContextMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              Align Left
            </button>
            <button
              onClick={() => {
                onImageChange({ alignment: 'center' });
                setShowContextMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              Align Center
            </button>
            <button
              onClick={() => {
                onImageChange({ alignment: 'right' });
                setShowContextMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              Align Right
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordStyleImageEditor;
