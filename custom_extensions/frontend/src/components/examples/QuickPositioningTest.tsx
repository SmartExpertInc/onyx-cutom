// components/examples/QuickPositioningTest.tsx
// Quick test component to verify positioning functionality

'use client';

import React, { useState } from 'react';
import { ComponentBasedSlide } from '@/types/slideTemplates';
import { ComponentBasedSlideRenderer } from '@/components/ComponentBasedSlideRenderer';

// Simple test slide
const createTestSlide = (): ComponentBasedSlide => ({
  slideId: 'test-positioning-slide',
  slideNumber: 1,
  templateId: 'bullet-points',
  props: {
    title: 'Positioning Test Slide',
    bullets: [
      'This is a test slide',
      'Look for the "Enable Positioning" button in the top-right corner',
      'Click it to activate drag & drop functionality'
    ]
  },
  // Positioning will be auto-enabled for editable slides
  // positioningMode: 'template', // Removed - will default to hybrid for editable slides
  metadata: {
    createdAt: new Date().toISOString(),
    hasCustomPositioning: false
  }
});

export const QuickPositioningTest: React.FC = () => {
  const [testSlide, setTestSlide] = useState<ComponentBasedSlide>(createTestSlide());

  const handleSlideUpdate = (updatedSlide: ComponentBasedSlide) => {
    console.log('🎯 Slide updated with positioning mode:', updatedSlide.positioningMode);
    console.log('📊 Slide data:', updatedSlide);
    setTestSlide(updatedSlide);
  };

  return (
    <div className="positioning-test-container p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Positioning System Test</h2>
        <div className="text-sm text-gray-600 mb-4">
          <p><strong>Current Mode:</strong> {testSlide.positioningMode || 'template'}</p>
          <p><strong>Has Items:</strong> {testSlide.items ? testSlide.items.length : 0}</p>
          <p><strong>Expected Behavior:</strong></p>
          <ul className="list-disc list-inside ml-4 mt-2">
            <li>✅ Positioning should be automatically enabled (hybrid mode)</li>
            <li>✅ Items should be draggable with blue selection handles</li>
            <li>✅ Control panel should appear at the bottom</li>
            <li>✅ No "Enable Positioning" button needed</li>
            <li>🔍 Check browser console for debug logs</li>
          </ul>
        </div>
      </div>

      {/* Test Slide */}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
        <ComponentBasedSlideRenderer
          slide={testSlide}
          isEditable={true}
          onSlideUpdate={handleSlideUpdate}
          theme="default"
        />
      </div>

      {/* Debug Info */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-600">
          Debug Information
        </summary>
        <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify(testSlide, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default QuickPositioningTest;
