"use client";

import React, { useMemo } from 'react';
import { ImageMode } from '@/types/slideTemplates';
import ModeAwareImagePlaceholder from './ModeAwareImagePlaceholder';

interface ClickableImagePlaceholderProps {
  imagePath?: string;
  onImageUploaded: (imagePath: string) => void;
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';
  position?: 'LEFT' | 'RIGHT' | 'CENTER' | 'BACKGROUND';
  description?: string;
  prompt?: string;
  isEditable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  
  // Size and transform props
  widthPx?: number;
  heightPx?: number;
  objectFit?: 'contain' | 'cover' | 'fill';
  imageScale?: number;
  imageOffset?: { x: number; y: number };
  
  // NEW: Mode-aware properties
  imageMode?: ImageMode;
  lockedSide?: 'width' | 'height';
  
  onSizeTransformChange?: (payload: {
    widthPx?: number;
    heightPx?: number;
    objectFit?: 'contain' | 'cover' | 'fill';
    imageScale?: number;
    imageOffset?: { x: number; y: number };
  }) => void;
}

const ClickableImagePlaceholder: React.FC<ClickableImagePlaceholderProps> = ({
  imagePath,
  onImageUploaded,
  size = 'MEDIUM',
  position = 'CENTER',
  description = 'Click to upload image',
  prompt = 'relevant illustration',
  isEditable = true,
  className = '',
  style = {},
  widthPx,
  heightPx,
  objectFit,
  imageScale,
  imageOffset,
  // NEW: Mode-aware properties
  imageMode = 'free-proportion',
  lockedSide = 'width',
  onSizeTransformChange
}) => {
  // Position classes for layout
  const positionClasses = {
    'LEFT': 'float-left mr-6 mb-4',
    'RIGHT': 'float-right ml-6 mb-4',
    'CENTER': 'mx-auto mb-6',
    'BACKGROUND': 'absolute inset-0 z-0'
  };

  // Determine mode based on template context
  const effectiveMode = useMemo(() => {
    // If explicitly provided, use it
    if (imageMode) return imageMode;
    
    // Default to free-proportion for most cases
    return 'free-proportion';
  }, [imageMode]);

  // Determine locked side based on template context
  const effectiveLockedSide = useMemo(() => {
    // If explicitly provided, use it
    if (lockedSide) return lockedSide;
    
    // Default based on position
    if (position === 'BACKGROUND') return 'width';
    return 'width';
  }, [lockedSide, position]);

  return (
    <div className={positionClasses[position]}>
      <ModeAwareImagePlaceholder
        imagePath={imagePath}
        onImageUploaded={onImageUploaded}
        description={description}
        prompt={prompt}
        isEditable={isEditable}
        className={className}
        style={style}
        mode={effectiveMode}
        lockedSide={effectiveLockedSide}
        widthPx={widthPx}
        heightPx={heightPx}
        objectFit={objectFit}
        imageScale={imageScale}
        imageOffset={imageOffset}
        onSizeTransformChange={onSizeTransformChange}
      />
    </div>
  );
};

export default ClickableImagePlaceholder; 