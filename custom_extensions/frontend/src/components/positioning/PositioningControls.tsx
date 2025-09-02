// components/positioning/PositioningControls.tsx
// Control panel for positioning operations

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Move, 
  RotateCw, 
  Square, 
  Grid3X3, 
  Undo, 
  Redo, 
  RotateCcw,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react';

import { 
  PositionableItem, 
  PositioningMode 
} from '@/types/positioning';

interface PositioningControlsProps {
  selectedItems: PositionableItem[];
  mode: PositioningMode;
  showGrid: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onModeChange: (mode: PositioningMode) => void;
  onToggleGrid: () => void;
  onResetDefaults: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onAlignItems: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onDistributeItems: (direction: 'horizontal' | 'vertical') => void;
  onLockSelected: () => void;
  onUnlockSelected: () => void;
  onToggleVisibility: () => void;
}

export const PositioningControls: React.FC<PositioningControlsProps> = ({
  selectedItems,
  mode,
  showGrid,
  canUndo,
  canRedo,
  onModeChange,
  onToggleGrid,
  onResetDefaults,
  onUndo,
  onRedo,
  onDeleteSelected,
  onDuplicateSelected,
  onAlignItems,
  onDistributeItems,
  onLockSelected,
  onUnlockSelected,
  onToggleVisibility
}) => {
  const hasSelection = selectedItems.length > 0;
  const hasMultipleSelection = selectedItems.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
    >
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-center gap-2">
          {/* Mode Selector */}
          <div className="flex bg-gray-100 rounded-md p-1">
            <button
              onClick={() => onModeChange('template')}
              className={`
                px-3 py-1 rounded text-sm font-medium transition-colors
                ${mode === 'template' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
              title="Template Mode"
            >
              Template
            </button>
            <button
              onClick={() => onModeChange('hybrid')}
              className={`
                px-3 py-1 rounded text-sm font-medium transition-colors
                ${mode === 'hybrid' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
              title="Hybrid Mode"
            >
              Hybrid
            </button>
            <button
              onClick={() => onModeChange('free')}
              className={`
                px-3 py-1 rounded text-sm font-medium transition-colors
                ${mode === 'free' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
              title="Free Mode"
            >
              Free
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300" />

          {/* Grid Toggle */}
          <button
            onClick={onToggleGrid}
            className={`
              p-2 rounded-md transition-colors
              ${showGrid 
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
            title="Toggle Grid"
          >
            <Grid3X3 size={18} />
          </button>

          <div className="w-px h-6 bg-gray-300" />

          {/* Undo/Redo */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`
              p-2 rounded-md transition-colors
              ${canUndo 
                ? 'text-gray-600 hover:bg-gray-100' 
                : 'text-gray-300 cursor-not-allowed'
              }
            `}
            title="Undo"
          >
            <Undo size={18} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`
              p-2 rounded-md transition-colors
              ${canRedo 
                ? 'text-gray-600 hover:bg-gray-100' 
                : 'text-gray-300 cursor-not-allowed'
              }
            `}
            title="Redo"
          >
            <Redo size={18} />
          </button>

          <div className="w-px h-6 bg-gray-300" />

          {/* Selection-dependent controls */}
          <AnimatePresence>
            {hasSelection && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                {/* Copy/Delete */}
                <button
                  onClick={onDuplicateSelected}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="Duplicate Selected"
                >
                  <Copy size={18} />
                </button>
                <button
                  onClick={onDeleteSelected}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete Selected"
                >
                  <Trash2 size={18} />
                </button>

                <div className="w-px h-6 bg-gray-300" />

                {/* Lock/Unlock */}
                <button
                  onClick={onLockSelected}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="Lock Selected"
                >
                  <Lock size={18} />
                </button>
                <button
                  onClick={onUnlockSelected}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="Unlock Selected"
                >
                  <Unlock size={18} />
                </button>

                {/* Visibility */}
                <button
                  onClick={onToggleVisibility}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="Toggle Visibility"
                >
                  <Eye size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Multi-selection controls */}
          <AnimatePresence>
            {hasMultipleSelection && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <div className="w-px h-6 bg-gray-300" />

                {/* Alignment */}
                <div className="flex bg-gray-50 rounded-md p-1">
                  <button
                    onClick={() => onAlignItems('left')}
                    className="p-1 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all"
                    title="Align Left"
                  >
                    <AlignLeft size={14} />
                  </button>
                  <button
                    onClick={() => onAlignItems('center')}
                    className="p-1 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all"
                    title="Align Center"
                  >
                    <AlignCenter size={14} />
                  </button>
                  <button
                    onClick={() => onAlignItems('right')}
                    className="p-1 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all"
                    title="Align Right"
                  >
                    <AlignRight size={14} />
                  </button>
                </div>

                {/* Distribution */}
                <div className="flex bg-gray-50 rounded-md p-1">
                  <button
                    onClick={() => onDistributeItems('horizontal')}
                    className="p-1 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all"
                    title="Distribute Horizontally"
                  >
                    <Square size={14} />
                  </button>
                  <button
                    onClick={() => onDistributeItems('vertical')}
                    className="p-1 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all"
                    title="Distribute Vertically"
                  >
                    <Square size={14} className="rotate-90" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-px h-6 bg-gray-300" />

          {/* Reset Button */}
          <button
            onClick={onResetDefaults}
            className="p-2 text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
            title="Reset to Defaults"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Selection Info */}
        <AnimatePresence>
          {hasSelection && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-gray-200"
            >
              <div className="text-sm text-gray-600">
                {selectedItems.length === 1 
                  ? `Selected: ${selectedItems[0].type} (${selectedItems[0].id})`
                  : `Selected: ${selectedItems.length} items`
                }
              </div>
              {selectedItems.length === 1 && (
                <div className="text-xs text-gray-500 mt-1">
                  Position: {Math.round(selectedItems[0].position.x)}, {Math.round(selectedItems[0].position.y)} • 
                  Size: {Math.round(selectedItems[0].position.width)} × {Math.round(selectedItems[0].position.height)}
                  {selectedItems[0].position.rotation && 
                    ` • Rotation: ${Math.round(selectedItems[0].position.rotation)}°`
                  }
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PositioningControls;
