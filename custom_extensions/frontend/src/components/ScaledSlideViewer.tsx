// components/ScaledSlideViewer.tsx
// Component that renders slides at native video dimensions (1920×1080)
// and uses CSS transform: scale() to visually fit them in the editor

'use client';

import React, { useRef, useEffect, useState } from 'react';

interface ScaledSlideViewerProps {
  /** Native width of the slide (e.g., 1920 for video) */
  nativeWidth: number;
  
  /** Native height of the slide (e.g., 1080 for video) */
  nativeHeight: number;
  
  /** Content to render at native size */
  children: React.ReactNode;
  
  /** Padding around the scaled slide (default: 20px) */
  padding?: number;
  
  /** Additional CSS classes for the wrapper */
  className?: string;
  
  /** Whether to show debug info (scale factor, dimensions) */
  debug?: boolean;
}

/**
 * ScaledSlideViewer
 * 
 * This component solves the slide scaling problem by:
 * 1. Rendering slides at their NATIVE size (e.g., 1920×1080)
 * 2. Using CSS transform: scale() to visually reduce them
 * 3. Preserving all proportions, positions, and text sizes
 * 4. Maintaining correct 16:9 aspect ratio
 * 
 * Benefits:
 * - Templates maintain full control over styling
 * - Absolute positions calculate correctly
 * - Text sizes remain at intended values
 * - Direct video export (no conversion needed)
 * - Simple implementation with automatic responsive scaling
 */
export const ScaledSlideViewer: React.FC<ScaledSlideViewerProps> = ({
  nativeWidth,
  nativeHeight,
  children,
  padding = 20,
  className = '',
  debug = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      const parent = containerRef.current.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      
      // 📐 LEVEL 1: Parent Container Analysis
      console.log('📐 [1. ScaledSlideViewer] Parent container:', {
        className: parent.className,
        tagName: parent.tagName,
        dimensions: {
          width: rect.width,
          height: rect.height,
        }
      });
      
      // Calculate available space (subtract padding on both sides)
      const availableWidth = rect.width - padding * 2;
      const availableHeight = rect.height - padding * 2;

      // Calculate scale for both axes
      const scaleX = availableWidth / nativeWidth;
      const scaleY = availableHeight / nativeHeight;

      // Use the smaller scale to ensure the slide fits completely
      // Cap at 1.0 to prevent enlarging beyond native size
      const newScale = Math.min(scaleX, scaleY, 1);
      
      // 📐 LEVEL 1: Scale Calculation Results
      console.log('📐 [1. ScaledSlideViewer] Scale calculation:', {
        nativeSize: { width: nativeWidth, height: nativeHeight },
        availableSpace: { width: availableWidth, height: availableHeight },
        calculatedScale: {
          scaleX: scaleX.toFixed(3),
          scaleY: scaleY.toFixed(3),
          final: newScale.toFixed(3),
        },
        resultingDimensions: {
          width: Math.round(nativeWidth * newScale),
          height: Math.round(nativeHeight * newScale),
        }
      });
      
      setScale(newScale);
      setDimensions({
        width: nativeWidth * newScale,
        height: nativeHeight * newScale
      });

      if (debug) {
        console.log('🔍 [ScaledSlideViewer] Scale calculated:', {
          parentSize: { width: rect.width, height: rect.height },
          available: { width: availableWidth, height: availableHeight },
          native: { width: nativeWidth, height: nativeHeight },
          scaleX: scaleX.toFixed(3),
          scaleY: scaleY.toFixed(3),
          finalScale: newScale.toFixed(3),
          scaledDimensions: {
            width: Math.round(nativeWidth * newScale),
            height: Math.round(nativeHeight * newScale)
          }
        });
      }
    };

    // Initial calculation
    updateScale();
    
    // Use ResizeObserver for reactive updates when container size changes
    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current?.parentElement) {
      resizeObserver.observe(containerRef.current.parentElement);
    }

    // Also listen to window resize as backup
    window.addEventListener('resize', updateScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [nativeWidth, nativeHeight, padding, debug]);

  const scaledWidth = dimensions.width;
  const scaledHeight = dimensions.height;

  // 📐 LEVEL 2: Outer Wrapper Verification
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      console.log('📐 [2. ScaledSlideViewer] Outer wrapper rendered:', {
        setDimensions: { width: scaledWidth, height: scaledHeight },
        actualDimensions: { 
          width: rect.width, 
          height: rect.height 
        },
        match: {
          width: Math.abs(rect.width - scaledWidth) < 1,
          height: Math.abs(rect.height - scaledHeight) < 1,
        }
      });
    }
  }, [scaledWidth, scaledHeight]);

  // 📐 LEVEL 3: Inner Content Verification
  useEffect(() => {
    if (contentRef.current) {
      const rect = contentRef.current.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(contentRef.current);
      const transform = computedStyle.transform;
      
      console.log('📐 [3. ScaledSlideViewer] Inner content:', {
        nativeDimensions: { width: nativeWidth, height: nativeHeight },
        transform: transform,
        actualVisualDimensions: { 
          width: rect.width, 
          height: rect.height 
        },
        expectedVisualDimensions: {
          width: nativeWidth * scale,
          height: nativeHeight * scale,
        }
      });
    }
  }, [scale, nativeWidth, nativeHeight]);

  return (
    <div
      ref={containerRef}
      className={`scaled-slide-viewer ${className}`}
      style={{
        width: scaledWidth,
        height: scaledHeight,
        position: 'relative',
        margin: '0 auto',
        overflow: 'visible', // Important: allows DragEnhancer to work correctly
      }}
    >
      {/* Debug overlay */}
      {debug && (
        <div
          style={{
            position: 'absolute',
            top: -30,
            left: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            fontSize: '12px',
            borderRadius: '4px',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          Scale: {(scale * 100).toFixed(1)}% | 
          Native: {nativeWidth}×{nativeHeight} | 
          Scaled: {Math.round(scaledWidth)}×{Math.round(scaledHeight)}
        </div>
      )}
      
      {/* Content rendered at NATIVE size, then scaled down */}
      <div
        ref={contentRef}
        className="scaled-slide-content"
        style={{
          width: nativeWidth,
          height: nativeHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'top left', // Scale from top-left corner
          position: 'absolute',
          top: 0,
          left: 0,
          // Performance optimizations
          willChange: scale < 1 ? 'transform' : 'auto',
          backfaceVisibility: 'hidden',
          // Font rendering improvements
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ScaledSlideViewer;

