"use client";

import React, { useState } from 'react';
import { ImageBlock } from '@/types/textPresentation';

const WordStyleImageEditorDemo: React.FC = () => {
  const [imageBlock, setImageBlock] = useState<ImageBlock>({
    type: 'image',
    src: '/static_design_images/sample-image.jpg',
    alt: 'Sample Image',
    caption: 'This is a sample image for testing',
    width: 300,
    height: 200,
    alignment: 'center',
    borderRadius: '8px',
    maxWidth: '100%',
    layoutMode: 'standalone'
  });

  const handleImageChange = (updates: Partial<ImageBlock>) => {
    setImageBlock(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Word-Style Image Editor Demo</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Left click</strong> on the image to open the toolbar</li>
            <li><strong>Right click</strong> on the image to open the context menu</li>
            <li>Try changing the size, alignment, and layout options</li>
            <li>Click outside to close any open menus</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current Image Settings</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Width:</label>
              <span className="text-lg font-mono">{imageBlock.width}px</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Alignment:</label>
              <span className="text-lg font-mono">{imageBlock.alignment}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Layout Mode:</label>
              <span className="text-lg font-mono">{imageBlock.layoutMode}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Border Radius:</label>
              <span className="text-lg font-mono">{imageBlock.borderRadius}</span>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Image Preview</h3>
            <div className="text-center">
              <img
                src={imageBlock.src}
                alt={imageBlock.alt || 'Demo Image'}
                className="inline-block shadow-lg"
                style={{
                  width: imageBlock.width ? `${imageBlock.width}px` : '300px',
                  height: imageBlock.height ? `${imageBlock.height}px` : 'auto',
                  borderRadius: imageBlock.borderRadius || '8px',
                  maxWidth: imageBlock.maxWidth || '100%'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <div style={{ display: 'none', padding: '20px', border: '2px dashed #ccc', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                Demo image not available
              </div>
              {imageBlock.caption && (
                <p className="text-sm text-gray-600 mt-2 italic">{imageBlock.caption}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setImageBlock({
              type: 'image',
              src: '/static_design_images/sample-image.jpg',
              alt: 'Sample Image',
              caption: 'This is a sample image for testing',
              width: 300,
              height: 200,
              alignment: 'center',
              borderRadius: '8px',
              maxWidth: '100%',
              layoutMode: 'standalone'
            })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
};

export default WordStyleImageEditorDemo;
