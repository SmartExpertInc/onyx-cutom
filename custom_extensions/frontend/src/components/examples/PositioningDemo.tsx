// components/examples/PositioningDemo.tsx
// Demo component showing the positioning system in action

'use client';

import React, { useState } from 'react';
import { ComponentBasedSlide } from '@/types/slideTemplates';
import { PositionableItem, CanvasConfig } from '@/types/positioning';
import { ComponentBasedSlideRenderer } from '@/components/ComponentBasedSlideRenderer';

// Sample slide data for demonstration
const createSampleSlide = (): ComponentBasedSlide => ({
  slideId: 'demo-slide-1',
  slideNumber: 1,
  templateId: 'bullet-points',
  props: {
    title: 'Dynamic Positioning Demo',
    bullets: [
      'This slide demonstrates the new positioning system',
      'You can drag, resize, and rotate any element',
      'Switch between template, hybrid, and free modes',
      'Use the controls to align and distribute items'
    ],
    imagePath: '/placeholder-image.jpg',
    imageAlt: 'Demo image'
  },
  // Start in template mode - user can switch to positioning
  positioningMode: 'template',
  metadata: {
    createdAt: new Date().toISOString(),
    hasCustomPositioning: false
  }
});

// Sample items for free mode demonstration
const createSampleItems = (): PositionableItem[] => [
  {
    id: 'title-item',
    type: 'text',
    content: {
      text: 'Freely Positioned Title',
      style: 'heading'
    },
    position: { x: 100, y: 50, width: 600, height: 80, zIndex: 1 },
    defaultPosition: { x: 100, y: 50, width: 600, height: 80 },
    constraints: { minWidth: 200, minHeight: 40, snapToGrid: true },
    metadata: { isUserCreated: false, lastModified: new Date().toISOString() }
  },
  {
    id: 'bullet-list-item',
    type: 'bullet-list',
    content: {
      bullets: [
        'Drag me around!',
        'Resize my corners',
        'I can rotate too'
      ],
      bulletStyle: 'dot',
      listType: 'bullet'
    },
    position: { x: 100, y: 160, width: 500, height: 200, zIndex: 1 },
    defaultPosition: { x: 100, y: 160, width: 500, height: 200 },
    constraints: { minWidth: 200, minHeight: 100, snapToGrid: true },
    metadata: { isUserCreated: false, lastModified: new Date().toISOString() }
  },
  {
    id: 'image-item',
    type: 'image',
    content: {
      imagePath: '',
      prompt: 'Placeholder for your image',
      alt: 'Demo image placeholder'
    },
    position: { x: 650, y: 160, width: 400, height: 300, zIndex: 1 },
    defaultPosition: { x: 650, y: 160, width: 400, height: 300 },
    constraints: { minWidth: 100, minHeight: 100, maintainAspectRatio: true, snapToGrid: true },
    metadata: { isUserCreated: false, lastModified: new Date().toISOString() }
  },
  {
    id: 'shape-item',
    type: 'shape',
    content: {
      shapeType: 'circle',
      fillColor: '#3b82f6',
      strokeColor: '#1e40af',
      strokeWidth: 3
    },
    position: { x: 200, y: 400, width: 100, height: 100, rotation: 0, zIndex: 1 },
    defaultPosition: { x: 200, y: 400, width: 100, height: 100 },
    constraints: { minWidth: 50, minHeight: 50, snapToGrid: true },
    metadata: { isUserCreated: false, lastModified: new Date().toISOString() }
  },
  {
    id: 'big-number-item',
    type: 'container',
    content: {
      type: 'big-number',
      value: '42',
      label: 'Answer',
      description: 'To everything'
    },
    position: { x: 350, y: 380, width: 200, height: 150, zIndex: 1 },
    defaultPosition: { x: 350, y: 380, width: 200, height: 150 },
    constraints: { minWidth: 150, minHeight: 100, snapToGrid: true },
    metadata: { isUserCreated: false, lastModified: new Date().toISOString() }
  }
];

const sampleCanvasConfig: CanvasConfig = {
  width: 1200,
  height: 675,
  gridSize: 20,
  snapToGrid: true,
  showGrid: true,
  backgroundColor: '#ffffff',
  padding: { top: 40, right: 40, bottom: 40, left: 40 }
};

