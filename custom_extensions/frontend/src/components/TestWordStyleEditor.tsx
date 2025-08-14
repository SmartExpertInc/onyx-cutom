"use client";

import React, { useState } from 'react';
import WordStyleImageEditor from './WordStyleImageEditor';
import { ImageBlock } from '@/types/textPresentation';

const TestWordStyleEditor: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Word-Style Image Editor Test</h1>
      
      <div className="mb-6">
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-[#2b579a] text-white rounded hover:bg-[#1e3a8a] transition-colors"
        >
          Open Word-Style Image Editor
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Current Image Settings:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(imageBlock, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Image Preview:</h2>
        <div className={`text-${imageBlock.alignment}`}>
          <img
            src={imageBlock.src}
            alt={imageBlock.alt}
            style={{
              width: `${imageBlock.width}px`,
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

      <WordStyleImageEditor
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        imageBlock={imageBlock}
        onImageChange={handleImageChange}
      />
    </div>
  );
};

export default TestWordStyleEditor;
