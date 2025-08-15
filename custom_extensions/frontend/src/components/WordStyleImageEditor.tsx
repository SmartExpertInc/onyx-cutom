"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { ImageBlock } from '@/types/textPresentation';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Settings, X, RotateCcw, ZoomIn, ZoomOut, Move, Crop, 
  Palette, Type, Layout, Image as ImageIcon, ChevronDown, Edit3,
  AlignLeft, AlignCenter, AlignRight, MoreHorizontal
} from 'lucide-react';

interface WordStyleImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageBlock: ImageBlock;
  onImageChange: (updatedBlock: ImageBlock) => void;
  documentContent?: string;
}

const WordStyleImageEditor: React.FC<WordStyleImageEditorProps> = ({
  isOpen,
  onClose,
  imageBlock,
  onImageChange,
  documentContent
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
    { name: t('interface.imageSettings.small'), width: 200, height: 'auto' },
    { name: t('interface.imageSettings.medium'), width: 400, height: 'auto' },
    { name: t('interface.imageSettings.large'), width: 600, height: 'auto' },
    { name: t('interface.imageSettings.extraLarge'), width: 800, height: 'auto' }
  ];

  const layoutPresets = [
    { name: t('interface.imageSettings.inlineLeft'), mode: 'inline-left' as const, description: t('interface.imageSettings.textWillWrap'), float: 'left' as const },
    { name: t('interface.imageSettings.inlineRight'), mode: 'inline-right' as const, description: t('interface.imageSettings.textWillWrap'), float: 'right' as const },
    { name: t('interface.imageSettings.standalone'), mode: 'standalone' as const, description: t('interface.imageSettings.imageOnOwnLine'), float: undefined },
    { name: t('interface.imageSettings.sideBySideLeft'), mode: 'side-by-side-left' as const, description: t('interface.imageSettings.sideBySideDescription'), float: undefined },
    { name: t('interface.imageSettings.sideBySideRight'), mode: 'side-by-side-right' as const, description: t('interface.imageSettings.sideBySideDescription'), float: undefined }
  ];

  const alignmentOptions = [
    { value: 'left', icon: AlignLeft, label: t('interface.imageSettings.left') },
    { value: 'center', icon: AlignCenter, label: t('interface.imageSettings.center') },
    { value: 'right', icon: AlignRight, label: t('interface.imageSettings.right') }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div 
        className="bg-white rounded-xl shadow-2xl w-[90vw] h-[90vh] max-w-4xl flex flex-col"
        style={{ userSelect: 'none' }}
      >
        {/* Header - Modern UI */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{t('interface.imageSettings.imageSettings')}</h2>
              <p className="text-blue-100 text-sm">{t('interface.blockSettings.customizeContent')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Advanced Settings Button - Top Right */}
            <button
              onClick={() => setActiveTab('effects')}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title={t('interface.imageSettings.advancedSettings')}
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Settings */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200">
              <div className="flex">
                {[
                  { id: 'format', label: t('interface.imageSettings.format'), icon: Palette },
                  { id: 'size', label: t('interface.imageSettings.size'), icon: ZoomIn },
                  // { id: 'layout', label: t('interface.imageSettings.layout'), icon: Layout }, // Закоментовано layout таб
                  { id: 'effects', label: t('interface.imageSettings.effects'), icon: Edit3 }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 bg-blue-50'
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
                      {t('interface.imageSettings.quickStyles')}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {quickSizePresets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => {
                            const updatedBlock = {
                              ...localImageBlock,
                              width: preset.width,
                              height: preset.height
                            };
                            setLocalImageBlock(updatedBlock);
                            onImageChange(updatedBlock);
                          }}
                          className={`p-3 border rounded-lg text-left transition-colors ${
                            (typeof localImageBlock.width === 'number' ? localImageBlock.width : parseInt(localImageBlock.width || '300')) === preset.width
                              ? 'border-[#2b579a] bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-900">{preset.name}</div>
                          <div className="text-xs text-gray-500">{preset.width}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Alignment */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Move className="w-4 h-4" />
                      {t('interface.imageSettings.alignment')}
                    </h3>
                    <div className="flex gap-2">
                      {alignmentOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
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
                              <IconComponent className="w-5 h-5 mx-auto mb-1 text-gray-700" />
                              <div className="text-xs text-gray-600">{option.label}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Border Radius */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('interface.imageSettings.cornerRounding')}</h3>
                    <div className="space-y-2">
                      {[
                        { value: '0px', label: t('interface.imageSettings.sharp') },
                        { value: '4px', label: t('interface.imageSettings.slightlyRounded') },
                        { value: '8px', label: t('interface.imageSettings.rounded') },
                        { value: '16px', label: t('interface.imageSettings.veryRounded') }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateImageProperty('borderRadius', option.value)}
                          className={`w-full p-3 text-left border rounded-lg transition-colors ${
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
                  {/* Width Control */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('interface.imageSettings.width')}</h3>
                    <div className="space-y-2">
                      <label className="block text-sm text-gray-700">{t('interface.imageSettings.currentWidth')}</label>
                      <select
                        value={typeof localImageBlock.width === 'number' ? `${localImageBlock.width}px` : localImageBlock.width || '300px'}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === 'auto') {
                            updateImageProperty('width', 'auto');
                          } else {
                            updateImageProperty('width', parseInt(value));
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b579a] focus:border-[#2b579a]"
                      >
                        <option value="auto">{t('interface.imageSettings.auto')} ({t('interface.imageSettings.maintainAspectRatio')})</option>
                        <option value="100px">100px</option>
                        <option value="150px">150px</option>
                        <option value="200px">200px</option>
                        <option value="300px">300px</option>
                        <option value="400px">400px</option>
                      </select>
                    </div>
                  </div>

                  {/* Scale Controls */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('interface.imageSettings.scale')}</h3>
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
                        {t('interface.imageSettings.smaller')}
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
                        {t('interface.imageSettings.larger')}
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
                      {t('interface.imageSettings.resetToDefaultSize')}
                    </button>
                  </div>
                </div>
              )}

              {/* Layout tab закоментовано
              {activeTab === 'layout' && (
                <div className="space-y-6">
                  // Layout content...
                </div>
              )}
              */}

              {activeTab === 'effects' && (
                <div className="space-y-6">
                  {/* Visual Effects */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('interface.imageSettings.visualEffects')}</h3>
                    <div className="space-y-4">
                      {/* Shadow */}
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">{t('interface.imageSettings.shadow')}</label>
                        <select
                          value={localImageBlock.boxShadow || 'none'}
                          onChange={(e) => {
                            const shadowValues = {
                              'none': 'none',
                              'subtle': '0 2px 4px rgba(0,0,0,0.1)',
                              'strong': '0 4px 8px rgba(0,0,0,0.2)'
                            };
                            updateImageProperty('boxShadow', shadowValues[e.target.value as keyof typeof shadowValues]);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b579a] focus:border-[#2b579a]"
                        >
                          <option value="none">{t('interface.imageSettings.none')}</option>
                          <option value="subtle">{t('interface.imageSettings.subtle')}</option>
                          <option value="strong">{t('interface.imageSettings.strong')}</option>
                        </select>
                      </div>

                      {/* Border */}
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">{t('interface.imageSettings.border')}</label>
                        <select
                          value={localImageBlock.border || 'none'}
                          onChange={(e) => {
                            const borderValues = {
                              'none': 'none',
                              'solid': '2px solid #e5e7eb',
                              'dashed': '2px dashed #e5e7eb',
                              'dotted': '2px dotted #e5e7eb'
                            };
                            updateImageProperty('border', borderValues[e.target.value as keyof typeof borderValues]);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2b579a] focus:border-[#2b579a]"
                        >
                          <option value="none">{t('interface.imageSettings.none')}</option>
                          <option value="solid">{t('interface.imageSettings.solid')}</option>
                          <option value="dashed">{t('interface.imageSettings.dashed')}</option>
                          <option value="dotted">{t('interface.imageSettings.dotted')}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('interface.imageSettings.advanced')}</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">{t('interface.imageSettings.opacity')}</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={localImageBlock.opacity ? parseFloat(localImageBlock.opacity.toString()) * 100 : 100}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) / 100;
                            updateImageProperty('opacity', value);
                          }}
                          onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
                          className="w-full cursor-pointer"
                          style={{ 
                            cursor: 'pointer',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none'
                          }}
                        />
                        <div className="text-xs text-gray-500 text-center">
                          {localImageBlock.opacity ? Math.round(parseFloat(localImageBlock.opacity.toString()) * 100) : 100}%
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">{t('interface.imageSettings.rotation')}</label>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={localImageBlock.transform ? parseInt(localImageBlock.transform.replace(/rotate\((\d+)deg\)/, '$1')) || 0 : 0}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            updateImageProperty('transform', `rotate(${value}deg)`);
                          }}
                          onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
                          className="w-full cursor-pointer"
                          style={{ 
                            cursor: 'pointer',
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none'
                          }}
                        />
                        <div className="text-xs text-gray-500 text-center">
                          {localImageBlock.transform ? parseInt(localImageBlock.transform.replace(/rotate\((\d+)deg\)/, '$1')) || 0 : 0}°
                        </div>
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
                <h3 className="text-sm font-semibold text-gray-900">{t('interface.imageSettings.livePreview')}</h3>
                <div className="text-xs text-gray-500">
                  {t('interface.imageSettings.changesApplyInRealTime')}
                </div>
              </div>
            </div>

            {/* Preview Area - Enhanced with Standalone Presentation styles */}
            <div className="flex-1 p-4 bg-gray-50 overflow-auto">
              <div className="max-w-full mx-auto bg-white shadow-lg rounded-lg p-8" style={{ fontFamily: 'Martel Sans, sans-serif' }}>
                <div className="prose max-w-none">
                  {/* Content before image */}
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Kanit, sans-serif', fontSize: '24px', lineHeight: '1.2' }}>
                      {t('interface.imageSettings.documentPreview')}
                    </h2>
                    <p className="text-gray-700 leading-relaxed" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                      {documentContent || t('interface.imageSettings.noDocumentContent')}
                    </p>
                  </div>
                  
                  {/* Image Preview with Context - Alignment affects only the image container */}
                  <div className="my-6">
                    <div className={`inline-block relative ${
                      localImageBlock.alignment === 'left' ? 'float-left mr-6 mb-4' :
                      localImageBlock.alignment === 'right' ? 'float-right ml-6 mb-4' :
                      'block mx-auto'
                    }`}>
                      <img
                        src={localImageBlock.src}
                        alt={localImageBlock.alt || 'Preview image'}
                        style={{
                          width: typeof localImageBlock.width === 'number' ? `${localImageBlock.width}px` : localImageBlock.width || '300px',
                          height: localImageBlock.height || 'auto',
                          borderRadius: localImageBlock.borderRadius || '8px',
                          maxWidth: localImageBlock.maxWidth || '100%',
                          float: localImageBlock.layoutMode === 'inline-left' ? 'left' :
                                 localImageBlock.layoutMode === 'inline-right' ? 'right' : 'none',
                          margin: localImageBlock.layoutMode === 'inline-left' ? '0 16px 16px 0' :
                                  localImageBlock.layoutMode === 'inline-right' ? '0 0 16px 16px' : '0',
                          boxShadow: localImageBlock.boxShadow || '0 2px 4px rgba(0,0,0,0.1)',
                          border: localImageBlock.border || 'none',
                          opacity: localImageBlock.opacity || 1,
                          transform: localImageBlock.transform || 'none'
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      {localImageBlock.caption && (
                        <p className="text-sm text-gray-600 mt-2 italic text-center">
                          {localImageBlock.caption}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Content after image */}
                  <div className="mt-6">
                    <p className="text-gray-700 leading-relaxed mb-4" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                      {documentContent ? documentContent.slice(0, 200) + '...' : t('interface.imageSettings.additionalContentPlaceholder')}
                    </p>
                    <p className="text-gray-700 leading-relaxed" style={{ fontSize: '16px', lineHeight: '1.6' }}>
                      {documentContent ? documentContent.slice(200, 400) + '...' : t('interface.imageSettings.previewDescription')}
                    </p>
                  </div>
                  
                  {/* Preview info */}
                  <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-800">
                      <strong>{t('interface.imageSettings.livePreview')}:</strong> {t('interface.imageSettings.livePreviewDescription')}
                    </div>
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
              <span className="font-medium">{t('interface.imageSettings.size')}:</span> {typeof localImageBlock.width === 'number' ? localImageBlock.width : parseInt(localImageBlock.width || '300')}px × {localImageBlock.height || 'auto'}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{t('interface.imageSettings.alignment')}:</span> {localImageBlock.alignment || 'center'}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {t('interface.imageSettings.resetToDefault')}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {t('interface.modal.applyChanges')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordStyleImageEditor;
