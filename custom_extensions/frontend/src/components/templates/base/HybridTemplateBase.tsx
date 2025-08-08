// components/templates/base/HybridTemplateBase.tsx
// Base component for templates with positioning support

'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  BaseTemplateProps,
  ComponentBasedSlide 
} from '@/types/slideTemplates';

import { 
  PositionableItem, 
  CanvasConfig, 
  PositioningMode 
} from '@/types/positioning';

import { TemplateExtractor } from '@/lib/positioning/TemplateExtractor';
import DragEnhancer from '@/components/positioning/DragEnhancer';
import { SlideTheme } from '@/types/slideThemes';

interface HybridTemplateProps extends BaseTemplateProps {
  slide?: ComponentBasedSlide;
  items?: PositionableItem[];
  canvasConfig?: CanvasConfig;
  positioningMode?: PositioningMode;
  theme?: SlideTheme;
  onSlideUpdate?: (updatedSlide: ComponentBasedSlide) => void;
  children?: React.ReactNode;
}

export const HybridTemplateBase: React.FC<HybridTemplateProps> = ({
  slideId,
  slide,
  items = [],
  canvasConfig,
  positioningMode = 'template',
  theme,
  isEditable = false,
  onUpdate,
  onSlideUpdate,
  children
}) => {
  const [currentItems, setCurrentItems] = useState<PositionableItem[]>(items);
  const [currentCanvasConfig, setCurrentCanvasConfig] = useState<CanvasConfig>(
    canvasConfig || {
      width: 1200,
      height: 675,
      gridSize: 20,
      snapToGrid: false,
      showGrid: false,
      backgroundColor: '#ffffff',
      padding: { top: 40, right: 40, bottom: 40, left: 40 }
    }
  );
  const [currentMode, setCurrentMode] = useState<PositioningMode>(
    positioningMode === 'template' && isEditable ? 'hybrid' : positioningMode
  );
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize items from slide if not provided
  useEffect(() => {
    if (slide && (!items || items.length === 0) && currentMode !== 'template') {
      const extracted = TemplateExtractor.extractItemsFromSlide(slide);
      setCurrentItems(extracted.items);
      setCurrentCanvasConfig(extracted.canvasConfig);
    }
  }, [slide, items, currentMode]);

  // Auto-extract items for editable slides on mount
  useEffect(() => {
    if (isEditable && slide && (!currentItems || currentItems.length === 0) && currentMode === 'hybrid') {
      const extracted = TemplateExtractor.extractItemsFromSlide(slide);
      setCurrentItems(extracted.items);
      setCurrentCanvasConfig(extracted.canvasConfig);
    }
  }, [isEditable, slide, currentItems, currentMode]);

  // Handle initialization state to prevent flicker
  useEffect(() => {
    if (isEditable) {
      // Set initializing state
      setIsInitializing(true);
      
      // Remove initializing state after a short delay to allow positions to be applied
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 50); // Short delay to ensure positions are applied

      return () => clearTimeout(timer);
    }
  }, [isEditable, slide?.slideId, slide?.metadata?.elementPositions]);

  // Handle items change
  const handleItemsChange = useCallback((newItems: PositionableItem[]) => {
    setCurrentItems(newItems);

    if (slide && onSlideUpdate) {
      const updatedSlide: ComponentBasedSlide = {
        ...slide,
        items: newItems,
        positioningMode: currentMode,
        canvasConfig: currentCanvasConfig,
        metadata: {
          ...slide.metadata,
          hasCustomPositioning: true,
          updatedAt: new Date().toISOString()
        }
      };
      onSlideUpdate(updatedSlide);
    }
  }, [slide, currentMode, currentCanvasConfig, onSlideUpdate]);

  // Handle mode change
  const handleModeChange = useCallback((newMode: PositioningMode) => {
    setCurrentMode(newMode);

    // When switching to positioning mode, extract items from template
    if (newMode !== 'template' && slide && currentItems.length === 0) {
      const extracted = TemplateExtractor.extractItemsFromSlide(slide);
      setCurrentItems(extracted.items);
      setCurrentCanvasConfig(extracted.canvasConfig);
    }

    if (slide && onSlideUpdate) {
      const updatedSlide: ComponentBasedSlide = {
        ...slide,
        positioningMode: newMode,
        canvasConfig: currentCanvasConfig,
        items: newMode === 'template' ? undefined : currentItems,
        metadata: {
          ...slide.metadata,
          hasCustomPositioning: newMode !== 'template',
          updatedAt: new Date().toISOString()
        }
      };
      onSlideUpdate(updatedSlide);
    }
  }, [slide, currentItems, currentCanvasConfig, onSlideUpdate]);

  // Handle canvas config change
  const handleCanvasConfigChange = useCallback((newConfig: CanvasConfig) => {
    setCurrentCanvasConfig(newConfig);

    if (slide && onSlideUpdate) {
      const updatedSlide: ComponentBasedSlide = {
        ...slide,
        canvasConfig: newConfig,
        metadata: {
          ...slide.metadata,
          updatedAt: new Date().toISOString()
        }
      };
      onSlideUpdate(updatedSlide);
    }
  }, [slide, onSlideUpdate]);

  // Template mode: render traditional template (only for non-editable slides)
  if (currentMode === 'template') {
    return (
      <div className="relative">
        {children}
      </div>
    );
  }

  // Handle position changes from drag enhancer
  const handlePositionChange = useCallback((elementId: string, position: { x: number; y: number }) => {
    // Save position changes to slide data if needed
    if (slide && onSlideUpdate) {
      const updatedSlide: ComponentBasedSlide = {
        ...slide,
        metadata: {
          ...slide.metadata,
          elementPositions: {
            ...slide.metadata?.elementPositions,
            [elementId]: position
          },
          updatedAt: new Date().toISOString()
        }
      };
      onSlideUpdate(updatedSlide);
    }
  }, [slide, onSlideUpdate]);

  // For editable slides: render template with drag-and-drop enabled
  // FIXED: Use more flexible positioning that doesn't interfere with slide flow
  return (
    <div 
      className={`relative positioning-enabled-slide ${isInitializing ? 'initializing' : ''}`}
      style={{
        // Use max-width and max-height instead of fixed dimensions to allow natural flow
        maxWidth: currentCanvasConfig.width,
        maxHeight: currentCanvasConfig.height,
        width: '100%',
        height: 'auto',
        minHeight: '600px', // Ensure minimum height for consistency
        position: 'relative',
        // Ensure the wrapper doesn't interfere with slide spacing
        margin: 0,
        padding: 0,
        display: 'block'
      }}
    >
      {/* Render the original template with full styling and interactivity */}
      {children}
      
      {/* Add drag-and-drop functionality */}
      <DragEnhancer
        isEnabled={isEditable}
        slideId={slideId}
        savedPositions={slide?.metadata?.elementPositions}
        onPositionChange={handlePositionChange}
      />
    </div>
  );
};

export default HybridTemplateBase;
