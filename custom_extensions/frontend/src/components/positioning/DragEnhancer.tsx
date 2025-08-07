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

    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {

    // Find all draggable elements in the template
    const draggableSelectors = [
      // Primary elements - titles and headers
      'h1',
      'h2', 
      'h3',
      
      // Main content containers - these are the key draggable elements
      '[class*="-template"] > div:not(:first-child)', // Direct children of template (skip title)
      
      // Specific content elements
      'div[style*="display: flex"]', // Main flex containers
      'div[style*="flexDirection: row"]', // Row containers
      'div[style*="flexDirection: column"]', // Column containers
      
      // Text content
      'ul', 
      'ol', 
      'p',
      
      // Explicit markers
      '[data-draggable="true"]'
    ];

    const elements = container.querySelectorAll(draggableSelectors.join(', '));
    
    // Debug: log what we found
    console.log(`🔍 DragEnhancer Debug for slide ${slideId}:`);
    console.log(`   - Container:`, container);
    console.log(`   - Selectors:`, draggableSelectors.join(', '));
    console.log(`   - Found ${elements.length} elements:`, Array.from(elements));
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
        
        if (e.target !== htmlElement && !htmlElement.contains(e.target as Node)) {
          console.log(`❌ MouseDown ignored - target not in element`);
          return;
        }
        
        // Don't interfere with text selection or input focus
        const target = e.target as HTMLElement;
        if (target.isContentEditable || 
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.className.includes('inline-editor') ||
            target.closest('.inline-editor-title') ||
            target.closest('.inline-editor-challenges-title') ||
            target.closest('.inline-editor-challenge') ||
            target.closest('.inline-editor-solution') ||
            target.closest('.inline-editor-solutions-title')) {
          console.log(`❌ MouseDown ignored - text editing element`);
          return;
        }

        console.log(`✅ Starting drag for element:`, elementId);
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
