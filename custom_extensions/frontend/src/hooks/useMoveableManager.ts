import { useState, useCallback, useMemo } from 'react';
import { MoveableElement } from '@/components/positioning/MoveableManager';

// Debug logging utility
const DEBUG = typeof window !== 'undefined' && (window as any).__MOVEABLE_DEBUG__;
const log = (source: string, event: string, data: any) => {
  if (DEBUG) {
    console.log(`[${source}] ${event}`, { ts: Date.now(), ...data });
  }
};

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

  log('useMoveableManager', 'hookInit', { 
    slideId, 
    isEditable,
    hasOnUpdate: !!onUpdate
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
    log('useMoveableManager', 'createMoveableElement', { 
      elementId: id, 
      refExists: !!ref.current,
      elementType: type,
      options,
      slideId
    });

    return {
      id,
      ref,
      type,
      aspectRatio: options?.aspectRatio,
      cropMode: options?.cropMode || 'contain'
    };
  }, [slideId]);

  // Handle position changes
  const handlePositionChange = useCallback((elementId: string, position: { x: number; y: number }) => {
    log('useMoveableManager', 'handlePositionChange', { 
      elementId, 
      position,
      slideId,
      currentPositions: Object.keys(moveableState.positions).length
    });

    setMoveableState(prev => {
      const newState = {
        ...prev,
        positions: {
          ...prev.positions,
          [elementId]: position
        }
      };
      
      log('useMoveableManager', 'positionStateUpdated', { 
        elementId, 
        position,
        totalPositions: Object.keys(newState.positions).length,
        slideId
      });
      
      return newState;
    });

    // Notify parent component with debounced update
    if (onUpdate) {
      log('useMoveableManager', 'callingOnUpdate_position', { 
        elementId, 
        position,
        slideId
      });
      
      onUpdate({
        moveablePositions: {
          ...moveableState.positions,
          [elementId]: position
        }
      });
    }
  }, [moveableState.positions, onUpdate, slideId]);

  // Handle size changes
  const handleSizeChange = useCallback((elementId: string, size: { width: number; height: number }) => {
    log('useMoveableManager', 'handleSizeChange', { 
      elementId, 
      size,
      slideId,
      currentSizes: Object.keys(moveableState.sizes).length
    });

    setMoveableState(prev => {
      const newState = {
        ...prev,
        sizes: {
          ...prev.sizes,
          [elementId]: size
        }
      };
      
      log('useMoveableManager', 'sizeStateUpdated', { 
        elementId, 
        size,
        totalSizes: Object.keys(newState.sizes).length,
        slideId
      });
      
      return newState;
    });

    // Notify parent component with debounced update
    if (onUpdate) {
      log('useMoveableManager', 'callingOnUpdate_size', { 
        elementId, 
        size,
        slideId
      });
      
      onUpdate({
        moveableSizes: {
          ...moveableState.sizes,
          [elementId]: size
        }
      });
    }
  }, [moveableState.sizes, onUpdate, slideId]);

  // Handle transform end (both position and size)
  const handleTransformEnd = useCallback((elementId: string, transform: { 
    position: { x: number; y: number }; 
    size: { width: number; height: number } 
  }) => {
    log('useMoveableManager', 'handleTransformEnd', { 
      elementId, 
      transform,
      slideId
    });

    setMoveableState(prev => {
      const newState = {
        ...prev,
        positions: {
          ...prev.positions,
          [elementId]: transform.position
        },
        sizes: {
          ...prev.sizes,
          [elementId]: transform.size
        }
      };
      
      log('useMoveableManager', 'transformStateUpdated', { 
        elementId, 
        transform,
        totalPositions: Object.keys(newState.positions).length,
        totalSizes: Object.keys(newState.sizes).length,
        slideId
      });
      
      return newState;
    });

    // Notify parent component with final state
    if (onUpdate) {
      log('useMoveableManager', 'callingOnUpdate_transform', { 
        elementId, 
        transform,
        slideId
      });
      
      onUpdate({
        moveablePositions: {
          ...moveableState.positions,
          [elementId]: transform.position
        },
        moveableSizes: {
          ...moveableState.sizes,
          [elementId]: transform.size
        }
      });
    }
  }, [moveableState.positions, moveableState.sizes, onUpdate, slideId]);

  // Handle crop mode changes
  const handleCropModeChange = useCallback((elementId: string, cropMode: 'cover' | 'contain' | 'fill') => {
    log('useMoveableManager', 'handleCropModeChange', { 
      elementId, 
      cropMode,
      slideId
    });

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
  }, [moveableState.cropModes, onUpdate, slideId]);

  // Get current crop mode for an element
  const getCropMode = useCallback((elementId: string): 'cover' | 'contain' | 'fill' => {
    const mode = moveableState.cropModes[elementId] || 'contain';
    log('useMoveableManager', 'getCropMode', { elementId, mode, slideId });
    return mode;
  }, [moveableState.cropModes, slideId]);

  // Get current position for an element
  const getPosition = useCallback((elementId: string): { x: number; y: number } => {
    const position = moveableState.positions[elementId] || { x: 0, y: 0 };
    log('useMoveableManager', 'getPosition', { elementId, position, slideId });
    return position;
  }, [moveableState.positions, slideId]);

  // Get current size for an element
  const getSize = useCallback((elementId: string): { width: number; height: number } | undefined => {
    const size = moveableState.sizes[elementId];
    log('useMoveableManager', 'getSize', { elementId, size, slideId });
    return size;
  }, [moveableState.sizes, slideId]);

  const moveableManagerProps = useMemo(() => ({
    isEnabled: isEditable,
    slideId,
    savedPositions: moveableState.positions,
    savedSizes: moveableState.sizes,
    onPositionChange: handlePositionChange,
    onSizeChange: handleSizeChange,
    onTransformEnd: handleTransformEnd
  }), [
    isEditable, 
    slideId, 
    moveableState.positions, 
    moveableState.sizes, 
    handlePositionChange, 
    handleSizeChange, 
    handleTransformEnd
  ]);

  log('useMoveableManager', 'hookReturn', { 
    slideId, 
    isEditable,
    positionsCount: Object.keys(moveableState.positions).length,
    sizesCount: Object.keys(moveableState.sizes).length,
    cropModesCount: Object.keys(moveableState.cropModes).length
  });

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
    moveableManagerProps
  };
};
