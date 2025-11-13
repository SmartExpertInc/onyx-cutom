// components/positioning/DragEnhancer.tsx
// Adds drag-and-drop functionality to existing template elements

'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface DragEnhancerProps {
  isEnabled: boolean;
  slideId: string;
  savedPositions?: Record<string, { x: number; y: number }>;
  onPositionChange?: (elementId: string, position: { x: number; y: number }) => void;
}

export const DragEnhancer: React.FC<DragEnhancerProps> = ({
  isEnabled,
  slideId,
  savedPositions,
  onPositionChange
}) => {
  const enhancerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const suppressClicksUntilRef = useRef<number>(0);

  useLayoutEffect(() => {
    if (!isEnabled || !enhancerRef.current) return;

    const container = enhancerRef.current.parentElement;
    if (!container) return;

    const elements = container.querySelectorAll('[data-draggable="true"]');

    elements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      const elementId = htmlElement.id || `draggable-${slideId}-${index}`;
      if (!htmlElement.id) htmlElement.id = elementId;

      htmlElement.style.cursor = 'move';
      htmlElement.style.transition = 'transform 0.1s ease-out, box-shadow 0.2s ease';

      const handleMouseEnter = () => {
        htmlElement.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
      };
      const handleMouseLeave = () => {
        htmlElement.style.boxShadow = 'none';
      };
      htmlElement.addEventListener('mouseenter', handleMouseEnter);
      htmlElement.addEventListener('mouseleave', handleMouseLeave);

      // Position state - FIXED: Don't apply position: relative unless actually dragging
      const savedPos = savedPositions?.[elementId] || dragStateRef.current.get(elementId) || { x: 0, y: 0 };
      let currentX = savedPos.x;
      let currentY = savedPos.y;
      if (currentX !== 0 || currentY !== 0) {
        // Only apply transform, don't change position property to avoid layout issues
        htmlElement.style.transform = `translate(${currentX}px, ${currentY}px)`;
        // Don't set position: relative here - only set it when actually dragging
        dragStateRef.current.set(elementId, { x: currentX, y: currentY });
      }

      // Drag control vars
      let isDragging = false;
      let isMouseDown = false;
      let dragDistance = 0;
      let startPageX = 0;
      let startPageY = 0;
      let startOffsetX = 0;
      let startOffsetY = 0;
      let dragTimeoutId: number | null = null;
      const DRAG_THRESHOLD = 5; // px
      const DRAG_DELAY_MS = 250; // delay before starting drag on hold

      const startDrag = (e: MouseEvent) => {
        if (isDragging) return;
        isDragging = true;
        // FIXED: Only set position: relative when actually dragging to avoid layout issues
        htmlElement.style.position = 'relative';
        htmlElement.style.zIndex = '1000';
        htmlElement.style.userSelect = 'none';
        htmlElement.classList.add('dragging');
        // Prevent propagation only when we actually start dragging
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      };

      const clearDragTimeout = () => {
        if (dragTimeoutId !== null) {
          window.clearTimeout(dragTimeoutId);
          dragTimeoutId = null;
        }
      };

      const handleMouseDown = (e: MouseEvent) => {
        // Do not start drag on active editing controls
        const targetElement = e.target as HTMLElement;
        if (targetElement.isContentEditable || targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') {
          return; // allow inline editing
        }

        // Prevent drag on WysiwygEditor toolbar and its buttons
        // Toolbar buttons are interactive elements that should not trigger drag
        if (targetElement.tagName === 'BUTTON' || 
            targetElement.tagName === 'INPUT' ||
            targetElement.getAttribute('role') === 'button') {
          // Check if it's inside a wysiwyg editor context (toolbar or editor itself)
          const wysiwygContext = targetElement.closest('.wysiwyg-editor') || 
                                 targetElement.closest('[class*="wysiwyg"]');
          if (wysiwygContext) {
            return; // Allow toolbar button interactions
          }
        }
        
        // Also check for toolbar container (positioned absolutely above editor)
        // WysiwygEditor toolbar typically has position: absolute and negative top value
        const parentContainer = targetElement.parentElement;
        if (parentContainer) {
          const parentStyle = window.getComputedStyle(parentContainer);
          if (parentStyle.position === 'absolute' && 
              (parentStyle.top.startsWith('-') || parseFloat(parentStyle.top) < 0)) {
            // Likely a toolbar - allow interactions
            return;
          }
        }

        // If a child draggable exists under the cursor, ignore this (parent) draggable
        const closestDraggable = targetElement.closest('[data-draggable="true"]');
        if (closestDraggable && closestDraggable !== htmlElement) {
          return;
        }

        // Check if target is text content that should be editable
        // BUT only if it's NOT inside this draggable element
        // If it's inside this draggable element (or is the draggable element itself), allow dragging
        const isTextElement = targetElement.tagName === 'P' || 
                             targetElement.tagName === 'H1' || 
                             targetElement.tagName === 'H2' || 
                             targetElement.tagName === 'H3' || 
                             targetElement.tagName === 'H4' || 
                             targetElement.tagName === 'SPAN' ||
                             targetElement.classList.contains('editable-text') ||
                             targetElement.closest('.editable-text');
        
        // Only prevent dragging if it's a text element AND it's NOT inside/part of this draggable element
        // If the text element is inside this draggable element (or IS the draggable element), allow dragging
        // contains() returns true if the element contains the target OR if the element is the target itself
        if (isTextElement && !htmlElement.contains(targetElement)) {
          return; // allow text editing only if not inside/part of draggable
        }

        // If we recently dragged something, suppress accidental subsequent drags/clicks
        if (Date.now() < suppressClicksUntilRef.current) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return;
        }

        // 🔧 CRITICAL FIX: Get slide canvas coordinates instead of viewport coordinates
        const slideCanvas = container.closest('[data-slide-canvas="true"]') || container;
        const canvasRect = slideCanvas.getBoundingClientRect();
        
        // 📐 CANVAS DIMENSION LOGGING
        console.log('📐 [CANVAS_DIMENSIONS] Drag started on canvas');
        console.log('  🖼️ Canvas Element:', slideCanvas.tagName, slideCanvas.className);
        console.log('  📏 Canvas Dimensions:', {
          width: canvasRect.width,
          height: canvasRect.height,
          left: canvasRect.left,
          top: canvasRect.top
        });
        console.log('  📍 Mouse Position (viewport):', {
          clientX: e.clientX,
          clientY: e.clientY
        });
        
        isMouseDown = true;
        dragDistance = 0;
        startPageX = e.clientX;
        startPageY = e.clientY;
        
        // Calculate coordinates relative to slide canvas, not viewport
        const canvasX = e.clientX - canvasRect.left;
        const canvasY = e.clientY - canvasRect.top;
        startOffsetX = canvasX - currentX;
        startOffsetY = canvasY - currentY;
        
        console.log('  🎯 Canvas-Relative Position:', {
          canvasX: canvasX.toFixed(2),
          canvasY: canvasY.toFixed(2)
        });

        // Delay starting drag to give inline editing a chance on quick clicks
        clearDragTimeout();
        dragTimeoutId = window.setTimeout(() => {
          // Only start drag if user has moved past threshold by now
          const dx = Math.abs((startPageX) - e.clientX);
          const dy = Math.abs((startPageY) - e.clientY);
          if ((dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) && isMouseDown) {
            startDrag(e);
          }
        }, DRAG_DELAY_MS);
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isMouseDown) return;

        // 🔧 CRITICAL FIX: Calculate coordinates relative to slide canvas
        const slideCanvas = container.closest('[data-slide-canvas="true"]') || container;
        const canvasRect = slideCanvas.getBoundingClientRect();
        const canvasX = e.clientX - canvasRect.left;
        const canvasY = e.clientY - canvasRect.top;
        
        const newX = canvasX - startOffsetX;
        const newY = canvasY - startOffsetY;
        const dx = Math.abs(e.clientX - startPageX);
        const dy = Math.abs(e.clientY - startPageY);
        dragDistance = Math.sqrt(dx * dx + dy * dy);

        // If user moves past threshold before delay ends, start drag immediately
        if (!isDragging && dragDistance > DRAG_THRESHOLD) {
          clearDragTimeout();
          startDrag(e);
        }

        if (isDragging) {
          currentX = newX;
          currentY = newY;
          htmlElement.style.transform = `translate(${currentX}px, ${currentY}px)`;
          // Position is already set to relative when dragging started
          dragStateRef.current.set(elementId, { x: currentX, y: currentY });
          e.stopPropagation();
        }
      };

      const handleMouseUp = (e: MouseEvent) => {
        if (!isMouseDown) return;
        isMouseDown = false;
        const wasDragging = isDragging && dragDistance > DRAG_THRESHOLD;

        clearDragTimeout();

        if (isDragging) {
          isDragging = false;
          // FIXED: Reset position to original value to avoid layout issues
          htmlElement.style.position = '';
          htmlElement.style.zIndex = '';
          htmlElement.style.userSelect = '';
          htmlElement.classList.remove('dragging');

          // Suppress the very next click to avoid entering edit after drag
          htmlElement.setAttribute('data-just-dragged', 'true');
          setTimeout(() => {
            htmlElement.removeAttribute('data-just-dragged');
          }, 400);
          suppressClicksUntilRef.current = Date.now() + 400;
          
          // Create a more targeted click suppression that only affects draggable elements
          const suppressNextClick = (ev: MouseEvent) => {
            const target = ev.target as HTMLElement;
            // Don't suppress clicks on text elements or elements inside wysiwyg editors
            const isTextElement = target.tagName === 'P' || 
                                 target.tagName === 'H1' || 
                                 target.tagName === 'H2' || 
                                 target.tagName === 'H3' || 
                                 target.tagName === 'H4' || 
                                 target.tagName === 'SPAN' ||
                                 target.tagName === 'DIV' ||
                                 target.closest('.wysiwyg-editor') ||
                                 target.classList.contains('editable-text') ||
                                 target.closest('.editable-text') ||
                                 target.classList.contains('editable-text') ||
                                 target.closest('.editable-text');
            
            if (isTextElement) {
              return; // Allow text editing
            }
            
            // Only suppress clicks on draggable elements or their children
            const isDraggableElement = target.closest('[data-draggable="true"]');
            if (isDraggableElement && Date.now() < suppressClicksUntilRef.current) {
              ev.stopImmediatePropagation();
              ev.stopPropagation();
              ev.preventDefault();
            }
          };
          document.addEventListener('click', suppressNextClick, true);
          setTimeout(() => {
            document.removeEventListener('click', suppressNextClick, true);
          }, 450);

          // 🔍 COMPREHENSIVE DRAG LOGGING
          const slideCanvas = container.closest('[data-slide-canvas="true"]') || container;
          const finalCanvasRect = slideCanvas.getBoundingClientRect();
          
          console.log('🎯 [DRAG_COMPLETE] Element drag finished');
          console.log('  📍 Element ID:', elementId);
          console.log('  📊 Final Position:', { x: currentX, y: currentY });
          console.log('  📏 Drag Distance:', dragDistance.toFixed(2), 'px');
          console.log('  🎨 Element:', htmlElement.tagName, htmlElement.className);
          console.log('  📐 Canvas Dimensions at completion:', {
            width: finalCanvasRect.width,
            height: finalCanvasRect.height,
            aspectRatio: (finalCanvasRect.width / finalCanvasRect.height).toFixed(3)
          });
          console.log('  🔢 Position State:', {
            transform: htmlElement.style.transform,
            savedInState: dragStateRef.current.get(elementId)
          });
          console.log('  ➡️ Calling onPositionChange callback...');

          if (onPositionChange) onPositionChange(elementId, { x: currentX, y: currentY });
          return;
        }

        // Not dragging -> treat as normal click (inline editing will handle it)
        // Do not prevent default; allow click to propagate
      };

      htmlElement.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      const cleanup = () => {
        htmlElement.removeEventListener('mouseenter', handleMouseEnter);
        htmlElement.removeEventListener('mouseleave', handleMouseLeave);
        htmlElement.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        if (dragTimeoutId) window.clearTimeout(dragTimeoutId);
        htmlElement.style.cursor = '';
        htmlElement.style.boxShadow = '';
        htmlElement.style.transform = '';
        // FIXED: Reset position to avoid layout issues
        htmlElement.style.position = '';
        htmlElement.classList.remove('dragging');
        htmlElement.removeAttribute('data-just-dragged');
      };

      (htmlElement as any).__dragCleanup = cleanup;
    });

    return () => {
      elements.forEach(element => {
        const cleanup = (element as any).__dragCleanup;
        if (cleanup) cleanup();
      });
    };
  }, [isEnabled, slideId, savedPositions, onPositionChange]);

  if (!isEnabled) return null;

  return (
    <div ref={enhancerRef} className="absolute inset-0 pointer-events-none z-20" />
  );
};

export default DragEnhancer;
