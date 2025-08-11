'use client';

import { useCallback, useRef, useState } from 'react';

export type SplitAxis = 'vertical' | 'horizontal';

interface UseSplitResizeOptions {
  initialSize: number; // px
  minSize?: number; // px
  maxSize?: number; // px
  axis: SplitAxis; // vertical: drag bar horizontally to change width; horizontal: drag bar vertically to change height
  onChange?: (sizePx: number) => void;
  onCommit?: (sizePx: number) => void;
}

export function useSplitResize({ initialSize, minSize = 80, maxSize, axis, onChange, onCommit }: UseSplitResizeOptions) {
  const [sizePx, setSizePx] = useState<number>(initialSize);
  const startRef = useRef<{ startPos: number; startSize: number } | null>(null);

  const clamp = useCallback((v: number) => {
    const lower = Math.max(minSize, isFinite(minSize) ? minSize : 0);
    const upper = typeof maxSize === 'number' ? maxSize : Number.POSITIVE_INFINITY;
    return Math.max(lower, Math.min(upper, v));
  }, [minSize, maxSize]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    startRef.current = {
      startPos: axis === 'horizontal' ? e.clientY : e.clientX,
      startSize: sizePx
    };
    (document.body as any).classList?.add('resizing');
  }, [axis, sizePx]);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!startRef.current) return;
    e.preventDefault();
    const delta = (axis === 'horizontal' ? e.clientY : e.clientX) - startRef.current.startPos;
    const next = clamp(startRef.current.startSize + delta);
    setSizePx(next);
    onChange?.(next);
  }, [axis, clamp, onChange]);

  const onPointerUp = useCallback((e: PointerEvent) => {
    if (!startRef.current) return;
    e.preventDefault();
    (document.body as any).classList?.remove('resizing');
    onCommit?.(sizePx);
    startRef.current = null;
  }, [onCommit, sizePx]);

  const bindGlobal = useCallback(() => {
    const move = (ev: PointerEvent) => onPointerMove(ev);
    const up = (ev: PointerEvent) => onPointerUp(ev);
    document.addEventListener('pointermove', move, { passive: false });
    document.addEventListener('pointerup', up, { passive: false });
    return () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
    };
  }, [onPointerMove, onPointerUp]);

  return { sizePx, setSizePx, onPointerDown, bindGlobal };
}


