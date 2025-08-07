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

// Helper function to calculate the depth/distance between target and container
const getElementDepth = (target: HTMLElement, container: HTMLElement): number => {
  if (target === container) return 0;
  
  let depth = 0;
  let current = target;
  
  while (current && current !== container && current.parentElement) {
    depth++;
    current = current.parentElement;
    if (depth > 100) break; // Prevent infinite loops
  }
  
  return current === container ? depth : Infinity;
};

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

    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {

    // Find all draggable elements in the template
    const draggableSelectors = [
      // Explicit markers (highest priority)
      '[data-draggable="true"]',
      
      // Primary elements - titles and headers
      'h1',
      'h2', 
      'h3',
      
      // Text content elements
      'ul', 
      'ol', 
      'p',
      
      // Content containers
      'div[style*="display: flex"]', // Flex containers
      'div[style*="flexDirection: row"]', // Row containers
      'div[style*="flexDirection: column"]', // Column containers
      
      // Direct children of templates (skip title)
      '[class*="-template"] > div:not(:first-child)'
    ];

    const allElements = container.querySelectorAll(draggableSelectors.join(', '));
    
    // Filter out main template containers and flex wrappers (they're too broad and cause conflicts)
    const elements = Array.from(allElements).filter(element => {
      const className = element.className;
      const style = element.getAttribute('style') || '';
      
      // Exclude main template containers like "content-slide-template", "bullet-points-template", etc.
      if (className && className.includes('-template') && !element.hasAttribute('data-draggable')) {
        return false;
      }
      
      // Exclude flex containers that wrap multiple draggable elements
      if (style.includes('display: flex') || style.includes('display:flex')) {
        const childDraggables = element.querySelectorAll('h1, h2, h3, ul, ol, p, [data-draggable="true"]');
        if (childDraggables.length > 1) {
          return false; // This flex container has multiple draggable children, exclude it
        }
      }
      
      return true;
    });
    
    // Debug: log what we found (filtered)
    console.log(`🔍 DragEnhancer Debug for slide ${slideId}:`);
    console.log(`   - Container:`, container);
    console.log(`   - Found ${elements.length} FILTERED elements:`, Array.from(elements));
    console.log(`   - isEnabled:`, isEnabled);
    
    elements.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      const elementId = htmlElement.id || `draggable-${slideId}-${index}`;
      
      if (!htmlElement.id) {
        htmlElement.id = elementId;
      }

      // Add drag cursor and debug styling
      htmlElement.style.cursor = 'move';
      htmlElement.style.transition = 'box-shadow 0.2s ease';
      
      // Debug: Add a visible border to confirm element is detected
      htmlElement.style.border = '1px dashed rgba(59, 130, 246, 0.3)';
      
      // Add hover effect
      htmlElement.addEventListener('mouseenter', () => {
        htmlElement.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.5)';
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
        console.log(`🖱️ MouseDown on element:`, elementId, e.target);
        
        // Check if this is the most specific (deepest) draggable element
        const targetElement = e.target as HTMLElement;
        const allDraggableElements = Array.from(container.querySelectorAll(draggableSelectors.join(', ')));
        
        // Find the most specific draggable element (closest to the actual target)
        let mostSpecificDraggable = null;
        let shortestDistance = Infinity;
        
        for (const draggableEl of allDraggableElements) {
          if (draggableEl.contains(targetElement) || draggableEl === targetElement) {
            const distance = getElementDepth(targetElement, draggableEl as HTMLElement);
            if (distance < shortestDistance) {
              shortestDistance = distance;
              mostSpecificDraggable = draggableEl;
            }
          }
        }
        
        // Only proceed if this element is the most specific draggable
        if (mostSpecificDraggable !== htmlElement) {
          console.log(`❌ MouseDown ignored - more specific draggable element found:`, mostSpecificDraggable);
          return;
        }
        
        // Don't interfere with text selection or input focus
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
        
        // CRITICAL: Stop event propagation to prevent parent elements from also dragging
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
        
        // If element was actually dragged, prevent click events
        if (wasDragged) {
          // Add a flag to prevent click events for a short time
          htmlElement.setAttribute('data-just-dragged', 'true');
          setTimeout(() => {
            htmlElement.removeAttribute('data-just-dragged');
          }, 300); // 300ms delay
          
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
    
    }, 100); // 100ms delay

    // Cleanup function for the effect
    return () => {
      clearTimeout(timer);
      // Also cleanup any existing elements
      if (container) {
        const elements = container.querySelectorAll('[data-draggable="true"], h1, h2, h3');
        elements.forEach(element => {
          const cleanup = (element as any).__dragCleanup;
          if (cleanup) cleanup();
        });
      }
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
