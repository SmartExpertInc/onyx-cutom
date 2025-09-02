// hooks/usePositioning.ts
// Custom hook for managing positioning state and operations

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  PositionableItem, 
  Position, 
  CanvasConfig, 
  PositioningMode,
  PositioningConstraints
} from '@/types/positioning';
import { PositioningEngine } from '@/lib/positioning/PositioningEngine';
import { ComponentBasedSlide } from '@/types/slideTemplates';
import { TemplateExtractor } from '@/lib/positioning/TemplateExtractor';

interface UsePositioningOptions {
  slide?: ComponentBasedSlide;
  initialItems?: PositionableItem[];
  initialCanvasConfig?: CanvasConfig;
  initialMode?: PositioningMode;
  onSlideUpdate?: (updatedSlide: ComponentBasedSlide) => void;
}

export const usePositioning = ({
  slide,
  initialItems = [],
  initialCanvasConfig,
  initialMode = 'template',
  onSlideUpdate
}: UsePositioningOptions) => {
  const engineRef = useRef<PositioningEngine | null>(null);
  
  // State
  const [items, setItems] = useState<PositionableItem[]>(initialItems);
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>(
    initialCanvasConfig || {
      width: 1200,
      height: 675,
      gridSize: 20,
      snapToGrid: false,
      showGrid: false,
      backgroundColor: '#ffffff',
      padding: { top: 40, right: 40, bottom: 40, left: 40 }
    }
  );
  const [mode, setMode] = useState<PositioningMode>(initialMode);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize positioning engine
  useEffect(() => {
    const constraints: PositioningConstraints = {
      canvas: {
        x: 0,
        y: 0,
        width: canvasConfig.width,
        height: canvasConfig.height
      },
      gridSize: canvasConfig.gridSize || 20,
      snapToGrid: canvasConfig.snapToGrid || false,
      snapToGuides: true,
      minItemSize: { width: 50, height: 30 },
      maxItemSize: { width: canvasConfig.width, height: canvasConfig.height }
    };

    engineRef.current = new PositioningEngine(items, constraints);
    
    // Set up event listeners
    const engine = engineRef.current;
    
    const handleSelectionChanged = ({ selectedIds }: { selectedIds: string[] }) => {
      setSelectedItemIds(selectedIds);
    };

    engine.on('selectionChanged', handleSelectionChanged);
    
    setIsInitialized(true);

    return () => {
      if (engine) {
        engine.off('selectionChanged', handleSelectionChanged);
      }
    };
  }, [canvasConfig, items]);

  // Extract items from slide when switching to positioning mode
  const extractItemsFromSlide = useCallback(() => {
    if (!slide || items.length > 0) return;
    
    const extracted = TemplateExtractor.extractItemsFromSlide(slide);
    setItems(extracted.items);
    setCanvasConfig(extracted.canvasConfig);
  }, [slide, items.length]);

  // Update items
  const updateItems = useCallback((newItems: PositionableItem[]) => {
    setItems(newItems);
    
    if (slide && onSlideUpdate) {
      const updatedSlide: ComponentBasedSlide = {
        ...slide,
        items: newItems,
        positioningMode: mode,
        canvasConfig,
        metadata: {
          ...slide.metadata,
          hasCustomPositioning: mode !== 'template',
          updatedAt: new Date().toISOString()
        }
      };
      onSlideUpdate(updatedSlide);
    }
  }, [slide, mode, canvasConfig, onSlideUpdate]);

  // Update single item
  const updateItem = useCallback((itemId: string, updates: Partial<PositionableItem>) => {
    const updatedItems = items.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    );
    updateItems(updatedItems);
  }, [items, updateItems]);

  // Update item position
  const updateItemPosition = useCallback((itemId: string, newPosition: Position) => {
    updateItem(itemId, { position: newPosition });
  }, [updateItem]);

  // Update item content
  const updateItemContent = useCallback((itemId: string, newContent: any) => {
    updateItem(itemId, { content: newContent });
  }, [updateItem]);

  // Add new item
  const addItem = useCallback((item: PositionableItem) => {
    const newItems = [...items, item];
    updateItems(newItems);
  }, [items, updateItems]);

  // Remove item
  const removeItem = useCallback((itemId: string) => {
    const newItems = items.filter(item => item.id !== itemId);
    updateItems(newItems);
  }, [items, updateItems]);

  // Remove selected items
  const removeSelectedItems = useCallback(() => {
    const newItems = items.filter(item => !selectedItemIds.includes(item.id));
    updateItems(newItems);
    setSelectedItemIds([]);
  }, [items, selectedItemIds, updateItems]);

  // Duplicate selected items
  const duplicateSelectedItems = useCallback(() => {
    const selectedItems = items.filter(item => selectedItemIds.includes(item.id));
    const duplicatedItems = selectedItems.map(item => ({
      ...item,
      id: `${item.id}_copy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      position: {
        ...item.position,
        x: item.position.x + 20,
        y: item.position.y + 20
      }
    }));
    
    const newItems = [...items, ...duplicatedItems];
    updateItems(newItems);
    setSelectedItemIds(duplicatedItems.map(item => item.id));
  }, [items, selectedItemIds, updateItems]);

  // Select item
  const selectItem = useCallback((itemId: string, multiSelect: boolean = false) => {
    if (engineRef.current) {
      engineRef.current.selectItem(itemId, multiSelect);
    }
  }, []);

  // Deselect items
  const deselectItems = useCallback((itemId?: string) => {
    if (engineRef.current) {
      engineRef.current.deselectItem(itemId);
    }
  }, []);

  // Change mode
  const changeMode = useCallback((newMode: PositioningMode) => {
    setMode(newMode);
    
    // Extract items when switching to positioning mode
    if (newMode !== 'template' && items.length === 0) {
      extractItemsFromSlide();
    }
    
    if (slide && onSlideUpdate) {
      const updatedSlide: ComponentBasedSlide = {
        ...slide,
        positioningMode: newMode,
        canvasConfig,
        items: newMode === 'template' ? undefined : items,
        metadata: {
          ...slide.metadata,
          hasCustomPositioning: newMode !== 'template',
          updatedAt: new Date().toISOString()
        }
      };
      onSlideUpdate(updatedSlide);
    }
  }, [slide, items, canvasConfig, onSlideUpdate, extractItemsFromSlide]);

  // Update canvas config
  const updateCanvasConfig = useCallback((newConfig: Partial<CanvasConfig>) => {
    const updatedConfig = { ...canvasConfig, ...newConfig };
    setCanvasConfig(updatedConfig);
    
    if (slide && onSlideUpdate) {
      const updatedSlide: ComponentBasedSlide = {
        ...slide,
        canvasConfig: updatedConfig,
        metadata: {
          ...slide.metadata,
          updatedAt: new Date().toISOString()
        }
      };
      onSlideUpdate(updatedSlide);
    }
  }, [slide, canvasConfig, onSlideUpdate]);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.resetToDefaults();
    }
  }, []);

  // Undo/Redo
  const undo = useCallback(() => {
    if (engineRef.current) {
      return engineRef.current.undo();
    }
    return false;
  }, []);

  const redo = useCallback(() => {
    if (engineRef.current) {
      return engineRef.current.redo();
    }
    return false;
  }, []);

  // Alignment helpers
  const alignItems = useCallback((alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedItemIds.length < 2) return;

    const selectedItems = items.filter(item => selectedItemIds.includes(item.id));
    const bounds = {
      left: Math.min(...selectedItems.map(item => item.position.x)),
      right: Math.max(...selectedItems.map(item => item.position.x + item.position.width)),
      top: Math.min(...selectedItems.map(item => item.position.y)),
      bottom: Math.max(...selectedItems.map(item => item.position.y + item.position.height))
    };

    const updatedItems = items.map(item => {
      if (!selectedItemIds.includes(item.id)) return item;

      let newPosition = { ...item.position };

      switch (alignment) {
        case 'left':
          newPosition.x = bounds.left;
          break;
        case 'center':
          newPosition.x = bounds.left + (bounds.right - bounds.left) / 2 - item.position.width / 2;
          break;
        case 'right':
          newPosition.x = bounds.right - item.position.width;
          break;
        case 'top':
          newPosition.y = bounds.top;
          break;
        case 'middle':
          newPosition.y = bounds.top + (bounds.bottom - bounds.top) / 2 - item.position.height / 2;
          break;
        case 'bottom':
          newPosition.y = bounds.bottom - item.position.height;
          break;
      }

      return { ...item, position: newPosition };
    });

    updateItems(updatedItems);
  }, [items, selectedItemIds, updateItems]);

  // Distribution helpers
  const distributeItems = useCallback((direction: 'horizontal' | 'vertical') => {
    if (selectedItemIds.length < 3) return;

    const selectedItems = items.filter(item => selectedItemIds.includes(item.id));
    selectedItems.sort((a, b) => {
      return direction === 'horizontal' 
        ? a.position.x - b.position.x
        : a.position.y - b.position.y;
    });

    const first = selectedItems[0];
    const last = selectedItems[selectedItems.length - 1];
    const totalSpace = direction === 'horizontal'
      ? (last.position.x + last.position.width) - first.position.x
      : (last.position.y + last.position.height) - first.position.y;

    const itemSpace = selectedItems.reduce((sum, item) => {
      return sum + (direction === 'horizontal' ? item.position.width : item.position.height);
    }, 0);

    const gap = (totalSpace - itemSpace) / (selectedItems.length - 1);

    let currentPos = direction === 'horizontal' ? first.position.x : first.position.y;

    const updatedItems = items.map(item => {
      const selectedIndex = selectedItems.findIndex(selected => selected.id === item.id);
      if (selectedIndex === -1) return item;

      const newPosition = { ...item.position };
      if (direction === 'horizontal') {
        newPosition.x = currentPos;
        currentPos += item.position.width + gap;
      } else {
        newPosition.y = currentPos;
        currentPos += item.position.height + gap;
      }

      return { ...item, position: newPosition };
    });

    updateItems(updatedItems);
  }, [items, selectedItemIds, updateItems]);

  // Get selected items
  const selectedItems = items.filter(item => selectedItemIds.includes(item.id));

  // Check capabilities
  const canUndo = engineRef.current?.canUndo() || false;
  const canRedo = engineRef.current?.canRedo() || false;

  return {
    // State
    items,
    canvasConfig,
    mode,
    selectedItemIds,
    selectedItems,
    isInitialized,
    
    // Actions
    updateItems,
    updateItem,
    updateItemPosition,
    updateItemContent,
    addItem,
    removeItem,
    removeSelectedItems,
    duplicateSelectedItems,
    selectItem,
    deselectItems,
    changeMode,
    updateCanvasConfig,
    resetToDefaults,
    undo,
    redo,
    alignItems,
    distributeItems,
    
    // Capabilities
    canUndo,
    canRedo,
    
    // Engine reference (for advanced usage)
    engine: engineRef.current
  };
};
