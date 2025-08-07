// components/positioning/DragEnhancer.tsx
// Adds drag-and-drop functionality to existing template elements

'use client';

import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!isEnabled || !enhancerRef.current) return;

    const container = enhancerRef.current.parentElement;
    if (!container) return;

    // Find all draggable elements in the template
    const draggableSelectors = [
      '.slide-title',
      '.slide-subtitle', 
      '.slide-content',
      '.bullet-points',
      '.slide-image',
      '.image-placeholder',
      '.process-step',
      '.big-number',
      '.pyramid-item',
      '.timeline-item',
      '.challenge-item',
      '.solution-item',
      '.grid-item',
      '.quote-content',
      '[data-draggable="true"]'
    ];

    const elements = container.querySelectorAll(draggableSelectors.join(', '));
    
    elements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      const elementId = htmlElement.id || `draggable-${slideId}-${index}`;
      
      if (!htmlElement.id) {
        htmlElement.id = elementId;
      }

      // Add drag cursor
      htmlElement.style.cursor = 'move';
      
      // Add hover effect
      htmlElement.style.transition = 'box-shadow 0.2s ease';
      htmlElement.addEventListener('mouseenter', () => {
        htmlElement.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
      });
      
      htmlElement.addEventListener('mouseleave', () => {
        htmlElement.style.boxShadow = 'none';
      });

      // Make element draggable
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      
      // Get saved position from props or drag state
      const savedPos = savedPositions?.[elementId] || dragStateRef.current.get(elementId) || { x: 0, y: 0 };
      let currentX = savedPos.x;
      let currentY = savedPos.y;

      // Apply saved position
      if (currentX !== 0 || currentY !== 0) {
        htmlElement.style.transform = `translate(${currentX}px, ${currentY}px)`;
        htmlElement.style.position = 'relative';
        dragStateRef.current.set(elementId, { x: currentX, y: currentY });
      }

      const handleMouseDown = (e: MouseEvent) => {
        if (e.target !== htmlElement && !htmlElement.contains(e.target as Node)) return;
        
        // Don't interfere with text selection or input focus
        if ((e.target as HTMLElement).isContentEditable || 
            (e.target as HTMLElement).tagName === 'INPUT' ||
            (e.target as HTMLElement).tagName === 'TEXTAREA') {
          return;
        }

        isDragging = true;
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
        
        htmlElement.style.zIndex = '1000';
        htmlElement.style.userSelect = 'none';
        htmlElement.classList.add('dragging');
        
        e.preventDefault();
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        currentX = e.clientX - startX;
        currentY = e.clientY - startY;

        htmlElement.style.transform = `translate(${currentX}px, ${currentY}px)`;
        htmlElement.style.position = 'relative';
        
        // Save position
        dragStateRef.current.set(elementId, { x: currentX, y: currentY });
      };

      const handleMouseUp = () => {
        if (!isDragging) return;
        
        isDragging = false;
        htmlElement.style.zIndex = '';
        htmlElement.style.userSelect = '';
        htmlElement.classList.remove('dragging');
        
        // Notify parent of position change
        if (onPositionChange) {
          onPositionChange(elementId, { x: currentX, y: currentY });
        }
      };

      // Add event listeners
      htmlElement.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      // Cleanup function
      const cleanup = () => {
        htmlElement.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        htmlElement.style.cursor = '';
        htmlElement.style.boxShadow = '';
        htmlElement.style.transform = '';
        htmlElement.style.position = '';
        htmlElement.classList.remove('dragging');
      };

      // Store cleanup function on element
      (htmlElement as any).__dragCleanup = cleanup;
    });

    // Cleanup function for the effect
    return () => {
      elements.forEach(element => {
        const cleanup = (element as any).__dragCleanup;
        if (cleanup) cleanup();
      });
    };
  }, [isEnabled, slideId, savedPositions, onPositionChange]);

  if (!isEnabled) return null;

  return (
    <div 
      ref={enhancerRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default DragEnhancer;
