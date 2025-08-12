import { useState, useCallback, useMemo } from 'react';
import { MoveableElement } from '@/components/positioning/MoveableManager';

export interface MoveableState {
  positions: Record<string, { x: number; y: number }>;
  sizes: Record<string, { width: number; height: number }>;
  cropModes: Record<string, 'cover' | 'contain' | 'fill'>;
}

export interface UseMoveableManagerProps {
  slideId: string;
  isEditable: boolean;
  onUpdate?: (props: any) => void;
}

export const useMoveableManager = ({ slideId, isEditable, onUpdate }: UseMoveableManagerProps) => {
  const [moveableState, setMoveableState] = useState<MoveableState>({
    positions: {},
    sizes: {},
    cropModes: {}
  });

  // Create moveable elements from refs
  const createMoveableElement = useCallback((
    id: string,
    ref: React.RefObject<HTMLElement | null>,
    type: 'image' | 'text' | 'placeholder',
    options?: {
      aspectRatio?: number;
      cropMode?: 'cover' | 'contain' | 'fill';
    }
  ): MoveableElement => {
    return {
      id,
      ref,
      type,
      aspectRatio: options?.aspectRatio,
      cropMode: options?.cropMode || 'contain'
    };
  }, []);

  // Handle position changes
  const handlePositionChange = useCallback((elementId: string, position: { x: number; y: number }) => {
    setMoveableState(prev => ({
      ...prev,
      positions: {
        ...prev.positions,
        [elementId]: position
      }
    }));

    // Notify parent component
    onUpdate?.({
      moveablePositions: {
        ...moveableState.positions,
        [elementId]: position
      }
    });
  }, [moveableState.positions, onUpdate]);

  // Handle size changes
  const handleSizeChange = useCallback((elementId: string, size: { width: number; height: number }) => {
    setMoveableState(prev => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [elementId]: size
      }
    }));

    // Notify parent component
    onUpdate?.({
      moveableSizes: {
        ...moveableState.sizes,
        [elementId]: size
      }
    });
  }, [moveableState.sizes, onUpdate]);

  // Handle transform end (both position and size)
  const handleTransformEnd = useCallback((elementId: string, transform: { 
    position: { x: number; y: number }; 
    size: { width: number; height: number } 
  }) => {
    setMoveableState(prev => ({
      ...prev,
      positions: {
        ...prev.positions,
        [elementId]: transform.position
      },
      sizes: {
        ...prev.sizes,
        [elementId]: transform.size
      }
    }));

    // Notify parent component with final state
    onUpdate?.({
      moveablePositions: {
        ...moveableState.positions,
        [elementId]: transform.position
      },
      moveableSizes: {
        ...moveableState.sizes,
        [elementId]: transform.size
      }
    });
  }, [moveableState.positions, moveableState.sizes, onUpdate]);

  // Handle crop mode changes
  const handleCropModeChange = useCallback((elementId: string, cropMode: 'cover' | 'contain' | 'fill') => {
    setMoveableState(prev => ({
      ...prev,
      cropModes: {
        ...prev.cropModes,
        [elementId]: cropMode
      }
    }));

    // Notify parent component
    onUpdate?.({
      moveableCropModes: {
        ...moveableState.cropModes,
        [elementId]: cropMode
      }
    });
  }, [moveableState.cropModes, onUpdate]);

  // Get current crop mode for an element
  const getCropMode = useCallback((elementId: string): 'cover' | 'contain' | 'fill' => {
    return moveableState.cropModes[elementId] || 'contain';
  }, [moveableState.cropModes]);

  // Get current position for an element
  const getPosition = useCallback((elementId: string): { x: number; y: number } => {
    return moveableState.positions[elementId] || { x: 0, y: 0 };
  }, [moveableState.positions]);

  // Get current size for an element
  const getSize = useCallback((elementId: string): { width: number; height: number } | undefined => {
    return moveableState.sizes[elementId];
  }, [moveableState.sizes]);

  return {
    // State
    moveableState,
    
    // Actions
    createMoveableElement,
    handlePositionChange,
    handleSizeChange,
    handleTransformEnd,
    handleCropModeChange,
    
    // Getters
    getCropMode,
    getPosition,
    getSize,
    
    // Props for MoveableManager component
    moveableManagerProps: {
      isEnabled: isEditable,
      slideId,
      savedPositions: moveableState.positions,
      savedSizes: moveableState.sizes,
      onPositionChange: handlePositionChange,
      onSizeChange: handleSizeChange,
      onTransformEnd: handleTransformEnd
    }
  };
};
