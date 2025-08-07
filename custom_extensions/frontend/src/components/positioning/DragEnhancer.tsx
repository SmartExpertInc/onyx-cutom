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

  useLayoutEffect(() => {
    if (!isEnabled || !enhancerRef.current) return;

    const container = enhancerRef.current.parentElement;
    if (!container) return;

    // Apply positions IMMEDIATELY without delay
    const elements = container.querySelectorAll('[data-draggable="true"]');
    
    console.log(`🔍 DragEnhancer Debug for slide ${slideId}:`);
    console.log(`   - Found ${elements.length} draggable elements:`, Array.from(elements));
    console.log(`   - isEnabled:`, isEnabled);
    console.log(`   - savedPositions:`, savedPositions);
    
    elements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      const elementId = htmlElement.id || `draggable-${slideId}-${index}`;
      
      if (!htmlElement.id) {
        htmlElement.id = elementId;
      }

      // Add drag cursor and styling
      htmlElement.style.cursor = 'move';
      htmlElement.style.transition = 'transform 0.1s ease-out, box-shadow 0.2s ease';
      
      // Add hover effect
      htmlElement.addEventListener('mouseenter', () => {
        htmlElement.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
        console.log(`🖱️ Hovering over draggable element:`, elementId, htmlElement);
      });
      
      htmlElement.addEventListener('mouseleave', () => {
        htmlElement.style.boxShadow = 'none';
      });

      // Make element draggable
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let dragDistance = 0;
      const DRAG_THRESHOLD = 5; // Minimum pixels to move before considering it a drag
      
      // Get saved position from props, drag state, or data attributes
      const savedPos = savedPositions?.[elementId] || 
                      dragStateRef.current.get(elementId) || 
                      { 
                        x: parseInt(htmlElement.getAttribute('data-saved-x') || '0'), 
                        y: parseInt(htmlElement.getAttribute('data-saved-y') || '0') 
                      } || 
                      { x: 0, y: 0 };
      let currentX = savedPos.x;
      let currentY = savedPos.y;

      // Apply saved position IMMEDIATELY (synchronous)
      if (currentX !== 0 || currentY !== 0) {
        htmlElement.style.transform = `translate(${currentX}px, ${currentY}px)`;
        htmlElement.style.position = 'relative';
        
        // Set CSS custom properties for CSS-based positioning
        htmlElement.style.setProperty('--saved-x', currentX.toString());
        htmlElement.style.setProperty('--saved-y', currentY.toString());
        
        dragStateRef.current.set(elementId, { x: currentX, y: currentY });
        
        // Also store in data attributes for persistence across DOM changes
        htmlElement.setAttribute('data-saved-x', currentX.toString());
        htmlElement.setAttribute('data-saved-y', currentY.toString());
        
        console.log(`📍 Applied saved position to ${elementId}:`, { x: currentX, y: currentY });
      }

      const handleMouseDown = (e: MouseEvent) => {
        console.log(`🖱️ MouseDown on element:`, elementId, e.target);
        
        // Don't interfere with text selection or input focus
        const targetElement = e.target as HTMLElement;
        if (targetElement.isContentEditable || 
            targetElement.tagName === 'INPUT' ||
            targetElement.tagName === 'TEXTAREA' ||
            targetElement.className.includes('inline-editor') ||
            targetElement.closest('.inline-editor-title') ||
            targetElement.closest('.inline-editor-challenges-title') ||
            targetElement.closest('.inline-editor-challenge') ||
            targetElement.closest('.inline-editor-solution') ||
            targetElement.closest('.inline-editor-solutions-title')) {
          console.log(`❌ MouseDown ignored - text editing element`);
          return;
        }

        console.log(`✅ Starting drag for element:`, elementId);
        isDragging = true;
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
        dragDistance = 0;
        
        htmlElement.style.zIndex = '1000';
        htmlElement.style.userSelect = 'none';
        htmlElement.classList.add('dragging');
        
        // Stop event propagation to prevent parent elements from also dragging
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        const newX = e.clientX - startX;
        const newY = e.clientY - startY;
        
        // Calculate drag distance
        dragDistance = Math.sqrt((newX - currentX) ** 2 + (newY - currentY) ** 2);
        
        currentX = newX;
        currentY = newY;

        htmlElement.style.transform = `translate(${currentX}px, ${currentY}px)`;
        htmlElement.style.position = 'relative';
        
        // Update CSS custom properties during drag
        htmlElement.style.setProperty('--saved-x', currentX.toString());
        htmlElement.style.setProperty('--saved-y', currentY.toString());
        
        // Save position immediately to prevent flickering
        dragStateRef.current.set(elementId, { x: currentX, y: currentY });
        
        // Prevent event propagation during drag
        e.stopPropagation();
      };

      const handleMouseUp = () => {
        if (!isDragging) return;
        
        const wasDragged = dragDistance > DRAG_THRESHOLD;
        
        isDragging = false;
        htmlElement.style.zIndex = '';
        htmlElement.style.userSelect = '';
        htmlElement.classList.remove('dragging');
        
        // If element was actually dragged, prevent click events for longer
        if (wasDragged) {
          // Add a flag to prevent click events for a longer time
          htmlElement.setAttribute('data-just-dragged', 'true');
          
          // Store the current position in a data attribute for persistence
          htmlElement.setAttribute('data-saved-x', currentX.toString());
          htmlElement.setAttribute('data-saved-y', currentY.toString());
          
          // Store drag timestamp for click prevention
          htmlElement.setAttribute('data-drag-time', Date.now().toString());
          
          setTimeout(() => {
            htmlElement.removeAttribute('data-just-dragged');
          }, 500); // Increased from 300ms to 500ms for better UX
          
          console.log(`✅ Drag completed for element:`, elementId, `(distance: ${dragDistance.toFixed(1)}px)`);
        }
        
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
        htmlElement.removeAttribute('data-just-dragged');
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
      className="absolute inset-0 pointer-events-none z-20"
    >
      {/* This div acts as a reference point for querySelectorAll */}
    </div>
  );
};

export default DragEnhancer;
