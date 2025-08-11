import { useCallback, useMemo } from 'react';
import { ImageMode, ImageModeConfig } from '@/types/slideTemplates';

interface UseModeAwareResizeProps {
  mode: ImageMode;
  lockedSide?: 'width' | 'height';
  modeConfig?: ImageModeConfig;
  currentWidth: number;
  currentHeight: number;
  onSizeChange: (width: number, height: number) => void;
}

interface ResizeConstraints {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

/**
 * Custom hook for mode-aware image resizing logic
 * Provides utilities for both full-side and free-proportion modes
 */
export const useModeAwareResize = ({
  mode,
  lockedSide = 'width',
  modeConfig,
  currentWidth,
  currentHeight,
  onSizeChange
}: UseModeAwareResizeProps) => {
  
  // Default configurations for each mode
  const defaultConfigs: Record<ImageMode, ImageModeConfig> = {
    'full-side': {
      mode: 'full-side',
      lockedSide: lockedSide,
      defaultSize: {
        width: lockedSide === 'height' ? 400 : undefined,
        height: lockedSide === 'width' ? 270 : undefined
      },
      constraints: {
        minWidth: 200,
        maxWidth: 800,
        minHeight: 150,
        maxHeight: 600
      }
    },
    'free-proportion': {
      mode: 'free-proportion',
      defaultSize: {
        width: 384,
        height: 256
      },
      constraints: {
        minWidth: 120,
        maxWidth: 800,
        minHeight: 120,
        maxHeight: 600
      }
    }
  };

  const config = modeConfig || defaultConfigs[mode];
  const constraints = config.constraints || defaultConfigs[mode].constraints!;

  // Calculate aspect ratio for free-proportion mode
  const aspectRatio = useMemo(() => {
    return currentWidth / currentHeight;
  }, [currentWidth, currentHeight]);

  // Handle slider resize for full-side mode
  const handleSliderResize = useCallback((value: number) => {
    if (mode !== 'full-side') return;

    const { minWidth, maxWidth, minHeight, maxHeight } = constraints;
    
    let newWidth = currentWidth;
    let newHeight = currentHeight;

    if (lockedSide === 'width') {
      // Width is locked, adjust height
      newHeight = minHeight + (maxHeight - minHeight) * value;
    } else {
      // Height is locked, adjust width
      newWidth = minWidth + (maxWidth - minWidth) * value;
    }

    onSizeChange(Math.round(newWidth), Math.round(newHeight));
  }, [mode, lockedSide, currentWidth, currentHeight, constraints, onSizeChange]);

  // Handle corner resize for free-proportion mode
  const handleCornerResize = useCallback((deltaX: number, deltaY: number) => {
    if (mode !== 'free-proportion') return;

    const { minWidth, maxWidth, minHeight, maxHeight } = constraints;
    
    // Proportional resize based on width change
    const newWidth = Math.max(minWidth, Math.min(maxWidth, currentWidth + deltaX));
    const newHeight = newWidth / aspectRatio;

    // Check if height is within constraints
    if (newHeight >= minHeight && newHeight <= maxHeight) {
      onSizeChange(Math.round(newWidth), Math.round(newHeight));
    }
  }, [mode, currentWidth, aspectRatio, constraints, onSizeChange]);

  // Calculate slider value for full-side mode
  const getSliderValue = useCallback(() => {
    if (mode !== 'full-side') return 0;

    const { minWidth, maxWidth, minHeight, maxHeight } = constraints;
    
    if (lockedSide === 'width') {
      return (currentHeight - minHeight) / (maxHeight - minHeight);
    } else {
      return (currentWidth - minWidth) / (maxWidth - minWidth);
    }
  }, [mode, lockedSide, currentWidth, currentHeight, constraints]);

  // Handle image upload with mode-specific sizing
  const handleImageUploadResize = useCallback((
    imageWidth: number, 
    imageHeight: number, 
    containerWidth?: number, 
    containerHeight?: number
  ) => {
    if (!imageWidth || !imageHeight) return;

    let newWidth: number;
    let newHeight: number;

    if (mode === 'full-side') {
      // Full-side mode: lock one dimension, calculate the other
      if (lockedSide === 'width') {
        // Width is locked, calculate height based on image aspect ratio
        const targetWidth = containerWidth || 400;
        newWidth = targetWidth;
        newHeight = (imageHeight / imageWidth) * targetWidth;
      } else {
        // Height is locked, calculate width based on image aspect ratio
        const targetHeight = containerHeight || 270;
        newHeight = targetHeight;
        newWidth = (imageWidth / imageHeight) * targetHeight;
      }
    } else {
      // Free-proportion mode: maintain image aspect ratio
      const aspectRatio = imageWidth / imageHeight;
      const maxSize = 400;
      
      if (aspectRatio > 1) {
        // Landscape image
        newWidth = Math.min(maxSize, imageWidth);
        newHeight = newWidth / aspectRatio;
      } else {
        // Portrait image
        newHeight = Math.min(maxSize, imageHeight);
        newWidth = newHeight * aspectRatio;
      }
    }

    // Apply constraints
    const { minWidth, maxWidth, minHeight, maxHeight } = constraints;
    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

    onSizeChange(Math.round(newWidth), Math.round(newHeight));
  }, [mode, lockedSide, constraints, onSizeChange]);

  // Get resize constraints
  const getConstraints = useCallback((): ResizeConstraints => {
    return constraints;
  }, [constraints]);

  // Check if resize is allowed in current mode
  const canResize = useMemo(() => {
    return mode === 'free-proportion' || mode === 'full-side';
  }, [mode]);

  // Get resize direction for current mode
  const getResizeDirection = useMemo(() => {
    if (mode === 'free-proportion') {
      return 'corner'; // Corner handles for proportional resize
    } else if (mode === 'full-side') {
      return lockedSide === 'width' ? 'vertical' : 'horizontal'; // Slider direction
    }
    return 'none';
  }, [mode, lockedSide]);

  return {
    // Resize handlers
    handleSliderResize,
    handleCornerResize,
    handleImageUploadResize,
    
    // State getters
    getSliderValue,
    getConstraints,
    
    // Mode information
    canResize,
    getResizeDirection,
    
    // Configuration
    config,
    constraints
  };
};
