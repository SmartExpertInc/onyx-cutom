"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { ImageBlock } from '@/types/textPresentation';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Settings, X, RotateCcw, ZoomIn, ZoomOut, Move, Crop, 
  Palette, Type, Layout, Image as ImageIcon, ChevronDown, Edit3
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
  const [showBasicMenu, setShowBasicMenu] = useState(false);

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
      <div className="bg-white rounded-xl shadow-2xl w-[90vw] h-[90vh] max-w-4xl flex flex-col">
        {/* Header - Modern UI */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Image Settings</h2>
              <p className="text-blue-100 text-sm">Customize your image appearance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Settings */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
            {/* Basic Actions Menu */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Basic Actions</h3>
                <div className="relative">
                  <button
                    onClick={() => setShowBasicMenu(!showBasicMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-md transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Actions
                    <ChevronDown className={`w-3 h-3 transition-transform ${showBasicMenu ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Basic Actions Dropdown */}
                  {showBasicMenu && (
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="py-1">
                        {/* Quick Size Actions */}
                        <div className="px-3 py-2 border-b border-gray-100">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Quick Size</div>
                          <div className="grid grid-cols-2 gap-1">
                            {quickSizePresets.map((preset) => (
                              <button
                                key={preset.name}
                                onClick={() => {
                                  updateImageProperty('width', preset.width);
                                  updateImageProperty('height', preset.height);
                                  setShowBasicMenu(false);
                                }}
                                className="w-full px-2 py-1 text-left text-xs hover:bg-blue-50 rounded flex items-center justify-between"
                              >
                                <span>{preset.name}</span>
                                <span className="text-gray-500">{preset.width}px</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Alignment Actions */}
                        <div className="px-3 py-2 border-b border-gray-100">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Alignment</div>
                          <div className="flex gap-1">
                            {alignmentOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  updateImageProperty('alignment', option.value);
                                  setShowBasicMenu(false);
                                }}
                                className="flex-1 px-2 py-1 text-xs hover:bg-blue-50 rounded text-center"
                              >
                                {option.icon} {option.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Border Radius Actions */}
                        <div className="px-3 py-2 border-b border-gray-100">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Corner Style</div>
                          <div className="space-y-1">
                            {[
                              { value: '0px', label: 'Sharp Corners' },
                              { value: '4px', label: 'Slightly Rounded' },
                              { value: '8px', label: 'Rounded' },
                              { value: '16px', label: 'Very Rounded' }
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  updateImageProperty('borderRadius', option.value);
                                  setShowBasicMenu(false);
                                }}
                                className="w-full px-2 py-1 text-left text-xs hover:bg-blue-50 rounded"
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Advanced Settings */}
                        <div className="px-3 py-2">
                          <button
                            onClick={() => {
                              setActiveTab('format');
                              setShowBasicMenu(false);
                            }}
                            className="w-full px-2 py-2 text-left text-sm hover:bg-blue-50 rounded flex items-center gap-2 font-medium text-blue-600"
                          >
                            <Edit3 className="w-4 h-4" />
                            Open Advanced Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick Size Presets */}
              <div className="grid grid-cols-2 gap-2">
                {quickSizePresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      updateImageProperty('width', preset.width);
                      updateImageProperty('height', preset.height);
                    }}
                    className={`p-2 border rounded-lg text-left transition-colors ${
                      (typeof localImageBlock.width === 'number' ? localImageBlock.width : parseInt(localImageBlock.width || '300')) === preset.width
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">{preset.name}</div>
                    <div className="text-xs text-gray-500">{preset.width}px</div>
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

                     {/* Right Panel - Live Preview */}
           <div className="flex-1 flex flex-col">
             {/* Preview Header */}
             <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
               <div className="flex items-center justify-between">
                 <h3 className="text-sm font-semibold text-gray-900">Live Preview</h3>
                 <div className="text-xs text-gray-500">
                   Changes apply in real-time
                 </div>
               </div>
             </div>

             {/* Preview Area */}
             <div className="flex-1 p-6 bg-gray-50 overflow-auto">
               <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
                 <div className="prose max-w-none">
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
                   
                   {/* Sample content for context */}
                   <div className="mt-4 text-sm text-gray-600">
                     <p>This preview shows how your image will appear in the document. Adjust settings on the left to see changes in real-time.</p>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </div>

                 {/* Footer - Modern UI */}
         <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between rounded-b-xl">
           <div className="flex items-center gap-4">
             <div className="text-sm text-gray-600">
               <span className="font-medium">Size:</span> {typeof localImageBlock.width === 'number' ? localImageBlock.width : parseInt(localImageBlock.width || '300')}px × {localImageBlock.height || 'auto'}
             </div>
             <div className="text-sm text-gray-600">
               <span className="font-medium">Alignment:</span> {localImageBlock.alignment || 'center'}
             </div>
           </div>
           <div className="flex gap-3">
             <button
               onClick={resetToDefaults}
               className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
             >
               Reset to Default
             </button>
             <button
               onClick={onClose}
               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
             >
               Apply Changes
             </button>
           </div>
         </div>
      </div>
    </div>
  );
};

export default WordStyleImageEditor;
