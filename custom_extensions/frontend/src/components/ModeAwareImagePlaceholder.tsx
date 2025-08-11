'use client';

import React, { useMemo, useRef } from 'react';
import ResizablePlaceholder from './ResizablePlaceholder';
import { useSplitResize } from '@/hooks/useSplitResize';

export type ImageMode = 'full-side' | 'free-proportion';

interface ModeAwareImagePlaceholderProps {
  mode: ImageMode;
  lockedSide?: 'width' | 'height'; // required for full-side
  imagePath?: string;
  description?: string;
  isEditable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  // size/transform
  widthPx?: number;
  heightPx?: number;
  onSizeTransformChange?: (payload: { widthPx?: number; heightPx?: number; objectFit?: 'contain'|'cover'|'fill' }) => void;
  children?: React.ReactNode;
}

/**
 * Mode-aware image placeholder:
 * - free-proportion: proportional resize via ResizablePlaceholder corners
 * - full-side: one dimension locked to container, the other adjustable via split bar
 */
const ModeAwareImagePlaceholder: React.FC<ModeAwareImagePlaceholderProps> = ({
  mode,
  lockedSide,
  imagePath,
  description = '',
  isEditable = false,
  className = '',
  style = {},
  widthPx,
  heightPx,
  onSizeTransformChange,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  if (mode === 'free-proportion') {
    // Always ensure contain for free-proportion
    return (
      <ResizablePlaceholder
        isEditable={isEditable}
        className={`${className}`}
        style={{ ...style }}
        widthPx={widthPx}
        heightPx={heightPx}
        minWidthPx={120}
        minHeightPx={120}
        onResize={(s) => onSizeTransformChange?.({ ...s, objectFit: 'contain' })}
        onResizeCommit={(s) => onSizeTransformChange?.({ ...s, objectFit: 'contain' })}
      >
        <div className="w-full h-full relative">
          {imagePath && (
            <img
              src={imagePath}
              alt={description}
              className="absolute inset-0"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          )}
          {children}
        </div>
      </ResizablePlaceholder>
    );
  }

  // full-side
  const axis = lockedSide === 'height' ? 'vertical' : 'horizontal';
  const isLockHeight = lockedSide === 'height';

  const { sizePx, onPointerDown, bindGlobal } = useSplitResize({
    initialSize: (isLockHeight ? widthPx : heightPx) || 300,
    minSize: 80,
    axis: isLockHeight ? 'vertical' : 'horizontal',
    onChange: (val) => {
      if (isLockHeight) {
        onSizeTransformChange?.({ widthPx: val, objectFit: 'cover' });
      } else {
        onSizeTransformChange?.({ heightPx: val, objectFit: 'cover' });
      }
    },
    onCommit: (val) => {
      if (isLockHeight) {
        onSizeTransformChange?.({ widthPx: val, objectFit: 'cover' });
      } else {
        onSizeTransformChange?.({ heightPx: val, objectFit: 'cover' });
      }
    }
  });

  useMemo(() => bindGlobal(), [bindGlobal]);

  return (
    <div ref={containerRef} className={className} style={{ ...style, position: 'relative' }}>
      <div
        className="relative overflow-hidden"
        style={{
          width: isLockHeight ? sizePx : '100%',
          height: isLockHeight ? '100%' : sizePx,
        }}
      >
        {imagePath && (
          <img
            src={imagePath}
            alt={description}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover', // fill the locked dimension, crop the other
            }}
          />
        )}
        {children}
        {isEditable && (
          <div
            role="separator"
            aria-orientation={axis === 'vertical' ? 'vertical' : 'horizontal'}
            onPointerDown={onPointerDown}
            style={{
              position: 'absolute',
              cursor: axis === 'vertical' ? 'ew-resize' : 'ns-resize',
              top: 0,
              bottom: 0,
              left: axis === 'vertical' ? -4 : 0,
              right: axis === 'vertical' ? undefined : 0,
              width: axis === 'vertical' ? 8 : '100%',
              height: axis === 'vertical' ? '100%' : 8,
              background: axis === 'vertical' ? 'rgba(59,130,246,0.35)' : 'rgba(59,130,246,0.35)'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ModeAwareImagePlaceholder;


