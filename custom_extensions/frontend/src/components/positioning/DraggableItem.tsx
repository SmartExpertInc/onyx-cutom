// components/positioning/DraggableItem.tsx
// Interactive draggable item component with resize and rotate capabilities

'use client';

import React, { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import Moveable from 'react-moveable';

export interface DraggableItemPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
}

export interface DraggableItemConstraints {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
}

export interface DraggableItemProps {
  id: string;
  position: DraggableItemPosition;
  constraints?: DraggableItemConstraints;
  isEditable?: boolean;
  isSelected?: boolean;
  onPositionChange: (id: string, position: DraggableItemPosition) => void;
  onSelect?: (id: string) => void;
  onDoubleClick?: (id: string) => void;
  children: React.ReactNode;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  id,
  position,
  constraints,
  isEditable = false,
  isSelected = false,
  onPositionChange,
  onSelect,
  onDoubleClick,
  children
}) => {
  const itemRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    onSelect?.(id);
  }, [id, onSelect]);

  const handleDoubleClick = useCallback(() => {
    onDoubleClick?.(id);
  }, [id, onDoubleClick]);

  // Compute transform string
  const transform = `translate(${position.x}px, ${position.y}px) rotate(${position.rotation || 0}deg)`;

  return (
    <>
      {/* The draggable item */}
      <motion.div
        ref={itemRef}
        className="absolute cursor-move"
        style={{
          left: position.x,
          top: position.y,
          width: position.width,
          height: position.height,
          transform: `rotate(${position.rotation || 0}deg)`,
          zIndex: position.zIndex || 1,
          transformOrigin: 'center center',
          maxWidth: "auto",
          maxHeight: "auto",
          minWidth: "auto",
          minHeight: "auto",
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

      {/* Moveable controls - EXACT PATTERN FROM OFFICIAL EXAMPLES */}
      {isEditable && itemRef.current && (
        <Moveable
          target={itemRef.current}
          draggable={true}
          resizable={false}
          throttleDrag={1}
          onDrag={e => {
            e.target.style.transform = e.transform;
          }}
        />
      )}
    </>
  );
};
