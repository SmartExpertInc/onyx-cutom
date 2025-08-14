"use client";

import React, { useState } from 'react';
import WordStyleImageEditor from './WordStyleImageEditor';
import ImageBasicActions from './ImageBasicActions';
import { ImageBlock } from '@/types/textPresentation';

const NewImageActionsTest: React.FC = () => {
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);
  const [imageBlock, setImageBlock] = useState<ImageBlock>({
    type: 'image',
    src: '/static_design_images/sample-image.jpg',
    alt: 'Sample Image',
    caption: 'This is a sample image for testing',
    width: 300,
    height: 'auto',
    alignment: 'center',
    borderRadius: '8px',
    maxWidth: '100%',
    layoutMode: 'standalone'
  });

  const handleImageChange = (updatedBlock: ImageBlock) => {
    setImageBlock(updatedBlock);
    console.log('Image updated:', updatedBlock);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">New Image Actions Test</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Image with Basic Actions</h2>
            <div className="text-sm text-gray-500">
              Hover over the image to see the actions button
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image with Basic Actions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Image with Actions</h3>
              <div className={`text-${imageBlock.alignment} border rounded-lg p-4 bg-gray-50 group relative`}>
                {/* Basic Actions Button */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  <ImageBasicActions
                    imageBlock={imageBlock}
                    onImageChange={handleImageChange}
                    onOpenAdvancedSettings={() => setShowAdvancedEditor(true)}
                  />
                </div>

                <img
                  src={imageBlock.src}
                  alt={imageBlock.alt}
                  style={{
                    width: typeof imageBlock.width === 'number' ? `${imageBlock.width}px` : imageBlock.width || '300px',
                    height: imageBlock.height || 'auto',
                    borderRadius: imageBlock.borderRadius || '8px',
                    maxWidth: imageBlock.maxWidth || '100%'
                  }}
                  className="shadow-md"
                />
                {imageBlock.caption && (
                  <p className="text-sm text-gray-600 mt-2 italic">{imageBlock.caption}</p>
                )}
              </div>
            </div>

            {/* Settings Summary */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Current Settings</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Width:</span>
                  <span className="font-medium">{typeof imageBlock.width === 'number' ? `${imageBlock.width}px` : imageBlock.width || '300px'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Height:</span>
                  <span className="font-medium">{imageBlock.height || 'auto'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Alignment:</span>
                  <span className="font-medium capitalize">{imageBlock.alignment || 'center'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Border Radius:</span>
                  <span className="font-medium">{imageBlock.borderRadius || '8px'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Layout Mode:</span>
                  <span className="font-medium">{imageBlock.layoutMode || 'standalone'}</span>
                </div>
              </div>

              {/* Manual Advanced Settings Button */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAdvancedEditor(true)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Open Advanced Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Use</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
              <div>
                <strong>Hover over the image</strong> - You'll see a "Actions" button appear in the top-left corner
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
              <div>
                <strong>Click "Actions"</strong> - A dropdown menu will appear with basic actions:
                <ul className="mt-2 ml-4 space-y-1">
                  <li>• <strong>Quick Size</strong> - Small, Medium, Large, Extra Large</li>
                  <li>• <strong>Alignment</strong> - Left, Center, Right</li>
                  <li>• <strong>Corner Style</strong> - Sharp, Slightly Rounded, Rounded, Very Rounded</li>
                  <li>• <strong>Open Advanced Settings</strong> - Opens the full modal editor</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
              <div>
                <strong>Use Advanced Settings</strong> - Click "Open Advanced Settings" for detailed controls like precise sizing, effects, and layout options
              </div>
            </div>
          </div>
        </div>

        {/* JSON Data */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Image Block Data</h2>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
            {JSON.stringify(imageBlock, null, 2)}
          </pre>
        </div>
      </div>

      {/* Advanced Settings Modal */}
      <WordStyleImageEditor
        isOpen={showAdvancedEditor}
        onClose={() => setShowAdvancedEditor(false)}
        imageBlock={imageBlock}
        onImageChange={handleImageChange}
      />
    </div>
  );
};

export default NewImageActionsTest;
