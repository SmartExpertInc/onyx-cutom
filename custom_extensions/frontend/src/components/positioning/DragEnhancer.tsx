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

      const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

      const handleMouseDown = (e: MouseEvent) => {
        // Do not start drag on active editing controls
        const targetElement = e.target as HTMLElement;
        if (targetElement.isContentEditable || targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') {
          return; // allow inline editing
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

        // Compute new positions
        let newX = e.clientX - startOffsetX;
        let newY = e.clientY - startOffsetY;
        const dx = Math.abs(e.clientX - startPageX);
        const dy = Math.abs(e.clientY - startPageY);
        dragDistance = Math.sqrt(dx * dx + dy * dy);

        // If user moves past threshold before delay ends, start drag immediately
        if (!isDragging && dragDistance > DRAG_THRESHOLD) {
          clearDragTimeout();
          startDrag(e);
        }

        if (isDragging) {
          // Clamp within container bounds
          const containerRect = (container as HTMLElement).getBoundingClientRect();
          const elementRect = htmlElement.getBoundingClientRect();
          const maxX = containerRect.width - elementRect.width;
          const maxY = containerRect.height - elementRect.height;
          newX = clamp(newX, -elementRect.left + containerRect.left, maxX - (elementRect.left - containerRect.left));
          newY = clamp(newY, -elementRect.top + containerRect.top, maxY - (elementRect.top - containerRect.top));

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
