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

  log('MoveableManager', 'render', { 
    slideId, 
    isEnabled, 
    elementsCount: elements.length,
    selectedElementId: selectedElement?.id
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
  }, [elements, savedPositions, savedSizes, slideId]);

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
        target={targetElement}
        draggable={true}
        resizable={true}
        keepRatio={isShiftPressed}
        throttleResize={1}
        throttleDrag={1}
        renderDirections={["nw","n","ne","w","e","sw","s","se"]}
        onDrag={e => {
          e.target.style.transform = e.transform;
        }}
        onResize={e => {
          e.target.style.width = `${e.width}px`;
          e.target.style.height = `${e.height}px`;
          e.target.style.transform = e.drag.transform;
        }}
      />
    </>
  );
};

export default MoveableManager;
