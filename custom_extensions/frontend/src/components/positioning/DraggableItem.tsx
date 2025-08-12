// components/positioning/DraggableItem.tsx
// Interactive draggable item component with resize and rotate capabilities

'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import Moveable from 'react-moveable';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PositionableItem, 
  Position, 
  Point 
} from '@/types/positioning';

interface DraggableItemProps {
  item: PositionableItem;
  isSelected: boolean;
  isEditable: boolean;
  onPositionChange: (itemId: string, position: Position) => void;
  onSelect: (itemId: string, multiSelect?: boolean) => void;
  onDoubleClick?: (itemId: string) => void;
  showGrid?: boolean;
  gridSize?: number;
  children: React.ReactNode;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  item,
  isSelected,
  isEditable,
  onPositionChange,
  onSelect,
  onDoubleClick,
  showGrid = false,
  gridSize = 20,
  children
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const moveableRef = useRef<Moveable>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Handle selection
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(item.id, e.ctrlKey || e.metaKey);
  }, [item.id, onSelect]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDoubleClick) {
      onDoubleClick(item.id);
    }
  }, [item.id, onDoubleClick]);

  // Apply grid snapping
  const snapToGrid = useCallback((value: number): number => {
    if (!showGrid || gridSize <= 0) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [showGrid, gridSize]);

  // Handle drag
  const handleDrag = useCallback(({ target, left, top }: any) => {
    if (!isEditable) return;
    
    const newPosition = {
      ...item.position,
      x: snapToGrid(left),
      y: snapToGrid(top)
    };

    // Update the DOM element immediately for smooth interaction
    target.style.left = `${newPosition.x}px`;
    target.style.top = `${newPosition.y}px`;

    onPositionChange(item.id, newPosition);
  }, [item.id, item.position, isEditable, snapToGrid, onPositionChange]);

  // Handle resize
  const handleResize = useCallback(({ target, width, height, left, top }: any) => {
    if (!isEditable) return;

    const newPosition = {
      ...item.position,
      x: snapToGrid(left),
      y: snapToGrid(top),
      width: Math.max(item.constraints?.minWidth || 50, snapToGrid(width)),
      height: Math.max(item.constraints?.minHeight || 30, snapToGrid(height))
    };

    // Apply aspect ratio constraint if needed
    if (item.constraints?.maintainAspectRatio) {
      const aspectRatio = item.position.width / item.position.height;
      newPosition.height = newPosition.width / aspectRatio;
    }

    // Update the DOM element immediately
    target.style.left = `${newPosition.x}px`;
    target.style.top = `${newPosition.y}px`;
    target.style.width = `${newPosition.width}px`;
    target.style.height = `${newPosition.height}px`;

    onPositionChange(item.id, newPosition);
  }, [item.id, item.position, item.constraints, isEditable, snapToGrid, onPositionChange]);

  // Handle rotation
  const handleRotate = useCallback(({ target, transform }: any) => {
    if (!isEditable) return;

    // Extract rotation from transform
    const rotateMatch = transform.match(/rotate\(([^)]+)\)/);
    const rotation = rotateMatch ? parseFloat(rotateMatch[1]) : 0;

    const newPosition = {
      ...item.position,
      rotation
    };

    target.style.transform = transform;
    onPositionChange(item.id, newPosition);
  }, [item.id, item.position, isEditable, onPositionChange]);

  // Compute transform string
  const transform = `translate(${item.position.x}px, ${item.position.y}px) rotate(${item.position.rotation || 0}deg)`;

  return (
    <>
      {/* The draggable item */}
      <motion.div
        ref={itemRef}
        className="absolute cursor-move"
        style={{
          left: item.position.x,
          top: item.position.y,
          width: item.position.width,
          height: item.position.height,
          transform: `rotate(${item.position.rotation || 0}deg)`,
          zIndex: item.position.zIndex || 1,
          transformOrigin: 'center center'
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        {/* Item content */}
        <div className="w-full h-full overflow-hidden">
          {children}
        </div>


      </motion.div>

      {/* Simple drag functionality */}
      {isEditable && itemRef.current && (
        <Moveable
          ref={moveableRef}
          target={itemRef.current}
          draggable={true}
          resizable={false}
          rotatable={false}
          throttleDrag={0}
          
          // Drag settings
          onDrag={handleDrag}
          
          // Visual settings - minimal
          renderDirections={[]}
          edge={false}
          zoom={1}
          origin={false}
          
          // Bounds constraint
          bounds={{
            left: 0,
            top: 0,
            right: 1200, // Canvas width
            bottom: 675  // Canvas height
          }}
        />
      )}
    </>
  );
};

export default DraggableItem;
