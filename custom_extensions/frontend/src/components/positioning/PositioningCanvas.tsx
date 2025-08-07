// components/positioning/PositioningCanvas.tsx
// Main canvas component for positioning system

'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  PositionableItem, 
  Position, 
  CanvasConfig, 
  PositioningMode,
  PositioningConstraints
} from '@/types/positioning';

import { PositioningEngine } from '@/lib/positioning/PositioningEngine';
import DraggableItem from './DraggableItem';
import ItemRenderer from './ItemRenderer';
import PositioningControls from './PositioningControls';
import { SlideTheme } from '@/types/slideThemes';

interface PositioningCanvasProps {
  items: PositionableItem[];
  canvasConfig: CanvasConfig;
  mode: PositioningMode;
  theme?: SlideTheme;
  isEditable: boolean;
  onItemsChange: (items: PositionableItem[]) => void;
  onModeChange: (mode: PositioningMode) => void;
  onCanvasConfigChange?: (config: CanvasConfig) => void;
}

export const PositioningCanvas: React.FC<PositioningCanvasProps> = ({
  items,
  canvasConfig,
  mode,
  theme,
  isEditable,
  onItemsChange,
  onModeChange,
  onCanvasConfigChange
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<PositioningEngine | null>(null);
  
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [showGrid, setShowGrid] = useState(canvasConfig.showGrid || false);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize positioning engine
  useEffect(() => {
    const constraints: PositioningConstraints = {
      canvas: {
        x: 0,
        y: 0,
        width: canvasConfig.width,
        height: canvasConfig.height
      },
      gridSize: canvasConfig.gridSize || 20,
      snapToGrid: canvasConfig.snapToGrid || false,
      snapToGuides: true,
      minItemSize: { width: 50, height: 30 },
      maxItemSize: { width: canvasConfig.width, height: canvasConfig.height }
    };

    engineRef.current = new PositioningEngine(items, constraints);

    // Set up event listeners
    const engine = engineRef.current;
    
    engine.on('itemPositionChanged', ({ itemId, position }: { itemId: string, position: Position }) => {
      updateItemPosition(itemId, position);
    });

    engine.on('selectionChanged', ({ selectedIds }: { selectedIds: string[] }) => {
      setSelectedItemIds(selectedIds);
    });

    return () => {
      // Cleanup event listeners
      engine.off('itemPositionChanged', updateItemPosition);
      engine.off('selectionChanged', setSelectedItemIds);
    };
  }, [items, canvasConfig]);

  // Update item position
  const updateItemPosition = useCallback((itemId: string, newPosition: Position) => {
    const updatedItems = items.map(item => 
      item.id === itemId 
        ? { ...item, position: newPosition }
        : item
    );
    onItemsChange(updatedItems);
  }, [items, onItemsChange]);

  // Handle item selection
  const handleItemSelect = useCallback((itemId: string, multiSelect: boolean = false) => {
    if (!engineRef.current) return;
    engineRef.current.selectItem(itemId, multiSelect);
  }, []);

  // Handle canvas click (deselect all)
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (engineRef.current) {
        engineRef.current.deselectItem();
      }
    }
  }, []);

  // Handle item content change
  const handleItemContentChange = useCallback((itemId: string, newContent: any) => {
    const updatedItems = items.map(item => 
      item.id === itemId 
        ? { ...item, content: newContent }
        : item
    );
    onItemsChange(updatedItems);
  }, [items, onItemsChange]);

  // Control handlers
  const handleToggleGrid = useCallback(() => {
    const newShowGrid = !showGrid;
    setShowGrid(newShowGrid);
    
    const newConfig = { ...canvasConfig, showGrid: newShowGrid };
    if (onCanvasConfigChange) {
      onCanvasConfigChange(newConfig);
    }
  }, [showGrid, canvasConfig, onCanvasConfigChange]);

  const handleResetDefaults = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.resetToDefaults();
  }, []);

  const handleUndo = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.undo();
  }, []);

  const handleRedo = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.redo();
  }, []);

  const handleDeleteSelected = useCallback(() => {
    const remainingItems = items.filter(item => !selectedItemIds.includes(item.id));
    onItemsChange(remainingItems);
    setSelectedItemIds([]);
  }, [items, selectedItemIds, onItemsChange]);

  const handleDuplicateSelected = useCallback(() => {
    const selectedItems = items.filter(item => selectedItemIds.includes(item.id));
    const duplicatedItems = selectedItems.map(item => ({
      ...item,
      id: `${item.id}_copy_${Date.now()}`,
      position: {
        ...item.position,
        x: item.position.x + 20,
        y: item.position.y + 20
      }
    }));
    
    onItemsChange([...items, ...duplicatedItems]);
    setSelectedItemIds(duplicatedItems.map(item => item.id));
  }, [items, selectedItemIds, onItemsChange]);

  const handleAlignItems = useCallback((alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedItemIds.length < 2) return;

    const selectedItems = items.filter(item => selectedItemIds.includes(item.id));
    const bounds = {
      left: Math.min(...selectedItems.map(item => item.position.x)),
      right: Math.max(...selectedItems.map(item => item.position.x + item.position.width)),
      top: Math.min(...selectedItems.map(item => item.position.y)),
      bottom: Math.max(...selectedItems.map(item => item.position.y + item.position.height))
    };

    const updatedItems = items.map(item => {
      if (!selectedItemIds.includes(item.id)) return item;

      let newPosition = { ...item.position };

      switch (alignment) {
        case 'left':
          newPosition.x = bounds.left;
          break;
        case 'center':
          newPosition.x = bounds.left + (bounds.right - bounds.left) / 2 - item.position.width / 2;
          break;
        case 'right':
          newPosition.x = bounds.right - item.position.width;
          break;
        case 'top':
          newPosition.y = bounds.top;
          break;
        case 'middle':
          newPosition.y = bounds.top + (bounds.bottom - bounds.top) / 2 - item.position.height / 2;
          break;
        case 'bottom':
          newPosition.y = bounds.bottom - item.position.height;
          break;
      }

      return { ...item, position: newPosition };
    });

    onItemsChange(updatedItems);
  }, [items, selectedItemIds, onItemsChange]);

  const handleDistributeItems = useCallback((direction: 'horizontal' | 'vertical') => {
    if (selectedItemIds.length < 3) return;

    const selectedItems = items.filter(item => selectedItemIds.includes(item.id));
    selectedItems.sort((a, b) => {
      return direction === 'horizontal' 
        ? a.position.x - b.position.x
        : a.position.y - b.position.y;
    });

    const first = selectedItems[0];
    const last = selectedItems[selectedItems.length - 1];
    const totalSpace = direction === 'horizontal'
      ? (last.position.x + last.position.width) - first.position.x
      : (last.position.y + last.position.height) - first.position.y;

    const itemSpace = selectedItems.reduce((sum, item) => {
      return sum + (direction === 'horizontal' ? item.position.width : item.position.height);
    }, 0);

    const gap = (totalSpace - itemSpace) / (selectedItems.length - 1);

    let currentPos = direction === 'horizontal' ? first.position.x : first.position.y;

    const updatedItems = items.map(item => {
      const selectedIndex = selectedItems.findIndex(selected => selected.id === item.id);
      if (selectedIndex === -1) return item;

      const newPosition = { ...item.position };
      if (direction === 'horizontal') {
        newPosition.x = currentPos;
        currentPos += item.position.width + gap;
      } else {
        newPosition.y = currentPos;
        currentPos += item.position.height + gap;
      }

      return { ...item, position: newPosition };
    });

    onItemsChange(updatedItems);
  }, [items, selectedItemIds, onItemsChange]);

  // Render grid
  const renderGrid = () => {
    if (!showGrid || !canvasConfig.gridSize) return null;

    const lines = [];
    const gridSize = canvasConfig.gridSize;

    // Vertical lines
    for (let x = 0; x <= canvasConfig.width; x += gridSize) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={canvasConfig.height}
          stroke="#e5e7eb"
          strokeWidth="1"
          opacity="0.5"
        />
      );
    }

    // Horizontal lines
    for (let y = 0; y <= canvasConfig.height; y += gridSize) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={canvasConfig.width}
          y2={y}
          stroke="#e5e7eb"
          strokeWidth="1"
          opacity="0.5"
        />
      );
    }

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        width={canvasConfig.width}
        height={canvasConfig.height}
      >
        {lines}
      </svg>
    );
  };

  // Don't render positioning interface in template mode
  if (mode === 'template') {
    return null;
  }

  const selectedItems = items.filter(item => selectedItemIds.includes(item.id));

  return (
    <div className="relative">
      {/* Canvas */}
      <motion.div
        ref={canvasRef}
        className="relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
        style={{
          width: canvasConfig.width,
          height: canvasConfig.height,
          backgroundColor: canvasConfig.backgroundColor || '#ffffff'
        }}
        onClick={handleCanvasClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Grid */}
        {renderGrid()}

        {/* Padding guides */}
        {canvasConfig.padding && showGrid && (
          <div
            className="absolute border border-blue-200 border-dashed pointer-events-none"
            style={{
              left: canvasConfig.padding.left,
              top: canvasConfig.padding.top,
              right: canvasConfig.padding.right,
              bottom: canvasConfig.padding.bottom,
              width: canvasConfig.width - canvasConfig.padding.left - canvasConfig.padding.right,
              height: canvasConfig.height - canvasConfig.padding.top - canvasConfig.padding.bottom
            }}
          />
        )}

        {/* Items */}
        <AnimatePresence>
          {items.map(item => (
            <DraggableItem
              key={item.id}
              item={item}
              isSelected={selectedItemIds.includes(item.id)}
              isEditable={isEditable}
              onPositionChange={updateItemPosition}
              onSelect={handleItemSelect}
              onDoubleClick={(itemId) => {
                // Handle double click for editing
                console.log('Double clicked item:', itemId);
              }}
              showGrid={showGrid}
              gridSize={canvasConfig.gridSize}
            >
              <ItemRenderer
                item={item}
                theme={theme}
                isEditing={false}
                onContentChange={handleItemContentChange}
              />
            </DraggableItem>
          ))}
        </AnimatePresence>

        {/* Canvas info */}
        <div className="absolute top-2 left-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
          {canvasConfig.width} × {canvasConfig.height} • {items.length} items
        </div>
      </motion.div>

      {/* Controls */}
      {isEditable && (
        <PositioningControls
          selectedItems={selectedItems}
          mode={mode}
          showGrid={showGrid}
          canUndo={engineRef.current?.canUndo() || false}
          canRedo={engineRef.current?.canRedo() || false}
          onModeChange={onModeChange}
          onToggleGrid={handleToggleGrid}
          onResetDefaults={handleResetDefaults}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onDeleteSelected={handleDeleteSelected}
          onDuplicateSelected={handleDuplicateSelected}
          onAlignItems={handleAlignItems}
          onDistributeItems={handleDistributeItems}
          onLockSelected={() => {
            // TODO: Implement lock functionality
            console.log('Lock selected items');
          }}
          onUnlockSelected={() => {
            // TODO: Implement unlock functionality
            console.log('Unlock selected items');
          }}
          onToggleVisibility={() => {
            // TODO: Implement visibility toggle
            console.log('Toggle visibility');
          }}
        />
      )}
    </div>
  );
};

export default PositioningCanvas;
