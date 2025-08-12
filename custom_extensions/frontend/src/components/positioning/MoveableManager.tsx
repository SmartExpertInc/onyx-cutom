'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Moveable from 'react-moveable';

// Debug logging utility
const DEBUG = typeof window !== 'undefined' && (window as any).__MOVEABLE_DEBUG__;
const log = (source: string, event: string, data: any) => {
  if (DEBUG) {
    console.log(`[${source}] ${event}`, { ts: Date.now(), ...data });
  }
};

export interface MoveableElement {
  id: string;
  ref: React.RefObject<HTMLElement | null>;
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
  const [lastTransform, setLastTransform] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const moveableRef = useRef<Moveable>(null);

  log('MoveableManager', 'render', { 
    slideId, 
    isEnabled, 
    elementsCount: elements.length,
    selectedElementId: selectedElement?.id,
    isDragging,
    isResizing,
    hasLastTransform: !!lastTransform
  });

  // Track keyboard state for aspect ratio locking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
        log('MoveableManager', 'shiftKeyDown', { slideId });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
        log('MoveableManager', 'shiftKeyUp', { slideId });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [slideId]);

  // Initialize element positions and sizes
  useEffect(() => {
    log('MoveableManager', 'initializeElements', { 
      slideId, 
      elementsCount: elements.length,
      elementIds: elements.map(e => e.id)
    });

    elements.forEach(element => {
      const el = element.ref.current;
      if (!el) {
        log('MoveableManager', 'elementRefNull', { elementId: element.id, slideId });
        return;
      }

      log('MoveableManager', 'registerElement', { 
        elementId: element.id, 
        refExists: !!el,
        elementType: element.type,
        slideId
      });

      // Apply saved position
      const savedPos = savedPositions[element.id] || { x: 0, y: 0 };
      if (savedPos.x !== 0 || savedPos.y !== 0) {
        el.style.transform = `translate(${savedPos.x}px, ${savedPos.y}px)`;
        log('MoveableManager', 'applySavedPosition', { 
          elementId: element.id, 
          x: savedPos.x, 
          y: savedPos.y,
          slideId
        });
      }

      // Apply saved size
      const savedSize = savedSizes[element.id];
      if (savedSize) {
        el.style.width = `${savedSize.width}px`;
        el.style.height = `${savedSize.height}px`;
        log('MoveableManager', 'applySavedSize', { 
          elementId: element.id, 
          width: savedSize.width, 
          height: savedSize.height,
          slideId
        });
      }

      // Add click handler for selection
      const handleClick = (e: MouseEvent) => {
        // Don't select if clicking on resize handles or editing controls
        const target = e.target as HTMLElement;
        if (target.closest('[data-resize-handle]') || 
            target.isContentEditable || 
            target.tagName === 'INPUT' || 
            target.tagName === 'TEXTAREA') {
          log('MoveableManager', 'clickIgnored', { 
            elementId: element.id, 
            reason: 'editing-controls',
            slideId
          });
          return;
        }

        // Prevent selection if recently dragged/resized
        if (isDragging || isResizing) {
          log('MoveableManager', 'clickIgnored', { 
            elementId: element.id, 
            reason: 'dragging-or-resizing',
            isDragging,
            isResizing,
            slideId
          });
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        log('MoveableManager', 'elementSelected', { 
          elementId: element.id, 
          elementType: element.type,
          slideId
        });
        setSelectedElement(element);
        e.stopPropagation();
      };

      el.addEventListener('click', handleClick);
      el.style.cursor = 'pointer';

      // Store cleanup function
      (el as any).__moveableCleanup = () => {
        el.removeEventListener('click', handleClick);
        el.style.cursor = '';
        log('MoveableManager', 'elementCleanup', { elementId: element.id, slideId });
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
  }, [elements, savedPositions, savedSizes, isDragging, isResizing, slideId]);

  // Handle drag events
  const handleDrag = useCallback((e: any) => {
    if (!selectedElement) return;
    
    try {
      setIsDragging(true);
      const { target, transform } = e;
      
      // Validate transform object
      if (!transform || typeof transform.x !== 'number' || typeof transform.y !== 'number') {
        log('MoveableManager', 'handleDrag_invalidTransform', { 
          elementId: selectedElement.id, 
          transform,
          slideId
        });
        return;
      }
      
      // Check if transform has actually changed to prevent unnecessary updates
      const currentTransform = { x: transform.x, y: transform.y, width: transform.width || 0, height: transform.height || 0 };
      if (lastTransform && 
          Math.abs(lastTransform.x - currentTransform.x) < 1 && 
          Math.abs(lastTransform.y - currentTransform.y) < 1) {
        return; // Skip update if change is minimal
      }
      
      setLastTransform(currentTransform);
      
      log('MoveableManager', 'onDrag', { 
        elementId: selectedElement.id, 
        x: transform.x, 
        y: transform.y,
        slideId
      });
      
      // Update position
      if (onPositionChange) {
        onPositionChange(selectedElement.id, { x: transform.x, y: transform.y });
      }
    } catch (error) {
      log('MoveableManager', 'handleDrag_error', { 
        elementId: selectedElement.id, 
        error: error instanceof Error ? error.message : String(error),
        slideId
      });
    }
  }, [selectedElement, onPositionChange, slideId, lastTransform]);

  const handleDragEnd = useCallback((e: any) => {
    if (!selectedElement) return;
    
    try {
      setIsDragging(false);
      const { transform } = e;
      
      // Validate transform object
      if (!transform || typeof transform.x !== 'number' || typeof transform.y !== 'number') {
        log('MoveableManager', 'handleDragEnd_invalidTransform', { 
          elementId: selectedElement.id, 
          transform,
          slideId
        });
        return;
      }
      
      log('MoveableManager', 'onDragEnd', { 
        elementId: selectedElement.id, 
        x: transform.x, 
        y: transform.y,
        slideId
      });
      
      // Final position update
      if (onTransformEnd) {
        onTransformEnd(selectedElement.id, {
          position: { x: transform.x, y: transform.y },
          size: { width: transform.width || 0, height: transform.height || 0 }
        });
      }
      
      // Reset last transform after a delay to allow for final updates
      setTimeout(() => {
        setLastTransform(null);
      }, 100);
    } catch (error) {
      log('MoveableManager', 'handleDragEnd_error', { 
        elementId: selectedElement.id, 
        error: error instanceof Error ? error.message : String(error),
        slideId
      });
    }
  }, [selectedElement, onTransformEnd, slideId]);

  // Handle resize events
  const handleResize = useCallback((e: any) => {
    if (!selectedElement) return;
    
    try {
      setIsResizing(true);
      const { target, width, height, drag } = e;
      
      // Validate size values
      if (typeof width !== 'number' || typeof height !== 'number') {
        log('MoveableManager', 'handleResize_invalidSize', { 
          elementId: selectedElement.id, 
          width,
          height,
          slideId
        });
        return;
      }
      
      // Check if size has actually changed to prevent unnecessary updates
      const currentTransform = { x: drag?.x || 0, y: drag?.y || 0, width, height };
      if (lastTransform && 
          Math.abs(lastTransform.width - currentTransform.width) < 1 && 
          Math.abs(lastTransform.height - currentTransform.height) < 1) {
        return; // Skip update if change is minimal
      }
      
      setLastTransform(currentTransform);
      
      log('MoveableManager', 'onResize', { 
        elementId: selectedElement.id, 
        width, 
        height,
        slideId
      });
      
      // Update size
      if (onSizeChange) {
        onSizeChange(selectedElement.id, { width, height });
      }
    } catch (error) {
      log('MoveableManager', 'handleResize_error', { 
        elementId: selectedElement.id, 
        error: error instanceof Error ? error.message : String(error),
        slideId
      });
    }
  }, [selectedElement, onSizeChange, slideId, lastTransform]);

  const handleResizeEnd = useCallback((e: any) => {
    if (!selectedElement) return;
    
    try {
      setIsResizing(false);
      const { width, height, drag } = e;
      
      // Validate values
      if (typeof width !== 'number' || typeof height !== 'number') {
        log('MoveableManager', 'handleResizeEnd_invalidSize', { 
          elementId: selectedElement.id, 
          width,
          height,
          slideId
        });
        return;
      }
      
      log('MoveableManager', 'onResizeEnd', { 
        elementId: selectedElement.id, 
        width, 
        height,
        slideId
      });
      
      // Final size update
      if (onTransformEnd) {
        onTransformEnd(selectedElement.id, {
          position: { x: drag?.x || 0, y: drag?.y || 0 },
          size: { width, height }
        });
      }
      
      // Reset last transform after a delay to allow for final updates
      setTimeout(() => {
        setLastTransform(null);
      }, 100);
    } catch (error) {
      log('MoveableManager', 'handleResizeEnd_error', { 
        elementId: selectedElement.id, 
        error: error instanceof Error ? error.message : String(error),
        slideId
      });
    }
  }, [selectedElement, onTransformEnd, slideId]);

  // Handle selection changes
  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-moveable-element]') && !target.closest('.moveable-control-box')) {
      if (selectedElement) {
        log('MoveableManager', 'deselectElement', { 
          elementId: selectedElement.id,
          slideId
        });
        setSelectedElement(null);
      }
    }
  }, [selectedElement, slideId]);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);

  if (!isEnabled) {
    log('MoveableManager', 'disabled', { slideId });
    return null;
  }

  if (!selectedElement) {
    log('MoveableManager', 'noSelection', { slideId });
    return null;
  }

  const targetElement = selectedElement.ref.current;
  if (!targetElement) {
    log('MoveableManager', 'targetElementNull', { 
      elementId: selectedElement.id,
      slideId
    });
    return null;
  }

  log('MoveableManager', 'renderingMoveable', { 
    elementId: selectedElement.id,
    elementType: selectedElement.type,
    isShiftPressed,
    slideId
  });

  return (
    <>
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
      />
      {/* Custom styles for moveable controls */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .moveable-control-box {
            --moveable-color: #3b82f6 !important;
            --moveable-line-color: #3b82f6 !important;
            --moveable-point-color: #3b82f6 !important;
            --moveable-handle-color: #3b82f6 !important;
          }
        `
      }} />
    </>
  );
};

export default MoveableManager;
