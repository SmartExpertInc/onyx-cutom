"use client";

import React, { useState } from 'react';
import BasicImageActions from './BasicImageActions';
import WordStyleImageEditor from './WordStyleImageEditor';
import { ImageBlock } from '@/types/textPresentation';
import { Settings } from 'lucide-react';

const NewImageActionsTest: React.FC = () => {
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

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const handleImageChange = (updatedBlock: ImageBlock) => {
    setImageBlock(updatedBlock);
    console.log('Image updated:', updatedBlock);
  };

  const handleOpenAdvancedSettings = () => {
    setShowAdvancedSettings(true);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">New Image Actions Test</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Image with Basic Actions</h2>
            <p className="text-sm text-gray-600">Click the gear icon to see basic actions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image with Actions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Image Preview</h3>
              <div className="relative border rounded-lg p-4 bg-gray-50">
                {/* Basic Actions Button */}
                <div className="absolute top-2 left-2 z-10">
                  <BasicImageActions
                    imageBlock={imageBlock}
                    onImageChange={handleImageChange}
                    onOpenAdvancedSettings={handleOpenAdvancedSettings}
                  />
                </div>

                {/* Image */}
                <div className={`text-${imageBlock.alignment} mt-8`}>
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

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Click the gear icon to see basic actions</li>
                  <li>• Choose from Size, Alignment, or Style options</li>
                  <li>• Click "Open Advanced Settings" to open the full editor</li>
                </ul>
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
        isOpen={showAdvancedSettings}
        onClose={() => setShowAdvancedSettings(false)}
        imageBlock={imageBlock}
        onImageChange={handleImageChange}
      />
    </div>
  );
};

export default NewImageActionsTest;

