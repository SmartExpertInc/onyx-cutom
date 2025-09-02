"use client";

import React, { useState } from 'react';
import WordStyleImageEditor from './WordStyleImageEditor';
import ImageBasicActions from './ImageBasicActions';
import { ImageBlock } from '../types/textPresentation';

const FinalFixedImageTest: React.FC = () => {
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);
  const [imageBlock, setImageBlock] = useState<ImageBlock>({
    type: 'image',
    src: '/static_design_images/sample-image.jpg',
    alt: 'Test Image',
    caption: 'Test image with all fixes applied',
    width: 400,
    height: 'auto',
    alignment: 'center',
    borderRadius: '8px',
    maxWidth: '100%',
    layoutMode: 'standalone',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: 'none',
    opacity: 1,
    transform: 'none'
  });

  const handleImageChange = (updatedBlock: ImageBlock) => {
    setImageBlock(updatedBlock);
    console.log('Image updated:', updatedBlock);
  };

  const handleOpenAdvancedSettings = () => {
    console.log('Opening advanced settings...');
    setShowAdvancedEditor(true);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">🎉 All Fixes Applied - Final Test</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Complete Fixed Functionality</h2>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              ✅ All Fixed
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image with ALL Fixes */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Image with Complete Fixes</h3>
              <div className={`text-${imageBlock.alignment} border rounded-lg p-6 bg-gray-50 group relative min-h-[300px]`}>
                {/* FIXED: Gear button in corner of image that appears on hover */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-50">
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
                    maxWidth: imageBlock.maxWidth || '100%',
                    float: imageBlock.layoutMode === 'inline-left' ? 'left' :
                           imageBlock.layoutMode === 'inline-right' ? 'right' : 'none',
                    margin: imageBlock.layoutMode === 'inline-left' ? '0 16px 16px 0' :
                            imageBlock.layoutMode === 'inline-right' ? '0 0 16px 16px' : '0',
                    // FIXED: All visual effects now work
                    boxShadow: imageBlock.boxShadow || '0 2px 4px rgba(0,0,0,0.1)',
                    border: imageBlock.border || 'none',
                    opacity: imageBlock.opacity || 1,
                    transform: imageBlock.transform || 'none'
                  }}
                  className="transition-all duration-200"
                />
                {imageBlock.caption && (
                  <p className="text-sm text-gray-600 mt-2 italic">{imageBlock.caption}</p>
                )}
              </div>
            </div>

            {/* Fixed Features Summary */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">✅ All Fixed Issues</h3>
              <div className="space-y-4 text-sm">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">✅ Dropdown Fixes:</h4>
                  <ul className="text-green-800 space-y-1 text-xs">
                    <li>• Closes when clicking outside</li>
                    <li>• Positioned to stay within screen bounds</li>
                    <li>• Improved styling and positioning</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">✅ Size Buttons:</h4>
                  <ul className="text-blue-800 space-y-1 text-xs">
                    <li>• Small/Medium/Large now work</li>
                    <li>• Console logging for debugging</li>
                    <li>• Immediate visual feedback</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">✅ Gear Position:</h4>
                  <ul className="text-purple-800 space-y-1 text-xs">
                    <li>• Now appears in corner of image</li>
                    <li>• Shows on hover only</li>
                    <li>• Proper z-index handling</li>
                  </ul>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-2">✅ Modal Features:</h4>
                  <ul className="text-orange-800 space-y-1 text-xs">
                    <li>• Text Wrapping now works</li>
                    <li>• Visual Effects fully functional</li>
                    <li>• Enhanced Live Preview with real content</li>
                    <li>• Larger preview area</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-2">🎯 Current Settings:</h4>
                  <div className="text-gray-700 space-y-1 text-xs">
                    <div><strong>Width:</strong> {imageBlock.width}px</div>
                    <div><strong>Alignment:</strong> {imageBlock.alignment}</div>
                    <div><strong>Border Radius:</strong> {imageBlock.borderRadius}</div>
                    <div><strong>Layout:</strong> {imageBlock.layoutMode}</div>
                    <div><strong>Shadow:</strong> {imageBlock.boxShadow}</div>
                    <div><strong>Border:</strong> {imageBlock.border}</div>
                    <div><strong>Opacity:</strong> {imageBlock.opacity}</div>
                    <div><strong>Transform:</strong> {imageBlock.transform}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Test Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🧪 Complete Test Instructions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Basic Actions Test</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>Hover over image → Gear appears in top-right corner</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>Click gear → Dropdown appears (not modal)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>Click outside dropdown → It closes</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">4.</span>
                  <span>Try Small/Medium/Large → Size changes immediately</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">5.</span>
                  <span>Try alignment options → Position changes</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Advanced Modal Test</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">1.</span>
                  <span>Click "Open Advanced Settings" → Modal opens</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">2.</span>
                  <span>Try Text Wrapping options → Layout changes</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">3.</span>
                  <span>Try Visual Effects → Shadow/Border/Opacity work</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">4.</span>
                  <span>Check Live Preview → Shows real content, larger view</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">5.</span>
                  <span>All changes reflect in preview in real-time</span>
                </div>
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

export default FinalFixedImageTest;
