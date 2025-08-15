"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ImageBlock } from '@/types/textPresentation';
import { Settings, ChevronDown, Edit3, ZoomIn, Move, Palette, AlignLeft, AlignCenter, AlignRight, Layout, Image as ImageIcon, Type } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ImageBasicActionsProps {
  imageBlock: ImageBlock;
  onImageChange: (updatedBlock: ImageBlock) => void;
  onOpenAdvancedSettings: () => void;
}

const ImageBasicActions: React.FC<ImageBasicActionsProps> = ({
  imageBlock,
  onImageChange,
  onOpenAdvancedSettings
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { t } = useLanguage();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const updateImageProperty = (property: keyof ImageBlock, value: any) => {
    const updatedBlock = { ...imageBlock, [property]: value };
    onImageChange(updatedBlock);
  };

  const quickSizePresets = [
    { name: t('interface.imageSettings.small'), width: 200, height: 'auto' },
    { name: t('interface.imageSettings.medium'), width: 400, height: 'auto' },
    { name: t('interface.imageSettings.large'), width: 600, height: 'auto' },
    { name: t('interface.imageSettings.extraLarge'), width: 800, height: 'auto' }
  ];

  const alignmentOptions = [
    { value: 'left', icon: AlignLeft, label: t('interface.imageSettings.left') },
    { value: 'center', icon: AlignCenter, label: t('interface.imageSettings.center') },
    { value: 'right', icon: AlignRight, label: t('interface.imageSettings.right') }
  ];

  // Layout режими для обтікання фото
  const layoutOptions = [
    {
      value: 'standalone',
      icon: ImageIcon,
      label: t('interface.imageSettings.standalone', 'Standalone'),
      description: t('interface.imageSettings.imageOnOwnLine', 'Image on its own line'),
      preview: '🖼️'
    },
    {
      value: 'inline-left',
      icon: Layout,
      label: t('interface.imageSettings.inlineLeft', 'Inline Left'),
      description: t('interface.imageSettings.textWillWrap', 'Text will wrap around the image'),
      preview: '🖼️ 📄'
    },
    {
      value: 'inline-right',
      icon: Layout,
      label: t('interface.imageSettings.inlineRight', 'Inline Right'),
      description: t('interface.imageSettings.textWillWrap', 'Text will wrap around the image'),
      preview: '📄 🖼️'
    },
    {
      value: 'side-by-side-left',
      icon: Layout,
      label: t('interface.imageSettings.sideBySideLeft', 'Side-by-side Left'),
      description: t('interface.imageSettings.sideBySideDescription', 'Image and text side by side'),
      preview: '🖼️ | 📄'
    },
    {
      value: 'side-by-side-right',
      icon: Layout,
      label: t('interface.imageSettings.sideBySideRight', 'Side-by-side Right'),
      description: t('interface.imageSettings.sideBySideDescription', 'Image and text side by side'),
      preview: '📄 | 🖼️'
    }
  ];

  // Пропорції для side-by-side режимів
  const proportionOptions = [
    { value: '50-50', label: '50% - 50%', description: t('interface.imageSettings.equal', 'Equal') },
    { value: '60-40', label: '60% - 40%', description: t('interface.imageSettings.imageLarger', 'Image larger') },
    { value: '40-60', label: '40% - 60%', description: t('interface.imageSettings.contentLarger', 'Content larger') },
    { value: '70-30', label: '70% - 30%', description: t('interface.imageSettings.imageDominant', 'Image dominant') },
    { value: '30-70', label: '30% - 70%', description: t('interface.imageSettings.contentDominant', 'Content dominant') }
  ];

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="flex items-center gap-1 px-2 py-1 bg-white/90 hover:bg-white text-gray-700 text-xs rounded-md transition-colors shadow-sm border border-gray-200"
      >
        <Settings className="w-3 h-3" />
        <ChevronDown className={`w-3 h-3 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Basic Actions Dropdown */}
      {showMenu && (
        <div 
          ref={dropdownRef}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={(e: React.MouseEvent) => e.stopPropagation()}
          onMouseLeave={(e: React.MouseEvent) => e.stopPropagation()}
          className="absolute left-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          style={{
            transform: 'translateY(0)',
            maxHeight: 'calc(100vh - 100px)'
          }}
        >
          <div className="py-1">
            {/* Header with Advanced Settings button */}
            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t('interface.imageSettings.quickSizeControls')}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAdvancedSettings();
                  setShowMenu(false);
                }}
                className="p-1 hover:bg-blue-50 rounded transition-colors"
                title={t('interface.imageSettings.openAdvancedSettings', 'Open Advanced Settings')}
              >
                <Edit3 className="w-4 h-4 text-blue-600" />
              </button>
            </div>

            {/* Layout Options - НОВИЙ РОЗДІЛ */}
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Layout className="w-3 h-3" />
                {t('interface.imageSettings.layoutOptions', 'Layout Options')}
              </div>
              <div className="space-y-1">
                {layoutOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(`Applying layout: ${option.value}`);
                      updateImageProperty('layoutMode', option.value);
                      // Don't close menu automatically
                    }}
                    className={`w-full px-2 py-2 text-left text-xs rounded transition-colors flex items-center gap-2 ${
                      imageBlock.layoutMode === option.value 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'hover:bg-blue-50'
                    }`}
                    title={option.description}
                  >
                    <span className="text-sm">{option.preview}</span>
                    <div className="flex-1">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-gray-500 text-xs">{option.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Proportion Options - тільки для side-by-side режимів */}
            {(imageBlock.layoutMode === 'side-by-side-left' || imageBlock.layoutMode === 'side-by-side-right') && (
              <div className="px-3 py-2 border-b border-gray-100">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  {t('interface.imageSettings.spaceDistribution', 'Space Distribution')}
                </div>
                <div className="space-y-1">
                  {proportionOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`Applying proportion: ${option.value}`);
                        updateImageProperty('layoutProportion', option.value);
                        // Don't close menu automatically
                      }}
                      className={`w-full px-2 py-1 text-left text-xs rounded transition-colors ${
                        imageBlock.layoutProportion === option.value 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'hover:bg-green-50'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-gray-500">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Size Actions */}
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <ZoomIn className="w-3 h-3" />
                {t('interface.imageSettings.quickSizeControls', 'Size')}
              </div>
              <div className="grid grid-cols-2 gap-1">
                {quickSizePresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(`Applying size preset: ${preset.name}, width: ${preset.width}`);
                      const updatedBlock = {
                        ...imageBlock,
                        width: preset.width,
                        height: preset.height
                      };
                      onImageChange(updatedBlock);
                      // Don't close menu automatically - let user make multiple changes
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
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Move className="w-3 h-3" />
                {t('interface.imageSettings.alignment')}
              </div>
              <div className="flex gap-1">
                {alignmentOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateImageProperty('alignment', option.value);
                      // Don't close menu automatically
                    }}
                    className={`flex-1 px-2 py-1 text-xs rounded text-center transition-colors flex items-center justify-center gap-1 ${
                      imageBlock.alignment === option.value 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-blue-50'
                    }`}
                    title={option.label}
                  >
                    <option.icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Border Radius Actions */}
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Palette className="w-3 h-3" />
                {t('interface.imageSettings.cornerRounding')}
              </div>
              <div className="space-y-1">
                {[
                  { value: '0px', label: t('interface.imageSettings.sharp') },
                  { value: '4px', label: t('interface.imageSettings.slightlyRounded') },
                  { value: '8px', label: t('interface.imageSettings.rounded') },
                  { value: '16px', label: t('interface.imageSettings.veryRounded') }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateImageProperty('borderRadius', option.value);
                      // Don't close menu automatically
                    }}
                    className={`w-full px-2 py-1 text-left text-xs rounded transition-colors ${
                      imageBlock.borderRadius === option.value 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-blue-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Preview - показує поточний стан */}
            {imageBlock.layoutMode && imageBlock.layoutMode !== 'standalone' && (
              <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200">
                <div className="text-center">
                  <div className="text-blue-600 text-xs font-medium mb-1">
                    {t('interface.imageSettings.layoutPreview', 'Layout Preview')}
                  </div>
                  <div className="flex items-center justify-center space-x-1 text-xs">
                    {imageBlock.layoutMode === 'side-by-side-left' && (
                      <>
                        <div className="bg-blue-200 px-1 py-0.5 rounded text-xs">🖼️</div>
                        <div className="text-blue-400">|</div>
                        <div className="bg-green-200 px-1 py-0.5 rounded text-xs">📄</div>
                      </>
                    )}
                    {imageBlock.layoutMode === 'side-by-side-right' && (
                      <>
                        <div className="bg-green-200 px-1 py-0.5 rounded text-xs">📄</div>
                        <div className="text-blue-400">|</div>
                        <div className="bg-blue-200 px-1 py-0.5 rounded text-xs">🖼️</div>
                      </>
                    )}
                    {(imageBlock.layoutMode === 'inline-left' || imageBlock.layoutMode === 'inline-right') && (
                      <div className="text-blue-600 text-xs">
                        {imageBlock.layoutMode === 'inline-left' ? '🖼️ 📄' : '📄 🖼️'}
                      </div>
                    )}
                  </div>
                  {imageBlock.layoutProportion && (
                    <div className="text-xs text-blue-500 mt-1">
                      {t('interface.imageSettings.space', 'Space')}: {imageBlock.layoutProportion}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageBasicActions;
