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

      // ✅ FIXED: Apply saved position using exact same logic as images
      const savedPos = savedPositions?.[elementId] || dragStateRef.current.get(elementId) || { x: 0, y: 0 };
      let currentX = savedPos.x;
      let currentY = savedPos.y;
      if (currentX !== 0 || currentY !== 0) {
        // Apply transform exactly like images do
        htmlElement.style.transform = `translate(${currentX}px, ${currentY}px)`;
        dragStateRef.current.set(elementId, { x: currentX, y: currentY });
      }

      // ✅ FIXED: Copy exact image positioning logic
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

      // ✅ FIXED: Copy exact image drag start logic
      const handleDragStart = () => {
        isDragging = true;
        htmlElement.style.position = 'relative';
        htmlElement.style.zIndex = '1000';
        htmlElement.style.userSelect = 'none';
        htmlElement.classList.add('dragging');
      };

      // ✅ FIXED: Copy exact image drag logic
      const handleDrag = (e: any) => {
        e.target.style.transform = e.transform;
        
        // Extract position from transform exactly like images do
        const transformMatch = e.transform.match(/translate\(([^)]+)\)/);
        if (transformMatch) {
          const [, translate] = transformMatch;
          const [x, y] = translate.split(',').map((v: string) => parseFloat(v.replace('px', '')));
          
          // Update current position
          currentX = x;
          currentY = y;
          dragStateRef.current.set(elementId, { x: currentX, y: currentY });
          
          // Call position change callback exactly like images do
          if (onPositionChange) {
            onPositionChange(elementId, { x: currentX, y: currentY });
          }
        }
      };

      // ✅ FIXED: Copy exact image drag end logic
      const handleDragEnd = (e: any) => {
        isDragging = false;
        
        // Final position update after drag ends exactly like images do
        const transformMatch = e.target.style.transform.match(/translate\(([^)]+)\)/);
        if (transformMatch) {
          const [, translate] = transformMatch;
          const [x, y] = translate.split(',').map((v: string) => parseFloat(v.replace('px', '')));
          
          currentX = x;
          currentY = y;
          dragStateRef.current.set(elementId, { x: currentX, y: currentY });
          
          // Call position change callback with final flag exactly like images do
          if (onPositionChange) {
            onPositionChange(elementId, { x: currentX, y: currentY });
          }
        }
      };

      const startDrag = (e: MouseEvent) => {
        if (isDragging) return;
        handleDragStart();
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

        // If a child draggable exists under the cursor, ignore this (parent) draggable
        const closestDraggable = targetElement.closest('[data-draggable="true"]');
        if (closestDraggable && closestDraggable !== htmlElement) {
          return;
        }

        // If we recently dragged something, suppress accidental subsequent drags/clicks
        if (Date.now() < suppressClicksUntilRef.current) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return;
        }

        isMouseDown = true;
        dragDistance = 0;
        startPageX = e.clientX;
        startPageY = e.clientY;
        startOffsetX = e.clientX - currentX;
        startOffsetY = e.clientY - currentY;

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

        const dx = Math.abs(e.clientX - startPageX);
        const dy = Math.abs(e.clientY - startPageY);
        dragDistance = Math.sqrt(dx * dx + dy * dy);

        // If user moves past threshold before delay ends, start drag immediately
        if (!isDragging && dragDistance > DRAG_THRESHOLD) {
          clearDragTimeout();
          startDrag(e);
        }

        // ✅ FIXED: Use exact image positioning logic instead of custom text logic
        if (isDragging) {
          // Simulate the exact same transform that images get from Moveable
          const newX = e.clientX - startOffsetX;
          const newY = e.clientY - startOffsetY;
          const transform = `translate(${newX}px, ${newY}px)`;
          
          // Apply transform exactly like images do
          htmlElement.style.transform = transform;
          
          // Update current position
          currentX = newX;
          currentY = newY;
          dragStateRef.current.set(elementId, { x: currentX, y: currentY });
          
          // Call position change callback exactly like images do
          if (onPositionChange) {
            onPositionChange(elementId, { x: currentX, y: currentY });
          }
          
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

          // ✅ FIXED: Call drag end logic exactly like images do
          handleDragEnd({ target: htmlElement });

          // Suppress the very next click to avoid entering edit after drag
          htmlElement.setAttribute('data-just-dragged', 'true');
          setTimeout(() => {
            htmlElement.removeAttribute('data-just-dragged');
          }, 400);
          suppressClicksUntilRef.current = Date.now() + 400;
          const suppressNextClick = (ev: MouseEvent) => {
            if (Date.now() < suppressClicksUntilRef.current) {
              ev.stopImmediatePropagation();
              ev.stopPropagation();
              ev.preventDefault();
            }
          };
          document.addEventListener('click', suppressNextClick, true);
          setTimeout(() => {
            document.removeEventListener('click', suppressNextClick, true);
          }, 450);

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
