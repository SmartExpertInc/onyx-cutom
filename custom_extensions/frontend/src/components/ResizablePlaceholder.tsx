'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

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
 * Lightweight resizable wrapper with 8 handles, keyboard controls, and shift-to-lock aspect ratio.
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
  const isResizingRef = useRef(false);
  const startRectRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const activeHandleRef = useRef<string | null>(null);
  const [size, setSize] = useState<{ widthPx: number; heightPx: number }>(() => ({
    widthPx: Math.max(minWidthPx, widthPx || 0),
    heightPx: Math.max(minHeightPx, heightPx || 0)
  }));
  const aspectOnStartRef = useRef<number | null>(null);
  const [isKeyboardResizing, setIsKeyboardResizing] = useState(false);

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

  // If no explicit size provided, measure content once to preserve template default size
  useLayoutEffect(() => {
    if (!wrapperRef.current) return;
    if ((widthPx && heightPx) || (size.widthPx > 0 && size.heightPx > 0)) return;
    const el = wrapperRef.current;
    const content = el.firstElementChild as HTMLElement | null;
    if (content) {
      const rect = content.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const init = {
          widthPx: Math.max(minWidthPx, Math.round(rect.width)),
          heightPx: Math.max(minHeightPx, Math.round(rect.height))
        };
        setSize(init);
        if (onResize) onResize(init);
        if (onResizeCommit) onResizeCommit(init);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commitResize = useCallback((finalSize: { widthPx: number; heightPx: number }) => {
    if (onResizeCommit) onResizeCommit(finalSize);
  }, [onResizeCommit]);

  const updateSize = useCallback((next: { widthPx: number; heightPx: number }, commit = false) => {
    const clamped = {
      widthPx: Math.max(minWidthPx, Math.round(next.widthPx)),
      heightPx: Math.max(minHeightPx, Math.round(next.heightPx))
    };
    setSize(clamped);
    if (onResize) onResize(clamped);
    if (commit) commitResize(clamped);
  }, [minWidthPx, minHeightPx, onResize, commitResize]);

  const onPointerDownHandle = (e: React.PointerEvent<HTMLDivElement>, handle: string) => {
    if (!isEditable) return;
    e.preventDefault();
    e.stopPropagation();
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    startRectRef.current = { x: e.clientX, y: e.clientY, w: rect.width, h: rect.height };
    activeHandleRef.current = handle;
    isResizingRef.current = true;
    aspectOnStartRef.current = rect.width > 0 && rect.height > 0 ? rect.width / rect.height : null;
    (document.body as any).classList?.add('resizing');
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isResizingRef.current || !startRectRef.current) return;
    e.preventDefault();
    const { x, y, w, h } = startRectRef.current;
    const dx = e.clientX - x;
    const dy = e.clientY - y;
    const handle = activeHandleRef.current || 'se';
    let newW = w;
    let newH = h;
    // Corner/edge logic
    if (handle.includes('e')) newW = w + dx;
    if (handle.includes('s')) newH = h + dy;
    if (handle.includes('w')) newW = w - dx;
    if (handle.includes('n')) newH = h - dy;

    // Always keep aspect ratio when resizing from corners
    const ratio = aspectOnStartRef.current || (w / h);
    const isCorner = handle === 'nw' || handle === 'ne' || handle === 'se' || handle === 'sw';
    const keepRatio = lockAspectRatio || isCorner;
    if (keepRatio && isFinite(ratio) && ratio > 0) {
      // Prefer width change and derive height
      newH = newW / ratio;
    }
    updateSize({ widthPx: newW, heightPx: newH }, false);
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!isResizingRef.current) return;
    e.preventDefault();
    isResizingRef.current = false;
    startRectRef.current = null;
    activeHandleRef.current = null;
    (document.body as any).classList?.remove('resizing');
    commitResize(size);
  };

  useEffect(() => {
    const move = (ev: PointerEvent) => onPointerMove(ev);
    const up = (ev: PointerEvent) => onPointerUp(ev);
    document.addEventListener('pointermove', move, { passive: false });
    document.addEventListener('pointerup', up, { passive: false });
    return () => {
      document.removeEventListener('pointermove', move as any);
      document.removeEventListener('pointerup', up as any);
    };
  }, [size, commitResize]);

  // Keyboard resizing: Arrow keys; Shift for larger step
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isEditable) return;
    const step = e.shiftKey ? 10 : 2;
    let changed = false;
    let next = { ...size };
    switch (e.key) {
      case 'ArrowRight':
        next.widthPx += step; next.heightPx = Math.round(next.widthPx / ((size.widthPx || 1) / (size.heightPx || 1))); changed = true; break;
      case 'ArrowLeft':
        next.widthPx -= step; next.heightPx = Math.round(next.widthPx / ((size.widthPx || 1) / (size.heightPx || 1))); changed = true; break;
      case 'ArrowDown':
        next.heightPx += step; next.widthPx = Math.round(next.heightPx * ((size.widthPx || 1) / (size.heightPx || 1))); changed = true; break;
      case 'ArrowUp':
        next.heightPx -= step; next.widthPx = Math.round(next.heightPx * ((size.widthPx || 1) / (size.heightPx || 1))); changed = true; break;
      case 'Enter':
        if (isKeyboardResizing) {
          e.preventDefault();
          commitResize(size);
          setIsKeyboardResizing(false);
        }
        return;
      case 'Escape':
        setIsKeyboardResizing(false);
        return;
      default:
        return;
    }
    if (changed) {
      e.preventDefault();
      setIsKeyboardResizing(true);
      updateSize(next, false);
    }
  };

  const handles = isEditable ? (
    <>
      {['nw','ne','se','sw'].map(dir => (
        <div
          key={dir}
          role="button"
          aria-label={`Resize ${dir}`}
          data-resize-handle={dir}
          onPointerDown={(e) => onPointerDownHandle(e, dir)}
          onPointerMove={(e) => { /* prevent drag enhancer */ e.stopPropagation(); }}
          onClick={(e) => e.stopPropagation()}
          style={getHandleStyle(dir)}
        />
      ))}
    </>
  ) : null;

  return (
    <div
      ref={wrapperRef}
      data-draggable="true"
      className={`resizable-placeholder ${className}`}
      style={{ position: 'relative', display: 'inline-block', ...style }}
      tabIndex={isEditable ? 0 : -1}
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
    >
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        {children}
      </div>
      {handles}
      {/* Inline minimal styles for handles */}
      <style>{`
        .resizable-placeholder { outline: none; }
        .resizable-placeholder:hover [data-resize-handle], .resizable-placeholder:focus [data-resize-handle] { opacity: 1; }
        [data-resize-handle] {
          position: absolute;
          width: 10px; height: 10px;
          background: #3b82f6; border: 2px solid #fff; box-sizing: border-box;
          border-radius: 2px; z-index: 30; opacity: 0; transition: opacity 120ms ease;
          touch-action: none; cursor: pointer;
        }
        [data-resize-handle="nw"], [data-resize-handle="ne"], [data-resize-handle="se"], [data-resize-handle="sw"] { }
        [data-resize-handle="nw"] { top: -6px; left: -6px; cursor: nwse-resize; }
        [data-resize-handle="ne"] { top: -6px; right: -6px; cursor: nesw-resize; }
        [data-resize-handle="se"] { bottom: -6px; right: -6px; cursor: nwse-resize; }
        [data-resize-handle="sw"] { bottom: -6px; left: -6px; cursor: nesw-resize; }
        body.resizing * { user-select: none !important; }
      `}</style>
    </div>
  );
};

function getHandleStyle(dir: string): React.CSSProperties {
  const base: React.CSSProperties = {};
  switch (dir) {
    case 'n': return { ...base, top: -6, left: '50%' } as any;
    case 's': return { ...base, bottom: -6, left: '50%' } as any;
    case 'e': return { ...base, right: -6, top: '50%' } as any;
    case 'w': return { ...base, left: -6, top: '50%' } as any;
    case 'nw': return { ...base, top: -6, left: -6 } as any;
    case 'ne': return { ...base, top: -6, right: -6 } as any;
    case 'se': return { ...base, bottom: -6, right: -6 } as any;
    case 'sw': return { ...base, bottom: -6, left: -6 } as any;
    default: return base;
  }
}

export default ResizablePlaceholder;


