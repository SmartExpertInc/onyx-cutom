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
import PositioningCanvas from '@/components/positioning/PositioningCanvas';
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
        
        {/* Mode toggle for editable slides - only show if explicitly set to template mode */}
        {isEditable && slide?.positioningMode === 'template' && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg">
              <div className="text-xs text-gray-600 mb-2">🎯 Positioning Available</div>
              <button
                onClick={() => handleModeChange('hybrid')}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors font-medium"
                title="Switch to Positioning Mode"
              >
                🚀 Enable Positioning
              </button>
              <div className="text-xs text-gray-500 mt-1">Drag & drop items freely</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Positioning modes: render with positioning canvas
  return (
    <div className="relative">
      {/* Background template (in hybrid mode) */}
      {currentMode === 'hybrid' && (
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            width: currentCanvasConfig.width,
            height: currentCanvasConfig.height
          }}
        >
          {children}
        </div>
      )}

      {/* Positioning Canvas */}
      <PositioningCanvas
        items={currentItems}
        canvasConfig={currentCanvasConfig}
        mode={currentMode}
        theme={theme}
        isEditable={isEditable}
        onItemsChange={handleItemsChange}
        onModeChange={handleModeChange}
        onCanvasConfigChange={handleCanvasConfigChange}
      />

      {/* Mode indicator */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-md text-sm">
          <div 
            className={`w-2 h-2 rounded-full ${
              currentMode === 'hybrid' ? 'bg-orange-500' : 'bg-green-500'
            }`}
          />
          <span className="font-medium">
            {currentMode === 'hybrid' ? 'Hybrid Mode' : 'Free Mode'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HybridTemplateBase;
