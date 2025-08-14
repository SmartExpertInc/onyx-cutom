"use client";

import React, { useState } from 'react';
import WordStyleImageEditor from './WordStyleImageEditor';
import ImageBasicActions from './ImageBasicActions';
import { ImageBlock } from '../types/textPresentation';

const TestImageActionsFixed: React.FC = () => {
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);
  const [imageBlock, setImageBlock] = useState<ImageBlock>({
    type: 'image',
    src: '/static_design_images/sample-image.jpg',
    alt: 'Test Image',
    caption: 'Test image for checking the fixed functionality',
    width: 300,
    height: 'auto',
    alignment: 'center',
    borderRadius: '8px',
    maxWidth: '100%',
    layoutMode: 'standalone'
  });

  const handleImageChange = (updatedBlock: ImageBlock) => {
    setImageBlock(updatedBlock);
    console.log('Image updated via basic actions:', updatedBlock);
  };

  const handleOpenAdvancedSettings = () => {
    console.log('Opening advanced settings from basic actions...');
    setShowAdvancedEditor(true);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">✅ Fixed Image Actions Test</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Corrected Functionality</h2>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              ✓ Fixed
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image with Fixed Actions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Image with Corrected Actions</h3>
              <div className={`text-${imageBlock.alignment} border rounded-lg p-4 bg-gray-50 group relative`}>
                {/* The new ImageBasicActions component */}
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  <ImageBasicActions
                    imageBlock={imageBlock}
                    onImageChange={handleImageChange}
                    onOpenAdvancedSettings={handleOpenAdvancedSettings}
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

            {/* Expected Behavior */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Expected Behavior</h3>
              <div className="space-y-4 text-sm">
                <div className="bg-green-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">✅ Now Working:</h4>
                  <ul className="text-green-800 space-y-1">
                    <li>• Hover image → See "Actions" button</li>
                    <li>• Click "Actions" → See dropdown with basic options</li>
                    <li>• Click basic options → Immediate image update</li>
                    <li>• Click "Open Advanced Settings" → Modal opens</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">🔧 What Was Fixed:</h4>
                  <ul className="text-blue-800 space-y-1">
                    <li>• Replaced old buttons that opened modal directly</li>
                    <li>• Implemented two-tier system: basic dropdown + advanced modal</li>
                    <li>• Removed gear icon from advanced modal (now has direct tabs)</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-2">🎯 Current Image Settings:</h4>
                  <div className="text-gray-700 space-y-1 text-xs">
                    <div><strong>Width:</strong> {imageBlock.width}px</div>
                    <div><strong>Alignment:</strong> {imageBlock.alignment}</div>
                    <div><strong>Border Radius:</strong> {imageBlock.borderRadius}</div>
                    <div><strong>Layout:</strong> {imageBlock.layoutMode}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Instructions</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
              <div>
                <strong>Hover over the image</strong> - The "Actions" button should appear in the top-left corner
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
              <div>
                <strong>Click "Actions"</strong> - A dropdown should appear with:
                <ul className="mt-1 ml-4 text-xs space-y-1">
                  <li>• Quick Size options (Small, Medium, Large, etc.)</li>
                  <li>• Alignment options (Left, Center, Right)</li>
                  <li>• Corner Style options (Sharp, Rounded, etc.)</li>
                  <li>• "Open Advanced Settings" button</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
              <div>
                <strong>Test basic actions</strong> - Click any basic option and see immediate changes
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</div>
              <div>
                <strong>Test advanced settings</strong> - Click "Open Advanced Settings" to see the full modal
              </div>
            </div>
          </div>
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

export default TestImageActionsFixed;
