'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Moveable from 'react-moveable';

export interface MoveableElement {
  id: string;
  ref: React.RefObject<HTMLElement>;
  type: 'image' | 'text' | 'placeholder';
  initialSize?: { width: number; height: number };
  initialPosition?: { x: number; y: number };
  aspectRatio?: number;
  cropMode?: 'cover' | 'contain' | 'fill';
}

export interface MoveableManagerProps {
  isEnabled: boolean;
  slideId: string;
  elements: MoveableElement[];
  savedPositions?: Record<string, { x: number; y: number }>;
  savedSizes?: Record<string, { width: number; height: number }>;
  onPositionChange?: (elementId: string, position: { x: number; y: number }) => void;
  onSizeChange?: (elementId: string, size: { width: number; height: number }) => void;
  onTransformEnd?: (elementId: string, transform: { position: { x: number; y: number }; size: { width: number; height: number } }) => void;
}

export const MoveableManager: React.FC<MoveableManagerProps> = ({
  isEnabled,
  slideId,
  elements,
  savedPositions = {},
  savedSizes = {},
  onPositionChange,
  onSizeChange,
  onTransformEnd
}) => {
  const [selectedElement, setSelectedElement] = useState<MoveableElement | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const moveableRef = useRef<Moveable>(null);

  // Track keyboard state for aspect ratio locking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Initialize element positions and sizes
  useEffect(() => {
    elements.forEach(element => {
      const el = element.ref.current;
      if (!el) return;

      // Apply saved position
      const savedPos = savedPositions[element.id] || { x: 0, y: 0 };
      if (savedPos.x !== 0 || savedPos.y !== 0) {
        el.style.transform = `translate(${savedPos.x}px, ${savedPos.y}px)`;
      }

      // Apply saved size
      const savedSize = savedSizes[element.id];
      if (savedSize) {
        el.style.width = `${savedSize.width}px`;
        el.style.height = `${savedSize.height}px`;
      }

      // Add click handler for selection
      const handleClick = (e: MouseEvent) => {
        // Don't select if clicking on resize handles or editing controls
        const target = e.target as HTMLElement;
        if (target.closest('[data-resize-handle]') || 
            target.isContentEditable || 
            target.tagName === 'INPUT' || 
            target.tagName === 'TEXTAREA') {
          return;
        }

        // Prevent selection if recently dragged/resized
        if (isDragging || isResizing) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        setSelectedElement(element);
        e.stopPropagation();
      };

      el.addEventListener('click', handleClick);
      el.style.cursor = 'pointer';

      // Store cleanup function
      (el as any).__moveableCleanup = () => {
        el.removeEventListener('click', handleClick);
        el.style.cursor = '';
      };
    });

    return () => {
      elements.forEach(element => {
        const el = element.ref.current;
        if (el && (el as any).__moveableCleanup) {
          (el as any).__moveableCleanup();
        }
      });
    };
  }, [elements, savedPositions, savedSizes, isDragging, isResizing]);

  // Handle drag events
  const handleDrag = useCallback((e: any) => {
    if (!selectedElement) return;
    
    setIsDragging(true);
    const { target, transform } = e;
    
    // Update position
    if (onPositionChange) {
      onPositionChange(selectedElement.id, { x: transform.x, y: transform.y });
    }
  }, [selectedElement, onPositionChange]);

  const handleDragEnd = useCallback((e: any) => {
    if (!selectedElement) return;
    
    setIsDragging(false);
    const { transform } = e;
    
    // Final position update
    if (onTransformEnd) {
      onTransformEnd(selectedElement.id, {
        position: { x: transform.x, y: transform.y },
        size: { width: transform.width, height: transform.height }
      });
    }
  }, [selectedElement, onTransformEnd]);

  // Handle resize events
  const handleResize = useCallback((e: any) => {
    if (!selectedElement) return;
    
    setIsResizing(true);
    const { target, width, height, drag } = e;
    
    // Update size
    if (onSizeChange) {
      onSizeChange(selectedElement.id, { width, height });
    }
  }, [selectedElement, onSizeChange]);

  const handleResizeEnd = useCallback((e: any) => {
    if (!selectedElement) return;
    
    setIsResizing(false);
    const { width, height, drag } = e;
    
    // Final size update
    if (onTransformEnd) {
      onTransformEnd(selectedElement.id, {
        position: { x: drag.x, y: drag.y },
        size: { width, height }
      });
    }
  }, [selectedElement, onTransformEnd]);

  // Handle selection changes
  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-moveable-element]') && !target.closest('.moveable-control-box')) {
      setSelectedElement(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);

  if (!isEnabled || !selectedElement) return null;

  const targetElement = selectedElement.ref.current;
  if (!targetElement) return null;

  return (
    <Moveable
      ref={moveableRef}
      target={targetElement}
      draggable={true}
      resizable={true}
      keepRatio={isShiftPressed}
      throttleResize={1}
      throttleDrag={1}
      renderDirections={["n", "s", "e", "w", "ne", "nw", "se", "sw"]}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onResize={handleResize}
      onResizeEnd={handleResizeEnd}
      // Prevent conflicts with inline editing
      preventDefault={true}
      // Custom styling for handles
      className="moveable-control-box"
      style={{
        '--moveable-color': '#3b82f6',
        '--moveable-line-color': '#3b82f6',
        '--moveable-point-color': '#3b82f6',
        '--moveable-handle-color': '#3b82f6',
      } as React.CSSProperties}
    />
  );
};

export default MoveableManager;
