"use client";

import React, { useState } from 'react';
import WordStyleImageEditor from './WordStyleImageEditor';
import ImageBasicActions from './ImageBasicActions';
import { ImageBlock } from '../types/textPresentation';

const HoverTestComponent: React.FC = () => {
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);
  const [imageBlock, setImageBlock] = useState<ImageBlock>({
    type: 'image',
    src: '/static_design_images/sample-image.jpg',
    alt: 'Test Hover Image',
    caption: 'Hover over this image to see the gear button',
    width: 400,
    height: 'auto',
    alignment: 'center',
    borderRadius: '8px',
    maxWidth: '100%',
    layoutMode: 'standalone'
  });

  const handleImageChange = (updatedBlock: ImageBlock) => {
    setImageBlock(updatedBlock);
    console.log('Image updated via hover test:', updatedBlock);
  };

  const handleOpenAdvancedSettings = () => {
    console.log('Opening advanced settings from hover test...');
    setShowAdvancedEditor(true);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">🎯 Hover Test - Gear Button on Image</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Hover Test Results</h2>
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Testing Hover
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Test Image with Hover */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Test Image (Hover to see gear)</h3>
              
              {/* Image with overlay button - FIXED STRUCTURE */}
              <div className="inline-block relative group/image border-2 border-dashed border-gray-300 p-4 rounded-lg">
                <img 
                  src={imageBlock.src} 
                  alt={imageBlock.alt}
                  className="rounded-lg block"
                  style={{
                    width: typeof imageBlock.width === 'number' ? `${imageBlock.width}px` : imageBlock.width || '300px',
                    height: imageBlock.height || 'auto',
                    borderRadius: imageBlock.borderRadius || '8px',
                    maxWidth: imageBlock.maxWidth || '100%',
                    boxShadow: imageBlock.boxShadow || '0 2px 4px rgba(0,0,0,0.1)',
                    border: imageBlock.border || 'none',
                    opacity: imageBlock.opacity || 1,
                    transform: imageBlock.transform || 'none'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                
                {/* FIXED: Gear button that appears on hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 z-50">
                  <ImageBasicActions
                    imageBlock={imageBlock}
                    onImageChange={handleImageChange}
                    onOpenAdvancedSettings={handleOpenAdvancedSettings}
                  />
                </div>
                
                {/* Visual indicator */}
                <div className="absolute bottom-2 left-2 opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 z-40">
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                    ✓ Hover detected!
                  </div>
                </div>
              </div>
              
              {imageBlock.caption && (
                <p className="text-sm text-gray-600 mt-2 italic text-center">{imageBlock.caption}</p>
              )}
            </div>

            {/* Instructions and Debugging */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Debug Information</h3>
              
              <div className="space-y-4 text-sm">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">✅ Expected Behavior:</h4>
                  <ul className="text-green-800 space-y-1">
                    <li>• Hover over image → Gear button appears in top-right corner</li>
                    <li>• Green "Hover detected!" indicator also appears</li>
                    <li>• Click gear → Dropdown opens with basic actions</li>
                    <li>• Move mouse away → Both elements fade out</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">🔧 Technical Fix Applied:</h4>
                  <ul className="text-blue-800 space-y-1 text-xs">
                    <li>• Image wrapped in `group/image` container</li>
                    <li>• Button uses `group-hover/image:opacity-100`</li>
                    <li>• Positioned `absolute top-2 right-2`</li>
                    <li>• High z-index (`z-50`) for overlay</li>
                    <li>• Smooth transition duration-200</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2">🐛 If Not Working:</h4>
                  <ul className="text-yellow-800 space-y-1 text-xs">
                    <li>• Check if Tailwind CSS is properly loaded</li>
                    <li>• Verify `group/image` syntax is supported</li>
                    <li>• Open browser DevTools and check hover states</li>
                    <li>• Look for console errors</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-2">📊 Current Settings:</h4>
                  <div className="text-gray-700 space-y-1 text-xs">
                    <div><strong>Width:</strong> {imageBlock.width}px</div>
                    <div><strong>Height:</strong> {imageBlock.height}</div>
                    <div><strong>Border Radius:</strong> {imageBlock.borderRadius}</div>
                    <div><strong>Layout Mode:</strong> {imageBlock.layoutMode}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative Test with Classic Group/Hover */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Fallback Test (Classic group/hover)</h2>
          <p className="text-gray-600 mb-4">If the above doesn't work, this uses standard group/hover syntax:</p>
          
          <div className="group relative inline-block border-2 border-dashed border-gray-300 p-4 rounded-lg">
            <img 
              src={imageBlock.src} 
              alt="Fallback test image"
              className="rounded-lg block"
              style={{
                width: '300px',
                height: 'auto'
              }}
            />
            
            {/* Fallback gear button */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
              <ImageBasicActions
                imageBlock={imageBlock}
                onImageChange={handleImageChange}
                onOpenAdvancedSettings={handleOpenAdvancedSettings}
              />
            </div>
            
            {/* Fallback indicator */}
            <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-40">
              <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                ✓ Fallback hover works!
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

export default HoverTestComponent;
