// components/positioning/DragEnhancer.tsx
// Adds drag-and-drop functionality to existing template elements

'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface DragEnhancerProps {
  isEnabled: boolean;
  slideId: string;
  savedPositions?: Record<string, { x: number; y: number }>;
  onPositionChange?: (elementId: string, position: { x: number; y: number }) => void;
}

interface AlignmentGuide {
  type: 'vertical' | 'horizontal';
  position: number; // Position in pixels relative to canvas
  elementId?: string; // ID of element we're aligning with
}

interface GuideInfo {
  position: number;
  distance: number;
}

// Grid and alignment configuration
const GRID_CONFIG = {
  // Grid appearance
  color: '#a78bfa', // Light violet
  opacity: 0.2,
  lineWidth: 1,
  
  // Alignment guide appearance
  guideColor: '#10b981', // Green for alignment guides
  guideOpacity: 0.6,
  guideLineWidth: 2,
  
  // Snapping behavior
  snapThreshold: 3, // pixels - distance at which snapping activates
  snapStrength: 0.5, // 0-1, how strongly to snap (0.3 = light magnet, 1.0 = strong constant)
  snapDistanceLimit: 15, // pixels - maximum distance an element can be pulled to prevent large jumps
};

export const DragEnhancer: React.FC<DragEnhancerProps> = ({
  isEnabled,
  slideId,
  savedPositions,
  onPositionChange
}) => {
  const enhancerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const suppressClicksUntilRef = useRef<number>(0);
  
  // Grid and alignment guide state
  const [isDraggingAny, setIsDraggingAny] = useState(false);
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const [draggingElementRect, setDraggingElementRect] = useState<DOMRect | null>(null);

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
        
        // Show grid and enable alignment detection
        setIsDraggingAny(true);
        setDraggingElementId(elementId);
        const slideCanvas = container.closest('[data-slide-canvas="true"]') || container;
        const canvas = slideCanvas.getBoundingClientRect();
        setCanvasRect(canvas);
        setDraggingElementRect(htmlElement.getBoundingClientRect());
        
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

        // Prevent drag on elements with data-no-drag attribute (custom drag handlers)
        // This allows components like bar charts to have their own drag logic
        if (targetElement.closest('[data-no-drag="true"]')) {
          return; // Allow custom drag handlers
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
          // Update element position
          currentX = newX;
          currentY = newY;
          
          // Calculate alignment guides with other elements
          const slideCanvas = container.closest('[data-slide-canvas="true"]') || container;
          const canvas = slideCanvas.getBoundingClientRect();
          setCanvasRect(canvas);
          
          // Get current element bounds
          const elementRect = htmlElement.getBoundingClientRect();
          setDraggingElementRect(elementRect);
          
          // Calculate element position relative to canvas
          const elementLeft = elementRect.left - canvas.left;
          const elementRight = elementRect.right - canvas.left;
          const elementTop = elementRect.top - canvas.top;
          const elementBottom = elementRect.bottom - canvas.top;
          const elementCenterX = elementLeft + (elementRect.width / 2);
          const elementCenterY = elementTop + (elementRect.height / 2);
          
          // Find all other draggable elements
          const allDraggables = container.querySelectorAll('[data-draggable="true"]');
          const guides: AlignmentGuide[] = [];
          
          // Canvas center lines (half horizontally and vertically)
          const canvasCenterX = canvas.width / 2;
          const canvasCenterY = canvas.height / 2;
          
          // Check alignment with canvas center
          if (Math.abs(elementCenterX - canvasCenterX) < GRID_CONFIG.snapThreshold) {
            guides.push({ type: 'vertical', position: canvasCenterX });
          }
          if (Math.abs(elementCenterY - canvasCenterY) < GRID_CONFIG.snapThreshold) {
            guides.push({ type: 'horizontal', position: canvasCenterY });
          }
          
          // Check alignment with other elements
          allDraggables.forEach((otherElement) => {
            if (otherElement === htmlElement) return;
            
            const otherEl = otherElement as HTMLElement;
            const otherRect = otherEl.getBoundingClientRect();
            const otherLeft = otherRect.left - canvas.left;
            const otherRight = otherRect.right - canvas.left;
            const otherTop = otherRect.top - canvas.top;
            const otherBottom = otherRect.bottom - canvas.top;
            const otherCenterX = otherLeft + (otherRect.width / 2);
            const otherCenterY = otherTop + (otherRect.height / 2);
            
            // Vertical alignments (left, center, right)
            if (Math.abs(elementLeft - otherLeft) < GRID_CONFIG.snapThreshold) {
              guides.push({ type: 'vertical', position: otherLeft, elementId: otherEl.id });
            }
            if (Math.abs(elementCenterX - otherCenterX) < GRID_CONFIG.snapThreshold) {
              guides.push({ type: 'vertical', position: otherCenterX, elementId: otherEl.id });
            }
            if (Math.abs(elementRight - otherRight) < GRID_CONFIG.snapThreshold) {
              guides.push({ type: 'vertical', position: otherRight, elementId: otherEl.id });
            }
            
            // Horizontal alignments (top, center, bottom)
            if (Math.abs(elementTop - otherTop) < GRID_CONFIG.snapThreshold) {
              guides.push({ type: 'horizontal', position: otherTop, elementId: otherEl.id });
            }
            if (Math.abs(elementCenterY - otherCenterY) < GRID_CONFIG.snapThreshold) {
              guides.push({ type: 'horizontal', position: otherCenterY, elementId: otherEl.id });
            }
            if (Math.abs(elementBottom - otherBottom) < GRID_CONFIG.snapThreshold) {
              guides.push({ type: 'horizontal', position: otherBottom, elementId: otherEl.id });
            }
          });
          
          setAlignmentGuides(guides);
          
          // Apply light magnetic snapping - allows movement but gently pulls toward guides
          // Get the element's original position (before transform)
          const originalLeft = htmlElement.offsetLeft;
          const originalTop = htmlElement.offsetTop;
          const elementWidth = elementRect.width;
          const elementHeight = elementRect.height;
          
          // Find the closest guide for each axis
          let closestVerticalGuide: GuideInfo | null = null;
          let closestHorizontalGuide: GuideInfo | null = null;
          
          guides.forEach((guide) => {
            if (guide.type === 'vertical') {
              // Calculate which edge/center is closest to the guide
              const elementCenterX = elementLeft + (elementWidth / 2);
              const distToLeft = Math.abs(elementLeft - guide.position);
              const distToCenter = Math.abs(elementCenterX - guide.position);
              const distToRight = Math.abs(elementRight - guide.position);
              
              const minDist = Math.min(distToLeft, distToCenter, distToRight);
              
              if (minDist < GRID_CONFIG.snapThreshold) {
                if (!closestVerticalGuide || minDist < closestVerticalGuide.distance) {
                  // Determine which alignment type (left, center, or right)
                  let targetPosition = guide.position;
                  if (minDist === distToLeft) {
                    targetPosition = guide.position; // Left edge
                  } else if (minDist === distToCenter) {
                    targetPosition = guide.position - (elementWidth / 2); // Center
                  } else {
                    targetPosition = guide.position - elementWidth; // Right edge
                  }
                  
                  closestVerticalGuide = {
                    position: targetPosition - originalLeft,
                    distance: minDist
                  } as GuideInfo;
                }
              }
            } else if (guide.type === 'horizontal') {
              // Calculate which edge/center is closest to the guide
              const elementCenterY = elementTop + (elementHeight / 2);
              const distToTop = Math.abs(elementTop - guide.position);
              const distToCenter = Math.abs(elementCenterY - guide.position);
              const distToBottom = Math.abs(elementBottom - guide.position);
              
              const minDist = Math.min(distToTop, distToCenter, distToBottom);
              
              if (minDist < GRID_CONFIG.snapThreshold) {
                if (!closestHorizontalGuide || minDist < closestHorizontalGuide.distance) {
                  // Determine which alignment type (top, center, or bottom)
                  let targetPosition = guide.position;
                  if (minDist === distToTop) {
                    targetPosition = guide.position; // Top edge
                  } else if (minDist === distToCenter) {
                    targetPosition = guide.position - (elementHeight / 2); // Center
                  } else {
                    targetPosition = guide.position - elementHeight; // Bottom edge
                  }
                  
                  closestHorizontalGuide = {
                    position: targetPosition - originalTop,
                    distance: minDist
                  } as GuideInfo;
                }
              }
            }
          });
          
          // Apply light magnetic snapping - interpolate between current position and snap position
          if (closestVerticalGuide) {
            const vGuide: GuideInfo = closestVerticalGuide;
            // Calculate the distance the element would need to move to snap
            const snapDistance = Math.abs(vGuide.position - currentX);
            
            // Only apply snapping if the distance is within the limit (prevents large jumps)
            if (snapDistance <= GRID_CONFIG.snapDistanceLimit) {
              // Calculate interpolation factor based on distance (closer = stronger pull)
              const pullStrength = (1 - (vGuide.distance / GRID_CONFIG.snapThreshold)) * GRID_CONFIG.snapStrength;
              currentX = currentX + (vGuide.position - currentX) * pullStrength;
            }
          }
          
          if (closestHorizontalGuide) {
            const hGuide: GuideInfo = closestHorizontalGuide;
            // Calculate the distance the element would need to move to snap
            const snapDistance = Math.abs(hGuide.position - currentY);
            
            // Only apply snapping if the distance is within the limit (prevents large jumps)
            if (snapDistance <= GRID_CONFIG.snapDistanceLimit) {
              // Calculate interpolation factor based on distance (closer = stronger pull)
              const pullStrength = (1 - (hGuide.distance / GRID_CONFIG.snapThreshold)) * GRID_CONFIG.snapStrength;
              currentY = currentY + (hGuide.position - currentY) * pullStrength;
            }
          }
          
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
        
        // If we were dragging, prevent any immediate click events
        if (isDragging) {
          e.preventDefault();
          e.stopPropagation();
        }

        if (isDragging) {
          isDragging = false;
          // Hide grid and alignment guides
          setIsDraggingAny(false);
          setDraggingElementId(null);
          setAlignmentGuides([]);
          setDraggingElementRect(null);
          setCanvasRect(null);
          
          // FIXED: Reset position to original value to avoid layout issues
          htmlElement.style.position = '';
          htmlElement.style.zIndex = '';
          htmlElement.style.userSelect = '';
          htmlElement.classList.remove('dragging');

          // Suppress the very next click to avoid entering edit after drag
          // Set suppress window first
          suppressClicksUntilRef.current = Date.now() + 400;
          
          // Create a more targeted click suppression that only affects draggable elements
          const suppressNextClick = (ev: MouseEvent) => {
            const target = ev.target as HTMLElement;
            
            // Find the closest draggable element
            const isDraggableElement = target.closest('[data-draggable="true"]');
            
            // If not inside a draggable element, don't suppress
            if (!isDraggableElement) {
              return;
            }
            
            // Check if this draggable element was just dragged
            const wasJustDragged = isDraggableElement.getAttribute('data-just-dragged') === 'true';
            const isWithinSuppressWindow = Date.now() < suppressClicksUntilRef.current;
            
            // Don't suppress clicks on wysiwyg editor elements (toolbar, buttons, etc.)
            const isWysiwygElement = target.closest('.wysiwyg-editor') ||
                                    target.closest('[class*="wysiwyg"]') ||
                                    target.tagName === 'BUTTON' ||
                                    target.tagName === 'INPUT' ||
                                    target.getAttribute('role') === 'button';
            
            // Suppress clicks if:
            // 1. The draggable element was just dragged AND we're within the suppress window
            // 2. AND it's not a wysiwyg editor element (toolbar buttons, etc.)
            if ((wasJustDragged || isWithinSuppressWindow) && !isWysiwygElement) {
              ev.stopImmediatePropagation();
              ev.stopPropagation();
              ev.preventDefault();
            }
          };
          
          // Add listener BEFORE setting attribute to catch any immediate click events
          document.addEventListener('click', suppressNextClick, true);
          
          // Now set the attribute to mark this element as just dragged
          htmlElement.setAttribute('data-just-dragged', 'true');
          
          // Clean up after suppress window
          setTimeout(() => {
            document.removeEventListener('click', suppressNextClick, true);
            htmlElement.removeAttribute('data-just-dragged');
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
    <>
      <div ref={enhancerRef} className="absolute inset-0 pointer-events-none z-20" />
      
      {/* Canva-like Grid Overlay - shows when dragging */}
      {isDraggingAny && canvasRect && (
        <div
          style={{
            position: 'fixed',
            top: canvasRect.top,
            left: canvasRect.left,
            width: canvasRect.width,
            height: canvasRect.height,
            pointerEvents: 'none',
            zIndex: 9999,
            opacity: GRID_CONFIG.opacity
          }}
        >
          {/* Vertical center line (half horizontally) */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              width: `${GRID_CONFIG.lineWidth}px`,
              height: '100%',
              backgroundColor: GRID_CONFIG.color,
              transform: 'translateX(-50%)'
            }}
          />
          
          {/* Horizontal center line (half vertically) */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              width: '100%',
              height: `${GRID_CONFIG.lineWidth}px`,
              backgroundColor: GRID_CONFIG.color,
              transform: 'translateY(-50%)'
            }}
          />
        </div>
      )}
      
      {/* Alignment Guides - shows when aligning with other elements */}
      {isDraggingAny && canvasRect && alignmentGuides.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: canvasRect.top,
            left: canvasRect.left,
            width: canvasRect.width,
            height: canvasRect.height,
            pointerEvents: 'none',
            zIndex: 10000,
            opacity: GRID_CONFIG.guideOpacity
          }}
        >
          {alignmentGuides.map((guide, index) => {
            if (guide.type === 'vertical') {
              return (
                <div
                  key={`vertical-${index}`}
                  style={{
                    position: 'absolute',
                    left: `${guide.position}px`,
                    top: 0,
                    width: `${GRID_CONFIG.guideLineWidth}px`,
                    height: '100%',
                    backgroundColor: GRID_CONFIG.guideColor,
                    boxShadow: `0 0 4px ${GRID_CONFIG.guideColor}80`
                  }}
                />
              );
            } else {
              return (
                <div
                  key={`horizontal-${index}`}
                  style={{
                    position: 'absolute',
                    top: `${guide.position}px`,
                    left: 0,
                    width: '100%',
                    height: `${GRID_CONFIG.guideLineWidth}px`,
                    backgroundColor: GRID_CONFIG.guideColor,
                    boxShadow: `0 0 4px ${GRID_CONFIG.guideColor}80`
                  }}
                />
              );
            }
          })}
        </div>
      )}
    </>
  );
};

export default DragEnhancer;
