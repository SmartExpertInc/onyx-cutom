"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { ImageBlock } from '@/types/textPresentation';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Settings, X, RotateCcw, ZoomIn, ZoomOut, Move, Crop, 
  Palette, Type, Layout, Image as ImageIcon, Download, Upload
} from 'lucide-react';

interface WordStyleImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageBlock: ImageBlock;
  onImageChange: (updatedBlock: ImageBlock) => void;
}

const WordStyleImageEditor: React.FC<WordStyleImageEditorProps> = ({
  isOpen,
  onClose,
  imageBlock,
  onImageChange
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'format' | 'size' | 'layout' | 'effects'>('format');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Local state for real-time preview
  const [localImageBlock, setLocalImageBlock] = useState<ImageBlock>(imageBlock);

  useEffect(() => {
    setLocalImageBlock(imageBlock);
  }, [imageBlock]);

  const updateImageProperty = (property: keyof ImageBlock, value: any) => {
    const updatedBlock = { ...localImageBlock, [property]: value };
    setLocalImageBlock(updatedBlock);
    onImageChange(updatedBlock);
  };

  const resetToDefaults = () => {
    const defaultBlock: ImageBlock = {
      type: 'image',
      src: imageBlock.src,
      alt: imageBlock.alt || '',
      caption: imageBlock.caption || '',
      width: 300,
      height: 'auto',
      alignment: 'center',
      borderRadius: '8px',
      maxWidth: '100%',
      layoutMode: 'standalone'
    };
    setLocalImageBlock(defaultBlock);
    onImageChange(defaultBlock);
  };

  const quickSizePresets = [
    { name: 'Small', width: 200, height: 'auto' },
    { name: 'Medium', width: 400, height: 'auto' },
    { name: 'Large', width: 600, height: 'auto' },
    { name: 'Extra Large', width: 800, height: 'auto' }
  ];

  const layoutPresets = [
    { name: 'Inline with Text', mode: 'inline-left', description: 'Text flows around the image' },
    { name: 'Break Text', mode: 'standalone', description: 'Image on its own line' },
    { name: 'Behind Text', mode: 'standalone', description: 'Image as background' },
    { name: 'In Front of Text', mode: 'standalone', description: 'Image overlays text' }
  ];

  const alignmentOptions = [
    { value: 'left', icon: '⬅️', label: 'Left' },
    { value: 'center', icon: '⬆️', label: 'Center' },
    { value: 'right', icon: '➡️', label: 'Right' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-2xl w-[90vw] h-[90vh] max-w-6xl flex flex-col">
        {/* Header - Word-style */}
        <div className="bg-[#2b579a] text-white px-6 py-3 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Format Picture</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Word-style ribbon */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200">
              <div className="flex">
                {[
                  { id: 'format', label: 'Format', icon: ImageIcon },
                  { id: 'size', label: 'Size', icon: ZoomIn },
                  { id: 'layout', label: 'Layout', icon: Layout },
                  { id: 'effects', label: 'Effects', icon: Palette }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#2b579a] text-[#2b579a] bg-blue-50'
                        : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mx-auto mb-1" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'format' && (
                <div className="space-y-6">
                  {/* Quick Styles */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Quick Styles
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {quickSizePresets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => {
                            updateImageProperty('width', preset.width);
                            updateImageProperty('height', preset.height);
                          }}
                          className={`p-3 border rounded-lg text-left transition-colors ${
                                                         (typeof localImageBlock.width === 'number' ? localImageBlock.width : parseInt(localImageBlock.width || '300')) === preset.width
                              ? 'border-[#2b579a] bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-900">{preset.name}</div>
                          <div className="text-xs text-gray-500">{preset.width}px</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Alignment */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Move className="w-4 h-4" />
                      Alignment
                    </h3>
                    <div className="flex gap-2">
                      {alignmentOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateImageProperty('alignment', option.value)}
                          className={`flex-1 p-3 border rounded-lg transition-colors ${
                            localImageBlock.alignment === option.value
                              ? 'border-[#2b579a] bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-lg mb-1">{option.icon}</div>
                            <div className="text-xs text-gray-600">{option.label}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Border Radius */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Corner Rounding</h3>
                    <div className="space-y-2">
                      {[
                        { value: '0px', label: 'Sharp' },
                        { value: '4px', label: 'Slightly Rounded' },
                        { value: '8px', label: 'Rounded' },
                        { value: '16px', label: 'Very Rounded' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateImageProperty('borderRadius', option.value)}
                          className={`w-full p-2 text-left border rounded transition-colors ${
                            localImageBlock.borderRadius === option.value
                              ? 'border-[#2b579a] bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-sm">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'size' && (
                <div className="space-y-6">
                  {/* Size Controls */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <ZoomIn className="w-4 h-4" />
                      Size
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Width (px)</label>
                        <input
                          type="number"
                                                     value={typeof localImageBlock.width === 'number' ? localImageBlock.width : parseInt(localImageBlock.width || '300')}
                          onChange={(e) => updateImageProperty('width', parseInt(e.target.value) || 300)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b579a] focus:border-[#2b579a]"
                          min="50"
                          max="1200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Height</label>
                        <select
                          value={localImageBlock.height || 'auto'}
                          onChange={(e) => updateImageProperty('height', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b579a] focus:border-[#2b579a]"
                        >
                          <option value="auto">Auto (maintain aspect ratio)</option>
                          <option value="200px">200px</option>
                          <option value="300px">300px</option>
                          <option value="400px">400px</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Scale Controls */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Scale</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const currentWidth = typeof localImageBlock.width === 'number' ? localImageBlock.width : parseInt(localImageBlock.width || '300');
                          const newWidth = Math.max(50, currentWidth - 50);
                          updateImageProperty('width', newWidth);
                        }}
                        className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center justify-center gap-2"
                      >
                        <ZoomOut className="w-4 h-4" />
                        Smaller
                      </button>
                      <button
                        onClick={() => {
                          const currentWidth = typeof localImageBlock.width === 'number' ? localImageBlock.width : parseInt(localImageBlock.width || '300');
                          const newWidth = Math.min(1200, currentWidth + 50);
                          updateImageProperty('width', newWidth);
                        }}
                        className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center justify-center gap-2"
                      >
                        <ZoomIn className="w-4 h-4" />
                        Larger
                      </button>
                    </div>
                  </div>

                  {/* Reset Button */}
                  <div>
                    <button
                      onClick={resetToDefaults}
                      className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset to Default
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'layout' && (
                <div className="space-y-6">
                  {/* Layout Options */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Layout className="w-4 h-4" />
                      Text Wrapping
                    </h3>
                    <div className="space-y-2">
                      {layoutPresets.map((preset) => (
                        <button
                          key={preset.mode}
                          onClick={() => updateImageProperty('layoutMode', preset.mode)}
                          className={`w-full p-3 text-left border rounded-lg transition-colors ${
                            localImageBlock.layoutMode === preset.mode
                              ? 'border-[#2b579a] bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-900">{preset.name}</div>
                          <div className="text-xs text-gray-500">{preset.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Position */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Position</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'left', label: 'Left', icon: '⬅️' },
                        { value: 'center', label: 'Center', icon: '⬆️' },
                        { value: 'right', label: 'Right', icon: '➡️' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateImageProperty('alignment', option.value)}
                          className={`p-3 border rounded-lg transition-colors ${
                            localImageBlock.alignment === option.value
                              ? 'border-[#2b579a] bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-lg mb-1">{option.icon}</div>
                            <div className="text-xs text-gray-600">{option.label}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'effects' && (
                <div className="space-y-6">
                  {/* Visual Effects */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Visual Effects
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Shadow</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b579a] focus:border-[#2b579a]">
                          <option>None</option>
                          <option>Subtle</option>
                          <option>Medium</option>
                          <option>Strong</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Border</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b579a] focus:border-[#2b579a]">
                          <option>None</option>
                          <option>Solid</option>
                          <option>Dashed</option>
                          <option>Dotted</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Advanced</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Opacity</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          defaultValue="100"
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500 text-center">100%</div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Rotation</label>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          defaultValue="0"
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500 text-center">0°</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 flex flex-col">
            {/* Preview Controls */}
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Preview:</span>
                <div className="flex gap-1">
                  {[
                    { id: 'desktop', label: 'Desktop', icon: '🖥️' },
                    { id: 'tablet', label: 'Tablet', icon: '📱' },
                    { id: 'mobile', label: 'Mobile', icon: '📱' }
                  ].map((device) => (
                    <button
                      key={device.id}
                      onClick={() => setPreviewMode(device.id as any)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        previewMode === device.id
                          ? 'bg-[#2b579a] text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {device.icon} {device.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4 inline mr-1" />
                  Export
                </button>
              </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 p-6 bg-gray-50 overflow-auto">
              <div className={`mx-auto bg-white shadow-lg rounded-lg p-6 ${
                previewMode === 'desktop' ? 'max-w-4xl' :
                previewMode === 'tablet' ? 'max-w-2xl' :
                'max-w-sm'
              }`}>
                <div className="prose max-w-none">
                  <h2 className="text-xl font-bold mb-4">Sample Document</h2>
                  <p className="mb-4">
                    This is a sample paragraph that demonstrates how the image will appear in your document. 
                    The text will wrap around the image according to the selected layout options.
                  </p>
                  
                  {/* Image Preview */}
                  <div className={`my-4 ${
                    localImageBlock.alignment === 'left' ? 'text-left' :
                    localImageBlock.alignment === 'right' ? 'text-right' :
                    'text-center'
                  }`}>
                    <div className="inline-block relative">
                      <img
                        src={localImageBlock.src}
                        alt={localImageBlock.alt || 'Preview image'}
                        className="shadow-md"
                        style={{
                          width: typeof localImageBlock.width === 'number' ? `${localImageBlock.width}px` : localImageBlock.width || '300px',
                          height: localImageBlock.height || 'auto',
                          borderRadius: localImageBlock.borderRadius || '8px',
                          maxWidth: localImageBlock.maxWidth || '100%',
                          float: localImageBlock.layoutMode === 'inline-left' ? 'left' :
                                 localImageBlock.layoutMode === 'inline-right' ? 'right' : 'none',
                          margin: localImageBlock.layoutMode === 'inline-left' ? '0 16px 16px 0' :
                                  localImageBlock.layoutMode === 'inline-right' ? '0 0 16px 16px' : '0'
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      {localImageBlock.caption && (
                        <p className="text-xs text-gray-600 mt-2 italic text-center">
                          {localImageBlock.caption}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <p className="mb-4">
                    This paragraph continues after the image, showing how the text flows around or below 
                    the image based on the selected layout settings. You can see how the image positioning 
                    affects the overall document layout.
                  </p>
                  
                  <p>
                    Additional content can be added here to demonstrate the full layout behavior. 
                    The image editor provides real-time preview of how your changes will appear in the final document.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Word-style */}
        <div className="bg-gray-100 px-6 py-3 border-t border-gray-200 flex items-center justify-between rounded-b-lg">
          <div className="text-sm text-gray-600">
            Image: {typeof localImageBlock.width === 'number' ? localImageBlock.width : parseInt(localImageBlock.width || '300')}px × {localImageBlock.height || 'auto'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#2b579a] text-white rounded hover:bg-[#1e3a8a] transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordStyleImageEditor;
