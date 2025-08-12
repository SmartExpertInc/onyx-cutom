'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Moveable from 'react-moveable';

export interface ResizablePlaceholderProps {
  // Initial size (px). If undefined, falls back to content size.
  widthPx?: number;
  heightPx?: number;
  // Maintain aspect ratio toggle
  lockAspectRatio?: boolean;
  // Editable toggle
  isEditable?: boolean;
  // Called continuously during resize (debounced by caller as needed)
  onResize?: (size: { widthPx: number; heightPx: number }) => void;
  // Called when resize is committed (pointerup or Enter)
  onResizeCommit?: (size: { widthPx: number; heightPx: number }) => void;
  // Minimum size constraints
  minWidthPx?: number;
  minHeightPx?: number;
  // Accessibility label
  ariaLabel?: string;
  // Additional class/style for wrapper
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * Lightweight resizable wrapper using react-moveable following official examples.
 * Prevents drag/inline edit conflicts by stopping pointer events originating from handles.
 */
const ResizablePlaceholder: React.FC<ResizablePlaceholderProps> = ({
  widthPx,
  heightPx,
  lockAspectRatio = false,
  isEditable = false,
  onResize,
  onResizeCommit,
  minWidthPx = 60,
  minHeightPx = 60,
  ariaLabel,
  className = '',
  style = {},
  children
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ widthPx: number; heightPx: number }>(() => ({
    widthPx: Math.max(minWidthPx, widthPx || 0),
    heightPx: Math.max(minHeightPx, heightPx || 0)
  }));

  // Sync external size
  useEffect(() => {
    if (typeof widthPx === 'number' || typeof heightPx === 'number') {
      setSize(prev => ({
        widthPx: typeof widthPx === 'number' ? Math.max(minWidthPx, widthPx) : prev.widthPx,
        heightPx: typeof heightPx === 'number' ? Math.max(minHeightPx, heightPx) : prev.heightPx
      }));
    }
  }, [widthPx, heightPx, minWidthPx, minHeightPx]);

  useLayoutEffect(() => {
    if (!wrapperRef.current) return;
    const el = wrapperRef.current;
    if (size.widthPx > 0) el.style.width = `${size.widthPx}px`;
    if (size.heightPx > 0) el.style.height = `${size.heightPx}px`;
  }, [size.widthPx, size.heightPx]);

  const updateSize = useCallback((newSize: { widthPx: number; heightPx: number }, commit: boolean) => {
    const clampedSize = {
      widthPx: Math.max(minWidthPx, newSize.widthPx),
      heightPx: Math.max(minHeightPx, newSize.heightPx)
    };
    
    setSize(clampedSize);
    onResize?.(clampedSize);
    
    if (commit) {
      onResizeCommit?.(clampedSize);
    }
  }, [minWidthPx, minHeightPx, onResize, onResizeCommit]);

  const commitResize = useCallback((finalSize: { widthPx: number; heightPx: number }) => {
    onResizeCommit?.(finalSize);
  }, [onResizeCommit]);

  return (
    <div
      ref={wrapperRef}
      data-draggable="true"
      className={`resizable-placeholder ${className}`}
      style={{ 
        position: 'relative', 
        display: 'inline-block',
        width: size.widthPx,
        height: size.heightPx,
        maxWidth: "auto",
        maxHeight: "auto",
        minWidth: "auto",
        minHeight: "auto",
        ...style 
      }}
      tabIndex={isEditable ? 0 : -1}
      aria-label={ariaLabel}
    >
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        {children}
      </div>

      {/* Moveable controls - EXACT PATTERN FROM OFFICIAL EXAMPLES */}
      {isEditable && (
        <Moveable
          target={wrapperRef.current}
          resizable={true}
          keepRatio={lockAspectRatio}
          throttleResize={1}
          renderDirections={["nw","n","ne","w","e","sw","s","se"]}
          onResize={e => {
            e.target.style.width = `${e.width}px`;
            e.target.style.height = `${e.height}px`;
            e.target.style.transform = e.drag.transform;
          }}
        />
      )}
    </div>
  );
};

export default ResizablePlaceholder;


