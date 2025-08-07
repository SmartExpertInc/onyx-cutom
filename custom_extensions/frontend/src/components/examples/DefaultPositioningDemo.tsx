// components/examples/DefaultPositioningDemo.tsx
// Demo showing that positioning is now enabled by default

'use client';

import React, { useState } from 'react';
import { ComponentBasedSlide } from '@/types/slideTemplates';
import { ComponentBasedSlideRenderer } from '@/components/ComponentBasedSlideRenderer';

// Create multiple test slides to show default behavior
const createTestSlides = (): ComponentBasedSlide[] => [
  {
    slideId: 'auto-positioning-1',
    slideNumber: 1,
    templateId: 'bullet-points',
    props: {
      title: 'Slide 1: Bullet Points (Auto-Positioning)',
      bullets: [
        'Items are automatically draggable',
        'No manual activation needed',
        'Positioning enabled by default'
      ]
    },
    metadata: { createdAt: new Date().toISOString() }
  },
  {
    slideId: 'auto-positioning-2',
    slideNumber: 2,
    templateId: 'two-column',
    props: {
      title: 'Slide 2: Two Column Layout',
      leftTitle: 'Left Column',
      leftContent: 'This content is draggable',
      rightTitle: 'Right Column',
      rightContent: 'This content is also draggable'
    },
    metadata: { createdAt: new Date().toISOString() }
  },
  {
    slideId: 'auto-positioning-3',
    slideNumber: 3,
    templateId: 'big-numbers',
    props: {
      title: 'Slide 3: Big Numbers',
      items: [
        { value: '100%', label: 'Success', description: 'Auto-enabled positioning' },
        { value: '0', label: 'Manual Steps', description: 'Required to activate' }
      ]
    },
    metadata: { createdAt: new Date().toISOString() }
  }
];

export const DefaultPositioningDemo: React.FC = () => {
  const [testSlides, setTestSlides] = useState<ComponentBasedSlide[]>(createTestSlides());
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handleSlideUpdate = (updatedSlide: ComponentBasedSlide) => {
    console.log('🎯 Slide updated:', updatedSlide.slideId, 'Mode:', updatedSlide.positioningMode);
    setTestSlides(prev => 
      prev.map(slide => 
        slide.slideId === updatedSlide.slideId ? updatedSlide : slide
      )
    );
  };

  const currentSlide = testSlides[currentSlideIndex];

  return (
    <div className="default-positioning-demo p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">✨ Default Positioning Demo</h2>
        
        {/* Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-semibold text-green-800">Positioning Enabled by Default</span>
          </div>
          <p className="text-sm text-green-700">
            All editable slides now automatically have drag & drop functionality enabled. 
            No manual activation required!
          </p>
        </div>

        {/* Slide Navigation */}
        <div className="flex gap-2 mb-4">
          {testSlides.map((slide, index) => (
            <button
              key={slide.slideId}
              onClick={() => setCurrentSlideIndex(index)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${index === currentSlideIndex 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              Slide {slide.slideNumber}
            </button>
          ))}
        </div>

        {/* Current Slide Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="text-sm">
            <p><strong>Current Slide:</strong> {currentSlide.slideId}</p>
            <p><strong>Template:</strong> {currentSlide.templateId}</p>
            <p><strong>Positioning Mode:</strong> {currentSlide.positioningMode || 'auto (hybrid)'}</p>
            <p><strong>Items Count:</strong> {currentSlide.items?.length || 'auto-extracted'}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <h3 className="font-semibold text-yellow-800 mb-2">🎮 Try These Actions:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• <strong>Drag items</strong> around the slide</li>
            <li>• <strong>Resize items</strong> using corner handles</li>
            <li>• <strong>Select multiple items</strong> with Ctrl+click</li>
            <li>• <strong>Use alignment tools</strong> in the bottom control panel</li>
            <li>• <strong>Toggle grid</strong> for precise positioning</li>
          </ul>
        </div>
      </div>

      {/* Demo Slide */}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg">
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
          🔍 Debug Information
        </summary>
        <div className="mt-2 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Current Slide Data:</h4>
          <pre className="text-xs overflow-auto bg-white p-3 rounded border">
            {JSON.stringify(currentSlide, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
};

export default DefaultPositioningDemo;