export const PositioningDemo: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<ComponentBasedSlide>(createSampleSlide());
  const [showInstructions, setShowInstructions] = useState(true);

  // Handle slide updates from the positioning system
  const handleSlideUpdate = (updatedSlide: ComponentBasedSlide) => {
    setCurrentSlide(updatedSlide);
    console.log('Demo slide updated:', updatedSlide);
  };

  // Switch to free mode with sample items
  const switchToFreeMode = () => {
    const freeSlide: ComponentBasedSlide = {
      ...currentSlide,
      positioningMode: 'free',
      items: createSampleItems(),
      canvasConfig: sampleCanvasConfig,
      metadata: {
        ...currentSlide.metadata,
        hasCustomPositioning: true,
        updatedAt: new Date().toISOString()
      }
    };
    setCurrentSlide(freeSlide);
  };

  // Reset to template mode
  const resetToTemplate = () => {
    const templateSlide: ComponentBasedSlide = {
      ...currentSlide,
      positioningMode: 'template',
      items: undefined,
      canvasConfig: undefined,
      metadata: {
        ...currentSlide.metadata,
        hasCustomPositioning: false,
        updatedAt: new Date().toISOString()
      }
    };
    setCurrentSlide(templateSlide);
  };

  return (
    <div className="positioning-demo">
      {/* Header */}
      <div className="demo-header mb-6">
        <h2 className="text-2xl font-bold mb-4">Dynamic Positioning System Demo</h2>
        
        {/* Instructions */}
        {showInstructions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">How to Use:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Template Mode:</strong> Traditional fixed layout</li>
                  <li>• <strong>Hybrid Mode:</strong> Click "Enable Positioning" to make items draggable</li>
                  <li>• <strong>Free Mode:</strong> Complete freedom to position items</li>
                  <li>• <strong>Drag:</strong> Click and drag any item to move it</li>
                  <li>• <strong>Resize:</strong> Drag the corner handles to resize</li>
                  <li>• <strong>Rotate:</strong> Use the rotation handle above selected items</li>
                  <li>• <strong>Multi-select:</strong> Ctrl+click to select multiple items</li>
                </ul>
              </div>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-blue-600 hover:text-blue-800 ml-4"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={resetToTemplate}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Reset to Template
          </button>
          <button
            onClick={switchToFreeMode}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Try Free Mode
          </button>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {showInstructions ? 'Hide' : 'Show'} Instructions
          </button>
        </div>

        {/* Current Mode Display */}
        <div className="flex items-center gap-2 text-sm">
          <span>Current Mode:</span>
          <span className={`
            px-2 py-1 rounded text-xs font-medium
            ${currentSlide.positioningMode === 'template' ? 'bg-gray-100 text-gray-800' : ''}
            ${currentSlide.positioningMode === 'hybrid' ? 'bg-orange-100 text-orange-800' : ''}
            ${currentSlide.positioningMode === 'free' ? 'bg-green-100 text-green-800' : ''}
          `}>
            {currentSlide.positioningMode || 'template'}
          </span>
          {currentSlide.items && (
            <span className="text-gray-500">
              • {currentSlide.items.length} positioned items
            </span>
          )}
        </div>
      </div>

      {/* Demo Slide */}
      <div className="demo-slide border border-gray-200 rounded-lg overflow-hidden">
        <ComponentBasedSlideRenderer
          slide={currentSlide}
          isEditable={true}
          onSlideUpdate={handleSlideUpdate}
          theme="default"
        />
      </div>

      {/* Debug Info */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
          Debug Information (Click to expand)
        </summary>
        <div className="mt-2 p-4 bg-gray-50 rounded border text-xs">
          <pre className="overflow-auto">
            {JSON.stringify(currentSlide, null, 2)}
          </pre>
        </div>
      </details>

      {/* Feature Showcase */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="feature-card p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold mb-2">🎯 Precise Positioning</h3>
          <p className="text-sm text-gray-600">
            Grid snapping, alignment tools, and pixel-perfect positioning controls.
          </p>
        </div>
        
        <div className="feature-card p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold mb-2">🔄 Template Integration</h3>
          <p className="text-sm text-gray-600">
            Seamlessly convert between template and positioning modes without losing content.
          </p>
        </div>
        
        <div className="feature-card p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold mb-2">⚡ Performance Optimized</h3>
          <p className="text-sm text-gray-600">
            Smooth interactions with debounced updates and transform-based positioning.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PositioningDemo;
